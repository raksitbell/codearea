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

export function Quiz() {
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
          <div className="answers">{['10', '15', '20', '25'].map((x, i) => <button key={x} className={i === 1 ? 'correct' : ''}>{x}</button>)}</div>
          </Card>
          <Card className="result-card success">
          <Icon filled>task_alt</Icon>
          <CardTitle>ถูกต้อง!</CardTitle>
          <CardDescription>รับรางวัลล็อกอินวันนี้: +1 หัวใจ และ +50 XP สำหรับสตรีกของคุณ</CardDescription>
          <AppButton>รับรางวัล</AppButton>
          </Card>
        </div>
      </div>
    </Page>
  );
}
