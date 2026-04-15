"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm text-foreground/60">Something went wrong.</p>
      <p className="max-w-md text-center text-caption text-foreground/40">
        An unexpected error occurred. Check the logs for details and try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
      >
        Try again
      </button>
    </div>
  );
}
