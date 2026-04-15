"use client";

import { useId, useRef, useState } from "react";
import { useConvexAuth, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { X, FileText, Link, Upload, Sparkles, Check, AlertCircle, Mail } from "lucide-react";
import { parseEmails, type ParsedEmailContact } from "@/lib/parse-emails";
import { useAppQuery } from "@/lib/app-data";
import { localGetAll, localCreate, localCreateMany } from "@/lib/local-store";

type Tab = "paste" | "emails" | "url" | "file";

type ExtractedContact = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  country?: string;
  notes?: string;
  _selected?: boolean;
  _companyId?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ImportDialog({ open, onClose }: Props) {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const isGuest = !isAuthenticated && !isAuthLoading;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [activeTab, setActiveTab] = useState<Tab>("emails");
  const [pasteText, setPasteText] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedContact[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const parseFromText = useAction(api.importContacts.parseFromText);
  const importMany = useAction(api.importContacts.importMany);
  const existingContacts = useAppQuery(api.contacts.list, "contacts") ?? [];

  if (!open) return null;

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "emails" && emailsText.trim()) {
        const results = parseEmails(emailsText);
        if (results.length === 0) {
          setError("No valid email addresses found.");
        } else {
          setExtracted(results.map((r: ParsedEmailContact) => ({
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            company: r.company || undefined,
            country: r.country || undefined,
            _selected: true,
          })));
        }
      } else if (activeTab === "paste" && pasteText.trim()) {
        if (isGuest) {
          // Guest fallback: extract emails from pasted text
          const emailResults = parseEmails(pasteText);
          if (emailResults.length === 0) {
            setError("No contacts found. Try pasting email addresses or use the Emails tab.");
          } else {
            setExtracted(emailResults.map((r: ParsedEmailContact) => ({
              firstName: r.firstName,
              lastName: r.lastName,
              email: r.email,
              company: r.company || undefined,
              country: r.country || undefined,
              _selected: true,
            })));
          }
        } else {
          const results = await parseFromText({ text: pasteText });
          setExtracted(results.map((r: ExtractedContact) => ({ ...r, _selected: true })));
        }
      } else if (activeTab === "url" && url.trim()) {
        setError("URL extraction coming soon. Use paste or emails for now.");
      } else if (activeTab === "file" && file) {
        setError("File import coming soon. Use paste or emails for now.");
      }
    } catch {
      setError("Failed to parse. Try a different format.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!extracted) return;

    setLoading(true);
    setError(null);

    const selected = extracted.filter(c => c._selected);
    const contacts = selected.map(({ firstName, lastName, email, phone, role, company, country, notes }) => ({
      firstName,
      lastName,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(role ? { role } : {}),
      ...(company ? { company } : {}),
      ...(country ? { country } : {}),
      ...(notes ? { notes } : {}),
    }));

    try {
      if (isGuest) {
        // Guest mode: import directly into localStorage
        const existingEmails = new Set(
          localGetAll("contacts")
            .map((c) => (c.email as string)?.toLowerCase())
            .filter(Boolean),
        );

        const toCreate = contacts.filter(
          (c) => !c.email || !existingEmails.has(c.email.toLowerCase()),
        );

        // Auto-create companies from contacts
        const existingCompanies = localGetAll("companies");
        const companyMap = new Map(
          existingCompanies.map((co) => [(co.name as string).toLowerCase(), co._id]),
        );
        for (const c of toCreate) {
          if (c.company && !companyMap.has(c.company.toLowerCase())) {
            const id = localCreate("companies", { name: c.company });
            companyMap.set(c.company.toLowerCase(), id);
          }
        }

        const rows = toCreate.map((c) => ({
          ...c,
          companyId: c.company ? companyMap.get(c.company.toLowerCase()) ?? null : null,
        }));
        localCreateMany("contacts", rows);

        setLoading(false);
        setImported(true);
        setTimeout(() => {
          onClose();
          setImported(false);
          setExtracted(null);
          setPasteText("");
          setEmailsText("");
          setUrl("");
          setFile(null);
        }, 1500);
        return;
      }

      // Authenticated mode: use Convex action
      const { created, failed } = await importMany({ contacts });

      if (created === 0 && failed > 0) {
        setError(`Import failed for all ${failed} contacts. Please try again.`);
        setLoading(false);
        return;
      }

      setLoading(false);
      setImported(true);
      setTimeout(() => {
        onClose();
        setImported(false);
        setExtracted(null);
        setPasteText("");
        setEmailsText("");
        setUrl("");
        setFile(null);
      }, 1500);
    } catch {
      setError("Import failed. Please try again.");
      setLoading(false);
    }
  };

  const toggleSelection = (idx: number) => {
    if (!extracted) return;
    const updated = [...extracted];
    updated[idx]._selected = !updated[idx]._selected;
    setExtracted(updated);
  };

  const selectAll = (selected: boolean) => {
    if (!extracted) return;
    setExtracted(extracted.map(c => ({ ...c, _selected: selected })));
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const selectedCount = extracted?.filter((contact) => contact._selected).length ?? 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-foreground/10 bg-surface-pure shadow-golden animate-slide-in-right">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
            <div>
              <h2 className="text-sm font-normal">Import Contacts</h2>
              <p className="text-caption text-foreground/50">AI-powered contact extraction</p>
            </div>
            <button onClick={onClose} className="rounded-[2px] p-2 text-foreground/50 hover:bg-surface-cream">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!extracted ? (
            <>
              <div className="border-b border-foreground/10">
                <div className="flex">
                  {([
                    { id: "emails", label: "Emails", icon: Mail },
                    { id: "paste", label: "Paste", icon: FileText },
                    { id: "url", label: "URL", icon: Link },
                    { id: "file", label: "File", icon: Upload },
                  ] as { id: Tab; label: string; icon: typeof FileText }[]).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm transition ${
                        activeTab === id
                          ? "border-b-2 border-mistral-orange text-mistral-orange"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6">
                {activeTab === "emails" && (
                  <div className="space-y-4">
                    <p className="text-caption text-foreground/60">
                      Paste a list of email addresses (one per line). Names, companies, and countries will be auto-derived from the email.
                    </p>
                    <textarea
                      value={emailsText}
                      onChange={(e) => setEmailsText(e.target.value)}
                      placeholder={`john.smith@acme.com\nsarah.jones@globex.de\nmichael@initech.com`}
                      rows={12}
                      className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 font-mono"
                    />
                  </div>
                )}

                {activeTab === "paste" && (
                  <div className="space-y-4">
                    <p className="text-caption text-foreground/60">
                      Paste email signatures, vCards, or contact info. Our AI will extract names, emails, phones, and companies.
                    </p>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={`Example:\nJohn Smith\nVP of Sales at Acme Corp\njohn.smith@acme.com\n+1 (555) 123-4567`}
                      rows={12}
                      className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 font-mono"
                    />
                  </div>
                )}

                {activeTab === "url" && (
                  <div className="space-y-4">
                    <p className="text-caption text-foreground/60">
                      Paste a LinkedIn profile or company page URL to extract contact information.
                    </p>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full rounded-[2px] border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-mistral-orange/40 transition-colors"
                    />
                    <div className="rounded-[2px] border border-foreground/10 bg-surface-cream/50 p-4">
                      <p className="text-caption text-foreground/60">
                        <Sparkles className="inline h-3 w-3 mr-1" />
                        Coming soon: URL extraction will scrape and parse contact data from web pages.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "file" && (
                  <div className="space-y-4">
                    <p className="text-caption text-foreground/60">
                      Upload a CSV or Excel file with contact data. AI will auto-map columns.
                    </p>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-controls={fileInputId}
                      onClick={handleFilePick}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleFilePick();
                        }
                      }}
                      className="rounded-[2px] border-2 border-dashed border-foreground/20 bg-surface-cream/30 p-8 text-center outline-none transition hover:border-mistral-orange/30 hover:bg-surface-cream/50 focus-visible:border-mistral-orange/40 focus-visible:ring-2 focus-visible:ring-mistral-orange/20"
                    >
                      <Upload className="mx-auto h-8 w-8 text-foreground/40" />
                      <p className="mt-2 text-sm text-foreground/60">
                        Drag and drop a file here, or click to browse
                      </p>
                      <p className="text-caption text-foreground/40 mt-1">
                        CSV, Excel (.xlsx, .xls) supported
                      </p>
                      {file ? (
                        <p className="mt-3 text-sm text-foreground">{file.name}</p>
                      ) : null}
                      <input
                        id={fileInputId}
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                    <div className="rounded-[2px] border border-foreground/10 bg-surface-cream/50 p-4">
                      <p className="text-caption text-foreground/60">
                        <Sparkles className="inline h-3 w-3 mr-1" />
                        Coming soon: File import with AI-powered column mapping.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="border-t border-foreground/10 p-4">
                <button
                  onClick={handleParse}
                  disabled={
                    loading ||
                    (activeTab === "emails" && !emailsText.trim()) ||
                    (activeTab === "paste" && !pasteText.trim()) ||
                    (activeTab === "url" && !url.trim()) ||
                    (activeTab === "file" && !file)
                  }
                  className="w-full rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Parsing with AI...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Extract Contacts
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : imported ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                  <Check className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm">Contacts Imported!</p>
                <p className="text-caption text-foreground/60 mt-1">
                  {extracted.filter(c => c._selected).length} contacts added to your CRM
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-3">
                <p className="text-sm">
                  Found <span className="text-foreground">{extracted.length}</span> contacts
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAll(true)}
                    className="text-caption text-mistral-orange hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-foreground/30">|</span>
                  <button
                    onClick={() => selectAll(false)}
                    className="text-caption text-foreground/60 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {extracted.map((contact, idx) => {
                  const isDuplicate = contact.email && existingContacts.some(c => 
                    c.email?.toLowerCase() === contact.email?.toLowerCase()
                  );
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelection(idx)}
                      className={`rounded-[2px] border p-3 cursor-pointer transition ${
                        contact._selected
                          ? "border-mistral-orange bg-mistral-orange/5"
                          : "border-foreground/10 bg-surface-pure"
                      } ${isDuplicate ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={contact._selected}
                          onChange={() => toggleSelection(idx)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm">
                              {contact.firstName} {contact.lastName}
                            </p>
                            {isDuplicate && (
                              <span className="text-caption text-foreground/50">(duplicate)</span>
                            )}
                          </div>
                          <div className="text-caption text-foreground/60 mt-0.5">
                            {contact.role && <span>{contact.role}</span>}
                            {contact.role && contact.company && <span> at </span>}
                            {contact.company && <span>{contact.company}</span>}
                          </div>
                          <div className="text-caption text-foreground/50 mt-1">
                            {contact.email && <span className="mr-3">{contact.email}</span>}
                            {contact.phone && <span>{contact.phone}</span>}
                            {contact.country && <span className="ml-3">{contact.country}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-foreground/10 p-4">
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setExtracted(null)}
                    className="rounded-[2px] border border-foreground/10 px-4 py-2 text-sm text-foreground/70 hover:bg-surface-cream transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || selectedCount === 0}
                    className="flex-1 rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition disabled:opacity-50"
                  >
                    {loading ? "Importing..." : `Import ${selectedCount} Contacts`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
