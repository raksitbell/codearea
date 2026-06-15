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
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'subjects', label: 'Skill Tree', icon: 'account_tree' },
  { id: 'practice', label: 'Challenges', icon: 'code' },
  { id: 'quiz', label: 'Daily', icon: 'event_repeat' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'achievements', label: 'Achievements', icon: 'workspace_premium' },
];

const features = [
  ['sports_esports', 'green', 'เรียนรู้เหมือนเล่นเกม', 'เปลี่ยนความซับซ้อนของวิทยาการคอมพิวเตอร์ให้กลายเป็นความท้าทายที่สนุกสนาน'],
  ['bolt', 'orange', 'ฟีดแบ็กทันที', 'รู้ผลลัพธ์การรันโค้ดทันที พร้อมคำแนะนำที่ช่วยให้คุณแก้ไขข้อผิดพลาดได้เร็วขึ้น'],
  ['groups', 'blue', 'ชุมชนนักพัฒนา', 'เชื่อมต่อกับเพื่อนผู้เรียน แข่งขัน และเติบโตไปด้วยกันบนกระดานผู้นำ'],
];

const skills = [
  ['text_fields', 'Easy', 'Basic Syntax', 'ไวยากรณ์พื้นฐาน', 100, '15/15'],
  ['data_object', 'Easy', 'Variables', 'ตัวแปร', 80, '12/15'],
  ['all_inclusive', 'Easy', 'Loops', 'ลูป', 40, '6/15'],
  ['view_column', 'Medium', 'Arrays', 'อาร์เรย์', 10, '2/20'],
  ['abc', 'Locked', 'Strings', 'สตริง', 0, '0/15'],
  ['repeat', 'Locked', 'Recursion', 'การเรียกซ้ำ', 0, '0/12'],
  ['memory', 'Locked', 'Dynamic Programming', 'กำหนดการพลวัต', 0, '0/25'],
  ['hub', 'Locked', 'Graphs', 'กราฟ', 0, '0/20'],
  ['account_tree', 'Locked', 'Trees', 'ต้นไม้', 0, '0/18'],
];

const leaderboard = [
  ['1', 'Sarah Script', '4,250 XP'],
  ['2', 'David Debugger', '3,980 XP'],
  ['3', 'Alex Coder', '2,450 XP'],
  ['4', 'Null Pointer', '850 XP'],
  ['5', 'Infinite Loop', '420 XP'],
  ['6', 'Stack Overflow', '100 XP'],
];

const badges = [
  ['data_object', 'Binary Master', '10 Trees Solved', true],
  ['all_inclusive', 'Recursion Rookie', 'Completed Module', true],
  ['local_fire_department', 'Iron Will', '30 Day Streak', true],
  ['hub', 'Graph Guru', 'Locked', false],
  ['bug_report', 'Bug Squasher', 'Locked', false],
];

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
    <Page title="เส้นทางสู่นักพัฒนาระดับมาสเตอร์" kicker="Skill Tree">
      <p className="lead">เลือกหัวข้อที่คุณต้องการฝึกฝน เริ่มจากพื้นฐานที่มั่นคง แล้วค่อยๆ ไต่ระดับไปสู่ความท้าทายที่ซับซ้อนยิ่งขึ้น ทุกก้าวคือการเรียนรู้!</p>
      <div className="skill-grid">
        {skills.map(([icon, level, name, thai, progress, count]) => (
          <Card className={`skill-card ${level === 'Locked' ? 'locked' : ''}`} key={name}>
            <div className="skill-head">
              <span className="skill-node"><Icon>{level === 'Locked' ? 'lock' : icon}</Icon></span>
              <Badge variant={level.toLowerCase()}>{level}</Badge>
            </div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{thai}</CardDescription>
            <Progress value={progress} />
            <small>{progress}% Completed · {count}</small>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function Practice() {
  const initialCode = `class Solution:
    def maxSubArray(self, nums):
        # Write your Kadane's algorithm implementation here
        best = float('-inf')
        current = 0
        for n in nums:
            current = max(n, current + n)
            best = max(best, current)
        return best`;
  const [code, setCode] = useState(initialCode);
  const [hasRun, setHasRun] = useState(false);
  const testCases = [
    ['กรณีที่ 1', 'nums = [-2,1,-3,4,-1,2,1,-5,4]', 'Expected 6', 'Passed'],
    ['กรณีที่ 2', 'nums = [1]', 'Expected 1', 'Passed'],
    ['กรณีที่ 3', 'nums = [5,4,-1,7,8]', 'Expected 23', 'Passed'],
  ];

  return (
    <Page title="อัลกอริทึมของ Kadane" kicker="หน่วยที่ 4 • ARRAY MANIPULATION">
      <div className="practice-layout">
        <Card className="problem-panel">
          <div className="problem-meta"><Badge variant="easy">ง่าย</Badge><Badge>ARRAYS</Badge></div>
          <p>ช่วยผู้กล้าหาเส้นทางที่มีพลังเวทมนตร์สะสมมากที่สุดในอาณาจักรตัวเลข</p>
          <p>ให้ array <code>nums</code> ค้นหา contiguous <code>subarray</code> ที่มีผลรวมมากที่สุด แล้ว return ผลรวมนั้น</p>
          <h3>ตัวอย่างที่ 1:</h3>
          <pre>Input: nums = [-2,1,-3,4,-1,2,1,-5,4]{'\n'}Output: 6</pre>
          <p>คำอธิบาย: เส้นทาง [4,-1,2,1] มีผลรวมพลังเวทมนตร์สะสมมากที่สุด = 6.</p>
          <h3>ข้อจำกัด:</h3>
          <ul><li>1 &lt;= nums.length &lt;= 10^5</li><li>-10^4 &lt;= nums[i] &lt;= 10^4</li></ul>
          <Button variant="ghost"><Icon>lightbulb</Icon> ต้องการคำใบ้ไหม? (-1 <Icon filled>favorite</Icon>)</Button>
        </Card>
        <Card className="editor-panel">
          <div className="editor-bar"><span><Icon>code</Icon> solution.py</span><span><Icon>settings</Icon><Icon>refresh</Icon></span></div>
          <div className="editor">
            <CodeMirror
              value={code}
              height="360px"
              extensions={[python()]}
              theme={oneDark}
              basicSetup={{ autocompletion: true, bracketMatching: true, lineNumbers: true }}
              onChange={setCode}
            />
          </div>
          <div className="test-grid">
            {testCases.map(([name]) => <span key={name}>{name}</span>)}
          </div>
          <UiButton size="lg" onClick={() => setHasRun(true)}><Icon>play_arrow</Icon> Run Code</UiButton>
          {hasRun && (
            <div className="mock-output">
              <div className="mock-output-head">
                <strong>ผลลัพธ์</strong>
                <Badge variant="easy">3/3 Passed</Badge>
              </div>
              {testCases.map(([name, input, expected, status]) => (
                <div className="mock-output-row" key={name}>
                  <span><Icon filled>task_alt</Icon> {name}</span>
                  <code>{input}</code>
                  <span>{expected}</span>
                  <strong>{status}</strong>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}

function Quiz() {
  return (
    <Page title="Daily Quiz Challenge" kicker="Free Heart Reward">
      <div className="quiz-layout">
        <Card className="quiz-card">
          <div className="reward"><Icon filled>favorite</Icon><strong>+1 Heart</strong></div>
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
          <CardDescription>รับหัวใจฟรีและ XP เพิ่มสำหรับ streak วันนี้</CardDescription>
          <Button>รับรางวัล</Button>
        </Card>
      </div>
    </Page>
  );
}

function Leaderboard() {
  return (
    <Page title="ตารางคะแนน" kicker="อันดับโลก">
      <div className="board">
        {leaderboard.map(([rank, name, xp]) => (
          <Card className={`rank-row ${name === 'Alex Coder' ? 'you' : ''}`} key={name}>
            <span className="rank">{rank}</span>
            <span className="avatar"><Icon>person</Icon></span>
            <strong>{name}</strong>
            {name === 'Alex Coder' && <em>คุณ · ต้องการอีก 1,530 XP เพื่อเลื่อนอันดับ</em>}
            <span>{xp}</span>
          </Card>
        ))}
      </div>
    </Page>
  );
}

function Profile() {
  return (
    <Page title="Alex Developer" kicker="Lvl 42 · Algorithm Architect">
      <div className="profile-grid">
        {[
          ['military_tech', 'Total XP', '12,400'],
          ['local_fire_department', 'Current Streak', '24 days'],
          ['task_alt', 'Problems Solved', '156'],
        ].map(([icon, label, value]) => <Stat key={label} icon={icon} label={label} value={value} />)}
      </div>
      <Card className="league">
        <CardTitle>Weekly League (Silver)</CardTitle>
        <CardDescription>Top performers in your division</CardDescription>
        {['CodeMaster · 15,200 XP', 'Alex Developer (You) · 12,400 XP', 'LogicWizard · 11,800 XP'].map((x) => <div className="mini-row" key={x}>{x}</div>)}
      </Card>
      <Achievements compact />
    </Page>
  );
}

function Achievements({ compact = false }) {
  return (
    <Page title={compact ? 'Badge Case' : 'Achievements & Milestones'} kicker="Unlocked achievements and milestones" compact={compact}>
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

function Page({ title, kicker, children, compact = false }) {
  return (
    <section className={compact ? 'subpage compact' : 'subpage'}>
      <header className="page-header">
        <span className="kicker">{kicker}</span>
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
      <div className="footer-links"><a href="#privacy">Privacy Policy</a><a href="#terms">Terms of Service</a><a href="#contact">Contact</a></div>
      <a className="share" href="#share" aria-label="Share"><Icon>share</Icon></a>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
