#!/usr/bin/env node
/* Render a still from the GLB with headless three.js.
   node tools/render_glb.mjs --yaw 158 --fov 88 --w 4000 --h 2500 --out art/room.png
   Needs: npm i playwright three   (and the glb beside this script)          */
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';

const A = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean)
  .map(s => s.trim().split(/\s+/)).map(([k, v]) => [k, v]));
const O = { yaw: 158, pitch: 0, fov: 88, w: 4000, h: 2500, ey: .44, pz: .26, px: -.10,
            ex: 1.9, amb: .38, fire: .022, lamp: .0125, glb: 'gryffindor_common_room.glb',
            out: 'render.png', ...A };

const root = process.cwd();
const page = `<!doctype html><meta charset=utf-8><style>body{margin:0}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js",
"three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const r = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
r.setSize(${O.w}, ${O.h}, false); r.outputColorSpace = THREE.SRGBColorSpace;
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = ${O.ex};
document.body.appendChild(r.domElement);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(${O.fov}, ${O.w}/${O.h}, .001, 50);
new GLTFLoader().load('/${O.glb}', g => {
  scene.add(g.scene);
  const box = new THREE.Box3().setFromObject(g.scene);
  const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  const p = new THREE.Vector3(c.x + s.x*${O.px}, box.min.y + s.y*${O.ey}, c.z + s.z*${O.pz});
  cam.position.copy(p);
  const a = ${O.yaw}*Math.PI/180, t = ${O.pitch}*Math.PI/180;
  cam.lookAt(p.x + Math.sin(a)*Math.cos(t), p.y + Math.sin(t), p.z + Math.cos(a)*Math.cos(t));
  scene.add(new THREE.AmbientLight(0xffd9b0, ${O.amb}));
  scene.add(new THREE.HemisphereLight(0xffd0a0, 0x140a05, ${O.amb}*0.9));
  const f = new THREE.PointLight(0xff7a28, ${O.fire}, s.z*0.9, 2);
  f.position.set(c.x, box.min.y + s.y*.16, box.min.z + s.z*.08); scene.add(f);
  const l = new THREE.PointLight(0xffc888, ${O.lamp}, s.z*0.8, 2);
  l.position.set(c.x, box.min.y + s.y*.72, c.z); scene.add(l);
  r.render(scene, cam); window.__done = true;
}, undefined, e => window.__err = String(e));
</script>`;

const srv = http.createServer((rq, rs) => {
  if (rq.url === '/') { rs.end(page); return; }
  const f = path.join(root, decodeURIComponent(rq.url.split('?')[0]));
  fs.readFile(f, (e, d) => e ? (rs.statusCode = 404, rs.end()) : rs.end(d));
}).listen(8731);

const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: 900, height: 900 } });
await pg.goto('http://127.0.0.1:8731/');
await pg.waitForFunction('window.__done===true||window.__err', { timeout: 300000 });
const err = await pg.evaluate(() => window.__err);
if (err) { console.error(err); process.exit(1); }
const url = await pg.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
fs.writeFileSync(O.out, Buffer.from(url.split(',')[1], 'base64'));
console.log('wrote', O.out, O.w + 'x' + O.h);
await b.close(); srv.close();
