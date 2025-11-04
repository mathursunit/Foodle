// hint-addon.js (v4.0.8) — map CSV word->hint and resolve for the actual solution
(function(){
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  let used = false;
  let CURRENT_HINT = '';
  let hintsReady = false;
  let PAIRS = null; // [ [WORD, HINT], ... ]
  let preRow = null;

  function getSolutionWord(){
    try {
      if (typeof solution === 'string' && solution) return solution.toUpperCase();
      if (typeof window.solution === 'string' && window.solution) return window.solution.toUpperCase();
      if (typeof getSolution === 'function') { const s = getSolution(); if (s) return String(s).toUpperCase(); }
      if (typeof window.SOLUTION === 'string') return window.SOLUTION.toUpperCase();
    } catch {}
    return '';
  }

  function parseCSV(text){
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const pairs = [];
    for (let i = 0; i < lines.length; i++){
      let line = lines[i].replace(/^\ufeff/, '');
      const pos = line.indexOf(',');
      if (pos < 0) continue;
      let w = line.slice(0, pos).trim();
      let h = line.slice(pos + 1).trim();
      if (w.startsWith('"') && w.endsWith('"')) w = w.slice(1,-1);
      if (h.startsWith('"') && h.endsWith('"')) h = h.slice(1,-1);
      w = w.replace(/[^A-Za-z]/g,'').toUpperCase();
      if (i === 0 && w.toLowerCase() === 'word') continue; // header
      if (w.length === 5) pairs.push([w, h]);
    }
    return pairs;
  }

  function findHintForSolution(){
    const sol = getSolutionWord();
    if (!sol || !Array.isArray(PAIRS)) return '';
    for (let i=0; i<PAIRS.length; i++){
      if (PAIRS[i][0] === sol) return PAIRS[i][1] || '';
    }
    return '';
  }

  function fallbackHint(){
    const sol = getSolutionWord();
    if (!sol) return '';
    const letters = sol.split('');
    return `Starts with ${letters[0]}, ends with ${letters[letters.length-1]}.`;
  }

  function loadHints(){
    return fetch('assets/fihr_food_words_v1.4.csv', {cache:'no-store'})
      .then(r => r.text())
      .then(text => { PAIRS = parseCSV(text); CURRENT_HINT = findHintForSolution(); })
      .catch(()=>{ CURRENT_HINT=''; })
      .finally(()=>{ hintsReady = true; });
  }

  function showToastSafe(msg){ try{ if (typeof showToast === 'function') showToast(msg); }catch{} }

  function applyOneGuessUI(){
    const rows = qsa('#grid .row');
    if (!rows.length) return;
    for (let i = 0; i < rows.length - 1; i++) {
      rows[i].classList.add('crossed');
      qsa('.tile', rows[i]).forEach(t => { try { t.textContent = ''; } catch{} });
    }
    try { if (typeof currentRow !== 'undefined') currentRow = Math.max(0, rows.length - 1); } catch{}
  }

  function clearOneGuessUI(){
    qsa('#grid .row').forEach(r => r.classList.remove('crossed'));
    try{
      if (typeof preRow === 'number' && typeof currentRow !== 'undefined') currentRow = preRow;
      window.INPUT_LOCKED = false;
      const kb = qs('#keyboard'); if (kb) kb.classList.remove('disabled');
    }catch{}
  }

  function replaceHintButtonWithLabel(){
    const hb = qs('#hintBtn');
    if (!hb) return;
    const wrap = (hb.parentElement && hb.parentElement.classList.contains('controls')) ? hb.parentElement : hb;
    const label = document.createElement('div');
    label.className = 'hint-label';
    const text = CURRENT_HINT || fallbackHint() || 'Hint unavailable';
    label.textContent = 'Hint: ' + text;
    if (wrap === hb) { hb.replaceWith(label); } else { wrap.replaceWith(label); }
  }

  function wireModal(){
    const hb = qs('#hintBtn');
    const modal = qs('#hintModal');
    const cancelBtn = qs('#hintCancel');
    const confirmBtn = qs('#hintConfirm');
    if (!hb || !modal || !cancelBtn || !confirmBtn) return;

    // Preload; keep button disabled with spinner until ready
    hb.disabled = true; hb.classList.add('loading'); hb.textContent = '💡 Hint';
    loadHints().then(()=>{ hb.disabled = false; hb.classList.remove('loading'); });

    const open  = () => modal.classList.remove('hidden');
    const close = () => modal.classList.add('hidden');

    hb.addEventListener('click', async () => {
      if (used) { showToastSafe('Hint already used'); return; }
      try { preRow = (typeof currentRow !== 'undefined') ? currentRow : null; } catch { preRow = null; }
      if (!hintsReady) { hb.disabled = true; hb.classList.add('loading'); await loadHints(); hb.disabled = false; hb.classList.remove('loading'); }
      open();
    });

    cancelBtn.addEventListener('click', () => { close(); if (!used) clearOneGuessUI(); });
    const backdrop = qs('#hintModal .modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', () => { close(); if (!used) clearOneGuessUI(); });

    confirmBtn.addEventListener('click', async () => {
      if (used) return;
      if (!hintsReady) { hb.disabled = true; hb.classList.add('loading'); await loadHints(); hb.disabled = false; hb.classList.remove('loading'); }
      // Recompute CURRENT_HINT in case solution just became available
      if (!CURRENT_HINT && Array.isArray(PAIRS)) CURRENT_HINT = findHintForSolution();
      used = true
      used = true;
      close();
      applyOneGuessUI();
      replaceHintButtonWithLabel();
      showToastSafe('Only 1 guess left!');
    });

    // ESC behaves like Cancel
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) { close(); if (!used) clearOneGuessUI(); }
    });
  }

  document.addEventListener('DOMContentLoaded', () => { wireModal(); });
})();