function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-1.5 border-b border-border bg-bg px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-red-400" />
      <span className="h-2 w-2 rounded-full bg-amber-400" />
      <span className="h-2 w-2 rounded-full bg-teal-400" />
      <span className="ml-2 max-w-[220px] flex-1 truncate rounded border border-border bg-white px-2 py-0.5 text-[10px] text-muted">
        {url}
      </span>
    </div>
  );
}

function Sidebar({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="hidden w-32 flex-shrink-0 flex-col gap-1 border-r border-border bg-navy p-3 sm:flex">
      <span className="mb-2 text-[11px] font-bold text-white">zakrulabd</span>
      {items.map((i) => (
        <span
          key={i}
          className={`rounded px-2 py-1 text-[10px] ${
            i === active ? "bg-white/15 font-semibold text-white" : "text-slate-400"
          }`}
        >
          {i}
        </span>
      ))}
    </div>
  );
}

const products = [
  { name: "Batik Shirt", price: "RM 89" },
  { name: "Linen Tote", price: "RM 45" },
  { name: "Kopi Beans", price: "RM 32" },
  { name: "Ceramic Mug", price: "RM 28" },
];

export function StoreDemo() {
  return (
    <div className="flex h-full flex-col bg-white">
      <BrowserChrome url="yourstore.com/shop" />
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-bold text-navy">STORE</span>
          <span className="hidden text-[10px] text-muted sm:inline">Shop</span>
          <span className="hidden text-[10px] text-muted sm:inline">About</span>
          <span className="hidden text-[10px] text-muted sm:inline">Contact</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1">
          <span className="text-[10px] font-semibold text-white">Cart</span>
          <span className="flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-navy">
            2
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
        <span className="text-[11px] font-bold text-navy">All Products</span>
        <div className="grid flex-1 grid-cols-4 gap-3">
          {products.map((p) => (
            <div key={p.name} className="flex flex-col overflow-hidden rounded-md border border-border">
              <div className="flex-1 bg-gradient-to-br from-primary-50 to-teal-50" />
              <div className="px-2 py-1.5">
                <div className="truncate text-[10px] font-semibold text-ink">{p.name}</div>
                <div className="text-[10px] font-bold text-amber-600">{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const stock = [
  { sku: "SKU-1042", name: "Batik Shirt", qty: 128, pct: 85, ok: true },
  { sku: "SKU-2088", name: "Linen Tote", qty: 12, pct: 15, ok: false },
  { sku: "SKU-3120", name: "Kopi Beans", qty: 64, pct: 55, ok: true },
  { sku: "SKU-4077", name: "Ceramic Mug", qty: 91, pct: 70, ok: true },
];

export function InventoryDemo() {
  return (
    <div className="flex h-full bg-white">
      <Sidebar items={["Dashboard", "Stock", "Orders", "Suppliers"]} active="Stock" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex gap-3 border-b border-border p-4">
          <div className="flex-1 rounded-lg bg-bg px-3 py-2">
            <div className="text-[9px] text-muted">Total SKUs</div>
            <div className="text-base font-bold text-navy">204</div>
          </div>
          <div className="flex-1 rounded-lg bg-amber-50 px-3 py-2">
            <div className="text-[9px] text-amber-700">Low Stock</div>
            <div className="text-base font-bold text-amber-600">7</div>
          </div>
          <div className="flex-1 rounded-lg bg-teal-50 px-3 py-2">
            <div className="text-[9px] text-teal-700">In Stock</div>
            <div className="text-base font-bold text-teal-600">197</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          {stock.map((s) => (
            <div key={s.sku} className="flex items-center gap-3">
              <span className="w-20 flex-shrink-0 font-mono text-[9px] text-muted">{s.sku}</span>
              <span className="w-24 flex-shrink-0 truncate text-[10px] font-semibold text-ink">{s.name}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
                <div
                  className={`h-full rounded-full ${s.ok ? "bg-teal-500" : "animate-pulse bg-amber-500"}`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
              <span className={`w-14 flex-shrink-0 text-right text-[10px] font-bold ${s.ok ? "text-teal-600" : "text-amber-600"}`}>
                {s.qty} pcs
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const slots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM", "5:00 PM"];

export function BookingDemo() {
  return (
    <div className="flex h-full bg-white">
      <Sidebar items={["Calendar", "Bookings", "Customers", "Settings"]} active="Calendar" />
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <span className="mb-2 text-[11px] font-bold text-navy">March 2026</span>
        <div className="mb-3 grid grid-cols-7 gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="text-center text-[9px] text-muted">
              {d}
            </div>
          ))}
          {[10, 11, 12, 13, 14, 15, 16].map((n) => (
            <div
              key={n}
              className={`flex h-6 items-center justify-center rounded text-[10px] font-semibold ${
                n === 13 ? "bg-navy text-white" : "bg-bg text-ink"
              }`}
            >
              {n}
            </div>
          ))}
        </div>
        <span className="mb-1.5 text-[9px] font-bold tracking-wide text-muted">AVAILABLE SLOTS — MAR 13</span>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((s, i) => (
            <div
              key={s}
              className={`rounded border px-2 py-1.5 text-center text-[10px] font-semibold ${
                i === 3
                  ? "animate-pulse border-teal-600 bg-teal-50 text-teal-700"
                  : i === 1
                    ? "border-border bg-bg text-slate-400 line-through"
                    : "border-border bg-white text-ink"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TawkChatDemo() {
  return (
    <div className="flex h-full flex-col bg-white">
      <BrowserChrome url="yourbusiness.com" />
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="h-3 w-2/5 rounded-full bg-navy/80" />
          <div className="h-3 w-1/3 rounded-full bg-navy/80" />
          <div className="mt-1 h-2 w-3/5 rounded-full bg-border" />
          <div className="h-2 w-1/2 rounded-full bg-border" />
          <div className="mt-2 h-6 w-24 rounded bg-amber-500" />
        </div>

        <div className="absolute bottom-3 right-3 flex max-h-[calc(100%-1.5rem)] w-52 flex-col overflow-hidden rounded-lg border border-border bg-white shadow-xl">
          <div className="flex flex-shrink-0 items-center gap-2 bg-primary-600 px-2.5 py-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] font-bold text-white">
              Z
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold leading-tight text-white">Support</span>
              <span className="flex items-center gap-1 text-[8px] text-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Online now
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-1.5 p-2.5">
            <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-slate-100 px-2 py-1.5 text-[9px] leading-snug text-ink">
              Hi! How can I help you today?
            </div>
            <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary-600 px-2 py-1.5 text-[9px] leading-snug text-white">
              Do you deliver to Penang?
            </div>
            <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-slate-100 px-2 py-1.5 text-[9px] leading-snug text-ink">
              Yes! Free shipping over RM150.
            </div>
            <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary-600 px-2 py-1.5 text-[9px] leading-snug text-white">
              How long is delivery?
            </div>
            <div className="flex w-fit items-center gap-1 rounded-xl rounded-bl-sm bg-slate-100 px-2 py-1.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted" />
            </div>
          </div>
          <div className="flex-shrink-0 border-t border-border px-2.5 py-1.5">
            <div className="rounded-full bg-bg px-2 py-1 text-[8px] text-muted">Type your message…</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const shopifyProducts = [
  { name: "Batik Shirt", stock: "128 in stock", price: "RM 89", synced: true },
  { name: "Linen Tote", stock: "12 in stock", price: "RM 45", synced: true },
  { name: "Kopi Beans", stock: "64 in stock", price: "RM 32", synced: true },
];

export function ShopifySyncDemo() {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-shrink-0 items-center gap-3 bg-navy px-3 py-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#95BF47] text-[10px] font-bold text-white">
          S
        </span>
        <div className="flex-1 rounded bg-white/10 px-2 py-1 text-[9px] text-slate-400">Search products…</div>
        <span className="hidden text-[9px] text-slate-300 sm:inline">yourstore</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-28 flex-shrink-0 flex-col gap-0.5 border-r border-border bg-bg p-2 sm:flex">
          {["Home", "Orders", "Products", "Customers", "Analytics"].map((i) => (
            <span
              key={i}
              className={`rounded px-2 py-1 text-[10px] ${
                i === "Products" ? "bg-white font-semibold text-navy shadow-sm" : "text-body"
              }`}
            >
              {i}
            </span>
          ))}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-navy">Products</span>
            <span className="flex items-center gap-1 rounded-full bg-[#95BF47]/15 px-2 py-0.5 text-[9px] font-semibold text-[#5E8E3E]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#95BF47] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#95BF47]" />
              </span>
              Syncing
            </span>
          </div>

          <div className="flex items-center gap-2 border-b border-border pb-1 text-[9px] font-semibold text-muted">
            <span className="flex-1">Product</span>
            <span className="w-20 text-right">Inventory</span>
            <span className="w-14 text-right">Price</span>
            <span className="w-12 text-right">Status</span>
          </div>

          {shopifyProducts.map((p) => (
            <div key={p.name} className="flex items-center gap-2 border-b border-border py-1.5">
              <div className="flex flex-1 items-center gap-1.5">
                <span className="h-5 w-5 flex-shrink-0 rounded bg-gradient-to-br from-primary-50 to-teal-50" />
                <span className="truncate text-[10px] font-medium text-ink">{p.name}</span>
              </div>
              <span className="w-20 text-right text-[9px] text-body">{p.stock}</span>
              <span className="w-14 text-right text-[9px] font-semibold text-navy">{p.price}</span>
              <span className="w-12 text-right text-[9px] font-medium text-[#5E8E3E]">Synced</span>
            </div>
          ))}

          <span className="mt-auto pt-2 text-[9px] text-muted">Last sync from your website: just now</span>
        </div>
      </div>
    </div>
  );
}

export function PaymentDemo() {
  return (
    <div className="flex h-full flex-col bg-white">
      <BrowserChrome url="yourstore.com/checkout" />
      <div className="flex flex-1 flex-col overflow-hidden px-5 py-3">
        <div className="mb-2 text-center text-[11px] font-extrabold tracking-tight text-navy">YOUR STORE</div>

        <div className="mb-3 flex items-center justify-center gap-1.5">
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-teal-600 text-[8px] font-bold text-teal-600">
              ✓
            </span>
            <span className="text-[7px] text-muted">Shipping</span>
          </div>
          <span className="mb-2.5 h-px w-8 bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary-600 bg-primary-600 text-[8px] font-bold text-white">
              2
            </span>
            <span className="text-[7px] font-semibold text-primary-600">Review &amp; Pay</span>
          </div>
          <span className="mb-2.5 h-px w-8 bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[8px] font-bold text-muted">
              3
            </span>
            <span className="text-[7px] text-muted">Complete</span>
          </div>
        </div>

        <div className="flex flex-1 gap-3 overflow-hidden">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-navy">Payment details</span>
              <span className="flex items-center gap-1 text-[7px] font-semibold text-teal-600">
                🔒 Secure checkout
              </span>
            </div>

            <div className="flex items-center justify-between rounded border border-border px-2 py-1.5">
              <span className="flex items-center gap-1.5">
                <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full border-[3px] border-navy" />
                <span className="text-[9px] font-semibold text-ink">Pay by card</span>
              </span>
              <span className="flex gap-1">
                <span className="h-3 w-5 rounded-sm bg-amber-500/80" />
                <span className="h-3 w-5 rounded-sm bg-primary-600/80" />
                <span className="h-3 w-5 rounded-sm bg-slate-300" />
              </span>
            </div>

            <div className="rounded border border-border px-2 py-1.5 text-[9px] text-muted">Card number</div>
            <div className="rounded border border-border px-2 py-1.5 text-[9px] text-muted">Name on card</div>
            <div className="flex gap-1.5">
              <div className="flex-1 rounded border border-border px-2 py-1.5 text-[9px] text-muted">
                Expiry date <span className="text-slate-300">(MM/YY)</span>
              </div>
              <div className="w-24 rounded border border-border px-2 py-1.5 text-[9px] text-muted">Security code</div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-[8px] text-muted">‹ Back to delivery details</span>
              <span className="animate-pulse rounded bg-teal-600 px-4 py-1.5 text-[10px] font-bold text-white">
                Pay now ›
              </span>
            </div>
          </div>

          <div className="flex w-40 flex-shrink-0 flex-col gap-1.5 rounded border border-border p-2.5">
            <span className="text-[9px] font-bold text-navy">Order Summary</span>
            <div className="flex gap-1.5 border-b border-border pb-1.5">
              <span className="h-6 w-6 flex-shrink-0 rounded bg-gradient-to-br from-primary-50 to-teal-50" />
              <span className="flex-1 text-[8px] leading-tight text-body">Batik Shirt ×1</span>
              <span className="text-[8px] font-semibold text-navy">RM 89</span>
            </div>
            <div className="flex justify-between text-[8px] text-body">
              <span>Subtotal</span>
              <span>RM 145</span>
            </div>
            <div className="flex justify-between text-[8px] text-body">
              <span>Delivery</span>
              <span>RM 8</span>
            </div>
            <div className="flex justify-between text-[8px] text-body">
              <span>SST (6%)</span>
              <span>RM 9</span>
            </div>
            <div className="mt-auto flex justify-between border-t border-border pt-1.5">
              <span className="text-[9px] font-semibold text-muted">Total</span>
              <span className="text-[11px] font-bold text-navy">RM 249</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
