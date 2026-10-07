from pathlib import Path
import os,sys,subprocess,json,urllib.request,urllib.error
P=Path(__file__).resolve().parents[1];env=dict(os.environ,GIT_TERMINAL_PROMPT='0',GCM_INTERACTIVE='never')
p=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,check=True,env=env)
credential=dict(x.split('=',1) for x in p.stdout.splitlines() if '=' in x)
def api(path,method='GET',data=None):
 req=urllib.request.Request('https://api.github.com'+path,method=method,data=json.dumps(data).encode() if data is not None else None,headers={'Authorization':'Bearer '+credential['password'],'User-Agent':'Codex','Accept':'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'})
 with urllib.request.urlopen(req) as r:return json.load(r) if r.status!=204 else None
command=sys.argv[1];owner=api('/user')['login'];base=f'/repos/{owner}/brainrot-tv'
if command=='auth':print(json.dumps({'login':owner}))
elif command=='create':
 try:repo=api(base);print('Existing repository:',repo['html_url'])
 except urllib.error.HTTPError as e:
  if e.code!=404:raise
  repo=api('/user/repos','POST',{'name':'brainrot-tv','description':'BRAINROT TV — la vidéothèque de Samir. IA, outils, blockchain et actualité, en films courts.','private':False,'auto_init':False});print('Created',repo['html_url'])
 current=subprocess.run(['git','-C',str(P),'remote','get-url','github'],capture_output=True,text=True)
 if current.returncode:subprocess.run(['git','-C',str(P),'remote','add','github',repo['clone_url']],check=True)
elif command=='enable-pages':
 try:page=api(base+'/pages','POST',{'build_type':'workflow'})
 except urllib.error.HTTPError as e:
  if e.code not in [409,422]:raise
  page=api(base+'/pages','PUT',{'build_type':'workflow'})
 api(base,'PATCH',{'homepage':page['html_url']});print(json.dumps({'url':page['html_url'],'build_type':page.get('build_type')}))
elif command=='status':
 runs=api(base+'/actions/runs?per_page=3')['workflow_runs'];page=api(base+'/pages')
 print(json.dumps({'url':page['html_url'],'runs':[{'id':x['id'],'status':x['status'],'conclusion':x['conclusion'],'head_sha':x['head_sha'],'url':x['html_url']} for x in runs]}))
elif command=='logs':
 run=api(base+'/actions/runs?per_page=1')['workflow_runs'][0];jobs=api(base+f'/actions/runs/{run["id"]}/jobs')['jobs']
 print(json.dumps([{'name':j['name'],'conclusion':j['conclusion'],'steps':j['steps']} for j in jobs]))
