# Space 2: Ascension

## Kemas kini: muzik boss baharu

Boss setiap chapter (1–8, termasuk fasa Atlas) kini ada skor Ascension yang
ditulis penuh dalam `space2-ascension-bosses.ts`, mengikut bentuk Ashen Crown:
bar pembukaan sekali, A dengan bass ostinato, B lirik dalam meter lain, rehat
nota panjang (dibuka dengan satu bar tema boss asal) dengan riser, fill dan
crash, gallop larian skala ke nota tertinggi, dan penutup kromatik. Gaya
diilhamkan oleh pertarungan akhir Final Fantasy 1–6 (ostinato, organ, meter
ganjil, suite berbilang bahagian); tiada nota disalin. Setiap boss mengekalkan
kunci tema asalnya. Fasa Judgement dan Last Stand memainkan skor Atlas, lebih
laju, dan Last Stand satu ton lebih tinggi.

## Kemas kini: DNA kecil

Skor Codex dikekalkan. Setiap trek hanya memetik satu bar melodi asalnya
(dengan kordnya) di awal satu bahagian: A kedua dalam bentuk panjang, B dalam
bentuk pendek, atau tengah cue. Bar itu dianjak satu oktaf jika perlu supaya
sambungannya kekal dalam satu oktaf. Pilot battle, Final Extremity II, dan cue
yang sangat pendek (victory, game over, fanfare) tidak memetik apa-apa.

Album Space 2 asal memaparkan dua lagu bonus: Ashen Crown dan Final Extremity.

**Status: draf muzik belum diterima.** Pengguna menolak rentak draf ini.
Kelulusan ujian di bawah hanya merujuk kepada integrasi teknikal. Diagnosis,
kajian sumber primer dan kaedah pembetulan direkodkan dalam
[penyelidikan Uematsu/Ito](research-uematsu-ito-composition.md).

Susulan: Battle Theme (Variation 1) kini mempunyai
[pilot 2 sepanjang 32 bar](ito-battle-pilot.md), dengan trumpet, violin,
gitar, piano dan groove yang berubah antara bahagian. Ia dibina selepas
[pilot pertama dan analisis MIDI](midi-battle-pilot.md). Trek lain masih draf terdahulu.

Album alternatif penuh: 36 trek dalam susunan katalog Space 2, termasuk 12
bonus. Arah akhir pengguna ialah menulis semula melodi sebagai versi Codex,
bukan sekadar menukar instrumen pada skor asal.

## Kandungan akhir

35 trek mempunyai skor lead gantian yang ditulis dalam
`src/components/games/space2-ascension.ts`: tema A, tema B atau cue pendek.
Final Extremity II ialah komposisi Codex baharu sepanjang 60 bar yang turut
dihasilkan dalam sesi ini; versi Ascension menggunakan suite itu dengan
susunan album. Album Space 2 asal dan pemilihan muzik dalam permainan kekal.

Tajuk dikekalkan supaya lagu boleh dibandingkan mengikut fungsi asalnya.
Melodi lead, frasa dan bentuk kebanyakan trek telah diganti. Pusat tonal dan
beberapa keluarga harmoni masih menghubungkan dunia muzik kedua-dua album.

| Kumpulan | Arah gubahan |
| --- | --- |
| Tajuk dan ending | Tema A/B baharu, brass atau strings utama, lengkung frasa lebih panjang |
| Tiga hangar | Melodi lebih lapang, warna seventh, harp, bell dan strings dengan jawapan sendiri |
| Dua battle theme | Hook baharu, tema kontras dalam meter berbeza, bass slap/gallop, reprise selepas bahagian lebih ringan |
| Tiga boss warning | Cue baharu yang berbeza: jiran semiton, organ pendek dan pendakian kromatik 7/8 |
| Boss 1–7 | Tema A/B baharu mengikut pusat tonal setiap boss; leitmotif jiran dan jawapan turun berubah antara pertarungan |
| Tiga fasa Atlas | Skor lead berasingan bagi setiap fasa, perubahan register dan counter-line tersendiri |
| Pause, victory, game over, fanfare | Melodi cue gantian dengan panjang dan pengakhiran yang sesuai; victory beralih ke hangar Ascension |
| Bonus | Tema gantian untuk bonus 1–11, serta suite Final Extremity II yang baharu |

## Bentuk dan orkestrasi

Tema A dan B ditulis sebagai nota bernama, secara deterministik. Trek battle
dan heroic menggunakan A–B–A–B; hangar menggunakan A–B, manakala cue pendek
mempunyai bentuk khusus. Boss mempunyai bar pembukaan yang dimainkan sekali.

Setiap trek mempunyai motif iringan yang ditulis dalam darjah skala relatif
kepada kord. Motif ini dipadankan dengan panjang bar 4/4, 7/8 atau 6/8 dan
ditukar kontur pada frasa jawapan. Ini ialah kaedah penyusunan counter-line;
melodi lead gantian ditulis secara eksplisit, bukan dijana daripada skor lama.

Band berubah mengikut bahagian: lapisan berat dikurangkan pada bahagian
kontras dan dikembalikan pada reprise. Lagu tenang kekal tenang. Meter 7/8
kini mempunyai pola dram lembut tersendiri supaya peralihan dinamik tidak
menghilangkan percussion secara tidak sengaja.

## Pengesahan

- Katalog mempunyai pasangan satu-ke-satu bagi 36 trek, dengan engine ID
  berasingan dan 12 bonus di hujung album.
- Ujian mengesahkan 35 skor lead diganti, skor asal tidak dimutasi, nota dan
  counter-line sah, sambungan melodi tidak melebihi satu oktav, serta marker
  orkestrasi berada dalam julat.
- Scheduler sebenar diuji merentas keseluruhan setiap trek hingga loop,
  pengakhiran sekali main atau peralihan victory ke hangar alternatif.
- 784 ujian repositori dan semakan TypeScript lulus.
- Sampel pembukaan dan bahagian lewat setiap trek dirender dengan
  OfflineAudioContext stereo; semua 36 lulus pemeriksaan sampel terhingga,
  tenaga audio dan clipping pada paras ujian. Ini bukan render penuh setiap
  lagu dan bukan penilaian subjektif kualiti muzik.
- Final Extremity II dirender penuh dua pusingan; WAV satu pusingan tersedia
  dalam `_local/audio/final-extremity-ii.wav` (sekitar 76.7 saat).

Browser QA menggunakan komponen pemain sebenar dalam harness setempat;
ia tidak memerlukan atau mengubah akaun pengguna.
