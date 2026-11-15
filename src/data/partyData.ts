import { GameItem, TournamentRound } from '../types';

export const GAME_CATALOG: GameItem[] = [
  {
    id: 'timebomb',
    title: 'Saatli Bomba - Sıcak Patates',
    tag: '2+ Oyuncu',
    desc: 'Gizli geri sayım, hareket sensörü! Patlamadan önce soruyu cevapla ve telefonu hızla devret.',
    cat: 'party',
    icon: '💣',
    badge: 'SENSÖR & KAOS',
    minPlayers: '2+ Kişi',
    color: '#ef4444',
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    playTime: '30-90sn',
    featured: true
  },
  {
    id: 'tenseconds',
    title: 'Tam 10.00 Saniye',
    tag: 'Tüm Masa',
    desc: 'Kör kronometre! 3. saniyeden sonra ekran kararır, 10.00 sn hissettiğin anda durdur.',
    cat: 'quick',
    icon: '⏱️',
    badge: 'İÇ SES & KÖR MOD',
    minPlayers: '1+ Kişi',
    color: '#bef264',
    gradient: 'from-lime-500/20 via-emerald-500/10 to-transparent',
    playTime: '10sn Sınavı',
    featured: true
  },
  {
    id: 'trivia',
    title: 'Kaotik Trivia & Popüler Kültür',
    tag: 'Tüm Masa (Çok Oyunculu)',
    desc: 'Absürt gerçekler, şehir efsaneleri, blöf ve Double Down riskleri! 15 soruluk canlı kaotik oda sınavı.',
    cat: 'quick',
    icon: '🧠',
    badge: 'KAOTİK TRIVIA',
    minPlayers: '2+ Kişi',
    color: '#f751a1',
    gradient: 'from-pink-500/20 via-purple-500/10 to-transparent',
    playTime: '15 Soru',
    featured: true
  },
  {
    id: 'rockpaperscissors',
    title: 'Taş Kâğıt Makas 2.0',
    tag: '2 Kişi & Bot',
    desc: 'Özel taktik güç kartları, gizli kilit ve 5 turluk yüksek voltaj 1v1 düellosu!',
    cat: 'quick',
    icon: '✂️',
    badge: 'DÜELLO ARENASI',
    minPlayers: '2 Kişi',
    color: '#4cd7f6',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    playTime: '5 Tur Düello',
    featured: false
  },
  {
    id: 'dontlaugh',
    title: 'Gülmeme Düellosu (1v1)',
    tag: '2 Kişi / Hakemli',
    desc: 'Göz göze taş yüz meydan okuması! Kahkaha tuzakları, absürt sesler ve masa cezaları.',
    cat: 'party',
    icon: '😐',
    badge: 'TAŞ YÜZ',
    minPlayers: '2+ Kişi',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    playTime: '1-2 Dk',
    featured: false
  },
  {
    id: 'fivesec',
    title: '15 Saniye Kuralı',
    tag: '2+ Oyuncu',
    desc: '15 saniye dolmadan 3 cevap bul! Kırmızı alarm geri sayımı, panik ve kahkaha garantili.',
    cat: 'party',
    icon: '⚡',
    badge: 'HIZ & REFLEKS',
    minPlayers: '2+ Kişi',
    color: '#f751a1',
    gradient: 'from-pink-500/20 via-purple-500/10 to-transparent',
    playTime: '15sn Panik',
    featured: false
  },
  {
    id: 'truthdare',
    title: 'Doğruluk mu Cesaret mi?',
    tag: '2-12 Oyuncu',
    desc: 'Şişeyi çevir veya oyuncu seç, 3 zorluk kademesi ve 30sn süreli çılgın görevler.',
    cat: 'dare',
    icon: '🔥',
    badge: 'CESARET & İTİRAF',
    minPlayers: '2+ Kişi',
    color: '#ec4899',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    playTime: '30sn Limit',
    featured: false
  },
  {
    id: 'spy',
    title: 'Casus Kim?',
    tag: '3-10 Oyuncu',
    desc: 'Gizli mekan kartları, aranızdaki casusu şüpheli sorularla deşifre edin!',
    cat: 'role',
    icon: '🕵️',
    badge: 'BLÖF & AJAN',
    minPlayers: '3-10 Kişi',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    playTime: '3 Dk Sorgu',
    featured: false
  },
  {
    id: 'table_rescuer',
    title: 'Masa Kurtarıcısı',
    tag: '2-8 Kişi',
    desc: 'Hesap ruleti, fısıltılı kafe oyunları ve sessiz anları kıracak derin masa sohbetleri!',
    cat: 'party',
    icon: '☕',
    badge: '👑 VIP KAFE & HESAP',
    minPlayers: '2-8 Kişi',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    playTime: 'Sohbet & Kafe',
    featured: false,
    isVIP: true
  },
  {
    id: 'mostlikely',
    title: 'Kim Daha Çok?',
    tag: '3+ Oyuncu',
    desc: '"Aramızda en çok kim..." sorularına geri sayımla aynı anda parmak gösterin!',
    cat: 'party',
    icon: '👉',
    badge: 'GRUP OYLAMASI',
    minPlayers: '3+ Kişi',
    color: '#06b6d4',
    gradient: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    playTime: 'Grup Oyu',
    featured: false
  },
  {
    id: 'neverhave',
    title: 'Ben Hiç Yapmadım',
    tag: '3+ Oyuncu',
    desc: 'Yapanlar parmak indirir veya ceza çeker, saklanan sırlar dökülsün!',
    cat: 'party',
    icon: '🙈',
    badge: 'İTİRAF & CEZA',
    minPlayers: '3+ Kişi',
    color: '#d946ef',
    gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    playTime: 'İtiraf Modu',
    featured: false
  },
  {
    id: 'funny',
    title: 'En Komik Cevap',
    tag: '3-10 Oyuncu',
    desc: 'Absürt durumlara en komik cevabı veren masanın oylarıyla puanı kapar.',
    cat: 'party',
    icon: '😂',
    badge: 'KAHKAHA',
    minPlayers: '3+ Kişi',
    color: '#eab308',
    gradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    playTime: 'Oylamalı',
    featured: false
  },
  {
    id: 'charades',
    title: 'Sessiz Sinema & Kelime',
    tag: '4+ Oyuncu',
    desc: 'Konuşmadan beden dili ve hareketlerle filmi ya da kelimeyi takımına anlat.',
    cat: 'party',
    icon: '🎭',
    badge: 'TAKIM OYUNU',
    minPlayers: 'Takım',
    color: '#3b82f6',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    playTime: '60sn Takım',
    featured: false
  },
  {
    id: 'speedquiz',
    title: '1v1 Refleks Düellosu',
    tag: '2 Kişi Yüz Yüze',
    desc: 'Telefonun iki ucuna geçin! Rastgele yeşil şimşeği bekleyin, erken basan ceza yer, en hızlı basan raundu alır.',
    cat: 'quick',
    icon: '⚡',
    badge: '1v1 DÜELLO',
    minPlayers: '2 Kişi',
    color: '#bef264',
    gradient: 'from-lime-500/20 via-emerald-500/10 to-transparent',
    playTime: '5 Raund',
    featured: true
  },
  {
    id: 'customdeck',
    title: 'Özel Parti Destesi',
    tag: 'Özel',
    desc: 'Kendi grubunuza özel iç şakaları, anıları ve cezaları desteye ekleyin.',
    cat: 'dare',
    icon: '🎴',
    badge: '👑 VIP ÖZEL DESTE',
    minPlayers: 'Herkes',
    color: '#a855f7',
    gradient: 'from-amber-500/20 via-purple-500/10 to-transparent',
    playTime: 'Özel Liste',
    featured: false,
    isVIP: true
  },
  {
    id: 'vip_lie_detector',
    title: 'Sesli İtiraf & Yalan Dedektörü',
    tag: 'Tüm Masa',
    desc: 'Canlı ses biyometrisi, frekans titremesi ve stres analizi! Masanın oylarıyla yalanı yakalayın veya shot cezası verin.',
    cat: 'dare',
    icon: '🎙️',
    badge: '👑 VIP BİYOMETRİK #1',
    minPlayers: '3+ Kişi',
    color: '#ef4444',
    gradient: 'from-red-500/30 via-rose-500/15 to-transparent',
    playTime: '15sn İtiraf',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_blind_drawing',
    title: 'Kör Çizim & Hızlı Tahmin',
    tag: 'Çizim & Hız',
    desc: 'Gözleri kapalı, tek sürekli çizgi neon pad üzerinde! Masadaki takım parmağını kaldırmadan çizileni tahmin eder.',
    cat: 'party',
    icon: '🎨',
    badge: '👑 VIP KÖR MOD #2',
    minPlayers: '3+ Kişi',
    color: '#4cd7f6',
    gradient: 'from-cyan-500/30 via-blue-500/15 to-transparent',
    playTime: '30sn Limit',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_chaos_roulette',
    title: 'Kaos Ruleti: Masa Cezaları',
    tag: 'Yüksek Gerilim',
    desc: '2x çift ceza çarpanlı çarkıfelek! Sesli kayıt, DM atma, masaya hesap ısmarlama ve jackpot cezaları döner.',
    cat: 'dare',
    icon: '🎰',
    badge: '👑 VIP CEZA RULETİ #3',
    minPlayers: '2+ Kişi',
    color: '#f59e0b',
    gradient: 'from-amber-500/30 via-yellow-500/15 to-transparent',
    playTime: 'Kader Çarkı',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_mafia_table',
    title: 'Gizli İttifak: Mafya Masası',
    tag: 'Rol & Blöf',
    desc: 'Biyometrik parmak iziyle rolünü gizlice gör! 60 saniye fısıltı pazarlığı ve mahkeme tokmağıyla infaz oylaması.',
    cat: 'role',
    icon: '🕵️',
    badge: '👑 VIP İNFAZ & AJAN #4',
    minPlayers: '4-12 Kişi',
    color: '#dc2626',
    gradient: 'from-red-600/30 via-purple-600/15 to-transparent',
    playTime: 'Pazarlık & İnfaz',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_gallery_roulette',
    title: 'Fotoğraflı İtiraf & Galeri Ruleti',
    tag: 'Fotoğraf & Cesaret',
    desc: 'Galeri radarı hedef tarihi veya medya klasörünü kilitler! Masaya ayna modunda aç ya da ceza puanını çek.',
    cat: 'dare',
    icon: '📸',
    badge: '👑 VIP GALERİ RADARI #5',
    minPlayers: '2+ Kişi',
    color: '#ec4899',
    gradient: 'from-pink-500/30 via-fuchsia-500/15 to-transparent',
    playTime: '20sn Tehlike',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_telepathy',
    title: 'VIP Telepati: Zihin Senkronu',
    tag: 'Refleks & Zeka',
    desc: '3-2-1 geri sayımında iki oyuncu aynı anda tek kelime söyler! %100 zihin senkronu yakalayanlar rekor kırar.',
    cat: 'quick',
    icon: '🧠',
    badge: '👑 VIP SENKRON #6',
    minPlayers: '2 Kişi Yüz Yüze',
    color: '#a855f7',
    gradient: 'from-purple-500/30 via-indigo-500/15 to-transparent',
    playTime: '3-2-1 Şimşek',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_hostage_phone',
    title: 'Rehin Telefon & Bildirim Mayını',
    tag: 'Aşırı Cesaret',
    desc: 'Telefon masanın ortasında dokunmak yasak! Gelen bildirimi sesli oku, hoparlörde cevapla veya grup hikayesi at.',
    cat: 'dare',
    icon: '📱',
    badge: '👑 VIP REHİN TELEFON #7',
    minPlayers: '3+ Kişi',
    color: '#ef4444',
    gradient: 'from-orange-500/30 via-red-500/15 to-transparent',
    playTime: 'Panik Sayacı',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_secret_detective',
    title: 'Masa Dedektifi: Kimin Sırrı?',
    tag: 'Sosyal Dedektif',
    desc: 'Mühürlü anonim itiraf açılır! Baş dedektif soru tokenleriyle masadaki şüphelileri sorgular ve infaz eder.',
    cat: 'role',
    icon: '🔍',
    badge: '👑 VIP DEDEKTİF #8',
    minPlayers: '3-10 Kişi',
    color: '#3b82f6',
    gradient: 'from-blue-500/30 via-cyan-500/15 to-transparent',
    playTime: 'Sorgu Odası',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_karaoke_hum',
    title: 'Akortsuz Karaoke: Ne Söylüyor?',
    tag: 'Ses & Kahkaha',
    desc: 'Kulaklıkla şarkıyı dinleyip sadece dı-dı-dı diye mırıldan! Söz söylemek yasak, masadan ilk basan puanı kapar.',
    cat: 'party',
    icon: '🎧',
    badge: '👑 VIP KAHKAHA KOROSU #9',
    minPlayers: '3+ Kişi',
    color: '#06b6d4',
    gradient: 'from-cyan-500/30 via-teal-500/15 to-transparent',
    playTime: '30sn Mırıldanma',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_bill_roulette',
    title: 'Hesap Ruleti: Masayı Kim Ismarlıyor?',
    tag: 'Kafe & Restoran',
    desc: 'Kredi kartları ve jetonlar masaya! Terminal lazeri tek tek kartları eler, son kalan şanssız kişi hesabı öder.',
    cat: 'quick',
    icon: '💳',
    badge: '👑 VIP HESAP TERMİNALİ #10',
    minPlayers: '2-12 Kişi',
    color: '#eab308',
    gradient: 'from-amber-500/30 via-yellow-500/15 to-transparent',
    playTime: 'Hesap Heyecanı',
    featured: true,
    isVIP: true
  },
  {
    id: 'vip_chaos_taboo',
    title: 'Kaos Tabusu: Yasak Mayın',
    tag: 'Hızlı Anlatım',
    desc: '45 saniyede dev neon kelimeyi takımına anlat! Rakip takım gözlerini dikmiş 5 mayın kelimeyi söylemeni bekliyor.',
    cat: 'party',
    icon: '💣',
    badge: '👑 VIP KAOTİK TABU #11',
    minPlayers: 'Takım (4+)',
    color: '#f97316',
    gradient: 'from-orange-500/30 via-red-500/15 to-transparent',
    playTime: '45sn Seri Anlatım',
    featured: true,
    isVIP: true
  }
];

export const TOURNAMENT_ROUNDS: TournamentRound[] = [
  {
    roundNumber: 1,
    title: '1. Tur: Tam 10.00 Saniye',
    sub: 'İç Ses & Kör Kronometre',
    instructions: 'Kronometreyi başlat ve 10.00 saniyeye en yakın yerde durdur! En az sapan 100 puan kazanır.',
    gameId: 'tenseconds',
    points: 100
  },
  {
    roundNumber: 2,
    title: '2. Tur: 5 Saniye Baskısı',
    sub: 'Hız ve Zeka',
    instructions: '5 saniye içinde çıkan karta 3 geçerli cevap veren masadan 150 puanı kapar!',
    gameId: 'fivesec',
    points: 150
  },
  {
    roundNumber: 3,
    title: '3. Tur: Casus Kim? (Ajan Avı)',
    sub: 'Blöf & Rol Yapma',
    instructions: 'Gizli lokasyonu sadece masumlar bilir! Casusu yakalayanlar 200 puan kazanır, yakalanmayan casus ise 300 puan alır!',
    gameId: 'spy',
    points: 200
  },
  {
    roundNumber: 4,
    title: '4. Tur: Gülmeme Düellosu (1v1)',
    sub: 'Taş Yüz Meydan Okuması',
    instructions: 'Göz göze bakın ve gülmeden durun! Gülmeyen oyuncu 250 puanı hanesine yazdırır.',
    gameId: 'dontlaugh',
    points: 250
  },
  {
    roundNumber: 5,
    title: '5. Tur: Taş Kâğıt Makas 2.0 Final',
    sub: 'Şampiyonluk Düellosu',
    instructions: 'Puan tablosundaki en iyi 2 kişi özel taktik güç kartlarıyla kapışır. Gecenin Şampiyonu ilan edilir!',
    gameId: 'rockpaperscissors',
    points: 300
  }
];

export const FIVE_SECOND_QUESTIONS = [
  '3 kırmızı meyve say!',
  '3 geç kalma bahanesi söyle!',
  '3 süper kahraman adı say!',
  '3 Türk dizisi başlığı say!',
  '3 acı sos veya biber çeşidi söyle!',
  '3 kış sporu say!',
  '3 evcil hayvan ismi say!',
  '3 tatil ülkesi söyle!',
  '3 kahve çeşidi söyle!',
  '3 fast food zinciri say!',
  '3 patates yemeği çeşidi söyle!',
  '3 Harry Potter büyüsü söyle!',
  '3 korku filmi adı say!',
  '3 rock müzik grubu say!',
  '3 sarı renkli nesne say!',
  '3 dans türü say!',
  '3 sebze yemeği söyle!',
  '3 ünlü Türk şarkıcı söyle!',
  '3 çizgi film karakteri say!',
  '3 araba markası say!',
  '3 uykuluk veya pijama rengi söyle!',
  '3 deniz canlısı say!',
  '3 okul eşyası say!',
  '3 ünlü futbolcu adı say!',
  '3 dünya başkenti söyle!',
  '3 pizza malzemesi söyle!',
  '3 diş hekimi aleti veya terimi söyle!',
  '3 telefon uygulaması söyle!',
  '3 romantik komedi filmi say!',
  '3 dondurma aroması say!'
];

export const TRUTH_QUESTIONS = [
  'Bu odadaki en son kime yalan söyledin ve sebebi neydi?',
  'Telefonundaki en son aradığın veya sildiğin şey nedir?',
  'Hayatında yaptığın en utanç verici sakarlık neydi?',
  'Bu gruptan biriyle ıssız bir adada mahsur kalacak olsan kimi seçerdin?',
  'Son 1 yılda aldığın en saçma şey neydi?',
  'Grupta gizliden en çok kıskandığın veya özendiğin özellik kime ait?',
  'Kimsenin bilmediği gizli bir takıntın veya alışkanlığın var mı?',
  'En son ne zaman ve neden ağladın?',
  'İlk aşkının ismini ve nasıl bittiğini dürüstçe anlat!',
  'Bu masada senden en çok sır sakladığını düşündüğün kim?',
  'Birine gönderdiğin en utanç verici yanlış mesaj neydi?',
  'Eğer bir günlüğüne karşı cins olsaydın ilk ne yapardın?',
  'Hiç polisle ya da güvenlikle başın derde girdi mi?',
  'Telefonunda kimsenin görmesini istemediğin bir fotoğraf var mı?'
];

export const DARE_TASKS = [
  'Masadaki en son mesaj atan kişiye komik bir ses kaydı gönder!',
  'Gruptan birini seç ve 15 saniye boyunca gözlerini hiç kırpmadan bak!',
  'Grubun seçeceği bir şarkıyı 20 saniye boyunca sesli taklit ederek söyle!',
  'Telefonunun son galerisindeki 3. fotoğrafı masaya göster!',
  '10 saniye boyunca robot gibi hareket et ve konuş!',
  'Solundaki kişinin elini öp ve çok resmi bir dille iltifat et!',
  'Gözlerini kapat ve birinin sana koklattığı şeyi tahmin et!',
  'Bir sonraki tura kadar masadaki herkes sana "Kral" veya "Kraliçe" diye hitap etsin, sen de öyle davran!',
  'Masadaki en komik gülüşe sahip kişinin taklidini yap!',
  '5 tane şınav çek veya 10 kez zıplayarak "Parti Başlasın!" diye bağır!',
  'WhatsApp durumuna "Bugün hayatımın en garip günü..." yaz (10 dk kalsın)!',
  'Önündeki bir nesneyi bir televizyon pazarlamacısı gibi masadakilere satmaya çalış!'
];

export interface FingerCategoryData {
  id: 'sahne' | 'grup' | 'komedi';
  title: string;
  subtitle: string;
  tasks: string[];
}

export const FINGER_PERFORMANCE_CATEGORIES: FingerCategoryData[] = [
  {
    id: 'sahne',
    title: 'Sahne Senin',
    subtitle: 'Dans, taklit, doğaçlama ve mimik',
    tasks: [
      '20 saniye boyunca ünlü bir aksiyon filmi fragmanı seslendir (derin ve dramatik bir ses tonuyla).',
      'Masadakilerin seçeceği popüler bir şarkıyı 15 saniye boyunca opera sanatçısı gibi söyle.',
      'Ağır çekimde (slow motion) bir dövüş sahnesini 15 saniye boyunca canlandır.',
      'Son dakika haber spikeri ol ve masada en son yaşanan komik olayı flaş haber olarak sun.',
      'Şarjı %1 kalmış bir robot gibi hareket et ve konuşmaya çalış.',
      'Masadaki bir bardağı veya nesneyi sanki yeni keşfedilmiş uzaylı eseriymiş gibi tanıt.',
      'Masadakilere 15 saniyelik komik bir doğaçlama dans koreografisi sergile.',
      'Tek bir kelime bile etmeden yalnızca mimik ve el hareketleriyle bir süper kahramanı anlat.',
      'Masadaki arkadaşlarından birinin en karakteristik gülüşünü veya jestini abartarak taklit et.',
      'Titiz bir gurme şef gibi masadaki bir atıştırmalığı tat ve acımasızca eleştir.',
      'Müzayede yöneticisi gibi masadaki bir eşyayı hızlıca açık artırmayla satmaya başla.',
      'Ünlü bir futbol spikerinin son dakika gol anlatımı gibi masadakilerin bir hareketini anlat.'
    ]
  },
  {
    id: 'grup',
    title: 'Grup Eğlencesi',
    subtitle: 'Masa etkileşimi, ritim ve meydan okuma',
    tasks: [
      'Masadaki herkesle sırayla hiç gülmeden 5er saniye göz teması kur; ilk gülen kaybeder!',
      'Masaya vurarak bir ritim başlat ve herkesin sırayla aynı ritme katılmasını sağla.',
      'Sağındaki kişiye tamamen doğaçlama, son derece resmi ve ciddi bir iltifat konuşması yap.',
      'Masadaki herkesin fısıldayacağı 3 farklı kelimeyi tek bir anlamlı cümlede birleştir.',
      'Gruptan birini seç ve taş-kağıt-makas oyna; kaybeden sonraki tura kadar lideri alkışlasın.',
      'Masadakilere komik bir "Ben Kimim?" bilmecesi sor; bilene kadar tek kelimelik ipuçları ver.',
      'Gruptan birinin adını tersten oku ve ona komik bir hayali süper güç bahşet.',
      'Masadaki herkesin aynı anda tek bir ortak hece söylemesini koordine et.'
    ]
  },
  {
    id: 'komedi',
    title: 'Cesaret & Komedi',
    subtitle: 'Kahkaha tufanı ve komik itiraflar',
    tasks: [
      'Telefonundaki galeriden rastgele seçeceğin bir fotoğrafın arkasındaki komik anıyı anlat.',
      'Hayatında yaptığın ve hatırladıkça kendi kendine güldüğün en saçma sakarlığı dürüstçe anlat.',
      'Bir sonraki seçime kadar sorulan her soruya sadece "Evet efendim" veya "Harika fikir" diyerek cevap ver.',
      'Sevimli bir çizgi film karakterinin ses tonuyla masadakilere selam ver.',
      'Az önce piyangodan büyük ikramiyeyi kazanmış gibi 15 saniye abartılı bir sevinç gösterisi yap.',
      'Türkçeyi yeni öğrenmiş bir yabancı turist gibi masadakilerden en yakın uzay üssünü sor.',
      'Aynada kendine söylediğin en tuhaf motivasyon cümlesini masaya açıkla.',
      'Masadaki herkes sırayla sana komik bir mimik yapsın; 10 saniye boyunca kahkaha atmamaya çalış!'
    ]
  }
];

export const SPY_LOCATIONS = [
  {
    name: 'Havalimanı',
    category: 'Ulaşım',
    clue: 'Pasaport kontrolleri, valiz bantları ve anons sesleri var.',
    roles: ['Pilot', 'Güvenlik Görevlisi', 'Gümrük Memuru', 'Yolcu', 'Hostes']
  },
  {
    name: 'Lunapark',
    category: 'Eğlence',
    clue: 'Dönme dolap, pamuk şeker ve çığlık sesleri yükseliyor.',
    roles: ['Biletçi', 'Korku Tüneli Görevlisi', 'Pamuk Şekerci', 'Heyecan Arayan Ziyaretçi']
  },
  {
    name: 'Düğün Salonu',
    category: 'Kutlama',
    clue: 'Halay müzikleri, pasta kesimi ve altın takma yarışı var.',
    roles: ['Damat', 'Gelin', 'Piyanist Şantör', 'Fotoğrafçı', 'Gelin Kaynanası']
  },
  {
    name: 'Uzay İstasyonu',
    category: 'Bilim & Keşif',
    clue: 'Yerçekimsiz ortam, oksijen tüpleri ve Dünya manzarası.',
    roles: ['Kozmonot', 'Uçuş Mühendisi', 'Biyolog', 'İletişim Sorumlusu']
  },
  {
    name: 'Tarihi Türk Hamamı',
    category: 'Geleneksel',
    clue: 'Sıcak göbek taşı, tas sesleri, köpük ve buhar dolu.',
    roles: ['Tellak', 'Natır', 'Müşteri', 'Kese Yapan Usta']
  },
  {
    name: 'Hastane Acil Servisi',
    category: 'Sağlık',
    clue: 'Stetoskoplar, serumlar, sedyeler ve koşturan hemşireler.',
    roles: ['Başhekim', 'Hemşire', 'Hasta', 'Röntgen Teknisyeni', 'Ambulans Şoförü']
  },
  {
    name: 'Stadyum Derbisi',
    category: 'Spor',
    clue: 'Tezahüratlar, meşaleler, hakem düdüğü ve çim kokusu.',
    roles: ['Hakem', 'Teknik Direktör', 'Tribün Lideri', 'Kaleci', 'Köfteci']
  },
  {
    name: 'Canlı Konser Alanı',
    category: 'Müzik',
    clue: 'Dev hoparlörler, sis makineleri, bas titreşimi ve coşkulu kalabalık.',
    roles: ['Solist', 'Baterist', 'Işıkçı', 'VIP Seyirci', 'Güvenlik']
  },
  {
    name: 'Banka Kasası & Soygun',
    category: 'Gizem & Aksiyon',
    clue: 'Lazer alarmlar, çelik kasalar, maskeli adamlar ve polis sirenleri.',
    roles: ['Kasa Hırsızı', 'Banka Müdürü', 'Rehine Müşteri', 'Özel Tim Şefi', 'Güvenlik']
  },
  {
    name: 'Lüks Casino & Rulet',
    category: 'Gece Hayatı',
    clue: 'Yeşil çuha masalar, dönen rulet topu, fiş şakırtıları ve viski kadehleri.',
    roles: ['Krupiye', 'Milyarder Kumarbaz', 'Korumalar Şefi', 'Garson', 'Gizli Müfettiş']
  },
  {
    name: 'Askeri Denizaltı',
    category: 'Askeri & Derinlik',
    clue: 'Sonar bipleri, dar koridorlar, periskop ve basınç göstergeleri.',
    roles: ['Denizaltı Kaptanı', 'Sonar Operatörü', 'Torpido Uzmanı', 'Aşçı', 'Telsizci']
  },
  {
    name: 'Süpermarket Kasa Kuyruğu',
    category: 'Günlük Hayat',
    clue: 'Barkod bip sesleri, poşet hışırtısı ve indirim anonsları.',
    roles: ['Kasiyer', 'Sıra Kapan Teyze', 'Aceleci Müşteri', 'Reyon Görevlisi', 'Müdür']
  },
  {
    name: 'Sinema Galası & Kırmızı Halı',
    category: 'Medya & Gösteri',
    clue: 'Flaş patlamaları, korumalar, patlamış mısır kokusu ve imzalar.',
    roles: ['Başrol Oyuncusu', 'Yönetmen', 'Magazin Muhabiri', 'Hayran', 'Bodyguard']
  },
  {
    name: 'Cezaevi Koğuşu',
    category: 'Gerilim',
    clue: 'Demir parmaklıklar, ranzalar, sayım düdükleri ve volta sesleri.',
    roles: ['Gardiyan', 'Koğuş Ağası', 'Yeni Gelen Mahkum', 'Avukat', 'Müdür']
  },
  {
    name: 'Kayak Merkezi & Zirve',
    category: 'Kış & Tatil',
    clue: 'Telesiyej uğultusu, sıcak şarap, kar motorları ve kayak pistleri.',
    roles: ['Kayak Eğitmeni', 'Acemi Kayakçı', 'Kurtarma Ekibi', 'Dağ Evi İşletmecisi']
  },
  {
    name: 'Kaçış Evi & Korku Tüneli',
    category: 'Macera',
    clue: 'Kilitli sandıklar, loş ışıklar, sahte kanlar ve ipucu bulmacaları.',
    roles: ['Oyun Kurucu', 'Korkan Oyuncu', 'Cesur Lider', 'Canavar Rolündeki Oyuncu']
  },
  {
    name: 'Lüks Fransız Restoranı',
    category: 'Gastronomi',
    clue: 'Beyaz örtüler, alevli tavalar, fısıltılı konuşmalar ve pahalı şaraplar.',
    roles: ['Şef Aşçı', 'Garson', 'Gurme Eleştirmen', 'Romantik Çift', 'Bulaşıkçı']
  },
  {
    name: 'Kuaför & Güzellik Merkezi',
    category: 'Sosyal & Bakım',
    clue: 'Fön makinesi sesi, saç spreyi kokusu ve bitmeyen mahalle dedikoduları.',
    roles: ['Usta Kuaför', 'Çırak', 'Gelin Adayı', 'Dedikoducu Müşteri']
  }
];

export const MOST_LIKELY_QUESTIONS = [
  'Aramızda en çok kim parasını ayın ilk günü lüks şeylere harcayıp bitirir?',
  'Aramızda en çok kim ıssız bir adada diğerlerini organize edip hayatta kalır?',
  'Aramızda en çok kim gizli bir ajan olup kimseye çaktırmaz?',
  'Aramızda en çok kim gece saat 03:00\'te yanlışlıkla eski sevgilisini arar?',
  'Aramızda en çok kim bir reality şovda entrikalarla birinci olur?',
  'Aramızda en çok kim tek oturuşta 16 bölümlük diziyi bitirir?',
  'Aramızda en çok kim kaybolduğu halde gurur yapıp kimseye yolu sormaz?',
  'Aramızda en çok kim sabah çalan alarmı en az 10 kez erteler?',
  'Aramızda en çok kim yanlışlıkla bir düğüne katılıp beleş yemek yer?',
  'Aramızda en çok kim zombi istilasında ilk olarak panikleyip kendini ele verir?',
  'Aramızda en çok kim sosyal medyada yanlışlıkla yanlış hesaptan story beğenir?',
  'Aramızda en çok kim loto vursa bunu herkesten gizleyip gizlice ada satın alır?',
  'Aramızda en çok kim trafikte camı açıp diğer şoförle münakaşaya girer?',
  'Aramızda en çok kim "ben dedikodu sevmem" deyip en büyük dedikoduyu getirir?',
  'Aramızda en çok kim kafede hesabı ödememek için tuvalete kaçar?',
  'Aramızda en çok kim bir haftalık tatile 3 devasa bavulla gider?',
  'Aramızda en çok kim sırf birini etkilemek için bilmediği bir konunun uzmanı gibi davranır?',
  'Aramızda en çok kim markette tatlı reyonunda 20 dakika karar veremeden bekler?',
  'Aramızda en çok kim cep telefonunu günde en az 3 kez nereye koyduğunu unutur?',
  'Aramızda en çok kim korku filminde aniden çığlık atıp masadakileri korkutur?'
];

export const NEVER_HAVE_I_EVER_QUESTIONS = [
  'Ben hiç derste veya iş toplantısında kameralar açıkken uyuyakalmadım.',
  'Ben hiç en yakın arkadaşımın doğum gününü tamamen unutup son anda çaktırmadım.',
  'Ben hiç sokakta ünlü birini görüp tanımıyormuş gibi havalı davranmadım.',
  'Ben hiç restoranda siparişim yanlış geldiğinde utancımdan ses çıkarmadan yemedim.',
  'Ben hiç bir dedikoduyu hakkında konuştuğum kişinin kendisine yanlışlıkla göndermedim.',
  'Ben hiç aynı gün içinde sinemada peş peşe iki farklı filme bilet almadım.',
  'Ben hiç sahte hesap (stalk hesabı) açıp eski flörtümü gecelerce izlemedim.',
  'Ben hiç flörtüme "şarjım bitiyor" deyip aslında oyuna veya uykuya dalmadım.',
  'Ben hiç dolmuşta veya otobüste ineceğim durağı kaçırıp utancımdan ses çıkarmadım.',
  'Ben hiç bir hediyeyi beğenmeyip paketiyle başka birine hediye etmedim.',
  'Ben hiç aynanın karşısında ödül konuşması yaparmış gibi prova yapmadım.',
  'Ben hiç bir partiden kimseye haber vermeden hayalet gibi gizlice kaçmadım.',
  'Ben hiç Instagram hikayesini sadece tek bir kişi görsün diye "Yakın Arkadaşlar"a almadım.',
  'Ben hiç arkadaşımın telefon şifresini gizlice ezberlemeye çalışmadım.',
  'Ben hiç kafede yanlış masanın siparişini kendi siparişim sanıp hüpletmedim.'
];

export const WHEEL_PRESETS: Record<string, { title: string; items: string[]; colors: string[] }> = {
  food: {
    title: '🍔 Yemek Menüsü',
    items: ['Pizza', 'Burger', 'Sushi', 'Kebap', 'Ev Yemeği', 'Makarna & Salata'],
    colors: ['#ec4899', '#06b6d4', '#bef264', '#f59e0b', '#8b5cf6', '#3b82f6']
  },
  movie: {
    title: '🎬 Film Türü',
    items: ['Korku / Gerilim', 'Kahkaha Komedi', 'Aksiyon & Bilim Kurgu', 'Animasyon', 'Dram & Gizem', 'Romantik'],
    colors: ['#8b5cf6', '#ec4899', '#06b6d4', '#bef264', '#f59e0b', '#3b82f6']
  },
  dare: {
    title: '⚡ Parti Cezaları',
    items: ['Sesli Şarkı Söyle', 'Telefonu Ortaya Koy', '10 Şınav Çek', 'Sır İtiraf Et', 'Komik Taklit Yap', 'Pas Geç (Şanslı!)'],
    colors: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899']
  },
  bill: {
    title: '💳 Hesap Kimde?',
    items: ['En Küçük Yaştaki', 'Alman Usulü (Eşit)', 'En Çok Gülen', 'Solundaki Öder', 'Yazı-Tura At!', 'Kura Çekilsin'],
    colors: ['#bef264', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981']
  },
  drinks: {
    title: '🍹 İçecek / Kokteyl',
    items: ['Soğuk Kahve', 'Taze Limonata', 'Buzlu Çay', 'Meyveli Soda', 'Mojito & Nane', 'Sıcak Çikolata'],
    colors: ['#06b6d4', '#bef264', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981']
  },
  music: {
    title: '🎶 Müzik Tarzı',
    items: ['90lar Türkçe Pop', 'Elektronik & House', 'Hip-Hop & R&B', 'Rock & Indie', 'Lo-Fi Chill', 'Latin & Reggaeton'],
    colors: ['#ec4899', '#8b5cf6', '#06b6d4', '#bef264', '#f59e0b', '#3b82f6']
  }
};

import { CustomCard } from '../types';

export const DEFAULT_CUSTOM_DECK: CustomCard[] = [
  // 1-4: As featured in Stitch prototype
  {
    id: 'cd-1',
    type: 'dare',
    spiciness: 'hot',
    text: 'Telefonundaki son çektiğin fotoğrafı masadaki herkese göster!',
    timestamp: '2 saat önce eklendi',
    addedBy: 'Burak',
    isActive: true
  },
  {
    id: 'cd-2',
    type: 'truth',
    spiciness: 'mild',
    text: 'Bu masada ilk izlenimi sende en çok değişen kişi kim oldu ve neden?',
    timestamp: 'Dün eklendi',
    addedBy: 'Cansu',
    isActive: true
  },
  {
    id: 'cd-3',
    type: 'funny',
    spiciness: 'mild',
    text: 'Pazartesi sabahı uyanınca aynaya söylediğim ilk şey...',
    timestamp: '3 gün önce',
    addedBy: 'Efe',
    isActive: true
  },
  {
    id: 'cd-4',
    type: 'task',
    spiciness: 'medium',
    text: 'Masadaki herkesle sırayla göz kırpmadan bakış! İlk gülen veya gözünü kırpan ceza puanı alır.',
    timestamp: '4 gün önce',
    addedBy: 'Deniz',
    isActive: true
  },
  // Additional Doğruluk (to reach 12)
  {
    id: 'cd-5',
    type: 'truth',
    spiciness: 'medium',
    text: 'Bu grupta en son kime küçük beyaz bir yalan söyledin ve neydi?',
    timestamp: '5 gün önce',
    addedBy: 'Selin',
    isActive: true
  },
  {
    id: 'cd-6',
    type: 'truth',
    spiciness: 'hot',
    text: 'Telefonunda silmeyi unuttuğun en utanç verici mesaj veya arama kaydı nedir?',
    timestamp: '1 hafta önce',
    addedBy: 'Burak',
    isActive: true
  },
  {
    id: 'cd-7',
    type: 'truth',
    spiciness: 'mild',
    text: 'Grupta gizliden en çok imrendiğin veya kıskandığın özellik kime ait?',
    timestamp: '1 hafta önce',
    addedBy: 'Gizem',
    isActive: true
  },
  {
    id: 'cd-8',
    type: 'truth',
    spiciness: 'medium',
    text: 'Issız bir adaya düşsen yanına bu masadan kimi alırdın, kimi asla almazdın?',
    timestamp: '1 hafta önce',
    addedBy: 'Kaan',
    isActive: true
  },
  {
    id: 'cd-9',
    type: 'truth',
    spiciness: 'hot',
    text: 'Bu masadan birinin kıyafetini veya saç tarzını bir günlüğüne değiştirebilsen kimi seçerdin?',
    timestamp: '1 hafta önce',
    addedBy: 'Cansu',
    isActive: true
  },
  {
    id: 'cd-10',
    type: 'truth',
    spiciness: 'mild',
    text: 'Son 6 ayda aldığın en saçma ve pişman olduğun şey nedir?',
    timestamp: '2 hafta önce',
    addedBy: 'Mert',
    isActive: true
  },
  {
    id: 'cd-11',
    type: 'truth',
    spiciness: 'medium',
    text: 'En son hangi arkadaşının mesajına gördüğün halde bilerek ve isteyerek saatlerce dönmedin?',
    timestamp: '2 hafta önce',
    addedBy: 'Ece',
    isActive: true
  },
  {
    id: 'cd-12',
    type: 'truth',
    spiciness: 'hot',
    text: 'Kimseye anlatmadığın ve çocukluğundan beri sakladığın en absürt takıntın nedir?',
    timestamp: '2 hafta önce',
    addedBy: 'Burak',
    isActive: true
  },
  {
    id: 'cd-13',
    type: 'truth',
    spiciness: 'mild',
    text: 'Eğer bir günlüğüne görünmez olsaydın masadaki kimin evine gizlice giderdin?',
    timestamp: '2 hafta önce',
    addedBy: 'Deniz',
    isActive: true
  },
  {
    id: 'cd-14',
    type: 'truth',
    spiciness: 'medium',
    text: 'Hayatında yaptığın ve hatırladıkça yüzünü kızartan en büyük gaf neydi?',
    timestamp: '2 hafta önce',
    addedBy: 'Selin',
    isActive: true
  },
  // Additional Cesaret & Görev (to reach 14 total dare+task)
  {
    id: 'cd-15',
    type: 'dare',
    spiciness: 'medium',
    text: 'Solundaki kişinin elini öp ve çok resmi bir diplomatik dille ona iltifat et!',
    timestamp: '3 gün önce',
    addedBy: 'Efe',
    isActive: true
  },
  {
    id: 'cd-16',
    type: 'dare',
    spiciness: 'hot',
    text: 'WhatsApp durumuna masadakilerin seçeceği rastgele ve garip bir cümleyi yaz (5 dk kalacak)!',
    timestamp: '4 gün önce',
    addedBy: 'Mert',
    isActive: true
  },
  {
    id: 'cd-17',
    type: 'dare',
    spiciness: 'mild',
    text: 'Masadaki herkesle sırayla 5er saniye rap freestyle yap!',
    timestamp: '5 gün önce',
    addedBy: 'Kaan',
    isActive: true
  },
  {
    id: 'cd-18',
    type: 'dare',
    spiciness: 'hot',
    text: 'Rehberindeki 12. kişiyi ara ve sadece "Siparişiniz yola çıktı" deyip telefonu kapat!',
    timestamp: '5 gün önce',
    addedBy: 'Gizem',
    isActive: true
  },
  {
    id: 'cd-19',
    type: 'dare',
    spiciness: 'medium',
    text: '1 dakika boyunca sağındaki kişinin bir kuklası gibi dediklerini tekrar et!',
    timestamp: '6 gün önce',
    addedBy: 'Selin',
    isActive: true
  },
  {
    id: 'cd-20',
    type: 'dare',
    spiciness: 'mild',
    text: 'Masadaki bir nesneyi alıp televizyon reklam sunucusu gibi 30 saniye boyunca öv!',
    timestamp: '1 hafta önce',
    addedBy: 'Burak',
    isActive: true
  },
  {
    id: 'cd-21',
    type: 'task',
    spiciness: 'mild',
    text: 'Hiç durmadan 20 saniye boyunca kendi etrafında dön ve düz bir çizgide yürümeye çalış!',
    timestamp: '1 hafta önce',
    addedBy: 'Cansu',
    isActive: true
  },
  {
    id: 'cd-22',
    type: 'task',
    spiciness: 'medium',
    text: 'Gruptan birini seç ve onun en karakteristik hareketini veya gülüşünü taklit et!',
    timestamp: '1 hafta önce',
    addedBy: 'Deniz',
    isActive: true
  },
  {
    id: 'cd-23',
    type: 'task',
    spiciness: 'hot',
    text: 'Gözlerini kapat, gruptakilerin masaya koyacağı 3 farklı nesneyi sadece dokunarak bil!',
    timestamp: '1 hafta önce',
    addedBy: 'Ece',
    isActive: true
  },
  {
    id: 'cd-24',
    type: 'task',
    spiciness: 'mild',
    text: 'Gruptaki herkes sırayla sana fısıltıyla bir kelime söylesin, o kelimelerle tek bir cümle kur!',
    timestamp: '1 hafta önce',
    addedBy: 'Mert',
    isActive: true
  },
  {
    id: 'cd-25',
    type: 'task',
    spiciness: 'medium',
    text: '10 şınav çek veya masadakilere kendi ellerinle ikram servisi yap!',
    timestamp: '2 hafta önce',
    addedBy: 'Efe',
    isActive: true
  },
  {
    id: 'cd-26',
    type: 'task',
    spiciness: 'hot',
    text: 'Masadakilerin telefon kamerasına bakarak en komik ve abartılı yüz ifadenle poz ver!',
    timestamp: '2 hafta önce',
    addedBy: 'Gizem',
    isActive: true
  },
  // Additional Komik Başlangıç (to reach 6 total funny)
  {
    id: 'cd-27',
    type: 'funny',
    spiciness: 'mild',
    text: 'Eğer bir süper gücün olsaydı ve sadece tamamen yararsız bir şey olsaydı ne seçerdin?',
    timestamp: '3 gün önce',
    addedBy: 'Kaan',
    isActive: true
  },
  {
    id: 'cd-28',
    type: 'funny',
    spiciness: 'mild',
    text: 'Bir zombi istilasında bu masadan ilk kim feda edilirdi ve neden?',
    timestamp: '4 gün önce',
    addedBy: 'Burak',
    isActive: true
  },
  {
    id: 'cd-29',
    type: 'funny',
    spiciness: 'medium',
    text: 'Biri senin hakkında dedikodu yapacak olsa kesinlikle söyleyeceği ilk cümle ne olurdu?',
    timestamp: '5 gün önce',
    addedBy: 'Cansu',
    isActive: true
  },
  {
    id: 'cd-30',
    type: 'funny',
    spiciness: 'mild',
    text: 'Telefonundaki en komik veya utanç verici otomatik düzeltme (autocorrect) hatasını anlat!',
    timestamp: '1 hafta önce',
    addedBy: 'Deniz',
    isActive: true
  },
  {
    id: 'cd-31',
    type: 'funny',
    spiciness: 'medium',
    text: 'Eğer bir parfüm markası çıkarsan ve kokusu senin bugünkü ruh halin olsa adı ne olurdu?',
    timestamp: '1 hafta önce',
    addedBy: 'Selin',
    isActive: true
  },
  {
    id: 'cd-32',
    type: 'funny',
    spiciness: 'mild',
    text: 'Hayatının filminde seni hangi ünlü oyuncunun oynamasını isterdin (ve hangi komedi sahnesinde)?',
    timestamp: '2 hafta önce',
    addedBy: 'Efe',
    isActive: true
  }
];

