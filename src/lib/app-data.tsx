"use client";

/**
 * Drop-in replacements for Convex's `useQuery` / `useMutation` that
 * automatically fall back to localStorage when the user is not signed in.
 *
 * Authenticated users  → Convex backend (as before).
 * Guest users          → localStorage (offline-first, persists across sessions).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import type { FunctionReference, FunctionReturnType, OptionalRestArgs } from "convex/server";
import {
  localGetAll,
  localCount,
  localCreate,
  localUpdate,
  localRemove,
  localSubscribe,
} from "./local-store";

// ---------------------------------------------------------------------------
// Internal: reactive localStorage reader
// ---------------------------------------------------------------------------

function useLocalData<T>(table: string, fn: () => T, defaultValue: T): T {
  const [data, setData] = useState<T>(defaultValue);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    setData(fnRef.current());
    return localSubscribe(table, () => setData(fnRef.current()));
  }, [table]);

  return data;
}

// ---------------------------------------------------------------------------
// useIsGuest — true once we *know* the user is not authenticated
// ---------------------------------------------------------------------------

export function useIsGuest(): boolean {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return !isAuthenticated && !isLoading;
}

// ---------------------------------------------------------------------------
// useAppQuery
// ---------------------------------------------------------------------------

type LocalConfig<T> = {
  table: string;
  fn: () => T;
};

/**
 * @param convexRef  – the Convex FunctionReference (e.g. `api.contacts.list`)
 * @param local      – either a table name (returns all rows) or `{ table, fn }`
 * @param args       – Convex query args, or `"skip"` to skip the query
 */
export function useAppQuery<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends FunctionReference<"query", "public", any, any>,
  T = FunctionReturnType<F>,
>(
  convexRef: F,
  local: string | LocalConfig<T>,
  ...queryArgs: OptionalRestArgs<F> | ["skip"]
): T | undefined {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isGuest = !isAuthenticated && !isLoading;

  const table = typeof local === "string" ? local : local.table;
  const localFn =
    typeof local === "string"
      ? () => localGetAll(table) as unknown as T
      : local.fn;

  // Always call hooks unconditionally (rules of hooks)
  const localData = useLocalData<T | undefined>(table, localFn, undefined);

  const args = queryArgs[0];
  const skipConvex = isGuest || args === "skip";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convexData = useQuery(convexRef as any, skipConvex ? "skip" : (args as any));

  if (args === "skip") return undefined;
  if (isGuest) return localData as T;
  if (isLoading) return undefined;
  return convexData as T | undefined;
}

// ---------------------------------------------------------------------------
// useAppMutation
// ---------------------------------------------------------------------------

/**
 * @param convexRef  – the Convex FunctionReference (e.g. `api.contacts.create`)
 * @param table      – the localStorage table name
 * @param op         – `"create"` | `"update"` | `"remove"`
 */
export function useAppMutation(
  convexRef: FunctionReference<"mutation">,
  table: string,
  op: "create" | "update" | "remove",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (_args: any) => Promise<any> {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isGuest = !isAuthenticated && !isLoading;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convexMutate = useMutation(convexRef) as (_args: any) => Promise<any>;

  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (mutationArgs: Record<string, any>) => {
      if (isGuest) {
        switch (op) {
          case "create": {
            const { id: _discarded, ...data } = mutationArgs;
            void _discarded;
            return localCreate(table, data);
          }
          case "update": {
            const { id, ...updates } = mutationArgs;
            localUpdate(table, id as string, updates);
            return null;
          }
          case "remove": {
            localRemove(table, mutationArgs.id as string);
            return null;
          }
        }
      }
      return convexMutate(mutationArgs);
    },
    [isGuest, convexMutate, table, op],
  );
}

// ---------------------------------------------------------------------------
// Convenience: useAppCount
// ---------------------------------------------------------------------------

export function useAppCount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convexRef: FunctionReference<"query", "public", any, any>,
  table: string,
): number | undefined {
  return useAppQuery(convexRef, {
    table,
    fn: () => localCount(table),
  });
}
