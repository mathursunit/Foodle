// social-addon.js v4.0.10 — place IG/FB icons under legend, hide header buttons
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function makeIconBar(){
    const wrap = document.createElement('div');
    wrap.className = 'social-bar';
    wrap.innerHTML = `
      <a class="social-icon" href="https://www.instagram.com/foodiesinhydreloaded/" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#E1306C" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm11 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
      </a>
      <a class="social-icon" href="https://www.facebook.com/groups/foodiesinhyd" target="_blank" rel="noopener" aria-label="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H8.1V12h2.34V9.8c0-2.31 1.38-3.58 3.49-3.58.99 0 2.03.18 2.03.18v2.24h-1.14c-1.12 0-1.47.7-1.47 1.42V12h2.5l-.4 2.89h-2.1v6.99C18.34 21.13 22 17 22 12z"/></svg>
      </a>`;
    return wrap;
  }

  function placeUnderLegend(){
    const kb = qs('#keyboard');
    const bar = makeIconBar();
    if (kb && kb.parentElement){
      kb.parentElement.insertBefore(bar, kb); // before keyboard (under legend area)
      return;
    }
    // fallback: append to game container
    const cont = qs('.game-container') || document.body;
    cont.appendChild(bar);
  }

  function removeHeaderButtons(){
    const ids = ['statsBtn','aboutBtn'];
    ids.forEach(id=>{ const el = qs('#'+id); if (el && el.parentElement) el.parentElement.removeChild(el); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    removeHeaderButtons();
    placeUnderLegend();
  });
})();