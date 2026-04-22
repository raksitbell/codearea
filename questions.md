# คลังโจทย์โปรแกรมมิ่ง 100 ข้อ: มหากาพย์นักเขียนโปรแกรมแห่ง CodeArea

รวบรวมโจทย์ปัญหาคอมพิวเตอร์ 100 ข้อ ในรูปแบบภารกิจและตำนาน เพื่อการฝึกฝนอัลกอริทึมอย่างเข้มข้น

---

> [!IMPORTANT]
> **Developer Note for Integration (@frontend/app/dashboard/problems/new/page.tsx)**
> ข้อมูลในไฟล์นี้ถูกออกแบบมาให้สอดคล้องกับฟอร์มใน `ProblemUpsertForm`:
> - **TITLE**: ชื่อโจทย์
> - **CATEGORY**: หมวดหมู่ใหญ่
> - **DIFFICULTY**: 1 (ง่าย), 2 (ปานกลาง), 3 (ยาก)
> - **TAGS**: ป้ายกำกับโจทย์ (คั่นด้วย comma)
> - **CONSTRAINTS**: ข้อจำกัดของข้อมูล
> - **TIME LIMIT**: มิลลิวินาที (MS)
> - **MEMORY LIMIT**: กิโลไบต์ (KB)
> - **EXPECTED COMPLEXITY**: Time/Space
> - **DESCRIPTION**: เนื้อเรื่องโจทย์
> - **SOLUTION**: โค้ดตัวอย่าง
> - **TEST CASES**: (Input, Output, Order, Is Simple, Status)

---

### 0. ศิลาจารึกแห่งกระจกเงา (Palindrome Mirror)
- **เนื้อเรื่อง**: นักโบราณคดีได้ค้นพบ "วิหารแห่งกระจก" (The Mirror Temple) ซึ่งมีศิลาจารึกประหลาดวางอยู่หน้าทางเข้า เชื่อกันว่าเทพเจ้าแห่งมิติกระจกจะอนุญาตให้ผู้ที่ถือครอง "คำศักดิ์สิทธิ์" ผ่านเข้าไปได้เท่านั้น โดยคำศักดิ์สิทธิ์นี้มีความพิเศษคือ เมื่อมองผ่านกระจกสะท้อน (อ่านจากหลังมาหน้า) คำนั้นจะต้องยังคงเรียงตัวเหมือนเดิมทุกประการ
- **ความยาก**: ง่าย (1)
- **Tags**: String, Palindrome, Logic
- **Expected Complexity**: Time: O(N), Space: O(N)
- **ข้อจำกัด (Constraints)**: ความยาวของข้อความไม่เกิน 1,000 ตัวอักษร
- **Time Limit**: 1000 ms
- **Memory Limit**: 65536 KB
- **Test Cases**:

| Order | Input Data | Output Data | Is Simple | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | level | Yes | True | Active |
| 2 | hello | No | True | Active |

- **โค้ดตัวอย่าง (C++)**:
```cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string s; cin >> s;
    string r = s;
    reverse(r.begin(), r.end());
    if (s == r) cout << "Yes";
    else cout << "No";
    return 0;
}
```

---

## 1. Implementation (การลงมือทำและตรรกะพื้นฐาน)

### 1. ภารกิจทอนเงิน ณ ตลาดมืดฟลอริส
- **ความยาก**: ง่าย (1)
- **Tags**: Implementation, Math, Logic
- **Expected Complexity**: Time: O(1), Space: O(1)
- **ข้อจำกัด (Constraints)**: 0 <= ราคา, เงินจ่าย <= 1,000,000
- **Time Limit**: 1000 ms
- **Memory Limit**: 65536 KB
- **Test Cases**: ...

### 2. บันทึกโบราณของนักเล่นแร่แปรธาตุ
- **ความยาก**: ง่าย (1)
- **Tags**: Math, Implementation
- **Expected Complexity**: Time: O(1), Space: O(1)
...

## 2. Math (คณิตศาสตร์)
### 11. มนต์สะกดแบ่งพลังงาน (GCD)
- **Tags**: Math, Number Theory, GCD
...

## 4. Data Structure (โครงสร้างข้อมูล)
### 28. คลังเสบียงที่เบาที่สุด
- **Tags**: Array, Data Structure, Basic
...

## 5. Dynamic Programming (DP)
### 37. เส้นทางกบผู้กล้า
- **Tags**: DP, Math, Recursion
...

## 7. DFS & BFS (การค้นหาในกราฟ)
### 55. หนีจากเขาวงกตมิโนทอร์
- **Tags**: Graph, BFS, Maze
...

## 11. Extra Quests (โจทย์พิเศษ)

### 91. ดัชนีหอสมุดต้องห้าม (The Forbidden Library Indexing)
- **ความยาก**: ง่าย (1)
- **Tags**: String, Sorting, Basic
- **Expected Complexity**: Time: O(N log N), Space: O(N)
...

### 99. ส่วนผสมยาวิเศษของนักเล่นแร่แปรธาตุ (The Alchemist's Mix)
- **ความยาก**: ยาก (3)
- **Tags**: DP, Subset Sum, Optimization
- **Expected Complexity**: Time: O(N*K), Space: O(N*K)
...
