export interface TruthDareItem {
  id: string;
  text: string;
  level: 'hafif' | 'parti' | 'atesli';
}

export const TRUTH_BY_LEVEL = {
  hafif: [
    "Masadaki kimin büyük bir sırrını öğrenmek istersin ve neden?",
    "Hayatında aldığın en saçma ya da pişman olduğun hediye neydi?",
    "Telefonunda şu an en çok dinlediğin utanç verici şarkı hangisi?",
    "Çocukken inandığın en absürt yalan neydi?",
    "Grupta ilk izlenimi sende en çok değişen kişi kim oldu?",
    "Hiç bilerek birinin mesajını günlerce görmezden geldin mi?",
    "En son ne zaman birine sahte bir bahane uydurdun ve bahane neydi?",
    "Eğer bir günlüğüne görünmez olsaydın yapacağın ilk muziplik ne olurdu?",
    "Kendi hakkında insanların bilmediği en tuhaf veya takıntılı alışkanlığın nedir?",
    "En son hangi saçma şeye ağladın ya da duygusallaştın?",
    "Telefonundaki arama geçmişinde en son arattığın komik şey nedir?",
    "Bir restoranda yemeği beğenmeyip ses çıkarmadan hesabı ödediğin oldu mu?",
    "Masadakilerden birinin tarzını veya giyimini bir günlüğüne kopyalayacak olsan kimi seçerdin?",
    "Bugüne kadar izlediğin en kötü film veya dizi hangisiydi?",
    "Hiç birine hediye edilen şeyi başkasına hediye (re-gift) ettin mi?",
    "Okulda veya işte yakalanmadığın en komik kural ihlalin neydi?",
    "En son ne zaman birine sahte gülümseme taktın?",
    "Kendi burcunla ilgili en nefret ettiğin klişe nedir ve katılıyor musun?",
    "Grupta 'Bununla asla aynı evde 1 hafta kalamam' dediğin kişi kim?",
    "Sabah kalktığında aynaya bakıp söylediğin ilk dürüst cümle nedir?",
    "Asla yemem dediğin halde gizlice bayılarak yediğin şey ne?",
    "En son kime 'yoldayım' deyip aslında yataktan yeni kalktın?",
    "Bir çizgi film karakteriyle evlenmek zorunda kalsan kimi seçerdin?",
    "Masada en kötü espriyi yapan kişi sence kim? (Masa onaylayacak!)",
    "Telefonunun şarjı %1 kaldığında hissettiğin en büyük panik anını anlat!"
  ],
  parti: [
    "Masadakilerden biriyle ıssız bir adada 1 ay mahsur kalsan kimi seçerdin ve neden?",
    "Telefonunda şu an kimsenin görmesini istemediğin son fotoğraf nedir?",
    "Gruptaki birisiyle bir suç ortaklığı yapsan bu kim olurdu ve ilk ne yapardınız?",
    "En son ne zaman büyük bir yalan söyledin ve sebebi neydi?",
    "Birine yanlışlıkla gönderdiğin en utanç verici mesaj veya ekran görüntüsü neydi?",
    "Sosyal medyada en son kime stalk yaptın ve ne buldun?",
    "Masadaki hangi arkadaşının flört tarzını içten içe felaket buluyorsun?",
    "Hiç masadaki birinin arkasından daha sonra pişman olduğun bir laf ettin mi?",
    "Eski sevgilini en son ne zaman gizlice sosyal medyada arattın?",
    "Grupta en çabuk gaza gelen ve en kolay kandırılan kişi sence kim?",
    "Bir buluşmadan erken kaçmak için uydurduğun en yaratıcı veya absürt bahane neydi?",
    "Şu an telefonundaki banka hesap bakiyeni tam olarak tahmin et, sonra masaya göster!",
    "Masadaki birinin yerine 24 saatliğine geçsen ilk yapacağın hareket ne olurdu?",
    "Hayatında yaptığın en büyük para israfı veya alışveriş fiyaskosu neydi?",
    "Hiç bir arkadaşının hoşlandığı kişiye karşı gizliden bir sempati besledin mi?",
    "En son ne zaman alkol veya uykusuzluk yüzünden komik bir rezillik yaşadın?",
    "Masada en çok 'hesap ödemekten kaçan' potansiyeline sahip kişi kim?",
    "Sosyal medyada beğeni veya dikkat çekmek için yaptığın en cringe hareket neydi?",
    "Bir dedikodu duyduğunda 'bunu kimseye söylememeliyim' deyip anında anlattığın kişi kimdi?",
    "Gruptaki herkesin önünde telefonundaki son WhatsApp grup mesajını sesli okur musun?",
    "Masada en çok sır tutamayacak kişi sence kim?",
    "Hiç birinin doğum gününü tamamen unutup o anda çaktırmadan hediye uydurdun mu?",
    "Bir buluşmada karşındakinin dişinde bir şey kaldığında söyleyemeyip sustuğun oldu mu?",
    "Kendi ailene veya arkadaşlarına söylediğin en masum görünen ama en büyük yalan neydi?",
    "Masadaki birine şu an tamamen dürüstçe bir eleştiri yapacak olsan ne söylerdin?"
  ],
  atesli: [
    "Bu masada gizliden hoşlandığın ya da bir dönem hafif etkilendiğin biri oldu mu?",
    "Eski sevgilinin sana söylediği en ağır veya unutamadığın cümle neydi?",
    "Kimsenin bilmediği, duyulursa rezil olacağını düşündüğün en büyük sırrın ne?",
    "Hiç arkadaşının sevgilisine veya flörtüne karşı bir anlık bile olsa çekim hissettin mi?",
    "Hayatındaki en çılgın, kaotik veya pişmanlık dolu geceyi 3 cümleyle özetle!",
    "Masadakilerden biriyle 24 saat boyunca kelepçeli yaşamak zorunda olsan kimi seçerdin?",
    "Telefonundaki son DM / mesajlaşmanı masadaki birine 15 saniye okutur musun?",
    "Aşk hayatındaki en büyük fiyasko veya terk edilme hikayen neydi?",
    "Hiç birine sırf yalnız kalmamak için 'seni seviyorum' veya benzeri bir şey dedin mi?",
    "Masada oturanlardan biriyle sahte bir evlilik yapmak zorunda kalsan kimi seçerdin?",
    "Telefonundaki gizli fotoğraflar veya silinenler albümünde ne tür şeyler var?",
    "Bir ilişkide yaptığın en toksik veya kıskançça hareket neydi?",
    "Hiç birini etkilemek için kendini olmadığın biri gibi tanıttığın oldu mu?",
    "Masadakilerden birinin sevgilisiyle baş başa kalsan en çok çekineceğin kişi kim?",
    "Eski sevgilinin eşyalarını hiç sinirle çöpe attın mı ya da yaktın mı?",
    "En son ne zaman aşk acısından saçma sapan bir şarkıyı sabaha kadar dinledin?",
    "Masada 'bu kişinin flört tavsiyeleri tam bir facia' dediğin kişi kim?",
    "Hiç yakalanacağını bile bile cesurca bir kuralı çiğnedin mi?",
    "Bir buluşmada karşındakini beğenmeyip tuvaletten kaçtığın veya arkadaşına arattığın oldu mu?",
    "Masadakilerden birinin telefon şifresini bilseydin ilk hangi uygulamasına bakardın?",
    "Şu anki sevgilin veya son flörtün hakkında masaya daha önce hiç anlatmadığın bir detay!",
    "Grupta 'Bunun aşk hayatı film olsa gişe rekoru kırar' dediğin kişi kim?",
    "Sosyal medyada birine bilerek kıskandırmak için yaptığın en planlı hamle neydi?",
    "Hiç iki kişi arasında kalıp ikisini de bir süre idare ettiğin oldu mu?",
    "Bu masada sana göre en çekici veya en karizmatik kişi kim? (Gözlerinin içine bakarak söyle!)"
  ]
};

export const DARE_BY_LEVEL = {
  hafif: [
    "Son aradığın kişiyi hoparlöre al ve 20 saniye boyunca sadece şarkı söyleyerek konuş!",
    "Gruptaki bir kişinin taklidini yap, masadakiler kim olduğunu tahmin etsin!",
    "Instagram veya WhatsApp durumuna sadece bir 'Patates 🥔' emojisi at ve 5 dakika silme!",
    "Yanındaki kişinin seçtiği rastgele bir şarkıda 20 saniye ritmik dans et!",
    "Masadaki herkes için sırayla 3 kelimelik komik ve yaratıcı lakaplar uydur!",
    "Gözlerini kapat ve masadaki birinin sana dokundurduğu nesneyi dokunarak tahmin et!",
    "Önündeki bardağı bir mikrofon gibi tutup son dakika haber bülteni sun!",
    "Sonraki tura kadar konuşurken her cümlenin sonuna 'sayın seyirciler' ekle!",
    "Masadaki birinin ayakkabısını çıkar ve sanki telefonmuş gibi kulağına götürüp konuş!",
    "30 saniye boyunca masadaki herkesle hiç göz kırpmadan sırayla bakış!",
    "Yanındaki kişinin saç modelini kendi ellerinle 1 dakikalığına değiştir!",
    "15 saniye boyunca opera sanatçısı gibi arya söyle!",
    "Önündeki boş peçeteye masadaki en komik kişinin karikatürünü çiz!",
    "Solundaki kişiye saray beyefendisi / leydisi gibi abartılı bir iltifat et!",
    "Gruptaki herkes sana sırayla 1'er hızlı soru sorsun, düşünmeden ilk aklına geleni haykır!",
    "Bir tur boyunca masanın en ciddi insanı gibi otur ve kimseyle gülüşme!",
    "Masanın etrafında bir penguen gibi paytak paytak 1 tur dön!",
    "Telefonunun Siri'sini veya sesli asistanını aç ve 'Beni seviyor musun?' diye sor!",
    "Masadaki birinin elini öp ve 'Büyük ustam' diyerek saygı duruşuna geç!",
    "10 saniye boyunca robot gibi hareket et ve metalik ses tonuyla masaya hitap et!"
  ],
  parti: [
    "Masadaki en son mesaj atan kişiye komik bir ses kaydı gönder (örn: Çığlık veya şiir)!",
    "Rehberindeki 7. kişiyi ara ve 'Acil penguen veya devekuşu nereden bulabilirim?' diye sor!",
    "Bir sonraki tura kadar konuşurken her cümlenin sonuna 'miyim acaba?' sorusunu ekle!",
    "Masadaki herkes sana 1'er kuruyemiş veya cips ikram etsin, ellerini kullanmadan ye!",
    "Instagram'da karşına çıkan ilk hikayeye düşünmeden alkış veya alev emojisi at!",
    "Masadakilerin ortak belirleyeceği birine WhatsApp'tan 'Seninle acil bir şey konuşmam lazım...' yaz!",
    "Sağındaki kişinin telefonundan kendi profiline 1 kelimelik komik bir yorum at!",
    "Masadaki birinin kol saatini veya yüzüğünü tak ve sonraki tura kadar onun gibi davran!",
    "30 saniye boyunca bir talk-show sunucusu gibi masadaki en sessiz kişiyi röportaja al!",
    "Kendi galerindeki en eski ekran görüntüsünü masadaki herkese göster!",
    "Önündeki içeceği veya suyu pipetsiz, kedi gibi dille içmeye çalış!",
    "Masadaki iki kişiyi birbirine öve öve bitiremeyecek şekilde evlendirme memuru gibi tanıt!",
    "Son arama kaydındaki ilk 3 ismi masaya yüksek sesle açıkla!",
    "Bir sonraki tura kadar ne söylenirse söylensin sadece 'Kesinlikle katılıyorum' de!",
    "Gruptan birinin taklidini öyle bir yap ki o kişi 'ben bunu asla yapmam' desin!",
    "Telefonunu solundaki kişiye ver, 15 saniye boyunca sadece Spotify veya YouTube geçmişine baksın!",
    "Masadaki birine içten bir sarıl ve 10 saniye boyunca bırakma!",
    "Cebinde veya çantanda ne varsa masaya dök ve hepsinin hikayesini 30 saniyede anlat!",
    "Masadakilerin seçeceği acı/ekşi bir sosu veya limonu yüzünü ekşitmeden ye!",
    "En sevdiğin Türkçe pop şarkısının nakaratını bağıra çağıra masaya söyle!"
  ],
  atesli: [
    "Telefonunun galeri arama kısmına 'screenshot' yaz ve çıkan 3. ekran görüntüsünü masaya aç!",
    "Masadaki birinin gözlerinin içine 30 saniye boyunca hiç gülmeden ve göz kaçırmadan bak!",
    "Telefonunu sağındaki kişiye ver; 30 saniye boyunca galerine veya mesaj bildirimlerine baksın!",
    "Rehberinden rastgele seçilen birine 'Rüyamda seni gördüm, çok garipti...' yaz ve gelen cevabı masaya oku!",
    "Masadaki en cesur kişi kimse onun seçeceği bir masa cezasını itirazsız uygula!",
    "Instagram hikayene sadece siyah arka plan üzerine 'Her şey bitti.' yaz ve 3 dakika tut!",
    "Masadaki karşı cinsten (veya ilgi duyduğun) birine en beğendiğin 3 fiziksel özelliğini söyle!",
    "Telefonundaki son gelen 3 bildirimi kimden geldiğiyle birlikte yüksek sesle masaya oku!",
    "Masadakilerden birinin omzuna başını yasla ve sonraki tura kadar öyle kal!",
    "Solundaki kişinin kulağına masadaki başka biri hakkında gizli bir fısıltı söyle!",
    "Masadaki birinin elini tut ve romantik bir dizi sahnesindeki gibi tirat oku!",
    "Telefonundaki engellenenler (block listesi) sayısını masaya göster ve en son engellediğini açıkla!",
    "Masadaki birine 'Eğer dünyada sadece ikimiz kalsaydık...' ile başlayan bir cümle kur!",
    "Son WhatsApp konuşmandaki son cümleyi ses tonunu hiç değiştirmeden dramatik şekilde oku!",
    "Masadaki birinin parfümünü veya kokusunu koklayıp 10 üzerinden puan ver!",
    "En son attığın flört mesajının ekran görüntüsünü 5 saniye masaya flaşla!",
    "Masadaki herkesin telefonunu ortaya koyup 1 tur boyunca gelen bildirimleri sesli okuma kuralı başlat!",
    "Gruptaki en çekici bulduğun kişiye masanın önünde zarif bir iltifat sun!",
    "Telefonundaki notlar uygulamasını aç ve en son aldığın notu sansürsüz oku!",
    "Masadaki herkes senin hakkında tek bir cesur iddia söylesin, doğru olanı itiraf et!"
  ]
};

export interface PartyRoomPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isTurn: boolean;
  avatarColor: string;
}

import { createSvgAvatar } from '../utils/playerManager';

export const INITIAL_ROOM_PLAYERS: PartyRoomPlayer[] = [
  {
    id: 'p1',
    name: 'Arda Çetin',
    avatar: createSvgAvatar('#06b6d4', '#1e40af', '🦁'),
    score: 30,
    isTurn: true,
    avatarColor: '#bef264'
  },
  {
    id: 'p2',
    name: 'Selin Yılmaz',
    avatar: createSvgAvatar('#ec4899', '#7c3aed', '🦊'),
    score: 20,
    isTurn: false,
    avatarColor: '#f751a1'
  },
  {
    id: 'p3',
    name: 'Ege Demir',
    avatar: createSvgAvatar('#bef264', '#047857', '⚡'),
    score: 40,
    isTurn: false,
    avatarColor: '#4cd7f6'
  },
  {
    id: 'p4',
    name: 'Melis Kaya',
    avatar: createSvgAvatar('#f59e0b', '#b45309', '🐯'),
    score: 10,
    isTurn: false,
    avatarColor: '#f59e0b'
  },
  {
    id: 'p5',
    name: 'Bora Aksoy',
    avatar: createSvgAvatar('#a855f7', '#4c1d95', '👑'),
    score: 25,
    isTurn: false,
    avatarColor: '#a855f7'
  }
];
