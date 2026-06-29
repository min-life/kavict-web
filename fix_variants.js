const fs = require('fs');
['app/components/landing/HeroSection.tsx', 'app/components/landing/FeaturesSection.tsx', 'app/components/landing/PricingSection.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ motion \} from "framer-motion";/g, 'import { motion, Variants } from "framer-motion";');
  content = content.replace(/const containerVariants = \{/g, 'const containerVariants: Variants = {');
  content = content.replace(/const cardVariants = \{/g, 'const cardVariants: Variants = {');
  content = content.replace(/const itemVariants = \{/g, 'const itemVariants: Variants = {');
  fs.writeFileSync(file, content);
  console.log('Fixed variants in', file);
});
