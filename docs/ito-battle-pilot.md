# Scarlet Resolve — battle pilot 2

Susulan maklum balas bahawa instrumen dan rentak prototaip pertama terlalu
serupa. Arah pengguna ialah battle theme yang lebih mendekati pendekatan
Kenji Ito, dengan identiti gubahan sendiri.

## Pilihan muzik

Ito membincangkan gabungan warna trumpet dengan muzik hard rock, keputusan
groove yang berbeza antara lagu, dan pertukaran solo antara pemain dalam
[temu bual Re:Birth II](https://www.4gamer.net/games/123/G012316/20120824033/).
Ini menjadi rujukan pendekatan susunan; melodinya tidak ditranskripsikan.

Versi baharu menggantikan skor pilot pertama: D minor, 154 BPM, 32 bar 4/4,
49.87 saat setiap pusingan. Motif baharu bermula A–D–E–F, menuju nota panjang
dan dijawab oleh frasa menurun. Reprise mengubah destinasi motif dan mencapai
satu puncak F6. G7 dalam bahagian kontras memberi warna Dorian sebelum
Edim–A7 mengembalikan ketegangan ke D minor.

| Masa kira-kira | Bar | Warna instrumen dan groove |
| --- | --- | --- |
| 0:00 | 1–2 | Riff gitar elektrik, picked bass dan toms |
| 0:03 | 3–10 | Trumpet solo, jawapan gitar, organ dan groove rock dengan open hat |
| 0:16 | 11–18 | Violin solo, piano, strings dan slap bass; rim groove bersinkopasi |
| 0:28 | 19–22 | Solo gitar dengan not pendek, organ menjawab dan dram half-time |
| 0:34 | 23–30 | Trumpet kembali, jawapan violin kemudian gitar, bass lebih aktif |
| 0:47 | 31–32 | Turnaround violin/piano; percussion memberi ruang sebelum riff berulang |

Half-time di sini ialah perubahan penempatan snare dan kepadatan iringan;
tempo scheduler kekal 154 BPM. Tiada pertukaran meter yang ditambah hanya
untuk memberi kesan kompleks.

## Bunyi baharu dalam enjin

Empat suara sintesis ditambah sebagai pilihan, tanpa menukar patch lama:

- Trumpet: serangan lebih cepat, filter terang kemudian mengecil, teras solo
  yang lebih fokus daripada brass ensemble lama.
- Violin: envelope bow pendek, dua oscillator berbeza kecil dan vibrato yang
  masuk selepas serangan, berbeza daripada pad strings perlahan.
- Gitar elektrik: pick envelope ke nonlinear waveshaper dan cabinet filter.
- Piano: beberapa partial yang mereput pada kadar berbeza, berbeza daripada
  harp lama yang mempunyai envelope tetap.

Bass picked dan slap mempunyai transient dan filter tersendiri, dengan
serangan perkusi pendek bagi slap. Open hat dan rim menjadi pilihan drum.
Ini suara sintesis asal enjin, bukan soundfont atau rakaman instrumen sebenar.

Skor menyatakan nota bass, kit, aksen dan gate bagi setiap bar. Bunyi bass
bertukar bersama bahagian. Kit half-time, rock dan fusion dipilih pada frasa
yang berbeza; bukan sekadar satu pola drum yang dimainkan lebih cepat.

## Pratonton dan semakan

Fail baharu dalam `_local/audio/`:

- `ascension-ito-full.wav`: band penuh.
- `ascension-ito-rhythm.wav`: bass dan dram untuk menilai perubahan groove.
- `ascension-ito.mid`: skor GM berbilang track; ia mengekalkan nota dan masa
  tetapi tidak menghasilkan semula patch sintesis Web Audio dengan tepat.

WAV ialah stereo PCM 16-bit, 22.05 kHz, satu pusingan dengan ekor dua saat.
Kelantangan pratonton dilaras secara statik menuju RMS -18 dBFS dengan had
peak 0.89. Kedua-dua render selesai tanpa sampel tidak terhingga atau
clipping. MIDI mengekalkan 4/4 dan 154 BPM serta pertukaran program/warna bass.

786 ujian, TypeScript dan lint fail yang diubah lulus. Ujian scheduler turut
mengesahkan trumpet, violin, piano dan gitar dipilih mengikut bahagian,
bass slap masuk pada bahagian fusion, serta rim dan half-time berbeza.
Penilaian muzik kekal melalui pendengaran pengguna.

Dalam pemain, versi ini menggantikan Ascension → Battle Theme (Variation 1).
Fail pratonton pilot pertama dikekalkan untuk perbandingan. Lagu lain dan
album permainan asal tidak menerima perubahan instrumen baharu secara automatik.
