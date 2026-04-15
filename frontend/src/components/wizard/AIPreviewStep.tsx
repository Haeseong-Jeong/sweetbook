import { useState } from 'react'

const BASE = 'http://localhost:8000/ai-assets'

export type CoverPage = {
  kind: 'cover'
  title: string
  dateRange: string
  photo: string
}

export type InnerPage = {
  kind: 'inner'
  date: string
  photo: string
  diaryText: string
}

export type PageData = CoverPage | InnerPage

export const PAGES: PageData[] = [
  { kind: 'cover', title: '달빛 숲과 길 잃은 아기 별', dateRange: '제미나이 지음', photo: 'cover.png' },
  { kind: 'inner', date: 'p1',  photo: 'p1.png',  diaryText: `깊은 밤, 달빛 숲에 사는 토끼 남매 '모모'와 '코코'는 잠이 들 준비를 하고 있었어요. 그런데 창밖에서 "잉잉" 하는 작은 울음소리가 들려왔답니다.` },
  { kind: 'inner', date: 'p2',  photo: 'p2.png',  diaryText: `밖으로 나가보니, 반짝이는 꼬리를 가진 작은 아기 별이 풀숲에 엉엉 울며 주저앉아 있었어요. "하늘나라 집으로 가는 길을 잃어버렸어." 아기 별이 속삭였어요.` },
  { kind: 'inner', date: 'p3',  photo: 'p3.png',  diaryText: `"걱정 마, 우리가 도와줄게!" 용감한 오빠 모모가 가슴을 펴며 말했어요. "우리는 이 숲을 아주 잘 알거든." 다정한 동생 코코도 아기 별의 손을 꼭 잡았죠.` },
  { kind: 'inner', date: 'p4',  photo: 'p4.png',  diaryText: `세 친구는 아기 별의 집이 있는 '가장 높은 언덕'을 향해 걷기 시작했어요. 밤하늘의 달님은 환한 빛을 비추어 친구들의 길을 밝혀주었답니다.` },
  { kind: 'inner', date: 'p5',  photo: 'p5.png',  diaryText: `첫 번째로 마주친 곳은 반짝이는 '은하수 시냇물'이었어요. 징검다리가 너무 멀어 아기 별은 겁이 났지만, 모모가 아기 별을 등에 업고 훌쩍 뛰어넘었어요.` },
  { kind: 'inner', date: 'p6',  photo: 'p6.png',  diaryText: `시냇가 옆에서 잠자던 커다란 개구리 아저씨가 눈을 떴어요. "이 밤중에 어디를 가니?" 아저씨는 커다란 연잎 우산을 빌려주며 응원해 주었답니다.` },
  { kind: 'inner', date: 'p7',  photo: 'p7.png',  diaryText: `숲속 깊은 곳에는 보라색으로 빛나는 '방울꽃 터널'이 나타났어요. 터널이 너무 어두워 앞이 보이지 않자, 아기 별이 몸을 흔들어 환한 빛을 내뿜었지요.` },
  { kind: 'inner', date: 'p8',  photo: 'p8.png',  diaryText: `"와, 정말 예쁘다!" 코코가 감탄했어요. 아기 별의 빛 덕분에 토끼 남매는 무서운 어둠 속에서도 씩씩하게 걸어갈 수 있었답니다.` },
  { kind: 'inner', date: 'p9',  photo: 'p9.png',  diaryText: `갑자기 쌩쌩~ 차가운 밤바람이 불어오기 시작했어요. 모모와 코코는 복슬복슬한 귀를 세워 아기 별을 따뜻하게 감싸주었지요.` },
  { kind: 'inner', date: 'p10', photo: 'p10.png', diaryText: `"조금만 참아, 거의 다 왔어." 세 친구는 서로의 온기를 나누며 추위를 이겨냈어요. 서로가 곁에 있어 마음만은 무척 따뜻했답니다.` },
  { kind: 'inner', date: 'p11', photo: 'p11.png', diaryText: `이번에는 길을 막고 있는 거대한 '졸음 덩굴'을 만났어요. 이 덩굴 옆을 지나가면 누구든 스르르 잠이 들고 마는 마법에 걸린답니다.` },
  { kind: 'inner', date: 'p12', photo: 'p12.png', diaryText: `"눈을 크게 뜨고 노래를 부르자!" 코코가 제안했어요. 셋이서 크게 노래를 부르자, 졸음 덩굴은 귀를 막고 길을 비켜주었지요.` },
  { kind: 'inner', date: 'p13', photo: 'p13.png', diaryText: `드디어 숲의 끝, 구름 위로 솟아오른 '무지개 사다리' 앞에 도착했어요. 이 사다리를 타고 올라가면 아기 별의 집인 하늘나라가 나온대요.` },
  { kind: 'inner', date: 'p14', photo: 'p14.png', diaryText: `하지만 사다리는 너무 높고 가팔라서 아기 별 혼자 올라가기 힘들었어요. "우리 같이 힘을 내보자!" 모모와 코코가 아래에서 아기 별을 밀어주었지요.` },
  { kind: 'inner', date: 'p15', photo: 'p15.png', diaryText: `한 계단, 두 계단... 친구들은 땀을 흘리며 정성껏 사다리를 올랐어요. 밤하늘의 구름들이 푹신한 발판이 되어 친구들을 도와주었답니다.` },
  { kind: 'inner', date: 'p16', photo: 'p16.png', diaryText: `사다리 중간쯤에서 잠시 쉬어가기로 했어요. 높은 곳에서 내려다본 달빛 숲은 마치 보석을 뿌려놓은 듯 아름답게 빛나고 있었죠.` },
  { kind: 'inner', date: 'p17', photo: 'p17.png', diaryText: `"너희는 정말 좋은 친구들이야." 아기 별이 고마운 마음을 담아 작은 별가루 선물을 주었어요. 모모와 코코의 털이 금세 은하수처럼 반짝거렸답니다.` },
  { kind: 'inner', date: 'p18', photo: 'p18.png', diaryText: `마침내 사다리의 꼭대기, 은빛 구름 광장에 도착했어요. 그곳에는 아기 별을 애타게 찾던 엄마 별과 아빠 별이 기다리고 있었답니다.` },
  { kind: 'inner', date: 'p19', photo: 'p19.png', diaryText: `"찾았다, 우리 아기!" 엄마 별이 아기 별을 품에 꼭 안아주었어요. 온 하늘의 별들이 기뻐하며 일제히 반짝반짝 춤을 추었지요.` },
  { kind: 'inner', date: 'p20', photo: 'p20.png', diaryText: `아기 별은 이제 집으로 돌아가 밤하늘의 자리를 지키게 되었어요. "모모, 코코! 너희를 절대 잊지 않을게. 고마워!"` },
  { kind: 'inner', date: 'p21', photo: 'p21.png', diaryText: `밤하늘 가족들은 토끼 남매를 위해 '달빛 미끄럼틀'을 만들어주었어요. 숲속 집까지 눈 깜짝할 사이에 갈 수 있는 아주 특별한 미끄럼틀이었죠.` },
  { kind: 'inner', date: 'p22', photo: 'p22.png', diaryText: `"안녕! 다음에 또 만나!" 모모와 코코는 아기 별에게 손을 흔들며 미끄럼틀을 타고 슈웅 내려왔어요. 밤바람이 시원하게 귓가를 스쳤답니다.` },
  { kind: 'inner', date: 'p23', photo: 'p23.png', diaryText: `어느덧 숲속 작은 집 앞에 도착하니, 하늘에는 아기 별이 가장 밝게 빛나고 있었어요. 아기 별이 남매에게 윙크를 하는 것만 같았죠.` },
  { kind: 'inner', date: 'p24', photo: 'p24.png', diaryText: `모모와 코코는 포근한 침대에 누워 행복한 꿈나라로 여행을 떠났어요. 내일 밤에도 밤하늘의 아기 별은 친구들을 환하게 지켜줄 거예요.` },
]

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function AIPreviewStep({ onNext, onBack }: Props) {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<'left' | 'right'>('right')

  function go(next: number) {
    setDir(next > index ? 'right' : 'left')
    setIndex(next)
  }

  const page = PAGES[index]
  const animName = dir === 'right' ? 'ai-slide-right' : 'ai-slide-left'

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        @keyframes ai-slide-right {
          from { transform: translateX(5%); opacity: 0; }
          to   { transform: translateX(0);  opacity: 1; }
        }
        @keyframes ai-slide-left {
          from { transform: translateX(-5%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>미리보기</h2>
        <span style={{ fontSize: '13px', color: '#888' }}>
          {index === 0 ? '표지' : `내지 ${index}`} &nbsp;({index + 1} / {PAGES.length})
        </span>
      </div>

      {/* 슬라이드 카드 */}
      <div style={{ overflow: 'hidden', borderRadius: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div
          key={index}
          style={{ animation: `${animName} 0.25s ease-out` }}
        >
          {page.kind === 'cover' ? (
            <CoverLayout page={page} />
          ) : (
            <InnerLayout page={page} />
          )}
        </div>
      </div>

      {/* ← 닷 → 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
        <NavArrow dir="prev" disabled={index === 0} onClick={() => go(index - 1)} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {PAGES.map((_, i) => (
            <div
              key={i}
              onClick={() => go(i)}
              style={{
                width: i === index ? '20px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: i === index ? '#4f46e5' : '#d1d5db',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
        <NavArrow dir="next" disabled={index === PAGES.length - 1} onClick={() => go(index + 1)} />
      </div>

      {/* 하단 버튼 */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
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
          onClick={onNext}
          style={{
            flex: 2, padding: '14px', fontSize: '16px',
            backgroundColor: '#4f46e5', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          구매하기
        </button>
      </div>
    </div>
  )
}

function NavArrow({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '36px', height: '36px',
        borderRadius: '50%',
        border: '1px solid #e5e7eb',
        backgroundColor: disabled ? '#f9fafb' : 'white',
        color: disabled ? '#d1d5db' : '#374151',
        fontSize: '16px',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
    >
      {dir === 'prev' ? '←' : '→'}
    </button>
  )
}

function CoverLayout({ page }: { page: CoverPage }) {
  return (
    <div style={{
      display: 'flex',
      background: '#f5f0e8',
      aspectRatio: '2 / 2.07',
    }}>
      <div style={{ flex: '0 0 58%', overflow: 'hidden' }}>
        <img
          src={`${BASE}/imgs/${page.photo}`}
          alt="표지"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '24px 20px',
      }}>
        <div />
        <div>
          <div style={{
            fontFamily: 'NanumMyeongjo, serif',
            fontSize: '20px', fontWeight: 700,
            color: '#2d2d2d', lineHeight: 1.45,
            wordBreak: 'keep-all', marginBottom: '12px',
          }}>
            {page.title}
          </div>
          <div style={{ fontFamily: 'NanumMyeongjo, serif', fontSize: '13px', color: '#6b5e4e' }}>
            {page.dateRange}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#bbb', lineHeight: 1.5, fontStyle: 'italic' }}>
          Small pieces<br />of my ordinary life.
        </div>
      </div>
    </div>
  )
}

function InnerLayout({ page }: { page: InnerPage }) {
  return (
    <div style={{
      display: 'flex',
      background: '#ffffff',
      aspectRatio: '978 / 1000',
    }}>
      {/* 좌: 사진 */}
      <div style={{ flex: '0 0 62.5%', overflow: 'hidden' }}>
        <img
          src={`${BASE}/imgs/${page.photo}`}
          alt={page.date}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      {/* 우: 텍스트 */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '20px 16px',
        gap: '0',
      }}>
        {/* date — 챕터 번호 */}
        <div style={{
          fontFamily: 'Impact, sans-serif',
          fontSize: '36px', fontWeight: 700,
          color: '#454545', lineHeight: 1,
          marginBottom: '8px',
        }}>
          {page.date}
        </div>

        {/* title — 공백 (틈새 역할) */}
        <div style={{ flex: '0 0 15%' }} />

        {/* diaryText — 줄거리 */}
        <div style={{
          fontFamily: 'NanumMyeongjo, serif',
          fontSize: '12px', lineHeight: '1.9',
          color: '#454545',
          wordBreak: 'keep-all',
          flex: 1,
          overflow: 'hidden',
        }}>
          {page.diaryText}
        </div>
      </div>
    </div>
  )
}
