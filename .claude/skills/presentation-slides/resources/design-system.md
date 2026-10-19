# Design System Reference

> **Slide canvas:** 16:9 stage at 1920×1080, letterboxed inside `.slides-viewport`. Use container query units (`cqi` / `cqb`) for type and padding so they scale with the stage. Full details in the parent SKILL.md → "Slide Canvas & Dimensions".

> **Palette:** the default colours are the Sunholo house palette the original decks use. To brand a new deck, change the values in `:root` and `[data-theme="light"]`; nothing else in the layout depends on them.

## CSS Variables

### Dark Theme (default `:root`)

```css
:root{
  --bg:#0f0f1a;
  --surface:#1a1a2e;
  --surface-hi:#222240;
  --orange:#e73c17;
  --orange-dim:rgba(231,60,23,.35);
  --orange-glow:rgba(231,60,23,.6);
  --green:#22c55e;
  --green-dim:rgba(34,197,94,.15);
  --red:#ef4444;
  --red-dim:rgba(239,68,68,.12);
  --amber:#f59e0b;
  --amber-dim:rgba(245,158,11,.15);
  --gray:#4a5568;
  --ghost:rgba(255,255,255,.12);
  --text:#e2e8f0;
  --text-dim:#718096;
  --code-bg:rgba(255,255,255,.03);
  --code-border:rgba(255,255,255,.06);
  --row-alt:rgba(255,255,255,.02);
  --row-border:rgba(255,255,255,.04);
  --bar-bg:rgba(15,15,26,.8);
  --bar-border:rgba(255,255,255,.06);
  --mono:'JetBrains Mono',monospace;
  --sans:'Montserrat',sans-serif;
}
```

### Light Theme (`[data-theme="light"]`)

```css
[data-theme="light"]{
  --bg:#f6f8fa;
  --surface:#ffffff;
  --surface-hi:#f0f0ea;
  --orange:#bd3012;
  --orange-dim:rgba(189,48,18,.2);
  --orange-glow:rgba(189,48,18,.4);
  --green:#16a34a;
  --green-dim:rgba(22,163,74,.1);
  --red:#dc2626;
  --red-dim:rgba(220,38,38,.08);
  --amber:#d97706;
  --amber-dim:rgba(217,119,6,.1);
  --gray:#8896a4;
  --ghost:rgba(0,0,0,.1);
  --text:#2c3e50;
  --text-dim:#526677;
  --code-bg:rgba(0,0,0,.03);
  --code-border:rgba(0,0,0,.08);
  --row-alt:rgba(0,0,0,.025);
  --row-border:rgba(0,0,0,.06);
  --bar-bg:rgba(255,255,255,.85);
  --bar-border:rgba(0,0,0,.08);
}
```

## Background Pattern

```css
/* Dark */
body{
  background-image:
    radial-gradient(circle at 50% 50%, rgba(231,60,23,.03) 0%, transparent 70%),
    linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px);
  background-size: 100% 100%, 60px 60px, 60px 60px;
}

/* Light */
[data-theme="light"] body{
  background-image:
    radial-gradient(circle at 50% 50%, rgba(189,48,18,.03) 0%, transparent 70%),
    linear-gradient(rgba(0,0,0,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,.04) 1px, transparent 1px);
  background-size: 100% 100%, 60px 60px, 60px 60px;
}
```

## Typography

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Scale

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Slide title | Montserrat | clamp(28px,3.5vw,42px) | 700-800 | --text |
| Card title | Montserrat | 15-16px | 700 | --text |
| Body text | Montserrat | 13-14px | 400-500 | --text or --text-dim |
| Label/tag | JetBrains Mono | 10-11px uppercase | 400-700 | --text-dim |
| Code | JetBrains Mono | 13-22px | 400 | varies |
| Data/metric | JetBrains Mono | 13-28px | 700 | --text |
| Slide indicator | JetBrains Mono | 13px | 400/700 | --text-dim / --text |

### Slide Title Styles

```css
.slide-title{
  font-size:clamp(28px,3.5vw,42px);font-weight:700;
  text-align:center;margin-bottom:48px;line-height:1.15;
  letter-spacing:-.02em;
}
.slide-title .dim{color:var(--text-dim);font-weight:500}
```

## Icons

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

Use `<i class="fas fa-icon-name"></i>` for solid icons.

## Code Syntax Highlighting Classes

```css
/* Keywords (language constructs) */
.kw { color: var(--text-dim) }           /* or var(--amber) in comparison panels */

/* Function names */
.fn, .fn-name { color: var(--text); font-weight: 700 }  /* or var(--green) */

/* Types */
.typ, .typ-name { color: var(--text-dim) }

/* Effects (AILANG-specific) */
.fx, .fx-name { color: var(--orange); font-weight: 700 }

/* Comments */
.cm { color: var(--text-dim); font-style: italic }

/* Numbers */
.num { color: var(--amber) }

/* Strings */
.str { color: var(--green) }

/* CLI prompt */
.prompt { color: var(--green); font-weight: 700 }

/* CLI flags */
.flag { color: var(--orange); font-weight: 700 }
```

## Semantic Colors

| Purpose | Color Var | Usage |
|---------|-----------|-------|
| Accent/emphasis | --orange | Active states, highlights, CTA |
| Granted/positive | --green | Permissions, success, AILANG column |
| Denied/negative | --red | Errors, violations, prohibited |
| Warning/traditional | --amber | Human perspective, traditional code |
| Muted | --text-dim | Secondary text, labels, comments |

## Component Patterns

### Theme Toggle

```css
.theme-toggle{
  width:32px;height:32px;border-radius:50%;border:1px solid var(--ghost);
  background:transparent;color:var(--text-dim);cursor:pointer;
  font-size:14px;transition:all .25s;display:flex;align-items:center;justify-content:center;
}
.theme-toggle:hover{border-color:var(--orange);color:var(--orange)}
```

### Transport Buttons

```css
.transport-btn{
  width:36px;height:36px;border-radius:50%;border:1px solid var(--ghost);
  background:transparent;color:var(--text-dim);cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;transition:all .2s;
}
.transport-btn:hover{border-color:var(--orange);color:var(--orange)}
.transport-btn:disabled{opacity:.3;cursor:default}
```

### Keyboard Hints

```css
.kbd{
  display:inline-block;padding:1px 6px;border-radius:3px;
  font-family:var(--mono);font-size:10px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  color:var(--text-dim);
}
[data-theme="light"] .kbd{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1)}
```

## Animations

```css
@keyframes fadeSlideUp{
  from{opacity:0;transform:translateY(20px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes fadeSlideIn{
  from{opacity:0;transform:translateX(-16px)}
  to{opacity:1;transform:translateX(0)}
}
```

Stagger pattern:
```css
.slide.active .card:nth-child(1){animation-delay:.1s}
.slide.active .card:nth-child(2){animation-delay:.25s}
.slide.active .card:nth-child(3){animation-delay:.4s}
```
