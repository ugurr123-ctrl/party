import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();
const ROOT_DIR = process.cwd();
const OUTPUT_ZIP = path.join(ROOT_DIR, 'public', 'party-box-tam-proje.zip');

function addDirectoryToZip(dirPath, zipFolder, excludeNames = []) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (excludeNames.includes(item)) continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subFolder = zipFolder.folder(item);
      addDirectoryToZip(fullPath, subFolder, excludeNames);
    } else {
      if (item.endsWith('.zip')) continue;
      const data = fs.readFileSync(fullPath);
      zipFolder.file(item, data);
    }
  }
}

console.log('Building Party Box complete project ZIP...');

// Add root configuration files
const rootFiles = [
  'index.html',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.node.json',
  'capacitor.config.json'
];

for (const file of rootFiles) {
  const p = path.join(ROOT_DIR, file);
  if (fs.existsSync(p)) {
    zip.file(file, fs.readFileSync(p));
  }
}

// Add comprehensive store guide
const readmeContent = `# Party Box - Tam Mobil & Web Proje Kaynak Kodları

Bu paket, Party Box uygulamasının tüm ön yüz, oyun motorları, ses sentezleyicisi ve mağaza yayınlama ayarlarını eksiksiz olarak içerir.

## Proje Bilgileri
- Uygulama Adı: Party Box
- Paket Kimliği (Bundle ID): com.partybox.app
- Kategori: Oyunlar / Parti / Masa Oyunları
- Mağaza Logoları: public/assets/icons/ klasöründe Google Play ve App Store için 1024x1024 boyutunda mevcuttur.
- Gizlilik Politikası: public/privacy-policy.html

## 1. Geliştirme Ortamında Çalıştırma
npm install
npm run dev

## 2. Google Play Store İçin Android APK / AAB Çıkarma
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
Android Studio'da: Build -> Generate Signed Bundle / APK -> Android App Bundle seçip Google Play Console'a yükleyin.

## 3. Apple App Store İçin iOS IPA Çıkarma (Mac Gerektirir)
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
Xcode'da: Product -> Archive -> Distribute App -> App Store Connect.

## Zorunlu Mağaza Linkleri
- Gizlilik Politikası (Privacy Policy URL):
  https://ais-pre-kb7ewp2gca55bbfaraukgk-848124876637.europe-west2.run.app/privacy-policy.html
- Destek / İletişim (Support URL):
  https://ais-pre-kb7ewp2gca55bbfaraukgk-848124876637.europe-west2.run.app/privacy-policy.html
`;

zip.file('README-KURULUM-VE-YAYINLAMA.md', readmeContent);

// Add src directory
const srcFolder = zip.folder('src');
addDirectoryToZip(path.join(ROOT_DIR, 'src'), srcFolder);

// Add public directory (clean)
const publicFolder = zip.folder('public');
addDirectoryToZip(path.join(ROOT_DIR, 'public'), publicFolder, ['aistudio', 'party-box-tam-proje.zip']);

// Add android directory
const androidFolder = zip.folder('android');
addDirectoryToZip(path.join(ROOT_DIR, 'android'), androidFolder, ['.gradle', 'build']);

// Add ios directory
const iosFolder = zip.folder('ios');
addDirectoryToZip(path.join(ROOT_DIR, 'ios'), iosFolder, ['Pods', 'build', 'DerivedData']);

// Specifically add icons
const iconsPath = path.join(ROOT_DIR, 'public', 'assets', 'icons');
if (fs.existsSync(iconsPath)) {
  const assetsFolder = publicFolder.folder('assets');
  const iconsFolder = assetsFolder.folder('icons');
  addDirectoryToZip(iconsPath, iconsFolder);
}

// Ensure all logos are present in root public inside zip
['app-logo.png', 'logo-app-store.png', 'logo-google-play.png'].forEach((file) => {
  const p = path.join(ROOT_DIR, 'public', file);
  if (fs.existsSync(p)) {
    publicFolder.file(file, fs.readFileSync(p));
  }
});

// Generate ZIP
zip
  .generateNodeStream({ type: 'nodebuffer', streamFiles: true, compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .pipe(fs.createWriteStream(OUTPUT_ZIP))
  .on('finish', () => {
    const stat = fs.statSync(OUTPUT_ZIP);
    const mb = (stat.size / 1024 / 1024).toFixed(2);
    console.log('ZIP successfully created at ' + OUTPUT_ZIP + ' (' + mb + ' MB)');
  })
  .on('error', (err) => {
    console.error('Error generating zip:', err);
  });
