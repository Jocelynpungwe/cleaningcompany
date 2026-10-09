import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import Logo from '../ui/Logo'
import { business, whatsappUrl } from '../../data/business'
import { primaryNav } from '../../data/navigation'
import { services } from '../../data/services'

const YEAR = new Date().getFullYear()

const linkCls = 'tap inline-flex py-1.5 text-white/80 transition-colors duration-300 hover:text-white'

export default function Footer() {
  return (
    <footer className="defer on-dark bg-forest-deep text-white">
      <div className="container-x grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.8fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="font-display mt-6 max-w-xs text-2xl leading-snug text-white/90">{business.tagline}</p>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="tap mt-8 inline-flex items-center gap-2.5 rounded-full bg-fresh px-6 py-3 text-[0.95rem] font-semibold text-forest-deep transition-colors duration-300 hover:bg-white"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </div>

        <nav aria-label="Footer services">
          <h2 className="eyebrow text-fresh">Services</h2>
          <ul className="mt-4">
            {services.map((s) => (
              <li key={s.slug}>
                <Link to={`/services#${s.slug}`} className={linkCls}>
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer">
          <h2 className="eyebrow text-fresh">Explore</h2>
          <ul className="mt-4">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={linkCls}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/privacy" className={linkCls}>
                Privacy
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow text-fresh">Contact</h2>
          <ul className="mt-4 space-y-3.5 text-white/85">
            {business.phone && (
              <li>
                <a href={business.phoneHref} className="tap inline-flex items-center gap-3 hover:text-white">
                  <Phone className="size-4 shrink-0 text-fresh" aria-hidden="true" />
                  {business.phone}
                </a>
              </li>
            )}
            {business.email && (
              <li>
                <a href={`mailto:${business.email}`} className="tap inline-flex items-center gap-3 break-all hover:text-white">
                  <Mail className="size-4 shrink-0 text-fresh" aria-hidden="true" />
                  {business.email}
                </a>
              </li>
            )}
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-fresh" aria-hidden="true" />
              Serving {business.areaServed}
            </li>
            {business.hours && <li className="pl-7 text-sm text-white/70">{business.hours}</li>}
          </ul>
          {business.social.length > 0 && (
            <ul className="mt-6 flex gap-4">
              {business.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="tap text-sm text-white/80 hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-white/70">
          <p>
            &copy; {YEAR} {business.fullName}. All rights reserved.
          </p>
          <p>Proudly serving {business.city} with {business.yearsExperience} years of excellence.</p>
        </div>
      </div>
    </footer>
  )
}
