import { useState } from 'react'

const BASE = 'http://localhost:8000'

interface Props {
  bookUid: string
  estimatedAmount: number
  onBack: () => void
}

const FIELDS = [
  { key: 'recipientName', label: '받는 분', required: true, placeholder: '홍길동' },
  { key: 'recipientPhone', label: '연락처', required: true, placeholder: '01012345678' },
  { key: 'postalCode', label: '우편번호', required: true, placeholder: '12345' },
  { key: 'address1', label: '주소', required: true, placeholder: '서울시 강남구 테헤란로 123' },
  { key: 'address2', label: '상세 주소', required: false, placeholder: '101호' },
  { key: 'memo', label: '배송 메모', required: false, placeholder: '경비실에 맡겨주세요' },
] as const

type FormKey = typeof FIELDS[number]['key']

export default function ShippingStep({ bookUid, estimatedAmount, onBack }: Props) {
  const [form, setForm] = useState<Record<FormKey, string>>({
    recipientName: '',
    recipientPhone: '',
    postalCode: '',
    address1: '',
    address2: '',
    memo: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderUid, setOrderUid] = useState('')

  const isValid = FIELDS.filter(f => f.required).every(f => form[f.key].trim())

  async function submitOrder() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ bookUid, quantity: 1 }],
          shipping: {
            recipientName: form.recipientName,
            recipientPhone: form.recipientPhone,
            postalCode: form.postalCode,
            address1: form.address1,
            address2: form.address2 || undefined,
            memo: form.memo || undefined,
          },
        }),
      })
      if (!res.ok) throw new Error('주문 처리 실패: ' + (await res.text()))
      const json = await res.json()
      const uid = json.data?.orderUid ?? json.data?.uid ?? json.uid ?? ''
      setOrderUid(uid)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 주문 완료 화면
  if (orderUid) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ marginBottom: '10px' }}>주문이 완료되었습니다!</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '6px' }}>
          주문번호: <strong style={{ color: '#4f46e5' }}>{orderUid}</strong>
        </p>
        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '24px', lineHeight: 1.6 }}>
          Sandbox 환경에서는 실제 제작 및 배송이 진행되지 않습니다.
        </p>
        <button
          onClick={() => { window.location.href = '/' }}
          style={{
            marginTop: '32px', padding: '13px 40px', fontSize: '15px',
            backgroundColor: '#4f46e5', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}
        >처음으로</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>배송지를 입력하세요</h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
        예상 금액:{' '}
        <strong style={{ color: '#4f46e5' }}>{estimatedAmount.toLocaleString()}원</strong>
        {' '}(배송비 별도)
      </p>

      {FIELDS.map(({ key, label, required, placeholder }) => (
        <div key={key} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>
            {label}
            {required && <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>}
          </label>
          <input
            type="text"
            value={form[key]}
            onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            style={{
              width: '100%', padding: '10px 12px', fontSize: '14px',
              border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box',
            }}
          />
        </div>
      ))}

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
        }}>
          <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button onClick={onBack} style={{
          flex: 1, padding: '13px', fontSize: '14px',
          border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer',
        }}>이전</button>
        <button
          onClick={submitOrder}
          disabled={!isValid || loading}
          style={{
            flex: 2, padding: '13px', fontSize: '14px',
            backgroundColor: isValid && !loading ? '#4f46e5' : '#ccc',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: isValid && !loading ? 'pointer' : 'not-allowed',
          }}
        >{loading ? '주문 처리 중...' : '주문하기'}</button>
      </div>
    </div>
  )
}
