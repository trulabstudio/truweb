"use client";

import { ChangeEvent, DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Download, ImageIcon, Loader2, Upload, Wand2, X } from "lucide-react";
import { brandTheme } from "@/lib/brand-theme";
import { toolInterfaceContent } from "@/lib/content/pages";

const copy = toolInterfaceContent.backgroundRemover;

type SizeOption = "original" | "small" | "medium" | "large" | "custom";
type FormatOption = "png" | "webp" | "jpeg";
type BgOption = "transparent" | "solid";
type ShadowOption = "none" | "soft" | "studio" | "floating";
type Preset =
  | { name: string; size: "original" }
  | { name: string; size: "custom"; width: number; height: number };

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const presets = copy.presets satisfies ReadonlyArray<Preset>;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default function BackgroundRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [removedBlob, setRemovedBlob] = useState<Blob | null>(null);
  const [removedUrl, setRemovedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [size, setSize] = useState<SizeOption>("original");
  const [customWidth, setCustomWidth] = useState(1024);
  const [customHeight, setCustomHeight] = useState(1024);
  const [keepAspect, setKeepAspect] = useState(true);
  const [format, setFormat] = useState<FormatOption>("png");
  const [quality, setQuality] = useState(0.92);
  const [shadow, setShadow] = useState<ShadowOption>("none");
  const [bgOption, setBgOption] = useState<BgOption>("transparent");
  const [bgColor, setBgColor] = useState<string>(brandTheme.surface);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (removedUrl) URL.revokeObjectURL(removedUrl);
    };
  }, [originalUrl, removedUrl]);

  function selectFile(selectedFile: File) {
    setError("");

    if (!selectedFile.type.startsWith("image/")) {
      setError(copy.errors.invalidImage);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(copy.errors.imageTooLarge);
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setRemovedBlob(null);
    setRemovedUrl("");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const selectedFile = event.dataTransfer.files?.[0];

    if (selectedFile) {
      selectFile(selectedFile);
    }
  }

  async function removeBackground() {
    if (!file) {
      setError(copy.errors.uploadFirst);
      return;
    }

    setLoading(true);
    setError("");
    setProgress(copy.progress.loadingAiModel);
    setRemovedBlob(null);
    setRemovedUrl("");

    try {
      const { removeBackground: removeImageBackground } = await import("@imgly/background-removal");
      const result = await removeImageBackground(file, {
        progress: (key, current, total) => {
          if (key.includes("fetch") && total) {
            setProgress(`${copy.progress.loadingModel} ${Math.round((current / total) * 100)}%`);
            return;
          }

          setProgress(copy.progress.removingBackground);
        },
      });

      setRemovedBlob(result);
      setRemovedUrl(URL.createObjectURL(result));
    } catch {
      setError(copy.errors.removeFailed);
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  function resetAll() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    setFile(null);
    setOriginalUrl("");
    setRemovedBlob(null);
    setRemovedUrl("");
    setError("");
    setProgress("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function applyPreset(preset: Preset) {
    if (preset.size === "original") {
      setSize("original");
      return;
    }

    setSize("custom");
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setKeepAspect(false);
  }

  function getTargetDimensions(imgWidth: number, imgHeight: number) {
    let width = imgWidth;
    let height = imgHeight;

    if (size === "small") width = 512;
    if (size === "medium") width = 1024;
    if (size === "large") width = 2048;

    if (["small", "medium", "large"].includes(size)) {
      height = Math.round((imgHeight / imgWidth) * width);
    }

    if (size === "custom") {
      width = customWidth;
      height = keepAspect ? Math.round((imgHeight / imgWidth) * width) : customHeight;
    }

    return { width, height };
  }

  function getPreviewFilter() {
    const base = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;

    if (shadow === "soft") return `${base} drop-shadow(0 18px 24px rgba(0,0,0,.18))`;
    if (shadow === "studio") return `${base} drop-shadow(0 28px 35px rgba(0,0,0,.24))`;
    if (shadow === "floating") return `${base} drop-shadow(0 40px 45px rgba(0,0,0,.22))`;

    return base;
  }

  function applyCanvasShadow(context: CanvasRenderingContext2D, scale: number) {
    if (shadow === "soft") {
      context.shadowColor = "rgba(0,0,0,.18)";
      context.shadowBlur = 24 * scale;
      context.shadowOffsetY = 18 * scale;
    }

    if (shadow === "studio") {
      context.shadowColor = "rgba(0,0,0,.24)";
      context.shadowBlur = 35 * scale;
      context.shadowOffsetY = 28 * scale;
    }

    if (shadow === "floating") {
      context.shadowColor = "rgba(0,0,0,.22)";
      context.shadowBlur = 45 * scale;
      context.shadowOffsetY = 40 * scale;
    }
  }

  async function downloadImage() {
    if (!removedBlob) return;

    try {
      const tempUrl = URL.createObjectURL(removedBlob);
      const image = await loadImage(tempUrl);
      const target = getTargetDimensions(image.width, image.height);
      URL.revokeObjectURL(tempUrl);

      const shadowPadding = shadow === "none" ? 0 : Math.round(Math.max(target.width, target.height) * 0.08);
      const canvas = document.createElement("canvas");
      canvas.width = target.width + shadowPadding * 2;
      canvas.height = target.height + shadowPadding * 2;

      const context = canvas.getContext("2d");

      if (!context) {
        setError(copy.errors.prepareFailed);
        return;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      if (bgOption === "solid" || format === "jpeg") {
        context.fillStyle = bgOption === "solid" ? bgColor : brandTheme.surface;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      const scale = target.width / image.width;
      context.filter = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
      applyCanvasShadow(context, scale);
      context.drawImage(image, shadowPadding, shadowPadding, target.width, target.height);

      const mime = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));

      if (!blob) {
        setError(copy.errors.exportFailed);
        return;
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const originalName = file?.name.replace(/\.[^/.]+$/, "") || "image";

      link.href = downloadUrl;
      link.download = `${originalName}-no-bg.${format}`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setError(copy.errors.downloadFailed);
    }
  }

  const checkerboardBg =
    "bg-[linear-gradient(45deg,var(--trulab-checkerboard)_25%,transparent_25%),linear-gradient(-45deg,var(--trulab-checkerboard)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--trulab-checkerboard)_75%),linear-gradient(-45deg,transparent_75%,var(--trulab-checkerboard)_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0px]";

  return (
    <section className="overflow-hidden rounded-[28px] border border-trulab-border/8 bg-trulab-surface p-5 shadow-soft sm:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-trulab-accent/20 text-trulab-ink">
          <Wand2 size={24} aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-trulab-ink">{copy.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-trulab-muted">
            {copy.description}
          </p>
        </div>
      </div>

      {error ? <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)_minmax(16rem,20rem)]">
        <div className="min-w-0 space-y-5">
          <div
            onDrop={handleDrop}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`rounded-[24px] border border-dashed p-5 transition ${
              isDragging ? "border-trulab-ink bg-trulab-accent/10" : "border-trulab-border/12 bg-trulab-bg"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

            <div className="flex items-start gap-3">
              <Upload className="mt-1 h-5 w-5 shrink-0 text-trulab-ink" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-trulab-ink">{copy.uploadLabel}</p>
                <p className="mt-1 text-xs leading-6 text-trulab-muted">{copy.uploadHelper}</p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="focus-ring mt-4 inline-flex rounded-full bg-trulab-button-primary px-5 py-2.5 text-sm font-semibold text-trulab-button-primary-text transition hover:bg-trulab-button-primary-hover"
                >
                  {copy.chooseFileLabel}
                </button>
              </div>
            </div>
          </div>

          {file ? (
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-trulab-border/8 bg-trulab-bg px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-trulab-ink">{file.name}</p>
                <p className="text-xs text-trulab-muted">{Math.max(1, Math.round(file.size / 1024))} {copy.fileSizeUnit}</p>
              </div>
              <button type="button" onClick={resetAll} className="rounded-full p-2 text-trulab-muted transition hover:bg-trulab-surface hover:text-trulab-ink">
                <X size={17} aria-hidden />
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={removeBackground}
              disabled={loading || !originalUrl}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-trulab-button-primary px-6 py-3 text-sm font-semibold text-trulab-button-primary-text transition hover:bg-trulab-button-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Wand2 size={17} aria-hidden />}
              {loading ? progress || copy.processingLabel : removedUrl ? copy.regenerateLabel : copy.removeLabel}
            </button>

            <button
              type="button"
              onClick={downloadImage}
              disabled={!removedBlob}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-trulab-border/10 bg-trulab-button-secondary px-6 py-3 text-sm font-semibold text-trulab-button-secondary-text shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} aria-hidden />
              {copy.downloadLabel}
            </button>
          </div>

          {loading ? (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-trulab-border/8">
                <div className="h-full w-full animate-pulse rounded-full bg-trulab-accent" />
              </div>
              <p className="mt-2 text-xs text-trulab-muted">{progress || copy.processingImageLabel}</p>
            </div>
          ) : null}
        </div>

        <PreviewPanel title={copy.originalLabel} src={originalUrl} />

        <div className="min-w-0 rounded-[24px] border border-trulab-border/8 bg-trulab-bg p-3">
          <p className="mb-3 text-sm font-semibold text-trulab-ink">{copy.resultLabel}</p>
          <div
            className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-trulab-border/8 bg-trulab-surface ${
              removedUrl && bgOption === "transparent" ? checkerboardBg : ""
            }`}
            style={removedUrl && bgOption === "solid" ? { backgroundColor: bgColor } : undefined}
          >
            {removedUrl ? (
              <img src={removedUrl} alt={copy.removedImageAlt} className="max-h-full max-w-full object-contain" style={{ filter: getPreviewFilter() }} />
            ) : (
              <ImageIcon className="h-10 w-10 text-trulab-ink/22" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-trulab-border/8 bg-trulab-bg p-5">
        <p className="text-sm font-semibold text-trulab-ink">{copy.exportSettingsLabel}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button key={preset.name} type="button" onClick={() => applyPreset(preset)} className="rounded-full border border-trulab-border/10 bg-trulab-surface px-4 py-2 text-xs font-semibold text-trulab-muted transition hover:text-trulab-ink">
              {preset.name}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-5">
          <Field label={copy.fields.size}>
            <select value={size} onChange={(event) => setSize(event.target.value as SizeOption)} className="tool-input">
              <option value="original">{copy.options.original}</option>
              <option value="small">{copy.options.small}</option>
              <option value="medium">{copy.options.medium}</option>
              <option value="large">{copy.options.large}</option>
              <option value="custom">{copy.options.custom}</option>
            </select>
          </Field>

          <Field label={copy.fields.format}>
            <select
              value={format}
              onChange={(event) => {
                const selected = event.target.value as FormatOption;
                setFormat(selected);
                if (selected === "jpeg") setBgOption("solid");
              }}
              className="tool-input"
            >
              <option value="png">{copy.options.png}</option>
              <option value="webp">{copy.options.webp}</option>
              <option value="jpeg">{copy.options.jpeg}</option>
            </select>
          </Field>

          <Field label={copy.fields.background}>
            <select value={bgOption} onChange={(event) => setBgOption(event.target.value as BgOption)} className="tool-input">
              <option value="transparent" disabled={format === "jpeg"}>
                {copy.options.transparent}
              </option>
              <option value="solid">{copy.options.solidColor}</option>
            </select>
          </Field>

          <Field label={copy.fields.shadow}>
            <select value={shadow} onChange={(event) => setShadow(event.target.value as ShadowOption)} className="tool-input">
              <option value="none">{copy.options.none}</option>
              <option value="soft">{copy.options.soft}</option>
              <option value="studio">{copy.options.studio}</option>
              <option value="floating">{copy.options.floating}</option>
            </select>
          </Field>

          <Field label={`${copy.fields.quality} ${Math.round(quality * 100)}%`}>
            <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-4 w-full accent-trulab-ink" />
          </Field>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <Field label={copy.fields.width}>
            <input type="number" value={customWidth} disabled={size !== "custom"} onChange={(event) => setCustomWidth(Number(event.target.value))} className="tool-input disabled:cursor-not-allowed disabled:opacity-55" />
          </Field>

          <Field label={copy.fields.height}>
            <input type="number" value={customHeight} disabled={size !== "custom" || keepAspect} onChange={(event) => setCustomHeight(Number(event.target.value))} className="tool-input disabled:cursor-not-allowed disabled:opacity-55" />
          </Field>

          <label className="flex items-end gap-3 pb-3 text-sm font-semibold text-trulab-ink">
            <input type="checkbox" checked={keepAspect} disabled={size !== "custom"} onChange={(event) => setKeepAspect(event.target.checked)} className="h-4 w-4 accent-trulab-ink disabled:cursor-not-allowed disabled:opacity-40" />
            {copy.fields.keepAspectRatio}
          </label>

          <Field label={copy.fields.backgroundColor}>
            <div className="flex overflow-hidden rounded-2xl border border-trulab-border/10 bg-trulab-surface">
              <input type="color" value={bgColor} onChange={(event) => setBgColor(event.target.value)} className="h-12 w-14 cursor-pointer border-0 bg-transparent p-1" />
              <input value={bgColor} onChange={(event) => setBgColor(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
            </div>
          </Field>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Field label={`${copy.fields.contrast} ${contrast}%`}>
            <input type="range" min="50" max="200" step="5" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} className="mt-4 w-full accent-trulab-ink" />
          </Field>
          <Field label={`${copy.fields.brightness} ${brightness}%`}>
            <input type="range" min="50" max="200" step="5" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} className="mt-4 w-full accent-trulab-ink" />
          </Field>
          <Field label={`${copy.fields.saturation} ${saturation}%`}>
            <input type="range" min="0" max="200" step="5" value={saturation} onChange={(event) => setSaturation(Number(event.target.value))} className="mt-4 w-full accent-trulab-ink" />
          </Field>
        </div>
      </div>
    </section>
  );
}

function PreviewPanel({ title, src }: { title: string; src: string }) {
  return (
    <div className="min-w-0 rounded-[24px] border border-trulab-border/8 bg-trulab-bg p-3">
      <p className="mb-3 text-sm font-semibold text-trulab-ink">{title}</p>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-trulab-border/8 bg-trulab-surface">
        {src ? <img src={src} alt={title} className="max-h-full max-w-full object-contain" /> : <ImageIcon className="h-10 w-10 text-trulab-ink/22" />}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-2 text-xs font-semibold text-trulab-muted">
      {label}
      {children}
    </label>
  );
}
