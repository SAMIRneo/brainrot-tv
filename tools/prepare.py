from pathlib import Path
import sys,json,subprocess,shutil,re,html
P=Path(__file__).resolve().parents[1];D=P/'dist';O=P.parent/'outputs'
sys.path.insert(0,'C:/Users/samir/Desktop/Agents-IA-Le-Film/work/python')
sys.path.insert(0,str(P/'tools/python'))
from fontTools.ttLib import TTFont
from fontTools import subset
FF='C:/Users/samir/Desktop/Agents-IA-Le-Film/work/tools/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
FP=str(Path(FF).with_name('ffprobe.exe'))
for folder in ['media','assets/posters','assets/fonts','sources']: (D/folder).mkdir(parents=True,exist_ok=True)
for name,out in [('Inter','inter'),('SpaceGrotesk','space')]:
 font=TTFont(f'C:/Users/samir/Desktop/Agents-IA-Le-Film/assets/fonts/{name}.ttf');options=subset.Options();options.layout_features=['*'];subsetter=subset.Subsetter(options=options);subsetter.populate(unicodes=list(range(0x20,0x250))+list(range(0x2000,0x2070))+list(range(0x2190,0x21FF)));subsetter.subset(font);font.flavor='woff2';font.save(D/f'assets/fonts/{out}.woff2')
for f in Path('C:/Users/samir/Desktop/Agents-IA-Le-Film/assets/fonts').glob('*OFL*'):shutil.copy2(f,D/'assets/fonts'/f.name)
items=[
 {'id':'agents-ia','file':'Agents-IA-V3','title':'Les agents IA, sans le blabla.','category':'Intelligence artificielle','color':'#a996ff','teaser':'Skills, MCP, autonomie : ce qu’un agent peut vraiment faire.','description':'Un agent IA peut planifier une mission, utiliser des outils et exécuter des tâches. Skills, MCP, rôle du contrôle humain : un film pour comprendre son potentiel concret et ses limites.','posterAlt':'Affiche du film sur les agents IA, graphiques et typographie animée.','at':8},
 {'id':'hermes','file':'Hermes-Le-Plaidoyer','title':'Hermes plaide sa cause.','category':'Outils IA','color':'#ff9c67','teaser':'Un plaidoyer pas très sage pour un outil très sérieux.','description':'Un film publicitaire au ton d’avocat télé rétro pour découvrir Hermes, ses outils, sa mémoire et ses possibilités. Une mise en scène originale pour explorer un agent qui passe à l’action.','posterAlt':'Affiche rétro du film Hermes, au style de publicité d’avocat.','at':6},
 {'id':'blockchain','file':'Blockchain-Le-Film','title':'La blockchain, décryptée.','category':'Tech & concepts','color':'#d9ef61','teaser':'Des blocs, des preuves et beaucoup moins de mystère.','description':'Registre partagé, signatures, empreintes, consensus et smart contracts : un voyage visuel pour comprendre comment une blockchain fonctionne, et ce qu’elle ne garantit pas.','posterAlt':'Affiche du film blockchain, trois blocs reliés sur un fond sombre.','at':7},
 {'id':'lycees','file':'Lycees-Le-Point','title':'Lycées : comprendre la colère.','category':'Actualité','color':'#a5cde9','teaser':'Les faits, les revendications, un grille-pain très bavard.','description':'Le point au 7 octobre 2026 : revendications, mobilisation, violences documentées, maintien de l’ordre et réponses annoncées. Des sources attribuées et une dose d’autodérision dirigée vers l’IA.','posterAlt':'Affiche bleue du film Lycées, la colère, les faits, édition du 7 octobre 2026.','at':9,'datedNews':True}
]
for item in items:
 name=item.pop('file');at=item.pop('at');src=O/f'{name}.mp4';id=item['id']
 probe=json.loads(subprocess.check_output([FP,'-v','error','-show_format','-of','json',str(src)]));duration=float(probe['format']['duration']);item['duration']=duration
 item['durationLabel']=f'{round(duration)//60}:{round(duration)%60:02}';item['dateLabel']='7 octobre 2026'
 item['video']=f'media/{id}.mp4';shutil.copy2(src,D/item['video'])
 item['poster']=f'assets/posters/{id}.webp';item['posterSmall']=f'assets/posters/{id}-small.webp'
 for key,w in [('poster',720),('posterSmall',360)]:
  subprocess.run([FF,'-v','error','-y','-ss',str(at),'-i',str(src),'-frames:v','1','-vf',f'crop=1080:1644:0:0,scale={w}:{round(w*1644/1080)}','-c:v','libwebp','-quality','88',str(D/item[key])],check=True)
 srt=(O/f'{name}.srt').read_text(encoding='utf-8-sig');vtt='WEBVTT\n\n'+re.sub(r'(\d{2}:\d{2}:\d{2}),(\d{3})',r'\1.\2',srt)
 item['captions']=f'media/{id}.vtt';(D/item['captions']).write_text(vtt,encoding='utf-8')
 srcFile=O/f'{name}-sources.md' if id!='lycees' else O/'Lycees-Le-Point-sources.md'
 text=srcFile.read_text(encoding='utf-8-sig');blocks=[]
 for line in text.splitlines():
  if not line.strip():continue
  safe=html.escape(line.strip().lstrip('#').strip());safe=re.sub(r'https?://[^\s<>]+',lambda m:'<a href="'+m.group(0)+'" target="_blank" rel="noopener">'+m.group(0)+'</a>',safe)
  blocks.append(('<h2>'+safe+'</h2>') if line.startswith('#') else '<p>'+safe+'</p>')
 item['sources']=f'sources/{id}.html'
 (D/item['sources']).write_text('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sources — '+html.escape(item['title'])+'</title><link rel="stylesheet" href="../style.css"></head><body><main class="wrap source-document"><a href="../">← Retour à BRAINROT TV</a><h1>'+html.escape(item['title'])+'</h1><p>Sources et notes de production du film. Informations datées ; les outils et l’actualité peuvent évoluer.</p>'+''.join(blocks)+'</main></body></html>',encoding='utf-8')
(D/'videos.json').write_text(json.dumps({'videos':items},ensure_ascii=False,indent=2),encoding='utf-8')
print('Prepared',len(items),'films;',sum((D/v['video']).stat().st_size for v in items),'media bytes')
