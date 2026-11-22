/**
 * "The Seed" — a fractured stone with a red core.
 * Outside the render region it exists only as topology (wireframe);
 * inside the region it is shaded. Loaded as a lazy chunk.
 */
import * as THREE from 'three'

export type ShadeMode = 'region' | 'wire' | 'clay' | 'rendered'

export interface SculptureOptions {
  quality: 'high' | 'low'
  reducedMotion: boolean
  onStep?: (step: 'geometry' | 'shaders') => void
}

export interface Sculpture {
  /** region in CSS px relative to the container's top-left corner */
  setRegion(x0: number, y0: number, x1: number, y1: number): void
  /** 0 → closed stone, 1 → halves fully apart */
  setOpen(p: number): void
  /** -1..1 pointer position for parallax */
  setPointer(x: number, y: number): void
  /** extra rotation from dragging (radians) */
  orbit(dx: number, dy: number): void
  setMode(mode: ShadeMode): void
  setPaused(paused: boolean): void
  resize(): void
  ready: Promise<void>
  dispose(): void
}

/* ── tiny deterministic 3D value noise ───────────────────── */
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}
function smooth(t: number) {
  return t * t * (3 - 2 * t)
}
function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi)
  const l = THREE.MathUtils.lerp
  const c = (a: number, b: number, d: number) => hash(xi + a, yi + b, zi + d)
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  )
}
function fbm(x: number, y: number, z: number) {
  let a = 0.5, f = 1, sum = 0
  for (let i = 0; i < 4; i++) {
    sum += a * (noise(x * f, y * f, z * f) * 2 - 1)
    f *= 2.03
    a *= 0.5
  }
  return sum
}

/* ── geometry: displaced icosphere split by a tilted plane ─ */
const SPLIT = new THREE.Vector3(0.32, 1, 0.12).normalize()

function buildHalves(detail: number) {
  const ico = new THREE.IcosahedronGeometry(1, detail)
  const base = ico.index ? ico.toNonIndexed() : ico
  const pos = base.getAttribute('position') as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const r = 1 + 0.3 * fbm(v.x * 1.3 + 3.1, v.y * 1.3, v.z * 1.3) + 0.07 * fbm(v.x * 4.2, v.y * 4.2 + 7, v.z * 4.2)
    v.multiplyScalar(r)
    v.y *= 1.12
    v.z *= 0.9
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  const top: number[] = []
  const bottom: number[] = []
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i)
    b.fromBufferAttribute(pos, i + 1)
    c.fromBufferAttribute(pos, i + 2)
    const centroid = a.clone().add(b).add(c).divideScalar(3)
    // a slightly wavy fracture instead of a perfect plane
    const d = centroid.dot(SPLIT) + 0.09 * Math.sin(centroid.x * 5.3 + centroid.z * 3.1)
    const target = d > 0.04 ? top : bottom
    target.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
  }
  base.dispose()
  ico.dispose()
  const make = (arr: number[]) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3))
    g.computeVertexNormals()
    return g
  }
  return [make(top), make(bottom)] as const
}

/* ── region discard injected into stock materials ─────────── */
function withRegion<T extends THREE.Material>(mat: T, uniforms: { uRegion: { value: THREE.Vector4 } }, keepInside: boolean) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRegion = uniforms.uRegion
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', 'uniform vec4 uRegion;\nvoid main() {')
      .replace(
        'void main() {',
        `void main() {
  bool inRegion = gl_FragCoord.x >= uRegion.x && gl_FragCoord.x <= uRegion.z &&
                  gl_FragCoord.y >= uRegion.y && gl_FragCoord.y <= uRegion.w;
  if (${keepInside ? '!inRegion' : 'inRegion'}) discard;`,
      )
  }
  mat.customProgramCacheKey = () => (keepInside ? 'region-in' : 'region-out')
  return mat
}

export function createSculpture(container: HTMLElement, opts: SculptureOptions): Sculpture {
  const high = opts.quality === 'high'
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  container.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: high, alpha: true, powerPreference: 'high-performance' })
  const maxDpr = high ? 1.75 : 1.25
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0.05, 7)

  /* lights */
  scene.add(new THREE.HemisphereLight(0x3a3f47, 0x050505, 0.55))
  const key = new THREE.DirectionalLight(0xe4ebf2, 2.4)
  key.position.set(-3.5, 4, 3)
  const rim = new THREE.DirectionalLight(0xff2626, 4.2)
  rim.position.set(3.2, 0.8, -4)
  const fill = new THREE.DirectionalLight(0x8a96a6, 0.35)
  fill.position.set(2.5, -1.5, 3)
  const inner = new THREE.PointLight(0xff2020, 9, 2.6, 1.6)
  scene.add(key, rim, fill, inner)

  /* materials */
  const shared = { uRegion: { value: new THREE.Vector4(0, 0, 0, 0) } }
  const stoneColor = new THREE.Color(0x1d1d21)
  const clayColor = new THREE.Color(0x8d8d8f)
  const stone = withRegion(
    new THREE.MeshStandardMaterial({ color: stoneColor, roughness: 0.6, metalness: 0.18, flatShading: true, side: THREE.DoubleSide }),
    shared,
    true,
  )
  const wire = withRegion(
    new THREE.LineBasicMaterial({ color: 0x8a8f96, transparent: true, opacity: high ? 0.32 : 0.4, depthWrite: false }),
    shared,
    false,
  )

  /* objects */
  const root = new THREE.Group()
  root.scale.setScalar(0.74)
  scene.add(root)
  const [gTop, gBottom] = buildHalves(high ? 7 : 4)
  opts.onStep?.('geometry')
  const halves = [gTop, gBottom].map((g) => {
    const group = new THREE.Group()
    const mesh = new THREE.Mesh(g, stone)
    const wg = new THREE.WireframeGeometry(g)
    const lines = new THREE.LineSegments(wg, wire)
    group.add(mesh, lines)
    root.add(group)
    return { group, wg }
  })
  const coreGeo = new THREE.IcosahedronGeometry(0.3, 1)
  const coreMat = withRegion(
    new THREE.MeshStandardMaterial({ color: 0xff3a3a, emissive: 0x8a0004, roughness: 0.32, metalness: 0.1, flatShading: true }),
    shared,
    true,
  )
  const core = new THREE.Mesh(coreGeo, coreMat)
  root.add(core)

  // turntable ring under the stone
  const ringPts = new THREE.EllipseCurve(0, 0, 1.2, 1.2, 0, Math.PI * 2, false, 0).getPoints(128)
  const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts.map((p) => new THREE.Vector3(p.x, 0, p.y)))
  const ringMat = new THREE.LineBasicMaterial({ color: 0x6c7076, transparent: true, opacity: 0.35 })
  const ring = new THREE.LineLoop(ringGeo, ringMat)
  ring.position.y = -1.08
  ring.scale.setScalar(0.85)
  scene.add(ring)

  /* state */
  let mode: ShadeMode = 'region'
  let open = 0
  let openSmoothed = 0
  const pointer = new THREE.Vector2()
  const pointerSmoothed = new THREE.Vector2()
  const orbitOffset = new THREE.Vector2()
  let paused = false
  let raf = 0
  let last = performance.now()
  let spin = 0.6
  let width = 1, height = 1
  const region = { x0: 0, y0: 0, x1: 0, y1: 0 }

  function applyRegion() {
    const dpr = renderer.getPixelRatio()
    let { x0, y0, x1, y1 } = region
    if (mode === 'wire') x0 = y0 = x1 = y1 = -1
    if (mode === 'clay' || mode === 'rendered') {
      x0 = y0 = -10
      x1 = width + 10
      y1 = height + 10
    }
    // DOM (top-left origin) → gl_FragCoord (bottom-left origin, device px)
    shared.uRegion.value.set(x0 * dpr, (height - y1) * dpr, x1 * dpr, (height - y0) * dpr)
  }

  function applyMode() {
    const clay = mode === 'clay'
    stone.color.copy(clay ? clayColor : stoneColor)
    stone.roughness = clay ? 0.85 : 0.6
    stone.metalness = clay ? 0 : 0.18
    rim.intensity = clay ? 0.6 : 4.2
    rim.color.set(clay ? 0xffffff : 0xff2626)
    inner.intensity = clay ? 0 : 9
    core.visible = !clay
    wire.opacity = mode === 'wire' ? 0.55 : high ? 0.32 : 0.4
    applyRegion()
  }

  function resize() {
    width = Math.max(1, container.clientWidth)
    height = Math.max(1, container.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // keep the stone inside narrow (portrait) frames
    camera.position.z = camera.aspect < 0.8 ? 7 / Math.max(camera.aspect * 1.1, 0.5) : 7
    camera.updateProjectionMatrix()
    applyRegion()
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    if (paused) return
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!opts.reducedMotion) spin += dt * 0.14
    const k = 1 - Math.exp(-dt * 4)
    pointerSmoothed.lerp(pointer, k)
    openSmoothed += (open - openSmoothed) * (1 - Math.exp(-dt * 6))

    root.rotation.y = spin + pointerSmoothed.x * 0.35 + orbitOffset.x
    root.rotation.x = -0.08 + pointerSmoothed.y * 0.18 + orbitOffset.y
    root.rotation.z = 0.06
    ring.rotation.y = spin * 0.5

    const gap = 0.012 + openSmoothed * 0.42
    halves[0].group.position.copy(SPLIT).multiplyScalar(gap)
    halves[1].group.position.copy(SPLIT).multiplyScalar(-gap)
    const pulse = opts.reducedMotion ? 1 : 1 + Math.sin(now / 900) * 0.04
    core.scale.setScalar(pulse * (1 + openSmoothed * 0.25))
    inner.intensity = mode === 'clay' ? 0 : 9 + openSmoothed * 10

    renderer.render(scene, camera)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()
  applyMode()

  const ready = new Promise<void>((resolve) => {
    // compile programs before the first visible frame to avoid a hitch
    requestAnimationFrame(() => {
      renderer.compile(scene, camera)
      opts.onStep?.('shaders')
      renderer.render(scene, camera)
      resolve()
    })
  })
  raf = requestAnimationFrame(frame)

  return {
    setRegion(x0, y0, x1, y1) {
      region.x0 = x0
      region.y0 = y0
      region.x1 = x1
      region.y1 = y1
      applyRegion()
    },
    setOpen(p) {
      open = THREE.MathUtils.clamp(p, 0, 1)
    },
    setPointer(x, y) {
      pointer.set(x, y)
    },
    orbit(dx, dy) {
      orbitOffset.x += dx
      orbitOffset.y = THREE.MathUtils.clamp(orbitOffset.y + dy, -0.9, 0.9)
    },
    setMode(m) {
      mode = m
      applyMode()
    },
    setPaused(p) {
      paused = p
      if (!p) last = performance.now()
    },
    resize,
    ready,
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      gTop.dispose()
      gBottom.dispose()
      halves.forEach((h) => h.wg.dispose())
      coreGeo.dispose()
      ringGeo.dispose()
      ;[stone, wire, coreMat, ringMat].forEach((m) => m.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
