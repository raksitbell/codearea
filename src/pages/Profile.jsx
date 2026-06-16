import { Achievements } from './Achievements';
import { Icon } from '../components/Icon';
import { Page } from '../components/Layout';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../components/ui/card';

function Stat({ icon, label, value, tone = '' }) {
  return <Card className={`stat ${tone}`}><Icon filled>{icon}</Icon><span>{label}</span><strong>{value}</strong></Card>;
}

export function Profile() {
  return (
    <Page title="อเล็กซ์ ดีเวลลอปเปอร์">
      <Card className="profile-hero">
        <img
          src="https://api.dicebear.com/9.x/personas/svg?seed=AlexDeveloper"
          alt="รูปโปรไฟล์อเล็กซ์"
        />
        <div>
          <CardTitle>อเล็กซ์ ดีเวลลอปเปอร์</CardTitle>
          <CardDescription>เลเวล 42 · สถาปนิกอัลกอริทึม · พร้อมพิชิตโจทย์วันนี้</CardDescription>
        </div>
        <Badge variant="easy">ออนไลน์</Badge>
      </Card>
      <div className="profile-grid">
        {[
          ['stars', 'XP ทั้งหมด', '12,400', 'xp-stat'],
          ['local_fire_department', 'สตรีกปัจจุบัน', '24 วัน', 'streak-stat'],
          ['favorite', 'หัวใจคงเหลือ', '4 / 5', 'heart-stat'],
          ['task_alt', 'โจทย์ที่แก้แล้ว', '156', 'solved-stat'],
        ].map(([icon, label, value, tone]) => <Stat key={label} icon={icon} label={label} value={value} tone={tone} />)}
      </div>
      <Achievements compact />
    </Page>
  );
}
