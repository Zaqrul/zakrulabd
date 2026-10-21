"use client";

/* The mixer: a strip for the master and for each insert, with a meter, fader, pan and mute, and the channels routed
   to it; and the selected insert's chain of effects on the right, each with its knobs, switched on or off, moved up
   or down, or taken out. */
import { useEffect, useRef } from "react";
import { TbArrowDown, TbArrowUp, TbPlus, TbPower, TbTrash } from "react-icons/tb";
import { EFFECTS, EFFECT_PARAMS, newEffect, type EffectKind, type Insert, type StudioSong } from "@/lib/studio";

const EFFECT_LABEL: Record<EffectKind, string> = { eq: "EQ", filter: "Filter", comp: "Compressor", dist: "Distortion", delay: "Delay", reverb: "Reverb" };

export function Mixer({
  song, selected, onSelect, onInsert, onAddInsert, levels,
}: {
  song: StudioSong;
  selected: number;
  onSelect: (index: number) => void;
  onInsert: (index: number, change: Partial<Insert>, record?: boolean) => void;
  onAddInsert: () => void;
  /* Each insert's level now, for the meters. */
  levels: () => Map<number, number> | null;
}) {
  const meters = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    let frame = 0;
    const shown: number[] = [];
    const draw = () => {
      const now = levels();
      meters.current.forEach((el, i) => {
        if (!el) return;
        const peak = now?.get(i) ?? 0;
        shown[i] = Math.max(peak, (shown[i] ?? 0) * 0.9);
        const db = shown[i] > 0 ? 20 * Math.log10(shown[i]) : -60;
        el.style.height = `${Math.max(0, Math.min(100, ((db + 48) / 48) * 100))}%`;
        el.style.background = db > -1 ? "#f2766b" : db > -8 ? "#fbcf33" : "#8de07f";
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [levels]);

  const insert = song.mixer[selected] ?? song.mixer[0];
  const routed = (index: number) => song.channels.filter((c) => c.insert === index).map((c) => c.name);
  const setEffects = (effects: Insert["effects"], record = true) => onInsert(selected, { effects }, record);

  return (
    <div className="flex h-full min-h-0 gap-3">
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
        {song.mixer.map((m, i) => (
          <div key={m.id} onClick={() => onSelect(i)} className={`flex w-20 shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-lg p-1.5 ring-1 ${i === selected ? "bg-white/10 ring-amber-400" : "ring-white/5 hover:bg-white/5"} ${i === 0 ? "mr-2" : ""}`}>
            <span className="font-mono text-[10px] text-slate-400">{i === 0 ? "MASTER" : `INS ${i}`}</span>
            <input aria-label="Insert name" value={m.name} onClick={(e) => e.stopPropagation()} onChange={(e) => onInsert(i, { name: e.target.value }, false)} className="w-full rounded bg-transparent text-center text-[11.5px] font-bold text-white focus-visible:bg-white/10 focus-visible:outline-none" />
            <div className="flex h-40 w-full items-end justify-center gap-1.5">
              <div className="relative h-full w-2.5 overflow-hidden rounded-sm bg-black/50">
                <div ref={(el) => { meters.current[i] = el; }} className="absolute inset-x-0 bottom-0 h-0" />
              </div>
              <input
                aria-label="Fader"
                type="range"
                min={0}
                max={1.25}
                step={0.01}
                value={m.volume}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={() => onInsert(i, { volume: 0.8 })}
                onChange={(e) => onInsert(i, { volume: Number(e.target.value) }, false)}
                className="h-full w-5 accent-amber-400 [writing-mode:vertical-lr] [direction:rtl]"
              />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-slate-300">{m.volume > 0 ? `${(20 * Math.log10(m.volume)).toFixed(1)} dB` : "-inf"}</span>
            <input aria-label="Pan" type="range" min={-1} max={1} step={0.01} value={m.pan} onClick={(e) => e.stopPropagation()} onDoubleClick={() => onInsert(i, { pan: 0 })} onChange={(e) => onInsert(i, { pan: Number(e.target.value) }, false)} className="w-full accent-amber-400" />
            <button type="button" aria-pressed={m.mute} onClick={(e) => { e.stopPropagation(); onInsert(i, { mute: !m.mute }); }} className={`h-6 w-full rounded text-[10.5px] font-extrabold ${m.mute ? "bg-rose-500 text-white" : "bg-white/10 text-slate-300"}`}>{m.mute ? "MUTED" : "MUTE"}</button>
            <span className="h-4 w-full truncate text-center text-[9.5px] text-slate-500" title={routed(i).join(", ")}>{i === 0 ? `${m.effects.length} fx` : routed(i).join(", ") || "—"}</span>
          </div>
        ))}
        <button type="button" onClick={onAddInsert} aria-label="Add insert" className="flex w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300 hover:bg-white/15">
          <TbPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex w-72 shrink-0 flex-col gap-2 overflow-y-auto rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
        <p className="text-[12px] font-extrabold text-white">{selected === 0 ? "Master" : `Insert ${selected}`}: {insert.name}</p>
        {insert.effects.map((fx, k) => (
          <div key={fx.id} className={`flex flex-col gap-1.5 rounded-lg bg-black/25 p-2 ring-1 ring-white/10 ${fx.on ? "" : "opacity-50"}`}>
            <div className="flex items-center gap-1">
              <span className="flex-1 text-[12px] font-bold text-amber-400">{k + 1}. {EFFECT_LABEL[fx.kind]}</span>
              <button type="button" aria-label="Switch" aria-pressed={fx.on} onClick={() => setEffects(insert.effects.map((f) => (f.id === fx.id ? { ...f, on: !f.on } : f)))} className={`flex h-6 w-6 items-center justify-center rounded ${fx.on ? "bg-[#8de07f] text-navy" : "bg-white/10 text-slate-300"}`}><TbPower className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Move up" disabled={k === 0} onClick={() => { const e = insert.effects.slice(); [e[k - 1], e[k]] = [e[k], e[k - 1]]; setEffects(e); }} className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-slate-300 disabled:opacity-30"><TbArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Move down" disabled={k === insert.effects.length - 1} onClick={() => { const e = insert.effects.slice(); [e[k + 1], e[k]] = [e[k], e[k + 1]]; setEffects(e); }} className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-slate-300 disabled:opacity-30"><TbArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Remove" onClick={() => setEffects(insert.effects.filter((f) => f.id !== fx.id))} className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-slate-300 hover:bg-rose-500 hover:text-white"><TbTrash className="h-3.5 w-3.5" /></button>
            </div>
            {EFFECT_PARAMS[fx.kind].map((param) => (
              <label key={param.key} className="flex items-center gap-2 text-[10.5px] font-semibold text-slate-300">
                <span className="w-14 shrink-0">{param.label}</span>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={fx.params[param.key] ?? param.value}
                  onDoubleClick={() => setEffects(insert.effects.map((f) => (f.id === fx.id ? { ...f, params: { ...f.params, [param.key]: param.value } } : f)))}
                  onChange={(e) => setEffects(insert.effects.map((f) => (f.id === fx.id ? { ...f, params: { ...f.params, [param.key]: Number(e.target.value) } } : f)), false)}
                  className="min-w-0 flex-1 accent-amber-400"
                />
                <span className="w-12 shrink-0 text-right font-mono tabular-nums">{param.key === "type" ? (fx.params.type >= 0.5 ? "HP" : "LP") : Number(fx.params[param.key] ?? param.value).toFixed(param.step < 0.01 ? 3 : param.step < 1 ? 2 : 0)}</span>
              </label>
            ))}
          </div>
        ))}
        <select aria-label="Add effect" value="" onChange={(e) => { if (e.target.value) setEffects([...insert.effects, newEffect(e.target.value as EffectKind)]); }} className="h-8 rounded-lg bg-white/10 px-2 text-[12px] font-bold text-white">
          <option value="" className="bg-navy">+ Add effect…</option>
          {EFFECTS.map((kind) => <option key={kind} value={kind} className="bg-navy">{EFFECT_LABEL[kind]}</option>)}
        </select>
        <p className="text-[10.5px] leading-snug text-slate-500">Double-click a knob or fader to reset it. Effects run top to bottom.</p>
      </div>
    </div>
  );
}
