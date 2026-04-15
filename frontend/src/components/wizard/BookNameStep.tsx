import { useState } from 'react'

interface Props {
  initialName: string
  onNext: (name: string) => void
}

export default function BookNameStep({ initialName, onNext }: Props) {
  const [name, setName] = useState(initialName)

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>책 이름을 지어주세요</h2>
      <p style={{ color: '#888', marginBottom: '32px' }}>나중에 표지에 표시됩니다</p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 우리 가족의 2024년"
        style={{
          width: '100%',
          padding: '14px 16px',
          fontSize: '16px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxSizing: 'border-box',
        }}
      />

      <button
        onClick={() => onNext(name)}
        disabled={name.trim() === ''}
        style={{
          marginTop: '24px',
          width: '100%',
          padding: '14px',
          fontSize: '16px',
          backgroundColor: name.trim() ? '#4f46e5' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: name.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        다음
      </button>
    </div>
  )
}
