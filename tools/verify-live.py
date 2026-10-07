from pathlib import Path
import json,hashlib,urllib.request,concurrent.futures,subprocess,sys
P=Path(__file__).resolve().parents[1];D=P/'dist';origin='https://samirneo.github.io/brainrot-tv/'
revision=sys.argv[1] if len(sys.argv)>1 else subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip()
def check(f):
 rel=f.relative_to(D).as_posix();req=urllib.request.Request(origin+rel,headers={'Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=60) as r:
  committed=subprocess.check_output(['git','show',revision+':dist/'+rel],cwd=P)
  body=r.read();assert r.status==200;assert hashlib.sha256(body).digest()==hashlib.sha256(committed).digest(),rel
 return rel
files=[f for f in D.rglob('*') if f.is_file()]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(check,files))
print(json.dumps({'origin':origin,'matched':len(results),'files':results},indent=2))
