// Independent read-only audit. Writes only beside this script.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import zlib from 'node:zlib'
import { Matrix4, Vector3, Quaternion, Box3, REVISION, FrontSide } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const out = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(out, '../../../../../..')
const base = path.join(root, 'design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v01')
const read = name => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const bytes = fs.readFileSync(path.join(base, 'selected-a.glb'))
const profile = read('profile.json'), poses = read('poses.json'), manifest = read('manifest.json')
const files = read('files.json'), validation = read('validation.json')
const hashes = []
for (const pin of [...files.files.map(p => ({ ...p, relativePath: p.path })), ...files.inputs]) {
  const data = fs.readFileSync(path.resolve(base, pin.relativePath))
  hashes.push({ path: pin.relativePath, bytes: data.length, sha256: sha(data), matches: sha(data) === pin.sha256 && data.length === pin.bytes })
}
assert.ok(hashes.every(h => h.matches), 'Frozen file/input mismatch')
for (const key of ['export', 'editable', 'profile', 'poses', 'script']) {
  assert.equal(sha(fs.readFileSync(path.join(base, manifest[key].path))), manifest[key].sha256)
}
assert.equal(bytes.readUInt32LE(0), 0x46546c67)
assert.equal(bytes.readUInt32LE(4), 2)
assert.equal(bytes.readUInt32LE(8), bytes.length)
let offset = 12
const chunks = []
while (offset < bytes.length) {
  const size = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4)
  assert.equal(size % 4, 0); assert.ok(offset + 8 + size <= bytes.length)
  chunks.push({ type, data: bytes.subarray(offset + 8, offset + 8 + size) })
  offset += 8 + size
}
assert.equal(offset, bytes.length); assert.equal(chunks.length, 2)
assert.equal(chunks[0].type, 0x4e4f534a); assert.equal(chunks[1].type, 0x004e4942)
const doc = JSON.parse(chunks[0].data.toString('utf8')), bin = chunks[1].data
assert.equal(doc.buffers.length, 1); assert.equal(doc.buffers[0].uri, undefined)
assert.ok(bin.length - doc.buffers[0].byteLength >= 0 && bin.length - doc.buffers[0].byteLength <= 3)
const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
const formats = { 5121: [1, 'readUInt8'], 5123: [2, 'readUInt16LE'], 5125: [4, 'readUInt32LE'], 5126: [4, 'readFloatLE'] }
function data(index) {
  const a = doc.accessors[index], v = doc.bufferViews[a.bufferView]
  assert.equal(a.sparse, undefined); assert.equal(v.buffer, 0)
  const [size, method] = formats[a.componentType], width = widths[a.type]
  const start = (v.byteOffset ?? 0) + (a.byteOffset ?? 0), stride = v.byteStride ?? width * size
  assert.ok(Number.isInteger(a.count) && a.count > 0)
  assert.equal(start % size, 0); assert.ok(stride >= width * size && stride % size === 0)
  assert.ok(start + (a.count - 1) * stride + size * width <= (v.byteOffset ?? 0) + v.byteLength)
  assert.ok((v.byteOffset ?? 0) + v.byteLength <= doc.buffers[0].byteLength)
  const result = Array.from({ length: a.count }, (_, i) => Array.from({ length: width }, (_, k) => bin[method](start + i * stride + k * size)))
  assert.ok(result.flat().every(Number.isFinite))
  return result
}
const parent = new Map(), seen = new Set()
function visit(index, p = null) {
  assert.ok(Number.isInteger(index) && doc.nodes[index]); assert.ok(!seen.has(index), 'cycle or repeated node')
  seen.add(index); parent.set(index, p)
  for (const child of doc.nodes[index].children ?? []) visit(child, index)
}
assert.equal(doc.scenes.length, 1); assert.equal(doc.scenes[0].nodes.length, 1)
visit(doc.scenes[0].nodes[0]); assert.equal(seen.size, doc.nodes.length)
assert.equal(new Set(doc.nodes.map(n => n.name)).size, 22)
const near = (a, b, eps = 2e-6) => { assert.equal(a.length, b.length); a.forEach((x, i) => assert.ok(Math.abs(x - b[i]) <= eps, `${x} != ${b[i]}`)) }
const unit = q => assert.ok(Math.abs(Math.hypot(...q) - 1) < 1e-6)
const quaternion = q => new Quaternion(...q).normalize()
const matrix = t => new Matrix4().compose(new Vector3(...t.translation), quaternion(t.rotationXyzw), new Vector3(...t.scale))
const C = new Matrix4().makeRotationX(-Math.PI / 2)
const Ci = C.clone().invert()
const geometry = new Map(), materials = new Map(), nodes = []
let vertexRecords = 0, triangles = 0, degenerate = 0, maxNormalError = 0
for (let i = 0; i < doc.nodes.length; i++) {
  const node = doc.nodes[i], binding = profile.bindings.find(b => b.name === node.name)
  assert.ok(binding); assert.equal(node.matrix, undefined); assert.equal(node.skin, undefined)
  assert.equal(node.extras?.semanticBinding,node.name); assert.equal(node.extras?.movingBinding,binding.moving)
  assert.equal(parent.get(i) === null ? null : doc.nodes[parent.get(i)].name, binding.parent)
  const t = { translation: node.translation ?? [0,0,0], rotationXyzw: node.rotation ?? [0,0,0,1], scale: node.scale ?? [1,1,1] }
  unit(t.rotationXyzw); near(t.translation, binding.neutralGltfTRS.translation); near(t.scale, [1,1,1])
  near(matrix(t).elements, new Matrix4().multiplyMatrices(C, matrix({ translation: binding.neutralTranslationBlenderMetres, rotationXyzw: binding.neutralRotationXyzw, scale: binding.neutralScale })).multiply(Ci).elements)
  const rec = { name: node.name, parent: binding.parent, mesh: node.mesh, moving: binding.moving, trs: t, extras: node.extras }
  if (node.mesh !== undefined) {
    const mesh = doc.meshes[node.mesh]; assert.equal(mesh.primitives.length, 1)
    const prim = mesh.primitives[0]
    assert.deepEqual(Object.keys(prim.attributes).sort(), ['NORMAL', 'POSITION'])
    assert.equal(prim.mode ?? 4, 4); assert.equal(prim.targets, undefined); assert.equal(prim.extensions, undefined)
    for (const attr of ['POSITION', 'NORMAL']) { assert.equal(doc.accessors[prim.attributes[attr]].componentType, 5126); assert.equal(doc.accessors[prim.attributes[attr]].type, 'VEC3') }
    assert.ok([5121,5123,5125].includes(doc.accessors[prim.indices].componentType)); assert.equal(doc.accessors[prim.indices].type, 'SCALAR')
    const positions = data(prim.attributes.POSITION), normals = data(prim.attributes.NORMAL), indices = data(prim.indices).flat()
    assert.equal(positions.length, normals.length); assert.equal(indices.length % 3, 0)
    assert.ok(indices.every(i => Number.isInteger(i) && i >= 0 && i < positions.length))
    const min = [0,1,2].map(k => Math.min(...positions.map(p => p[k]))), max = [0,1,2].map(k => Math.max(...positions.map(p => p[k])))
    near(doc.accessors[prim.attributes.POSITION].min, min); near(doc.accessors[prim.attributes.POSITION].max, max)
    for (const normal of normals) maxNormalError = Math.max(maxNormalError, Math.abs(Math.hypot(...normal)-1))
    for (let j=0;j<indices.length;j+=3) {
      const a=new Vector3(...positions[indices[j]]),b=new Vector3(...positions[indices[j+1]]),c=new Vector3(...positions[indices[j+2]])
      if (b.sub(a).cross(c.sub(a)).length() < 1e-12) degenerate++
    }
    geometry.set(node.name, positions)
    rec.vertices = positions.length; rec.triangles = indices.length/3; rec.material = doc.materials[prim.material].name
    materials.set(rec.material, [...(materials.get(rec.material) ?? []), node.name])
    vertexRecords += positions.length; triangles += indices.length/3
  }
  nodes.push(rec)
}
assert.equal(degenerate, 0); assert.ok(maxNormalError < 1e-3)
assert.deepEqual(profile.requiredMovingNodes, profile.bindings.filter(b => b.moving).map(b => b.name))
assert.equal(profile.requiredMovingNodes.length, 10)
const actual = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
actual.scene.updateMatrixWorld(true)
const loaderNodes = [], uniqueGeometries = new Set(), uniqueMaterials = new Set()
actual.scene.traverse(ob => {
  if (ob.isMesh) {
    uniqueGeometries.add(ob.geometry); uniqueMaterials.add(ob.material)
    assert.equal(ob.material.side, FrontSide); assert.equal(ob.material.transparent, false)
    loaderNodes.push({ name: ob.name, geometryUuid: ob.geometry.uuid, materialUuid: ob.material.uuid, material: ob.material.name, emissive: ob.material.emissive.toArray(), emissiveIntensity: ob.material.emissiveIntensity, castShadow: ob.castShadow, receiveShadow: ob.receiveShadow })
  }
})
assert.equal(loaderNodes.length, 21); assert.equal(uniqueGeometries.size, 21); assert.equal(uniqueMaterials.size, 7)
assert.equal(actual.scene.getObjectByName('APA_eye_L').material, actual.scene.getObjectByName('APA_eye_R').material)
assert.notEqual(actual.scene.getObjectByName('APA_eye_L').material, actual.scene.getObjectByName('APA_tray_glow').material)
const trayMaterial=actual.scene.getObjectByName('APA_tray_glow').material
const authoredNeutral=poses.poses[0].trayEmissionStrength
const emissionMapping={
  authoredNeutral, loadedTrayColor:trayMaterial.emissive.toArray(), loadedTrayIntensity:trayMaterial.emissiveIntensity,
  loadedNeutralProduct:trayMaterial.emissive.toArray().map(v=>v*trayMaterial.emissiveIntensity),
  naiveIntensityAssignmentProduct:trayMaterial.emissive.toArray().map(v=>v*authoredNeutral),
  naiveToCorrectRatio:authoredNeutral/trayMaterial.emissiveIntensity,
  adaptation:'Use profile trayGlow baseColorLinear as emission color and authored strength as intensity, or rescale loaded intensity by target/neutral authored strength; do not multiply the baked neutral twice.'
}
const gltfBox = new Box3().setFromObject(actual.scene, true)
const byName = new Map(profile.bindings.map(b => [b.name,b]))
let maxConversionError = 0
for (const pose of poses.poses) {
  assert.deepEqual(Object.keys(pose.localGltfTRS).sort(), [...byName.keys()].sort())
  for (const [name, b] of Object.entries(pose.localBlenderTRS)) {
    const g = pose.localGltfTRS[name]; unit(b.rotationXyzw); unit(g.rotationXyzw); near(b.scale,[1,1,1]); near(g.scale,[1,1,1])
    const converted = C.clone().multiply(matrix(b)).multiply(Ci)
    const target = matrix(g)
    converted.elements.forEach((v,i)=>{maxConversionError=Math.max(maxConversionError,Math.abs(v-target.elements[i]))})
    near(converted.elements,target.elements)
  }
}
const box = new Box3(), sampleBounds = [], point = new Vector3()
let samples = 0
function poseWorld(a,b,t) {
  const world = new Map()
  function get(name) {
    if (world.has(name)) return world.get(name)
    const x=a.localGltfTRS[name],y=b.localGltfTRS[name]
    const m=new Matrix4().compose(new Vector3(...x.translation).lerp(new Vector3(...y.translation),t),quaternion(x.rotationXyzw).slerp(quaternion(y.rotationXyzw),t),new Vector3(1,1,1))
    const p=byName.get(name).parent;if(p)m.premultiply(get(p))
    world.set(name,m);return m
  }
  for(const name of byName.keys())get(name)
  return world
}
for (const a of poses.poses) for (const b of poses.poses) for (let step=0;step<=80;step++) {
  const world=poseWorld(a,b,step/80), one=new Box3()
  for(const [name,positions]of geometry)for(const p of positions)one.expandByPoint(point.fromArray(p).applyMatrix4(world.get(name)))
  box.union(one);samples++
  if(a===b&&step===0)sampleBounds.push({pose:a.name,min:one.min.toArray(),max:one.max.toArray()})
}
// Independent conservative bound: point speed under linear T, shortest-path Q, unit S.
let maxSpeed=0
for(const a of poses.poses)for(const b of poses.poses)for(const [leaf,positions]of geometry){
  let name=leaf,radius=Math.max(...positions.map(p=>Math.hypot(...p))),speed=0
  while(name){const x=a.localGltfTRS[name],y=b.localGltfTRS[name]
    speed+=new Vector3(...x.translation).distanceTo(new Vector3(...y.translation))+quaternion(x.rotationXyzw).angleTo(quaternion(y.rotationXyzw))*radius
    radius+=Math.max(Math.hypot(...x.translation),Math.hypot(...y.translation));name=byName.get(name).parent
  }maxSpeed=Math.max(maxSpeed,speed)
}
const conservative=validation.sweep.conservativeContinuousBoundsBlenderMetres
const expectedBox=new Box3(new Vector3(conservative.min[0],conservative.min[2],-conservative.max[1]),new Vector3(conservative.max[0],conservative.max[2],-conservative.min[1]))
assert.ok(expectedBox.containsBox(box),'Independent dense samples escape published bound')
const compression={raw:bytes.length,gzip9:zlib.gzipSync(bytes,{level:9}).length,brotli11:zlib.brotliCompressSync(bytes,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11}}).length}
const absent = Object.fromEntries(['animations','skins','cameras','images','textures'].map(key=>[key,doc[key]?.length??0]))
assert.ok(Object.values(absent).every(v=>v===0))
assert.equal(doc.extensions?.KHR_lights_punctual,undefined)
assert.ok(doc.nodes.every(n=>n.extensions===undefined&&n.camera===undefined&&n.skin===undefined))
const result={status:'PASS-independent-parser-loader-and-transform-checks',assetSha256:sha(bytes),nodeVersion:process.version,threeRevision:REVISION,hashes,counts:{nodes:doc.nodes.length,meshes:doc.meshes.length,primitives:loaderNodes.length,uniqueGeometries:uniqueGeometries.size,uniqueMaterials:uniqueMaterials.size,vertexRecords,triangles,degenerate,maxNormalError},compression,absent,extensionsUsed:doc.extensionsUsed,nodes,materialSharing:Object.fromEntries(materials),loaderNodes,emissionMapping,neutralGltfBounds:{min:gltfBox.min.toArray(),max:gltfBox.max.toArray()},poseConversionMaxMatrixError:maxConversionError,endpointGltfBounds:sampleBounds,sweep:{samples,intervalsPerPair:80,min:box.min.toArray(),max:box.max.toArray(),insidePublishedContinuousBound:true,maxSpeedMetresPerNormalizedTransition:maxSpeed,paddingForOriginal40Intervals:maxSpeed/80+1e-6,assumptions:'complete pose local TRS; unit scale; common nonovershooting interpolation parameter; shortest slerp; excludes runtime markers'},runtimeOwnership:'21 unique imported geometry identities and 7 material identities; dispose each once; no imported textures; generated marker allocations separately owned'}
for(const g of uniqueGeometries)g.dispose();for(const m of uniqueMaterials)m.dispose()
fs.writeFileSync(path.join(out,'inspection.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({status:result.status,counts:result.counts,compression,hashesChecked:hashes.length,poseConversionMaxMatrixError:maxConversionError,sweep:result.sweep},null,2))
