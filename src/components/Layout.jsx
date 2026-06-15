import { routes } from '../data/content';
import { Icon } from './Icon';

export function TopNav({ page }) {
  return (
    <nav className="top-nav">
      <a className="brand" href="#home" aria-label="CODEAREA home">
        <Icon>code</Icon>
        <span>CODEAREA</span>
      </a>
      <div className="hud">
        <span className="stat-pill streak"><Icon filled>local_fire_department</Icon><strong>24</strong><em>สตรีก</em></span>
        <span className="stat-pill heart"><Icon filled>favorite</Icon><strong>5</strong><em>หัวใจ</em></span>
        <span className="stat-pill exp"><Icon filled>stars</Icon><strong>500</strong><em>XP</em></span>
        <a className="profile-pill" href="#profile" aria-label="เปิดโปรไฟล์">
          <img src="https://api.dicebear.com/9.x/personas/svg?seed=AlexDeveloper" alt="" />
          <strong>อเล็กซ์</strong>
        </a>
      </div>
    </nav>
  );
}

export function RightSidebar({ page }) {
  return (
    <nav className="right-sidebar" aria-label="เมนูหลัก">
      {routes.map((route) => (
        <a key={route.id} className={page === route.id ? 'active' : ''} href={`#${route.id}`}>
          <Icon>{route.icon}</Icon>
          <span>{route.label}</span>
        </a>
      ))}
    </nav>
  );
}

export function Page({ title, children, compact = false }) {
  return (
    <section className={compact ? 'subpage compact' : 'subpage'}>
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      {children}
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <a className="brand footer-brand" href="#home"><Icon>code</Icon><span>CODEAREA</span></a>
      <div className="footer-links">
        <a href="#privacy">นโยบายความเป็นส่วนตัว</a>
        <a href="#terms">ข้อกำหนดการใช้งาน</a>
        <a href="#contact">ติดต่อเรา</a>
      </div>
      <a className="share" href="#share" aria-label="Share"><Icon>share</Icon></a>
    </footer>
  );
}
