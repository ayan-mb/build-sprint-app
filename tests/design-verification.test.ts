import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { parseHTML } from "linkedom";
import { DraftOutput } from "../src/DraftBox";
import { hasVerification } from "../src/MarkdownArticle";

test("Download remains blocked until article and note verification tags are edited", async () => {
  const {window,document} = parseHTML('<html><body><div id="root"></div></body></html>');
  const previousWindow = globalThis.window, previousDocument = globalThis.document;
  Object.assign(globalThis, {window, document, IS_REACT_ACT_ENVIRONMENT: true});
  const root = createRoot(document.getElementById("root")!);
  try {
    await act(async () => root.render(createElement(DraftOutput, {draft: {
      status:"ready",text:"## [VERIFY] Heading &amp; fees\n\n**[VERIFY: rate &amp; fees]** and [VERIFY] eligibility.",
      verificationNotes:["[VERIFY: fee]"],numbers:[],placeholders:[],message:"Review",model:"fixture",
    }})));
    const download = () => Array.from(document.querySelectorAll("button")).find(button => button.textContent === "Download")!;
    assert.ok(download().hasAttribute("disabled"));
    assert.equal(document.querySelectorAll('mark[role="textbox"]').length, 4);
    for (let edits = 0; edits < 4; edits++) {
      const mark = document.querySelector('mark[role="textbox"]')!;
      mark.textContent = "Verified value";
      await act(async () => mark.dispatchEvent(new window.Event("focusout", {bubbles:true})));
      if (document.querySelector('mark[role="textbox"]')) assert.ok(download().hasAttribute("disabled"));
    }
    assert.equal(document.querySelectorAll('mark[role="textbox"]').length, 0);
    assert.ok(!download().hasAttribute("disabled"));
    assert.match(document.querySelector(".draft-article")!.textContent!, /Verified value/);
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, {window:previousWindow,document:previousDocument,IS_REACT_ACT_ENVIRONMENT:false});
  }
});
test("verification detection recognises plain and detailed tags", () => {
  assert.ok(hasVerification("[VERIFY]"));
  assert.ok(hasVerification("[VERIFY: confirm\nterms]"));
  assert.ok(!hasVerification("Verified terms"));
});
