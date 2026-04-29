const FONT_LINK_PREFIX = 'eventdp-google-font-'

const sanitizeIdPart = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeWeightList = (weights = []) => {
    const parsed = (Array.isArray(weights) ? weights : [])
        .map((weight) => Number(weight))
        .filter((weight) => Number.isInteger(weight) && weight >= 100 && weight <= 900)

    const uniqueSorted = Array.from(new Set(parsed)).sort((a, b) => a - b)
    return uniqueSorted.length > 0 ? uniqueSorted : [400, 700]
}

export const ensureGoogleFontLoaded = ({ family, weights }) => {
    if (typeof document === 'undefined') {
        return
    }

    const safeFamily = String(family || '').trim()
    if (!safeFamily) {
        return
    }

    const normalizedWeights = normalizeWeightList(weights)
    const familyParam = safeFamily.replace(/\s+/g, '+')
    const weightsParam = normalizedWeights.join(';')
    const linkId = `${FONT_LINK_PREFIX}${sanitizeIdPart(safeFamily)}`
    const href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap`

    const existingLink = document.getElementById(linkId)
    if (existingLink) {
        if (existingLink.getAttribute('href') !== href) {
            existingLink.setAttribute('href', href)
        }
        return
    }

    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
}

export const getFallbackWeights = () => [100, 200, 300, 400, 500, 600, 700, 800, 900]
