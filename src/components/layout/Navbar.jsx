import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { primaryNav, quoteCta } from '../../data/navigation'

const linkClass = ({ isActive }) =>
  `tap relative inline-flex items-center px-1 py-2 text-[0.95rem] font-medium text-forest transition-opacity duration-300 hover:opacity-70 ` +
  `after:absolute after:inset-x-1 after:bottom-1 after:h-px after:origin-left after:bg-forest after:transition-transform after:duration-300 ` +
  (isActive ? 'after:scale-x-100' : 'after:scale-x-0')

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)
  const drawerRef = useRef(null)

  // Solid background once the page has moved. State flips only when the boolean changes.
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      setScrolled(window.scrollY > 24)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Drawer: lock scroll, Esc to close, focus handling, close on desktop resize.
  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('no-scroll')
    const toggleEl = toggleRef.current
    const first = drawerRef.current?.querySelector('a,button')
    first?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && drawerRef.current) {
        const items = [...drawerRef.current.querySelectorAll('a,button')]
        const toggle = toggleRef.current
        const ring = [toggle, ...items].filter(Boolean)
        const idx = ring.indexOf(document.activeElement)
        if (e.shiftKey && idx <= 0) {
          e.preventDefault()
          ring[ring.length - 1].focus()
        } else if (!e.shiftKey && idx === ring.length - 1) {
          e.preventDefault()
          ring[0].focus()
        }
      }
    }
    const mql = window.matchMedia('(min-width: 1024px)')
    const onMq = () => mql.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    mql.addEventListener('change', onMq)
    return () => {
      document.documentElement.classList.remove('no-scroll')
      document.removeEventListener('keydown', onKey)
      mql.removeEventListener('change', onMq)
      toggleEl?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        scrolled || open
          ? 'bg-paper/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div
        className="container-x flex items-center justify-between"
        style={{ height: 'var(--nav-h)' }}
      >
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <Button to={quoteCta.to} className="!px-6 !py-3">
            {quoteCta.short}
          </Button>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="tap -mr-2 inline-flex size-11 items-center justify-center rounded-full text-forest lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        hidden={!open}
        className="border-t border-line bg-paper px-[var(--gutter)] pb-8 pt-4 lg:hidden"
        style={{ height: 'calc(100dvh - var(--nav-h))', overflowY: 'auto' }}
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {primaryNav.map((item) => (
              <li key={item.to} className="border-b border-line">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `tap flex items-center justify-between py-5 font-display text-3xl ${isActive ? 'text-forest' : 'text-charcoal'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Button to={quoteCta.to} arrow className="mt-8 w-full" onClick={() => setOpen(false)}>
            {quoteCta.label}
          </Button>
        </nav>
      </div>
    </header>
  )
}
