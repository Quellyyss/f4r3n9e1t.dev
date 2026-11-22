/** Real loading steps shown by the boot screen. Nothing here is simulated. */
export type BootStep = 'fonts' | 'geometry' | 'shaders'
export type BootState = 'pending' | 'done' | 'skipped'

const state: Record<BootStep, BootState> = { fonts: 'pending', geometry: 'pending', shaders: 'pending' }
const listeners = new Set<() => void>()

export function getBoot() {
  return state
}

export function setBoot(step: BootStep, value: Exclude<BootState, 'pending'>) {
  if (state[step] !== 'pending') return
  state[step] = value
  listeners.forEach((l) => l())
}

export function onBoot(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export const bootComplete = () => Object.values(state).every((s) => s !== 'pending')
