import nlp from 'compromise';

const MACRON = {a: 'ā', e: 'ē', i: 'ī', o: 'ō', u: 'ū'};
const UMLAUT = {a: 'ä', e: 'ë', i: 'ï', o: 'ö', u: 'ü'};
const ACUTE = {a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú'};

export const SIGIL_PREFIXES = [
    {sigil: '!!', prefix: 'Grésali', order: 4, label: 'Degree (3rd)', color: '#6d4c41'},
    {sigil: '!', prefix: 'Gré', order: 4, label: 'Degree (2nd)', color: '#8d6e63'},
    {sigil: '?', prefix: 'Sók', order: 1, label: 'Question', color: '#1565c0'},
    {sigil: '*', prefix: 'Dis', order: 2, label: 'Plural', color: '#2e7d32'},
    {sigil: '^', prefix: 'Ki', order: 3, label: 'Negative', color: '#c62828'},
    {sigil: '#', prefix: 'Pó', order: 5, label: 'Past', color: '#6a1b9a'},
    {sigil: '&', prefix: 'Tó', order: 5, label: 'Future', color: '#00695c'},
];
export const SIGIL_SUFFIX = {sigil: '@', suffix: 'Orsik', order: 8, label: 'Possession', color: '#e65100'};

export const normalize = (w) => w.toLowerCase().replace(/[^a-z]/gi, '');

export const parseSigils = (tok) => {
    let rest = tok;
    const prefixes = [];
    const hasPossession = rest.endsWith('@');
    if (hasPossession) rest = rest.slice(0, -1);
    let changed = true;
    while (changed) {
        changed = false;
        for (const sp of SIGIL_PREFIXES) {
            if (rest.startsWith(sp.sigil)) {
                if (!prefixes.find(p => p.sigil === sp.sigil)) prefixes.push(sp);
                rest = rest.slice(sp.sigil.length);
                changed = true;
                break;
            }
        }
    }
    rest = rest.replace(/^[.()\[\],;]+|[.()\[\],;]+$/g, '');
    return {base: rest, prefixes, hasPossession};
};

export const buildCompound = (baseTerm, prefixes, hasPossession, adverbTerm = null) => {
    const sorted = [...prefixes].sort((a, b) => a.order - b.order);
    const parts = [...sorted.map(p => p.prefix), baseTerm];
    if (adverbTerm) parts.push(adverbTerm);
    if (hasPossession) parts.push('Orsik');
    return parts.join('-');
};

export const computeTokenMeta = (tokens, terms) => {
    const wordIndices = tokens.map((tok, i) => /^\s+$/.test(tok) ? null : i).filter(i => i !== null);
    const absorbed = new Set(), adverbOf = {}, phraseHead = {};
    const phraseTerms = terms.filter(t => t.type === 'Phrases');

    const isTermVerb = (w) => {
        const n = normalize(w);
        return terms.some(t => t.type === 'Verb' && t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n));
    };
    const isTermAdverb = (w) => {
        const n = normalize(w);
        return terms.some(t => t.type === 'Adverb' && t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n));
    };

    for (let wi = 0; wi < wordIndices.length; wi++) {
        if (absorbed.has(wordIndices[wi])) continue;
        const i = wordIndices[wi];
        const {base} = parseSigils(tokens[i]);

        const sortedPhrases = [...phraseTerms].sort((a, b) => b.translation.split(/\s+/).length - a.translation.split(/\s+/).length);
        let phraseMatched = false;
        for (const pt of sortedPhrases) {
            // Check each comma-separated meaning
            const meanings = pt.translation.split(/\s*,\s*/);
            for (const meaning of meanings) {
                const pw = meaning.toLowerCase().split(/\s+/);
                if (pw.length < 2 || wi + pw.length > wordIndices.length) continue;
                if (pw.every((w, j) => normalize(parseSigils(tokens[wordIndices[wi + j]]).base) === normalize(w))) {
                    phraseHead[i] = pt;
                    for (let j = 1; j < pw.length; j++) absorbed.add(wordIndices[wi + j]);
                    wi += pw.length - 1;
                    phraseMatched = true;
                    break;
                }
            }
            if (phraseMatched) break;
        }
        if (phraseMatched) continue;

        if (normalize(base) === 'to' && wi + 1 < wordIndices.length) {
            const {base: nextBase} = parseSigils(tokens[wordIndices[wi + 1]]);
            if (isTermVerb(nextBase)) {
                absorbed.add(i);
                continue;
            }
        }
        if (wi > 0 && isTermAdverb(base)) {
            const prevI = wordIndices[wi - 1];
            if (!absorbed.has(prevI)) {
                const {base: prevBase} = parseSigils(tokens[prevI]);
                if (isTermVerb(prevBase)) adverbOf[i] = prevI;
            }
        }
    }
    return {absorbed, adverbOf, phraseHead};
};

export const lcsWordDiff = (oldWords, newWords, oldSelections) => {
    const n = oldWords.length, m = newWords.length;
    const dp = Array.from({length: n + 1}, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++)
        for (let j = 1; j <= m; j++)
            dp[i][j] = normalize(oldWords[i - 1]) === normalize(newWords[j - 1])
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);

    const mapping = new Array(m).fill(-1);
    let i = n, j = m;
    while (i > 0 && j > 0) {
        if (normalize(oldWords[i - 1]) === normalize(newWords[j - 1])) {
            mapping[j - 1] = i - 1;
            i--;
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
        else j--;
    }

    return newWords.map((w, idx) => {
        const oldIdx = mapping[idx];
        if (oldIdx === -1 || !oldSelections[oldIdx]) return {word: w, termId: null};
        return {word: w, termId: oldSelections[oldIdx].termId};
    });
};

export const getSpellingSuggestions = (text) => {
    const changes = [];
    const track = (from, to) => {
        if (!changes.find(c => c.from === from)) changes.push({from, to});
    };
    const out = text
        .replace(/([aeiou])\1/gi, (m, v) => {
            const r = MACRON[v.toLowerCase()];
            if (r) {
                track(m, r);
                return r;
            }
            return m;
        })
        .replace(/([aeiou])h/gi, (m, v) => {
            const r = ACUTE[v.toLowerCase()];
            if (r) {
                track(m, r);
                return r;
            }
            return m;
        })
        .replace(/([aeiou])-([aeiou])/gi, (m, v1, v2) => {
            const r = UMLAUT[v2.toLowerCase()];
            if (r) {
                const repl = `${v1}-${r}`;
                track(m, repl);
                return repl;
            }
            return m;
        });
    return {suggested: out, changes};
};

export const getConsonantDoublingSuggestions = (text) => {
    const changes = [];
    const out = text.replace(/([bcdfghjklmnpqrstvwxyz])\1/gi, (m, c) => {
        const r = `${c.toLowerCase()}\\`;
        if (!changes.find(ch => ch.from === m.toLowerCase())) changes.push({from: m, to: r});
        return r;
    });
    return {suggested: out, changes};
};

export const getComposerSpellingSuggestions = (text) => {
    const vowel = getSpellingSuggestions(text);
    const consonant = getConsonantDoublingSuggestions(vowel.suggested);
    return {suggested: consonant.suggested, changes: [...vowel.changes, ...consonant.changes]};
};

export const decodeKironaan = (str) =>
    (str || '').replace(/([bcdfghjklmnpqrstvwxyz])\\/gi, '$1$1');

// ── Partial phrase matching ───────────────────────────────────
// Each comma-separated meaning is checked independently.
// Stores matchedMeaning so callers know exactly which words to highlight/replace.
export const findPartialPhraseMatches = (tokens, terms) => {
    const wordTokens = tokens.filter(t => !/^\s+$/.test(t));
    const wordBases = wordTokens.map(t => normalize(parseSigils(t).base));

    return terms
        .filter(t => t.type === 'Phrases')
        .flatMap(pt => {
            const meanings = pt.translation.split(/\s*,\s*/);
            for (const meaning of meanings) {
                const phraseWords = meaning.toLowerCase().split(/\s+/).map(normalize);
                if (phraseWords.length < 2) continue;
                const minMatch = Math.max(2, Math.ceil(phraseWords.length / 2));
                const matched = phraseWords.filter(pw => wordBases.includes(pw));
                const missing = phraseWords.filter(pw => !wordBases.includes(pw));
                if (matched.length < minMatch) continue;

                // Replace matched tokens in text order with the full matched meaning,
                // dropping duplicates so computeTokenMeta can absorb the complete phrase.
                const apply = (text) => {
                    const toks = text.split(/(\s+)/);
                    let phraseInserted = false;
                    const out = toks.map(tok => {
                        if (/^\s+$/.test(tok)) return tok;
                        const base = normalize(parseSigils(tok).base);
                        if (phraseWords.includes(base)) {
                            if (!phraseInserted) {
                                phraseInserted = true;
                                return meaning;
                            }
                            return '';
                        }
                        return tok;
                    });
                    return out.join('').replace(/\s{2,}/g, ' ').trim();
                };

                return [{phrase: pt, matched, missing, matchedMeaning: meaning, apply}];
            }
            return [];
        });
};

// ── Grammar suggestions ───────────────────────────────────────
export const analyzeGrammarSuggestions = (text) => {
    if (!text.trim()) return [];
    const suggestions = [];
    const doc = nlp(text);
    const trimmed = text.trimEnd();

    // Past-tense verbs → # prefix
    doc.verbs().forEach(phrase => {
        const verbText = phrase.text().trim();
        if (!verbText) return;
        const rawToken = text.split(/\s+/).find(t => normalize(t) === normalize(verbText));
        if (!rawToken || /^[?*^#&!]/.test(rawToken)) return;
        if (phrase.has('#PastTense')) {
            const conjugated = nlp(verbText).verbs().conjugate()[0];
            const base = conjugated?.Infinitive?.toLowerCase();
            if (base && base !== verbText.toLowerCase()) {
                suggestions.push({
                    id: `past-${verbText}`,
                    message: `"${verbText}" is past tense → #${base}`,
                    type: 'tense',
                    apply: (t) => t.replace(new RegExp(`(?<![?*^#&!])\\b${verbText}\\b`, 'gi'), `#${base}`)
                });
            }
        }
    });

    // "will + verb" → & prefix, drop "will"
    const willMatch = text.match(/\bwill\s+([a-z]+)\b/i);
    if (willMatch) {
        const futureVerb = willMatch[1].toLowerCase();
        const rawToken = text.split(/\s+/).find(t => normalize(t) === futureVerb);
        if (!rawToken || !/^[?*^#&!]/.test(rawToken)) {
            suggestions.push({
                id: `future-${futureVerb}`,
                message: `"will ${futureVerb}" is future tense → &${futureVerb}, drop "will"`,
                type: 'tense',
                apply: (t) => t.replace(new RegExp(`\\bwill\\s+${futureVerb}\\b`, 'gi'), `&${futureVerb}`)
            });
        }
    }

    // Trailing "?" → ? sigil on the main verb
    if (trimmed.endsWith('?')) {
        const mainVerbPhrase = doc.verbs().first();
        const mainVerbText = mainVerbPhrase.found ? mainVerbPhrase.text().trim() : null;
        const pastSuggestion = suggestions.find(s => s.type === 'tense');
        const targetVerbBase = pastSuggestion
            ? pastSuggestion.id.replace(/^(past|future)-/, '')
            : mainVerbText?.toLowerCase() || null;

        if (targetVerbBase) {
            suggestions.push({
                id: 'question-mark',
                message: `"?" at end — move as question sigil onto "${targetVerbBase}"`,
                type: 'punctuation',
                apply: (t) => {
                    let result = t.trimEnd();
                    if (result.endsWith('?')) result = result.slice(0, -1).trimEnd();
                    const escaped = targetVerbBase.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
                    const replaced = result.replace(
                        new RegExp(`([#&]?)\\b${escaped}\\b`, 'i'),
                        (_, sigil) => `?${sigil}${targetVerbBase}`
                    );
                    return replaced === result ? `?${result}` : replaced;
                }
            });
        }
    }

    return suggestions;
};