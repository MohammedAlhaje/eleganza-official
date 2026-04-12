# Eleganza Site

نسخة static جاهزة للنشر المجاني لموقع `Eleganza` مع مسار طلب عبر WhatsApp فقط.

## الهيكل

- `site/`
- `site/assets/styles.css`
- `site/assets/products.js`
- `site/assets/app.js`

## قبل الإطلاق النهائي

1. افتح `site/assets/products.js`.
2. حدّث قيمة `whatsappNumber` إلى رقم المتجر بصيغة دولية بدون `+`.
3. راجع الأسعار والنصوص التمثيلية للمنتجات العادية إذا أردت مطابقتها مع المخزون الحالي.

## تشغيل محلي

يمكن فتح ملفات HTML مباشرة، لكن يفضل استخدام خادم static بسيط:

```bash
cd site
python3 -m http.server 8080
```

ثم افتح:

`http://localhost:8080`

## رفع إلى GitHub

```bash
cd /path/to/eleganza-site
./publish.sh eleganza-site
```

إذا كان اسم `eleganza-site` محجوزاً على GitHub، استخدم اسماً قريباً.

يمكنك أيضاً تمرير اسم مختلف:

```bash
./publish.sh eleganza-official
```

## Cloudflare Pages

- Connect to Git
- اختر مستودع `eleganza-site`
- Framework preset: `None`
- Build command: فارغ
- Build output directory: `site`

## GitHub Pages

- المشروع يحتوي أيضاً على workflow جاهز للنشر التلقائي عبر GitHub Pages من مجلد `site`.
- بعد رفع المستودع، سيُنشأ deploy تلقائي من branch `main`.
- الرابط المتوقع يكون بصيغة:
  - `https://<github-username>.github.io/<repo-name>/`

## أسماء مشروع Cloudflare المقترحة

1. `eleganza`
2. `eleganza-official`
3. `eleganza-couture`
4. `eleganza-house`

## ملاحظات

- التكامل الحالي مع WhatsApp يعتمد رسالة جاهزة، ويستخدم `wa.me` مباشرة إذا تم تعريف رقم المتجر.
- إذا تُرك الرقم فارغاً، سيفتح الموقع WhatsApp برسالة جاهزة دون توجيهها إلى رقم محدد.
- الموقع لا يحتوي على checkout backend أو قاعدة بيانات، وهو مناسب جداً لخطة Pages المجانية.
