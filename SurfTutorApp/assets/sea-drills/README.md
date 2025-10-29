AR Sea-Drill Assets
====================

Location
- Videos: SurfTutorApp/assets/sea-drills/videos/
- 3D models: SurfTutorApp/assets/sea-drills/models/
- Preview images (thumbnails): SurfTutorApp/assets/sea-drills/previews/
- Metadata index: SurfTutorApp/assets/sea-drills/index.json

Naming & Slugs
- Use a short kebab-case slug for filenames and the index.json `slug` field, e.g. `pop-up-demo`, `tube-stance`.
- Filenames should match slugs: `videos/pop-up-demo.mp4`, `models/tube-stance.glb`.

index.json schema (array of items)
- slug: string (unique)
- title: string
- type: 'video' | 'model'
- file: relative path to the asset file (relative to sea-drills/)
- preview: relative path to a preview image (optional)
- duration: number (seconds, optional for videos)
- description: string (short)

Why metadata?
- Centralized metadata lets the app list drills, show a preview, and lazily load large assets.

Formats and recommendations
- Videos (MP4): H.264 (AVC) codec, baseline profile or H.264 High with compatibility; AAC audio or no audio.
  - Resolution: 720p (1280x720) is a good balance; 1080p only if necessary.
  - Use faststart (moov atom at front) if you intend to stream from CDN.
- 3D Models: glTF (.glb) binary format. Keep animations small and baked; use Draco compression for smaller sizes.
- Preview images: JPEG or WebP thumbnails (e.g. 400x225 or 320x180).

Size guidance
- Keep individual videos under ~20–30 MB for bundled demos. For production, host large assets on CDN.
- glb files should be <10–20 MB; optimize textures and polygon counts.

Bundled vs remote hosting
- Bundled (app bundle): easy offline demo, but increases app size. Good for a small set of short videos (<50MB total).
- Remote/CDN: recommended for a production app with many/large assets. The app downloads assets on-demand and caches them.

How to reference assets in React Native
- Bundled local videos/images (require):
  const video = require('../../assets/sea-drills/videos/pop-up-demo.mp4');
  <Video source={video} />

- Remote assets (URL):
  <Video source={{ uri: 'https://cdn.example.com/sea-drills/pop-up-demo.mp4' }} />

- 3D Models (glb) with ViroReact or a Three.js renderer: provide the local asset or remote URL when creating the scene node.

Sample app flow
1. Load `assets/sea-drills/index.json` at app start (or lazy-load it).
2. Render a list of sea drills with `preview` and `title`.
3. When user selects a drill:
   - If `type === 'video'`: show AR or full-screen player and play `file` (use local require or download to cache if remote).
   - If `type === 'model'`: load the `.glb` into the AR scene.

Tools & optimization commands
- Compress MP4 with ffmpeg (example):
  ffmpeg -i input.mp4 -c:v libx264 -profile:v high -preset medium -b:v 1500k -maxrate 1500k -bufsize 3000k -c:a aac -b:a 128k -movflags +faststart output.mp4

- Convert/optimize glTF with gltf-pipeline or gltfpack (for Draco compression):
  gltf-pipeline -i input.glb -o output-draco.glb --draco.compressMeshes

Next steps I can do for you (pick any)
- Create the actual placeholder assets (small sample mp4/stills) and add them to the videos/previews folders (I can generate tiny placeholder videos/images).
- Add app-side helper to load `index.json` and an example `ARSeaDrillScreen.tsx` that places a video on an AR plane (scaffold ViroReact or vision-camera integration).
- Implement CDN upload + caching strategy and sample fetch code.

Which next step would you like me to do? If you want placeholders in the repo, I can add tiny demo MP4s and thumbnails now. If you prefer I wire the app screen to load and play these assets, tell me which RN AR library you plan to use (ViroReact, react-native-vision-camera + Three.js, or others) and I’ll scaffold the integration accordingly.