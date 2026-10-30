import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const base =
  'tap group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold leading-none ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-premium)] ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-60'

const variants = {
  // the signature gold button, dark text on gold (10:1), works on light and dark surfaces alike
  primary: 'btn-gold hover:-translate-y-0.5',
  // outlined, for secondary actions on light surfaces
  secondary:
    'border border-line-strong text-espresso hover:border-gold-deep hover:bg-gold-soft/50',
  // solid backing so the label stays readable over any photograph (used in the hero)
  secondaryOnPhoto:
    'border border-espresso/40 bg-paper/92 text-espresso backdrop-blur-sm hover:border-gold-deep hover:bg-white',
  // same gold button, named for dark sections
  onDark: 'btn-gold hover:-translate-y-0.5',
  ghostOnDark: 'border border-white/40 text-white hover:border-gold hover:bg-white/10',
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
