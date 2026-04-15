import crypto from "node:crypto";

export function timingSafeEqualString(left: string, right: string) {
  return (
    left.length === right.length &&
    crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right))
  );
}
