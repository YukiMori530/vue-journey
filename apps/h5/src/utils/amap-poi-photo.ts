import { loadAMap } from './amap'
import { buildPlaceQueries } from './geo-distance'

interface AmapPoiPhoto {
  photos?: Array<{ url?: string }>
  id?: string
}

function pickPhotoUrl(poi: AmapPoiPhoto): string | undefined {
  return poi.photos?.find((item) => item.url)?.url
}

export async function fetchAmapPoiPhoto(
  name: string,
  destination: string,
): Promise<string | undefined> {
  const city = destination.replace(/(市|县|区|省)$/, '').trim()

  try {
    await loadAMap(['AMap.PlaceSearch'])
    const placeSearch = new AMap.PlaceSearch({
      city,
      citylimit: true,
      pageSize: 5,
      extensions: 'all',
    })

    for (const query of buildPlaceQueries(name, city)) {
      const photo = await new Promise<string | undefined>((resolve) => {
        placeSearch.search(query, (status, result) => {
          if (status !== 'complete') {
            resolve(undefined)
            return
          }

          const pois = (result as { poiList?: { pois?: AmapPoiPhoto[] } }).poiList?.pois ?? []
          for (const poi of pois) {
            const url = pickPhotoUrl(poi)
            if (url) {
              resolve(url)
              return
            }
          }
          resolve(undefined)
        })
      })

      if (photo) {
        return photo
      }
    }
  } catch {
    return undefined
  }

  return undefined
}
