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
    btn.addEventListener('click', () => { btn.classList.add('press'); setTimeout(()=>btn.classList.remove('press'), 140);
      const k = btn.dataset.key || btn.textContent;
      onKey({ key: k });
    });
  });
}

function onKey(e) {
  const key = e.key.toUpperCase();
  if (currentRow >= 5) return;
  if (key === 'ENTER') return checkGuess();
  if (key === 'BACKSPACE') return deleteLetter();
  if (/^[A-Z]$/.test(key) && currentCol < 5) addLetter(key);
}

function addLetter(letter){
  const rowEl = fihrGetRowEl();
  const tile = fihrNextEmptyTile(rowEl);
  if (!tile) { return; }

  // v3.1: mark first tile as filled to hide row label when typing
  rows[currentRow][currentCol].textContent = letter;
  currentCol++;
}

function deleteLetter() {
  if (currentCol > 0) {
    currentCol--;
    rows[currentRow][currentCol].textContent = '';
  }
}

function findKeyBtn(ch) {
  return Array.from(document.querySelectorAll('#keyboard .key')).find(b => b.textContent === ch);
}


function checkGuess() {
  if (currentCol < 5) {
    showToast('Not enough letters');
    return;
  }
  const guess = rows[currentRow].map(t => t.textContent).join('');
  if (!WORDS.includes(guess)) {
    showToast('Not in word list');
    return;
  }
  const solArr = solution.split('');
  const solCount = {};
  solArr.forEach(l => solCount[l] = (solCount[l] || 0) + 1);
  const states = Array(5).fill('absent');

  // First pass: correct letters
  guess.split('').forEach((l, i) => {
    if (l === solArr[i]) {
      states[i] = 'correct';
      solCount[l]--;
    }
  });

  // Second pass: present letters
  guess.split('').forEach((l, i) => {
    if (states[i] === 'absent' && solCount[l] > 0) {
      states[i] = 'present';
      solCount[l]--;
    }
  });

  // Animate tiles
  rows[currentRow].forEach((tile, i) => {
    const state = states[i];
    const letter = guess[i];
    setTimeout(() => {
      tile.classList.add('flip');
      tile.addEventListener('animationend', () => {
        tile.classList.remove('flip');
        tile.classList.add(state);
        const keyBtn = findKeyBtn(letter);
        if (state === 'correct') {
          keyBtn.classList.add('correct');
        } else if (state === 'present' && !keyBtn.classList.contains('correct')) {
          keyBtn.classList.add('present');
        } else {
          keyBtn.classList.add('absent');
        }
      }, { once: true });
    }, i * 300);
  });

  // After animations
  setTimeout(() => {
    if (guess === solution) {
      showToast('Great');
    if (typeof confetti === 'function') confetti({ particleCount: 200, spread: 60 });
      currentRow = 5;
    } else {
      currentRow++;
      currentCol = 0;
      if (currentRow === 5) {
        showToast(`The word was ${solution}`);
      }
    }
  }, 5 * 300 + 100);
}


// ---- Countdown to Next Puzzle ----
(function(){
  const countdownEl = document.getElementById('countdown');
  function updateCountdown() {
    const now = new Date();
    const nextMidnightUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1
    ));
    const diff = nextMidnightUTC - now;
    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    countdownEl.innerText = `Next word in ${hours}:${minutes}:${seconds}`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
})();

function showModal(title, contentHtml){
  const old = document.getElementById('modal-backdrop'); if (old) old.remove();
  const backdrop = document.createElement('div'); backdrop.id = 'modal-backdrop'; backdrop.setAttribute('role','dialog'); backdrop.setAttribute('aria-modal','true');
  const modal = document.createElement('div'); modal.id = 'modal';
  modal.innerHTML = `<h3>${title}</h3><div class="content">${contentHtml}</div>
    <div class="actions"><button class="btn primary" id="modal-ok" autofocus>OK</button></div>`;
  backdrop.appendChild(modal); document.body.appendChild(backdrop);
  const close = ()=> backdrop.remove();
  document.getElementById('modal-ok').addEventListener('click', close);
  backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) close(); });
  document.addEventListener('keydown', function escHandler(ev){ if(ev.key==='Escape'){ close(); document.removeEventListener('keydown', escHandler); } });
}
function initMenu(){
  const btn = document.getElementById('menu-btn');
  const panel = document.getElementById('menu-panel');
  if(!btn || !panel) return;
  const close = ()=> panel.classList.remove('open');
  btn.addEventListener('click', (e)=>{ e.stopPropagation(); panel.classList.toggle('open'); });
  document.addEventListener('click', close);
  panel.addEventListener('click', (e)=> e.stopPropagation());
  panel.querySelectorAll('.menu-item').forEach(mi => {
    mi.addEventListener('click', ()=> {
      const action = mi.dataset.action;
      close();
      if(action === 'version'){
        showModal('Version', `<p><strong>FIHR – Foodle</strong><br/>Build ${APP_VERSION}</p>`);
      } else if(action === 'about'){
        showModal('About', `<p><strong>FIHR – Foodle</strong> is a personal learning project.</p>`);
      }
    });
  });
}


// Dynamic grid sizing between banner and keyboard
function layoutGrid(){
  try{
    const banner = document.querySelector('.title-banner');
    const grid = document.getElementById('grid');
    const kb = document.getElementById('keyboard');
    if(!grid || !kb) return;
    const bannerRect = banner ? banner.getBoundingClientRect() : {bottom:0};
    const kbRect = kb.getBoundingClientRect();
    const topY = (banner ? bannerRect.bottom : 0) + window.scrollY;
    const bottomY = kbRect.top + window.scrollY;
    let avail = bottomY - topY - 120; // padding for labels/legend
    // clamp available height
    avail = Math.max(240, Math.min(avail, 560));
    const gap = 8;
    // rows = 5 => total gaps = 4*gap
    let tile = Math.floor((avail - 4*gap) / 5);
    tile = Math.max(34, Math.min(tile, 64));
    document.documentElement.style.setProperty('--tile', tile + 'px');
  }catch(e){/* ignore */}
}
window.addEventListener('resize', layoutGrid);
window.addEventListener('orientationchange', layoutGrid);

function markTileLetterState(tile){
  if(!tile) return;
  if(tile.textContent && tile.textContent.trim().length>0){
    tile.classList.add('has-letter');
  }else{
    tile.classList.remove('has-letter');
  }
}

function ensureLegend(){
  const grid = document.getElementById('grid');
  if(!grid) return;
  let legend = document.getElementById('legend');
  if(!legend){
    legend = document.createElement('div');
    legend.id = 'legend';
    legend.className = 'legend';
    legend.innerHTML = '<span class="chip correct"></span><em>Correct</em> <span class="chip present"></span><em>Present</em> <span class="chip absent"></span><em>Absent</em>';
    grid.insertAdjacentElement('afterend', legend);
  }
}


// v3.2 inline hint system
async function loadHints(){
  try{
    const res = await fetch('assets/words_with_hints.csv?v=' + (typeof APP_VERSION!=='undefined'?APP_VERSION:'v3.2'));
    const txt = await res.text();
    const lines = txt.trim().split(/\r?\n/).slice(1);
    for(const line of lines){
      const idx = line.indexOf(',');
      if(idx>0){
        const w = line.slice(0, idx).trim().toUpperCase();
        const h = line.slice(idx+1).trim().replace(/^"|"$/g,'');
        if(/^[A-Z]{5}$/.test(w)){ HINTS_MAP.set(w, h); }
      }
    }
  }catch(e){ console.warn('Hint CSV load failed', e); }
}

function showConfirm(title, message, onYes){
  // fallback to native confirm for simplicity
  if (confirm(message)) onYes && onYes();
}

function applyHintPenalty(){
  if (HINT_USED) return;
  HINT_USED = true;
  const hintBtn = document.getElementById('hint-link'); if (hintBtn) hintBtn.disabled = true;
  const grid = document.getElementById('grid'); if (!grid) return;
  const rows = Array.from(grid.querySelectorAll('.row'));
  const total = rows.length;
  let cr = (typeof currentRow !== 'undefined') ? currentRow
         : (typeof rowIndex !== 'undefined') ? rowIndex
         : 0;
  for(let r = cr; r < total - 1; r++){
    const tiles = rows[r].querySelectorAll('.tile');
    tiles.forEach(t => { t.textContent = 'X'; t.classList.add('blocked'); });
  }
  if (typeof currentRow !== 'undefined') currentRow = total - 1;
  if (typeof rowIndex !== 'undefined') rowIndex = total - 1;
}

function showInlineHint(){
  const word =
    (typeof solution !== 'undefined' && solution) ? String(solution).toUpperCase() :
    (typeof answer   !== 'undefined' && answer)   ? String(answer).toUpperCase()   :
    (typeof target   !== 'undefined' && target)   ? String(target).toUpperCase()   : null;
  const hintText = (word && HINTS_MAP.get(word)) || 'No hint available for this answer.';
  const el = document.getElementById('inline-hint');
  if (el){ el.textContent = hintText; el.style.display = 'block'; }
  applyHintPenalty();
}

function initHintLink(){
  const btn = document.getElementById('hint-link');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    if (HINT_USED){ return; }
    showConfirm('Use hint?', 'Using a hint will leave you only one attempt. Proceed?', ()=> showInlineHint());
  });
}


// v3.3 inline hint (visible button variant)
if (typeof HINTS_MAP === 'undefined') { }
if (typeof HINT_USED === 'undefined') { }

async function loadHints(){
  try{
    const res = await fetch('assets/words_with_hints.csv?v=' + (typeof APP_VERSION!=='undefined'?APP_VERSION:'v3.3'));
    const txt = await res.text();
    const lines = txt.trim().split(/\r?\n/).slice(1);
    for(const line of lines){
      const idx = line.indexOf(',');
      if(idx>0){
        const w = line.slice(0, idx).trim().toUpperCase();
        const h = line.slice(idx+1).trim().replace(/^"|"$/g,'');
        if(/^[A-Z]{5}$/.test(w)){ HINTS_MAP.set(w, h); }
      }
    }
  }catch(e){ console.warn('Hint CSV load failed', e); }
}

function confirmHint(message, onYes){
  if (typeof showModal === 'function'){
    const content = `<p style="margin-bottom:12px">${message}</p>
      <div style="display:flex; gap:8px; justify-content:flex-end">
        <button class="btn" id="cf-no">Cancel</button>
        <button class="btn primary" id="cf-yes">Yes</button>
      </div>`;
    showModal('Use hint?', content);
    const root = document.getElementById('modal-backdrop')||document;
    const noBtn = root.querySelector('#cf-no'); const yesBtn = root.querySelector('#cf-yes');
    if(noBtn) noBtn.addEventListener('click', ()=> { const bd=document.getElementById('modal-backdrop'); if(bd) bd.remove(); });
    if(yesBtn) yesBtn.addEventListener('click', ()=> { const bd=document.getElementById('modal-backdrop'); if(bd) bd.remove(); onYes&&onYes(); });
  }else{
    if (confirm(message)) onYes&&onYes();
  }
}

function applyHintPenalty(){
  if (HINT_USED) return;
  HINT_USED = true;
  const hintBtn = document.getElementById('hint-link'); if (hintBtn) hintBtn.disabled = true;
  const grid = document.getElementById('grid'); if (!grid) return;
  const rows = Array.from(grid.querySelectorAll('.row'));
  const total = rows.length;
  let cr = (typeof currentRow !== 'undefined') ? currentRow
         : (typeof rowIndex !== 'undefined') ? rowIndex
         : 0;
  for(let r = cr; r < total - 1; r++){
    const tiles = rows[r].querySelectorAll('.tile');
    tiles.forEach(t => { t.textContent = 'X'; t.classList.add('blocked'); });
  }
  if (typeof currentRow !== 'undefined') currentRow = total - 1;
  if (typeof rowIndex !== 'undefined') rowIndex = total - 1;
}

function showInlineHint(){
  const word =
    (typeof solution !== 'undefined' && solution) ? String(solution).toUpperCase() :
    (typeof answer   !== 'undefined' && answer)   ? String(answer).toUpperCase()   :
    (typeof target   !== 'undefined' && target)   ? String(target).toUpperCase()   : null;
  const hintText = (word && HINTS_MAP.get(word)) || 'No hint available for this answer.';
  const el = document.getElementById('inline-hint');
  if (el){ el.textContent = hintText; el.style.display = 'block'; }
  applyHintPenalty();
}

function initHintLink(){
  const btn = document.getElementById('hint-link');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    if (HINT_USED) return;
    confirmHint('Using a hint will leave you only one attempt. Proceed?', ()=> showInlineHint());
  });
}


// === FIHR Foodle v3.6: unified hint globals + placement fix ===
window.FIHR = window.FIHR || {};
FIHR.hintsMap = FIHR.hintsMap || new Map();
FIHR.hintUsed = FIHR.hintUsed || false;

async function loadHints(){
  try{
    const res = await fetch('assets/words_with_hints.csv?v=' + (typeof APP_VERSION!=='undefined'?APP_VERSION:'v3.6'));
    const txt = await res.text();
    const lines = txt.trim().split(/\r?\n/).slice(1);
    for(const line of lines){
      const idx = line.indexOf(',');
      if(idx>0){
        const w = line.slice(0, idx).trim().toUpperCase();
        const h = line.slice(idx+1).trim().replace(/^"|"$/g,'');
        if(/^[A-Z]{5}$/.test(w)) FIHR.hintsMap.set(w, h);
      }
    }
  }catch(e){ console.warn('Hint CSV load failed', e); }
}

function forceHintZoneAfterGrid(){
  const grid = document.getElementById('grid');
  const hz = document.getElementById('hint-zone');
  if (grid && hz && hz.previousElementSibling !== grid) {
    grid.insertAdjacentElement('afterend', hz);
  }
}

function confirmHint(message, onYes){
  if (typeof showModal === 'function'){
    const content = `<p style="margin-bottom:12px">${message}</p>
      <div style="display:flex; gap:8px; justify-content:flex-end">
        <button class="btn" id="cf-no">Cancel</button>
        <button class="btn primary" id="cf-yes">Yes</button>
      </div>`;
    showModal('Use hint?', content);
    const root = document.getElementById('modal-backdrop')||document;
    const noBtn = root.querySelector('#cf-no'); const yesBtn = root.querySelector('#cf-yes');
    if(noBtn) noBtn.addEventListener('click', ()=> { const bd=document.getElementById('modal-backdrop'); if(bd) bd.remove(); });
    if(yesBtn) yesBtn.addEventListener('click', ()=> { const bd=document.getElementById('modal-backdrop'); if(bd) bd.remove(); onYes&&onYes(); });
  }else{ if (confirm(message)) onYes&&onYes(); }
}

function applyHintPenalty(){
  if (FIHR.hintUsed) return;
  FIHR.hintUsed = true;
  const hintBtn = document.getElementById('hint-link'); if (hintBtn) hintBtn.disabled = true;
  const grid = document.getElementById('grid'); if (!grid) return;
  const rows = Array.from(grid.querySelectorAll('.row'));
  const total = rows.length;
  let cr = (typeof currentRow !== 'undefined') ? currentRow
         : (typeof rowIndex !== 'undefined') ? rowIndex
         : 0;
  for(let r = cr; r < total - 1; r++){
    const tiles = rows[r].querySelectorAll('.tile');
    tiles.forEach(t => { t.textContent = 'X'; t.classList.add('blocked'); });
  }
  if (typeof currentRow !== 'undefined') currentRow = total - 1;
  if (typeof rowIndex !== 'undefined') rowIndex = total - 1;
}

function showInlineHint(){
  const word =
    (typeof solution !== 'undefined' && solution) ? String(solution).toUpperCase() :
    (typeof answer   !== 'undefined' && answer)   ? String(answer).toUpperCase()   :
    (typeof target   !== 'undefined' && target)   ? String(target).toUpperCase()   : null;
  const hintText = (word && FIHR.hintsMap.get(word)) || 'No hint available for this answer.';
  const el = document.getElementById('inline-hint');
  if (el){ el.textContent = hintText; el.style.display = 'block'; }
  applyHintPenalty();
}

function initHintLink(){
  const btn = document.getElementById('hint-link');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    if (FIHR.hintUsed) return;
    confirmHint('Using a hint will leave you only one attempt. Proceed?', ()=> showInlineHint());
  });
  forceHintZoneAfterGrid();
}


// v3.6.1 runtime guard: keep hint-zone right after #grid and above #legend
function placeHintZone(){
  const grid = document.getElementById('grid');
  const hz   = document.getElementById('hint-zone');
  if (!grid || !hz) return;
  if (hz.parentElement === grid) {
    grid.after(hz);
  }
  const legend = document.getElementById('legend');
  if (legend && hz.nextElementSibling !== legend) {
    legend.before(hz);
  }
}
document.addEventListener('DOMContentLoaded', placeHintZone);


// v3.6.2 robust tile helpers
function fihrGetRows(){ return Array.from(document.querySelectorAll('#grid .row')); }
function fihrGetRowIndex(){
  if (typeof currentRow !== 'undefined') return currentRow|0;
  if (typeof rowIndex !== 'undefined') return rowIndex|0;
  return 0;
}
function fihrGetRowEl(){
  const rows = fihrGetRows(); if (!rows.length) return null;
  let r = fihrGetRowIndex();
  if (r < 0) r = 0; if (r >= rows.length) r = rows.length-1;
  return rows[r];
}
function fihrNextEmptyTile(rowEl){
  if (!rowEl) return null;
  return Array.from(rowEl.querySelectorAll('.tile')).find(t => !t.textContent || t.textContent===' ');
}


// v3.6.2 safety: null-guard backspace & submit
function fihrSafeBackspace(){
  const rowEl = fihrGetRowEl(); if (!rowEl) return;
  const tiles = Array.from(rowEl.querySelectorAll('.tile'));
  const last = tiles.slice().reverse().find(t => t.textContent && t.textContent.trim());
  if (last){ last.textContent=''; last.classList.remove('filled'); }
}
function fihrSafeSubmit(){
  const rowEl = fihrGetRowEl(); if (!rowEl) return;
  // Leave existing submit/validate logic intact; this just prevents crashes
}


// v3.6.4: force version badge to match APP_VERSION at runtime
(function(){
  function setBuildTag(){
    var el = document.getElementById('version-label');
    if (el) el.textContent = 'Build ' + (typeof APP_VERSION!=='undefined' ? APP_VERSION : '');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setBuildTag);
  } else {
    setBuildTag();
  }
})();


// v3.6.5: input + layout hardening
(function(){
  function rows(){ return Array.from(document.querySelectorAll('#grid .row')); }
  function firstRowWithEmpty(){
    const rs = rows();
    for (const r of rs){
      const t = Array.from(r.querySelectorAll('.tile'));
      if (t.some(x => !(x.textContent && x.textContent.trim()))) return r;
    }
    return rs[rs.length-1] || null;
  }
  // Ensure hint-zone is directly after grid (belt-and-suspenders)
  function placeHintZone(){
    const grid = document.getElementById('grid');
    const hz   = document.getElementById('hint-zone');
    if (grid && hz && hz.parentElement !== grid && grid.nextElementSibling !== hz){
      grid.insertAdjacentElement('afterend', hz);
    }
  }
  document.addEventListener('DOMContentLoaded', placeHintZone);

  // Wrap addLetter to guard tile targeting
  var _addLetter = typeof addLetter === 'function' ? addLetter : null;
  window.addLetter = function(ch){
    try{
      const row = firstRowWithEmpty();
      if (!row){ if (_addLetter) return _addLetter(ch); else return; }
      const tile = Array.from(row.querySelectorAll('.tile')).find(x => !(x.textContent && x.textContent.trim()));
      if (!tile){ if (_addLetter) return _addLetter(ch); else return; }
      // If original addLetter exists and expects to set state, call it first then sync UI
      if (_addLetter) _addLetter(ch);
      // If UI didn't update, set directly
      if (!tile.textContent || !tile.textContent.trim()){
        tile.textContent = String(ch).toUpperCase();
        tile.classList.add('filled');
      }
    }catch(e){ if (_addLetter) _addLetter(ch); }
  };
})();


/* === FIHR Foodle v3.7.4: version badge + grid heal + external tile scrub === */
(function(){ 
  const BUILD = 'v3.7.4';
  function setBuildTagOnce() {
    const el = document.getElementById('version-label');
    if (el && !el.textContent.includes(BUILD)) el.textContent = `Build ${BUILD}`;
  }
  function scrubExternalTiles() {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    tiles.forEach(t => { if (!t.closest('#grid')) t.classList.remove('tile'); });
  }
  function normalizeGrid() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    const rows = Array.from(grid.querySelectorAll(':scope > .row'));
    if (rows.length === 5 && rows.every(r => r.children.length === 5)) return;
    const direct = Array.from(grid.children);
    let cells = [];
    direct.forEach(n => {
      if (n.classList && n.classList.contains('row')) cells.push(...n.children);
      else if (n.classList && n.classList.contains('tile')) cells.push(n);
      else n.remove();
    });
    while (cells.length < 25) { const d = document.createElement('div'); d.className='tile'; cells.push(d); }
    cells = cells.slice(0,25);
    const frag = document.createDocumentFragment();
    for (let i=0;i<25;i+=5){
      const row=document.createElement('div'); row.className='row';
      for (let j=i;j<i+5;j++){ const t=cells[j]; t.className='tile'; t.textContent=''; row.appendChild(t); }
      frag.appendChild(row);
    }
    grid.replaceChildren(frag);
  }
  function boot(){ setBuildTagOnce(); normalizeGrid(); scrubExternalTiles(); }
  if (!window.__fihrV374Booted) { window.__fihrV374Booted = true;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  }
})();
