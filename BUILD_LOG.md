# Build log — milestone 1

Date: 4 October 2026 (India time).

## Current milestone 1 setup

Milestone 1 now uses ChatGPT only. `OPENAI_API_KEY` is now available to the production action. The first live test reported `key_missing`; after the configuration was corrected, the follow-up below returned a cited ChatGPT answer. Its value must never be printed, logged, copied, or written to any file. No command displaying environment variable values was run. The key is used only inside existing server-side Convex actions.

The earlier entries below record the previous two-provider build and its checks; they are historical, not current setup instructions. The ChatGPT-only deployment and live result are recorded at the end. Milestone 2 remains untouched.

## What works

- A focused React diagnostic screen for one borrower question and one NBFC web-page URL. No landing page, second milestone, batch prompts, share-of-voice report, content drafts, PDF ingestion, CMS export, auth flow, Gemini, Claude, or features from the v1 Doesn't list were built.
- The existing project's Convex deployments are used for backend functions, run state, and static hosting. `npm run deploy` builds and publishes the app to its `.convex.site` address.
- Both providers are invoked independently from **internal Convex actions**. The page only starts a Convex mutation, subscribes to its result, and checks key availability through a Convex action. Provider/search URLs and credentials are absent from the browser bundle. Website fetching and AI comparison also run exclusively in Convex actions.
- Perplexity's current Agent API (`fast` preset, forced web search) is wired to extract answer text, URL citation annotations, and numbered answer references mapped to actual returned source IDs. Returned but unreferenced search results are labelled **Search result only**, never counted as citations.
- ChatGPT uses OpenAI's `gpt-5-search-api` search API and extracts the structured URL citations. An answer with no citation metadata gets **Citation Not Available**, and a usable Perplexity result can still be compared. API outputs are labelled as potentially different from the consumer apps; this is not a measurement of consumer-app share of voice.
- Each source link is labelled **Your website** or **Other website** based on the supplied website hostname. Tracking parameters are ignored for deduplication. Lookalike domains do not count as the NBFC website.
- The NBFC page and up to eight unique actually cited pages are fetched. The screen shows page-reading failures and offers captured-text inspection. A live Tata Capital page was successfully read from Convex.
- Evidence-backed topic checks cover credit-score eligibility, interest/APR, processing fees, income/documents, approval/disbursal, amount/tenure, prepayment, and other fees. Findings include verbatim source passages and links. Decimal numbers such as 10.99% and 2.5% remain intact. Covered topics include a matching NBFC passage. AI comparison is wired through the Convex Agent component and discards unsupported quotations before display.
- Absence is qualified as **not found on your page**, not absent from the entire website. Shortened captures mark absence as **Needs review**. Unreadable NBFC pages produce no missing-content findings. Unreadable citation pages are skipped, with their links still visible.
- Missing keys are clearly reported in the screen's provider-status area and in each provider result. The full missing-key run completes, reads the NBFC page, and produces zero invented answers, citations or gaps.
- Runs use a private random session identifier, so one session cannot query another's result. Private/local URLs, credential-bearing URLs and unusual ports are rejected. The reader checks and pins public DNS addresses and rechecks redirect destinations. There is a 30-second per-session cooldown and a global limit of 30 diagnostics/hour. Paid actions are not automatically retried.

## Tests run and their output

### Type checking

Command: `npm run check`

```text
> build-sprint-app@1.0.0 check
> tsc --noEmit && tsc --noEmit -p convex
```

Exit code: 0. Both app and Convex checks passed.

### Evidence rules and actual screen-component rendering

Command: `npm test`

```text
> build-sprint-app@1.0.0 test
> tsx --test tests/*.test.ts

✔ ChatGPT uses actual citation metadata, deduplicates tracking URLs, and ignores answer-only links (0.65225ms)
✔ Perplexity maps numbered answer references to result IDs, not array positions (0.146666ms)
✔ Perplexity grouped references and URL annotations both preserve cited sources (0.089208ms)
✔ An uncited ChatGPT answer produces Citation Not Available without inventing links (0.067375ms)
✔ Unreferenced Perplexity results are not counted as citations (0.056ms)
✔ Empty provider text fails instead of reporting a successful answer (0.081667ms)
✔ Own-website comparison handles www and subdomains, not lookalike domains (0.041125ms)
✔ Private URLs, credential URLs, unsupported protocols and ports are rejected (0.102292ms)
✔ Page comparison flags missing fees with the actual number and keeps covered rates (0.323417ms)
✔ Unreadable NBFC pages never become missing-content findings; unreadable sources are skipped (0.2815ms)
✔ Shortened NBFC captures mark absence as uncertain (0.137709ms)
✔ Semantic findings must carry real quoted evidence and a known source URL (0.112583ms)
✔ Page reader includes product details outside main and excludes scripts and hidden content (1.916958ms)
✔ Evidence keeps decimal fees and interest rates intact (0.05225ms)
✔ The actual provider screen renders a clear missing-key message without invented answers (12.419541ms)
✔ The actual source screen shows clickable citations, own-site labels, and search-only labels (0.611875ms)
✔ The actual gap screen renders the number and evidence link and escapes source HTML (0.283583ms)
✔ Unreadable pages show the cause rather than claiming that the page was read (0.215625ms)
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 156.51375
```

Exit code: 0. Fixtures are explicitly test data, not live AI answers. Screen tests render the actual React components into HTML and check their real labels, links, messages, quotations and escaping. They do not prove browser interaction or visual layout.

### App build

Command: `npm run build`

```text
> build-sprint-app@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.2 building client environment for production...
transforming...
✓ 90 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.41 kB │ gzip:  0.30 kB
dist/assets/index-X_2exWtJ.css    5.84 kB │ gzip:  1.97 kB
dist/assets/index-DNuALbBw.js   300.85 kB │ gzip: 91.41 kB

✓ built in 72ms
```

Exit code: 0. The deployment command builds again with the production Convex URL, so its JS filename differs.

### Convex push

Command: `npx convex dev --once`

```text
▌ Developing against deployment:
▌ [Development] ayan-biswas:build-sprint-app:dev/ayan-biswas (dev)
▌ └─ https://animated-yak-855.convex.cloud
- Preparing Convex functions...
✔ 01:00:56 Convex functions ready! (4.73s)
```

Exit code: 0. The CLI also prints an informational message that optional Convex AI instruction files are not installed; that does not block the push.

### Live, full missing-key diagnostic

Commands:

```sh
npx tsx scripts/check-live-diagnostic.ts
TEST_CONVEX_URL=https://frugal-moose-32.convex.cloud npx tsx scripts/check-live-diagnostic.ts
```

Both completed with exit code 0. These exercise the real public mutation, durable Convex workflow, server-side page fetch, two provider branches, saved report and reactive query. The script refuses to run this no-key test if keys are configured, to avoid spending API credits unexpectedly. It polls the server; it is not a browser test.

Final production output, rerun after the last deployment:

```text
Provider configuration: {"openai":false,"perplexity":false}
Started single-question diagnostic: j575t02f3m1ztazd30hs0zz6jh8fkkby
{
  "status": "complete",
  "brandPage": "read",
  "capturedCharacters": 18000,
  "brandPageTitle": "Apply for Instant Personal Loan @10.99%* up | Tata Capital",
  "providers": [
    {
      "provider": "Perplexity",
      "status": "key_missing",
      "message": "Key missing: PERPLEXITY_API_KEY. Add it in the Convex dashboard → Settings → Environment Variables for this deployment."
    },
    {
      "provider": "ChatGPT",
      "status": "key_missing",
      "message": "Key missing: OPENAI_API_KEY. Add it in the Convex dashboard → Settings → Environment Variables for this deployment."
    }
  ],
  "verifiedCitations": 0,
  "gaps": 0,
  "comparisonStatus": "Semantic comparison is waiting for a readable NBFC page and at least one readable cited source.",
  "warnings": [
    "Some page text was shortened. Findings apply only to the captured text.",
    "No verified citations are available yet. No source-backed gaps can be shown."
  ]
}
PASS: another session cannot read this run.
PASS: private website URL rejected.
PASS: repeated run inside 30 seconds rejected.
PASS: full Convex no-key diagnostic completed without fabricated answers, citations, or gaps.
```

### UI code inspection

Command: `.agents/skills/impeccable/scripts/impeccable detect --json src/App.tsx src/style.css`

```text
[]
```

Exit code: 0. This is a code inspection, not a screenshot or browser check.

## What is blocked or limited

1. **Live Perplexity and ChatGPT answers, citations and AI comparison are not verified.** Both deployment environments lack `PERPLEXITY_API_KEY` and `OPENAI_API_KEY`. Requests are built up to that point and stop with a clear key-missing message. No fabricated demo answer is substituted. Only the live no-key path, fixture citation extraction and evidence rules have been proven.
2. **Browser clicks and visual layout are not verified.** Computer Use reported pending Accessibility and Screen Recording permissions. The in-app browser reported `Browser is not available: iab`. No request for permissions was sent while you were asleep. Server checks and actual component-rendering tests ran instead; they are not claimed as browser testing.
3. **Page reading has honest limits.** HTML/plain text only; no PDF or whole-site ingestion and no browser JavaScript rendering. Raw responses above 1 MB are refused. Captured text is capped at 18,000 characters per page; absence on shortened captures is uncertain. Blocked, login-only and unreadable sources cannot support gaps. Bajaj Finserv's personal-loan page returned `Page is too large to read (limit: 1 MB).`, correctly yielding status `unavailable` and no inferred gap. All citation links remain visible, but only the first eight unique cited pages are analysed.
4. **AI findings remain review suggestions.** Exact quotation checks ground the evidence; they cannot mathematically prove semantic absence or establish that publishing a suggested topic would improve citations. Competitor numeric terms must never be copied as your NBFC's product terms.
5. **GitHub is not connected in this folder.** The starting folder was not a git repository. A local `main` repository was created and the verified build is saved as a checkpoint; no GitHub remote was inferred, created or pushed. Publishing uses Convex, not git push.

## Bugs caught and fixed

- Convex's first type check rejected missing Node type settings and `saveMessages: false`, which the installed Agent library does not accept. Fixed the settings and changed it to the supported `"none"` option; checks and pushes then passed.
- The first real Tata Capital fetch captured only 238 characters because its product detail sections were outside `<main>`. Changed the reader to include visible body sections and disclosures; the live fetch then captured 18,000 characters. Added a regression test for this exact structure.
- A decimal-number test failed with `Interest rates start at 10.` instead of `10.99%`. Fixed sentence detection to preserve decimal points; the same test now passes for both 10.99% and 2.5%.
- The first `npm run deploy` failed because the hosting CLI asked for production confirmation in a non-interactive terminal. Reran the same command in an interactive terminal and confirmed the existing production deployment; deployment succeeded.


## Final production deployment and hosted-page checks

Command: `npm run deploy` (interactive terminal, existing production deployment confirmed).

Final output excerpt:

```text
✔ Deployed Convex functions to https://frugal-moose-32.convex.cloud
✓ Convex backend deployed
Uploading 3 files with deployment ID: 23c5e8f8-40bb-418f-af7f-8cd5d0f874ed
Component: staticHosting
[1/3] /index.html (storage/html)
[2/3] /assets/index-X_2exWtJ.css (storage)
[3/3] /assets/index-CRbpO1E3.js (storage)
✨ Upload complete!
Your app is now available at: https://frugal-moose-32.convex.site
✨ Deployment complete! (199.1s)
Frontend: https://frugal-moose-32.convex.site
```

Exit code: 0. This final deployment includes the decimal-evidence fix and the stricter quotation checks. No other host was used.

Command: `npx tsx scripts/check-hosted-page.ts`

Exact output:

```text
PASS: /assets/index-CRbpO1E3.js HTTP 200; 300833 characters.
PASS: /assets/index-X_2exWtJ.css HTTP 200; 5843 characters.
PASS: hosted HTML is available, both assets load, the app points to production Convex, and provider API endpoints are absent from the browser bundle.
NOT TESTED: browser clicks or visual layout.
```

Exit code: 0. The full production no-key diagnostic above was rerun after this same final deployment and passed with run ID `j575t02f3m1ztazd30hs0zz6jh8fkkby`.

The code was checked for provider key values before committing. Environment files, dependencies and build output are ignored by git. No GitHub push was made; this folder has no configured GitHub remote.

Implementation references: [OpenAI search API and URL citations](https://developers.openai.com/api/docs/guides/tools-web-search), [Perplexity's current Agent API migration](https://docs.perplexity.ai/docs/agent-api/migrate-from-sonar/overview), and [Perplexity web-search output shape](https://docs.perplexity.ai/docs/agent-api/tools/web-search). Perplexity's documentation says Sonar Chat Completions support ended on 27 September 2026; the new implementation uses the Agent API rather than building on that retired path.

## ChatGPT-only milestone 1 — production live test

Date: 04/10/2026, 13:45:42 (India time).

Deployed with `npm run deploy` to https://frugal-moose-32.convex.site.
Run ID: j573b890d5bmnsjmtd3zgjp1g98fm0jn
Question: best personal loans for CIBIL under 700
NBFC page: https://www.tatacapital.com/personal-loan.html
ChatGPT status: key_missing
Model: gpt-4.1

First 3 lines of the ChatGPT answer (blank lines preserved):

```text
Not available. Key missing: OPENAI_API_KEY. Add it in the Convex dashboard → Settings → Environment Variables for this deployment.
```

Every cited URL exactly as returned (annotation order; repetitions preserved):

```text
Citation Not Available. No cited URLs returned.
```

Counts shown by the report:
- Provider citation links: 0
- To your website: 0
- Findings to review: 0
- Cited page captures: 0

Page reading: read; 18000 characters captured (shortened).
AI comparison: Semantic comparison is waiting for a readable NBFC page and at least one readable cited source.
Warnings:
- Some page text was shortened. Findings apply only to the captured text.
- No verified citations are available yet. No source-backed gaps can be shown.

Checks: Type checking passed; all 15 tests passed; production build and deployment passed; hosted HTML and assets checked. Browser clicks and visual layout were not tested because no browser was available. Exactly one live diagnostic was started; no paid retry was made. Milestone 2 was not started.

The live test did not verify a ChatGPT answer or citations: the production action reported the key missing. No answer lines or source URLs were invented.

Deployment note: the first screen upload failed with a network error; rerunning `npm run deploy` succeeded.

Next step: confirm that the variable is named OPENAI_API_KEY in Production / frugal-moose-32, without sharing its value.

## ChatGPT-only milestone 1 — production live test

Date: 04/10/2026, 13:58:27 (India time).

Deployed with `npm run deploy` to https://frugal-moose-32.convex.site.
Run ID: j57fwsrm2fnpgab0jt0j8s0wvh8fma3f
Question: best personal loans for CIBIL under 700
NBFC page: https://www.tatacapital.com/personal-loan.html
ChatGPT status: ready
Model: gpt-4.1-2025-04-14

First 3 lines of the ChatGPT answer (blank lines preserved):

```text
Here’s a clear and concise answer for borrowers in India seeking personal loans with CIBIL scores under 700:

---
```

Every cited URL exactly as returned (annotation order; repetitions preserved):

```text
https://loanbuddyonline.github.io/blog/low-cibil-personal-loan.html?utm_source=openai
https://www.onepaisa.in/articles/personal-loan-low-cibil-score-india-2026?utm_source=openai
https://www.onepaisa.in/articles/personal-loan-low-cibil-score-india-2026?utm_source=openai
https://loansgoteasy.com/blog/personal-loan-low-cibil-score?utm_source=openai
https://www.onepaisa.in/articles/personal-loan-low-cibil-score-india-2026?utm_source=openai
https://www.onepaisa.in/articles/personal-loan-low-cibil-score-india-2026?utm_source=openai
https://fundrupee.com/personal-loan?utm_source=openai
https://fundrupee.com/personal-loan?utm_source=openai
https://loanbuddyonline.github.io/blog/low-cibil-personal-loan.html?utm_source=openai
https://bankcreds.com/personal-loan/low-cibil-score/below-700/?utm_source=openai
https://loanbuddyonline.github.io/blog/low-cibil-personal-loan.html?utm_source=openai
https://loanbuddyonline.github.io/blog/low-cibil-personal-loan.html?utm_source=openai
https://loansgoteasy.com/blog/personal-loan-low-cibil-score?utm_source=openai
https://bankcreds.com/personal-loan/low-cibil-score/below-700/?utm_source=openai
```

Counts shown by the report:
- Provider citation links: 5
- To your website: 0
- Findings to review: 0
- Cited page captures: 5

Page reading: read; 18000 characters captured (shortened).
AI comparison: Semantic comparison could not complete. The simpler evidence-backed topic checks remain available. Check OpenAI model access, billing, and request limits.
Warnings:
- Some page text was shortened. Findings apply only to the captured text.

Checks: Type checking passed; all 15 tests passed; production build and deployment passed; hosted HTML and assets checked. Browser clicks and visual layout were not tested because no browser was available. Exactly one live diagnostic was started in this follow-up; no paid retry was made. Milestone 2 was not started.

The cited answer was verified, but AI page comparison was not: it returned the failure message above. Zero findings does not prove there are no gaps, especially with shortened page text.

Next step: investigate why AI page comparison could not complete.

## AI page comparison failure — cause and verified fix

Date: 04/10/2026, 14:26:13 (India time).

The Agent library requires a userId or threadId even for a one-off comparison. The original call supplied neither and threw “Specify userId or threadId” before any OpenAI request. A local test reproduced that exact failure in the actual installed Agent library. The safe production diagnostic identified stage=generate; it had no HTTP status because the call stopped before the provider request.

Fixed by giving every comparison a fresh random identifier, with conversation storage disabled. No saved history is fetched or written. Exact-quotation checks, page limits, topic checks, and honest unavailable messages remain in place. Future failures expose only allow-listed categories and HTTP status, never raw errors, headers, response bodies, or credentials.

Deployed with npm run deploy to https://frugal-moose-32.convex.site.
Live verification reused the original captured pages from run j57fwsrm2fnpgab0jt0j8s0wvh8fma3f; no new search answer or citations were requested. An authenticated internal function reran only the comparison. The original report remains unchanged as a record of the earlier failure.

Exact comparison result:

```text
Semantic comparison checked 0 findings against fetched quotations. Unsupported quotations were discarded. These are review suggestions, not proof of why an AI cited a page.
```

Comparison counts: 0 quotation-checked findings; 0 covered; 0 missing; 0 needs review. These are comparison-only counts, not a new full report. The AI returned suggestions, but all were discarded because they did not pass the existing quotation checks. This is not proof that the page has no gaps.

Validation: type checking passed; all 18 tests passed, including actual Agent preparation and safe error reporting. Production deployment passed. Browser clicks and layout were not tested. No automatic paid retry was made. Milestone 2 was not started.

Next step: refresh the live app and run a fresh diagnostic to see the fixed comparison in your report.

## Milestone 2 — fact-sheet draft live test

Date: 04/10/2026, 16:36:17 (India time).
Live app: https://frugal-moose-32.convex.site
Question: best personal loans for CIBIL under 700
Fact-sheet source: https://www.tatacapital.com/personal-loan.html
Model: gpt-4.1

The fact sheet was the saved 18000-character Tata Capital page capture from report j57fwsrm2fnpgab0jt0j8s0wvh8fma3f. Sentence boundaries were changed to line breaks for line references; no words or numbers were changed. The original capture was shortened, so missing information is shown as placeholders. Milestone 1's report was reused unchanged.

First 10 lines of the draft (blank lines preserved):

```text
# Personal loan information

## Credit score eligibility
- Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- Impact of Credit Score on Personal Loan Interest Rates and Loan Amount A good credit score for a Personal Loan may help you secure a more favourable interest rate, subject to the lender’s assessment.
- A lower credit score for a Personal Loan may result in higher interest rates, a lower loan amount, or stricter terms.
[add: eligibility for this borrower question]

## Interest rate and APR
- Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?
```

Every number in the full draft, in order (repeated occurrences preserved), with its fact-sheet line:

- 21 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 58 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 20,000 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 1 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 2 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 725 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 3 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 16 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 2 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 3 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 6 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 1 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 2 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 3 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 4 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 5 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 6 — fact-sheet line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.
- 40,000 — fact-sheet line 14: Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?
- 35,00,000 — fact-sheet line 14: Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?
- 6 — fact-sheet line 14: Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?
- 10.99% — fact-sheet line 14: Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?
- 10.99% — fact-sheet line 34: Interest Rate & Charges for Personal Loan Low Interest Rate Rates start at 10.99% p.a.*, charged on a reducing balance — so you only pay interest on what you still owe, not the original loan amount.
- 5% — fact-sheet line 35: Your final rate depends on eligibility and Tata Capital's credit assessment Processing Fee A processing fee of up to 5% applies on your loan amount, plus applicable taxes.
- 6 — fact-sheet line 37: Loan Tenure You can spread repayments over a tenure of up to 6 years, picking an EMI that sits comfortably within your monthly budget instead of stretching it thin.
- 25% — fact-sheet line 32: Prepayments above 25% attract applicable part-prepayment charges.

Validation: the production Convex action generated one draft. Every numeric occurrence matched its recorded fact-sheet passage and line; only exact supplied passages entered the draft. Visible placeholders include eligibility for this borrower question. Type checking and all 24 tests passed. npm run deploy and hosted-file checks passed. Actual draft component rendering with the live result passed; browser clicks and visual layout were not tested because no browser was available. No API key value was printed, logged, copied, or written. No login or milestone 3 was added.

Next step: review the draft and fill its highlighted missing facts from approved product information.

## Milestone 2 — fact-sheet draft live test

Date: 04/10/2026, 16:38:41 (India time).
Live app: https://frugal-moose-32.convex.site
Question: best personal loans for CIBIL under 700
Fact-sheet source: https://www.tatacapital.com/personal-loan.html
Model: gpt-4.1

The fact sheet was the saved 18000-character Tata Capital page capture from report j57fwsrm2fnpgab0jt0j8s0wvh8fma3f. Sentence boundaries were changed to line breaks for line references; no words or numbers were changed. The original capture was shortened, so missing information is shown as placeholders. Milestone 1's report was reused unchanged.

First 10 lines of the draft (blank lines preserved):

```text
# Personal loan information

## Credit score eligibility
- Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident
- Low Credit Score – A poor credit history may reduce your chances of loan approval.
- A lower credit score for a Personal Loan may result in higher interest rates, a lower loan amount, or stricter terms.
[add: eligibility for this borrower question]

## Interest rate and APR
- Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?
```

Every number in the full draft, in order (repeated occurrences preserved), with its fact-sheet line:

- 21 — fact-sheet line 39
- 58 — fact-sheet line 39
- 20,000 — fact-sheet line 39
- 1 — fact-sheet line 39
- 2 — fact-sheet line 39
- 725 — fact-sheet line 39
- 40,000 — fact-sheet line 14
- 35,00,000 — fact-sheet line 14
- 6 — fact-sheet line 14
- 10.99% — fact-sheet line 14
- 10.99% — fact-sheet line 34
- 5% — fact-sheet line 35
- 40,000 — fact-sheet line 14
- 35,00,000 — fact-sheet line 14
- 6 — fact-sheet line 14
- 10.99% — fact-sheet line 14
- 6 — fact-sheet line 37
- 25% — fact-sheet line 32

Referenced fact-sheet lines (exact text):

Line 39: Personal Loan Eligibility Criteria For Salaried Individuals Age: 21 to 58 years Minimum monthly income: ₹20,000 Employment stability: Minimum 1 year at current job, 2 years total experience CIBIL score: 725+ preferred Nationality: Indian resident Check Your Eligibility Documents Required for Personal Loan Identity and Age Proof PAN card (mandatory) Aadhaar card Voter ID, passport, or driving licence Address Proof Aadhaar card Utility bill (electricity, water, gas) Passport or rent agreement Income and Financial Proof For Salaried Individuals: Latest 3 months' salary slips Form 16 for the last 2 years Bank statements for last 3-6 months of salary account Employment ID card or offer letter How to Apply for Personal Loan Step 1 Enter Your Basic Details Step 2 Choose Your Loan Amount & Tenure Step 3 Complete Your Personal Details Step 4 Set Up Your e-Mandate Step 5 Review & Confirm Your Application Step 6 Get Your Loan Disbursed Apply Now Factors That Affect Your Personal Loan Eligibility Your Personal Loan eligibility depends on multiple financial and personal factors that help determine your repayment capacity and creditworthiness.

Line 14: Loan amount offered ₹40,000 - ₹35,00,000 Loan tenure Upto 6 Years Interest rate starting @ 10.99% p.a View Rates & Charges Why Choose Tata Capital for a Personal Loan?

Line 34: Interest Rate & Charges for Personal Loan Low Interest Rate Rates start at 10.99% p.a.*, charged on a reducing balance — so you only pay interest on what you still owe, not the original loan amount.

Line 35: Your final rate depends on eligibility and Tata Capital's credit assessment Processing Fee A processing fee of up to 5% applies on your loan amount, plus applicable taxes.

Line 37: Loan Tenure You can spread repayments over a tenure of up to 6 years, picking an EMI that sits comfortably within your monthly budget instead of stretching it thin.

Line 32: Prepayments above 25% attract applicable part-prepayment charges.

Two live draft tests were run. The first exposed eligibility details bundled with application navigation; milestone 2 passage splitting was corrected and deployed again. The final test below generated one draft.

Validation: the production Convex action generated one draft. Every numeric occurrence matched its recorded fact-sheet passage and line; only exact supplied passages entered the draft. Visible placeholders include eligibility for this borrower question. Type checking and all 25 tests passed. npm run deploy and hosted-file checks passed. Actual draft component rendering with the live result passed; browser clicks and visual layout were not tested because no browser was available. No API key value was printed, logged, copied, or written. No login or milestone 3 was added.

Next step: review the draft and fill its highlighted missing facts from approved product information.
