# Final Extremity II

Komposisi bonus baharu untuk Space 2. Analisis di bawah merujuk kepada skor
dan synthesiser tempatan, bukan analisis rakaman The Extreme.

## Asas dan arah gubahan

Final Extremity asal mempunyai 24 bar pada 170 BPM. Susunannya ialah chant,
riff dalam D minor, perkembangan gallop, pecahan 7/8, lead-in dua bar dengan
riser, kemudian modulasi ke F minor. Versi semasa menggunakan organ yang
digandakan dengan synth lead, strings, serta bell arpeggio dan penggandaan
oktav di bahagian tinggi.

Final Extremity II menggunakan bahan melodi baharu: gerakan jiran A–Bb–A
dan jawapan F–E–D. Hubungannya dengan lagu pertama datang daripada warna
organ, tenaga progressive-rock, pusat D minor dan bentuk finale berbahagian.
Melodi daripada lagu rujukan luar tidak ditranskripsikan.

Lagu baharu mempunyai 60 bar pada 176 BPM, sekitar 76.7 saat setiap pusingan.
Kompleksitinya datang daripada perkembangan motif, counter-line bertulis,
pertukaran meter serta perubahan tekstur. Tempo asas kekal; bahagian strings
terasa lebih lapang melalui nota panjang, bass dan dram yang dikurangkan.

| Bar | Bahagian | Meter dan susunan |
| --- | --- | --- |
| 1–4 | Invocation | 4/4, organ tanpa lapisan synth, toms, bell menjawab; Eb memberi warna gelap |
| 5–12 | Engine | 4/4, hook A–Bb–A, organ/synth, strings, bass drive bertukar gallop |
| 13–16 | Compression | 7/8 memendekkan hook dan jawapannya |
| 17–24 | Duel | 4/4 berselang 7/8; synth dan organ bertukar fragmen pada serangan berbeza |
| 25–32 | Lament | 6/8, strings dan harp, dram lembut; warna relatif F major |
| 33–36 | Ascent | 4/4; empat nota panjang menjadi aliran 16th, riser pada bar 35–36 |
| 37–44 | Reprise | 4/4; tema utama dengan jawapan bell dan kontur lebih tinggi |
| 45–48 | Pivot | Em–A–Bm–C#7 menyediakan F# minor |
| 49–56 | Fracture | 6/8 dan 7/8 berselang sebelum 4/4; hook dalam F# minor dan puncak G6 |
| 57–60 | Return | Turun kembali ke D minor, motif pembukaan di register rendah dan ruang sebelum loop |

## Pelaksanaan dan pengesahan

`space-final-extremity-ii.ts` mengandungi skor dan peta instrumen. Pemain
menambah lagu ini di hujung bonus album Space 2 sebagai Final Extremity II
dalam kedua-dua bahasa. Lagu pertama dikekalkan.

Enjin menyusun band setiap bar daripada band asas dan bahagian yang aktif.
Setiap bahagian bermula daripada band asas; `undefined` yang dinyatakan
secara eksplisit mematikan lapisan pilihan. Pelan ini dipakai pada setiap
langkah audio, termasuk apabila loop kembali ke pembukaan. Lagu tanpa peta
bahagian terus menggunakan band asal.

Ujian meliputi katalog, format meter, register melodi, counter-line, sambungan
melodi dan loop, serta scheduler sebenar dengan penghasilan bunyi diganti
spy untuk mengesahkan pertukaran instrumen. Render OfflineAudioContext
berasingan digunakan untuk memeriksa sampel audio dan paras clipping;
ia tidak menggantikan penilaian muzik melalui pendengaran.
