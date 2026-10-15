import { content } from "@/lib/content";

const base = content.pricing.compare;
const groups = [
  { label: "Laman web untuk dibaca", rows: [
    ["Jenama peribadi atau portfolio", "Pekerja bebas, perunding, kreatif atau laman resume"],
    ["Halaman kempen atau pelancaran produk", "Satu tawaran dengan satu tindakan utama"],
    ["Profil perniagaan kecil", "Siapa anda, apa yang dijual dan cara untuk menghubungi anda"],
    ["Laman web syarikat yang lengkap", "Utama, Tentang Kami, Perkhidmatan, Projek dan Hubungi"],
    ["Katalog tanpa pembayaran dalam talian", "Pelanggan melihat produk dan membuat pertanyaan; harga atas permintaan"],
    ["Blog atau berita yang boleh dikemas kini sendiri", "Artikel, kategori dan halaman penulis"],
    ["Landing page untuk iklan berbayar", "Dijejak, diuji dan disambungkan ke akaun iklan anda"],
  ] },
  { label: "Sistem untuk digunakan", rows: [
    ["Kedai dalam talian dengan troli dan pembayaran", "Produk, pesanan, FPX, kad dan e-dompet"],
    ["Sistem tempahan atau janji temu", "Kekosongan terkini, pengesahan dan peringatan"],
    ["Papan pemuka inventori atau stok", "Stok masa nyata, amaran stok rendah dan pelbagai lokasi"],
    ["Portal log masuk pelanggan atau ahli", "Akaun, peranan pengguna, dokumen dan rekod peribadi"],
    ["Integrasi Shopify, CRM atau ERP", "Penyegerakan dua hala tanpa perlu memasukkan data berulang kali"],
    ["Aliran kerja sebut harga atau kelulusan", "Borang yang mengagihkan, memaklumkan dan merekodkan kelulusan"],
  ] },
  { label: "Perkara berkaitan laman web", rows: [
    ["Hosting", "Vercel, Railway, ServerFreak, Exabyte atau penyedia lain"],
    ["Domain sendiri", "perniagaananda.com, didaftarkan atas nama anda"],
    ["Analitik dan penjejakan penukaran", "GA4, events dan matlamat yang mudah difahami"],
    ["Live chat pada laman web", "Pemasangan widget, agihan pertanyaan dan automasi"],
    ["SEO teknikal dan data berstruktur", "SEO on-page asas, schema dan pengindeksan"],
    ["Membaiki laman web sedia ada", "Rosak, perlahan, digodam atau ditinggalkan oleh pembangun lama"],
  ] },
];

export const compareMs = {
  ...base,
  footnote: "Belum pasti pakej mana yang sesuai?", link: "Bandingkan skop setiap pakej",
  titleA: "Apa yang Dibina dalam ", titleHl: "Setiap Pakej",
  sub: "Setiap pakej merangkumi semua yang ada dalam pakej sebelumnya. Laman Permulaan berharga tetap; Laman Profesional dan Sistem Web Lanjutan diberi sebut harga mengikut skop.",
  badge: "PERBANDINGAN SKOP", back: "Kembali ke Pakej",
  closeTitle: "Sudah membuat perbandingan dan bersedia untuk bermula?",
  closeBody: "Ceritakan apa yang anda rancang, atau pilih pakej yang paling hampir dengan keperluan anda. Jika ada soalan khusus tentang projek anda, saya akan berikan jawapan yang jelas dan jujur.",
  columns: ["Permulaan", "Profesional", "Lanjutan"],
  legend: [{ mark: "full", label: "Termasuk" }, { mark: "part", label: "Versi asas; kerja yang lebih mendalam termasuk dalam pakej seterusnya" }, { mark: "none", label: "Tidak termasuk" }],
  rowHeading: "Apa yang ingin dibina", searchPlaceholder: "Cari keperluan anda", searchEmpty: "Tiada hasil ditemui. Cuba kata kunci yang lebih ringkas, atau hubungi saya terus.", ctaLabel: "Tanya",
  groups: groups.map((group, gi) => ({ label: group.label, rows: group.rows.map(([what, note], ri) => ({ what, note, marks: base.groups[gi].rows[ri].marks })) })),
  dividesTitle: "Dua perbezaan utama antara pakej",
  divides: [
    { step: "Permulaan → Profesional", claim: "Satu halaman yang memperkenalkan anda, berbanding laman web yang membantu jualan dan boleh diukur prestasinya", points: ["Beberapa halaman dengan kandungan yang dirancang, bukan satu halaman panjang", "Borang pertanyaan yang dihantar terus ke e-mel, bukan sekadar butang WhatsApp", "GA4 dan penjejakan penukaran untuk melihat apa yang berkesan", "Metadata, sitemap dan Profil Perniagaan Google supaya mudah ditemui", "Sesi serahan supaya anda boleh mengemas kini laman sendiri"] },
    { step: "Profesional → Lanjutan", claim: "Laman web untuk dibaca pelanggan, berbanding sistem yang digunakan untuk log masuk dan membuat transaksi", points: ["Pangkalan data untuk pesanan, stok, tempahan atau akaun pengguna", "Sistem pembayaran dan sistem lain disambungkan dengan betul", "Agihan pertanyaan dan automasi menggantikan susulan secara manual", "Data berstruktur dan Core Web Vitals disemak bagi setiap halaman", "Pengukuhan keselamatan dan sokongan selepas pelancaran"] },
  ],
};
