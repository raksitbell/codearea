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

export function Home() {
  return (
    <>
      <section className="hero section">
        <h1>เส้นทางสู่ปรมาจารย์ด้าน<span>อัลกอริทึม</span></h1>
        <p>เรียนรู้วิทยาการคอมพิวเตอร์ผ่านการเล่นเกมและการผจญภัยที่ท้าทาย สนุกไปกับการเขียนโค้ดและพัฒนาทักษะของคุณ</p>
        <a href="#subjects"><AppButton large>เริ่มการเดินทางของคุณ <Icon>arrow_forward</Icon></AppButton></a>
        <HeroVisual />
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
