const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '_stitch_raw');
const APP_DIR = path.join(__dirname, 'app');

// ============================================================
// HTML → JSX Conversion
// ============================================================

function htmlToJsx(html) {
  // 1. Extract <body> content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;

  // 2. Remove <script> blocks
  content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 3. Convert HTML comments to JSX comments
  content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // 4. class → className
  content = content.replace(/\bclass="/g, 'className="');
  content = content.replace(/\bclass='/g, "className='");

  // 5. for → htmlFor
  content = content.replace(/\bfor="/g, 'htmlFor="');

  // 6. tabindex → tabIndex
  content = content.replace(/\btabindex="/g, 'tabIndex="');

  // 7. Handle style attributes
  // style="font-variation-settings: &quot;FILL&quot; 1;"
  content = content.replace(/style="([^"]*)"/g, (match, styleStr) => {
    // Decode HTML entities
    let decoded = styleStr
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    const props = decoded
      .split(';')
      .filter(s => s.trim())
      .map(s => {
        const colonIdx = s.indexOf(':');
        if (colonIdx === -1) return null;
        const prop = s.substring(0, colonIdx).trim();
        const value = s.substring(colonIdx + 1).trim();

        // Convert CSS prop to camelCase
        const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

        // Check if value is a pure number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value === String(numValue)) {
          return `${camelProp}: ${numValue}`;
        }
        // Escape single quotes in value
        return `${camelProp}: '${value.replace(/'/g, "\\'")}'`;
      })
      .filter(Boolean);

    return `style={{${props.join(', ')}}}`;
  });

  // 8. onclick → onClick  (and other event handlers)
  content = content.replace(/\bonclick="/gi, 'onClick="');
  content = content.replace(/\bonchange="/gi, 'onChange="');
  content = content.replace(/\bonsubmit="/gi, 'onSubmit="');
  content = content.replace(/\bonkeydown="/gi, 'onKeyDown="');
  content = content.replace(/\bonkeyup="/gi, 'onKeyUp="');
  content = content.replace(/\bonmouseover="/gi, 'onMouseOver="');
  content = content.replace(/\bonmouseout="/gi, 'onMouseOut="');
  content = content.replace(/\bonfocus="/gi, 'onFocus="');
  content = content.replace(/\bonblur="/gi, 'onBlur="');

  // 9. Self-closing tags
  // Fix void elements that aren't self-closed
  content = content.replace(/<(img|input|br|hr|meta|link|source|area|col|embed|track|wbr)(\s[^>]*?)?(?<!\/)>/gi, '<$1$2 />');

  // 10. Fix boolean attributes
  content = content.replace(/\bautofocus\b(?!=)/g, 'autoFocus');
  content = content.replace(/\breadonly\b(?!=)/g, 'readOnly');
  content = content.replace(/\bchecked\b(?!=)/g, 'defaultChecked');

  // 11. Handle &amp; etc in text (JSX handles these fine, but clean up doubled ones)
  // Actually JSX should handle HTML entities fine, leave as-is

  return content;
}

// ============================================================
// Route Mappings
// ============================================================

const ROUTES = [
  // Public pages (no sidebar)
  {
    htmlFile: 'landing.html',
    destFile: 'app/page.tsx',
    componentName: 'LandingPage',
    extractBody: true, // full body content
  },
  {
    htmlFile: 'login.html',
    destFile: 'app/login/page.tsx',
    componentName: 'LoginPage',
    extractBody: true,
  },
  {
    htmlFile: 'register.html',
    destFile: 'app/register/page.tsx',
    componentName: 'RegisterPage',
    extractBody: true,
  },
  // Onboarding
  {
    htmlFile: 'onboarding-welcome.html',
    destFile: 'app/onboarding/page.tsx',
    componentName: 'OnboardingWelcome',
    extractBody: true,
  },
  {
    htmlFile: 'onboarding-role.html',
    destFile: 'app/onboarding/role/page.tsx',
    componentName: 'OnboardingRole',
    extractBody: true,
  },
  {
    htmlFile: 'onboarding-method.html',
    destFile: 'app/onboarding/method/page.tsx',
    componentName: 'OnboardingMethod',
    extractBody: true,
  },
  {
    htmlFile: 'onboarding-complete.html',
    destFile: 'app/onboarding/complete/page.tsx',
    componentName: 'OnboardingComplete',
    extractBody: true,
  },
  // Dashboard pages (these go inside the sidebar layout)
  // We extract only the <main> content (not the sidebar)
  {
    htmlFile: 'dashboard-overview.html',
    destFile: 'app/dashboard/page.tsx',
    componentName: 'DashboardOverview',
    extractMain: true, // extract <main> content only
  },
  {
    htmlFile: 'dashboard-home.html',
    destFile: 'app/dashboard/home/page.tsx',
    componentName: 'DashboardHome',
    extractMain: true,
  },
  {
    htmlFile: 'learning-path.html',
    destFile: 'app/dashboard/learning-path/page.tsx',
    componentName: 'LearningPath',
    extractMain: true,
  },
  {
    htmlFile: 'lesson-detail.html',
    destFile: 'app/dashboard/lesson/[id]/page.tsx',
    componentName: 'LessonDetail',
    extractMain: true,
  },
  {
    htmlFile: 'leaderboard.html',
    destFile: 'app/dashboard/leaderboard/page.tsx',
    componentName: 'Leaderboard',
    extractMain: true,
  },
  {
    htmlFile: 'news.html',
    destFile: 'app/dashboard/news/page.tsx',
    componentName: 'NewsHub',
    extractMain: true,
  },
  {
    htmlFile: 'profile.html',
    destFile: 'app/dashboard/profile/page.tsx',
    componentName: 'UserProfile',
    extractMain: true,
  },
  {
    htmlFile: 'upgrade.html',
    destFile: 'app/dashboard/upgrade/page.tsx',
    componentName: 'UpgradePlan',
    extractMain: true,
  },
  {
    htmlFile: 'ai-tutor.html',
    destFile: 'app/dashboard/ai-tutor/page.tsx',
    componentName: 'AiTutor',
    extractMain: true,
  },
];

function extractMainContent(html) {
  // Many dashboard screens include a full sidebar+main layout.
  // We want only the inner content of <main>.
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    return mainMatch[1];
  }
  // Fallback: return full body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function processRoute(route) {
  const srcPath = path.join(RAW_DIR, route.htmlFile);
  if (!fs.existsSync(srcPath)) {
    console.log(`⏭ Skipping "${route.htmlFile}" (file not found)`);
    return;
  }

  let rawHtml = fs.readFileSync(srcPath, 'utf8');
  let content;

  if (route.extractMain) {
    // For dashboard pages: extract only <main> inner content, then convert
    content = extractMainContent(rawHtml);
    // Remove scripts from extracted content
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Convert to JSX
    content = htmlToJsx(`<body>${content}</body>`);
  } else {
    // For full-page screens: extract full body
    content = htmlToJsx(rawHtml);
  }

  // Wrap in React component
  const component = `export default function ${route.componentName}() {
  return (
    <>
${content}
    </>
  );
}
`;

  // Ensure directory exists
  const destPath = path.join(__dirname, route.destFile);
  const destDir = path.dirname(destPath);
  fs.mkdirSync(destDir, { recursive: true });

  fs.writeFileSync(destPath, component);
  console.log(`✅ ${route.destFile} (${route.componentName})`);
}

// ============================================================
// Run
// ============================================================

console.log('Converting Stitch HTML → React Components...\n');

for (const route of ROUTES) {
  processRoute(route);
}

// Copy logo SVG to public
const logoSrc = path.join(RAW_DIR, 'logo.svg');
if (fs.existsSync(logoSrc)) {
  const publicDir = path.join(__dirname, 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(logoSrc, path.join(publicDir, 'kavict-logo.svg'));
  console.log('\n✅ Logo SVG copied to public/kavict-logo.svg');
}

console.log('\n🎉 All conversions complete!');
