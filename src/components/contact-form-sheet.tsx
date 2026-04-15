"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { useAppQuery } from "@/lib/app-data";
import { X, Building2, User, Mail, Phone, Briefcase, FileText, ChevronDown } from "lucide-react";

type Props = {
  open: boolean;
  editId?: string | null;
  initialValues?: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role?: string;
    companyId?: string;
    country?: string;
    notes?: string;
  };
  onClose: () => void;
  onSubmit: (values: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role?: string;
    companyId?: string;
    country?: string;
    notes?: string;
  }) => void;
  onDelete?: () => void;
  loading?: boolean;
};

export function ContactFormSheet({ open, editId, initialValues, onClose, onSubmit, onDelete, loading }: Props) {
  const companies = useAppQuery(api.companies.list, "companies") ?? [];
  const [values, setValues] = useState(() => ({
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    role: initialValues?.role ?? "",
    companyId: initialValues?.companyId ?? "",
    country: initialValues?.country ?? "",
    notes: initialValues?.notes ?? "",
  }));
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => firstInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const selectedCompany = companies.find((c) => c._id === values.companyId);
  const filteredCompanies = companySearch
    ? companies.filter((c) => c.name.toLowerCase().includes(companySearch.toLowerCase()))
    : companies.slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.firstName.trim() || !values.lastName.trim()) return;
    onSubmit({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim() || undefined,
      phone: values.phone.trim() || undefined,
      role: values.role.trim() || undefined,
      companyId: values.companyId || undefined,
      country: values.country.trim() || undefined,
      notes: values.notes.trim() || undefined,
    });
  };

  if (!open) return null;

  const initials = `${values.firstName.charAt(0)}${values.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-foreground/10 bg-surface-pure shadow-golden animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-sheet-title"
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mistral-orange/10 text-mistral-orange text-lg font-normal">
                {initials || <User className="h-5 w-5" />}
              </div>
              <div>
                <h2 id="contact-sheet-title" className="text-sm font-normal">
                  {editId ? "Edit Contact" : "New Contact"}
              </h2>
                <p className="text-caption text-foreground/50">
                  {editId ? "Update contact details" : "Add a new contact to your CRM"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[2px] p-2 text-foreground/50 hover:bg-surface-cream hover:text-foreground focus-ring-warm"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <section>
              <h3 className="text-caption uppercase tracking-wide text-foreground/60 mb-3 flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Info
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-caption text-foreground/70">
                    First Name <span className="text-mistral-orange">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    id="firstName"
                    type="text"
                    value={values.firstName}
                    onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
                    required
                    className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-caption text-foreground/70">
                    Last Name <span className="text-mistral-orange">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={values.lastName}
                    onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
                    required
                    className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                    aria-required="true"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-caption text-foreground/70">
                    <Mail className="inline h-3 w-3 mr-1" /> Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-caption text-foreground/70">
                    <Phone className="inline h-3 w-3 mr-1" /> Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
                    className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="mb-1.5 block text-caption text-foreground/70">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={values.country}
                    onChange={(e) => setValues((v) => ({ ...v, country: e.target.value }))}
                    placeholder="e.g. Germany"
                    className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-caption uppercase tracking-wide text-foreground/60 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Professional
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="role" className="mb-1.5 block text-caption text-foreground/70">
                    Role / Job Title
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={values.role}
                    onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
                    placeholder="e.g. VP of Sales"
                    className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                  />
                </div>

                <div className="relative">
                  <label className="mb-1.5 block text-caption text-foreground/70">
                    <Building2 className="inline h-3 w-3 mr-1" /> Company
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    className="flex w-full items-center justify-between rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm text-left hover:border-foreground/20 transition"
                    aria-haspopup="listbox"
                    aria-expanded={showCompanyDropdown}
                  >
                    <span className={selectedCompany ? "text-foreground" : "text-foreground/40"}>
                      {selectedCompany?.name ?? "Select a company..."}
                    </span>
                    <ChevronDown className="h-4 w-4 text-foreground/40" />
                  </button>

                  {showCompanyDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-[2px] border border-foreground/10 bg-surface-pure shadow-golden max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-foreground/10">
                        <input
                          type="text"
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          placeholder="Search companies..."
                          className="w-full rounded-[2px] border border-foreground/10 bg-background px-2 py-1.5 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                          autoFocus
                        />
                      </div>
                      <div role="listbox">
                        <button
                          type="button"
                          onClick={() => {
                            setValues((v) => ({ ...v, companyId: "" }));
                            setShowCompanyDropdown(false);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground/60 hover:bg-surface-cream text-left"
                          role="option"
                          aria-selected={!values.companyId}
                        >
                          <span className="text-foreground/30">— No company —</span>
                        </button>
                        {filteredCompanies.map((c) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => {
                              setValues((v) => ({ ...v, companyId: c._id }));
                              setShowCompanyDropdown(false);
                            }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition ${
                              values.companyId === c._id ? "bg-surface-cream text-mistral-orange" : "hover:bg-surface-cream"
                            }`}
                            role="option"
                            aria-selected={values.companyId === c._id}
                          >
                            <Building2 className="h-3.5 w-3.5 text-foreground/40" />
                            {c.name}
                          </button>
                        ))}
                        {filteredCompanies.length === 0 && (
                          <div className="px-3 py-2 text-sm text-foreground/40">
                            No companies found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-caption uppercase tracking-wide text-foreground/60 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Notes
              </h3>
              <textarea
                id="notes"
                value={values.notes}
                onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                placeholder="Any additional notes about this contact..."
                rows={4}
                className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 resize-none"
              />
            </section>
          </div>

          <div className="border-t border-foreground/10 p-4">
            <div className="flex items-center justify-between">
              {editId && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-sm text-foreground/50 hover:text-mistral-orange transition"
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[2px] border border-foreground/10 px-4 py-2 text-sm text-foreground/70 hover:bg-surface-cream transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !values.firstName.trim() || !values.lastName.trim()}
                  className="rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition disabled:opacity-50"
                >
                  {loading ? (editId ? "Saving..." : "Adding...") : (editId ? "Save Changes" : "Add Contact")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
