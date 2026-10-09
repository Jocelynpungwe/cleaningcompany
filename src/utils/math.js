export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

/**
 * Piecewise-linear lookup. `points` is [[x0, y0], [x1, y1], ...] sorted by x.
 * Used to map scroll progress to a position in the frame sequence.
 */
export function piecewise(points, x) {
  if (x <= points[0][0]) return points[0][1]
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i]
    if (x <= x1) {
      const [x0, y0] = points[i - 1]
      const span = x1 - x0
      return span === 0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / span
    }
  }
  return points[points.length - 1][1]
}
