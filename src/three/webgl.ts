let cached: boolean | null = null

/** true when a WebGL context can be created. `?nowebgl` in the URL forces the fallback (for testing). */
export function hasWebGL(): boolean {
  if (cached !== null) return cached
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).has('nowebgl')) return (cached = false)
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    cached = !!gl
    const lose = gl?.getExtension('WEBGL_lose_context')
    lose?.loseContext()
  } catch {
    cached = false
  }
  return cached
}
