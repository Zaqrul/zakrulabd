/* The story of the Space series: what is said before each chapter, when its boss
   arrives, and after it falls. It is read, not skipped: the dialogue box will not
   move on until a line has finished appearing. Keep each line short enough to
   read in a few seconds. */

export type Speaker = "nova" | "mika" | "rin" | "arc" | "vex" | "kroll";

export type Line = { who: Speaker; text: string };

/* The cast, by the colour their name takes in the dialogue box. */
export const SPEAKERS: Record<Speaker, { name: string; color: string }> = {
  nova: { name: "Nova", color: "#fbcf33" },
  mika: { name: "Mika", color: "#67e8f9" },
  rin: { name: "Cmdr. Rin", color: "#86efac" },
  arc: { name: "ARC", color: "#c4b5fd" },
  vex: { name: "Vex", color: "#fca5a5" },
  kroll: { name: "Adm. Kroll", color: "#f87171" },
};

export type SceneKey = `c${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}-${"intro" | "boss" | "outro"}`;

const en: Record<SceneKey, Line[]> = {
  "c1-intro": [
    { who: "mika", text: "Hangar control to Zephyr. Engines are cold. Light her up, Nova." },
    { who: "nova", text: "Copy. Starting main thrusters." },
    { who: "rin", text: "The Armada landed on Verda and is moving the Seed Core by ground convoy to Crimson Bay. We break the convoy first." },
    { who: "arc", text: "Zephyr online. All systems nominal. I will keep you alive, pilot. Statistically." },
    { who: "mika", text: "Catapult is armed. Count starts on your mark. Good luck out there." },
  ],
  "c1-boss": [
    { who: "arc", text: "Heavy tracks ahead. A siege walker, the Armada's biggest ground unit." },
    { who: "nova", text: "Then it goes down." },
  ],
  "c1-outro": [
    { who: "rin", text: "Convoy broken. The Core was moved to a carrier in Crimson Bay." },
    { who: "nova", text: "Then I follow the coast." },
    { who: "rin", text: "Fly low over the water. Their guns are waiting." },
  ],
  "c2-intro": [
    { who: "arc", text: "Open water ahead. Enemy ships below, aircraft above." },
    { who: "rin", text: "The carrier sits in the middle of the fleet. Cut through it." },
    { who: "nova", text: "Understood." },
  ],
  "c2-boss": [
    { who: "arc", text: "A battleship. Three turrets and missile cells. The fleet's flagship." },
    { who: "nova", text: "Flagships sink like any other ship." },
  ],
  "c2-outro": [
    { who: "rin", text: "The carrier has lifted off with the Core. It is heading for orbit!" },
    { who: "nova", text: "Then I follow it up." },
    { who: "mika", text: "Aurora is clearing your path. Go!" },
  ],
  "c3-intro": [
    { who: "arc", text: "Atmosphere cleared. Asteroid Belt ahead. Rock density rising." },
    { who: "rin", text: "The carrier ran for the belt with the Core. Without it, Aurora has three days of air." },
    { who: "nova", text: "Three days is plenty." },
  ],
  "c3-boss": [
    { who: "arc", text: "Large signal ahead. Signature: Rock Crab. Heavy armour, heavy claws." },
    { who: "nova", text: "Then I will hit harder." },
  ],
  "c3-outro": [
    { who: "rin", text: "Nice flying, Nova. The Core's trail leads into the Violet Nebula." },
    { who: "nova", text: "Then that is where I am going." },
  ],
  "c4-intro": [
    { who: "arc", text: "Nebula ahead. Sensors will be noisy. Stay sharp." },
    { who: "rin", text: "That lightning in there is not weather. Something is feeding on the Core's energy." },
    { who: "nova", text: "Something big?" },
    { who: "rin", text: "Bigger than that." },
  ],
  "c4-boss": [
    { who: "arc", text: "Target locked. An alien hive carrier, harvesting the Core's energy. Watch its weapon arms." },
    { who: "nova", text: "Then I cut it off." },
  ],
  "c4-outro": [
    { who: "rin", text: "The nebula is calming. The signal moves on, to the frozen rings of Kharn." },
    { who: "nova", text: "Cold, then. Fine." },
  ],
  "c5-intro": [
    { who: "mika", text: "Zephyr, you are leaving Aurora's range. Radio will start to drop." },
    { who: "arc", text: "Rings of Kharn. Two hundred below zero. Ice is moving fast out there." },
    { who: "nova", text: "Eyes up. Let's go." },
  ],
  "c5-boss": [
    { who: "arc", text: "An armoured leviathan is moving inside the ring. Its linked segments follow the head." },
    { who: "nova", text: "The Armada deployed it to guard the Core's path." },
  ],
  "c5-outro": [
    { who: "nova", text: "The Core signal is getting stronger. It is close to the sun." },
    { who: "arc", text: "The trail enters the Solar Corona. My hull is not rated for that." },
    { who: "nova", text: "Then we fly fast." },
  ],
  "c6-intro": [
    { who: "arc", text: "Corona radiation rising. Flares strike where the markers show. Watch for them." },
    { who: "nova", text: "Marked columns. Got it." },
  ],
  "c6-boss": [
    { who: "rin", text: "Nova, that bomber draws power from the star. Watch its wings and the flare markers." },
    { who: "nova", text: "Not today." },
  ],
  "c6-outro": [
    { who: "vex", text: "Impressive. You burn bright for a rookie." },
    { who: "nova", text: "Who is this?" },
    { who: "vex", text: "Vex, ace of the Armada. Come find me at the station graveyard." },
    { who: "arc", text: "Open channel traced. A rival pilot, and a dangerous one." },
  ],
  "c7-intro": [
    { who: "arc", text: "Derelict station ahead. Laser gates are live. Debris everywhere." },
    { who: "rin", text: "The Armada rearms here. Expect traps." },
    { who: "nova", text: "And Vex is waiting somewhere inside." },
  ],
  "c7-boss": [
    { who: "vex", text: "Took you long enough. I wanted a real fight." },
    { who: "nova", text: "You work for the man who stole our air." },
    { who: "vex", text: "I work for whoever fights me. Come on." },
  ],
  "c7-outro": [
    { who: "vex", text: "Hah... you broke my Fang. The Admiral waits aboard the Dreadnought." },
    { who: "vex", text: "I am done being his dog. Go. Finish this." },
    { who: "arc", text: "Vex is gone. The Dreadnought is on the long range scope." },
  ],
  "c8-intro": [
    { who: "rin", text: "Nova, this is it. The Dreadnought carries the Core. If it fires on Aurora, nothing is left." },
    { who: "nova", text: "Then it does not get to fire." },
    { who: "mika", text: "All of Aurora is watching you." },
  ],
  "c8-boss": [
    { who: "kroll", text: "A single fighter? Aurora must be truly desperate." },
    { who: "nova", text: "One fighter is all it takes." },
    { who: "kroll", text: "Then burn." },
  ],
  "c8-outro": [
    { who: "arc", text: "Core secured. The Dreadnought's reactor is failing. Leave now." },
    { who: "nova", text: "Going. Rin, tell Mika to keep the hangar lights on." },
    { who: "rin", text: "Come home, Nova." },
  ],
};

const ms: Record<SceneKey, Line[]> = {
  "c1-intro": [
    { who: "mika", text: "Kawalan hangar kepada Zephyr. Enjin masih sejuk. Hidupkan, Nova." },
    { who: "nova", text: "Diterima. Menghidupkan enjin utama." },
    { who: "rin", text: "Armada mendarat di Verda dan mengangkut Seed Core dengan konvoi darat ke Teluk Merah. Kita pecahkan konvoi itu dahulu." },
    { who: "arc", text: "Zephyr aktif. Semua sistem normal. Saya akan pastikan anda hidup, juruterbang. Secara statistik." },
    { who: "mika", text: "Katapult sedia. Kiraan bermula bila anda bersedia. Semoga berjaya." },
  ],
  "c1-boss": [
    { who: "arc", text: "Jejak rantai berat di hadapan. Pejalan pengepungan, unit darat terbesar Armada." },
    { who: "nova", text: "Kalau begitu, ia tumbang." },
  ],
  "c1-outro": [
    { who: "rin", text: "Konvoi pecah. Core sudah dipindahkan ke kapal pengangkut di Teluk Merah." },
    { who: "nova", text: "Saya ikut pantai." },
    { who: "rin", text: "Terbang rendah di atas air. Meriam mereka sudah menunggu." },
  ],
  "c2-intro": [
    { who: "arc", text: "Laut terbuka di hadapan. Kapal musuh di bawah, pesawat di atas." },
    { who: "rin", text: "Kapal pengangkut berada di tengah armada. Tembus ke situ." },
    { who: "nova", text: "Faham." },
  ],
  "c2-boss": [
    { who: "arc", text: "Kapal perang. Tiga menara meriam dan sel peluru berpandu. Kapal pemimpin armada." },
    { who: "nova", text: "Kapal pemimpin pun tenggelam seperti kapal lain." },
  ],
  "c2-outro": [
    { who: "rin", text: "Kapal pengangkut sudah berlepas dengan Core. Ia menuju orbit!" },
    { who: "nova", text: "Kalau begitu, saya ikut ke atas." },
    { who: "mika", text: "Aurora sedang membuka laluan. Pergi!" },
  ],
  "c3-intro": [
    { who: "arc", text: "Atmosfera dilepasi. Lingkaran Asteroid di hadapan. Kepadatan batu meningkat." },
    { who: "rin", text: "Kapal pengangkut lari ke sana dengan Core. Tanpa Core, Aurora ada udara untuk tiga hari." },
    { who: "nova", text: "Tiga hari lebih daripada cukup." },
  ],
  "c3-boss": [
    { who: "arc", text: "Isyarat besar di hadapan. Tandatangan: Ketam Batu. Perisai tebal, sepit berat." },
    { who: "nova", text: "Kalau begitu, saya pukul lebih kuat." },
  ],
  "c3-outro": [
    { who: "rin", text: "Terbang yang cantik, Nova. Jejak Core menuju ke Nebula Ungu." },
    { who: "nova", text: "Itulah arah saya." },
  ],
  "c4-intro": [
    { who: "arc", text: "Nebula di hadapan. Sensor akan bising. Kekal berjaga." },
    { who: "rin", text: "Kilat di dalam sana bukan cuaca. Ada sesuatu yang menyedut tenaga Core." },
    { who: "nova", text: "Sesuatu yang besar?" },
    { who: "rin", text: "Lebih besar daripada itu." },
  ],
  "c4-boss": [
    { who: "arc", text: "Sasaran dikunci. Kapal induk alien sedang menyerap tenaga Core. Perhatikan lengan senjatanya." },
    { who: "nova", text: "Kalau begitu, saya putuskan bekalannya." },
  ],
  "c4-outro": [
    { who: "rin", text: "Nebula mula tenang. Isyarat bergerak ke Cincin Beku Kharn." },
    { who: "nova", text: "Sejuk, ya. Tak apa." },
  ],
  "c5-intro": [
    { who: "mika", text: "Zephyr, anda keluar dari jangkauan Aurora. Radio akan mula putus." },
    { who: "arc", text: "Cincin Kharn. Dua ratus darjah di bawah sifar. Ais bergerak laju di luar sana." },
    { who: "nova", text: "Mata ke hadapan. Jom." },
  ],
  "c5-boss": [
    { who: "arc", text: "Leviatan berperisai bergerak dalam cincin. Segmen badannya mengikuti kepala." },
    { who: "nova", text: "Armada menghantarnya untuk jaga laluan Core." },
  ],
  "c5-outro": [
    { who: "nova", text: "Isyarat Core makin kuat. Ia dekat dengan matahari." },
    { who: "arc", text: "Jejak masuk ke Korona Suria. Badan kapal saya tak dinilai untuk itu." },
    { who: "nova", text: "Kalau begitu, kita terbang laju." },
  ],
  "c6-intro": [
    { who: "arc", text: "Sinaran korona meningkat. Api suria menyambar di tempat yang ditandakan. Perhatikan tanda itu." },
    { who: "nova", text: "Lajur bertanda. Faham." },
  ],
  "c6-boss": [
    { who: "rin", text: "Nova, pengebom itu menyerap tenaga bintang. Perhatikan sayap dan penanda api suria." },
    { who: "nova", text: "Bukan hari ini." },
  ],
  "c6-outro": [
    { who: "vex", text: "Hebat. Terang juga anda untuk seorang pemula." },
    { who: "nova", text: "Siapa ini?" },
    { who: "vex", text: "Vex, juara Armada. Cari saya di tanah perkuburan stesen." },
    { who: "arc", text: "Saluran terbuka dijejak. Juruterbang saingan, dan berbahaya." },
  ],
  "c7-intro": [
    { who: "arc", text: "Stesen terbiar di hadapan. Pintu laser aktif. Serpihan merata." },
    { who: "rin", text: "Armada isi semula senjata di sini. Jangan terkejut dengan perangkap." },
    { who: "nova", text: "Dan Vex menunggu di dalam sana." },
  ],
  "c7-boss": [
    { who: "vex", text: "Lambat juga anda sampai. Saya mahu pertarungan sebenar." },
    { who: "nova", text: "Anda bekerja untuk lelaki yang curi udara kami." },
    { who: "vex", text: "Saya bekerja untuk sesiapa yang berlawan dengan saya. Mari." },
  ],
  "c7-outro": [
    { who: "vex", text: "Hah... anda patahkan Taring saya. Laksamana menunggu di atas Dreadnought." },
    { who: "vex", text: "Saya sudah penat jadi anjingnya. Pergi. Habiskan ini." },
    { who: "arc", text: "Vex sudah pergi. Dreadnought kelihatan di skop jarak jauh." },
  ],
  "c8-intro": [
    { who: "rin", text: "Nova, ini dia. Dreadnought bawa Core. Kalau ia menembak Aurora, tiada apa yang tinggal." },
    { who: "nova", text: "Kalau begitu, ia tak akan sempat menembak." },
    { who: "mika", text: "Seluruh Aurora sedang melihat anda." },
  ],
  "c8-boss": [
    { who: "kroll", text: "Sebuah pejuang sahaja? Aurora memang sudah terdesak." },
    { who: "nova", text: "Satu pejuang sudah cukup." },
    { who: "kroll", text: "Kalau begitu, terbakarlah." },
  ],
  "c8-outro": [
    { who: "arc", text: "Core selamat. Reaktor Dreadnought gagal. Keluar sekarang." },
    { who: "nova", text: "Bergerak. Rin, pesan Mika supaya biarkan lampu hangar terpasang." },
    { who: "rin", text: "Balik rumah, Nova." },
  ],
};

export const STORY = { en, ms };
