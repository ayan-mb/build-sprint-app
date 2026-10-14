import { createElement } from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import BatchResults from "../src/BatchResults";
import type { Batch } from "../convex/batchValidators";
const base:Batch={_id:"fixture" as never,_creationTime:0,createdAt:0,domain:"tatacapital.com",questions:["Which loan is suitable?"],rows:[{question:"Which loan is suitable?",status:"running",answer:null,brandMention:null,lenders:[],error:""}],status:"running",stage:"Question 1 of 1"};
test("loading shows animation before answers and reveals results as soon as an answer arrives",()=>{
  const initial=renderToStaticMarkup(createElement(BatchResults,{batch:base}));
  assert.match(initial,/response-loader/);assert.doesNotMatch(initial,/Your batch is running|Competition benchmarking/);
  const populated:Batch={...base,rows:[{...base.rows[0],answer:{provider:"ChatGPT",model:"fixture",status:"ready",message:"",text:"## Choices\n\n**Compare** these:\n\n- Fees\n- Eligibility",sources:[],fetchedAt:0}}]};
  const html=renderToStaticMarkup(createElement(BatchResults,{batch:populated}));
  assert.match(html,/Competition benchmarking/);assert.match(html,/<h2>Choices<\/h2>/);assert.match(html,/<strong>Compare<\/strong>/);assert.match(html,/<li>Fees<\/li>/);assert.doesNotMatch(html,/## Choices|Sample:|<th scope="col">Error<\/th>/);
  assert.ok(html.indexOf("batch-methodology")>html.indexOf("Prompt responses"));
});
