import { useState } from "react";
import RichAnswer from "./RichAnswer";
import type { Batch } from "../convex/batchValidators";
import { batchSummary, citedDomains } from "../convex/batchEvidence";
import { citationMetrics, citesDomain } from "./citationMetrics";
import DraftBox from "./DraftBox";
import BrandLogo, {type IconResolver} from "./BrandLogo";

export function BatchLoading({finished,total}:{finished:number;total:number}) {
  return <div className="batch-loading" role="status" aria-live="polite"><div className="response-loader" aria-hidden="true"><span /><span /><span /></div><span className="sr-only">Checking prompts. Waiting for responses.</span><span className="loading-progress">{finished} / {total}</span></div>;
}
export function BatchMethodology() {
  return <footer className="batch-methodology">Each lender counts once per answer, including negative mentions. Known lender and site aliases are merged in the summary. Source totals count distinct cited links within each answer; search results without citations do not count. Answers without citations still count for brand mentions.</footer>;
}
export default function BatchResults({batch,resolveIcons,showMethodology=true}:{batch:Batch;resolveIcons?:IconResolver;showMethodology?:boolean}) {
  const [draftRows,setDraftRows]=useState<Record<number,string>>({});
  const summary=batchSummary(batch.rows);
  const {brands,totalCitations}=citationMetrics(batch.domain,batch.rows);
  const finished=batch.rows.filter(row=>row.status==="complete"||row.status==="error").length;
  const hasResponse=batch.rows.some(row=>!!row.answer || row.status==="error");
  if(batch.status==="running"&&!hasResponse) return <section className="batch-results" aria-label="Loading results"><BatchLoading finished={finished} total={batch.rows.length} /></section>;
  return <section className="batch-results" aria-labelledby="batch-results-title">
    <div className="results-heading"><h2 id="batch-results-title">Your visibility results</h2>{batch.status==="running"&&<BatchLoading finished={finished} total={batch.rows.length} />}</div>
    <p role="status" aria-live="polite">{finished} of {batch.rows.length} prompts finished{summary.failed>0?` · ${summary.failed} failed; details appear with the affected prompt.`:""}</p>
    <progress max={batch.rows.length||1} value={finished} aria-label="Prompts finished" />
    <div className="brand-citations" aria-label="Competition benchmarking">
      {brands.map(brand=><section className={`brand-citation ${brand.own?"own-brand":""}`} key={`${brand.own}-${brand.name}`}>
        {brand.own&&<span className="you-tag">Your brand</span>}
        <div className="brand-logo"><BrandLogo domain={brand.domain} name={brand.name} resolveIcons={resolveIcons} /><strong>{brand.name}</strong></div>
        <dl className="citation-metrics"><div><dt>Citations</dt><dd>{brand.domain?brand.citations:"Unavailable"}</dd></div><div><dt>Share of voice</dt><dd>{brand.domain?`${brand.share.toFixed(1)}%`:"Unavailable"}</dd></div><div><dt>Average position</dt><dd>{brand.averagePosition===null?"—":brand.averagePosition.toFixed(1)}</dd></div></dl>
      </section>)}
    </div>
    <p className="results-definition">Share of voice = brand citations ÷ total brand citations × 100. {totalCitations} brand citations in this sample{totalCitations===0?"; shares are 0% until citations arrive":""}. Each distinct cited link counts once per prompt response. Average position is the brand’s first-appearance order, averaged over answers that cite it; — means no position is available. Unmatched brand domains are excluded from citation totals.</p>
    <section className="cited-domain-list"><h3>Most-cited domains</h3>{summary.domains.length?<ol>{summary.domains.map(entry=><li key={entry.domain}><span>{entry.domain}</span><strong>{entry.count} cited links</strong></li>)}</ol>:<p>No cited sources yet.</p>}</section>
    <div className="batch-table-scroll" role="region" aria-label="Prompt results" tabIndex={0}>
      <table className="batch-table"><caption>Prompts</caption><thead><tr><th scope="col">Prompts</th><th scope="col">Status</th><th scope="col">Your Brand Cited</th><th scope="col">Others Mentioned</th><th scope="col">Cited links</th><th scope="col">Source domains</th><th scope="col">Write Draft</th></tr></thead><tbody>
        {batch.rows.map((row,index)=><tr key={index}>
          <th scope="row"><span className="prompt-row-number">{index+1}.</span> {row.question}</th>
          <td>{row.status==="complete"?row.answer?.status==="no_citations"?"Complete · Citation Not Available":"Complete":row.status==="error"?"Failed":row.status==="running"?"Running":"Waiting"}{row.error&&<p className="row-error">{row.error}</p>}</td>
          <td>{row.answer?.status==="ready"||row.answer?.status==="no_citations"?citesDomain(row,batch.domain)>0?"Yes":"No":row.status==="error"?"Unavailable":"—"}</td><td>{row.lenders.join(", ")||"—"}</td><td>{citedDomains(row).length}</td><td>{[...new Set(citedDomains(row))].join(", ")||"—"}</td><td>{row.status==="complete"&&<button type="button" onClick={()=>setDraftRows(previous=>previous[index]?previous:{...previous,[index]:crypto.randomUUID()})}>Write Draft</button>}</td>
        </tr>)}
      </tbody></table>
    </div>
    {batch.rows.map((row,index)=>draftRows[index]&&<DraftBox key={`${batch._id}-${index}`} batchId={batch._id} rowIndex={index} token={draftRows[index]} question={row.question} website={`https://${batch.domain}`} />)}
    <h3>Prompt responses</h3>
    {batch.rows.map((row,index)=>row.answer&&<details key={index} className="batch-answer" open>
      <summary>{index+1}. {row.question}</summary>
      {row.answer.message&&<p className="subtle">{row.answer.message}</p>}
      <RichAnswer text={row.answer.text} />
      {!!row.answer.sources.filter(source=>source.cited).length&&<div className="answer-sources"><h4>Cited sources</h4><ul>{row.answer.sources.filter(source=>source.cited).map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title||source.url}</a></li>)}</ul></div>}
    </details>)}
    {showMethodology&&<BatchMethodology />}
  </section>;
}
