import { content } from "@/lib/content";

const base = content.pricing.compare;
const groups = [
  { label: "Laman untuk dibaca", rows: [
    ["Jenama peribadi atau portfolio", "Pekerja bebas, perunding, kreatif atau laman CV"],
    ["Halaman kempen atau pelancaran", "Satu tawaran dengan satu tindakan utama"],
    ["Profil perniagaan kecil", "Siapa anda, apa yang dijual dan cara menghubungi"],
    ["Laman syarikat lengkap", "Utama, Tentang, Khidmat, Projek dan Hubungi"],
    ["Katalog tanpa pembayaran terus", "Lihat produk dan bertanya; harga atas permintaan"],
    ["Blog atau berita yang boleh disunting sendiri", "Catatan, kategori dan halaman penulis"],
    ["Halaman pendaratan untuk iklan berbayar", "Dijejak, diuji dan disambungkan ke akaun iklan"],
  ] },
  { label: "Sistem untuk digunakan", rows: [
    ["Kedai dalam talian dengan troli dan pembayaran", "Produk, pesanan, FPX, kad dan e-dompet"],
    ["Sistem tempahan atau janji temu", "Ketersediaan semasa, pengesahan dan peringatan"],
    ["Papan pemuka inventori atau stok", "Stok masa nyata, amaran dan pelbagai lokasi"],
    ["Portal log masuk pelanggan atau ahli", "Akaun, peranan, dokumen dan rekod peribadi"],
    ["Integrasi Shopify, CRM atau ERP", "Penyegerakan dua hala tanpa kemasukan data berulang"],
    ["Aliran sebut harga atau kelulusan", "Borang yang mengagihkan, memaklumkan dan merekod kelulusan"],
  ] },
  { label: "Perkara di sekeliling laman", rows: [
    ["Domain, pengehosan dan pelancaran", "Vercel, Railway, Hostinger atau penyedia tempatan"],
    ["Analitik dan penjejakan penukaran", "GA4, peristiwa dan matlamat yang mudah difahami"],
    ["Sembang langsung pada laman", "Pemasangan widget, pengagihan dan automasi"],
    ["SEO teknikal dan data berstruktur", "Asas pada halaman, skema dan pengindeksan"],
    ["Pembaikan laman sedia ada", "Rosak, lambat, diceroboh atau ditinggalkan pembangun lama"],
  ] },
];

export const compareMs = {
  ...base,
  footnote: "Belum pasti pakej yang sesuai?", link: "Bandingkan skop setiap pakej",
  titleA: "Perkara yang Setiap Pakej ", titleHl: "Bina",
  sub: "Setiap pakej merangkumi perkara dalam pakej sebelumnya. Ini perbandingan skop; setiap projek tetap diberi sebut harga tersendiri.",
  badge: "PERBANDINGAN SKOP", back: "Kembali ke Pakej",
  closeTitle: "Sudah bandingkan semuanya dan bersedia bermula?",
  closeBody: "Ceritakan rancangan anda atau pilih pakej yang paling hampir. Tanya saya tentang keperluan khusus dan saya akan berikan jawapan yang terus terang.",
  columns: ["Permulaan", "Profesional", "Lanjutan"],
  legend: [{ mark: "full", label: "Termasuk" }, { mark: "part", label: "Versi asas; kerja lebih mendalam dalam pakej seterusnya" }, { mark: "none", label: "Tidak termasuk" }],
  rowHeading: "Perkara yang ingin dibina", searchPlaceholder: "Cari keperluan anda", searchEmpty: "Tiada padanan. Cuba kata yang lebih pendek atau hubungi saya.", ctaLabel: "Tanya",
  groups: groups.map((group, gi) => ({ label: group.label, rows: group.rows.map(([what, note], ri) => ({ what, note, marks: base.groups[gi].rows[ri].marks })) })),
  dividesTitle: "Dua perbezaan utama antara pakej",
  divides: [
    { step: "Permulaan → Profesional", claim: "Satu halaman yang memperkenalkan anda berbanding laman yang menyokong jualan dan boleh diukur", points: ["Beberapa halaman dengan kandungan terancang, bukan satu halaman panjang", "Borang pertanyaan yang sampai ke peti masuk, bukan butang WhatsApp sahaja", "GA4 dan penjejakan penukaran untuk melihat apa yang berkesan", "Metadata, peta laman dan Profil Perniagaan Google untuk membantu penemuan", "Sesi serahan supaya anda boleh menyunting sendiri"] },
    { step: "Profesional → Lanjutan", claim: "Laman yang dibaca pelanggan berbanding sistem yang digunakan untuk log masuk dan bertransaksi", points: ["Pangkalan data untuk pesanan, stok, tempahan atau akaun", "Pembayaran dan sistem lain disambungkan dengan betul", "Pengagihan pertanyaan dan automasi menggantikan susulan manual", "Data berstruktur dan Core Web Vitals diperiksa mengikut halaman", "Pengukuhan keselamatan dan sokongan selepas pelancaran"] },
  ],
};
