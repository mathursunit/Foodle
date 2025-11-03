
(function(){
  function $(s){ return document.querySelector(s); }

  // Inject a strict CSS override to fix the grid to 5 columns no matter what the base CSS does.
  function injectGridCSS(){
    var css = [
      '#grid{',
      '  display:grid !important;',
      '  grid-template-columns: repeat(5, minmax(48px, 1fr)) !important;',
      '  grid-auto-rows: minmax(48px, auto);',
      '  gap: 8px !important;',
      '  align-content: start;',
      '  justify-items: center;',
      '  white-space: normal !important;',
      '  flex-wrap: initial !important;',
      '}',
      '#grid > *{',
      '  width: 64px;',
      '  height: 64px;',
      '  display:flex; align-items:center; justify-content:center;',
      '  box-sizing:border-box;',
      '}'
    ].join('\n');
    var style = document.createElement('style');
    style.setAttribute('id','foodle-grid-fix-style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function gridFixInline(){
    var el = $('#grid');
    if(!el) return;
    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'repeat(5, minmax(48px, 1fr))';
    el.style.gap = '8px';
    el.style.whiteSpace = 'normal';
  }

  function fetchCSV(p){
    return fetch(p).then(r=>r.text()).then(t=>{
      var lines=t.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
      var out=[]; for(var i=0;i<lines.length;i++){ var parts=lines[i].split(',');
        var w=(parts[0]||'').replace(/[^A-Za-z]/g,'').toUpperCase(); var h=(parts[1]||'').trim();
        if(!w) continue; if(i===0 && w.toLowerCase()==='word') continue; if(w.length===5) out.push({word:w,hint:h});
      } return out;
    });
  }

  function integrateWordlist(rows){
    var words = rows.map(r=>r.word);
    try{
      if(Array.isArray(window.WORDS)){ window.WORDS = words; }
      else if(window.Game && typeof window.Game.setWordList==='function'){ window.Game.setWordList(words); }
      else if(typeof window.setWordList==='function'){ window.setWordList(words); }
    }catch(e){}
  }

  function enforceHintRule(){
    var btn = document.getElementById('hintBtn'); if(!btn) return;
    var applied=false;
    btn.addEventListener('click', function(){
      if(applied) return; applied=true;
      try{
        if(typeof window.setGuessesRemaining==='function'){ window.setGuessesRemaining(1); }
        else if(window.Game && typeof window.Game.setGuessesRemaining==='function'){ window.Game.setGuessesRemaining(1); }
      }catch(e){}
      var st=document.getElementById('statusText'); if(st){ st.textContent = (st.textContent? st.textContent+' — ' : '') + 'Only 1 guess left!'; }
    });
  }

  function watermark(){
    var w=document.createElement('div'); w.textContent='Build v3.7.12a';
    w.style.position='fixed'; w.style.right='10px'; w.style.bottom='8px'; w.style.opacity='.35'; w.style.fontWeight='700'; w.style.pointerEvents='none'; document.body.appendChild(w);
  }

  document.addEventListener('DOMContentLoaded', function(){
    injectGridCSS(); // strong CSS override
    gridFixInline(); // inline fallback
    enforceHintRule();
    watermark();
    fetchCSV('assets/fihr_food_words_v1.4.csv').then(integrateWordlist).catch(()=>{});
  });
})();
