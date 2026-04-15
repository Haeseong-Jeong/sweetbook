import { useEffect, useState } from 'react'
import LayoutPreview from './LayoutPreview'

interface ParamDef {
  binding: 'text' | 'file' | 'rowGallery'
  required: boolean
  description: string
  minItems?: number
}

type DateMode = 'month' | 'day'

interface Props {
  photos: File[]
  coverPhotoIndex: number
  innerTemplateUid: string
  contentsParams: Record<string, string>
  contentsDateKey: string
  contentsDateValues: string[]
  initialPhotosPerSpread: number
  minSpreads: number
  onNext: (
    contentsParams: Record<string, string>,
    photosPerSpread: number,
    contentsDateKey: string,
    contentsDateValues: string[]
  ) => void
  onBack: () => void
}

function formatDatePart(value: number) {
  return String(value).padStart(2, '0')
}

function toInputDate(date: Date) {
  return [
    date.getFullYear(),
    formatDatePart(date.getMonth() + 1),
    formatDatePart(date.getDate()),
  ].join('-')
}

function formatSpreadDate(date: Date, _mode: DateMode) {
  const year = date.getFullYear()
  const month = formatDatePart(date.getMonth() + 1)
  const day = formatDatePart(date.getDate())
  return `${year}/${month}/${day}`
}

function buildAutoDateValues(count: number, startDate: string, mode: DateMode) {
  const baseDate = new Date(`${startDate}T00:00:00`)
  return Array.from({ length: count }, (_, index) => {
    const nextDate = new Date(baseDate)
    if (mode === 'month') {
      nextDate.setMonth(baseDate.getMonth() + index)
    } else {
      nextDate.setDate(baseDate.getDate() + index)
    }
    return formatSpreadDate(nextDate, mode)
  })
}

export default function ContentsStep({
  photos,
  coverPhotoIndex,
  innerTemplateUid,
  contentsParams: initialParams,
  contentsDateKey: initialDateKey,
  contentsDateValues: initialDateValues,
  initialPhotosPerSpread,
  minSpreads,
  onNext,
  onBack,
}: Props) {
  const [defs, setDefs] = useState<Record<string, ParamDef> | null>(null)
  const [layout, setLayout] = useState<{ backgroundColor: string; elements: unknown[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [textParams, setTextParams] = useState<Record<string, string>>(initialParams)
  const [showOptional, setShowOptional] = useState(false)
  const [photosPerSpread, setPhotosPerSpread] = useState(initialPhotosPerSpread)
  const [autoDateStart, setAutoDateStart] = useState(() => toInputDate(new Date()))
  const [spreadDateValues, setSpreadDateValues] = useState<string[]>(initialDateValues)
  const [autoDateMode, setAutoDateMode] = useState<DateMode>('day')
  useEffect(() => {
    fetch(`http://localhost:8000/templates/${innerTemplateUid}`)
      .then((r) => r.json())
      .then((data) => {
        setDefs(data.data.parameters.definitions)
        setLayout(data.data.layout ?? null)
        setLoading(false)
      })
      .catch(() => {
        setError('템플릿 정보를 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [innerTemplateUid])

  const remaining = photos.filter((_, i) => i !== coverPhotoIndex)
  const naturalSpreads = remaining.length > 0 ? Math.ceil(remaining.length / photosPerSpread) : 0
  const totalSpreads = Math.max(naturalSpreads, minSpreads)
  const totalNeeded = totalSpreads * photosPerSpread
  const spreads: File[][] = []

  for (let i = 0; i < totalSpreads; i++) {
    const spread: File[] = []
    if (remaining.length > 0) {
      for (let j = 0; j < photosPerSpread; j++) {
        spread.push(remaining[(i + j) % remaining.length])
      }
    }
    spreads.push(spread)
  }

  const isDuplicated = remaining.length > 0 && remaining.length < totalNeeded
  const allTextDefs = defs
    ? Object.entries(defs).filter(([, def]) => def.binding === 'text')
    : []
  const dateFieldEntry =
    allTextDefs.find(([key]) => key === initialDateKey) ??
    allTextDefs.find(([key]) => key === 'monthYearLabel' || key === 'dayLabel' || key === 'dayLabel') ??
    allTextDefs.find(([key, def]) => {
      const lowerKey = key.toLowerCase()
      const label = (def.description ?? '').toLowerCase()
      return (
        lowerKey.includes('date') ||
        lowerKey.includes('daylabel') ||
        label.includes('date') ||
        label.includes('날짜') ||
        label.includes('월/일')
      )
    })
  const dateFieldKey = dateFieldEntry?.[0] ?? initialDateKey
  const dateFieldLabel = dateFieldEntry?.[1].description || (dateFieldKey === 'monthYearLabel' ? '월/일 라벨 (예: 4/9)' : dateFieldKey)
  const requiredTextDefs = allTextDefs.filter(([, def]) => def.required)
  const optionalTextDefs = allTextDefs.filter(([, def]) => !def.required)
  const sharedRequiredTextDefs = requiredTextDefs.filter(([key]) => key !== dateFieldKey)
  const sharedOptionalTextDefs = optionalTextDefs.filter(([key]) => key !== dateFieldKey)

  useEffect(() => {
    if (!dateFieldKey) return
    setSpreadDateValues((prev) => {
      if (prev.length === 0) {
        return buildAutoDateValues(totalSpreads, autoDateStart, 'day')
      }
      if (prev.length > totalSpreads) {
        return prev.slice(0, totalSpreads)
      }
      if (prev.length < totalSpreads) {
        const generated = buildAutoDateValues(totalSpreads, autoDateStart, 'day')
        return [...prev, ...generated.slice(prev.length)]
      }
      return prev
    })
  }, [dateFieldKey, totalSpreads, autoDateStart])

  function applyAutoDates(mode: DateMode) {
    setAutoDateMode(mode)
    setSpreadDateValues(buildAutoDateValues(totalSpreads, autoDateStart, mode))
  }

  const allRequiredFilled =
    defs !== null &&
    sharedRequiredTextDefs.every(([key]) => (textParams[key] ?? '').trim() !== '') &&
    (!dateFieldKey || spreadDateValues.length === totalSpreads) &&
    (!dateFieldKey || spreadDateValues.every((value) => value.trim() !== ''))

  const previewParams = dateFieldKey
    ? { ...textParams, [dateFieldKey]: spreadDateValues[0] ?? '' }
    : textParams

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>템플릿 정보 불러오는 중…</div>
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#e53e3e' }}>{error}</div>
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>내지를 설정하세요</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>내지에 들어갈 텍스트를 입력하고 사진 배치를 확인하세요</p>

      {sharedRequiredTextDefs.map(([key, def]) => (
        <div key={key} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
            {def.description || key}
            <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>
          </label>
          <input
            type="text"
            value={textParams[key] ?? ''}
            onChange={(e) => setTextParams((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={def.description}
            style={{
              width: '100%', padding: '10px 12px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      {sharedOptionalTextDefs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => setShowOptional((value) => !value)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4f46e5', fontSize: '13px', padding: '0',
            }}
          >
            {showOptional ? '추가 설정 접기 ▲' : `추가 설정 더보기 ▼ (${sharedOptionalTextDefs.length}개)`}
          </button>
          {showOptional && (
            <div style={{ marginTop: '12px' }}>
              {sharedOptionalTextDefs.map(([key, def]) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#555' }}>
                    {def.description || key}
                  </label>
                  <input
                    type="text"
                    value={textParams[key] ?? ''}
                    onChange={(e) => setTextParams((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={def.description}
                    style={{
                      width: '100%', padding: '10px 12px', fontSize: '14px',
                      border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: 600, fontSize: '14px' }}>내지당 사진 수</label>
          <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600 }}>
            {photosPerSpread}장 · 총 {spreads.length}개 내지
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={photosPerSpread}
          onChange={(e) => setPhotosPerSpread(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#4f46e5' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
          <span>1장 (여백 넓게)</span>
          <span>5장 (빽빽하게)</span>
        </div>
      </div>

      {dateFieldKey && (
        <div style={{
          marginBottom: '24px', padding: '16px', borderRadius: '12px',
          border: '1px solid #ddd', backgroundColor: '#fafafa',
        }}>
          <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 6px' }}>{dateFieldLabel} 자동 채우기</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
            시작 날짜를 정하고, 월별 또는 일별로 각 내지 날짜를 자동 채울 수 있어요.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <input
              type="date"
              value={autoDateStart}
              onChange={(e) => setAutoDateStart(e.target.value)}
              style={{
                padding: '10px 12px', fontSize: '14px', border: '1px solid #ddd',
                borderRadius: '8px', minWidth: '150px',
              }}
            />
            <button
              type="button"
              onClick={() => applyAutoDates('month')}
              style={{
                padding: '10px 14px', fontSize: '13px', borderRadius: '8px',
                border: `1px solid ${autoDateMode === 'month' ? '#c7d2fe' : '#d1d5db'}` ,
                backgroundColor: autoDateMode === 'month' ? '#eef2ff' : 'white',
                color: autoDateMode === 'month' ? '#4338ca' : '#374151',
                cursor: 'pointer',
              }}
            >월별 자동 채우기</button>
            <button
              type="button"
              onClick={() => applyAutoDates('day')}
              style={{
                padding: '10px 14px', fontSize: '13px', borderRadius: '8px',
                border: `1px solid ${autoDateMode === 'day' ? '#c7d2fe' : '#d1d5db'}` ,
                backgroundColor: autoDateMode === 'day' ? '#eef2ff' : 'white',
                color: autoDateMode === 'day' ? '#4338ca' : '#374151',
                cursor: 'pointer',
              }}
            >일별 자동 채우기</button>
          </div>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
            자동 채운 뒤에도 아래 내지별 입력칸에서 직접 수정할 수 있어요.
          </p>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
          사진 배치 (총 {spreads.length}개 내지)
        </p>
        {isDuplicated && (
          <p style={{ color: '#d97706', fontSize: '12px', marginBottom: '10px' }}>
            ⚠️ 사진이 부족해 일부 반복됩니다
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
          {spreads.map((spread, spreadIndex) => (
            <div key={spreadIndex} style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px',
              padding: '10px 0', borderTop: spreadIndex === 0 ? 'none' : '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '12px', color: '#888', width: '48px', flexShrink: 0 }}>
                내지 {spreadIndex + 1}
              </span>
              {dateFieldKey && (
                <input
                  type="text"
                  value={spreadDateValues[spreadIndex] ?? ''}
                  onChange={(e) => setSpreadDateValues((prev) => {
                    const next = [...prev]
                    next[spreadIndex] = e.target.value
                    return next
                  })}
                  placeholder={dateFieldLabel}
                  style={{
                    width: '140px', padding: '8px 10px', fontSize: '13px',
                    border: '1px solid #ddd', borderRadius: '8px',
                  }}
                />
              )}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {spread.map((file, photoIndex) => (
                  <div
                    key={photoIndex}
                    style={{ width: '44px', height: '44px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px' }}>내지 1 미리보기</p>
        <div style={{ boxShadow: '4px 4px 16px rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
          {layout ? (
            <LayoutPreview
              layout={layout as Parameters<typeof LayoutPreview>[0]['layout']}
              params={previewParams}
              photoUrl={null}
              fileKey={''}
              galleryPhotoUrls={spreads[0]?.map((file) => URL.createObjectURL(file)) ?? []}
              previewWidth={560}
            />
          ) : (
            <div style={{ height: '120px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '13px' }}>
              불러오는 중…
            </div>
          )}
        </div>
        <p style={{ fontSize: '11px', color: '#bbb', marginTop: '6px' }}>
          폰트·색상 등 세부사항은 실제 인쇄와 다를 수 있습니다
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onBack} style={{
          flex: 1, padding: '13px', fontSize: '14px',
          border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer',
        }}>이전</button>
        <button
          onClick={() => {
            const nextTextParams = dateFieldKey
              ? Object.fromEntries(Object.entries(textParams).filter(([key]) => key !== dateFieldKey))
              : textParams
            onNext(nextTextParams, photosPerSpread, dateFieldKey, spreadDateValues)
          }}
          disabled={!allRequiredFilled}
          style={{
            flex: 2, padding: '13px', fontSize: '14px',
            backgroundColor: allRequiredFilled ? '#4f46e5' : '#ccc',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: allRequiredFilled ? 'pointer' : 'not-allowed',
          }}
        >다음</button>
      </div>
    </div>
  )
}
