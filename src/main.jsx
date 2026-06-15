import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Badge } from './components/ui/badge';
import { Button as UiButton } from './components/ui/button';
import { Card, CardDescription, CardTitle } from './components/ui/card';
import { Progress } from './components/ui/progress';
import './styles.css';

const routes = [
  { id: 'home', label: 'หน้าแรก', icon: 'home' },
  { id: 'subjects', label: 'แผนผังทักษะ', icon: 'account_tree' },
  { id: 'practice', label: 'แบบฝึก', icon: 'code' },
  { id: 'quiz', label: 'เช็กอิน', icon: 'event_repeat' },
  { id: 'leaderboard', label: 'ตารางคะแนน', icon: 'leaderboard' },
  { id: 'profile', label: 'โปรไฟล์', icon: 'person' },
  { id: 'achievements', label: 'ความสำเร็จ', icon: 'workspace_premium' },
];

const features = [
  ['sports_esports', 'green', 'เรียนรู้เหมือนเล่นเกม', 'เปลี่ยนความซับซ้อนของวิทยาการคอมพิวเตอร์ให้กลายเป็นความท้าทายที่สนุกสนาน'],
  ['bolt', 'orange', 'ฟีดแบ็กทันที', 'รู้ผลลัพธ์การรันโค้ดทันที พร้อมคำแนะนำที่ช่วยให้คุณแก้ไขข้อผิดพลาดได้เร็วขึ้น'],
  ['groups', 'blue', 'ชุมชนนักพัฒนา', 'เชื่อมต่อกับเพื่อนผู้เรียน แข่งขัน และเติบโตไปด้วยกันบนกระดานผู้นำ'],
];

const skills = [
  ['text_fields', 'easy', 'ง่าย', 'ไวยากรณ์พื้นฐาน', 'พื้นฐานภาษา', 100, '15/15'],
  ['data_object', 'easy', 'ง่าย', 'ตัวแปร', 'จัดการข้อมูล', 80, '12/15'],
  ['all_inclusive', 'easy', 'ง่าย', 'ลูป', 'ทำซ้ำอย่างมีแบบแผน', 40, '6/15'],
  ['view_column', 'medium', 'ปานกลาง', 'อาร์เรย์', 'จัดการชุดข้อมูล', 10, '2/20'],
  ['abc', 'locked', 'ล็อก', 'สตริง', 'จัดการข้อความ', 0, '0/15'],
  ['repeat', 'locked', 'ล็อก', 'การเรียกซ้ำ', 'แก้ปัญหาแบบย้อนลึก', 0, '0/12'],
  ['memory', 'locked', 'ล็อก', 'กำหนดการพลวัต', 'จำผลลัพธ์เพื่อแก้โจทย์ยาก', 0, '0/25'],
  ['hub', 'locked', 'ล็อก', 'กราฟ', 'เส้นทางและความสัมพันธ์', 0, '0/20'],
  ['account_tree', 'locked', 'ล็อก', 'ต้นไม้', 'โครงสร้างข้อมูลแบบลำดับชั้น', 0, '0/18'],
];

const leaderboard = [
  ['1', 'ซาราห์ สคริปต์', '4,250 XP', 4250, 'military_tech'],
  ['2', 'เดวิด ดีบักเกอร์', '3,980 XP', 3980, 'terminal'],
  ['3', 'อเล็กซ์ โค้ดเดอร์', '2,450 XP', 2450, 'code'],
  ['4', 'นัลล์ พอยน์เตอร์', '850 XP', 850, 'bug_report'],
  ['5', 'อินฟินิตลูป', '420 XP', 420, 'all_inclusive'],
  ['6', 'สแต็กโอเวอร์โฟลว์', '100 XP', 100, 'layers'],
];

const badges = [
  ['workspace_premium', 'ปรมาจารย์ไบนารี', 'แก้โจทย์ต้นไม้ 10 ข้อ', true],
  ['psychology', 'มือใหม่รีเคอร์ชัน', 'จบโมดูลแล้ว', true],
  ['whatshot', 'ใจแกร่ง', 'สตรีก 30 วัน', true],
  ['conversion_path', 'กูรูกราฟ', 'ยังล็อกอยู่', false],
  ['pest_control', 'นักล่าบั๊ก', 'ยังล็อกอยู่', false],
];

const rankMedals = {
  1: 'military_tech',
  2: 'workspace_premium',
  3: 'verified',
};

function Icon({ children, filled = false }) {
  return (
    <span className="material-symbols-outlined" style={{ fontVariationSettings: filled ? "'FILL' 1" : undefined }}>
      {children}
    </span>
  );
}

function Button({ children, large = false, variant = 'primary' }) {
  const mappedVariant = variant === 'ghost' ? 'outline' : 'default';
  return <UiButton size={large ? 'lg' : 'default'} variant={mappedVariant}>{children}</UiButton>;
}

function App() {
  const [page, setPage] = useState(location.hash.replace('#', '') || 'home');

  useEffect(() => {
    const onHash = () => setPage(location.hash.replace('#', '') || 'home');
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="app">
      <TopNav page={page} />
      <main className={page === 'home' ? '' : 'app-shell'}>
        {page === 'home' ? (
          <Home />
        ) : (
          <div className="app-content">
            {page === 'subjects' && <Subjects />}
            {page === 'practice' && <Practice />}
            {page === 'quiz' && <Quiz />}
            {page === 'leaderboard' && <Leaderboard />}
            {page === 'profile' && <Profile />}
            {page === 'achievements' && <Achievements />}
          </div>
        )}
      </main>
      <MobileNav page={page} />
      {page === 'home' && <Footer />}
    </div>
  );
}

function TopNav({ page }) {
  return (
    <nav className="top-nav">
      <a className="brand" href="#home" aria-label="CodePath home">
        <Icon>code</Icon>
        <span>CodePath</span>
      </a>
      <div className="desktop-tabs">
        {routes.slice(1).map((route) => (
          <a key={route.id} className={page === route.id ? 'active' : ''} href={`#${route.id}`}>
            <Icon>{route.icon}</Icon>
            {route.label}
          </a>
        ))}
      </div>
      <div className="hud">
        <span><Icon filled>local_fire_department</Icon> 24</span>
        <span><Icon filled>favorite</Icon> 5</span>
        <span><Icon filled>bolt</Icon> 500</span>
      </div>
    </nav>
  );
}

function MobileNav({ page }) {
  return (
    <nav className="mobile-nav">
      {routes.slice(0, 5).map((route) => (
        <a key={route.id} className={page === route.id ? 'active' : ''} href={`#${route.id}`}>
          <Icon>{route.icon}</Icon>
          <span>{route.label}</span>
        </a>
      ))}
    </nav>
  );
}

function Home() {
  return (
    <>
      <section className="hero section">
        <h1>เส้นทางสู่ปรมาจารย์ด้าน<span>อัลกอริทึม</span></h1>
        <p>เรียนรู้วิทยาการคอมพิวเตอร์ผ่านการเล่นเกมและการผจญภัยที่ท้าทาย สนุกไปกับการเขียนโค้ดและพัฒนาทักษะของคุณ</p>
        <a href="#subjects"><Button large>เริ่มการเดินทางของคุณ <Icon>arrow_forward</Icon></Button></a>
        <HeroVisual />
      </section>
      <section className="section">
        <h2>ทำไมต้อง CodePath?</h2>
        <div className="feature-grid">
          {features.map(([icon, tone, title, body]) => <FeatureCard key={title} icon={icon} tone={tone} title={title} body={body} />)}
        </div>
      </section>
      <section className="section">
        <div className="cta-panel">
          <h2>พร้อมที่จะเริ่มหรือยัง?</h2>
          <p>เข้าร่วมกับผู้เรียนนับพันและเริ่มต้นการเดินทางสู่วิทยาการคอมพิวเตอร์วันนี้</p>
          <a href="#practice"><Button large>สร้างบัญชีฟรี</Button></a>
        </div>
      </section>
    </>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual">
      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxCQFUZmT9Q3G3XRBEvXzW02q06yn4Jo4RzgcaGsoAp3UbgJT9nrxA4wjzyy0jyTzsLNzwvmE-dwyvDAqtRg7_JcyhlPkBsyX4cIiX5gKbaTwGexpQ2a-Jfz_bpD3PeEcLkBU5UrZO6I9d_Rpi3oMg_xPtldMqd3yrc-wtPoEzLaXqyXSbJSlE79sOupVsXzZoaM5XycyQ9g8o5sJ6RPOerRiiGMii732OhVtEIT0fhE302gl1rFN4-VK_Cb2fhuDOgsVm5a_ud8wA" alt="" />
      <div className="code-card">
        <span>function solve(nums) {'{'}</span>
        <span>  let best = 0;</span>
        <span>  return best + xp;</span>
        <span>{'}'}</span>
      </div>
    </div>
  );
}

function FeatureCard({ icon, tone, title, body }) {
  return (
    <Card className="feature-card">
      <div className={`feature-icon ${tone}`}><Icon filled>{icon}</Icon></div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{body}</CardDescription>
    </Card>
  );
}

function Subjects() {
  return (
    <Page title="เส้นทางสู่นักพัฒนาระดับมาสเตอร์" kicker="แผนผังทักษะ">
      <p className="lead">เลือกหัวข้อที่คุณต้องการฝึกฝน เริ่มจากพื้นฐานที่มั่นคง แล้วค่อยๆ ไต่ระดับไปสู่ความท้าทายที่ซับซ้อนยิ่งขึ้น ทุกก้าวคือการเรียนรู้!</p>
      <div className="skill-grid">
        {skills.map(([icon, level, levelText, name, thai, progress, count]) => (
          <Card className={`skill-card ${level === 'locked' ? 'locked' : ''}`} key={name}>
            <div className="skill-head">
              <span className="skill-node"><Icon>{level === 'locked' ? 'lock' : icon}</Icon></span>
              <Badge variant={level}>{levelText}</Badge>
            </div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{thai}</CardDescription>
            <Progress value={progress} />
            <small>สำเร็จ {progress}% · {count}</small>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function Practice() {
  const initialCode = `class Solution:
    def maxSubArray(self, nums):
        # เขียนอัลกอริทึม Kadane ของคุณที่นี่
        best = float('-inf')
        current = 0
        for n in nums:
            current = max(n, current + n)
            best = max(best, current)
        return best`;
  const [code, setCode] = useState(initialCode);
  const [hasRun, setHasRun] = useState(false);
  const testCases = [
    ['กรณีที่ 1', 'nums = [-2,1,-3,4,-1,2,1,-5,4]', 'คาดหวัง 6', 'ผ่าน'],
    ['กรณีที่ 2', 'nums = [1]', 'คาดหวัง 1', 'ผ่าน'],
    ['กรณีที่ 3', 'nums = [5,4,-1,7,8]', 'คาดหวัง 23', 'ผ่าน'],
  ];

  return (
    <Page title="อัลกอริทึมของ Kadane" kicker="หน่วยที่ 4 • จัดการอาร์เรย์">
      <div className="practice-layout">
        <Card className="problem-panel">
          <div className="problem-meta"><Badge variant="easy">ง่าย</Badge><Badge>อาร์เรย์</Badge></div>
          <p>ช่วยผู้กล้าหาเส้นทางที่มีพลังเวทมนตร์สะสมมากที่สุดในอาณาจักรตัวเลข</p>
          <p>ให้อาร์เรย์ <code>nums</code> ค้นหาอาร์เรย์ย่อยต่อเนื่องที่มีผลรวมมากที่สุด แล้วคืนค่าผลรวมนั้น</p>
          <h3>ตัวอย่างที่ 1:</h3>
          <pre>อินพุต: nums = [-2,1,-3,4,-1,2,1,-5,4]{'\n'}เอาต์พุต: 6</pre>
          <p>คำอธิบาย: เส้นทาง [4,-1,2,1] มีผลรวมพลังเวทมนตร์สะสมมากที่สุด = 6.</p>
          <h3>ข้อจำกัด:</h3>
          <ul><li>1 &lt;= nums.length &lt;= 10^5</li><li>-10^4 &lt;= nums[i] &lt;= 10^4</li></ul>
          <div className="subject-tests">
            <h3>กรณีทดสอบ</h3>
            <div className="test-case-list">
              {testCases.map(([name, input, expected]) => (
                <div className="test-case-item" key={name}>
                  <strong>{name}</strong>
                  <code>{input}</code>
                  <span>{expected}</span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost"><Icon>lightbulb</Icon> ต้องการคำใบ้ไหม? (-1 <Icon filled>favorite</Icon>)</Button>
        </Card>
        <div className="challenge-workspace">
          <Card className="editor-panel">
            <div className="editor-bar"><span><Icon>code</Icon> solution.py</span><span><Icon>settings</Icon><Icon>refresh</Icon></span></div>
            <div className="editor">
              <CodeMirror
                value={code}
                height="420px"
                extensions={[python()]}
                theme={oneDark}
                basicSetup={{ autocompletion: true, bracketMatching: true, lineNumbers: true }}
                onChange={setCode}
              />
            </div>
            <UiButton size="lg" onClick={() => setHasRun(true)}><Icon>play_arrow</Icon> รันโค้ด</UiButton>
          </Card>
          <Card className="output-panel">
            {hasRun ? (
              <>
              <div className="mock-output-head">
                <strong>ผลลัพธ์</strong>
                <Badge variant="easy">ผ่าน 3/3</Badge>
              </div>
              {testCases.map(([name, input, expected, status]) => (
                <div className="mock-output-row" key={name}>
                  <span><Icon filled>task_alt</Icon> {name}</span>
                  <code>{input}</code>
                  <span>{expected}</span>
                  <strong>{status}</strong>
                </div>
              ))}
              </>
            ) : (
              <div className="output-empty">
                <Icon>terminal</Icon>
                <strong>ยังไม่มีผลลัพธ์</strong>
                <span>กดรันโค้ดเพื่อดูผลการทดสอบ</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}

function Quiz() {
  return (
    <Page title="แบบทดสอบเช็กอินประจำวัน" kicker="รางวัลล็อกอิน">
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
          <Button>รับรางวัล</Button>
        </Card>
      </div>
    </Page>
  );
}

function Leaderboard() {
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <Page title="ตารางคะแนน" kicker="อันดับโลก">
      <div className="leaderboard-hero">
        <div className="podium">
          {[podium[1], podium[0], podium[2]].map(([rank, name, xp, score, icon]) => (
            <Card className={`podium-card place-${rank} ${name === 'อเล็กซ์ โค้ดเดอร์' ? 'you' : ''}`} key={name}>
              <span className={`crown medal medal-${rank}`}>
                <Icon filled>{rankMedals[rank]}</Icon>
                <small>#{rank}</small>
              </span>
              <span className="podium-avatar"><Icon filled>{icon}</Icon></span>
              <strong>{name}</strong>
              <small>{xp}</small>
              <div className="gum-meter"><span style={{ width: `${Math.min(100, (score / 4250) * 100)}%` }} /></div>
            </Card>
          ))}
        </div>
        <Card className="you-progress">
          <div>
            <Badge variant="easy">คุณ</Badge>
            <CardTitle>อเล็กซ์ โค้ดเดอร์</CardTitle>
            <CardDescription>2,450 XP · ต้องการอีก 1,530 XP เพื่อแซงอันดับ 2</CardDescription>
          </div>
          <div className="you-ring">58%</div>
        </Card>
      </div>
      <div className="board gummy-board">
        {rest.map(([rank, name, xp, score, icon]) => (
          <Card className="rank-row gummy-row" key={name}>
            <span className="rank">#{rank}</span>
            <span className="avatar"><Icon filled>{icon}</Icon></span>
            <strong>{name}</strong>
            <div className="mini-meter"><span style={{ width: `${Math.max(10, (score / 4250) * 100)}%` }} /></div>
            <span>{xp}</span>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function Profile() {
  return (
    <Page title="อเล็กซ์ ดีเวลลอปเปอร์" kicker="เลเวล 42 · สถาปนิกอัลกอริทึม">
      <div className="profile-grid">
        {[
          ['military_tech', 'XP ทั้งหมด', '12,400'],
          ['local_fire_department', 'สตรีกปัจจุบัน', '24 วัน'],
          ['task_alt', 'โจทย์ที่แก้แล้ว', '156'],
        ].map(([icon, label, value]) => <Stat key={label} icon={icon} label={label} value={value} />)}
      </div>
      <Card className="league">
        <CardTitle>ลีกประจำสัปดาห์ (เงิน)</CardTitle>
        <CardDescription>ผู้ทำคะแนนสูงสุดในกลุ่มของคุณ</CardDescription>
        {['โค้ดมาสเตอร์ · 15,200 XP', 'อเล็กซ์ ดีเวลลอปเปอร์ (คุณ) · 12,400 XP', 'ลอจิกวิซาร์ด · 11,800 XP'].map((x) => <div className="mini-row" key={x}>{x}</div>)}
      </Card>
      <Achievements compact />
    </Page>
  );
}

function Achievements({ compact = false }) {
  return (
    <Page title={compact ? 'กล่องตรา' : 'ความสำเร็จและหมุดหมาย'} kicker="ความสำเร็จและตราที่ปลดล็อกแล้ว" compact={compact}>
      <div className="badge-grid">
        {badges.map(([icon, title, note, unlocked]) => (
          <Card className={`badge-card ${unlocked ? '' : 'locked'}`} key={title}>
            <Icon>{unlocked ? icon : 'lock'}</Icon>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{note}</CardDescription>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function Stat({ icon, label, value }) {
  return <Card className="stat"><Icon>{icon}</Icon><span>{label}</span><strong>{value}</strong></Card>;
}

function Page({ title, children, compact = false }) {
  return (
    <section className={compact ? 'subpage compact' : 'subpage'}>
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      {children}
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <a className="brand footer-brand" href="#home"><Icon>code</Icon><span>CodePath</span></a>
      <div className="footer-links"><a href="#privacy">นโยบายความเป็นส่วนตัว</a><a href="#terms">ข้อกำหนดการใช้งาน</a><a href="#contact">ติดต่อเรา</a></div>
      <a className="share" href="#share" aria-label="Share"><Icon>share</Icon></a>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
