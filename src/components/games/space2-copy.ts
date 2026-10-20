/* Copy contract for the Space 2 screens and HUD. Chapter numbers here are the
   player's 1–8; engine chapters remain 9–16. No Space 1 completion requirement. */
import type { Ach } from "../../lib/achievements-data";
import type { Space2Chapter } from "./space2-story";

export const SPACE2_CHAPTERS = [
  { engine: 9, chapter: 1, en: "Pacific Re-entry", ms: "Kembali ke Pasifik", boss: "Tidebreaker" },
  { engine: 10, chapter: 2, en: "Monsoon Archipelago", ms: "Kepulauan Monsun", boss: "Mangrove Hydra" },
  { engine: 11, chapter: 3, en: "Himalayan Relay", ms: "Geganti Himalaya", boss: "Ice Wyvern" },
  { engine: 12, chapter: 4, en: "Sahara Command", ms: "Pusat Perintah Sahara", boss: "Dune Maw" },
  { engine: 13, chapter: 5, en: "Alpine Corridor", ms: "Koridor Alps", boss: "Iron Meridian" },
  { engine: 14, chapter: 6, en: "Arctic Ice Shelf", ms: "Pelantar Ais Artik", boss: "Permafrost" },
  { engine: 15, chapter: 7, en: "Atlantic Hurricane", ms: "Taufan Atlantik", boss: "Cyclone" },
  { engine: 16, chapter: 8, en: "Meridian Citadel", ms: "Meridian Citadel", boss: "Marsh's Atlas / Judgement" },
] as const satisfies readonly { engine: Space2Chapter; chapter: number; en: string; ms: string; boss: string }[];

export function space2ChapterName(lang: "en" | "ms", engineChapter: number): string | null {
  const chapter = SPACE2_CHAPTERS.find((item) => item.engine === engineChapter);
  return chapter ? `${lang === "ms" ? "Bab" : "Chapter"} ${chapter.chapter}: ${chapter[lang]}` : null;
}

export const SPACE2_COPY = {
  en: {
    title: "Space 2",
    subtitle: "The way home",
    intro: "Earth Force calls you a traitor. Cross eight regions with Halo and Kite. Disable the machines. Bring the crews home.",
    available: "Start here. Completing Space 1 is not required.",
    start: "Begin re-entry",
    continue: "Continue",
    newGame: "New flight",
    clear: "Chapter clear",
    next: "Next chapter",
    retry: "Retry chapter",
    retryBoss: "Retry from the boss",
    won: "The way home is clear",
    ending: "Judgement is silent. The crews are safe. Aurora is waiting.",
    help: "How to play",
    guide: "Fly with the arrow keys, or drag a finger or the mouse across the game. Weapons fire automatically. Destroy enemies to earn XP: every 100 XP fills one gauge and grants one level, up to level 10. The upgrades are the same as Space 1. Kite follows and fires automatically. When enemy fire comes close, Kite lays its own Bloom over you for two seconds, and it is ready again fifteen seconds later. Mini rockets intercept incoming bullets before targeting enemies. Bloom is separate support, so collecting it keeps your current gun. It opens when enemy fire comes close and absorbs standard bullets, but every bullet it absorbs drains its energy, so heavy fire empties it fast. Beams, missiles, flares and charges pass through. Closing Bloom after at least sixteen blocks releases a petal burst. Hyperbeam charges automatically when a target is in its lane: movement is halved for the charge, then firing pauses briefly after the beam. Each pod has three charges. Every place affects your ship: spray slows you low over the sea, rain pushes you down, wind pushes you back, sand slows your guns, fog scatters enemy aim, polar cold slows your engines, turbulence shoves you about, and the clear dawn recharges your shield. Ground units hide behind walls and ships behind barriers: shooting cover wears it down to a stump but never destroys it, and stingers curve over it. Watch weather warnings and leave marked lanes before a strike. You have two chances: each time your ship is lost, one is used to try again. Lose it with none left and the run starts again from Chapter 1. Press P or use Pause to pause.",
    hud: { xp: "XP", level: "Level", maxLevel: "MAX LEVEL", bloom: "BLOOM", bloomRecovering: "RECOVERING", hyperbeam: "HYPERBEAM", charging: "CHARGING", cooling: "COOLING", charges: "Charges", orbCover: "ORB COVER", coverReady: "READY", coverActive: "COVER ACTIVE", coverUsed: "COVER USED" },
    guns: { minirocket: "MINI ROCKET", bloom: "BLOOM", hyperbeam: "HYPERBEAM" },
    pickups: {
      minirocket: "Four homing rockets. Incoming bullets first. Ammo: 60.",
      bloom: "Automatic bullet cover. Keeps your gun. Eight blocks build a petal burst.",
      hyperbeam: "Three piercing beams. One-second charge. Half-speed movement while charging.",
    },
    weather: { storm: "STORM FRONT", monsoon: "MONSOON", gustUp: "GUST UP", gustDown: "GUST DOWN", sand: "SANDSTORM", missiles: "MISSILE LANES", ice: "ICEFALL", lightning: "LIGHTNING", dawn: "CLEAR DAWN" },
    calls: {
      cover: { who: "halo", text: "ORB cover. Two seconds. Make them count." },
      charge: { who: "arc", text: "Hyperbeam charging. This is the commitment part." },
      burst: { who: "arc", text: "Bloom returning the favour." },
      level: { who: "arc", text: "XP gauge full. Upgrade online." },
    },
  },
  ms: {
    title: "Space 2",
    subtitle: "Jalan pulang",
    intro: "Earth Force menggelar anda pengkhianat. Rentasi lapan wilayah bersama Halo dan Kite. Lumpuhkan mesin. Bawa kru pulang.",
    available: "Boleh mula di sini. Tidak perlu tamatkan Space 1.",
    start: "Masuk semula ke atmosfera",
    continue: "Sambung",
    newGame: "Penerbangan baharu",
    clear: "Bab selesai",
    next: "Bab seterusnya",
    retry: "Cuba semula bab",
    retryBoss: "Cuba semula dari boss",
    won: "Jalan pulang sudah terbuka",
    ending: "Judgement sudah senyap. Kru sudah selamat. Aurora sedang menunggu.",
    help: "Cara bermain",
    guide: "Terbang dengan kekunci anak panah, atau seret jari atau tetikus pada game. Senjata menembak secara automatik. Musnahkan musuh untuk mendapat XP: setiap 100 XP memenuhi satu tolok dan menaikkan satu tahap, sehingga tahap 10. Naik taraf sama seperti Space 1. Kite mengikut dan menembak secara automatik. Apabila tembakan musuh menghampiri, Kite membentangkan Bloom miliknya ke atas kapal anda selama dua saat, dan ia sedia semula lima belas saat kemudian. Roket mini memintas peluru yang menghampiri sebelum menyasarkan musuh. Bloom ialah sokongan berasingan, jadi mengambilnya tidak menggantikan senjata anda. Ia terbuka apabila tembakan musuh menghampiri dan menyerap peluru biasa, tetapi setiap peluru yang diserap menghabiskan tenaganya, jadi tembakan bertubi-tubi cepat mengosongkannya. Pancaran, peluru berpandu, suar api dan rempuhan boleh menembusinya. Menutup Bloom selepas sekurang-kurangnya enam belas sekatan melepaskan letusan kelopak. Hyperbeam mengecas secara automatik apabila sasaran berada dalam lorongnya: kelajuan gerakan dibahagi dua ketika mengecas, kemudian tembakan berhenti sebentar selepas pancaran dilepaskan. Setiap pod ada tiga cas. Setiap tempat memberi kesan kepada kapal anda: percikan laut melambatkan anda dekat air, hujan menolak anda ke bawah, angin menolak anda ke belakang, pasir melambatkan senjata, kabus menyebabkan tembakan musuh tersasar, sejuk kutub melambatkan enjin, gelora menolak anda ke sana sini, dan fajar cerah memulihkan perisai anda. Unit darat berlindung di sebalik tembok dan kapal di sebalik penghadang: menembak lindungan hanya merosakkannya hingga tinggal tunggul, tidak pernah memusnahkannya, dan stinger boleh melengkung melepasinya. Perhatikan amaran cuaca dan tinggalkan lorong bertanda sebelum serangan. Anda ada dua peluang: setiap kali kapal musnah, satu digunakan untuk cuba semula. Jika kapal musnah tanpa peluang lagi, permainan bermula semula dari Bab 1. Tekan P atau guna Jeda untuk berhenti seketika.",
    hud: { xp: "XP", level: "Tahap", maxLevel: "TAHAP MAKSIMUM", bloom: "BLOOM", bloomRecovering: "PEMULIHAN", hyperbeam: "HYPERBEAM", charging: "MENGECAS", cooling: "PENYEJUKAN", charges: "Cas", orbCover: "LINDUNGAN ORB", coverReady: "SEDIA", coverActive: "LINDUNGAN AKTIF", coverUsed: "SUDAH DIGUNAKAN" },
    guns: { minirocket: "ROKET MINI", bloom: "BLOOM", hyperbeam: "HYPERBEAM" },
    pickups: {
      minirocket: "Empat roket pengesan. Utamakan peluru yang menghampiri. Peluru: 60.",
      bloom: "Lindungan peluru automatik. Kekalkan senjata. Lapan sekatan menghasilkan letusan kelopak.",
      hyperbeam: "Tiga pancaran penembus. Cas satu saat. Gerakan separuh laju ketika mengecas.",
    },
    weather: { storm: "RIBUT MENGHAMPIRI", monsoon: "MONSUN", gustUp: "TIUPAN KE ATAS", gustDown: "TIUPAN KE BAWAH", sand: "RIBUT PASIR", missiles: "LORONG PELURU BERPANDU", ice: "AIS RUNTUH", lightning: "KILAT", dawn: "FAJAR CERAH" },
    calls: {
      cover: { who: "halo", text: "Lindungan ORB. Dua saat. Gunakan sebaiknya." },
      charge: { who: "arc", text: "Hyperbeam mengecas. Inilah bahagian yang perlukan komitmen." },
      burst: { who: "arc", text: "Bloom membalas budi." },
      level: { who: "arc", text: "Tolok XP penuh. Naik taraf aktif." },
    },
  },
} as const;

/* Engine contract: chapter is the highest LOCAL chapter cleared (1–8).
   Weapon-use, block, cover and no-hit stats are cumulative successful events.
   hyperbeamMultiKill is the largest number of kills from ONE beam, not a total.
   Register with the achievement catalogue only when these events are wired. */
export const SPACE2_ACHIEVEMENTS: Ach[] = [
  ...SPACE2_CHAPTERS.map((chapter): Ach => ({
    id: `space2.chapter.${chapter.chapter}`, game: "space2", stat: "chapter", min: chapter.chapter,
    name: [chapter.en, chapter.ms],
    desc: [`Clear Space 2 Chapter ${chapter.chapter}: ${chapter.en}.`, `Selesaikan Bab ${chapter.chapter} Space 2: ${chapter.ms}.`],
  })),
  { id: "space2.minirocketUses.1", game: "space2", stat: "minirocketUses", min: 1, name: ["Small Rockets, Big Plans", "Roket Kecil, Rancangan Besar"], desc: ["Fire a mini rocket volley in Space 2.", "Lepaskan satu salvo roket mini dalam Space 2."] },
  { id: "space2.bloomUses.1", game: "space2", stat: "bloomUses", min: 1, name: ["Open Season", "Buka Kelopak"], desc: ["Let Bloom open against incoming fire in Space 2.", "Biarkan Bloom terbuka menghadapi tembakan dalam Space 2."] },
  { id: "space2.hyperbeamUses.1", game: "space2", stat: "hyperbeamUses", min: 1, name: ["Point Made", "Mesej Diterima"], desc: ["Fire Hyperbeam in Space 2.", "Tembak Hyperbeam dalam Space 2."] },
  { id: "space2.bloomBlocks.8", game: "space2", stat: "bloomBlocks", min: 8, name: ["Petal Collector", "Pengumpul Kelopak"], desc: ["Absorb 8 bullets with Bloom across your Space 2 flights.", "Serap 8 peluru dengan Bloom sepanjang penerbangan Space 2 anda."] },
  { id: "space2.hyperbeamMultiKill.2", game: "space2", stat: "hyperbeamMultiKill", min: 2, name: ["One Clear Line", "Satu Garis Bersih"], desc: ["Destroy at least 2 enemies with one Hyperbeam in Space 2.", "Musnahkan sekurang-kurangnya 2 musuh dengan satu Hyperbeam dalam Space 2."] },
  { id: "space2.noHitChapters.1", game: "space2", stat: "noHitChapters", min: 1, name: ["Not a Scratch", "Tanpa Calar"], desc: ["Clear a Space 2 chapter without a hit, including shield hits.", "Selesaikan satu bab Space 2 tanpa terkena serangan, termasuk pada perisai."] },
  { id: "space2.orbCovers.1", game: "space2", stat: "orbCovers", min: 1, name: ["Never Alone", "Tidak Bersendirian"], desc: ["Receive Halo's automatic ORB cover in Space 2.", "Terima lindungan ORB automatik daripada Halo dalam Space 2."] },
];
