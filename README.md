# research-office-web

واجهة مكتب الخدمات البحثية (تحليل إحصائي، تدقيق وتنسيق، دراسات جدوى). Angular 22 + Tailwind 4، عربي RTL أولاً مع دعم الإنجليزي لاحقاً.

## التشغيل

يلزم Node 24.

```bash
npm ci
npm start          # http://localhost:4200
npm run build
npm test
npm run gen:api    # يولّد src/app/core/api/schema.d.ts من research-office-backend (لازم يكون شغال على 8090)
```

## المناطق

| المسار | الوصف |
|---|---|
| `/request` | نموذج طلب الخدمة العام |
| `/t/:token` | متابعة العميل لطلبه بالرابط بدون تسجيل دخول |
| `/expert` | مساحة الخبير |
| `/admin` | لوحة الإدارة |

## قواعد

- الألوان من التوكنز فقط (`src/styles.css`): `bg-surface`، `text-ink`، `bg-primary`، `brand-*`، `accent-*`... ألوان Tailwind الافتراضية ملغية.
- الاستيراد بالـ aliases: `@core`، `@shared`، `@features`، `@layout`، `@env`.
- أي كود يتكرر مرتين ينتقل إلى `shared`.
- كل تغيير يُسجَّل في `CHANGELOG.md` مع رفع الإصدار في `package.json`.
