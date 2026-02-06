# Ministock Project Documentation

เอกสารนี้อธิบายเกี่ยวกับโปรเจกต์ **Ministock** ทั้งส่วนของ Frontend และ Backend เพื่อความเข้าใจในการทำงานของระบบ

---

##  Frontend (ministock-fontend)

Frontend ใช้ **Next.js** 

### Key Libraries

- **Axios** (`axios`)
  - **ทำหน้าที่อะไร:** เป็น Library สำหรับส่ง HTTP Request (เช่น GET, POST, PUT, DELETE) ไปยัง Backend API


- **SWR** (`swr`)
  - **ทำหน้าที่อะไร:** เป็น React Hooks สำหรับการดึงข้อมูล 
  - **ตัวอย่างการใช้:** ช่วยจัดการเรื่อง Caching , Revalidation และ Real-time update

- **Clsx** (`clsx`)
  - **ทำหน้าที่อะไร:** เครื่องมือช่วยจัดการ Class Name ของ CSS แบบมีเงื่อนไข 
  - **ตัวอย่างการใช้:** ใช้เปลี่ยนสีปุ่มตามสถานะ เช่น ถ้าสินค้าหมด (`quantity === 0`) ให้ปุ่มเป็นสีแดง 

- **QRCode.react** (`qrcode.react`)
  - **ทำหน้าที่อะไร:** Component สำหรับสร้างภาพ QR Code จากข้อความหรือ JSON Data
  - **ตัวอย่างการใช้:** ใช้สร้าง QR Code สินค้าเพื่อให้สามารถสแกนดูรายละเอียดได้

- **Tailwind CSS** (`tailwindcss`)
  - **ทำหน้าที่อะไร:**  CSS Framework สำหรับตกแต่งหน้าตาเว็บไซต์ด้วยการใส่ 

---

## Backend (ministock-backend)

Backend ถูกพัฒนาด้วย **Node.js** ทำหน้าที่เป็น API Server และเชื่อมต่อกับฐานข้อมูล PostgreSQL

###  Key Libraries

- **Express** (`express`)
  - **ทำหน้าที่อะไร:** Web Framework Node.js ใช้ทำ Web Server และ API Routes
  - **การใช้งาน:** ใช้รับ Request จาก Frontend (เช่น `/products`) และส่ง Response กลับไป

- **Prisma** (`prisma` & `@prisma/client`)
  - **ทำหน้าที่อะไร:** เป็น ORM 
  - **จุดเด่น:** ช่วยให้เราเขียนโค้ดติดต่อฐานข้อมูลได้ง่ายๆ เหมือนเรียกใช้ฟังก์ชัน (เช่น `prisma.product.findMany()`) แทนการเขียน SQL Query ยาวๆ 

- **Multer** (`multer`)
  - **ทำหน้าที่อะไร:** Middleware สำหรับจัดการการอัปโหลดไฟล์ 
  - **การใช้งาน:** ใช้รับไฟล์รูปภาพสินค้าจาก Frontend และบันทึกลงในโฟลเดอร์ `uploads/` บน Server

- **Cors** (`cors`)
  - **ทำหน้าที่อะไร:** Middleware ที่อนุญาตให้ Frontend (ที่รันบน localhost:3000) สามารถเรียกใช้งาน API ของ Backend (ที่รันบน localhost:3001) 

- **Pg** (`pg`)
  - **ทำหน้าที่อะไร:** PostgreSQL client สำหรับ Node.js เป็นตัวเบื้องหลังที่ช่วยให้ Prisma เชื่อมต่อกับฐานข้อมูล PostgreSQL ได้

---

##  วิธีการรันโปรเจกต์ (How to Run)

### 1. Start Backend
```bash
cd "ministock-backend"
npm run dev
# Server จะรันที่ http://localhost:3001
```

### 2. Start Frontend
```bash
cd "ministock-fontend"
npm run dev
# Web App จะรันที่ http://localhost:3000
```
