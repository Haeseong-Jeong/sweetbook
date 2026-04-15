import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1>📖 나만의 포토 스토리북</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        소중한 사진과 이야기를 실물 책으로 만들어보세요
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '320px',
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => navigate('/create')}
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          스토리북 만들기
        </button>

        <button
          onClick={() => navigate('/create/ai')}
          style={{
            padding: '16px 40px',
            fontSize: '18px',
            backgroundColor: 'white',
            color: '#4f46e5',
            border: '1px solid #c7d2fe',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          AI 동화책 만들기
        </button>
      </div>
    </div>
  )
}
