# FDR SmartTrack – Backend API Service

[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST_Framework-3.15-red?style=for-the-badge)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

The backend service powers **FDR SmartTrack**, handling regulatory security deposit registration, automated OCR certificate processing, discrepancy detection algorithms, maturity timeline notifications, role-based workflow governance, and audit trails.

---

## 🏛️ Application Architecture

The backend is organized into modular, decoupled Django applications:

```text
backend/
├── apps/
│   ├── accounts/          # Custom User model (Admin, Official, Institution), SimpleJWT auth
│   ├── audit/             # Immutable audit log recording every system mutation & IP
│   ├── documents/         # Scanned certificate upload & PyMuPDF / Tesseract OCR parser
│   ├── fdrs/              # FDR deposits, bank metadata, maturity calculations, filtering
│   ├── institutions/      # Institution profiles, AICTE codes, authorized signatories
│   ├── notifications/     # 30/15/7/0 day automated maturity alerts & email queues
│   ├── releases/          # Security deposit release petitions & clearance approvals
│   ├── renewals/          # Renewal petitions, revised certificates, approval pipeline
│   ├── reports/           # Analytics, bank portfolio breakdown, audit report generators
│   └── verifications/     # Automated discrepancy detection & official verification queue
├── config/                # Core Django settings, URLs, WSGI, WhiteNoise storage
├── build.sh               # Cloud build pipeline script
├── Procfile               # Production WSGI server (Gunicorn)
└── requirements.txt       # Production dependencies
```

---

## ⚙️ Environment Variables (`.env`)

| Variable | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `DJANGO_DEBUG` | `bool` | Enable debug mode | `False` (Production) |
| `DJANGO_SECRET_KEY` | `string` | Django cryptographical secret | *(Required in Production)* |
| `DJANGO_ALLOWED_HOSTS`| `string` | Comma-separated hostnames | `.onrender.com,localhost,127.0.0.1,*` |
| `DATABASE_URL` | `string` | Neon / PostgreSQL connection string | `sqlite:///db.sqlite3` fallback |
| `DB_CONN_MAX_AGE` | `int` | DB persistent connection lifetime | `0` (Recommended for Neon Pooler) |
| `CORS_ALLOW_ALL_ORIGINS`| `bool` | Allow all CORS origins | `True` |
| `CORS_ALLOWED_ORIGINS` | `string` | Specific frontend origins | `http://localhost:5173` |
| `MAX_UPLOAD_SIZE` | `int` | Maximum upload size in bytes | `10485760` (10MB) |
| `OCR_ENABLED` | `bool` | Enable OCR processing on uploads | `True` |

---

## 🛠️ Management Commands

FDR SmartTrack includes custom Django management commands:

### 1. Seed Realistic Demonstration Data
Populates institutions (Delhi Tech, MIT Pune), users across all roles, FDR records, sample certificate discrepancies, and renewal requests:
```bash
python manage.py seed_demo_data
```

### 2. Check Upcoming Maturities
Scans active FDR records, identifies deposits nearing maturity (30, 15, 7, 0, -7 days), and generates system notifications:
```bash
python manage.py check_maturities
```

---

## 🔍 Automated OCR & Discrepancy Engine

When an institution uploads an FDR certificate:
1. `apps.documents.ocr_service.py` extracts text and structural key-value pairs using **PyMuPDF** (`fitz`) and regex pattern matching.
2. `apps.verifications.services.py` cross-references extracted OCR values against user-declared values:
   - **FDR Certificate Number**
   - **Bank Name & Branch**
   - **Principal Amount**
   - **Maturity Date**
   - **Joint Account Holders**
3. If discrepancies exist, mismatch flags and percentage confidence scores are stored and displayed in the **Official Verification Queue**.

---

## 🧪 Running Tests

```bash
python manage.py test
```
