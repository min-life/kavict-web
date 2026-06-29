const fs = require('fs');
const path = require('path');

const map = {
  'max-w-sm': 'max-w-[384px]',
  'max-w-md': 'max-w-[448px]',
  'max-w-lg': 'max-w-[512px]',
  'max-w-xl': 'max-w-[576px]',
  'max-w-2xl': 'max-w-[672px]',
  'max-w-3xl': 'max-w-[768px]',
  'max-w-4xl': 'max-w-[896px]',
  'max-w-5xl': 'max-w-[1024px]',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [key, value] of Object.entries(map)) {
        // Only replace exact class names, not parts of words
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, value);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('app');
