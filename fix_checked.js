const fs = require('fs');
const glob = require('glob');

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/checked=""/g, 'defaultChecked');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed checked="" in', file);
  }
});
