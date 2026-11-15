import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'data', 'projectSourceBundle.ts');

const filesToInclude = {};

function addBinaryFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (fs.existsSync(fullPath)) {
    filesToInclude[relativePath] = '__BASE64__:' + fs.readFileSync(fullPath).toString('base64');
  }
}

function addTextFile(relativePath) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (fs.existsSync(fullPath)) {
    filesToInclude[relativePath] = fs.readFileSync(fullPath, 'utf-8');
  }
}

function scanDir(dir) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) return;
  const items = fs.readdirSync(fullDir);
  for (const item of items) {
    if (['node_modules', 'dist', '.git', 'aistudio', 'party-box-tam-proje.zip'].includes(item)) continue;
    const rel = path.join(dir, item);
    const full = path.join(ROOT_DIR, rel);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(rel);
    } else if (item.includes('projectSourceBundle')) {
      // Ensure the extracted project has this file for clean compilation!
      filesToInclude[rel] = `// Auto-generated bundle stub for offline compilation\nexport const PROJECT_SOURCE_BUNDLE: Record<string, string> = {};\n`;
    } else if (item.match(/\.(ts|tsx|css|json|html|md|svg)$/)) {
      filesToInclude[rel] = fs.readFileSync(full, 'utf-8');
    } else if (item.match(/\.(png|jpg|jpeg|webp)$/i)) {
      filesToInclude[rel] = '__BASE64__:' + fs.readFileSync(full).toString('base64');
    }
  }
}

function scanNativeDir(dir) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) return;
  const items = fs.readdirSync(fullDir);
  for (const item of items) {
    if (['.gradle', 'build', 'Pods', 'DerivedData', '.git', 'public'].includes(item)) continue;
    const rel = path.join(dir, item);
    const full = path.join(ROOT_DIR, rel);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanNativeDir(rel);
    } else if (item.match(/\.(gradle|xml|java|kt|swift|plist|pbxproj|properties|json|md)$/)) {
      try {
        filesToInclude[rel] = fs.readFileSync(full, 'utf-8');
      } catch {
        // ignore
      }
    } else if (item.match(/\.(png|jpg|jpeg|webp)$/i)) {
      try {
        filesToInclude[rel] = '__BASE64__:' + fs.readFileSync(full).toString('base64');
      } catch {
        // ignore
      }
    }
  }
}

// 1. Scan source code & native platforms
scanDir('src');
scanNativeDir('android');
scanNativeDir('ios');

// 2. Root configuration files
addTextFile('index.html');
addTextFile('package.json');
addTextFile('vite.config.ts');
addTextFile('tsconfig.json');
addTextFile('tsconfig.node.json');
addTextFile('capacitor.config.json');
addTextFile('public/manifest.json');
addTextFile('public/privacy-policy.html');

// 3. Official Store Logos and Icons (Binary base64 encoded for genuine PNG output)
addBinaryFile('public/app-logo.png');
addBinaryFile('public/logo-app-store.png');
addBinaryFile('public/logo-google-play.png');
addBinaryFile('public/assets/icons/app-logo.png');
addBinaryFile('public/assets/icons/logo-app-store.png');
addBinaryFile('public/assets/icons/logo-google-play.png');

// 4. iOS Xcode AppIcon Assets
addBinaryFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
addBinaryFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon.png');
addTextFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json');

// 5. Setup & Store Guide
filesToInclude['README-KURULUM-VE-YAYINLAMA.md'] = `# Party Box - Tam Mobil & Web Proje Kaynak Kodları

Bu paket, Party Box uygulamasının tüm ön yüz, oyun motorları, ses sentezleyicisi ve mağaza yayınlama ayarlarını eksiksiz olarak içerir.

## 📦 Proje Bilgileri
- Uygulama Adı: Party Box
- Paket Kimliği (Bundle ID): com.partybox.app
- Sürüm: 1.0.0
- Hedef Platformlar: Google Play Store (AAB) & Apple App Store (IPA)
- İkonlar: iOS (1024x1024 AppIcon-512@2x.png) ve Android (mipmap ic_launcher) eksiksiz mevcuttur.

## 🚀 1. Geliştirme Ortamında Çalıştırma
Bilgisayarınızda Node.js (v18+) kurulu olmalıdır.
\`\`\`bash
npm install
npm run dev
\`\`\`
Tarayıcınızda http://localhost:3000 adresinde çalışacaktır.

## 📱 2. Google Play Store İçin Android APK / AAB Çıkarma
\`\`\`bash
# 1. Projeyi derleyin
npm install
npm run build

# 2. Capacitor Android ortamını senkronize edin
npx cap sync android

# 3. Android Studio'da açın
npx cap open android
\`\`\`
Android Studio açıldığında:
1. Menüden "Build" -> "Generate Signed Bundle / APK" seçin.
2. "Android App Bundle (.aab)" seçeneğini işaretleyin.
3. Keystore oluşturup onaylayın.
4. Çıkan .aab dosyasını doğrudan Google Play Console'a yükleyin.

## 🍎 3. Apple App Store İçin iOS IPA Çıkarma (Mac Gerektirir)
\`\`\`bash
npm run build
npx cap sync ios
npx cap open ios
\`\`\`
Xcode açıldığında:
1. Sol taraftan "App" projenizi seçip Apple Geliştirici Hesabınızı ekleyin (Signing & Capabilities).
2. Üst menüden "Product" -> "Archive" yapın.
3. "Distribute App" -> "App Store Connect" seçeneğiyle doğrudan mağazaya gönderin.

## 📋 Zorunlu Mağaza Linkleri
- Gizlilik Politikası (Privacy Policy URL):
  https://ais-pre-kb7ewp2gca55bbfaraukgk-848124876637.europe-west2.run.app/privacy-policy.html
- Destek / İletişim (Support URL):
  https://ais-pre-kb7ewp2gca55bbfaraukgk-848124876637.europe-west2.run.app/privacy-policy.html
`;

console.log('Total files collected for bundle:', Object.keys(filesToInclude).length);

const outputContent = `// Auto-generated in-memory project bundle for 100% offline client-side ZIP generation
// Includes full TypeScript sources, native Android/iOS projects, and binary PNG app icons.

export const PROJECT_SOURCE_BUNDLE: Record<string, string> = ${JSON.stringify(filesToInclude, null, 2)};
`;

fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf-8');
console.log('✅ projectSourceBundle.ts written successfully. Size:', (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1), 'KB');
