import type { CSSProperties } from 'react'

interface LayoutElement {
  element_id: string
  type: 'photo' | 'text' | 'rectangle' | 'graphic' | 'rowGallery'
  position: { x: number; y: number }
  width?: number
  height?: number
  // photo
  fileName?: string
  fit?: string
  // rowGallery
  photos?: string
  // text
  text?: string
  fontFamily?: string
  fontSize?: number
  textBold?: boolean
  textBrush?: string
  backgroundColor?: string
  textAlignment?: string
  textLineHeight?: number
  isVertical?: boolean
  // rectangle
  color?: string
  // graphic
  imageSource?: string
  opacity?: number
}

interface Props {
  layout: {
    backgroundColor: string
    elements: LayoutElement[]
  }
  params: Record<string, string>   // { subtitle: "...", dateRange: "...", ... }
  photoUrl: string | null           // 선택된 사진의 object URL (표지용)
  fileKey: string                   // file 바인딩 파라미터 키 (예: "coverPhoto")
  galleryPhotoUrls?: string[]       // rowGallery 사진 배열 (내지용)
  previewWidth: number
}

/** ARGB(#AARRGGBB) → CSS rgba */
function argbToRgba(argb: string): string {
  if (argb && argb.startsWith('#') && argb.length === 9) {
    const a = (parseInt(argb.slice(1, 3), 16) / 255).toFixed(3)
    const r = parseInt(argb.slice(3, 5), 16)
    const g = parseInt(argb.slice(5, 7), 16)
    const b = parseInt(argb.slice(7, 9), 16)
    return `rgba(${r},${g},${b},${a})`
  }
  return argb
}

/** $$varName$$ → 실제 값으로 치환 */
function substituteVars(text: string, params: Record<string, string>): string {
  return text.replace(/\$\$(\w+)\$\$/g, (_, key) => params[key] ?? '')
}

export default function LayoutPreview({ layout, params, photoUrl, fileKey, galleryPhotoUrls, previewWidth }: Props) {
  // front 관련 요소만 필터링 (element_id에 "front" 포함)
  const frontElements = layout.elements.filter((el) =>
    el.element_id.toLowerCase().includes('front')
  )
  const elements = frontElements.length > 0 ? frontElements : layout.elements

  // 프론트 커버 바운딩 박스 계산
  const xs = elements.map((el) => el.position.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...elements.map((el) => el.position.x + (el.width ?? 0)))
  const maxY = Math.max(...elements.map((el) => el.position.y + (el.height ?? 0)))

  const canvasW = maxX - minX || 1
  const canvasH = maxY || 1
  const scale = previewWidth / canvasW
  const previewHeight = Math.round(canvasH * scale)

  return (
    <div
      style={{
        width: previewWidth,
        height: previewHeight,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: argbToRgba(layout.backgroundColor),
        borderRadius: '6px',
        flexShrink: 0,
      }}
    >
      {elements.map((el) => {
        const x = (el.position.x - minX) * scale
        const y = el.position.y * scale
        const w = (el.width ?? 0) * scale
        const h = (el.height ?? 0) * scale

        const base: CSSProperties = {
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }

        if (el.type === 'photo') {
          // fileKey에 해당하는 photo 요소만 사진으로 렌더링
          const isTarget = el.fileName?.includes(`$$${fileKey}$$`)
          if (!isTarget || !photoUrl) {
            return (
              <div
                key={el.element_id}
                style={{ ...base, backgroundColor: '#e5e7eb' }}
              />
            )
          }
          return (
            <img
              key={el.element_id}
              src={photoUrl}
              alt=""
              style={{ ...base, objectFit: 'cover', display: 'block' }}
            />
          )
        }

        if (el.type === 'text' && el.text && !el.isVertical) {
          const text = substituteVars(el.text, params)
          return (
            <div
              key={el.element_id}
              style={{
                ...base,
                fontSize: (el.fontSize ?? 12) * scale,
                fontWeight: el.textBold ? 'bold' : 'normal',
                color: argbToRgba(el.textBrush ?? '#FF000000'),
                backgroundColor: argbToRgba(el.backgroundColor ?? '#00000000'),
                textAlign:
                  el.textAlignment === 'Right'
                    ? 'right'
                    : el.textAlignment === 'Center'
                    ? 'center'
                    : 'left',
                lineHeight: el.textLineHeight
                  ? `${el.textLineHeight * scale}px`
                  : 1.3,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {text}
            </div>
          )
        }

        if (el.type === 'rectangle') {
          return (
            <div
              key={el.element_id}
              style={{ ...base, backgroundColor: argbToRgba(el.color ?? '#00000000') }}
            />
          )
        }

        if (el.type === 'rowGallery') {
          const urls = galleryPhotoUrls ?? []
          if (urls.length === 0) {
            return <div key={el.element_id} style={{ ...base, backgroundColor: '#e5e7eb' }} />
          }
          return (
            <div key={el.element_id} style={{ ...base, display: 'flex', gap: '2px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
              {urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  style={{ flex: 1, minWidth: 0, height: '100%', objectFit: 'cover' }}
                />
              ))}
            </div>
          )
        }

        // graphic은 스킵 (커스텀 스티커 등, 외부 CDN URL)
        return null
      })}
    </div>
  )
}
