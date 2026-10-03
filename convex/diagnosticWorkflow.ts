import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "./_generated/api";
import { v } from "convex/values";
import { compareTopics, normalizeUrl } from "./evidence";
import type { Answer, Page, Report } from "./validators";
export const workflow = new WorkflowManager(components.workflow);
export const run = workflow
  .define({
    args: {
      id: v.id("diagnostics"),
      question: v.string(),
      website: v.string(),
    },
    returns: v.null(),
  })
  .handler(async (step, args): Promise<null> => {
    const [brandPage, perplexity, chatgpt]: [Page, Answer, Answer] =
      await Promise.all([
        step.runAction(
          internal.research.readPage,
          { url: args.website },
          { retry: false },
        ),
        step.runAction(
          internal.research.ask,
          {
            provider: "Perplexity",
            question: args.question,
            website: args.website,
          },
          { retry: false },
        ),
        step.runAction(
          internal.research.ask,
          {
            provider: "ChatGPT",
            question: args.question,
            website: args.website,
          },
          { retry: false },
        ),
      ]);
    const answers = [perplexity, chatgpt];
    const cited = [
      ...new Map(
        answers
          .flatMap((a) => a.sources.filter((s) => s.cited))
          .map((s) => [normalizeUrl(s.url), s]),
      ).values(),
    ];
    await step.runMutation(internal.diagnostics.updateStage, {
      id: args.id,
      stage: "Reading cited pages and checking evidence",
    });
    const selected = cited.slice(0, 8);
    const sourcePages: Page[] = await Promise.all(
      selected.map((s) =>
        normalizeUrl(s.url) === normalizeUrl(brandPage.url)
          ? Promise.resolve(brandPage)
          : step.runAction(
              internal.research.readPage,
              { url: s.url },
              { retry: false },
            ),
      ),
    );
    const topicGaps = compareTopics(brandPage, sourcePages);
    const semantic = await step.runAction(
      internal.research.compare,
      { question: args.question, brandPage, sourcePages },
      { retry: false },
    );
    const warnings: string[] = [];
    if (cited.length > 8)
      warnings.push(
        `All ${cited.length} cited links are shown; only the first 8 pages were fetched to keep this single-question diagnostic bounded.`,
      );
    if (brandPage.status !== "read")
      warnings.push(
        "Your page could not be read. Missing-content conclusions have been withheld.",
      );
    if (brandPage.truncated || sourcePages.some((p) => p.truncated))
      warnings.push(
        "Some page text was shortened. Findings apply only to the captured text.",
      );
    if (sourcePages.some((p) => p.status === "unavailable"))
      warnings.push(
        "Some cited pages could not be read. Their links remain visible; no gaps were inferred from them.",
      );
    if (!cited.length)
      warnings.push(
        "No verified citations are available yet. No source-backed gaps can be shown.",
      );
    const result: Report = {
      brandPage,
      answers,
      sourcePages,
      gaps: [...topicGaps, ...semantic.gaps],
      comparisonStatus: semantic.message,
      warnings,
    };
    await step.runMutation(internal.diagnostics.finish, {
      id: args.id,
      result,
    });
    return null;
  });
