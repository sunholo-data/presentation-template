# HTML/CSS/JS Boilerplate

Copy this skeleton when starting a new slide deck. Replace `TITLE`, slide content, and `TOTAL` count.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TITLE</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}

/* Paste CSS variables from design-system.md :root and [data-theme="light"] */
/* Paste background patterns */
/* Paste layout, top-bar, slide, bottom-bar, theme-toggle, transport, kbd styles */
/* Add slide-specific styles */
/* Add @keyframes fadeSlideUp and fadeSlideIn */
/* Add .slides-stage 16:9 letterbox + container queries (cqi/cqb) — block below */
/* Add .in-iframe rules to hide own top-bar/bottom-bar when embedded in presenter */

/* ─── Slide canvas: 16:9 letterbox stage ───
   The slide-stage is the "design canvas" — always 16:9, centred inside the
   viewport, with whatever space is left becoming letterbox bars (matches the
   --bg colour so they're invisible on dark and unobtrusive on light).
   Size by container query units inside .slides-viewport so type scales with
   the stage's actual dimensions, not the browser window's. */
.slides-viewport{
  flex:1; min-height:0;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden; background:var(--bg);
  container-type:size;
}
.slides-stage{
  position:relative;
  width:  min(100cqi, 100cqb * 16 / 9);
  height: min(100cqb, 100cqi * 9 / 16);
  container-type:size;  /* so descendants resolve cqi/cqb against the stage */
}

/* ─── Embedded-in-presenter mode ───
   When loaded via presenter.html the presenter supplies global chrome
   (title, picker, clock, deck counter, timer, kbd hints). Hide our own bars
   so the stage gets the full iframe height — otherwise the bottom of slide
   content gets clipped. */
.in-iframe .top-bar{display:none}
.in-iframe .bottom-bar{display:none}

/* ─── Detail density (stage vs guide) ───
   Wrap take-home prose in class="detail". Hidden on stage (the room sees the
   sparse slide), revealed in guide mode — which is the default when this deck
   is opened standalone, i.e. by anyone reading the published link cold. */
html[data-density="stage"] .detail{display:none}
</style>
</head>
<body>
<script>if(window!==window.top)document.body.classList.add('in-iframe');</script>
<script>(function(){
  // ── Presenter bridge: detail density, slide reporting, hotkey relay ──
  var embedded = window !== window.top, root = document.documentElement;

  // Detail density: stage (inside the presenter) vs guide (standalone reader).
  root.setAttribute('data-density', embedded ? 'stage' : 'guide');
  function setDensity(d){ root.setAttribute('data-density', d === 'guide' ? 'guide' : 'stage'); }
  window.addEventListener('message', function(e){
    if(e.data && e.data.type === 'deck-command' && e.data.action === 'set-density') setDensity(e.data.density);
  });

  // Hotkeys this deck doesn't use itself. Keyboard focus lives in the iframe
  // during a talk, so relay them up rather than letting them fall on the floor.
  document.addEventListener('keydown', function(e){
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    if(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    var k = (e.key || '').toLowerCase();
    if(k !== 'd' && k !== 'q' && k !== 'n' && k !== 'l') return;
    if(embedded) window.parent.postMessage({type:'deck-hotkey', key:k}, '*');
    else if(k === 'd') setDensity(root.getAttribute('data-density') === 'guide' ? 'stage' : 'guide');
  });

  if(!embedded) return;

  // Report which slide is showing, with its heading and text, so the presenter
  // can time it and tag questions against it. Deliberately generic — watches .slide.active
  // instead of hooking this deck's goTo(), so the deck needn't know it exists.
  function slides(){
    var s = document.querySelectorAll('.slides-stage .slide');
    return s.length ? s : document.querySelectorAll('.slide');
  }
  function activeIndex(list){
    for(var i = 0; i < list.length; i++) if(list[i].classList.contains('active')) return i;
    return -1;
  }
  function tidy(s, n){ return (s || '').replace(/\s+/g, ' ').trim().slice(0, n); }

  var lastIdx = null, pending = null;

  function send(){
    var list = slides(), idx = activeIndex(list);
    // Decks that aren't slide-based (an interactive explorer, say) have no
    // .slide.active at all — describe the whole view rather than nothing.
    var el = idx >= 0 ? list[idx] : (document.querySelector('.slides-stage') || document.body);
    var h = el && el.querySelector('h1, h2, h3, .slide-title');
    // innerText reflects layout, so a slide caught mid-transition reads as
    // empty; textContent doesn't care and is the right fallback here.
    var text = el ? ((el.innerText || '').trim() || (el.textContent || '')) : '';
    window.parent.postMessage({
      type: 'deck-slide',
      index: idx,
      total: list.length,
      title: tidy(h ? h.textContent : document.title, 120),
      text: tidy(text, 700)
    }, '*');
  }

  function report(){
    var idx = activeIndex(slides());
    if(idx === lastIdx) return;
    lastIdx = idx;
    // Let the slide transition settle before reading it.
    clearTimeout(pending);
    pending = setTimeout(send, 160);
  }

  // The presenter asks for this when it switches to us, since a deck that
  // hasn't changed slide would otherwise never speak up and the presenter
  // would keep forwarding the previous deck's slide.
  window.addEventListener('message', function(e){
    if(e.data && e.data.type === 'deck-command' && e.data.action === 'report-slide'){
      lastIdx = null;
      report();
    }
  });

  var stage = document.querySelector('.slides-stage') || document.body;
  new MutationObserver(report).observe(stage, {
    attributes:true, attributeFilter:['class'], subtree:true, childList:true
  });
  report();
})();</script>
<div id="app">

  <!-- Top bar -->
  <div class="top-bar">
    <div class="top-bar-left">
      <img src="../images/logos/sunholo-logo.svg" alt="Sunholo" class="top-logo">
      <span class="deck-title"><span class="accent">TOPIC</span> — Subtitle</span>
    </div>
    <button class="theme-toggle" id="themeToggle" title="Toggle theme">
      <i class="fas fa-sun"></i>
    </button>
  </div>

  <!-- Slides viewport: holds the 16:9 stage, lets letterbox bars show -->
  <div class="slides-viewport">
    <div class="slides-stage">
      <section class="slide active" data-slide="0">
        <!-- Slide 1 content -->
      </section>
      <section class="slide" data-slide="1">
        <!-- Slide 2 content -->
      </section>
    </div>
  </div>

  <!-- Bottom bar -->
  <div class="bottom-bar">
    <div class="transport">
      <button class="transport-btn" id="btnPrev" title="Previous slide">
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="step-indicator">
        <span class="current" id="slideNum">1</span> / <span id="slideTotal">TOTAL</span>
      </span>
      <button class="transport-btn" id="btnNext" title="Next slide">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    <div class="slide-dots" id="slideDots"></div>
    <div class="nav-hints">
      <span class="kbd">←</span><span class="kbd">→</span>
      <span style="font-size:11px;color:var(--text-dim);margin-left:4px">navigate</span>
    </div>
  </div>

</div>

<script>
(function(){
  const TOTAL = 2; // UPDATE THIS
  let current = 0;
  let transitioning = false;

  const slides = document.querySelectorAll('.slide');
  const slideNum = document.getElementById('slideNum');
  const dotsContainer = document.getElementById('slideDots');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const themeToggle = document.getElementById('themeToggle');

  // Build dots
  for(let i=0;i<TOTAL;i++){
    const d = document.createElement('button');
    d.className = 'slide-dot' + (i===0?' active':'');
    d.dataset.idx = i;
    d.addEventListener('click', ()=> goTo(i));
    dotsContainer.appendChild(d);
  }

  function goTo(n){
    if(n<0||n>=TOTAL||n===current||transitioning) return;
    transitioning = true;
    const dir = n > current ? 1 : -1;

    slides.forEach(s=>{
      s.classList.remove('active','exit-left');
      // Reset animated elements — ADD YOUR CLASSES HERE
      s.querySelectorAll('.card,.anno-item,.compare-callout,.ct-data').forEach(el=>{
        el.style.opacity='0';
        el.style.transform='';
      });
    });

    if(dir>0 && slides[current]) slides[current].classList.add('exit-left');
    slides[n].classList.add('active');

    current = n;
    slideNum.textContent = current + 1;
    document.querySelectorAll('.slide-dot').forEach((d,i)=>{
      d.classList.toggle('active', i===current);
    });
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === TOTAL - 1;

    setTimeout(()=>{ transitioning = false; }, 500);
  }

  // ←/→ = slides within this deck only (never crosses deck boundaries)
  // ↑/↓ = deck-level navigation (handled by parent presenter)
  btnPrev.addEventListener('click', ()=> goTo(current-1));
  btnNext.addEventListener('click', ()=> goTo(current+1));
  btnPrev.disabled = true;

  document.addEventListener('keydown', e=>{
    if(e.key==='ArrowRight'||e.key===' ') goTo(current+1);
    if(e.key==='ArrowLeft') goTo(current-1);
    if(e.key==='ArrowDown'){ e.preventDefault(); window.parent.postMessage({type:'deck-nav',dir:'next'},'*'); }
    if(e.key==='ArrowUp'){ e.preventDefault(); window.parent.postMessage({type:'deck-nav',dir:'prev'},'*'); }
  });

  // Listen for navigator commands (when embedded in presenter iframe)
  window.addEventListener('message', e=>{
    if(e.data && e.data.type==='deck-command'){
      if(e.data.action==='go-first') goTo(0);
      if(e.data.action==='next') goTo(current+1);
      if(e.data.action==='prev') goTo(current-1);
      if(e.data.action==='go-last'){ current=-1; goTo(TOTAL-1); }
      if(e.data.action==='set-theme') setTheme(e.data.theme);
    }
  });
  window.parent.postMessage({type:'deck-ready',total:TOTAL},'*');

  function setTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme==='light'
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
    localStorage.setItem('slides-theme', theme);
    window.parent.postMessage({type:'deck-theme',theme:theme},'*');
  }
  themeToggle.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    setTheme(cur==='light'?'dark':'light');
  });
  const saved = localStorage.getItem('slides-theme');
  if(saved) setTheme(saved);
})();
</script>
</body>
</html>
```

## Checklist for New Slide Decks

- [ ] Update `<title>` and `.deck-title`
- [ ] Set `const TOTAL` in JS to match slide count
- [ ] Set `<span id="slideTotal">` to match
- [ ] Add all animated element classes to the reset selector in `goTo()`
- [ ] Test keyboard navigation (←→ slides, ↑↓ decks, space)
- [ ] Test theme toggle (both modes should look polished)
- [ ] Add deck entry to presenter.html PLAYLIST array (with `minutes:`, and `group:` if the talk has blocks)
- [ ] Verify presenter bridge works (←→ auto-advances at boundaries, ↑↓ jumps decks)
- [ ] Add `class="detail"` prose for the standalone reader, and check the slide still fits in guide mode (press **D**)
- [ ] Verify at 1920x1080 (projector target)
- [ ] Check `white-space:pre` on all code containers
- [ ] Ensure code blocks are flush-left (no HTML indentation artifacts)
- [ ] Verify the deck looks right both standalone *and* inside `presenter.html` (no clipped bottom, no duplicate bars)
- [ ] Resize the browser to a non-16:9 shape (e.g. 1200×900). Slides should letterbox cleanly, not stretch
- [ ] Use `cqi` / `cqb` units for font sizes inside slides (e.g. `clamp(24px, 5cqi, 56px)`) instead of `vw`/`vh`, so type scales with the stage rather than the window
