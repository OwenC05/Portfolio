"""Render ONE camera of a saved full-kit blend, in its own process, with a hard time limit.

  blender --background --factory-startup --disable-autoexec --python-exit-code 1 <file.blend> \
      --python render_cam.py -- <camera> <samples> <time-limit-seconds> <out.png> [scale-percent]

Direction check only: Cycles with reference lights, not the site's renderer.
"""
import bpy, sys, os

camera, samples, limit, out = sys.argv[sys.argv.index('--') + 1:][:4]
extra = sys.argv[sys.argv.index('--') + 5:]
if os.path.exists(out):
    raise RuntimeError('Refusing to overwrite ' + out)
scene = bpy.context.scene
cam = bpy.data.objects[camera]
scene.camera = cam
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = int(samples)
scene.cycles.time_limit = float(limit)
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 3
scene.render.use_persistent_data = False
scene.view_settings.view_transform = 'AgX'
scene.render.threads_mode = 'FIXED'
scene.render.threads = 6
scene.render.resolution_x, scene.render.resolution_y = cam['res_x'], cam['res_y']
scene.render.resolution_percentage = int(extra[0]) if extra else 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print('FK rendered', out, camera, scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage)
