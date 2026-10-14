import type { BatchRow } from "../convex/batchValidators";
import { normalizeUrl, ownWebsite } from "../convex/evidence";
import { lenderIdentity, siteIdentity } from "../convex/identities";

const knownBrands = [
  {name:"Tata Capital",domain:"tatacapital.com",names:["Tata Capital"]},
  {name:"Bajaj Finance / Bajaj Finserv",domain:"bajajfinserv.in",names:["Bajaj Finance","Bajaj Finserv"]},
  {name:"ICICI Bank",domain:"icicibank.com",names:["ICICI Bank","ICICI"]},
  {name:"HDFC Bank",domain:"hdfcbank.com",names:["HDFC Bank"]},
  {name:"State Bank of India",domain:"bank.sbi",names:["State Bank of India","SBI"]},
  {name:"Axis Bank",domain:"axisbank.com",names:["Axis Bank"]},
  {name:"KreditBee",domain:"kreditbee.in",names:["KreditBee"]},
];
const key = (value:string) => lenderIdentity(value).toLowerCase().replace(/[^a-z0-9]/g,"");
export type CitationBrand = {name:string;domain:string|null;own:boolean;citations:number;share:number;averagePosition:number|null};
export function rowCitations(row:BatchRow) {
  const seen = new Set<string>();
  return (row.answer?.sources || []).filter(source => {
    if (!source.cited) return false;
    try { const url=normalizeUrl(source.url); if(seen.has(url)) return false; seen.add(url); return true; } catch {return false;}
  });
}
export function citesDomain(row:BatchRow,domain:string) {
  return rowCitations(row).filter(source => {
    try { const host=new URL(source.url).hostname; return siteIdentity(host)===siteIdentity(domain) || ownWebsite(source.url,`https://${domain}`); } catch {return false;}
  }).length;
}
function namePosition(text:string,names:string[]) {
  const prose=text.replace(/https?:\/\/[^\s)\]]+/gi,"");
  const positions=names.map(name=>{
    const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`,"i").exec(prose)?.index ?? -1;
  }).filter(position=>position>=0);
  return positions.length ? Math.min(...positions) : null;
}
export function citationMetrics(domain:string,rows:BatchRow[]) {
  const host=new URL(/^https?:\/\//i.test(domain)?domain:`https://${domain}`).hostname.replace(/^www\./,"");
  const ownKnown=knownBrands.find(brand=>siteIdentity(brand.domain)===siteIdentity(host));
  const brands: CitationBrand[]=[{name:ownKnown?.name||host,domain:host,own:true,citations:0,share:0,averagePosition:null}];
  const addBrand=(name:string,brandDomain:string|null)=>{
    if(brandDomain && siteIdentity(brandDomain)===siteIdentity(host)) return;
    if(brands.some(brand=>key(brand.name)===key(name))) return;
    brands.push({name:lenderIdentity(name),domain:brandDomain,own:false,citations:0,share:0,averagePosition:null});
  };
  const citedHosts=[...new Set(rows.flatMap(row=>rowCitations(row).flatMap(source=>{try{return [new URL(source.url).hostname.replace(/^www\./,"")];}catch{return [];}})))];
  for(const row of rows) for(const name of row.lenders) {
    const known=knownBrands.find(brand=>key(brand.name)===key(name));
    // Unknown brands are matched only on an exact domain stem, never a substring guess.
    const exact=citedHosts.find(candidate=>key(candidate.split(".")[0])===key(name));
    addBrand(name,known?.domain||exact||null);
  }
  for(const known of knownBrands) if(citedHosts.some(candidate=>siteIdentity(candidate)===siteIdentity(known.domain))) addBrand(known.name,known.domain);
  const samples=new Map<CitationBrand,number[]>();
  for(const row of rows) {
    const positions=brands.flatMap(brand=>{
      const known=knownBrands.find(candidate=>key(candidate.name)===key(brand.name));
      const names=brand.own ? [...(row.brandNames||[]),...(ownKnown?.names||[])] : [brand.name,...(known?.names||[]),...row.lenders.filter(name=>key(name)===key(brand.name)),...(row.lenderMentions||[]).filter(mention=>key(mention.canonicalName)===key(brand.name)).map(mention=>mention.name)];
      const position=namePosition(row.answer?.text||"",names);
      return position===null?[]:[{brand,position}];
    }).sort((a,b)=>a.position-b.position);
    for(const brand of brands) {
      const count=brand.domain?citesDomain(row,brand.domain):0;
      brand.citations+=count;
      if(count) {
        const position=positions.findIndex(entry=>entry.brand===brand);
        if(position>=0) samples.set(brand,[...(samples.get(brand)||[]),position+1]);
      }
    }
  }
  const totalCitations=brands.reduce((sum,brand)=>sum+brand.citations,0);
  for(const brand of brands) {
    brand.share=totalCitations?brand.citations/totalCitations*100:0;
    const positions=samples.get(brand)||[];
    brand.averagePosition=positions.length?positions.reduce((a,b)=>a+b,0)/positions.length:null;
  }
  return {brands:[brands[0],...brands.slice(1).sort((a,b)=>b.citations-a.citations||a.name.localeCompare(b.name))],totalCitations};
}
