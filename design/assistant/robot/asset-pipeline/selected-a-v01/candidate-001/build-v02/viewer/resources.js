import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
/** One ownership ledger also covers failures halfway through scene construction. */
export class SceneResources {
    geometries = new Set();
    materials = new Set();
    textures = new Set();
    instances = new Set();
    geometry(value) {
        this.geometries.add(value);
        return value;
    }
    material(value) {
        this.materials.add(value);
        return value;
    }
    texture(value) {
        this.textures.add(value);
        return value;
    }
    dispose() {
        let firstError;
        let failed = false;
        const release = (entries) => {
            const owned = Array.from(entries);
            entries.clear();
            owned.forEach((value) => {
                try {
                    value.dispose();
                }
                catch (error) {
                    if (!failed)
                        firstError = error;
                    failed = true;
                }
            });
        };
        release(this.instances);
        release(this.geometries);
        release(this.materials);
        release(this.textures);
        // Preserve error evidence after all independent resources have had their release attempt.
        if (failed)
            throw firstError;
    }
}
export function makePrimitives(resources) {
    const box = resources.geometry(new THREE.BoxGeometry(1, 1, 1));
    const rounded = resources.geometry(new RoundedBoxGeometry(1, 1, 1, 2, 0.07));
    const cylinder = resources.geometry(new THREE.CylinderGeometry(1, 1, 1, 24));
    const sphere = resources.geometry(new THREE.SphereGeometry(1, 16, 10));
    const torus = resources.geometry(new THREE.TorusGeometry(1, 0.09, 8, 32));
    const plane = resources.geometry(new THREE.PlaneGeometry(1, 1));
    const orientation = new THREE.Vector3(0, 1, 0);
    function mesh(parent, geometry, material, position, scale, rotation = [0, 0, 0], shadow = true) {
        const item = new THREE.Mesh(geometry, material);
        item.position.set(...position);
        item.scale.set(...scale);
        item.rotation.set(...rotation);
        item.castShadow = shadow;
        item.receiveShadow = true;
        parent.add(item);
        return item;
    }
    function rod(parent, material, from, to, radius = 0.025) {
        const start = new THREE.Vector3(...from);
        const end = new THREE.Vector3(...to);
        const delta = end.sub(start);
        const item = mesh(parent, cylinder, material, [0, 0, 0], [radius, delta.length(), radius]);
        item.position.copy(start).addScaledVector(delta, 0.5);
        item.quaternion.setFromUnitVectors(orientation, delta.normalize());
        return item;
    }
    return { box, rounded, cylinder, sphere, torus, plane, mesh, rod };
}
/** Bake static meshes into material/geometry batches, including repeated keys and rack parts. */
export function instanceStaticMeshes(scene, resources) {
    scene.updateMatrixWorld(true);
    const batches = new Map();
    scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh) || object.userData.interactive || Array.isArray(object.material))
            return;
        const key = `${object.geometry.uuid}:${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
        const batch = batches.get(key) ?? [];
        batch.push(object);
        batches.set(key, batch);
    });
    batches.forEach((batch) => {
        if (batch.length < 2)
            return;
        const first = batch[0];
        const instanced = new THREE.InstancedMesh(first.geometry, first.material, batch.length);
        instanced.castShadow = first.castShadow;
        instanced.receiveShadow = first.receiveShadow;
        batch.forEach((item, index) => {
            instanced.setMatrixAt(index, item.matrixWorld);
            item.removeFromParent();
        });
        instanced.instanceMatrix.needsUpdate = true;
        instanced.computeBoundingSphere();
        resources.instances.add(instanced);
        scene.add(instanced);
    });
}
