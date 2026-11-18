import fs from 'node:fs';
import {stat, rename, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGzip, createGunzip} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {Writable} from 'node:stream';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const raw=fileURLToPath(new URL('../integration/resize-wait-trace-v01/chromium-trace.json',import.meta.url));
const archive=raw+'.gz';
const receipt=new URL('./trace-archive.json',import.meta.url);
const expected={bytes:98562463,sha256:'57a9ec45ae4eabd556bd1b94cf601bc91e1c9be3120d8c64d702ca146d8c6a57'};
async function identity(stream){
 const hash=createHash('sha256');let bytes=0;
 await pipeline(stream,new Writable({write(chunk,_encoding,done){bytes+=chunk.length;hash.update(chunk);done();}}));
 return{bytes,sha256:hash.digest('hex')};
}
async function verifyArchive(){
 const hash=createHash('sha256');let bytes=0;
 await pipeline(fs.createReadStream(archive),createGunzip(),new Writable({write(chunk,_encoding,done){bytes+=chunk.length;hash.update(chunk);done();}}));
 assert.deepEqual({bytes,sha256:hash.digest('hex')},expected,'Archive does not restore the pinned trace');
 return identity(fs.createReadStream(archive));
}
const mode=process.argv[2];
if(mode==='archive'){
 assert.deepEqual(await identity(fs.createReadStream(raw)),expected,'Original trace differs');
 if(!fs.existsSync(archive)){
  const temporary=archive+'.tmp';
  await pipeline(fs.createReadStream(raw),createGzip({level:9}),fs.createWriteStream(temporary,{flags:'wx'}));
  if(fs.existsSync(archive))throw Error('Archive appeared concurrently; temporary copy retained');
  await rename(temporary,archive);
 }
 const compressed=await verifyArchive();
 await writeFile(receipt,JSON.stringify({at:new Date().toISOString(),format:'gzip',raw:{path:'integration/resize-wait-trace-v01/chromium-trace.json',...expected},archive:{path:'integration/resize-wait-trace-v01/chromium-trace.json.gz',...compressed},verifiedLossless:true,restore:'node design/assistant/robot/delivery/trace-archive.mjs restore',policy:'Original retained locally; Git carries the lossless archive. Historical raw-file hashes and reports stay unchanged.'},null,2)+'\n');
 console.log(JSON.stringify({mode,raw:expected,compressed,verifiedLossless:true}));
}else if(mode==='verify'){
 console.log(JSON.stringify({mode,compressed:await verifyArchive(),verifiedLossless:true}));
}else if(mode==='restore'){
 const compressed=await verifyArchive();
 if(fs.existsSync(raw)){
  assert.deepEqual(await identity(fs.createReadStream(raw)),expected,'Refusing to overwrite a different raw trace');
  console.log(JSON.stringify({mode,alreadyPresent:true,verifiedLossless:true}));
 }else{
  const temporary=raw+'.tmp';
  await pipeline(fs.createReadStream(archive),createGunzip(),fs.createWriteStream(temporary,{flags:'wx'}));
  assert.deepEqual(await identity(fs.createReadStream(temporary)),expected);
  if(fs.existsSync(raw))throw Error('Raw trace appeared concurrently; temporary copy retained');
  await rename(temporary,raw);
  assert.equal((await stat(raw)).size,expected.bytes);
  console.log(JSON.stringify({mode,restored:true,compressed,verifiedLossless:true}));
 }
}else throw Error('Use archive, verify or restore');
