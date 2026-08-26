# تطبيق خفيف جداً - Backend + Frontend + Redis + PostgreSQL (بدون Docker)

تطبيق ويب بسيط وعصري مكون من خلفية (Backend) واجهة أمامية (Frontend) يتعامل مع **Redis** لتسجيل عدد الزيارات و **PostgreSQL** لتخزين بيانات المستخدمين **دون الحاجة لـ Docker**.

---

## 🌟 مميزات التطبيق

1. **الواجهة الأمامية (Frontend)**:
   - تصميم عصري بلمسات زجاجية (Glassmorphism) وواجهة باللغة العربية (RTL).
   - عرض فوري لعدد الزيارات المسجلة في Redis مع إمكانية إضافة زيارات جديدة بنقرة زر.
   - نموذج إضافة مستخدم جديد وحفظه في PostgreSQL، وعرض قائمة المستخدمين مباشرة.
   - مؤشرات حالة فورية تفحص الاتصال بـ PostgreSQL و Redis.

2. **الخلفية (Backend)**:
   - مبني بواسطة **Node.js** و **Express.js**.
   - الاتصال بـ Redis باستخدام مكتبة `redis` واستخدام أمر `INCR` للزيارات.
   - الاتصال بـ PostgreSQL باستخدام `pg` مع إنشاء جدول `users` تلقائياً عند التشغيل.
   - نظام نمط الاحتياط الذكي (Fallback Mode): في حال عدم وجود قواعد البيانات تعمل حالياً، يستمر التطبيق بالعمل في الذاكرة لتجربة الواجهة دون أن ينهار الخادم.

---

## 📁 هيكلية المشروع

```
.
├── backend/
│   ├── package.json          # حزم وتابعات Node.js (express, pg, redis, cors, dotenv)
│   ├── .env.example          # نموذج إعدادات البيئة لبيانات الاتصال
│   ├── .env                  # ملف إعدادات البيئة الفعلي
│   └── src/
│       ├── config/
│       │   ├── postgres.js   # إعداد الاتصال وإنشاء جدول PostgreSQL
│       │   └── redis.js      # إعداد عميل Redis والدوال المساعدة
│       └── server.js         # خادم Express ومسارات الـ API
├── frontend/
│   ├── index.html            # هيكل الواجهة الأمامية
│   ├── style.css             # التصميم وتنسيقات CSS العصري
│   └── src/
│       └── app.js            # برمجية JavaScript للاتصال بالـ APIs وتحديث الواجهة
├── package.json              # ملف الأوامر الرئيسي للمشروع
└── README.md                 # دليل التشغيل والاستخدام
```

---

## 🚀 كيفية التشغيل محلياً (بدون Docker)

### 1. المتطلبات الأساسية
- مثبت **Node.js** (الإصدار 18 أو أحدث).

### 2. تثبيت التابعين (Dependencies)
افتح المجلد الرئيسي للمشروع في التيرمينال وشغل الأمر التالي:

```bash
cd backend
npm install
```

### 3. ضبط متغيرات البيئة (Optional / اختياري)
قم بتعديل ملف `backend/.env` بحسب إعدادات قاعدة البيانات والـ Redis لديك:

```env
PORT=5000

# إعدادات PostgreSQL
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=app_db

# إعدادات Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

> **ملاحظة**: إذا لم تقم بتشغيل Redis أو PostgreSQL محلياً، سيعمل التطبيق تلقائياً في وضع **Memory Mode** لتجربة الواجهة دون مشاكل.

### 4. تشغيل الخادم
لتشغيل الخادم والواجهة معاً:

```bash
cd backend
npm start
```

افتح المتصفح وانتقل إلى العنوان:
[http://localhost:5000](http://localhost:5000)

---

## 🔌 مسارات الـ REST APIs

| المسار | النوع | الوصف |
| :--- | :--- | :--- |
| `/api/status` | `GET` | فحص حالة الاتصال بقواعد البيانات (Redis & PostgreSQL) |
| `/api/visits` | `GET` | جلب عدد الزيارات الحالي من Redis |
| `/api/visits/increment` | `POST` | زيادة عدد الزيارات بمقدار 1 في Redis |
| `/api/users` | `GET` | جلب قائمة كافة المستخدمين المسجلين من PostgreSQL |
| `/api/users` | `POST` | إضافة مستخدم جديد إلى PostgreSQL (`{ username, email }`) |
