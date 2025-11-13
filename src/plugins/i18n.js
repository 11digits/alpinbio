import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import ro from '../locales/ro.json'
import hu from '../locales/hu.json'
import pk from '../locales/pk.json'
import np from '../locales/np.json'
import uk from '../locales/uk.json'
import fr from '../locales/fr.json'

export const LOCALE_STORAGE_KEY = 'ttctrack_locale'

function resolveInitialLocale() {
  if (typeof window === 'undefined') {
    return 'ro'
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return stored || 'ro'
  } catch (error) {
    console.warn('[i18n] Failed to read stored locale', error)
    return 'ro'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: 'ro',
  messages: {
    en,
    ro,
    hu,
    pk,
    np,
    uk,
    fr
  }
})

export default i18n
