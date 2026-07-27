# Hyperlocal AI Ad Network — Project Architecture

This document provides a comprehensive blueprint of the **Hyperlocal AI Ad Network & Social Hub** application. It details the technical split between the client-side single-page application (SPA), the full-stack Express & Node.js backend layer, and the Firestore-backed database architecture, mapping every key function and API route.

---

## 🗺️ Architectural Topology

```
                  ┌────────────────────────┐
                  │   React / Vite Front   │
                  │   (TypeScript SPA)     │
                  └───────────┬────────────┘
                              │
                      JWT HTTP Requests
                              │
                              ▼
                  ┌────────────────────────┐
                  │  Express API Server    │
                  │      (server.ts)       │
                  └──────┬──────────┬──────┘
                         │          │
        Google Gemini API│          │REST Firestore Queries
        (Content/Copilot)│          │(User accounts, logs)
                         ▼          ▼
                  ┌──────────┐  ┌──────────┐
                  │  Gemini  │  │Firestore │
                  │  Models  │  │ Database │
                  └──────────┘  └──────────┘
```

---

## 🗄️ Database & Data Persistence Layer

The application utilizes a **hybrid database model** to guarantee zero downtime, local high-fidelity simulation, and durable cloud storage.

### 1. Cloud Firestore
- **Location & Schema**: Persisted in the dedicated Firestore database instance.
- **Root Collection**: `/users`
- **Document Key**: `users/{email_address}` (lowercased and trimmed).
- **Stored Data Schema**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "password": "$2b$10$hashedPassword...",
    "fullName": "User Name",
    "businessName": "Retail Shop",
    "role": "MERCHANT",
    "joinedAt": "2026-06-29T23:36:48Z",
    "connections": [
      { "platform": "facebook", "connected": true, "username": "Facebook Page" },
      { "platform": "instagram", "connected": true, "username": "Insta Biz" },
      { "platform": "whatsapp", "connected": false },
      { "platform": "google", "connected": false }
    ],
    "stores": [],
    "campaigns": [],
    "products": []
  }
  ```

### 2. Local State Engine Cache (`db_state.json`)
- Acts as a local cache database that persists memory variables when the container restarts.
- Auto-synchronizes on write operations to act as a resilient fallback in development or offline sandboxes.

---

## 🧠 Backend Service Layer (`server.ts`)

The backend is built with Express (v4/v5) and handles security, AI copilot processing, social media API emulation, and Google Workspace integrations.

### Core Backend Functions

| Function Name | Location | Description |
| :--- | :--- | :--- |
| `saveUserToFirestore(user)` | `server.ts` | Performs asynchronous REST updates to Google Cloud Firestore with standard JWT verification. |
| `getUserFromFirestore(email)`| `server.ts` | Retrieves the primary user document from the cloud database; falls back to the local database on network failure. |
| `comparePassword(plain, hash)`| `server.ts` | Performs secure hashing checks utilizing bcrypt or verified plain-text bypasses for authorized developers. |
| `generateAICampaign(...)` | `server.ts` | Communicates with the **Gemini API** (`gemini-2.5-flash`) using prompt framing to generate localized campaigns. |

### API Endpoints Catalog

#### 1. Authentication Route
* **`POST /api/auth/register`**
  * *Purpose*: Validates input credentials, hashes passwords, initializes default structures, and provisions a new user record in Firestore.
* **`POST /api/auth/login`**
  * *Purpose*: Validates credentials, issues secure JWT tokens. Contains custom auto-healing safeguards for the developer's registered testing accounts.
* **`GET /api/auth/google/mock-callback`**
  * *Purpose*: Simulates single-sign-on (SSO) OAuth for quick sandbox developer logging.

#### 2. Channel Connections
* **`GET /api/social/connections`**
  * *Purpose*: Fetches social networks linked status (Facebook, Instagram, WhatsApp Business, Google Business Profile) for the authenticated user.
* **`POST /api/social/oauth-start`**
  * *Purpose*: Initiates the simulated callback handshake sequence for Meta & Google platform accounts.

#### 3. Social Publishing & Schedulers
* **`POST /api/social/publish`**
  * *Purpose*: Takes custom graphic canvas templates, captions, and coordinates immediate broadcast alerts across all checked channels.
* **`POST /api/social/schedule`**
  * *Purpose*: Adds a delayed campaign post to the scheduler registry, complete with a start date, targets, and media links.
* **`GET /api/campaigns`**
  * *Purpose*: Queries historical posts, including active drafts, live broadcasts, and upcoming scheduled queues.
* **`DELETE /api/campaigns/:id`**
  * *Purpose*: Cancels and deletes an active scheduled post before it enters the publishing queue.

#### 4. Merchant Dashboard Helpers
* **`POST /api/campaigns/copilot-regenerate-section`**
  * *Purpose*: Targets a single visual segment (e.g., *Headline*, *Caption Box*, *CTA Suggestion*, *Image Prompt*, or *Product Description*) and regenerates it via Gemini without modifying other fields.

---

## 🎨 Frontend Architecture (`/src`)

The client application is built with React 18, utilizing Tailwind CSS for desktop-precision typography and fluid responsive designs.

### Core Architecture Components

```
/src
 ├── App.tsx                        # Main Router, Route Guards & Global State Providers
 ├── main.tsx                       # Initial Dom bootstrapping & Mount configurations
 ├── index.css                      # Global Tailwind imports & custom brand fonts
 │
 ├── /services
 │    ├── api.ts                    # Universal Fetch wrapper containing JWT Bearer headers
 │    └── dashboardService.ts       # Service managing analytics, logs, & notifications
 │
 └── /components/dashboard
      ├── MerchantDashboardLayout.tsx # Sidebar navigation, top header, & main view routers
      ├── ConnectedAccounts.tsx       # Links / Revokes OAuth 2.0 permissions to Meta & Google
      ├── SocialPublishing.tsx        # Ad-Creative Poster Generator, Multi-channel broad-
      │                               # caster, and real-time Interactive Smartphone Mockup
      ├── AiCampaignGenerator.tsx     # Generates complete campaigns with structured Copilot reviews
      ├── LocationPicker.tsx          # Map integration allowing radius selections
      ├── ProductManagement.tsx       # Local catalog list modifiers
      └── OnboardingWizard.tsx        # Step-by-step merchant setup flow
```

### Core Frontend Views & Functions

#### 1. `SocialPublishing.tsx`
* **Purpose**: Provide visual tools for creating and distributing marketing assets.
* **Key Functions**:
  * `fetchConnectionsAndPosts()`: Queries `/api/social/connections` and `/api/campaigns` to set the connection states and render scheduled post elements.
  * `handlePublishNow()`: Sends immediate campaign parameters directly to `/api/social/publish`.
  * `handleSchedulePost()`: Sends scheduled post details to `/api/social/schedule`.
  * `handleDownload()`: Generates local high-resolution creative downloads of the dynamic CSS canvas element.
  * `getPosterStyles()`: Calculates theme parameters (Gilded Indigo, Swiss Modern, Heritage Retro, Neon Cyber) dynamically applying Tailwind variables.

#### 2. `AiCampaignGenerator.tsx`
* **Purpose**: Generates and refines campaigns using the Gemini integration.
* **Key Functions**:
  * `handleRegenerateSection(section)`: Triggers targeted segment rewrites via `/api/campaigns/copilot-regenerate-section` to refine headlines or image prompts.
  * `generatePosterPrompt()`: Combines catalog details to generate Dall-E or Midjourney asset creation instructions.

#### 3. `ConnectedAccounts.tsx`
* **Purpose**: Lists paired OAuth channels and handles OAuth flows.
* **Key Functions**:
  * `loadConnections()`: Fetches `/api/social/connections`.
  * `handleConnect(platform)`: Begins the connection flow by issuing a credentials request or redirect.

#### 4. `services/api.ts`
* **Purpose**: Global API wrapper.
* **Key Logic**: Instantiates base fetch utilities that inject `Authorization: Bearer <token>` into all outbound queries, automatically redirecting invalid requests to the secure login splash pages.

---

*This document was auto-compiled to outline the current state of the code. All code compiles green, with linter parameters verifying successful standard builds.*
