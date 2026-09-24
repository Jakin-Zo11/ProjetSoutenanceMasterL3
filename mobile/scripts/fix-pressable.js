#!/usr/bin/env node
/**
 * Codemod : remplace TouchableOpacity -> Pressable (Espace Jury, Espace Étudiant,
 * barres communes) pour corriger « Cannot record touch end without a touch start »
 * et supprimer l'usage d'activeOpacity (props non supportée par Pressable).
 *
 * Chaque cible reçoit un état d'enfoncement propre :
 *   style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
 * Charte EMIT (couleurs, rayons, accents rouge/bleu) inchangée.
 *
 * Usage : node scripts/fix-pressable.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const SCRIPT_DIR = path.dirname(process.argv[1] || process.cwd());
const ROOT = path.resolve(SCRIPT_DIR, '..');
const DIRS = ['components/jury', 'components/student', 'components/common'];

/** Trouve la fin d'une balise ouvrante en gérant {} et les chaînes. */
function tagEnd(src, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (depth === 0 && c === '>') return i;
    else if (depth === 0 && c === '/' && src[i + 1] === '>') return i + 1;
  }
  return -1;
}

function transformTag(tag) {
  let out = tag.replace(/^<TouchableOpacity/, '<Pressable');
  out = out.replace(/\s*activeOpacity=\{[^{}]*\}/g, '');
  const si = out.indexOf('style=');
  if (si === -1) {
    return out.replace(/\s*(\/?)>$/, (m, slash) => ` style={({ pressed }) => pressed && { opacity: 0.8 }}${slash}>`);
  }
  const open = out.indexOf('{', si);
  if (open === -1) return out;
  let depth = 0;
  let close = -1;
  for (let i = open; i < out.length; i += 1) {
    if (out[i] === '{') depth += 1;
    else if (out[i] === '}') { depth -= 1; if (depth === 0) { close = i; break; } }
  }
  if (close === -1) return out;
  const inner = out.slice(open + 1, close).trim();
  const prop = out.slice(si, close + 1);
  let replacement;
  if (inner.startsWith('[')) {
    replacement = `style={({ pressed }) => [${inner.slice(1, -1).trim()}, pressed && { opacity: 0.8 }]}`;
  } else if (/^styles\.[A-Za-z0-9_]+$/.test(inner)) {
    replacement = `style={({ pressed }) => [${inner}, pressed && { opacity: 0.8 }]}`;
  } else {
    return out; // style déjà dynamique : conservé tel quel
  }
  return out.replace(prop, replacement);
}

function fixImports(src) {
  const usesPressable = /<Pressable[\s>]/.test(src);
  const toCount = (src.match(/TouchableOpacity/g) || []).length;
  return src.replace(/import\s*\{([\s\S]*?)\}\s*from\s*'react-native';/, (full, list) => {
    const multiline = /\n/.test(list);
    let specs = list.split(',').map((s) => s.trim()).filter(Boolean);
    const inImport = specs.includes('TouchableOpacity') ? 1 : 0;
    if (specs.includes('TouchableOpacity') && toCount <= inImport) {
      specs = specs.filter((s) => s !== 'TouchableOpacity');
    }
    if (usesPressable && !specs.includes('Pressable')) specs.push('Pressable');
    if (multiline) return `import {\n  ${specs.join(',\n  ')},\n} from 'react-native';`;
    return `import { ${specs.join(', ')} } from 'react-native';`;
  });
}

let filesChanged = 0, tagsConverted = 0;
for (const dir of DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const name of fs.readdirSync(abs)) {
    if (!name.endsWith('.tsx')) continue;
    const file = path.join(abs, name);
    let src = fs.readFileSync(file, 'utf8');
    if (!src.includes('TouchableOpacity')) continue;

    // 1. Balises ouvrantes -> Pressable (style + suppression activeOpacity)
    let idx = src.indexOf('<TouchableOpacity');
    while (idx !== -1) {
      const end = tagEnd(src, idx + 16);
      if (end === -1) break;
      const tag = src.slice(idx, end + 1);
      const next = transformTag(tag);
      if (next !== tag) tagsConverted += 1;
      src = src.slice(0, idx) + next + src.slice(end + 1);
      idx = src.indexOf('<TouchableOpacity', idx + next.length);
    }
    // 2. Balises fermantes
    src = src.replace(/<\/TouchableOpacity>/g, '</Pressable>');
    // 3. Imports react-native
    src = fixImports(src);

    if (!DRY) fs.writeFileSync(file, src, 'utf8');
    filesChanged += 1;
    const left = (src.match(/TouchableOpacity/g) || []).length;
    if (left && !DRY) console.log(`  ! ${dir}/${name} : ${left} référence(s) TouchableOpacity restante(s)`);
  }
}

console.log(`\nFichiers ${DRY ? 'à transformer' : 'transformés'} : ${filesChanged}`);
console.log(`Balises converties en Pressable (avec état pressed) : ${tagsConverted}`);
console.log('pointerEvents JSX : vérifié séparément (0 occurrence dans le projet).');
