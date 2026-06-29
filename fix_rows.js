const fs = require('fs');
const glob = require('glob');

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/rows="(\d+)"/g, 'rows={$1}');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed', file);
  }
});
