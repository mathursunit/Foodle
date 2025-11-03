import { buildGrid, GRID_COLS, GRID_ROWS } from './grid.js';
import { HintManager } from './hint.js';

const gridEl = document.getElementById('grid');
const keyboardEl = document.getElementById('keyboard');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');
const statusText = document.getElementById('statusText');

let state = {
  cols: GRID_COLS,
  rows: GRID_ROWS,
  currentRow: 0,
  currentCol: 0,
  answer: null,
  usedHint: false,
  guessesRemaining: GRID_ROWS,
  words: [],
  hints: []
};

let tiles = [];

async function loadCSV(){
  // Prefer v1.4; if moved, adjust path here.
  const res = await fetch('assets/fihr_food_words_v1.4.csv');
  const text = await res.text();
  // Parse CSV (first row may be header): word,hint
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const data = [];
  for (let i=0;i<lines.length;i++){
    const line = lines[i];
    const parts = line.split(',');
    if(parts.length === 0) continue;
    const word = (parts[0]||'').trim().replace(/[^A-Za-z]/g,'');
    const hint = (parts[1]||'').trim();
    if(!word) continue;
    // Skip potential header
    if(i===0 && word.toLowerCase()==='word') continue;
    data.push({word: word.toUpperCase(), hint});
  }
  return data;
}

function pickAnswer(list){
  const pool = list.filter(x => x.word.length === GRID_COLS);
  if(pool.length === 0) return list[Math.floor(Math.random()*list.length)];
  return pool[Math.floor(Math.random()*pool.length)];
}

function buildKeyboard(){
  const rows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["Enter",..."ZXCVBNM".split(""),"Back"]
  ];
  keyboardEl.innerHTML = "";
  const frag = document.createDocumentFragment();
  rows.flat().forEach(k => {
    const key = document.createElement('div');
    key.className = 'key';
    key.textContent = k;
    key.dataset.key = k;
    key.addEventListener('click', ()=>onKey(k));
    frag.appendChild(key);
  });
  keyboardEl.appendChild(frag);
}

function onKey(k){
  if(state.currentRow >= state.rows) return;
  if(k === "Enter"){
    submitRow();
    return;
  }
  if(k === "Back"){
    if(state.currentCol>0){
      do {
        state.currentCol--;
        const tile = tiles[state.currentRow * state.cols + state.currentCol];
        if(tile.dataset.prefilled === "1"){
          // skip deleting prefilled (hint) letter
          continue;
        } else {
          tile.textContent = "";
          break;
        }
      } while(state.currentCol>0);
    }
    return;
  }
  if(/^[A-Z]$/.test(k)){
    if(state.currentCol < state.cols){
      const tile = tiles[state.currentRow * state.cols + state.currentCol];
      if(tile.dataset.prefilled === "1"){
        // Move past prefilled letter
        state.currentCol++;
        if(state.currentCol < state.cols){
          const t2 = tiles[state.currentRow * state.cols + state.currentCol];
          if(!t2.dataset.prefilled) t2.textContent = k;
        }
      }else{
        tile.textContent = k;
      }
      if(state.currentCol < state.cols) state.currentCol++;
    }
  }
}

function evaluateRow(guess){
  const ans = state.answer;
  const res = new Array(state.cols).fill('absent');
  const used = new Array(state.cols).fill(false);

  // correct positions
  for(let i=0;i<state.cols;i++){
    if(guess[i]===ans[i]){
      res[i]='correct'; used[i]=true;
    }
  }
  // present (wrong place)
  for(let i=0;i<state.cols;i++){
    if(res[i]==='correct') continue;
    for(let j=0;j<state.cols;j++){
      if(!used[j] && guess[i]===ans[j]){
        res[i]='present'; used[j]=true; break;
      }
    }
  }
  return res;
}

function submitRow(){
  // Read the row's letters
  let guess = "";
  for(let c=0;c<state.cols;c++){
    const tile = tiles[state.currentRow * state.cols + c];
    const ch = (tile.textContent||'').toUpperCase();
    guess += ch ? ch[0] : "";
  }
  if(guess.length < state.cols){
    setStatus("Fill all letters before submitting.");
    return;
  }

  const qual = evaluateRow(guess);
  for(let c=0;c<state.cols;c++){
    tiles[state.currentRow * state.cols + c].classList.add(qual[c]);
  }

  if(guess === state.answer){
    setStatus("Great! You solved it.");
    state.currentRow = state.rows; // stop
    return;
  }

  state.currentRow++;
  state.currentCol = 0;
  state.guessesRemaining--;

  if(state.guessesRemaining <= 0){
    setStatus(`Out of guesses. Answer was ${state.answer}.`);
    return;
  } else {
    setStatus(`${state.guessesRemaining} guesses remaining.`);
  }
}

function setStatus(msg){ statusText.textContent = msg; }

async function startGame(){
  tiles = buildGrid(gridEl); // harden column count here to avoid 1-col bug
  buildKeyboard();
  setStatus("Loading words...");
  try{
    const list = await loadCSV();
    const pick = pickAnswer(list);
    state.answer = pick.word;
    state.hintText = pick.hint || "";
    state.guessesRemaining = state.rows;
    state.usedHint = false;
    state.currentRow = 0;
    state.currentCol = 0;
    setStatus(`Guess the ${state.cols}-letter food!`);
  }catch(e){
    console.error(e);
    setStatus("Failed to load word list.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  startGame();

  const hm = new HintManager(state);
  hintBtn.addEventListener('click', () => {
    if(state.usedHint){
      setStatus("Hint already used.");
      return;
    }
    hm.applyOneLetterReveal(tiles);
    if(state.hintText){
      setStatus(`Hint: ${state.hintText} — Only 1 guess left!`);
    }else{
      setStatus("Hint used — Only 1 guess left!");
    }
  });

  restartBtn.addEventListener('click', () => {
    startGame();
  });

  // Physical keyboard support
  window.addEventListener('keydown', (e)=>{
    const k = e.key;
    if(k === "Enter") onKey("Enter");
    else if(k === "Backspace") onKey("Back");
    else if(/^[a-z]$/i.test(k)) onKey(k.toUpperCase());
  });
});
