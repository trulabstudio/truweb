"use client";

import { useState } from "react";
import { Download, Link2, Loader2, QrCode, Sparkles } from "lucide-react";
import type { QRCodeToDataURLOptions, QRCodeToStringOptions } from "qrcode";
import { brandTheme } from "@/lib/brand-theme";
import { toolInterfaceContent } from "@/lib/content/pages";
import { siteConfig } from "@/lib/site-config";

const copy = toolInterfaceContent.qrGenerator;

type Format = "png" | "jpg" | "svg";

async function loadQRCode() {
  return import("qrcode");
}

function normaliseUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export default function QrGeneratorTool() {
  const [url, setUrl] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [format, setFormat] = useState<Format>("png");
  const [size, setSize] = useState(2048);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transparent, setTransparent] = useState(false);

  const cleanUrl = normaliseUrl(url);
  const displayUrl = cleanUrl.replace(/^https?:\/\//, "");
  const qrColor = {
    dark: brandTheme.ink,
    light: transparent && format !== "jpg" ? "#0000" : brandTheme.surface,
  };

  async function generatePreview() {
    setError("");

    if (!cleanUrl) {
      setError(copy.emptyError);
      return;
    }

    setLoading(true);

    try {
      const QRCode = await loadQRCode();
      const qr = await QRCode.toDataURL(cleanUrl, {
        width: 900,
        margin: 2,
        errorCorrectionLevel: "H",
        color: qrColor,
      } satisfies QRCodeToDataURLOptions);

      setQrPreview(qr);
    } catch {
      setError(copy.generateError);
    } finally {
      setLoading(false);
    }
  }

  async function downloadQR() {
    setError("");

    if (!cleanUrl) {
      setError(copy.emptyError);
      return;
    }

    try {
      const QRCode = await loadQRCode();

      if (format === "svg") {
        const svg = await QRCode.toString(cleanUrl, {
          type: "svg",
          width: size,
          margin: 2,
          errorCorrectionLevel: "H",
          color: qrColor,
        } satisfies QRCodeToStringOptions);

        const blob = new Blob([svg], { type: "image/svg+xml" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${siteConfig.slug}-qr-code.svg`;
        link.click();
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const pngDataUrl = await QRCode.toDataURL(cleanUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H",
        color: qrColor,
      } satisfies QRCodeToDataURLOptions);

      if (format === "png") {
        const link = document.createElement("a");
        link.href = pngDataUrl;
        link.download = `${siteConfig.slug}-qr-code-${size}${transparent ? "-transparent" : ""}.png`;
        link.click();
        return;
      }

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (!context) {
          setError(copy.prepareJpgError);
          return;
        }

        context.fillStyle = brandTheme.surface;
        context.fillRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);

        const jpg = canvas.toDataURL("image/jpeg", 1);
        const link = document.createElement("a");
        link.href = jpg;
        link.download = `${siteConfig.slug}-qr-code-${size}.jpg`;
        link.click();
      };
      image.src = pngDataUrl;
    } catch {
      setError(copy.downloadError);
    }
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-trulab-border/8 bg-trulab-surface p-5 shadow-soft sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-trulab-accent/20 text-trulab-ink">
            <QrCode size={24} aria-hidden />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-trulab-ink">{copy.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-trulab-muted">
              {copy.description}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-trulab-border/8 bg-trulab-bg px-3 py-2 text-xs font-semibold text-trulab-muted">
          <Sparkles size={14} aria-hidden />
          {copy.noLoginLabel}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid min-w-0 gap-5">
          <label className="grid gap-2 text-sm font-semibold text-trulab-ink">
            {copy.linkLabel}
            <input
              type="url"
              placeholder={siteConfig.url}
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void generatePreview();
                }
              }}
              className="focus-ring rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-trulab-ink">
              {copy.formatLabel}
              <select
                value={format}
                onChange={(event) => {
                  const selected = event.target.value as Format;
                  setFormat(selected);

                  if (selected === "jpg") {
                    setTransparent(false);
                  }
                }}
                className="focus-ring rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal"
              >
                <option value="png">{copy.formats.png}</option>
                <option value="jpg">{copy.formats.jpg}</option>
                <option value="svg">{copy.formats.svg}</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-trulab-ink">
              {copy.resolutionLabel}
              <select
                value={size}
                disabled={format === "svg"}
                onChange={(event) => setSize(Number(event.target.value))}
                className="focus-ring rounded-2xl border border-trulab-border/10 bg-trulab-bg px-4 py-3 font-normal disabled:cursor-not-allowed disabled:opacity-55"
              >
                {copy.resolutions.map((resolution) => (
                  <option key={resolution.value} value={resolution.value}>{resolution.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-trulab-border/8 bg-trulab-bg px-4 py-3 text-sm font-semibold text-trulab-ink">
            <input
              type="checkbox"
              checked={transparent}
              disabled={format === "jpg"}
              onChange={(event) => setTransparent(event.target.checked)}
              className="h-4 w-4 accent-trulab-ink disabled:cursor-not-allowed"
            />
            {copy.transparentBackgroundLabel}
          </label>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={generatePreview}
              disabled={loading}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-trulab-button-primary px-6 py-3 text-sm font-semibold text-trulab-button-primary-text transition hover:-translate-y-0.5 hover:bg-trulab-button-primary-hover disabled:cursor-not-allowed disabled:opacity-65"
            >
              {loading ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <QrCode size={17} aria-hidden />}
              {loading ? copy.generatingLabel : copy.generateLabel}
            </button>

            <button
              type="button"
              onClick={downloadQR}
              disabled={!qrPreview}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-trulab-border/10 bg-trulab-button-secondary px-6 py-3 text-sm font-semibold text-trulab-button-secondary-text shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} aria-hidden />
              {copy.downloadLabel} {copy.formats[format]}
            </button>
          </div>

          {displayUrl ? (
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-trulab-border/8 bg-trulab-bg px-4 py-3 text-xs text-trulab-muted">
              <Link2 size={16} className="shrink-0" aria-hidden />
              <span className="min-w-0 truncate font-mono">{displayUrl}</span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div
            aria-label={copy.previewAriaLabel}
            className="aspect-square w-full overflow-hidden rounded-[24px] border border-trulab-border/8 bg-[linear-gradient(135deg,var(--trulab-bg),var(--trulab-surface))] bg-contain bg-center bg-no-repeat shadow-inner"
            style={qrPreview ? { backgroundImage: `url(${qrPreview})` } : undefined}
          >
            {!qrPreview ? (
              <div className="grid h-full place-items-center p-8 text-center">
                <div>
                  <QrCode size={42} className="mx-auto text-trulab-ink/22" aria-hidden />
                  <p className="mt-3 text-sm font-semibold text-trulab-muted">{copy.previewEmptyLabel}</p>
                </div>
              </div>
            ) : null}
          </div>
          <p className="text-center text-xs leading-6 text-trulab-muted">
            {copy.correctionHelper}
          </p>
        </div>
      </div>
    </section>
  );
}
