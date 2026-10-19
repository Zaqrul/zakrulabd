# Battle pilot selepas kajian MIDI

Catatan ini merekodkan pilot pertama. Skor pemain kini menggunakan
[pilot 2: Scarlet Resolve](ito-battle-pilot.md), selepas pengguna meminta
kepelbagaian instrumen dan groove ke arah battle theme Kenji Ito.

19 Oktober 2026. Skop pusingan ini ialah satu prototaip untuk
`alt:s2stage`, iaitu Battle Theme (Variation 1) dalam album Ascension.
Trek lain belum dianggap selesai atau diterima secara muzik.

## Rujukan yang benar-benar diperiksa

Tiga Standard MIDI File dimuat turun dan dibaca sebagai data nota, tempo,
program dan durasi. Ini transkripsi peminat dalam arkib VGMusic, bukan fail
projek rasmi Kenji Ito atau Nobuo Uematsu. Perbezaan antara transkripsi,
termasuk tempo dan artikulasi, tidak dianggap kesilapan karya asal.

| Fail | Kredit penjujukan pada arkib | Data fail |
| --- | --- | --- |
| [RS3 Battle 1](https://www.vgmusic.com/music/console/nintendo/snes/RomancingSaga3_bat1.mid) | Chiba | Format 1, PPQN 192, tempo 152 BPM |
| [RS3 Battle 1 (2)](https://www.vgmusic.com/music/console/nintendo/snes/rsg3battle.mid) | SinclairC | Format 1, PPQN 480, tempo 156 BPM |
| [FFVIII The Extreme](https://www.vgmusic.com/music/console/sony/ps1/ff8lb3.mid) | Mathew Valente | Format 1, PPQN 120, tempo 120 → 180 pada quarter-note beat 160 |

Kredit disemak pada [indeks SNES VGMusic](https://www.vgmusic.com/music/console/nintendo/snes/)
dan [indeks PlayStation VGMusic](https://www.vgmusic.com/music/console/sony/ps1/).
Fail asal, SHA-256, nota per track dan skrip pembacaan disimpan secara
setempat dalam `_local/music-research/`; ia tidak dimasukkan dalam aplikasi.

## Ukuran dan batas tafsiran

Dalam versi SinclairC, track berlabel Trumpet mempunyai median durasi
0.5 quarter-note beat. Antara durasi yang direkodkan ialah 108 nota pada
0.5 beat dan 80 pada 0.75 beat, bersama tempoh lain. Track Slap Bass pula
mempunyai 818 daripada 992 nota pada durasi 0.5 beat. Kedua-dua barisan
berfungsi pada kadar artikulasi yang berbeza.

Dalam versi Chiba, track utama juga menunjukkan campuran sela onset 0.25,
0.5, kira-kira 0.667, 0.75, 1 dan 1.5 beat; bass banyak bergerak pada sela
onset 0.5 beat. Versi ini mengandungi grace/retrigger yang sangat pendek,
maka median atau jumlah nota bukan ukuran yang boleh ditukar terus menjadi
arahan menggubah.

**Tafsiran untuk prototaip:** iringan boleh mengekalkan tenaga eighth tanpa
memaksa lead melakukan perkara sama. Dotted durations, pickup, nota panjang
dan perubahan kepadatan memberi frasa bentuk yang berbeza. Ini bukan dakwaan
bahawa bilangan tertentu ialah formula wajib muzik Ito.

Fail The Extreme mempunyai satu time-signature event 4/4 dan pertukaran
tempo pada beat 160. Track percussion mula pada beat 160, manakala beberapa
track lain masuk lebih awal atau lebih lewat. Ini menunjukkan susunan masuk
berperingkat dalam transkripsi tersebut. Pada tempo awal yang dinyatakan,
beat 160 bersamaan 80 saat. Ia bukan pengesahan timestamp atau semua meter
rakaman rasmi.

Nama track, pilihan GM program dan beberapa nota yang dipegang sangat lama
dalam fail FFVIII juga memerlukan berhati-hati. Kajian ini tidak cuba
menetapkan semua fungsi instrumen atau harmoni rasmi daripada metadata itu.

## Keputusan komposisi baharu

Skor lead baharu ditulis secara eksplisit dalam
`src/components/games/space2-battle-pilot.ts`. Tiada nota MIDI rujukan diimport
ke dalam skor, tiada sample rujukan dimasukkan, dan program tidak menghasilkan
melodi dengan memindahkan pitch daripada fail rujukan.

- A minor, quarter-note BPM 148, 24 bar 4/4; muzik satu pusingan 38.92 saat.
- Bar 1–8: motif E–A–G dengan serangan sebelum beat kedua, jawapan menurun,
  half cadence pada E7 dan penyelesaian ke Am pada bar 8.
- Bar 9–16: strings dengan tempoh lebih panjang; bass dan percussion
  dipermudah pada empat bar pertama. Warna Bb/Gm membina semula ketegangan
  menuju E7.
- Bar 17–24: hook kembali dengan destinasi frasa berbeza. E6 muncul sekali
  pada bar 21; lapisan synth hanya masuk untuk empat bar klimaks.
- Counter-line ditulis pada tempat tertentu, terutama selepas lead memberi
  ruang. Bar lain sengaja tidak mempunyai counter-line.
- Bass ialah nota mutlak bertulis, termasuk nada peralihan menuju kord
  berikutnya. Dram menggunakan backbeat stabil dengan kick/hat dan snare/hat
  yang boleh berbunyi serentak. Fill hanya mengambil beat terakhir.

Perbandingan dengan draf battle sebelumnya: purata serangan lead berkurang
daripada kira-kira 7.9 kepada 5.71 per bar; terdapat 8 bar dengan rehat
eksplisit, 5 bar dengan pegangan sekurang-kurangnya enam sel, dan semua 24
bar lead berbeza. Ukuran ini hanya menerangkan perubahan, bukan markah
kualiti muzik. Pengulangan dan nota pendek tetap sah apabila mempunyai fungsi.

## Perubahan minimum enjin

`Song.performance` menambah pilihan setiap bar untuk bass bertulis, kit
berlapis, aksen lead/dram dan note gate. Semua pilihan mempunyai fallback
kepada tingkah laku lama. Kit eksplisit mengawal fill sendiri supaya enjin
tidak menimpa groove pada seluruh bar terakhir.

Ujian menjalankan scheduler sebenar dan mengesahkan nota bass mutlak,
serangan drum serentak, nilai aksen, durasi gate serta fill hujung frasa.
Lagu asal terus menggunakan bass relatif akar dan kit asalnya.

## Bahan untuk pendengaran

Fail dalam `_local/audio/`:

- `ascension-battle-sketch.wav`: lead harp dan bass sahaja. Harp ialah bunyi
  plucked yang tersedia dalam enjin, bukan rakaman piano.
- `ascension-battle-rhythm.wav`: bass dan dram sahaja.
- `ascension-battle-full.wav`: band penuh dengan perubahan instrumen.
- `ascension-battle-pilot.mid`: komposisi baharu dalam SMF format 1,
  PPQN 480, tujuh track, termasuk metadata 4/4 dan tempo 148 BPM.

Pratonton WAV dirender melalui enjin Web Audio sebenar pada stereo 22.05 kHz,
PCM 16-bit, satu pusingan dengan ekor dua saat. Loudness fail pratonton
dilaraskan secara statik menuju RMS -18 dBFS dengan had peak 0.89 supaya
perbandingan rangka dan band tidak bergantung semata-mata pada kelantangan.
MIDI menggunakan instrumen GM dan tidak akan berbunyi tepat seperti enjin
Web Audio; ia mengekalkan nota, masa, perubahan program dan struktur bahagian.

Ketiga-tiga render mempunyai sampel terhingga dan tiada clipping sebelum
atau selepas pelarasan. 786 ujian, semakan TypeScript dan lint fail yang
diubah lulus. Kualiti muzik belum disahkan oleh pendengar; pratonton ini
disediakan untuk penilaian itu sebelum kerja diperluas kepada album lain.
