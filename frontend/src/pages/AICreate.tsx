import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SpecStep from '../components/wizard/SpecStep'
import AIStoryInputStep from '../components/wizard/AIStoryInputStep'
import TemplateStep from '../components/wizard/TemplateStep'
import AILoadingStep from '../components/wizard/AILoadingStep'
import AIPreviewStep from '../components/wizard/AIPreviewStep'
import AIProcessingStep from '../components/wizard/AIProcessingStep'
import ShippingStep from '../components/wizard/ShippingStep'

const AI_THEME_LABELS: Record<string, string> = {
  SQUAREBOOK_HC_google_A: '테마 A',
  SQUAREBOOK_HC_diary_A: '테마 B',
  SQUAREBOOK_HC_notice_A: '테마 C',
  PHOTOBOOK_A4_SC_google_A: '테마 A',
  PHOTOBOOK_A4_SC_diary_A: '테마 B',
  PHOTOBOOK_A4_SC_notice_A: '테마 C',
  PHOTOBOOK_A5_SC_google_A: '테마 A',
  PHOTOBOOK_A5_SC_diary_A: '테마 B',
  PHOTOBOOK_A5_SC_notice_A: '테마 C',
}

const AI_THEME_DESCRIPTIONS: Record<string, string> = {
  SQUAREBOOK_HC_google_A: '왼쪽 삽화 + 오른쪽 제목·줄거리, 동화책에 최적화된 레이아웃입니다.',
  SQUAREBOOK_HC_diary_A: '감정선과 장면 회상이 돋보이는 부드러운 감성 테마입니다.',
  SQUAREBOOK_HC_notice_A: '구성과 정보 전달이 분명한 정리형 연출의 테마입니다.',
  PHOTOBOOK_A4_SC_google_A: '왼쪽 삽화 + 오른쪽 제목·줄거리, 동화책에 최적화된 레이아웃입니다.',
  PHOTOBOOK_A4_SC_diary_A: '감정선과 장면 회상이 돋보이는 부드러운 감성 테마입니다.',
  PHOTOBOOK_A4_SC_notice_A: '구성과 정보 전달이 분명한 정리형 연출의 테마입니다.',
  PHOTOBOOK_A5_SC_google_A: '왼쪽 삽화 + 오른쪽 제목·줄거리, 동화책에 최적화된 레이아웃입니다.',
  PHOTOBOOK_A5_SC_diary_A: '감정선과 장면 회상이 돋보이는 부드러운 감성 테마입니다.',
  PHOTOBOOK_A5_SC_notice_A: '구성과 정보 전달이 분명한 정리형 연출의 테마입니다.',
}

// AI 동화책 전용: 테마 A의 내지를 일기장B (내지a_contain) 으로 교체
const AI_TEMPLATE_UID_OVERRIDES: Record<string, { coverTemplateUid?: string; innerTemplateUid?: string }> = {
  SQUAREBOOK_HC_google_A:    { coverTemplateUid: '79yjMH3qRPly', innerTemplateUid: '3FhSEhJ94c0T' },
  PHOTOBOOK_A4_SC_google_A:  { coverTemplateUid: '31LOxBQzsVwo', innerTemplateUid: '4Bew6giLhZp6' },
  PHOTOBOOK_A5_SC_google_A:  { coverTemplateUid: '3sVKHg6kk7w0', innerTemplateUid: '33b8MVBTO3Pg' },
}

export default function AICreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [bookSpec, setBookSpec] = useState('')
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [prompt, setPrompt] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [coverTemplateUid, setCoverTemplateUid] = useState('')
  const [innerTemplateUid, setInnerTemplateUid] = useState('')
  const [bookUid, setBookUid] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [processingResult, setProcessingResult] = useState<{ bookUid: string; totalAmount: number } | undefined>()

  return (
    <div>
      {step <= 3 && (
        <div style={{ textAlign: 'center', padding: '24px 20px 0', color: '#888', fontSize: '14px' }}>
          Step {step} / 3
        </div>
      )}

      {step === 1 && (
        <SpecStep
          selected={bookSpec}
          onSelect={(specUid) => {
            setBookSpec(specUid)
            setTemplateId('')
            setCoverTemplateUid('')
            setInnerTemplateUid('')
          }}
          onNext={() => setStep(2)}
          onBack={() => navigate('/')}
        />
      )}

      {step === 2 && (
        <AIStoryInputStep
          images={referenceImages}
          prompt={prompt}
          onNext={(images, nextPrompt) => {
            setReferenceImages(images)
            setPrompt(nextPrompt)
            setStep(3)
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <TemplateStep
          bookSpec={bookSpec}
          selected={templateId}
          labelOverrides={AI_THEME_LABELS}
          descriptionOverrides={AI_THEME_DESCRIPTIONS}
          templateUidOverrides={AI_TEMPLATE_UID_OVERRIDES}
          onSelect={(uid, coverUid, innerUid) => {
            setTemplateId(uid)
            setCoverTemplateUid(coverUid)
            setInnerTemplateUid(innerUid)
          }}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <AILoadingStep onDone={() => setStep(5)} />
      )}

      {step === 5 && (
        <AIPreviewStep
          onNext={() => setStep(6)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 6 && (
        <AIProcessingStep
          bookSpec={bookSpec}
          coverTemplateUid={coverTemplateUid}
          innerTemplateUid={innerTemplateUid}
          completedResult={processingResult}
          onNext={(uid, amount) => {
            setBookUid(uid)
            setTotalAmount(amount)
            setProcessingResult({ bookUid: uid, totalAmount: amount })
            setStep(7)
          }}
          onBack={() => setStep(5)}
        />
      )}

      {step === 7 && (
        <ShippingStep
          bookUid={bookUid}
          estimatedAmount={totalAmount}
          onBack={() => setStep(6)}
        />
      )}
    </div>
  )
}
