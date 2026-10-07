import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve('dist');const data=JSON.parse(fs.readFileSync(path.join(root,'videos.json'),'utf8'));
assert(data.videos.length>0);const ids=new Set();
for(const video of data.videos){assert(!ids.has(video.id));ids.add(video.id);for(const key of ['video','poster','posterSmall','captions','sources']){assert(typeof video[key]==='string');const p=path.resolve(root,video[key]);assert(p.startsWith(root+path.sep));assert(fs.statSync(p).isFile(),`Missing ${key} for ${video.id}`);}assert(video.duration>0);assert(fs.readFileSync(path.join(root,video.captions),'utf8').startsWith('WEBVTT'));assert(/^#[0-9a-f]{6}$/i.test(video.color));}
for(const name of ['index.html','style.css','upgrade.css','app.js','assets/favicon.svg','assets/fonts/space.woff2','assets/fonts/inter.woff2'])assert(fs.statSync(path.join(root,name)).isFile());
console.log(`Validated ${data.videos.length} complete video entries; all local assets, captions and source pages exist.`);
