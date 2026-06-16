import { Page } from '../components/Layout';
import { Icon } from '../components/Icon';
import { skills } from '../data/content';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const difficultySections = [
  ['easy', 'ระดับง่าย', 'เริ่มสร้างพื้นฐานให้แน่น'],
  ['medium', 'ระดับปานกลาง', 'เริ่มจัดการข้อมูลและคิดเป็นระบบ'],
  ['locked', 'ระดับยาก', 'ปลดล็อกเมื่อผ่านหัวข้อก่อนหน้า'],
];

function SkillCard({ skill }) {
  const [icon, level, levelText, tag, title, excerpt, progress, count] = skill;

  return (
    <a className="skill-link" href="#practice">
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
  );
}

export function Subjects() {
  return (
    <Page title="เส้นทางสู่นักพัฒนาระดับมาสเตอร์">
      <p className="lead">เลือกหัวข้อที่คุณต้องการฝึกฝน เริ่มจากพื้นฐานที่มั่นคง แล้วค่อยๆ ไต่ระดับไปสู่ความท้าทายที่ซับซ้อนยิ่งขึ้น ทุกก้าวคือการเรียนรู้!</p>
      <div className="subject-sections">
        {difficultySections.map(([level, title, description]) => {
          const sectionSkills = skills.filter((skill) => skill[1] === level);

          return (
            <section className={`subject-section ${level}`} key={level}>
              <div className="difficulty-line">
                <header>
                  <h2>{title}</h2>
                  <p>{description} · {sectionSkills.length} หัวข้อ</p>
                </header>
                <span />
              </div>
              <div className="skill-grid">
                {sectionSkills.map((skill) => <SkillCard key={skill[4]} skill={skill} />)}
              </div>
            </section>
          );
        })}
      </div>
    </Page>
  );
}
