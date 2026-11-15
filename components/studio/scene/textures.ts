import * as THREE from 'three';
import type { ProjectId } from '@/lib/studio-contract';
import type { SceneResources } from './resources';

function canvasTexture(resources: SceneResources, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Studio texture canvas is unavailable');
  draw(context);
  const texture = resources.texture(new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Deterministic painting keeps every load, capture and review identical. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Honey desk timber: broad tonal streaks under fine grain that runs along the long edge. */
export function woodTexture(resources: SceneResources) {
  const texture = canvasTexture(resources, 1024, 256, (ctx) => {
    const random = seeded(11);
    ctx.fillStyle = '#a17853';
    ctx.fillRect(0, 0, 1024, 256);
    for (let band = 0; band < 26; band++) {
      const y = random() * 256;
      ctx.fillStyle = band % 2 === 0 ? 'rgba(92,62,38,.10)' : 'rgba(224,180,128,.10)';
      ctx.fillRect(0, y, 1024, 5 + random() * 22);
    }
    for (let line = 0; line < 210; line++) {
      const y = line * 1.22 + random() * 0.8;
      const phase = random() * 6.28;
      const sway = 1.2 + random() * 2.2;
      ctx.strokeStyle = line % 3 === 0 ? 'rgba(86,58,36,.26)' : 'rgba(214,174,124,.17)';
      ctx.lineWidth = line % 9 === 0 ? 1.7 : 0.7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.0123 + phase) * sway + Math.sin(x * 0.041 + line) * 0.5);
      }
      ctx.stroke();
    }
    // Short pores stop the surface reading as printed stripes at desk distance.
    ctx.strokeStyle = 'rgba(70,46,28,.22)';
    ctx.lineWidth = 1;
    for (let pore = 0; pore < 520; pore++) {
      const x = random() * 1024;
      const y = random() * 256;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 5 + random() * 16, y + (random() - 0.5) * 1.2);
      ctx.stroke();
    }
  });
  texture.anisotropy = 8;
  return texture;
}

/** Smoked floorboards running toward the viewer; six staggered planks per tile. */
export function floorTexture(resources: SceneResources) {
  const texture = canvasTexture(resources, 512, 512, (ctx) => {
    const random = seeded(29);
    const plank = 512 / 6;
    const tones = ['#4c4136', '#55493c', '#473d33', '#514538', '#4a4035', '#584b3d'];
    for (let index = 0; index < 6; index++) {
      const x = index * plank;
      const joint = random() * 512;
      ctx.fillStyle = tones[index];
      ctx.fillRect(x, 0, plank, 512);
      ctx.fillStyle = tones[(index + 3) % 6];
      ctx.fillRect(x, joint, plank, 190 + random() * 120);
      ctx.fillRect(x, joint - 512, plank, 190 + random() * 120);
      for (let grain = 0; grain < 15; grain++) {
        const gx = x + 3 + random() * (plank - 6);
        ctx.strokeStyle = grain % 2 === 0 ? 'rgba(28,22,17,.24)' : 'rgba(150,126,98,.13)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        // Whole sine periods per tile keep the repeat seamless.
        for (let y = 0; y <= 512; y += 16) ctx.lineTo(gx + Math.sin(y * Math.PI / 128 + grain) * 1.4, y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(18,14,11,.72)';
      ctx.fillRect(x, joint, plank, 2);
      ctx.fillRect(x, (joint + 256) % 512, plank, 2);
      ctx.fillRect(x - 1, 0, 2.2, 512);
    }
    ctx.fillStyle = 'rgba(18,14,11,.72)';
    ctx.fillRect(510.8, 0, 1.2, 512);
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.3, 3);
  texture.anisotropy = 8;
  return texture;
}

/**
 * Near-white plaster variation for tinting. Each wall face receives the full tile, so the
 * darker head, foot and vertical edges sit in the real joins and corners.
 */
export function plasterTexture(resources: SceneResources) {
  return canvasTexture(resources, 256, 256, (ctx) => {
    const random = seeded(47);
    ctx.fillStyle = '#dedcd3';
    ctx.fillRect(0, 0, 256, 256);
    for (let blot = 0; blot < 90; blot++) {
      const x = random() * 256;
      const y = random() * 256;
      const radius = 14 + random() * 46;
      const shade = ctx.createRadialGradient(x, y, 0, x, y, radius);
      shade.addColorStop(0, blot % 2 === 0 ? 'rgba(255,252,240,.07)' : 'rgba(60,62,52,.07)');
      shade.addColorStop(1, 'rgba(128,128,120,0)');
      ctx.fillStyle = shade;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    const head = ctx.createLinearGradient(0, 0, 0, 256);
    head.addColorStop(0, 'rgba(22,24,20,.42)');
    head.addColorStop(0.2, 'rgba(22,24,20,0)');
    head.addColorStop(0.9, 'rgba(22,24,20,0)');
    head.addColorStop(1, 'rgba(22,24,20,.3)');
    ctx.fillStyle = head;
    ctx.fillRect(0, 0, 256, 256);
    const corners = ctx.createLinearGradient(0, 0, 256, 0);
    corners.addColorStop(0, 'rgba(22,24,20,.3)');
    corners.addColorStop(0.07, 'rgba(22,24,20,0)');
    corners.addColorStop(0.93, 'rgba(22,24,20,0)');
    corners.addColorStop(1, 'rgba(22,24,20,.3)');
    ctx.fillStyle = corners;
    ctx.fillRect(0, 0, 256, 256);
  });
}

/** Low-contrast woven tile for the rug; tinted by its material. */
export function fabricTexture(resources: SceneResources) {
  const texture = canvasTexture(resources, 128, 128, (ctx) => {
    const random = seeded(71);
    ctx.fillStyle = '#d6d6cf';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 4) {
      for (let x = 0; x < 128; x += 4) {
        const over = ((x + y) / 4) % 2 === 0;
        ctx.fillStyle = over ? `rgba(255,255,246,${0.1 + random() * 0.14})` : `rgba(34,36,30,${0.12 + random() * 0.16})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 9);
  texture.anisotropy = 4;
  return texture;
}

/** After-hours window: deep dusk, a low roofline and a few distant warm windows. */
export function duskTexture(resources: SceneResources) {
  return canvasTexture(resources, 256, 256, (ctx) => {
    const random = seeded(89);
    const sky = ctx.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, '#141d2c');
    sky.addColorStop(0.55, '#26364b');
    sky.addColorStop(0.82, '#4b5364');
    sky.addColorStop(1, '#8a6f62');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 256, 256);
    let x = 0;
    while (x < 256) {
      const width = 16 + random() * 34;
      const height = 26 + random() * 52;
      ctx.fillStyle = '#10161f';
      ctx.fillRect(x, 256 - height, width + 1, height);
      for (let light = 0; light < 3; light++) {
        if (random() < 0.45) continue;
        ctx.fillStyle = random() < 0.7 ? 'rgba(255,196,120,.85)' : 'rgba(190,214,232,.7)';
        ctx.fillRect(x + 3 + random() * (width - 8), 256 - height + 5 + random() * (height - 12), 3, 4);
      }
      x += width;
    }
  });
}

export function contactTexture(resources: SceneResources) {
  return canvasTexture(resources, 128, 128, (ctx) => {
    const gradient = ctx.createRadialGradient(64, 64, 5, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(13,10,8,.52)');
    gradient.addColorStop(0.5, 'rgba(13,10,8,.28)');
    gradient.addColorStop(1, 'rgba(13,10,8,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  });
}

/** Original decorative diagrams, not screenshots or claimed project results. */
export function screenTexture(resources: SceneResources, project: ProjectId | 'studio') {
  const portrait = project === 'copilot' || project === 'typeforge';
  const width = portrait ? 400 : 768;
  const height = portrait ? 640 : 432;
  const texture = canvasTexture(resources, width, height, (ctx) => {
    ctx.fillStyle = '#161e20';
    ctx.fillRect(0, 0, width, height);
    const glow = ctx.createLinearGradient(0, 0, width, height);
    glow.addColorStop(0, '#73645130');
    glow.addColorStop(1, '#19353420');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#e0b982';
    ctx.font = '18px monospace';
    ctx.fillText(project === 'studio' ? 'AFTER HOURS / STUDIO' : 'SELECTED WORK', 30, 38);
    ctx.strokeStyle = '#9caa9e3a';
    ctx.beginPath();
    ctx.moveTo(30, 58);
    ctx.lineTo(width - 30, 58);
    ctx.stroke();
    ctx.fillStyle = '#ede1cb';
    ctx.font = '32px sans-serif';
    const heading = { dissertation: 'Retrieval & inference', copilot: 'Application', typeforge: 'TypeForge', studio: 'A little room to think.' }[project];
    ctx.fillText(heading, 30, 111);

    if (project === 'dissertation') {
      ctx.font = '15px monospace';
      ctx.fillStyle = '#acb6ac';
      ctx.fillText('PLAIN / RETRIEVAL-AUGMENTED', 32, 144);
      const labels = ['QUESTION', 'RETRIEVAL', 'QWEN'];
      labels.forEach((label, index) => {
        const x = 32 + index * 245;
        ctx.strokeStyle = index === 1 ? '#cda970' : '#6e8e89';
        ctx.strokeRect(x, 208, 205, 88);
        ctx.fillStyle = '#ede1cb';
        ctx.fillText(label, x + 22, 258);
        if (index < 2) {
          ctx.beginPath(); ctx.moveTo(x + 205, 252); ctx.lineTo(x + 241, 252); ctx.stroke();
        }
      });
      ctx.fillStyle = '#b7b8a6';
      ctx.fillText('01   DISSERTATION ENGINEERING', 32, 390);
    } else if (project === 'copilot') {
      ctx.fillStyle = '#ede1cb'; ctx.fillText('Copilot', 30, 154);
      ['01  EVIDENCE', '02  DRAFT', '03  HUMAN REVIEW'].forEach((label, index) => {
        const y = 235 + index * 105;
        ctx.fillStyle = '#2d3734'; ctx.fillRect(30, y, 340, 78);
        ctx.fillStyle = '#d9c3a0'; ctx.font = '19px monospace'; ctx.fillText(label, 48, y + 45);
      });
      ctx.fillStyle = '#adb7ab'; ctx.font = '17px monospace'; ctx.fillText('02 / IN DEVELOPMENT', 30, 603);
    } else if (project === 'typeforge') {
      ctx.fillStyle = '#90aaa1'; ctx.font = '17px monospace'; ctx.fillText('LOCAL-FIRST / TYPING', 30, 151);
      ctx.font = '26px monospace';
      ['a small practice.', 'a steady rhythm.', 'a space to focus.'].forEach((line, index) => {
        ctx.fillStyle = index === 0 ? '#e0b982' : '#81958d';
        ctx.fillText(line, 30, 258 + index * 65);
      });
      ctx.fillStyle = '#e0b982'; ctx.fillRect(30, 431, 17, 3);
      ctx.fillStyle = '#adb7ab'; ctx.font = '17px monospace'; ctx.fillText('03 / TYPEFORGE', 30, 603);
    } else {
      ctx.strokeStyle = '#b9a27b'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 30; x < width - 30; x++) {
        const y = 267 + Math.sin(x * 0.021) * 38 * Math.sin(x * 0.008);
        if (x === 30) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.font = '16px monospace'; ctx.fillStyle = '#9da895';
      ctx.fillText('BUILD / LISTEN / MAKE', 30, 389);
    }
  });
  // The side screens are seen obliquely from the fixed eye; keep their type legible.
  texture.anisotropy = 8;
  return texture;
}
