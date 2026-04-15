import { useEffect, useState } from 'react'

const MESSAGES = [
  'AI가 스토리를 구성하는 중...',
  '각 장면의 삽화를 그리는 중...',
  '표지를 완성하는 중...',
  '마지막으로 다듬는 중...',
]

interface Props {
  onDone: () => void
}

export default function AILoadingStep({ onDone }: Props) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length)
    }, 1000)

    const doneTimer = setTimeout(() => {
      clearInterval(msgTimer)
      onDone()
    }, 4000)

    return () => {
      clearInterval(msgTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '32px',
      padding: '60px 20px',
    }}>
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '4px solid #ede9fe',
          borderTopColor: '#4f46e5',
          animation: 'ai-spin 0.9s linear infinite',
        }} />
        <style>{`
          @keyframes ai-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '10px' }}>
          AI 동화책 생성 중
        </div>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          minHeight: '22px',
          transition: 'opacity 0.3s',
        }}>
          {MESSAGES[msgIndex]}
        </div>
      </div>
    </div>
  )
}
