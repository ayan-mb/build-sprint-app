# PRODUCT.md - FUXI

## Current website experience — updated 14 October 2026

This section records the current implemented experience, including changes checked locally on 14 October 2026. Today’s changes have not been published. The product vision and future capabilities below remain separate from the implemented features.

### Entry points and navigation

The public homepage is https://frugal-moose-32.convex.site/. Old /try links switch to the main address before the app starts, and Home links return to /. The admin page remains at https://frugal-moose-32.convex.site/admin with its existing sign-in. Moving the public address does not change admin access.

Navigation sits inside a rounded rectangular glass box. The FUXI logo is 20% smaller, carries a small “Alpha” tag close beside it, and returns to Home. “Contact us” appears as a transparent, rounded frosted-glass button and opens an email to getfuxi@fuxi.in.

### Approved homepage words

Headline: Win BFSI Recommendations in ChatGPT with Ready-to-Publish Content.

Subhead: Benchmark brand visibility, map cited competitors, and instantly generate pre-written content engineered to earn citations.

Website placeholder: Your Website URL

Primary button: Get Started

### First interaction

Visitors enter their website into the raised, shared input-and-button box, with soft shadows creating a floating depth effect. “Get Started” uses the primary indigo colour with white text; it stays muted and disabled until a website is entered. Clicking it validates the website, fades the homepage out, and smoothly brings in the prompt screen. Reduced motion skips the transition. The prompt screen shows “Domain :”, the website’s logo when available, and the normalized entered domain. Convex reads the website’s declared icon links, including nested paths and redirected domains, before trying standard favicon or touch-icon paths. A brief loading indicator appears during discovery; if no icon can be loaded, a brand initial appears. The only input label is “Enter the prompts”. A frosted-glass input has a subtle animated edge and soft depth shadow. Visitors enter one prompt per line; one nonempty line automatically uses the single-question result flow, and multiple nonempty lines use batch results. “Check Results” has a rounded glass finish. The prompt count stays in memory; no counter, question-mode selector, buyer-question heading or model label appears on this screen. The existing limit is 20 questions per batch, with 10–600 characters per prompt. Inputs remain available when returning Home.

These refinements are checked locally; they are not published until `npm run deploy` is run.

A slow, subtle shine travels around the website box to draw attention to the primary action. It pauses and disappears while the visitor types, pauses when offscreen or the tab is hidden, and stays static when reduced motion is requested. Clicking the input adds no bright border or outline; a faint background tint and the caret show it is active.

The background particle network responds to both mouse movement and finger touches on phones and tablets. Nearby particles move away while staying inside the circle. Lifting or cancelling a touch ends that response. Scrolling, links, and typing remain usable. Reduced motion keeps the particle field static.

### Measurement

The existing public analytics follow the homepage at /, including its question and result screens. They stay off admin, batch-admin, and saved-result routes. Heatmap URLs use the main address; existing analytics event names are retained. Existing privacy filters and recording masks remain in place.

## Homepage story — updated 14 October 2026

The existing homepage headline, subheadline, website input and background particle animation are preserved. Below the introduction, three original visual sections appear in this final order:

1. **Discovery shift — “Your next customer may meet you in an AI answer.”** Mock search results face an illustrated AI answer connected to source nodes. “Search → Visit → Compare” and “Ask → Understand → Shortlist” share a baseline on desktop. The example is labelled as an illustrative journey, not live results. Supporting copy explains that FUXI shows brands and sources cited in sampled ChatGPT answers.
2. **Traffic outlook — “AI discovery is growing. Start with your own baseline.”** A vertical chart shows the historical study figures, alongside a separate 2025-to-2028 forecast timeline. Source links and the scope of each claim remain visible.
3. **Visibility foundations — “Give AI a clearer picture of your brand.”** The original static stacked glass format is restored, with Decision Layer at the top, Entity and Trust in the middle, and Machine Foundation as the supporting base. All descriptions and attribute chips are visible together. The top two layers have stronger indigo surfaces and contrasting lavender “FUXI helps here” badges with dark text. The line below states: “FUXI helps with Decision Layer & Entity and Trust.” FUXI supports useful buyer-focused drafts and content grounded in product facts and cited evidence; this does not promise AI recommendations or a technical website audit.

[Previsible research, published August 2025](https://searchengineland.com/ai-traffic-up-seo-rewritten-459954) reports AI-referred sessions across 19 website analytics properties: January–May 2024 had 17,076 sessions and January–May 2025 had 107,100 (+527%). This historical sample is not expected growth for a visitor’s website. [Semrush’s 2025 study](https://www.semrush.com/blog/ai-search-seo-traffic-study/) forecasts a possible crossover by early 2028 for digital marketing and SEO topics, including Google’s AI search experiences; it is neither a measured outcome nor a financial-services prediction.

The closing “Check my brand visibility” button scrolls to and focuses the existing website input. Visitors use the same website → prompts → results flow, with no second form or extra screen.

### Validation and publication

Desktop and phone layouts were checked in the browser, including the restored foundation bands, badge contrast and tighter Alpha-tag spacing. The journey-caption alignment and closing-button focus were verified. Tata Capital’s nested website icon was confirmed to load on screen 2. The build passes, and all 78 existing tests passed after the foundation restoration. The later badge and Alpha-spacing changes also passed the build. Changes are saved locally; publication requires `npm run deploy`.

## 1. The job
When [I am finalising my content strategy], I want to [know how many times LLMs are mentioning my brand. And for which prompts], so I can [draft the content which is driving LLM mentions and leading to traffic to my website].

Who, by situation (not age or city): [SEO Team in small/medium sized NBFCs who are responsible for Organic Leads]
Today they hire: [agencies who use google search console to estimate the keywords which are driving long tail and business traffic volumes and draft content accordingly]

(Advanced, optional) What needs doing: [ ]
(Advanced, optional) How they want to feel: [ ]
(Advanced, optional) How they want to look to others: [ Would like to be seen as sharp shooters who run targeted campaigns/content and spends prudently in areas which helps to drive and support the business]

(B2B only) The bench: end user [SEO team], decision maker [Marketing Head / CMO], who pays [Marketing Head /CMO]
The one we serve first: [ SEO Team]

## 2. The switch
What they'd fire: [Reduce retainer of the SEO agency for content development]

Push (what's wrong with today): [No visibility on how and who are mentioned in the AI search results and content is developed based on derived data and hence may target incorrect prompts which may not be relevant to the business]
Pull (what your product promises): [Reduction in content development spend and growth in LLM mentions]
Anxiety (what worries them about switching): Complexity of integration, cost involved and how quickly the ROI can be visible. A clear line of sight on the decisions made by the platform and low quality content generation ]
Habit (what keeps them where they are): [Inernia to experiment with new, comfort of working with agency, the agency is a way for the individual if decisions are identified as incorrect as a lot is based on hunches and limited data]

The one worry onboarding must remove: [Easy hassle free integration which does not require complex tech involvement or a long time to see value realisation]
How I know (what they did, not what they said): [Manually search on chatGPT and other LLMs to see what is the response and mentions, Run the demo of Adobe’s LLMO tool to see what prompts are driving the brand mentions]

## 3. The core flow
The story: [The SEO team wants to draft content for the prompts that are driving mentions for their brand and target the ones where they are not getting mentioned]

1. [The user realizes they are losing high intent traffic.]
2. [The SEO Manager logs in and checks the Share of Voice (SOV) Dashboard. They see that for the query "best personal loans for CIBIL under 700", Perplexity, Gemini and ChatGPT are recommending Bajaj Finserv and Tata Capital, completely ignoring their NBFC.
3. The user clicks into the specific query. The tool reveals exactly which source links the AI models are citing to justify recommending the competitors (e.g., a specific competitor blog post or a financial aggregator site).
4. The tool automatically compares the competitor's source content against the user's existing website. It highlights the exact semantic gaps: "Competitor X mentions 'instant approval' and 'no hidden fees', which the AI heavily indexes. Your page lacks these keyword clusters."
5. Instead of sending this data to an agency, the user clicks "Generate Response Strategy." The tool instantly drafts a new blog post. This draft is specifically engineered for AI LLMs, using the ideal header structures, bulleted lists, and required semantic terms.
6. Because this is built for NBFCs, the drafted content passes through an automated compliance filter to ensure RBI guidelines are met (e.g., standardizing APR disclaimers, avoiding absolute guarantees)
7. The SEO manager reviews the first draft, makes minor brand-voice tweaks, and exports it directly to their CMS (or sends it to the legal/marketing head for final sign-off). What used to take 3 weeks just happened in ~30 minutes


Things they do today: 2-3 weeks · Things they do with my product: minutes

What can go wrong:
Step [n]: [Brand has no mentions across all AI tools] -> what must happen: [The dashboard must default to an "Industry Baseline" view showing competitor SOV for target keywords ]
Step [n]: [the AI engine generates response without any references ] -> what must happen: [The tool must fallback to analyzing Perplexity (which always cites) for that specific query, and display a "Citation Not Available" warning for the ChatGPT result rather than guessing or breaking the flow ]
Step [n]: [The content generator hallucinates a financial product feature (e.g., invents a "0% interest rate") to satisfy the AI gap, or produces generic SEO spam] -> what must happen: [The generation engine must be strictly grounded to the user's uploaded product fact sheets. It must not generate numbers or terms outside that approved dataset, and must prompt the user to input missing facts if required by the gap analysis.]
Step [n]: [The compliance filter is too aggressive and flags every standard marketing phrase, stalling the entire workflow.] -> what must happen: [Flags must be tiered (e.g., Red: "Violates RBI rate guidelines - Blocks Export", Yellow: "Aggressive claim - Review recommended"). Users must have the ability to override and dismiss yellow flags with a logged timestamp.]
Step [n]: [The formatting (H2s, H3s, bulleted lists) is lost when exporting to the user's CMS, destroying the specific structural layout required for LLM retrieval] -> what must happen: [Provide a raw HTML and Markdown "Copy to Clipboard" fallback option that locks in the exact structural tags]

Next story (only once this one works end to end): [ ]

## 4. Onboarding
First value (the moment it first does the job for them): A side-by-side view showing a competitor capturing an AI mention for a high-intent query, immediately followed by a ready-to-deploy, compliance-checked content draft designed to steal that mention back.
The worry it removes (from section 2): ["I am flying blind on AI search and losing high-value loan pipeline to competitors because my agency takes weeks to react."
]

From opening the link to the first value:
1. [Drops in their website URL and top 3 highest converting search queries (e.g., "instant personal loan no salary slip")] removes: [The worry that setup requires complex API integrations or a lengthy IT approval process.]
2. [ The system runs a live query across LLMs, instantly revealing which competitor is currently winning those prompts and the exact links cited] removes: [ The worry that this is just another static, backward-looking analytics dashboard.]
3. [the first value] The tool generates the counter-strategy: a ready-to-review page draft structurally optimized for LLM retrieval to win back that specific query.

Login: [not in v1 / after step [2], but before they can view the full content draft. The pain of seeing a competitor win their traffic creates the urgency to create an account to get the solution.]
What we don't ask on day one: [Direct API connections to their CMS, exhaustive brand tone guidelines, legal team email invites, or full historical search console data.]
What we ask later, and when: "Connect your CMS for 1-click deployment" after they successfully export their first three content drafts manually.

The Post-Login Setup (Automated as much as possible) and ask later as optional configurations:
1. Brand Context: User defines brand name format, required disclaimers (e.g., standard NBFC APR wording), and blocked words.
2. Knowledge Ingestion: System automatically crawls the provided website URL for existing product pages, PDFs, and rate cards to ground the generation engine.
3. Competitor Mapping: The tool auto-identifies direct competitors based on the LLM results, allowing the user to confirm or edit the list.
4. Prompt Import: User uploads a CSV dump of high-volume keywords from SEMRush/Ahrefs to seed the tracking engine.

## 5. v1
Does (one person finishes the one job): [ Tracks a focused batch (e.g., 20) of high intent, bottom of funnel prompts across Perplexity and ChatGPT, maps the competitor citations, and generates a structurally optimised draft grounded purely in the user's crawled product data. A single marketing or SEO manager can run the diagnostic, spot the leak in their digital pipeline, and export a ready to publish draft in one session.]
Doesn't (parked, not forgotten): [Direct API integrations with enterprise CMS platforms (like Adobe Experience Manager or Sitecore). Multi tier legal and RBI compliance approval routing within the app itself. Automated API synchronisation with SEMRush/Ahrefs (relying on manual CSV imports for v1), inclusion of Google Gemini and Claude, during download exact JSON-LD schema markup and internal linking rules to be available, a downloadable "Authority & Indexing Protocol" checklist ]
Nice to have, only after the must-haves work: [ Historical Share of Voice (SOV) trend lines showing week over week mention growth to justify the software cost. One click PDF export of the gap analysis specifically formatted for executive pipeline reporting. Granular tone of voice adjustments (e.g., dialing up urgency for personal loans vs. maintaining a conservative tone for secured lending)]
How I'll know it worked (what they do again, not what they say): [ They return the following week to upload a new batch of search queries. More importantly, they consistently click the "Copy to Clipboard" or "Export HTML" button on the generated drafts proving the content quality are trusted enough to actually deploy]

## 6. The riskiest guess
If this is false, the product is pointless: [ actively publishing the content suggested by the platform drives increase in the share of voice of the brand and hence leading to higher mentions and brand search volume. If LLMs stubbornly prioritise massive aggregator/large NBFC and other sites (like BankBazaar, BajajFinserve or PolicyBazaar) purely on historical domain authority ignoring your perfectly formatted semantic content the tool fails to deliver the promised pipeline impact.]
Thirty-minute check, no code (run it while you build), and what happened: [Not run yet]

## 7. Milestones
I can programmatically extract the exact source citations from a single ChatGPT query using the OpenAI Responses API with web_search, compare them against my brand's URLs, and accurately identify the missing semantic terms or "extractable numbers" (like interest rates or processing fees). (The riskiest part, in its simplest form: Proving the gap analysis actually works before building the content generator).
I can ingest a single NBFC product PDF or web page and use it to strictly ground an LLM to write a structurally optimized (H2s, lists, schema ready) content draft that fills the identified gaps without hallucinating fake financial terms or violating basic RBI disclaimers.
I can run a batch list of 20 targeted prompts and generate a "Share of Voice" baseline report that shows the marketing head exactly how many citations they are losing to Bajaj Finserv, Tata Capital, or BankBazaar.
I can package the drafted content so the user can copy, paste, and deploy the asset immediately.
I can log off and log in the next day and all the 20 prompts along with the previously available data and the content drafts is available

...
Last: I can close it, reopen it, and my data is still there.