# Presentation template

A starting point for building slide decks with Claude Code. Each deck is a self-contained HTML file: 16:9 canvas, dark and light themes, keyboard navigation, no build step.

## Quick start

1. Clone this repo and open it in Claude Code.
2. Look at the starter deck: open `demo/01-hello.html` in a browser. Use ← → to move, the sun/moon button in the top bar to switch theme, and **D** to switch between stage and guide density.
3. Ask Claude to build your deck, for example:

   > Build a 5-slide deck in `my-talk/` about <your topic>. Use the presentation-slides skill and the existing starter deck as the structure.

4. Open the new file in a browser and check both themes and a non-16:9 window size.

## Layout

```
.claude/skills/presentation-slides/   Skill: rules, design system, slide patterns, lint
images/logos/                          Shared logo(s). Replace with your own
demo/01-hello.html                     Starter deck to copy from
```

## Checking a deck

```bash
node .claude/skills/presentation-slides/scripts/lint-slides.mjs demo
```

The linter flags viewport units (`vh`, `vw`, …) that break the 16:9 stage. It runs in walk mode when given no arguments.

## Branding

The default palette and the logo are placeholders in the house style used by the original decks. To rebrand, change the CSS variables in `:root` and `[data-theme="light"]`, and swap `images/logos/sunholo-logo.svg`.
