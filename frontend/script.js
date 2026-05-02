/* Nyxel V5 front-end script
   - Render one main available app (big feature block)
   - Render featured horizontal scroll (live + top-rated)
   - Render coming-soon grid (others) with disabled UI
   - Fixed stats display and improved filtering
*/

async function fetchApps(){
  try{
    const res = await fetch('/api/apps');
    if(!res.ok) throw new Error('Failed to fetch apps');
    return await res.json();
  }catch(err){
    console.error(err);
    return [];
  }
}

function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
  });
}

function formatNumber(n){
  if(!n && n !== 0) return '--';
  if(n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if(n >= 1000) return (n/1000).toFixed(1)+'K';
  return String(n);
}

function debounce(fn, ms){let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), ms); }}

function statusBadge(app){
  if(app.status === 'live') return `<span class="status-badge green">🟢 Fully Working</span>`;
  return `<span class="status-badge yellow">🟡 Coming Soon</span>`;
}

function createAvailableHTML(app){
  const features = (app.features && app.features.length) ? app.features : [
    'Reliable offline mode', 'Fast startup', 'Secure storage'
  ];
  const downloadBtn = app.status === 'live' ? `<a class="glow-btn big" href="/download?id=${encodeURIComponent(app.id)}">Download Now</a>` : `<div class="badge-small">Not Available</div>`;
  return `
    <div class="available-block">
      <div class="available-left">
        <div class="icon-large"><img src="${app.icon||'https://picsum.photos/seed/avail/128'}" alt="${escapeHtml(app.name)}"></div>
        <div class="available-meta">
          <h2 class="available-title">${escapeHtml(app.name)}</h2>
          <div class="available-badges">${statusBadge(app)}</div>
          <p class="available-desc">${escapeHtml(app.longDescription || app.description || '')}</p>
          <ul class="features-list">
            ${features.slice(0,5).map(f=>`<li>• ${escapeHtml(f)}</li>`).join('')}
          </ul>
          <div class="available-info">
            <div>Version <strong>${escapeHtml(app.version||'--')}</strong></div>
            <div>Size <strong>${escapeHtml(app.size||'--')}</strong></div>
            <div>Downloads <strong>${formatNumber(app.downloads||0)}</strong></div>
            <div>Rating <strong>${(app.rating||0).toFixed(1)}</strong></div>
          </div>
        </div>
      </div>
      <div class="available-right">
        <div class="available-action">${downloadBtn}</div>
        <div class="available-preview"><img src="${app.banner||app.icon||'https://picsum.photos/seed/avail-banner/600/300'}" alt="Preview"></div>
      </div>
    </div>
  `;
}

function createFeaturedCard(app){
  const rating = (app.rating||0).toFixed(1);
  return `
    <div class="featured-card ${app.status==='live' ? 'live':''}">
      <img src="${app.banner||app.icon||'https://picsum.photos/seed/default/400/200'}" alt="${escapeHtml(app.name)}">
      <div class="fmeta">
        <div style="display:flex;justify-content:space-between;align-items:center"><strong>${escapeHtml(app.name)}</strong><span class="badge">★ ${rating}</span></div>
        <div class="muted" style="font-size:12px;margin-top:6px">${formatNumber(app.downloads)} • ${escapeHtml(app.category||'')}</div>
      </div>
    </div>
  `;
}

function createComingSoonCard(app){
  return `
    <div class="app-card coming-soon">
      <div class="top">
        <div class="icon"><img src="${app.icon||'https://picsum.photos/seed/icon/128'}" alt="${escapeHtml(app.name)}" style="width:100%;height:100%;object-fit:cover"></div>
        <div class="meta">
          <h4>${escapeHtml(app.name)} ${statusBadge(app)}</h4>
          <div class="cat">${escapeHtml(app.category||'')} • <span class="stars">★ ${(app.rating||0).toFixed(1)}</span></div>
          <div class="stats">${formatNumber(app.downloads)} • ${escapeHtml(app.size||'--')} • v${escapeHtml(app.version||'--')}</div>
        </div>
      </div>
      <div class="desc">${escapeHtml(app.description||'')}</div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const apps = await fetchApps();

  // Populate category filter
  const categories = Array.from(new Set(apps.map(a=>a.category||'Uncategorized'))).sort();
  const catSelect = document.getElementById('category-filter');
  if(catSelect){ categories.forEach(c=>{ const opt = document.createElement('option'); opt.value = c; opt.textContent = c; catSelect.appendChild(opt); }); }

  // Fixed stats (restored values)
  const statApps = document.getElementById('stat-apps'); if(statApps) statApps.textContent = '1200+';
  const statDownloads = document.getElementById('stat-downloads'); if(statDownloads) statDownloads.textContent = '2.5M+';
  const statRating = document.getElementById('stat-rating'); if(statRating) statRating.textContent = '4.6';

  // main available app: use the user's custom app instead of Aurora Notes
  const customApp = {
    id: 'nyxel-image',
    name: 'Nyxel Image Security',
    version: '1.0.1',
    description: 'Protect and manage your images locally with strong encryption and secure sharing.',
    longDescription: 'Nyxel Image Security protects your photos with advanced, on-device encryption designed for privacy-first users. Your images never leave your control — secured with modern cryptography and protected by multi-layer authentication.\n\nBuilt with a focus on speed, security, and simplicity, Nyxel ensures your personal and sensitive images stay private at all times.\n\nUnlike standard gallery apps, Nyxel is built with a security-first architecture, combining strong encryption with a clean, minimal interface.\n\nNo tracking. No data collection. No compromises.\n\nNyxel does not collect, store, or share your personal data. All encryption and processing happen entirely on your device.',
    icon: '/media/ic_launcher_foreground.webp',
    banner: 'https://picsum.photos/seed/nyxel-image/1200/300',
    screenshots: [],
    apk: 'APP_apk_file.apk',
    category: 'Security',
    rating: 4.6,
    downloads: 1200,
    size: '20 MB',
    developer: 'Nyxel Labs',
    status: 'live',
    features: ['Encrypted on-device vault', 'PIN & biometric unlock', 'Secure share links', 'Encrypted backups (optional)', 'Image tamper detection']
  };

  const availableEl = document.getElementById('available-app');
  if(availableEl){
    let html = createAvailableHTML(customApp);
    availableEl.innerHTML = html;
    // Replace the preview image with a single large download button (keep only this)
    const previewEl = availableEl.querySelector('.available-preview');
    if(previewEl){
      // Link directly to the static APK file and suggest a user-friendly filename
      previewEl.innerHTML = '<a class="download-large glow-btn" href="/APP_apk_file.apk" download="Nyxel_img_secure.apk" target="_blank" rel="noopener noreferrer">Download Now</a>';
    }
    // Remove the smaller inline action so only one Download button remains
    const actionEl = availableEl.querySelector('.available-action');
    if(actionEl) actionEl.remove();
  }

  // Featured: show custom app first then top-rated others excluding Aurora (id '1')
  const featuredEl = document.getElementById('featured-scroll');
  if(featuredEl){
    const others = apps.filter(a=>a.id !== '1').slice().sort((a,b)=>(b.rating||0)-(a.rating||0));
    const featured = [customApp].concat(others.slice(0,5));
    featuredEl.innerHTML = featured.map(createFeaturedCard).join('');
  }

  // Coming soon grid: exclude Aurora (id '1') and any live entries
  const comingEl = document.getElementById('coming-soon-grid');
  function renderComingSoon(list){
    if(!comingEl) return;
    if(!list || !list.length){ comingEl.innerHTML = '<p class="muted">No upcoming apps.</p>'; return; }
    comingEl.innerHTML = list.map(createComingSoonCard).join('');
    const appsCountEl = document.getElementById('apps-count'); if(appsCountEl) appsCountEl.textContent = list.length;
  }

  const comingList = apps.filter(a=> a.id !== '1' && a.status !== 'live').slice().sort((a,b)=>(b.rating||0)-(a.rating||0));
  renderComingSoon(comingList);

  // Top rated sidebar
  const topRatedEl = document.getElementById('top-rated');
  if(topRatedEl){
    const top = apps.slice().sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,6);
    topRatedEl.innerHTML = top.map(t=>`<li><img src="${t.icon||'https://picsum.photos/seed/top/64'}" alt=""><div><strong>${escapeHtml(t.name)}</strong><div class="muted">★ ${t.rating?.toFixed(1)} • ${formatNumber(t.downloads)}</div></div></li>`).join('');
  }

  // If this is the dedicated app detail page, populate fields from apps or the custom app
  const appNameEl = document.getElementById('app-name');
  if(appNameEl){
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id') || customApp.id;
    const appMeta = apps.find(a => String(a.id) === String(idParam)) || customApp;
    document.getElementById('app-name').textContent = appMeta.name || 'App';
    const versionEl = document.getElementById('app-version'); if(versionEl) versionEl.textContent = 'Version ' + (appMeta.version || '--');
    const descEl = document.getElementById('app-desc'); if(descEl) descEl.textContent = appMeta.description || '';
    const fullDescEl = document.getElementById('app-full-desc'); if(fullDescEl) fullDescEl.textContent = appMeta.longDescription || '';
    const devEl = document.getElementById('app-dev'); if(devEl) devEl.textContent = appMeta.developer || '';
    const catEl = document.getElementById('app-cat'); if(catEl) catEl.textContent = appMeta.category || '';
    const sizeEl = document.getElementById('app-size'); if(sizeEl) sizeEl.textContent = appMeta.size || '';
    const downloadsEl = document.getElementById('app-downloads'); if(downloadsEl) downloadsEl.textContent = formatNumber(appMeta.downloads || 0);
    const ratingEl = document.getElementById('app-rating'); if(ratingEl) ratingEl.textContent = (appMeta.rating || 0).toFixed(1);
    const downloadBtn = document.getElementById('download-btn');
    if(downloadBtn){
      // Prefer linking directly to the APK when available as a static file.
      if (appMeta.apk && !/^https?:\/\//i.test(appMeta.apk)) {
        downloadBtn.href = '/' + appMeta.apk.replace(/^\//, '');
      } else {
        // fallback to original download endpoint when apk is a remote URL
        downloadBtn.href = '/download?id=' + encodeURIComponent(appMeta.id);
      }
      // For the Nyxel app, suggest the corrected filename to the browser
      if (String(appMeta.id) === 'nyxel-image') {
        downloadBtn.setAttribute('download', 'Nyxel_img_secure.apk');
      } else {
        downloadBtn.removeAttribute('download');
      }
      downloadBtn.target = '_blank';
      downloadBtn.rel = 'noopener noreferrer';
    }
  }

  // Filters: search and category affect coming soon list
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  function applyFilters(){
    let filtered = apps.filter(a=>a.status !== 'live');
    const q = searchInput?.value?.toLowerCase?.() || '';
    const cat = catSelect?.value || '';
    if(q){ filtered = filtered.filter(a=> (a.name||'').toLowerCase().includes(q) || (a.description||'').toLowerCase().includes(q) || (a.developer||'').toLowerCase().includes(q) ); }
    if(cat){ filtered = filtered.filter(a=> a.category === cat); }
    const sort = sortSelect?.value || 'featured';
    if(sort === 'rating') filtered.sort((a,b)=>(b.rating||0)-(a.rating||0));
    else if(sort === 'downloads') filtered.sort((a,b)=>(b.downloads||0)-(a.downloads||0));
    else if(sort === 'newest') filtered.sort((a,b)=> parseFloat(b.version || 0) - parseFloat(a.version || 0));
    else filtered.sort((a,b)=> (b.rating||0)-(a.rating||0));
    renderComingSoon(filtered);
  }

  if(searchInput) searchInput.addEventListener('input', debounce(applyFilters, 180));
  if(sortSelect) sortSelect.addEventListener('change', applyFilters);
  if(catSelect) catSelect.addEventListener('change', applyFilters);

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  if(hamburger) hamburger.addEventListener('click', ()=> document.body.classList.toggle('sidebar-open'));

  // scroll tint
  function updateScrollPosition(){
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if(h <= 0) return document.body.setAttribute('data-pos','top');
    const pct = window.scrollY / h;
    if(pct < 0.33) document.body.setAttribute('data-pos','top');
    else if(pct < 0.66) document.body.setAttribute('data-pos','mid');
    else document.body.setAttribute('data-pos','bottom');
  }
  updateScrollPosition(); window.addEventListener('scroll', debounce(updateScrollPosition, 60));

});

