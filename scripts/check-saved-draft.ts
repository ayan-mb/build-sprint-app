import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
const id="j57fwsrm2fnpgab0jt0j8s0wvh8fma3f" as Id<"diagnostics">;
const capture=JSON.parse(execFileSync("npx",["convex","run","draftData:testCapture",JSON.stringify({id}),"--prod","--typecheck=disable","--codegen=disable"],{encoding:"utf8",timeout:30000}));
const excerpts=["CIBIL score: 725+ preferred","Rates start at 10.99% p.a.*, charged on a reducing balance","Your final rate depends on eligibility and Tata Capital's credit assessment","A processing fee of up to 5% applies on your loan amount, plus applicable taxes."];
for(const text of excerpts) assert.ok(capture.page.text.includes(text),"Approved excerpt must appear exactly in the saved source");
const client=new ConvexHttpClient("https://frugal-moose-32.convex.cloud");
const result=await client.action(api.drafts.generate,{id,token:capture.token,factSheet:excerpts.join("\n")});
const page=await new ConvexHttpClient("https://frugal-moose-32.convex.cloud").query(api.history.list,{paginationOpts:{numItems:50,cursor:null}});
const entry=page.page.find(item=>item.kind==="draft"); assert.ok(entry);
const reread=await client.query(api.history.read,{id:entry._id});
assert.deepEqual(reread?.draft?.result,result);
writeFileSync("/tmp/build-sprint-saved-draft.json",JSON.stringify({id:entry._id,result}));
console.log(`Draft database readback: ${result.status}.`);
if(result.status!=="ready") {console.log(result.message);process.exitCode=1;}
