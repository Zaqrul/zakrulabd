"use client";

/* The channel rack: every channel with its instrument, volume, pan, mixer insert, mute and solo, and a step sequencer
   for the selected pattern. A step is a sixteenth of the channel's step note (a kick, a snare, or any pitch); steps in
   groups of a beat, the pattern's whole length across. A channel whose notes are not all steps opens in the piano
   roll from its name. */
import { TbPiano, TbPlus, TbTrash } from "react-icons/tb";
import { SIXTEENTH, STUDIO_VOICES, beatTicks, noteName, patternLength, sortNotes, type Channel, type Pattern, type StudioSong, type StudioVoice } from "@/lib/studio";
import { COLORS, DRUM_NAMES } from "./piano-roll";

export const VOICE_LABEL: Record<StudioVoice, string> = {
  piano: "Piano", brass: "Brass", trumpet: "Trumpet", strings: "Strings", violin: "Violin", lead: "Saw lead", square: "Square",
  superSquare: "Super square", organ: "Organ", organChord: "Organ chord", bell: "Bell", harp: "Harp", chip: "Chip", guitar: "Guitar",
  synthBass: "Synth bass", pickedBass: "Picked bass", slapBass: "Slap bass", drums: "Drum kit",
};

export function ChannelRack({
  song, pattern, selected, onSelect, onChannel, onSteps, onAdd, onDelete, onOpenPiano, audition,
}: {
  song: StudioSong;
  pattern: Pattern;
  selected: string;
  onSelect: (id: string) => void;
  onChannel: (id: string, change: Partial<Channel>, record?: boolean) => void;
  onSteps: (id: string, notes: Pattern["notes"][string]) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onOpenPiano: (id: string) => void;
  audition: (id: string, pitch: number) => void;
}) {
  const length = patternLength(song, pattern), steps = Math.max(16, Math.round(length / SIXTEENTH)), perBeat = Math.round(beatTicks(song) / SIXTEENTH);
  const anySolo = song.channels.some((c) => c.solo);
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-auto rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
      {song.channels.map((c, i) => {
        const notes = pattern.notes[c.id] ?? [];
        const on = new Set(notes.filter((n) => n.pitch === c.stepPitch).map((n) => Math.round(n.start / SIXTEENTH)));
        const other = notes.some((n) => n.pitch !== c.stepPitch || n.start % SIXTEENTH !== 0);
        const toggle = (k: number) => {
          const start = k * SIXTEENTH;
          const next = on.has(k) ? notes.filter((n) => !(n.pitch === c.stepPitch && Math.round(n.start / SIXTEENTH) === k)) : sortNotes([...notes, { pitch: c.stepPitch, start, len: SIXTEENTH, vel: 0.85 }]);
          if (!on.has(k)) audition(c.id, c.stepPitch);
          onSteps(c.id, next);
        };
        const audible = !c.mute && (!anySolo || c.solo);
        return (
          <div key={c.id} onClick={() => onSelect(c.id)} className={`flex shrink-0 items-center gap-2 rounded-lg p-1.5 ring-1 ${c.id === selected ? "bg-white/10 ring-amber-400" : "ring-white/5 hover:bg-white/5"}`}>
            <button type="button" aria-pressed={!c.mute} title={c.mute ? "Unmute" : "Mute"} onClick={(e) => { e.stopPropagation(); onChannel(c.id, { mute: !c.mute }); }} className={`h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/40 ${audible ? "bg-[#8de07f]" : "bg-slate-600"}`} />
            <button type="button" aria-pressed={c.solo} title="Solo" onClick={(e) => { e.stopPropagation(); onChannel(c.id, { solo: !c.solo }); }} className={`h-5 w-5 shrink-0 rounded text-[10px] font-extrabold ${c.solo ? "bg-amber-400 text-navy" : "bg-white/10 text-slate-300"}`}>S</button>
            <span aria-hidden="true" className="h-6 w-1.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <input aria-label="Channel name" value={c.name} onClick={(e) => e.stopPropagation()} onChange={(e) => onChannel(c.id, { name: e.target.value }, false)} className="w-24 shrink-0 rounded bg-transparent px-1 text-[12.5px] font-bold text-white focus-visible:bg-white/10 focus-visible:outline-none" />
            <select aria-label="Instrument" value={c.voice} onClick={(e) => e.stopPropagation()} onChange={(e) => onChannel(c.id, { voice: e.target.value as StudioVoice })} className="h-7 w-28 shrink-0 rounded bg-black/30 px-1 text-[11.5px] font-semibold text-white">
              {STUDIO_VOICES.map((v) => <option key={v} value={v} className="bg-navy">{VOICE_LABEL[v]}</option>)}
            </select>
            <label className="flex shrink-0 flex-col text-[9px] font-bold uppercase text-slate-400" onClick={(e) => e.stopPropagation()}>
              Vol
              <input aria-label="Volume" type="range" min={0} max={1.2} step={0.01} value={c.volume} onChange={(e) => onChannel(c.id, { volume: Number(e.target.value) }, false)} className="w-16 accent-amber-400" />
            </label>
            <label className="flex shrink-0 flex-col text-[9px] font-bold uppercase text-slate-400" onClick={(e) => e.stopPropagation()}>
              Pan
              <input aria-label="Pan" type="range" min={-1} max={1} step={0.01} value={c.pan} onDoubleClick={() => onChannel(c.id, { pan: 0 })} onChange={(e) => onChannel(c.id, { pan: Number(e.target.value) }, false)} className="w-12 accent-amber-400" />
            </label>
            <label className="flex shrink-0 flex-col text-[9px] font-bold uppercase text-slate-400" onClick={(e) => e.stopPropagation()}>
              Insert
              <select aria-label="Mixer insert" value={c.insert} onChange={(e) => onChannel(c.id, { insert: Number(e.target.value) })} className="h-5 w-12 rounded bg-black/30 text-[11px] text-white">
                {song.mixer.map((m, k) => <option key={m.id} value={k} className="bg-navy">{k === 0 ? "M" : k}</option>)}
              </select>
            </label>
            <label className="flex shrink-0 flex-col text-[9px] font-bold uppercase text-slate-400" onClick={(e) => e.stopPropagation()} title="The note a step plays">
              Step
              <input aria-label="Step note" type="number" min={0} max={127} value={c.stepPitch} onChange={(e) => { const v = Number(e.target.value); if (v >= 0 && v <= 127) onChannel(c.id, { stepPitch: v }, false); }} className="h-5 w-11 rounded bg-black/30 px-1 text-[11px] text-white" />
            </label>
            <span className="w-14 shrink-0 truncate font-mono text-[10px] text-slate-400">{c.voice === "drums" ? DRUM_NAMES[c.stepPitch] ?? noteName(c.stepPitch) : noteName(c.stepPitch)}</span>
            <div className="flex shrink-0 gap-0.5" role="group" aria-label={`${c.name} steps`}>
              {Array.from({ length: steps }, (_, k) => {
                const group = Math.floor(k / perBeat) % 2 === 0;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on.has(k)}
                    aria-label={`Step ${k + 1}`}
                    onClick={(e) => { e.stopPropagation(); toggle(k); }}
                    className={`h-6 w-4 rounded-sm ${on.has(k) ? "bg-amber-400" : group ? "bg-slate-600/70 hover:bg-slate-500" : "bg-slate-700/70 hover:bg-slate-500"} ${k > 0 && k % perBeat === 0 ? "ml-1" : ""}`}
                  />
                );
              })}
            </div>
            <button type="button" title={other ? "Notes off the steps: open in the piano roll" : "Open in the piano roll"} onClick={(e) => { e.stopPropagation(); onOpenPiano(c.id); }} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${other ? "bg-amber-400/80 text-navy" : "bg-white/10 text-slate-200"} hover:bg-amber-400 hover:text-navy`}>
              <TbPiano className="h-3.5 w-3.5" />
            </button>
            <button type="button" aria-label={`Delete ${c.name}`} title="Delete channel" onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-slate-300 hover:bg-rose-500 hover:text-white">
              <TbTrash className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
      <button type="button" onClick={onAdd} className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white/10 text-[12.5px] font-bold text-white hover:bg-white/20">
        <TbPlus className="h-4 w-4" /> Add channel
      </button>
    </div>
  );
}
