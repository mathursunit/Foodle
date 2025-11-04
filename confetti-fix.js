// confetti-fix.js v4.1.1 — remove lingering confetti overlays after game ends
(function(){
  function cleanConfetti(){
    // Give the confetti a brief moment to render, then clean it up
    setTimeout(()=>{
      try{
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth||0);
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight||0);
        document.querySelectorAll('canvas, .confetti, .Confetti, [data-confetti]').forEach(el=>{
          // Heuristic: full-screen canvases or obvious confetti nodes
          const r = el.getBoundingClientRect();
          const isFullscreen = r.width >= vw*0.9 && r.height >= vh*0.9
          if (el.tagName === 'CANVAS' || /confetti/i.test(el.className) || el.getAttribute('data-confetti')!==null || isFullscreen){
            try{ el.style.pointerEvents='none'; el.style.background='transparent'; el.style.opacity='0'; }catch{}
            // remove if safe
            try{ el.parentElement && el.parentElement.removeChild(el); }catch{}
          }
        });
      }catch(e){}
    }, 1200);
  }
  window.addEventListener('fihr:gameover', cleanConfetti);
})();