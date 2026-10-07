import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "./_generated/api";
import { v } from "convex/values";
import type { Answer } from "./validators";
import type { BatchRow } from "./batchValidators";
import { DAILY_CAP_MESSAGE } from "./prospectLimits";
import { runSequential } from "./batchRunner";
export const workflow = new WorkflowManager(components.workflow);
export const run = workflow.define({
  args: { id: v.id("batches"), website: v.string(), domain: v.string(), questions: v.array(v.string()) }, returns: v.null(),
}).handler(async (step, args): Promise<null> => {
  if (args.questions.length > 20) throw new Error("Maximum 20 questions");
  await runSequential(args.questions, async (question,index) => {
    const row: BatchRow = { question, status: "running", answer: null, brandMention: null, lenders: [], error: "" };
    await step.runMutation(internal.batches.saveRow, { id: args.id, index, row, stage: `Question ${index+1} of ${args.questions.length}: asking ChatGPT` });
    try {
      const allowed = await step.runMutation(internal.prospectBatches.claimSearch, { batchId: args.id, index });
      if (!allowed) throw new Error(DAILY_CAP_MESSAGE);
      const answer: Answer = await step.runAction(internal.research.ask, { provider: "ChatGPT", question, website: args.website }, { retry: false });
      row.answer = answer;
      if (answer.status === "error" || answer.status === "key_missing") { row.status = "error"; row.error = answer.message; }
      else {
        await step.runMutation(internal.batches.saveRow, { id: args.id, index, row, stage: `Question ${index+1} of ${args.questions.length}: counting lender mentions` });
        const mentions: { brandMention: boolean | null; lenders: string[]; error: string } = await step.runAction(internal.batchAnalysis.mentions, { domain: args.domain, text: answer.text }, { retry: false });
        Object.assign(row, mentions);
        row.status = mentions.error ? "error" : "complete";
      }
    } catch (error) { row.status = "error"; row.error = error instanceof Error && error.message === DAILY_CAP_MESSAGE ? DAILY_CAP_MESSAGE : "This question could not finish. No automatic paid retry was made. The batch will continue."; }
    await step.runMutation(internal.batches.saveRow, { id: args.id, index, row, stage: `${index+1} of ${args.questions.length} questions finished` });
  }, async (question,index) => {
    await step.runMutation(internal.batches.saveRow, { id: args.id, index, row: { question, status: "error", answer: null, brandMention: null, lenders: [], error: "This question could not finish. The batch will continue." }, stage: `${index+1} of ${args.questions.length} questions finished` });
  });
  await step.runMutation(internal.batches.finish, { id: args.id });
  return null;
});
