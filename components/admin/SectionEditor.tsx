"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown, Plus, Trash2, Upload, X } from "lucide-react";
import { sectionIcon } from "@/components/admin/AdminShell";
import { setUnsavedChanges } from "@/components/admin/unsaved";
import { emptyValue, findSection, type Field } from "@/lib/admin/schema";
import { adminText } from "@/lib/admin/text";

type FieldProps = { field: Field; value: unknown; onChange: (next: unknown) => void };

const iconButton = "focus-ring grid h-9 w-9 place-items-center rounded-full border border-trulab-border/10 bg-trulab-surface text-trulab-ink transition hover:bg-trulab-bg disabled:opacity-35";
const secondaryButton = "focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-trulab-border/10 bg-trulab-button-secondary px-4 py-2 text-sm font-semibold text-trulab-button-secondary-text transition hover:shadow-lift disabled:opacity-40 disabled:shadow-none";

function Help({ text }: { text?: string }) {
  return text ? <span className="mt-1.5 block text-xs font-normal leading-5 text-trulab-muted">{text}</span> : null;
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-trulab-border/8 bg-trulab-surface shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-trulab-border/8 px-5 py-4 sm:px-6">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

// A new image is not deployed yet, so previews use the local file rather than its final path.
const localPreviews = new Map<string, string>();
const previewSource = (path: unknown) => (typeof path === "string" ? localPreviews.get(path) ?? path : "");

function ImageField({ field, value, onChange }: FieldProps & { field: Extract<Field, { kind: "image" }> }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const { spec } = field;
  const source = previewSource(value);
  const image = useRef<HTMLImageElement>(null);

  // A cached image can finish loading before hydration, so onLoad alone would miss it.
  useEffect(() => {
    const current = image.current;
    setSize(current?.complete && current.naturalWidth ? { width: current.naturalWidth, height: current.naturalHeight } : null);
  }, [source]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus(adminText.uploading);
    const form = new FormData();
    form.set("file", file);
    form.set("folder", field.folder);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const body = (await response.json()) as { path?: string; error?: string };
      if (!response.ok || !body.path) throw new Error(body.error);
      localPreviews.set(body.path, URL.createObjectURL(file));
      onChange(body.path);
      setStatus(adminText.uploaded);
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : adminText.uploadFailed);
    }
    setBusy(false);
  }

  const wrongShape = size && Math.abs(size.width / size.height - spec.width / spec.height) > 0.03;
  const tooSmall = size && (size.width < spec.width * 0.75 || size.height < spec.height * 0.75);
  const facts: [string, string][] = [
    [adminText.recommendedSize, `${spec.width} × ${spec.height} px`],
    [adminText.format, spec.format],
    [adminText.maxFile, adminText.maxFileValue],
    ...(size ? [[adminText.currentSize, `${size.width} × ${size.height} px`] as [string, string]] : []),
  ];

  return (
    <div>
      <p className="text-sm font-semibold">{field.label}</p>
      <div className="mt-2 grid grid-cols-1 gap-4 rounded-2xl border border-trulab-border/10 bg-trulab-bg p-4 sm:grid-cols-2">
        <div
          className={`mx-auto grid w-full place-items-center overflow-hidden rounded-xl border border-trulab-border/10 ${spec.darkPreview ? "bg-trulab-dark" : "bg-trulab-surface"}`}
          style={{ aspectRatio: `${spec.width} / ${spec.height}`, maxWidth: spec.width === spec.height ? "11rem" : undefined }}
        >
          {source ? (
            <img
              ref={image}
              src={source}
              alt=""
              onLoad={(event) => setSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
              className="h-full w-full object-contain"
            />
          ) : <span className="text-sm text-trulab-muted">{adminText.noImage}</span>}
        </div>
        <div className="grid content-start gap-3">
          <dl className="grid gap-1.5 text-sm">
            {facts.map(([term, detail]) => (
              <div key={term} className="flex justify-between gap-3">
                <dt className="text-trulab-muted">{term}</dt>
                <dd className="text-right font-semibold">{detail}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs leading-5 text-trulab-muted">{spec.note}</p>
          {(wrongShape || tooSmall) && (
            <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              {wrongShape ? adminText.sizeMismatch : adminText.sizeSmall}
            </p>
          )}
          <div>
            <label className={`${secondaryButton} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
              <Upload size={15} aria-hidden />
              {source ? adminText.replaceImage : adminText.chooseImage}
              <input type="file" accept={spec.pngOnly ? "image/png" : "image/png,image/jpeg,image/webp"} onChange={upload} disabled={busy} className="sr-only" />
            </label>
            {status && <span role="status" className="mt-2 block text-xs text-trulab-muted">{status}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GalleryCard({ field, value, onChange }: FieldProps & { field: Extract<Field, { kind: "array" }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const items = (Array.isArray(value) ? value : []) as Record<string, unknown>[];
  const open = openIndex !== null ? items[openIndex] : undefined;
  const imageKey = field.item.kind === "object" ? Object.entries(field.item.fields).find(([, child]) => child.kind === "image")?.[0] : undefined;
  const label = (item: unknown) => (field.itemLabel as ((value: unknown) => string) | undefined)?.(item)?.trim() || adminText.itemFallback;

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const move = (from: number, to: number) => {
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
    setOpenIndex(to);
  };

  return (
    <Card title={`${field.label} (${items.length})`}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <button key={index} type="button" aria-label={`${adminText.editItem}: ${label(item)}`} onClick={() => setOpenIndex(index)} className="focus-ring group min-w-0 overflow-hidden rounded-2xl border border-trulab-border/10 bg-trulab-surface text-left transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="grid aspect-[375/146] place-items-center bg-trulab-bg p-2">
              {imageKey && item[imageKey] ? <img src={previewSource(item[imageKey])} alt="" loading="lazy" className="h-full w-full object-contain" /> : <span className="text-xs text-trulab-muted">{adminText.noImage}</span>}
            </span>
            <span className="block truncate border-t border-trulab-border/10 px-3 py-2 text-sm font-semibold">{label(item)}</span>
          </button>
        ))}
        <button
          type="button"
          disabled={field.max !== undefined && items.length >= field.max}
          onClick={() => {
            onChange([...items, emptyValue(field.item)]);
            setOpenIndex(items.length);
          }}
          className="focus-ring flex min-h-24 items-center justify-center gap-2 rounded-2xl border border-dashed border-trulab-border/20 text-sm font-semibold text-trulab-muted transition hover:bg-trulab-bg hover:text-trulab-ink disabled:opacity-40"
        >
          <Plus size={16} aria-hidden />
          {adminText.addLogo}
        </button>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpenIndex(null)}
        className="m-auto w-[min(720px,calc(100%-32px))] rounded-3xl bg-trulab-surface p-0 text-trulab-ink shadow-soft backdrop:bg-trulab-dark/50"
      >
        {open && openIndex !== null && (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-trulab-border/10 px-5 py-4">
              <h3 className="min-w-0 truncate font-semibold">{label(open)}</h3>
              <button type="button" aria-label={adminText.done} className={iconButton} onClick={() => setOpenIndex(null)}><X size={15} aria-hidden /></button>
            </div>
            <div className="grid grid-cols-1 gap-5 p-5">
              <FieldInput field={field.item} value={open} onChange={(next) => onChange(items.map((old, i) => (i === openIndex ? next : old)))} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-trulab-border/10 px-5 py-4">
              <div className="flex gap-1.5">
                <button type="button" title={adminText.moveEarlier} aria-label={adminText.moveEarlier} className={iconButton} disabled={openIndex === 0} onClick={() => move(openIndex, openIndex - 1)}><ArrowLeft size={15} aria-hidden /></button>
                <button type="button" title={adminText.moveLater} aria-label={adminText.moveLater} className={iconButton} disabled={openIndex === items.length - 1} onClick={() => move(openIndex, openIndex + 1)}><ArrowRight size={15} aria-hidden /></button>
                <button type="button" title={adminText.remove} aria-label={adminText.remove} className={iconButton} disabled={field.min !== undefined && items.length <= field.min} onClick={() => { onChange(items.filter((_, i) => i !== openIndex)); setOpenIndex(null); }}><Trash2 size={15} aria-hidden /></button>
              </div>
              <button type="button" onClick={() => setOpenIndex(null)} className="focus-ring rounded-full bg-trulab-button-primary px-5 py-2 text-sm font-semibold text-trulab-button-primary-text transition hover:bg-trulab-button-primary-hover">{adminText.done}</button>
            </div>
          </div>
        )}
      </dialog>
    </Card>
  );
}

function ArrayItems({ field, value, onChange, openIndex, setOpenIndex }: FieldProps & { field: Extract<Field, { kind: "array" }>; openIndex: number | null; setOpenIndex: (index: number | null) => void }) {
  const items = Array.isArray(value) ? value : [];
  const atMinimum = field.min !== undefined && items.length <= field.min;

  // A single text field is short enough to edit in place, without an accordion.
  const inline = field.item.kind === "text" && !field.item.multiline;

  const move = (from: number, to: number) => {
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
    if (openIndex === from) setOpenIndex(to);
    else if (openIndex === to) setOpenIndex(from);
  };
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(null);
  };
  const controls = (index: number) => (
    <div className="flex shrink-0 gap-1.5">
      <button type="button" title={adminText.moveUp} aria-label={adminText.moveUp} className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={15} aria-hidden /></button>
      <button type="button" title={adminText.moveDown} aria-label={adminText.moveDown} className={iconButton} disabled={index === items.length - 1} onClick={() => move(index, index + 1)}><ArrowDown size={15} aria-hidden /></button>
      <button type="button" title={adminText.remove} aria-label={adminText.remove} className={iconButton} disabled={atMinimum} onClick={() => remove(index)}><Trash2 size={15} aria-hidden /></button>
    </div>
  );

  if (items.length === 0) return <p className="text-sm text-trulab-muted">{adminText.empty}</p>;

  if (inline) {
    return (
      <div className="grid gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <input aria-label={`${field.label} ${index + 1}`} className="tool-input min-w-48 flex-1" value={String(item ?? "")} onChange={(event) => onChange(items.map((old, i) => (i === index ? event.target.value : old)))} />
            {controls(index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const label = (field.itemLabel as ((value: unknown) => string) | undefined)?.(item)?.trim();
        return (
          <article key={index} className={`rounded-2xl border border-trulab-border/8 transition ${isOpen ? "bg-trulab-surface" : "bg-trulab-bg hover:border-trulab-border/15"}`}>
            <h3>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpenIndex(isOpen ? null : index)} className="focus-ring flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold">
                <span className="min-w-0 truncate">{label || adminText.itemFallback}</span>
                <ChevronDown size={17} aria-hidden className={`shrink-0 text-trulab-muted transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </h3>
            {isOpen && (
              <div className="grid grid-cols-1 gap-5 border-t border-trulab-border/8 p-4">
                <FieldInput field={field.item} value={item} onChange={(next) => onChange(items.map((old, i) => (i === index ? next : old)))} />
                <div className="flex justify-end">{controls(index)}</div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function AddButton({ field, value, onAdd }: { field: Extract<Field, { kind: "array" }>; value: unknown; onAdd: () => void }) {
  const count = Array.isArray(value) ? value.length : 0;
  return (
    <button type="button" className={secondaryButton} disabled={field.max !== undefined && count >= field.max} onClick={onAdd}>
      <Plus size={15} aria-hidden />
      {adminText.add}
    </button>
  );
}

function ArrayCard({ field, value, onChange }: FieldProps & { field: Extract<Field, { kind: "array" }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = Array.isArray(value) ? value : [];
  const add = () => {
    onChange([...items, emptyValue(field.item)]);
    setOpenIndex(items.length);
  };
  return (
    <Card title={`${field.label} (${items.length})`} action={<AddButton field={field} value={value} onAdd={add} />}>
      <ArrayItems field={field} value={value} onChange={onChange} openIndex={openIndex} setOpenIndex={setOpenIndex} />
    </Card>
  );
}

function NestedArray({ field, value, onChange }: FieldProps & { field: Extract<Field, { kind: "array" }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = Array.isArray(value) ? value : [];
  const add = () => {
    onChange([...items, emptyValue(field.item)]);
    setOpenIndex(items.length);
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{field.label}</p>
        <AddButton field={field} value={value} onAdd={add} />
      </div>
      <ArrayItems field={field} value={value} onChange={onChange} openIndex={openIndex} setOpenIndex={setOpenIndex} />
    </div>
  );
}

function FieldInput({ field, value, onChange }: FieldProps) {
  switch (field.kind) {
    case "text":
      return (
        <label className="block text-sm font-semibold">
          {field.label}
          {field.multiline ? (
            <textarea rows={4} className="tool-input mt-2 block leading-6" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
          ) : (
            <input className="tool-input mt-2 block" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
          )}
          <Help text={field.description} />
        </label>
      );
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-trulab-border/8 bg-trulab-bg px-4 py-3 text-sm font-semibold">
          {field.label}
          <input type="checkbox" className="peer sr-only" checked={value === true} onChange={(event) => onChange(event.target.checked)} />
          <span aria-hidden className={`relative h-6 w-11 shrink-0 rounded-full transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${value === true ? "bg-trulab-accent" : "bg-trulab-border/15"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-trulab-surface shadow-sm transition-all ${value === true ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </label>
      );
    case "color": {
      const colour = String(value ?? "");
      return (
        <div className="text-sm font-semibold">
          <span>{field.label}</span>
          <div className="mt-2 flex items-center gap-2">
            <input type="color" aria-label={field.label} value={/^#[0-9a-f]{6}$/i.test(colour) ? colour : "#000000"} onChange={(event) => onChange(event.target.value)} className="focus-ring h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-trulab-border/10 bg-trulab-surface p-1" />
            <input aria-label={`${field.label} ${adminText.hexCode}`} spellCheck={false} maxLength={7} className="tool-input font-mono uppercase" value={colour} onChange={(event) => onChange(event.target.value)} />
          </div>
          <Help text={field.description} />
        </div>
      );
    }
    case "select":
      return (
        <label className="block text-sm font-semibold">
          {field.label}
          <select className="tool-input mt-2 block" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
            {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <Help text={field.description} />
        </label>
      );
    case "image":
      return <ImageField field={field} value={value} onChange={onChange} />;
    case "array":
      return <NestedArray field={field} value={value} onChange={onChange} />;
    case "object": {
      const record = (value ?? {}) as Record<string, unknown>;
      const children = Object.entries(field.fields).map(([key, child]) => (
        <FieldInput key={key} field={child} value={record[key]} onChange={(next) => onChange({ ...record, [key]: next })} />
      ));
      return field.label ? (
        <fieldset className="grid min-w-0 grid-cols-1 gap-5 rounded-2xl border border-trulab-border/8 p-4">
          <legend className="px-1.5 text-sm font-semibold">{field.label}</legend>
          {children}
        </fieldset>
      ) : <div className="grid grid-cols-1 gap-5">{children}</div>;
    }
  }
}

export default function SectionEditor({ sectionKey, initial, sha: initialSha }: { sectionKey: string; initial: unknown; sha: string | null }) {
  const section = findSection(sectionKey);
  const saved = useRef(initial);
  const [value, setValue] = useState(initial);
  const [version, setVersion] = useState(0);
  const [sha, setSha] = useState(initialSha);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const errorBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnsavedChanges(dirty);
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      setUnsavedChanges(false);
    };
  }, [dirty]);

  useEffect(() => {
    if (errors.length) errorBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors]);

  if (!section) return null;
  const Icon = sectionIcon(section.key);
  const record = (value ?? {}) as Record<string, unknown>;
  const entries = Object.entries(section.fields);
  const isGroup = ([, field]: [string, Field]) => field.kind === "array" || (field.kind === "object" && Boolean(field.label));
  const plainFields = entries.filter((entry) => !isGroup(entry));
  const groupFields = entries.filter(isGroup);
  const liveProblems = section.check?.(record) ?? [];
  const allColours = plainFields.length > 0 && plainFields.every(([, field]) => field.kind === "color");

  function change(key: string, next: unknown) {
    setValue({ ...record, [key]: next });
    setDirty(true);
    setMessage("");
  }

  function discard() {
    setValue(saved.current);
    setVersion(version + 1);
    setDirty(false);
    setErrors([]);
    setMessage("");
  }

  async function save() {
    setBusy(true);
    setMessage("");
    setErrors([]);
    try {
      const response = await fetch(`/api/admin/content/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, sha }),
      });
      const body = (await response.json()) as { sha?: string | null; error?: string; errors?: string[] };
      if (!response.ok) {
        setMessage(body.error ?? adminText.saveFailed);
        setErrors(body.errors ?? []);
      } else {
        saved.current = value;
        setSha(body.sha ?? null);
        setDirty(false);
        setMessage(body.sha ? adminText.savedLive : adminText.savedLocal);
      }
    } catch {
      setMessage(adminText.saveOffline);
    }
    setBusy(false);
  }

  const status = message || (dirty ? adminText.unsaved : adminText.upToDate);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-trulab-border/8 bg-trulab-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p role="status" className="flex min-w-0 items-center gap-2 text-sm font-medium text-trulab-muted">
            {!dirty && !message ? <Check size={15} aria-hidden className="shrink-0 text-trulab-accent-text" /> : dirty && !message ? <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-trulab-accent-strong" /> : null}
            {status}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={discard} disabled={busy || !dirty} className={secondaryButton}>{adminText.discard}</button>
            <button type="button" onClick={save} disabled={busy || !dirty} className="focus-ring rounded-full bg-trulab-button-primary px-5 py-2 text-sm font-semibold text-trulab-button-primary-text shadow-sm transition hover:bg-trulab-button-primary-hover disabled:opacity-40">
              {busy ? adminText.saving : adminText.save}
            </button>
          </div>
        </div>
      </div>

      <header className="flex items-center gap-4 pb-6 pt-8">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-trulab-accent/20"><Icon size={22} aria-hidden /></span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{section.label}</h1>
          <p className="mt-0.5 text-sm text-trulab-muted">{section.description}</p>
        </div>
      </header>

      {liveProblems.length > 0 && errors.length === 0 && (
        <div role="alert" className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <ul className="list-disc space-y-1 pl-5">{liveProblems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
        </div>
      )}

      {errors.length > 0 && (
        <div ref={errorBox} role="alert" className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <ul className="list-disc space-y-1 pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      <div key={version} className="grid grid-cols-1 gap-4">
        {plainFields.length > 0 && (
          <Card title={adminText.details}>
            <div className={`grid grid-cols-1 gap-5 ${allColours ? "sm:grid-cols-2" : ""}`}>
              {plainFields.map(([key, field]) => <FieldInput key={key} field={field} value={record[key]} onChange={(next) => change(key, next)} />)}
            </div>
          </Card>
        )}
        {groupFields.map(([key, field]) => field.kind === "array" && field.display === "gallery"
          ? <GalleryCard key={key} field={field} value={record[key]} onChange={(next) => change(key, next)} />
          : field.kind === "array"
          ? <ArrayCard key={key} field={field} value={record[key]} onChange={(next) => change(key, next)} />
          : (
            <Card key={key} title={(field as { label: string }).label}>
              <FieldInput field={{ ...(field as Extract<Field, { kind: "object" }>), label: undefined }} value={record[key]} onChange={(next) => change(key, next)} />
            </Card>
          ))}
      </div>
    </div>
  );
}
