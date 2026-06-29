const fs = require('fs');
const glob = require('glob');

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/disabled=""/g, 'disabled');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed disabled="" in', file);
  }
});
