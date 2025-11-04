// script.js with toast notification and flip animation
const APP_VERSION = 'v4.1.2';

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
let INPUT_LOCKED = false;
let solution = '';
let currentRow = 0, currentCol = 0;
const rows = [];

fetch('assets/fihr_food_words_v1.4.csv')
  .then(r => r.text())
  .then(txt => {
    const lines = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    WORDS = [];
    for (let i=0;i<lines.length;i++){
      let line = lines[i].replace(/^\ufeff/, '');
      const idx = line.indexOf(',');
      let word = (idx>=0 ? line.slice(0, idx) : line).trim();
      if (word.startsWith('"') && word.endsWith('"')) word = word.slice(1,-1);
      word = word.replace(/[^A-Za-z]/g,'').toUpperCase();
      if (i===0 && word.toLowerCase()==='word') continue;
      if (word.length===5) WORDS.push(word);
    }
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
  ensureLegend();
  // Add row numbers 1..5 on first tile
  document.querySelectorAll('#grid .row').forEach((row, idx)=>{
    const first = row.querySelector('.tile');
    if(first){ first.classList.add('row-label'); first.setAttribute('data-rownum', String(idx+1)); }
  });
  layoutGrid();
  window.setTimeout(layoutGrid, 50);
  initMenu();
  (function(){try{var wm=document.createElement('div');wm.textContent='Build '+APP_VERSION;wm.style.position='fixed';wm.style.right='10px';wm.style.bottom='8px';wm.style.opacity='.35';wm.style.fontWeight='700';wm.style.pointerEvents='none';document.body.appendChild(wm);}catch(e){}})();
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
  if (window.INPUT_LOCKED) { return; }
const key = e.key.toUpperCase();
  if (currentRow >= 5) return;
  if (key === 'ENTER') return checkGuess();
  if (key === 'BACKSPACE') return deleteLetter();
  if (/^[A-Z]$/.test(key) && currentCol < 5) addLetter(key);
}

function addLetter(letter) {
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
try{
  window.INPUT_LOCKED = true;
  
  var grid=document.getElementById('grid'); if(grid) grid.classList.add('disabled-grid');
  var hb=document.getElementById('hintBtn'); if(hb){ hb.disabled=true; hb.classList.add('loading'); hb.classList.remove('loading'); }
}catch(e){} try{ if (typeof showToast==='function'){ showToast('Game Over - You Rock!'); } }catch(e){} try{ if (window.recordGame) window.recordGame('win', (typeof currentRow!=='undefined'? currentRow+1 : 0), !!window.HINT_USED); }catch(e){}
      showToast('Great');
    if (typeof confetti === 'function') confetti({ particleCount: 200, spread: 60 });
      currentRow = 5;
    } else {
      currentRow++;
      try{
        var rowsTotal = 5; if (typeof MAX_ROWS !== 'undefined') rowsTotal = MAX_ROWS;
        if (currentRow >= rowsTotal && guess !== solution) {
          window.INPUT_LOCKED = true; 
          if (typeof showToast==='function'){ showToast('Game Over - Better luck tomorrow'); } try{ window.dispatchEvent(new CustomEvent('fihr:gameover',{detail:{outcome:'loss'}})); }catch(e){} 
try{
  window.INPUT_LOCKED = true;
  
  var grid=document.getElementById('grid'); if(grid) grid.classList.add('disabled-grid');
  var hb=document.getElementById('hintBtn'); if(hb){ hb.disabled=true; hb.classList.add('loading'); hb.classList.remove('loading'); }
}catch(e){} try{ var _max=(typeof MAX_ROWS!=='undefined'? MAX_ROWS:5); if (window.recordGame) window.recordGame('loss', _max, !!window.HINT_USED); }catch(e){}
        }
      }catch(e){}

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
