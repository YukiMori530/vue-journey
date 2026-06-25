import { loadAMap } from './amap'
import { exploreCities } from '../data/explore-pois'

export interface UserLocationResult {
  lng: number
  lat: number
  cityName?: string
  cityId?: string
}

function haversineKm(a: { lng: number; lat: number }, b: { lng: number; lat: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

function matchExploreCityId(lng: number, lat: number, cityName?: string) {
  if (cityName) {
    const normalized = cityName.replace(/(市|县|区)$/, '')
    const byName = exploreCities.find(
      (city) =>
        city.name.includes(normalized) ||
        normalized.includes(city.name.replace(/(市|县|区)$/, '')),
    )
    if (byName) {
      return byName.id
    }
  }

  let best = exploreCities[0]
  let bestKm = Number.POSITIVE_INFINITY
  for (const city of exploreCities) {
    const km = haversineKm(
      { lng, lat },
      { lng: city.center[0], lat: city.center[1] },
    )
    if (km < bestKm) {
      bestKm = km
      best = city
    }
  }
  return best.id
}

/** 尝试获取用户位置并匹配探索页城市 */
export async function detectUserLocation(): Promise<UserLocationResult | null> {
  try {
    await loadAMap(['AMap.Geolocation'])
    return await new Promise((resolve) => {
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 8000,
        GeoLocationFirst: true,
      })
      geolocation.getCurrentPosition(
        (status, result) => {
          if (status !== 'complete' || !result?.position) {
            resolve(null)
            return
          }
          const lng = result.position.lng
          const lat = result.position.lat
          const address = result as {
            addressComponent?: { city?: string; province?: string }
          }
          const cityName =
            typeof address.addressComponent?.city === 'string'
              ? address.addressComponent.city
              : typeof address.addressComponent?.province === 'string'
                ? address.addressComponent.province
                : undefined
          resolve({
            lng,
            lat,
            cityName,
            cityId: matchExploreCityId(lng, lat, cityName),
          })
        },
        () => resolve(null),
      )
    })
  } catch {
    return null
  }
}
