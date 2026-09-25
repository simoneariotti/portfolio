/* ══════════════════════════════════════════════════════════════════════════
   RETICOLO · comportamento condiviso del portfolio
   ──────────────────────────────────────────────────────────────────────────
   Luce sugli oggetti, ancore al caricamento, motion tipizzato in cascata,
   cursore-lampada, magnetismo dei bottoni, anno del copyright, barra che si
   ancora. Caricato da home, about e dai tre case study.
   Tutto degrada a statico con prefers-reduced-motion e su puntatore grosso.

   Lo shader della hero e la sezione del filo restano dentro index.html:
   servono a una pagina sola, e lo shader e' codice chiuso.
   ══════════════════════════════════════════════════════════════════════════ */
/* la luce del reticolo segue il puntatore (solo pointer fine) */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('[data-luce]').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--lx',((e.clientX-r.left)/r.width*100)+'%');
      el.style.setProperty('--ly',((e.clientY-r.top)/r.height*100)+'%');
    },{passive:true});
  });
})();

/* ancore al caricamento: con scroll-behavior:smooth sulla radice il salto iniziale
   diventa un'animazione lunga che il browser puo' annullare, e la pagina resta in cima.
   Lo stato sicuro e' arrivarci subito: si disattiva il morbido per l'istante del salto,
   si ripete dopo che il layout si e' assestato (font, altezze calcolate), e si riattiva. */
(function(){
  if(!location.hash) return;
  var radice=document.documentElement;
  function vai(){
    var t=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(!t) return;
    var prima=radice.style.scrollBehavior;
    radice.style.scrollBehavior='auto';
    t.scrollIntoView();
    requestAnimationFrame(function(){ radice.style.scrollBehavior=prima; });
  }
  if(history.scrollRestoration) history.scrollRestoration='manual';
  addEventListener('load', function(){ vai(); setTimeout(vai,150); setTimeout(vai,600); });
})();

/* motion: ogni sezione entra come composizione di gesti tipizzati, in cascata. Degrada a statico con reduced-motion */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('reveal-on');
  /* I gruppi che entrano in cascata. L'elenco e' l'unione delle tre famiglie
     di pagina: su ciascuna i selettori delle altre non trovano nulla, quindi
     non c'e' niente da tenere allineato quando si aggiunge una pagina. */
  const groups=document.querySelectorAll(
    '.wrap-prosa, .banda-principio .principio, .coda .griglia,'
    + '.hero-testo, #lavori .wrap, .principio, .rr-testo, .contatto-layout > div');
  function roleOf(el){
    if(el.matches('.eyebrow,.p-label,.p-fonte,.meta')) return 'm-eyebrow';
    if(el.matches('h1,h2,h3,.t-voce')) return 'm-title';  /* .t-voce: about */
    if(el.matches('blockquote,.evidenza')) return 'm-quote';
    return 'm-text';
  }
  function unitsOf(g){
    const out=[];
    Array.from(g.children).forEach(c=>{
      if(c.matches('ul,ol')) c.querySelectorAll(':scope > li').forEach(li=>out.push([li,'m-li']));
      else if(c.matches('.figure')) c.querySelectorAll(':scope > figure').forEach(f=>out.push([f,'m-figure']));
      else if(c.matches('.cs-grid')) c.querySelectorAll(':scope > *').forEach(k=>out.push([k,'m-figure']));  /* .cs-grid: home */
      else out.push([c,roleOf(c)]);
    });
    return out;
  }
  const io=new IntersectionObserver((entries,obs)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      (e.target.__units||[]).forEach(([el,role],i)=>{
        const d=Math.min(i*140,720);
        el.style.transitionDelay=d+'ms';
        requestAnimationFrame(()=>el.classList.add('in'));
        setTimeout(()=>{ el.style.transitionDelay=''; el.classList.remove('m',role,'in'); },d+1400);
      });
      if(e.target.matches('.principio')) e.target.classList.add('lit');
      obs.unobserve(e.target);
    });
  },{threshold:0.1, rootMargin:'0px 0px -6% 0px'});
  /* Un gruppo gia' dentro l'area visibile all'avvio non si nasconde affatto:
     l'osservatore notifica solo i cambiamenti, quindi se la pagina non si muove piu'
     quel testo resterebbe invisibile per sempre. Lo stato di partenza sicuro e' visibile. */
  const soglia=innerHeight*0.92;
  groups.forEach(g=>{
    if(g.getBoundingClientRect().top < soglia) return;
    const units=unitsOf(g);
    units.forEach(([el,role])=>el.classList.add('m',role));
    g.__units=units;
    io.observe(g);
  });
})();

/* cursore-lampada: stato per oggetto, solo puntatore fine, statico con reduced-motion */
(function(){
  if(!window.matchMedia('(pointer:fine)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cur=document.createElement('div');
  cur.id='cursore'; cur.setAttribute('aria-hidden','true');
  document.body.appendChild(cur);
  document.documentElement.classList.add('cursor-on');
  let tx=innerWidth/2, ty=innerHeight/2, cx=tx, cy=ty;
  const intSel='a,button,.btn,.cs-card,[data-luce],input,textarea,label,[role="button"]';
  const txtSel='h1,h2,h3,h4,h5,p,li,blockquote,figcaption';
  addEventListener('pointermove',e=>{ tx=e.clientX; ty=e.clientY; cur.style.opacity=1; },{passive:true});
  addEventListener('pointerover',e=>{
    const t=e.target;
    if(t.closest && t.closest(intSel)){ cur.classList.add('is-int'); cur.classList.remove('is-text'); }
    else if(t.closest && t.closest(txtSel)){ cur.classList.add('is-text'); cur.classList.remove('is-int'); }
    else { cur.classList.remove('is-int','is-text'); }
  },{passive:true});
  document.addEventListener('mouseleave',()=>{ cur.style.opacity=0; });
  (function loop(){
    cx+=(tx-cx)*0.3; cy+=(ty-cy)*0.3;
    cur.style.transform='translate('+cx+'px,'+cy+'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
})();

/* magnetismo: i bottoni si muovono verso il cursore. Solo puntatore fine, statico con reduced-motion */
(function(){
  if(!window.matchMedia('(pointer:fine)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      const mx=Math.max(-2,Math.min(2,(e.clientX-(r.left+r.width/2))*0.04));
      const my=Math.max(-2,Math.min(2,(e.clientY-(r.top+r.height/2))*0.045));
      el.style.transform='translate('+mx+'px,'+my+'px)';
      el.style.setProperty('--lx',((e.clientX-r.left)/r.width*100)+'%');
      el.style.setProperty('--ly',((e.clientY-r.top)/r.height*100)+'%');
    });
    el.addEventListener('pointerleave',()=>{ el.style.transform=''; });
  });
})();

/* anno del copyright scritto dal browser: il sito non invecchia da solo */
document.querySelectorAll('[data-anno]').forEach(e=>{e.textContent=new Date().getFullYear();});
/* la barra si stringe (e sulla home prende corpo) appena si lascia la cima: sempre visibile, mai invadente */
(function(){
  const nav=document.querySelector('nav.principale');
  if(!nav) return;
  let atteso=false;
  function stato(){ atteso=false; nav.classList.toggle('ancorata', scrollY>24); }
  addEventListener('scroll',()=>{ if(!atteso){ atteso=true; requestAnimationFrame(stato); } },{passive:true});
  stato();
})();

/* ═══ INDICE ANCORATO: dove sei dentro una pagina lunga ═══
   Viveva dentro about.html. Lo usano ora anche i tre case study, e una copia
   per pagina sarebbe la stessa duplicazione appena smontata dal CSS.
   Se nella pagina non c'e' nav.indice esce subito: la home non ne ha uno.
   Le voci lette sono solo quelle dentro ul: nella barra c'e' anche lo switch
   fra i casi, che porta ad altre pagine e non e' una sezione da evidenziare. */
/* Indice: misura delle barre e voce attiva.
   Le altezze non sono costanti (la barra principale si stringe quando ci si ancora),
   quindi si misurano invece di essere scritte a mano in un valore fisso. */
(function(){
  const nav=document.querySelector('nav.principale');
  const indice=document.querySelector('nav.indice');
  if(!indice) return;
  const voci=[...indice.querySelectorAll('ul a')];
  const sezioni=voci.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const radice=document.documentElement;
  let attesa=false, attivaOra=null;

  function misura(){
    const hn=nav?nav.getBoundingClientRect().height:0;
    const hi=indice.getBoundingClientRect().height;
    /* niente arrotondamento: le altezze reali sono frazionarie e l'arrotondamento
       spostava l'indice di qualche decimo di pixel, lasciando vedere lo sfondo */
    radice.style.setProperty('--h-nav',hn.toFixed(2)+'px');
    radice.style.setProperty('--offset-ancora',Math.ceil(hn+hi+20)+'px');
    return hn+hi;
  }
  function attiva(){
    attesa=false;
    const soglia=misura()+24;
    let corrente=sezioni[0];
    sezioni.forEach(sez=>{ if(sez.getBoundingClientRect().top<=soglia) corrente=sez; });
    /* in fondo alla pagina vince l'ultima sezione, altrimenti la coda non evidenzia nulla */
    if(innerHeight+scrollY>=document.body.scrollHeight-4) corrente=sezioni[sezioni.length-1];
    if(corrente===attivaOra) return;
    attivaOra=corrente;
    voci.forEach(a=>{
      const suo=a.getAttribute('href')==='#'+corrente.id;
      if(suo){ a.setAttribute('aria-current','true'); portaInVista(a); }
      else a.removeAttribute('aria-current');
    });
  }
  /* su schermo stretto le voci scorrono: quella attiva deve restare visibile da sola */
  function portaInVista(a){
    const lista=indice.querySelector('ul');
    if(lista.scrollWidth<=lista.clientWidth+2) return;
    const b=a.getBoundingClientRect(), l=lista.getBoundingClientRect();
    if(b.left<l.left+12||b.right>l.right-12){
      lista.scrollTo({left:lista.scrollLeft+(b.left-l.left)-24,
        behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    }
  }
  addEventListener('scroll',()=>{ if(!attesa){ attesa=true; requestAnimationFrame(attiva); } },{passive:true});
  addEventListener('resize',()=>{ misura(); attiva(); },{passive:true});
  /* la barra si stringe con una transizione: quando lo scroll si ferma la transizione
     continua, e senza questo l'altezza memorizzata resta quella di prima */
  if(nav) nav.addEventListener('transitionend',misura);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{misura();attiva();});
  misura(); attiva();
})();
