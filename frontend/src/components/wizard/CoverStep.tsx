import { useState, useEffect } from 'react'
import LayoutPreview from './LayoutPreview'

interface ParamDef {
  binding: 'text' | 'file' | 'rowGallery'
  required: boolean
  description: string
}

interface Props {
  photos: File[]
  coverTemplateUid: string
  coverPhotoIndex: number
  coverFileKey: string
  coverParams: Record<string, string>
  onNext: (coverPhotoIndex: number, coverFileKey: string, coverParams: Record<string, string>) => void
  onBack: () => void
}

export default function CoverStep({
  photos,
  coverTemplateUid,
  coverPhotoIndex: initialIndex,
  coverFileKey: initialFileKey,
  coverParams: initialParams,
  onNext,
  onBack,
}: Props) {
  const [defs, setDefs] = useState<Record<string, ParamDef> | null>(null)
  const [layout, setLayout] = useState<{ backgroundColor: string; elements: unknown[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [fileKey, setFileKey] = useState(initialFileKey)
  const [textParams, setTextParams] = useState<Record<string, string>>(initialParams)

  useEffect(() => {
    fetch(`http://localhost:8000/templates/${coverTemplateUid}`)
      .then((r) => r.json())
      .then((data) => {
        const definitions: Record<string, ParamDef> = data.data.parameters.definitions
        setDefs(definitions)
        setLayout(data.data.layout ?? null)
        const fk = Object.entries(definitions).find(([, def]) => def.binding === 'file')?.[0] ?? ''
        setFileKey(fk)
        setLoading(false)
      })
      .catch(() => {
        setError('템플릿 정보를 불러오지 못했습니다.')
        setLoading(false)
      })
  }, [coverTemplateUid])

  const textDefs = defs
    ? Object.entries(defs).filter(([, def]) => def.binding === 'text')
    : []

  const allRequiredFilled =
    defs !== null &&
    Object.entries(defs).every(([key, def]) => {
      if (!def.required) return true
      if (def.binding === 'file') return selectedIndex >= 0
      return (textParams[key] ?? '').trim() !== ''
    })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>
        템플릿 정보 불러오는 중…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#e53e3e' }}>
        {error}
      </div>
    )
  }

  const selectedPhoto = photos[selectedIndex]
  const previewUrl = selectedPhoto ? URL.createObjectURL(selectedPhoto) : null

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>표지를 설정하세요</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>대표 사진과 텍스트를 입력해주세요</p>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* 왼쪽: 입력 폼 */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* 표지 사진 선택 */}
          {fileKey && (
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontWeight: 600, marginBottom: '10px', fontSize: '14px' }}>
                표지 사진 선택
                <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {photos.map((file, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      outline: selectedIndex === i ? '3px solid #4f46e5' : '3px solid transparent',
                      transition: 'outline 0.1s',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {selectedIndex === i && (
                      <div style={{
                        position: 'absolute', bottom: '4px', right: '4px',
                        backgroundColor: '#4f46e5', color: 'white',
                        borderRadius: '50%', width: '18px', height: '18px',
                        fontSize: '11px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 텍스트 파라미터 */}
          {textDefs.map(([key, def]) => (
            <div key={key} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
                {def.description || key}
                {def.required && <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>}
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

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={onBack} style={{
              flex: 1, padding: '13px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer',
            }}>이전</button>
            <button
              onClick={() => onNext(selectedIndex, fileKey, textParams)}
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

        {/* 오른쪽: 레이아웃 미리보기 */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <p style={{ fontWeight: 600, fontSize: '13px', color: '#888', marginBottom: '10px', textAlign: 'center' }}>
            미리보기 (참고용)
          </p>
          <div style={{ boxShadow: '4px 4px 16px rgba(0,0,0,0.15)', borderRadius: '6px', overflow: 'hidden' }}>
            {layout ? (
              <LayoutPreview
                layout={layout as Parameters<typeof LayoutPreview>[0]['layout']}
                params={textParams}
                photoUrl={previewUrl}
                fileKey={fileKey}
                previewWidth={220}
              />
            ) : (
              <div style={{ width: 220, height: 260, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '13px' }}>
                로딩 중…
              </div>
            )}
          </div>
          <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', marginTop: '8px' }}>
            폰트 등 세부사항은 실제와 다를 수 있습니다
          </p>
        </div>

      </div>
    </div>
  )
}
