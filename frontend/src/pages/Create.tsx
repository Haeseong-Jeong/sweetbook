import { useState } from 'react'
import BookNameStep from '../components/wizard/BookNameStep'
import SpecStep from '../components/wizard/SpecStep'
import TemplateStep from '../components/wizard/TemplateStep'
import PhotoUploadStep from '../components/wizard/PhotoUploadStep'
import CoverStep from '../components/wizard/CoverStep'
import ContentsStep from '../components/wizard/ContentsStep'
import ProcessingStep from '../components/wizard/ProcessingStep'
import ShippingStep from '../components/wizard/ShippingStep'

interface WizardData {
  bookName: string
  bookSpec: string
  templateId: string        // TemplateStep 선택 추적용 (UI용)
  coverTemplateUid: string  // 실제 API 호출용
  innerTemplateUid: string  // 실제 API 호출용
  photos: File[]
  coverPhotoIndex: number                // Step 5: 표지 대표 사진 인덱스
  coverFileKey: string                   // Step 5: file 바인딩 파라미터 키 (예: "coverPhoto")
  coverParams: Record<string, string>    // Step 5: 표지 텍스트 파라미터
  contentsParams: Record<string, string> // Step 6: 공통 내지 텍스트 파라미터
  contentsDateKey: string                // Step 6: 내지별 날짜 파라미터 키
  contentsDateValues: string[]           // Step 6: 내지별 날짜 값
  photosPerSpread: number                // Step 6: 내지당 사진 수
}

const initialData: WizardData = {
  bookName: '',
  bookSpec: '',
  templateId: '',
  coverTemplateUid: '',
  innerTemplateUid: '',
  photos: [],
  coverPhotoIndex: 0,
  coverFileKey: '',
  coverParams: {},
  contentsParams: {},
  contentsDateKey: '',
  contentsDateValues: [],
  photosPerSpread: 3,
}

// 판형별 최소 페이지 수 (GET /book-specs 확인값)
const SPEC_PAGE_MIN: Record<string, number> = {
  SQUAREBOOK_HC: 24,
  PHOTOBOOK_A4_SC: 24,
  PHOTOBOOK_A5_SC: 50,
}

export default function Create() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [bookUid, setBookUid] = useState('')
  const [estimatedAmount, setEstimatedAmount] = useState(0)

  function update(fields: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...fields }))
  }

  return (
    <div>
      {/* 단계 표시 */}
      <div style={{ textAlign: 'center', padding: '24px 20px 0', color: '#888', fontSize: '14px' }}>
        Step {step} / 8
      </div>

      {step === 1 && (
        <BookNameStep
          initialName={data.bookName}
          onNext={(name) => {
            update({ bookName: name })
            setStep(2)
          }}
        />
      )}

      {step === 2 && (
        <SpecStep
          selected={data.bookSpec}
          onSelect={(specUid) => update({ bookSpec: specUid })}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <TemplateStep
          bookSpec={data.bookSpec}
          selected={data.templateId}
          onSelect={(uid, coverUid, innerUid) =>
            update({ templateId: uid, coverTemplateUid: coverUid, innerTemplateUid: innerUid })
          }
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <PhotoUploadStep
          photos={data.photos}
          minPhotos={1 + (SPEC_PAGE_MIN[data.bookSpec] ?? 24)}
          onNext={(photos) => {
            update({ photos })
            setStep(5)
          }}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <CoverStep
          photos={data.photos}
          coverTemplateUid={data.coverTemplateUid}
          coverPhotoIndex={data.coverPhotoIndex}
          coverFileKey={data.coverFileKey}
          coverParams={data.coverParams}
          onNext={(coverPhotoIndex, coverFileKey, coverParams) => {
            update({ coverPhotoIndex, coverFileKey, coverParams })
            setStep(6)
          }}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && (
        <ContentsStep
          photos={data.photos}
          coverPhotoIndex={data.coverPhotoIndex}
          innerTemplateUid={data.innerTemplateUid}
          contentsParams={data.contentsParams}
          contentsDateKey={data.contentsDateKey}
          contentsDateValues={data.contentsDateValues}
          initialPhotosPerSpread={data.photosPerSpread}
          minSpreads={SPEC_PAGE_MIN[data.bookSpec] ?? 24}
          onNext={(contentsParams, photosPerSpread, contentsDateKey, contentsDateValues) => {
            update({ contentsParams, photosPerSpread, contentsDateKey, contentsDateValues })
            setStep(7)
          }}
          onBack={() => setStep(5)}
        />
      )}

      {step === 7 && (
        <ProcessingStep
          bookName={data.bookName}
          bookSpec={data.bookSpec}
          coverTemplateUid={data.coverTemplateUid}
          innerTemplateUid={data.innerTemplateUid}
          photos={data.photos}
          coverPhotoIndex={data.coverPhotoIndex}
          coverFileKey={data.coverFileKey}
          coverParams={data.coverParams}
          contentsParams={data.contentsParams}
          contentsDateKey={data.contentsDateKey}
          contentsDateValues={data.contentsDateValues}
          photosPerSpread={data.photosPerSpread}
          completedResult={bookUid ? { bookUid, totalAmount: estimatedAmount } : undefined}
          onNext={(uid, amount) => {
            setBookUid(uid)
            setEstimatedAmount(amount)
            setStep(8)
          }}
          onBack={() => setStep(6)}
        />
      )}

      {step === 8 && (
        <ShippingStep
          bookUid={bookUid}
          estimatedAmount={estimatedAmount}
          onBack={() => setStep(7)}
        />
      )}
    </div>
  )
}
