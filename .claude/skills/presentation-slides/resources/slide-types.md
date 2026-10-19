# Slide Type Patterns

Reusable markup and CSS patterns for each slide type. Copy and adapt as needed.

---

## 1. Card Grid

Horizontal cards with icon, title, description. Orange left-border accent.

```html
<section class="slide" data-slide="N">
  <h1 class="slide-title">Title Here</h1>
  <div class="card-grid">
    <div class="card">
      <div class="card-icon"><i class="fas fa-icon"></i></div>
      <div class="card-label">LABEL</div>
      <div class="card-name">Card Title</div>
      <div class="card-desc">"Description text."</div>
    </div>
    <!-- more cards -->
  </div>
</section>
```

```css
.card-grid{
  display:grid;grid-template-columns:repeat(4,1fr);gap:20px;
  max-width:1100px;width:100%;
}
.card{
  background:var(--surface);
  border-left:4px solid var(--orange);
  border-radius:8px;padding:28px 24px;
  opacity:0;transform:translateY(20px);
}
.slide.active .card{animation:fadeSlideUp .5s ease forwards}
.slide.active .card:nth-child(1){animation-delay:.1s}
.slide.active .card:nth-child(2){animation-delay:.25s}
.slide.active .card:nth-child(3){animation-delay:.4s}
.slide.active .card:nth-child(4){animation-delay:.55s}
.card:hover{box-shadow:0 0 24px var(--orange-dim)}
.card-icon{font-size:28px;color:var(--orange);margin-bottom:14px}
.card-label{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--text-dim);margin-bottom:6px}
.card-name{font-size:15px;font-weight:700;color:var(--text);margin-bottom:10px;line-height:1.3}
.card-desc{font-size:12.5px;line-height:1.55;color:var(--text-dim);font-style:italic}
```

---

## 2. Code Signature + Annotations

Large centered code block with labeled annotation items below.

```html
<section class="slide" data-slide="N">
  <h1 class="slide-title">Title</h1>
  <div class="sig-block">
    <code class="sig-code">
      <span class="kw">export func</span> <span class="fn">name</span>(<span class="typ">args</span>) <span class="fx">! {Effects}</span>
    </code>
  </div>
  <div class="annotations">
    <div class="anno-group">
      <div class="anno-item granted">
        <i class="fas fa-check-circle fa-icon"></i>
        <span class="label-key">IO</span>
        <span class="sep">—</span>
        <span>Description</span>
      </div>
      <!-- more granted items -->
    </div>
    <div class="anno-group">
      <div class="anno-item denied">
        <i class="fas fa-ban fa-icon"></i>
        <span class="label-key">No Net</span>
        <span class="sep">—</span>
        <span>Description</span>
      </div>
      <!-- more denied items -->
    </div>
  </div>
</section>
```

```css
.sig-block{
  background:var(--code-bg);border:1px solid var(--code-border);
  border-radius:12px;padding:32px 48px;text-align:center;
  margin:0 auto 40px;max-width:900px;
}
.sig-code{font-family:var(--mono);font-size:clamp(16px,2.2vw,22px);line-height:1.6;white-space:nowrap}
.annotations{display:flex;gap:40px;justify-content:center;margin:0 auto 40px;max-width:800px;flex-wrap:wrap}
.anno-group{display:flex;flex-direction:column;gap:10px}
.anno-item{display:flex;align-items:center;gap:8px;font-size:14px;font-family:var(--mono);opacity:0;transform:translateY(12px)}
.anno-item.granted{color:var(--green)}
.anno-item.denied{color:var(--red)}
.anno-item .label-key{font-weight:700}
.anno-item .sep{color:var(--text-dim)}
```

---

## 3. Side-by-Side Code Comparison

Two code panels with colored header bars.

```html
<div class="code-compare">
  <div class="code-panel">
    <div class="code-panel-header trad">Traditional</div>
    <div class="code-panel-body">
<!-- code here, flush left, use spans for syntax highlighting -->
    </div>
  </div>
  <div class="code-panel">
    <div class="code-panel-header ailang">AILANG</div>
    <div class="code-panel-body">
<!-- code here -->
    </div>
  </div>
</div>
<div class="compare-callout">
  <strong>Key point.</strong> Supporting detail.
</div>
```

```css
.code-compare{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:1000px;width:100%}
.code-panel{border-radius:10px;overflow:hidden;border:1px solid var(--code-border)}
.code-panel-header{padding:10px 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;font-family:var(--mono)}
.code-panel-header.trad{background:var(--amber-dim);color:var(--amber);border-bottom:2px solid var(--amber)}
.code-panel-header.ailang{background:var(--green-dim);color:var(--green);border-bottom:2px solid var(--green)}
.code-panel-body{padding:24px;background:var(--code-bg);font-family:var(--mono);font-size:14px;line-height:1.7;min-height:200px;white-space:pre}
.compare-callout{max-width:1000px;width:100%;margin-top:24px;padding:16px 24px;border-left:3px solid var(--orange);background:var(--orange-dim);border-radius:0 8px 8px 0;font-size:14px;line-height:1.6;opacity:0;transform:translateY(12px)}
.slide.active .compare-callout{animation:fadeSlideUp .5s ease .4s forwards}
```

**Important:** Code inside `.code-panel-body` must be flush-left (no leading whitespace from HTML indentation). The `white-space:pre` preserves all whitespace literally.

---

## 4. CLI + Output

Terminal-style command with animated results.

```html
<div class="cli-block">
  <span class="prompt">$</span> <span class="cmd">command</span> <span class="flag">--flag</span> <span class="cmd">arg</span>
  <span class="caps-note">Explanation of what this does.</span>
</div>
```

```css
.cli-block{
  background:var(--code-bg);border:1px solid var(--code-border);
  border-radius:8px;padding:14px 28px;
  font-family:var(--mono);font-size:13px;line-height:1.6;
  opacity:0;transform:translateY(12px);
}
.slide.active .cli-block{animation:fadeSlideUp .4s ease .3s forwards}
.prompt{color:var(--green);font-weight:700}
.cmd{color:var(--text)}
.flag{color:var(--orange);font-weight:700}
.caps-note{display:block;margin-top:6px;font-size:11px;color:var(--text-dim);font-style:italic;font-family:var(--sans)}
```

---

## 5. Contrast Columns

Two cards side by side comparing approaches.

```html
<div class="contrast-cols">
  <div class="contrast-card warn">
    <div class="contrast-icon"><i class="fas fa-triangle-exclamation"></i></div>
    <div class="contrast-label">Warning Label</div>
    <div class="contrast-text">Description of the problem.</div>
  </div>
  <div class="contrast-card safe">
    <div class="contrast-icon"><i class="fas fa-shield-halved"></i></div>
    <div class="contrast-label">Safe Label</div>
    <div class="contrast-text">Description of the solution.</div>
  </div>
</div>
```

```css
.contrast-cols{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:860px;width:100%}
.contrast-card{border-radius:10px;padding:24px 28px}
.contrast-card.warn{background:var(--amber-dim);border:1px solid rgba(245,158,11,.2)}
.contrast-card.safe{background:var(--green-dim);border:1px solid rgba(34,197,94,.2)}
.contrast-icon{font-size:24px;margin-bottom:12px}
.contrast-card.warn .contrast-icon{color:var(--amber)}
.contrast-card.safe .contrast-icon{color:var(--green)}
.contrast-label{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;font-family:var(--mono)}
.contrast-card.warn .contrast-label{color:var(--amber)}
.contrast-card.safe .contrast-label{color:var(--green)}
.contrast-text{font-size:14px;line-height:1.6;color:var(--text-dim)}
```

---

## 6. Data Table

CSS Grid table with animated rows.

```html
<div class="data-table">
  <div class="dt-row dt-header">
    <div class="dt-cell">Column 1</div>
    <div class="dt-cell"><i class="fas fa-user"></i> Column 2</div>
    <div class="dt-cell"><i class="fas fa-robot"></i> Column 3</div>
  </div>
  <div class="dt-row dt-data">
    <div class="dt-cell">Row label</div>
    <div class="dt-cell">"Human value"</div>
    <div class="dt-cell">AI value</div>
  </div>
  <!-- more rows -->
</div>
```

```css
.data-table{max-width:960px;width:100%;border-radius:10px;overflow:hidden;border:1px solid var(--code-border)}
.dt-row{display:grid;grid-template-columns:1.2fr 1fr 1.3fr}
.dt-header{background:var(--surface);border-bottom:2px solid var(--code-border)}
.dt-header .dt-cell{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:14px 20px}
.dt-header .dt-cell:nth-child(2){color:var(--amber)}
.dt-header .dt-cell:nth-child(3){color:var(--green)}
.dt-data{opacity:0;transform:translateX(-16px)}
.dt-data:nth-child(odd){background:var(--row-alt)}
.dt-data .dt-cell{padding:14px 20px;font-size:14px;line-height:1.4;border-bottom:1px solid var(--row-border)}
.dt-data .dt-cell:nth-child(2){font-family:var(--mono);font-size:13px;color:var(--amber);font-style:italic}
.dt-data .dt-cell:nth-child(3){font-family:var(--mono);font-size:13px;color:var(--green);font-weight:600}
.slide.active .dt-data{animation:fadeSlideIn .4s ease forwards}
/* Stagger: .slide.active .dt-data:nth-child(N){animation-delay: (N-1)*0.12s} */
```

---

## 7. Z3/Verification Output

Code panel alongside terminal verification results with pass/fail indicators.

```html
<div class="z3-layout">
  <div class="z3-code-panel">
    <div class="code-panel-header ailang">Label</div>
    <div class="code-panel-body"><!-- code --></div>
  </div>
  <div class="z3-output-panel">
    <div class="z3-cli">
      <span class="prompt">$</span> <span class="cmd">ailang verify</span> <span class="flag">--verbose</span> <span class="cmd">file.ail</span>
    </div>
    <div class="z3-results">
      <div class="z3-line ok"><i class="fas fa-check"></i> <span class="z3-fn">VERIFIED</span> funcName <span class="z3-time">6ms</span></div>
      <div class="z3-line fail"><i class="fas fa-xmark"></i> <span class="z3-fn">VIOLATION</span> funcName</div>
      <div class="z3-counterexample">
        Counterexample:<br>
        &nbsp;&nbsp;var: Type = <span class="num">value</span>
      </div>
    </div>
  </div>
</div>
```

```css
.z3-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:24px;max-width:1060px;width:100%;margin-bottom:24px}
.z3-code-panel{border-radius:10px;overflow:hidden;border:1px solid var(--code-border)}
.z3-code-panel .code-panel-body{white-space:pre;font-size:13px;line-height:1.65}
.z3-cli{background:var(--code-bg);border:1px solid var(--code-border);border-radius:10px 10px 0 0;padding:12px 20px;font-family:var(--mono);font-size:13px}
.z3-results{background:var(--code-bg);border:1px solid var(--code-border);border-top:none;border-radius:0 0 10px 10px;padding:16px 20px;font-family:var(--mono);font-size:13px;line-height:1.8;flex:1}
.z3-line{opacity:0;transform:translateX(-12px)}
.z3-line.ok{color:var(--green)}
.z3-line.fail{color:var(--red);margin-top:4px}
.z3-fn{font-weight:700;margin-right:4px}
.z3-time{color:var(--text-dim);font-size:11px;margin-left:8px}
.z3-note{color:var(--text-dim);font-size:11px;margin-left:8px;font-style:italic}
.z3-counterexample{margin-top:4px;padding:8px 12px;background:var(--red-dim);border-radius:6px;color:var(--red);font-size:12px;line-height:1.6;opacity:0;transform:translateY(8px)}
```

