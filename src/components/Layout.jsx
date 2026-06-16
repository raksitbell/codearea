import { useState } from 'react';
import { routes } from '../data/content';
import { Icon } from './Icon';

export function TopNav({ collapsed, heartCount, maxHearts, nextHeartLabel, onToggleSidebar, page }) {
  const [showHearts, setShowHearts] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [showXp, setShowXp] = useState(false);

  return (
    <nav className="top-nav">
      <div className="nav-start">
        <button
          className="sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'เปิดเมนูหลัก' : 'ซ่อนเมนูหลัก'}
          aria-pressed={collapsed}
        >
          <Icon>{collapsed ? 'menu' : 'menu_open'}</Icon>
        </button>
        <a className="brand" href="#home" aria-label="CODEAREA home">
          <Icon>code</Icon>
          <span>CODEAREA</span>
        </a>
      </div>
      <div className="hud">
        <div className="streak-status">
          <button
            className="stat-pill streak"
            type="button"
            onClick={() => {
              setShowStreak((current) => !current);
              setShowHearts(false);
              setShowXp(false);
            }}
            aria-expanded={showStreak}
            aria-label="ดูสตรีกปัจจุบัน"
          >
            <Icon filled>local_fire_department</Icon><strong>24</strong><em>สตรีก</em>
          </button>
          {showStreak && (
            <div className="streak-popover" role="status">
              <div>
                <strong>สตรีกปัจจุบัน</strong>
                <span>24 วันต่อเนื่อง · เช็กอินวันนี้แล้ว</span>
              </div>
              <div className="streak-week" aria-hidden="true">
                {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day) => (
                  <span key={day}><Icon filled>local_fire_department</Icon>{day}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="heart-status">
          <button
            className="stat-pill heart"
            type="button"
            onClick={() => {
              setShowHearts((current) => !current);
              setShowStreak(false);
              setShowXp(false);
            }}
            aria-expanded={showHearts}
            aria-label="ดูหัวใจคงเหลือ"
          >
            <Icon filled>favorite</Icon><strong>{heartCount}</strong><em>หัวใจ</em>
          </button>
          {showHearts && (
            <div className="heart-popover" role="status">
              <div>
                <strong>หัวใจคงเหลือ</strong>
                <span>{heartCount} / {maxHearts} · {nextHeartLabel}</span>
              </div>
              <div className="heart-meter" aria-hidden="true">
                {Array.from({ length: maxHearts }).map((_, index) => (
                  <span className={index < heartCount ? 'filled' : 'empty'} key={index}>
                    <Icon filled>{index < heartCount ? 'favorite' : 'heart_broken'}</Icon>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="xp-status">
          <button
            className="stat-pill exp"
            type="button"
            onClick={() => {
              setShowXp((current) => !current);
              setShowHearts(false);
              setShowStreak(false);
            }}
            aria-expanded={showXp}
            aria-label="ดูความคืบหน้า XP"
          >
            <Icon filled>stars</Icon><strong>500</strong><em>XP</em>
          </button>
          {showXp && (
            <div className="xp-popover" role="status">
              <div className="xp-popover-head">
                <div>
                  <strong>เลเวล 42</strong>
                  <span>2,450 / 3,000 XP</span>
                </div>
                <b>82%</b>
              </div>
              <div className="xp-upgrade-bar" aria-hidden="true"><span style={{ width: '82%' }} /></div>
              <small>อีก 550 XP เพื่อเลเวล 43</small>
            </div>
          )}
        </div>
        <a className="profile-pill" href="#profile" aria-label="เปิดโปรไฟล์">
          <img src="https://api.dicebear.com/9.x/personas/svg?seed=AlexDeveloper" alt="" />
          <strong>อเล็กซ์</strong>
        </a>
      </div>
    </nav>
  );
}

export function RightSidebar({ collapsed, page }) {
  return (
    <nav className={collapsed ? 'right-sidebar collapsed' : 'right-sidebar'} aria-label="เมนูหลัก">
      {routes.map((route) => (
        <a key={route.id} className={page === route.id ? 'active' : ''} href={`#${route.id}`} title={route.label}>
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
