const fs = require('fs');
const https = require('https');
const path = require('path');

// Read the list_screens output
const inputPath = path.join(__dirname, 'screens_data.json');

// Screen mappings: Stitch screen title → local filename
const SCREEN_MAP = {
  'KAVICT - Sidebar Navigation Dashboard': 'sidebar',
  'KAVICT Landing Page - Detailed Features & Pricing': 'landing',
  'KAVICT Dashboard - Unified Financial Overview': 'dashboard-overview',
  'KAVICT - Gia sư AI Tài chính (AI Tutor)': 'ai-tutor',
  'KAVICT - Nội dung Trang chủ Dashboard': 'dashboard-home',
  'KAVICT Upgrade Plan - Content Area Only': 'upgrade',
  'KAVICT - Chi tiết bài học tương tác': 'lesson-detail',
  'KAVICT - Lộ trình học tập với đường nối bản đồ': 'learning-path',
  'KAVICT User Profile - Personal Dashboard': 'profile',
  'KAVICT - Bảng xếp hạng học tập (Leaderboard)': 'leaderboard',
  'KAVICT - Onboarding: Chào mừng': 'onboarding-welcome',
  'KAVICT - Onboarding: Hoàn thành (Full Minimal)': 'onboarding-complete',
  'KAVICT News Hub - Content Area Only': 'news',
  'KAVICT - Onboarding: Nhóm người dùng': 'onboarding-role',
  'KAVICT - Lựa chọn phương thức học tập': 'onboarding-method',
  'KAVICT - Đăng ký': 'register',
  'KAVICT - Đăng nhập': 'login',
  'KAVICT Logo': 'logo',
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  // Use the screens data from Stitch API
  const screensData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const screens = screensData.screens;
  
  const outDir = __dirname;
  
  for (const screen of screens) {
    const fileName = SCREEN_MAP[screen.title];
    if (!fileName) {
      console.log(`⏭ Skipping: "${screen.title}" (no mapping, likely an image asset)`);
      continue;
    }
    
    if (!screen.htmlCode || !screen.htmlCode.downloadUrl) {
      console.log(`⏭ Skipping: "${screen.title}" (no HTML code available)`);
      continue;
    }
    
    const ext = screen.htmlCode.mimeType === 'image/svg+xml' ? '.svg' : '.html';
    const dest = path.join(outDir, fileName + ext);
    
    console.log(`⬇ Downloading "${screen.title}" → ${fileName}${ext}`);
    await downloadFile(screen.htmlCode.downloadUrl, dest);
  }
  
  console.log('\n✅ All screens downloaded!');
}

main().catch(console.error);
