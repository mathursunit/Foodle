
(function(){
  function injectCSS(){
    var css = [
      '#grid{display:flex!important;flex-direction:column!important;gap:0.5rem!important;perspective:1000px;}',
      '#grid .row{display:flex!important;gap:0.5rem!important;flex-wrap:nowrap!important;}',
      /* Never render scripts/styles accidentally if they sit inside #grid in this older layout */
      '#grid script,#grid style,#grid link{display:none!important;}'
    ].join('\n');
    var s=document.createElement('style'); s.id='foodle-grid-fix-b'; s.textContent=css; document.head.appendChild(s);
  }

  function enforceHintRule(){
    var btn=document.getElementById('hintBtn'); if(!btn) return;
    var applied=false;
    btn.addEventListener('click', function(){
      if(applied) return; applied=true;
      try{
        if(typeof window.setGuessesRemaining==='function'){ window.setGuessesRemaining(1); }
        else if(window.Game && typeof window.Game.setGuessesRemaining==='function'){ window.Game.setGuessesRemaining(1); }
      }catch(e){}
      var st=document.getElementById('statusText');
      if(st){ st.textContent=(st.textContent? st.textContent+' — ': '')+'Only 1 guess left!'; }
    });
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
    var words=rows.map(r=>r.word);
    try{
      if(Array.isArray(window.WORDS)){ window.WORDS = words; }
      else if(window.Game && typeof window.Game.setWordList==='function'){ window.Game.setWordList(words); }
      else if(typeof window.setWordList==='function'){ window.setWordList(words); }
    }catch(e){}
  }

  function watermark(){
    var w=document.createElement('div'); w.textContent='Build v3.7.12b';
    w.style.position='fixed'; w.style.right='10px'; w.style.bottom='8px'; w.style.opacity='.35'; w.style.fontWeight='700'; w.style.pointerEvents='none'; document.body.appendChild(w);
  }

  document.addEventListener('DOMContentLoaded', function(){
    injectCSS();
    enforceHintRule();
    watermark();
    fetchCSV('assets/fihr_food_words_v1.4.csv').then(integrateWordlist).catch(()=>{});
  });
})();
