import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const REPO = "trulabstudio/truweb";
const BRANCH = "main";

export class ConflictError extends Error {}

const token = () => process.env.GITHUB_CONTENT_TOKEN;
// Without a token, npm run dev saves to local files. Files cannot be written on Vercel.
export const storageReady = () => Boolean(token()) || process.env.NODE_ENV !== "production";

async function github(filePath: string, init?: RequestInit) {
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  return fetch(`https://api.github.com/repos/${REPO}/contents/${encoded}${init ? "" : `?ref=${BRANCH}`}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token()}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

/** Reads the latest version, not the deployed one, so consecutive saves do not overwrite each other. */
export async function readContent(filePath: string): Promise<{ text: string; sha: string | null }> {
  if (!token()) return { text: await readFile(path.join(process.cwd(), filePath), "utf8"), sha: null };
  const response = await github(filePath);
  if (!response.ok) throw new Error(`GitHub ${response.status} while reading ${filePath}`);
  const body = (await response.json()) as { content: string; sha: string };
  return { text: Buffer.from(body.content, "base64").toString("utf8"), sha: body.sha };
}

export async function writeFileToSite(filePath: string, content: Buffer, message: string, sha?: string | null) {
  if (!token()) {
    const target = path.join(process.cwd(), filePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    return null;
  }
  const response = await github(filePath, {
    method: "PUT",
    body: JSON.stringify({ message, content: content.toString("base64"), branch: BRANCH, ...(sha ? { sha } : {}) }),
  });
  if (response.status === 409 || response.status === 422) throw new ConflictError("Content changed elsewhere.");
  if (!response.ok) throw new Error(`GitHub ${response.status} while saving ${filePath}`);
  const body = (await response.json()) as { content: { sha: string } };
  return body.content.sha;
}

export const hasGithubStorage = () => Boolean(token());
