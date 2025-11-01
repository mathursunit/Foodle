
(function(){
  // expose a loader so game.js can guarantee availability
  
  const C="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
  function ensure(fn){ if(typeof fn!=='function') fn=function(){}; if(window.confetti) fn(); else { const s=document.createElement("script"); s.src=C; s.onload=fn; document.head.appendChild(s);} }
  window.launchConfetti=function(){ ensure(function(){ const end=Date.now()+1200; (function loop(){ window.confetti({particleCount:140,spread:80,origin:{y:0.6}}); if(Date.now()<end) requestAnimationFrame(loop); })(); }); };
})();
