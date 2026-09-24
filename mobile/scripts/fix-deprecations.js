#!/usr/bin/env node
/**
 * Codemod : remplace les propriétés d'ombre dépréciées React Native / RN Web
 *   shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * par la propriété moderne `boxShadow` (RN >= 0.76 / react-native-web),
 * en conservant `elevation` (Android).
 * Signale aussi les attributs JSX pointerEvents="..." (à placer dans le style).
 *
 * Usage : node scripts/fix-deprecations.js [--dry]
 * Charte EMIT conservée : seules les ombres changent (mêmes couleurs/rayons, en rgba).
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const ROOT = path.resolve(path.dirname(process.argv[1] || process.cwd()), '..');
const SKIP = new Set(['node_modules', '.expo', '.git', 'android', 'ios']);
const EXT = ['.tsx', '.ts'];
const ALIAS = {
  '#000': '#000000', '#fff': '#ffffff',
  'Colors.light.black': '#000000', 'Colors.light.white': '#FFFFFF',
  'Colors.light.navy': '#0D1F4E', 'Colors.light.tint': '#0D1F4E',
  'Colors.light.primary': '#1A4BA8', 'Colors.light.sky': '#2D84E0',
  'Colors.light.error': '#DC2626',
};

function rgba(token, opacity) {
  let hex = (ALIAS[token.trim()] || token.trim()).replace(/^['"]|['"]$/g, '');
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return `rgba(0,0,0,${opacity})`;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16));
  return `rgba(${r},${g},${b},${opacity})`;
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) yield* walk(path.join(dir, e.name)); }
    else if (EXT.includes(path.extname(e.name))) yield path.join(dir, e.name);
  }
}

let filesChanged = 0, blocks = 0, remaining = 0;
const peHits = [];

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  const out = [];
  let p = null; // { color, x, y, opacity, indent, raw }

  const flush = (radius, indent) => {
    if (!p || p.opacity === null) return;
    out.push(`${indent}boxShadow: '${p.x}px ${p.y}px ${radius}px ${rgba(p.color, p.opacity)}',`);
    blocks += 1;
    p = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/\bpointerEvents\s*=/.test(line)) peHits.push(`${rel}:${i + 1}`);
    const indent = (line.match(/^\s*/) || [''])[0];
    let m;

    if ((m = line.match(/^\s*shadowColor:\s*(.+?),?\s*$/))) {
      p = { color: m[1], x: 0, y: 0, opacity: null, indent, raw: line };
      continue;
    }
    if ((m = line.match(/^\s*shadowOffset:\s*\{\s*width:\s*(-?[\d.]+),\s*height:\s*(-?[\d.]+)\s*\}\s*,?\s*$/))) {
      if (p) { p.x = Number(m[1]); p.y = Number(m[2]); }
      continue;
    }
    if (/^\s*shadowOffset:\s*\{\s*$/.test(line)) {
      while (i + 1 < lines.length && !/\}/.test(lines[i + 1])) i += 1;
      i += 1;
      continue;
    }
    if ((m = line.match(/^\s*shadowOpacity:\s*([\d.]+)\s*,?\s*$/))) {
      if (p) p.opacity = Number(m[1]);
      continue;
    }
    if ((m = line.match(/^(\s*)shadowRadius:\s*([\d.]+)\s*,?\s*$/))) {
      flush(Number(m[2]), m[1]);
      continue;
    }
    if (p && /^\s*\},?\s*$/.test(line)) {
      if (p.opacity !== null) flush(8, p.indent);
      else { out.push(p.raw); p = null; } // shadowColor isolé (typo) : conservé
    }
    out.push(line);
  }

  const next = out.join('\n');
  if (next !== src) {
    filesChanged += 1;
    if (!DRY) fs.writeFileSync(file, next, 'utf8');
  }
  const left = next.match(/shadow(Color|Offset|Opacity|Radius)/g);
  if (left) {
    remaining += left.length;
    console.log(`  ! ${rel} : ${left.length} occurrence(s) shadow* restante(s)`);
  }
}

console.log(`\nFichiers ${DRY ? 'à transformer' : 'transformés'} : ${filesChanged}`);
console.log(`Blocs d'ombre convertis en boxShadow : ${blocks}`);
console.log(`Propriétés shadow* restantes : ${remaining}`);
console.log(peHits.length ? `pointerEvents JSX à migrer :\n  ${peHits.join('\n  ')}` : 'pointerEvents JSX : aucune occurrence (rien à corriger).');
