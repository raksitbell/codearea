import { useEffect, useState } from 'react';
import { Footer, RightSidebar, TopNav } from './components/Layout';
import { Achievements } from './pages/Achievements';
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { Practice } from './pages/Practice';
import { Profile } from './pages/Profile';
import { Quiz } from './pages/Quiz';
import { Subjects } from './pages/Subjects';

const MAX_HEARTS = 5;
const INITIAL_HEARTS = 3;
const HEART_REGEN_MS = 30 * 1000;

function formatCountdown(ms) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function App() {
  const [page, setPage] = useState(location.hash.replace('#', '') || 'home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [heartCount, setHeartCount] = useState(INITIAL_HEARTS);
  const [nextHeartAt, setNextHeartAt] = useState(() => Date.now() + HEART_REGEN_MS);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const onHash = () => setPage(location.hash.replace('#', '') || 'home');
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!nextHeartAt || heartCount >= MAX_HEARTS || now < nextHeartAt) return;

    setHeartCount((current) => {
      const next = Math.min(MAX_HEARTS, current + 1);
      setNextHeartAt(next >= MAX_HEARTS ? null : Date.now() + HEART_REGEN_MS);
      return next;
    });
  }, [heartCount, nextHeartAt, now]);

  const useHeart = () => {
    setHeartCount((current) => {
      if (current <= 0) return current;
      setNextHeartAt((target) => target ?? Date.now() + HEART_REGEN_MS);
      return current - 1;
    });
  };

  const addHeart = () => {
    setHeartCount((current) => {
      const next = Math.min(MAX_HEARTS, current + 1);
      if (next >= MAX_HEARTS) setNextHeartAt(null);
      return next;
    });
  };

  const nextHeartLabel = heartCount >= MAX_HEARTS || !nextHeartAt
    ? 'หัวใจเต็มแล้ว'
    : `หัวใจจะเพิ่มในอีก ${formatCountdown(nextHeartAt - now)}`;

  const pages = {
    achievements: <Achievements />,
    home: <Home />,
    leaderboard: <Leaderboard />,
    practice: <Practice heartCount={heartCount} maxHearts={MAX_HEARTS} onUseHint={useHeart} />,
    profile: <Profile heartCount={heartCount} maxHearts={MAX_HEARTS} nextHeartLabel={nextHeartLabel} />,
    quiz: <Quiz onCorrectAnswer={addHeart} />,
    subjects: <Subjects />,
  };

  const activePage = pages[page] || pages.home;

  return (
    <div className={sidebarCollapsed ? 'app sidebar-collapsed' : 'app'}>
      <TopNav
        collapsed={sidebarCollapsed}
        heartCount={heartCount}
        maxHearts={MAX_HEARTS}
        nextHeartLabel={nextHeartLabel}
        onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        page={page}
      />
      <main className={page === 'home' ? '' : 'app-shell'}>
        {page === 'home' ? activePage : <div className="app-content">{activePage}</div>}
      </main>
      <RightSidebar collapsed={sidebarCollapsed} page={page} />
      {page === 'home' && <Footer />}
    </div>
  );
}
