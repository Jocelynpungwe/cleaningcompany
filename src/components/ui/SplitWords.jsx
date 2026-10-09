/**
 * Splits a headline into word spans for scroll-linked entrances (transform and
 * opacity only). Words are plain inline-blocks inside overflow masks, so there
 * is no font measuring and the split is identical on every render.
 *
 * `intro` adds a CSS-animated wrapper (.word-in) around each word for a one-time
 * load-in. It MUST be a separate element from `.word`: GSAP reads an element's
 * computed transform when it first tweens it, so a CSS animation running on the
 * same element gets baked into GSAP's cache and sticks.
 *
 * Accessibility: the full sentence is exposed once to assistive tech via a
 * visually hidden copy; the animated words are aria-hidden.
 */
export default function SplitWords({ text, as: Tag = 'span', emphasis = [], intro = false, className = '' }) {
  const words = text.split(' ')
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const em = emphasis.includes(word.replace(/[.,!?]/g, ''))
          const w = <span className={`word ${em ? 'word-em' : ''}`}>{word}</span>
          return (
            <span key={`${word}-${i}`}>
              <span className="word-mask">
                {intro ? (
                  <span className="word-in" style={{ '--i': i }}>
                    {w}
                  </span>
                ) : (
                  w
                )}
              </span>
              {i < words.length - 1 ? ' ' : null}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
