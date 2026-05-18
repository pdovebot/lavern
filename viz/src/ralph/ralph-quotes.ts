/**
 * Ralph's commentary — a rotating sample of catchphrases that show up
 * in the loop feed, plus a few legal-mode variants for flavor.
 */

export const RALPH_CATCHPHRASES = [
  "I'm helping!",
  "Me fail English? That's unpossible.",
  'My cat\'s breath smells like cat food.',
  "I bent my wookie.",
  "I'm a brick!",
  'Will the inside of a dog be the new outside?',
  "When I grow up, I'm going to Bovine University.",
  "The lawyer says I'm part man, part horse.",
  'I beat the smart kid!',
  "I'm a star!",
  "Me lawyer good. Me lawyer the law.",
] as const;

/** Legal-flavored Ralph riffs — keep him sounding like Ralph, doing law.
 *  Includes the canon Simpsons-comic lines (Ralph as Bart's defender):
 *  "Innosensical, your honor!", "Ladies and men of the jerky", "Two
 *  wrongs don't make a Bill of Rights!", "Do the dew process!", etc. */
export const RALPH_LEGAL_RIFFS = [
  // ── Canon (Simpsons comics) ─────────────────────────────────────
  'Innosensical, your honor!',
  'Ladies and men of the jerky.',
  'Bart Simpson is guilty. Guilty of being innocent!',
  'I had fingerprints all over me one day. Then teacher said finger painting was on my no-no list.',
  "Two wrongs don't make a Bill of Rights!",
  'Do the dew process!',
  "If the glove doesn't fit, you must be bit!",

  // ── Original Ralph-as-lawyer riffs ──────────────────────────────
  'I am lawyering!',
  "I'm reading the contract!",
  'The big words are confusing me but I keep going.',
  "Me fail to find every indemnity? That's unpossible.",
  'I see a penalty clause. I think.',
  'Force majeure! That sounds like a sandwich.',
  "I'm citing!",
  'Counsel rests his crayon.',
  "Objection, your honor — I'm sleepy.",
  'The defendant smells like cat food.',
  'I found a clause! It was hiding behind a paragraph.',
  "When I grow up I'm going to law school. Or Bovine University.",
  'My evidence is admissible. Probably.',
  'I won! Wait, did I win?',
  'Your honor, my crayon is bleeding.',
  'The contract said the word!',
  'I object! To what? Just everything.',
] as const;

/** Pick one at random. */
export function pickRalphQuote(seed?: number): string {
  const pool = [...RALPH_CATCHPHRASES, ...RALPH_LEGAL_RIFFS];
  const idx = seed != null ? seed % pool.length : Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/** Pick a sequence without immediate repeats — useful for the loop feed. */
export function pickRalphSequence(count: number): string[] {
  const pool = [...RALPH_CATCHPHRASES, ...RALPH_LEGAL_RIFFS];
  const out: string[] = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(Math.random() * pool.length);
    if (idx === last) idx = (idx + 1) % pool.length;
    out.push(pool[idx]);
    last = idx;
  }
  return out;
}
