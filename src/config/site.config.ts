/**
 * ─────────────────────────────────────────────────────────────
 *  made by f4r3n9e1t — the ONE file to edit content
 * ─────────────────────────────────────────────────────────────
 *  Brand, texts, contacts, socials, tools, categories, projects and
 *  images all live here. Images go to /public/projects/<slug>/.
 *  See README.md → "Как менять контент".
 */
import type { ImageMedia, SiteConfig, VideoMedia } from './types'

/** image helper: expects /public/projects/<slug>/<name>.webp (+ <name>-sm.webp) */
const img = (slug: string, name: string, width: number, height: number, alt: string, caption?: string): ImageMedia => ({
  type: 'image',
  src: `/projects/${slug}/${name}.webp`,
  srcSmall: `/projects/${slug}/${name}-sm.webp`,
  width,
  height,
  alt,
  caption,
})

const video = (slug: string, file: string, poster: string, width: number, height: number, alt: string, caption?: string): VideoMedia => ({
  type: 'video',
  src: `/projects/${slug}/${file}`,
  poster: `/projects/${slug}/${poster}`,
  width,
  height,
  alt,
  caption,
})

export const site: SiteConfig = {
  brand: {
    nick: 'f4r3n9e1t',
    signature: 'made by',
    role: 'Independent 3D Artist & Digital Creator',
    description:
      'Independent 3D artist working in Blender — characters, rooms, objects and the light between them.',
    siteTitle: 'f4r3n9e1t — 3D Portfolio',
  },

  hero: {
    statement: 'Turning imagination into geometry.',
  },


  /** sockets on the "output" node of the toolset graph */
  disciplines: ['Modeling', 'Texturing', 'Lighting & Render', 'Animation', 'Post & Edit', 'Web 3D'],

  /** Edit freely — no skill levels are shown anywhere, only what each tool is used for. */
  tools: [
    { name: 'Blender', role: 'Modeling, rigging, lighting, Cycles rendering', feeds: ['Modeling', 'Texturing', 'Lighting & Render', 'Animation'] },
    { name: 'Substance Painter', role: 'Texture painting', feeds: ['Texturing'] },
    { name: 'Photoshop', role: 'Textures, decals, paint-overs', feeds: ['Texturing', 'Post & Edit'] },
    { name: 'DaVinci Resolve', role: 'Edit and colour', feeds: ['Post & Edit'] },
    { name: 'After Effects', role: 'Titles and motion', feeds: ['Animation', 'Post & Edit'] },
    { name: 'Three.js', role: 'Real-time 3D on the web', feeds: ['Web 3D'] },
  ],

  contact: {
    headline: ['Bring the idea.', "I'll build", 'the geometry.'],
    outlineLine: 2,
    /** put your address here — the copy button appears automatically */
    email: '',
    socials: [
      { label: 'Instagram', value: '', url: '' },
      { label: 'ArtStation', value: '', url: '' },
      { label: 'Behance', value: '', url: '' },
      { label: 'Telegram', value: '@f4r3n9e1t', url: 'https://t.me/f4r3n9e1t' },
    ],
    showEmpty: true,
  },

  categories: [
    { id: 'character', index: '01', label: 'Character Design', blurb: 'Figures with attitude — shape language, faces, rigs.' },
    { id: 'environment', index: '02', label: 'Environment Art', blurb: 'Rooms and streets that feel lived in.' },
    { id: 'modeling', index: '03', label: '3D Modeling', blurb: 'Objects, props and hard-surface pieces.' },
    { id: 'animation', index: '04', label: 'Animation', blurb: 'Short loops and vertical clips.' },
    { id: 'experimental', index: '05', label: 'Experimental Art', blurb: 'Studies that do not fit anywhere else.' },
  ],

  projects: [
    {
      slug: 'molly-figure',
      title: 'Molly',
      category: 'character',
      year: 2026,
      date: '2026-11-09',
      status: 'published',
      summary:
        'A collectible-figure character: heavy bangs, half-closed eyes, an energy can in one hand and a phone in the other.',
      cover: img('molly-figure', 'cover', 1600, 1600, 'Molly, three-quarter view, standing on a round base'),
      idea: [
        'A stylised figure in the vinyl-toy tradition — oversized head, small body, a base to stand on. The attitude lives in the face: lids that cover almost half of the eyes, a plaster across the nose, a star under the eye.',
        'The can carries an original "MOLLY ENERGY" design instead of a real brand. The same character later moves into a full room and a courtyard — see Molly’s Room, Dream Sequence and Dusk Courtyard.',
      ],
      process: [
        {
          title: 'Clean topology',
          text: 'Base mesh before subdivision, front / side / back. 28 947 vertices, 28 591 faces, zero n-gons — triangles only in the fan caps of fingertips and soles.',
          media: img('molly-figure', 'wireframe', 2000, 917, 'Wireframe of the character from front, side and back'),
        },
        {
          title: 'Face sheet',
          text: 'Twenty-four expressions, visemes and gaze directions driven by the facial rig.',
          media: img('molly-figure', 'face-sheet', 2000, 1333, 'Contact sheet of facial expressions'),
        },
        {
          title: 'Rig test',
          text: 'Skeleton and five poses from the test actions; non-destructive stack: Armature → Solidify → Subdivision.',
          media: img('molly-figure', 'rig', 2000, 469, 'Rig skeleton and five test poses'),
        },
      ],
      gallery: [
        img('molly-figure', 'front', 1600, 1600, 'Molly, front view'),
        img('molly-figure', 'side', 1600, 1600, 'Molly, side view'),
        img('molly-figure', 'face', 1600, 1600, 'Close-up of the face'),
        img('molly-figure', 'back', 1600, 1600, 'Molly, back view'),
        img('molly-figure', 'sitting', 1600, 1600, 'Sitting pose'),
        img('molly-figure', 'full-body', 1600, 1600, 'Full body view'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Renderer', value: 'Cycles, 128 samples' },
        { label: 'Stills', value: '1600 × 1600 px' },
        { label: 'Mesh', value: '28 947 verts · 28 591 faces · 0 n-gons' },
        { label: 'Objects', value: '62' },
        { label: 'Rig', value: 'Body, face and hair controls' },
      ],
      tools: ['Blender'],
    },
    {
      slug: 'mollys-room',
      title: 'Molly’s Room',
      category: 'environment',
      year: 2026,
      date: '2026-11-09',
      status: 'published',
      summary: 'A teenage bedroom at night: string lights, a CRT, posters on every wall and rain on the window.',
      cover: img('mollys-room', 'cover', 1080, 1920, 'Night bedroom with string lights, posters, bed and rainy window'),
      idea: [
        'A room built to hold a character before the character arrives: the bed dominates the frame, the CRT sits on the left, the window with rain and street neon on the right.',
        'The seat for the figure was planned into the layout — focus and a shallow f/1.4 depth of field sit where her head would be.',
      ],
      process: [
        {
          title: 'Camera',
          text: 'Three framings were tested — 17 mm close, 19 mm medium, 17 mm low-wide. The 19 mm medium won: bed centred, no ceiling, posters and lights on top.',
        },
        {
          title: 'Clay pass',
          text: 'The room in neutral material to judge light and composition without colour.',
          media: img('mollys-room', 'clay', 1080, 1920, 'Clay overview of the bedroom'),
        },
      ],
      gallery: [
        img('mollys-room', 'window', 1080, 1920, 'Window with rain and neon outside'),
        img('mollys-room', 'desk', 1080, 1920, 'Desk with CRT monitor'),
        img('mollys-room', 'bed', 1080, 1920, 'Bed with plaid blanket and plush bunny'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Renderer', value: 'Cycles · OptiX denoise' },
        { label: 'Samples', value: 'Hero 384 · details 256' },
        { label: 'Format', value: '1080 × 1920 px, vertical' },
        { label: 'Lens', value: '19 mm · f/1.4' },
      ],
      tools: ['Blender'],
    },
    {
      slug: 'premium-3d-ad',
      title: '3D Modeling — Ad Campaign',
      category: 'modeling',
      year: 2026,
      date: '2026-11-17',
      status: 'published',
      summary:
        'A red-chrome poster campaign for 3D modelling commissions: chrome title, four showcase models, three formats and an animated loop.',
      cover: img('premium-3d-ad', 'cover', 1920, 1080, 'Poster with chrome "3D MODELING" title and four models on pedestals'),
      idea: [
        'One poster that sells the craft with the craft itself: the title is modelled chrome, and four pieces — a robot mascot, a sneaker, a sci-fi blaster and headphones — stand on lit pedestals as proof.',
        'Tagline: “Your idea. My 3D.”',
      ],
      film: video('premium-3d-ad', 'loop.mp4', 'chat.webp', 1280, 720, 'Animated poster loop'),
      process: [
        {
          title: 'The four models',
          text: 'Robot mascot, sneaker, blaster and headphones, built for the poster and rendered on one reflective stage.',
          media: img('premium-3d-ad', 'scene', 1920, 1856, 'The four showcase models on the stage'),
        },
        {
          title: 'Composition',
          text: 'One scene, three layouts. Camera, copy and model slots are re-placed per format by script.',
          media: img('premium-3d-ad', 'composition', 1920, 1080, 'Composition preview of the poster'),
        },
      ],
      gallery: [
        img('premium-3d-ad', 'square', 1080, 1080, 'Square poster format'),
        img('premium-3d-ad', 'chat', 1280, 720, 'Chat preview format'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Renderer', value: 'Cycles' },
        { label: 'Formats', value: '1920 × 1080 · 1080 × 1080 · 1280 × 720' },
        { label: 'Loop', value: '1280 × 720, 24 fps' },
        { label: 'Pipeline', value: 'Script-built scene, per-format layouts' },
      ],
      tools: ['Blender'],
    },
    {
      slug: 'dream-sequence',
      title: 'Dream Sequence',
      category: 'animation',
      year: 2026,
      date: '2026-11-10',
      status: 'published',
      summary: 'Molly finally sits on the bed of her room. Fifteen seconds, vertical, made for the phone screen.',
      cover: img('dream-sequence', 'cover', 1080, 1920, 'Molly sitting on the bed in her room, neon signature on the wall'),
      idea: [
        'The character and the room meet: the figure from Molly and the environment from Molly’s Room in one vertical shot.',
        'The neon “made by f4r3n9e1t” on the wall is the signature every scene gets.',
      ],
      film: video('dream-sequence', 'clip.mp4', 'cover.webp', 720, 1280, 'Dream Sequence, 15-second clip'),
      process: [],
      gallery: [
        img('dream-sequence', 'still-01', 1080, 1920, 'Frame from the beginning of the clip'),
        img('dream-sequence', 'still-02', 1080, 1920, 'Frame from the middle of the clip'),
        img('dream-sequence', 'still-03', 1080, 1920, 'Frame with eyes closed'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Length', value: '15 s · 450 frames · 30 fps' },
        { label: 'Format', value: '1080 × 1920 px, vertical' },
      ],
      tools: ['Blender'],
    },
    {
      slug: 'dusk-courtyard',
      title: 'Dusk Courtyard',
      category: 'animation',
      year: 2026,
      date: '2026-11-14',
      status: 'published',
      summary: 'Molly leans on a brick wall under a purple dusk sky. A slow handheld camera, wind in the trees.',
      cover: img('dusk-courtyard', 'cover', 1080, 1920, 'Molly leaning on a wall at dusk under a neon sign'),
      idea: [
        'A quiet second scene for the character: a courtyard at dusk, birches, wires against the sky, a brick corner to lean on.',
        'The neon sign above her reads “made by f4r3n9e1t”.',
      ],
      film: video('dusk-courtyard', 'clip.mp4', 'cover.webp', 720, 1280, 'Dusk Courtyard, 15-second clip'),
      process: [
        {
          title: 'Script-built scene',
          text: 'The scene is rebuilt from scripts on top of the clean character file; the lean animation, handheld camera noise and wind in the crowns are added procedurally.',
        },
        {
          title: 'Foliage on a 6 GB GPU',
          text: 'Leaves are instanced as twigs and patches (~275 k instances) — single-leaf instancing ran the GPU out of memory.',
        },
      ],
      gallery: [
        img('dusk-courtyard', 'still-01', 1080, 1920, 'First frame of the clip'),
        img('dusk-courtyard', 'still-02', 1080, 1920, 'Late frame of the clip'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Renderer', value: 'Cycles, 128 samples, denoised' },
        { label: 'Length', value: '15 s · 450 frames · 30 fps' },
        { label: 'Format', value: '1080 × 1920 px, vertical' },
      ],
      tools: ['Blender'],
    },
    {
      slug: 'gothic-fairy',
      title: 'Gothic Fairy',
      category: 'animation',
      year: 2026,
      date: '2026-11-23',
      status: 'published',
      summary: 'A tiny gothic fairy sits on a cigarette pack by an old CRT and holds a smouldering cigarette bigger than herself. 20 seconds, vertical.',
      cover: img('gothic-fairy', 'cover', 1080, 1920, 'Gothic fairy on a cigarette pack holding a smouldering cigarette, CRT monitor behind her'),
      idea: [
        'A still, moody shot: a fairy in a corset gown and tulle skirt sits on the desk, the cigarette burns down slowly, smoke curls up into the monitor light.',
        'The CRT screen types out “made by f4r3n9e1t” through scanline interference and glitch bursts.',
      ],
      film: video('gothic-fairy', 'clip.mp4', 'cover.webp', 720, 1280, 'Gothic Fairy, 20-second clip'),
      process: [
        {
          title: 'Props at 20× scale',
          text: 'The character is a real-size 1.6 m figure and every prop is scaled up twenty times, so the cigarette is as long as her body and the pack is her bench.',
        },
        {
          title: 'Hands that hold',
          text: 'The grip is solved by script against the glove mesh: palms sit a few millimetres off the paper and the fingers wrap without sinking into the cigarette.',
        },
        {
          title: 'Burning down',
          text: 'A shader draws ash, a char band and a hot ring from the tip; a shape key shortens the cigarette, faster on every drag, until more than half is smoked.',
        },
        {
          title: 'Tulle skirt',
          text: 'Three tattered tulle layers are cloth-simulated in the seated pose, frozen, then puffed up for a full, tiered silhouette.',
        },
      ],
      gallery: [
        img('gothic-fairy', 'still-01', 1080, 1920, 'First frame: the cigarette is not lit yet'),
        img('gothic-fairy', 'still-02', 1080, 1920, 'Glitch burst on the monitor, smoke rising'),
        img('gothic-fairy', 'still-03', 1080, 1920, 'Late frame: the cigarette has burned down'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Renderer', value: 'Cycles, 128 samples, denoised' },
        { label: 'Length', value: '20.8 s · 624 frames · 30 fps' },
        { label: 'Format', value: '1080 × 1920 px, vertical' },
        { label: 'Pipeline', value: 'Script-built scene, procedural smoke and screen glitch' },
      ],
      tools: ['Blender'],
    },
    {
      slug: 'night-train',
      title: 'Night Train',
      category: 'animation',
      year: 2026,
      date: '2026-11-24',
      status: 'published',
      summary:
        'A girl in dark gothic streetwear crouches in the corridor of a night sleeper train while red signal lights slide past the windows. 15 seconds, one handheld shot.',
      cover: img('night-train', 'cover', 1920, 1440, 'Girl in a white skull-print shirt and wide jeans crouching in a dim train corridor, red light on the walls'),
      idea: [
        'A sleeper-car corridor at night, matched to a phone-shot reference: the same framing, the handrail under the windows, the row of compartment doors and the “+21 °C” sign above the vestibule door. Every few seconds a red signal light outside slides along the windows and washes over the walls.',
        'The outfit comes from a styling reference — an oversized white shirt with a skull print and a red barbed cross, a black tie, extreme-wide acid-wash jeans with crosses, grommet straps and chains, chunky grey sneakers and a black backpack. “made by f4r3n9e1t” is written in blackletter on the wall under the handrail.',
      ],
      film: video('night-train', 'clip.mp4', 'cover.webp', 1280, 960, 'Night Train, 15-second clip'),
      process: [
        {
          title: 'Camera match',
          text: 'Lens, height and tilt solved against frames of the reference: a 49 mm full-frame equivalent at 1.22 m, the figure four metres away. The handheld settle in the first two seconds is kept.',
        },
        {
          title: 'Script-built corridor',
          text: 'About 260 separate parts — window frames, roller blinds, a handrail on brackets, heater grilles, sliding doors with D-handles, ceiling lamps — each built by script and given its own brushed-steel, laminate or rubber material.',
          media: img('night-train', 'clay', 1920, 1440, 'Clay render of the corridor and the figure'),
        },
        {
          title: 'Clothes from the pose',
          text: 'Garments are lofted around the crouching body, folded by the pose — stacked hems, compression under the knees — and pushed out of the body. The chains are separate links that hang under gravity and settle on the denim; 13 300 hair strands fall over the face.',
        },
        {
          title: 'Red signals on cue',
          text: 'The red flashes are timed frame by frame to the reference: fourteen short bursts from lamps sliding past outside the windows.',
        },
      ],
      gallery: [
        img('night-train', 'still-01', 1920, 1440, 'First frame, no signal light outside'),
        img('night-train', 'still-02', 1920, 1440, 'A red signal light slides past the windows'),
        img('night-train', 'detail', 960, 720, 'Detail: the outfit and the blackletter signature on the wall'),
      ],
      tech: [
        { label: 'Software', value: 'Blender 5.0' },
        { label: 'Renderer', value: 'Cycles, 160 samples, denoised' },
        { label: 'Length', value: '15 s · 450 frames · 30 fps' },
        { label: 'Format', value: '1920 × 1440 px, 4:3' },
        { label: 'Pipeline', value: 'Script-built scene, procedural garments, 13 300 hair strands' },
      ],
      tools: ['Blender'],
    },
    {
      // DEMO SLOT — replace with a real piece or delete this whole object
      slug: 'experiment-slot',
      title: 'Untitled Experiment',
      category: 'experimental',
      year: 2026,
      status: 'demo',
      summary: 'Demo slot. This entry shows how an experimental piece will look — replace it with your own render.',
      cover: {
        type: 'image',
        src: '/projects/demo/experiment-cover.svg',
        width: 1600,
        height: 1000,
        alt: 'Placeholder artwork for a future experimental piece',
      },
      idea: ['Placeholder text. Describe the idea behind the piece in two or three short paragraphs.'],
      process: [
        { title: 'Step one', text: 'Placeholder. What was tried first.' },
        { title: 'Step two', text: 'Placeholder. What changed and why.' },
      ],
      gallery: [],
      tech: [{ label: 'Software', value: '—' }],
      tools: [],
    },
  ],
}
