const fs = require('fs');
const glob = require('glob');

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/onClick="([^"]+)"/g, (match, code) => {
    // Replace 'this' with 'e.currentTarget'
    const safeCode = code.replace(/\bthis\b/g, 'e.currentTarget');
    return `onClick={(e) => { ${safeCode} }}`;
  });
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed onClick in', file);
  }
});
