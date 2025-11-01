
document.addEventListener("DOMContentLoaded", () => {
  const VERSION = "1767";
  const WORD_LEN = 5;
  const MAX_ROWS = 15;
  const BOARD_COUNT = 8;
  const VALID_TXT_URL = "assets/valid_words.txt?v=" + VERSION;

  (function initTheme(){
    try{
      const saved = localStorage.getItem("8xfww-theme");
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = (saved === "light" || saved === "dark") ? saved : (prefersDark ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", theme);
      const radios = document.querySelectorAll('input[name="theme"]');
      radios.forEach(r=>{ r.checked = (r.value === theme); r.addEventListener("change", (e)=>{ const t=e.target.value; document.documentElement.setAttribute("data-theme", t); localStorage.setItem("8xfww-theme", t); }); });
    }catch(e){ console.warn("theme init", e); }
  })();

  function getETParts() {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false });
    const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
    return {year: +parts.year, month: +parts.month, day: +parts.day, hour: +parts.hour};
  }
  function etMidnightUTC(y,m,d) { return Date.UTC(y, m-1, d); }
  function dayIndexET() { const {year,month,day,hour} = getETParts(); const EPOCH=Date.UTC(2025,0,1); let t=etMidnightUTC(year,month,day); if(hour<8) t-=86400000; return Math.floor((t-EPOCH)/86400000); }

  async function loadValidList() {
    try {
      const r = await fetch(VALID_TXT_URL, { cache: "no-store" });
      if (!r.ok) throw new Error("no valid_words.txt");
      const raw = await r.text();
      const list = raw.split(/\r?\n|[\s,]+/).map(w=>w.trim().toUpperCase()).filter(w=>/^[A-Z]{5}$/.test(w));
      return Array.from(new Set(list));
    } catch (e) {
      console.warn("fallback WORDS", e);
      const fb = (window.WORDS||[]).map(w=>String(w).trim().toUpperCase()).filter(w=>/^[A-Z]{5}$/.test(w));
      return fb.length?fb:["APPLE","BRAIN","CANDY","DOUBT","EAGER","FRAIL","GHOST","HONEY"];
    }
  }
  function selectAnswers(validList) {
    if (!validList.length) return ["APPLE","BRAIN","CANDY","DOUBT","EAGER","FRAIL","GHOST","HONEY"];
    const idx = dayIndexET();
    const start = (idx*BOARD_COUNT) % validList.length;
    const out=[]; for (let i=0;i<BOARD_COUNT;i++) out.push(validList[(start+i)%validList.length]);
    return out;
  }

  (async function init(){
    const validList = await loadValidList();
    const ANSWERS = selectAnswers(validList);

    let activeBoard=0, viewBoard=0, maxUnlocked=0;
    const state = ANSWERS.map(()=>({rows:Array(MAX_ROWS).fill(""),attempt:0,solved:false,invalidRow:-1}));

    const boardsEl=document.getElementById("boards");
    const keyboardEl=document.getElementById("keyboard");
    const boardNumEl=document.getElementById("boardNum");
    const activeNumEl=document.getElementById("activeNum");
    const resetBtn=document.getElementById("resetBtn");
    const validSet = new Set(validList);

    buildBoards(); buildKeyboard(); updateLockUI(); updateStatus(); updateNavButtons(); drawPreviewAll();

    window.addEventListener("keydown",(e)=>{ const k=e.key; if(/^[a-z]$/i.test(k)) onLetter(k.toUpperCase()); else if(k==="Backspace") onBackspace(); else if(k==="Enter") onEnter(); });
    resetBtn?.addEventListener("click", resetGame);

    function buildBoards(){
      boardsEl.innerHTML="";
      for (let i=0;i<BOARD_COUNT;i++){
        const b=document.createElement("section"); b.className="board"+(i===0?"":" locked"); b.dataset.index=i;
        const title=document.createElement("div"); title.className="board-title"; title.textContent="Board "+(i+1); b.appendChild(title);
        const grid=document.createElement("div"); grid.className="grid";
        for (let r=0;r<MAX_ROWS;r++) for (let c=0;c<WORD_LEN;c++){ const t=document.createElement("div"); t.className="tile"; grid.appendChild(t);}
        b.appendChild(grid); boardsEl.appendChild(b);
      }
    }
    function buildKeyboard(){
      keyboardEl.innerHTML="";
      const nav=document.createElement("div"); nav.className="krow krow-nav";
      for (let i=1;i<=BOARD_COUNT;i++){ const k=mk("div","key",String(i)); k.dataset.idx=String(i-1); k.title="Jump to board "+i; k.addEventListener("click",()=>onNavClick(i-1)); nav.appendChild(k);}
      const rows=["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
      const r1=document.createElement("div"); r1.className="krow";
      const r2=document.createElement("div"); r2.className="krow";
      const r3=document.createElement("div"); r3.className="krow";
      for (const ch of rows[0]) r1.appendChild(mkKey(ch));
      for (const ch of rows[1]) r2.appendChild(mkKey(ch));
      r3.appendChild(mkKey("ENTER","wide"));
      for (const ch of rows[2]) r3.appendChild(mkKey(ch));
      r3.appendChild(mkKey("⌫","wide"));
      keyboardEl.append(nav,r1,r2,r3);
    }
    function mkKey(label,extra){ const key=mk("div","key"+(extra?" "+extra:""),label); key.addEventListener("click",()=>{ if(label==="ENTER") onEnter(); else if(label==="⌫") onBackspace(); else onLetter(label); }); return key; }
    function mk(tag,cls,txt){ const el=document.createElement(tag); el.className=cls; el.textContent=txt; return el;}
    function cur(){return state[activeBoard];}
    function boardEl(i){return boardsEl.children[i];}

    // NAVIGATION (view only)
    function onNavClick(idx){ viewBoard=idx; updateStatus(); updateNavButtons(); boardEl(viewBoard).scrollIntoView({behavior:"smooth",block:"nearest"}); drawPreviewAll(); }
    function updateNavButtons(){ const btns=keyboardEl.querySelectorAll(".krow-nav .key"); btns.forEach((b,i)=>{ b.classList.toggle("active", i===viewBoard); }); }

    // INPUT to active board only
    function onLetter(ch){ const s=cur(); if(s.solved) return; if(s.invalidRow===s.attempt) return; const row=s.rows[s.attempt]||""; if(row.length>=WORD_LEN) return; s.rows[s.attempt]=row+ch; renderRowActive(activeBoard,s.attempt); drawPreviewAll(); }
    function onBackspace(){ const s=cur(); if(s.solved) return; let row=s.rows[s.attempt]||""; if(!row.length){ if(s.invalidRow===s.attempt){clearInvalidRow(activeBoard,s.attempt); s.invalidRow=-1;} drawPreviewAll(); return; } s.rows[s.attempt]=row.slice(0,-1); renderRowActive(activeBoard,s.attempt); if(s.invalidRow===s.attempt){clearInvalidRow(activeBoard,s.attempt); s.invalidRow=-1;} drawPreviewAll(); }
    function onEnter(){ 
      const s=cur(); if(s.solved) return; if(s.invalidRow===s.attempt) return; 
      const guess=(s.rows[s.attempt]||"").toUpperCase(); if(guess.length!==WORD_LEN) return; 
      if(!validSet.has(guess)){markInvalidRow(activeBoard,s.attempt); s.invalidRow=s.attempt; return;}

      // Mirror guess (ghost) on every UNSOLVED board; keep rows aligned.
      for(let bi=0; bi<BOARD_COUNT; bi++){ 
        const sb=state[bi]; if(sb.solved) continue; if(sb.attempt>=MAX_ROWS) continue; 
        if(!sb.rows[sb.attempt]) sb.rows[sb.attempt]=guess; paintRowGhost(bi,sb.attempt); if(bi!==activeBoard) sb.attempt++; 
      }

      const answer=ANSWERS[activeBoard]; const res=evalGuess(guess,answer); paintRowColored(activeBoard,s.attempt,res); updateKeyboard(guess,res);

      if(guess===answer){ s.solved=true; confettiBurstForBoard(activeBoard); if(activeBoard===BOARD_COUNT-1){ if(window.launchConfetti) window.launchConfetti(); } else unlockNext(); }
      else { s.attempt++; if(s.attempt>=MAX_ROWS) unlockNext(); }
      drawPreviewAll(); 
    }

    // Preview while typing: mirror partial word to other boards' current rows in ghost
    function drawPreviewAll(){ 
      const sCur=cur(); const curStr=(sCur.rows[sCur.attempt]||""); 
      for(let bi=0; bi<BOARD_COUNT; bi++){ 
        const s=state[bi]; if(s.solved) continue; const ri=s.attempt; if(ri>=MAX_ROWS) continue; 
        if(bi===activeBoard) { renderRowActive(bi,ri); continue; }
        const existing=s.rows[ri]||""; const str = existing.length===WORD_LEN ? existing : (existing || curStr); setRowGhost(bi,ri,str,true); 
      } 
    }

    // Render helpers
    function setRowGhost(bi,ri,str,ghost=true){ const b=boardEl(bi); const tiles=b.querySelectorAll(".tile"); const start=ri*WORD_LEN; for(let i=0;i<WORD_LEN;i++){ const t=tiles[start+i]; t.classList.remove("correct","present","absent","invalid"); if(ghost) t.classList.add("ghost"); else t.classList.remove("ghost"); t.textContent=str[i] || ""; } }
    function renderRowActive(bi,ri){ const s=state[bi]; const str=s.rows[ri]||""; setRowGhost(bi,ri,str,false); }
    function markInvalidRow(bi,ri){ const b=boardEl(bi); const tiles=b.querySelectorAll(".tile"); const start=ri*WORD_LEN; for(let i=0;i<WORD_LEN;i++) tiles[start+i].classList.add("invalid"); }
    function clearInvalidRow(bi,ri){ const b=boardEl(bi); const tiles=b.querySelectorAll(".tile"); const start=ri*WORD_LEN; for(let i=0;i<WORD_LEN;i++) tiles[start+i].classList.remove("invalid"); }
    function evalGuess(guess,answer){ const res=Array(WORD_LEN).fill("absent"); const cnt={}; for(const ch of answer) cnt[ch]=(cnt[ch]||0)+1; for(let i=0;i<WORD_LEN;i++) if(guess[i]===answer[i]){ res[i]="correct"; cnt[guess[i]]--; } for(let i=0;i<WORD_LEN;i++) if(res[i]!=="correct"){ const ch=guess[i]; if((cnt[ch]||0)>0){ res[i]="present"; cnt[ch]--; } } return res; }
    function paintRowColored(bi,ri,res){ const b=boardEl(bi); const tiles=b.querySelectorAll(".tile"); const start=ri*WORD_LEN; const word=state[bi].rows[ri]; for(let i=0;i<WORD_LEN;i++){ const t=tiles[start+i]; t.classList.remove("ghost"); t.textContent=word[i] || ""; t.classList.add("flip"); setTimeout(()=>{ t.classList.remove("flip"); t.classList.add(res[i]); },80+i*30); } }
    function paintRowGhost(bi,ri){ const s=state[bi]; const str=s.rows[ri]||""; setRowGhost(bi,ri,str,true); }
    function paintExistingAsColored(bi){ const s=state[bi]; for(let r=0;r<s.attempt;r++){ const guess=s.rows[r]; const res=evalGuess(guess,ANSWERS[bi]); paintRowColored(bi,r,res); } renderRowActive(bi,s.attempt); }
    function updateKeyboard(guess,res){ for(let i=0;i<WORD_LEN;i++){ const ch=guess[i]; const k=findKey(ch); if(!k) continue; if(res[i]==="correct"){k.classList.remove("present","absent");k.classList.add("correct");} else if(res[i]==="present"&&!k.classList.contains("correct")){k.classList.remove("absent");k.classList.add("present");} else if(!k.classList.contains("correct")&&!k.classList.contains("present")){k.classList.add("absent");} } }
    function findKey(ch){ return Array.from(keyboardEl.querySelectorAll(".key")).find(k=>k.textContent===ch)||null; }

    function confettiBurstForBoard(bi){
      try{
        if(window.ensureConfetti){ return window.ensureConfetti(function(){ confettiBurstForBoard(bi); }); }
        if(!window.confetti) return;
        const el = boardEl(bi);
        const r = el.getBoundingClientRect();
        const cx = (r.left + r.width / 2) / window.innerWidth;
        const cy = (r.top + r.height / 2) / window.innerHeight;
        window.confetti({ particleCount: 90, spread: 80, origin: { x: cx, y: cy }, ticks: 90 });
      }catch(e){}
    }

    function unlockNext(){ if(activeBoard<BOARD_COUNT-1){ activeBoard=activeBoard+1; if(activeBoard>maxUnlocked) maxUnlocked=activeBoard; viewBoard=activeBoard; paintExistingAsColored(activeBoard); updateLockUI(); updateStatus(); updateNavButtons(); boardEl(viewBoard).scrollIntoView({behavior:"smooth",block:"nearest"}); } }
    function updateLockUI(){ for(let i=0;i<BOARD_COUNT;i++){ const b=boardEl(i); if(i<=maxUnlocked) b.classList.remove("locked"); else b.classList.add("locked"); } }
    function updateStatus(){ boardNumEl.textContent=(viewBoard+1); activeNumEl.textContent=(activeBoard+1); }

    function resetGame(){ for(let i=0;i<state.length;i++) state[i]={rows:Array(MAX_ROWS).fill(""),attempt:0,solved:false,invalidRow:-1}; activeBoard=0; viewBoard=0; maxUnlocked=0; for(let i=0;i<BOARD_COUNT;i++){ const b=boardEl(i); b.querySelectorAll(".tile").forEach(t=>{t.className="tile"; t.textContent="";}); } buildKeyboard(); updateLockUI(); updateStatus(); updateNavButtons(); drawPreviewAll(); }
  })().catch(err=>{ console.error(err); const s=document.getElementById("status"); if(s) s.textContent="Error loading game: "+err; });
});
