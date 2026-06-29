const fs = require('fs');
const glob = require('glob');

const SVG_ATTRS = {
  'preserveaspectratio': 'preserveAspectRatio',
  'viewbox': 'viewBox',
  'stroke-width': 'strokeWidth',
  'stroke-dasharray': 'strokeDasharray',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'clip-path': 'clipPath'
};

glob.sync('app/**/*.tsx').forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const [attr, jsxAttr] of Object.entries(SVG_ATTRS)) {
    // Regex to match attributes carefully
    const regex = new RegExp(`\\b${attr}=`, 'g');
    newContent = newContent.replace(regex, `${jsxAttr}=`);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Fixed SVG attributes in', file);
  }
});
