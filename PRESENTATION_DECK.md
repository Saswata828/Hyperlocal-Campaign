# 📍 AdPulse AI — Project Presentation Deck (PPT Structure)
**Topic:** Hyperlocal Campaign & Multi-Channel Marketing Platform for Local Retailers & SMBs  
**Presenter:** Saswata Mishra & Team  
**Live Demo:** [hyperlocal-campaign.vercel.app](https://hyperlocal-campaign.vercel.app) | **Backend API:** [hyperlocal-campaign.onrender.com](https://hyperlocal-campaign.onrender.com)  

---

## 📑 Slide-by-Slide Presentation Structure

---

### Slide 1: Title Slide
- **Title:** AdPulse AI — Hyperlocal Campaign & Multi-Channel Marketing Copilot
- **Subtitle:** Empowering Local Retailers & SMBs with AI-Generated Cultural Ads, Geofence Targeting, and Unified Social Dispatching
- **Presenter:** [Your Name / Team Members]
- **Date & Institution/Organization:** September 2026 | Department of Computer Science & Engineering
- **Visuals:** Project Logo, Badges: *React 19 | Node.js | Google Gemini 3.6 Flash | Meta Graph API*
- **Speaker Note:**
  > *"Good morning respected evaluators/mentors. Today we present AdPulse AI, an intelligent hyperlocal marketing platform engineered specifically to solve the advertising challenges faced by local brick-and-mortar retailers and small-to-medium businesses."*

---

### Slide 2: The Problem Statement
- **Headline:** Why Local Retailers Struggle in the Digital Era
- **Key Challenges:**
  1. **High Complexity & Cost of Digital Ads:** Platforms like Meta Ads Manager or Google Ads are too complex for neighborhood shopkeepers and demand high agency fees.
  2. **Lack of Hyperlocal Focus:** Generic digital ads blast users across an entire city or state, wasting ad budget on people who will never visit a physical store 15 km away.
  3. **Absence of Cultural & Linguistic Context:** Ads often lack local dialects (e.g., Odia, conversational Hindi) and festival-specific retail hooks (Durga Puja, Diwali, Raja Parba, Dhanteras).
  4. **Multi-Platform Management Overhead:** Manually posting across Facebook, Instagram, WhatsApp Business, and Google Business takes hours of daily effort.
- **Visuals:** Contrast graphic: Traditional Agency Ads (Expensive, generic, slow) vs. Hyperlocal Needs (Affordable, local radius, culturally aligned).
- **Speaker Note:**
  > *"Neighborhood retailers — from apparel stores to sweet shops — have a customer base strictly within 2 to 15 kilometers. However, modern ad platforms are built for large e-commerce brands, leading to wasted ad spend and complex dashboards that local merchants cannot navigate."*

---

### Slide 3: Our Solution — AdPulse AI
- **Headline:** An AI-First Hyperlocal Marketing Platform
- **Value Proposition:**
  - **One-Click AI Creative Generation:** Powered by Google Gemini 3.6 Flash, customized for regional festivals and local languages.
  - **Precision Geofencing (1–50 KM):** Merchants draw dynamic radius boundaries around their exact GPS storefront.
  - **Unified Multi-Channel Broadcasting:** One click schedules and publishes posts across Facebook Pages, Instagram, WhatsApp Cloud API, and Google Business.
  - **Storefront Walk-in & ROI Analytics:** Real-time metrics predicting local footfall, engagement, and reach.
- **Visuals:** Workflow icon diagram: *Merchant Store &rarr; AI Generation &rarr; GPS Geofence &rarr; Instant Social Broadcast &rarr; Local Foot-Traffic Analytics*.
- **Speaker Note:**
  > *"AdPulse AI bridges this gap by offering a streamlined copilot. A merchant sets their store location, selects their product or festival offer, and our platform automatically drafts localized multilingual creatives, sets the geofenced delivery zone, and dispatches to multiple social channels simultaneously."*

---

### Slide 4: Key Platform Features & Modules
- **Headline:** Core Functional Modules
- **1. Smart Merchant Onboarding & Auth:**
  - Secure Email/Password registration with OTP verification via Gmail SMTP.
  - Google OAuth 2.0 integration with automatic mock fallback for sandbox testing.
  - 7-step guided onboarding wizard (Business profile, store location, audience preferences).
- **2. Interactive Store & Branch Management:**
  - GPS-based multi-store management with interactive map pins and custom radius settings (1–50 KM).
  - In-place store editing and live coordinate geocoding.
- **3. Product Catalog & Inventory Tracking:**
  - Categorized product repository with real-time stock status (*In Stock*, *Low Stock*, *Out of Stock*).
- **Visuals:** Screenshots/mockups of the Onboarding Wizard and Interactive Store Map.
- **Speaker Note:**
  > *"The platform begins with an intuitive onboarding wizard that configures the merchant's business details, storefront coordinates, and target radius. Merchants can manage multiple store branches with interactive map pins."*

---

### Slide 5: AI Engine & Linguistic Localization
- **Headline:** Cultural Intelligence Powered by Google Gemini 3.6 Flash
- **AI Capabilities:**
  - **Trained on Regional Festival Retail Patterns:** Pre-calibrated prompts for Durga Puja, Diwali, Dhanteras, Eid, Christmas, and local festivals like Raja Parba.
  - **Multilingual Copywriting:** Generates high-converting marketing copy in:
    - Regional Odia (ଓଡ଼ିଆ)
    - Conversational Hindi (हिंदी)
    - Engaging English
  - **Adaptive Model Failover Pipeline:** Resilient three-tier architecture ensuring 99.9% uptime:
    `Gemini 3.6 Flash` &rarr; `Gemini 2.5 Flash` &rarr; `Gemini 2.0 Flash`
  - **AI Headline, Caption & CTA Generation:** Generates discount urgency triggers (e.g., 'Flat 20% off for 48 hours').
- **Visuals:** Side-by-side prompt output showing the same product campaign in English, Hindi, and Odia with festive styling.
- **Speaker Note:**
  > *"Our AI engine doesn't just write generic copy. It incorporates cultural nuances, festival discounts, and regional dialects like Odia and Hindi, creating genuine customer connection that drives footfall."*

---

### Slide 6: Multi-Channel Publishing & Scheduling
- **Headline:** Automated Social Media Dispatching
- **Supported Channels:**
  - **Facebook Pages:** Instant photo/text feed posting via Meta Graph API.
  - **Instagram Professional:** Visual image posts with localized hashtags and mentions.
  - **WhatsApp Business Cloud API:** Automated customer alert broadcasts.
  - **Google Business Profile:** Local promotional updates for Google Maps discovery.
- **Robust Architecture:**
  - **AES-256-CBC Encrypted Vault:** Secure local storage of access tokens and API secrets.
  - **Audit Registry & Dispatch History:** Full tracking of publication status (`SUCCESS`, `FAILED`, `PENDING`) with live external post IDs.
  - **One-Click Retry & Safe History Deletion:** Merchants can retry failed broadcasts or purge audit logs safely.
- **Visuals:** Multi-channel broadcast dashboard showing live connected accounts and publication audit table.
- **Speaker Note:**
  > *"Rather than opening separate apps, the merchant connects their channels once. Our server handles token encryption, rate limiting, error fallbacks, and publication tracking with a complete audit history."*

---

### Slide 7: Festival Analytics & Hyperlocal Trends Radar
- **Headline:** Real-Time Intelligence & Footfall Insights
- **Features:**
  - **Regional Festival Countdown Radar:** Highlights upcoming festivals with seasonal shopping propensity scores.
  - **Interactive Geolocation Footfall Radar:** Leverages browser GPS to calculate nearby shopper density and estimated walk-ins.
  - **Channel-Wise Conversion Breakdown:** Live area charts and bar charts tracking reach, engagement, clicks, and estimated ROI.
  - **Zero Fake Data:** Clean, real-time analytics reflecting actual merchant stores, campaigns, and audience interactions.
- **Visuals:** Dashboard charts showing engagement curves, festival countdown cards, and circular footfall radar.
- **Speaker Note:**
  > *"The Festival Analytics module acts as a strategic radar for the merchant, informing them weeks ahead of time when customer buying intent will surge for upcoming festivals, and calculating foot-traffic estimates."*

---

### Slide 8: System Architecture & Technology Stack
- **Headline:** End-to-End Technology Stack
- **Frontend Architecture:**
  - **React 19** + **Vite 6** + **TypeScript 5**
  - **Styling:** Custom TailwindCSS + Glassmorphic dark/light UI
  - **Animations & Icons:** Motion (`motion/react`) + Lucide React icons
  - **State Management:** Reactive Observer Pattern (`subscribeToDashboardState`)
- **Backend Architecture:**
  - **Node.js (v20+)** + **Express.js** + **TypeScript (TSX)**
  - **AI SDK:** `@google/genai` (Gemini 3.6 Flash)
  - **Security:** AES-256-CBC encryption, JWT HMAC-SHA256, CORS whitelisting
  - **Mail Delivery:** Nodemailer with Gmail SMTP SSL
  - **Persistence:** Scoped multi-tenant JSON database engine with user data isolation
- **Visuals:** High-level Architecture diagram (Frontend SPA &harr; REST API &harr; Gemini AI / Meta API / SMTP / Storage).
- **Speaker Note:**
  > *"The platform is built on modern React 19 and Vite on the frontend for sub-second rendering, paired with a resilient Express and TypeScript backend utilizing secure encryption, reactive state observers, and scoped user isolation."*

---

### Slide 9: Recent Enhancements & Engineering Highlights
- **Headline:** Key Improvements Delivered in the Latest Iteration
- **1. Clean Onboarding State:**
  - Removed dummy demo campaigns and fake stores on new user registration; fresh accounts start with a clean slate.
- **2. Precision Geolocation & All-India Mapping:**
  - Integrated OpenStreetMap Nominatim reverse geocoding and manual GPS pin drag-and-drop, fully supporting tier-1, tier-2, and tier-3 Indian towns.
- **3. In-Place Store Management Fix:**
  - Corrected branch update logic so edits update the existing store in-place without generating duplicates.
- **4. Production Cloud Deployment:**
  - Frontend continuously deployed on Vercel with automatic CI/CD.
  - Backend API deployed and running live on Render.
- **Visuals:** Before-and-after comparison table or workflow diagram of the clean registration flow.
- **Speaker Note:**
  > *"In our recent milestone, we perfected the onboarding flow, resolved all-India geocoding accuracy, eliminated dummy data clutter, and ensured all CRUD actions update seamlessly in-place across both client and server."*

---

### Slide 10: Future Roadmap & Commercial Potential
- **Headline:** Future Scope & Next Milestones
- **Planned Enhancements:**
  1. **AI Image & Poster Generation:** Integrating Gemini Imagen 3 to automatically generate branded festival posters with store logo watermarks.
  2. **Integrated Ad Spend Gateway:** Direct integration with Razorpay/Stripe to fund micro-targeted paid ads on Meta/Google directly from the wallet.
  3. **WhatsApp Conversational Chatbot:** Automatic reply bot to answer customer queries originating from social campaign posts.
  4. **Native Mobile App (React Native):** Enabling shopkeepers to snap product photos and launch campaigns on the go from their smartphone.
- **Speaker Note:**
  > *"Looking ahead, our roadmap includes automated AI promotional banner generation with Imagen 3, integrated wallet ad payments, and native mobile apps to empower shop owners right from their counters."*

---

### Slide 11: Summary & Live Demonstration
- **Headline:** Project Summary & Live Demo
- **Key Takeaways:**
  - Solves real-world retail marketing fragmentation.
  - Deep cultural grounding with multi-lingual AI.
  - Production-ready, fully deployed, secure, and responsive.
- **Live Links:**
  - **Frontend:** [https://hyperlocal-campaign.vercel.app](https://hyperlocal-campaign.vercel.app)
  - **Backend:** [https://hyperlocal-campaign.onrender.com](https://hyperlocal-campaign.onrender.com)
  - **GitHub:** [https://github.com/Saswata828/Hyperlocal-Campaign](https://github.com/Saswata828/Hyperlocal-Campaign)
- **Q&A:** Open for Questions from Mentors & Evaluators!
- **Speaker Note:**
  > *"Thank you for your time and attention. We will now demonstrate the live application running on Vercel and Render, showcasing a complete campaign creation and multi-channel dispatch flow. We are now open for questions."*
