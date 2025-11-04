// stats-addon.js v4.0.9 — simple local stats with modal
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const KEY = 'fihr_stats_v1';

  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || {played:0,wins:0,cur:0,max:0,totalGuesses:0,hints:0,lastSolution:''}; }catch{ return {played:0,wins:0,cur:0,max:0,totalGuesses:0,hints:0,lastSolution:''}; }
  }
  function save(x){ try{ localStorage.setItem(KEY, JSON.stringify(x)); }catch{} }

  function getSolutionWord(){
    try{
      if (typeof solution === 'string' && solution) return solution.toUpperCase();
      if (typeof window.solution === 'string' && window.solution) return window.solution.toUpperCase();
    }catch{} return '';
  }

  // Expose recorder
  window.recordGame = function(outcome, guesses, usedHint){
    const sol = getSolutionWord();
    const st = load();
    if (st.lastSolution === sol && sol) return; // avoid double count on reload
    st.played += 1;
    if (outcome === 'win'){
      st.wins += 1;
      st.cur += 1;
      if (st.cur > st.max) st.max = st.cur;
    } else {
      st.cur = 0;
    }
    if (usedHint) st.hints += 1;
    if (guesses && Number.isFinite(guesses)) st.totalGuesses += Math.max(1, guesses);
    st.lastSolution = sol;
    save(st);
  };

  function percent(n,d){ return d? Math.round((100*n)/d):0; }
  function avg(total, n){ return n? (total/n).toFixed(1): '0.0'; }

  function refreshUI(){
    const st = load();
    const played = st.played, wins = st.wins;
    const winRate = percent(wins, played);
    const avgG = avg(st.totalGuesses, Math.max(1, wins));
    const map = {
      stPlayed: played, stWins: wins, stWinRate: winRate+'%',
      stCurStreak: st.cur, stMaxStreak: st.max, stAvgGuesses: avgG,
      stHints: st.hints
    };
    Object.entries(map).forEach(([id,val])=>{ const el = qs('#'+id); if (el) el.textContent = val; });
  }

  // Wiring modal
  const statsBtn = qs('#statsBtn');
  const modal = qs('#statsModal');
  if (statsBtn && modal){
    const closeBtn = qs('#statsClose');
    const resetBtn = qs('#statsReset');
    const backdrop = qs('#statsModal .modal-backdrop');
    const open = ()=>{ refreshUI(); modal.classList.remove('hidden'); };
    const close = ()=> modal.classList.add('hidden');
    statsBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    if (resetBtn) resetBtn.addEventListener('click', ()=>{ localStorage.removeItem(KEY); refreshUI(); });
    window.addEventListener('keydown', e=>{ if(e.key==='Escape' && !modal.classList.contains('hidden')) close(); });
  }
})();