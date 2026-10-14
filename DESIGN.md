Read this before building or changing any screen. If a choice isn’t covered here, ask me instead of guessing.

Published routes (updated 14 October 2026)

- Public Home: https://frugal-moose-32.convex.site/.
- Old /try links replace their browser address with / before the public app starts. All Home links use /.
- Admin remains https://frugal-moose-32.convex.site/admin, with its existing sign-in gate. /batch and /saved retain their existing roles.
- Public analytics run on /, including the question takeover and results shown there; they do not run on /admin, /batch or /saved. Heatmap URLs use /. Existing event names remain unchanged.

1. The feeling, in labels

The labels, type scale, added screens, metric definitions and UI copy.

Common
1. Navigation: Use the supplied FUXI logo (network-infinity symbol above the FUXI wordmark, cyan-to-violet gradient and white lettering) on a transparent background at the extreme left and “Contact us” on the extreme right, with no content in the middle. Use `public/images/fuxi-logo.png`; display it at 120 × 80px on desktop and 96 × 64px on phones, preserving its proportions. The logo returns to Home. “Contact us” is a transparent frosted-glass button with rounded edges, a subtle border, and a minimum 44px touch height, a 14px corner radius, and 12px background blur (including Safari support); hover and press gently strengthen its tint and border. It opens `mailto:getfuxi@fuxi.in`.

Landing page
1. The load - A large, dense circular particle network on the dark background, with 900 particles on desktop and 480 on phone-width screens. Individual particles wander smoothly in random directions inside the outer circle, bouncing inward at its boundary rather than rotating as one ring. When a mouse pointer hovers or a finger touches and moves inside the circle, nearby particles gently move away and then settle back into random motion; no particle escapes the boundary. Thin connections join nearby particles. The circle expands and spreads out on scroll and remains available throughout the page. Keep the headline and fields readable. Respect reduced-motion settings with a static particle field and no hover movement. The canvas must not block typing, buttons or links; touch scrolling remains normal. Touch release, cancellation, or loss of window focus clears the repulsion; touch listeners must not prevent scrolling. Limit drawing to 30 frames per second and pause drawing while the page is hidden.
2. Headline - Key headline and sub text with a CTA “Get Started” below, this is clearly visible on the first view of the mobile screen
3. CTA Button - “Get Started” uses the primary brand indigo (#3a57e8) with white text, including a muted indigo disabled state at 70% opacity, and is linked to the website-domain input.
4. Domain Name - One shared transparent glassy field containing the website-domain text input on the left and the “Get Started” button on the right, with the placeholder “Your Website URL”. A subtle shine moves around the field border over eight seconds, pauses while typing or when hidden/offscreen, and stays static with reduced motion. Clicking the input must not add a bright outline or border; use a faint surface tint for its active state. Do not show a separate domain label; use the accessible field name “Website URL”. Keep the input and button together on phone-width screens.
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

Take: a website-domain input with the accessible name “Website URL” and placeholder “Your Website URL”, followed by a visibly labelled multiline prompt field, one question per line, with visible helper text. The domain has no visible label; keep the prompt label outside its field.

Ignore: the specific example company, borrower examples and current input limits as product requirements. The approved limit is one question in Single Question mode or up to 20 in Multiple Question mode; keep existing 10–600-character question validation.

Run action and scope note: Run batch component

Take: “Get Started” inside the domain field on Home, followed by “Check Results” beneath the question inputs in the takeover. Disable actions until their required inputs are valid. Place the sampling note at the bottom as specified in section 5.

Use the approved muted-indigo disabled state for Home’s “Get Started”. Show the actual selected engine/model and supported runtime behaviour.

No separate visual reference has been approved for analytical screens. Their proposed structures appear in section 4; do not invent extra styling references or treat them as observed features of this page.

3. Type and colour

Theme: Dark throughout Home, the question takeover, Results, saved results and the draft view. Use slate obsidian (#0B132B) as the canvas, dark surfaces for fields, cards and tables, ice/white reading text, indigo with white text for primary actions, including “Get Started”. The user’s brand box remains darker than other brand boxes. Keep verification highlights readable on dark surfaces. This dark-theme requirement supersedes the default light-surface examples below.

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
| **Vibrant Accent (CTA)** | `--color-accent-mint` | `#00F5D4` | `hsl(172, 100%, 48%)` | Secondary visual accents and status highlights; Home’s primary action is indigo. |
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
| **CTA Accent Glow** | `--glow-mint` | Radial: `rgba(0, 245, 212, 0.35)` → `transparent` | Optional mint accent effect; not used on Home’s “Get Started”. |

---

## 4. Composition & Distribution Rules (60-30-10)

1. **60% — Canvas & Readability:**
   * Use `--color-slate-obsidian` (`#0B132B`) as the default dark canvas and `#131E3B` for raised surfaces.
   * Use `--color-surface-ice` (`#F8FAFC`) for reading text and high-priority labels on dark surfaces; supporting text uses `#BDC8DF`.
   * Maintain generous negative space around dense layouts.

2. **30% — Structure & Authority:**
   * Use `--color-brand-indigo` (`#3A57E8`) for structural anchors: primary actions (including “Get Started”), active states, and interactive outlines outside the Home domain input.
   * Keep indigo grounded against clean, neutral backgrounds to avoid visual fatigue.

3. **10% — Conversion & Glow (Accent Discipline):**
   * Reserve `--color-accent-mint` (`#00F5D4`) for secondary visual accents and status highlights. Home’s “Get Started” uses indigo, not mint.
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
  /* Legacy mint accent tokens; Home uses --btn-primary-bg/text. */
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
* **Focus States:** Keep visible keyboard focus on links and buttons. The Home website input is an explicit exception: no bright outline, focus shadow, or brighter container border on click or focus. Keep the ordinary subtle border, a faint surface tint, and the typing caret; pause and hide the moving shine while the field is active.

4. Screens
Flow: Fill website domain → “Get Started” → Enter prompts (one per line; mode inferred from count) → “Check Results”

[Home Page]
For: [This is the first screen the user sees when clicking on the domain]
Top to bottom: [FUXI/Contact us navigation, circular particle hero with the approved headline and subhead, combined website input and “Get Started”, sampling note at the bottom of the screen]
Main action: [Get Started] → [Opens the prompt screen smoothly, then opens the appropriate results on clicking “Check Results”
- Empty: show only the placeholder “Your Website URL”; no separate website-domain helper text.
- Loading: “Starting…”
- Error: “We couldn’t start this. Your inputs are still here. Try again.” Field errors: “Enter a valid website domain.” 
- Infer single or multiple result mode from nonempty prompt lines.
- Empty: “Check Results” is disabled until a valid prompt is entered.

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

Approved live homepage copy:

Headline: Win BFSI Recommendations in ChatGPT with Ready-to-Publish Content.
Subhead: Benchmark brand visibility, map cited competitors, and instantly generate pre-written content engineered to earn citations.

Domain field: no visible label. Accessible name: “Website URL”. Placeholder: “Your Website URL”.

Field label: “Enter the prompts”

Helper: “Use questions relevant to your products, audience and market.”

Counter: keep the prompt count in memory; do not show it.

Button: “Check Results”

What happens: Starts a sampled test using the confirmed settings and opens results screen.

Scope note: “This baseline uses sampled AI answers. It does not reveal private user queries or an AI system’s hidden retrieval sources. Brand mentions are not endorsements.”

Placement: put the scope note at the bottom of the screen, after the main content. On desktop and laptop screens (1024px and wider), keep it on one line using 10–12px text with 18px line height. On phones and smaller screens, use 12px text and allow natural wrapping. This is the approved exception to the general caveat type scale. Never add horizontal scrolling or clip the wording. On short screens or long results, let it follow the content through normal scrolling; never cover inputs, buttons or results.

Keep the form visible at first arrival. Do not add invented customer logos, testimonials, performance claims or a separate marketing hero.

6. Principles

- Define every measurement. Appearance rate: completed eligible answers naming the brand ÷ completed eligible answers. Share of voice: a brand’s distinct cited links across prompt responses ÷ all identified brands’ distinct cited links across those responses × 100. Deduplicate tracking variants within each answer; repeated citations in different answers count again. Brand-mention counts remain separate and count each lender at most once per answer. Display the citation denominator and keep unknown mappings explicit.
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

## Navigation and prompt refinements — 14 October 2026

- Navigation: rounded rectangular frosted surface with a subtle border; desktop margin 16px 24px, radius 20px. Mobile margin 12px 16px, radius 16px. FUXI logo dimensions are reduced 20%: 96×64px on desktop and 76.8×51.2px on mobile.
- Website entry: retain the combined field and indigo Get Started button. Raise the box 3px with layered, downward soft shadows and an inset top highlight.
- Screen transition: fade and lift Home out over 220ms, then reveal the prompt form over 460ms with a gentle upward movement and clearing blur. Reduced motion removes these effects. The prompt field receives focus on arrival.
- Prompt screen: omit the buyer-question heading and mode selector. Show “Domain :”, the site icon and normalized domain. Discover icon links from the website’s HTML through Convex, resolving relative paths against the final page URL and any declared base. Try declared icons first, then favicon.ico, favicon.png and apple-touch-icon.png. Show a loading indicator during discovery and use an initial only if all candidates fail.
- Prompt input: “Enter the prompts” label, transparent navy glass with 18px backdrop blur, 20px corners, layered depth shadows and a subtle 12-second edge shine. Keep visible keyboard focus. Reduced motion keeps the edge static.
- Supporting copy: retain product relevance guidance and limits (20 prompts, one per line, 10–600 characters each). Do not show the prompt count or ChatGPT/model label on the entry screen.
- Check Results: 24px rounded corners, translucent indigo glass, top highlight, downward shadow, visible hover and muted disabled states. Full width on mobile.
- Keep the established Inter and Plus Jakarta Sans fonts; the mechanical detector's font warnings are intentional exceptions to preserve the existing identity.
- Verified locally; deployment remains `npm run deploy`.


## Homepage story extension — 14 October 2026

This is a narrow addition below the unchanged existing hero, not a design-system rewrite or a repair of older documentation drift. It inherits the established obsidian canvas, indigo and lavender accents, ice reading text, Inter body type and Plus Jakarta Sans headings. The hero, website input and ParticleRing retain their existing appearance and behaviour. Navigation uses the rounded glass enclosure and tightly placed Alpha tag documented below. No new global tokens or `.impeccable/design.json` changes are needed.

### Layout

The story follows discovery shift → sourced outlook → visibility foundations → closing action. A centred container (maximum 1120px) begins below the hero (112px gap); major sections have generous separation (112px). Left-aligned introductions stay within 820px, with body lines limited to 70 characters. Story headings scale from 32px to 48px, with a compact line height (1.16). These are local story measurements, not replacements for the existing type and spacing rules.

On desktop, section 1 pairs mock search results with a source-connected AI answer and short captions. Anchor “Search → Visit → Compare” and “Ask → Understand → Shortlist” at the bottom of their equal-height panels, with matching padding. Section 2 pairs accurate vertical historical bars (17,076 and 107,100, with a 0/50k/100k grid) with a separately labelled 2025-to-2028 forecast timeline. Section 3 restores three static, progressively wider glass bands: Decision Layer, Entity and Trust, then Machine Foundation. Desktop side insets are 80px, 40px and 0; they reduce to 40px/20px/0 below 900px and 16px/8px/0 on phones. At 900px and below, gaps narrow and the closing action stacks. At 700px and below, journey, foundation and outlook columns stack, section gaps reduce to 80px, journey-panel padding reduces to 22px, and the closing button spans the available width. The forecast divider becomes horizontal.

### Elevation & Depth

Translucent navy panels allow the existing particle background to remain visible. Soft downward shadows and inset top highlights create the familiar glass depth. The answer panel uses background blur (14px). Journey-panel corners are gently rounded (20px), reducing to 16px on phones. Foundation bands use 20px corners (16px on phones), layered downward shadows and 16px background blur. The two FUXI-supported bands have a stronger indigo fill and top highlight. Lavender highlights support the comparison and historical figures without replacing the established primary indigo action. These treatments belong to this extension rather than new global component rules.

### Components

The comparison and foundation diagrams are original code-built graphics with less prose and more visual explanation. The foundation diagram shows all layer titles, explanations and attribute chips together; it has no tabs or selection controls. The top two layers carry textual FUXI badges, and the line beneath explicitly states FUXI helps with Decision Layer & Entity and Trust. Keep the illustrative-journey note visible and distinguish historical traffic bars from the dated forecast. Source links and scope caveats stay attached to their evidence. The closing “Check my brand visibility” button scrolls to and focuses the existing website input. The story fades with the existing departure transition; reduced motion removes its fade.

### Labels and logo tag

The “FUXI helps here” badges appear only on Decision Layer and Entity and Trust. Use an opaque lavender fill (#A5B4FC), dark navy text (#0B132B), semibold weight (600), 12px text with 20px line height, and 4px × 12px padding. Place badges at the upper right of each supported band, with enough top padding (54px) to keep them separate from the title. Both colour and wording identify FUXI’s support.

Place a small “Alpha” pill close beside the FUXI navigation logo. Use no layout gap and an 8px inward offset to compensate for transparent space inside the logo image. The tag uses a lavender-tinted fill, light lavender semibold text (11px), 18px line height, and 3px × 9px padding. Preserve the logo’s approved reduced dimensions on desktop and phone.

### Verification and publication

The final static foundation layout, contrasting support badges and tighter Alpha-tag placement were checked in the browser. Desktop journey captions share the same baseline; phone layouts preserve readable bands without horizontal overflow. The closing action and website-to-prompts flow were verified earlier today. The build passes; all 78 tests passed after restoring the static foundation layout. Subsequent badge and logo-spacing refinements also passed the build. Changes are locally checked and saved, not deployed; publication remains `npm run deploy`.

Section separation: use extremely subtle translucent lighter/darker/lighter shades on discovery, traffic outlook and foundations. Lighter surfaces use rgba(165,180,252,.025); the darker surface uses rgba(0,0,0,.085). Extend the shading 40px vertically and 16px horizontally beyond content on desktop (24px and 8px on phones), with rounded edges and no border or added shadow. Keep the particle canvas visible and unchanged.

## Numbered prompts and citation results — 14 October 2026

- Keep screen 2’s glass prompt surface. Add a fixed left number gutter (44px), with matching 26px text line height and 58px left input padding. A hidden measuring surface matches wrapped text so each serial number remains aligned with the start of its logical prompt. Scrolling keeps numbers and text together; numbers stay outside the submitted text. Keep keyboard focus visible on the whole editor. Below it, show a small return-key outline icon and “Press Enter for next line” in light grey (12px/20px).
- On screen 3, use a three-bar indigo/lavender loading animation before responses arrive; keep an accessible status and completion count. Reveal results on the first response or failure, and retain a compact loader beside the title while running. Reduced motion keeps the bars static.
- Place the evaluated-brand card first and always include it at zero. Its “Your brand” tag occupies the upper left. Reserve equal top space across cards so logos, citations, share and average-position rows align. Use a 40px logo container and 28px image, with a brand initial fallback. Values use tabular numerals and the display font; cards stack on phones.
- Labels are “Prompts”, “Your Brand Cited”, “Others Mentioned”, “Cited links”, “Source domains” and “Write Draft”, plus Status. Show errors inside Status, without a separate Error column. Preserve independent horizontal table scrolling on narrow screens. Remove the Sample/model/time summary.
- Render responses as safe structured rich text: headings, paragraphs, lists, emphasis, tables and links. Do not render untrusted raw HTML. Keep answer tables and code blocks independently scrollable. Responses are expanded by default and can be collapsed.
- Keep the citation-share formula and first-appearance average-position definition attached to the cards, including explicit unavailable values. Move the requested lender/source methodology paragraph below the main result and draft content, near the bottom of the screen. Formula and data rules are recorded in PRODUCT.md.
- Verified with desktop/phone browser views and 81 passing tests. The actual development run reached the missing-OPENAI_API_KEY failure path; populated answers and loader states were checked with a labelled fixture, not represented as live AI output. Convex development pushed cleanly. Not published.
