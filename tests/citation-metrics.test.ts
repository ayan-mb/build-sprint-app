import { test } from "node:test";
import assert from "node:assert/strict";
import { citationMetrics } from "../src/citationMetrics";
import type { BatchRow } from "../convex/batchValidators";
function row(text: string, urls: string[]): BatchRow {
  return {question:"Which personal loan should I choose?",status:"complete",brandMention:true,brandNames:["Tata Capital"],lenders:["Bajaj Finance","ICICI Bank"],lenderMentions:[{name:"Bajaj Finance",canonicalName:"Bajaj Finance"},{name:"ICICI Bank",canonicalName:"ICICI Bank"}],error:"",answer:{provider:"ChatGPT",model:"fixture",status:"ready",text,message:"",fetchedAt:0,sources:urls.map(url=>({url,title:"Source",cited:true,ownWebsite:false,reference:""}))}};
}
test("citation share counts distinct cited links per answer, merges aliases, and ranks first appearances",()=>{
  const first=row("ICICI Bank, Tata Capital, then Bajaj Finance.",["https://tatacapital.com/a","https://tatacapital.com/a?utm_source=repeat","https://icicibank.com/a","https://icici.bank.in/b","https://comparison.com/a"]);
  first.answer!.sources.push({url:"https://bajajfinserv.in/a",title:"Search only",cited:false,ownWebsite:false,reference:""});
  const second=row("Tata Capital, then ICICI Bank.",["https://tatacapital.com/a"]);
  second.lenders=["ICICI Bank"];second.lenderMentions=[{name:"ICICI Bank",canonicalName:"ICICI Bank"}];
  const result=citationMetrics("tatacapital.com",[first,second]);
  assert.equal(result.totalCitations,4);
  assert.equal(result.brands[0].own,true);
  assert.equal(result.brands[0].citations,2);
  assert.equal(result.brands[0].share,50);
  assert.equal(result.brands[0].averagePosition,1.5);
  const icici=result.brands.find(b=>b.name==="ICICI Bank")!;
  assert.equal(icici.citations,2); assert.equal(icici.share,50); assert.equal(icici.averagePosition,1);
  assert.equal(result.brands.find(b=>b.name.includes("Bajaj"))!.citations,0);
});
test("own brand stays first with zero citations; missing positions stay unavailable",()=>{
  const data=row("ICICI Bank is mentioned.",["https://icicibank.com/a","https://lookalikeicicibank.com/a"]);
  data.brandMention=false;data.brandNames=[];
  const result=citationMetrics("tatacapital.com",[data]);
  assert.equal(result.brands[0].citations,0); assert.equal(result.brands[0].share,0); assert.equal(result.brands[0].averagePosition,null);
  assert.equal(result.totalCitations,1);
  assert.equal(citationMetrics("tatacapital.com",[]).brands[0].citations,0);
});
