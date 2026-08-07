# GM Limo Services — Executive Chauffeur & Logan Airport Car Service

A modern, high-performance web platform and reservation system for **GM Limo Services Boston**, featuring real-time route pricing, Stripe pre-authorization payment holds, passenger portals, administrative control panels, and asynchronous Redis queue workers.

---

## 🌟 Key Features & Project Scope

### 🚗 Customer & Booking Portal (`/book`, `/fleet`, `/services`)
- **Interactive 3-Step Booking Engine**:
  - **Step 1: Service & Route Matrix** — Live OpenStreetMap location search for Pickup/Drop-off points, Google Maps Route Matrix visualization, estimated travel distance (miles) & duration (mins).
  - **Step 2: Fleet Selection & System Calculated Rates** — Real-time price calculations based on vehicle class rate and trip duration.
  - **Step 3: Passenger Verification & Payment Hold** — Authenticated passenger check, inline sign in/register, saved Stripe cards selector, or new card entry via Stripe Elements.
- **Stripe Pre-Authorization Hold Engine (`capture_method: 'manual'`)**:
  - Authorizes and locks fare funds on the customer's card without capturing.
  - Funds remain held in reserve and are only captured upon destination arrival by the chauffeur.
- **Dynamic Fleet & Service Pages**:
  - Live database-driven `/fleet/[slug]` and `/services/[slug]` pages with Playfair serif typography, specs highlight bar, and sticky reservation widgets.
  - **3-Product Slider** in the *Late-Model Luxury Vehicles* section with right-to-left navigation controls.

### 👤 Passenger Portal & Dashboard (`/passenger`)
- **Authentication**: JWT session cookies (`passenger_token`) with BCrypt password hashing.
- **Passenger Dashboard (`/passenger/dashboard`)**:
  - **My Rides**: Complete ride history, status badges (`🔒 Hold Placed`, `✅ Paid / Captured`, `❌ Released`), pickup/drop-off breakdown, and confirmation codes.
  - **Saved Cards**: PCI-compliant stored card metadata (`last4`, `brand`, `expMonth`, `expYear`) attached to Stripe Customer IDs for 1-click booking reuse.

### ⚙️ Administrative Control Panel (`/admin`)
- **Bookings Management (`/admin/bookings`)**:
  - Live table of all customer reservations.
  - Payment action buttons: **"💳 Capture Payment"** (captures held funds upon destination arrival) and **"❌ Release Hold"** (cancels pre-authorization with $0 fee).
- **Fleet Catalog (`/admin/fleet`)**: Create, edit, upload photos, and re-order luxury vehicles.
- **Services Catalog (`/admin/services`)**: Create and edit executive chauffeur service offerings.
- **Airports Catalog (`/admin/airports`)**: Manage airport transfer estimates (BOS, BED, PVD, MHT, ORH).
- **Site Settings (`/admin/settings`)**: Dynamic phone numbers, dispatch email addresses, and hero titles.

### 📩 Asynchronous Redis Email Queue (BullMQ + Nodemailer)
- **Shared VPS Redis Integration**: Communicates with the existing `everyday_redis` container on `global_network` (`REDIS_HOST=everyday_redis`, `REDIS_PORT=6379`).
- **Queued Transactional Emails**:
  - **Welcome Email**: HTML onboarding email dispatched to new passengers upon account registration.
  - **Ride Confirmation Email**: Detailed HTML trip breakdown dispatched to both the passenger and admin dispatch (`info@bostonluxurychauffeur.com`).

### 🖼️ Dynamic Media Server (`/uploads/[...path]`)
- Serves dynamic runtime uploads (`/public/uploads/services/...` & `/public/uploads/fleet/...`) instantly in real time without needing Laravel-style symlinks or server restarts.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack & React 19
- **Language**: TypeScript
- **Database & ORM**: MySQL / MariaDB via [Prisma ORM 6](https://www.prisma.io/)
- **Payments**: [Stripe SDK](https://stripe.com/) (`stripe` v22, `@stripe/react-stripe-js`, `@stripe/stripe-js`)
- **Queues & Caching**: [BullMQ](https://bullmq.io/) + [ioredis](https://github.com/redis/ioredis)
- **Emails**: [Nodemailer](https://nodemailer.com/) (SMTP HTML Transporter)
- **Styling**: Vanilla CSS custom properties (`app/main.css`), Playfair Display & Inter typography
- **Containerization**: Docker & Docker Compose

---

## 📁 Repository Directory Structure

```text
gm-taxi-service/
├── app/
│   ├── (public pages)/          # Home (/), About, Fleet, Services, Book, Contact
│   ├── admin/                   # Admin Panel (Bookings, Fleet, Services, Airports, Settings)
│   ├── passenger/               # Passenger Login, Register & Dashboard
│   ├── api/
│   │   ├── admin/               # Admin API routes (Bookings capture/cancel, Uploads, Fleet, Services)
│   │   ├── create-payment-intent/ # Stripe manual hold PaymentIntent creation
│   │   ├── passenger/           # Passenger Auth & Saved Cards APIs
│   │   └── webhooks/stripe/     # Real-time Stripe Webhook listener
│   └── uploads/[...path]/       # Dynamic runtime image streaming handler
├── components/
│   ├── admin/                   # ImageUploader & Admin UI components
│   ├── forms/                   # BookingForm (3-Step Engine) & StripeCardElement
│   ├── home/                    # FleetSlider, ServicesGrid, HeroSection, AirportTransfers
│   └── layout/                  # Header (Black links, active state, Avatar Dropdown) & Footer
├── lib/
│   ├── actions/                 # sendBookingQuote Server Action
│   ├── email.ts                 # Nodemailer transport & HTML templates
│   ├── passengerAuth.ts         # JWT cookie verification & auth helpers
│   ├── prisma.ts                # PrismaClient singleton
│   ├── redis.ts                 # ioredis client singleton
│   ├── stripe.ts                # Server-side Stripe SDK helper
│   ├── stripeClient.ts          # Client-side loadStripe helper
│   └── queue/
│       └── emailQueue.ts        # BullMQ email producer & background worker
├── prisma/
│   ├── schema.prisma            # MySQL database schema (Admin, Service, Vehicle, Passenger, PassengerCard, Booking)
│   └── seed.ts                  # Database seeder script
├── public/                      # Static assets & dynamic /uploads directory
├── docker-compose.yml           # Production Docker Compose definition
└── Dockerfile                   # Multi-stage production build Dockerfile
```

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Database Connection URL (MySQL / MariaDB)
DATABASE_URL="mysql://root:password@localhost:3306/gmlimo_next_app_db"

# JWT Authentication Secret Key
JWT_SECRET="super-secret-jwt-key-gm-limo-2026"

# Stripe API Keys (Get from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_test_secret_key_gm_limo_2026"

# Shared VPS Redis (Connects to everyday_redis on Docker global_network)
REDIS_HOST="everyday_redis"
REDIS_PORT=6379

# SMTP Email Configuration (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="info@bostonluxurychauffeur.com"
DISPATCH_EMAIL="info@bostonluxurychauffeur.com"
```

---

## 🚀 Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Sync Database Schema & Seed Data**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Test Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🐳 Docker Deployment on VPS

To deploy on your VPS using Docker Compose:

1. **Build & Start Containers**:
   ```bash
   docker compose up -d --build
   ```

2. **Run Prisma Migrations & Database Seeding inside Docker**:
   ```bash
   docker exec -it gm_taxi_app npx prisma db push
   docker exec -it gm_taxi_app npx tsx prisma/seed.ts
   ```

3. **Verify Container Logs**:
   ```bash
   docker logs -f gm_taxi_app
   ```

---

## 🔒 Security & PCI Compliance

- **Card Tokenization**: Credit card numbers and CVC codes are tokenized client-side via Stripe Elements and are **never** stored on our servers or database.
- **Safe Metadata Only**: Only non-sensitive card metadata (`last4`, `brand`, `expMonth`, `expYear`) and Stripe `PaymentMethod` tokens are saved to MySQL `passenger_cards`.
- **Manual Capture Pre-Authorization**: Funds are held using `capture_method: 'manual'` for up to 7 days and can be captured or released with $0 fee via the Admin Panel.

---

## 📞 Support & Contact

- **Phone**: (617) 784-0264
- **Dispatch Email**: [info@bostonluxurychauffeur.com](mailto:info@bostonluxurychauffeur.com)
- **Website**: [https://gmlimoservices.com](https://gmlimoservices.com)
