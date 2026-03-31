# 💊 PillPal — Medicine Management Admin Dashboard

A modern, professional Admin Dashboard UI for medicine inventory management built with HTML5, CSS3, JavaScript, and Bootstrap-inspired custom design using **Tailwind-like utility classes** and a custom CSS framework.

---

## 🎨 Design System

- **Primary Color:** Teal `#0d9488` / Soft Blue `#007bff`
- **Background:** Light Gray `#f1f5f9`
- **Cards:** White `#ffffff`
- **Typography:** Inter (Google Fonts) — modern sans-serif
- **Style:** Clean, spacious, medical-themed with gradient accents

---

## ✅ Completed Features

### Pages
| Page | File | Description |
|------|------|-------------|
| Login | `login.html` | Card-based login with demo credentials, animated states |
| Dashboard | `index.html` | KPI cards, charts, alerts, recent medicines table |
| Medicines | `medicines.html` | Full CRUD medicine table with search, filter, pagination |
| Users | `users.html` | User management with roles, status, search, and CRUD |
| **Orders** | **`orders.html`** | **Prescription order management with slide-over viewer, lightbox, approve/reject/message actions** |
| Reports | `reports.html` | Analytics charts, trend lines, expiry reports, summary table |
| Settings | `settings.html` | Profile, notifications, inventory, security, appearance, system |

### Core UI Components
- ✅ Responsive **sidebar navigation** with section labels and active states
- ✅ **Top navigation bar** with notifications dropdown, avatar, quick search
- ✅ **Statistics cards** with animated counters, color-coded indicators
- ✅ **Data tables** with search, filter, pagination, and action buttons
- ✅ **Modal dialogs** for Add/Edit/Delete with form validation
- ✅ **Toast notifications** for user feedback
- ✅ **Toggle switches** for settings preferences
- ✅ **Chart.js** visualizations (bar chart, line chart, donut/pie chart)
- ✅ **Mobile responsive** with hamburger menu sidebar toggle
- ✅ **Color-coded status badges** (stock levels, user status, categories)
- ✅ **Progress bars** for stock level visualization
- ✅ **Breadcrumb navigation**

---

## 📂 File Structure

```
pillpal/
├── index.html          # Dashboard Overview
├── login.html          # Login Page
├── medicines.html      # Medicine Management
├── users.html          # User Management
├── reports.html        # Reports & Analytics
├── settings.html       # System Settings
├── css/
│   └── style.css       # Main stylesheet (custom design system)
├── js/
│   └── app.js          # Shared JavaScript utilities
└── README.md
```

---

## 🔗 Navigation (Entry Points)

| URL | Description |
|-----|-------------|
| `login.html` | **Start here** — Login with demo credentials |
| `index.html` | Main dashboard after login |
| `medicines.html` | Medicine inventory management |
| `users.html` | User & staff management |
| `orders.html` | **Prescription order management (new)** |
| `reports.html` | Reports and analytics |
| `settings.html` | System configuration |

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pillpal.com` | `admin123` |
| Pharmacist | `pharmacist@pillpal.com` | `pharma123` |

---

## 📊 Data Models (In-Memory / Frontend)

### Medicine
```json
{
  "id": 1,
  "name": "Amoxicillin 250mg",
  "category": "antibiotic",
  "supplier": "MediCo Pharma",
  "price": 4.50,
  "stock": 12,
  "expiry": "2025-09-15",
  "batch": "AMX-2024-01"
}
```

### User
```json
{
  "id": 1,
  "first": "Emily",
  "last": "Carter",
  "email": "emily.carter@pillpal.com",
  "role": "admin",
  "dept": "Administration",
  "phone": "+1 555-0101",
  "lastLogin": "2025-03-24 09:12",
  "status": "active"
}
```

---

## 🛠️ Technologies Used

- **HTML5** — Semantic markup
- **CSS3** — Custom design system (`css/style.css`)
- **JavaScript (ES6+)** — Interactive UI, CRUD operations
- **[Chart.js](https://www.chartjs.org/)** — Data visualization
- **Slide-over panel** for prescription order detail view with animated entry
- **Prescription lightbox** with zoom, rotate, pan, keyboard navigation, and mouse-wheel zoom
- **Status management** — Approve / Reject / Mark Delivered with confirmation flows
- **Message modal** with template library and multi-channel delivery options
- **Timeline tracker** showing order lifecycle per record
- **Map preview** with Google Maps deep-link integration
- **Mobile responsive** with hamburger menu sidebar toggle
- **[Font Awesome 6](https://fontawesome.com/)** — Icons
- **[Google Fonts — Inter](https://fonts.google.com/specimen/Inter)** — Typography

---

## 🚀 Features Not Yet Implemented

- [ ] Backend API integration (currently uses in-memory JS data)
- [ ] Real authentication & session management
- [ ] PDF/CSV export (currently placeholder)
- [ ] Photo upload for user profiles
- [ ] Dark mode theme toggle
- [ ] Barcode/QR scanner integration
- [ ] Real-time notifications via WebSocket
- [ ] Multi-pharmacy / multi-branch support
- [ ] Supplier management module
- [ ] Purchase order generation

---

## 💡 Recommended Next Steps

1. **Connect to a REST API** using the RESTful Table API to persist medicines and users data
2. **Implement real authentication** with JWT tokens
3. **Add barcode scanning** for medicine check-in/check-out
4. **Enable dark mode** with CSS custom property theming
5. **Build supplier module** for purchase order management
6. **Add real CSV/PDF export** using client-side libraries (jsPDF, Papa Parse)