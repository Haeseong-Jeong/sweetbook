import { useEffect, useRef, useState } from 'react'
import { PAGES } from './AIPreviewStep'

const SPEC_PAGE_MIN: Record<string, number> = {
  SQUAREBOOK_HC: 24,
  PHOTOBOOK_A4_SC: 24,
  PHOTOBOOK_A5_SC: 50,
}

interface ParamDef {
  binding: 'text' | 'file' | 'rowGallery'
  required: boolean
  description?: string
}

interface StepStatus {
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
}

interface Props {
  bookSpec: string
  coverTemplateUid: string
  innerTemplateUid: string
  completedResult?: { bookUid: string; totalAmount: number }
  onNext: (bookUid: string, totalAmount: number) => void
  onBack: () => void
}

const BASE = 'http://localhost:8000'

const DONE_STEPS: StepStatus[] = [
  { label: '책 생성 완료', status: 'done' },
  { label: '사진 업로드 완료', status: 'done' },
  { label: '표지 설정 완료', status: 'done' },
  { label: '내지 생성 완료', status: 'done' },
  { label: '책 완성', status: 'done' },
  { label: '가격 계산 완료', status: 'done' },
]

const AI_IMAGE_FILENAMES = PAGES.map((page) => page.photo)
const HIDDEN_TITLE_TEXT = '\u200B'

export default function AIProcessingStep({
  bookSpec,
  coverTemplateUid,
  innerTemplateUid,
  completedResult,
  onNext,
  onBack,
}: Props) {
  const [steps, setSteps] = useState<StepStatus[]>(
    completedResult ? DONE_STEPS : [
      { label: '책 생성 중...', status: 'pending' },
      { label: '사진 업로드 중...', status: 'pending' },
      { label: '표지 설정 중...', status: 'pending' },
      { label: '내지 생성 중...', status: 'pending' },
      { label: '책 완성 중...', status: 'pending' },
      { label: '가격 계산 중...', status: 'pending' },
    ]
  )
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ bookUid: string; totalAmount: number } | null>(
    completedResult ?? null
  )
  const started = useRef(false)

  function setStep(index: number, status: StepStatus['status'], label?: string) {
    setSteps(prev => prev.map((s, i) => i === index ? { label: label ?? s.label, status } : s))
  }

  useEffect(() => {
    if (completedResult) return
    if (started.current) return
    started.current = true
    run()
  }, [])

  async function run() {
    try {
      // 1. 책 생성 + 템플릿 정의 병렬 fetch
      setStep(0, 'running')
      const coverPage = PAGES[0]
      const bookTitle = coverPage.kind === 'cover' ? coverPage.title : 'AI 동화책'

      const [bookRes, coverTemplateRes, innerTemplateRes] = await Promise.all([
        fetch(`${BASE}/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: bookTitle, bookSpecUid: bookSpec }),
        }),
        fetch(`${BASE}/templates/${coverTemplateUid}`).then(r => r.json()),
        fetch(`${BASE}/templates/${innerTemplateUid}`).then(r => r.json()),
      ])

      if (!bookRes.ok) throw new Error('책 생성 실패: ' + (await bookRes.text()))
      const bookJson = await bookRes.json()
      const bookUid = bookJson.data?.uid ?? bookJson.data?.bookUid ?? bookJson.uid
      if (!bookUid) throw new Error(`bookUid를 받지 못했습니다 (응답: ${JSON.stringify(bookJson)})`)

      // 템플릿 파라미터 키 발견
      const coverDefs: Record<string, ParamDef> = coverTemplateRes.data?.parameters?.definitions ?? {}
      const innerDefs: Record<string, ParamDef> = innerTemplateRes.data?.parameters?.definitions ?? {}

      const coverFileKey = Object.entries(coverDefs).find(([, d]) => d.binding === 'file')?.[0] ?? ''
      const coverTextDefs = Object.entries(coverDefs).filter(([, d]) => d.binding === 'text')

      const innerFileKey = Object.entries(innerDefs).find(([, d]) => d.binding === 'file')?.[0] ?? ''
      const innerTextDefs = Object.entries(innerDefs).filter(([, d]) => d.binding === 'text')
      const dateFieldKey = (
        innerTextDefs.find(([key]) => key === 'date' || key === 'monthYearLabel' || key === 'dayLabel') ??
        innerTextDefs.find(([key, def]) => {
          const lk = key.toLowerCase()
          const label = (def.description ?? '').toLowerCase()
          return lk.includes('date') || lk.includes('daylabel') || label.includes('date') || label.includes('날짜')
        })
      )?.[0] ?? ''
      const titleFieldKey = (
        innerTextDefs.find(([key]) => key === 'title') ??
        innerTextDefs.find(([key, def]) => {
          const lk = key.toLowerCase()
          const label = (def.description ?? '').toLowerCase()
          return lk.includes('title') || label.includes('소제목') || label.includes('제목')
        })
      )?.[0] ?? ''
      const bodyFieldKey = (
        innerTextDefs.find(([key]) => key === 'diaryText') ??
        innerTextDefs.find(([key]) => key !== dateFieldKey && key !== titleFieldKey)
      )?.[0] ?? ''

      setStep(0, 'done', '책 생성 완료')

      // 2. AI 사진 업로드 (서버 이미지 25장을 순차 업로드하며 진행 표시)
      setStep(1, 'running', `사진 업로드 중... (0/${AI_IMAGE_FILENAMES.length})`)
      const fileKeys: string[] = []
      for (let i = 0; i < AI_IMAGE_FILENAMES.length; i++) {
        const filename = AI_IMAGE_FILENAMES[i]
        const photoRes = await fetch(`${BASE}/books/${bookUid}/ai-photos/${filename}`, { method: 'POST' })
        if (!photoRes.ok) {
          throw new Error(`사진 ${i + 1} 업로드 실패: ` + (await photoRes.text()))
        }
        const photoJson = await photoRes.json()
        const fileKey = photoJson.data?.fileName
        if (!fileKey) {
          throw new Error(`사진 ${i + 1} 파일 키를 받지 못했습니다`)
        }
        fileKeys.push(fileKey)
        setStep(1, 'running', `사진 업로드 중... (${i + 1}/${AI_IMAGE_FILENAMES.length})`)
      }
      setStep(1, 'done', `사진 업로드 완료 (${fileKeys.length}장)`)

      // 3. 표지 설정 (fileKeys[0] = cover.png)
      setStep(2, 'running')
      const coverParams: Record<string, string> = {}
      if (coverPage.kind === 'cover') {
        if (coverTextDefs[0]) coverParams[coverTextDefs[0][0]] = coverPage.title
        if (coverTextDefs[1]) coverParams[coverTextDefs[1][0]] = coverPage.dateRange
      }
      const coverForm = new FormData()
      coverForm.append('templateUid', coverTemplateUid)
      coverForm.append('parameters', JSON.stringify({
        ...(coverFileKey ? { [coverFileKey]: fileKeys[0] } : {}),
        ...coverParams,
      }))
      const coverRes = await fetch(`${BASE}/books/${bookUid}/cover`, { method: 'POST', body: coverForm })
      if (!coverRes.ok) throw new Error('표지 설정 실패: ' + (await coverRes.text()))
      setStep(2, 'done', '표지 설정 완료')

      // 4. 내지 생성 (24 스프레드, 스펙에 따라 최소 페이지 채우기)
      const innerPages = PAGES.slice(1)
      const minSpreads = SPEC_PAGE_MIN[bookSpec] ?? 24
      const totalSpreads = Math.max(innerPages.length, minSpreads)

      setStep(3, 'running', `내지 생성 중... (0/${totalSpreads})`)
      for (let i = 0; i < totalSpreads; i++) {
        const page = innerPages[i % innerPages.length]
        const fileKey = fileKeys[1 + (i % innerPages.length)]  // fileKeys[0]는 커버
        if (page.kind !== 'inner') continue

        const contentParams: Record<string, unknown> = {}
        if (innerFileKey) contentParams[innerFileKey] = fileKey
        if (dateFieldKey) contentParams[dateFieldKey] = page.date
        if (titleFieldKey) contentParams[titleFieldKey] = HIDDEN_TITLE_TEXT
        if (bodyFieldKey) contentParams[bodyFieldKey] = page.diaryText

        const contentForm = new FormData()
        contentForm.append('templateUid', innerTemplateUid)
        contentForm.append('parameters', JSON.stringify(contentParams))
        const contentRes = await fetch(`${BASE}/books/${bookUid}/contents?breakBefore=page`, {
          method: 'POST',
          body: contentForm,
        })
        if (!contentRes.ok) {
          const errJson = await contentRes.json().catch(() => ({}))
          throw new Error(`내지 ${i + 1} 생성 실패: ` + JSON.stringify(errJson))
        }
        setStep(3, 'running', `내지 생성 중... (${i + 1}/${totalSpreads})`)
      }
      setStep(3, 'done', `내지 생성 완료 (${totalSpreads} 스프레드)`)

      // 5. 책 완성
      setStep(4, 'running')
      const finalRes = await fetch(`${BASE}/books/${bookUid}/finalize`, { method: 'POST' })
      if (!finalRes.ok) throw new Error('책 완성 실패: ' + (await finalRes.text()))
      setStep(4, 'done', '책 완성')

      // 6. 가격 견적
      setStep(5, 'running')
      const estimateRes = await fetch(`${BASE}/orders/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ bookUid, quantity: 1 }] }),
      })
      if (!estimateRes.ok) throw new Error('가격 계산 실패: ' + (await estimateRes.text()))
      const estimateJson = await estimateRes.json()
      const totalAmount = estimateJson.data?.totalAmount ?? estimateJson.data?.total ?? 0
      setStep(5, 'done', '가격 계산 완료')
      setResult({ bookUid, totalAmount })

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s))
    }
  }

  const statusColor = {
    done:    { bg: '#4f46e5', text: 'white' },
    running: { bg: '#e0e7ff', text: '#4f46e5' },
    error:   { bg: '#fee2e2', text: '#dc2626' },
    pending: { bg: '#f3f4f6', text: '#9ca3af' },
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '8px' }}>동화책을 만들고 있어요</h2>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
        잠시만 기다려 주세요. AI가 생성한 내용으로 책을 완성하고 있습니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {steps.map((s, i) => {
          const colors = statusColor[s.status]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700,
                backgroundColor: colors.bg, color: colors.text,
              }}>
                {s.status === 'done' ? '✓' : s.status === 'error' ? '✗' : s.status === 'running' ? '…' : i + 1}
              </div>
              <span style={{
                fontSize: '14px',
                color: s.status === 'pending' ? '#9ca3af' : s.status === 'error' ? '#dc2626' : '#111',
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{
          padding: '16px', borderRadius: '8px', marginBottom: '24px',
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
        }}>
          <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>오류: {error}</p>
        </div>
      )}

      {result && (
        <div style={{
          padding: '20px', borderRadius: '12px', marginBottom: '24px',
          backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd',
        }}>
          <p style={{ fontSize: '13px', color: '#7c3aed', margin: '0 0 8px' }}>
            예상 금액 (배송비 별도)
          </p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#4f46e5', margin: 0 }}>
            {result.totalAmount.toLocaleString()}원
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        {error && (
          <button onClick={onBack} style={{
            flex: 1, padding: '13px', fontSize: '14px',
            border: '1px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer',
          }}>이전</button>
        )}
        {result && (
          <button
            onClick={() => onNext(result.bookUid, result.totalAmount)}
            style={{
              flex: 2, padding: '13px', fontSize: '14px',
              backgroundColor: '#4f46e5', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
            }}
          >배송지 입력하기</button>
        )}
      </div>
    </div>
  )
}
