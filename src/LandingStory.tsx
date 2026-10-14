import { useState } from "react";

type IconName = "search" | "page" | "spark" | "shield" | "target" | "arrow" | "check";
function StoryIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    page: <><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h4" /></>,
    spark: <><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="m12 12 9-9M17 3h4v4" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
const layers = [
  { title: "Buyer relevance", icon: "target" as const, description: "Help the buyer decide.", items: ["Relevant answers", "Clear differences", "A practical next step"] },
  { title: "Brand trust", icon: "shield" as const, description: "Make your facts easy to verify.", items: ["Consistent brand facts", "Supported claims", "Clear sources"] },
  { title: "Readable content", icon: "page" as const, description: "Start with information AI can read.", items: ["Accessible pages", "Clear structure", "Explicit product details"] },
];

export default function LandingStory({ leaving, onStart }: { leaving: boolean; onStart: () => void }) {
  const [activeLayer, setActiveLayer] = useState(2);
  return <div className={`landing-story${leaving ? " landing-story-leaving" : ""}`}>
    <section className="discovery-story" aria-labelledby="discovery-title">
      <div className="story-intro"><h2 id="discovery-title">Your next customer<br />may meet you in an AI answer.</h2><p>A shortlist can take shape before a customer visits your website.</p></div>
      <div className="discovery-comparison">
        <div className="search-journey">
          <h3><StoryIcon name="search" />Search results</h3>
          <div className="journey-query"><StoryIcon name="search" /><span>Personal loans for first-time borrowers</span></div>
          <div className="search-result-stack" aria-label="Illustrative search results">
            {["Lender website", "Comparison page", "Product guide"].map((label, index) => <div className="mock-search-result" key={label}><span className="mock-site-icon"><StoryIcon name="page" /></span><div><strong>{label}</strong><span className="mock-url">example.com/{["loans", "compare", "guide"][index]}</span><span className="mock-copy-line" /><span className="mock-copy-line short" /></div></div>)}
          </div>
          <div className="journey-flow"><span>Search</span><StoryIcon name="arrow" /><span>Visit</span><StoryIcon name="arrow" /><span>Compare</span></div>
        </div>
        <div className="journey-bridge"><StoryIcon name="arrow" /></div>
        <div className="answer-journey">
          <h3><StoryIcon name="spark" />AI answer</h3>
          <div className="mock-prompt">Which personal loan suits a first-time borrower?</div>
          <div className="answer-visual">
            <div className="answer-summary-lines" aria-hidden="true"><span /><span /><span /></div>
            <div className="answer-topics"><span>Eligibility</span><span>Costs</span><span>Trade-offs</span></div>
            <div className="answer-brand"><span className="brand-orbit"><StoryIcon name="target" /></span><div><strong>Your brand?</strong><span>Is it part of the shortlist?</span></div></div>
            <div className="citation-connectors" aria-hidden="true"><span /><span /><span /></div>
            <div className="citation-nodes" aria-label="Illustrative cited sources"><span><StoryIcon name="page" />Source 1</span><span><StoryIcon name="page" />Source 2</span><span><StoryIcon name="page" />Source 3</span></div>
          </div>
          <div className="journey-flow"><span>Ask</span><StoryIcon name="arrow" /><span>Understand</span><StoryIcon name="arrow" /><span>Shortlist</span></div>
        </div>
      </div>
      <p className="story-footnote">Illustrative journeys, not live results.</p>
      <p className="story-takeaway">FUXI shows the brands and sources cited in sampled ChatGPT answers.</p>
    </section>

    <section className="outlook-story" aria-labelledby="outlook-title">
      <div className="story-intro"><h2 id="outlook-title">AI discovery is growing.<br />Start with your own baseline.</h2><p>The direction is changing. Find out where your brand stands today.</p></div>
      <div className="outlook-evidence">
        <div className="traffic-evidence">
          <div className="traffic-heading"><strong>+527%</strong><h3>AI-referred session growth<br />in one published study</h3></div>
          <div className="traffic-chart" role="img" aria-label="AI-referred sessions across 19 website analytics properties increased from 17,076 in January to May 2024 to 107,100 in the same period of 2025.">
            <div className="chart-grid" aria-hidden="true"><span>100k</span><span>50k</span><span>0</span></div>
            <div className="chart-columns"><div className="chart-column"><strong>17,076</strong><div className="chart-bar chart-bar-2024" /><span>2024</span></div><div className="chart-column"><strong>107,100</strong><div className="chart-bar chart-bar-2025" /><span>2025</span></div></div>
          </div>
          <p className="evidence-context">Jan–May, across 19 websites. A historical sample, not your expected growth.</p>
          <a className="story-source" href="https://searchengineland.com/ai-traffic-up-seo-rewritten-459954" target="_blank" rel="noreferrer">Previsible research · August 2025</a>
        </div>
        <div className="forecast-evidence">
          <h3>A possible turning point</h3>
          <div className="forecast-timeline"><div className="timeline-track" aria-hidden="true" /><span className="timeline-start">2025<span>Study published</span></span><span className="timeline-end"><strong>2028</strong><span>Possible crossover</span></span></div>
          <div className="forecast-channels"><span><StoryIcon name="spark" />AI search</span><span><StoryIcon name="search" />Traditional search</span></div>
          <p>Semrush projected that AI search could overtake traditional search traffic for marketing and SEO topics by early 2028.</p>
          <p className="evidence-context">A forecast including Google AI search; not a financial-services prediction.</p>
          <a className="story-source" href="https://www.semrush.com/blog/ai-search-seo-traffic-study/" target="_blank" rel="noreferrer">Read the 2025 Semrush study</a>
        </div>
      </div>
    </section>

    <section className="foundation-story" aria-labelledby="foundation-title">
      <div className="story-intro"><h2 id="foundation-title">Give AI a clearer picture<br />of your brand.</h2><p>Readable content. Credible facts. Answers that help a buyer decide.</p></div>
      <div className="foundation-explorer">
        <div className="foundation-tower" role="tablist" aria-label="Explore the foundations of AI visibility" aria-orientation="vertical">
          <div className="tower-axis" aria-hidden="true" />
          {layers.map((layer, index) => <button key={layer.title} type="button" role="tab" id={`foundation-tab-${index}`} aria-controls="foundation-detail" aria-selected={activeLayer === index} tabIndex={activeLayer === index ? 0 : -1} className={`tower-layer tower-layer-${index}${activeLayer === index ? " tower-layer-active" : ""}`} onClick={() => setActiveLayer(index)} onKeyDown={event => {
            if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowDown" ? 1 : 2)) % 3;
              setActiveLayer(next); document.getElementById(`foundation-tab-${next}`)?.focus();
            }
          }}><span className="tower-layer-content"><span className="tower-icon"><StoryIcon name={layer.icon} /></span><strong>{layer.title}</strong><span className="tower-selector" aria-hidden="true" /></span><span className="tower-circuit" aria-hidden="true" /></button>)}
          <span className="tower-ground" aria-hidden="true" />
        </div>
        <div className="foundation-detail" role="tabpanel" id="foundation-detail" aria-labelledby={`foundation-tab-${activeLayer}`} tabIndex={0}>
          <span className="foundation-detail-icon"><StoryIcon name={layers[activeLayer].icon} /></span>
          <h3>{layers[activeLayer].description}</h3>
          <ul>{layers[activeLayer].items.map(item => <li key={item}><StoryIcon name="check" />{item}</li>)}</ul>
          <p className="story-footnote">Select a layer to explore.</p>
        </div>
      </div>
      <p className="story-takeaway">Turn cited evidence into a draft grounded in your product facts.</p>
    </section>

    <section className="story-final" aria-labelledby="story-final-title"><div><h2 id="story-final-title">Where does your brand<br />stand in the answer?</h2><p>Enter your website. Add your buyer prompts. See your sampled ChatGPT visibility.</p></div><button type="button" className="story-start" onClick={onStart}>Check my brand visibility<StoryIcon name="arrow" /></button></section>
  </div>;
}
