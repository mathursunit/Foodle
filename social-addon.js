// social-addon.js v4.0.12 — place Hint + Stats + About under grid; socials remain in About modal
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

  function ensureButton(id, label, cls){
    let b = qs('#'+id);
    if (!b){
      b = document.createElement('button');
      b.id = id;
      b.className = cls;
      b.textContent = label;
    }
    return b;
  }

  function moveHintAndButtons(){
    const bar = ensureUnderBar();
    if (!bar) return;
    const hint = qs('#hintBtn');
    if (!hint) return;
    const stats = ensureButton('statsBtn','📊 Stats','btn-ghost');
    const about = ensureButton('aboutBtn','ℹ️ About','btn-ghost');
    // clear and append in order
    bar.innerHTML = '';
    bar.appendChild(hint);
    bar.appendChild(stats);
    bar.appendChild(about);
  }

  // Keep icons in About modal from v4.0.11 (no changes needed here)
  document.addEventListener('DOMContentLoaded', function(){
    moveHintAndButtons();
  });
})();