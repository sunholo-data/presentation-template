---
name: presentation-slides
description: Build presentation slide decks as self-contained HTML files with dark/light themes, keyboard navigation, and animated transitions. Use when user asks to create slides, build a presentation, make a slide deck, add slides to a presentation, or wants conference-ready visual assets. Also use when user says "new slides", "presentation for", or references a deck folder in this repo.
---

## Quick Start

1. **Research** the topic thoroughly (web fetch, CLI docs, codebase exploration)
2. **Create** the HTML file using the `frontend-design` skill for visual quality
3. **Match** the established design system (see resources/design-system.md)
4. **Test** in browser, iterate on spacing and animations

## When to Use

- User asks to create presentation slides or a slide deck
- User wants to add new slides to an existing presentation
- User references a deck folder in this repo (`demo/`, or any new folder you create)
- User wants conference-ready visual assets for a talk

## Architecture

Each deck lives in its own subfolder at the repo root. A deck may have several numbered HTML files (`01-…`, `02-…`) that can be combined later.

```
presentation-template/
  images/
    logos/
      sunholo-logo.svg           # Shared logo. Replace with your own
  demo/
    01-hello.html                # Starter deck: four slides, both themes
  my-talk/
    01-topic-name.html           # Your deck (numbered for sequencing)
```

Keep shared logos in `images/logos/` and reference them with relative paths from the deck file, e.g. `../images/logos/sunholo-logo.svg`.

### Slide Structure

Every slide deck follows this DOM structure:

```html
<div id="app">
  <div class="top-bar"><!-- title + theme toggle --></div>
  <div class="slides-viewport">
    <section class="slide active" data-slide="0">...</section>
    <section class="slide" data-slide="1">...</section>
    <!-- more slides -->
  </div>
  <div class="bottom-bar"><!-- nav buttons + dots + kbd hints --></div>
</div>
```

- Slides are `position:absolute; inset:0` inside `.slides-viewport`
- Active slide gets `.active` class; outgoing gets `.exit-left`
- CSS transitions handle opacity + translateX (0.45s ease)
- JS manages `current` index, keyboard events, dot indicators

### Slide Canvas & Dimensions

Every slide is rendered into a fixed **16:9 stage** centred inside `.slides-viewport`. The stage is the design canvas:

- **Target dimensions: 1920×1080** (16:9). This is the projector target and what you should imagine when laying out content.
- **Letterboxed automatically.** When the browser window or presenter iframe isn't 16:9, the stage shrinks to fit and the leftover space becomes letterbox bars (painted in `--bg` so they blend in).
- **Type scales with the stage**, not the window. Use container query units inside `.slides-stage`:
  - `cqi` = 1% of the stage's inline (horizontal) size
  - `cqb` = 1% of the stage's block (vertical) size
- **Recommended type scale** (use `clamp()` so things stay readable on small windows):
  - Slide title: `clamp(28px, 5cqi, 64px)`
  - Slide subtitle: `clamp(14px, 2cqi, 24px)`
  - Body / quotes: `clamp(16px, 2.4cqi, 32px)`
  - Captions / mono: `clamp(11px, 1.4cqi, 18px)`
- **Padding / max-widths in `cqi`** too. Avoid raw `px` for outer padding — use `padding: 4cqb 6cqi` so margins scale proportionally.

The DOM looks like this:

```html
<div class="slides-viewport">       <!-- flex centre + container-type:size -->
  <div class="slides-stage">         <!-- 16:9 box -->
    <section class="slide active">…</section>
    <section class="slide">…</section>
  </div>
</div>
```

The CSS that makes this work lives in `resources/boilerplate.md` — new decks generated from the boilerplate get it for free.

**Why a fixed canvas?** Without it, slides stretch into whatever shape the window happens to be. On a tall browser, content gets pushed down into a tall narrow column ("too high and not wide"). On a short browser, content gets clipped. A fixed 16:9 stage means you design once and it always looks the same.

#### Stage-safe sizing rules (READ THIS BEFORE WRITING SLIDE CSS)

The 16:9 stage is the *only* sizing surface that matters. **Anything inside `.slides-stage` must be sized relative to the stage, not the window or iframe.** Get this wrong and content overflows the bottom of the stage on non-16:9 windows even though the stage itself is letterboxed correctly.

**NEVER use these inside slide content:**

- `vh`, `vw`, `dvh`, `dvw`, `svh`, `svw`, `lvh`, `lvw` — these all measure the *iframe/window*, not the stage. Inside a tall browser, `100vh` is bigger than the stage's actual height, so a `max-height:80vh` chart can blow past the stage's bottom edge.
- `calc(100vh - Npx)` to "subtract chrome height" — this was a pre-stage workaround. The stage already excludes chrome via letterboxing; subtracting again double-counts and overflows.
- Hard-coded pixel heights (`height:600px`, `max-height:540px`) on content that should fill the stage. Pixels don't scale with the stage; on a small window the content stays 600px tall while the stage shrinks to 400px and overflows.

**ALWAYS use these instead:**

- `cqb` (1% of stage height) and `cqi` (1% of stage width) for any size that should track the stage. These resolve against `.slides-stage` (which has `container-type:size`).
- Percentages (`%`) when the parent already has a fixed size.
- Flex layout with `flex:1; min-height:0` to let a child grow to fill remaining stage height without doing pixel math at all.
- `clamp(MINpx, Ncqi, MAXpx)` for type — keeps it readable on tiny windows and projector-large at the same time.

**Before / after — a real bug from this repo:**

```css
/* ❌ WRONG — measured in viewport units, overflowed the stage on tall windows */
.dumky-chart{
  max-height:calc(100vh - 320px);  /* assumes chrome is exactly 320px; ignores stage */
}

/* ✅ RIGHT — measured against the stage, leaves room for title + subtitle + footer */
.dumky-chart{
  max-height:70cqb;  /* 70% of stage height; the other 30% is title/subtitle/bets */
}
```

**Mental model:** if you're tempted to write `100vh` or `calc(100vh - …)`, stop. Picture the letterboxed stage as your only canvas and ask "what fraction of the stage height should this take?" — that fraction is your `cqb` value.

**Automatic verification.** A `PostToolUse` hook in `.claude/settings.json` runs `scripts/lint-slides.mjs` after every `Write` / `Edit` / `MultiEdit` and exits non-zero if the change introduces a forbidden viewport unit. The hook only inspects the *new* text the tool call introduces, so editing an old file with pre-existing violations elsewhere won't trip it. To audit the whole repo manually:

```bash
node .claude/skills/presentation-slides/scripts/lint-slides.mjs
```

That walks every `*.html` under cwd, scans `<style>` blocks, and prints `file:line` for every violation. Use it as a tech-debt list when retrofitting old decks.

### Adding a Slide

When adding a slide to an existing deck:
1. Add new `<section class="slide" data-slide="N">` inside `.slides-viewport`
2. Increment `data-slide` indices on all subsequent slides
3. Update `const TOTAL = N` in the JS
4. Update the `<span id="slideTotal">N</span>` in the HTML
5. Add any new animated element classes to the JS animation reset selector
6. Add CSS for slide-specific styles and animation delays

## Slide Types

See `resources/slide-types.md` for detailed patterns and markup for each type:

1. **Card Grid** — Horizontal cards with icon, title, description
2. **Code Signature + Annotations** — Large monospace code with labeled callouts
3. **Side-by-Side Code Comparison** — Two panels comparing languages/approaches
4. **CLI + Output** — Terminal command with animated result lines
5. **Contrast Columns** — Two cards comparing warn vs safe approaches
6. **Data Table** — CSS Grid table with header + animated rows
7. **Z3/Verification Output** — Code panel + terminal verification results

## Design System

The full design system (CSS variables, themes, typography, colors) is in `resources/design-system.md`. Key points:

- **Always** support both dark and light themes via `data-theme="light"` on `<html>`
- **Orange accent** (`#e73c17` dark / `#bd3012` light) for emphasis, never overused
- **Montserrat** for all text, **JetBrains Mono** for code and data
- **Font Awesome 6.5.1** for icons
- Subtle grid background at 60px intervals
- Slide canvas is a fixed 16:9 stage at 1920×1080 (see "Slide Canvas & Dimensions" above)

## Code Blocks

- Use `white-space: pre` on code containers
- Manual `<span>` syntax highlighting — no external library
- CSS classes: `.kw` (keywords), `.fn-name` (functions), `.typ-name` (types), `.fx-name` (effects), `.cm` (comments), `.num` (numbers), `.str` (strings)
- See `resources/design-system.md` for exact color mappings

## Animation

- `fadeSlideUp`: opacity 0→1, translateY(20px→0)
- `fadeSlideIn`: opacity 0→1, translateX(-16px→0)
- Elements start `opacity:0` in CSS, animated via `.slide.active .element` selectors
- Stagger with `animation-delay` on `:nth-child()` (120-150ms gaps)
- JS resets animated elements when leaving a slide (sets opacity back to 0)

## Workflow Integration

Use the **frontend-design** skill for generating the initial HTML — it produces distinctive, non-generic visuals. Then iterate:
- Fix whitespace issues (code blocks especially)
- Verify theme toggle works in both modes
- Check animation timing feels natural
- Ensure content is factually accurate (research first, build second)

## Reference Files

- `resources/design-system.md` — Complete CSS variables, themes, typography
- `resources/slide-types.md` — Markup patterns for each slide type
- `resources/boilerplate.md` — Copy-paste HTML/CSS/JS skeleton

