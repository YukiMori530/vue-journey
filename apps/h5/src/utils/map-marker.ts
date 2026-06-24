/** 高德地图标记 HTML 与路线样式（全局 class 见 styles/map-markers.css） */

export const TRIP_MAP_STYLE = 'amap://styles/whitesmoke'

export const TRIP_MAP_MARKER_OFFSET = { x: -14, y: -34 }

export const TRIP_MAP_DAY_BADGE_OFFSET = { x: -42, y: -58 }

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 截短 POI 名称，避免标签占满屏幕 */
export function truncatePlaceName(name: string, maxLen = 6): string {
  let cleaned = name
    .replace(/^(北京|上海|广州|深圳|杭州|成都|西安|青岛|南京|武汉|重庆|天津|苏州)/, '')
    .replace(/[（(][^）)]*[）)]/g, '')
    .trim()

  if (!cleaned) {
    cleaned = name.trim()
  }

  if (cleaned.length <= maxLen) {
    return cleaned
  }

  return `${cleaned.slice(0, maxLen)}…`
}

export function buildTripMapMarkerHtml(order: number, name: string, color: string): string {
  const label = escapeHtml(truncatePlaceName(name))
  const title = escapeHtml(name)

  return `
    <div class="trip-map-pin">
      <div class="trip-map-pin__icon" style="--pin-color:${color}">
        <span>${order}</span>
      </div>
      <div class="trip-map-pin__tag" title="${title}">${label}</div>
    </div>
  `
}

export function buildOverviewDayBadgeHtml(day: number, totalKm: number, color: string): string {
  return `
    <div class="trip-map-day-badge" style="--badge-color:${color}">
      <span class="trip-map-day-badge__day">DAY ${day}</span>
      <span class="trip-map-day-badge__km">${totalKm} km</span>
    </div>
  `
}

export function buildGeneratingMapMarkerHtml(
  stop: { day: number; order: number; name: string },
  color: string,
): string {
  const label = escapeHtml(truncatePlaceName(stop.name))

  return `
    <div class="trip-map-pin trip-map-pin--generating">
      <div class="trip-map-pin__icon" style="--pin-color:${color}">
        <span>${stop.order}</span>
      </div>
      <div class="trip-map-pin__meta">
        <span class="trip-map-pin__day" style="background:${color}">D${stop.day}</span>
        <span class="trip-map-pin__tag">${label}</span>
      </div>
    </div>
  `
}

export function buildRoutePolylineOptions(color: string, highlight = false) {
  return {
    strokeColor: color,
    strokeWeight: highlight ? 6 : 5,
    strokeOpacity: 0.92,
    outlineColor: '#ffffff',
    borderWeight: 2,
    lineJoin: 'round' as const,
    lineCap: 'round' as const,
    showDir: true,
  }
}
