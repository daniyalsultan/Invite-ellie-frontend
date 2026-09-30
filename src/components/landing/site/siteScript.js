/* Behaviour for the marketing page markup in site.html, ported from the
   standalone invite-ellie-website. Call after the markup is in the DOM; the
   returned function removes every listener and observer it added. */
export function initSite(){
  var controller=new AbortController(), signal=controller.signal;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function rng(s){return function(){s|=0;s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}

  /* Static network texture (hero, beta, final, value clusters) */
  function drawNet(svg,o){
    if(!svg)return;
    var r=rng(o.seed), w=o.w, h=o.h, pad=o.pad||0, pts=[], seen={};
    svg.setAttribute('viewBox','0 0 '+w+' '+h);
    svg.setAttribute('preserveAspectRatio',o.par||'xMidYMid slice');
    svg.innerHTML='';
    for(var i=0;i<o.n;i++){pts.push({x:pad+Math.pow(r(),o.bias||1)*(w-2*pad),y:pad+r()*(h-2*pad)});}
    var gl=el('g',{stroke:o.stroke,'stroke-width':o.sw||1,fill:'none'},svg), gn=el('g',{fill:o.fill},svg);
    pts.forEach(function(p,i){
      pts.map(function(q,j){return[Math.hypot(q.x-p.x,q.y-p.y),j];})
        .filter(function(d){return d[1]!==i&&d[0]<o.maxD;})
        .sort(function(a,b){return a[0]-b[0];}).slice(0,o.k||2)
        .forEach(function(d){var j=d[1],key=i<j?i+'-'+j:j+'-'+i;if(seen[key])return;seen[key]=1;el('line',{x1:p.x,y1:p.y,x2:pts[j].x,y2:pts[j].y},gl);});
    });
    pts.forEach(function(p){el('circle',{cx:p.x,cy:p.y,r:(o.rmin+r()*(o.rmax-o.rmin)).toFixed(2)},gn);});
  }
  drawNet(document.getElementById('heroNet'),{w:1440,h:1100,n:78,seed:5,bias:.85,maxD:190,stroke:'rgba(255,255,255,.26)',fill:'rgba(255,255,255,.6)',rmin:1.6,rmax:3.4});
  drawNet(document.getElementById('betaNet'),{w:700,h:520,n:44,seed:9,bias:.7,maxD:150,stroke:'rgba(143,239,222,.45)',fill:'#8FEFDE',rmin:1.8,rmax:3.6});
  drawNet(document.getElementById('finalNet'),{w:1440,h:760,n:70,seed:13,maxD:190,stroke:'rgba(50,122,173,.2)',fill:'rgba(50,122,173,.4)',rmin:1.6,rmax:3.2});
  document.querySelectorAll('.cluster').forEach(function(svg){
    drawNet(svg,{w:300,h:170,n:+svg.dataset.n,seed:+svg.dataset.seed,pad:14,par:'xMidYMid meet',maxD:120,k:3,stroke:'rgba(255,255,255,.55)',fill:'#fff',rmin:3,rmax:5.5,sw:1.4});
  });

  /* Nav border on scroll */
  var nav=document.getElementById('nav');

  /* Explainer video: set data-youtube on #video to a YouTube ID to enable */
  var video=document.getElementById('video');
  var cover=video.querySelector('.play-cover');
  cover.addEventListener('click',function(){
    var id=(video.dataset.youtube||'').trim();
    if(id){
      video.innerHTML='<div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0" title="Invite Ellie explainer video" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    } else {
      var l=cover.querySelector('.play-label');
      l.textContent='Explainer video coming soon';
      setTimeout(function(){l.textContent='Your agency no longer has to keep all the details straight.';},2400);
    }
  },{signal:signal});

  /* Flow diagram connectors */
  function drawFlow(){
    var flow=document.getElementById('flow'); if(!flow)return;
    var svg=flow.querySelector('.flow-lines');
    if(window.innerWidth<=980){svg.innerHTML='';return;}
    var fr=flow.getBoundingClientRect();
    function R(e){var r=e.getBoundingClientRect();return{l:r.left-fr.left,r:r.right-fr.left,t:r.top-fr.top,b:r.bottom-fr.top,cy:(r.top+r.bottom)/2-fr.top};}
    var ins=flow.querySelectorAll('.in-card'), rows=flow.querySelectorAll('.core-rows li'), outs=flow.querySelectorAll('.out-item'), core=R(flow.querySelector('.core'));
    svg.setAttribute('viewBox','0 0 '+fr.width+' '+fr.height);
    var s='<defs><linearGradient id="fgi" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="'+core.l+'" y2="0"><stop offset="0" stop-color="#7964A0" stop-opacity=".35"/><stop offset="1" stop-color="#327AAD"/></linearGradient><linearGradient id="fgo" gradientUnits="userSpaceOnUse" x1="'+core.r+'" y1="0" x2="'+fr.width+'" y2="0"><stop offset="0" stop-color="#327AAD"/><stop offset="1" stop-color="#43A18B"/></linearGradient></defs>';
    function curve(x1,y1,x2,y2,g){var c=(x2-x1)*.55;return '<path d="M'+x1+' '+y1+' C'+(x1+c)+' '+y1+' '+(x2-c)+' '+y2+' '+x2+' '+y2+'" fill="none" stroke="url(#'+g+')" stroke-width="2" stroke-linecap="round"/>';}
    for(var i=0;i<ins.length;i++){
      var a=R(ins[i]), b=R(rows[Math.min(i,rows.length-1)]);
      s+=curve(a.r+4,a.cy,core.l-1,b.cy,'fgi')+'<circle cx="'+(core.l-1)+'" cy="'+b.cy+'" r="4.5" fill="#327AAD"/>';
    }
    var mid=(core.t+core.b)/2;
    for(var j=0;j<outs.length;j++){
      var o=R(outs[j]);
      s+=curve(core.r+1,mid,o.l-10,o.cy,'fgo')+'<circle cx="'+(o.l-10)+'" cy="'+o.cy+'" r="4.5" fill="#43A18B"/>';
    }
    s+='<circle cx="'+(core.r+1)+'" cy="'+mid+'" r="5" fill="#327AAD"/>';
    svg.innerHTML=s;
  }

  /* Compounding graph, grows with scroll */
  var gEls=[], gDot=null, gMeta=null, gMob=null;
  function buildGraph(){
    var svg=document.getElementById('graph'); if(!svg)return;
    var mob=window.innerWidth<700; gMob=mob;
    var W=mob?600:1200, H=mob?720:430, px=mob?40:48, top=mob?90:74, bot=H-(mob?96:78);
    svg.setAttribute('viewBox','0 0 '+W+' '+H); svg.innerHTML=''; gEls=[];
    var r=rng(11);
    var L=mob?[['Kickoff call',.04,.62],['Scope change',.36,.18],['Mockup v3',.66,.72],['Renewal',.96,.3]]
             :[['Kickoff call',.03,.58],['First feedback',.18,.2],['Scope change',.34,.74],['Budget decision',.5,.28],['Mockup v3',.66,.7],['New hire brief',.81,.16],['Renewal',.97,.54]];
    function X(n){return px+n*(W-2*px);} function Y(n){return top+n*(bot-top);}
    var nodes=L.map(function(l){return{x:X(l[1]),y:Y(l[2]),lab:l[0],big:true};});
    var N=mob?58:92;
    for(var i=0;i<N;i++){var nx=Math.pow(r(),.6);nodes.push({x:X(nx),y:Y(.02+r()*.96)});}
    var edges={}, maxD=mob?165:165;
    function key(a,b){return a<b?a+'-'+b:b+'-'+a;}
    nodes.forEach(function(n,i){
      nodes.map(function(m,j){return[Math.hypot(m.x-n.x,m.y-n.y),j];}).filter(function(d){return d[1]!==i;})
        .sort(function(a,b){return a[0]-b[0];}).slice(0,n.big?3:2)
        .forEach(function(d){if(d[0]<maxD)edges[key(i,d[1])]=1;});
    });
    for(var c=0;c<L.length-1;c++)edges[key(c,c+1)]=2;
    var fs=mob?21:14;
    var ax=el('g',{},svg);
    el('line',{x1:px,y1:H-30,x2:W-px,y2:H-30,stroke:'rgba(255,255,255,.3)','stroke-width':mob?2:1.5},ax);
    var t1=el('text',{x:px,y:H-4,fill:'rgba(255,255,255,.82)','font-size':fs,'font-family':'DM Sans, sans-serif'},ax); t1.textContent='Day one';
    var t2=el('text',{x:W-px,y:H-4,fill:'rgba(255,255,255,.82)','font-size':fs,'text-anchor':'end','font-family':'DM Sans, sans-serif'},ax); t2.textContent='Everything since';
    gDot=el('circle',{cx:px,cy:H-30,r:mob?9:6.5,fill:'#8FEFDE'},ax);
    var gl=el('g',{},svg), gn=el('g',{},svg), glb=el('g',{},svg);
    function tOf(x){return (x-px)/(W-2*px);}
    Object.keys(edges).forEach(function(k){
      var p=k.split('-'), A=nodes[+p[0]], B=nodes[+p[1]], main=edges[k]===2;
      var e=el('line',{x1:A.x.toFixed(1),y1:A.y.toFixed(1),x2:B.x.toFixed(1),y2:B.y.toFixed(1),stroke:main?'rgba(143,239,222,.9)':'rgba(255,255,255,.26)','stroke-width':main?(mob?3:2.2):(mob?1.6:1.1),'class':'g-el'},gl);
      e._t=tOf(Math.max(A.x,B.x)); gEls.push(e);
    });
    nodes.forEach(function(n){
      var t=tOf(n.x);
      var rad=n.big?(mob?11:8):(2+t*3.4)*(mob?1.45:1);
      var cEl=el('circle',{cx:n.x.toFixed(1),cy:n.y.toFixed(1),r:rad.toFixed(2),fill:n.big?'#8FEFDE':'#fff','fill-opacity':n.big?1:(.5+t*.45).toFixed(2),stroke:n.big?'#fff':'none','stroke-width':n.big?(mob?3.5:2.5):0,'class':'g-el g-node'},gn);
      cEl._t=t; gEls.push(cEl);
      if(n.lab){
        var w=n.lab.length*fs*.56+28, h=fs+18, lx=Math.max(4,Math.min(W-w-4,n.x-w/2)), ly=n.y-h-16;
        var g=el('g',{'class':'g-el'},glb);
        el('rect',{x:lx.toFixed(1),y:ly.toFixed(1),width:w.toFixed(1),height:h,rx:h/2,fill:'#fff'},g);
        var tx=el('text',{x:(lx+w/2).toFixed(1),y:(ly+h/2+fs*.35).toFixed(1),'text-anchor':'middle',fill:'#222F61','font-size':fs,'font-weight':600,'font-family':'DM Sans, sans-serif'},g);
        tx.textContent=n.lab; g._t=t; gEls.push(g);
      }
    });
    gMeta={W:W,px:px};
    updateGraph();
  }
  function updateGraph(){
    if(!gEls.length)return;
    var svg=document.getElementById('graph'), p=1;
    if(!RM){var rc=svg.getBoundingClientRect(), vh=window.innerHeight; p=(vh*.92-rc.top)/(vh*.62); p=Math.max(0,Math.min(1,p));}
    for(var i=0;i<gEls.length;i++){gEls[i].classList.toggle('on',p>=gEls[i]._t-0.002);}
    gDot.setAttribute('cx',(gMeta.px+p*(gMeta.W-2*gMeta.px)).toFixed(1));
  }

  /* Team moments demo */
  var M=[
    {q:"I'm new on Cinderwood Brewing. What do I need to know first?",a:"Launch is set for April, tied to their financial year. The founder wants the copper accents kept. Priya owes three label concepts by Sep 4, and legal still has to clear the ABV claims before print.",s:["Kickoff call","Aug 14 review","Aug 21 follow-up"]},
    {q:"What was Sam handling on Lumora Health before he left?",a:"Sam owned the patient portal copy and the weekly check-in with their marketing lead. Two commitments are still open: the revised FAQ due Oct 2 and the accessibility summary.",s:["Portal kickoff","Sep 3 check-in","Sep 10 check-in"]},
    {q:"Why did we drop the video series for Northwind Trading?",a:"On Jun 12 the client cut their Q3 budget by a third. On the Jul 3 call they chose paid search over video, and they confirmed the change on the Jul 10 check-in.",s:["Jun 12 budget call","Jul 3 planning","Jul 10 check-in"]},
    {q:"Where did we leave the New Jack Toy Corp packaging project?",a:"Paused in March after round two. The client picked concept B, asked for a softer yellow, and wanted retail shelf mockups before restarting. Nothing is open on our side.",s:["Mar 2 review","Mar 9 wrap-up"]},
    {q:"I'm covering Marlowe &amp; Finch this week. What's live?",a:"One open item: they need the on-premise pricing summary before Friday. Their IT team is running a network test first. Don't promise a rollout date, since April is their hard stop for new contracts.",s:["Aug 13 discovery call","Aug 21 follow-up"]}
  ];
  var tabs=[].slice.call(document.querySelectorAll('.m-tab')), panel=document.getElementById('m-panel'), list=document.querySelector('.m-list'), body=panel.querySelector('.md-body'), cur=0, auto=!RM;
  function show(i,user){
    cur=i;
    tabs.forEach(function(t,j){t.setAttribute('aria-selected',j===i?'true':'false');t.tabIndex=j===i?0:-1;});
    panel.setAttribute('aria-labelledby','mt'+i);
    var d=M[i];
    body.innerHTML='<div class="md-q">'+d.q+'</div><div class="md-a"><span class="mark" aria-hidden="true"></span><div><p>'+d.a+'</p><div class="srcs"><span class="srcs-l">From</span>'+d.s.map(function(x){return '<span>'+x+'</span>';}).join('')+'</div></div></div>';
    if(!RM){body.classList.remove('swap');void body.offsetWidth;body.classList.add('swap');}
    if(user){auto=false;list.classList.remove('auto');if(window.innerWidth<=900)panel.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});}
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(i,true);},{signal:signal});
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')n=(i+1)%tabs.length;
      if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;
      if(n!==null){e.preventDefault();tabs[n].focus();show(n,true);}
    },{signal:signal});
    t.querySelector('.m-bar').addEventListener('animationend',function(){if(auto)show((cur+1)%tabs.length,false);},{signal:signal});
  });
  if(auto&&'IntersectionObserver' in window){
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(auto)list.classList.toggle('auto',e.isIntersecting);});},{threshold:.4}).observe(list);
  }

  /* Wiring */
  var ticking=false, io=null;
  window.addEventListener('scroll',function(){
    if(ticking)return; ticking=true;
    requestAnimationFrame(function(){if(signal.aborted)return;nav.classList.toggle('scrolled',window.scrollY>8);updateGraph();ticking=false;});
  },{passive:true,signal:signal});
  var rt;
  window.addEventListener('resize',function(){
    clearTimeout(rt);
    rt=setTimeout(function(){drawFlow();if((window.innerWidth<700)!==gMob)buildGraph();else updateGraph();},120);
  },{signal:signal});
  buildGraph();
  drawFlow();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(!signal.aborted)drawFlow();});
  window.addEventListener('load',drawFlow,{signal:signal});

  return function(){
    controller.abort();
    clearTimeout(rt);
    if(io)io.disconnect();
  };
}
