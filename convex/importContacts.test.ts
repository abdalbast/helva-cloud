/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const USER1 = { tokenIdentifier: "https://provider.test|user1", email: "user1@test.com" };
const USER2 = { tokenIdentifier: "https://provider.test|user2", email: "user2@test.com" };

const SIX_CONTACT_FIXTURE = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@acme-import.test",
    company: "Acme Corp",
    country: "US",
  },
  {
    firstName: "Sarah",
    lastName: "Jones",
    email: "sarah.jones@acme-import.test",
    company: "ACME CORP",
    country: "US",
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@globex-import.test",
    company: "Globex GmbH",
    country: "DE",
  },
  {
    firstName: "Aisha",
    lastName: "Khan",
    email: "aisha.khan@globex-import.test",
    company: "globex gmbh",
    country: "DE",
  },
  {
    firstName: "Lea",
    lastName: "Chen",
    email: "lea.chen@initech-import.test",
    company: "Initech",
    country: "CN",
  },
  {
    firstName: "Omar",
    lastName: "Hassan",
    email: "omar.hassan@initech-import.test",
    company: "INITECH",
    country: "IQ",
  },
] as const;

describe("importContacts.importMany", () => {
  test("imports the six-contact fixture once and skips it on rerun", async () => {
    const t = convexTest(schema, modules);

    const firstResult = await t.withIdentity(USER1).action(
      api.importContacts.importMany,
      { contacts: [...SIX_CONTACT_FIXTURE] },
    );
    expect(firstResult).toEqual({ created: 6, skipped: 0, failed: 0 });

    const secondResult = await t.withIdentity(USER1).action(
      api.importContacts.importMany,
      { contacts: [...SIX_CONTACT_FIXTURE] },
    );
    expect(secondResult).toEqual({ created: 0, skipped: 6, failed: 0 });

    const importedContacts = await t.withIdentity(USER1).query(api.contacts.list, {});
    expect(importedContacts).toHaveLength(6);
    expect(importedContacts.map((contact) => contact.email).sort()).toEqual(
      SIX_CONTACT_FIXTURE.map((contact) => contact.email).sort(),
    );

    const importedCompanies = await t.withIdentity(USER1).query(api.companies.list, {});
    expect(importedCompanies).toHaveLength(3);
    expect(importedCompanies.map((company) => company.name).sort()).toEqual(
      ["Acme Corp", "Globex GmbH", "Initech"].sort(),
    );

    const otherUsersContacts = await t.withIdentity(USER2).query(api.contacts.list, {});
    expect(otherUsersContacts).toEqual([]);
  });

  test("fails when called without an authenticated identity", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.action(api.importContacts.importMany, { contacts: [...SIX_CONTACT_FIXTURE] }),
    ).rejects.toThrow(/Unauthenticated/);
  });
});
