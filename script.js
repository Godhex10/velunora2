(() => {
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => '₦' + Number(n).toLocaleString('en-NG');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IMG_BASE = 'https://m0chpdauradhynwn.public.blob.vercel-storage.com/products/';
const FREE_DELIVERY = 200000, DEAL_MAX = 30000, PAGE = 12;
const WHATSAPP = '2347074129844';
const arrowSvg = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const xSvg = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const heartSvg = '<svg viewBox="0 0 24 24"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"/></svg>';
const bagSvg = '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
const checkSvg = '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>';

/* ---------- Catalogue ---------- */
const products = (window.VELUNORA_PRODUCTS || []).filter(p => p.price);
const byId = id => products.find(p => p.id === id);
const imgOf = p => /^https?:/.test(p.img) ? p.img : IMG_BASE + p.img;
const FAMILIES = ['Amber','Woody','Oud','Floral','Fruity','Gourmand','Citrus','Aromatic','Fresh','Leather','Oriental'];
const familiesPresent = FAMILIES.filter(f => products.some(p => p.family === f));
const brandCounts = products.reduce((m, p) => (m[p.brand] = (m[p.brand] || 0) + 1, m), {});
const brandsAZ = Object.keys(brandCounts).sort((a, b) => a.localeCompare(b));
const ARABIAN = ['Lattafa','Arabian Perfume','Khadlaj','Fragrance World','Rayhaan Perfumes','MFP My Perfumes','Hamidi Perfume','Risala perfumes','Armaf','Ard Al Zaafaran','Afnan','Al Haramain','Zimaya Perfumes','Maison Alhambra Perfumes','Grandeur Perfumes','Franck Olivier'];
const PRICES = [['any','Any price'],['0-30000','Under ₦30,000'],['30000-70000','₦30,000 – ₦70,000'],['70000-200000','₦70,000 – ₦200,000'],['200000-','₦200,000 and above']];
// image stage: product photo on the warm tone, white backgrounds melt away
const ph = (p, eager) => `<div class="ph" data-mono="${esc(p.brand.slice(0, 1))}"><img src="${imgOf(p)}" alt="${esc(p.brand + ' ' + p.name)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="this.parentNode.classList.add('loaded')" onerror="this.parentNode.classList.add('loaded','failed')"></div>`;

/* LENS-MATCHER-START */
// Matches words read from a bottle label against the catalogue. Returns [{p, score}] best first.
const LENS_STOP = new Set('edp edt edc eau de du la le parfum parfums perfume perfumes toilette cologne extrait spray body for women men woman man him her pour homme femme the and with new ml 50ml 75ml 100ml 200ml 250ml natural vaporisateur vapo made paris london dubai collection edition gift set piece inspired original'.split(' '));
const lensTokens = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => w.length >= 3 && !LENS_STOP.has(w));
const lensNear = (a, b) => { if (a === b) return true; if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0; while (i < a.length && j < b.length){ if (a[i] === b[j]){ i++; j++; continue; } if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return edits + (a.length - i) + (b.length - j) <= 1; };
function lensMatch(text, list){
  const seen = lensTokens(text); if (!seen.length) return [];
  const has = w => seen.some(s => lensNear(s, w) || (w.length >= 6 && s.length >= 5 && (s.includes(w) || w.includes(s))));
  return list.map(p => {
    const bt = [...new Set(lensTokens(p.brand))], nt = [...new Set(lensTokens(p.name))].filter(w => !bt.includes(w));
    const bHit = bt.filter(has).length, nHit = nt.filter(has).length;
    const score = bHit * 2 + nHit * 3 + (nt.length && nHit === nt.length ? 1 : 0);
    return { p, score, exact: nHit > 0 && nHit === nt.length };
  }).filter(r => r.score >= 2).sort((a, b) => b.score - a.score || a.p.name.length - b.p.name.length);
}
/* LENS-MATCHER-END */

/* ---------- Storage ---------- */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
let bag = load('velunora_bag', []).filter(i => byId(i.id));
let wish = new Set(load('velunora_wish', []).filter(byId));

/* ---------- Header ---------- */
const header = $('#header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), {passive:true});

/* ---------- Product card ---------- */
function card(p, i = 0){
  const badge = p.soldOut ? '<span class="badge sold">Sold out</span>' : p.tags.includes('bestseller') ? '<span class="badge">Best seller</span>' : p.tags.includes('trending') ? '<span class="badge">Trending</span>' : '';
  return `<article class="card" style="--d:${Math.min(i, 11) * 0.04}s">
    <div class="card-media" data-qv="${esc(p.id)}">${ph(p)}${badge}
      <button class="wish ${wish.has(p.id) ? 'on' : ''}" data-wish="${esc(p.id)}" aria-label="Save ${esc(p.name)}" aria-pressed="${wish.has(p.id)}">${heartSvg}</button>
      <div class="card-actions"><button data-qv="${esc(p.id)}">Quick view</button><button data-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>${p.soldOut ? 'Sold out' : 'Add to bag'}</button></div>
    </div>
    <div class="card-body">
      <span class="card-brand">${esc(p.brand)}</span>
      <h3 class="card-name" data-qv="${esc(p.id)}" title="${esc(p.name)}">${esc(p.name)}</h3>
      <span class="card-meta">${esc(p.size)}${p.family ? ' · ' + esc(p.family) : ''}</span>
      <div class="card-row"><span class="card-price">${p.soldOut ? '<s>' + fmt(p.price) + '</s>' : fmt(p.price)}</span>
        <button class="card-add-sm" data-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''} aria-label="${p.soldOut ? 'Sold out' : 'Add ' + esc(p.name) + ' to bag'}">${bagSvg}</button></div>
    </div></article>`;
}

/* ---------- Collections (used by the category rail, nav and filter chips) ---------- */
const EDITS = [
  { key:'arabian', title:'Arabian & oud', test:p => ARABIAN.includes(p.brand) || p.family === 'Oud' },
  { key:'evening', title:'Evening scents', test:p => ['Amber','Gourmand','Oriental'].includes(p.family) && /Parfum|Extrait/.test(p.concentration || '') },
  { key:'body', title:'Body sprays', test:p => /body spray|deodorant|anti-?pers|roll on/i.test(p.name) },
  { key:'value', title:'Under ₦30,000', test:p => p.price < DEAL_MAX }
];

/* ---------- Category rail ---------- */
(() => {
  const pick = key => products.find(p => p.id.startsWith(key));
  const items = [
    ['all', 'All', products.length, pick('tom-ford-lost-cherry')],
    ['gender:Women', 'Women', products.filter(p => matchGender(p, 'Women')).length, pick('rave-now-women')],
    ['gender:Men', 'Men', products.filter(p => matchGender(p, 'Men')).length, pick('rayhaan-pacific')],
    ['gender:Unisex', 'Unisex', products.filter(p => p.gender === 'Unisex').length, pick('armaf-ombre')],
    ['edit:arabian', 'Arabian & oud', products.filter(EDITS[0].test).length, pick('lattafa-ishq')],
    ['edit:evening', 'Evening', products.filter(EDITS[1].test).length, pick('khadlaj-le-prestige')],
    ['edit:body', 'Body sprays', products.filter(EDITS[2].test).length, pick('armaf-legesi')],
    ['deals', 'Under ₦30k', products.filter(EDITS[3].test).length, pick('breed-hello-sugar')]
  ];
  $('#catRail').innerHTML = items.map(([f, label, n, p], i) => `<a class="rail-item" href="#shop" data-filter="${f}" style="--d:${i * .04}s">
    <span class="rail-img">${p ? ph(p, i < 4) : ''}</span><b>${esc(label)}</b><small>${n}</small></a>`).join('');
})();

/* ---------- Best sellers carousel: one card per arrow press ---------- */
$('#best').innerHTML = [...products.filter(p => p.tags.includes('bestseller')), ...products.filter(p => p.tags.includes('trending') && !p.tags.includes('bestseller'))].slice(0, 12).map(card).join('');
function setupCarousel(track){
  const btns = $$(`[data-car="${track.id}"]`);
  const x = c => c.offsetLeft - track.firstElementChild.offsetLeft;
  const cur = () => { let b = 0, d = Infinity; [...track.children].forEach((c, i) => { const dd = Math.abs(x(c) - track.scrollLeft); if (dd < d){ d = dd; b = i; } }); return b; };
  let anim = 0;
  const go = dir => { const cs = [...track.children], i = Math.max(0, Math.min(cs.length - 1, cur() + dir));
    const from = track.scrollLeft, to = Math.min(x(cs[i]), track.scrollWidth - track.clientWidth);
    cancelAnimationFrame(anim); if (reduce || Math.abs(to - from) < 1){ track.scrollLeft = to; return; }
    track.style.scrollSnapType = 'none'; const t0 = performance.now(), dur = 480, ease = k => 1 - Math.pow(1 - k, 3);
    const step = now => { const k = Math.min((now - t0) / dur, 1); track.scrollLeft = from + (to - from) * ease(k);
      if (k < 1) anim = requestAnimationFrame(step); else track.style.scrollSnapType = ''; };
    anim = requestAnimationFrame(step); };
  btns.forEach(b => b.addEventListener('click', () => go(+b.dataset.dir)));
  const state = () => { const max = track.scrollWidth - track.clientWidth;
    btns.forEach(b => b.classList.toggle('off', +b.dataset.dir < 0 ? track.scrollLeft < 4 : track.scrollLeft > max - 4)); };
  track.addEventListener('scroll', state, {passive:true}); addEventListener('resize', state); state();
  track.addEventListener('pointerdown', () => { cancelAnimationFrame(anim); track.style.scrollSnapType = ''; }, {passive:true});
}
setupCarousel($('#best'));

/* ---------- Brand index ---------- */
(() => { const groups = {};
  brandsAZ.forEach(b => { const l = /^[a-z]/i.test(b) ? b[0].toUpperCase() : '#'; (groups[l] = groups[l] || []).push(b); });
  $('#brandIndex').innerHTML = Object.entries(groups).map(([l, bs]) => `<div class="bi-group"><h3>${l}</h3>${bs.map(b => `<button data-filter="brand:${esc(b)}">${esc(b)}<small>${brandCounts[b]}</small></button>`).join('')}</div>`).join('');
  $('#megaBrands').innerHTML = brandsAZ.map(b => `<a href="#shop" data-filter="brand:${esc(b)}">${esc(b)}<small>${brandCounts[b]}</small></a>`).join('');
})();

/* ---------- Shop: filters ---------- */
const F = { gender:'all', fams:new Set(), brands:new Set(), price:'any', stock:false, q:'', edit:'', sort:'featured' };
let shown = PAGE;
function matchGender(p, g){ return g === 'all' || p.gender === g || (g !== 'Unisex' && p.gender === 'Unisex'); }
const searchText = p => (p.brand + ' ' + p.name + ' ' + p.family + ' ' + p.gender + ' ' + p.notes.join(' ')).toLowerCase();
// every typed word must match the start of a word, so "oud" finds Oud but not Proud
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matches = (p, q) => q.toLowerCase().split(/\s+/).filter(Boolean).every(w => new RegExp('(^|[^a-z0-9])' + reEsc(w)).test(searchText(p)));
function inPrice(p, band){ if (band === 'any') return true; const [lo, hi] = band.split('-').map(v => v === '' ? Infinity : +v); return p.price >= lo && p.price < hi; }
function filtered(){
  const ed = EDITS.find(e => e.key === F.edit);
  let list = products.filter(p => matchGender(p, F.gender) && (!F.fams.size || F.fams.has(p.family)) && (!F.brands.size || F.brands.has(p.brand))
    && inPrice(p, F.price) && (!F.stock || !p.soldOut) && (!F.q || matches(p, F.q)) && (!ed || ed.test(p)));
  const s = { low:(a, b) => a.price - b.price, high:(a, b) => b.price - a.price, az:(a, b) => a.name.localeCompare(b.name) }[F.sort];
  return s ? [...list].sort(s) : [...list].sort((a, b) => a.soldOut - b.soldOut);
}
// filter controls
$('#fGender').innerHTML = [['all','All'],['Women','Women'],['Men','Men'],['Unisex','Unisex']].map(([v, l]) => `<button data-gender="${v}">${l}</button>`).join('');
$('#fFamily').innerHTML = familiesPresent.map(f => `<label class="check"><input type="checkbox" value="${f}" data-fam><i></i><span>${f}</span><small>${products.filter(p => p.family === f).length}</small></label>`).join('');
$('#fPrice').innerHTML = PRICES.map(([v, l]) => `<label class="check"><input type="radio" name="price" value="${v}" data-price ${v === 'any' ? 'checked' : ''}><i></i><span>${l}</span></label>`).join('');
$('#fBrand').innerHTML = brandsAZ.map(b => `<label class="check" data-bname="${esc(b.toLowerCase())}"><input type="checkbox" value="${esc(b)}" data-brand><i></i><span>${esc(b)}</span><small>${brandCounts[b]}</small></label>`).join('');
$('#fBrand').insertAdjacentHTML('afterend', `<button class="show-all" id="brandAll" type="button">Show all ${brandsAZ.length} brands</button>`);
$('#brandAll').addEventListener('click', e => { const l = $('#fBrand'), on = l.classList.toggle('all'); e.target.textContent = on ? 'Show fewer' : `Show all ${brandsAZ.length} brands`; });
// typing shows every matching brand, not just the first eight
$('#brandFind').addEventListener('input', e => { const q = e.target.value.trim().toLowerCase();
  $('#fBrand .check').forEach(l => { const m = !q || l.dataset.bname.includes(q); l.hidden = !m; l.classList.toggle('match', !!q && m); });
  $('#brandAll').hidden = !!q; });
$('#filters').addEventListener('change', e => {
  const t = e.target; shown = PAGE;
  if (t.matches('[data-fam]')) t.checked ? F.fams.add(t.value) : F.fams.delete(t.value);
  else if (t.matches('[data-brand]')) t.checked ? F.brands.add(t.value) : F.brands.delete(t.value);
  else if (t.matches('[data-price]')) F.price = t.value;
  else if (t.id === 'fStock') F.stock = t.checked;
  renderShop();
});
$('#sortSelect').addEventListener('change', e => { F.sort = e.target.value; renderShop(); });
$('#moreBtn').addEventListener('click', () => { shown += PAGE; renderShop(); });
function renderShop(){
  const list = filtered();
  $('#grid').innerHTML = list.length ? list.slice(0, shown).map(card).join('')
    : `<div class="empty"><b>Nothing matches yet</b>Try removing a filter, or <button data-clear>clear them all</button>.</div>`;
  $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'fragrance' : 'fragrances'}`;
  const ed = EDITS.find(e => e.key === F.edit);
  $('#shopTitle').textContent = ed ? ed.title : F.gender !== 'all' ? `${F.gender === 'Unisex' ? 'Unisex' : 'For ' + (F.gender === 'Women' ? 'her' : 'him')}` : F.brands.size === 1 ? [...F.brands][0] : F.q ? `Results for “${F.q}”` : 'Shop all fragrances';
  $('#showResults').textContent = `Show ${list.length} ${list.length === 1 ? 'result' : 'results'}`;
  $('#moreBtn').hidden = shown >= list.length;
  // sync controls
  $$('#fGender button').forEach(b => b.classList.toggle('on', b.dataset.gender === F.gender));
  $$('[data-fam]').forEach(c => c.checked = F.fams.has(c.value));
  $$('[data-brand]').forEach(c => c.checked = F.brands.has(c.value));
  $$('[data-price]').forEach(c => c.checked = c.value === F.price);
  $('#fStock').checked = F.stock; $('#sortSelect').value = F.sort;
  const chips = [];
  if (F.gender !== 'all') chips.push(['gender', '', F.gender]);
  F.fams.forEach(f => chips.push(['fam', f, f])); F.brands.forEach(b => chips.push(['brand', b, b]));
  if (F.price !== 'any') chips.push(['price', '', PRICES.find(x => x[0] === F.price)[1]]);
  if (F.edit) chips.push(['edit', '', EDITS.find(e => e.key === F.edit).title]);
  if (F.q) chips.push(['q', '', '“' + F.q + '”']); if (F.stock) chips.push(['stock', '', 'In stock']);
  $('#activeFilters').innerHTML = chips.map(([k, v, l]) => `<button class="chip" data-unset="${k}" data-val="${esc(v)}">${esc(l)}${xSvg}</button>`).join('') + (chips.length > 1 ? '<button class="chip clear" data-clear>Clear all</button>' : '');
  const n = chips.length; $('#fCount').textContent = n; $('#fCount').hidden = !n;
}
function resetF(){ Object.assign(F, { gender:'all', price:'any', stock:false, q:'', edit:'' }); F.fams.clear(); F.brands.clear(); }
function applyFilter(spec, scroll = true){
  resetF(); shown = PAGE;
  if (spec === 'deals') F.price = '0-30000';
  else if (spec && spec !== 'all'){ const [k, ...rest] = spec.split(':'), v = rest.join(':');
    if (k === 'gender') F.gender = v; else if (k === 'family') F.fams.add(v); else if (k === 'brand') F.brands.add(v); else if (k === 'edit') F.edit = v; }
  renderShop(); closeAll(true);
  if (scroll) $('#shop').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
}
renderShop();
$('#filterBtn').addEventListener('click', () => { $('#filters').classList.add('on'); scrim.classList.add('on'); document.body.style.overflow = 'hidden'; });

/* ---------- Overlays ---------- */
const scrim = $('#scrim'); let lastFocus = null;
function open(id){
  closeAll(true); const el = $('#' + id); if (!el) return;
  lastFocus = document.activeElement; el.classList.add('on'); el.setAttribute('aria-hidden', 'false');
  scrim.classList.add('on'); document.body.style.overflow = 'hidden';
  if (id === 'menu') $('#menuBtn').setAttribute('aria-expanded', 'true');
  // focus the input if there is one, otherwise the panel (no stray focus ring on the close button)
  setTimeout(() => { const inp = el.querySelector('input:not([type=file])'), target = inp || el.querySelector('.modal-card') || el;
    if (!inp) target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); }, 60);
}
function closeAll(silent){
  stopCamera();
  $$('.drawer.on, .modal.on, .filters.on').forEach(el => { el.classList.remove('on'); el.setAttribute('aria-hidden', 'true'); });
  scrim.classList.remove('on'); document.body.style.overflow = ''; $('#menuBtn').setAttribute('aria-expanded', 'false');
  if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus({preventScroll:true});
}
scrim.addEventListener('click', () => closeAll());
$$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeAll(); }));
addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
$('#menuBtn').addEventListener('click', () => open('menu'));

/* ---------- Product panel ---------- */
function quickView(id){
  const p = byId(id); if (!p) return;
  const related = products.filter(x => x.id !== p.id && !x.soldOut && (x.family === p.family || x.brand === p.brand))
    .sort((a, b) => (b.brand === p.brand) - (a.brand === p.brand) || Math.abs(a.price - p.price) - Math.abs(b.price - p.price)).slice(0, 4);
  const details = [['Family', p.family], ['Concentration', p.concentration], ['Size', p.size], ['For', p.gender]].filter(d => d[1]);
  $('#qvCard').innerHTML = `<button class="icon-btn modal-close" data-close aria-label="Close">${xSvg}</button>
    <div class="pp-top"><div class="pp-media">${ph(p, true)}</div>
    <div class="pp-info"><span class="card-brand">${esc(p.brand)}</span><h3>${esc(p.name)}</h3><span class="pp-price">${fmt(p.price)}${p.soldOut ? ' · <span class="card-meta">Sold out</span>' : ''}</span>
      ${p.description ? `<p class="pp-desc">${esc(p.description)}</p>` : ''}
      ${p.notes.length ? `<p class="pp-label">Notes</p><div class="pp-notes">${p.notes.map(n => `<button data-note="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
      <dl class="pp-details">${details.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <div class="pp-buy"><button class="btn" data-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>${p.soldOut ? 'Sold out' : 'Add to bag · ' + fmt(p.price)}</button>
        <button class="wish ${wish.has(p.id) ? 'on' : ''}" data-wish="${esc(p.id)}" aria-label="Save" aria-pressed="${wish.has(p.id)}">${heartSvg}</button></div>
    </div></div>
    ${related.length ? `<div class="pp-more"><h4>You may also like</h4><div class="row">${related.map(card).join('')}</div></div>` : ''}`;
  if ($('#quick').classList.contains('on')) $('#qvCard').scrollTop = 0; else open('quick');
}

/* ---------- Bag & saved ---------- */
function bump(el){ el.hidden = false; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
function addToBag(id, btn){
  const p = byId(id); if (!p || p.soldOut) return;
  const it = bag.find(i => i.id === id); it ? it.qty++ : bag.push({ id, qty:1 });
  store('velunora_bag', bag); renderBag(); bump($('#bagCount'));
  if (btn && !btn.classList.contains('btn')){ const old = btn.innerHTML; btn.classList.add('done'); btn.innerHTML = btn.classList.contains('card-add-sm') ? checkSvg : 'Added';
    setTimeout(() => { btn.classList.remove('done'); btn.innerHTML = old; }, 1300); }
  toast(`${p.name} added to your bag`);
}
function renderBag(){
  const count = bag.reduce((a, i) => a + i.qty, 0), total = bag.reduce((a, i) => a + i.qty * byId(i.id).price, 0);
  $('#bagCount').textContent = count; $('#bagCount').hidden = !count; $('#tabBagDot').hidden = !count;
  $('#bagItems').innerHTML = bag.length ? bag.map(i => { const p = byId(i.id); return `<div class="line-item">
      <div data-qv="${esc(p.id)}">${ph(p)}</div>
      <div><small>${esc(p.brand)}</small><b>${esc(p.name)}</b>
        <div class="qty"><button data-dec="${esc(p.id)}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-inc="${esc(p.id)}" aria-label="Increase">+</button></div></div>
      <div class="li-right">${fmt(p.price * i.qty)}<button data-rm="${esc(p.id)}">Remove</button></div></div>`; }).join('')
    : `<div class="drawer-empty"><b>Your bag is empty</b>Find something you love in the collection.<br><button class="btn" data-filter="all">Start shopping</button></div>`;
  $('#bagFoot').hidden = !bag.length; $('#freeBar').hidden = !bag.length;
  $('#subtotal').textContent = fmt(total);
  const left = FREE_DELIVERY - total;
  $('#freeText').innerHTML = left > 0 ? `You're <b>${fmt(left)}</b> away from free delivery` : 'You qualify for <b>free delivery</b>';
  $('#freeFill').style.width = Math.min(100, total / FREE_DELIVERY * 100) + '%';
  const msg = 'Hello Velunora, I would like to order:\n' + bag.map(i => { const p = byId(i.id); return `• ${i.qty} × ${p.brand} ${p.name} (${fmt(p.price)})`; }).join('\n') + `\nSubtotal: ${fmt(total)}`;
  $('#waOrder').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
function toggleWish(id){
  wish.has(id) ? wish.delete(id) : wish.add(id); store('velunora_wish', [...wish]);
  $$(`[data-wish="${CSS.escape(id)}"]`).forEach(b => { b.classList.toggle('on', wish.has(id)); b.setAttribute('aria-pressed', wish.has(id)); });
  renderWish(); if (wish.size) bump($('#wishCount'));
  toast(wish.has(id) ? 'Saved for later' : 'Removed from saved');
}
function renderWish(){
  $('#wishCount').textContent = wish.size; $('#wishCount').hidden = !wish.size;
  $('#wishItems').innerHTML = wish.size ? [...wish].map(id => { const p = byId(id); return `<div class="line-item">
      <div data-qv="${esc(p.id)}">${ph(p)}</div>
      <div><small>${esc(p.brand)}</small><b>${esc(p.name)}</b><small>${fmt(p.price)}</small><br>
        <button class="li-add" data-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>${p.soldOut ? 'Sold out' : 'Add to bag'}</button></div>
      <div class="li-right"><span></span><button data-wish="${esc(p.id)}">Remove</button></div></div>`; }).join('')
    : `<div class="drawer-empty"><b>Nothing saved yet</b>Tap the heart on any fragrance to keep it here.<br><button class="btn" data-filter="all">Browse fragrances</button></div>`;
}
renderBag(); renderWish();
$('#checkoutBtn').addEventListener('click', () => toast('Online checkout is coming soon. Order on WhatsApp for now.'));

/* ---------- Search ---------- */
let si = $('#searchInput'), sr = $('#searchResults');
const sItem = p => `<button class="s-item" data-qv="${esc(p.id)}">${ph(p)}<span><b>${esc(p.brand)} ${esc(p.name)}</b><small>${esc(p.family || '')} · ${esc(p.size)}</small></span><span class="p">${fmt(p.price)}</span></button>`;
function renderSearch(input = si, box = sr){
  const q = input.value.trim(), list = q ? products.filter(p => matches(p, q)).slice(0, 8) : [];
  box.innerHTML = !q ? `<p class="s-empty">Popular searches</p><div class="s-chips">${['Oud','Vanilla','Lattafa','Armaf','Amber','Rose'].map(t => `<button data-s="${t}">${t}</button>`).join('')}</div>`
    : list.length ? list.map(sItem).join('') + `<button class="s-item" data-search-all style="grid-template-columns:1fr"><b>See all results for “${esc(q)}”</b></button>`
    : `<p class="s-empty">No matches for “${esc(q)}”. Try a brand, a note like “vanilla”, or search by photo.</p>`;
}
si.addEventListener('input', () => renderSearch());
const hs = $('#hsInput'), hd = $('#hsDrop');
hs.addEventListener('input', () => { renderSearch(hs, hd); hd.classList.add('on'); });
hs.addEventListener('focus', () => { renderSearch(hs, hd); hd.classList.add('on'); });
hs.addEventListener('keydown', e => {
  const items = $('.s-item', hd); let n = items.findIndex(x => x.classList.contains('hl'));
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); items[n] && items[n].classList.remove('hl'); n = (n + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[n] && items[n].classList.add('hl'); }
  if (e.key === 'Enter'){ e.preventDefault(); const it = items[n]; if (it) it.click(); else { hd.classList.remove('on'); searchAll(hs.value); } }
  if (e.key === 'Escape'){ hd.classList.remove('on'); hs.blur(); }
});
document.addEventListener('click', e => { if (!e.target.closest('.hsearch')) hd.classList.remove('on'); });
si.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); searchAll(si.value); } });
function searchAll(q){ applyFilter('all', false); F.q = q.trim(); renderShop(); $('#shop').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }

/* ---------- Scent finder ---------- */
const QUIZ = [
  { k:'gender', q:'Who is it for?', o:[['Women','For her'],['Men','For him'],['Unisex','For anyone'],['all','Surprise me']] },
  { k:'vibe', q:'Which mood speaks to you?', o:[['warm','Warm & sweet','Amber, vanilla, gourmand'],['woody','Woody & oud','Cedar, oud, leather'],['floral','Floral & fruity','Rose, jasmine, berries'],['fresh','Fresh & citrus','Zesty, green, airy']] },
  { k:'budget', q:'What is your budget?', o:[['30000','Under ₦30,000'],['70000','₦30,000 – ₦70,000'],['200000','₦70,000 – ₦200,000'],['any','No limit']] },
  { k:'when', q:'When will you wear it most?', o:[['day','Everyday','Office, errands, school'],['night','Evenings','Dinners and nights out'],['special','Special occasions','Weddings, events'],['all','All the time']] }
];
const VIBES = { warm:['Amber','Gourmand','Oriental'], woody:['Woody','Oud','Leather'], floral:['Floral','Fruity'], fresh:['Citrus','Aromatic','Fresh'] };
let quiz = {}, qStep = 0;
function renderFinder(){
  const c = $('#finderCard'), close = `<button class="icon-btn modal-close" data-close aria-label="Close">${xSvg}</button>`;
  const prog = `<div class="f-progress">${QUIZ.map((_, i) => `<i class="${i <= qStep ? 'on' : ''}"></i>`).join('')}</div>`;
  if (qStep < QUIZ.length){
    const s = QUIZ[qStep];
    c.innerHTML = close + prog + `<div class="f-step"><p class="eyebrow">Question ${qStep + 1} of ${QUIZ.length}</p><h3>${s.q}</h3>
      <div class="f-opts">${s.o.map(([v, l, d]) => `<button data-answer="${v}">${l}${d ? `<small>${d}</small>` : ''}</button>`).join('')}</div>
      ${qStep ? '<button class="f-back" data-back>Back</button>' : ''}</div>`;
  } else {
    const fams = VIBES[quiz.vibe] || [], max = quiz.budget === 'any' ? Infinity : +quiz.budget, min = { '30000':0, '70000':30000, '200000':70000 }[quiz.budget] || 0;
    const scored = products.filter(p => !p.soldOut).map(p => {
      let s = 0; if (fams.includes(p.family)) s += 3;
      if (quiz.gender === 'all' || p.gender === quiz.gender) s += 2; else if (p.gender === 'Unisex') s += 1; else s -= 3;
      if (p.price <= max && p.price >= min) s += 2; else if (p.price <= max) s += 1; else s -= 2;
      const strong = /Extrait|Parfum/.test(p.concentration || '');
      if ((quiz.when === 'night' || quiz.when === 'special') && strong) s += 1;
      if (quiz.when === 'day' && /Toilette|Cologne/.test(p.concentration || '')) s += 1;
      return { p, s }; }).sort((a, b) => b.s - a.s || a.p.price - b.p.price).slice(0, 4);
    c.innerHTML = close + prog + `<div class="f-step"><p class="eyebrow">Your matches</p><h3>We think you’ll love these</h3>
      <div class="f-results">${scored.map(({p}) => sItem(p)).join('')}</div>
      <div class="f-actions"><button class="btn btn-line" data-restart>Start again</button><button class="btn" data-finder-shop>Shop ${esc((fams[0] || 'all').toLowerCase())} scents</button></div></div>`;
  }
}
function startFinder(gender){ quiz = {}; qStep = 0; if (gender){ quiz.gender = gender; qStep = 1; } renderFinder(); open('finder'); }

/* ---------- Search by photo ----------
   Reads the bottle label in the browser (Tesseract.js, loaded on first use) and matches it to the catalogue. */
const camSvg = '<svg viewBox="0 0 24 24"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
const lens = { stream:null, worker:null, loading:null, phase:'idle' }; // phase: camera | reading | result
const lensClose = `<button class="icon-btn modal-close" data-close aria-label="Close">${xSvg}</button>`;
const lensHead = '<p class="eyebrow">Search by photo</p><h3>Find a perfume by its bottle</h3><p class="lens-hint">Point at the bottle and we’ll read the label.</p>';
function stopCamera(){ if (lens.stream){ lens.stream.getTracks().forEach(t => t.stop()); lens.stream = null; } }
async function openLens(){
  open('lens'); lens.phase = 'camera'; const c = $('#lensCard');
  const canCam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;
  c.innerHTML = lensClose + lensHead + `<div class="lens-view">${canCam ? '<video playsinline muted autoplay></video><div class="lens-corners"><i></i><i></i><i></i><i></i></div><span class="lens-status">Starting camera…</span>' : ''}</div>
    <div class="lens-actions"><button class="link" data-lens-upload>Upload a photo</button>${canCam ? '<button class="shutter" data-lens-shoot aria-label="Take photo"></button>' : '<span></span>'}<span></span></div>`;
  if (!canCam) return lensNoCamera();
  try {
    lens.stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' }, width:{ ideal:1920 }, height:{ ideal:1440 } }, audio:false });
    if (!$('#lens').classList.contains('on') || lens.phase !== 'camera') return stopCamera();
    const v = $('#lensCard video'); v.srcObject = lens.stream; await v.play().catch(() => {});
    const st = $('#lensCard .lens-status'); st && st.remove();
  } catch(e){ if (lens.phase === 'camera') lensNoCamera(); }
  preloadReader();
}
function lensNoCamera(){
  const view = $('#lensCard .lens-view'); if (!view) return;
  view.innerHTML = `<div class="lens-empty">${camSvg}<span>Take a clear photo of the label,<br>then we’ll find the perfume.</span><button class="btn" data-lens-upload>Take or upload a photo</button></div>`;
  const sh = $('#lensCard [data-lens-shoot]'); sh && sh.replaceWith(document.createElement('span'));
  preloadReader();
}
function loadScript(src){ return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
function preloadReader(){
  if (!lens.loading) lens.loading = (window.Tesseract ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'))
    .then(() => Tesseract.createWorker('eng')).then(w => (lens.worker = w)).catch(e => { lens.loading = null; throw e; });
  return lens.loading;
}
// enlarged, greyscale, high-contrast copy: reads stylised labels noticeably better
function enhanced(src){
  const s = Math.min(2, 1800 / Math.max(src.width, src.height)), c = document.createElement('canvas');
  c.width = Math.round(src.width * s); c.height = Math.round(src.height * s);
  const x = c.getContext('2d'); x.drawImage(src, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height), px = d.data; let lo = 255, hi = 0;
  for (let i = 0; i < px.length; i += 4){ const g = px[i] * .299 + px[i+1] * .587 + px[i+2] * .114; px[i] = g; if (g < lo) lo = g; if (g > hi) hi = g; }
  const k = 255 / Math.max(1, hi - lo);
  for (let i = 0; i < px.length; i += 4){ let g = (px[i] - lo) * k; g = (g - 128) * 1.35 + 128; px[i] = px[i+1] = px[i+2] = Math.max(0, Math.min(255, g)); }
  x.putImageData(d, 0, 0); return c;
}
async function lensRead(canvas){
  lens.phase = 'reading'; stopCamera();
  const view = $('#lensCard .lens-view'), url = canvas.toDataURL('image/jpeg', .9);
  view.innerHTML = `<img src="${url}" alt="Your photo"><div class="lens-scan"></div><span class="lens-status">${lens.worker ? 'Reading the label…' : 'Getting ready…'}</span>`;
  $('#lensCard .lens-actions').innerHTML = '';
  let text = '';
  try {
    await preloadReader();
    const st = $('#lensCard .lens-status'); if (st) st.textContent = 'Reading the label…';
    const a = await lens.worker.recognize(canvas); text = a.data.text;
    let res = lensMatch(text, products);
    if (!res[0] || res[0].score < 5){ const b = await lens.worker.recognize(enhanced(canvas)); text += ' ' + b.data.text; res = lensMatch(text, products); }
    lensResult(res, text);
  } catch(e){
    if (!$('#lens').classList.contains('on')) return;
    lensResult([], '', true);
  }
}
function lensResult(res, text, failed){
  if (!$('#lens').classList.contains('on') || lens.phase !== 'reading') return;
  lens.phase = 'result';
  const c = $('#lensCard'), top = res[0], sure = top && (top.score >= 5 || top.exact);
  const words = lensTokens(text).filter(w => w.length >= 4).slice(0, 4).join(' ');
  if (sure){
    const p = top.p, alts = res.slice(1, 3).filter(r => r.score >= 4 && r.score >= top.score * .6);
    c.innerHTML = lensClose + `<p class="eyebrow">Search by photo</p><h3>We found it</h3>
      <div class="lens-note">${checkSvg}${top.exact ? 'Matched exactly to the label in your photo.' : 'Matched to the label in your photo.'}</div>
      <div class="lens-found">${ph(p)}<div><span class="card-brand">${esc(p.brand)}</span><b>${esc(p.name)}</b><span class="price">${fmt(p.price)}</span>${p.soldOut ? ' <span class="card-meta">· Sold out</span>' : ''}</div></div>
      <div class="lens-btns"><button class="btn btn-line" data-qv="${esc(p.id)}">View this perfume</button><button class="btn" data-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>${p.soldOut ? 'Sold out' : 'Add to bag'}</button></div>
      ${alts.length ? `<div class="lens-alt"><p class="eyebrow">Not quite? Other close matches</p>${alts.map(({p}) => sItem(p)).join('')}</div>` : ''}
      <div class="lens-actions"><button class="link" data-lens>Scan another</button><span></span><span></span></div>`;
    return;
  }
  const maybe = res.slice(0, 3);
  c.innerHTML = lensClose + `<p class="eyebrow">Search by photo</p><h3>${failed ? 'The reader could not load' : maybe.length ? 'Is it one of these?' : 'We couldn’t read that label'}</h3>
    ${failed ? '<p class="lens-hint">Check your internet connection and try again.</p>' : maybe.length
      ? `<div class="lens-alt" style="margin-top:8px">${maybe.map(({p}) => sItem(p)).join('')}</div>`
      : `<p class="lens-hint" style="margin:0">For the best result:</p><ul class="lens-tips"><li>Fill the frame with the front label</li><li>Hold steady in good light, without glare</li><li>Keep the text upright</li></ul>`}
    ${words ? `<div class="lens-read">We read: “${esc(words)}”</div>` : ''}
    <div class="lens-btns"><button class="btn btn-line" data-lens>Try again</button>${words ? `<button class="btn" data-lens-search="${esc(words)}">Search “${esc(words.split(' ').slice(0, 2).join(' '))}”</button>` : '<button class="btn" data-open="search">Search by name</button>'}</div>`;
}
function lensShoot(){
  const v = $('#lensCard video'); if (!v || !v.videoWidth) return;
  const c = document.createElement('canvas'), s = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight));
  c.width = Math.round(v.videoWidth * s); c.height = Math.round(v.videoHeight * s); c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  lensRead(c);
}
$('#lensFile').addEventListener('change', e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  if (!$('#lens').classList.contains('on')){ open('lens'); $('#lensCard').innerHTML = lensClose + lensHead + '<div class="lens-view"></div><div class="lens-actions"></div>'; }
  const img = new Image(); img.onload = () => {
    const c = document.createElement('canvas'), s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src); lensRead(c);
  };
  img.src = URL.createObjectURL(f);
});

/* ---------- Global click handling ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button, a, [data-qv]'); if (!t) return;
  const d = t.dataset;
  if (d.close !== undefined || d.closeFilters !== undefined) return closeAll();
  if (d.lens !== undefined){ e.preventDefault(); return openLens(); }
  if (d.lensShoot !== undefined) return lensShoot();
  if (d.lensUpload !== undefined) return $('#lensFile').click();
  if (d.lensSearch){ closeAll(true); return searchAll(d.lensSearch); }
    if (d.open){ e.preventDefault(); if (d.open === 'search'){ open('search'); return renderSearch(); } return d.open === 'finder' ? startFinder() : open(d.open); }
  if (d.wish){ e.preventDefault(); e.stopPropagation(); return toggleWish(d.wish); }
  if (d.add){ e.preventDefault(); return addToBag(d.add, t); }
  if (d.qv){ e.preventDefault(); hd.classList.remove('on'); return quickView(d.qv); }
  if (d.filter){ e.preventDefault(); return applyFilter(d.filter); }
  if (d.gender){ F.gender = d.gender; shown = PAGE; return renderShop(); }
  if (d.unset){ const k = d.unset, v = d.val;
    if (k === 'gender') F.gender = 'all'; else if (k === 'fam') F.fams.delete(v); else if (k === 'brand') F.brands.delete(v);
    else if (k === 'price') F.price = 'any'; else if (k === 'edit') F.edit = ''; else if (k === 'q') F.q = ''; else if (k === 'stock') F.stock = false;
    shown = PAGE; return renderShop(); }
  if (d.clear !== undefined){ resetF(); shown = PAGE; return renderShop(); }
  if (d.note){ closeAll(true); applyFilter('all', false); F.q = d.note; renderShop(); return $('#shop').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }
  if (d.s){ const inHead = !!t.closest('.hsearch'), inp = inHead ? hs : si; inp.value = d.s; inp.focus(); return inHead ? renderSearch(hs, hd) : renderSearch(); }
  if (d.searchAll !== undefined){ const v = t.closest('.hsearch') ? hs.value : si.value; hd.classList.remove('on'); closeAll(true); return searchAll(v); }
  if (d.inc || d.dec || d.rm){ const id = d.inc || d.dec || d.rm, it = bag.find(i => i.id === id); if (!it) return;
    if (d.inc) it.qty++; if (d.dec) it.qty--; if (d.rm || it.qty < 1) bag = bag.filter(i => i.id !== id);
    store('velunora_bag', bag); return renderBag(); }
  if (d.answer){ quiz[QUIZ[qStep].k] = d.answer; qStep++; return renderFinder(); }
  if (d.back !== undefined){ qStep = Math.max(0, qStep - 1); return renderFinder(); }
  if (d.restart !== undefined){ quiz = {}; qStep = 0; return renderFinder(); }
  if (d.finderShop !== undefined){ const fam = (VIBES[quiz.vibe] || [])[0], g = quiz.gender; applyFilter(fam ? 'family:' + fam : 'all'); if (g && g !== 'all'){ F.gender = g; renderShop(); } return; }
});

/* ---------- Toast ---------- */
let tt; function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2400); }

/* ---------- Newsletter ---------- */
$('#newsForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); $('#newsOk').textContent = "You're on the list. Watch your inbox for new scents and deals."; });

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin:'0px 0px -6% 0px' });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Tab bar state ---------- */
const tabs = $$('.tabbar a');
addEventListener('scroll', () => { const inShop = $('#shop').getBoundingClientRect().top < innerHeight * .5 && $('#brands').getBoundingClientRect().top > innerHeight * .5;
  tabs[0].classList.toggle('on', !inShop); tabs[1].classList.toggle('on', inShop); }, {passive:true});
})();
