interface Spec {
  uid: string
  label: string
  description: string
  size: string
  shape: 'square' | 'portrait'
}

const SPECS: Spec[] = [
  {
    uid: 'SQUAREBOOK_HC',
    label: '스퀘어북 (하드커버)',
    description: '가장 인기 있는 포토북. 두꺼운 하드커버.',
    size: '243 × 248 mm',
    shape: 'square',
  },
  {
    uid: 'PHOTOBOOK_A4_SC',
    label: 'A4 포토북 (소프트커버)',
    description: '넓고 시원한 레이아웃. 사진이 크게 담깁니다.',
    size: '210 × 297 mm',
    shape: 'portrait',
  },
  {
    uid: 'PHOTOBOOK_A5_SC',
    label: 'A5 포토북 (소프트커버)',
    description: '가볍고 휴대하기 좋은 작은 사이즈.',
    size: '148 × 210 mm',
    shape: 'portrait',
  },
]

import { useState } from 'react'

interface Props {
  selected: string
  onSelect: (specUid: string) => void
  onNext: () => void
  onBack: () => void
}

export default function SpecStep({ selected, onSelect, onNext, onBack }: Props) {
  const [hoveredUid, setHoveredUid] = useState<string | null>(null)

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '60px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>책 크기를 선택해주세요</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>인쇄될 책의 판형입니다</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SPECS.map((spec) => {
          const isSelected = selected === spec.uid
          const isHovered = hoveredUid === spec.uid
          return (
            <div
              key={spec.uid}
              onClick={() => onSelect(spec.uid)}
              onMouseEnter={() => setHoveredUid(spec.uid)}
              onMouseLeave={() => setHoveredUid(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                border: `2px solid ${isSelected ? '#4f46e5' : isHovered ? '#a5b4fc' : '#e5e5e5'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f0ff' : isHovered ? '#f8f8ff' : 'white',
                transition: 'all 0.15s',
              }}
            >
              {/* 책 모양 미리보기 */}
              <div
                style={{
                  width: spec.shape === 'square' ? 56 : 44,
                  height: spec.shape === 'square' ? 56 : 64,
                  backgroundColor: isSelected ? '#4f46e5' : isHovered ? '#a5b4fc' : '#d0d0d0',
                  borderRadius: '4px',
                  flexShrink: 0,
                  transition: 'background-color 0.15s',
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{spec.label}</div>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>
                  {spec.description}
                </div>
                <div style={{ color: '#aaa', fontSize: '13px' }}>{spec.size}</div>
              </div>

              {isSelected && (
                <div style={{ color: '#4f46e5', fontWeight: 700, fontSize: '20px' }}>✓</div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '16px',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          이전
        </button>
        <button
          onClick={() => selected && onNext()}
          disabled={!selected}
          style={{
            flex: 2,
            padding: '14px',
            fontSize: '16px',
            backgroundColor: selected ? '#4f46e5' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          다음
        </button>
      </div>
    </div>
  )
}
