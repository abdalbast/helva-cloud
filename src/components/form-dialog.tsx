"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "number" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
};

type Props = {
  title: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitLabel?: string;
  loading?: boolean;
};

export function FormDialog({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onClose,
  submitLabel = "Save",
  loading = false,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="mx-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-lg rounded-[2px] border border-foreground/10 bg-surface-pure p-0 shadow-golden animate-scale-in backdrop:bg-foreground/30 backdrop:backdrop-blur-sm backdrop:animate-fade-in sm:w-full"
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-3">
        <h2 className="text-sm font-normal">{title}</h2>
        <button onClick={onClose} className="rounded-[2px] p-1 text-foreground/50 hover:bg-surface-cream hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4 p-5"
      >
        {fields.map((f) => (
          <div key={f.name}>
            <label className="mb-1 block text-caption text-foreground/70">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                name={f.name}
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                rows={3}
                className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
              />
            ) : f.type === "select" ? (
              <select
                name={f.name}
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                required={f.required}
                className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
              >
                <option value="">—</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={f.type ?? "text"}
                name={f.name}
                value={values[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                placeholder={f.placeholder}
                required={f.required}
                className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
              />
            )}
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[2px] border border-foreground/10 px-4 py-2 text-sm text-foreground/70 hover:bg-surface-cream active:scale-[0.98] transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
