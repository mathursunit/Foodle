// hint-addon.js (v4.0.5) — spinner, race-free loading, cancel-safe, replace button with hint
(function(){
  function qs(s){ return document.querySelector(s); }
  function qsa(s,root){ return Array.from((root||document).querySelectorAll(s)); }

  let used = false;
  let CURRENT_HINT = '';
  let hintsReady = false;
  let preRow = null;

  function getIndex(){
    try{ if (typeof getDailyIndex === 'function') return getDailyIndex(); }catch(e){}
    return 0;
  }

  function loadHints(){
    return fetch('assets/fihr_food_words_v1.4.csv', {cache:'no-store'})
      .then(r => r.text())
      .then(text => {
        const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        const hints = [];
        for (let i = 0; i < lines.length; i++){
          let line = lines[i].replace(/^\ufeff/, '');
          const pos = line.indexOf(',');
          if (pos < 0) continue;
          let w = line.slice(0, pos).trim();
          let h = line.slice(pos+1).trim();
          if (w.startsWith('"') && w.endsWith('"')) w = w.slice(1,-1);
          if (h.startsWith('"') && h.endsWith('"')) h = h.slice(1,-1);
          w = w.replace(/[^A-Za-z]/g, '').toUpperCase();
          if (i===0 && w.toLowerCase()==='word') continue;
          if (w.length === 5){ hints.push(h); }
        }
        const idx = Math.min(getIndex(), hints.length - 1);
        CURRENT_HINT = hints[idx] || '';
      })
      .catch(()=>{ CURRENT_HINT=''; })
      .finally(()=>{ hintsReady = true; });
  }
        }
        const idx = Math.min(getIndex(), hints.length - 1);
        CURRENT_HINT = hints[idx] || '';
      })
      .catch(()=>{ CURRENT_HINT=''; })
      .finally(()=>{ hintsReady = true; });
  }

  function showToastSafe(msg){
    try{ if (typeof showToast === 'function') showToast(msg); } catch(e){}
  }

  function applyOneGuessUI(){
    const rows = qsa('#grid .row');
    if (!rows.length) return;
    for (let i = 0; i < rows.length - 1; i++) {
      rows[i].classList.add('crossed');
      qsa('.tile', rows[i]).forEach(t => { try { t.textContent = ''; } catch(e){} });
    }
    try { if (typeof currentRow !== 'undefined') currentRow = Math.max(0, rows.length - 1); } catch(e){}
  }

  function clearOneGuessUI(){
    const rows = qsa('#grid .row');
    rows.forEach(r => r.classList.remove('crossed'));
    try{
      if (typeof preRow === 'number' && typeof currentRow !== 'undefined') currentRow = preRow;
      window.INPUT_LOCKED = false;
      var kb = document.getElementById('keyboard'); if (kb) kb.classList.remove('disabled');
    }catch(e){}
  }

  function replaceHintButtonWithLabel(){
    const hb = qs('#hintBtn');
    if (!hb) return;
    const wrap = hb.parentElement && hb.parentElement.classList.contains('controls') ? hb.parentElement : hb;
    const label = document.createElement('div');
    label.className = 'hint-label';
    label.textContent = CURRENT_HINT ? `Hint: ${CURRENT_HINT}` : 'Hint used';
    if (wrap === hb) { hb.replaceWith(label); } else { wrap.replaceWith(label); }
  }

  function wireModal(){
    const hb = qs('#hintBtn');
    const modal = qs('#hintModal');
    const cancelBtn = qs('#hintCancel');
    const confirmBtn = qs('#hintConfirm');
    if (!hb || !modal || !cancelBtn || !confirmBtn) return;

    // preload; button disabled with spinner until hints ready
    hb.disabled = true
    hb.classList.add('loading'); hb.textContent = '💡 Hint';
    loadHints().then(()=>{ hb.disabled = false; hb.classList.remove('loading'); hb.textContent = '💡 Hint'; });

    function open(){ modal.classList.remove('hidden'); }
    function close(){ modal.classList.add('hidden'); }

    hb.addEventListener('click', async () => {
      if (used) { showToastSafe('Hint already used'); return; }
      try{ preRow = (typeof currentRow !== 'undefined') ? currentRow : null; }catch(e){ preRow = null; }
      if (!hintsReady){ hb.disabled = true; hb.classList.add('loading'); await loadHints(); hb.disabled = false; hb.classList.remove('loading'); }
      open();
    });

    cancelBtn.addEventListener('click', () => { close(); if (!used) clearOneGuessUI(); });
    const backdrop = qs('#hintModal .modal-backdrop');
    if (backdrop){ backdrop.addEventListener('click', () => { close(); if (!used) clearOneGuessUI(); }); }

    confirmBtn.addEventListener('click', async () => {
      if (used) return;
      if (!hintsReady){ hb.disabled = true; hb.classList.add('loading'); await loadHints(); hb.disabled = false; hb.classList.remove('loading'); }
      used = true;
      close();
      applyOneGuessUI();
      replaceHintButtonWithLabel();
      showToastSafe('Only 1 guess left!');
    });

    // ESC behaves like Cancel
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')){
        close(); if (!used) clearOneGuessUI();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){ wireModal(); });
})();