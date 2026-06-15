import { Icon } from '../components/Icon';
import { Page } from '../components/Layout';
import { leaderboard, rankMedals } from '../data/content';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../components/ui/card';

export function Leaderboard() {
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const avatarUrl = (name) => `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(name)}`;

  return (
    <Page title="ตารางคะแนน">
      <div className="leaderboard-hero">
        <div className="podium">
          {[podium[1], podium[0], podium[2]].map(([rank, name, xp, score]) => (
            <Card className={`podium-card place-${rank} ${name === 'อเล็กซ์ โค้ดเดอร์' ? 'you' : ''}`} key={name}>
              <span className={`crown medal medal-${rank}`}>
                <Icon filled>{rankMedals[rank]}</Icon>
                <small>#{rank}</small>
              </span>
              <img className="podium-avatar" src={avatarUrl(name)} alt={`อวตารของ ${name}`} />
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
        {rest.map(([rank, name, xp, score]) => (
          <Card className="rank-row gummy-row" key={name}>
            <span className="rank">#{rank}</span>
            <img className="avatar" src={avatarUrl(name)} alt={`อวตารของ ${name}`} />
            <strong>{name}</strong>
            <div className="mini-meter"><span style={{ width: `${Math.max(10, (score / 4250) * 100)}%` }} /></div>
            <span>{xp}</span>
          </Card>
        ))}
      </div>
    </Page>
  );
}
