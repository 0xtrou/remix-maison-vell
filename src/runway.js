const MODELS='https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261102_042056_1a704ff7-b0e5-4a9f-bbda-62392b819fb6.png&w=3840&q=85';
const PIECES='https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261102_042057_080e85b0-b4aa-4072-8eb9-2304c7baf42b.png&w=2400&q=85';
// each model's box on the 960 x 540 sheet (x0, x1) and the pieces it wears (indexes into ITEMS)
const LOOKS=[
  {x:[12,176],wear:[0,1]},{x:[178,330],wear:[2,3]},{x:[331,470],wear:[4,5]},
  {x:[476,633],wear:[6,7]},{x:[634,767],wear:[8,9]},{x:[767,956],wear:[10,11]}],Y0=48,Y1=496,FIRST=15;
// each piece's box on the 960 x 720 sheet: x0, x1, y0, y1, name, price
const ITEMS=[
  [26,224,28,214,'Feather Jacket','$2,900'],[304,412,22,236,'Satin Wide Leg Trousers','$1,450'],
  [530,666,12,242,'Pleated Dress','$2,200'],[752,922,100,146,'Gold Waist Belt','$420'],
  [70,176,246,466,'Satin Trench Dress','$2,350'],[294,422,294,432,'Top Handle Bag','$980'],
  [508,688,240,452,'Billow Sleeve Blouse','$860'],[780,890,252,466,'Tie Waist Trousers','$740'],
  [64,178,484,698,'Powder Long Coat','$1,980'],[316,396,482,698,'Ivory Straight Trousers','$690'],
  [530,672,508,682,'Sculpted Ruffle Top','$1,120'],[754,916,484,700,'Pleated Maxi Skirt','$1,340']];
// depth stops from d = -1 (leaving past the rail) to d = 5 (arriving out of the haze)
const KX=[1.2,.744,.496,.346,.235,.15,.085],KF=[1.14,.89,.777,.704,.651,.616,.59],KH=[1.18,.832,.574,.436,.334,.258,.19],
      KB=[0,0,4,7,10,13,17],KO=[1,1,.8,.75,.7,.45,0];
const N=LOOKS.length,$=id=>document.getElementById(id),calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const stage=$('stage'),rail=$('rail'),ring=$('ring'),roll=$('roll'),line=$('line');
const NS='http://www.w3.org/2000/svg',wrap=(x,n)=>((x%n)+n)%n;
function crop(href,x0,y0,w,h,sheetW,sheetH){
  const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox',`${x0} ${y0} ${w} ${h}`);s.setAttribute('aria-hidden','true');
  const f=document.createElementNS(NS,'svg');[['x',x0],['y',y0],['width',w],['height',h],['viewBox',`${x0} ${y0} ${w} ${h}`]].forEach(([k,v])=>f.setAttribute(k,v));
  const i=document.createElementNS(NS,'image');i.setAttribute('href',href);i.setAttribute('width',sheetW);i.setAttribute('height',sheetH);f.append(i);s.append(f);return s;
}
const people=LOOKS.map(({x:[a,b]},i)=>{
  const e=document.createElement('div');e.className='m';e.dataset.i=i;e.append(crop(MODELS,a,Y0,b-a,Y1-Y0,960,540));line.append(e);
  return{e,r:(b-a)/(Y1-Y0),f:'',o:''};
});
// the rail lists pieces look by look; START[i] is where look i begins, in cards
const ORDER=LOOKS.flatMap(l=>l.wear),START=[0];LOOKS.forEach((l,i)=>START.push(START[i]+l.wear.length));
const cards=ORDER.map(n=>ITEMS[n]).map(([a,b,c,d,name,price],i)=>{
  const e=document.createElement('article');e.className='card'+(i%2?' alt':'');
  e.innerHTML=`<button class="fav" aria-pressed="false" aria-label="Save ${name}"><svg viewBox="0 0 24 24"><path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.600 4.600 0 0 1 20.500 9C20.500 15 12 20 12 20Z"/></svg></button><span class="shot"></span><div class="meta"><h3 class="wide">${name}</h3><span>${price}</span><button class="add" aria-label="Add ${name} to cart"></button></div>`;
  e.querySelector('.shot').append(crop(PIECES,a,c,b-a,d-c,960,720));rail.append(e);return e;
});
for(let i=0;i<=N;i++){const b=document.createElement('b');b.textContent=FIRST+i%N;roll.append(b)}
const LOOK_OF=LOOKS.flatMap((l,i)=>l.wear.map(()=>i));
let cart=0,hiT=0;
rail.addEventListener('click',e=>{
  const f=e.target.closest('.fav');if(f)f.setAttribute('aria-pressed',f.getAttribute('aria-pressed')!=='true');
  if(e.target.closest('.add'))$('cart').textContent=++cart;
});
$('shop').addEventListener('click',e=>{
  e.preventDefault();poke();target=Math.round(target);const k=wrap(target,N);
  cards.forEach((c,j)=>c.classList.toggle('hi',LOOK_OF[j]===k));
  clearTimeout(hiT);hiT=setTimeout(()=>cards.forEach(c=>c.classList.remove('hi')),1600);
});

// layout: 'line' walks out of the haze, 'arc' turns on a carousel; mode eases between the two.
// The router in main.tsx owns both settings (they live in the URL) and pushes them in here.
let layout='line',mode=0,auto=false,placed=false;
/** @param {'line'|'arc'} l */
export function setLayout(l){
  layout=l;
  // the first call places the runway in its layout without animating the switch
  if(!placed){placed=true;mode=l==='arc'?1:0;dirty=true}
}
/** @param {boolean} a */
export function setAuto(a){auto=a&&!calm}
export{calm};

let W=0,H=0,base=0,cardS=0,side=false,dirty=true,p=0,target=0,last=0,par=0,parT=0,lastInput=0,lastStep=0;
const AUTO_EVERY=4200,AUTO_IDLE=6000;
export function poke(){lastInput=performance.now()}
function size(){
  W=stage.clientWidth;H=stage.clientHeight;base=H*1.2;side=innerWidth<=820;
  people.forEach(m=>{m.e.style.width=base*m.r+'px';m.e.style.height=base+'px'});
  cardS=side?160:rail.clientHeight/3;
  cards.forEach(c=>c.style.height=side?'100%':cardS+'px');
  roll.style.setProperty('--h',roll.firstChild.getBoundingClientRect().height);
  dirty=true;
}
addEventListener('resize',size);

// x and foot are fractions of the stage width and height, h of its height, b is blur in px
function lineAt(i){
  let d=wrap(i-p,N);if(d>N-1)d-=N;
  const k=clamp(d+1,0,6),a=Math.floor(k),b=Math.min(6,a+1),t=k-a,mix=A=>A[a]+(A[b]-A[a])*t;
  return{x:mix(KX),f:mix(KF),h:mix(KH),b:mix(KB),o:mix(KO),z:d};
}
function arcAt(i){
  let d=wrap(i-p,N);if(d>N/2)d-=N;
  // only the front look is sharp: anything one step off is already well blurred and dimmed
  const a=d*.52,z=1-Math.cos(a),off=clamp(Math.abs(d),0,1);
  // on phones the front look stays clear of the look number at the bottom
  return{x:.5+Math.sin(a)*.34,f:(side?.8:.92)-z*.1,h:(side?.66:.8)-z*.24,b:off*6+z*10,o:clamp((2.9-Math.abs(d))/.9,0,1)*(1-off*.3),z:Math.abs(d)};
}
const ease=t=>t*t*(3-2*t);
function paint(){
  const e=ease(mode),mx2=(u,v)=>u+(v-u)*e;
  people.forEach((m,i)=>{
    const L=lineAt(i),A=arcAt(i);
    const h=mx2(L.h,A.h)*H,s=h/base,w=h*m.r,x=mx2(L.x,A.x)*W-w/2-par*W*.05*(h/H),y=mx2(L.f,A.f)*H-h;
    m.e.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
    const f=mx2(L.b,A.b)/s,fs=f<.2?'none':`blur(${f.toFixed(1)}px)`,o=mx2(L.o,A.o).toFixed(3);
    if(fs!==m.f){m.f=fs;m.e.style.filter=fs}
    if(o!==m.o){m.o=o;m.e.style.opacity=o}
    m.e.style.zIndex=100-Math.round((e<.5?L.z:A.z)*10);
  });
  const all=cardS*cards.length,w=wrap(p,N),a=Math.floor(w),q=(START[a]+(START[a+1]-START[a])*(w-a))*cardS;
  cards.forEach((c,i)=>{
    let y=wrap(i*cardS-q,all);if(y>all-cardS)y-=all;
    c.style.transform=side?`translate3d(${y.toFixed(1)}px,0,0)`:`translate3d(0,${y.toFixed(1)}px,0)`;
  });
  roll.style.transform=`translate3d(0,${(-wrap(p,N)*roll.firstChild.offsetHeight).toFixed(1)}px,0)`;
}
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));

function frame(now){
  const dt=Math.min(50,now-last)||16;last=now;
  if(auto&&!down&&now-lastInput>AUTO_IDLE&&now-lastStep>AUTO_EVERY){target=Math.round(target)+1;lastStep=now}
  const was=p,wasM=mode,wasP=par,goal=layout==='arc'?1:0;
  if(calm){p=target;mode=goal}else{
    p+=(target-p)*(1-Math.exp(-dt*.0072));
    mode+=(goal-mode)*(1-Math.exp(-dt*.006));
    par+=(parT-par)*(1-Math.exp(-dt*.004));
  }
  if(Math.abs(target-p)<.0004)p=target;
  if(Math.abs(goal-mode)<.001)mode=goal;
  if(Math.abs(parT-par)<.0005)par=parT;
  if(p!==was||mode!==wasM||par!==wasP||dirty){dirty=false;paint()}
  cx+=(mx-cx)*.32;cy+=(my-cy)*.32;
  ring.style.transform=`translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
}

let mx=0,my=0,cx=0,cy=0,down=false,sx=0,st=0,moved=0,wheelT=0;
const PULL=()=>Math.max(150,W*.2);
stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')ring.classList.add('show')});
stage.addEventListener('pointerleave',()=>{ring.classList.remove('show');parT=0});
stage.addEventListener('pointermove',e=>{
  const r=stage.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;
  if(e.pointerType==='mouse'){ring.classList.toggle('show',down||!e.target.closest('a,button'));if(!calm)parT=mx/W-.5}
  if(!down)return;
  const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));target=st+dx/PULL();
});
stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('a,button'))return;
  poke();down=true;sx=e.clientX;st=target;moved=0;stage.setPointerCapture(e.pointerId);ring.classList.add('drag');
});
function release(e){
  if(!down)return;down=false;ring.classList.remove('drag');
  if(moved<6){
    const hit=document.elementsFromPoint(e.clientX,e.clientY).find(x=>x.classList&&x.classList.contains('m'));
    if(hit){let d=wrap(+hit.dataset.i-target,N);d=Math.round(d);if(d>0&&d<N)target=Math.round(target)+d}
  }else target=Math.round(target);
}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
stage.addEventListener('wheel',e=>{
  e.preventDefault();poke();target+=clamp(e.deltaY+e.deltaX,-120,120)/420;
  clearTimeout(wheelT);wheelT=setTimeout(()=>{target=Math.round(target)},150);
},{passive:false});
addEventListener('keydown',e=>{
  if(['ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();poke();target=Math.round(target)+1}
  if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();poke();target=Math.round(target)-1}
});

function loop(t){frame(t);requestAnimationFrame(loop)}
Promise.all([MODELS,PIECES].map(u=>{const i=new Image;i.src=u;return i.decode().catch(()=>{})})).then(()=>document.fonts.ready).then(()=>{
  // entrance: the line rolls in out of the haze and settles on the first look
  if(!calm){p=-2.6;lastInput=performance.now()-AUTO_IDLE+4000}
  size();paint();$('wait').classList.add('gone');
});
size();requestAnimationFrame(loop);
