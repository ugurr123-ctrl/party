export interface TriviaOption {
  text: string;
  subtitle?: string;
  isCorrect: boolean;
  popularGuess?: boolean;
}

export interface TriviaQuestion {
  id: string;
  category: string;
  difficulty: 'Kolay' | 'Orta Seviye' | 'Zor' | 'Çılgın';
  basePoints: number;
  question: string;
  highlightText?: string;
  teaser: string;
  options: TriviaOption[];
  explanation: string;
}

export const CHAOTIC_TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: 't-1',
    category: 'KAOTİK TARİH & ABSÜRT VAKALAR',
    difficulty: 'Orta Seviye',
    basePoints: 25,
    question: 'Hangisi tarihte gerçekten yaşanmamış uydurma bir olaydır?',
    highlightText: 'yaşanmamış',
    teaser: '3 gerçek absürt vaka var, 1 tanesi tamamen şehir efsanesi!',
    options: [
      {
        text: 'Lihtenştayn savaşa 80 kişiyle gidip 81 kişiyle geri döndü',
        subtitle: '1866 Avusturya-Prusya savaşı, İtalyan bir dost edindiler',
        isCorrect: false
      },
      {
        text: 'Napoleon yüzlerce evcil tavşanın saldırısına uğrayıp arabasına kaçtı',
        subtitle: 'Tavşan avında evcil tavşanlar serbest bırakılınca Napoleon\'a hücum etti',
        popularGuess: true,
        isCorrect: false
      },
      {
        text: 'Avustralya emu kuşlarına makineli tüfekle resmi savaş açıp kaybetti',
        subtitle: '1932 Büyük Emu Harbi - Askerler çekilmek zorunda kaldı',
        isCorrect: false
      },
      {
        text: "İzlanda'da 3 yıl boyunca patates yemek yasaklandı",
        subtitle: "Bira 1989'a kadar yasaktı ama patates hiç yasaklanmadı!",
        isCorrect: true
      }
    ],
    explanation: "İzlanda'da 1989 yılına kadar bira yasaktı ancak patates hiçbir zaman yasaklanmamıştır. Diğer 3 absürt olay ise tarihte aynen gerçekleşmiştir!"
  },
  {
    id: 't-2',
    category: 'POPÜLER KÜLTÜR & İNTERNET MİZAHI',
    difficulty: 'Kolay',
    basePoints: 20,
    question: 'Hangi ünlü Yeşilçam repliği filmde aslında tam olarak o şekilde SÖYLENMEMİŞTİR?',
    highlightText: 'SÖYLENMEMİŞTİR',
    teaser: 'Kolektif hafızamızın (Mandela etkisi) en büyük kurbanı!',
    options: [
      {
        text: '"Benim adım Cemil, ben bu mahallenin delisiyim"',
        subtitle: 'Bizimkiler / Sevimli Hırsız',
        isCorrect: false
      },
      {
        text: '"Nayır, nolamaz! Seni seveceğime taş olurum"',
        subtitle: 'Aslında sadece ayrı ayrı "Hayır" ve "Olamaz" denmiştir',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: '"Yaz kızım, 200 torba çimento"',
        subtitle: 'Hababam Sınıfı Şener Şen',
        isCorrect: false
      },
      {
        text: '"Mesela yani..."',
        subtitle: 'Kemal Sunal - Sahte Kabadayı',
        isCorrect: false
      }
    ],
    explanation: "Eski Türk filmlerinde 'Nayır nolamaz' şeklinde birleşmiş bir telaffuz hiçbir klasik film kaydında yoktur; Yeşilçam parodileri ve mizah dergileri tarafından türetilmiştir."
  },
  {
    id: 't-3',
    category: 'HAYVANLAR ALEMİ & DOĞA ŞOKLARI',
    difficulty: 'Orta Seviye',
    basePoints: 30,
    question: 'Aşağıdaki biyolojik gerçeklerden hangisi TAMAMEN UYDURMADIR?',
    highlightText: 'TAMAMEN UYDURMADIR',
    teaser: 'Doğa o kadar tuhaf ki uydurmayı ayırt etmek zor!',
    options: [
      {
        text: 'Wombat isimli keseli hayvanın dışkısı küp (kare prizma) şeklindedir',
        subtitle: 'Yuvarlanıp gitmesin diye evrimleşti',
        isCorrect: false
      },
      {
        text: 'Bukalemunlar sadece arkalarındaki rengi taklit etmek için renk değiştirir',
        subtitle: 'Aslında ruh hali ve vücut ısısına göre renk değiştirirler!',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Ahtapotların tam 3 tane kalbi ve mavi renkli kanı vardır',
        subtitle: 'Bakır bazlı hemosiyanin nedeniyle kanları mavidir',
        isCorrect: false
      },
      {
        text: 'Flamingolar sadece dizlerinin ters bükülmesi sayesinde tek ayak üstünde saatlerce uyur',
        subtitle: 'Vücut kilit mekanizmaları sıfır kas eforu gerektirir',
        isCorrect: false
      }
    ],
    explanation: 'Bukalemunlar kamufle olmak için değil; sıcaklık düzenlemesi ve diğer bukalemunlara stres, öfke ya da çiftleşme isteğini iletmek için renk değiştirir!'
  },
  {
    id: 't-4',
    category: 'DÜNYANIN EN SAÇMA YASALARI',
    difficulty: 'Zor',
    basePoints: 35,
    question: 'Hangisi dünyada bugün hâlâ resmi yasalarda yer alan GERÇEK bir yasaktır?',
    highlightText: 'GERÇEK bir yasaktır',
    teaser: 'Okurken "hadi canım" diyeceğiniz bir hukuk garabeti!',
    options: [
      {
        text: 'İsviçre\'de gece saat 22:00\'den sonra apartmanda sifon çekmek yasaktır',
        subtitle: 'Gürültü kirliliği yönetmeliği tavsiyesi',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Fransa\'da bir domuzun adını "Napoleon" koymak vatana ihanet sayılır',
        subtitle: 'Yıllar önce yürürlükten kalktı',
        isCorrect: false
      },
      {
        text: 'Almanya\'da otobanda benzin bitmesi yasal bir suç değildir',
        subtitle: 'Aksine ağır para cezası vardır',
        isCorrect: false
      },
      {
        text: 'İngiltere\'de parlamento binası içinde ölmek ölüm cezası gerektirir',
        subtitle: 'Böyle bir yasa maddesi hiçbir zaman olmadı',
        isCorrect: false
      }
    ],
    explanation: "İsviçre'de birçok kanton ve apartman tüzüğünde gece 22:00'den sonra sifon çekmek komşuların huzurunu bozduğu gerekçesiyle yasaklanmış veya ağır uyarılara tabidir!"
  },
  {
    id: 't-5',
    category: 'MİTOLOJİ & SİNEMA EFSANELERİ',
    difficulty: 'Orta Seviye',
    basePoints: 25,
    question: 'Matrix filmindeki ünlü yeşil akan kod yağmuru aslında neyin tarifidir?',
    highlightText: 'neyin tarifidir',
    teaser: 'Dünyayı hackleyen o ikonik kodlar mutfaktan çıktı!',
    options: [
      {
        text: 'Japonca Suşi ve Erişte tarifleri kitabının taranmış hali',
        subtitle: 'Tasarımcı Simon Whiteley eşinin yemek kitabını tarattı',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'C++ ile yazılmış ilk MS-DOS işletim sistemi çekirdek kodları',
        subtitle: 'Teknik bir hacker aldatmacası',
        isCorrect: false
      },
      {
        text: 'Eski Babil tabletlerindeki astronomi ve takvim çizelgeleri',
        subtitle: 'Mitolojik gizem',
        isCorrect: false
      },
      {
        text: 'Yönetmen kardeşlerin banka hesap ve sigorta dökümleri',
        subtitle: 'Finansal bir gönderme',
        isCorrect: false
      }
    ],
    explanation: "Matrix'in prodüksiyon tasarımcısı Simon Whiteley, eşinin Japonca suşi ve noddle yemek kitabından karakterleri tarayıp ters çevirerek ikonik yeşil kod yağmurunu oluşturmuştur!"
  },
  {
    id: 't-6',
    category: 'GIDA & ABUR CUBUR KAOSU',
    difficulty: 'Çılgın',
    basePoints: 40,
    question: 'Ketçap 1830\'lu yıllarda Amerika\'da ne olarak satılıyordu?',
    highlightText: 'ne olarak satılıyordu',
    teaser: 'Hamburgerin yanına sıkmadan önce iki kez düşünün!',
    options: [
      {
        text: 'Tıbbi ilaç ve hazımsızlık şurubu olarak',
        subtitle: 'Dr. John Cooke Bennett domates hapı ve özü olarak patentledi',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Duvar boyası ve ahşap cilası olarak',
        subtitle: 'Kırmızı pigment kaynağı',
        isCorrect: false
      },
      {
        text: 'Savaş gemilerinde pas sökücü kimyasal olarak',
        subtitle: 'Yüksek asidite nedeniyle',
        isCorrect: false
      },
      {
        text: 'Saç dökülmesini engelleyen kellik pomadı olarak',
        subtitle: 'Kozmetik mucize iddiası',
        isCorrect: false
      }
    ],
    explanation: "1834 yılında Dr. John Cooke Bennett, domatesin hazımsızlık, ishal ve sarılığa iyi geldiğini öne sürerek domates ketçabını hap ve tonik ilaç formunda satmıştır!"
  },
  {
    id: 't-7',
    category: 'TÜRK TELEVİZYON TARİHİ',
    difficulty: 'Kolay',
    basePoints: 20,
    question: 'Aşk-ı Memnu dizisinin efsanevi finalinde Bihter Ziyagil intihar ederken fonda hangi replik yankılanmıştır?',
    highlightText: 'hangi replik',
    teaser: 'Ekran başına kilitlenen milyonların kulağında kalan o son söz...',
    options: [
      {
        text: '"Beni, beni... Bihter\'ini!"',
        subtitle: 'Behlül kaçar!',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: '"Sen benim oğlumdun Behlül!"',
        subtitle: 'Adnan Bey repliği',
        isCorrect: false
      },
      {
        text: '"Gözlerimin önünde birbirlerini seviyorlar..."',
        subtitle: 'Matmazel monoloğu',
        isCorrect: false
      },
      {
        text: '"Hilmi Önal haklıymış meğer!"',
        subtitle: 'Firdevs Hanım şoku',
        isCorrect: false
      }
    ],
    explanation: "Bihter Ziyagil intihar etmeden önce Behlül'e son bakışıyla 'Beni beni... Bihter'ini!' diyerek Türk televizyon tarihinin en unutulmaz sahnesine imza atmıştır."
  },
  {
    id: 't-8',
    category: 'BİLİM & UZAY SAÇMALIKLARI',
    difficulty: 'Orta Seviye',
    basePoints: 25,
    question: 'Uzayda astronotların gaz çıkarması (geğirmesi) neden YERYÜZÜNDEKİ gibi mümkün değildir?',
    highlightText: 'neden mümkün değildir',
    teaser: 'Sıfır yerçekiminin mideye oynadığı acımasız oyun!',
    options: [
      {
        text: 'Yerçekimi olmadığı için midedeki gaz ile sıvı ayrışamaz, kusma refleksi oluşur',
        subtitle: 'Gaz ve sıvı birlikte dışarı çıkar ("ıslak geğirme")',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Kaskın içindeki oksijen sensörü patlama riski nedeniyle hemen kilitlenir',
        subtitle: 'Yangın emniyet protokolü',
        isCorrect: false
      },
      {
        text: 'Uzay giysisinin iç basıncı boğaz kaslarını felç eder',
        subtitle: 'Basınç kilidi',
        isCorrect: false
      },
      {
        text: 'Uzay yemeklerinde gaz yapıcı hiçbir molekül bulunmaz',
        subtitle: 'NASA özel menüsü',
        isCorrect: false
      }
    ],
    explanation: "Dünyada yerçekimi sıvıyı aşağıda, gazı yukarıda tutar. Ancak yerçekimsiz ortamda mide içindekiler ayrışmaz; astronot geğirmeye kalkarsa mide sıvısıyla birlikte çıkar (ıslak geğirme denir)."
  },
  {
    id: 't-9',
    category: 'MÜZİK & SKANDALLAR',
    difficulty: 'Orta Seviye',
    basePoints: 30,
    question: 'Tarkan\'ın "Şıkıdım (Hepsi Senin mi?)" şarkısının söz yazarı kimdir?',
    highlightText: 'söz yazarı kimdir',
    teaser: 'Tarkan ile arasındaki telif krizleri yıllarca konuşuldu!',
    options: [
      {
        text: 'Sezen Aksu',
        subtitle: 'Minik Serçe imzalı kült klasik',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Tarkan Tevetoğlu kendisi yazdı',
        subtitle: 'Kendi hitini yarattı',
        isCorrect: false
      },
      {
        text: 'Aysel Gürel',
        subtitle: 'Çılgın şair',
        isCorrect: false
      },
      {
        text: 'Ozan Çolakoğlu',
        subtitle: 'Efsanevi aranjör',
        isCorrect: false
      }
    ],
    explanation: "Şıkıdım ve Şımarık şarkılarının söz ve müziği Sezen Aksu'ya aittir. Daha sonra ikili arasında telif hakları nedeniyle uzun süren anlaşmazlıklar yaşanmıştır."
  },
  {
    id: 't-10',
    category: 'ŞEHİR EFSANELERİ & İCATLAR',
    difficulty: 'Çılgın',
    basePoints: 35,
    question: 'Mikrodalga fırın tesadüfen nasıl icat edilmiştir?',
    highlightText: 'nasıl icat edilmiştir',
    teaser: 'Bir mühendisin cebindeki atıştırmalık dünyayı değiştirdi!',
    options: [
      {
        text: 'Mühendisin cebindeki çikolata radar tüpünün yanında eriyince',
        subtitle: 'Percy Spencer 1945 yılında radar magnetronunu test ederken',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Laboratuvarda unutulan kahve fincanı patlayınca',
        subtitle: 'Harvard deney kazası',
        isCorrect: false
      },
      {
        text: 'Telsiz kulesine çarpan bir güvercin pişince',
        subtitle: 'Askeri üs söylentisi',
        isCorrect: false
      },
      {
        text: 'Radyo antenine takılan ıslak mendil alev alınca',
        subtitle: 'Kısa devre kazası',
        isCorrect: false
      }
    ],
    explanation: "1945'te Raytheon mühendisi Percy Spencer, aktif bir radar tüpünün önünde çalışırken cebindeki fıstıklı çikolatanın eridiğini fark etti ve mikrodalga fırının patentini aldı!"
  },
  {
    id: 't-11',
    category: 'DÜNYA REKORLARI & TUHAFLIKLAR',
    difficulty: 'Kolay',
    basePoints: 20,
    question: 'Dünyanın en uzun süren Monopoly kutu oyunu maçı kesintisiz ne kadar sürmüştür?',
    highlightText: 'ne kadar sürmüştür',
    teaser: 'Dostlukları bitiren oyun rekorlar kitabında!',
    options: [
      {
        text: '70 gün (1680 saat)',
        subtitle: 'Küvetin içinde, ağaç evde ve su altında oynayanlar oldu',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: '14 gün',
        subtitle: 'İki inatçı oda arkadaşı',
        isCorrect: false
      },
      {
        text: '6 ay',
        subtitle: 'Yurt odası maratonu',
        isCorrect: false
      },
      {
        text: '3 gün',
        subtitle: 'Klasik rekor denemesi',
        isCorrect: false
      }
    ],
    explanation: "Resmi Guinness rekorlarına göre en uzun Monopoly oyunu tam 70 gün (1680 saat) sürmüştür! Su altında oynanan en uzun oyun ise 45 gün sürmüştür."
  },
  {
    id: 't-12',
    category: 'SİNEMA & POPÜLER KÜLTÜR',
    difficulty: 'Zor',
    basePoints: 35,
    question: 'Terminatör (1984) filminde Arnold Schwarzenegger film boyunca toplam KAÇ KELİME konuşmuştur?',
    highlightText: 'KAÇ KELİME',
    teaser: '"I\'ll be back" dedikten sonra pek bir şey kalmadı!',
    options: [
      {
        text: 'Sadece 74 kelime',
        subtitle: '17 kısa replik ve bolca aksiyon!',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Yaklaşık 350 kelime',
        subtitle: 'Monologlar hariç',
        isCorrect: false
      },
      {
        text: 'Hiç konuşmadı, ses efektleri dublajdı',
        subtitle: 'Robotik dublaj miti',
        isCorrect: false
      },
      {
        text: '120 kelime',
        subtitle: 'Polis istasyonu sahnesiyle beraber',
        isCorrect: false
      }
    ],
    explanation: "Arnold Schwarzenegger ilk Terminatör filminde toplam 17 cümle ve sadece 74 kelime söylemiştir; buna rağmen sinema tarihinin en ikonik karakterlerinden biri olmuştur."
  },
  {
    id: 't-13',
    category: 'UZAY & GÖKYÜZÜ GİZEMLERİ',
    difficulty: 'Orta Seviye',
    basePoints: 30,
    question: 'Güneş sistemimizde hangi gezegende gökten GERÇEK ELMAS YAĞMAKTADIR?',
    highlightText: 'ELMAS YAĞMAKTADIR',
    teaser: 'Gezegen bilimcilerin en değerli keşiflerinden biri!',
    options: [
      {
        text: 'Neptün ve Uranüs',
        subtitle: 'Aşırı metan basıncı karbonu elmasa çevirir',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Mars',
        subtitle: 'Kızıl toprak kristalleri',
        isCorrect: false
      },
      {
        text: 'Venüs',
        subtitle: 'Asit bulutları miti',
        isCorrect: false
      },
      {
        text: 'Jüpiter\'in uydusu Europa',
        subtitle: 'Buz tabakası altı',
        isCorrect: false
      }
    ],
    explanation: "Neptün ve Uranüs'ün atmosferinde aşırı yüksek basınç ve sıcaklık, metandaki karbon atomlarını sıkıştırarak gökyüzünden sıvı elmas yağmurları yağmasına sebep olur!"
  },
  {
    id: 't-14',
    category: 'YİYECEK & DÜNYA MUTFAĞI',
    difficulty: 'Kolay',
    basePoints: 20,
    question: 'Hangisi botanik olarak bir meyve değil, bir ÇİÇEK TOMURCUĞUDUR?',
    highlightText: 'ÇİÇEK TOMURCUĞUDUR',
    teaser: 'Salatalarda ve zeytinyağlılarda sıkça tüketilir!',
    options: [
      {
        text: 'Enginar',
        subtitle: 'Hasat edilmezse mor bir çiçeğe dönüşür!',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Avokado',
        subtitle: 'Tek çekirdekli dutsu meyve',
        isCorrect: false
      },
      {
        text: 'Domates',
        subtitle: 'Çekirdekli kırmızı meyve',
        isCorrect: false
      },
      {
        text: 'Salatalık',
        subtitle: 'Kabakgiller familyası meyvesi',
        isCorrect: false
      }
    ],
    explanation: "Enginar aslında bir bitkinin açmamış çiçek tomurcuğudur. Eğer zamanında toplanmazsa ortasından muhteşem mor ve mavi yapraklı dev bir çiçek açar!"
  },
  {
    id: 't-15',
    category: 'İNTERNET & OYUN TARİHİ',
    difficulty: 'Orta Seviye',
    basePoints: 25,
    question: 'Dünyanın ilk bilgisayar faresi (mouse) hangi malzemeden yapılmıştır?',
    highlightText: 'hangi malzemeden',
    teaser: '1964 yılında Douglas Engelbart tarafından icat edildi!',
    options: [
      {
        text: 'Ahşap (Tahta blok)',
        subtitle: 'İki metal tekerlekli ahşap kabuk',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: 'Demir döküm',
        subtitle: 'Ağır endüstriyel malzeme',
        isCorrect: false
      },
      {
        text: 'Sert plastik (Bakalit)',
        subtitle: 'Telefon ahizesi plastiği',
        isCorrect: false
      },
      {
        text: 'Alüminyum plaka',
        subtitle: 'Hafif metal kaplama',
        isCorrect: false
      }
    ],
    explanation: "1964 yılında Stanford Araştırma Enstitüsü'nde icat edilen ilk bilgisayar faresi oyulmuş bir tahta bloktan ve içine yerleştirilen iki dik tekerlekten yapılmıştı!"
  },
  {
    id: 't-16',
    category: 'HAYVANLAR ALEMİ & DOĞA',
    difficulty: 'Zor',
    basePoints: 35,
    question: 'Ahtapotların vücudunda toplam KAÇ TANE KALP bulunmaktadır?',
    highlightText: 'KAÇ TANE KALP',
    teaser: 'Mavi kana sahip bu deniz canlısı üçlü pompa sistemine sahiptir!',
    options: [
      {
        text: 'Tam 3 adet kalp',
        subtitle: '2 tanesi solungaçlara, 1 tanesi vücuda kan pompalar',
        popularGuess: true,
        isCorrect: true
      },
      {
        text: '1 adet büyük kalp',
        subtitle: 'Klasik canlı anatomisi',
        isCorrect: false
      },
      {
        text: '8 adet (her kola bir tane)',
        subtitle: 'Kollarındaki sinir düğümleriyle karıştırılır',
        isCorrect: false
      },
      {
        text: 'Kalpleri yoktur, damarlar atar',
        subtitle: 'Omurgasız miti',
        isCorrect: false
      }
    ],
    explanation: "Ahtapotların tam 3 tane kalbi vardır! İki kalp kanı solungaçlara pompalar, üçüncü büyük kalp ise oksijenli mavi kanı vücudun geri kalanına ulaştırır."
  }
];
