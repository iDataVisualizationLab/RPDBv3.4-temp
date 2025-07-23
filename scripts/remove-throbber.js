const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the root directory of the project
const rootDir = '/Users/amauriribeiro/RPDBv3.2';

console.log('Finding files with Throbber references...');
const grepCommand = `grep -l "Throbber" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" -r ${rootDir}/src`;
const filesWithThrobber = execSync(grepCommand)
  .toString()
  .split('\n')
  .filter(file => file.trim().length > 0);

console.log(`Found ${filesWithThrobber.length} files with Throbber references`);

// Process each file
let totalReplacements = 0;
filesWithThrobber.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  console.log(`Processing: ${file}`);
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Remove import statements for Throbber
  content = content.replace(/import\s+(\{[^}]*\bThrobber\b[^}]*\}|\bThrobber\b)\s+from\s+['"].*?['"];?/g, '');
  
  // Remove Throbber type imports
  content = content.replace(/import\s+\{[^}]*\b(ThrobberSize|ThrobberColor|ThrobberType)\b[^}]*\}\s+from\s+['"].*?['"];?/g, '');
  
  // Remove locally defined Throbber types
  content = content.replace(/type\s+(ThrobberSize|ThrobberColor|ThrobberType)\s*=\s*[^;]+;/g, '');
  
  // Remove loading percentage states specifically used for Throbber
  content = content.replace(/const\s+\[\w*[lL]oadingPercentage\w*,\s*set\w*[lL]oadingPercentage\w*\]\s*=\s*useState(<[^>]+>)?\([^)]+\);/g, '');
  
  // Replace Throbber usage with simple loading spinner
  content = content.replace(/<Throbber\s+[^>]*size=['"](\w+)['"]\s+[^>]*\/?>/g, 
    '<div className="animate-spin h-$1 w-$1 border-2 border-blue-600 border-t-transparent rounded-full"></div>');
  
  // Replace Throbber with text
  content = content.replace(/<Throbber\s+[^>]*text=["']([^"']+)["'][^>]*\/?>/g, 
    '<div className="flex flex-col items-center"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div><p className="mt-2">$1</p></div>');
  
  // Handle more complex Throbber components
  content = content.replace(/<Throbber\b[^>]*>[\s\S]*?<\/Throbber>/g, 
    '<div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>');
  
  // Remove effects that update loading percentages
  content = content.replace(/useEffect\(\s*\(\)\s*=>\s*{\s*(?:let|const)\s+interval\s*=\s*setInterval\(\s*\(\)\s*=>\s*{\s*(?:if\s*\([^)]+\)\s*{)?\s*set\w*[lL]oadingPercentage[^}]*}\s*\);\s*[^}]*return\s*\(\)\s*=>\s*clearInterval\(interval\);[^}]*}\s*,\s*\[[^\]]*\]\);/g, '');
  
  // Remove conditional rendering of Throbber
  content = content.replace(/\{[\s\S]*?<Throbber\b[\s\S]*?\}(?=\s*[:)\]])/g, '{}');
  
  // Clean up empty brackets that might have been left behind
  content = content.replace(/\{\s*\}/g, '');
  
  // Clean up possible leftover comma in imports
  content = content.replace(/import\s*{([^{}]*),,([^{}]*)}\s*from/g, 'import {$1,$2} from');
  content = content.replace(/import\s*{([^{}]*),\s*}\s*from/g, 'import {$1} from');
  content = content.replace(/import\s*{\s*}\s*from\s*['"].*?['"];?/g, '');
  
  // Clean up empty div tags left behind
  content = content.replace(/<div(?:\s+[^>]*)?>(?:\s*)<\/div>/g, '');
  
  // Fix broken assignment statements (likely created by removing Throbber-related code)
  content = content.replace(/(\w+)\s*:\s*Record<[^>]+>\s*=\s*;/g, '$1: Record<string, any> = {};');
  content = content.replace(/(\w+)\s*:\s*\w+\[\]\s*=\s*;/g, '$1: any[] = [];');
  content = content.replace(/(\w+)\s*=\s*;/g, '$1 = null;');
  
  // If the content changed, write it back
  if (content !== originalContent) {
    console.log(`- Updated ${file}`);
    fs.writeFileSync(file, content);
    totalReplacements++;
  }
});

// Delete the Throbber component file itself
const throbberFile = path.join(rootDir, 'src/components/ui/Throbber.tsx');
if (fs.existsSync(throbberFile)) {
  console.log(`Removing ${throbberFile}`);
  fs.unlinkSync(throbberFile);
  totalReplacements++;
}

// Create a simple CSS spinner component as replacement
const spinnerComponentDir = path.join(rootDir, 'src/components/ui');
const spinnerComponentPath = path.join(spinnerComponentDir, 'Spinner.tsx');

if (!fs.existsSync(spinnerComponentPath)) {
  console.log('Creating a simple Spinner component as replacement...');
  
  const spinnerContent = `// filepath: /Users/amauriribeiro/RPDBv3.2/src/components/ui/Spinner.tsx
import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: string;
  text?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = '#3B82F6', // blue-500
  text,
  className = '',
}) => {
  const sizeMap = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={\`flex flex-col items-center justify-center \${className}\`}>
      <div 
        className={\`animate-spin rounded-full border-2 border-t-transparent \${sizeMap[size]}\`}
        style={{ borderColor: \`transparent currentColor currentColor currentColor\`, color }}
      />
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export default Spinner;
`;

  fs.writeFileSync(spinnerComponentPath, spinnerContent);
  console.log(`- Created ${spinnerComponentPath}`);
  totalReplacements++;
}

// Also delete LoadingContext if it exists
const loadingContextFile = path.join(rootDir, 'src/context/LoadingContext.tsx');
if (fs.existsSync(loadingContextFile)) {
  console.log(`Removing ${loadingContextFile}`);
  fs.unlinkSync(loadingContextFile);
  totalReplacements++;
}

// Find and process files with LoadingContext references
console.log('Finding files with LoadingContext references...');
let filesWithLoadingContext = [];
try {
  const loadingContextGrepCommand = `grep -l "LoadingContext\\|useLoading" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" -r ${rootDir}/src`;
  filesWithLoadingContext = execSync(loadingContextGrepCommand)
    .toString()
    .split('\n')
    .filter(file => file.trim().length > 0);
  
  console.log(`Found ${filesWithLoadingContext.length} files with LoadingContext references`);
} catch (error) {
  console.log('No LoadingContext references found.');
}

// Process each file with LoadingContext
filesWithLoadingContext.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  console.log(`Processing LoadingContext in: ${file}`);
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Remove LoadingProvider imports
  content = content.replace(/import\s+(\{[^}]*\bLoadingProvider\b[^}]*\}|\bLoadingProvider\b)\s+from\s+['"].*?LoadingContext['"];?/g, '');
  
  // Remove useLoading imports
  content = content.replace(/import\s+(\{[^}]*\buseLoading\b[^}]*\}|\buseLoading\b)\s+from\s+['"].*?LoadingContext['"];?/g, '');
  
  // Remove LoadingProvider wrapper components
  content = content.replace(/<LoadingProvider[^>]*>([\s\S]*?)<\/LoadingProvider>/g, '$1');
  
  // Remove useLoading hook usage
  content = content.replace(/const\s+\{[^}]*\}\s*=\s*useLoading\(\);?/g, '');
  
  // Remove setLoading calls
  content = content.replace(/setLoading\s*\([^\)]+\);?/g, '');
  content = content.replace(/setLoadingText\s*\([^\)]+\);?/g, '');
  
  // Clean up possible leftover comma in imports
  content = content.replace(/import\s*{([^{}]*),,([^{}]*)}\s*from/g, 'import {$1,$2} from');
  content = content.replace(/import\s*{([^{}]*),\s*}\s*from/g, 'import {$1} from');
  content = content.replace(/import\s*{\s*}\s*from\s*['"].*?['"];?/g, '');
  
  // If the content changed, write it back
  if (content !== originalContent) {
    console.log(`- Updated ${file} (removed LoadingContext)`);
    fs.writeFileSync(file, content);
    totalReplacements++;
  }
});

console.log(`Completed! Modified ${totalReplacements} files.`);
console.log('Note: You may need to manually clean up some code where components were removed.');

// Run verification check after all replacements
console.log('\nRunning verification to ensure all references are gone...');
try {
  const checkCommand = `grep -r "Throbber\\|LoadingContext\\|useLoading" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" ${rootDir}/src`;
  const remainingReferences = execSync(checkCommand, { stdio: 'pipe' }).toString();
  
  if (remainingReferences.trim()) {
    console.log('\n⚠️ Some references might remain:');
    console.log(remainingReferences);
    console.log('Consider running the script again or checking these files manually.');
  } else {
    console.log('✅ Verification complete - no references found!');
  }
} catch (error) {
  // If grep doesn't find anything, it returns a non-zero exit code
  console.log('✅ Verification complete - no references found!');
}

console.log('\n📋 Simple loading spinner options:');
console.log('1. Use the new Spinner component: <Spinner size="medium" text="Loading..." />');
console.log('2. Use Tailwind CSS spinner: <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>');
console.log('3. For PacmanLoader, add it directly where needed:');
console.log('   - npm install react-spinners');
console.log('   - import { PacmanLoader } from "react-spinners";');
console.log('   - <PacmanLoader color="#dde000" speedMultiplier={2} />');