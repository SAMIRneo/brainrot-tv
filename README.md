# BRAINROT TV

La vidéothèque de Samir : six vidéos courtes sur l’IA, les outils, la blockchain et l’actualité. Site statique, mobile, léger, sans dépendance au runtime.

## Ouvrir en local

Servir le dossier `dist` avec un serveur HTTP, par exemple `python -m http.server 4173 --directory dist`.

## Ajouter une vidéo

1. Placer le MP4 dans `dist/media`. Préférer H.264/AAC, métadonnées faststart, et un fichier inférieur à 25 Mo.
2. Ajouter une affiche WebP de 720 × 1096 et sa variante 360 × 548 dans `dist/assets/posters`.
3. Ajouter des sous-titres WebVTT dans `dist/media` et les sources dans `dist/sources`.
4. Ajouter une entrée dans `dist/videos.json` en reprenant les champs d’un film existant. L’ordre du catalogue définit l’affichage. Le compteur et la durée cumulée sont calculés automatiquement.
5. Exécuter `node tools/check.mjs`, puis commiter et pousser. GitHub Pages déploie automatiquement le dossier `dist` via le workflow.

Les MP4 ne sont pas téléchargés à l’ouverture du site. Le lecteur charge uniquement le film sélectionné et est arrêté à sa fermeture. Les affiches sont responsives ; les polices sont locales. Navigation clavier, dialogue natif et réduction des animations sont pris en charge.

Les sous-titres sont déjà intégrés aux MP4. Une piste française optionnelle est également fournie pour les lecteurs qui la souhaitent.
