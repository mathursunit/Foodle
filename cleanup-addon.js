// cleanup-addon.js v4.0.14 — remove top menu; tidy About modal text
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function removeTopMenu(){
    // Remove likely menu triggers by visible text
    qsa('button, .menu-btn, .icon-btn').forEach(b=>{
      const t=(b.textContent||'').trim();
      const aria=(b.getAttribute('aria-label')||'').toLowerCase();
      if (t==='☰' || t==='...' || t==='…' || t==='⋮' || aria==='menu'){
        // remove associated dropdown siblings if any
        const parent = b.parentElement;
        b.remove();
        if (parent && parent.children.length===0 && parent !== document.body) { try{ parent.remove(); }catch{} }
      }
    });
    // Remove any stray dropdowns listing Version/About
    qsa('ul,div,menu').forEach(n=>{
      const tx=(n.textContent||'').toLowerCase();
      if (tx.includes('version') && tx.includes('about') && (n.querySelector('li') || n.getAttribute('role')==='menu')){
        try{ n.remove(); }catch{}
      }
    });
  }

  function funnyLine(){
    return "A zero‑calorie daily snack for your brain: guess the five‑letter food!";
  }

  function cleanAboutModal(){
    const modal = qs('#aboutModal') || qs('#about-modal');
    if (!modal) return;
    const box = modal.querySelector('.modal-box') || modal;

    // Remove any legacy text link buttons (not our big icon tiles)
    qsa('a', box).forEach(a=>{
      const text=(a.textContent||'').toLowerCase();
      if (!a.classList.contains('social-icon') && (text.includes('instagram') || text.includes('facebook'))){
        a.remove();
      }
    });

    // Replace the first paragraph with a fun one-liner
    const p = box.querySelector('p');
    if (p) p.textContent = funnyLine();
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    removeTopMenu();
    cleanAboutModal();
  });
})();