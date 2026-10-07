'use strict';
const grid = document.querySelector('#video-grid');
const dialog = document.querySelector('#player-dialog');
const player = document.querySelector('#player');
const captionTrack = document.querySelector('#caption-track');
let films = [], returnFocus;
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function closePlayer() { if (dialog.open) dialog.close(); }
dialog.addEventListener('close', () => { player.pause(); player.removeAttribute('src'); captionTrack.removeAttribute('src'); player.load(); document.body.classList.remove('locked'); returnFocus?.focus(); });
document.querySelector('#close-player').addEventListener('click', closePlayer);
dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closePlayer(); });
player.addEventListener('error', () => { if (dialog.open) document.querySelector('#player-error').hidden = false; });
function openFilm(film, trigger) {
  returnFocus = trigger;
  document.querySelector('#player-title').textContent = film.title;
  document.querySelector('#player-category').textContent = film.category;
  document.querySelector('#player-category').style.setProperty('--accent', film.color);
  document.querySelector('#player-description').textContent = film.description;
  document.querySelector('#player-meta').textContent = `${film.durationLabel} · ${film.dateLabel}`;
  document.querySelector('#download-video').href = film.video;
  document.querySelector('#read-sources').href = film.sources;
  document.querySelector('#player-date-note').hidden = !film.datedNews;
  document.querySelector('#player-error').hidden = true;
  player.poster = film.poster;
  player.src = film.video;
  captionTrack.src = film.captions;
  player.load();
  document.body.classList.add('locked');
  dialog.showModal();
  player.play().catch(() => {});
}
fetch('videos.json').then(response => { if (!response.ok) throw new Error('Catalogue indisponible'); return response.json(); }).then(data => {
  films = data.videos;
  document.querySelector('#film-count').textContent = String(films.length).padStart(2, '0');
  document.querySelector('#hero-count').textContent = String(films.length).padStart(2, '0');
  const seconds = Math.round(films.reduce((sum, film) => sum + film.duration, 0));
  document.querySelector('#library-stats').textContent = `${films.length} films · ${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2,'0')} de curiosité`;
  grid.innerHTML = films.map((film, index) => `<article class="video-card" style="--accent:${escapeHTML(film.color)}"><button class="poster-button" data-film="${index}" aria-label="Regarder ${escapeHTML(film.title)}"><img src="${escapeHTML(film.poster)}" srcset="${escapeHTML(film.posterSmall)} 360w, ${escapeHTML(film.poster)} 720w" sizes="(max-width:740px) calc((100vw - 52px)/2), (max-width:1440px) calc((100vw - 146px)/4), 320px" width="720" height="1096" alt="${escapeHTML(film.posterAlt)}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"><span class="poster-number" aria-hidden="true">VOL. ${String(index + 1).padStart(2,'0')}</span><span class="poster-duration">${escapeHTML(film.durationLabel)}</span><span class="poster-play" aria-hidden="true">▶</span></button><div class="card-tags"><span class="category">${escapeHTML(film.category)}</span><span class="card-format">FILM VERTICAL</span></div><h3 class="card-title"><button class="title-button" data-film="${index}">${escapeHTML(film.title)}</button></h3><p class="card-description">${escapeHTML(film.teaser)}</p></article>`).join('');
  grid.addEventListener('click', event => { const trigger = event.target.closest('[data-film]'); if (trigger) openFilm(films[Number(trigger.dataset.film)],trigger); });
}).catch(() => { grid.innerHTML = '<p>Le répertoire est momentanément indisponible. <a href="./">Recharger la page</a>.</p>'; });
