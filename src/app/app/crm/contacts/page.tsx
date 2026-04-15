"use client";

import { useState } from "react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { DataTable, type Column } from "@/components/data-table";
import { ContactFormSheet } from "@/components/contact-form-sheet";
import { ImportDialog } from "@/components/import-dialog";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";

type Contact = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  companyId: string | null;
  companyName: string | null;
  country: string | null;
  notes: string | null;
};

type ContactFormValues = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  companyId?: string;
  country?: string;
  notes?: string;
};

const baseColumns: Column<Contact>[] = [
  { key: "firstName", label: "First Name", sortable: true },
  { key: "lastName", label: "Last Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "companyName", label: "Company", sortable: true },
  { key: "country", label: "Country" },
];

export default function ContactsPage() {
  const contacts = useAppQuery(api.contacts.list, "contacts") ?? [];
  const createContact = useAppMutation(api.contacts.create, "contacts", "create");
  const updateContact = useAppMutation(api.contacts.update, "contacts", "update");
  const removeContact = useAppMutation(api.contacts.remove, "contacts", "remove");

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<ContactFormValues | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ContactFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        companyId: values.companyId ? (values.companyId as Id<"companies">) : undefined,
      };
      if (editId) {
        await updateContact({ id: editId as Id<"contacts">, ...payload });
      } else {
        await createContact(payload);
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editId || !confirm("Delete this contact?")) return;
    await removeContact({ id: editId as Id<"contacts"> });
    setShowForm(false);
    setEditId(null);
  };

  const openEdit = (c: Contact) => {
    setInitialValues({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email ?? "",
      phone: c.phone ?? "",
      role: c.role ?? "",
      companyId: c.companyId ?? "",
      country: c.country ?? "",
      notes: c.notes ?? "",
    });
    setEditId(c._id);
    setShowForm(true);
  };

  return (
    <div>
      <div>
        <Link href="/app/crm" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
          ← CRM
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-card-title">Contacts</h1>
          <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1 rounded-[2px] border border-foreground/20 px-3 py-1.5 text-sm text-foreground/70 hover:bg-surface-cream transition"
          >
            <Upload className="h-4 w-4" /> Import
          </button>
          <button
            onClick={() => { setInitialValues(undefined); setEditId(null); setShowForm(true); }}
            className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" /> Add Contact
          </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            ...baseColumns,
            {
              key: "_actions",
              label: "",
              render: (c) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this contact?")) {
                      removeContact({ id: c._id as Id<"contacts"> });
                    }
                  }}
                  className="text-caption text-foreground/40 hover:text-mistral-orange"
                >
                  Delete
                </button>
              ),
            },
          ]}
          data={contacts}
          keyFn={(c) => c._id}
          onRowClick={(c) => openEdit(c as Contact)}
        />
      </div>

      <ContactFormSheet
        key={editId ?? "new-contact"}
        open={showForm}
        editId={editId}
        initialValues={initialValues}
        onClose={() => { setShowForm(false); setEditId(null); }}
        onSubmit={handleSubmit}
        onDelete={editId ? handleDelete : undefined}
        loading={loading}
      />

      <ImportDialog open={showImport} onClose={() => setShowImport(false)} />
    </div>
  );
}
