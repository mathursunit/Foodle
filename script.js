// script.js with toast notification and flip animation
const APP_VERSION = 'v2.2';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EPOCH_MS = Date.UTC(2025, 0, 1);

let __lastToast = { text: '', ts: 0 };
function showToast(message) {
  const container = document.getElementById('toast-container');
  const now = Date.now();
  if (message === __lastToast.text && (now - __lastToast.ts) < 800) { return; }
  __lastToast = { text: message, ts: now };
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

fetch('words.txt')
  .then(r => r.text())
  .then(txt => {
    WORDS = txt.split('\n').map(w => w.trim().toUpperCase()).filter(Boolean);
    startGame();
  });

function getDailyIndex() {
  const now = new Date();
  const todayUTCmid = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.floor((todayUTCmid - EPOCH_MS) / MS_PER_DAY);
  return ((days % WORDS.length) + WORDS.length) % WORDS.length;
}

let __lastToast = { text: '', ts: 0 };
function showToast(message) {
  const container = document.getElementById('toast-container');
  const now = Date.now();
  if (message === __lastToast.text && (now - __lastToast.ts) < 800) { return; }
  __lastToast = { text: message, ts: now };
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
  initMenu();
  const vb = document.getElementById('version-badge');
  if (vb) vb.textContent = 'FIHR – Foodle ' + APP_VERSION;

  solution = WORDS[getDailyIndex()];
  document.body.focus();
  document.querySelectorAll('.row').forEach(r => rows.push(Array.from(r.children)));
  window.addEventListener('keydown', onKey);
  document.querySelectorAll('#keyboard .key').forEach(btn => {
    btn.addEventListener('click', () => {
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

function addLetter(letter) {
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
        tile.textContent = letter;
        tile.classList.remove('correct','present','absent');
        tile.classList.add(state);
        // inline color to override any stylesheet conflicts
        if (state === 'correct') { tile.style.background='#8b5cf6'; tile.style.borderColor='#8b5cf6'; tile.style.color='#fff'; }
        else if (state === 'present') { tile.style.background='#06b6d4'; tile.style.borderColor='#06b6d4'; tile.style.color='#fff'; }
        else { tile.style.background='#334155'; tile.style.borderColor='#334155'; tile.style.color='#fff'; }
tile.classList.add(state);
        const keyBtn = findKeyBtn(letter);
        if (state === 'correct') {
          keyBtn.classList.add('correct'); if (keyBtn) { keyBtn.style.background='#8b5cf6'; keyBtn.style.borderColor='#8b5cf6'; keyBtn.style.color='#fff'; }
        } else if (state === 'present' && !keyBtn.classList.contains('correct')) {
          keyBtn.classList.add('present'); if (keyBtn) { keyBtn.style.background='#06b6d4'; keyBtn.style.borderColor='#06b6d4'; keyBtn.style.color='#fff'; }
        } else {
          keyBtn.classList.add('absent'); if (keyBtn) { keyBtn.style.background='#334155'; keyBtn.style.borderColor='#334155'; keyBtn.style.color='#fff'; }
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
  const backdrop = document.createElement('div');
  backdrop.id = 'modal-backdrop';
  const modal = document.createElement('div');
  modal.id = 'modal';
  modal.innerHTML = `<h3>${title}</h3><div class="content">${contentHtml}</div>
    <div class="actions"><button class="btn primary" id="modal-ok">OK</button></div>`;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  document.getElementById('modal-ok').addEventListener('click', ()=> backdrop.remove());
  backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) backdrop.remove(); });
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
        showModal('About', `<p><strong>FIHR – Foodle</strong> is a personal learning project. It is not affiliated with the NYTimes.</p>`);
      }
    });
  });
}

