#!/usr/bin/env node
// lint-slides.mjs — verify slide HTML doesn't smuggle viewport units into
// stage-relative content. See SKILL.md → "Stage-safe sizing rules".
//
// HARD RULES (exit 2 with diagnostics on violation):
//   1. No vh / vw / dvh / dvw / svh / svw / lvh / lvw inside slide content,
//      except the single permitted line `#app{...;height:100vh}` which is
//      the legitimate top-level shell that fills the iframe/window.
//   2. No `calc(...100vh...)` / `calc(...100vw...)` anywhere — these
//      double-count chrome and overflow the letterboxed stage.
//
// SCOPE: Only files that contain `class="slide"` or `class="slides-stage"`
// are linted. Landing pages, playlist hubs (presenter.html, *.index.html),
// and any other regular HTML get a free pass — vw/vh on a normal responsive
// page is fine; this linter only protects the letterboxed slide canvas.
//
// TWO MODES:
//
//   CLI mode — audit existing files:
//     node lint-slides.mjs <file.html> [<file.html> ...]
//     node lint-slides.mjs                  # walk cwd for *.html
//
//   Hook mode — PostToolUse JSON via stdin (Write / Edit / MultiEdit):
//     echo '<json>' | node lint-slides.mjs
//   Lints only the strings the tool call is *introducing*, not pre-existing
//   content elsewhere in the file. So edits that don't touch the offending
//   CSS won't trip the hook just because old violations exist nearby.
//
// EXIT CODES:
//   0 = clean (or N/A — non-HTML, presenter shell, missing file)
//   2 = violations found; stderr contains a Claude-readable diagnostic.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

const VIEWPORT_UNIT  = /(\d+(?:\.\d+)?)(vh|vw|dvh|dvw|svh|svw|lvh|lvw)\b/g;
const CALC_VIEWPORT  = /calc\([^)]*\d+(?:\.\d+)?\s*v[hw]\b/gi;
const APP_SHELL_LINE = /#app\s*\{[^}]*height:\s*100vh/;
const SLIDE_DECK_MARKER = /class\s*=\s*["'][^"']*\bslide(s-stage)?\b/;

const RULE_HELP = {
  'viewport-unit':
    'Viewport units (vh/vw/dvh/dvw/svh/svw/lvh/lvw) measure the iframe/window, ' +
    'not the .slides-stage. Inside a non-16:9 window the stage is letterboxed ' +
    'and these units exceed it, so content overflows. Use cqb (1% of stage ' +
    'height) or cqi (1% of stage width) instead, or flex layout ' +
    '(flex:1; min-height:0).',
  'calc-with-viewport':
    'calc() with viewport units double-counts chrome that the stage already ' +
    'excludes via letterboxing, and overflows. Replace with cqb percentages or ' +
    'flex sizing.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared scanners

function scanText(text) {
  // Returns [{rule, match, line, snippet}] for raw text.
  // Line numbers are computed within `text` itself.
  const lines = text.split('\n');
  const out = [];

  VIEWPORT_UNIT.lastIndex = 0;
  let m;
  while ((m = VIEWPORT_UNIT.exec(text)) !== null) {
    const line = offsetToLine(text, m.index);
    const lineText = lines[line - 1] || '';
    if (APP_SHELL_LINE.test(lineText)) continue;
    out.push({
      rule: 'viewport-unit',
      match: m[0],
      line,
      snippet: lineText.trim().slice(0, 140),
    });
  }

  CALC_VIEWPORT.lastIndex = 0;
  while ((m = CALC_VIEWPORT.exec(text)) !== null) {
    const line = offsetToLine(text, m.index);
    out.push({
      rule: 'calc-with-viewport',
      match: m[0],
      line,
      snippet: (lines[line - 1] || '').trim().slice(0, 140),
    });
  }

  return out;
}

function offsetToLine(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI mode: scan whole HTML files, but only inside <style> blocks

function findStyleBlocks(html) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const start = m.index + m[0].indexOf('>') + 1;
    blocks.push({ start, content: m[1] });
  }
  return blocks;
}

function isSlideDeckText(text) {
  return SLIDE_DECK_MARKER.test(text);
}

function lintFile(filepath) {
  if (basename(filepath) === 'presenter.html') return [];

  let html;
  try { html = readFileSync(filepath, 'utf8'); }
  catch { return []; }

  // Skip files that aren't slide decks (landing pages, playlist hubs, etc.)
  if (!isSlideDeckText(html)) return [];

  const out = [];

  // 1. Scan <style>...</style> blocks
  for (const block of findStyleBlocks(html)) {
    const violations = scanText(block.content);
    for (const v of violations) {
      const absLine = offsetToLine(html, block.start) + v.line - 1;
      out.push({ file: filepath, ...v, line: absLine });
    }
  }

  // 2. Scan inline style="..." attributes (the hook mode catches these via
  //    snippet scan; CLI mode needs an explicit pass so audits agree).
  const styleAttr = /style\s*=\s*(["'])([^"']*)\1/gi;
  let m;
  while ((m = styleAttr.exec(html)) !== null) {
    const attrValue = m[2];
    const attrValueStart = m.index + m[0].indexOf(attrValue);
    const violations = scanText(attrValue);
    for (const v of violations) {
      const absLine = offsetToLine(html, attrValueStart);
      out.push({ file: filepath, ...v, line: absLine });
    }
  }

  return out;
}

function walkHtml(root) {
  const out = [];
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && e.name.endsWith('.html')) out.push(p);
    }
  }
  walk(root);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook mode: scan only the strings the tool call is introducing

function lintHookPayload(payload) {
  const ti = payload?.tool_input;
  if (!ti) return { violations: [], file: null };

  const fp = typeof ti.file_path === 'string' ? ti.file_path : null;
  if (!fp || !fp.endsWith('.html')) return { violations: [], file: null };
  if (basename(fp) === 'presenter.html') return { violations: [], file: fp };

  // Decide whether this file is a slide deck.
  //   - Write: the new content IS the file → check the content for the marker
  //   - Edit / MultiEdit: the file already exists → read it and check
  // If it's not a slide deck, skip — viewport units on landing pages are fine.
  const isWrite = typeof ti.content === 'string';
  let deckText = null;
  if (isWrite) {
    deckText = ti.content;
  } else {
    try { deckText = readFileSync(fp, 'utf8'); }
    catch { return { violations: [], file: fp }; }
  }
  if (!isSlideDeckText(deckText)) return { violations: [], file: fp };

  // Collect every new string this call introduces
  const snippets = [];
  if (isWrite) snippets.push({ label: 'content', text: ti.content });
  if (typeof ti.new_string === 'string') snippets.push({ label: 'new_string', text: ti.new_string });
  if (Array.isArray(ti.edits)) {
    ti.edits.forEach((e, i) => {
      if (e && typeof e.new_string === 'string') {
        snippets.push({ label: `edits[${i}].new_string`, text: e.new_string });
      }
    });
  }

  const violations = [];
  for (const s of snippets) {
    for (const v of scanText(s.text)) {
      violations.push({ file: fp, source: s.label, ...v });
    }
  }
  return { violations, file: fp };
}

// ─────────────────────────────────────────────────────────────────────────────
// Output

function formatViolations(violations, mode) {
  const cwd = process.cwd();
  const out = [];
  out.push('');
  out.push('✗ Slide stage-safe sizing violations:');
  out.push('');
  for (const v of violations) {
    const rel = v.file ? (relative(cwd, v.file) || v.file) : '(stdin)';
    const where = mode === 'hook'
      ? `${rel}  (in tool_input.${v.source}, snippet line ${v.line})`
      : `${rel}:${v.line}`;
    out.push(`  ${where}`);
    out.push(`    rule:  ${v.rule}  (matched: ${v.match})`);
    out.push(`    line:  ${v.snippet}`);
    out.push(`    fix:   ${RULE_HELP[v.rule]}`);
    out.push('');
  }
  out.push(`${violations.length} violation(s). See .claude/skills/presentation-slides/SKILL.md → "Stage-safe sizing rules" for the full guide.`);
  out.push('');
  return out.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry

function readStdinSync() {
  try { return readFileSync(0, 'utf8'); }
  catch { return ''; }
}

function runCli(files) {
  const violations = [];
  for (const f of files) {
    if (!f.endsWith('.html')) continue;
    violations.push(...lintFile(f));
  }
  if (violations.length === 0) process.exit(0);
  process.stderr.write(formatViolations(violations, 'cli'));
  process.exit(2);
}

function main() {
  const args = process.argv.slice(2);

  // CLI mode with explicit file args — never reads stdin
  if (args.length > 0) {
    const files = args.map(a => resolve(a)).filter(p => {
      try { return statSync(p).isFile(); } catch { return false; }
    });
    runCli(files);
    return;
  }

  // No args. Try hook mode by reading stdin — but only if stdin isn't an
  // interactive TTY (which would block). `isTTY` is `true` for interactive
  // terminals and `undefined`/`false` for pipes, redirects, /dev/null, etc.
  let stdinData = '';
  if (process.stdin.isTTY !== true) {
    try { stdinData = readStdinSync(); } catch { stdinData = ''; }
  }

  if (stdinData.trim()) {
    try {
      const payload = JSON.parse(stdinData);
      if (payload && payload.tool_input) {
        const { violations } = lintHookPayload(payload);
        if (violations.length === 0) process.exit(0);
        process.stderr.write(formatViolations(violations, 'hook'));
        process.exit(2);
      }
    } catch {
      // not JSON — fall through to walk mode
    }
  }

  // Default: walk cwd for HTML files
  runCli(walkHtml(process.cwd()));
}

main();
