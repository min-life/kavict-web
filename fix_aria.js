const fs = require('fs');
const glob = require('glob');

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/aria-value(max|min|now)="(\d+)"/g, 'aria-value$1={$2}');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed aria-value in', file);
  }
});
