// menu-addon.js v4.0.12 — wire menu items for About + Version; unify About modal
(function(){
  const qs  = (s,r=document)=>r.querySelector(s);
  const qsa = (s,r=document)=>Array.from(r.querySelectorAll(s));

  function openAbout(){
    const modal = qs('#aboutModal') || qs('#about-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = qs('#aboutClose') || modal.querySelector('.btn, .btn-ghost');
    function close(){ modal.classList.add('hidden'); }
    if (backdrop) backdrop.addEventListener('click', close, {once:true});
    if (closeBtn) closeBtn.addEventListener('click', close, {once:true});
    window.addEventListener('keydown', function onEsc(e){ if(e.key==='Escape'){ close(); window.removeEventListener('keydown', onEsc); } });
  }

  function openVersion(){
    let modal = qs('#versionModal');
    if (!modal){
      modal = document.createElement('div');
      modal.id = 'versionModal';
      modal.className = 'modal';
      modal.innerHTML = '<div class=\"modal-backdrop\"></div><div class=\"modal-box\"><h2>Version</h2><p style=\"margin:.5rem 0; font-weight:700;\">Build ' + (window.APP_VERSION||'') + '</p><div class=\"modal-actions\"><button class=\"btn-ghost\" id=\"versionClose\">Close</button></div></div>';
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = qs('#versionClose', modal);
    function close(){ modal.classList.add('hidden'); }
    if (backdrop) backdrop.addEventListener('click', close, {once:true});
    if (closeBtn) closeBtn.addEventListener('click', close, {once:true});
    window.addEventListener('keydown', function onEsc(e){ if(e.key==='Escape'){ close(); window.removeEventListener('keydown', onEsc); } });
  }

  // Convert 3-dots to burger again just in case
  function normalizeMenuIcon(){
    const cand = qsa('button, .menu-btn, .icon-btn');
    cand.forEach(b=>{
      const t = (b.textContent||'').trim();
      if (t==='...' || t==='…' || t==='⋮') { b.textContent = '☰'; b.setAttribute('aria-label','Menu'); }
    });
  }

  // Delegate clicks for menu items labeled "About" or "Version"
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('li,button,a,div,span');
    if (!item) return;
    const txt = (item.textContent||'').trim().toLowerCase();
    if (txt === 'about'){ e.preventDefault(); openAbout(); }
    if (txt === 'version'){ e.preventDefault(); openVersion(); }
  });

  document.addEventListener('DOMContentLoaded', normalizeMenuIcon);
})();