// hint-addon.js (v3.7.17) — CSV hint support + modal + cross rows + one guess rule
(function(){
  function qs(s){ return document.querySelector(s); }
  function qsa(s){ return Array.from(document.querySelectorAll(s)); }

  let used = false;
  let CURRENT_HINT = '';

  // Determine today's index using existing function if present
  function getIndex(){
    try{ if (typeof getDailyIndex === 'function') return getDailyIndex(); }catch(e){}
    return 0;
  }

  // Fetch hints from CSV (second column)
  function loadHints(){
    return fetch('assets/fihr_food_words_v1.4.csv')
      .then(r => r.text())
      .then(text => {
        const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const hints = [];
        const words = [];
        for(let i=0;i<lines.length;i++){
          const parts = lines[i].split(',');
          if(!parts.length) continue;
          let w = (parts[0]||'').replace(/[^A-Za-z]/g,'').toUpperCase();
          let h = (parts[1]||'').trim();
          if(i===0 && w.toLowerCase()==='word') continue;
          if(w.length===5){ words.push(w); hints.push(h); }
        }
        const idx = Math.min(getIndex(), hints.length-1);
        CURRENT_HINT = hints[idx] || '';
      })
      .catch(()=>{ CURRENT_HINT=''; });
  }

  function showToastSafe(msg){
    try{ if(typeof showToast==='function'){ showToast(msg); } }catch(e){}
  }

  function applyOneGuessUI(){
    const rows = qsa('#grid .row');
    if(rows.length === 0) return;
    for(let i=0;i<rows.length-1;i++){
      rows[i].classList.add('crossed');
      // Clear letters (but preserve placeholder content via data attributes if any)
      qsa('.tile', rows[i]).forEach(t => { try { t.textContent=''; } catch(e){} });
    }
    // Move to last row (assumes global currentRow exists)
    try{ if (typeof currentRow !== 'undefined') currentRow = Math.max(0, rows.length-1); }catch(e){}
  }

  function wireModal(){
    const hb = qs('#hintBtn');
    const modal = qs('#hintModal');
    const cancelBtn = qs('#hintCancel');
    const confirmBtn = qs('#hintConfirm');
    if(!hb || !modal || !cancelBtn || !confirmBtn) return;

    function open(){ modal.classList.remove('hidden'); }
    function close(){ modal.classList.add('hidden'); }

    hb.addEventListener('click', () => {
      if(used){ showToastSafe('Hint already used'); return; }
      open();
    });
    cancelBtn.addEventListener('click', close);
    qs('#hintModal .modal-backdrop').addEventListener('click', close);
    confirmBtn.addEventListener('click', () => {
      if(used) return;
      used = true;
      close();
      applyOneGuessUI();
      if(CURRENT_HINT){
        showToastSafe(('Hint: '+CURRENT_HINT).toUpperCase());
        const ht = qs('#hintText'); if(ht) ht.textContent = 'Hint: '+CURRENT_HINT;
      }
      showToastSafe('Only 1 guess left!');
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    // load hints in parallel; doesn't block game init
    loadHints().then(()=>{});
    wireModal();
  });
})();

/* v4.0: global ESC closes any modal */
(function(){
  function closeAllModals(){
    var ms = document.querySelectorAll('.modal');
    ms.forEach(m => m.classList.add('hidden'));
  }
  window.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeAllModals(); }
  });
})();
