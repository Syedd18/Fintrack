# FinTrack AI — Premium Fintech Workspace Frontend

This documentation details the premium, human-centric redesign of the FinTrack AI Next.js web application frontend. The platform has been completely rebuilt to reflect design systems comparable to products built by Apple, Stripe, Ramp, and Monzo designers, removing all cyberpunk glowing borders and technical jargon.

---

## 🎨 Design System & Visual Style

### Color Theme Configuration
The UI is styled using a luxurious, comfortable, and warm palette defined in [globals.css](file:///c:/Users/acer/.gemini/antigravity-ide/scratch/fintrack-ai/frontend/src/app/globals.css):
- **Base Canvas Background**: Deep Charcoal (`#111827`)
- **Card Containers**: Warm Navy (`#1F2937`)
- **Primary Text**: Warm White (`#FCFBF8`)
- **Muted Labels**: Soft Beige (`#F8F5F1`) and Muted Sage (`#A8B5A2`)
- **Interactive Details & Highlights**: Warm Gold (`#C9A76A`)
- **Visual Alert States**:
  - Success / Safe Zone: Sage (`#4F7A5B`)
  - Warning / Watch List: Gold (`#C9964B`)
  - Danger / Over Budget: Terracotta (`#B85C4D`)

### Layout Constraints
- Adheres to a strict **12-column grid** on desktop screen sizes with generous padding and container spacing to let elements breathe.
- All glassmorphism glows, neon lines, and hacker terminal outputs have been replaced by solid slate borders (`rgba(252, 251, 248, 0.08)`) and soft cards elevations.

---

## 📂 Source Code Map

Key codebase coordinates:
- [package.json](file:///c:/Users/acer/.gemini/antigravity-ide/scratch/fintrack-ai/frontend/package.json) — Specifies library configurations. Runs React 19, Next.js 15, Recharts, and Lucide Icons.
- [tailwind.config.js](file:///c:/Users/acer/.gemini/antigravity-ide/scratch/fintrack-ai/frontend/tailwind.config.js) — Incorporates color mappings.
- [src/app/globals.css](file:///c:/Users/acer/.gemini/antigravity-ide/scratch/fintrack-ai/frontend/src/app/globals.css) — Maps design variables and styling utility classes (`.fin-card`, `.fin-input`, `.badge-gold`, `.badge-sage`).
- [src/app/page.tsx](file:///c:/Users/acer/.gemini/antigravity-ide/scratch/fintrack-ai/frontend/src/app/page.tsx) — Handles the layout viewport toggles, rendering tabs dynamically, webhook simulator posts, and API key token generation logic.

---

## 🎛️ Responsive Workspace Views

The layout adaptively transforms based on user display viewports or simulation triggers:

### 1. Desktop Mode (Sidebar Navigation)
Presents the full financial commander:
- **Sidebar Menu**: Pinned navigation featuring a warm navy theme (`#1F2937`), custom premium upgrade widgets, and clean access links.
- **Executive Command Center**:
  - Greets users with human-centric messages (e.g., *"Good Evening, Rizvi"*).
  - Highlights Net Balance, Monthly Spends, and Savings Rate in minimalist banking-card blocks.
  - **Spending Analytics Chart**: Prioritizes insights first (*"You spent most during weekends"*), followed by clean weekly bar charts in muted gold/sage.
  - **Apple Wallet Transaction Ledger**: Transaction items display merchant initial circles, merchant name, category badges, spent sums, and post-transaction balances.
  - **Financial Coach**: Chat-style conversational recommendations outlining budget safety thresholds and savings tips.
- **Transaction Pipeline Monitor**: Registers logs and relay gateway checks.
- **Device Access Center**: Manages handshake connection endpoints and secure client token checksums in plain English.

### 2. Mobile Mode (Bottom Tab Navigation)
Maintains single-thumb click targets and clean spacing:
- **Workspace (Home)**: Shows balance estimate indicators, SVG daily spend progress rings, secure vault status cards, and the Apple Wallet transaction log.
- **Planner (Ledger)**: Hosts budget indicators (Safe, Watch, Alert categories) and liquidity trends.
- **Simulator**: Forms to test SMS relayer webhook payloads.
- **Access**: Puts active key checklists and device registrations in a simple layout.

---

## 🛠️ Interactive Usables (Functional Features)

The redesigned frontend contains fully operational UI logic and client-side state hooks for interactive verification:

### 1. Viewport Simulator Override
- Located in the floating control panel at the top-right corner.
- **Responsive**: Auto-scales dynamically via Tailwind media breakpoints.
- **Desktop View**: Force-renders the complete sidebar, greeting cards, analytics chart, and detailed list grids.
- **Mobile View**: Force-renders the Apple Wallet mobile canvas, circular SVG indicators, and thumb-friendly bottom capsule navigation.

### 2. Transaction Webhook Relayer Simulator
- Accessible via the **Quick Simulator Bar** at the bottom of the Desktop view or under the **Simulator Tab** in the Mobile view.
- **Inputs**: Custom SMS Sender ID and Raw SMS Message text (contains fallback parser parsing).
- **Execution**: Triggering "Trigger" or "Post SMS Relays" instantly:
  - Parses the currency/amount using regex.
  - Generates a fresh transaction item, calculating available balance and merchant tags.
  - Inserts the new transaction into the ledger list dynamically.
  - Updates the active SMS Pipeline log stream.
  - Populates the formatted JSON Editor visualizer (`SIMULATOR_WEBHOOK.JSON`) with parsed payload outputs.
  - Updates the terminal diagnostic logs.

### 3. Client Key Tokens Generator
- Located under the **Device Access Center** (Desktop Settings) or the **Access Tab** (Mobile).
- **Inputs**: Description naming input.
- **Execution**: Clicking "Generate Token" creates a mock plain-text secret token `ft_live_...` with a COPY icon, and registers its SHA-256 hash checksum in the active credentials list.

### 4. Device Connection Node Registry
- Pinned to the **Device Registration** panel inside the Transaction Pipeline.
- Allows registration of new mobile devices (e.g., Pixel 9), adding them onto the connected devices status grid.

