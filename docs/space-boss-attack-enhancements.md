# Space & Space 2: Boss Attack Revamp — Pure Arcade Prediction & Evasion

Dokumen reka bentuk untuk menangani masalah ruang mati (*dead zones / camping pockets*) dalam pertempuran bos Space 1 dan Space 2. Spesifikasi ini menggariskan corak serangan tanpa bantuan visual berlebihan (*no hand-holding UI*) — **membuang sebarang penanda amaran tiruan, zon selamat bertanda, dan penguncian sasaran prediktif**. Pemain perlu meramal ancaman melalui isyarat fizikal bos (*mechanical tells*) dan mengelak peluru secara refleks dan kemahiran tulen.

---

## 1. Falsafah Reka Bentuk: Ramal & Elak (Pure Arcade Shmup)

Dalam versi asal, wujud kecenderungan paparan UI yang terlalu memanjakan pemain:
- **Penanda Amaran Grafik (*Warning Reticles / Dashed Lines*):** Garisan putus-putus atau kotak amaran yang memberitahu tempat peluru akan jatuh.
- **Zon Selamat Bertanda (*Declared Safe Corridors*):** Panah atau ruang krim yang menunjukkan tempat pemain perlu berdiri.
- **Penguncian Prediktif Kaku (*Target Lock Reticles*):** Sasaran merah yang mengunci kedudukan pemain dan membeku 20 frame sebelum menembak, membolehkan pemain hanya melangkah setapak ke tepi untuk selamat.

### Prinsip Baharu:
1. **TIADA Penanda UI Tiruan (*No HUD Warning Guides*):** Tiada garisan putus-putus, tiada kotak amaran telegraf, dan tiada penunjuk zon selamat bertanda pada skrin.
2. **TIADA Penguncian Sasaran Statik:** Bos tidak lagi mengunci sasaran dengan tanda merah dan menunggu; bos melepaskan tembakan terus mengikut trajektori, sudut sebaran padat, dan salvo rawak.
3. **Isyarat Melalui Animasi Mesin Fizikal (*Physical Machinery Tells*):**
   - Muncung laras meriam terangkat, berputar, atau tersentak (*barrel elevation / recoil*).
   - Teras enjin atau bateri senjata menyala kilat / berasap (*charge glow / thruster pulse*).
   - Bahagian badan mengembang, sepit membuka luas, atau gear hidraulik bergegar.
4. **Pemain Menilai Celah Sendiri (*Autonomous Gap Reading*):** Celah selamat antara peluru wujud secara geometri dan fizik kelajuan, tetapi pemain bertanggungjawab sepenuhnya untuk melihat, menjangka (*predict*), dan menyusup melaluinya.

---

## 2. Parameter Reka Bentuk Enjin

1. **Resolusi Logik:** 384×216 unit kanvas.
2. **Keterbacaan Projektil:**
   - Semua peluru musuh mengekalkan garisan dakwat 0.8px `#171717` dengan teras cerah `#fb7185` (coral) atau `#f87171` supaya sentiasa kontras pada semua latar belakang (awan, salji, lautan, ruang angkasa).
3. **Tiada Penanda Selamat Berlabel:**
   - Lebar celah fizikal peluru dijamin sekurang-kurangnya 18–26 unit kanvas (cukup untuk saiz kapal Nova 14–18px), tetapi **tanpa sebarang grafik anak panah atau kotak selamat**.
4. **Rawak Deterministik (`rand(s)`):**
   - Semua variasi trajektori, pemilihan serangan, dan kelajuan menggunakan PRNG berasaskan `seed` enjin untuk menjamin ketepatan ujian automatik dan ulangan (*replays*).

---

## 3. Empat Arketip Serangan Baharu (Tanpa Amaran UI)

### Arketip A: High-Velocity Sweeping Laser (Rasuk Sapuan Berterusan)
- **Konsep:** Bos memutarkan laras meriam utama dan melepaskan rasuk laser padat yang menyapu secara pantas merentasi paksi Y (cth. dari atas ke bawah).
- **Isyarat Fizikal:** Muncung meriam menyala kilat terang selama 20 frame sebelum laras mula bergerak.
- **Respons Pemain:** Tiada garisan panduan atau laluan selamat. Pemain mesti membaca pergerakan laras dan segera melompat/menyelam melepasi arah bukaan sebelum rasuk memotong arena.

### Arketip B: Blind Rear Mortar & Flak Scatter (Hujan Mortar & Serpihan Belakang)
- **Konsep:** Bos melancarkan kanister bom melengkung melepasi ruang udara tengah terus ke tebing kiri (belakang posisi Nova). Kanister meletup menjadi serakan serpihan flak ke hadapan.
- **Isyarat Fizikal:** Ekzos belakang bos menyembur api tebal dan badan bos tersentak ke bawah (*heavy recoil*). Kanister kelihatan terbang melengkung di udara.
- **Respons Pemain:** Tiada reticle sasaran pendaratan. Pemain mesti melihat kanister yang melambung ke belakang dan segera memecut ke hadapan mendekati bos sebelum ia meletup.

### Arketip C: Mechanical Pincer Clamp (Rempuhan Sepit Silang)
- **Konsep:** Bahagian anggota bos (lengan sepit, bilah hidraulik, atau gerabak) meluru pantas ke hadapan merentasi sebahagian besar ruang skrin.
- **Isyarat Fizikal:** Lengan berundur ke belakang (*wind-up motion*), bahagian hidraulik berdesir dengan percikan bunga api, kemudian menerpa laju.
- **Respons Pemain:** Tiada garisan lintasan dipaparkan. Pemain perlu menjangka jarak capaian sepit dan mencari ruang kosong di celah pergerakan fizikal bos.

### Arketip D: Rotating Spiral Bullet Matrix (Matriks Peluru Berputar 360°)
- **Konsep:** Teras bos melepaskan aliran peluru pelbagai kelajuan yang berputar mengikut sudut berpusing mengelilingi seluruh arena.
- **Isyarat Fizikal:** Teras bos mula berputar laju dengan pancaran haba di bahagian tengah.
- **Respons Pemain:** Pemain membaca putaran peluru secara masa nyata (*real-time bullet weaving*), terbang mengelilingi bos atau menyelinap celah gelombang putaran.

---

## 4. Sistem Rawak & Reaksi Adaptif (Tanpa Penguncian Kaku)

### 4.1 Dek Rawak Tanpa Ulangan (Bag Shuffle)
- Bos mencabut serangan seterusnya secara rawak daripada kolam serangan fasanya (`AttackDeck`).
- Corak serangan tidak lagi mengikut jadual masa tetap, menghalang pemain daripada hanya menghafal kronologi serangan.

### 4.2 Tindak Balas Berdasarkan Tingkah Laku (*Behavioral Threat Response*)
Bos bertindak balas secara organik terhadap zon yang dicuba oleh pemain:
- **Jika Nova Bersembunyi di Bucu Belakang (`p.x < 80`):**
  - Kebarangkalian mencetuskan *Rear Mortar* atau serangan tebing melonjak kepada **75%**.
- **Jika Nova Berkhemah di Zon Atas (`p.y < 50`):**
  - Kebarangkalian melepaskan tembakan sapuan aras siling (*High Sweep*) meningkat kepada **70%**.
- **Jika Nova Terlalu Rapat (`p.x > 180`):**
  - Bos bertindak balas dengan serangan jarak dekat serta-merta (*Pincer Clamp / Shockwave*).

### 4.3 Variasi Trajektori Dinamik (*Trajectory Jitter*)
- Sudut tembakan dan kelajuan setiap peluru dalam salvo mempunyai serakan rawak kecil `±10%`.
- Gelombang peluru tidak lagi membentuk dinding sempurna; ia membentuk jurang-jurang tidak sekata yang menuntut pemerhatian tajam pemain.

---

## 5. Perincian Serangan Mengikut Bos: Space 1

| Bab / Bos | Identiti Bos | Serangan Baharu (Tanpa Amaran UI) | Isyarat Fizikal Bos (*Physical Tells*) & Cara Elak |
|---|---|---|---|
| **Bab 1** (`boss1`) | **Siege Tank** | **Rear Exhaust Mortar** | Ekzos belakang tank meledak dengan asap tebal; 3 kelongsong mortar melambung ke tebing kiri. Pemain mesti memecut ke hadapan sebelum mortar mendarat. |
| **Bab 2** (`boss2`) | **Naval Carrier** | **Sweeping Bow Laser & Flak Salvo** | Laras meriam haluan menyala biru terang dan mula berayun dari paras air ke atas. Pemain mesti menyelam ke bawah atau melompat melintasi laras meriam sebelum laser memotong. |
| **Bab 3** (`boss3`) | **Armored Crab** | **Scissor Pincer Blitz** | Kedua-dua sepit berundur ke belakang dan bergetar hebat sebelum meluru ke hadapan serentak. Tiada anak panah panduan; pemain mesti meramal bukaan tengah sepit. |
| **Bab 4** (`boss4`) | **Bell Organism** | **Spiral Bullet Matrix** | Loceng teras berdenyut pantas dan mengeluarkan 4 jalur peluru berpusing 360°. Pemain perlu membaca arah putaran dan terbang mengelilingi bos. |
| **Bab 5** (`boss5`) | **Ice Serpent** | **Perimeter Body Whip** | Ekor serpent melibas mengelilingi sempadan skrin secara pantas sementara kepala melepaskan hamburan ais konikal. Pemain membaca lengkungan badan ular untuk menyelinap. |
| **Bab 6** (`boss6`) | **Solar Phoenix** | **Solar Dive Sweep** | Sayap mengepak rapat dan muncung terbakar api merah sebelum meluru melintasi tengah arena pada kelajuan tinggi. Pemain perlu menaikkan altitud ke bahagian atas. |
| **Bab 7** (`boss7`) | **Crimson Fang** (Vex) | **Rear Ambush Blitz** | Vex memecut ke luar skrin dan serta-merta menjunam dari tebing kiri belakang sambil melontar bilah bumerang. Pemain perlu peka terhadap bunyi enjin dan bayangannya. |
| **Bab 8** (`boss8`) | **Split Citadel** | **Twin Converging Heavy Beams** | Dua turet raksasa di atas dan bawah menyala merah padam dan melepaskan rasuk berkembar yang merapat ke tengah. Pemain terpaksa bertarung di koridor sempit tengah. |

---

## 6. Perincian Serangan Mengikut Bos: Space 2

| Bab / Bos | Identiti Bos | Serangan Baharu (Tanpa Amaran UI) | Isyarat Fizikal Bos (*Physical Tells*) & Cara Elak |
|---|---|---|---|
| **Bab 9 (Ch 1)** (`boss9`) | **Tidebreaker** | **Sub-Surface Geyser Eruptions** | Haluan kapal tenggelam sedikit ke dalam air sebelum beberapa pancutan geyser melantunkan peluru ranjau ke udara. Pemain membaca pusaran air di permukaan. |
| **Bab 10 (Ch 2)** (`boss10`) | **Mangrove Hydra** | **Rear Leaping Torpedoes** | Penutup silo bawah air bergegar; torpedo melompat dari belakang skrin. Pemain memerhatikan buih air sebelum torpedo memecut. |
| **Bab 11 (Ch 3)** (`boss11`) | **Ice Wyvern** | **Glacier Slide** | Wyvern menghempas cakar ke tebing ais; bongkah ais meluncur secara melintang. Pemain membaca sudut hentakan untuk mengelak runtuhan. |
| **Bab 12 (Ch 4)** (`boss12`) | **Dune Maw** | **Sand Vortex Pull** | Mulut borer berputar pantas menghasilkan serakan pasir dan tarikan graviti. Pemain perlu mengaktifkan enjin penuh ke arah bertentangan sambil mengelak serpihan. |
| **Bab 13 (Ch 5)** (`boss13`) | **Iron Meridian** | **Decoupled Car Ambush** | Gandar gerabak terputus melepaskan percikan api elektrik dan gerabak meluncur dari kiri skrin. Pemain membaca aras rel yang bergegar. |
| **Bab 14 (Ch 6)** (`boss14`) | **Permafrost** | **Electric Chain Harpoon** | Meriam harpun tersentak melepaskan rantai besi bertenaga elektrik menembusi dinding kiri. Pemain perlu segera beralih aras Y sebelum rantai menegang. |
| **Bab 15 (Ch 7)** (`boss15`) | **Cyclone** | **Twin Twister March** | Dua turbin sayap berputar pada kelajuan maksimum; dua puting beliung bergerak dari tebing atas dan bawah. Pemain membaca arus angin untuk kekal di ruang selamat. |
| **Bab 16 (Ch 8)** (`boss16`) | **Atlas / Judgement** | **Sweeping Orbital Lance** | Mech Atlas mengangkat laras orbital ke langit dan pancaran cahaya jatuh menyapu melintasi separuh skrin. Tiada kotak lajur; pemain membaca arah sapuan cahaya. |

---

## 7. Spesifikasi Pelaksanaan Teknikal

### 7.1 Penyingkiran Lapisan Bantuan GUI
- **Padamkan Kod Amaran Tiruan:** Tiada pemanggilan fungsi seperti `drawWarningReticle`, `drawDeclaredCorridor`, atau anak panah panduan dalam kanvas bos.
- **Fokus Pelukis Kanvas (*Canvas Painters*):**
  - Hanya lukis kesan fizikal sebenar: laras meriam tersentak (`recoil`), kilatan api muncung (`muzzle flare`), asap ekzos, dan badan bergetar.
  - Peluru dilukis dengan teras padat dan garisan luar tebal agar trajektorinya boleh dibaca dengan jelas oleh mata pemain.

### 7.2 Struktur Logik Serangan (`space-logic.ts`)
```typescript
export type BossRawPattern = {
  kind: "mortarRear" | "sweepBeam" | "scissorPincer" | "spiralMatrix" | "flankTorpedo";
  windupFrames: number; // Tempoh animasi fizikal bos (bukan UI reticle)
  liveFrames: number;
  speed: number;
  spreadJitter: number; // Variasi rawak sudut tembakan
};
```

### 7.3 Pengesahan Ujian (Verification & Testing)
1. **Kebolehsampaian Fizikal (*Physical Traversability*):** Bot simulasi memastikan bahawa ruang antara peluru secara matematik sentiasa lebih besar daripada saiz kapal Nova (≥ 20px) pada mana-mana fasa serangan.
2. **Kekalkan Lulus Ujian Sedia Ada:** Semua 989 ujian sedia ada dalam repo mesti kekal lulus.

---

## 8. Ringkasan Status

- [x] Dokumen dikemas kini: Semua unsur *predictive lock*, *warning reticles*, dan *declared safe zones* dibuang sepenuhnya.
- [x] Serangan bos kini berpaksikan kepada isyarat mekanikal fizikal bos (*body animation tells*) dan variasi rawak adaptif.
- [ ] Sedia untuk fasa implementasi kod mengikut bos pilihan anda.
