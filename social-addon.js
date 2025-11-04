// social-addon.js v4.0.11 — move Hint under grid; social icons into About modal
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  // Creates the two social icons
  function makeIcons(){
    const wrap = document.createElement('div');
    wrap.className = 'about-follow';
    wrap.innerHTML = `
      <span class="follow-label">Follow us on:</span>
      <a class="social-icon" href="https://www.instagram.com/foodiesinhydreloaded/" target="_blank" rel="noopener" aria-label="Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="#E1306C" d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm11 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10z"/></svg>
      </a>
      <a class="social-icon" href="https://www.facebook.com/groups/foodiesinhyd" target="_blank" rel="noopener" aria-label="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H8.1V12h2.34V9.8c0-2.31 1.38-3.58 3.49-3.58.99 0 2.03.18 2.03.18v2.24h-1.14c-1.12 0-1.47.7-1.47 1.42V12h2.5l-.4 2.89h-2.1v6.99C18.34 21.13 22 17 22 12z"/></svg>
      </a>`;
    return wrap;
  }

  function moveHintUnderGrid(){
    const hb = qs('#hintBtn');
    if (!hb) return;
    // Remove any existing social bar under grid
    qsa('.social-bar').forEach(el=>el.remove());
    // Create container under grid (above keyboard)
    const kb = qs('#keyboard');
    if (!kb || !kb.parentElement) return;
    let bar = qs('.hint-under-grid');
    if (!bar){
      bar = document.createElement('div');
      bar.className = 'hint-under-grid';
      kb.parentElement.insertBefore(bar, kb);
    }
    bar.innerHTML = ''; // clean
    bar.appendChild(hb); // move existing button (listeners preserved)
  }

  function moveIconsToAbout(){
    const modal = qs('#aboutModal') || qs('#about-modal');
    if (!modal) return; // rely on existing about
    const box = modal.querySelector('.modal-box') || modal;
    // Remove any previous .about-follow to avoid dupes
    qsa('.about-follow', box).forEach(n=>n.remove());
    box.insertBefore(makeIcons(), box.querySelector('.modal-actions') || box.lastChild);
  }

  document.addEventListener('DOMContentLoaded', function(){
    moveHintUnderGrid();
    moveIconsToAbout();
  });
})();