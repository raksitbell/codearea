import { useState } from 'react';
import { AppButton } from '../components/AppButton';
import { Icon } from '../components/Icon';
import { Page } from '../components/Layout';
import { Card, CardDescription, CardTitle } from '../components/ui/card';

const week = [
  ['จ', '10', true],
  ['อ', '11', true],
  ['พ', '12', true],
  ['พฤ', '13', true],
  ['ศ', '14', true],
  ['ส', '15', 'today'],
  ['อา', '16', false],
];

const answers = ['10', '15', '20', '25'];
const correctAnswer = '15';

export function Quiz() {
  const [result, setResult] = useState(null);

  const handleAnswer = (answer) => {
    setResult({
      answer,
      correct: answer === correctAnswer,
    });
  };

  return (
    <Page title="แบบทดสอบเช็กอินประจำวัน">
      <div className="daily-layout">
        <Card className="checkin-calendar">
          <div className="calendar-head">
            <div>
              <CardTitle>เช็กอินสัปดาห์นี้</CardTitle>
              <CardDescription>สะสมสตรีกและรับรางวัลประจำวัน</CardDescription>
            </div>
            <div className="streak-badge"><Icon filled>local_fire_department</Icon> 24 วัน</div>
          </div>
          <div className="week-grid">
            {week.map(([day, date, state]) => (
              <div className={`day-card ${state === true ? 'done' : ''} ${state === 'today' ? 'today' : ''}`} key={day}>
                <span>{day}</span>
                <strong>{date}</strong>
                <Icon filled>{state === true ? 'task_alt' : state === 'today' ? 'radio_button_checked' : 'lock'}</Icon>
              </div>
            ))}
          </div>
        </Card>
        <div className="quiz-layout">
          <Card className="quiz-card">
          <div className="reward-stack">
            <div className="reward"><Icon filled>favorite</Icon><strong>+1 หัวใจ</strong></div>
            <div className="reward xp"><Icon filled>bolt</Icon><strong>+50 XP</strong></div>
          </div>
          <CardTitle>ผลลัพธ์ของโค้ดนี้คืออะไร?</CardTitle>
          <pre>{`let total = 0;
for (let i = 1; i <= 5; i++) {
  total += i;
}
console.log(total);`}</pre>
          <div className="answers">
            {answers.map((answer) => (
              <button
                key={answer}
                className={result?.answer === answer ? (result.correct ? 'selected correct' : 'selected wrong') : ''}
                onClick={() => handleAnswer(answer)}
                type="button"
              >
                {answer}
              </button>
            ))}
          </div>
          </Card>
          <Card className="quiz-guide-card">
            <Icon filled>tips_and_updates</Icon>
            <CardTitle>คิดแบบวนลูป</CardTitle>
            <CardDescription>ตัวแปร total เริ่มที่ 0 แล้วบวกค่า i ตั้งแต่ 1 ถึง 5 รวมทั้งหมดก่อนพิมพ์ผลลัพธ์</CardDescription>
          </Card>
        </div>
      </div>
      {result && (
        <div className="reward-modal-backdrop" role="dialog" aria-modal="true" aria-label={result.correct ? 'ตอบถูกต้อง' : 'ตอบผิด'}>
          <Card className={`reward-modal quiz-result-modal ${result.correct ? 'quiz-correct-modal' : 'quiz-wrong-modal'}`}>
            <button className="modal-close" onClick={() => setResult(null)} aria-label="ปิด">
              <Icon>close</Icon>
            </button>
            <span className="reward-modal-icon quiz-result-icon">
              <Icon filled>{result.correct ? 'task_alt' : 'error'}</Icon>
            </span>
            <h2>{result.correct ? 'ถูกต้อง!' : 'ยังไม่ถูก'}</h2>
            <p>
              {result.correct
                ? 'ผลรวม 1 + 2 + 3 + 4 + 5 เท่ากับ 15 รับรางวัลเช็กอินวันนี้ได้เลย'
                : `คำตอบ ${result.answer} ยังไม่ใช่ผลรวมของลูปนี้ ลองนับค่า i ตั้งแต่ 1 ถึง 5 อีกครั้ง`}
            </p>
            {result.correct ? (
              <>
                <div className="reward-prizes">
                  <span><Icon filled>favorite</Icon><strong>+1 หัวใจ</strong></span>
                  <span><Icon filled>stars</Icon><strong>+50 XP</strong></span>
                </div>
                <div className="level-progress">
                  <div>
                    <strong>เลเวล 42</strong>
                    <span>2,500 / 3,000 XP</span>
                  </div>
                  <div className="level-bar"><span style={{ width: '84%' }} /></div>
                  <small>อีก 500 XP เพื่อเลเวล 43</small>
                </div>
                <AppButton large onClick={() => setResult(null)}>รับรางวัล</AppButton>
              </>
            ) : (
              <>
                <div className="quiz-feedback-box">
                  <strong>แนวคิด</strong>
                  <span>ลูปบวกเลข 1, 2, 3, 4 และ 5 เข้า total ดังนั้นผลรวมคือ 15</span>
                </div>
                <AppButton large variant="danger" onClick={() => setResult(null)}>ลองใหม่</AppButton>
              </>
            )}
          </Card>
        </div>
      )}
    </Page>
  );
}
