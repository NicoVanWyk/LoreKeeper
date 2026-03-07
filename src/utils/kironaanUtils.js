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

export const NUMBER_TERMS = {
    'xás': 0,
    'brás': 1,
    'derás': 2,
    'qirás': 3,
    'esán': 4,
    'derán': 5,
    'sīkán': 6,
    'xekán': 7,
    'asī': 8,
    'asībrax': 9,
    'pósárasī': 16,
    'phosáderáquinasī': 24,
    'derásī': 32
};

const ENGLISH_NUMBERS = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16,
    'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000, 'million': 1000000
};

const normalizeKr = (w) => w.toLowerCase().trim().replace(/[^a-zāēīōūäëïöüáéíóú]/gi, '');

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
    const leadingMatch = rest.match(/^([.()\[\],;!?]+)/);
    const trailingMatch = rest.match(/([.()\[\],;!?]+)$/);
    const leadingPunct = leadingMatch ? leadingMatch[1] : '';
    const trailingPunct = trailingMatch ? trailingMatch[1] : '';
    rest = rest.replace(/^[.()\[\],;!?]+|[.()\[\],;!?]+$/g, '');
    return {base: rest, prefixes, hasPossession, leadingPunct, trailingPunct};
};

export const buildCompound = (baseTerm, prefixes, hasPossession, adverbTerm = null, leadingPunct = '', trailingPunct = '') => {
    const sorted = [...prefixes].sort((a, b) => a.order - b.order);
    const parts = [...sorted.map(p => p.prefix), baseTerm];
    if (adverbTerm) parts.push(adverbTerm);
    if (hasPossession) parts.push('Orsik');
    return `${leadingPunct}${parts.join('-')}${trailingPunct}`;
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

export const detectAllNlpTypes = (word) => {
    const doc = nlp(word);
    const types = [];
    if (doc.verbs().length) types.push('Verb');
    if (doc.adjectives().length) types.push('Adjective');
    if (doc.adverbs().length) types.push('Adverb');
    if (doc.nouns().length) types.push('Noun');
    return types.length > 0 ? types : ['Noun'];
};

export const findPartialPhraseMatches = (tokens, terms) => {
    const wordTokens = tokens.filter(t => !/^\s+$/.test(t) && t !== '-');
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

export const analyzeGrammarSuggestions = (text) => {
    if (!text.trim()) return [];
    const suggestions = [];
    const doc = nlp(text);
    const trimmed = text.trimEnd();

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

export const analyzeWordOrderViolations = (tokens, terms, selectedMeanings) => {
    const violations = [];
    const wordIndices = tokens.map((t, i) => /^\s+$/.test(t) || t === '-' ? null : i).filter(i => i !== null);

    const resolveType = (tokenIdx, wordIdx) => {
        const {base} = parseSigils(tokens[tokenIdx]);
        const sel = selectedMeanings[wordIdx];
        if (sel?.termId) {
            const found = terms.find(t => t.id === sel.termId);
            if (found) return found.type;
        }
        const n = normalize(base);
        const matches = terms.filter(t =>
            t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n)
        );
        return matches[0]?.type || null;
    };

    const getBase = (tokenIdx) => parseSigils(tokens[tokenIdx]).base;

    let lastVerbIdx = -1, lastVerbWord = null;
    let lastNounIdx = -1, lastNounWord = null;

    wordIndices.forEach((tokenIdx, wordIdx) => {
        const type = resolveType(tokenIdx, wordIdx);
        const base = getBase(tokenIdx);

        if (type === 'Verb') {
            lastVerbIdx = tokenIdx;
            lastVerbWord = base;
        }

        if (type === 'Noun') {
            lastNounIdx = tokenIdx;
            lastNounWord = base;
        }

        if (type === 'Pronouns' && lastVerbIdx > -1 && lastVerbIdx < tokenIdx) {
            violations.push({
                id: `pronoun-${tokenIdx}`,
                message: `"${base}": pronoun after verb — subject should precede verb`,
                type: 'word-order',
                word: base,
                verbWord: lastVerbWord,
                apply: (text) => {
                    const parts = text.split(/(\s+)/);
                    let verbIdx = -1, pronounIdx = -1;

                    for (let i = 0; i < parts.length; i++) {
                        if (normalize(parts[i]) === normalize(lastVerbWord)) verbIdx = i;
                        if (normalize(parts[i]) === normalize(base) && verbIdx !== -1 && verbIdx < i) {
                            pronounIdx = i;
                            break;
                        }
                    }

                    if (verbIdx === -1 || pronounIdx === -1) return text;

                    const result = [...parts];
                    const temp = result[verbIdx];
                    result[verbIdx] = result[pronounIdx];
                    result[pronounIdx] = temp;
                    return result.join('');
                }
            });
        }

        if (type === 'Adjective' && lastNounIdx > -1 && lastNounIdx < tokenIdx) {
            violations.push({
                id: `adjective-${tokenIdx}`,
                message: `"${base}": adjective after noun — move adjective before noun`,
                type: 'word-order',
                word: base,
                nounWord: lastNounWord,
                apply: (text) => {
                    const parts = text.split(/(\s+)/);
                    let nounIdx = -1, adjIdx = -1;

                    for (let i = 0; i < parts.length; i++) {
                        if (normalize(parts[i]) === normalize(lastNounWord)) nounIdx = i;
                        if (normalize(parts[i]) === normalize(base) && nounIdx !== -1 && nounIdx < i) {
                            adjIdx = i;
                            break;
                        }
                    }

                    if (nounIdx === -1 || adjIdx === -1) return text;

                    const result = [...parts];
                    const temp = result[nounIdx];
                    result[nounIdx] = result[adjIdx];
                    result[adjIdx] = temp;
                    return result.join('');
                }
            });
        }

        if (type === 'Adverb' && lastVerbIdx > -1 && lastVerbIdx < tokenIdx) {
            const prevTI = wordIndices[wordIdx - 1];
            if (prevTI !== lastVerbIdx) return;

            violations.push({
                id: `adverb-${tokenIdx}`,
                message: `"${base}": adverb after verb — move adverb before verb`,
                type: 'word-order',
                word: base,
                verbWord: lastVerbWord,
                apply: (text) => {
                    const parts = text.split(/(\s+)/);
                    let verbIdx = -1, advIdx = -1;

                    for (let i = 0; i < parts.length; i++) {
                        if (normalize(parts[i]) === normalize(lastVerbWord)) verbIdx = i;
                        if (normalize(parts[i]) === normalize(base) && verbIdx !== -1 && verbIdx < i) {
                            advIdx = i;
                            break;
                        }
                    }

                    if (verbIdx === -1 || advIdx === -1) return text;

                    const result = [...parts];
                    const temp = result[verbIdx];
                    result[verbIdx] = result[advIdx];
                    result[advIdx] = temp;
                    return result.join('');
                }
            });
        }
    });

    return violations;
};

export const parseEnglishNumber = (text) => {
    const words = text.toLowerCase().replace(/[^a-z\s0-9]/g, '').trim().split(/\s+/);
    
    if (words.length === 1) {
        const num = parseInt(words[0]);
        if (!isNaN(num)) return num;
    }
    
    let total = 0, current = 0;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word === 'and') continue;
        
        const value = ENGLISH_NUMBERS[word];
        if (value === undefined) return null;
        
        if (value >= 100) {
            if (current === 0) current = 1;
            current *= value;
            if (value >= 1000) {
                total += current;
                current = 0;
            }
        } else {
            current += value;
        }
    }
    
    return total + current;
};

export const buildKironaanNumber = (decimal) => {
    if (decimal === 0) return 'xás';
    
    for (const [term, value] of Object.entries(NUMBER_TERMS)) {
        if (value === decimal) return term;
    }
    
    const parts = [];
    let remaining = decimal;
    
    // Handle large powers of 8
    const powers = [];
    let temp = remaining;
    let pow = 0;
    while (temp >= 8) {
        temp = Math.floor(temp / 8);
        pow++;
    }
    
    if (pow >= 4) {
        const base = Math.floor(remaining / Math.pow(8, pow));
        if (base < 8) {
            const baseTerm = Object.keys(NUMBER_TERMS).find(k => NUMBER_TERMS[k] === base);
            const powTerm = Object.keys(NUMBER_TERMS).find(k => NUMBER_TERMS[k] === pow);
            if (baseTerm && powTerm) {
                parts.push(`${baseTerm}-ánn-${powTerm}`);
                remaining -= base * Math.pow(8, pow);
            }
        }
    }
    
    if (remaining >= 32) {
        const count = Math.floor(remaining / 32);
        if (count === 1) parts.push('derásī');
        else {
            const countTerm = Object.keys(NUMBER_TERMS).find(k => NUMBER_TERMS[k] === count);
            if (countTerm) parts.push(`${countTerm}-derásī`);
        }
        remaining %= 32;
    }
    
    if (remaining >= 16) {
        parts.push('pósárasī');
        remaining -= 16;
    }
    
    if (remaining >= 8) {
        const count = Math.floor(remaining / 8);
        if (count === 1) parts.push('asī');
        else {
            const countTerm = Object.keys(NUMBER_TERMS).find(k => NUMBER_TERMS[k] === count);
            if (countTerm) parts.push(`${countTerm}-asī`);
        }
        remaining %= 8;
    }
    
    if (remaining > 0) {
        const remainTerm = Object.keys(NUMBER_TERMS).find(k => NUMBER_TERMS[k] === remaining);
        if (remainTerm) parts.push(remainTerm);
    }
    
    return parts.join('-é-');
};

export const findNumberPhrases = (tokens) => {
    const suggestions = [];
    const wordIndices = tokens.map((t, i) => /^\s+$/.test(t) || t === '-' ? null : i).filter(i => i !== null);
    
    for (let start = 0; start < wordIndices.length; start++) {
        for (let len = 1; len <= Math.min(5, wordIndices.length - start); len++) {
            const indices = wordIndices.slice(start, start + len);
            const phrase = indices.map(i => parseSigils(tokens[i]).base).join(' ');
            
            const decimal = parseEnglishNumber(phrase);
            if (decimal !== null && decimal > 0) {
                const kironaan = buildKironaanNumber(decimal);
                
                suggestions.push({
                    startIdx: indices[0],
                    endIdx: indices[indices.length - 1],
                    englishPhrase: phrase,
                    decimal,
                    kironaan,
                    apply: (text) => {
                        const parts = text.split(/(\s+)/);
                        let replaced = false;
                        return parts.map((part, i) => {
                            if (i === indices[0] && !replaced) {
                                replaced = true;
                                return kironaan;
                            }
                            if (indices.includes(i) && i !== indices[0]) return '';
                            return part;
                        }).join('').replace(/\s{2,}/g, ' ').trim();
                    }
                });
                break;
            }
        }
    }
    
    return suggestions;
};

export const parseKironaanNumber = (kironaanStr) => {
    const segments = kironaanStr.toLowerCase().split('-').map(s => s.trim());
    let total = 0;
    let current = null;
    let nextOp = null;
    
    for (const seg of segments) {
        const n = normalizeKr(decodeKironaan(seg));
        
        if (n === 'é' || n === 'poquin') {
            if (current !== null) total += current;
            current = null;
            nextOp = 'add';
            continue;
        }
        
        if (n === 'ann' || n === 'toran') {
            nextOp = 'power';
            continue;
        }
        
        const value = NUMBER_TERMS[n];
        if (value === undefined) return null;
        
        if (nextOp === 'power') {
            current = Math.pow(current, value);
            nextOp = null;
        } else if (nextOp === 'add') {
            total += value;
            current = null;
            nextOp = null;
        } else if (current === null) {
            current = value;
        } else {
            current *= value;
        }
    }
    
    if (current !== null) total += current;
    return total;
};

export const isNumberTerm = (term) => {
    const n = normalizeKr(decodeKironaan(term));
    return NUMBER_TERMS[n] !== undefined || 
           n === 'é' || 
           n === 'poquin' || 
           n === 'ann' || 
           n === 'toran';
};