const menu=document.getElementById('menu');
const burger=document.getElementById('burger');
const setMenu=o=>{menu.classList.toggle('open',o);burger.textContent=o?'✕':'☰';burger.setAttribute('aria-expanded',o)};
burger.onclick=()=>setMenu(!menu.classList.contains('open'));
menu.querySelectorAll('a').forEach(a=>a.onclick=()=>setMenu(false));
document.addEventListener('click',e=>{if(!e.target.closest('header'))setMenu(false)});
addEventListener('resize',()=>{if(innerWidth>=992)setMenu(false)});
document.getElementById('yr').textContent=new Date().getFullYear();

const D={
 vata:['Vata · Air & Space','Creative, quick and energetic. When out of balance: dry skin, joint pain, anxiety, irregular digestion.','Balance with: warm oil massage, regular routine, warm cooked food.'],
 pitta:['Pitta · Fire & Water','Sharp, focused and driven. When out of balance: acidity, skin rashes, anger, excess heat in the body.','Balance with: cooling foods, calm routine, avoiding spicy and fried food.'],
 kapha:['Kapha · Earth & Water','Calm, steady and strong. When out of balance: weight gain, congestion, sluggishness, heaviness.','Balance with: daily exercise, light warm meals, stimulating routine.']
};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('on'));
 b.classList.add('on');
 const d=D[b.dataset.d];
 dt.textContent=d[0];dp.textContent=d[1];dh.textContent=d[2];
});

const io=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('show');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

document.getElementById('form').onsubmit=e=>{
 e.preventDefault();
 const f=v=>encodeURIComponent(document.getElementById(v).value);
 window.open('https://wa.me/918852887717?text='+`Hello Charak Ayurveda%0AName: ${f('name')}%0APhone: ${f('phone')}%0AConcern: ${f('concern')}%0AMessage: ${f('msg')}`,'_blank');
};

const items=[...document.querySelectorAll('.g')],moreBtn=document.getElementById('gmore'),LIMIT=8;
let filter='all',showAll=false,vis=[],cur=0;

function render(){
 let n=0;vis=[];
 items.forEach(f=>{
  const ok=filter==='all'||f.dataset.cat===filter;
  const show=ok&&(showAll||n<LIMIT);
  if(ok)n++;
  f.classList.toggle('hide',!show);
  if(show)vis.push(f);
 });
 moreBtn.style.display=(!showAll&&n>LIMIT)?'inline-flex':'none';
}
document.querySelectorAll('#gtabs button').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('#gtabs button').forEach(x=>x.classList.remove('on'));
 b.classList.add('on');filter=b.dataset.f;showAll=false;render();
});
moreBtn.onclick=()=>{showAll=true;render()};
render();

/* lightbox */
const lb=document.getElementById('lb'),lbi=document.getElementById('lbi');
const show=i=>{cur=(i+vis.length)%vis.length;const im=vis[cur].querySelector('img');lbi.src=im.src;lbi.alt=im.alt;lb.classList.add('open')};
items.forEach(f=>f.onclick=()=>show(vis.indexOf(f)));
document.getElementById('lbx').onclick=()=>lb.classList.remove('open');
document.getElementById('lbp').onclick=()=>show(cur-1);
document.getElementById('lbn').onclick=()=>show(cur+1);
lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};
addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;
 if(e.key==='Escape')lb.classList.remove('open');
 if(e.key==='ArrowLeft')show(cur-1);
 if(e.key==='ArrowRight')show(cur+1)});