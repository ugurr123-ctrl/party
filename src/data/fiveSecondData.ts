export interface FiveSecCard {
  id: string;
  prompt: string;
  category: 'kaos' | 'komik' | 'gunluk' | 'populer' | 'parti' | 'zor';
  categoryTitle: string;
  categoryColor: string;
  categoryBg: string;
  tag: string;
  hint?: string;
}

export interface FiveSecPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isReady: boolean;
  avatarColor: string;
}

export const INITIAL_FIVE_SEC_PLAYERS: FiveSecPlayer[] = [
  {
    id: 'p1',
    name: 'Selin Yıldız',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    score: 30,
    isReady: true,
    avatarColor: '#f751a1'
  },
  {
    id: 'p2',
    name: 'Burak Demir',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    score: 20,
    isReady: true,
    avatarColor: '#4cd7f6'
  },
  {
    id: 'p3',
    name: 'Ece Kaya',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    score: 10,
    isReady: true,
    avatarColor: '#bef264'
  },
  {
    id: 'p4',
    name: 'Can Arslan',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    score: 10,
    isReady: true,
    avatarColor: '#F59E0B'
  },
  {
    id: 'p5',
    name: 'Zeynep Kurt',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    score: 0,
    isReady: false,
    avatarColor: '#d0bcff'
  }
];

export const FIVE_SEC_CATEGORIES = [
  { id: 'all', label: 'Tüm Kartlar' },
  { id: 'kaos', label: 'Kaos & Flört 🔥' },
  { id: 'komik', label: 'Komik & Absürt 😂' },
  { id: 'gunluk', label: 'Günlük Panik ⚡' },
  { id: 'populer', label: 'Popüler Kültür 🎬' },
  { id: 'parti', label: 'Parti & Gece 🍸' },
  { id: 'zor', label: 'Zor & Terleten 🧠' }
];

export const FIVE_SEC_CARDS: FiveSecCard[] = [
  // Kaos & Flört 🔥
  {
    id: 'k1',
    prompt: '3 tane eski sevgili bahanesi söyle!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Aşk & Dram'
  },
  {
    id: 'k2',
    prompt: 'İlk buluşmada söylenmeyecek 3 şey say!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Kırmızı Çizgi'
  },
  {
    id: 'k3',
    prompt: '3 tane stalk yapma taktiği söyle!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Dedektiflik'
  },
  {
    id: 'k4',
    prompt: "Gece saat 03:00'te atılan 3 pişmanlık mesajı say!",
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Gece Mesaisi'
  },
  {
    id: 'k5',
    prompt: '3 tane "arkadaş kalalım" uydurması say!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Friendzone'
  },
  {
    id: 'k6',
    prompt: 'Flörtünü ghostlamak için 3 uydurma sebep söyle!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Ghosting'
  },
  {
    id: 'k7',
    prompt: 'Biriyle buluşmadan önce kontrol edilen 3 şey say!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Randevu Hazırlığı'
  },
  {
    id: 'k8',
    prompt: 'Bir ilişkideki en büyük 3 "Red Flag" söyle!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Alarm Zilleri'
  },
  {
    id: 'k9',
    prompt: 'Eski sevgilinin hediyesini saklamak için 3 bahane say!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Koleksiyon'
  },
  {
    id: 'k10',
    prompt: 'Yanlış kişiye atılan mesajdan sonra uydurulacak 3 yalan!',
    category: 'kaos',
    categoryTitle: 'Kaos & Flört',
    categoryColor: 'text-rose-400',
    categoryBg: 'bg-rose-500/20 border-rose-500/30',
    tag: 'Kaza Kırım'
  },

  // Komik & Absürt 😂
  {
    id: 'a1',
    prompt: 'Bir uzaylıya ikram edilecek 3 geleneksel Türk yemeği say!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Galaktik Menü'
  },
  {
    id: 'a2',
    prompt: 'Cenazede kesinlikle söylenmeyecek 3 cümle söyle!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Kritik Durum'
  },
  {
    id: 'a3',
    prompt: 'Zombi istilasında ilk feda edeceğin 3 eşya söyle!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Hayatta Kalma'
  },
  {
    id: 'a4',
    prompt: '3 tane tamamen işe yaramaz süper güç say!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Garip Güçler'
  },
  {
    id: 'a5',
    prompt: 'Sabah aynaya bakınca söylenebilecek 3 komik laf say!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Ayna İtirafı'
  },
  {
    id: 'a6',
    prompt: 'Asansörde tanımadığın biriyle söylenebilecek 3 tuhaf laf söyle!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Garip Sessizlik'
  },
  {
    id: 'a7',
    prompt: '3 tane hayvan ses taklidi yap!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Ses Efekti'
  },
  {
    id: 'a8',
    prompt: 'Dünyanın en saçma 3 spor dalını uydur!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Olimpiyat Kaosu'
  },
  {
    id: 'a9',
    prompt: 'Pazardan 10 liraya alınabilecek 3 absürt eşya söyle!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'Kelepir'
  },
  {
    id: 'a10',
    prompt: 'Bir dinozorla karşılaşırsan yapacağın ilk 3 hareket!',
    category: 'komik',
    categoryTitle: 'Komik & Absürt',
    categoryColor: 'text-lime-400',
    categoryBg: 'bg-lime-500/20 border-lime-500/30',
    tag: 'T-Rex Alarmı'
  },

  // Günlük Panik ⚡
  {
    id: 'g1',
    prompt: 'Buluşmaya 1 saat geç kalırken uydurulan 3 bahane say!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Trafik & Şok'
  },
  {
    id: 'g2',
    prompt: 'Telefonun şarjı %1 kaldığında yapılan 3 panik hareketi söyle!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Batarya Krizi'
  },
  {
    id: 'g3',
    prompt: 'Buzdolabında 3 aydır unutulmuş olabilecek 3 şey say!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Arka Raflar'
  },
  {
    id: 'g4',
    prompt: 'Annenin terlik fırlatması için 3 geçerli sebep söyle!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Ev İçi Tehlike'
  },
  {
    id: 'g5',
    prompt: 'Patron aradığında o anda uydurulan 3 mazeret say!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Ofis Kaosu'
  },
  {
    id: 'g6',
    prompt: 'Kapıda anahtarı unuttuğunu anladığında edilen 3 küfür/nida!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Çilingir Vakti'
  },
  {
    id: 'g7',
    prompt: 'Toplu taşımada ayakta uyuyakalırken yapılan 3 refleks!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Metrobüs'
  },
  {
    id: 'g8',
    prompt: 'Wi-Fi aniden koptuğunda evde yapılan 3 hareket say!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Dijital Kıyamet'
  },
  {
    id: 'g9',
    prompt: 'Kafede hesabı başkasının ödemesini sağlamak için 3 kurnazlık!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Hesap Kaçışı'
  },
  {
    id: 'g10',
    prompt: 'Dolmuşta parayı şoföre uzatırken söylenen 3 farklı cümle!',
    category: 'gunluk',
    categoryTitle: 'Günlük Panik',
    categoryColor: 'text-amber-400',
    categoryBg: 'bg-amber-500/20 border-amber-500/30',
    tag: 'Ulaşım Klasiği'
  },

  // Popüler Kültür 🎬
  {
    id: 'p10',
    prompt: '3 tane ikonik Türk dizi karakteri say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Dizi Efsaneleri'
  },
  {
    id: 'p11',
    prompt: '3 tane yerli rapçi adı say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Müzik Dünyası'
  },
  {
    id: 'p12',
    prompt: '3 tane efsane Yeşilçam repliği söyle!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Nostalji'
  },
  {
    id: 'p13',
    prompt: '3 tane Marvel veya DC süper kahramanı say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Kahramanlar'
  },
  {
    id: 'p14',
    prompt: '3 tane Netflix veya Exxen dizisi say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Binge Watch'
  },
  {
    id: 'p15',
    prompt: '3 tane 90lar veya 2000ler Türkçe pop şarkıcısı say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Retro Müzik'
  },
  {
    id: 'p16',
    prompt: '3 tane dünyaca ünlü film yönetmeni say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'Sinema'
  },
  {
    id: 'p17',
    prompt: '3 tane fenomen veya YouTuber adı say!',
    category: 'populer',
    categoryTitle: 'Popüler Kültür',
    categoryColor: 'text-cyan-400',
    categoryBg: 'bg-cyan-500/20 border-cyan-500/30',
    tag: 'İnternet Alemi'
  },

  // Parti & Gece 🍸
  {
    id: 'pt1',
    prompt: 'Hesabı ödememek için tuvalete kaçanların 3 bahanesi!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Adisyon Kaosu'
  },
  {
    id: 'pt2',
    prompt: 'Dans pistinde rezil olmamak için yapılmayacak 3 hareket say!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Dans & Ritim'
  },
  {
    id: 'pt3',
    prompt: "Partiden sabah saat 05:00'te ayrılırken söylenen 3 yalan!",
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Gece Sonu'
  },
  {
    id: 'pt4',
    prompt: '3 tane popüler kokteyl veya mocktail içecek adı söyle!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Bar Menüsü'
  },
  {
    id: 'pt5',
    prompt: 'Ev partisinde mutfakta toplananların konuştuğu 3 dedikodu konusu!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Mutfak Sohbeti'
  },
  {
    id: 'pt6',
    prompt: 'DJ kabinine gidip istenebilecek 3 istek parça söyle!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'DJ İstek'
  },
  {
    id: 'pt7',
    prompt: 'Partide telefonunu kaybeden birinin aradığı ilk 3 yer!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Kayıp Eşya'
  },
  {
    id: 'pt8',
    prompt: 'Sabah uyanınca baş ağrısıyla içilen 3 kurtarıcı içecek!',
    category: 'parti',
    categoryTitle: 'Parti & Gece',
    categoryColor: 'text-purple-400',
    categoryBg: 'bg-purple-500/20 border-purple-500/30',
    tag: 'Ertesi Gün'
  },

  // Zor & Terleten 🧠
  {
    id: 'z1',
    prompt: '3 tane "K" harfiyle başlayan ülke adı say!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Coğrafya'
  },
  {
    id: 'z2',
    prompt: '3 tane uçamayan kuş türü söyle!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Biyoloji'
  },
  {
    id: 'z3',
    prompt: '3 tane kırmızı renkte sebze veya meyve say!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Hızlı Hafıza'
  },
  {
    id: 'z4',
    prompt: '3 tane periyodik cetvel elementi say!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Genel Kültür'
  },
  {
    id: 'z5',
    prompt: '3 tane denize kıyısı olan Türkiye ili söyle!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Harita Bilgisi'
  },
  {
    id: 'z6',
    prompt: '3 tane Nobel ödüllü Türk veya yabancı kişi say!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Prestij'
  },
  {
    id: 'z7',
    prompt: '3 tane dört ayaklı yırtıcı hayvan adı söyle!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Vahşi Doğa'
  },
  {
    id: 'z8',
    prompt: '3 tane "İ" harfiyle biten dünya başkenti söyle!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Başkentler'
  },
  {
    id: 'z9',
    prompt: '3 tane programlama dili veya işletim sistemi say!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Teknoloji'
  },
  {
    id: 'z10',
    prompt: '3 tane Roma rakamıyla yazılan sayı söyle!',
    category: 'zor',
    categoryTitle: 'Zor & Terleten',
    categoryColor: 'text-emerald-400',
    categoryBg: 'bg-emerald-500/20 border-emerald-500/30',
    tag: 'Matematik'
  }
];
