/* Space 2 uses engine chapters 9–16 and displays chapters 1–8.
   Keep bilingual lines together: matching speakers and scene beats cannot drift.
   No simulation or art imports; the campaign can consume this data independently. */
export type Space2Speaker = "nova" | "mika" | "rin" | "arc" | "halo" | "marsh";
export type Space2Chapter = 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type Space2SceneKey = `c${Space2Chapter}-${"intro" | "boss" | "outro"}`;
export type Space2Line = { who: Space2Speaker; text: string };
type BilingualLine = readonly [who: Space2Speaker, en: string, ms: string];

export const SPACE2_SPEAKERS: Record<Space2Speaker, { name: string; color: string }> = {
  nova: { name: "Nova", color: "#fbcf33" },
  mika: { name: "Mika", color: "#67e8f9" },
  rin: { name: "Cmdr. Rin", color: "#86efac" },
  arc: { name: "ARC", color: "#c4b5fd" },
  halo: { name: "Lt. Halo", color: "#5eead4" },
  marsh: { name: "Gen. Marsh", color: "#fb923c" },
};

const scenes: Record<Space2SceneKey, readonly BilingualLine[]> = {
  "c9-intro": [
    ["mika", "Aurora to Zephyr. Pacific re-entry confirmed. Earth Force has marked us hostile.", "Aurora kepada Zephyr. Kemasukan semula di Pasifik disahkan. Earth Force menandakan kita sebagai musuh."],
    ["marsh", "Nova. You stole the Seed Core from our Armada partners. You chose Space Force. You chose treason.", "Nova. Kamu mencuri Seed Core daripada sekutu Armada kami. Kamu memilih Space Force. Kamu memilih pengkhianatan."],
    ["nova", "I brought it home.", "Saya membawanya pulang."],
    ["halo", "Lyra Voss. Call me Halo. ORB sent Kite to cover you. We don't fire first. Disable machines, spare crews.", "Lyra Voss. Panggil saya Halo. ORB hantar Kite untuk lindungi anda. Kita tak tembak dahulu. Lumpuhkan mesin, selamatkan kru."],
    ["arc", "Welcome home. The reception has ammunition.", "Selamat pulang. Sambutan ini bersenjata."],
  ],
  "c9-boss": [
    ["arc", "Tidebreaker. Aegis destroyer, rail deck charging. Watch the firing cue.", "Tidebreaker. Kapal pemusnah Aegis, dek railgun sedang mengecas. Perhatikan amaran tembakan."],
    ["halo", "Keep clear of the bridge. Break its guns.", "Jauhi anjung kapal. Musnahkan meriamnya."],
    ["nova", "Guns first.", "Meriam dahulu."],
  ],
  "c9-outro": [
    ["halo", "Tidebreaker's weapons are silent. Lifeboats are clear.", "Senjata Tidebreaker sudah senyap. Bot penyelamat sudah keluar."],
    ["rin", "Their supply records point to the archipelago. That is where Earth Force armed the Armada.", "Rekod bekalan mereka menuju ke kepulauan. Di situlah Earth Force membekalkan senjata kepada Armada."],
    ["nova", "Then we follow the records.", "Kita ikut rekod itu."],
  ],
  "c10-intro": [
    ["arc", "Southeast Asian archipelago. Monsoon rain. An excellent day to be indoors.", "Kepulauan Asia Tenggara. Hujan monsun. Hari yang sesuai untuk duduk di dalam."],
    ["halo", "River traffic is civilian. Earth Force's gunships are not. Pick your targets.", "Trafik sungai itu orang awam. Kapal tempur Earth Force bukan. Pilih sasaran dengan tepat."],
    ["nova", "I see the guns.", "Saya nampak meriamnya."],
  ],
  "c10-boss": [
    ["arc", "Mangrove Hydra. Three magazines hidden below deck.", "Mangrove Hydra. Tiga ruang senjata tersembunyi di bawah dek."],
    ["halo", "Watch the hatches. Round marks are bombs. Rockets rise before they turn.", "Perhatikan hatch. Tanda bulat ialah bom. Roket naik sebelum membelok."],
    ["nova", "Close the magazines.", "Lumpuhkan ruang senjatanya."],
  ],
  "c10-outro": [
    ["halo", "Hydra disabled. ORB rescue boats have the crew.", "Hydra dilumpuhkan. Bot penyelamat ORB sudah mendapatkan kru."],
    ["mika", "Supply manifests recovered. The command trail runs through a Himalayan relay.", "Manifest bekalan diterima. Jejak arahan melalui stesen geganti Himalaya."],
    ["arc", "Trading rain for snow. An upgrade in inconvenience.", "Menukar hujan dengan salji. Kesulitan dinaik taraf."],
  ],
  "c11-intro": [
    ["mika", "Himalayan relay ahead. Keep the mountain off your wings.", "Stesen geganti Himalaya di hadapan. Jauhkan sayap daripada gunung."],
    ["halo", "Gust warnings show the push. Leave room above and below.", "Amaran tiupan menunjukkan arah tolakan. Tinggalkan ruang di atas dan bawah."],
    ["nova", "Room to move. Understood.", "Ruang untuk bergerak. Faham."],
  ],
  "c11-boss": [
    ["arc", "Ice Wyvern. A walker gripping the cliff. Its weapons are moving into position.", "Ice Wyvern. Mesin berkaki mencengkam tebing. Senjatanya sedang mengambil kedudukan."],
    ["halo", "Wait for the weapon cue. Don't let the wind pin you against it.", "Tunggu isyarat senjata. Jangan biarkan angin menolak anda ke arahnya."],
    ["nova", "I'll keep my distance.", "Saya akan jaga jarak."],
  ],
  "c11-outro": [
    ["halo", "Wyvern powered down. Its crew is leaving through the ridge tunnel.", "Wyvern sudah padam. Krunya keluar melalui terowong di rabung."],
    ["rin", "Relay copied. Marsh routed the orders through a Sahara command site.", "Data geganti disalin. Marsh menyalurkan arahan melalui pusat perintah di Sahara."],
    ["arc", "From freezing to baking. My maintenance log is becoming a menu.", "Daripada beku kepada panggang. Log penyelenggaraan saya semakin menyerupai menu."],
  ],
  "c12-intro": [
    ["arc", "Sahara airspace. Sandstorm ahead. The background will not be helpful.", "Ruang udara Sahara. Ribut pasir di hadapan. Latar belakang tidak banyak membantu."],
    ["halo", "Read the bright warnings. The guns are still visible through the dust.", "Baca amaran yang terang. Meriam masih kelihatan di sebalik debu."],
    ["nova", "Eyes on the fire.", "Fokus pada tembakan."],
  ],
  "c12-boss": [
    ["arc", "Dune Maw. A heavy borer under the sand. Watch its emergence cue.", "Dune Maw. Mesin pengorek berat di bawah pasir. Perhatikan amaran kemunculannya."],
    ["halo", "Leave the marked ground clear. Hit the machinery when it surfaces.", "Jauhi tanah yang ditanda. Serang mesinnya apabila ia muncul."],
    ["nova", "Come up, then.", "Muncullah."],
  ],
  "c12-outro": [
    ["halo", "Drill stopped. The escape lift is moving. Let it go.", "Gerudi berhenti. Lif kecemasan sedang bergerak. Biarkan ia pergi."],
    ["rin", "Marsh's authorisation is in the records. The next relay rides an alpine rail fortress.", "Kebenaran Marsh ada dalam rekod. Geganti seterusnya dibawa kubu rel di pergunungan Alps."],
    ["nova", "Keep the evidence safe.", "Simpan bukti itu."],
  ],
  "c13-intro": [
    ["mika", "European alpine corridor. Dusk fog. The rail line leads straight to their relay.", "Koridor Alps Eropah. Kabus senja. Landasan menuju terus ke stesen geganti mereka."],
    ["halo", "Missile lanes are marked. Find the gap before the grid fires.", "Lorong peluru berpandu ditanda. Cari ruang sebelum grid melepaskan tembakan."],
    ["arc", "A train timetable with unusually strict penalties.", "Jadual kereta api dengan hukuman yang luar biasa tegas."],
  ],
  "c13-boss": [
    ["arc", "Iron Meridian. An armoured rail fortress. Several carriages, all unfriendly.", "Iron Meridian. Kubu rel berperisai. Beberapa gerabak, semuanya tidak mesra."],
    ["halo", "Watch the marked lanes. Disable the weapon cars and leave the crew compartments intact.", "Perhatikan lorong bertanda. Lumpuhkan gerabak senjata dan biarkan ruang kru selamat."],
    ["nova", "Weapons only.", "Senjata sahaja."],
  ],
  "c13-outro": [
    ["halo", "Train stopped. Crew compartments intact. Rescue teams are moving in.", "Kereta api berhenti. Ruang kru selamat. Pasukan penyelamat sedang masuk."],
    ["mika", "The relay points north. Permafrost carries the Citadel's access codes.", "Data geganti menunjuk ke utara. Permafrost membawa kod akses Citadel."],
    ["nova", "North it is.", "Ke utara."],
  ],
  "c14-intro": [
    ["arc", "Arctic ice shelf. Aurora overhead. The natural kind, for once.", "Pelantar ais Artik. Aurora di atas. Kali ini, yang semula jadi."],
    ["halo", "Icefall warnings come first. Keep out of those columns.", "Amaran ais runtuh muncul dahulu. Jauhi jalur itu."],
    ["nova", "Still flying fine.", "Masih boleh terbang."],
  ],
  "c14-boss": [
    ["arc", "Permafrost. Icebreaker carrier. Its flight deck is armed.", "Permafrost. Kapal induk pemecah ais. Dek penerbangannya bersenjata."],
    ["halo", "Rescue craft are standing by. Stop the weapons before it breaks the shelf beneath them.", "Kapal penyelamat sudah bersedia. Hentikan senjatanya sebelum pelantar ais di bawah mereka pecah."],
    ["nova", "Working on it.", "Sedang diusahakan."],
  ],
  "c14-outro": [
    ["halo", "Permafrost is quiet. Rescue craft have reached the deck.", "Permafrost sudah senyap. Kapal penyelamat sudah sampai ke dek."],
    ["rin", "Access codes secured. One defence line remains: Cyclone, over the Atlantic.", "Kod akses diperoleh. Satu barisan pertahanan lagi: Cyclone, di Atlantik."],
    ["arc", "A storm carrier in a hurricane. Someone enjoys a theme.", "Kapal induk ribut dalam taufan. Seseorang gemar tema yang sepadan."],
  ],
  "c15-intro": [
    ["halo", "Atlantic hurricane. I've flown rescue here. Follow the warnings, not the clouds.", "Taufan Atlantik. Saya pernah terbang untuk misi menyelamat di sini. Ikut amaran, bukan awan."],
    ["arc", "Lightning columns marked. They are not suggested parking spaces.", "Jalur kilat ditanda. Itu bukan cadangan tempat letak kapal."],
    ["nova", "Your sky, Halo. Lead on.", "Ini langit anda, Halo. Tunjukkan jalan."],
  ],
  "c15-boss": [
    ["marsh", "Cyclone holds this corridor. Turn back, Nova.", "Cyclone mengawal koridor ini. Berpatah balik, Nova."],
    ["halo", "I've pulled your crews out of worse storms, General. Stop sending them into this one.", "Saya pernah selamatkan kru anda daripada ribut lebih buruk, Jeneral. Berhenti hantar mereka ke sini."],
    ["nova", "Clear the carrier's guns.", "Lumpuhkan meriam kapal induk itu."],
  ],
  "c15-outro": [
    ["halo", "Cyclone disabled. Every escape craft is through the eye. That's the last one.", "Cyclone dilumpuhkan. Semua kapal kecemasan sudah melalui mata taufan. Itu yang terakhir."],
    ["rin", "The Citadel is ahead. Marsh cannot hide the supply orders now.", "Citadel di hadapan. Marsh tidak boleh sembunyikan arahan bekalan itu lagi."],
    ["nova", "Stay with me, Halo.", "Terus bersama saya, Halo."],
  ],
  "c16-intro": [
    ["mika", "Meridian Citadel. Earth Force headquarters. Clear skies, finally.", "Meridian Citadel. Ibu pejabat Earth Force. Akhirnya, langit cerah."],
    ["halo", "ORB is opening an evacuation corridor. Keep the fighting on the machines.", "ORB sedang membuka laluan pemindahan. Tumpukan serangan pada mesin."],
    ["nova", "Marsh. We're here.", "Marsh. Kami sudah sampai."],
  ],
  "c16-boss": [
    ["marsh", "Atlas kept Earth safe. The Armada was a necessary bargain.", "Atlas menjaga keselamatan Bumi. Perjanjian dengan Armada itu perlu."],
    ["nova", "You paid them with our air.", "Kamu membayar mereka dengan udara kami."],
    ["halo", "Atlas is a machine. Marsh is a man. We stop one and bring the other back alive.", "Atlas ialah mesin. Marsh seorang manusia. Kita hentikan satu dan bawa yang satu lagi pulang hidup-hidup."],
    ["arc", "Weapons are charging. I recommend the stopping part first.", "Senjata sedang mengecas. Saya cadangkan bahagian menghentikan itu dahulu."],
  ],
  "c16-outro": [
    ["arc", "Judgement is offline. The orbital lance cannot fire.", "Judgement sudah padam. Meriam orbit itu tidak boleh menembak."],
    ["halo", "Marsh's rescue beacon is secure. The crews are clear. Nobody gets left behind.", "Suar penyelamat Marsh sudah dikesan. Kru sudah selamat. Tiada sesiapa ditinggalkan."],
    ["rin", "The supply orders are public. Earth Force has rescinded the attack order.", "Arahan bekalan sudah didedahkan. Earth Force telah membatalkan arahan serangan."],
    ["mika", "Hangar lights are on, Nova. Again.", "Lampu hangar sudah menyala, Nova. Sekali lagi."],
    ["nova", "Coming home. Both of us.", "Kami pulang. Kami berdua."],
    ["arc", "Three, if anyone is counting.", "Tiga, kalau ada yang mengira."],
  ],
};

function localize<K extends string>(source: Record<K, readonly BilingualLine[]>, language: 1 | 2): Record<K, Space2Line[]> {
  return Object.fromEntries(Object.entries(source).map(([key, rows]) => [
    key, (rows as readonly BilingualLine[]).map(([who, en, ms]) => ({ who, text: language === 1 ? en : ms })),
  ])) as Record<K, Space2Line[]>;
}

export const SPACE2_STORY = { en: localize(scenes, 1), ms: localize(scenes, 2) };

/* The engine should play this once between Atlas and Judgement. The c16 outro
   belongs after Judgement, never merely after Atlas. Weapon/cover calls are HUD copy. */
const events = {
  judgement: [
    ["arc", "Atlas is down. A second signal just woke up. Judgement, an orbital lance.", "Atlas tumbang. Isyarat kedua baru aktif. Judgement, sebuah meriam orbit."],
    ["marsh", "The defence system is still armed. I cannot recall it.", "Sistem pertahanan masih bersenjata. Saya tidak boleh membatalkannya."],
    ["halo", "Then help us clear the crews. Nova, stop that lance.", "Kalau begitu, bantu kami keluarkan kru. Nova, hentikan meriam itu."],
    ["nova", "One more machine.", "Satu mesin lagi."],
  ],
} satisfies Record<string, readonly BilingualLine[]>;
export const SPACE2_EVENTS = { en: localize(events, 1), ms: localize(events, 2) };
