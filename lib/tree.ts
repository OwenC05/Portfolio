import { ProjectNode } from '@/app/projects/data';
import * as THREE from 'three'

export const getChildren = (node?: ProjectNode): [ProjectNode | undefined, ProjectNode | undefined] => {
  return [node?.left, node?.right];
};

export const getParent = (root: ProjectNode, id: string): ProjectNode | null => {
  const queue: ProjectNode[] = [root];
  while (queue.length) {
    const current = queue.shift()!;
    if (current.left?.id === id || current.right?.id === id) return current;
    current.left && queue.push(current.left);
    current.right && queue.push(current.right);
  }
  return null;
};

export const getPathToNode = (root: ProjectNode, id: string): string[] => {
  const path: string[] = [];
  const dfs = (node: ProjectNode): boolean => {
    path.push(node.id);
    if (node.id === id) return true;
    if (node.left && dfs(node.left)) return true;
    if (node.right && dfs(node.right)) return true;
    path.pop();
    return false;
  };
  dfs(root);
  return path;
};

export const indexBySlug = (root: ProjectNode): Record<string, ProjectNode> => {
  const map: Record<string, ProjectNode> = {};
  const traverse = (node: ProjectNode) => {
    map[node.slug] = node;
    node.left && traverse(node.left);
    node.right && traverse(node.right);
  };
  traverse(root);
  return map;
};

export const indexById = (root: ProjectNode): Record<string, ProjectNode> => {
  const map: Record<string, ProjectNode> = {}
  const traverse = (node: ProjectNode) => {
    map[node.id] = node
    node.left && traverse(node.left)
    node.right && traverse(node.right)
  }
  traverse(root)
  return map
}

export const findNode = (root: ProjectNode, id: string): ProjectNode | undefined => {
  if (root.id === id) return root;
  const left = root.left ? findNode(root.left, id) : undefined;
  if (left) return left;
  return root.right ? findNode(root.right, id) : undefined;
};

// Compute layout coordinates for each node in a binary tree along a slope.
// depth -> vertical position, index -> horizontal position. Irregular trees
// are handled by assigning indices as if the tree were complete.
export const computeLayout = (
  root: ProjectNode,
  hGap = 220,
  vGap = 160
): Record<string, { x: number; y: number }> => {
  const positions: Record<string, { x: number; y: number }> = {};
  const queue: Array<{ node: ProjectNode; depth: number; index: number }> = [
    { node: root, depth: 0, index: 0 },
  ];
  while (queue.length) {
    const { node, depth, index } = queue.shift()!;
    positions[node.id] = { x: index * hGap, y: depth * vGap };
    if (node.left) queue.push({ node: node.left, depth: depth + 1, index: index * 2 });
    if (node.right) queue.push({ node: node.right, depth: depth + 1, index: index * 2 + 1 });
  }
  return positions;
};

// Compute 3D world positions for nodes on a tilted slope and CatmullRom curves for each edge.
// Coordinates: x spans horizontally across the slope, z goes downhill, y is up.
// depth increases z; index spreads x at each depth. Then apply slight jitter and slope offsets.
export const layoutBinarySlope = (
  root: ProjectNode,
  options?: {
    xGap?: number
    zGap?: number
    slopeAngleDeg?: number // for reference only; geometry tilts in scene
  }
) => {
  const xGap = options?.xGap ?? 5
  const zGap = options?.zGap ?? 6
  const positions: Record<string, THREE.Vector3> = {}
  const curves: Record<string, THREE.CatmullRomCurve3> = {}

  const q: Array<{ node: ProjectNode; depth: number; index: number }> = [
    { node: root, depth: 0, index: 0 },
  ]

  while (q.length) {
    const { node, depth, index } = q.shift()!
    // Horizontal offset by index within level, downhill by depth
    const x = (index - Math.pow(2, depth - 1)) * xGap || 0
    const z = depth * zGap
    const y = 0
    positions[node.id] = new THREE.Vector3(x, y, z)

    if (node.left) q.push({ node: node.left, depth: depth + 1, index: index * 2 })
    if (node.right) q.push({ node: node.right, depth: depth + 1, index: index * 2 + 1 })
  }

  // Curves between parent -> child along the slope, with a mid control lowered a bit (simulate carving)
  const makeCurve = (from: THREE.Vector3, to: THREE.Vector3) => {
    const mid = from.clone().lerp(to, 0.5)
    mid.y -= 0.2
    const c = new THREE.CatmullRomCurve3([from.clone(), mid, to.clone()], false, 'catmullrom', 0.5)
    return c
  }

  const queue2: ProjectNode[] = [root]
  while (queue2.length) {
    const n = queue2.shift()!
    const p = positions[n.id]
    if (n.left) {
      const key = `${n.id}->${n.left.id}`
      curves[key] = makeCurve(p, positions[n.left.id])
      queue2.push(n.left)
    }
    if (n.right) {
      const key = `${n.id}->${n.right.id}`
      curves[key] = makeCurve(p, positions[n.right.id])
      queue2.push(n.right)
    }
  }

  return { nodeWorldPos: positions, edgeCurves: curves }
}
