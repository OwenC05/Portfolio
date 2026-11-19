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

export function woodTexture(resources: SceneResources) {
  return canvasTexture(resources, 512, 256, (ctx) => {
    ctx.fillStyle = '#977052';
    ctx.fillRect(0, 0, 512, 256);
    for (let line = 0; line < 190; line++) {
      const y = line * 1.4;
      ctx.strokeStyle = line % 3 === 0 ? '#664b3438' : '#cfaa7730';
      ctx.lineWidth = line % 7 === 0 ? 1.5 : 0.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.015 + line * 0.8) * 2 + Math.sin(x * 0.04) * 0.6);
      }
      ctx.stroke();
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
  return canvasTexture(resources, width, height, (ctx) => {
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
}
