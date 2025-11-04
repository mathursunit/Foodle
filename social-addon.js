// social-addon.js v4.0.13 — icon-only buttons; 4x socials; keep About modal
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function ensureUnderBar(){
    const kb = qs('#keyboard');
    if (!kb || !kb.parentElement) return null;
    let bar = qs('.hint-under-grid');
    if (!bar){
      bar = document.createElement('div');
      bar.className = 'hint-under-grid';
      kb.parentElement.insertBefore(bar, kb);
    }
    return bar;
  }

  function toIcon(btn, iconChar, aria){
    if (!btn) return;
    btn.classList.add('icon-btn');
    btn.setAttribute('aria-label', aria);
    btn.textContent = iconChar;
  }

  function moveHintStatsAbout(){
    const bar = ensureUnderBar();
    if (!bar) return;
    const hint = qs('#hintBtn');
    let stats = qs('#statsBtn');
    let about = qs('#aboutBtn');
    if (!stats){ stats = document.createElement('button'); stats.id='statsBtn'; stats.className='icon-btn'; }
    if (!about){ about = document.createElement('button'); about.id='aboutBtn'; about.className='icon-btn'; }
    // enforce icon-only
    toIcon(hint, '💡', 'Use a hint');
    toIcon(stats, '📊', 'View stats');
    toIcon(about, 'ℹ️', 'About');
    // Clear and append
    bar.innerHTML='';
    bar.appendChild(hint);
    bar.appendChild(stats);
    bar.appendChild(about);

    // Keep icon-only even if other scripts change text (MutationObserver)
    [hint, stats, about].forEach(el=>{
      const mo = new MutationObserver(()=>{
        if (el === hint) el.textContent = '💡';
        else if (el === stats) el.textContent = '📊';
        else el.textContent = 'ℹ️';
      });
      mo.observe(el, {childList:true, characterData:true, subtree:true});
    });
  }

  // About modal socials (already injected earlier). Ensure no text and big icons.
  function upgradeAboutSocials(){
    const modal = qs('#aboutModal') || qs('#about-modal');
    if (!modal) return;
    const box = modal.querySelector('.modal-box') || modal;

    // If no block yet, create one with label + icons
    let row = box.querySelector('.about-follow');
    if (!row){
      row = document.createElement('div');
      row.className = 'about-follow';
      row.innerHTML = `
        <span class="follow-label">Follow us on:</span>
        <a class="social-icon" href="https://www.instagram.com/foodiesinhydreloaded/" target="_blank" rel="noopener" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#E1306C" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm11 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
        </a>
        <a class="social-icon" href="https://www.facebook.com/groups/foodiesinhyd" target="_blank" rel="noopener" aria-label="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H8.1V12h2.34V9.8c0-2.31 1.38-3.58 3.49-3.58.99 0 2.03.18 2.03.18v2.24h-1.14c-1.12 0-1.47.7-1.47 1.42V12h2.5l-.4 2.89h-2.1v6.99C18.34 21.13 22 17 22 12z"/></svg>
        </a>`;
      const actions = box.querySelector('.modal-actions');
      box.insertBefore(row, actions || box.lastChild);
    }
    // Remove any text within anchors and enlarge SVGs
    qsa('.about-follow .social-icon', box).forEach(a=>{
      // remove text nodes
      a.childNodes.forEach(n=>{ if (n.nodeType===3) a.removeChild(n); });
      const svg = a.querySelector('svg'); if (svg){ svg.setAttribute('width','72'); svg.setAttribute('height','72'); }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    moveHintStatsAbout();
    upgradeAboutSocials();
  });
})();