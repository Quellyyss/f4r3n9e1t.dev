import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { usePageTransition } from '../app/TransitionProvider'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** Internal link that runs the bucket wipe. Modifier-clicks keep normal browser behaviour. */
export function TransitionLink({ to, onClick, children, ...rest }: Props) {
  const { go } = usePageTransition()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    go(to)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
