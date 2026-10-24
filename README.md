# Quiet-finder-in-campus: A Crowdsourced Noise-Level Mapping System for VIT Chennai

> **"Find your quiet on campus."**
> Noise-mapped campus where you can find environmental noise awareness with empirical data collection methods from students. A production-grade web application helping students at Vellore Institute of Technology (VIT) Chennai discover, evaluate, and navigate to the quietest study spaces across the campus using empirical crowdsourced acoustic observations and spatial mapping.

---

## 1. System Overview & Technical Improvements over the Original Paper

Quiet Finder expands upon the functional specification set out in the research paper *"Quiet Finder: A Crowdsourced Noise-Level Mapping System for Locating Quiet Study Spaces at VIT Chennai"*.

### Significant Technical Improvements

| Original Paper Prototype | Quiet Finder Production Implementation |
| :--- | :--- |
| **Storage**: Single browser `localStorage` table with no server synchronization. | **Database & RLS**: Full Supabase PostgreSQL relational schema with Row-Level Security (RLS) policies, indexes, foreign keys, and audit logs. |
| **Map**: HTML table matrix mimicking a spatial map without genuine geographical coordinates. | **Interactive Geographic Map**: Genuine Leaflet + OpenStreetMap engine centered on VIT Chennai (`12.842946, 80.155410`) with verified building positions, interactive popups, dynamic color markers, and spatial heatmap interpolation. |
| **Acoustic Math**: Simple arithmetic averaging of decibels. | **Logarithmic Energy Aggregation**: Proper acoustic energy calculations ($L_{\text{Aeq}} = 10 \log_{10} \frac{1}{N} \sum 10^{L_i/10}$) preventing linear underestimation of louder noise sources. |
| **Subjective Estimates**: Subjective levels blended with numeric dB without distinction. | **Strict Method Separation**: Phone meter readings ($L_{\text{Aeq}}$ in dB(A)) and subjective manual estimates (*Silent, Quiet, Chatty, Loud*) are tracked and displayed independently to prevent statistical distortion. |
| **Moderation**: None. | **Moderation & Flagging System**: Community dispute flagging, outlier review queue, administrator coordinate picker, and audit logging. |
| **Authentication**: None. | **Institutional Auth**: Supabase Auth configured with `@vitstudent.ac.in` domain restriction and role-based permissions (`student` vs `admin`). |
| **Demo Data**: Hardcoded seed mixed with real readings. | **Demo Data Isolation**: Clear persistent visual warnings for the 216 paper seed records, with one-click purge and re-seed controls that preserve genuine student observations. |

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router) with TypeScript & React 19
- **Styling**: Tailwind CSS v4, Lucide Icons, WCAG AA compliant teal-to-red palette
- **Mapping**: Leaflet 1.9 & React-Leaflet with OpenStreetMap tiles & verified campus coordinates
- **Visualizations**: Recharts for 24-hour diurnal acoustic profiles
- **Forms & Validation**: React Hook Form with Zod schemas for client and server validation parity
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) migrations and seeds
- **Testing**: Vitest for unit & integration testing; end-to-end user journey test suite

---

## 3. VIT Chennai Verified Cartography & Coordinates

All mapped spots are situated on the VIT Chennai campus (Vandalur-Kelambakkam Road, Chennai, Tamil Nadu 600127):

- **Campus Centroid**: `12.842946, 80.155410` (Zoom 17)
- **Central Library Block** (Reading Hall & Discussion Area): `12.841022, 80.154029`
- **Academic Block 1 (AB1)** (Study Lounge & Corridor): `12.843677, 80.153513`
- **Food Court (Gazebo)**: `12.841576, 80.154837`
- **Hostel Common Room** (Men’s Hostel Block D): `12.843742, 80.152136`
- **Sports Complex Lobby**: `12.843585, 80.152583`
- **Garden Lawn**: `12.842350, 80.154100`
- **MG Auditorium Steps**: `12.839583, 80.155190`

*Coordinate Governance*: Any new study space suggested by students is automatically marked as **Pending Verification** and excluded from the public geographic overlay until an administrator assigns or verifies exact GPS coordinates using the interactive map click picker.

---

## 4. Eight Two-Hour Time Slots (Asia/Kolkata)

Diurnal noise variations are tracked across 8 standardized blocks:
1. `07:00–09:00` (Morning calm)
2. `09:00–11:00` (Morning lectures)
3. `11:00–13:00` (Pre-lunch rush)
4. `13:00–15:00` (Dining peak)
5. `15:00–17:00` (Afternoon study)
6. `17:00–19:00` (Evening transition)
7. `19:00–21:00` (Prime study hours)
8. `21:00–23:00` (Late night quiet)

The active slot is automatically determined using the campus local time (`Asia/Kolkata`, UTC+05:30) with one-click manual switching.

---

## 5. Acoustic Mathematics & Separation Rules

### Equivalent Continuous Sound Level ($L_{\text{Aeq}}$)
Because decibels are on a logarithmic scale, Quiet Finder aggregates readings using the acoustic energy equation:
$$\text{Avg dB} = 10 \cdot \log_{10} \left( \frac{1}{N} \sum_{i=1}^{N} 10^{L_i / 10} \right)$$

### Sample Confidence Threshold
A location requires at least **3 valid measurements** in a time block before receiving a "Sufficient Sample" badge. When fewer readings exist, it is explicitly flagged as "Limited Sample (Provisional)".

---

## 6. Application Routes

### Public & Student Routes
- `/` — Discovery dashboard with interactive campus map, summary cards, and diurnal matrix.
- `/map` — Dedicated full-screen campus noise map with category filters and spot inspector.
- `/rankings` — Quietest-to-loudest ranking for selected time slot with sorting options.
- `/spots/[id]` — Detailed space page with 24-hour diurnal noise graph, observations, and bookmarking.
- `/report` — Submit a phone sound-meter reading or manual estimate.
- `/saved` — Student's bookmarked study spots with live noise status.
- `/my-contributions` — Personal submission history with review status.
- `/profile` — Student profile, registration number, and data management.
- `/how-it-works` — Methodology, phone variation caveats, and energy formulas.
- `/login`, `/signup`, `/forgot-password` — Authentication workflows.

### Administrative Routes
- `/admin` — System overview with coverage KPIs and moderation queues.
- `/admin/spots` — Manage campus spaces with interactive map click GPS picker.
- `/admin/readings` — Reading moderation (approve, flag, exclude).
- `/admin/reports` — Review flagged community disputes.
- `/admin/settings` — Thresholds, demo data reset/purge, and CSV dataset export.

---

## 7. Local Setup & Launch Instructions

### Prerequisites
- Node.js (v18+ recommended; tested on v24)
- npm (v9+)

### Installation
```bash
# 1. Navigate to the project directory
cd quiet-finder

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create your environment file (optional for evaluation)
cp .env.example .env.local

# 4. Run automated tests
npm test

# 5. Build for production
npm run build

# 6. Start the local server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view Quiet Finder.

---

## 8. Database Migrations & Seeds

When connecting a Supabase project:
1. Apply the schema migration:
   ```bash
   supabase db push
   # or run the SQL in supabase/migrations/20261024000000_quiet_finder.sql via the Supabase SQL Editor
   ```
2. Populate the seed data:
   ```bash
   # Execute supabase/seed.sql via the Supabase SQL Editor
   ```

*Note on Local Development*: When Supabase environment variables are omitted, Quiet Finder's unified storage architecture runs seamlessly using a fully reactive client repository backed by local persistence, enabling immediate testing of all student and admin features without setup blockers.

---

## 9. Automated Testing Suite

Quiet Finder includes unit tests and end-to-end user journeys:

```bash
npm test
```

### Test Coverage Highlights:
- **Acoustic Science**: Energy-average formula ($10 \log_{10} \sum 10^{L/10}$) vs arithmetic mean.
- **Color Scales**: Clamping between 35 and 85 dB; continuous HSL transitions.
- **Time Slots**: UTC vs Asia/Kolkata timezone mapping across 24 hours.
- **Validation**: Zod schema boundary rejection for out-of-range dB.
- **Data Isolation**: Separation of numeric measurements from subjective estimates.
- **Journeys**: Complete end-to-end verification of registration, submission, moderation, favouriting, and role isolation.

---

## 10. License & Attribution

- Built for the VIT Chennai student community.
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
