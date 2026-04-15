import { useState } from 'react'

const THUMB = (uid: string) =>
  `https://api.sweetbook.com/templates_thumb/${uid}/layout.jpg`

interface ThemeOption {
  uid: string
  label: string
  description: string
  recommended: boolean
  supported: boolean
  coverTemplateUid: string
  innerTemplateUid: string
  accent: string
}

const SPEC_THEMES: Record<string, ThemeOption[]> = {
  SQUAREBOOK_HC: [
    {
      uid: 'SQUAREBOOK_HC_google_A',
      label: '구글포토북',
      description: '날짜와 사진이 어우러지는 깔끔한 클래식 스타일.',
      recommended: true,
      supported: true,
      coverTemplateUid: '1Es0DP4oARn8',
      innerTemplateUid: '1vuzMfUnCkXS',
      accent: '#4f46e5',
    },
    {
      uid: 'SQUAREBOOK_HC_diary_A',
      label: '일기장',
      description: '감성적인 손글씨 느낌의 따뜻한 레이아웃.',
      recommended: false,
      supported: false,
      coverTemplateUid: '79yjMH3qRPly',
      innerTemplateUid: '6c2HU8tipz1l',
      accent: '#d97706',
    },
    {
      uid: 'SQUAREBOOK_HC_notice_A',
      label: '알림장',
      description: '정보와 사진이 체계적으로 정리된 레이아웃.',
      recommended: false,
      supported: false,
      coverTemplateUid: '39kySqmyRhhs',
      innerTemplateUid: '1aHHt1g7uHjw',
      accent: '#059669',
    },
  ],
  PHOTOBOOK_A4_SC: [
    {
      uid: 'PHOTOBOOK_A4_SC_google_A',
      label: '구글포토북',
      description: '날짜와 사진이 어우러지는 깔끔한 클래식 스타일.',
      recommended: true,
      supported: true,
      coverTemplateUid: '3S1ceGaglj5i',
      innerTemplateUid: '5NOAvNYRxKVM',
      accent: '#4f46e5',
    },
    {
      uid: 'PHOTOBOOK_A4_SC_diary_A',
      label: '일기장',
      description: '감성적인 손글씨 느낌의 따뜻한 레이아웃.',
      recommended: false,
      supported: false,
      coverTemplateUid: '31LOxBQzsVwo',
      innerTemplateUid: 'msFsr6Ult7qw',
      accent: '#d97706',
    },
    {
      uid: 'PHOTOBOOK_A4_SC_notice_A',
      label: '알림장',
      description: '정보와 사진이 체계적으로 정리된 레이아웃.',
      recommended: false,
      supported: false,
      coverTemplateUid: '75HruEK3EnG5',
      innerTemplateUid: '6Ly3CJrHodJv',
      accent: '#059669',
    },
  ],
  PHOTOBOOK_A5_SC: [
    {
      uid: 'PHOTOBOOK_A5_SC_google_A',
      label: '구글포토북',
      description: '날짜와 사진이 어우러지는 깔끔한 클래식 스타일.',
      recommended: true,
      supported: true,
      coverTemplateUid: '1dTGvR4NivrD',
      innerTemplateUid: '1UbWOuoHeNkF',
      accent: '#4f46e5',
    },
    {
      uid: 'PHOTOBOOK_A5_SC_diary_A',
      label: '일기장',
      description: '감성적인 손글씨 느낌의 따뜻한 레이아웃.',
      recommended: false,
      supported: false,
      coverTemplateUid: '3sVKHg6kk7w0',
      innerTemplateUid: 'ebGpPDmn6EJ5',
      accent: '#d97706',
    },
    {
      uid: 'PHOTOBOOK_A5_SC_notice_A',
      label: '알림장',
      description: '정보와 사진이 체계적으로 정리된 레이아웃.',
      recommended: false,
      supported: false,
      coverTemplateUid: '40nimglmWLSh',
      innerTemplateUid: 'kEVfcU6Aa0Qo',
      accent: '#059669',
    },
  ],
}

type TooltipState = {
  x: number
  y: number
  coverUid: string
  innerUid: string
} | null

interface Props {
  bookSpec: string
  selected: string
  onSelect: (uid: string, coverUid: string, innerUid: string) => void
  onNext: () => void
  onBack: () => void
  labelOverrides?: Record<string, string>
  descriptionOverrides?: Record<string, string>
  templateUidOverrides?: Record<string, { coverTemplateUid?: string; innerTemplateUid?: string }>
}

export default function TemplateStep({
  bookSpec,
  selected,
  onSelect,
  onNext,
  onBack,
  labelOverrides,
  descriptionOverrides,
  templateUidOverrides,
}: Props) {
  const [hoveredUid, setHoveredUid] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const themes = SPEC_THEMES[bookSpec] ?? []

  function handleMouseMove(e: React.MouseEvent, coverUid: string, innerUid: string) {
    setTooltip({ x: e.clientX, y: e.clientY, coverUid, innerUid })
  }

  function handleNext() {
    onNext()
  }

  function getTooltipPos(x: number, y: number) {
    const tooltipW = 460
    const tooltipH = 290
    const offset = 16
    return {
      left: x + offset + tooltipW > window.innerWidth ? x - tooltipW - offset : x + offset,
      top: y + offset + tooltipH > window.innerHeight ? y - tooltipH - offset : y + offset,
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '60px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>디자인 테마를 선택해주세요</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>
        카드에 마우스를 올리면 표지·내지를 미리볼 수 있습니다
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {themes.map((tmpl) => {
          const uidOverride = templateUidOverrides?.[tmpl.uid]
          const coverUid = uidOverride?.coverTemplateUid ?? tmpl.coverTemplateUid
          const innerUid = uidOverride?.innerTemplateUid ?? tmpl.innerTemplateUid
          const isSelected = selected === tmpl.uid
          const isHovered = hoveredUid === tmpl.uid
          const isSupported = tmpl.supported
          const displayLabel = labelOverrides?.[tmpl.uid] ?? tmpl.label
          const displayDescription = descriptionOverrides?.[tmpl.uid] ?? tmpl.description
          return (
            <div
              key={tmpl.uid}
              onClick={() => {
                if (!isSupported) return
                onSelect(tmpl.uid, coverUid, innerUid)
              }}
              onMouseMove={(e) => handleMouseMove(e, coverUid, innerUid)}
              onMouseEnter={() => setHoveredUid(tmpl.uid)}
              onMouseLeave={() => { setHoveredUid(null); setTooltip(null) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                border: `2px solid ${isSelected ? tmpl.accent : isHovered ? '#a5b4fc' : '#e5e5e5'}`,
                borderRadius: '12px',
                cursor: isSupported ? 'pointer' : 'not-allowed',
                backgroundColor: isSelected ? '#f8f8ff' : isHovered ? '#fafafe' : 'white',
                opacity: isSupported ? 1 : 0.45,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>{displayLabel}</span>
                  {tmpl.recommended && (
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: '#ede9fe',
                      color: '#4f46e5',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600,
                    }}>
                      추천
                    </span>
                  )}
                  {!isSupported && (
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: '#f3f4f6',
                      color: '#9ca3af',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600,
                    }}>
                      지원 예정
                    </span>
                  )}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>{displayDescription}</div>
                <div style={{ color: '#ccc', fontSize: '12px', marginTop: '6px' }}>
                  마우스를 올려 미리보기 →
                </div>
              </div>

              {isSelected && (
                <div style={{ color: tmpl.accent, fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>✓</div>
              )}
            </div>
          )
        })}

        <div
          style={{
            padding: '12px 14px',
            border: '1px dashed #d0d0d0',
            borderRadius: '12px',
            backgroundColor: '#fafafa',
            color: '#9ca3af',
          }}
        >
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>+ 더보기 (총 148개 템플릿)</div>
          <div style={{ fontSize: '12px' }}>추가 템플릿은 추후 지원 예정입니다.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: '14px', fontSize: '16px',
            backgroundColor: 'white', color: '#333',
            border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!selected}
          style={{
            flex: 2, padding: '14px', fontSize: '16px',
            backgroundColor: selected ? '#4f46e5' : '#ccc',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: selected ? 'pointer' : 'not-allowed',
          }}
        >
          다음
        </button>
      </div>

      {tooltip && (() => {
        const pos = getTooltipPos(tooltip.x, tooltip.y)
        return (
          <div
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              zIndex: 9999,
              pointerEvents: 'none',
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              gap: '14px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <img
                src={THUMB(tooltip.coverUid)}
                alt="표지"
                style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: '8px', display: 'block' }}
              />
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>표지</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img
                src={THUMB(tooltip.innerUid)}
                alt="내지"
                style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: '8px', display: 'block' }}
              />
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '6px' }}>내지</div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
