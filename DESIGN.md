Read this before building or changing any screen. If a choice isn’t covered here, ask me instead of guessing.

1. The feeling, in labels

The labels, type scale, added screens, metric definitions and UI copy.

Common
1. Navigation: Use the supplied FUXI logo (network-infinity symbol above the FUXI wordmark, cyan-to-violet gradient and white lettering) on a transparent background at the extreme left and “Contact us” on the extreme right, with no content in the middle. Use `public/images/fuxi-logo.png`; display it at 120 × 80px on desktop and 96 × 64px on phones, preserving its proportions. The logo returns to Home. “Contact us” opens `mailto:getfuxi@fuxi.in`.

Landing page
1. The load - A large, dense circular particle network on the dark background, with 900 particles on desktop and 480 on phone-width screens. Individual particles wander smoothly in random directions inside the outer circle, bouncing inward at its boundary rather than rotating as one ring. When a mouse pointer hovers inside the circle, nearby particles gently move away and then settle back into random motion; no particle escapes the boundary. Thin connections join nearby particles. The circle expands and spreads out on scroll and remains available throughout the page. Keep the headline and fields readable. Respect reduced-motion settings with a static particle field and no hover movement. The canvas must not block typing, buttons or links; touch scrolling remains normal. Limit drawing to 30 frames per second and pause drawing while the page is hidden.
2. Headline - Key headline and sub text with a CTA “Get Started” below, this is clearly visible on the first view of the mobile screen
3. CTA Button - The button is clear contrasting colour to ensure it is clearly visible with a clear action verb and is linked to a input field to enter the brand’s website domain
4. Domain Name - One shared transparent glassy field containing the website-domain text input on the left and the “Get Started” button on the right, with the placeholder “add your website URL”. Do not show a separate domain label; use the accessible field name “Website URL”. Keep the input and button together on phone-width screens.
    1. Prompt Entry - On clicking the CTA, a screen takeover to show option enter single prompt or a max of 20 prompts in one go with a CTA “Check Results”

Results page
1. Citations - The logo of all the brand cited in the prompts with the number of citation and share of voice % below the logo. It would look like a compact box placed one beside each other. If the brand of the user is present, shade it in a shade darker to highlight and a small tag “You”
2. Most cited domains - domain names listed in sequence of count of mentions
3. Table - Format the table based on the colour palette, CTA “write draft” to write content as a separate column


2. References, one per component

Reference scope: the live page’s rendered content and accessible form structure were inspected on 8 October 2026. Only the initial empty, disabled state was verified. Spacing, responsive behaviour and later states were not visually verified.

Diagnostic entry: Batch brand baseline

Take: a direct heading and explanation followed immediately by a sequential form. Keep only the approved FUXI/Contact us navigation; do not add promotional sections.

For the first view design - refer to the following websites:

1. https://resollm.ai (Preferred for content)
2. https://www.tryprofound.com/features/prompt-volumes (preferred design)

Ignore: the NBFC-only audience, lender-only language and existing colour/font choices. The new product serves BFSI brands and uses section 3.

Domain and prompt inputs: Baseline form

Take: a website-domain input with the accessible name “Website URL” and placeholder “add your website URL”, followed by a visibly labelled multiline prompt field, one question per line, with visible helper text. The domain has no visible label; keep the prompt label outside its field.

Ignore: the specific example company, borrower examples and current input limits as product requirements. The approved limit is one question in Single Question mode or up to 20 in Multiple Question mode; keep existing 10–600-character question validation.

Run action and scope note: Run batch component

Take: “Get Started” inside the domain field on Home, followed by “Check Results” beneath the question inputs in the takeover. Disable actions until their required inputs are valid. Place the sampling note at the bottom as specified in section 5.

Ignore: the current disabled-button styling and hard-coded model name. Show the actual selected engine/model and supported runtime behaviour.

No separate visual reference has been approved for analytical screens. Their proposed structures appear in section 4; do not invent extra styling references or treat them as observed features of this page.

3. Type and colour

Theme: Dark throughout Home, the question takeover, Results, saved results and the draft view. Use slate obsidian (#0B132B) as the canvas, dark surfaces for fields, cards and tables, ice/white reading text, indigo for standard actions and mint with obsidian text for “Get Started”. The user’s brand box remains darker than other brand boxes. Keep verification highlights readable on dark surfaces. This dark-theme requirement supersedes the default light-surface examples below.

Font: Inter & Plus Jakarta Sans, with system sans-serif fallback. Use regular 400 for reading, medium 500 for controls and semibold 600 for headings. Keep numeric columns right-aligned and use tabular numerals.

Sizes:

- 32px / 40px line height: page heading and first-screen headline.
- 24px / 32px: section headings and primary metric values.
- 16px / 24px: body copy, form inputs and explanations.
- 14px / 20px: labels, table content, helpers and evidence metadata. Keep caveats at this readable scale except for the explicitly approved smaller sampling note in section 5.

# Visual Design System & Design Tokens

## 1. Brand Identity & Sentiment

The visual design language balances **uncompromising trust and enterprise stability** with **high-velocity innovation**. All digital assets, marketing surfaces, and application user interfaces must strictly adhere to these tokens, component rules, and accessibility constraints.

---

## 2. Core Palette & Design Tokens

| Role | Token Name | Hex Code | HSL / RGB | Purpose / Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation / Trust** | `--color-slate-obsidian` | `#0B132B` | `hsl(225, 59%, 11%)` | Primary headings, dark card surfaces, deep navigation, high-contrast borders. |
| **Primary Brand** | `--color-brand-indigo` | `#3A57E8` | `hsl(230, 80%, 57%)` | Core brand identity, active tabs, standard buttons, links, primary UI structure. |
| **Vibrant Accent (CTA)** | `--color-accent-mint` | `#00F5D4` | `hsl(172, 100%, 48%)` | High-conversion actions ("Start Trial", "Upgrade"), status highlights, key telemetry spikes. |
| **Secondary Support** | `--color-violet-neo` | `#7928CA` | `hsl(270, 67%, 47%)` | Secondary data points, gradient stops, badge indicators, feature cards. |
| **Canvas / Surface** | `--color-surface-ice` | `#F8FAFC` | `hsl(210, 40%, 98%)` | Primary light canvas, card background fills, low-contrast neutral fills. |

---

## 3. Gradient Specifications

Gradients bridge foundational enterprise trust with high-tech momentum. They must be applied purposefully without compromising content clarity.

| Gradient Name | CSS Token / Rule | Color Stops | Recommended Use Case |
| :--- | :--- | :--- | :--- |
| **Brand Linear** | `--gradient-brand` | `135deg`: `#3A57E8` (0%) → `#7928CA` (60%) → `#00F5D4` (100%) | Hero headline text masks, high-impact cards, decorative borders. |
| **Ambient Mesh (Dark)** | `--gradient-mesh-dark` | Radial spots: `#00F5D4` (15%) & `#7928CA` (22%) over `#0B132B` | Dark mode hero sections, feature showcases, executive cards. |
| **Subtle Horizon (Light)** | `--gradient-horizon-light` | `180deg`: `rgba(58, 87, 232, 0.05)` (0%) → `rgba(248, 250, 252, 0)` (100%) | Landing page headers on light backgrounds. |
| **CTA Accent Glow** | `--glow-mint` | Radial: `rgba(0, 245, 212, 0.35)` → `transparent` | Hover glows beneath primary action buttons. |

---

## 4. Composition & Distribution Rules (60-30-10)

1. **60% — Canvas & Readability:**
   * Use `--color-slate-obsidian` (`#0B132B`) as the default dark canvas and `#131E3B` for raised surfaces.
   * Use `--color-surface-ice` (`#F8FAFC`) for reading text and high-priority labels on dark surfaces; supporting text uses `#BDC8DF`.
   * Maintain generous negative space around dense layouts.

2. **30% — Structure & Authority:**
   * Use `--color-brand-indigo` (`#3A57E8`) for structural anchors: primary navbars, active states, key interactive outlines, and non-conversion buttons.
   * Keep indigo grounded against clean, neutral backgrounds to avoid visual fatigue.

3. **10% — Conversion & Glow (Accent Discipline):**
   * Reserve `--color-accent-mint` (`#00F5D4`) strictly for top-funnel conversion triggers, critical telemetry indicators, and subtle accent glows.
   * **Never** use `--color-accent-mint` as standard paragraph text or light-background borders.

---

## 5. Typography Guidelines (2-Font Stack)

The design system uses exclusively two open-source, commercially free fonts (SIL Open Font License):

* **Display Font (Headings & Impact):** `'Plus Jakarta Sans', sans-serif`
  * Modern geometric grotesque conveying fresh innovation and approachability.
  * Used for: Page headers, card titles, hero statements, and numerical callouts.
* **UI & Body Font (Readability & Stability):** `'Inter', sans-serif`
  * Neutral workhorse engineered for maximum legibility on digital screens and mobile interfaces.
  * Used for: Body text, tables, form inputs, navigation items, buttons, and badges.

### Usage Rules:
1. Always enable font feature settings: `"cv02", "cv03", "cv04", "cv11"` on `Inter` for optimal letterform distinction on mobile displays.
2. Maintain minimum body text size of `14px` (`0.875rem`) on desktop and `16px` (`1rem`) on mobile input elements to prevent auto-zoom triggers.

---

## 6. Tag & Badge Design Tokens

### Light Mode Specifications (Light Surfaces)

| Type | Fill / Background | Border | Label / Text | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Neutral** | `#EEF2FF` | `#C7D2FE` | `#1E40AF` | `Platform Core` |
| **AI / Innovation** | `#F3E8FF` | `#E9D5FF` | `#6B21A8` | `AI Engine Active` |
| **Active / Metric** | `#E6FDF9` | `#A7F3D0` | `#065F46` | `Live Telemetry` |
| **System Status** | `#ECFDF5` | `#A7F3D0` | `#065F46` | `Operational` |

### Dark Mode Specifications (Deep Obsidian / Dark Surfaces)

| Type | Fill / Background | Border | Label / Text | Example Value |
| :--- | :--- | :--- | :--- | :--- |
| **Vibrant AI** | `#120E21` *(or rgba(121, 40, 202, 0.20))* | `#C084FC` *(30–50% opacity)* | `#C084FC` | `AI Model: GPT-4o` |
| **Electric Mint** | `#081E20` *(or rgba(0, 245, 212, 0.12))* | `#00F5D4` *(35–40% opacity)* | `#00F5D4` | `99.98% Latency` |
| **Enterprise Indigo** | `#0A1633` *(or rgba(58, 87, 232, 0.20))* | `#818CF8` *(40–50% opacity)* | `#818CF8` | `Enterprise Verified` |

### Component Dimensions & Rules
* **Border Radius:** `9999px` (Full Pill)
* **Padding:** `3px 10px` (Desktop) / `2px 8px` (Mobile)
* **Typography:** `Inter`, `12px` (`0.75rem`), `font-weight: 500` or `600`, letter-spacing: `0.02em`
* **Icons / Indicator Dots:** `12px` optical size, `gap: 6px` inline spacing

---

## 7. Code Implementation Snippets

### CSS Custom Properties (`tokens.css`)

```css
:root {
  /* Brand Primitives */
  --color-slate-obsidian: #0b132b;
  --color-brand-indigo: #3a57e8;
  --color-violet-neo: #7928ca;
  --color-accent-mint: #00f5d4;
  --color-surface-ice: #f8fafc;

  /* Typography Families */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Semantic UI Tokens */
  color-scheme: dark;
  --bg-app: var(--color-slate-obsidian);
  --bg-surface: #131e3b;
  --bg-surface-inverse: #070d20;

  --text-primary: var(--color-surface-ice);
  --text-secondary: #bdc8df;
  --text-inverse: #ffffff;
  --text-cta: var(--color-slate-obsidian);

  --border-subtle: #334263;
  --border-focus: var(--color-brand-indigo);

  --btn-primary-bg: var(--color-brand-indigo);
  --btn-primary-text: #ffffff;
  --btn-cta-bg: var(--color-accent-mint);
  --btn-cta-text: var(--color-slate-obsidian);

  /* Gradients */
  --gradient-brand: linear-gradient(
    135deg,
    var(--color-brand-indigo) 0%,
    var(--color-violet-neo) 60%,
    var(--color-accent-mint) 100%
  );
  --gradient-mesh-dark: radial-gradient(
      circle at 85% 15%,
      rgba(0, 245, 212, 0.15),
      transparent 45%
    ),
    radial-gradient(
      circle at 20% 85%,
      rgba(121, 40, 202, 0.22),
      transparent 50%
    ),
    var(--color-slate-obsidian);
  --gradient-horizon-light: linear-gradient(
    180deg,
    rgba(58, 87, 232, 0.05) 0%,
    rgba(248, 250, 252, 0) 100%
  );
}
```

### Tailwind CSS Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#0B132B',
          indigo: '#3A57E8',
          violet: '#7928CA',
          mint: '#00F5D4',
          ice: '#F8FAFC',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3A57E8 0%, #7928CA 60%, #00F5D4 100%)',
        'horizon-light': 'linear-gradient(180deg, rgba(58, 87, 232, 0.05) 0%, rgba(248, 250, 252, 0) 100%)',
      },
    },
  },
  plugins: [],
};
```

---

## 8. Accessibility & Contrast Constraints

* **CTA Button Legibility:** When using `--color-accent-mint` (`#00F5D4`) as a background fill on buttons or badges, the text label **MUST** be `--color-slate-obsidian` (`#0B132B`). Never render white text on mint backgrounds.
* **Gradient Rules:** Mesh gradients and linear brand blends are strictly decorative backgrounds or limited to display heading text masks. Never position body text across multi-hue gradient shifts.
* **Focus States:** High-visibility keyboard focus outlines must use `--color-brand-indigo` with a minimum `2px` offset.

4. Screens
Flow: Get Started” → Fill Domain name → Select Single Question or multiple Question → Enter Prompt → Check Results

[Home Page]
For: [This is the first screen the user sees when clicking on the domain]
Top to bottom: [FUXI/Contact us navigation, circular particle hero with the approved headline and subhead, combined website input and “Get Started”, sampling note at the bottom of the screen]
Main action: [Get Started] → [Gives an option to select the prompt approach and then to the results page on clicking the next CTA “Check Results”
- Empty: show only the placeholder “add your website URL”; no separate website-domain helper text.
- Loading: “Starting…”
- Error: “We couldn’t start this. Your inputs are still here. Try again.” Field errors: “Enter a valid website domain.” 
- Select “Single Question” or “Multiple Question”
- Empty: “Add at least one prompt”

Flow: Write Draft → Draft Ready → Download

[Results Page]
For: [This is the page where the results is displayed
Top to bottom: [Competition benchmarking of citations, table, details of prompt, previously saved drafts]
Main action: [Write Draft] → [Gives a detailed written draft with an option to download in multiple options]
- Loading: "Preserving your changes… almost there."
- Error: "The save hit a temporary snag, but your work didn't go anywhere. Let’s try that one more time."
- Done: “Draft plan saved.”
- Draft review: highlight every [VERIFY] and [VERIFY: …] tag in the article and verification notes. Let the user replace each tag in place, including tags inside headings and formatted text.
- Download: keep the button disabled until all verification tags in both the article and notes are cleared. Download the reviewed article text.
- Done status: show “Draft plan saved.” only after saved persistence is confirmed.

5. The first screen’s words

Proposed replacement copy for the reference’s diagnostic form:

Headline: When Buyers Ask AI About Finance, Are You in the Answer?
Subhead: Benchmark your financial brand on ChatGPT. See who gets recommended, map the sources shaping the response, and publish content built to be cited.

Domain field: no visible label. Accessible name: “Website URL”. Placeholder: “add your website URL”.

Field label: “Buyer questions, one per line”

Helper: “Use questions relevant to your products, audience and market.”

Counter: “{count} prompts added.”

Button: “Check Results”

What happens: Starts a sampled test using the confirmed settings and opens results screen.

Scope note: “This baseline uses sampled AI answers. It does not reveal private user queries or an AI system’s hidden retrieval sources. Brand mentions are not endorsements.”

Placement: put the scope note at the bottom of the screen, after the main content. On desktop and laptop screens (1024px and wider), keep it on one line using 10–12px text with 18px line height. On phones and smaller screens, use 12px text and allow natural wrapping. This is the approved exception to the general caveat type scale. Never add horizontal scrolling or clip the wording. On short screens or long results, let it follow the content through normal scrolling; never cover inputs, buttons or results.

Keep the form visible at first arrival. Do not add invented customer logos, testimonials, performance claims or a separate marketing hero.

6. Principles

- Define every measurement. Appearance rate: completed eligible answers naming the brand ÷ completed eligible answers. Share of voice: a brand’s answer-level appearances ÷ all tracked brands’ answer-level appearances. Count each tracked brand at most once per answer. Display the tracked set, numerator and denominator.
- Keep the sample attached. Carry prompt set, audience, market, language, engine/model, test time and completion count through every view. Separate missing, failed, unavailable and zero. Compare repeated runs only when their scope is compatible and explain any change.
- Make evidence inspectable. Link summaries to prompts, returned answers and visible citation URLs. A citation does not prove influence, endorsement, training-data inclusion or access to hidden retrieval. Source frequency is descriptive of this sample.
- Require human review. PR, SEO, content and publisher plans are hypotheses with evidence and assumptions. Do not promise inclusion, ranking, causal impact, revenue lift or ROI. Require human review of financial claims, suitability language and regulated content before publication.
- Preserve work and explain recovery. Retain inputs, filters and completed answers through loading and failure. Use stable layouts, textual statuses and specific recovery actions. Only show “saved” after persistence is confirmed.
- Keep interaction accessible. Use visible labels except for the approved Home domain field, which has the accessible name “Website URL”. Keep keyboard access, visible focus and adequate targets. Never encode a result only by colour. Pair charts with readable values; announce validation and run-status changes without moving focus unexpectedly.
- Respect narrower screens. Preserve the domain → prompts → run sequence. Stack summaries; keep table labels and evidence links usable. Use horizontal scrolling for genuinely comparative tables rather than hiding important columns. 


7. Boundaries for these visual changes

- Preserve the existing draft-generation logic, DRAFT_STYLE.md, citation answers and links, Mixpanel events, daily cap, saved runs and gpt-6.1-sol model.
- Keep the approved Home → question takeover → Results → draft flow. Do not introduce additional screens, actions or features.
- Keep the combined website field usable on phones. Do not add a visible “Your brand’s website domain” label or an “Add your website domain.” helper beneath it. Preserve the invalid-domain error.
- The sampling note must never create horizontal scrolling; comparative results tables retain their existing independent scrolling on narrow screens.
- These changes are saved locally. Deployment remains the user’s action via `npm run deploy`.
