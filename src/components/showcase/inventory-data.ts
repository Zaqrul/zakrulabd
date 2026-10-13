/* Data for the inventory showcase: a fictional restaurant group with a
   central kitchen and two outlets, stocking raw cooking ingredients. The
   model follows how restaurant inventory tools work: stock is held per
   location, each item has a par (the level to order up to) and a minimum
   (the level that raises an alert), outlets are depleted by POS sales through
   recipes, and the central kitchen by production batches. */

export type Loc = "ck" | "ss15" | "bgs";

export const locations: { id: Loc; name: string; short: string; kind: string }[] = [
  { id: "ck", name: "Central Kitchen, Shah Alam", short: "Central Kitchen", kind: "Production" },
  { id: "ss15", name: "SS15 Subang Jaya", short: "SS15", kind: "Outlet" },
  { id: "bgs", name: "Bangsar", short: "Bangsar", kind: "Outlet" },
];

export const locShort = (l: Loc) => locations.find((x) => x.id === l)!.short;

export type Storage = "Chiller" | "Freezer" | "Dry store";

export const storages: Storage[] = ["Chiller", "Freezer", "Dry store"];

export type Category = "Meat, poultry & eggs" | "Seafood" | "Produce" | "Dry goods";

export const categories: Category[] = ["Meat, poultry & eggs", "Seafood", "Produce", "Dry goods"];

export type Supplier = "segar" | "lautan" | "kebun" | "gudang";

export const suppliers: Record<Supplier, { name: string; delivery: string }> = {
  segar: { name: "Segar Poultry & Meat", delivery: "Daily, before 8am" },
  lautan: { name: "Lautan Biru Seafood", delivery: "Mon, Wed, Fri" },
  kebun: { name: "Kebun Hijau Produce", delivery: "Daily, before 7am" },
  gudang: { name: "Gudang Rempah Trading", delivery: "Tue and Sat" },
};

export type Unit = "kg" | "L" | "pcs";

export type Item = {
  code: string;
  name: string;
  category: Category;
  storage: Storage;
  unit: Unit;
  /* What the supplier sells it in, in stock units. */
  pack: { size: number; label: string };
  cost: number;
  supplier: Supplier;
  par: Record<Loc, number>;
  start: Record<Loc, number>;
};

const L = (ck: number, ss15: number, bgs: number): Record<Loc, number> => ({ ck, ss15, bgs });

export const items: Item[] = [
  { code: "MP-101", name: "Whole chicken", category: "Meat, poultry & eggs", storage: "Chiller", unit: "kg", pack: { size: 10, label: "10 kg box" }, cost: 9.8, supplier: "segar", par: L(120, 40, 35), start: L(96.5, 31.2, 12.4) },
  { code: "MP-102", name: "Chicken thigh, boneless", category: "Meat, poultry & eggs", storage: "Chiller", unit: "kg", pack: { size: 5, label: "5 kg pack" }, cost: 14.5, supplier: "segar", par: L(60, 20, 20), start: L(42, 16.5, 14) },
  { code: "MP-110", name: "Beef topside", category: "Meat, poultry & eggs", storage: "Freezer", unit: "kg", pack: { size: 10, label: "10 kg carton" }, cost: 32, supplier: "segar", par: L(80, 10, 10), start: L(64, 7.5, 3.2) },
  { code: "MP-120", name: "Eggs, grade A", category: "Meat, poultry & eggs", storage: "Chiller", unit: "pcs", pack: { size: 30, label: "tray of 30" }, cost: 0.42, supplier: "segar", par: L(600, 300, 300), start: L(510, 214, 96) },
  { code: "SF-201", name: "Prawns, 31/40", category: "Seafood", storage: "Freezer", unit: "kg", pack: { size: 2, label: "2 kg block" }, cost: 38, supplier: "lautan", par: L(30, 10, 8), start: L(22, 6.4, 7.2) },
  { code: "SF-202", name: "Squid, cleaned", category: "Seafood", storage: "Freezer", unit: "kg", pack: { size: 5, label: "5 kg block" }, cost: 22, supplier: "lautan", par: L(30, 10, 10), start: L(18.5, 8.2, 2.6) },
  { code: "SF-210", name: "Ikan kembung", category: "Seafood", storage: "Freezer", unit: "kg", pack: { size: 5, label: "5 kg block" }, cost: 14, supplier: "lautan", par: L(20, 8, 8), start: L(16, 5.5, 6) },
  { code: "PR-301", name: "Shallots", category: "Produce", storage: "Dry store", unit: "kg", pack: { size: 10, label: "10 kg sack" }, cost: 6.5, supplier: "kebun", par: L(40, 8, 8), start: L(14.2, 6.1, 5.4) },
  { code: "PR-302", name: "Garlic", category: "Produce", storage: "Dry store", unit: "kg", pack: { size: 10, label: "10 kg sack" }, cost: 9, supplier: "kebun", par: L(25, 5, 5), start: L(17.5, 3.9, 4.2) },
  { code: "PR-303", name: "Ginger", category: "Produce", storage: "Chiller", unit: "kg", pack: { size: 5, label: "5 kg bag" }, cost: 8, supplier: "kebun", par: L(15, 4, 4), start: L(11, 3.1, 2.8) },
  { code: "PR-304", name: "Lemongrass", category: "Produce", storage: "Chiller", unit: "kg", pack: { size: 2, label: "2 kg bundle" }, cost: 5, supplier: "kebun", par: L(12, 4, 4), start: L(9.5, 1.2, 3.1) },
  { code: "PR-305", name: "Red chilli", category: "Produce", storage: "Chiller", unit: "kg", pack: { size: 5, label: "5 kg box" }, cost: 12, supplier: "kebun", par: L(20, 6, 6), start: L(15.5, 4.6, 5.1) },
  { code: "PR-306", name: "Bird's eye chilli", category: "Produce", storage: "Chiller", unit: "kg", pack: { size: 1, label: "1 kg bag" }, cost: 18, supplier: "kebun", par: L(6, 2, 2), start: L(4.4, 1.6, 0.4) },
  { code: "PR-310", name: "Coconut milk, fresh", category: "Produce", storage: "Chiller", unit: "L", pack: { size: 5, label: "5 L tub" }, cost: 7.5, supplier: "kebun", par: L(60, 20, 20), start: L(38, 14.5, 9) },
  { code: "DG-401", name: "Rice, fragrant", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 10, label: "10 kg bag" }, cost: 3.6, supplier: "gudang", par: L(300, 100, 100), start: L(240, 72, 81) },
  { code: "DG-402", name: "Wheat flour", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 25, label: "25 kg sack" }, cost: 2.4, supplier: "gudang", par: L(50, 15, 15), start: L(41, 11.5, 12) },
  { code: "DG-403", name: "Cooking oil", category: "Dry goods", storage: "Dry store", unit: "L", pack: { size: 17, label: "17 L tin" }, cost: 6.2, supplier: "gudang", par: L(85, 34, 34), start: L(51, 22, 27.5) },
  { code: "DG-410", name: "Dried chilli", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 5, label: "5 kg bag" }, cost: 24, supplier: "gudang", par: L(20, 3, 3), start: L(6.8, 2.2, 2.6) },
  { code: "DG-411", name: "Belacan", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 1, label: "1 kg block" }, cost: 28, supplier: "gudang", par: L(6, 1, 1), start: L(3.6, 0.8, 0.9) },
  { code: "DG-412", name: "Gula Melaka", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 5, label: "5 kg carton" }, cost: 11, supplier: "gudang", par: L(12, 2, 2), start: L(9.2, 1.7, 1.8) },
  { code: "DG-413", name: "Tamarind paste", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 1, label: "1 kg block" }, cost: 9.5, supplier: "gudang", par: L(8, 2, 2), start: L(6.1, 1.4, 1.7) },
  { code: "DG-414", name: "Ikan bilis", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 3, label: "3 kg bag" }, cost: 42, supplier: "gudang", par: L(15, 5, 5), start: L(11.4, 3.8, 4.4) },
  { code: "DG-415", name: "Turmeric powder", category: "Dry goods", storage: "Dry store", unit: "kg", pack: { size: 1, label: "1 kg pack" }, cost: 16, supplier: "gudang", par: L(4, 1, 1), start: L(2.9, 0.7, 0.8) },
];

export const itemBy = (code: string) => items.find((i) => i.code === code)!;

/* The level that raises an alert, as most tools default it: a share of par,
   rounded the way a person would set it by hand. */
export function minOf(it: Item, l: Loc) {
  const v = it.par[l] * 0.35;
  if (it.unit === "pcs") return Math.round(v / 30) * 30;
  return v >= 10 ? Math.round(v) : Math.round(v * 2) / 2;
}

export type Status = "ok" | "under" | "low" | "out";

export function statusOf(it: Item, l: Loc, qty: number): Status {
  if (qty <= 0) return "out";
  if (qty < minOf(it, l)) return "low";
  if (qty < it.par[l]) return "under";
  return "ok";
}

/* Recipes, per portion, in stock units. A POS sale of n portions depletes
   n times these from the outlet that sold it. */
export const menu: { name: string; uses: [string, number][] }[] = [
  { name: "Nasi Lemak Ayam Goreng", uses: [["DG-401", 0.12], ["PR-310", 0.04], ["MP-101", 0.28], ["DG-414", 0.015], ["MP-120", 1], ["DG-403", 0.04]] },
  { name: "Nasi Goreng Kampung", uses: [["DG-401", 0.15], ["DG-414", 0.01], ["PR-306", 0.004], ["MP-120", 1], ["DG-403", 0.02], ["PR-301", 0.01], ["PR-302", 0.006]] },
  { name: "Ayam Masak Merah", uses: [["MP-102", 0.22], ["PR-305", 0.03], ["PR-301", 0.02], ["PR-302", 0.01], ["PR-303", 0.005], ["DG-403", 0.03]] },
  { name: "Sotong Goreng Tepung", uses: [["SF-202", 0.18], ["DG-402", 0.05], ["DG-403", 0.06]] },
  { name: "Udang Masak Lemak Cili Api", uses: [["SF-201", 0.16], ["PR-310", 0.08], ["DG-415", 0.003], ["PR-304", 0.01], ["PR-306", 0.006]] },
  { name: "Ikan Kembung Bakar", uses: [["SF-210", 0.25], ["DG-413", 0.01], ["PR-305", 0.01]] },
  { name: "Daging Rendang", uses: [["MP-110", 0.18], ["PR-310", 0.06], ["PR-304", 0.01], ["DG-410", 0.008], ["DG-412", 0.01]] },
];

/* Central kitchen production runs, per batch. */
export const batches: { name: string; uses: [string, number][] }[] = [
  { name: "Sambal tumis, 5 kg batch", uses: [["DG-410", 0.6], ["PR-301", 1], ["PR-302", 0.3], ["DG-411", 0.15], ["DG-412", 0.3], ["DG-413", 0.2], ["DG-403", 0.8]] },
  { name: "Rendang base, 8 kg batch", uses: [["MP-110", 6], ["PR-310", 3], ["PR-304", 0.3], ["PR-303", 0.3], ["DG-410", 0.3]] },
  { name: "Ayam goreng marinade, 20 kg chicken", uses: [["MP-101", 20], ["DG-415", 0.12], ["PR-303", 0.4], ["PR-302", 0.4], ["DG-402", 1.5]] },
  { name: "Nasi lemak rice, 12 kg batch", uses: [["DG-401", 8], ["PR-310", 2.5], ["PR-304", 0.15]] },
];

export type MoveType = "pos" | "production" | "received" | "transfer" | "waste" | "count" | "adjust";

export const moveTypes: Record<MoveType, string> = {
  pos: "POS depletion",
  production: "Production",
  received: "Received",
  transfer: "Transfer",
  waste: "Waste",
  count: "Stock count",
  adjust: "Adjustment",
};

/* `t` is seconds relative to when the page opened, so seeded history sits in
   the past without the render reading the clock. */
export type Movement = { id: number; t: number; type: MoveType; code: string; loc: Loc; qty: number; balance: number; ref: string };

export type PO = {
  id: string;
  supplier: Supplier;
  loc: Loc;
  lines: { code: string; qty: number; received?: number }[];
  status: "draft" | "sent" | "received";
  t: number;
};

export const seedPOs: PO[] = [
  { id: "PO-10482", supplier: "lautan", loc: "ck", lines: [{ code: "SF-202", qty: 15 }, { code: "SF-201", qty: 8 }], status: "sent", t: -5 * 3600 },
  { id: "PO-10479", supplier: "kebun", loc: "ck", lines: [{ code: "PR-301", qty: 20 }, { code: "PR-305", qty: 5 }, { code: "PR-310", qty: 20 }], status: "received", t: -28 * 3600 },
  { id: "PO-10475", supplier: "gudang", loc: "ss15", lines: [{ code: "DG-401", qty: 50 }, { code: "DG-403", qty: 17 }], status: "received", t: -3 * 86400 },
];

export type Transfer = { id: string; from: Loc; to: Loc; code: string; qty: number; t: number };

export const seedTransfers: Transfer[] = [
  { id: "TR-3318", from: "ck", to: "bgs", code: "MP-110", qty: 5, t: -6 * 3600 },
  { id: "TR-3317", from: "ck", to: "ss15", code: "PR-301", qty: 4, t: -30 * 3600 },
];

export const wasteReasons = ["Spoiled", "Past use-by date", "Over-prepped", "Dropped or contaminated", "Returned by customer"];

export type Waste = { id: number; t: number; code: string; loc: Loc; qty: number; reason: string };

export const seedWaste: Waste[] = [
  { id: 3, t: -3 * 3600, code: "PR-304", loc: "ss15", qty: 0.6, reason: "Spoiled" },
  { id: 2, t: -26 * 3600, code: "PR-310", loc: "bgs", qty: 2.5, reason: "Past use-by date" },
  { id: 1, t: -2 * 86400, code: "MP-101", loc: "ck", qty: 1.8, reason: "Over-prepped" },
];

export type Count = { id: string; loc: Loc; storage: Storage; t: number; items: number; variance: number };

export const seedCounts: Count[] = [
  { id: "SC-0912", loc: "ck", storage: "Freezer", t: -2 * 86400, items: 4, variance: -41.6 },
  { id: "SC-0911", loc: "ck", storage: "Dry store", t: -3 * 86400, items: 13, variance: -18.2 },
  { id: "SC-0910", loc: "ss15", storage: "Chiller", t: -4 * 86400, items: 10, variance: 6.4 },
];

/* When each storage area at each location was last counted. */
export const seedLastCount: Record<Loc, Record<Storage, number>> = {
  ck: { Chiller: -6 * 86400, Freezer: -2 * 86400, "Dry store": -3 * 86400 },
  ss15: { Chiller: -4 * 86400, Freezer: -9 * 86400, "Dry store": -9 * 86400 },
  bgs: { Chiller: -8 * 86400, Freezer: -8 * 86400, "Dry store": -12 * 86400 },
};

export function round(n: number, unit: Unit) {
  return unit === "pcs" ? Math.round(n) : Math.round(n * 100) / 100;
}

const group = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const rm = (n: number) => `${n < 0 ? "−" : ""}RM ${group(Math.abs(n).toFixed(2))}`;

/* Up to two decimals, trailing zeros dropped: 12.5 kg, 3 kg, 0.25 L. */
export function num(n: number, unit: Unit) {
  if (unit === "pcs") return group(Math.round(n).toString());
  const [whole, frac] = (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, "").split(".");
  return frac ? `${group(whole)}.${frac}` : group(whole);
}

export const qty = (n: number, unit: Unit) => `${num(n, unit)} ${unit}`;

export function ago(s: number) {
  if (s < 45) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}
