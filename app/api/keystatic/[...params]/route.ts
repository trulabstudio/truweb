import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../keystatic.config";

const handlers = makeRouteHandler({ config });
const isDisabled =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github";
const disabled = () => new Response(null, { status: 404 });

export const GET = isDisabled ? disabled : handlers.GET;
export const POST = isDisabled ? disabled : handlers.POST;
