/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as assignments from "../assignments.js";
import type * as auth from "../auth.js";
import type * as equipment from "../equipment.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as privateData from "../privateData.js";
import type * as rbac from "../rbac.js";
import type * as seed from "../seed.js";
import type * as sites from "../sites.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  assignments: typeof assignments;
  auth: typeof auth;
  equipment: typeof equipment;
  healthCheck: typeof healthCheck;
  http: typeof http;
  privateData: typeof privateData;
  rbac: typeof rbac;
  seed: typeof seed;
  sites: typeof sites;
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
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
