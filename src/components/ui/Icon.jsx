import {
  Award,
  CalendarCheck,
  CalendarClock,
  Check,
  House,
  Leaf,
  ListChecks,
  MessageSquareText,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'

// Only the icons the content files name: keeps the bundle to what is used.
const icons = { Award, CalendarCheck, CalendarClock, Check, Home: House, Leaf, ListChecks, MessageSquareText, ShieldCheck, SlidersHorizontal }

export default function Icon({ name, className = 'size-6', ...rest }) {
  const Cmp = icons[name]
  return Cmp ? <Cmp aria-hidden="true" className={className} strokeWidth={1.5} {...rest} /> : null
}
