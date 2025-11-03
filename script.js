// script.js with toast notification and flip animation
const APP_VERSION = 'v3.6.5';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EPOCH_MS = Date.UTC(2025, 0, 1);

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}


let WORDS = [];
let solution = '';
let currentRow = 0, currentCol = 0;
const rows = [];

fetch('words.txt?v=v2.9?v=v2.7')
  .then(r => r.text())
  .then(txt => {
    WORDS = txt.split('\n').map(w => w.trim().toUpperCase()).filter(Boolean);
    startGame();
  }).catch(()=>{ WORDS=['APPLE','MANGO','BERRY','PIZZA','ALONE','PASTA','BREAD','SALAD','GRAPE','CHILI']; startGame(); });

function getDailyIndex() {
  const now = new Date();
  const todayUTCmid = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.floor((todayUTCmid - EPOCH_MS) / MS_PER_DAY);
  return ((days % WORDS.length) + WORDS.length) % WORDS.length;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message.toUpperCase();
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 2000);
}

function startGame() {
  loadHints();
  initHintLink();
  ensureLegend();
  // Add row numbers 1..5 on first tile
  document.querySelectorAll('#grid .row').forEach((row, idx)=>{
    const first = row.querySelector('.tile');
    if(first){ first.classList.add('row-label'); first.setAttribute('data-rownum', String(idx+1)); }
  });
  layoutGrid();
  window.setTimeout(layoutGrid, 50);
  initMenu();
  const vl = document.getElementById('version-label'); if (vl) vl.textContent = 'Build ' + APP_VERSION;
  solution = WORDS[getDailyIndex()];
  document.body.focus();
  document.querySelectorAll('.row').forEach(r => rows.push(Array.from(r.children)));
  window.addEventListener('keydown', onKey);
  document.querySelectorAll('#keyboard .key').forEach(btn => {
    
btn.addEventListener('click', async (e) => {
  e.preventDefault();
  if (!confirm('Using a hint will leave you only one remaining guess. Proceed?')) return;

  await ensureHintsMap();
  const ans = (window.DAILY_WORD || window.CURRENT_ANSWER || '').toString().toUpperCase();
  const hint = (window.HINTS_MAP && window.HINTS_MAP.get(ans)) || 'No hint available for this answer.';
  const b = ensureHintBanner();
  b.textContent = hint;
  b.style.display = 'block';
  b.scrollIntoView({ block:'nearest', behavior:'smooth' });

  // Lock all but one remaining row
  const rows = Array.from(document.querySelectorAll('#grid .row'));
  const activeIndex = rows.findIndex(r => Array.from(r.children).some(t => t.textContent.trim() === ''));
  rows.forEach((r, i) => {
    if (i !== activeIndex) {
      Array.from(r.children).forEach(t => {
        if (!t.textContent.trim()) t.textContent = 'X';
        t.classList.add('tile-locked');
      });
    }
  });
  alert('Hint shown — only one final guess remains!');
});
btn.__wired = true;
    }
  }

  function boot(){
    enforceVersion();
    normalizeGrid();
    ensureHintBanner();
    ensureHintButton();
    ensureHintsMap();
  }
  if (!window.__fihrV376Boot) {
    window.__fihrV376Boot = true;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})();
