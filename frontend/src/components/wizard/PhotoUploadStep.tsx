import { useRef, useState } from 'react'

interface Props {
  photos: File[]
  minPhotos: number
  onNext: (photos: File[]) => void
  onBack: () => void
}

export default function PhotoUploadStep({ photos: initialPhotos, minPhotos, onNext, onBack }: Props) {
  const [photos, setPhotos] = useState<File[]>(initialPhotos)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    setPhotos((prev) => [...prev, ...imageFiles])
  }

  function remove(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>사진을 업로드하세요</h2>
      <p style={{ color: '#888', marginBottom: '8px' }}>
        표지와 내지에 사용할 사진을 모두 올려주세요 (여러 장 한번에 가능)
      </p>
      <p style={{ color: '#4f46e5', fontSize: '13px', marginBottom: '24px' }}>
        선택한 템플릿 기준 최소 <strong>{minPhotos}장</strong> 이상 필요합니다 (중복 허용)
      </p>

      {/* 드래그앤드롭 영역 */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        style={{
          border: `2px dashed ${dragging ? '#4f46e5' : '#ccc'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragging ? '#f5f3ff' : '#fafafa',
          marginBottom: '24px',
          transition: 'all 0.15s',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
        <div style={{ color: '#555', fontSize: '15px' }}>클릭하거나 사진을 여기에 드래그하세요</div>
        <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>JPG, PNG, WEBP 지원</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* 썸네일 그리드 */}
      {photos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {photos.map((file, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => remove(i)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  lineHeight: '20px',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <p style={{
          color: photos.length >= minPhotos ? '#16a34a' : '#d97706',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          {photos.length}장 선택됨
          {photos.length < minPhotos && ` — ${minPhotos}장 미만이면 일부 사진이 반복됩니다`}
          {photos.length >= minPhotos && ' ✓'}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          이전
        </button>
        <button
          onClick={() => onNext(photos)}
          disabled={photos.length === 0}
          style={{
            flex: 2,
            padding: '14px',
            fontSize: '15px',
            backgroundColor: photos.length > 0 ? '#4f46e5' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: photos.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          다음
        </button>
      </div>
    </div>
  )
}
