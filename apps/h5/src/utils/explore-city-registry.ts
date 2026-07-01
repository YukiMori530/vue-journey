import { exploreCities, getCityById, type ExploreCity } from '../data/explore-pois'
import { citySlugFromDestination, destinationDisplayName, normalizeDestinationName } from './city-slug'
import { geocodeCityCenter } from './trip-geocode'

const dynamicCities = new Map<string, ExploreCity>()

export function listStaticExploreCities(): ExploreCity[] {
  return exploreCities
}

export function listDynamicExploreCities(): ExploreCity[] {
  return [...dynamicCities.values()]
}

export function getExploreCity(cityId: string): ExploreCity | undefined {
  return getCityById(cityId) ?? dynamicCities.get(cityId)
}

export function getExploreCityOrDefault(cityId: string): ExploreCity {
  return getExploreCity(cityId) ?? exploreCities[0]
}

export function registerDynamicExploreCity(city: ExploreCity) {
  dynamicCities.set(city.id, city)
}

export function resolveCityIdFromDestination(destination: string): string {
  const normalized = normalizeDestinationName(destination)
  const byStatic = exploreCities.find(
    (city) =>
      city.name.includes(normalized) ||
      normalized.includes(city.name.replace(/(市|县|区)$/, '')),
  )
  if (byStatic) {
    return byStatic.id
  }
  return citySlugFromDestination(normalized)
}

/** 为不在静态列表中的城市 geocode 中心点并注册 */
export async function ensureExploreCity(
  cityId: string,
  destination?: string,
): Promise<ExploreCity> {
  const existing = getExploreCity(cityId)
  if (existing) {
    return existing
  }

  const dest = destination ?? cityId
  const center = await geocodeCityCenter(dest)
  if (!center) {
    return exploreCities[0]
  }

  const city: ExploreCity = {
    id: cityId,
    name: destinationDisplayName(dest),
    center: [center.lng, center.lat],
    weather: '实时天气加载中',
    pois: [],
  }
  registerDynamicExploreCity(city)
  return city
}
