import { useRef, useState } from 'react'

interface Props {
  images: File[]
  prompt: string
  onNext: (images: File[], prompt: string) => void
  onBack: () => void
}

export default function AIStoryInputStep({ images: initialImages, prompt: initialPrompt, onNext, onBack }: Props) {
  const [images, setImages] = useState<File[]>(initialImages)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    setImages((prev) => [...prev, ...imageFiles])
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const canProceed = images.length > 0 && prompt.trim() !== ''

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px 60px' }}>
      <h2 style={{ marginBottom: '8px' }}>AI 동화책 재료를 입력해주세요</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        참고 이미지는 여러 장 올릴 수 있고, 프롬프트에는 주인공과 동화 내용을 자유롭게 적어주세요.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>활용할 이미지</div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          AI가 분위기와 등장인물을 참고해서 동화에 어울리는 이미지로 생성해준다고 가정하는 데모 흐름입니다.
        </p>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
          }}
          style={{
            border: `2px dashed ${dragging ? '#4f46e5' : '#ccc'}`,
            borderRadius: '12px',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragging ? '#f5f3ff' : '#fafafa',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
          <div style={{ color: '#555', fontSize: '15px' }}>클릭하거나 이미지를 여기에 드래그하세요</div>
          <div style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
            여러 장 업로드 가능 · JPG, PNG, WEBP 지원
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />

        {images.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginTop: '16px',
                marginBottom: '12px',
              }}
            >
              {images.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden' }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                      lineHeight: '22px',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p style={{ color: '#4f46e5', fontSize: '13px' }}>{images.length}장 선택됨</p>
          </>
        )}
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>프롬프트</div>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
          주인공, 등장인물 관계, 배경, 원하는 분위기, 줄거리 등을 적어주세요.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 토끼 남매가 달빛 숲에서 길을 잃은 아기 별을 집까지 데려다주는 따뜻한 모험 이야기"
          rows={7}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            lineHeight: 1.6,
            border: '1px solid #ddd',
            borderRadius: '12px',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          이전
        </button>
        <button
          onClick={() => onNext(images, prompt.trim())}
          disabled={!canProceed}
          style={{
            flex: 2,
            padding: '14px',
            fontSize: '15px',
            backgroundColor: canProceed ? '#4f46e5' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          다음
        </button>
      </div>
    </div>
  )
}
