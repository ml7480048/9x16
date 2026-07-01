type ClassValue = string | number | null | undefined | false | ClassValue[];

function flatten(input: ClassValue, acc: string[]) {
  if (!input) return;
  if (Array.isArray(input)) {
    input.forEach((v) => flatten(v, acc));
    return;
  }
  acc.push(String(input));
}

/** Minimal classNames joiner — no dedupe/merge, just filters falsy values. */
export function cn(...inputs: ClassValue[]): string {
  const acc: string[] = [];
  inputs.forEach((v) => flatten(v, acc));
  return acc.join(" ");
}
