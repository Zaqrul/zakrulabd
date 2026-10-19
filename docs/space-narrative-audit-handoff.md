# Handoff Task: Audit & Pembaikan Lompang Cerita (Space 1 & Space 2)

> **Untuk:** Claude / Codex  
> **Tugasan:** Menyelaraskan kesinambungan lore, membaiki 5 lompang cerita (*plot holes*), dan memastikan kesinambungan naratif yang lancar dari Space 1 ke Space 2, Space 3, dan Space 4.  
> **Status Kod Semasa:** Semua ujian unit (124 ujian) lulus. Perubahan teks dialog **mesti mematuhi syarat ujian** dalam `tests/space2-copy.test.mjs`.

---

## Ringkasan 5 Lompang Cerita & Cadangan Penyelesaian

### 1. Ke Mana Perginya Seed Core & Mengapa Nova Masuk Atmosfera Bumi?
* **Fail:** `src/components/games/space2-story.ts` (Bab 9 / C9 `intro`)
* **Masalah:**
  - Di Space 1 Bab 8 (Outro), Seed Core berjaya diselamatkan daripada Kroll untuk Aurora yang hanya tinggal 3 hari bekalan udara, dan Nova diarahkan pulang ke Aurora (*"Come home, Nova"*).
  - Namun di Space 2 Bab 9 (Intro), Nova tiba-tiba membuat *Pacific re-entry* di Bumi, dan General Marsh menuduh Nova: *"You stole the Seed Core... You chose treason."*
  - Kenapa Nova bawa Core ke Bumi sedangkan Aurora sedang lemas?
* **Penyelesaian:**
  - Seed Core fizikal **telah pun selamat dihantar ke koloni Aurora** oleh konvoi sokongan dan bekalan udara Aurora telah stabil.
  - Namun, data sistem Seed Core mendedahkan bukti tandatangan pengeluar rahsia daripada *Earth Force (Meridian Citadel)*. Nova turun ke Bumi membawa **salinan arkib bukti pengkhianatan Marsh** untuk bersemuka dengan parlimen Bumi. Marsh memutarbelitkan berita di media Bumi dan memfitnah Nova sebagai pencuri.
* **Cadangan Kemas Kini `c9-intro`:**
  ```typescript
  // Baris Nova ke-3 dalam c9-intro:
  // Asal:
  ["nova", "I brought it home.", "Saya membawanya pulang."]
  // Cadangan Baharu:
  ["nova", "The Core is safe on Aurora. I brought down the proof of your deal, Marsh.", "Core sudah selamat di Aurora. Saya bawa turun bukti perjanjian sulit kamu, Marsh."]
  ```

---

### 2. Hubungan Rahsia Antara Kroll dan Earth Force (Marsh's Collusion)
* **Fail:** `src/components/games/space-story.ts` (Bab 8 / C8 `boss` atau `intro`)
* **Masalah:**
  - Di Space 1, Admiral Kroll dipaparkan seperti ketua lanun/pemberontak asing berautonomi.
  - Di Space 2, General Marsh tiba-tiba mengaku Armada Kroll ialah *"our Armada partners"* dan Rin menyebut *"that is where Earth Force armed the Armada"*. Tiada pembayang (*foreshadowing*) langsung dalam Space 1.
* **Penyelesaian:**
  - Masukkan sedikit pembayang pada dialog Kroll di Bab 8 Space 1. Kroll menyatakan bahawa armadanya dibiayai oleh pembesar di Bumi untuk memaksa Aurora menyerah diri.
* **Cadangan Kemas Kini `c8-boss` (Space 1):**
  ```typescript
  // Dalam space-story.ts:
  // Bahasa Inggeris (en):
  { who: "kroll", text: "A single fighter? Earth's credits built this fleet, pilot. Aurora dies today." }
  // Bahasa Melayu (ms):
  { who: "kroll", text: "Sebuah pejuang sahaja? Dana pembesar Bumi yang bina armada ini. Aurora musnah hari ini." }
  ```

---

### 3. Ke Mana Hilangnya Vex Sepanjang Space 2?
* **Fail:** `src/components/games/space2-story.ts` (Bab 10 `outro` atau Bab 13 `intro`)
* **Masalah:**
  - Di Space 1 Bab 7, Vex membelot daripada Kroll (*"I am done being his dog. Go. Finish this."*).
  - Namun sepanjang 8 bab Space 2, Vex lenyap tanpa sebarang khabar berita, dan tiba-tiba muncul semula di Space 3.
* **Penyelesaian:**
  - Masukkan satu baris ringkas di Space 2 yang menjelaskan status Vex: kapalnya (*Fang*) rosak teruk di Stesen Suria dan dia ditahan dalam kuarantin sempadan oleh Space Force sambil membina semula kapalnya daripada besi buruk.
* **Cadangan Kemas Kini (Contoh di `c10-outro`):**
  ```typescript
  // Menambah dialog santai ARC / Mika di c10-outro:
  ["arc", "Vex sent a signal from the orbital brig. He is rebuilding Fang with scrap and spite.", "Vex hantar isyarat dari sel kuarantin orbit. Dia sedang bina semula Fang dengan besi buruk dan dendam."]
  ```
  *(Nota: Pastikan `Halo` tetap menyertai bab ini mengikut peraturan ujian `tests/space2-copy.test.mjs`).*

---

### 4. Yurisdiksi ORB (Orbital Relief Brigade) & Kemunculan Halo
* **Fail:** `src/components/games/space2-story.ts` (`c9-intro`)
* **Masalah:**
  - Kenapa pasukan kemanusiaan ORB tidak membantu Aurora semasa Space 1 ketika koloni itu hampir mati kehabisan udara?
* **Penyelesaian:**
  - Perjelaskan bahawa ORB ialah badan kemanusiaan neutral yang terikat dengan **Perjanjian Orbit Bumi** (*Earth Treaty of Neutrality*). Mereka dilarang beroperasi di luar zon orbit Bumi (Verda / Kharn), tetapi mempunyai mandat menyelamat sebaik sahaja pertempuran memasuki atmosfera Bumi.
* **Cadangan Kemas Kini Baris Halo di `c9-intro`:**
  ```typescript
  ["halo", "Lyra Voss. Call me Halo. ORB's treaty restricts us to Earth skies, but Kite has your back here. We don't fire first.", "Lyra Voss. Panggil saya Halo. Perjanjian ORB hadkan kami di langit Bumi, tapi Kite lindungi anda di sini. Kita tak tembak dahulu."]
  ```

---

### 5. Asal-Usul Seed Core & Entiti Asing Space 1 Bab 4 (*Alien Hive Carrier*)
* **Fail:** Rujukan lore di `docs/space3-story-notes.md` dan `docs/space4-concept-notes.md`
* **Masalah:**
  - Di Space 1 Bab 4, ARC mengesan *"An alien hive carrier, harvesting the Core's energy."* Di dunia konflik politik manusia, kehadiran kapal makhluk asing ini kelihatan janggal jika Seed Core hanyalah mesin buatan manusia biasa.
* **Penyelesaian:**
  - Kekalkan baris ini! Ini adalah **foreshadowing utama** untuk Space 3 & Space 4: Seed Core sebenarnya teknologi purba peninggalan *Kaum Aethel*. Kroll menavigasi melepasi Nebula Violet kerana frekuensi Core menarik entiti asing, membuktikan Core beroperasi pada frekuensi makhluk asing.

---

## Peraturan Ujian Semasa Mengemas Kini Fail

Jika Claude atau Codex mengemas kini fail `space2-story.ts` atau `space-story.ts`:
1. **Padanan Dwibahasa:** Setiap baris `en` mesti mempunyai padanan `ms` yang sama urutan penuturnya (`deepEqual`).
2. **Kehadiran Halo:** Setiap bab dalam Space 2 (`c9` hingga `c16`) **mesti** mengandungi sekurang-kurangnya satu baris daripada `halo`.
3. **Had Panjang Teks:** Setiap baris dialog tidak boleh melebihi **180 aksara** (`line.text.length <= 180`).
4. **Jalankan Ujian:**
   ```bash
   node tests/space2-copy.test.mjs
   node tests/space2-chapters.test.mjs
   npx tsc --noEmit
   ```
