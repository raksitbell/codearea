# 🚀 CodeArea — Full-Stack Coding Platform

**CodeArea** คือแพลตฟอร์มการเรียนรู้แบบรวมศูนย์ (Unified Platform) ที่ช่วยให้ผู้ใช้งานสามารถฝึกฝนการเขียนโค้ดได้ทันทีผ่านเว็บเบราว์เซอร์ โดยบูรณาการเทคโนโลยี AI Tutor เพื่อยกระดับประสบการณ์การเรียนรู้และลดกำแพงในการเข้าถึงความรู้ทางเทคนิค

---

## 📖 1. บทนำและวัตถุประสงค์ (Introduction)

### ภูมิหลังความเป็นมา
ในปัจจุบัน ผู้เริ่มต้นมักประสบปัญหาในช่วงเริ่มต้น เช่น ความยุ่งยากในการติดตั้งสภาพแวดล้อม (Environment) และการขาดที่ปรึกษาเมื่อติดปัญหา โครงงานนี้จึงถูกพัฒนาขึ้นเพื่อให้ผู้ใช้ฝึกเขียนโค้ดได้ทันทีและมี AI ช่วยให้คำแนะนำแบบเรียลไทม์

### วัตถุประสงค์หลัก
1. พัฒนาแพลตฟอร์มฝึกเขียนโค้ดที่ทันสมัยและใช้งานง่าย
2. สร้างระบบประมวลผลโค้ด (Execution Engine) ในพื้นที่ปลอดภัย (Sandbox)
3. บูรณาการ AI Tutor (RAG) เพื่อวิเคราะห์และให้คำปรึกษา
4. สร้าง Admin Dashboard สำหรับจัดการโจทย์และสมาชิกอย่างมีประสิทธิภาพ

---

## ✨ 2. คุณสมบัติเด่น (Key Features)

- 📝 **Monaco Editor Integration**: ใช้งาน Engine เดียวกับ VS Code
- 🚀 **Universal Code Execution**: รันโค้ดได้หลายภาษาผ่าน Piston/Judge0
- 🤖 **AI Tutor BaaS**: ใช้เทคนิค RAG ให้คำแนะนำที่แม่นยำตามบทเรียน
- 📊 **Real-time Leaderboard**: ระบบจัดอันดับผู้ใช้งานตามคะแนน
- 🛡️ **System-wide Audit Logs**: บันทึกกิจกรรมสำคัญเพื่อความโปร่งใส

---

## 🏗️ 3. สถาปัตยกรรมระบบ (Project Architecture)

```mermaid
graph TD
    User((ผู้ใช้งาน)) -->|Web Interface| FE[Frontend - Next.js 16]
    FE -->|API Requests| BE[Backend - Node.js/Express]
    
    subgraph "Core Infrastructure"
        BE -->|Data| DB[(Supabase DB)]
        BE -->|Assets| ST[(Supabase Storage)]
        BE -->|Execution| Ex[Executor - Piston/Judge0]
    end
    
    subgraph "AI Intelligence Layer"
        BE -->|Proxy| AIT[AI Tutor BaaS - FastAPI]
        AIT -->|RAG Context| VDB[(ChromaDB)]
        AIT -->|Inference| LLM[Ollama Local LLM]
        VDB --- Emb[nomic-embed-text]
    end
```

### รายละเอียดระบบ AI Tutor
- **FastAPI Engine**: ใช้ Python จัดการ Logic และ Streaming Response
- **RAG Pipeline**: ดึงบริบทจากไฟล์ PDF ใน ChromaDB เพื่อลดการบิดเบือนข้อมูล
- **Local LLM**: ประมวลผลผ่าน Ollama (Qwen/Gemma) ในเครื่อง Local

---

## 🗺️ 4. แผนผังโครงสร้างและลำดับการใช้งาน

### Site Map
```mermaid
graph TD
    Home[🏠 หน้าแรก - Landing] --> Auth[🔐 ระบบยืนยันตัวตน]
    Auth --> Register[ลงทะเบียน]
    Auth --> Login[เข้าสู่ระบบ]
    
    Login --> UserDashboard[👤 Dashboard ของผู้ใช้]
    UserDashboard --> QuestionList[รายการโจทย์]
    QuestionList --> CodeEditor[💻 หน้าเขียนโค้ด - IDE]
    CodeEditor --> AIAssistant[🤖 AI Tutor Sidebar]
    CodeEditor --> RunOutput[แสดงผลการรัน]
    
    Login --> AdminPanel[🔑 ระบบผู้ดูแลระบบ]
    AdminPanel --> ManageQ[จัดการโจทย์]
    AdminPanel --> ManageUser[จัดการสมาชิก]
    AdminPanel --> SysConfig[ตั้งค่าระบบ/Execution]
```

### Storyboard (User Journey)
1. **Landing & Auth**: ผู้ใช้สมัครสมาชิกและเข้าสู่ระบบ
2. **Question Browsing**: เลือกโจทย์ตามหมวดหมู่และระดับความยาก
3. **Coding & AI Helping**: เขียนโค้ดใน IDE หากสงสัยสามารถถาม AI Tutor ได้ทันที
4. **Run & Submit**: ทดสอบโค้ดและส่งผลเพื่อบันทึกสถิติและคะแนน

---

## 🛠️ 5. เทคโนโลยีที่ใช้ (Technical Stack)

### 🌐 Frontend
| เทคโนโลยี | Badge |
| :--- | :--- |
| **Next.js 16** | ![NextJS](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) |
| **React 19** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) |
| **Tailwind v4** | ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **HeroUI** | ![HeroUI](https://img.shields.io/badge/HeroUI-FFD700?style=for-the-badge&logo=nextui&logoColor=black) |

### ⚙️ Backend & Database
| เทคโนโลยี | Badge |
| :--- | :--- |
| **Express.js** | ![Express](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) |
| **Supabase** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) |
| **FastAPI** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) |

---

## 🔍 6. อัลกอริทึมที่สำคัญ (System Algorithms)

- ⏳ **Deferred Search**: ใช้ `useDeferredValue` เพื่อ UI ที่ตอบสนองได้ทันใจขณะค้นหา
- 🎯 **Vector Similarity Search**: ค้นหาเนื้อหาที่เกี่ยวข้องใน ChromaDB สำหรับ AI Tutor
- 📊 **Statistics Aggregation**: ใช้ `Map` ในการรวมผลข้อมูลการส่งโจทย์แยกตามหมวดหมู่
- 🛡️ **Audit Logging**: ระบบบันทึกประวัติกิจกรรมแบบ System-Wide

---

## 💻 7. รายละเอียดการพัฒนา (Technical Deep Dive)

### 🖥️ การจัดการ UI Layout
- **Dashboard**: ระบบ RBAC ตรวจสอบสิทธิ์ผ่าน JWT (role_id 1 คือผู้ใช้ทั่วไป)
- **Code Editor**: บูรณาการ Monaco Editor พร้อมระบบรันโค้ดแบบ Sandbox

### ⚙️ Backend Logic
- **Soft Deletion**: เปลี่ยนสถานะ `status` แทนการลบจริง
- **Streaming Response**: AI ส่งข้อมูลแบบ Token-by-token ผ่าน FastAPI

### 🧠 React Hooks ที่ใช้งาน
- `useState`, `useEffect`, `useMemo`, `useCallback`, `useDeferredValue`, `useRef`

---

## 🚀 8. การ Deployment และ Infrastructure

- **Railway CI/CD**: Auto-Deploy เมื่อมีการ Push ไปยัง GitHub
- **Git Submodules**: จัดการ Piston/Judge0 ผ่าน `npm run submodule:update`
- **Cloud Services**: Supabase (Database/Storage) และ Ollama Cloud (LLM)

---

## 📊 9. แผนผังการไหลของข้อมูล (System Flow)

```mermaid
graph TD
    User((User)) -->|Browser| Frontend[Next.js Frontend]
    Frontend -->|REST API| Backend[Express Gateway]
    Backend -->|Auth/Data| Supabase[(Supabase DB & Auth)]
    Backend -->|Execute Code| Executor[Piston/Judge0 Service]
    Backend -->|Ask AI| AIService[FastAPI AI Service]
    AIService -->|Context| VectorDB[(ChromaDB)]
    AIService -->|LLM| Ollama[Ollama Local LLM]
```

---

## 📚 บรรณานุกรม (Bibliography)
1.	เอกสารประกอบการพัฒนาเฟรมเวิร์ค Next.js (v16.2.4): https://nextjs.org/docs
2.	เอกสารประกอบการพัฒนาเฟรมเวิร์ค CSS Tailwind (v4): https://tailwindcss.com/docs/installation/framework-guides/nextjs
3.	เอกสารประกอบการพัฒนา Runtime Environment Node.js (18): https://nodejs.org/docs/latest-v18.x/api/index.html
4.	เอกสารประกอบการพัฒนาเว็บแอปพลิเคชันเฟรมเวิร์ค Express (v4): https://expressjs.com/en/4x/api.html
5.	เอกสารประกอบการพัฒนาไลบารี่ React (v19.2): https://react.dev/reference/react 
6.	เอกสารประกอบการพัฒนาฐานข้อมูล Supabase: https://supabase.com/docs
7.	เอกสารประกอบการพัฒนา API ของ Monaco Editor: https://microsoft.github.io/monaco-editor/
8.	เอกสารประกอบการพัฒนา Piston: https://github.com/engineer-man/piston
9.	เอกสารประกอบการพัฒนาโมเดลภาษาขนาดใหญ่ (LLM) Gemma 4 (Google): https://ai.google.dev/gemma/docs/integrations/ollama
10.	เอกสารประกอบการพัฒนาเฟรมเวิร์คสำหรับการจัดการโมเดลภาษาขนาดใหญ่ (LLMs on Local Machine) Ollama: https://docs.ollama.com