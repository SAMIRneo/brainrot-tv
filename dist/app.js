'use strict';
const grid = document.querySelector('#video-grid');
const dialog = document.querySelector('#player-dialog');
const player = document.querySelector('#player');
const captionTrack = document.querySelector('#caption-track');
const nextButton = document.querySelector('#next-film');
const promoInline = document.querySelector('#promo-inline');
const widgetPlay = document.querySelector('#widget-play');
widgetPlay.hidden = false;
const updateWidget = () => {
  document.querySelector('#widget-play-label').textContent = promoInline.ended ? 'Revoir la vidéo' : promoInline.paused ? 'Lire la vidéo' : 'Mettre en pause';
  widgetPlay.querySelector('[aria-hidden]').textContent = promoInline.paused ? '▶' : 'Ⅱ';
};
widgetPlay.addEventListener('click', () => {
  if (promoInline.paused) {
    if (!promoInline.getAttribute('src')) { promoInline.src = promoInline.dataset.src; promoInline.load(); promoInline.hidden = false; document.querySelector('#widget-cover').hidden = true; }
    if (promoInline.ended) promoInline.currentTime = 0; promoInline.play().catch(() => { document.querySelector('#widget-error').hidden = false; }); }
  else promoInline.pause();
});
for (const event of ['play','pause','ended']) promoInline.addEventListener(event,updateWidget);
promoInline.addEventListener('play', () => { document.querySelector('.promo-widget').classList.add('is-playing'); document.querySelector('#widget-error').hidden = true; player.pause(); });
promoInline.addEventListener('error', () => { document.querySelector('#widget-error').hidden = false; });
let films = [], returnFocus, currentIndex = -1;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const editorial = {
  'attention': {label:'CULTURE NUMÉRIQUE',topics:['Attention','Publicité','Ton temps']},
  'agents-ia': {label:'AGENTS IA',topics:['Skills','MCP','Autonomie']},
  'hermes': {label:'HERMES',topics:['Outils','Mémoire','Exécution']},
  'blockchain': {label:'BLOCKCHAIN',topics:['Registre','Consensus','Preuves']},
  'lycees': {label:'ACTUALITÉ',topics:['Revendications','Faits','Sources']},
  'brainrot-tv-promo': {label:'LE MANIFESTE',topics:['Le site','Les films','Le club']}
};
function closePlayer() { if (dialog.open) dialog.close(); }
dialog.addEventListener('close', () => {
  player.pause(); player.removeAttribute('src'); captionTrack.removeAttribute('src'); player.load();
  document.body.classList.remove('locked'); returnFocus?.focus({preventScroll:true});
});
document.querySelector('#close-player').addEventListener('click', closePlayer);
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closePlayer();
});
player.addEventListener('error', () => { if (dialog.open && player.getAttribute('src')) document.querySelector('#player-error').hidden = false; });
function openFilm(film, trigger) {
  if (!film) return;
  if (trigger) returnFocus = trigger;
  currentIndex = films.findIndex(item => item.id === film.id);
  player.pause(); promoInline.pause();
  document.querySelector('#player-title').textContent = film.title;
  document.querySelector('#player-index').textContent = `LA COLLECTION / ${String(currentIndex+1).padStart(2,'0')} SUR ${String(films.length).padStart(2,'0')}`;
  document.querySelector('#player-category').textContent = film.category;
  document.querySelector('#player-category').style.setProperty('--accent', film.color);
  document.querySelector('#player-description').textContent = film.description;
  document.querySelector('#player-meta').textContent = `${film.durationLabel} · ${film.dateLabel}`;
  document.querySelector('#download-video').href = film.video;
  document.querySelector('#read-sources').href = film.sources;
  document.querySelector('#player-date-note').hidden = !film.datedNews;
  document.querySelector('#player-error').hidden = true;
  const next = films[(currentIndex+1)%films.length];
  nextButton.hidden = films.length < 2;
  document.querySelector('#next-film-title').textContent = next.title;
  nextButton.setAttribute('aria-label', `Regarder ensuite ${next.title}`);
  player.poster = film.poster; player.src = film.video; captionTrack.src = film.captions; player.load();
  document.body.classList.add('locked');
  if (!dialog.open) dialog.showModal();
  else { dialog.scrollTop = 0; document.querySelector('#close-player').focus({preventScroll:true}); }
  player.play().catch(() => {});
}
nextButton.addEventListener('click', () => openFilm(films[(currentIndex+1)%films.length]));
grid.addEventListener('click', event => {
  const trigger = event.target.closest('[data-film]');
  if (trigger) openFilm(films[Number(trigger.dataset.film)],trigger);
});
fetch('videos.json').then(response => {
  if (!response.ok) throw new Error('Catalogue indisponible'); return response.json();
}).then(data => {
  if (!Array.isArray(data.videos) || !data.videos.length) throw new Error('Catalogue vide');
  films = data.videos;
  for (const id of ['film-count','hero-count','header-count']) document.getElementById(id).textContent = String(films.length).padStart(2,'0');
  const seconds = Math.round(films.reduce((sum, film) => sum + film.duration, 0));
  document.querySelector('#library-stats').textContent = `${films.length} vidéos · ${Math.floor(seconds/60)} min ${String(seconds%60).padStart(2,'0')} de curiosité`;
  document.querySelector('.intro-bottom span:last-child').textContent = `${films.length} VIDÉOS / 0 PRISE DE TÊTE`;
  grid.innerHTML = films.map((film,index) => {
    const info = editorial[film.id] || {label:film.category,topics:[]};
    return `<article class="video-card ${index === 0 ? 'feed-featured' : ''}" data-id="${escapeHTML(film.id)}" style="--accent:${escapeHTML(film.color)}" aria-labelledby="title-${escapeHTML(film.id)}"><div class="card-stage">${index === 0 ? '<span class="featured-label">LE NOUVEAU FILM</span>' : ''}<button class="poster-button" data-film="${index}" aria-label="Regarder ${escapeHTML(film.title)}"><img src="${escapeHTML(film.poster)}" srcset="${escapeHTML(film.posterSmall)} 360w, ${escapeHTML(film.poster)} 720w" sizes="${index === 0 ? '(max-width:760px) 100vw, 50vw' : '(max-width:760px) 35vw, 33vw'}" width="720" height="1280" alt="${escapeHTML(film.posterAlt)}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"><span class="poster-duration">${escapeHTML(film.durationLabel)}</span><span class="poster-play" aria-hidden="true">▶</span></button></div><div class="card-content"><div class="card-top"><span class="category">${escapeHTML(info.label)}</span><span class="card-number">VOL. ${String(index+1).padStart(2,'0')}</span></div><h3 class="card-title" id="title-${escapeHTML(film.id)}"><button class="title-button" data-film="${index}">${escapeHTML(film.title)}</button></h3><p class="card-description">${escapeHTML(film.teaser)}</p><div class="card-topics">${info.topics.map(topic=>`<span>${escapeHTML(topic)}</span>`).join('')}</div><div class="card-action"><button class="watch-button" data-film="${index}" aria-label="Lancer ${escapeHTML(film.title)}"><span aria-hidden="true">▶</span> Regarder <span>${escapeHTML(film.durationLabel)}</span></button><span class="card-format">${escapeHTML(film.format || 'FILM VERTICAL')}</span></div></div></article>`;
  }).join('');
  grid.setAttribute('aria-busy','false');

}).catch(() => {
  grid.setAttribute('aria-busy','false');
  grid.innerHTML = '<p>Le catalogue ne se charge pas. <a href="./">Réessayer</a> ou ouvrir un film directement : <a href="media/agents-ia.mp4">Agents IA</a>, <a href="media/hermes.mp4">Hermes</a>, <a href="media/blockchain.mp4">Blockchain</a>, <a href="media/lycees.mp4">Lycées</a>, <a href="media/brainrot-tv-promo.mp4">Le spot</a>.</p>';
});
