import { query } from "./_generated/server";

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      email: identity.email ?? null,
      name: identity.name ?? null,
      pictureUrl: identity.pictureUrl ?? null,
    };
  },
});
