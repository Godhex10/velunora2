(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fmt = n => '₦' + n.toLocaleString('en-NG');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Data ---------- */
const products = [
  {id:'ambre', name:'Ambre Noir', short:'AMBRE', family:'Oriental', notes:'Amber, labdanum, vanilla', price:135000, shape:'square', liquid:'#c8913f', cap:'#141110', bg:'radial-gradient(circle at 50% 60%,#3b2c1f,#15100c)', badge:'Bestseller'},
  {id:'rose', name:'Rose Velours', short:'ROSE', family:'Floral', notes:'Damask rose, lychee, musk', price:118000, shape:'tall', liquid:'#e2a49c', cap:'#cfae78', bg:'linear-gradient(160deg,#f3e9df,#d8c3b1)', badge:'New'},
  {id:'oud', name:'Oud Minuit', short:'OUD', family:'Woody', notes:'Oud, saffron, leather', price:165000, shape:'square', liquid:'#6e3a1d', cap:'#1c1a19', bg:'radial-gradient(circle at 50% 60%,#2e241e,#0f0c0a)', badge:'Limited'},
  {id:'santal', name:'Santal Blanc', short:'SANTAL', family:'Woody', notes:'Sandalwood, fig, cream', price:98000, shape:'round', liquid:'#ecdcb6', cap:'#c9a063', bg:'linear-gradient(160deg,#ece6dd,#cfc5b8)'},
  {id:'neroli', name:'Néroli Soleil', short:'NÉROLI', family:'Fresh', notes:'Orange blossom, neroli, sea salt', price:76000, shape:'flat', liquid:'#f0d27a', cap:'#f3ede3', bg:'linear-gradient(160deg,#f6ecd6,#e2cfa6)'},
  {id:'iris', name:'Iris Poudré', short:'IRIS', family:'Floral', notes:'Orris butter, violet, suede', price:112000, shape:'tall', liquid:'#d6c3d2', cap:'#121010', bg:'radial-gradient(circle at 50% 60%,#3d302c,#15110f)'},
  {id:'vetiver', name:'Vétiver Fumé', short:'VÉTIVER', family:'Woody', notes:'Vetiver, birch smoke, grapefruit', price:104000, shape:'square', liquid:'#a3a36b', cap:'#2a2826', bg:'linear-gradient(160deg,#d9d6cf,#aaa59b)'},
  {id:'safran', name:'Safran Doré', short:'SAFRAN', family:'Oriental', notes:'Saffron, rose absolute, honey', price:145000, shape:'round', liquid:'#d98b2c', cap:'#141110', bg:'radial-gradient(circle at 50% 60%,#4a3319,#17100a)', badge:'New'}
];
const byId = id => products.find(p => p.id === id);

/* ---------- Product photography ----------
   Unbranded stock shots (Pexels / Unsplash licences allow free commercial use).
   Swap these for the store's own product shots, e.g. Supabase storage URLs. */
const PHOTOS = {
  ambre:'u:photo-1588405748880-12d1d2a59f75',
  rose:'p:16266295',
  oud:'p:4735929',
  santal:'p:15574229',
  neroli:'p:264819',
  iris:'p:4735908',
  vetiver:'p:13875783',
  safran:'p:36389336',
  notesMain:'p:4735908'
};
products.forEach(p => p.img = PHOTOS[p.id]);
function imgUrl(ref, w){
  const [src, id] = ref.split(/:(.+)/);
  if (src === 'p') return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  if (src === 'u') return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
  return ref;
}
// Responsive <img>; if a photo ever fails to load, the drawn bottle takes its place
function photo(p, sizes, ref = p.img){
  return `<img class="photo" src="${imgUrl(ref,800)}" srcset="${[400,800,1200,1600].map(w => `${imgUrl(ref,w)} ${w}w`).join(', ')}" sizes="${sizes}" alt="${p.name} perfume" loading="lazy" decoding="async" data-fb="${p.id}" onerror="window.__photoFail(this)">`;
}
window.__photoFail = img => { img.outerHTML = bottleSVG(byId(img.dataset.fb)); };

/* ---------- Colour helpers ---------- */
function shade(hex, pct){
  const n = parseInt(hex.slice(1),16); let r=n>>16, g=(n>>8)&255, b=n&255;
  const t = pct < 0 ? 0 : 255, f = Math.abs(pct)/100;
  r = Math.round((t-r)*f+r); g = Math.round((t-g)*f+g); b = Math.round((t-b)*f+b);
  return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

/* ---------- SVG bottle generator ---------- */
let gid = 0;
const SHAPES = {
  square:{body:{x:48,y:92,w:104,h:140,r:10}, neck:{x:88,y:76,w:24,h:18}, collar:{x:80,y:60,w:40,h:18}, cap:{x:72,y:12,w:56,h:50,r:4}, label:{x:70,y:140,w:60,h:46}},
  tall:{body:{x:64,y:80,w:72,h:152,r:8}, neck:{x:90,y:66,w:20,h:16}, collar:{x:84,y:52,w:32,h:16}, cap:{x:82,y:4,w:36,h:50,r:15}, label:{x:76,y:130,w:48,h:56}},
  flat:{body:{x:36,y:112,w:128,h:120,r:28}, neck:{x:88,y:96,w:24,h:18}, collar:{x:82,y:82,w:36,h:16}, cap:{x:74,y:38,w:52,h:46,r:22}, label:{x:70,y:148,w:60,h:40}},
  round:{circle:{cx:100,cy:168,r:64}, neck:{x:88,y:92,w:24,h:16}, collar:{x:82,y:78,w:36,h:16}, cap:{x:78,y:28,w:44,h:52,r:22}, label:{x:74,y:152,w:52,h:34}}
};
function bottleSVG(p, extra=''){
  const id = 'g' + (gid++), s = SHAPES[p.shape], L = p.liquid, C = p.cap;
  let body, liquid, hl;
  if (s.circle){
    const c = s.circle;
    body = `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="url(#${id}a)" stroke="rgba(255,255,255,.45)" stroke-width="1.4"/>`;
    liquid = `<clipPath id="${id}k"><circle cx="${c.cx}" cy="${c.cy}" r="${c.r-7}"/></clipPath><g clip-path="url(#${id}k)"><rect x="30" y="${c.cy-c.r+34}" width="140" height="140" fill="url(#${id}l)"/><rect x="30" y="${c.cy-c.r+34}" width="140" height="3" fill="${shade(L,45)}" opacity=".8"/></g>`;
    hl = `<path d="M62 140 Q56 168 66 196" stroke="#fff" stroke-opacity=".55" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  } else {
    const b = s.body, top = b.y + b.h*.2;
    body = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.r}" fill="url(#${id}a)" stroke="rgba(255,255,255,.45)" stroke-width="1.4"/>`;
    liquid = `<rect x="${b.x+7}" y="${top}" width="${b.w-14}" height="${b.y+b.h-7-top}" rx="${Math.max(b.r-4,3)}" fill="url(#${id}l)"/><rect x="${b.x+7}" y="${top}" width="${b.w-14}" height="3" fill="${shade(L,45)}" opacity=".8"/>`;
    hl = `<rect x="${b.x+8}" y="${b.y+10}" width="7" height="${b.h-24}" rx="3.5" fill="#fff" opacity=".45"/><rect x="${b.x+b.w-13}" y="${b.y+14}" width="3" height="${b.h-34}" rx="1.5" fill="#fff" opacity=".3"/>`;
  }
  const n = s.neck, co = s.collar, cp = s.cap, lb = s.label;
  const ridges = [1,2,3,4].map(i => `<line x1="${co.x}" x2="${co.x+co.w}" y1="${co.y+i*co.h/5}" y2="${co.y+i*co.h/5}" stroke="#6b5030" stroke-opacity=".45" stroke-width=".8"/>`).join('');
  return `<svg class="bottle" viewBox="0 0 200 250" ${extra} aria-hidden="true"><defs>
<linearGradient id="${id}a" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".2" stop-color="#fff" stop-opacity=".12"/><stop offset=".75" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".32"/></linearGradient>
<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(L,28)}"/><stop offset=".55" stop-color="${L}"/><stop offset="1" stop-color="${shade(L,-38)}"/></linearGradient>
<linearGradient id="${id}m" x1="0" x2="1"><stop offset="0" stop-color="#7d5f33"/><stop offset=".35" stop-color="#f4dfb0"/><stop offset=".62" stop-color="#b8935a"/><stop offset="1" stop-color="#5f4527"/></linearGradient>
<linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="${shade(C,-25)}"/><stop offset=".28" stop-color="${shade(C,38)}"/><stop offset=".55" stop-color="${C}"/><stop offset="1" stop-color="${shade(C,-35)}"/></linearGradient>
<radialGradient id="${id}s"><stop offset="0" stop-color="#000" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse cx="100" cy="240" rx="74" ry="8" fill="url(#${id}s)"/>
${liquid}${body}${hl}
<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" fill="url(#${id}a)" stroke="rgba(255,255,255,.4)"/>
<rect x="${co.x}" y="${co.y}" width="${co.w}" height="${co.h}" rx="1.5" fill="url(#${id}m)"/>${ridges}
<rect x="${cp.x}" y="${cp.y}" width="${cp.w}" height="${cp.h}" rx="${cp.r}" fill="url(#${id}c)"/>
<rect x="${cp.x+5}" y="${cp.y+4}" width="4" height="${cp.h-10}" rx="2" fill="#fff" opacity=".35"/>
<rect x="${lb.x}" y="${lb.y}" width="${lb.w}" height="${lb.h}" fill="#0f0c0a" stroke="#cfae78" stroke-width=".9"/>
<rect x="${lb.x+3}" y="${lb.y+3}" width="${lb.w-6}" height="${lb.h-6}" fill="none" stroke="#cfae78" stroke-width=".4"/>
<text x="100" y="${lb.y+lb.h*.48}" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="7" letter-spacing="1.4" fill="#e6cc9c">${p.short}</text>
<text x="100" y="${lb.y+lb.h*.72}" text-anchor="middle" font-family="Jost, sans-serif" font-size="3.4" letter-spacing="1.2" fill="#cfae78">EAU DE PARFUM</text>
</svg>`;
}

/* ---------- Loader ---------- */
$('#loaderWord').innerHTML = 'VELUNORA'.split('').map((c,i) => `<span style="animation-delay:${.1+i*.08}s">${c}</span>`).join('');
let started = false;
function startSite(){
  if (started) return; started = true;
  $('#loader').classList.add('done');
  setTimeout(() => setSlide(0, true), reduce ? 0 : 450);
}
window.addEventListener('load', () => setTimeout(startSite, reduce ? 0 : 1300));
setTimeout(startSite, 3500);

/* ---------- Header / menu ---------- */
const header = $('#header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), {passive:true});
$('#burger').addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  $('#burger').setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => { header.classList.remove('menu-open'); document.body.style.overflow=''; }));
$('#searchBtn').addEventListener('click', () => { $('#collection').scrollIntoView({behavior:'smooth'}); setTimeout(() => $('#q').focus({preventScroll:true}), 700); });

/* ---------- Hero slides ---------- */
const slides = [
  {kicker:'Ambre Noir, extrait de parfum', title:'The art of / *quiet* luxury', text:'Smoked amber and Madagascan vanilla. A warm, long-lasting extrait and one of our most-loved picks.', price:85000, liquid:'#c8913f', glow:'rgba(207,160,90,.32)'},
  {kicker:'Rose Velours, limited edition', title:'Petals *wrapped* / in velvet', text:'Damask rose picked at dawn, softened with lychee and a clean white musk that lingers on fabric.', price:118000, liquid:'#e09a93', glow:'rgba(214,140,134,.3)'},
  {kicker:'Oud Minuit, extrait', title:'Midnight / *oud* & saffron', text:'Aged agarwood, Iranian saffron and soft leather. The richest scent on our shelves, made for evenings out.', price:165000, liquid:'#7a3d1c', glow:'rgba(160,90,45,.34)'}
];
let cur = 0, autoTimer;
const copy = $('#heroCopy');
$('#dots').innerHTML = slides.map((_,i) => `<button aria-label="Show fragrance ${i+1}"></button>`).join('');
function buildTitle(t){
  let i = 0;
  return t.split(' ').map(w => {
    if (w === '/') return '<br>';
    const italic = w.startsWith('*');
    const clean = w.replace(/\*/g,'');
    const inner = italic ? `<em>${clean}</em>` : clean;
    return `<span class="w"><span style="--d:${(.18 + (i++)*.09).toFixed(2)}s">${inner}</span></span>`;
  }).join(' ');
}
function setSlide(i, first){
  cur = (i + slides.length) % slides.length;
  const s = slides[cur];
  copy.classList.remove('show'); if (!first) copy.classList.add('leave');
  setTimeout(() => {
    $('#heroKicker').textContent = s.kicker;
    $('#heroTitle').innerHTML = buildTitle(s.title);
    $('#heroText').textContent = s.text;
    $('#heroPrice').innerHTML = `From <b>${fmt(s.price)}</b>`;
    copy.classList.remove('leave'); void copy.offsetWidth; copy.classList.add('show');
  }, first ? 0 : 420);
  $$('#dots button').forEach((d,k) => d.classList.toggle('on', k === cur));
  $('#glow').style.setProperty('--glow', s.glow);
  bottle.setLiquid(s.liquid); if (!first) bottle.boost();
  clearInterval(autoTimer); autoTimer = setInterval(() => setSlide(cur+1), 8000);
}
$('#prev').onclick = () => setSlide(cur-1);
$('#next').onclick = () => setSlide(cur+1);
$$('#dots button').forEach((d,k) => d.onclick = () => k !== cur && setSlide(k));

/* ---------- Hero bottle: a real photo turned into 3D (three.js) ----------
   The photo is cut out and given depth (assets/hero-bottle.js), then drawn on a finely
   subdivided surface pushed forward by that depth, so it turns with real parallax.
   To use a full 3D model instead, set BOTTLE_MODEL to a .glb URL. */
const BOTTLE_MODEL = '';
const bottle = (() => {
  const canvas = $('#bottle3d'), stage = $('#stage');
  let boost = 0, glowColor = '#cf9a52';
  const api = { setLiquid(hex){ glowColor = hex; }, boost(){ boost = 1; } };
  const fallback = () => { document.body.classList.add('no-webgl'); canvas.style.display = 'none'; $('#fallback').innerHTML = bottleSVG(products[0]); };
  if (!document.createElement('canvas').getContext('webgl2') || (!BOTTLE_MODEL && !window.HERO_BOTTLE)){ fallback(); return api; }

  (async () => {
    const THREE = await import('three');
    const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
    camera.position.set(0, .35, 8); camera.lookAt(0, .1, 0);
    const group = new THREE.Group(); scene.add(group);
    let uniforms = null;

    if (BOTTLE_MODEL){
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
      scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), .04).texture;
      const model = (await new GLTFLoader().loadAsync(BOTTLE_MODEL)).scene, box = new THREE.Box3().setFromObject(model);
      model.scale.setScalar(2.9 / box.getSize(new THREE.Vector3()).y); box.setFromObject(model); model.position.sub(box.getCenter(new THREE.Vector3()));
      group.add(model);
    } else {
      const load = src => new Promise((res, rej) => new THREE.TextureLoader().load(src, res, undefined, rej));
      const [photo, map] = await Promise.all([load(HERO_BOTTLE.photo), load(HERO_BOTTLE.map)]);
      photo.colorSpace = THREE.SRGBColorSpace; photo.anisotropy = 8;
      const H = 2.7, W = H * HERO_BOTTLE.aspect;
      uniforms = { uPhoto:{value:photo}, uMap:{value:map}, uDepth:{value:.62}, uSheen:{value:0}, uReflect:{value:0} };
      const vert = `
        uniform sampler2D uMap; uniform float uDepth; varying vec2 vUv;
        void main(){
          vUv = uv; vec4 m = texture2D(uMap, uv);
          vec3 p = position; p.z += m.r * smoothstep(.15, .9, m.g) * uDepth;   // push the bottle forward by its depth
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
        }`;
      const frag = `
        uniform sampler2D uPhoto, uMap; uniform float uSheen, uReflect; varying vec2 vUv;
        void main(){
          vec3 c = texture2D(uPhoto, vUv).rgb; float a = texture2D(uMap, vUv).g;
          // near-white, unsaturated pixels are the studio backdrop seen through clear glass: let the page show through
          float lum = dot(c, vec3(.299, .587, .114)), sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
          float clear = smoothstep(.72, .93, lum) * (1. - smoothstep(.04, .2, sat));
          c = mix(c, c * vec3(.8, .76, .72), clear * .55);
          float alpha = a * mix(1., .42, clear);
          // soft band of light that slides across the glass as the bottle turns
          float band = exp(-pow((vUv.x + vUv.y * .35 - uSheen) * 7., 2.));
          c += band * .22 * a;
          if (uReflect > .5){ alpha *= .16 * (1. - smoothstep(0., .3, vUv.y)); }   // floor reflection fades away from the bottle
          if (alpha < .01) discard;
          gl_FragColor = vec4(c, alpha);
          #include <colorspace_fragment>
        }`;
      const geo = new THREE.PlaneGeometry(W, H, 160, 290);
      const mat = new THREE.ShaderMaterial({uniforms, vertexShader:vert, fragmentShader:frag, transparent:true});
      const bottleMesh = new THREE.Mesh(geo, mat); group.add(bottleMesh);
      const refl = new THREE.Mesh(geo, mat.clone()); refl.material.uniforms = {...uniforms, uReflect:{value:1}}; refl.material.side = THREE.DoubleSide;
      refl.scale.y = -1; refl.position.y = -H; group.add(refl);
      group.userData.bottomY = -H / 2;
    }

    // warm pool of light under the bottle, tinted per slide
    const gc = document.createElement('canvas'); gc.width = gc.height = 256; const gx = gc.getContext('2d');
    const rg = gx.createRadialGradient(128,128,0,128,128,128); rg.addColorStop(0,'rgba(255,255,255,.6)'); rg.addColorStop(1,'rgba(255,255,255,0)');
    gx.fillStyle = rg; gx.fillRect(0,0,256,256);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(gc), color:new THREE.Color(glowColor), transparent:true, opacity:.45, depthWrite:false}));
    floor.rotation.x = -Math.PI/2; scene.add(floor);
    const baseY = .25;

    function size(){ const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w/h;
      camera.position.z = w/h < .8 ? 9.8 : 8; camera.updateProjectionMatrix(); }
    new ResizeObserver(size).observe(stage); size();

    // swing: gentle automatic sway, drag to turn (within the range a single photo can show), springs back
    const LIMIT = .5;
    let drag = false, lastX = 0, dragYaw = 0, tiltX = 0, tiltY = 0;
    stage.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; });
    addEventListener('pointerup', () => drag = false);
    addEventListener('pointercancel', () => drag = false);
    addEventListener('pointermove', e => {
      if (drag){ dragYaw = Math.max(-LIMIT, Math.min(LIMIT, dragYaw + (e.clientX - lastX) * .006)); lastX = e.clientX; }
      tiltX = (e.clientY / innerHeight - .5) * .12; tiltY = (e.clientX / innerWidth - .5) * .5;
    });

    let visible = true;
    new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(stage);
    const glowTarget = new THREE.Color(), clock = new THREE.Clock(); let t = 0, yaw = 0;
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), .05);
      if (!visible) return;
      t += dt; boost *= Math.pow(.25, dt);
      if (!drag) dragYaw *= Math.pow(.15, dt);
      const sway = reduce ? 0 : Math.sin(t * .55) * .32 + Math.sin(t * 2.2) * boost * .25;
      const targetYaw = Math.max(-LIMIT, Math.min(LIMIT, sway + dragYaw + tiltY * .3));
      yaw += (targetYaw - yaw) * .08;
      group.rotation.y = yaw;
      group.rotation.x += (tiltX - group.rotation.x) * .05;
      const float = reduce ? 0 : Math.sin(t * .8) * .05;
      group.position.y = baseY + float;
      floor.position.y = baseY - 1.35;
      if (uniforms) uniforms.uSheen.value = .55 - yaw * 1.4;
      glowTarget.set(glowColor); floor.material.color.lerp(glowTarget, .04);
      floor.material.opacity = .45 - float * 1.5;
      renderer.render(scene, camera);
    });
  })().catch(err => { console.warn('3D bottle unavailable, showing illustration instead:', err); fallback(); });
  return api;
})();

/* ---------- Gold dust ---------- */
(() => {
  const c = $('#dust'), x = c.getContext('2d'); let W, H, parts = [];
  function size(){ const r = Math.min(devicePixelRatio,2); W = c.offsetWidth; H = c.offsetHeight; c.width = W*r; c.height = H*r; x.setTransform(r,0,0,r,0,0);
    parts = Array.from({length: Math.round(W*H/16000)}, () => ({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+.3, s:Math.random()*.25+.05, p:Math.random()*6.28})); }
  addEventListener('resize', size); size();
  (function draw(){
    requestAnimationFrame(draw);
    if (scrollY > innerHeight) return;
    x.clearRect(0,0,W,H);
    for (const p of parts){
      if (!reduce){ p.y -= p.s; p.x += Math.sin(p.p += .01) * .15; }
      if (p.y < -5){ p.y = H + 5; p.x = Math.random()*W; }
      const a = .25 + Math.sin(p.p*2) * .25 + .25;
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fillStyle = `rgba(156,116,70,${a * .7})`; x.fill();
    }
  })();
})();

/* ---------- Marquee ---------- */
const mWords = ['Oud','Damask rose','Amber','Vetiver','Saffron','Orris','Sandalwood','Neroli'];
$('#marquee').innerHTML = [...mWords, ...mWords].map(w => `<span>${w}</span>`).join('');

/* ---------- Cards ---------- */
const heart = '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/></svg>';
const wished = new Set();
function card(p, i){
  return `<article class="card" style="--d:${(i*.07).toFixed(2)}s">
    <div class="card-media" style="background:var(--walnut)">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      <button class="wish ${wished.has(p.id)?'on':''}" data-wish="${p.id}" aria-label="Save ${p.name}">${heart}</button>
      ${photo(p, '(max-width:520px) 50vw, (max-width:1000px) 50vw, 330px')}
    </div>
    <div class="card-body">
      <span class="fam">${p.family}</span>
      <h3>${p.name}</h3>
      <p class="notes-line">${p.notes}</p>
      <div class="card-foot"><span class="price">${fmt(p.price)}</span><button class="btn btn-sm" data-add="${p.id}">Add to bag</button></div>
    </div></article>`;
}
const track = $('#track');
track.innerHTML = products.map(card).join('');
// reveal the carousel as a whole: cards off to the right would otherwise pop in one by one while scrolling
track.closest('.carousel').classList.add('reveal');
// move exactly one product per arrow press, smoothly, landing on a card edge
const cards = () => [...track.children];
const cardX = c => c.offsetLeft - track.firstElementChild.offsetLeft;
const currentCard = () => { let best = 0, d = Infinity; cards().forEach((c, i) => { const dd = Math.abs(cardX(c) - track.scrollLeft); if (dd < d){ d = dd; best = i; } }); return best; };
// own easing instead of native smooth scroll, which fights scroll-snap in some browsers
let slideAnim = 0;
const goCard = dir => {
  const cs = cards(), i = Math.max(0, Math.min(cs.length - 1, currentCard() + dir));
  const from = track.scrollLeft, to = Math.min(cardX(cs[i]), track.scrollWidth - track.clientWidth);
  cancelAnimationFrame(slideAnim);
  if (reduce || Math.abs(to - from) < 1){ track.scrollLeft = to; return; }
  track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
  const t0 = performance.now(), dur = 550, ease = k => k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
  const step = now => { const k = Math.min((now - t0) / dur, 1); track.scrollLeft = from + (to - from) * ease(k);
    if (k < 1) slideAnim = requestAnimationFrame(step); else { track.style.scrollSnapType = ''; track.style.scrollBehavior = ''; } };
  slideAnim = requestAnimationFrame(step);
};
track.addEventListener('pointerdown', () => { cancelAnimationFrame(slideAnim); track.style.scrollSnapType = ''; track.style.scrollBehavior = ''; }, {passive:true});
$('#cPrev').onclick = () => goCard(-1);
$('#cNext').onclick = () => goCard(1);
function bar(){ const max = track.scrollWidth - track.clientWidth; const vis = track.clientWidth / track.scrollWidth;
  const f = max > 0 ? track.scrollLeft / max : 1; $('#cBar').style.transform = `scaleX(${vis + (1-vis)*f})`;
  $('#cPrev').classList.toggle('off', track.scrollLeft < 4); $('#cNext').classList.toggle('off', track.scrollLeft > max - 4); }
track.addEventListener('scroll', bar, {passive:true}); addEventListener('resize', bar); bar();

/* ---------- Collection ---------- */
const fams = ['All', ...new Set(products.map(p => p.family))];
let fam = 'All';
$('#chips').innerHTML = fams.map(f => `<button class="${f==='All'?'on':''}" data-fam="${f}">${f}</button>`).join('');
function renderGrid(){
  const q = $('#q').value.trim().toLowerCase();
  const list = products.filter(p => (fam==='All' || p.family===fam) && (!q || (p.name+' '+p.notes+' '+p.family).toLowerCase().includes(q)));
  const g = $('#grid');
  g.classList.toggle('hero-row', fam==='All' && !q);
  g.innerHTML = list.length ? list.map(card).join('') :
    `<div class="empty"><b>No fragrances match “${q.replace(/[<>&"]/g,'')}”</b>Try a note such as rose, oud or amber, or clear the search.</div>`;
}
$('#chips').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  fam = b.dataset.fam; $$('#chips button').forEach(x => x.classList.toggle('on', x===b)); renderGrid(); });
$('#q').addEventListener('input', renderGrid);
renderGrid();

/* ---------- Featured ---------- */
$('#featTilt').innerHTML = photo(products[0], '(max-width:900px) 60vw, 30vw');
let featSize = '50ml', featPrice = 85000, qty = 1;
const updFeat = () => { $('#featPrice').innerHTML = `${fmt(featPrice * qty)}<small>${featSize.replace('ml',' ml')}${qty>1?' × '+qty:''}</small>`; $('#qVal').textContent = qty; };
updFeat();
$('#sizes').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  $$('#sizes button').forEach(x => x.classList.toggle('on', x===b)); featSize = b.dataset.size; featPrice = +b.dataset.price; updFeat(); });
$('#qMinus').onclick = () => { qty = Math.max(1, qty-1); updFeat(); };
$('#qPlus').onclick = () => { qty = Math.min(9, qty+1); updFeat(); };
$('#featAdd').onclick = () => addToCart('ambre', featSize, featPrice, qty);
$('#featWish').onclick = e => { e.currentTarget.classList.toggle('on'); toast(e.currentTarget.classList.contains('on') ? 'Saved to your wishlist' : 'Removed from your wishlist'); };
const fm = $('#featMedia');
fm.addEventListener('pointermove', e => { const r = fm.getBoundingClientRect(); const x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
  $('#featTilt').style.transform = `rotateY(${x*24}deg) rotateX(${-y*18}deg) translateZ(20px)`; });
fm.addEventListener('pointerleave', () => $('#featTilt').style.transform = '');

/* ---------- Notes art: framed photo with art-deco gold details ---------- */
(() => {
  const rays = Array.from({length:19}, (_,i) => { const a = Math.PI * (i/18), r = 260;
    return `<line x1="200" y1="250" x2="${(200 - Math.cos(a)*r).toFixed(1)}" y2="${(250 - Math.sin(a)*r).toFixed(1)}"/>`; }).join('');
  const call = (layer, name, note) => `<button class="nf-call ${layer}" data-layer="${layer}" type="button"><b>${name}</b><span>${note}</span></button>`;
  $('#notesArt').innerHTML = `<div class="nf">
    <svg class="nf-rays" viewBox="0 0 400 440" aria-hidden="true">${rays}</svg>
    <div class="nf-arch-line" aria-hidden="true"></div>
    <div class="nf-arch"><img src="${imgUrl(PHOTOS.notesMain,900)}" srcset="${imgUrl(PHOTOS.notesMain,900)} 1x, ${imgUrl(PHOTOS.notesMain,1600)} 2x" alt="Rose Velours in a clear glass bottle with a lacquered cap" loading="lazy" decoding="async"></div>
    <div class="nf-ring" aria-hidden="true">
      <svg viewBox="0 0 100 100"><defs><path id="nfRing" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#nfRing">Rose Velours · Extrait de parfum · </textPath></text></svg>
      <span>V</span>
    </div>
    ${call('top','Top','Bergamot')}${call('heart','Heart','Damask rose')}${call('base','Base','White musk')}
  </div>`;
  $$('.nf-call').forEach(c => c.addEventListener('click', () => $(`#tabs [data-tab="${c.dataset.layer}"]`).click()));
})();
const notesData = {
  top:[['Bergamot','First 15 minutes','Bright, slightly bitter citrus that lifts the opening.',.8],['Lychee','First 30 minutes','Juicy and sweet, it makes the rose feel fresh.',.65],['Pink pepper','First hour','A dry, sparkling spice that keeps things light.',.5]],
  heart:[['Damask rose','Hours 1 to 4','Hand-picked Bulgarian rose, rich and velvety.',.95],['Jasmine sambac','Hours 1 to 3','Adds warmth and a creamy floral depth.',.6],['Orris','Hours 2 to 5','Powdery iris root, soft like face powder.',.55]],
  base:[['White musk','All day','Clean and skin-like; this is what lingers on fabric.',.9],['Amber','Hours 4 to 10','Warm, resinous glow under the florals.',.75],['Cashmere wood','Hours 5 to 12','Soft, dry wood that rounds out the finish.',.6]]
};
function renderNotes(k){
  const el = $('#noteList'); el.classList.remove('show');
  $$('.nf-call').forEach(c => c.classList.toggle('on', c.dataset.layer === k));
  setTimeout(() => {
    el.innerHTML = notesData[k].map(([n,when,d,v],i) => `<div class="note" style="--i:${i}"><div class="note-top"><h4>${n}</h4><span>${when}</span></div><p>${d}</p><div class="meter"><i style="--v:${v}"></i></div></div>`).join('');
    void el.offsetWidth; el.classList.add('show');
  }, 250);
}
$('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  $$('#tabs button').forEach(x => x.classList.toggle('on', x===b)); renderNotes(b.dataset.tab); });

/* ---------- Cart ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem('velour_cart') || '[]'); } catch(e){ cart = []; }
const save = () => { try { localStorage.setItem('velour_cart', JSON.stringify(cart)); } catch(e){} };
function addToCart(id, size='100ml', price, q=1){
  const p = byId(id); price = price || p.price;
  const key = id + '|' + size, ex = cart.find(c => c.key === key);
  ex ? ex.qty += q : cart.push({key, id, size, price, qty:q});
  save(); renderCart();
  const bc = $('#bagCount'); bc.classList.remove('bump'); void bc.offsetWidth; bc.classList.add('bump');
  toast(`${p.name} added to your bag`);
}
function renderCart(){
  const count = cart.reduce((a,c) => a + c.qty, 0);
  $('#bagCount').textContent = count;
  $('#subtotal').textContent = fmt(cart.reduce((a,c) => a + c.qty*c.price, 0));
  $('#cartItems').innerHTML = cart.length ? cart.map(c => { const p = byId(c.id); return `
    <div class="ci"><div class="ci-img">${photo(p, '70px')}</div>
      <div><h4>${p.name}</h4><small>${c.size.replace('ml',' ml')}</small>
        <div class="ci-q"><button data-dec="${c.key}" aria-label="Decrease">−</button><span>${c.qty}</span><button data-inc="${c.key}" aria-label="Increase">+</button></div></div>
      <div class="ci-r">${fmt(c.price*c.qty)}<button class="rm" data-rm="${c.key}">Remove</button></div></div>`; }).join('')
    : `<div class="cart-empty"><b>Your bag is empty</b>Add a fragrance from the collection to get started.</div>`;
  $('#checkout').disabled = !cart.length; $('#checkout').style.opacity = cart.length ? 1 : .4;
}
renderCart();
const openDrawer = on => { $('#drawer').classList.toggle('on', on); $('#overlay').classList.toggle('on', on); };
$('#bagBtn').onclick = () => openDrawer(true);
$('#closeDrawer').onclick = $('#overlay').onclick = () => openDrawer(false);
$('#checkout').onclick = () => { openDrawer(false); toast('Checkout is not connected yet'); };
addEventListener('keydown', e => { if (e.key === 'Escape'){ openDrawer(false); $('#chat').classList.remove('on'); } });

document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a) return addToCart(a.dataset.add);
  const w = e.target.closest('[data-wish]');
  if (w){ const id = w.dataset.wish; wished.has(id) ? wished.delete(id) : wished.add(id);
    $$(`[data-wish="${id}"]`).forEach(x => x.classList.toggle('on', wished.has(id)));
    return toast(wished.has(id) ? `${byId(id).name} saved to your wishlist` : `${byId(id).name} removed from your wishlist`); }
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
  if (inc || dec || rm){ const key = (inc||dec||rm).dataset[inc?'inc':dec?'dec':'rm']; const it = cart.find(c => c.key === key);
    if (inc) it.qty++; if (dec) it.qty--; if (rm || it.qty < 1) cart = cart.filter(c => c.key !== key); save(); renderCart(); }
});

/* ---------- Toast ---------- */
let tt; function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2400); }

/* ---------- Reveal, split headings, counters ---------- */
$$('.split-h').forEach(h => { h.innerHTML = [...h.textContent].map((c,i) => c === ' ' ? ' ' : `<span class="ch" style="--i:${i}">${c}</span>`).join(''); });
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target; el.classList.add('in'); io.unobserve(el);
  if (el.id === 'noteList') renderNotes('top');
  el.querySelectorAll('[data-count]').forEach(countUp);
}), {threshold:.15, rootMargin:'0px 0px -40px 0px'});
$$('.reveal, .split-h, #noteList').forEach(el => io.observe(el));
function countUp(el){ const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
  (function f(now){ const k = Math.min((now-t0)/dur, 1), e = 1 - Math.pow(1-k, 4); el.textContent = pre + Math.round(end*e) + suf; if (k < 1) requestAnimationFrame(f); })(t0); }

/* ---------- Newsletter ---------- */
$('#newsForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); $('#newsOk').textContent = 'Subscribed. Your first letter arrives next month.'; });

/* ---------- Chat ---------- */
const replies = {
  'Help me choose a scent':'Do you prefer warm and smoky, or fresh and floral? Warm lovers usually start with Ambre Noir; floral lovers with Rose Velours.',
  'Delivery times':'Lagos orders arrive in 1 to 2 working days. Other states take 3 to 5 working days.',
  'Gift wrapping':'Every order comes gift-wrapped in our velvet box at no extra cost. You can add a handwritten note at checkout.'
};
$('#chatBtn').onclick = () => $('#chat').classList.toggle('on');
$('#quick').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return;
  const body = $('#chatBody'); body.insertAdjacentHTML('beforeend', `<div class="msg me">${b.textContent}</div>`); body.scrollTop = body.scrollHeight;
  setTimeout(() => { body.insertAdjacentHTML('beforeend', `<div class="msg bot">${replies[b.textContent]}</div>`); body.scrollTop = body.scrollHeight; }, 650); });
})();
