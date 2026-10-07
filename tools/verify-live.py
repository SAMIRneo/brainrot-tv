from pathlib import Path
import json,hashlib,urllib.request,concurrent.futures
P=Path(__file__).resolve().parents[1];D=P/'dist';origin='https://samirneo.github.io/brainrot-tv/'
def check(f):
 rel=f.relative_to(D).as_posix();req=urllib.request.Request(origin+rel,headers={'Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=60) as r:
  body=r.read();assert r.status==200;assert hashlib.sha256(body).digest()==hashlib.sha256(f.read_bytes()).digest(),rel
 return rel
files=[f for f in D.rglob('*') if f.is_file()]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(check,files))
print(json.dumps({'origin':origin,'matched':len(results),'files':results},indent=2))
