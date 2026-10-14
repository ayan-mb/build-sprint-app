function DirectionArrow() {
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function LandingStory({ leaving, onStart }: { leaving: boolean; onStart: () => void }) {
  return <div className={`landing-story${leaving ? " landing-story-leaving" : ""}`}>
    <section className="discovery-story" aria-labelledby="discovery-title">
      <div className="story-intro">
        <h2 id="discovery-title">Your next customer<br />may meet you in an AI answer.</h2>
        <p>People use AI to compare lenders, understand eligibility and explore financial products. A shortlist can take shape before they ever visit a website.</p>
      </div>
      <div className="discovery-comparison">
        <div className="search-journey">
          <h3>A search begins with options.</h3>
          <p className="journey-query">Personal loans for a first-time borrower</p>
          <ol className="search-links" aria-label="Illustrative search journey">
            <li><span>Explore lender websites</span><span className="search-link-line" /></li>
            <li><span>Compare rates and eligibility</span><span className="search-link-line" /></li>
            <li><span>Build your own shortlist</span><span className="search-link-line" /></li>
          </ol>
          <p className="journey-caption">Search. Visit. Compare.</p>
        </div>
        <div className="journey-bridge"><DirectionArrow /></div>
        <div className="answer-journey">
          <h3>An AI answer brings them together.</h3>
          <div className="illustrative-answer">
            <p>“Which personal loan options suit a first-time borrower?”</p>
            <div className="answer-thread">
              <span className="answer-thread-dot" />
              <p>A helpful answer can explain the choices, reference sources and name relevant brands.</p>
            </div>
            <div className="answer-topics"><span>Eligibility</span><span>Costs</span><span>Trade-offs</span></div>
          </div>
          <p className="journey-caption">Ask. Understand. Shortlist.</p>
        </div>
      </div>
      <p className="story-footnote">Illustrative journeys, not live search or AI results.</p>
      <p className="story-takeaway">See whether your brand is part of that conversation. <span>FUXI checks the prompts that matter to your business and shows the brands and sources cited in sampled ChatGPT answers.</span></p>
    </section>

    <section className="foundation-story" aria-labelledby="foundation-title">
      <div className="story-intro">
        <h2 id="foundation-title">Give AI a clearer picture<br />of your brand.</h2>
        <p>Useful answers need useful information. Build from content that can be read, to facts that can be checked, to answers that help a buyer decide.</p>
      </div>
      <div className="visibility-foundation" aria-label="Three foundations for AI visibility">
        <section className="foundation-layer foundation-relevance">
          <div className="foundation-layer-title"><h3>Help the buyer decide</h3><p>Answer the question behind the question.</p></div>
          <ul><li>Relevant answers</li><li>Clear differences</li><li>A practical next step</li></ul>
        </section>
        <section className="foundation-layer foundation-trust">
          <div className="foundation-layer-title"><h3>Make your facts credible</h3><p>Give people information they can verify.</p></div>
          <ul><li>Consistent brand facts</li><li>Supported claims</li><li>Clear sources</li></ul>
        </section>
        <section className="foundation-layer foundation-access">
          <div className="foundation-layer-title"><h3>Make your content readable</h3><p>Start with pages that are easy to access and understand.</p></div>
          <ul><li>Accessible pages</li><li>Clear structure</li><li>Explicit product details</li></ul>
        </section>
      </div>
      <div className="foundation-close"><p>Turn cited evidence into your next draft.</p><p>FUXI compares your page with cited content, identifies gaps to review and helps you draft a response grounded in your product facts.</p></div>
    </section>

    <section className="outlook-story" aria-labelledby="outlook-title">
      <div className="story-intro">
        <h2 id="outlook-title">AI discovery is growing.<br />Start with your own baseline.</h2>
        <p>Industry research points to a changing discovery mix. Measuring where your brand appears today gives your next content decision a starting point.</p>
      </div>
      <div className="outlook-evidence">
        <div className="traffic-evidence">
          <div className="traffic-heading"><strong>+527%</strong><h3>Growth in AI-referred visits<br />in one published study</h3></div>
          <div className="traffic-bars" role="img" aria-label="AI-referred sessions across 19 website analytics properties: 17,076 in January to May 2024, and 107,100 in January to May 2025.">
            <div className="traffic-bar-row"><span>2024</span><div className="traffic-bar-track"><div className="traffic-bar traffic-bar-earlier" /></div><strong>17,076</strong></div>
            <div className="traffic-bar-row"><span>2025</span><div className="traffic-bar-track"><div className="traffic-bar traffic-bar-later" /></div><strong>107,100</strong></div>
          </div>
          <p className="evidence-context">January–May in each year, across 19 website analytics properties. A study sample, not a forecast for your website.</p>
          <a className="story-source" href="https://searchengineland.com/ai-traffic-up-seo-rewritten-459954" target="_blank" rel="noreferrer">Previsible research, published August 2025</a>
        </div>
        <div className="forecast-evidence">
          <h3>A possible turning point</h3>
          <strong className="forecast-year">2028</strong>
          <p>Semrush projected that AI search could send more visitors than traditional search for digital marketing and SEO topics by early 2028.</p>
          <p className="evidence-context">A 2025 forecast that includes Google’s AI search experiences. It is not a measured outcome or a prediction specific to financial services.</p>
          <a className="story-source" href="https://www.semrush.com/blog/ai-search-seo-traffic-study/" target="_blank" rel="noreferrer">Read the Semrush study</a>
        </div>
      </div>
    </section>

    <section className="story-final" aria-labelledby="story-final-title">
      <div><h2 id="story-final-title">Where does your brand<br />stand in the answer?</h2><p>Enter your website, add your buyer prompts and see your sampled ChatGPT visibility. Then use the cited evidence to shape your next piece of content.</p></div>
      <button type="button" className="story-start" onClick={onStart}>Check my brand visibility<DirectionArrow /></button>
    </section>
  </div>;
}
