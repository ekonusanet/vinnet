(function(){
  'use strict';
  var topbar=document.getElementById('topbar'),links=Array.from(document.querySelectorAll('.dock a'));
  var anchors=links.map(function(a){return document.querySelector(a.getAttribute('href'));}),scrollQueued=false;
  function navigation(){
    topbar.classList.toggle('scrolled',window.scrollY>35);
    var current=0;anchors.forEach(function(section,i){if(section.getBoundingClientRect().top<window.innerHeight*.45)current=i;});
    links.forEach(function(a,i){if(i===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    scrollQueued=false;
  }
  window.addEventListener('scroll',function(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(navigation);}},{passive:true});navigation();
  document.getElementById('year').textContent=new Date().getFullYear();
  document.getElementById('load-map').addEventListener('click',function(){
    var iframe=document.createElement('iframe');iframe.title='Titik lokasi VINNET di Google Maps';iframe.src='https://www.google.com/maps?q=-6.812257693173537,111.77959418094188&hl=id&z=16&output=embed';iframe.referrerPolicy='no-referrer-when-downgrade';iframe.setAttribute('allowfullscreen','');
    document.getElementById('map').replaceChildren(iframe);iframe.tabIndex=0;iframe.focus();
  });
  /* One bounded canvas projects a 3D surface. No external fonts, media or WebGL. */
  var canvas=document.getElementById('data-scene'),ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
  var button=document.getElementById('motion'),media=window.matchMedia('(prefers-reduced-motion: reduce)');
  var width=0,height=0,mobile=false,points=[],raf=0,last=0,time=0,paused=media.matches,visible=true;
  var phase=0,target=0,mouseX=0,mouseY=0;
  var hero=document.getElementById('beranda'),story=document.getElementById('koneksi'),closing=document.getElementById('kontak');
  var heroHeight=0,storyTop=0,storyHeight=0,closeTop=0,closeHeight=0;
  function seed(n){var v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);}
  function resize(){
    width=window.innerWidth;height=window.innerHeight;mobile=width<650;
    var dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    heroHeight=hero.offsetHeight;storyTop=story.offsetTop;storyHeight=story.offsetHeight;closeTop=closing.offsetTop;closeHeight=closing.offsetHeight;
    points=[];var count=mobile?1800:6200;
    for(var i=0;i<count;i++){var u=seed(i+1)*Math.PI*2,v=seed(i+4001)*Math.PI*2;points.push({u:u,v:v,cu:Math.cos(u),su:Math.sin(u),cv:Math.cos(v),sv:Math.sin(v),r:seed(i+99),size:seed(i+881),gold:seed(i+171)>.79});}
    scenePosition();draw();
  }
  function scenePosition(){
    var y=window.scrollY;
    target=Math.max(0,Math.min(1,(y-storyTop+height*.95)/(height*.8)));
    var inHero=y<heroHeight+height*.1,inStory=y<storyTop+storyHeight&&y+height>storyTop;
    var inClosing=y+height>closeTop&&y<closeTop+closeHeight;
    visible=inHero||inStory||inClosing;
    if(inClosing){target=2;canvas.style.opacity=String(Math.min(.5,Math.max(0,(y+height-closeTop)/(height*.65))));}
    else canvas.style.opacity=String(inHero?1:.82);
  }
  function draw(){
    ctx.clearRect(0,0,width,height);if(!visible)return;
    var t=paused?1.25:time;
    var a=t*.12,ca=Math.cos(a),sa=Math.sin(a),tilt=-.28+mouseY*.04,ct=Math.cos(tilt),st=Math.sin(tilt);
    var morph=Math.max(0,Math.min(1,phase)),orbit=Math.max(0,Math.min(1,phase-1));
    var scale=mobile?width*.7:Math.min(width*.36,height*.55);
    var centerX=width*(.53+morph*.18-orbit*.21)+mouseX*9,centerY=height*(mobile?.39:.43)+morph*height*.05;
    var halo=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,scale*1.15);halo.addColorStop(0,'rgba(36,100,185,.10)');halo.addColorStop(.6,'rgba(31,90,150,.035)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
    if(morph>.4){var beam=ctx.createLinearGradient(centerX-95,0,centerX+95,0);beam.addColorStop(0,'rgba(84,143,255,0)');beam.addColorStop(.48,'rgba(84,143,255,'+(.13*morph).toFixed(2)+')');beam.addColorStop(.5,'rgba(244,213,72,'+(.16*morph).toFixed(2)+')');beam.addColorStop(.52,'rgba(84,143,255,'+(.13*morph).toFixed(2)+')');beam.addColorStop(1,'rgba(84,143,255,0)');ctx.fillStyle=beam;ctx.fillRect(centerX-95,0,190,height);}
    var pulse=(t*.18)%1;
    for(var i=0;i<points.length;i++){
      var p=points[i],twist=p.v+Math.sin(p.u*3+t*.3)*.22;
      var ring=.73+.23*Math.cos(twist),tx=ring*p.cu*1.25,ty=.23*Math.sin(twist)+Math.sin(p.u*2+t*.32)*.13,tz=ring*p.su*.65;
      var z=p.r*2-1,angle=p.u+t*.12,spread=.018+.29*Math.pow(Math.abs(z),4);
      var bx=Math.cos(angle)*spread,by=z*1.3,bz=Math.sin(angle)*spread;
      var ox=(.7+.15*p.cv)*p.cu,oy=(.7+.15*p.cv)*p.su,oz=p.sv*.15;
      var x=tx*(1-morph)+bx*morph,y=ty*(1-morph)+by*morph,zp=tz*(1-morph)+bz*morph;
      x=x*(1-orbit)+ox*orbit;y=y*(1-orbit)+oy*orbit;zp=zp*(1-orbit)+oz*orbit;
      var rx=x*ca-zp*sa,rz=x*sa+zp*ca,ry=y*ct-rz*st;rz=y*st+rz*ct;
      var perspective=2.7/(2.7+rz),px=centerX+rx*scale*perspective,py=centerY+ry*scale*perspective;
      var intensity=.3+.6*((rz+1.2)/2.4),wave=Math.abs(p.u/(Math.PI*2)-pulse);if(wave<.045)intensity=Math.min(1,intensity+.4);
      var size=(.6+p.size*.85)*perspective*(mobile?.85:1);
      ctx.fillStyle=p.gold?'rgba(244,213,72,'+intensity.toFixed(2)+')':'rgba(102,163,255,'+intensity.toFixed(2)+')';ctx.fillRect(px,py,size,size);
    }
    if(morph<.7){ctx.lineWidth=.65;for(var j=0;j<3;j++){ctx.beginPath();for(var k=0;k<=100;k++){var u=k/100*Math.PI*2,rad=.73+.23*Math.cos(u*2+j*1.8+t*.12),x=rad*Math.cos(u)*1.25,y=.2*Math.sin(u*2+j*1.8),z=rad*Math.sin(u)*.65,rx=x*ca-z*sa,rz=x*sa+z*ca,ry=y*ct-rz*st,pr=2.7/(2.7+rz),px=centerX+rx*scale*pr,py=centerY+ry*scale*pr;if(!k)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.strokeStyle=j===1?'rgba(244,213,72,.16)':'rgba(84,143,255,.18)';ctx.stroke();}}
  }
  function tick(now){raf=0;if(paused||document.hidden)return;if(now-last>32){var delta=last?Math.min((now-last)/1000,.07):.033;last=now;if(visible){time+=delta;phase+=(target-phase)*.055;draw();}}raf=requestAnimationFrame(tick);}
  function start(){if(!raf&&!paused&&!document.hidden){last=0;raf=requestAnimationFrame(tick);}}
  function updateButton(){button.hidden=false;button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Putar animasi partikel':'Jeda animasi partikel');button.querySelector('use').setAttribute('href',paused?'#play':'#pause');button.querySelector('span').textContent=paused?'Putar animasi':'Jeda animasi';}
  button.addEventListener('click',function(){paused=!paused;updateButton();if(paused){cancelAnimationFrame(raf);raf=0;draw();}else start();});
  media.addEventListener('change',function(e){paused=e.matches;updateButton();if(paused){cancelAnimationFrame(raf);raf=0;draw();}else start();});
  var resizeQueued=false;window.addEventListener('resize',function(){if(!resizeQueued){resizeQueued=true;requestAnimationFrame(function(){resizeQueued=false;resize();});}},{passive:true});
  window.addEventListener('scroll',function(){scenePosition();if(paused){phase=target;draw();}},{passive:true});
  window.addEventListener('pointermove',function(e){if(e.pointerType==='mouse'&&!paused){mouseX=e.clientX/width-.5;mouseY=e.clientY/height-.5;}},{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  resize();updateButton();start();
})();
