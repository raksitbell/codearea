import { Icon } from '../components/Icon';
import { Page } from '../components/Layout';
import { badges } from '../data/content';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export function Achievements({ compact = false }) {
  return (
    <Page title={'รางวัลความสำเร็จ'} compact={compact}>
      <div className={compact ? 'badge-grid' : 'achievement-list'}>
        {badges.map(([icon, title, note, detail, date, progress, unlocked]) => (
          <Card className={`badge-card ${compact ? '' : 'achievement-detail'} ${unlocked ? '' : 'locked'}`} key={title}>
            <span className="trophy-icon"><Icon>{unlocked ? icon : 'lock'}</Icon></span>
            {compact ? (
              <>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{note}</CardDescription>
              </>
            ) : (
              <div className="achievement-copy">
                <div className="achievement-title-row">
                  <CardTitle>{title}</CardTitle>
                  <Badge variant={unlocked ? 'easy' : 'locked'}>{unlocked ? 'ปลดล็อกแล้ว' : 'ยังล็อกอยู่'}</Badge>
                </div>
                <CardDescription>{note}</CardDescription>
                <p>{detail}</p>
                <div className="achievement-meta">
                  <span><Icon>calendar_month</Icon>{date}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}
