import * as THREE from 'three';
import { SceneResources } from '/source/resources.js';
import { STUDIO_VIEW } from '/source/view-config.js';
import { loadFullKit } from '/source/load-full-kit.js';
import { createFullStudio } from '/source/build-full-studio.js';
import { acceptedRenderer } from '/authored.js';

const params = new URLSearchParams(location.search);
const variant = params.get('variant') ?? 'baseline';
if (!['baseline','proposal'].includes(variant)) throw new Error('Invalid candidate variant');
const canvas = document.querySelector('canvas');
const resources = new SceneResources();
const abortController = new AbortController();
let renderer, scene, camera, placed, asset, disposed = false, pose, provenance, firstRender;
const cleanups = [];
const dispose = () => {
  if (disposed) return;
  disposed = true;
  abortController.abort();
  removeEventListener('resize', resize);
  const release = operation => {try {operation();} catch (error) {cleanups.push(String(error));}};
  release(()=>resources.dispose());
  release(()=>asset?.dispose());
  scene?.traverse(object=>{if(object.isLight && object.shadow) release(()=>object.shadow.dispose());});
  scene?.clear();
  release(()=>renderer?.dispose());
  release(()=>renderer?.forceContextLoss());
  document.documentElement.dataset.status = 'disposed';
};
addEventListener('pagehide',dispose,{once:true});
function resize() {
  if (disposed || !camera) return;
  renderer.setSize(innerWidth,innerHeight,false);
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  render();
}
function render() {
  if (disposed) throw new Error('Preview disposed');
  scene.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);
  renderer.render(scene,camera);
}
function setPose(next) {
  const yaw=Number(next.yaw), pitch=Number(next.pitch);
  if (!Number.isFinite(yaw)||!Number.isFinite(pitch)||yaw < -38 || yaw > 58 || pitch < -16 || pitch > 12) throw new Error('Pose outside frozen bounds');
  pose={yaw,pitch};
  const y=THREE.MathUtils.degToRad(yaw),p=THREE.MathUtils.degToRad(pitch);
  camera.lookAt(new THREE.Vector3(...STUDIO_VIEW.eye).add(new THREE.Vector3(Math.sin(y)*Math.cos(p),Math.sin(p),-Math.cos(y)*Math.cos(p))));
  render();
  return snapshot();
}
function snapshot() {
  const projections={};
  for (const id of ['dissertation','copilot','typeforge']) {
    const mesh=placed.getObjectByName(`target_${id}`);
    const position=mesh.geometry.attributes.position;
    const points=[];
    for(let i=0;i<position.count;i++) {
      const point=new THREE.Vector3().fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld).project(camera);
      points.push([(point.x+1)*innerWidth/2,(1-point.y)*innerHeight/2,point.z]);
    }
    projections[id]={pixelVertices:points,left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
  }
  const meshBounds={};
  placed.traverse(mesh => {
    if (!mesh.isMesh || !mesh.name) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const box=mesh.geometry.boundingBox;
    if (!box || box.isEmpty()) return;
    const corners=[];
    for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) for (const z of [box.min.z,box.max.z]) {
      const point=new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(camera);
      corners.push([(point.x+1)*innerWidth/2,(1-point.y)*innerHeight/2,point.z]);
    }
    meshBounds[mesh.name]={pixelBoxCorners:corners,left:Math.min(...corners.map(p=>p[0])),right:Math.max(...corners.map(p=>p[0])),top:Math.min(...corners.map(p=>p[1])),bottom:Math.max(...corners.map(p=>p[1]))};
  });
  return {variant,pose,meshBounds,fov:camera.fov,eye:camera.position.toArray(),viewport:[innerWidth,innerHeight],dpr:renderer.getPixelRatio(),canvas:[canvas.width,canvas.height],projections,renderer:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,memory:{...renderer.info.memory}},firstRender,provenance,scope:provenance.scope,cleanupErrors:[...cleanups]};
}
try {
  document.documentElement.dataset.status='loading';
  provenance=await fetch('/provenance.json').then(response=>response.json());
  asset=await loadFullKit(abortController.signal);
  if(disposed) {asset.dispose();throw new Error('Preview disposed during decode');}
  placed=asset.root;
  const model=createFullStudio(resources,placed);
  scene=model.scene;
  // Match the exact existing controller's unselected state after real binding.
  for(const target of model.targets)target.border.color.set('#6c5942');
  renderer=acceptedRenderer(canvas);
  const mobile=innerWidth <= 640 || innerWidth/innerHeight < .9;
  const proposed=variant==='proposal' && mobile;
  const requestedFov=params.has('fov')?Number(params.get('fov')):74;
  if(params.has('fov') && (!proposed || ![70,74,76].includes(requestedFov))) throw new Error('FOV override is only an authored mobile proposal candidate: 70, 74 or 76');
  const fov=proposed?requestedFov:mobile?STUDIO_VIEW.mobileFov:STUDIO_VIEW.desktopFov;
  camera=new THREE.PerspectiveCamera(fov,innerWidth/innerHeight,STUDIO_VIEW.near,STUDIO_VIEW.far);
  camera.position.set(...STUDIO_VIEW.eye);
  // DPR1 makes comparable bounded captures; no device-performance acceptance.
  renderer.setPixelRatio(1);
  renderer.setSize(innerWidth,innerHeight,false);
  const home=proposed?{yaw:-14,pitch:-7}:mobile?STUDIO_VIEW.mobileHome:STUDIO_VIEW.desktopHome;
  setPose(home);
  firstRender={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
  await document.fonts.ready;
  render();
  addEventListener('resize',resize);
  window.m1Preview={setPose,snapshot,dispose};
  document.documentElement.dataset.status='ready';
} catch(error) {
  dispose();
  document.documentElement.dataset.status='error';
  window.m1PreviewError=String(error);
  throw error;
}
