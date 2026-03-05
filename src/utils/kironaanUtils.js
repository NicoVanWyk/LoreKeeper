const MACRON = { a:'ā', e:'ē', i:'ī', o:'ō', u:'ū' };
const UMLAUT = { a:'ä', e:'ë', i:'ï', o:'ö', u:'ü' };
const ACUTE  = { a:'á', e:'é', i:'í', o:'ó', u:'ú' };

export const getSpellingSuggestions = (text) => {
    const changes = [];
    const track = (from, to) => { if (!changes.find(c => c.from === from)) changes.push({ from, to }); };

    const out = text
        .replace(/([aeiou])\1/gi,         (m, v) => { const r = MACRON[v.toLowerCase()]; if (r) { track(m, r); return r; } return m; })
        .replace(/([aeiou])h/gi,          (m, v) => { const r = ACUTE[v.toLowerCase()];  if (r) { track(m, r); return r; } return m; })
        .replace(/([aeiou])-([aeiou])/gi, (m, v1, v2) => { const r = UMLAUT[v2.toLowerCase()]; if (r) { const repl = `${v1}-${r}`; track(m, repl); return repl; } return m; });

    return { suggested: out, changes };
};

// Consonant doubling: "nn" → "n\" (stored form); display decodes back to "nn"
export const getConsonantDoublingSuggestions = (text) => {
    const changes = [];
    const out = text.replace(/([bcdfghjklmnpqrstvwxyz])\1/gi, (m, c) => {
        const r = `${c.toLowerCase()}\\`;
        if (!changes.find(ch => ch.from === m.toLowerCase())) changes.push({ from: m, to: r });
        return r;
    });
    return { suggested: out, changes };
};

// Combined for Kironaan Composer only (vowel rules + consonant doubling)
export const getComposerSpellingSuggestions = (text) => {
    const vowel     = getSpellingSuggestions(text);
    const consonant = getConsonantDoublingSuggestions(vowel.suggested);
    return { suggested: consonant.suggested, changes: [...vowel.changes, ...consonant.changes] };
};

// Decodes stored form ("n\") to latin display form ("nn")
export const decodeKironaan = (str) =>
    (str || '').replace(/([bcdfghjklmnpqrstvwxyz])\\/gi, '$1$1');