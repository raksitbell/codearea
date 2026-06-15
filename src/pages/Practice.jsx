import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { AppButton } from '../components/AppButton';
import { Icon } from '../components/Icon';
import { Page } from '../components/Layout';
import { practiceStarterCode, practiceTestCases } from '../data/content';
import { Badge } from '../components/ui/badge';
import { Button as UiButton } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function Practice() {
  const [code, setCode] = useState(practiceStarterCode);
  const [hasRun, setHasRun] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  return (
    <Page title="ตรวจข้อความพาลินโดรม">
      <div className="practice-layout">
        <Card className="problem-panel">
          <div className="problem-meta"><Badge variant="easy">ง่าย</Badge><Badge>สตริง</Badge></div>
          <p>ช่วยนักรบถอดรหัสอ่านข้อความโบราณ และตรวจว่าข้อความนั้นเป็นพาลินโดรมหรือไม่</p>
          <p>ให้สตริง <code>s</code> ลบสัญลักษณ์ที่ไม่ใช่ตัวอักษรหรือตัวเลข แล้วตรวจว่าข้อความอ่านจากหน้าไปหลังและหลังไปหน้าเหมือนกันหรือไม่</p>
          <h3>ตัวอย่างที่ 1:</h3>
          <pre>อินพุต: s = "A man, a plan, a canal: Panama"{'\n'}เอาต์พุต: True</pre>
          <p>คำอธิบาย: หลังลบสัญลักษณ์และปรับตัวพิมพ์ จะได้ข้อความที่อ่านกลับด้านแล้วยังเหมือนเดิม</p>
          <h3>ข้อจำกัด:</h3>
          <ul><li>1 &lt;= s.length &lt;= 2 * 10^5</li><li>s อาจมีตัวอักษร ตัวเลข ช่องว่าง และสัญลักษณ์พิเศษ</li></ul>
          <div className="subject-tests">
            <h3>กรณีทดสอบ</h3>
            <div className="test-case-list">
              {practiceTestCases.map(([name, input, expected]) => (
                <div className="test-case-item" key={name}>
                  <strong>{name}</strong>
                  <code>{input}</code>
                  <span>{expected}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <div className="challenge-workspace">
          <Card className="editor-panel">
            <div className="editor-bar"><span><Icon>code</Icon> solution.py</span><span><Icon>settings</Icon><Icon>refresh</Icon></span></div>
            <div className="editor">
              <CodeMirror
                value={code}
                height="420px"
                extensions={[python()]}
                theme={oneDark}
                basicSetup={{ autocompletion: true, bracketMatching: true, lineNumbers: true }}
                onChange={setCode}
              />
            </div>
            <div className="editor-actions">
              <UiButton size="lg" onClick={() => { setHasRun(true); setHasSubmitted(false); }}><Icon>play_arrow</Icon> รันโค้ด</UiButton>
              <AppButton large variant="danger"><Icon>lightbulb</Icon> คำใบ้ (-1 <Icon filled>favorite</Icon>)</AppButton>
            </div>
          </Card>
          <Card className="output-panel">
            {hasRun ? (
              <>
                <div className="mock-output-head">
                  <strong>ผลลัพธ์</strong>
                  <Badge variant="easy">ผ่าน 3/3</Badge>
                </div>
                {practiceTestCases.map(([name, input, expected, status]) => (
                  <div className="mock-output-row" key={name}>
                    <span><Icon filled>task_alt</Icon> {name}</span>
                    <code>{input}</code>
                    <span>{expected}</span>
                    <strong>{status}</strong>
                  </div>
                ))}
                <div className="submit-answer">
                  <UiButton size="lg" onClick={() => setHasSubmitted(true)}>
                    <Icon>send</Icon> ส่งคำตอบ
                  </UiButton>
                  {hasSubmitted && <span><Icon filled>workspace_premium</Icon> ส่งคำตอบแล้ว · ได้รับ 120 XP</span>}
                </div>
              </>
            ) : (
              <div className="output-empty">
                <Icon>terminal</Icon>
                <strong>ยังไม่มีผลลัพธ์</strong>
                <span>กดรันโค้ดเพื่อดูผลการทดสอบ</span>
              </div>
            )}
          </Card>
        </div>
      </div>
      {hasSubmitted && (
        <div className="reward-modal-backdrop" role="dialog" aria-modal="true" aria-label="รางวัลจากการส่งคำตอบ">
          <Card className="reward-modal">
            <button className="modal-close" onClick={() => setHasSubmitted(false)} aria-label="ปิด">
              <Icon>close</Icon>
            </button>
            <span className="reward-modal-icon"><Icon filled>workspace_premium</Icon></span>
            <h2>ส่งคำตอบสำเร็จ!</h2>
            <p>คุณผ่านทุกกรณีทดสอบและได้รับรางวัลจากภารกิจนี้</p>
            <div className="reward-prizes">
              <span><Icon filled>stars</Icon><strong>+120 XP</strong></span>
              <span><Icon filled>favorite</Icon><strong>+1 หัวใจ</strong></span>
            </div>
            <div className="level-progress">
              <div>
                <strong>เลเวล 42</strong>
                <span>2,450 / 3,000 XP</span>
              </div>
              <div className="level-bar"><span style={{ width: '82%' }} /></div>
              <small>อีก 550 XP เพื่อเลเวล 43</small>
            </div>
            <UiButton size="lg" onClick={() => setHasSubmitted(false)}>รับรางวัล</UiButton>
          </Card>
        </div>
      )}
    </Page>
  );
}
