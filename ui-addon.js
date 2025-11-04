// ui-addon.js v4.0.9 — burger menu text + basic modal wiring for About/Stats
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  // Turn any three-dots menu into hamburger
  const headerButtons = qsa('button, .menu-btn');
  headerButtons.forEach(b=>{
    const t = (b.textContent||'').trim();
    if (t === '...' || t === '…' || t === '⋮') {
      b.textContent = '☰';
      b.setAttribute('aria-label','Menu');
    }
  });

  // About modal (if we created one)
  const aboutBtn = qs('#aboutBtn');
  const aboutModal = qs('#aboutModal');
  if (aboutBtn && aboutModal){
    const close = ()=> aboutModal.classList.add('hidden');
    const backdrop = aboutModal.querySelector('.modal-backdrop');
    const xbtn = qs('#aboutClose');
    aboutBtn.addEventListener('click', ()=> aboutModal.classList.remove('hidden'));
    if (backdrop) backdrop.addEventListener('click', close);
    if (xbtn) xbtn.addEventListener('click', close);
    window.addEventListener('keydown', e=>{ if(e.key==='Escape' && !aboutModal.classList.contains('hidden')) close(); });
  }
})();