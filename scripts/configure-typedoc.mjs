import {
  existsSync,
  promises as fs,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

/**
 * A post processing script to organise the output of TypeDoc to match our desired
 * documentation structure.
 */

const rootDir = path.resolve(process.cwd());
const docsRefDir = path.join(rootDir, 'docs', 'reference');
const packagesDir = path.join(docsRefDir, '01-Documentation');
const indexMdPath = path.join(docsRefDir, '01-Documentation', 'index.md');
const packagesMdPath = path.join(packagesDir, 'globals.md');
const packagesMdRenamedPath = path.join(packagesDir, '01-Documentation.md');
const pagesDir = path.join(rootDir, 'docs-site', 'src', 'pages');
const readmeSrcPath = path.join(rootDir, 'README.md');
const readmeDestPath = path.join(pagesDir, 'index.md');

const filesToCopy = [
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'CONTRIBUTORS.md',
  'LICENSE',
  'PUBLISHING.md',
  'SECURITY.md',
];

/**
 * Determine if a file system entry is a directory and not node_modules or .git
 * @param {*} file
 * @returns {boolean}
 */
const isADirectory = (file) => {
  return (
    file.isDirectory() && file.name !== 'node_modules' && file.name !== '.git'
  );
};

/**
 * Organise the TypeDoc output by moving 'classes' and 'interfaces' directories
 * up to appropriate levels and removing any empty directories left behind.
 */
async function organiseTypeDoc() {
  const baseDir = path.join(docsRefDir, '01-Documentation');
}

/**
 * Rename modules.md to 01-Documentation.md
 */
async function renameModulesMarkdown() {
  try {
    await fs.rename(packagesMdPath, packagesMdRenamedPath);
    console.log(`Renamed: ${packagesMdPath} → ${packagesMdRenamedPath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error renaming packages.md:', err);
      process.exit(1);
    }
  }
}

/**
 * Process the 01-Documentation.md file to remove any lines containing "_docs".
 */
async function processModulesMarkdown() {
  const file = path.join(docsRefDir, '01-Documentation/01-Documentation.md');
  const content = readFileSync(file, 'utf8');

  // Split into lines and filter out lines containing "_docs"
  let lines = content
    .split(/\r?\n/)
    .filter((l) => l && ['_docs', '.test'].every((term) => !l.includes(term)));

  // Fix duplicate text in links and remove index.md from paths
  lines = lines.map((line) => {
    if (line.trim() === '## Modules') {
      return '# Documentation';
    }

    // Match markdown links and simplify by removing everything after the first /
    // Pattern: [text/anything](path/anything/index.md) or [text/anything](path/anything/)
    const linkPattern = /\[([^/\]]+)\/[^\]]*\]\(([^/)]+)\/[^)]*\)/g;

    // Replace with simplified version: [construct-name](construct-name/)
    return line.replace(linkPattern, '[$1]($2/)');
  });

  // Remove duplicate links created by nested modules. We only intend to link to root level subdirectory.
  const out = Array.from(new Set(lines)).join('\n');
  console.log(out);
  writeFileSync(file, out);
}

/**
 * Delete the root index.md file if it exists.
 */
async function deleteRootIndexMarkdownFile() {
  try {
    await fs.unlink(indexMdPath);
    console.log(`Deleted: ${indexMdPath}`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error deleting index.md:', err);
      process.exit(1);
    }
  }
}

/**
 * Copy specified markdown files to the docs/reference directory and
 * copy README.md to docs-site/src/pages/index.md
 */
async function copyMarkdownFiles() {
  for (const file of filesToCopy) {
    const src = path.join(rootDir, file);
    const dest = path.join(docsRefDir, file);
    try {
      await fs.copyFile(src, dest);
      console.log(`Copied: ${file} → ${dest}`);
    } catch (err) {
      console.error(`Error copying ${file}:`, err);
      process.exit(1);
    }
  }

  try {
    await fs.copyFile(readmeSrcPath, readmeDestPath);
    console.log(`Copied: README.md → ${readmeDestPath}`);
  } catch (err) {
    console.error('Error copying README.md:', err);
    process.exit(1);
  }
}

/**
 * Recursively organise markdown files by moving __docs/index.md to parent directory
 * and renaming it to match the parent directory name.
 * Finally, remove any empty __docs directories.
 */
async function organiseDocMarkdownFilesRecursively(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!isADirectory(entry)) continue;

      const entryPath = path.join(dir, entry.name);
      const docsDir = path.join(entryPath, '__docs');

      // Process __docs directory if it exists
      if (existsSync(docsDir)) {
        const indexPath = path.join(docsDir, 'index.md');
        const targetFileName = `${entry.name}.md`;
        const tempPath = path.join(docsDir, targetFileName);
        const finalPath = path.join(entryPath, targetFileName);

        try {
          // Rename index.md to match parent directory name
          if (existsSync(indexPath)) {
            await fs.rename(indexPath, tempPath);
          }

          // Move the renamed file to parent directory
          if (existsSync(tempPath)) {
            await fs.rename(tempPath, finalPath);
          }

          // Remove empty __docs directory
          try {
            await fs.rmdir(docsDir);
            console.log(`Organised docs for: ${entry.name}`);
          } catch (err) {
            console.warn(
              `Could not remove __docs directory in ${entryPath}:`,
              err.message,
            );
          }
        } catch (err) {
          console.error(`Error processing __docs in ${entryPath}:`, err);
        }
      }

      // Recursively process subdirectories
      await organiseDocMarkdownFilesRecursively(entryPath);
    }
  } catch (err) {
    console.error(`Error processing directory ${dir}:`, err);
  }
}

/**
 * Organise markdown files by moving __docs/index.md to parent directory
 * and renaming it to match the parent directory name.
 * Finally, remove any empty __docs directories.
 */
async function organiseDocMarkdownFiles() {
  const baseDir = path.join(docsRefDir, '01-Documentation');
  await organiseDocMarkdownFilesRecursively(baseDir);
}

/**
 * Delete all index.md files in the docs/reference/01-Documentation directory and its subdirectories.
 */
async function deleteAllIndexMarkdownFiles() {
  const baseDir = path.join(docsRefDir, '01-Documentation');

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile()) {
        if (e.name === 'index.md') {
          await fs.rm(full, { force: true });
        }
      }
    }
  }

  await walk(baseDir);
}

/**
 * Fix MDX syntax issues in generated documentation files.
 * Escapes curly braces that MDX interprets as JSX expressions.
 */
async function fixMdxSyntax() {
  const baseDir = path.join(docsRefDir, '01-Documentation');

  async function processMarkdownFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');

      // Escape curly braces in lines that look like ARN patterns or similar
      // This specifically targets lines with patterns like {partition}, {region}, etc.
      content = content.replace(
        /^(\s*)(arn:\{[^}]+\}:[^}]*\{[^}]+\}:[^}]*\{[^}]+\}:[^}]*\{[^}]+\}:[^}]*\{[^}]+\}.*?)$/gm,
        '$1`$2`',
      );

      // Also escape isolated curly brace expressions that might be JSX-like
      content = content.replace(
        /(\s+)(\{[a-zA-Z][a-zA-Z0-9_-]*\})(\s+)/g,
        '$1`$2`$3',
      );

      // Escape object literals in code comments (like { stage: 'www', subDomain: 'example.com' })
      // This targets object-like patterns within comments that start with //
      content = content.replace(/(\/\/.*?)(\{[^}]*:[^}]*\})/g, '$1`$2`');

      // First, temporarily protect code blocks and template literals from being escaped
      const protectedContent = [];
      let protectedIndex = 0;

      // Extract and protect code blocks (```...```)
      content = content.replace(/```[\s\S]*?```/g, (match) => {
        protectedContent.push(match);
        return `__PROTECTED_CONTENT_${protectedIndex++}__`;
      });

      // Extract and protect inline code (`...`)
      content = content.replace(/`[^`]+`/g, (match) => {
        protectedContent.push(match);
        return `__PROTECTED_CONTENT_${protectedIndex++}__`;
      });

      // Extract template literals and protect them
      content = content.replace(/`[^`]*\$\{[^}]*\}[^`]*`/g, (match) => {
        protectedContent.push(match);
        return `__PROTECTED_CONTENT_${protectedIndex++}__`;
      });

      // Now escape curly brace expressions that might be interpreted as JSX
      // Only in non-code content
      content = content.replace(/\{([^}]+)\}/g, (match, inner) => {
        // Don't escape if it's a protected content placeholder
        if (inner.includes('__PROTECTED_CONTENT_')) {
          return match;
        }

        // Only escape if it contains problematic patterns like 'stage' or object-like syntax
        if (
          inner.includes('stage') ||
          inner.includes(':') ||
          inner.includes(' ')
        ) {
          return `\`${match}\``;
        }

        // Leave simple placeholder patterns like {domainPrefix}, {region} unescaped
        return match;
      });

      // Restore all protected content
      protectedContent.forEach((content_item, index) => {
        content = content.replace(
          `__PROTECTED_CONTENT_${index}__`,
          content_item,
        );
      });

      await fs.writeFile(filePath, content, 'utf8');
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err);
    }
  }

  async function walkAndFix(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkAndFix(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        await processMarkdownFile(fullPath);
      }
    }
  }

  await walkAndFix(baseDir);
  console.log('Fixed MDX syntax issues in documentation files');
}

/**
 * Main function to execute all steps in order.
 */
async function main() {
  await deleteRootIndexMarkdownFile();
  await renameModulesMarkdown();
  await processModulesMarkdown();
  await copyMarkdownFiles();
  await organiseDocMarkdownFiles();
  await deleteAllIndexMarkdownFiles();
  await organiseTypeDoc();
  await fixMdxSyntax();
}

main();
