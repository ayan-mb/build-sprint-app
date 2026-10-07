/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
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
import type * as draftPresentation from "../draftPresentation.js";
import type * as draftSources from "../draftSources.js";
import type * as draftStyle from "../draftStyle.js";
import type * as draftValidators from "../draftValidators.js";
import type * as drafts from "../drafts.js";
import type * as evidence from "../evidence.js";
import type * as history from "../history.js";
import type * as historyValidators from "../historyValidators.js";
import type * as html from "../html.js";
import type * as identities from "../identities.js";
import type * as models from "../models.js";
import type * as prospect from "../prospect.js";
import type * as prospectBatches from "../prospectBatches.js";
import type * as prospectLimits from "../prospectLimits.js";
import type * as research from "../research.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
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
  draftPresentation: typeof draftPresentation;
  draftSources: typeof draftSources;
  draftStyle: typeof draftStyle;
  draftValidators: typeof draftValidators;
  drafts: typeof drafts;
  evidence: typeof evidence;
  history: typeof history;
  historyValidators: typeof historyValidators;
  html: typeof html;
  identities: typeof identities;
  models: typeof models;
  prospect: typeof prospect;
  prospectBatches: typeof prospectBatches;
  prospectLimits: typeof prospectLimits;
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
