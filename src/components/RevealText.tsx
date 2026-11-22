import type { CSSProperties, ElementType } from 'react'

interface Props {
  text: string
  id?: string
  as?: ElementType
  className?: string
  delay?: number
}

/** Heading whose words slide up out of a mask once it enters the viewport. */
export function RevealText({ text, as: Tag = 'h2', className, delay = 0, id }: Props) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={className} data-reveal-words="" style={{ '--delay': `${delay}ms` } as CSSProperties}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="rw" style={{ '--i': i } as CSSProperties}>
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
