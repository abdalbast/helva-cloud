"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

type ExtractedContact = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  country?: string;
  notes?: string;
};

export const parseFromText = action({
  args: { text: v.string() },
  handler: async (ctx, { text }): Promise<ExtractedContact[]> => {
    // Simple extraction without LLM for now - pattern matching approach
    const contacts: ExtractedContact[] = [];
    
    // Split by common delimiters (newlines, double newlines)
    const blocks = text.split(/\n\n+|\r\n\r\n+/).filter(b => b.trim().length > 10);
    
    for (const block of blocks) {
      const contact = extractContactFromBlock(block);
      if (contact && contact.firstName && contact.lastName) {
        contacts.push(contact);
      }
    }
    
    // If no contacts found with block splitting, try whole text
    if (contacts.length === 0) {
      const contact = extractContactFromBlock(text);
      if (contact && contact.firstName && contact.lastName) {
        contacts.push(contact);
      }
    }
    
    return contacts;
  },
});

function extractContactFromBlock(text: string): ExtractedContact | null {
  const lines = text.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
  
  let firstName = "";
  let lastName = "";
  let email = "";
  let phone = "";
  let role = "";
  let company = "";
  let notes = "";
  
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];
  
  // Extract phone (various formats)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0];
  
  // Try to find name patterns
  // Pattern: "First Last" at start or after labels like "Name:"
  const namePatterns = [
    /(?:^|\n)Name[:\s]+([A-Z][a-z]+)\s+([A-Z][a-z]+)/i,
    /(?:^|\n)([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\s*-|\s*\(|\s*at\s+|\s*,|\s*\n)/,
    /(?:^|\n)([A-Z][a-z]+)\s+([A-Z][a-z]+)(?:\r?\n|$)/,
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      firstName = match[1];
      lastName = match[2];
      break;
    }
  }
  
  // If no name found, try capitalized words at start
  if (!firstName && lines.length > 0) {
    const firstLine = lines[0];
    const nameMatch = firstLine.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/);
    if (nameMatch) {
      firstName = nameMatch[1];
      lastName = nameMatch[2];
    }
  }
  
  // Extract role/job title
  const rolePatterns = [
    /(?:^|\n)(?:Role|Title|Position|Job)[:\s]+([^\n]+)/i,
    /\b(VP\s+of\s+[^,\n]+|Senior\s+[^,\n]+|Head\s+of\s+[^,\n]+|Director\s+of\s+[^,\n]+|Manager\s+[^,\n]+|CEO|CTO|CFO|COO|Founder|Co-Founder)\b/i,
  ];
  
  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match) {
      role = match[1].trim();
      break;
    }
  }
  
  // Extract company
  const companyPatterns = [
    /(?:^|\n)(?:Company|Organization|Org|at\s+the\s+)([:\s]+)?([^\n,]+)/i,
    /\bat\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s*$|\s*\n|\s*-)/,
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const potentialCompany = (match[2] || match[1])?.trim();
      if (potentialCompany && potentialCompany.length > 1 && potentialCompany.length < 50) {
        company = potentialCompany;
        break;
      }
    }
  }
  
  // Remaining lines as notes (excluding identified fields)
  const noteLines = lines.filter(l => 
    l !== `${firstName} ${lastName}` &&
    l !== email &&
    l !== phone &&
    l !== role &&
    l !== company &&
    !l.includes(email) &&
    !l.includes(phone) &&
    !l.toLowerCase().includes('name:') &&
    !l.toLowerCase().includes('email:') &&
    !l.toLowerCase().includes('phone:')
  );
  
  if (noteLines.length > 0) {
    notes = noteLines.join('\n').substring(0, 500);
  }
  
  if (!firstName || !lastName) return null;
  
  return {
    firstName,
    lastName,
    ...(email && { email }),
    ...(phone && { phone }),
    ...(role && { role }),
    ...(company && { company }),
    ...(notes && { notes }),
  };
}
