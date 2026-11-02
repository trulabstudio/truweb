"use client";

import { useState, type ReactNode } from "react";
import { suggestTimes, type Focus, type HourStat } from "@/lib/threads/metrics";
import { funnelCycle, funnelPresets, type ThreadsSettings } from "@/lib/threads/schedule";
import { adminText } from "@/lib/admin/text";

const text = adminText.threads.form;
const alertText = adminText.threads.alertEmails;
const stageNames = adminText.threads.stages;
const stageStyle: Record<string, string> = {
  attract: "bg-trulab-bg text-trulab-ink",
  trust: "bg-trulab-accent/30 text-trulab-ink",
  offer: "bg-trulab-button-primary text-trulab-button-primary-text",
};
const sameCycle = (a: ThreadsSettings["mix"], b: ThreadsSettings["mix"]) => funnelCycle(a).join() === funnelCycle(b).join();
const rounded = (value: number) => String(Math.round(value * 10) / 10);

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-trulab-border/10 bg-trulab-surface">
      <h2 className="border-b border-trulab-border/10 px-5 py-4 font-semibold sm:px-6">{title}</h2>
      <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Suggestions({ label, items, onPick }: { label: string; items: { value: string; note?: string }[]; onPick: (value: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-trulab-muted">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <button key={item.value} type="button" onClick={() => onPick(item.value)} className="focus-ring rounded-full border border-trulab-border/10 px-3 py-1.5 text-left text-xs font-medium transition hover:bg-trulab-bg">
            {item.value}
            {item.note && <span className="ml-1.5 font-normal text-trulab-muted">{item.note}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

const Help = ({ children }: { children: string }) => <span className="mt-1.5 block text-xs font-normal leading-5 text-trulab-muted">{children}</span>;

export default function ThreadsSettingsForm({ initial, hours, topics, focus }: { initial: ThreadsSettings; hours: HourStat[]; topics: { topic: string; views: number }[]; focus: Focus }) {
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [alertStatus, setAlertStatus] = useState("");
  const update = (patch: Partial<ThreadsSettings>) => {
    setSettings({ ...settings, ...patch });
    setMessage("");
  };

  function setCount(value: string) {
    const count = Math.min(10, Math.max(1, Number(value) || 1));
    // Spread evenly from 09:00 to 21:00, and keep the suggested hours when there are enough of them.
    const spread = Array.from({ length: count }, (_, index) => `${String(count === 1 ? 11 : 9 + Math.round((index * 12) / (count - 1))).padStart(2, "0")}:00`);
    const suggested = suggestTimes(hours, count);
    const times = suggested.length ? suggested : spread;
    update({ postsPerDay: count, postTimes: times });
  }

  async function save() {
    setBusy(true);
    setErrors([]);
    setMessage("");
    try {
      const response = await fetch("/api/admin/threads/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = (await response.json()) as { settings?: ThreadsSettings; error?: string; errors?: string[] };
      if (response.ok && body.settings) {
        setSettings(body.settings);
        setMessage(text.saved);
      } else {
        setMessage(body.error ?? adminText.threads.actionFailed);
        setErrors(body.errors ?? []);
      }
    } catch {
      setMessage(adminText.threads.actionFailed);
    }
    setBusy(false);
  }

  async function testAlert() {
    setAlertStatus(alertText.testing);
    try {
      const response = await fetch("/api/admin/threads/alerts", { method: "POST" });
      const body = (await response.json()) as { error?: string };
      setAlertStatus(response.ok ? alertText.sent : body.error ?? alertText.testFailed);
    } catch {
      setAlertStatus(alertText.testFailed);
    }
  }

  const auto = settings.strategy === "auto";
  const cycle = funnelCycle(auto ? focus.mix : settings.mix);
  const cycleOffers = cycle.filter((stage) => stage === "offer").length;
  const suggested = suggestTimes(hours, settings.postsPerDay);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card title={text.funnel}>
        <p className="text-sm leading-6 text-trulab-muted">{text.funnelIntro}</p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {text.stages.map((stage) => (
            <article key={stage.id} className="rounded-2xl border border-trulab-border/10 p-4">
              <p className="flex items-center gap-2 font-semibold">
                <span className={`rounded-full px-2.5 py-1 text-xs ${stageStyle[stage.id]}`}>{stage.name}</span>
                {stage.title}
              </p>
              <dl className="mt-3 grid gap-2.5 text-sm leading-5">
                {([[text.goal, stage.goal], [text.posts, stage.posts], [text.asks, stage.asks], [text.measure, stage.measure]] as const).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold text-trulab-muted">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold">{text.pathTitle}</p>
          <ol className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
            {text.path.map((step, index) => (
              <li key={step} className="flex gap-2 rounded-xl bg-trulab-bg px-3 py-2 leading-5">
                <span className="font-semibold">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <Card title={text.strategy}>
        <Help>{text.strategyHelp}</Help>
        <label className={`cursor-pointer rounded-2xl border p-4 transition ${auto ? "border-trulab-ink bg-trulab-bg" : "border-trulab-border/10 hover:shadow-lift"}`}>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <input type="radio" name="strategy" className="h-4 w-4" checked={auto} onChange={() => update({ strategy: "auto" })} />
            {text.autoName}
          </span>
          <span className="mt-2 block text-sm leading-5 text-trulab-muted">{text.autoDetail}</span>
          <span className="mt-3 block text-sm leading-5"><strong className="font-semibold">{text.focusNow}:</strong> {text.focusReasons[focus.focus](focus.target, focus.actual)}</span>
        </label>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {funnelPresets.map((preset) => {
            const active = !auto && sameCycle(settings.mix, preset.mix);
            return (
              <label key={preset.id} className={`cursor-pointer rounded-2xl border p-4 transition ${active ? "border-trulab-ink bg-trulab-bg" : "border-trulab-border/10 hover:shadow-lift"}`}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <input type="radio" name="strategy" className="h-4 w-4" checked={active} onChange={() => update({ strategy: "manual", mix: preset.mix })} />
                  {text.presets[preset.id].name}
                </span>
                <span className="mt-2 block text-sm leading-5 text-trulab-muted">{text.presets[preset.id].detail}</span>
              </label>
            );
          })}
        </div>
        <div>
          <p className="text-sm font-semibold">{text.order}</p>
          <ol className="mt-2 flex flex-wrap gap-1.5">
            {cycle.map((stage, index) => <li key={index} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageStyle[stage]}`}>{stageNames[stage]}</li>)}
          </ol>
          <Help>{text.orderSummary(cycle.length, rounded(cycle.length / settings.postsPerDay), rounded((settings.postsPerDay * 7 * cycleOffers) / cycle.length))}</Help>
        </div>
      </Card>

      <Card title={text.volume}>
        <label className="block text-sm font-semibold">
          {text.postsPerDay}
          <input type="number" min={1} max={10} className="tool-input mt-2 block" value={settings.postsPerDay} onChange={(event) => setCount(event.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {settings.postTimes.map((time, index) => (
            <label key={index} className="block text-sm font-semibold">
              {text.postTime(index + 1)}
              <input type="time" className="tool-input mt-2 block" value={time} onChange={(event) => update({ postTimes: settings.postTimes.map((old, i) => (i === index ? event.target.value : old)) })} />
            </label>
          ))}
        </div>
        <Help>{text.timezone}</Help>
        {suggested.length > 0 && suggested.join() !== [...settings.postTimes].sort().join() && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-trulab-bg px-4 py-3 text-sm">
            <span>{text.suggestedTimes(suggested.join(", "))}</span>
            <button type="button" onClick={() => update({ postTimes: suggested })} className="focus-ring rounded-full border border-trulab-border/10 bg-trulab-surface px-3 py-1.5 text-xs font-semibold transition hover:shadow-lift">{text.useTimes}</button>
          </div>
        )}
      </Card>

      <Card title={text.content}>
        <label className="block text-sm font-semibold">
          {text.theme}
          <input className="tool-input mt-2 block" value={settings.theme} onChange={(event) => update({ theme: event.target.value })} />
          <Help>{text.themeHelp}</Help>
        </label>
        <Suggestions
          label={topics.length ? text.topPostSuggestions : text.suggestions}
          items={topics.length ? topics.map((item) => ({ value: item.topic, note: text.topicViews(item.views) })) : text.themeSuggestions.map((value) => ({ value }))}
          onPick={(theme) => update({ theme })}
        />
        <label className="block text-sm font-semibold">
          {text.offerText}
          <input className="tool-input mt-2 block" value={settings.offer} onChange={(event) => update({ offer: event.target.value })} />
          <Help>{text.offerHelp}</Help>
        </label>
        <Suggestions label={text.suggestions} items={text.offerSuggestions.map((value) => ({ value }))} onPick={(offer) => update({ offer })} />
      </Card>

      <Card title={text.replies}>
        <label className="block text-sm font-semibold">
          {text.keyword}
          <input className="tool-input mt-2 block" value={settings.keyword} onChange={(event) => update({ keyword: event.target.value })} />
          <Help>{text.keywordHelp}</Help>
        </label>
        <label className="block text-sm font-semibold">
          {text.replyText}
          <textarea rows={3} className="tool-input mt-2 block leading-6" value={settings.replyText} onChange={(event) => update({ replyText: event.target.value })} />
          <Help>{text.replyHelp}</Help>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" className="h-5 w-5" checked={settings.autoReply} onChange={(event) => update({ autoReply: event.target.checked })} />
          {text.autoReply}
        </label>
      </Card>

      <Card title={text.control}>
        <label className="block text-sm font-semibold">
          {text.mode}
          <select className="tool-input mt-2 block" value={settings.mode} onChange={(event) => update({ mode: event.target.value === "auto" ? "auto" : "approve" })}>
            <option value="approve">{text.modeApprove}</option>
            <option value="auto">{text.modeAuto}</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" className="h-5 w-5" checked={settings.paused} onChange={(event) => update({ paused: event.target.checked })} />
          {text.paused}
        </label>
      </Card>

      <Card title={alertText.title}>
        <Help>{alertText.help}</Help>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={testAlert} className="focus-ring rounded-full border border-trulab-border/10 px-4 py-2 text-sm font-semibold transition hover:shadow-lift">{alertText.test}</button>
          <span role="status" className="text-sm font-medium text-trulab-muted">{alertStatus}</span>
        </div>
      </Card>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc rounded-2xl border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-sm text-red-800">
          {errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={save} className="focus-ring rounded-full bg-trulab-button-primary px-6 py-2.5 text-sm font-semibold text-trulab-button-primary-text transition hover:bg-trulab-button-primary-hover disabled:opacity-50">
          {busy ? text.saving : text.save}
        </button>
        <span role="status" className="text-sm font-medium text-trulab-muted">{message}</span>
      </div>
    </div>
  );
}
