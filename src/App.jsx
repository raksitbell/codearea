import { useEffect, useState } from 'react';
import { Footer, RightSidebar, TopNav } from './components/Layout';
import { Achievements } from './pages/Achievements';
import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { Practice } from './pages/Practice';
import { Profile } from './pages/Profile';
import { Quiz } from './pages/Quiz';
import { Subjects } from './pages/Subjects';

const pages = {
  achievements: <Achievements />,
  home: <Home />,
  leaderboard: <Leaderboard />,
  practice: <Practice />,
  profile: <Profile />,
  quiz: <Quiz />,
  subjects: <Subjects />,
};

export function App() {
  const [page, setPage] = useState(location.hash.replace('#', '') || 'home');

  useEffect(() => {
    const onHash = () => setPage(location.hash.replace('#', '') || 'home');
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  const activePage = pages[page] || pages.home;

  return (
    <div className="app">
      <TopNav page={page} />
      <main className={page === 'home' ? '' : 'app-shell'}>
        {page === 'home' ? activePage : <div className="app-content">{activePage}</div>}
      </main>
      <RightSidebar page={page} />
      {page === 'home' && <Footer />}
    </div>
  );
}
