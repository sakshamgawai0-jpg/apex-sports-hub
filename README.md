# ⚡ Apex Sports Hub — Pro Sports Equipment E-Commerce & WhatsApp Platform

**WhatsApp Orders & Hotline:** `+91 98765 43210`  
**Location:** Stadium Main Road, Opp. Central Sports Complex, Metro Pillar 142, Mumbai, Maharashtra (400050)  
**Operating Hours:** 09:30 AM – 09:30 PM (All 7 Days Open)

---

## 🏆 Project Overview
**Apex Sports Hub** is an ultra-modern, high-octane athletic e-commerce web platform engineered for sports gear, tournament equipment, and athletic apparel. It features seamless **1-Click WhatsApp Ordering** across all products, a slide-over interactive cart drawer with formatted WhatsApp checkouts, and a comprehensive **Owner Admin Panel** allowing owners to list unlimited sports gear and change prices anytime.

---

## 🌟 Key Features

### 1. 🛍️ High-Energy Athletic Storefront (`index.html`)
- **Modern Athletic Aesthetics:** Dark carbon obsidian (`#080c14`), electric volt neon (`#c6ff00`), and cyan accents (`#00f0ff`) with glassmorphic cards and micro-animations.
- **Top Running Marquee:** Real-time ticker announcing discounts and WhatsApp direct order notices.
- **Sport Category Navigation:** Filter by Cricket, Football, Badminton, Gym & Fitness, Running Shoes, Sportswear, and Accessories with a single tap.
- **Live Search & Price Sort:** Instant filtering across titles, sports, SKUs, and in-stock items.
- **Dynamic Product Cards:**
  - High-res athletic gear imagery with hover zoom.
  - Interactive variant & size selector pills (e.g. Bat sizes, Shoe UK sizes, Dumbbell weights).
  - Live stock indicators (🟢 In Stock, 🟡 Low Stock, 🔴 Out of Stock).
  - Discount badges and pricing.
  - **⚡ 1-Click WhatsApp Order Button:** Automatically formats a direct order message with the exact item name, chosen size, price, and SKU, and opens WhatsApp immediately!
- **Slide-Over Cart Drawer:**
  - Quantity steppers (`+`/`-`), size badges, and item removals.
  - Store Pickup vs Home Delivery options.
  - Customer name and delivery landmark inputs.
  - **"Proceed to WhatsApp Checkout"** button compiling the full itemized bag with totals into an instant WhatsApp checkout order.
- **Quick View Modal:** Multi-photo thumbnail gallery, pro specs & highlights bullet list, and instant 1-Click WhatsApp buy button.
- **Floating WhatsApp Widget:** Corner widget with breathing pulse animation for direct customer consultations.
- **Mobile Sticky Navigation Bar:** Quick touch access to Catalog, Bag, WhatsApp, and Admin.

---

### 2. 🔐 Owner Admin Panel (`admin.html`)
The Admin Panel enables the sports shop owner to manage items anytime without limits ("unlimited time / unlimited items / unlimited photos"):

#### Admin Credentials:
- **Username:** `admin`
- **Password / PIN:** `sports123`
*(Includes a 1-tap "Auto-Fill" button on the login screen for instant demo access)*

#### Key Admin Capabilities:
1. **List Things Anytime (Unlimited Listings):**
   - **NO LIMIT** on the number of sports items you can list.
   - Set Title, Sport Category, SKU, Selling Price (₹), Original MRP (₹), Stock Status, Promotional Badges, and Sizes/Variants.
   - Detailed pro specs and markdown bullet points.
2. **Change Price Anytime (Inline Instant Editor):**
   - Each product row in the table features a direct price input field.
   - Simply edit the price number and click the checkmark or press Enter to update the live storefront instantly!
3. **Unlimited Photos & Media Uploader:**
   - **NO LIMIT** on photos per product.
   - Add photos by pasting an online Image URL.
   - **Upload From Device:** Select single or multiple photos directly from your phone/computer (converted to base64 Data URLs for local persistence).
   - Real-time photo thumbnail preview strip with one-click deletion.
4. **Change WhatsApp Routing Number Anytime:**
   - Go to **WhatsApp & Settings** to update the recipient WhatsApp phone number at any time. All storefront orders will automatically route to the updated number!
5. **Catalog Backup & Restore:**
   - **Backup Catalog (Export JSON):** Download a complete `.json` file backup of your entire sports catalog.
   - **Import Catalog (Import JSON):** Restore or migrate products from any JSON backup.
   - **Reset Catalog:** Restore factory default sports products with one click.
6. **Live KPI Dashboard:**
   - Total products listed.
   - Active in-stock count.
   - Out-of-stock flags.
   - Total catalog inventory valuation in INR.

---

## 📁 File Structure
```
c:\Users\sandi\.antigravity-ide\apex-sports\
├── index.html                  # Main sports shop storefront
├── admin.html                  # Secure owner admin console
├── README.md                   # Brand, features, and setup documentation
└── assets/
    ├── css/
    │   ├── style.css           # Athletic design system & responsive UI
    │   └── admin.css           # Admin dashboard & productivity interface
    └── js/
        ├── storage.js          # Shared catalog, settings, and localStorage engine
        ├── app.js              # Storefront interactions, 1-Click WhatsApp ordering & cart
        └── admin.js            # Admin authentication, inline price editor & media uploader
```

---

## 🚀 Running Locally

You can launch the web application using any local HTTP server:

### Option A: Using Python
```powershell
python -m http.server 8877 --directory "c:\Users\sandi\.antigravity-ide\apex-sports"
```

### Option B: Using Node.js (npx)
```powershell
npx -y serve "c:\Users\sandi\.antigravity-ide\apex-sports" -p 8877
```

Then open in your browser:
- **Storefront:** [http://localhost:8877/index.html](http://localhost:8877/index.html)
- **Admin Panel:** [http://localhost:8877/admin.html](http://localhost:8877/admin.html)
