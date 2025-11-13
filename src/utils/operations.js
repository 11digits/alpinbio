const LOCALE_FIELD_MAP = {
  ro: 'denumire_ro',
  en: 'denumire_en',
  fr: 'denumire_fr',
  uk: 'denumire_uk',
  pk: 'denumire_pk',
  np: 'denumire_np',
  hu: 'denumire_hu'
}

function normalizeLocale(value) {
  if (!value) return ''
  return String(value).toLowerCase().split('-')[0]
}

function resolveLocalizedName(source, activeLocale) {
  if (!source || typeof source !== 'object') {
    return ''
  }

  const localeKey = LOCALE_FIELD_MAP[normalizeLocale(activeLocale)]

  if (localeKey) {
    const translated = source[localeKey]
    if (typeof translated === 'string' && translated.trim().length > 0) {
      return translated.trim()
    }
  }

  if (typeof source.denumire_ro === 'string' && source.denumire_ro.trim().length > 0) {
    return source.denumire_ro.trim()
  }

  if (typeof source.denumire === 'string' && source.denumire.trim().length > 0) {
    return source.denumire.trim()
  }

  return ''
}

export function getLocalizedOperationName(operation, activeLocale) {
  return resolveLocalizedName(operation, activeLocale)
}

export function getLocalizedZoneName(zone, activeLocale) {
  return resolveLocalizedName(zone, activeLocale)
}
