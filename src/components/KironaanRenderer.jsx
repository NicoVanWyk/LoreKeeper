import React, {useMemo} from 'react';
import {
    parseSigils, buildCompound, normalize, computeTokenMeta,
    decodeKironaan, splitKironaanTokens, isConceptShortcut, resolveConceptShortcut
} from '../utils/kironaanUtils';

const displayType = (t) => t === 'NaN' ? 'Other' : t;
const FLOATING_PUNCT = ['.', ',', '(', ')', '+', '-', '/', '*', '='];

/**
 * KironaanRenderer - Unified component for rendering Kironaan text
 *
 * Props:
 * - englishText: The English source text
 * - wordSelections: Array of {word, termId} for explicit term selections
 * - terms: Array of all Kironaan terms
 * - mode: 'font' | 'latin' | 'both' - how to display
 * - showTooltips: boolean - whether to show translation tooltips on hover
 */
function KironaanRenderer({englishText, wordSelections = [], terms, mode = 'both', showTooltips = true}) {
    const nonPhraseTerms = terms.filter(t => t.type !== 'Phrases');

    const tokens = useMemo(() => splitKironaanTokens(englishText), [englishText]);

    const wordTokenIndices = useMemo(
        () => tokens.map((t, i) => {
            if (/^\s+$/.test(t)) return null;
            if (FLOATING_PUNCT.includes(t)) return null;
            return i;
        }).filter(i => i !== null),
        [tokens]
    );

    const tokenMeta = useMemo(() => computeTokenMeta(tokens, terms), [tokens, terms]);

    const findMatches = (base) => {
        const n = normalize(base);
        if (!n) return [];
        return nonPhraseTerms.filter(t =>
            t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n)
        );
    };

    const resolveByWordIdx = (wIdx) => {
        const sel = wordSelections?.[wIdx];
        const tIdx = wordTokenIndices[wIdx];
        if (tIdx === undefined) return null;

        const {base, isConceptShortcut: isConcept} = parseSigils(tokens[tIdx]);

        if (isConcept) {
            return resolveConceptShortcut(base);
        }

        if (sel?.termId) {
            const found = terms.find(t => t.id === sel.termId);
            if (found) return found;
        }

        const ms = findMatches(base);
        return ms[0] || {term: base, translation: null, type: null};
    };

    const renderItems = useMemo(() => {
        return tokens.map((tok, tIdx) => {
            // Preserve whitespace
            if (/^\s+$/.test(tok)) return {tIdx, type: 'space', output: tok};

            // Preserve floating punctuation
            if (FLOATING_PUNCT.includes(tok)) return {tIdx, type: 'punct', output: ` ${tok} `};

            const wIdx = wordTokenIndices.indexOf(tIdx);

            // Skip absorbed tokens (except phrase heads)
            if (tokenMeta.absorbed.has(tIdx) && !tokenMeta.phraseHead[tIdx]) {
                return {tIdx, type: 'skip'};
            }

            // Skip adverbs (they're part of verb compounds)
            if (tokenMeta.adverbOf[tIdx] !== undefined) {
                return {tIdx, type: 'skip'};
            }

            // Phrase head
            if (tokenMeta.phraseHead[tIdx]) {
                const pt = tokenMeta.phraseHead[tIdx];
                return {
                    tIdx,
                    type: 'phrase',
                    output: pt.term.toLowerCase(),
                    resolved: pt
                };
            }

            const {base, prefixes, hasPossession, isConceptShortcut: isConcept} = parseSigils(tok);

            // Concept shortcut
            if (isConcept) {
                const concept = resolveConceptShortcut(base);
                return {
                    tIdx,
                    type: 'concept',
                    output: concept.term,
                    resolved: concept
                };
            }

            // Regular word
            const resolved = resolveByWordIdx(wIdx);

            // Check for adverb compound
            const nextWI = wIdx + 1;
            const nextTI = wordTokenIndices[nextWI];
            let adverbTerm = null;
            if (nextTI !== undefined && tokenMeta.adverbOf[nextTI] === tIdx) {
                const advResolved = resolveByWordIdx(nextWI);
                adverbTerm = advResolved?.term || parseSigils(tokens[nextTI]).base;
            }

            const output = buildCompound(
                resolved?.term || base,
                prefixes,
                hasPossession,
                adverbTerm
            ).toLowerCase();

            return {
                tIdx,
                type: 'word',
                output,
                resolved
            };
        });
    }, [tokens, tokenMeta, wordSelections, terms, wordTokenIndices]); // eslint-disable-line

    const kironaan = renderItems.map(r => {
        if (r.type === 'space') return r.output;
        if (r.type === 'punct') return r.output;
        if (r.type === 'skip') return '';
        return r.output;
    }).join('');

    const kironaanDecoded = decodeKironaan(kironaan);

    if (mode === 'latin') {
        return (
            <div style={{fontSize: 16, lineHeight: 1.8, color: '#333', fontStyle: 'italic'}}>
                {kironaanDecoded}
            </div>
        );
    }

    if (mode === 'font') {
        return (
            <div className="KironaanFont" style={{fontSize: 20, lineHeight: 1.8}}>
                {renderItems.map((r, i) => {
                    if (r.type === 'space') return <span key={i}> </span>;
                    if (r.type === 'punct') return <span key={i}>{r.output}</span>;
                    if (r.type === 'skip') return null;

                    const fontOutput = r.output || '';
                    const decodedOutput = decodeKironaan(fontOutput);
                    const tip = showTooltips && r.resolved?.translation
                        ? `${r.resolved.translation} · ${decodedOutput} · ${displayType(r.resolved.type || '')}`
                        : null;

                    return (
                        <span key={i} title={tip || undefined}
                              style={{cursor: tip ? 'help' : 'default'}}>
                            {fontOutput}{' '}
                        </span>
                    );
                })}
            </div>
        );
    }

    // mode === 'both'
    return (
        <div style={{
            padding: '10px 14px',
            background: '#f3f0ff',
            borderRadius: 6,
            border: '1px solid #d1c4e9'
        }}>
            <div className="KironaanFont" style={{fontSize: 18, lineHeight: 1.8, marginBottom: 4}}>
                {renderItems.map((r, i) => {
                    if (r.type === 'space') return <span key={i}> </span>;
                    if (r.type === 'punct') return <span key={i}>{r.output}</span>;
                    if (r.type === 'skip') return null;

                    const fontOutput = r.output || '';
                    const decodedOutput = decodeKironaan(fontOutput);
                    const tip = showTooltips && r.resolved?.translation
                        ? `${r.resolved.translation} · ${decodedOutput} · ${displayType(r.resolved.type || '')}`
                        : null;

                    return (
                        <span key={i} title={tip || undefined}
                              style={{cursor: tip ? 'help' : 'default'}}>
                            {fontOutput}{' '}
                        </span>
                    );
                })}
            </div>
            <div style={{fontSize: 13, color: '#666', fontStyle: 'italic'}}>
                {kironaanDecoded}
            </div>
        </div>
    );
}

export default KironaanRenderer;