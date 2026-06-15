import { Achievements } from './Achievements';
import { Icon } from '../components/Icon';
import { Page } from '../components/Layout';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardTitle } from '../components/ui/card';

function Stat({ icon, label, value }) {
  return <Card className="stat"><Icon>{icon}</Icon><span>{label}</span><strong>{value}</strong></Card>;
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
          ['military_tech', 'XP ทั้งหมด', '12,400'],
          ['local_fire_department', 'สตรีกปัจจุบัน', '24 วัน'],
          ['task_alt', 'โจทย์ที่แก้แล้ว', '156'],
        ].map(([icon, label, value]) => <Stat key={label} icon={icon} label={label} value={value} />)}
      </div>
      <Achievements compact />
    </Page>
  );
}
