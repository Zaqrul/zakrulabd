/* Data for the booking showcase: a fictional wedding and portrait
   photographer in Shah Alam. The terms follow how Malaysian photographers
   take bookings: a fixed deposit locks a wedding date and is not refunded but
   can move once, travel is charged by zone, nikah and sanding are priced as
   separate events, and studio sessions are sold as time slots. The flow
   itself (session, date, details, deposit, then a questionnaire and
   reminders) follows the booking tools photographers use abroad. */

export type Photo = { id: string; alt: string; by: string };

export const photo = (p: Photo, w = 1600) => `https://images.unsplash.com/photo-${p.id}?auto=format&fit=crop&w=${w}&q=80`;

/* Unsplash photos, credited in the page footer. */
export const photos = {
  sanding: { id: "1670157129141-9495bd5d0982", alt: "A bride and groom in matching songket at their bersanding, the groom feeding the bride", by: "Muhammad Qayyum Abdul Rahman" },
  couple: { id: "1692899189376-c9f179f9dc49", alt: "A smiling couple in teal baju Melayu and kebaya at their reception", by: "Wan Syazwan" },
  bride: { id: "1692899228578-e0d71683a01b", alt: "A bride in a pale blue hijab and crown, smiling beside her mother", by: "Wan Syazwan" },
  nikah: { id: "1614361167683-1153b3d9110c", alt: "A groom and bride in silhouette, her veil lit from behind", by: "Anuar Sheikh" },
  tunang: { id: "1598228227844-a6c7ec9a292c", alt: "A man's hand reaching for a woman's hand holding a ring", by: "Alex Hudson" },
  prewed: { id: "1592196419895-9efe26ce97b7", alt: "Two women in hijab holding hands by the lake at dusk, with the Kuala Lumpur skyline behind", by: "Muhammad Faiz Zulkeflee" },
  konvo: { id: "1646107925391-625582fbbb8b", alt: "A graduate in her gown waving her scroll in front of the Universiti Malaya 2022 sign", by: "Muhammad Faiz Zulkeflee" },
  portrait: { id: "1574297500578-afae55026ff3", alt: "A woman in a pink hijab and maroon jacket, hand to her cheek", by: "Muhammad Faiz Zulkeflee" },
  family: { id: "1561476595-83bf113be908", alt: "A group of women in baju kurung posing together in a hall", by: "Aniq Danial" },
  product: { id: "1655115288027-574b7ae55093", alt: "Plates of mee goreng and nasi goreng with fried egg and keropok, styled on a dark table", by: "Muhammad Fawdy" },
  aina: { id: "1601403607678-6d6515e458ef", alt: "A photographer with her camera raised to her eye, at an outdoor event", by: "Lisanto 李奕良" },
} satisfies Record<string, Photo>;

/* A delivered wedding, for the client gallery. The demo sign-in for it is
   shown on the page. */
export const demoGallery = {
  ref: "TDH-0412",
  pin: "2410",
  couple: "Nadia & Faris",
  event: "Majlis sanding · Dewan Seri Alam, Shah Alam",
  total: 250,
  photos: [photos.sanding, photos.bride, photos.couple, photos.nikah, photos.family, photos.tunang, photos.prewed, photos.portrait],
};

export type AddOn = { id: string; label: string; note: string; price: number; per?: "hour" | "person"; max?: number };

export const addOns: Record<string, AddOn> = {
  hour: { id: "hour", label: "Extra hour", note: "Coverage beyond the package", price: 150, per: "hour", max: 4 },
  second: { id: "second", label: "Second photographer", note: "Haziq covers the other side of the room", price: 450 },
  video: { id: "video", label: "Highlight video", note: "3 to 5 minutes, delivered within 3 weeks", price: 900 },
  book: { id: "book", label: "Photobook upgrade", note: "40 pages instead of 20, linen cover", price: 250 },
  express: { id: "express", label: "Sneak peek in 48 hours", note: "12 edited photos for social media", price: 120 },
  pax: { id: "pax", label: "Extra person", note: "Beyond the people included", price: 30, per: "person", max: 10 },
  outfit: { id: "outfit", label: "Extra outfit", note: "Adds 15 minutes for the change", price: 80 },
  print: { id: "print", label: "A4 framed print", note: "Your pick from the gallery", price: 60 },
};

export type Session = {
  id: string;
  group: "Weddings" | "Sessions";
  name: string;
  /* What the client would call it, if different. */
  aka?: string;
  kind: "event" | "slot";
  /* Coverage in hours for events, minutes for slots. */
  length: number;
  people?: number;
  where: "venue" | "studio-or-outdoor" | "outdoor" | "studio";
  delivers: string[];
  price: number;
  deposit: number;
  photo: Photo;
  /* Start times on offer for events, with what they usually mean here. */
  starts?: { time: string; note: string }[];
  addOns: string[];
};

export const sessions: Session[] = [
  {
    id: "nikah",
    group: "Weddings",
    name: "Akad nikah",
    kind: "event",
    length: 4,
    where: "venue",
    delivers: ["1 photographer", "150 edited photos", "Online gallery"],
    price: 1200,
    deposit: 300,
    photo: photos.nikah,
    starts: [
      { time: "09:00", note: "Morning nikah" },
      { time: "14:30", note: "After Zohor" },
      { time: "20:30", note: "After Isyak" },
    ],
    addOns: ["hour", "second", "video", "express"],
  },
  {
    id: "sanding",
    group: "Weddings",
    name: "Majlis sanding",
    aka: "Reception",
    kind: "event",
    length: 6,
    where: "venue",
    delivers: ["1 photographer", "250 edited photos", "20-page photobook"],
    price: 1800,
    deposit: 300,
    photo: photos.sanding,
    starts: [
      { time: "10:30", note: "Arrival of guests" },
      { time: "11:30", note: "Most dewan bookings" },
    ],
    addOns: ["hour", "second", "video", "book", "express"],
  },
  {
    id: "both",
    group: "Weddings",
    name: "Nikah and sanding, same day",
    kind: "event",
    length: 9,
    where: "venue",
    delivers: ["2 photographers", "400 edited photos", "20-page photobook"],
    price: 2600,
    deposit: 300,
    photo: photos.couple,
    starts: [{ time: "08:30", note: "Nikah in the morning, sanding from noon" }],
    addOns: ["hour", "video", "book", "express"],
  },
  {
    id: "tunang",
    group: "Weddings",
    name: "Majlis tunang",
    aka: "Engagement",
    kind: "event",
    length: 3,
    where: "venue",
    delivers: ["1 photographer", "100 edited photos", "Online gallery"],
    price: 750,
    deposit: 300,
    photo: photos.tunang,
    starts: [
      { time: "11:00", note: "Late morning" },
      { time: "15:00", note: "After Zohor" },
    ],
    addOns: ["hour", "express"],
  },
  {
    id: "prewed",
    group: "Weddings",
    name: "Pre-wedding outdoor",
    kind: "event",
    length: 2,
    where: "outdoor",
    delivers: ["2 locations", "40 edited photos", "Outfit change included"],
    price: 900,
    deposit: 300,
    photo: photos.prewed,
    starts: [
      { time: "07:00", note: "Sunrise, cooler and quieter" },
      { time: "17:00", note: "Golden hour into dusk" },
    ],
    addOns: ["hour", "express"],
  },
  {
    id: "konvo",
    group: "Sessions",
    name: "Konvo",
    aka: "Graduation",
    kind: "slot",
    length: 30,
    people: 6,
    where: "studio-or-outdoor",
    delivers: ["Up to 6 people", "15 edited photos", "Studio or your campus"],
    price: 250,
    deposit: 100,
    photo: photos.konvo,
    addOns: ["pax", "print", "express"],
  },
  {
    id: "family",
    group: "Sessions",
    name: "Family and group",
    kind: "slot",
    length: 60,
    people: 8,
    where: "studio-or-outdoor",
    delivers: ["Up to 8 people", "25 edited photos", "Studio or outdoor"],
    price: 450,
    deposit: 100,
    photo: photos.family,
    addOns: ["pax", "outfit", "print"],
  },
  {
    id: "portrait",
    group: "Sessions",
    name: "Personal portrait",
    aka: "Profile and branding",
    kind: "slot",
    length: 45,
    people: 1,
    where: "studio",
    delivers: ["1 person, 2 outfits", "15 edited photos", "LinkedIn and web crops"],
    price: 380,
    deposit: 100,
    photo: photos.portrait,
    addOns: ["outfit", "express"],
  },
  {
    id: "product",
    group: "Sessions",
    name: "Product and food",
    kind: "slot",
    length: 120,
    where: "studio",
    delivers: ["Up to 15 items", "30 edited photos", "White and styled backdrops"],
    price: 650,
    deposit: 100,
    photo: photos.product,
    addOns: ["express"],
  },
];

export const sessionBy = (id: string) => sessions.find((s) => s.id === id)!;

/* Travel for venue and outdoor work. The studio is in Seksyen 13, Shah Alam. */
export const zones = [
  { id: "kv", label: "Klang Valley", price: 0 },
  { id: "near", label: "Rest of Selangor, Negeri Sembilan", price: 100 },
  { id: "mid", label: "Perak, Melaka, Pahang", price: 250 },
  { id: "far", label: "Rest of Peninsular Malaysia", price: 400 },
] as const;

export type ZoneId = (typeof zones)[number]["id"];

export const banks = ["Maybank2u", "CIMB Clicks", "Bank Islam", "RHB Now", "Public Bank", "Bank Rakyat", "Hong Leong Connect", "AmOnline"];

/* ---- Dates. Keys are local YYYY-MM-DD strings. ---- */

export const pad = (n: number) => String(n).padStart(2, "0");
export const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const dateOf = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (k: string, n: number) => {
  const d = dateOf(k);
  d.setDate(d.getDate() + n);
  return keyOf(d);
};
export const daysBetween = (a: string, b: string) => Math.round((dateOf(b).getTime() - dateOf(a).getTime()) / 86400000);

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (m: number) => monthNames[m];
export const longDate = (k: string) => {
  const d = dateOf(k);
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
};
export const shortDate = (k: string) => {
  const d = dateOf(k);
  return `${dayNames[d.getDay()].slice(0, 3)} ${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)}`;
};

/* 24-hour "HH:MM" to "9:00 am". */
export function clock12(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? "am" : "pm"}`;
}

/* A stable pseudo-random number in [0, 1) for a string, so the demo's
   bookings are the same on every visit without storing anything. */
export function rand(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/* Weddings: two photographers, so two events a day at most. Weekends in the
   school holidays go first. Books close three days ahead. */
export const CAPACITY = 2;

export function eventsBooked(k: string) {
  const d = dateOf(k);
  const day = d.getDay();
  const r = rand(`ev:${k}`);
  const peak = d.getMonth() === 10 || d.getMonth() === 11 || d.getMonth() === 5;
  if (day === 6 || day === 0) return r < (peak ? 0.6 : 0.4) ? 2 : r < 0.85 ? 1 : 0;
  if (day === 5) return r < 0.2 ? 2 : r < 0.5 ? 1 : 0;
  return r < 0.12 ? 1 : 0;
}

/* Studio sessions: open 10am to 6pm, closed Tuesdays, and no slots across
   Friday prayers. Slots are the session length plus 15 minutes to reset. */
export const STUDIO_OPEN = 10 * 60;
export const STUDIO_CLOSE = 18 * 60;

const toTime = (mins: number) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

export function slotsFor(s: Session, k: string) {
  const day = dateOf(k).getDay();
  if (day === 2) return [];
  const step = Math.ceil((s.length + 15) / 15) * 15;
  const out: { time: string; taken: boolean }[] = [];
  for (let t = STUDIO_OPEN; t + s.length <= STUDIO_CLOSE; t += step) {
    if (day === 5 && t < 14 * 60 + 30 && t + s.length > 12 * 60 + 30) continue;
    const busy = rand(`sl:${s.id}:${k}:${t}`) < (day === 6 || day === 0 ? 0.55 : 0.3);
    out.push({ time: toTime(t), taken: busy });
  }
  return out;
}

/* Grouped by hand rather than toLocaleString, so the server and the browser
   always print the same string. */
export const rm = (n: number) => `RM ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
