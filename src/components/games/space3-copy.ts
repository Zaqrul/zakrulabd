/* Copy for the Space 3 screens. Chapter numbers here are the player's 1 to 12; engine chapters are 17 to 28.
   All twelve chapters (17 to 28) are playable. */
import { SECOND_LAST } from "./space-logic.ts";

export const SPACE3_CHAPTERS = [
  { engine: 17, chapter: 1, name: "Phobos Run", boss: "Ghost Corvet" },
  { engine: 18, chapter: 2, name: "Ceres Industrial Belts", boss: "Excavator-X" },
  { engine: 19, chapter: 3, name: "Jovian Cryo-Crags", boss: "Abyssal Wyrm" },
  { engine: 20, chapter: 4, name: "The Kharn Anomaly", boss: "Armada Reclaimer" },
  { engine: 21, chapter: 5, name: "Uranian Magnetic Shear", boss: "Tempest Raider" },
  { engine: 22, chapter: 6, name: "Triton Geysers", boss: "Cryo-Colossus" },
  { engine: 23, chapter: 7, name: "The Kuiper Graveyard", boss: "Iron Goliath" },
  { engine: 24, chapter: 8, name: "The Heliopause Threshold", boss: "Aegis-Null" },
  { engine: 25, chapter: 9, name: "The Oort Cloud Abyss", boss: "Void Stalker" },
  { engine: 26, chapter: 10, name: "Derelict Megastructure", boss: "Ring Keeper" },
  { engine: 27, chapter: 11, name: "Flagship Breach: The Aethelgard", boss: "The Warmaster" },
  { engine: 28, chapter: 12, name: "The Hypergate Horizon", boss: "The Herald" },
] as const;

export const SPACE3_CHAPTERS_MS = [
  { engine: 17, chapter: 1, name: "Mars Orbital Line (Phobos Run)", boss: "Ghost Corvet" },
  { engine: 18, chapter: 2, name: "Hab Perlombongan Ceres", boss: "Excavator-X" },
  { engine: 19, chapter: 3, name: "Ais Europa (Jovian Cryo-Crags)", boss: "Abyssal Wyrm" },
  { engine: 20, chapter: 4, name: "Sisa Bangkai Cincin Kharn", boss: "Armada Reclaimer" },
  { engine: 21, chapter: 5, name: "Ribut Magnetik Uranus", boss: "Tempest Raider" },
  { engine: 22, chapter: 6, name: "Geyser Triton", boss: "Cryo-Colossus" },
  { engine: 23, chapter: 7, name: "Perkuburan Kuiper", boss: "Iron Goliath" },
  { engine: 24, chapter: 8, name: "Sempadan Heliopause", boss: "Aegis-Null" },
  { engine: 25, chapter: 9, name: "Jurang Awan Oort", boss: "Void Stalker" },
  { engine: 26, chapter: 10, name: "Megastruktur Terbiar", boss: "Ring Keeper" },
  { engine: 27, chapter: 11, name: "Serbuan Kapal Bendera: Aethelgard", boss: "The Warmaster" },
  { engine: 28, chapter: 12, name: "Ufuk Hypergate", boss: "The Herald" },
] as const;

export function space3ChapterName(engineChapter: number, lang: "en" | "ms" = "en"): string | null {
  const list = lang === "ms" ? SPACE3_CHAPTERS_MS : SPACE3_CHAPTERS;
  const chapter = list.find((item) => item.engine === engineChapter);
  if (!chapter) return null;
  return lang === "ms" ? `Bab ${chapter.chapter}: ${chapter.name}` : `Chapter ${chapter.chapter}: ${chapter.name}`;
}

/* Boss names, in engine order from chapter 17 on, to follow Space 1's and Space 2's. */
export const SPACE3_BOSS_NAMES = SPACE3_CHAPTERS.map((c) => c.boss);
export const SPACE3_FIRST = SECOND_LAST + 1;

const wordsEn = {
  title: "Space 3",
  subtitle: "The Outer Gate",
  start: "Begin the run",
  continue: "Continue",
  newGame: "New flight",
  clear: "Chapter clear",
  next: "Next chapter",
  retry: "Retry chapter",
  retryBoss: "Retry from the boss",
  won: "To be continued",
  ending: "The Herald is down, but the gate stands open, and something vast waits on the other side. To be continued in Space 4.",
  help: "How to play",
  guide:
    "Fly with the arrow keys or WASD, or drag. Weapons fire on their own. Your plasma torpedo launches by itself when an enemy is ahead: it leaves its tube like any torpedo, hits harder than one and explodes on impact. The kinetic cell in the corner charges by itself and from every kill. Press B to spend part of it on a Kinetic Push, a wave that shoves enemies, mini bosses, bosses and enemy fire away from you. It does no damage, it buys you room. Supply pods give the Seed Bolt a wide, piercing or rapid mode, and big enemies leave kinetic cells. Ensign Okoro, callsign Lumen, flies your wing in a ship like yours: she slides to the nearest enemy and burns it with a plasma beam, until she overheats. The Vanguard learns where you like to hide, so keep moving.",
};

const wordsMs = {
  title: "Space 3",
  subtitle: "Pintu Luar (The Outer Gate)",
  start: "Mulakan penerbangan",
  continue: "Sambung",
  newGame: "Penerbangan baru",
  clear: "Bab selesai",
  next: "Bab seterusnya",
  retry: "Cuba semula bab",
  retryBoss: "Cuba semula dari bos",
  won: "Akan bersambung",
  ending: "The Herald tumbang, tetapi gerbang kekal terbuka, dan sesuatu yang besar menunggu di seberang. Bersambung di Space 4.",
  help: "Cara bermain",
  guide:
    "Terbang guna kekunci anak panah atau WASD, atau seret. Senjata menembak secara automatik. Torpedo plasma dilancarkan sendiri bila ada musuh di hadapan: ia keluar dari tiub pelancar, memberi impak letupan kuat. Sel kinetik di sudut dicas sendiri dan dari setiap musuh yang dimusnahkan. Tekan B untuk melepaskan Tolakan Kinetik (Kinetic Push), gelombang yang menolak musuh, bos kecil, bos dan tembakan musuh menjauhi anda untuk memberi ruang mengelak. Kapsul bekalan memberi mod tembakan Seed Bolt (lebar, tembus, atau pantas), dan musuh besar meninggalkan sel kinetik. Ensign Okoro (Lumen) terbang di sayap anda dengan kapal Zephyr-04: dia memusnahkan musuh terdekat dengan pancaran plasma sehingga enjinnya terlalu panas (overheat). Armada Vanguard membaca corak laluan anda, jadi sentiasa bergerak pantas.",
};

export const SPACE3_COPY = { en: wordsEn, ms: wordsMs };

