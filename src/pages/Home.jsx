import { features } from '../data/content';
import { AppButton } from '../components/AppButton';
import { Icon } from '../components/Icon';
import { Card, CardDescription, CardTitle } from '../components/ui/card';

function FeatureCard({ icon, tone, title, body }) {
  return (
    <Card className="feature-card">
      <div className={`feature-icon ${tone}`}><Icon filled>{icon}</Icon></div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{body}</CardDescription>
    </Card>
  );
}

function LandingCodeCard() {
  return (
    <div className="landing-code-card">
      <div className="code-card-head">
        <span><Icon>terminal</Icon> practice.py</span>
        <strong>ผ่าน 3/3</strong>
      </div>
      <code>def is_palindrome(text):</code>
      <code>    cleaned = text.replace(' ', '')</code>
      <code>    return cleaned == cleaned[::-1]</code>
      <div className="code-card-output">
        <span><Icon filled>check_circle</Icon> ได้รับ 120 XP</span>
        <span><Icon filled>favorite</Icon> +1 หัวใจ</span>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      <section className="hero hero-landing">
        <img className="hero-bg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxCQFUZmT9Q3G3XRBEvXzW02q06yn4Jo4RzgcaGsoAp3UbgJT9nrxA4wjzyy0jyTzsLNzwvmE-dwyvDAqtRg7_JcyhlPkBsyX4cIiX5gKbaTwGexpQ2a-Jfz_bpD3PeEcLkBU5UrZO6I9d_Rpi3oMg_xPtldMqd3yrc-wtPoEzLaXqyXSbJSlE79sOupVsXzZoaM5XycyQ9g8o5sJ6RPOerRiiGMii732OhVtEIT0fhE302gl1rFN4-VK_Cb2fhuDOgsVm5a_ud8wA" alt="" />
        <div className="hero-scrim" />
        <div className="hero-copy">
          <div className="hero-badge"><Icon filled>workspace_premium</Icon> เรียนโค้ดแบบเกม สะสม XP และถ้วยรางวัล</div>
          <h1>CODEAREA</h1>
          <h2>ฝึกอัลกอริทึมและพัฒนาการเขียนโค้ด</h2>
          <p>แก้โจทย์จริง ฝึกคิดเป็นระบบ เช็กอินรายวัน และไต่แรงก์ด้วยบทเรียนที่เล่าเป็นภารกิจให้เล่นต่อได้ทุกวัน</p>
          <div className="hero-actions">
            <a href="#subjects"><AppButton large>เริ่มภารกิจ <Icon>arrow_forward</Icon></AppButton></a>
            <a href="#leaderboard"><AppButton large variant="ghost">ดูอันดับ <Icon>leaderboard</Icon></AppButton></a>
          </div>
          <div className="hero-metrics" aria-label="ภาพรวมความคืบหน้า">
            <span><strong>24</strong> วันสตรีก</span>
            <span><strong>120+</strong> โจทย์ฝึก</span>
            <span><strong>5</strong> หัวใจพร้อมลุย</span>
          </div>
        </div>
        <LandingCodeCard />
      </section>
      <section className="section">
        <h2>ทำไมต้อง CODEAREA?</h2>
        <div className="feature-grid">
          {features.map(([icon, tone, title, body]) => <FeatureCard key={title} icon={icon} tone={tone} title={title} body={body} />)}
        </div>
      </section>
      <section className="section">
        <div className="cta-panel">
          <h2>พร้อมที่จะเริ่มหรือยัง?</h2>
          <p>เข้าร่วมกับผู้เรียนนับพันและเริ่มต้นการเดินทางสู่วิทยาการคอมพิวเตอร์วันนี้</p>
          <a href="#practice"><AppButton large>สร้างบัญชีฟรี</AppButton></a>
        </div>
      </section>
    </>
  );
}
