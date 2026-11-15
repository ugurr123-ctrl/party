// VIP Exclusive Party Games Data Deck
// High-tension, dark neon arcade data for all 11 VIP Party Games

export interface TabooCard {
  target: string;
  category: string;
  mines: string[];
}

export interface SecretCase {
  id: string;
  secret: string;
  clue: string;
  category: string;
}

export interface KaraokeSong {
  title: string;
  artist: string;
  hint: string;
  genre: string;
}

export interface TelepathyPrompt {
  question: string;
  exampleA: string;
  exampleB: string;
}

export const LIE_DETECTOR_PROMPTS = [
  "Masada en çok kıskandığın kişinin adını ve nedenini 15 saniyede itiraf et!",
  "Bu masada eski sevgiline en çok benzeyen kişi kim ve neden?",
  "Son 1 ayda bir arkadaşına söylediğin en büyük yalan neydi?",
  "Telefonunda kimsenin görmesini asla istemediğin gizli bir fotoğraf veya mesaj var mı?",
  "Masadakilerden birinin arkasından en son ne konuştun?",
  "Eski sevgilini en son ne zaman gizlice sosyal medyada stalkladın?",
  "Bir buluşmada sırf eve erken dönmek için uydurduğun en absürt bahane neydi?",
  "Masadaki birinin tarzını veya giyimini gizliden hiç beğenmediğin oldu mu?",
  "Hiç masadaki birinin sevgilisinden veya flörtünden etkilendiğin oldu mu?",
  "Şu an telefonundaki banka bakiyesini kuruşu kuruşuna doğru söyleyebilir misin?",
  "Bir arkadaşının sırrını başka birine ağzından kaçırdığın oldu mu?",
  "Bugün masaya gelmeden önce aklından geçen en kötü düşünce neydi?",
  "Hiç birine aşık olmadığı halde aşıkmış gibi davrandın mı?",
  "İş veya okulda bir hatanı başkasının üstüne yıktığın oldu mu?",
  "Masada 'bu kişiyle asla baş başa tatile gitmem' dediğin biri var mı?"
];

export const BLIND_DRAWING_TASKS = [
  { word: "Uçan Halıda Çay Partisi", hint: "Fantastik & Sıcak" },
  { word: "Uzayda Döner Yiyen Astronot", hint: "Yemek & Uzay" },
  { word: "Piknik Yapan Vampir", hint: "Korku & Komedi" },
  { word: "Paraşütle İnen Penguen", hint: "Kutup & Havacılık" },
  { word: "Disko Dansı Yapan Robot", hint: "Müzik & Teknoloji" },
  { word: "Trafikte Korna Çalan Zürafa", hint: "Şehir & Hayvan" },
  { word: "Kedisine Takım Elbise Giyindiren Patron", hint: "Ofis & Evcil Hayvan" },
  { word: "Kaykay Kayak Yapan Ayı", hint: "Kış & Doğa" },
  { word: "Tüplü Dalış Yapan Kedi", hint: "Denizaltı" },
  { word: "Yangın Söndüren Ejderha", hint: "İroni & Mitoloji" },
  { word: "Düğünde Halay Çeken İskelet", hint: "Kutlama & Absürt" },
  { word: "Mikrofona Şarkı Söyleyen Tavuk", hint: "Sahne Performansı" }
];

export const CHAOS_ROULETTE_SEGMENTS = [
  { id: '1', text: "Son Arama Kaydını Sesli Dinlet", color: "#f751a1", penalty: "Hoparlörde dinlet veya 2 shot ceza" },
  { id: '2', text: "Masadaki En Pahalı Tatlıyı Ismarla", color: "#f59e0b", penalty: "Adres adisyonuna ekle" },
  { id: '3', text: "Instagram Hikayende Yanındakiyle Fotoğraf Paylaş", color: "#4cd7f6", penalty: "Hikayeye 1 saat kalsın" },
  { id: '4', text: "1 Tur Boyunca Sadece Fısılda", color: "#a855f7", penalty: "Normal konuşursan ceza puanı" },
  { id: '5', text: "★ KORUMALI ALAN (GÜVENDE!) ★", color: "#bef264", penalty: "Sıfır ceza, şanslısın!" },
  { id: '6', text: "Tüm Masa Sana Özel Bir Soru Sorsun", color: "#f751a1", penalty: "Kaçamazsın, dürüst cevapla" },
  { id: '7', text: "👑 JACKPOT! (+100 VIP PUAN)", color: "#eab308", penalty: "Masa sana alkış tutsun!" },
  { id: '8', text: "Masadaki Birinin Telefonundan İstediğin DM'i At", color: "#ef4444", penalty: "Telefonu teslim et" },
  { id: '9', text: "Son WhatsApp Ses Kaydını Dinlet", color: "#3b82f6", penalty: "Gruptan veya özelden ses aç" },
  { id: '10', text: "Galerindeki 15. Fotoğrafı Masaya Göster", color: "#ec4899", penalty: "Ekranı çevir" }
];

export const GALLERY_ROULETTE_DARES = [
  { target: "KASIM 2023", desc: "Galerindeki o aydan en eski ekran görüntüsünü masaya aç", danger: "YÜKSEK" },
  { target: "WHATSAPP MEDYA", desc: "Aldığın son şüpheli veya komik fotoğrafı masaya göster", danger: "KRİTİK" },
  { target: "EKRAN SÜRESİ", desc: "Bugünkü ekran süresi istatistiğini ve en çok açılan uygulamayı göster", danger: "ORTA" },
  { target: "INSTAGRAM DM", desc: "DM kutundaki en üstteki 3 konuşmanın sadece ilk mesajını oku", danger: "AŞIRI" },
  { target: "SON SİLİNENLER", desc: "Son silinenler klasöründe en son sildiğin fotoğrafı açıkla", danger: "KRİTİK" },
  { target: "GOOGLE ARAMALARI", desc: "Tarayıcı arama geçmişindeki son 3 aramayı masaya yüksek sesle oku", danger: "AŞIRI" },
  { target: "KAYDEDİLENLER", desc: "Instagram veya TikTok'ta en son kaydettiğin videoyu masaya izlet", danger: "ORTA" },
  { target: "NOTLAR UYGULAMASI", desc: "Telefonun notlarındaki en son veya en saçma notu oku", danger: "YÜKSEK" }
];

export const TELEPATHY_PROMPTS: TelepathyPrompt[] = [
  { question: "İLK BULUŞMADA ASLA YENMEYECEK YEMEK?", exampleA: "Lahmacun", exampleB: "Kokoreç" },
  { question: "SARI RENKLİ BİR MEYVE VEYA SEBZE?", exampleA: "Muz", exampleB: "Limon" },
  { question: "EN KLASİK GEÇ KALMA BAHANESİ?", exampleA: "Trafik", exampleB: "Alarm çalmadı" },
  { question: "TÜRKİYE'NİN EN KAOTİK ŞEHRİ?", exampleA: "İstanbul", exampleB: "Adana" },
  { question: "BİR SÜPER KAHRAMAN SÖYLE?", exampleA: "Batman", exampleB: "Spider-Man" },
  { question: "DÜĞÜNDE İLK ÇALINACAK ŞARKI VEYA HALAY?", exampleA: "Damat Halayı", exampleB: "Erik Dalı" },
  { question: "PAZARTESİ SABAHINI ANLATAN BİR KELİME?", exampleA: "Kahve", exampleB: "Uyku" },
  { question: "EN ÇOK KULLANILAN EMOJİ?", exampleA: "Gülmekten ağlayan 😂", exampleB: "Alev 🔥" },
  { question: "KORKU FİLMİNDE İLK ÖLECEK KARAKTER TİPİ?", exampleA: "Aptal sarışın", exampleB: "Meraklı çocuk" },
  { question: "EN ÇOK SİPARİŞ VERİLEN FAST FOOD?", exampleA: "Pizza", exampleB: "Burger" }
];

export const HOSTAGE_PHONE_DARES = [
  {
    id: 'read_notif',
    title: "Bildirimi Sesli Oku",
    desc: "Telefon sahibine gelen son bildirim veya mesajı kelimesi kelimesine masaya oku.",
    votes: 4,
    pct: 57,
    level: "AŞIRI"
  },
  {
    id: 'speaker_call',
    title: "Hoparlöre Alıp Cevapla",
    desc: "Gelecek aramayı masa önünde hoparlörde aç ve 30 saniye boyunca hiç bozuntuya vermeden konuş.",
    votes: 2,
    pct: 29,
    level: "KRİTİK"
  },
  {
    id: 'story_post',
    title: "Hikaye Meydan Okuması",
    desc: "Masanın çekeceği kaotik bir fotoğrafı 'Hatalar yapıldı...' notuyla hikayede paylaş.",
    votes: 1,
    pct: 14,
    level: "YÜKSEK"
  }
];

export const SECRET_DETECTIVE_CASES: SecretCase[] = [
  {
    id: 'c1',
    secret: "Lisedeyken arkadaşımın sevgilisini gizlice arayıp başka biri olduğunu söyleyerek ayrılmalarına sebep oldum...",
    clue: "Telefonla aramayı çok sever, gizli numaralardan nefret eder.",
    category: "Geçmiş İtirafları"
  },
  {
    id: 'c2',
    secret: "Maaşımı aileme ve arkadaşlarıma neredeyse 2 katı fazla söyledim ve hâlâ öyle sanıyorlar.",
    clue: "Masanın en bonkörü gibi davranmaya bayılır.",
    category: "Maddi Yalanlar"
  },
  {
    id: 'c3',
    secret: "Masadaki birinin eski sevgilisine 6 ay önce gizlice mesaj attım ama bana geri dönmedi.",
    clue: "Gece geç saatlerde Instagram'da aktif olmayı sever.",
    category: "Gizli Flört"
  },
  {
    id: 'c4',
    secret: "Arkadaşımın evindeki pahalı parfümü yanlışlıkla kırdım ve köpeğin çarptığını söyledim.",
    clue: "Kusursuz masum yüz ifadesi yapma ustasıdır.",
    category: "Sakar Suçlar"
  },
  {
    id: 'c5',
    secret: "Tatildeyken sırf hesabı bölüşmemek için cüzdanımı otelde unuttum yalanı söyledim.",
    clue: "Masaya hesap geldiğinde genelde tuvalete gider.",
    category: "Hesap Taktikleri"
  }
];

export const KARAOKE_HUM_SONGS: KaraokeSong[] = [
  { title: "Kuzu Kuzu", artist: "Tarkan", hint: "Zilli dans & Dönüş", genre: "Pop Klasik" },
  { title: "Her Şeyi Yak", artist: "Duman", hint: "Rock & Çakmak", genre: "Türkçe Rock" },
  { title: "Kafama Göre", artist: "Athena", hint: "Ska & Zıplama", genre: "Rock" },
  { title: "Kırmızı", artist: "Hande Yener", hint: "Sana kırmızı çok yakışıyor", genre: "2000'ler Pop" },
  { title: "Affet", artist: "Müslüm Gürses", hint: "Derin melankoli & Jilet", genre: "Arabesk" },
  { title: "Bilmem Mi?", artist: "Sefo", hint: "Hızlı nakarat & Trap", genre: "Modern Hip-Hop" },
  { title: "Aşkın Olayım", artist: "Simge", hint: "Icardi & Stat marşı", genre: "Hit Pop" },
  { title: "Suspus", artist: "Ceza", hint: "Işık hızında rap", genre: "Türkçe Rap" },
  { title: "Kaçın Kurası", artist: "Sezen Aksu", hint: "Kurnaz & Flörtöz", genre: "Sezen Klasikleri" },
  { title: "Dönence", artist: "Barış Manço", hint: "Simsiyah gecenin koynundayım", genre: "Anadolu Rock" }
];

export const CHAOS_TABOO_CARDS: TabooCard[] = [
  {
    target: "DÖNER",
    category: "Sokak Lezzeti",
    mines: ["Et", "Tavuk", "Dürüm", "Lavaş", "Bursa / İskender"]
  },
  {
    target: "METROBÜS",
    category: "Ulaşım Kaosu",
    mines: ["İstanbul", "Zincirlikuyu", "Kalabalık", "Otobüs", "Söğütlüçeşme"]
  },
  {
    target: "INSTAGRAM",
    category: "Sosyal Medya",
    mines: ["Hikaye / Story", "Fotoğraf", "DM", "Reels", "Mavi Tik"]
  },
  {
    target: "FAL",
    category: "Mistik & Kafe",
    mines: ["Kahve", "Fincan", "Kısmet", "Telve", "Üç Vakte Kadar"]
  },
  {
    target: "NAZAR",
    category: "Geleneksel",
    mines: ["Göz", "Mavi Boncuk", "Kurşun", "Kem Göz", "Tütsü"]
  },
  {
    target: "KAHVE",
    category: "İçecek & Sohbet",
    mines: ["Starbucks", "Süt", "Espresso", "Kafein", "Fincan"]
  },
  {
    target: "DÜĞÜN",
    category: "Tören & Kaos",
    mines: ["Gelin", "Damat", "Halay", "Altın", "Pasta"]
  },
  {
    target: "TATİL",
    category: "Yaz & Dinlenme",
    mines: ["Otel", "Deniz", "Plaj", "Bavul", "Uçak"]
  }
];
