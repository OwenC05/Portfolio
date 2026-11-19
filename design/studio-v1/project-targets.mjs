// Verification-only projection of the authored monitor planes; actual picks are tested in browser.
import * as THREE from 'three';
const targets=[['dissertation',[-1.61,2.35,-.27],1.74,.98],['copilot',[-3.03,2.41,-.17],.74,1.24],['typeforge',[-.19,2.41,-.17],.74,1.24]];
const layouts=[[1440,759.0625,667.828125],[390,348,352],[320,286,352]];
const output={};
for(const [viewport,width,height] of layouts){
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,60);camera.position.set(...(viewport<=640?[-4,7,12]:[-8,6.5,11.5]));camera.lookAt(.3,1.8,0);camera.updateMatrixWorld(true);
 const projected=new THREE.Box3();for(const x of [-4.6,5.2])for(const y of [0,4.6])for(const z of [-2.3,2.5])projected.expandByPoint(new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
 const center=projected.getCenter(new THREE.Vector3()),size=projected.getSize(new THREE.Vector3()),aspect=width/height,hh=Math.max(size.y,size.x/aspect)*.5*1.06;
 Object.assign(camera,{left:center.x-hh*aspect,right:center.x+hh*aspect,top:center.y+hh,bottom:center.y-hh});camera.updateProjectionMatrix();
 output[viewport]=targets.map(([id,position,w,h])=>{const bounds=new THREE.Box2();for(const dx of [-w/2,w/2])for(const dy of [-h/2,h/2]){const p=new THREE.Vector3(position[0]+dx,position[1]+dy,position[2]+.054).project(camera);bounds.expandByPoint(new THREE.Vector2((p.x+1)*width/2,(1-p.y)*height/2));}const c=bounds.getCenter(new THREE.Vector2()),s=bounds.getSize(new THREE.Vector2());return{id,x:c.x,y:c.y,width:s.x,height:s.y,touchWidth:Math.max(44,s.x),touchHeight:Math.max(44,s.y)};});
}
console.log(JSON.stringify(output,null,2));
