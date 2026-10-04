/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as batchAnalysis from "../batchAnalysis.js";
import type * as batchEvidence from "../batchEvidence.js";
import type * as batchRunner from "../batchRunner.js";
import type * as batchValidators from "../batchValidators.js";
import type * as batchWorkflow from "../batchWorkflow.js";
import type * as batches from "../batches.js";
import type * as comparisonContext from "../comparisonContext.js";
import type * as comparisonFailure from "../comparisonFailure.js";
import type * as diagnosticWorkflow from "../diagnosticWorkflow.js";
import type * as diagnostics from "../diagnostics.js";
import type * as draftData from "../draftData.js";
import type * as draftEvidence from "../draftEvidence.js";
import type * as draftValidators from "../draftValidators.js";
import type * as drafts from "../drafts.js";
import type * as evidence from "../evidence.js";
import type * as html from "../html.js";
import type * as models from "../models.js";
import type * as research from "../research.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  batchAnalysis: typeof batchAnalysis;
  batchEvidence: typeof batchEvidence;
  batchRunner: typeof batchRunner;
  batchValidators: typeof batchValidators;
  batchWorkflow: typeof batchWorkflow;
  batches: typeof batches;
  comparisonContext: typeof comparisonContext;
  comparisonFailure: typeof comparisonFailure;
  diagnosticWorkflow: typeof diagnosticWorkflow;
  diagnostics: typeof diagnostics;
  draftData: typeof draftData;
  draftEvidence: typeof draftEvidence;
  draftValidators: typeof draftValidators;
  drafts: typeof drafts;
  evidence: typeof evidence;
  html: typeof html;
  models: typeof models;
  research: typeof research;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
};
