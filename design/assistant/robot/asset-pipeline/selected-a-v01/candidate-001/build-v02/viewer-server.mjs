import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const base=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(base,'../../../../../../..');
if(path.basename(base)!=='build-v02')throw Error('Wrong write scope');
const leasePath=path.join(base,'viewer/lease.json');let lease;
const server=http.createServer((req,res)=>{
 if(req.method!=='GET'){res.writeHead(405);res.end();return;}
 const u=decodeURIComponent(new URL(req.url,'http://127.0.0.1:4195').pathname);
 let file;
 if(u==='/')file=path.join(base,'viewer/index.html');
 else if(u==='/asset.glb')file=path.join(base,'selected-a.glb');
 else if(u==='/poses.json')file=path.join(base,'poses.json');
 else if(u==='/pilot.glb')file=path.join(repo,'public/studio/pilot-right-limit-v03.glb');
 else if(u.startsWith('/three/')){const root=path.join(repo,'node_modules/three');file=path.resolve(root,u.slice(7));if(!file.startsWith(root+path.sep))file=null;}
 else {const root=path.join(base,'viewer');file=path.resolve(root,u.slice(1));if(!file.startsWith(root+path.sep))file=null;}
 if(!file||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 const ext=path.extname(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png'})[ext]??'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
});
server.on('error',err=>{console.error(err);process.exitCode=1;});
server.listen({host:'127.0.0.1',port:4195,exclusive:true},()=>{
 lease={pid:process.pid,port:4195,host:'127.0.0.1',startedAt:new Date().toISOString(),script:fileURLToPath(import.meta.url),status:'owned-listening'};fs.writeFileSync(leasePath,JSON.stringify(lease,null,2));console.log(JSON.stringify(lease));
});
process.stdin.setEncoding('utf8');process.stdin.on('data',data=>{if(data.trim()==='stop'){server.close(()=>{lease.status='closed';lease.closedAt=new Date().toISOString();fs.writeFileSync(leasePath,JSON.stringify(lease,null,2));console.log('OWNED_LEASE_CLOSED');process.exit(0);});server.closeAllConnections();}});
