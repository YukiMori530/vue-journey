declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, opts?: Record<string, unknown>)
    add(overlay: Marker | Scale | Polyline): void
    remove(overlay: Marker | Polyline): void
    setCenter(center: [number, number]): void
    setZoom(zoom: number): void
    setFitView(
      overlays?: Array<Marker | Polyline>,
      immediately?: boolean,
      padding?: number[],
    ): void
    destroy(): void
  }

  class Marker {
    constructor(opts?: Record<string, unknown>)
    on(event: string, handler: () => void): void
    setMap(map: Map | null): void
  }

  class Polyline {
    constructor(opts?: Record<string, unknown>)
    setMap(map: Map | null): void
  }

  class Scale {
    constructor(opts?: Record<string, unknown>)
  }

  class Pixel {
    constructor(x: number, y: number)
  }

  class LngLat {
    constructor(lng: number, lat: number)
  }

  class Geocoder {
    getLocation(
      address: string,
      callback: (status: string, result: GeocoderResult) => void,
    ): void
  }

  class PlaceSearch {
    constructor(opts?: Record<string, unknown>)
    search(
      keyword: string,
      callback: (status: string, result: PlaceSearchResult) => void,
    ): void
  }

  class Driving {
    constructor(opts?: Record<string, unknown>)
    search(
      origin: LngLat,
      destination: LngLat,
      callback: (status: string, result: DrivingSearchResult) => void,
    ): void
  }

  namespace DrivingPolicy {
    const LEAST_TIME: number
  }

  class Geolocation {
    constructor(opts?: Record<string, unknown>)
    getCurrentPosition(
      onSuccess: (status: string, result: { position: { lng: number; lat: number } }) => void,
      onError: (error: { message: string }) => void,
    ): void
  }

  interface GeocoderResult {
    geocodes?: Array<{ location: { lng: number; lat: number } }>
  }

  interface PlaceSearchResult {
    poiList?: {
      pois?: Array<{ name: string; location: { lng: number; lat: number } }>
    }
  }

  interface DrivingSearchResult {
    routes?: Array<{
      distance?: number
      time?: number
      steps?: Array<{ path?: Array<{ lng: number; lat: number }> }>
    }>
  }
}
