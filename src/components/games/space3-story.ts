/* Space 3 uses engine chapters 17 to 28 and shows chapters 1 to 12. English only: the Malay copy is the same text,
   so the player and its tests can treat Space 3 like the other campaigns. Chapters 17 to 20 are written so far.
   No simulation or art imports. */
export type Space3Speaker = "nova" | "mika" | "rin" | "arc" | "halo" | "vex" | "lumen";

/* Lumen is Space 3's new voice: Ensign Sera Okoro, a recruit flying Zephyr-04, Nova's ship, with a plasma beam. */
export const SPACE3_SPEAKERS = { lumen: { name: "Ens. Lumen", color: "#f472b6" } } as const;
export type Space3Chapter = 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28;
export type Space3SceneKey = `c${Space3Chapter}-${"intro" | "boss" | "outro"}`;
export type Space3Line = { who: Space3Speaker; text: string };
type Beat = readonly [who: Space3Speaker, text: string];

const scenes: Record<"c17-intro" | "c17-boss" | "c17-outro", readonly Beat[]> = {
  "c17-intro": [
    ["rin", "Zephyr, Fleet Command. Something crossed the Mars line with no transponder. It is repeating our radio traffic back at us.", ],
    ["arc", "Correction: it is repeating our resonance. The Seed Core's signal. We rang a doorbell, and someone answered."],
    ["halo", "Kite runs the relief corridor behind us. Nova, you have a new wingman today: Ensign Okoro, fresh from the academy."],
    ["lumen", "Ensign Sera Okoro, callsign Lumen. Zephyr-04, plasma beam hot, on your wing, Commander."],
    ["nova", "Understood. Going in."],
  ],
  "c17-boss": [
    ["arc", "Ghost Corvet. A stealth scout hiding in the Phobos wreckage. It tears plates off its own hull and throws them. It will fly your own path back at you, too."],
    ["halo", "It cloaks every few seconds. Do not waste shots on the shimmer, and watch the plates it throws."],
    ["nova", "Then I will fly somewhere it cannot copy."],
  ],
  "c17-outro": [
    ["arc", "Corvet down. Its memory core is full of our own flight paths. It was learning us."],
    ["rin", "And reporting back. The scouts came in from the asteroid belt. Move out."],
    ["halo", "Ceres next. Lumen, stay on Nova's wing."],
    ["lumen", "Yes, ma'am. Right behind the Commander."],
  ],
};

const scenes2: Record<"c18-intro" | "c18-boss" | "c18-outro", readonly Beat[]> = {
  "c18-intro": [
    ["mika", "Aurora to Zephyr. Ceres Station is under fire. Three hundred miners are still out on the belts."],
    ["halo", "Kite takes the evacuation lane. I will keep the transports moving, Nova."],
    ["arc", "The drones are stripping the ore haulers for parts. They are mining the station itself."],
    ["lumen", "Plasma is warm. I will burn a lane through the drones for the haulers."],
    ["nova", "I will clear the fire lane. Tell the miners to keep their lights on."],
  ],
  "c18-boss": [
    ["arc", "Excavator-X. A deep-core drill rebuilt as a gun platform. The drill is faster than it looks."],
    ["halo", "It blasts rock out of the rig in sprays. Do not hold still in front of it."],
    ["rin", "It is shelling the evacuation lane. Bring it down before the last transport clears."],
    ["lumen", "It is faster than the manual says. Staying off its drill line."],
    ["nova", "Understood. Drawing its fire."],
  ],
  "c18-outro": [
    ["halo", "The last transport is clear. Ceres is safe."],
    ["mika", "Nova, an emergency signal from Jupiter. Something under the ice at Europa just woke up."],
    ["rin", "Then that is where the Vanguard goes next. All ships, set course for Europa."],
    ["nova", "Ceres is behind us. Europa next."],
  ],
};

const scenes3: Record<"c19-intro" | "c19-boss" | "c19-outro", readonly Beat[]> = {
  "c19-intro": [
    ["rin", "Europa. The Vanguard has woken a structure under the ice and is draining Jupiter's magnetic field through it."],
    ["arc", "A power absorber in the crags. If it runs to full charge, every shield in the fleet goes dark."],
    ["halo", "We dive into the crevasse at speed. Keep your wings in, Nova."],
    ["nova", "Close behind you. Counting the walls."],
  ],
  "c19-boss": [
    ["arc", "Abyssal Wyrm. A modular machine, kilometres long, coiling out of the ice into low orbit."],
    ["vex", "I heard the party started without me."],
    ["nova", "Vex? Your ship was a wreck."],
    ["vex", "I rebuilt Fang from scrap and spite. She flies."],
    ["halo", "Then take its left, Vex. We cut it into pieces."],
    ["lumen", "Plasma on the seams. I will cut where it bends."],
  ],
  "c19-outro": [
    ["arc", "The Wyrm's reactor is gone. Its logs hold a set of coordinates."],
    ["rin", "Saturn's rings. The wreckage of Kroll's fleet."],
    ["vex", "I know that graveyard. I helped fill it."],
    ["halo", "Then you lead the way. Nova and I will be on your wing."],
  ],
};

const scenes4: Record<"c20-intro" | "c20-boss" | "c20-outro", readonly Beat[]> = {
  "c20-intro": [
    ["rin", "Saturn's rings. Kroll's fleet fell here, and the Vanguard's recovery crews have been picking over the wrecks."],
    ["vex", "Looking at these old hulls reminds me of the day you shot me down, Nova."],
    ["nova", "You did get up again."],
    ["halo", "Mind the field. Every wreck out there can still be armed. Vex, take the left, Lumen stays on Nova."],
    ["lumen", "Plasma is warm. Wreckage makes a good target."],
  ],
  "c20-boss": [
    ["arc", "Armada Reclaimer. A fortress built from Kroll's fleet, reloading itself with the old fleet's ordnance."],
    ["vex", "Those are my missiles. I fitted them myself. I know every one of them."],
    ["halo", "Then tell us when they will go. It gathers, it waits, it fires."],
    ["lumen", "Burning the racks. Watch your own line, Commander."],
  ],
  "c20-outro": [
    ["mika", "I have decoded the Reclaimer's log. The Vanguard is moving to the outer planets to power the gate."],
    ["rin", "Uranus first. They want its magnetic field. Fleet, set course for the storm."],
    ["halo", "Nothing but ice and lightning from here. Stay close."],
    ["vex", "Wherever you go, I am on your left."],
  ],
};

const scenesMs: Record<"c17-intro" | "c17-boss" | "c17-outro", readonly Beat[]> = {
  "c17-intro": [
    ["rin", "Zephyr, Markas Armada. Sesuatu melintasi perimeter Marikh tanpa transponder. Isyarat radio kita diulang balik."],
    ["arc", "Pembetulan: ia mengulang resonans Seed Core. Kita mengetuk pintu purba, dan ada yang menjawab."],
    ["halo", "Kite kawal laluan bantuan di belakang. Nova, sayap anda disertai Ensign Okoro, juruterbang baru akademi."],
    ["lumen", "Ensign Sera Okoro, panggilan Lumen. Zephyr-04, pancaran plasma sedia, di sayap anda, Komander."],
    ["nova", "Faham. Kita bergerak masuk."],
  ],
  "c17-boss": [
    ["arc", "Ghost Corvet. Kapal peninjau halimunan di serpihan Phobos. Ia membaling plat perisai dan menyalin laluan anda."],
    ["halo", "Ia halimunan setiap beberapa saat. Jangan bazir tembakan pada kelipan itu, awasi plat yang dibaling."],
    ["nova", "Kalau begitu saya akan terbang di laluan yang tak mampu disalinnya."],
  ],
  "c17-outro": [
    ["arc", "Corvet musnah. Teras memorinya penuh dengan corak penerbangan kita. Ia sedang mengkaji kita."],
    ["rin", "Dan melapor balik. Armada peninjau datang dari lingkaran asteroid. Teruskan mara."],
    ["halo", "Seterusnya Ceres. Lumen, kekal di sayap Nova."],
    ["lumen", "Baik, puan. Tepat di belakang Komander."],
  ],
};

const scenes2Ms: Record<"c18-intro" | "c18-boss" | "c18-outro", readonly Beat[]> = {
  "c18-intro": [
    ["mika", "Aurora kepada Zephyr. Stesen Ceres diserang. Tiga ratus pelombong masih terperangkap di lingkaran."],
    ["halo", "Kite kawal laluan pemindahan. Saya akan pastikan kapal pengangkut terus bergerak, Nova."],
    ["arc", "Dron musuh meleraikan kapal pengangkut bijih untuk alat ganti. Mereka melombong stesen itu sendiri."],
    ["lumen", "Plasma sudah panas. Saya akan bakar laluan menerusi dron untuk kapal pekerja."],
    ["nova", "Saya bersihkan laluan tembakan. Beritahu pelombong untuk terus pasang lampu panduan."],
  ],
  "c18-boss": [
    ["arc", "Excavator-X. Gerudi teras gergasi yang diubah suai menjadi kubu meriam. Gerudinya sangat pantas."],
    ["halo", "Ia menyembur serpihan batu dalam semburan padu. Jangan pegang posisi di hadapannya."],
    ["rin", "Ia membedil laluan pemindahan. Tumpaskan sebelum kapal pengangkut terakhir melepasi zon."],
    ["lumen", "Ia lebih pantas daripada data manual. Mengelak daripada garis gerudinya."],
    ["nova", "Faham. Saya tarik tembakannya."],
  ],
  "c18-outro": [
    ["halo", "Kapal pengangkut terakhir selamat melepasi zon. Ceres kini selamat."],
    ["mika", "Nova, isyarat kecemasan dari Musytari! Sesuatu di bawah ais Europa baru bangun."],
    ["rin", "Di situlah arah tumpuan Vanguard seterusnya. Semua kapal, tetapkan haluan ke Europa."],
    ["nova", "Ceres selamat ditinggalkan. Seterusnya Europa."],
  ],
};

const scenes3Ms: Record<"c19-intro" | "c19-boss" | "c19-outro", readonly Beat[]> = {
  "c19-intro": [
    ["rin", "Europa. Vanguard membangkitkan struktur purba bawah ais dan menyerap medan magnetik Musytari."],
    ["arc", "Penyerap kuasa di celah rabung ais. Jika ia capai cas penuh, seluruh perisai armada kita lumpuh."],
    ["halo", "Kita menjunam ke celah rabung ais pada kelajuan tinggi. Kawal kedudukan sayap, Nova."],
    ["nova", "Mengekor rapat di belakang anda. Membaca rintangan dinding."],
  ],
  "c19-boss": [
    ["arc", "Abyssal Wyrm. Mesin modular gergasi beribu meter, meliuk keluar dari ais ke orbit rendah."],
    ["vex", "Saya dengar parti bermula tanpa saya."],
    ["nova", "Vex? Kapal awak bukan sudah musnah?"],
    ["vex", "Saya bina semula Fang daripada serpihan besi dan dendam. Dia sedia terbang."],
    ["halo", "Kawal sebelah kirinya, Vex. Kita kerat mesin ini kepada cebisan."],
    ["lumen", "Pancaran plasma pada sambungan badannya. Saya akan potong di mana ia meliuk."],
  ],
  "c19-outro": [
    ["arc", "Reaktor Wyrm musnah. Rekod navigasinya mengandungi koordinat seterusnya."],
    ["rin", "Cincin Zuhal. Medan bangkai kapal perang lama Armada Kroll."],
    ["vex", "Saya kenal kubur itu. Saya antara yang membantu memenuhinya dahulu."],
    ["halo", "Kalau begitu anda ketuai laluan. Saya dan Nova berada di sayap anda."],
  ],
};

const scenes4Ms: Record<"c20-intro" | "c20-boss" | "c20-outro", readonly Beat[]> = {
  "c20-intro": [
    ["rin", "Cincin Zuhal. Armada Kroll tumbang di sini, dan unit pemungut Vanguard sedang menjarah bangkai kapal."],
    ["vex", "Melihat bangkai kapal lama ini buat saya teringat masa anda tembak jatuh saya, Nova."],
    ["nova", "Tapi anda bangkit semula."],
    ["halo", "Awas medan serpihan. Setiap bangkai masih boleh ada senjata aktif. Vex di kiri, Lumen bersama Nova."],
    ["lumen", "Plasma sudah panas. Bangkai kapal perang sasaran mudah untuk dibakar."],
  ],
  "c20-boss": [
    ["arc", "Armada Reclaimer. Kubu pertahanan dibina daripada serpihan Kroll, mengisi senjata dengan peluru armada itu."],
    ["vex", "Itu peluru berpandu saya. Saya pasang sendiri dahulu. Saya hafal setiap satu sifatnya."],
    ["halo", "Beritahu kami bila ia akan melancar. Ia kumpul tenaga, tunggu seketika, dan tembak."],
    ["lumen", "Membakar rak peluncurnya. Awasi barisan tembakan anda, Komander."],
  ],
  "c20-outro": [
    ["mika", "Saya berjaya menyahsulit log Reclaimer. Vanguard mara ke planet luar untuk bekalkan kuasa gerbang."],
    ["rin", "Uranus dahulu. Mereka mahukan medan magnetiknya. Seluruh armada, tuju ke ribut Uranus."],
    ["halo", "Hanya ais dan kilat menanti di hadapan. Terbang rapat."],
    ["vex", "Ke mana sahaja anda mara, saya kekal di sebelah kiri anda."],
  ],
};

const localize = (all: Record<string, readonly Beat[]>): Record<string, Space3Line[]> =>
  Object.fromEntries(Object.entries(all).map(([key, beats]) => [key, beats.map(([who, text]): Space3Line => ({ who, text }))]));

/* Chapters 5 to 12: the outer system and the gate (space3-act2.ts). */
const scenesOuter: Record<string, readonly Beat[]> = {
  "c21-intro": [
    ["rin", "Uranus. Its magnetic field is tearing our guidance apart. Missiles will not lock in there."],
    ["arc", "Homing fire spins loose in the shear. Theirs too. Expect lightning, and drones that pull."],
    ["lumen", "Then it is beam work. Close in."],
    ["nova", "Close in it is."],
  ],
  "c21-boss": [
    ["arc", "Tempest Raider. An interceptor faster than anything we fly, armed with ion fans and a hyper beam."],
    ["vex", "It rams. Three times if you let it."],
    ["nova", "I will not let it."],
  ],
  "c21-outro": [
    ["mika", "The storm is behind us. There is a power source on Neptune's moon. Triton."],
    ["halo", "Nitrogen geysers and a relay station. Keep your altitude."],
  ],
  "c22-intro": [
    ["arc", "Triton. The ground erupts. Nitrogen columns from the craters, without warning."],
    ["halo", "And the cold near the floor slows the engines. Stay off the ground, Nova."],
    ["lumen", "Frigates ahead, throwing frost shells."],
  ],
  "c22-boss": [
    ["arc", "Cryo-Colossus. A walking bomber on frozen legs, with a frost tank on its back. Break the legs and the tank before the core."],
    ["vex", "It tears rock out of Triton and throws it at you. Shoot the rock."],
    ["nova", "Legs first."],
  ],
  "c22-outro": [
    ["rin", "The relay is dark. Their fleet is gathering at the Kuiper belt."],
    ["mika", "Their convoy is carrying singularity fuel cores."],
  ],
  "c23-intro": [
    ["halo", "Look at the size of this fleet. These are not raiders. This is the vanguard opening the road."],
    ["arc", "Ice floes drifting through the field. They stop shots, yours and theirs."],
    ["lumen", "Carriers launching drones. Hit the carriers."],
  ],
  "c23-boss": [
    ["arc", "Iron Goliath. A siege carrier with four hangars. Its core is shut while the hangars stand."],
    ["vex", "Break the hangars and it has nothing left but its guns."],
    ["nova", "Hangars, then the hull."],
  ],
  "c23-outro": [
    ["mika", "The convoy is down. The rest of their fleet has fallen back to the heliopause."],
    ["rin", "Aurora will push through their line. Zephyr, clear the way."],
  ],
  "c24-intro": [
    ["arc", "The heliopause. The solar wind pushes everything outward. You will feel it on the stick."],
    ["halo", "Solar flares sweeping the field. Watch the light, not the clock."],
    ["vex", "And lancers. Lots of lancers."],
  ],
  "c24-boss": [
    ["arc", "Aegis-Null. A sentinel behind three mirrors. Break the mirrors, then the core."],
    ["lumen", "Plasma on the mirrors."],
    ["nova", "Together."],
  ],
  "c24-outro": [
    ["rin", "Their blockade is broken. Aurora and the fleet are through to the Oort cloud."],
    ["arc", "Beyond the sun's protection now. If an engine dies out there, we drift forever."],
    ["nova", "Our engines will not die."],
  ],
  "c25-intro": [
    ["halo", "No sunlight out here. You see what you light, and nothing else."],
    ["arc", "Mines in the dark and hunters that are hard to see. They come from behind."],
    ["lumen", "I will keep my beam lit. Use it."],
  ],
  "c25-boss": [
    ["arc", "Void Stalker. It blinks around you and strikes from behind."],
    ["vex", "Keep turning. It wants your back."],
    ["nova", "Then it can come and get it."],
  ],
  "c25-outro": [
    ["mika", "There is a structure ahead. A ring. Thousands of kilometres across."],
    ["rin", "A megastructure, older than our species. Take a look inside, Zephyr."],
  ],
  "c26-intro": [
    ["arc", "A trench run along the inside of the ring. Walls above and below, and laser grids."],
    ["halo", "Narrow. Keep your speed and your nerve."],
    ["lumen", "Lancers on the walls."],
  ],
  "c26-boss": [
    ["arc", "Ring Keeper. The ring's guardian, with four laser nodes. The core is shut while they burn."],
    ["vex", "Break the nodes and it is blind."],
    ["nova", "Nodes first."],
  ],
  "c26-outro": [
    ["rin", "The Seed Core from Space 1. It was one of this ring's batteries."],
    ["mika", "Their flagship is ahead. The Aethelgard. Fifteen kilometres of hull."],
  ],
  "c27-intro": [
    ["rin", "All squadrons. We go at the Aethelgard's hull: shield generator, ion batteries, engines."],
    ["halo", "Kite will take the main guns. Vex, the armour."],
    ["vex", "With pleasure."],
    ["nova", "And I take the core."],
  ],
  "c27-boss": [
    ["arc", "The Warmaster. The flagship's war engine. Shield, two batteries and an engine, then the core."],
    ["halo", "I am taking its main shots. Go, Nova."],
    ["nova", "Going."],
  ],
  "c27-outro": [
    ["mika", "The Aethelgard is dead in space. The gate is ahead. It is opening."],
    ["rin", "Every ship we have, to the Hypergate."],
  ],
  "c28-intro": [
    ["arc", "The Hypergate. Its field bends every shot toward its middle, and pulls."],
    ["halo", "Its guardian is coming out to meet us."],
    ["lumen", "Commander. It has been an honour."],
    ["nova", "Save that for after."],
  ],
  "c28-boss": [
    ["arc", "The Herald. Two blades, then a singularity ring, then its true form. It does not stop."],
    ["vex", "No more tricks. Hit it with everything."],
    ["nova", "Everything."],
  ],
  "c28-outro": [
    ["arc", "The local invaders are destroyed. But the signal has already crossed to the other side of the galaxy."],
    ["halo", "Nova. Look at what is inside the gate."],
    ["nova", "This is not the end of the war. It is only the beginning."],
    ["rin", "Every ship of Earth and Aurora. Prepare to jump."],
  ],
};

const scenesOuterMs: Record<string, readonly Beat[]> = {
  "c21-intro": [
    ["rin", "Uranus. Medan magnetnya merosakkan panduan kita. Peluru berpandu tak boleh mengunci di sana."],
    ["arc", "Tembakan penjejak berpusing hilang dalam ribut. Tembakan mereka juga. Jangka kilat, dan dron yang menarik."],
    ["lumen", "Jadi kerja pancaran. Rapatkan jarak."],
    ["nova", "Rapat."],
  ],
  "c21-boss": [
    ["arc", "Tempest Raider. Pemintas lebih laju daripada apa yang kita terbangkan, dengan kipas ion dan rasuk hyper."],
    ["vex", "Ia merempuh. Tiga kali kalau anda biarkan."],
    ["nova", "Saya takkan biarkan."],
  ],
  "c21-outro": [
    ["mika", "Ribut di belakang kita. Ada sumber kuasa di bulan Neptun. Triton."],
    ["halo", "Geyser nitrogen dan stesen geganti. Jaga altitud."],
  ],
  "c22-intro": [
    ["arc", "Triton. Tanahnya meletus. Lajur nitrogen dari kawah, tanpa amaran."],
    ["halo", "Dan sejuk dekat lantai memperlahankan enjin. Jauhi tanah, Nova."],
    ["lumen", "Frigat di depan, melontar peluru beku."],
  ],
  "c22-boss": [
    ["arc", "Cryo-Colossus. Pengebom berkaki beku dengan tangki frost di belakang. Pecahkan kaki dan tangki sebelum teras."],
    ["vex", "Ia mencabut batu Triton dan melontar. Tembak batunya."],
    ["nova", "Kaki dulu."],
  ],
  "c22-outro": [
    ["rin", "Geganti padam. Armada mereka berkumpul di Lingkaran Kuiper."],
    ["mika", "Konvoi mereka membawa teras bahan api singulariti."],
  ],
  "c23-intro": [
    ["halo", "Tengok saiz armada ini. Ini bukan penyerang biasa. Ini pasukan pembuka jalan."],
    ["arc", "Bongkah ais hanyut di medan. Ia menghalang tembakan, kita dan mereka."],
    ["lumen", "Kapal induk melancarkan dron. Serang kapal induk."],
  ],
  "c23-boss": [
    ["arc", "Iron Goliath. Kapal induk kepungan dengan empat hangar. Terasnya tertutup selagi hangar berdiri."],
    ["vex", "Pecahkan hangar, ia tinggal dengan senjata sahaja."],
    ["nova", "Hangar, kemudian badan."],
  ],
  "c23-outro": [
    ["mika", "Konvoi musnah. Baki armada berundur ke heliopause."],
    ["rin", "Aurora akan menembusi barisan mereka. Zephyr, buka jalan."],
  ],
  "c24-intro": [
    ["arc", "Heliopause. Angin suria menolak semuanya ke luar. Anda akan rasa pada kawalan."],
    ["halo", "Suar suria menyapu medan. Perhati cahaya, bukan jam."],
    ["vex", "Dan lancer. Banyak lancer."],
  ],
  "c24-boss": [
    ["arc", "Aegis-Null. Pengawal di sebalik tiga cermin. Pecahkan cermin, kemudian teras."],
    ["lumen", "Plasma pada cermin."],
    ["nova", "Bersama."],
  ],
  "c24-outro": [
    ["rin", "Sekatan mereka pecah. Aurora dan armada sudah tembus ke awan Oort."],
    ["arc", "Di luar perlindungan matahari sekarang. Kalau enjin mati, kita hanyut selamanya."],
    ["nova", "Enjin kita takkan mati."],
  ],
  "c25-intro": [
    ["halo", "Tiada cahaya matahari di sini. Anda nampak apa yang disinari, itu sahaja."],
    ["arc", "Periuk api dalam gelap dan pemburu yang susah dilihat. Mereka datang dari belakang."],
    ["lumen", "Pancaran saya kekal menyala. Gunakannya."],
  ],
  "c25-boss": [
    ["arc", "Void Stalker. Ia berkelip mengelilingi anda dan menyerang dari belakang."],
    ["vex", "Teruskan berpusing. Ia mahu belakang anda."],
    ["nova", "Biar ia datang ambil."],
  ],
  "c25-outro": [
    ["mika", "Ada struktur di depan. Sebuah cincin. Beribu kilometer lebar."],
    ["rin", "Megastruktur, lebih tua daripada spesies kita. Tengok ke dalam, Zephyr."],
  ],
  "c26-intro": [
    ["arc", "Larian parit di dalam cincin. Dinding di atas dan bawah, dan grid laser."],
    ["halo", "Sempit. Jaga kelajuan dan keberanian."],
    ["lumen", "Lancer di dinding."],
  ],
  "c26-boss": [
    ["arc", "Ring Keeper. Penjaga cincin, dengan empat nod laser. Terasnya tertutup selagi nod menyala."],
    ["vex", "Pecahkan nod, ia buta."],
    ["nova", "Nod dulu."],
  ],
  "c26-outro": [
    ["rin", "Seed Core dari Space 1. Ia salah satu bateri cincin ini."],
    ["mika", "Kapal bendera mereka di depan. Aethelgard. Lima belas kilometer badan kapal."],
  ],
  "c27-intro": [
    ["rin", "Semua skuadron. Kita serang badan Aethelgard: penjana perisai, bateri ion, enjin."],
    ["halo", "Kite ambil meriam utama. Vex, perisai."],
    ["vex", "Dengan senang hati."],
    ["nova", "Dan saya ambil teras."],
  ],
  "c27-boss": [
    ["arc", "The Warmaster. Enjin perang kapal bendera. Perisai, dua bateri dan enjin, kemudian teras."],
    ["halo", "Saya tahan tembakan utamanya. Pergi, Nova."],
    ["nova", "Pergi."],
  ],
  "c27-outro": [
    ["mika", "Aethelgard mati di angkasa. Pintu gerbang di depan. Ia sedang terbuka."],
    ["rin", "Semua kapal yang ada, ke Hypergate."],
  ],
  "c28-intro": [
    ["arc", "Hypergate. Medannya melencongkan setiap tembakan ke tengah, dan menarik."],
    ["halo", "Penjaganya keluar menyambut kita."],
    ["lumen", "Komander. Satu penghormatan."],
    ["nova", "Simpan untuk lepas ini."],
  ],
  "c28-boss": [
    ["arc", "The Herald. Dua bilah, kemudian cincin singulariti, kemudian bentuk sebenarnya. Ia tak berhenti."],
    ["vex", "Tiada helah lagi. Serang dengan semuanya."],
    ["nova", "Semuanya."],
  ],
  "c28-outro": [
    ["arc", "Penceroboh tempatan musnah. Tetapi isyarat itu sudah sampai ke seberang galaksi."],
    ["halo", "Nova. Tengok apa yang ada di dalam gerbang itu."],
    ["nova", "Ini bukan pengakhiran perang. Ini baru permulaan."],
    ["rin", "Seluruh armada Bumi dan Aurora. Bersedia untuk lompatan."],
  ],
};

export const SPACE3_STORY = {
  en: localize({ ...scenes, ...scenes2, ...scenes3, ...scenes4, ...scenesOuter }),
  ms: localize({ ...scenesMs, ...scenes2Ms, ...scenes3Ms, ...scenes4Ms, ...scenesOuterMs }),
};
