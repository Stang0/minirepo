# Mini Stock Backend API Endpoints

Base URL:

```text
http://localhost:3001
```

Authentication:

```text
Authorization: Bearer <token>
```

Most endpoints require a valid login token, except `GET /auth/users` and `POST /auth/login`.

## 1. Health Check

### `GET /`
- Purpose: เช็กว่า backend server ทำงานอยู่
- Auth: ไม่ต้อง login
- Response: ข้อความ `Mini Stock API is running`

## 2. Auth

### `GET /auth/users`
- Purpose: ดึงรายการ user แบบ public สำหรับดูรายชื่อบัญชีที่มีในระบบ
- Auth: ไม่ต้อง login
- Used for: แสดงรายชื่อผู้ใช้ / debug
- Response:
  - `id`
  - `name`
  - `username`
  - `role`
  - `department`

### `POST /auth/login`
- Purpose: login ด้วย `username/password`
- Auth: ไม่ต้อง login
- Body:

```json
{
  "username": "admin",
  "password": "demo1234"
}
```

- Response:

```json
{
  "token": "jwt-like-signed-token",
  "user": {
    "id": "user-admin",
    "name": "Testname Admin",
    "username": "admin",
    "role": "ADMIN",
    "department": "Operations"
  }
}
```

### `GET /auth/session`
- Purpose: ตรวจ session ปัจจุบันจาก token
- Auth: ต้อง login
- Response: ข้อมูล user ที่ login อยู่

## 3. Dashboard

### `GET /dashboard/summary`
- Purpose: สรุปตัวเลขบน dashboard
- Auth: ต้อง login
- Role behavior:
  - `STAFF` เห็นเฉพาะ request ของตัวเอง
  - `DEPARTMENT_MANAGER` เห็นเฉพาะ request ของแผนกตัวเอง
  - `STORE_MANAGER` และ `ADMIN` เห็นภาพรวมทั้งหมด
- Response:
  - `products`
  - `lowStock`
  - `requests`
  - `completed`
  - `pendingApprovals`
  - `waitingStoreApprovals`
  - `recentLogs`

## 4. Users

### `GET /users`
- Purpose: ดึงรายการผู้ใช้ทั้งหมด
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น

### `POST /users`
- Purpose: สร้าง user ใหม่
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น
- Body:

```json
{
  "name": "Testname Staff 2",
  "username": "staff2",
  "password": "demo1234",
  "role": "STAFF",
  "department": "IT"
}
```

- Notes:
  - password จะถูก hash ก่อนบันทึก
  - ถ้าไม่ส่ง password จะ default เป็น `demo1234`

### `PATCH /users/:id`
- Purpose: แก้ไข user
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น
- Body: ส่งเฉพาะ field ที่ต้องการแก้
- Notes:
  - ถ้าส่ง password ใหม่ ระบบจะ hash ให้
  - ถ้า password เป็นค่าว่าง ระบบจะไม่เปลี่ยนรหัสผ่าน

### `DELETE /users/:id`
- Purpose: ลบ user
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น

## 5. Products

### `GET /products`
- Purpose: ดึงรายการสินค้าทั้งหมด
- Auth: ต้อง login
- Query optional:
  - `search` ค้นหาจาก `sku`, `name`, `category`

### `GET /products/scan/:code`
- Purpose: ค้นหาสินค้าจาก QR code, SKU หรือ product id
- Auth: ต้อง login
- Used for: scan QR / search product

### `POST /products`
- Purpose: เพิ่มสินค้าใหม่
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น
- Body example:

```json
{
  "sku": "NB-002",
  "name": "Office Notebook 2",
  "category": "Electronics",
  "quantity": 10,
  "unit": "pcs",
  "price": 750,
  "image": "http://localhost:3001/uploads/file.png",
  "minStock": 5,
  "qrCode": "MINISTOCK:NB-002"
}
```

- Notes:
  - ถ้าไม่ส่ง `qrCode` ระบบจะสร้างจาก `MINISTOCK:<sku>`
  - ระบบคำนวณ `status` จาก quantity/minStock ให้

### `PATCH /products/:id`
- Purpose: แก้ไขสินค้า
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น
- Notes:
  - ถ้าแก้ quantity หรือ minStock ระบบจะคำนวณ status ใหม่

### `DELETE /products/:id`
- Purpose: ลบสินค้า
- Auth: ต้อง login
- Role: `ADMIN` เท่านั้น

## 6. Requests

### `GET /requests`
- Purpose: ดึงรายการคำขอ
- Auth: ต้อง login
- Role behavior:
  - `STAFF` เห็นเฉพาะ request ของตัวเอง
  - `DEPARTMENT_MANAGER` เห็น request ของพนักงานในแผนกตัวเอง
  - `STORE_MANAGER` และ `ADMIN` เห็นทั้งหมด
- Response includes:
  - `requester`
  - `product`
  - `approvals`

### `POST /requests`
- Purpose: สร้างคำขอเบิกหรือยืมสินค้า
- Auth: ต้อง login
- Main users: ส่วนใหญ่ใช้โดย `STAFF`
- Body:

```json
{
  "productId": "product-laptop-001",
  "quantity": 2,
  "type": "STOCK_OUT",
  "reason": "Need for onboarding"
}
```

- Rules:
  - quantity ต้องมากกว่า 0
  - quantity ต้องไม่เกิน stock ที่มีอยู่
  - สถานะเริ่มต้นเป็น `PENDING`

### `PATCH /requests/:id/decision`
- Purpose: อนุมัติหรือปฏิเสธคำขอ
- Auth: ต้อง login
- Used by:
  - `DEPARTMENT_MANAGER` สำหรับอนุมัติขั้นแรก
  - `STORE_MANAGER` สำหรับอนุมัติขั้นสุดท้าย
- Body:

```json
{
  "decision": "APPROVED",
  "comment": "Approved for department use"
}
```

- Workflow:
  - Manager approve:
    - `PENDING` -> `WAITING_STORE_APPROVAL`
  - Manager reject:
    - `PENDING` -> `REJECTED`
  - Store approve:
    - `WAITING_STORE_APPROVAL` -> ตัด stock -> `COMPLETED`
  - Store reject:
    - `WAITING_STORE_APPROVAL` -> `REJECTED`

- Important rules:
  - requester อนุมัติคำขอของตัวเองไม่ได้
  - manager อนุมัติได้เฉพาะ request ในแผนกตัวเอง
  - store approve จะเช็ก stock ซ้ำอีกครั้งก่อนตัดจริง

## 7. Logs

### `GET /logs`
- Purpose: ดู audit log และ stock movement
- Auth: ต้อง login
- Role: `STORE_MANAGER` และ `ADMIN`
- Response:

```json
{
  "logs": [],
  "stockMovements": []
}
```

- `logs`:
  - เก็บ action เช่น `USER_CREATED`, `PRODUCT_UPDATED`, `REQUEST_CREATED`
- `stockMovements`:
  - เก็บการตัด stock จริงตอน store approve

## 8. Upload

### `POST /upload`
- Purpose: upload รูปสินค้า
- Auth: ปัจจุบัน route นี้ไม่ได้บังคับ login ในโค้ด
- Content-Type: `multipart/form-data`
- Form field:
  - `image`
- Response:

```json
{
  "message": "Image uploaded successfully",
  "url": "http://localhost:3001/uploads/img-xxxx.png"
}
```

## 9. Static Files

### `GET /uploads/:filename`
- Purpose: เปิดไฟล์รูปที่ upload ไว้
- Auth: ไม่ต้อง login

## 10. Role Summary by Endpoint

### Staff
- `GET /auth/session`
- `GET /dashboard/summary`
- `GET /products`
- `GET /products/scan/:code`
- `GET /requests`
- `POST /requests`

### Department Manager
- ใช้ทุก endpoint ของ Staff ที่เกี่ยวกับการดูข้อมูล
- `PATCH /requests/:id/decision` สำหรับขั้นแรก

### Store Manager
- ใช้ทุก endpoint ของ Staff ที่เกี่ยวกับการดูข้อมูล
- `PATCH /requests/:id/decision` สำหรับขั้นสุดท้าย
- `GET /logs`

### Admin
- ใช้ทุก endpoint ดูข้อมูลทั้งหมด
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `GET /logs`

