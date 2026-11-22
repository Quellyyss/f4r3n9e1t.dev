/**
 * One IntersectionObserver for the whole page: every element with
 * [data-reveal] or [data-reveal-words] gets [data-inview] once it enters the viewport.
 * A MutationObserver picks up elements added later (filters, route changes).
 */
const SELECTOR = '[data-reveal], [data-reveal-words], [data-bucket]'

export function startRevealObserver(root: HTMLElement) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          e.target.setAttribute('data-inview', '')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px', threshold: 0.08 },
  )
  const scan = (node: ParentNode) => {
    node.querySelectorAll(SELECTOR).forEach((el) => {
      if (!el.hasAttribute('data-inview')) io.observe(el)
    })
  }
  scan(root)
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n instanceof HTMLElement) {
          if (n.matches(SELECTOR) && !n.hasAttribute('data-inview')) io.observe(n)
          scan(n)
        }
      })
    }
  })
  mo.observe(root, { childList: true, subtree: true })
  return () => {
    io.disconnect()
    mo.disconnect()
  }
}
