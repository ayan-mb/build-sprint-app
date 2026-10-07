import { test } from "node:test";
import assert from "node:assert/strict";
import { fillDraftInputs, presentDraft } from "../convex/draftPresentation";
import { selectBrandLinks } from "../convex/draftSources";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DraftOutput } from "../src/DraftBox";
import { draftExport } from "../src/draftExport";
test("full style text survives automatic input filling", () => {
  const style = "Instructions\n- Brand: [name]\n- Brand website: [URL]\n- Topic: [topic]\n- Fact sheet: [text]\nFinal rules";
  const instructions = fillDraftInputs(style, {brand:"Example",website:"https://example.com",question:"Loan eligibility",factSheet:""});
  assert.match(instructions,/^Instructions/); assert.match(instructions,/Final rules$/);
  assert.match(instructions,/- Brand: Example/); assert.match(instructions,/- Topic: Loan eligibility/);
  assert.match(instructions,/Not pasted/);
});
test("brand page selection uses existing links, keeps the topic and domain, and caps reads at three", () => {
  const website = "https://www.brand.com/personal-loan.html";
  const links = ["https://www.brand.com/personal-loan/interest-rates.html", "https://www.brand.com/personal-loan/eligibility.html", "https://www.brand.com/home-loan/interest-rates.html", "https://brand.com.evil.com/personal-loan/fees.html"];
  assert.deepEqual(selectBrandLinks(website,"CIBIL under 700",links),[website,...links.slice(0,2)]);
  assert.equal(selectBrandLinks(website,"CIBIL under 700",[]).length,1);
});
test("verification notes stay outside article exports and existing number evidence survives Markdown layout", () => {
  const sheet = "Rates start at 10.99%, subject to eligibility.";
  const draft = presentDraft(sheet,[{kind:"title",text:"Personal loan rates",topic:"rates",factIds:[0]},{kind:"paragraph",text:sheet,topic:"rates",factIds:[0]}],["[VERIFY: Confirm lower-score eligibility]"],["https://brand.com/personal-loan"]);
  assert.equal(draft.numbers[0].draftLine,3);
  assert.equal(draft.text.split("\n")[2],sheet);
  assert.deepEqual(draft.verificationNotes,["[VERIFY: Confirm lower-score eligibility]"]);
  for (const format of ["text","markdown"] as const) assert.doesNotMatch(draftExport(draft.text,format),/VERIFY|Confirm lower-score/);
  const html = renderToStaticMarkup(createElement(DraftOutput,{draft:{...draft,status:"ready",message:"Checked",model:"fixture"}}));
  assert.match(html,/aria-label="Verification notes"/);
  assert.match(html,/>Copy<\/button>/);
  assert.throws(()=>presentDraft(sheet,[{kind:"paragraph",text:"Interest is 9%.",topic:"rates",factIds:[0]}],[],[]),/Unsupported draft number/);
  assert.throws(()=>presentDraft(sheet,[{kind:"paragraph",text:"See https:\/\/brand.com",topic:"rates",factIds:[0]}],[],[]),/Invalid draft prose/);
});

test("page-access notes remain visible when no article is available and generated note URLs are rejected", () => {
  const html = renderToStaticMarkup(createElement(DraftOutput,{draft:{status:"unavailable",text:"",message:"Pages unavailable",model:"",numbers:[],placeholders:[],verificationNotes:["[VERIFY: No brand pages could be read.]"]}}));
  assert.match(html,/aria-label="Verification notes"/);
  assert.match(html,/No brand pages could be read/);
  assert.doesNotMatch(html,/>Copy<\/button>/);
  assert.throws(() => presentDraft("Rates start at 10%.",[{kind:"paragraph",text:"Rates start at 10%.",topic:"rates",factIds:[0]}],["Check https://guessed.com"],[]),/Invalid draft prose/);
});
