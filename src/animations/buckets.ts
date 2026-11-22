/**
 * Cycles renders in "buckets" (tiles), by default in a spiral from the centre.
 * Returns, for every tile index (row-major), its normalised rank 0..1 in that spiral.
 */
export function spiralRanks(cols: number, rows: number): number[] {
  const total = cols * rows
  const ranks = new Array<number>(total).fill(-1)
  let x = Math.floor((cols - 1) / 2)
  let y = Math.floor((rows - 1) / 2)
  let step = 1
  let n = 0
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ]
  let d = 0
  const visit = () => {
    if (x >= 0 && x < cols && y >= 0 && y < rows && ranks[y * cols + x] < 0) ranks[y * cols + x] = n++
  }
  visit()
  while (n < total && step < 4 * Math.max(cols, rows)) {
    for (let rep = 0; rep < 2; rep++) {
      const [dx, dy] = dirs[d]
      for (let i = 0; i < step; i++) {
        x += dx
        y += dy
        visit()
      }
      d = (d + 1) % 4
    }
    step++
  }
  return ranks.map((r) => (total > 1 ? r / (total - 1) : 0))
}
