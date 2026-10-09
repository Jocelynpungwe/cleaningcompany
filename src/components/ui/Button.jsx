import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const base =
  'tap group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold leading-none ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-premium)] ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-60'

const variants = {
  // forest on light surfaces (11:1 on paper)
  primary: 'bg-forest text-white hover:bg-forest-deep hover:shadow-[var(--shadow-soft)]',
  // outlined, for secondary actions on light surfaces
  secondary:
    'border border-line-strong text-forest hover:border-forest hover:bg-forest/[0.06]',
  // solid backing so the label stays readable over any photograph (used in the hero)
  secondaryOnPhoto:
    'border border-forest/40 bg-paper/92 text-forest backdrop-blur-sm hover:border-forest hover:bg-white',
  // fresh green on dark sections
  onDark: 'bg-fresh text-forest-deep hover:bg-white',
  ghostOnDark: 'border border-white/40 text-white hover:border-white hover:bg-white/10',
}

/**
 * Renders a router <Link> when `to` is given, an <a> for `href`, otherwise a <button>.
 * Never renders a button that does nothing: callers must pass `to`, `href` or `onClick`.
 */
export default function Button({
  variant = 'primary',
  to,
  href,
  arrow = false,
  className = '',
  children,
  ...rest
}) {
  const cls = `${base} ${variants[variant]} ${className}`
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-x-1"
        />
      )}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  )
}
