declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, opts?: Record<string, unknown>)
    add(overlay: Marker | Scale): void
    remove(overlay: Marker): void
    setCenter(center: [number, number]): void
    destroy(): void
  }

  class Marker {
    constructor(opts?: Record<string, unknown>)
    on(event: string, handler: () => void): void
    setMap(map: Map | null): void
  }

  class Scale {
    constructor(opts?: Record<string, unknown>)
  }

  class Geolocation {
    constructor(opts?: Record<string, unknown>)
    getCurrentPosition(
      onSuccess: (status: string, result: { position: { lng: number; lat: number } }) => void,
      onError: (error: { message: string }) => void,
    ): void
  }
}
