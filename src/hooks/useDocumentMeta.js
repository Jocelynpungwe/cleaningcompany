import { useEffect } from 'react'
import { business } from '../data/business'

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [, key, name] = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/) || []
    if (key) el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/**
 * Per-route <title> and meta description / Open Graph tags.
 * (Prerendering these into static HTML for crawlers is covered in the README.)
 */
export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    const full = title ? `${title} | ${business.name}` : `${business.tagline} | ${business.name}`
    document.title = full
    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
    }
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:url"]', 'content', `${business.siteUrl}${window.location.pathname}`)
  }, [title, description])
}
