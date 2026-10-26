/* ================= AUDIO ENGINE ================= */
let audioCtx = null;
let muted=false;
function ensureAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } }
function beep(freq=440,dur=0.08,type='square',vol=0.08){
  if(muted||!audioCtx) return;
  const o=audioCtx.createOscillator(); const g=audioCtx.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(vol,audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+dur);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime+dur);
}
const SFX={
  blip:()=>beep(660,.06,'square',.06),
  select:()=>{beep(523,.06,'square',.08);setTimeout(()=>beep(784,.08,'square',.08),60)},
  pop:()=>{beep(880,.05,'triangle',.08);setTimeout(()=>beep(1100,.06,'triangle',.08),50)},
};

/* ================= LOADER ================= */
(function(){
  const fill=document.getElementById('loaderFill');
  const text=document.getElementById('loaderText');
  const loader=document.getElementById('loader');
  const steps=['BOOTING...','LOADING ASSETS...','INIT AUDIO...','SPAWNING PIXELS...','READY!'];
  let p=0;
  const iv=setInterval(()=>{
    p+=Math.random()*18+6;
    if(p>100) p=100;
    fill.style.width=p+'%';
    text.textContent=steps[Math.min(steps.length-1,Math.floor(p/22))];
    if(p>=100){
      clearInterval(iv);
      setTimeout(()=>{loader.style.transition='opacity .4s';loader.style.opacity='0';setTimeout(()=>loader.remove(),400);},300);
    }
  },120);
})();

/* ================= STARS ================= */
(function(){
  const c=document.getElementById('stars');
  const ctx=c.getContext('2d');
  let stars=[];
  function resize(){ c.width=innerWidth; c.height=innerHeight; }
  function init(){
    stars=[];
    const n=Math.floor((c.width*c.height)/9000);
    for(let i=0;i<n;i++){
      stars.push({x:Math.random()*c.width,y:Math.random()*c.height,s:Math.random()<.3?2:1,speed:Math.random()*.4+.1,tw:Math.random()*Math.PI*2});
    }
  }
  let mx=c.width/2, my=c.height/2;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
  function loop(){
    ctx.fillStyle='#0a0a1a'; ctx.fillRect(0,0,c.width,c.height);
    const ox=(mx-c.width/2)*0.04;
    const oy=(my-c.height/2)*0.04;
    for(const s of stars){
      s.tw+=.05; s.y+=s.speed;
      if(s.y>c.height){s.y=0;s.x=Math.random()*c.width;}
      const a=.4+Math.sin(s.tw)*.4;
      ctx.fillStyle=`rgba(230,230,255,${a})`;
      ctx.fillRect(Math.floor(s.x+ox),Math.floor(s.y+oy),s.s,s.s);
    }
    requestAnimationFrame(loop);
  }
  resize();init();loop();
  addEventListener('resize',()=>{resize();init();});
})();

/* ================= CURSOR ================= */
(function(){
  const cur=document.getElementById('cursor');
  addEventListener('mousemove',e=>{cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';});
  addEventListener('mousedown',()=>{cur.classList.add('click');SFX.blip();});
  addEventListener('mouseup',()=>cur.classList.remove('click'));
})();

/* ================= RIPPLE ON CLICK ================= */
addEventListener('click',e=>{
  const r=document.createElement('div');
  r.className='ripple';
  r.style.left=e.clientX+'px';
  r.style.top=e.clientY+'px';
  r.style.width=r.style.height='20px';
  document.body.appendChild(r);
  setTimeout(()=>r.remove(),600);
});

/* ================= SCROLL PROGRESS ================= */
(function(){
  const bar=document.getElementById('progress');
  function upd(){
    const h=document.documentElement;
    const pct=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100;
    bar.style.width=(isNaN(pct)?0:pct)+'%';
  }
  addEventListener('scroll',upd); upd();
})();

/* ================= TYPED TEXT ================= */
(function(){
  const el=document.getElementById('typed');
  const lines=['> FULL-STACK DEVELOPER','> PIXEL ARTIST','> GAME MAKER','> OPEN FOR PROJECTS'];
  let li=0,ci=0,del=false;
  function tick(){
    const cur=lines[li];
    if(!del){
      el.textContent=cur.slice(0,ci+1); ci++;
      if(ci===cur.length){del=true;setTimeout(tick,1400);return;}
    }else{
      el.textContent=cur.slice(0,ci-1); ci--;
      if(ci===0){del=false;li=(li+1)%lines.length;}
    }
    setTimeout(tick,del?40:70);
  }
  tick();
})();

/* ================= DIALOGUE ROTATION ================= */
(function(){
  const lines=[
    '"Halo! Selamat datang di portfolio ku. Ayo jelajahi!"',
    '"Lihat project-project di bawah!"',
    '"Kirim pesan lewat form contact, aku bales!"'
  ];
  const el=document.getElementById('dialogue');
  let i=0;
  setInterval(()=>{ i=(i+1)%lines.length; el.style.opacity=0; setTimeout(()=>{el.textContent=lines[i];el.style.opacity=1;},200);},4000);
})();

/* ================= SFX BINDING ================= */
document.addEventListener('click',e=>{
  ensureAudio();
  const t=e.target.closest('[data-sfx]');
  if(t) SFX[t.dataset.sfx]?.();
},true);
document.querySelectorAll('.hud-nav a,.item,.project,.logo-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ensureAudio();SFX.blip();});
});

/* ================= SKILL BARS ================= */
(function(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        const skill=en.target; const v=skill.dataset.val;
        skill.querySelector('.fill').style.width=v+'%';
        obs.unobserve(skill);
      }
    });
  },{threshold:.3});
  document.querySelectorAll('.skill').forEach(s=>obs.observe(s));
  // click to "level up" flash
  document.querySelectorAll('.skill').forEach(s=>{
    s.addEventListener('click',()=>{ ensureAudio(); SFX.pop(); s.querySelector('.fill').style.filter='brightness(1.8)'; setTimeout(()=>s.querySelector('.fill').style.filter='',200); });
  });
})();

/* ================= AVATAR PIXEL ART ================= */
(function(){
  const c=document.getElementById('avatar');
  const ctx=c.getContext('2d');
  const grid=[
    "......GGGG......",
    ".....GGGGGG.....",
    "....GGGGGGGG....",
    "...GGWWWWWWGG...",
    "..GWWBBBBBBWWG..",
    "..GWWBBWWBBWWG..",
    "..GWWBBBBBBWWG..",
    "..GWWWWWWWWWWG..",
    "...GGGGGGGGGG...",
    "..GGRRRRRRRRGG..",
    "..GRRRRRRRRRRG..",
    "..GRRRRRRRRRRG..",
    "...GGRRRRRRGG...",
    "....GGGGGGGG....",
    "...GG......GG...",
    "..GG........GG..",
  ];
  const colors={'G':'#39ff14','W':'#e6e6ff','B':'#0a0a1a','R':'#ff2bd6'};
  const scale=10;
  let bob=0;
  function draw(){
    ctx.fillStyle='#0a0a1a'; ctx.fillRect(0,0,160,160);
    const offY=Math.round(Math.sin(bob)*2);
    for(let y=0;y<grid.length;y++){
      for(let x=0;x<grid[y].length;x++){
        const ch=grid[y][x];
        if(colors[ch]){
          ctx.fillStyle=colors[ch];
          ctx.fillRect(x*scale,(y+offY)*scale,scale,scale);
        }
      }
    }
    bob+=0.08;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ================= CONTACT FORM ================= */
(function(){
  const form=document.getElementById('contactForm');
  const msg=document.getElementById('formMsg');
  if(!form) return;
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const name=form.name.value.trim();
    const email=form.email.value.trim();
    const message=form.message.value.trim();
    if(msg) msg.textContent='> SENDING...';
    try{
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,message})});
      const j=await r.json();
      if(!j.ok){ if(msg) msg.textContent='> ERROR: '+(j.error||'gagal'); return; }
      if(msg) msg.textContent='> MESSAGE SENT, '+name.toUpperCase()+'!';
      form.reset();
      setTimeout(()=>{ if(msg) msg.textContent=''; },4000);
    }catch(err){
      if(msg) msg.textContent='> NETWORK ERROR';
    }
  });
})();

/* ================= SOUND TOGGLE ================= */
(function(){
  const btn=document.getElementById('soundToggle');
  btn.addEventListener('click',()=>{ muted=!muted; btn.textContent=muted?'🔇':'🔊'; ensureAudio(); if(!muted) SFX.blip(); });
})();

/* ================= TOAST ================= */
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),2400);
}

/* ================= PROJECT MODAL ================= */
(function(){
  const modal=document.getElementById('modal');
  const title=document.getElementById('modalTitle');
  const desc=document.getElementById('modalDesc');
  const tags=document.getElementById('modalTags');
  const close=document.getElementById('modalClose');
  document.querySelectorAll('.project').forEach(card=>{
    card.addEventListener('click',e=>{
      title.textContent=card.dataset.title;
      desc.textContent=card.dataset.desc;
      tags.innerHTML=card.dataset.tags.split(',').map(t=>'<span>'+t+'</span>').join('');
      modal.classList.remove('hidden');
      ensureAudio(); SFX.pop();
    });
  });
  document.querySelectorAll('.proj-link').forEach(b=>{
    b.addEventListener('click',e=>{
      e.stopPropagation();
      const card=b.closest('.project');
      title.textContent=card.dataset.title;
      desc.textContent=card.dataset.desc;
      tags.innerHTML=card.dataset.tags.split(',').map(t=>'<span>'+t+'</span>').join('');
      modal.classList.remove('hidden');
      ensureAudio(); SFX.select();
    });
  });
  close.addEventListener('click',()=>modal.classList.add('hidden'));
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.add('hidden'); });
})();

/* ================= 3D TILT ON PROJECTS ================= */
document.querySelectorAll('.project').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=e.clientX-r.left, y=e.clientY-r.top;
    const rx=(y-r.height/2)/12, ry=(r.width/2-x)/12;
    card.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translate(-3px,-3px)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='';});
});

/* ================= LOGO HOVER SOUND already bound ================= */
