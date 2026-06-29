const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');
content = content.replace(/querySelector\('([^']+)'\)\.textContent/g, "querySelector('$1')?.textContent");
content = content.replace(/querySelector\('([^']+)'\)\.classList/g, "querySelector('$1')?.classList");
fs.writeFileSync('app/page.tsx', content);
console.log('Fixed querySelector in page.tsx');
