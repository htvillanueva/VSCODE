# SISMO: Sari-sari Inventory System for Management and Operations

**SISMO** is a mobile-responsive, real-time web application designed to help small-scale Filipino retail stores (Sari-sari stores) manage inventory, track sales performance, and maximize products profitability through data-driven insights.

---

## Features

### 1. **Smart Inventory Management**

* **Batch Tracking (FEFO):** Uses "First-Expiring, First-Out" logic to ensure older stock is sold before newer arrivals.
* **Automated Image Compression:** Handles product images efficiently in terms of storage and loading speed by compressing them on the client side before saving to Firebase.
* **Color-Coded Alerts:** * 🔴 **Red:** Expired or expiring within 3 days.
* 🟠 **Orange:** Expiring within 7 days.
* 🟡 **Yellow:** Expiring within 14 days.

### 2. **Point of Sales (POS) System**

* **Interactive Catalogue:** Quick selection interface with category filtering and real-time stock availability.
* **Financial Calculation:** Calculates customer totals and change instantly.
* **FEFO Safeguards:** Prevents the sale of expired items or selling beyond available stock.

### 3. **Sales Analytics**

* **Real-time Performance:** Live charts (via Chart.js) showing revenue trends.
* **Net Profit Report:** Automatically subtracts **Cost of Goods Sold (COGS)** and **Spoilage (Losses)** from total revenue.
* **Smart Suggestions:** AI-like logic that identifies "Best Sellers" and warns about products causing high spoilage losses.

---

## 🛠️ Technical Stack

* **Frontend:** HTML5, CSS3 (Custom Glassmorphism UI), Bootstrap 5.
* **Database:** Firebase Firestore (NoSQL) for real-time synchronization.
* **Authentication:** Firebase Phone Authentication.
* **Visualizations:** Chart.js for sales analytics and Bootstrap Icons.
* **Notifications:** EmailJS and Firebase for login alerts.

---

## 📂 File Structure

| File | Description |
| --- | --- |
| `basis.html` | The basis file for the index.html |
| `index.html` | The login gateway using Firbase Phone Authentication. |
| `home.html` | Dashboard featuring the daily sales target progress bar. |
| `inventory.html` | Comprehensive inventory management with batch/expiry tracking. |
| `view.html` | The POS (View Catalogue) interface for recording transactions. |
| `sales.html` | Analytics dashboard with smart suggestions for profit/loss reports. |
| `*.css` | Domain-specific styling for desktop and mobile responsiveness. |

---

## 🛠️ Setup for the Client

Since the API keys and Firebase backend are already pre-configured, no technical installation is required.

1. **Deployment:** Deploy the files to a private web host (e.g., Firebase Hosting or a private server).
2. **Authentication:**
* Open the application.
* Enter one of the two pre-authorized phone numbers (e.g., `+63 956 907 9865`).
* Complete the invisible reCAPTCHA and enter the 6-digit verification code sent to the device.


3. **Administration:** * The `DAILY_TARGET` for the progress bar on the home screen is currently set to **₱2,500**.
* To adjust the sales target, modify the `DAILY_TARGET` constant in `home.html`.

---

## 🔒 Access Control & Security

This application is configured for private use. Access is restricted via **Firebase Phone Authentication**.

* **Pre-Registered Access:** The system is currently configured to allow login for **two specific phone numbers** already registered in the Firebase console.
* **Knowledge Requirement:** Users **must know the exact registered phone number** to receive the OTP (One-Time Password).
* **Activity Monitoring:** Every successful login triggers an automated email notification to the administrator via EmailJS, detailing the phone number used and the exact time of entry.

---

## 📱 Mobile Experience

SISMO is optimized for mobile devices. In the inventory and sales views, dense data tables automatically transform into "Mobile Cards" for better readability on small screens.
