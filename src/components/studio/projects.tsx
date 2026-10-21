"use client";

import { useRef, useState } from "react";
import { migrate, uid, type StudioSong } from "@/lib/studio";

const LIBRARY = "zakrul-studio-projects-v1";
type Project = { id: string; updatedAt: string; song: StudioSong };
function readProjects(): Project[] {
  const raw = localStorage.getItem(LIBRARY);
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (value.version !== 1 || !Array.isArray(value.projects)) throw new Error("Project library is damaged. Download your current project as a backup.");
  return value.projects.map((p: Project) => {
    const song = migrate(p.song);
    if (!song || typeof p.id !== "string" || typeof p.updatedAt !== "string") throw new Error("A saved project is damaged. Download your current project as a backup.");
    return { ...p, song };
  });
}

export function Projects({ song, onOpen, onName, onStatus, download, saved }: {
  song: StudioSong;
  onOpen: (song: StudioSong, message: string) => void;
  onName: (name: string) => void;
  onStatus: (message: string) => void;
  download: (data: Uint8Array, name: string, type: string) => void;
  saved: string;
}) {
  const [projects, setProjects] = useState<Project[]>(() => { try { return readProjects(); } catch { return []; } });
  const [selected, setSelected] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const button = "h-8 shrink-0 rounded-lg bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/20 disabled:opacity-40";
  const save = () => {
    try {
      const latest = readProjects(), name = song.name?.trim() || "Untitled";
      const existing = latest.find((p) => p.song.name === name);
      const project: Project = { id: existing?.id ?? uid("project"), updatedAt: new Date().toISOString(), song: { ...song, name } };
      const next = [project, ...latest.filter((p) => p.id !== project.id)];
      localStorage.setItem(LIBRARY, JSON.stringify({ version: 1, projects: next }));
      setProjects(next); setSelected(project.id);
      onStatus(`Saved “${name}” in this browser. Change the name to save another version.`);
    } catch (err) { onStatus(`Could not save project: ${(err as Error).message}`); }
  };
  const importProject = async (f: File) => {
    try {
      if (f.size > 20 * 1024 * 1024) throw new Error("Project files must be smaller than 20 MB.");
      const next = migrate(JSON.parse(await f.text()));
      if (!next) throw new Error("Invalid or unsupported studio project.");
      onOpen(next, `Opened ${next.name || f.name}.`);
    } catch (err) { onStatus(`Could not open project: ${(err as Error).message}`); }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/5 p-2 ring-1 ring-white/10" aria-label="Project files">
      <input aria-label="Project name" maxLength={100} placeholder="Untitled project" value={song.name ?? ""} onChange={(e) => onName(e.target.value)} className="h-8 min-w-0 flex-1 rounded-lg bg-black/25 px-3 text-sm font-bold text-white" />
      <span role="status" className="text-[11px] text-slate-400">{saved}</span>
      <button type="button" onClick={save} className={button}>Save project</button>
      <select aria-label="Saved projects" value={selected} onChange={(e) => setSelected(e.target.value)} className="h-8 max-w-48 rounded-lg bg-navy px-2 text-xs text-white">
        <option value="">Saved projects ({projects.length})</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.song.name || "Untitled"} · {new Date(p.updatedAt).toLocaleDateString()}</option>)}
      </select>
      <button type="button" disabled={!selected} onClick={() => { try { const p = readProjects().find((p) => p.id === selected); if (p) onOpen(p.song, `Opened ${p.song.name || "Untitled"}.`); else onStatus("That project is no longer available."); } catch (err) { onStatus((err as Error).message); } }} className={button}>Open saved</button>
      <button type="button" onClick={() => file.current?.click()} className={button}>Open file</button>
      <button type="button" onClick={() => download(new TextEncoder().encode(JSON.stringify(song, null, 2)), `${(song.name || "studio").replace(/[^\p{L}\p{N}_-]/gu, "_")}.studio.json`, "application/json")} className={button}>Download project</button>
      <input ref={file} type="file" accept=".json,application/json" className="hidden" aria-label="Open project file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importProject(f); e.target.value = ""; }} />
    </div>
  );
}
