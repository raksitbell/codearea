import { Page } from '../components/Layout';
import { Icon } from '../components/Icon';
import { skills } from '../data/content';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export function Subjects() {
  return (
    <Page title="เส้นทางสู่นักพัฒนาระดับมาสเตอร์">
      <p className="lead">เลือกหัวข้อที่คุณต้องการฝึกฝน เริ่มจากพื้นฐานที่มั่นคง แล้วค่อยๆ ไต่ระดับไปสู่ความท้าทายที่ซับซ้อนยิ่งขึ้น ทุกก้าวคือการเรียนรู้!</p>
      <div className="skill-grid">
        {skills.map(([icon, level, levelText, tag, title, excerpt, progress, count]) => (
          <a className="skill-link" href="#practice" key={title}>
            <Card className={`skill-card ${level === 'locked' ? 'locked' : ''}`}>
              <div className="skill-head">
                <span className="skill-node"><Icon>{level === 'locked' ? 'lock' : icon}</Icon></span>
                <Badge variant={level}>{levelText}</Badge>
              </div>
              <span className="skill-tag">{tag}</span>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{excerpt}</CardDescription>
              <Progress value={progress} />
              <small>สำเร็จ {progress}% · {count}</small>
            </Card>
          </a>
        ))}
      </div>
    </Page>
  );
}
