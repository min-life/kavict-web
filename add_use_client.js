const fs = require('fs');
const glob = require('glob');

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('onClick=') && !content.includes('"use client"')) {
    fs.writeFileSync(file, '"use client";\n\n' + content);
    console.log('Added use client to', file);
  }
});
