import React, {useState, useEffect, useRef, useMemo} from 'react';
import {addKironaanTerm, getAllKironaanTerms} from '../services/kironaanService';
import {
    SIGIL_PREFIXES, SIGIL_SUFFIX, parseSigils, buildCompound, normalize, computeTokenMeta,
    lcsWordDiff, decodeKironaan, getComposerSpellingSuggestions, getSpellingSuggestions,
    analyzeGrammarSuggestions, findPartialPhraseMatches, analyzeWordOrderViolations,
    detectAllNlpTypes, findNumberPhrases, NUMBER_TERMS, isNumberTerm, parseKironaanNumber,
    splitKironaanTokens, isConceptShortcut, resolveConceptShortcut
} from '../utils/kironaanUtils';
import KironaanRenderer from '../components/KironaanRenderer';

const ADMIN_UID = 'baQCmZdQOna3KhFSjoTA3jt2Lw72';
const TYPES = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Conjunction', 'Prepositions', 'Pronouns', 'Number', 'Math', 'Phrases', 'Articles', 'Prefix', 'Suffix', 'Determiner', 'NaN'];
const POP_PAGE_SZ = 6;
const FLOATING_PUNCT = ['.', ',', '(', ')', '+', '-', '/', '*', '='];

const STATUS_COLOR = {matched: '#4caf50', partial: '#ff9800', unmatched: '#f44336', ambiguous: '#9c27b0'};
const STATUS_BG = {matched: '#e8f5e9', partial: '#fff3e0', unmatched: '#fce4ec', ambiguous: '#f3e5f5'};

const SEGMENT_ORDER_MAP = {
    'sók': {order: 1, label: 'Question'},
    'dis': {order: 2, label: 'Plural'},
    'ki': {order: 3, label: 'Negative'},
    'gré': {order: 4, label: 'Degree (2nd)'},
    'grésali': {order: 4, label: 'Degree (3rd)'},
    'pó': {order: 5, label: 'Past Tense'},
    'tó': {order: 5, label: 'Future Tense'},
    'orsik': {order: 8, label: 'Possession'},
};
const TYPE_ORDER = {Adjective: 5, Noun: 6, Verb: 6, Adverb: 7};
const ORDER_NAMES = ['', 'Question', 'Plural', 'Negative', 'Degree', 'Descriptor/Tense', 'Base', 'Adverb', 'Possession'];

const displayType = (t) => t === 'NaN' ? 'Other' : t;
const normalizeKr = (w) => w.toLowerCase().trim();

const fetchDictDef = async (word) => {
    try {
        const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!r.ok) return '';
        const d = await r.json();
        return d[0]?.meanings[0]?.definitions[0]?.definition || '';
    } catch {
        return '';
    }
};

const getSegmentInfo = (seg, terms) => {
    const n = normalizeKr(seg);
    const nDecoded = normalizeKr(decodeKironaan(seg));

    if (SEGMENT_ORDER_MAP[n] || SEGMENT_ORDER_MAP[nDecoded]) {
        const entry = SEGMENT_ORDER_MAP[n] || SEGMENT_ORDER_MAP[nDecoded];
        const {order, label} = entry;
        return {order, label, translation: label, type: 'Prefix', term: seg};
    }

    if (n === 'é' || nDecoded === 'poquin') return {
        order: null,
        label: 'Add',
        translation: 'plus',
        type: 'Operator',
        term: seg
    };
    if (n === 'ann' || nDecoded === 'ann' || n === 'toran' || nDecoded === 'toran') return {
        order: null,
        label: 'Power',
        translation: 'to the power of',
        type: 'Operator',
        term: seg
    };
    if (NUMBER_TERMS[n] !== undefined || NUMBER_TERMS[nDecoded] !== undefined) {
        const val = NUMBER_TERMS[n] ?? NUMBER_TERMS[nDecoded];
        return {order: null, label: 'Number', translation: val.toString(), type: 'Number', term: seg};
    }

    const match = terms.find(t => {
        const termNorm = normalizeKr(t.term);
        const termDecoded = normalizeKr(decodeKironaan(t.term));
        return termNorm === n || termDecoded === n || termNorm === nDecoded || termDecoded === nDecoded;
    });

    if (!match) return {order: null, label: 'Unknown', translation: null, type: 'Unknown', term: seg};
    return {
        order: TYPE_ORDER[match.type] ?? null,
        label: match.type,
        translation: match.translation,
        type: match.type,
        term: match.term
    };
};

const validateCompound = (segments, terms) => {
    const infos = segments.map(s => ({seg: s, ...getSegmentInfo(s, terms)}));
    const violations = [];
    for (let i = 1; i < infos.length; i++) {
        const prev = infos[i - 1], curr = infos[i];
        if (prev.order !== null && curr.order !== null && curr.order < prev.order)
            violations.push(
                `"${curr.seg}" (${ORDER_NAMES[curr.order] || curr.label}, step ${curr.order}) ` +
                `comes after "${prev.seg}" (${ORDER_NAMES[prev.order] || prev.label}, step ${prev.order}) — ` +
                `${ORDER_NAMES[curr.order]} must precede ${ORDER_NAMES[prev.order]}`
            );
    }
    return {infos, violations};
};

function SpellingBanner({changes, suggested, onApply}) {
    if (!changes.length) return null;
    return (
        <div style={{
            marginTop: 5,
            padding: '6px 10px',
            background: '#fff8e1',
            borderRadius: 5,
            border: '1px solid #ffc107',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap'
        }}>
            <div>
                <span style={{fontSize: 11, fontWeight: 600, color: '#e65100'}}>Suggest: </span>
                {changes.map((c, i) => (
                    <span key={i} style={{fontSize: 11, color: '#555', marginRight: 8}}>
                        <code style={{background: '#ffe082', padding: '1px 3px', borderRadius: 3}}>{c.from}</code>
                        {' → '}
                        <code style={{background: '#c8e6c9', padding: '1px 3px', borderRadius: 3}}>{c.to}</code>
                    </span>
                ))}
            </div>
            <button onClick={() => onApply(suggested)} style={{
                padding: '2px 10px',
                background: '#ffc107',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600
            }}>Apply
            </button>
        </div>
    );
}

function Chip({label, status, tooltip}) {
    const [show, setShow] = useState(false);
    const C = {
        ok: {bg: '#e8f5e9', border: '#4caf50', dot: '#4caf50'},
        warn: {bg: '#fff3e0', border: '#ff9800', dot: '#ff9800'},
        error: {bg: '#fce4ec', border: '#f44336', dot: '#f44336'},
        ambiguous: {bg: '#f3e5f5', border: '#9c27b0', dot: '#9c27b0'},
        unknown: {bg: '#f5f5f5', border: '#bbb', dot: '#bbb'}
    }[status] || {bg: '#f5f5f5', border: '#bbb', dot: '#bbb'};
    return (
        <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
              style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 14,
                  cursor: 'default',
                  fontSize: 14,
                  userSelect: 'none',
                  background: C.bg,
                  border: `1px solid ${C.border}`
              }}>
            {label}
            <span style={{width: 7, height: 7, borderRadius: '50%', background: C.dot, flexShrink: 0}}/>
            {show && tooltip && (
                <span style={{
                    position: 'absolute',
                    bottom: '120%',
                    left: 0,
                    zIndex: 200,
                    background: '#333',
                    color: 'white',
                    borderRadius: 5,
                    padding: '5px 8px',
                    fontSize: 12,
                    minWidth: 140,
                    maxWidth: 260,
                    whiteSpace: 'pre-line',
                    lineHeight: 1.5
                }}>
                    {tooltip}
                </span>
            )}
        </span>
    );
}

function SigilLegend() {
    const [open, setOpen] = useState(false);
    return (
        <div style={{marginBottom: 10}}>
            <button onClick={() => setOpen(o => !o)} style={{
                background: 'none',
                border: '1px solid #ccc',
                borderRadius: 5,
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: 13,
                color: '#555'
            }}>
                {open ? '▾' : '▸'} Prefix / Suffix shortcuts
            </button>
            {open && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginTop: 8,
                    padding: '10px 12px',
                    background: '#fafafa',
                    borderRadius: 6,
                    border: '1px solid #e0e0e0'
                }}>
                    {SIGIL_PREFIXES.map(s => (
                        <span key={s.sigil} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: 'white',
                            border: `1px solid ${s.color}`,
                            fontSize: 13
                        }}>
                            <code style={{color: s.color, fontWeight: 700}}>{s.sigil}word</code>
                            <span style={{color: '#777'}}>→ {s.prefix}_ ({s.label})</span>
                        </span>
                    ))}
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 10px',
                        borderRadius: 12,
                        background: 'white',
                        border: `1px solid ${SIGIL_SUFFIX.color}`,
                        fontSize: 13
                    }}>
                        <code style={{color: SIGIL_SUFFIX.color, fontWeight: 700}}>word{SIGIL_SUFFIX.sigil}</code>
                        <span style={{color: '#777'}}>→ _{SIGIL_SUFFIX.suffix} ({SIGIL_SUFFIX.label})</span>
                    </span>
                </div>
            )}
        </div>
    );
}

const pgBtn = (dis) => ({
    padding: '2px 8px',
    border: '1px solid #ccc',
    borderRadius: 4,
    background: dis ? '#f5f5f5' : 'white',
    color: dis ? '#bbb' : '#333',
    cursor: dis ? 'default' : 'pointer',
    fontSize: 12
});

function WordPopover({popover, selectedMeanings, onSelect, onQuickAdd, isAdmin, popRef}) {
    const {word, idx, matches, partials, rect} = popover;
    const sel = selectedMeanings[idx];
    const [page, setPage] = useState(0);

    const allRows = [...matches.map(m => ({...m, isPartial: false})), ...partials.map(m => ({...m, isPartial: true}))];
    const totalPages = Math.max(1, Math.ceil(allRows.length / POP_PAGE_SZ));
    const pageRows = allRows.slice(page * POP_PAGE_SZ, (page + 1) * POP_PAGE_SZ);

    const popoverHeight = 380;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= popoverHeight ? rect.bottom + 8 : Math.max(8, rect.top - popoverHeight - 8);
    const left = Math.min(rect.left, window.innerWidth - 320);

    return (
        <div ref={popRef} style={{
            position: 'fixed',
            top,
            left,
            zIndex: 1000,
            background: 'white',
            borderRadius: 8,
            minWidth: 270,
            maxWidth: 320,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            padding: 14
        }}>
            <div style={{fontWeight: 700, marginBottom: 10, fontSize: 15}}>"{word}"</div>
            {allRows.length === 0 &&
                <div style={{color: '#999', fontSize: 13, marginBottom: 8}}>No translation found.</div>}
            {allRows.length > 0 && (
                <>
                    {pageRows.some(r => !r.isPartial) &&
                        <div style={{fontSize: 11, color: '#888', marginBottom: 4}}>Select translation</div>}
                    {pageRows.every(r => r.isPartial) &&
                        <div style={{fontSize: 11, color: '#888', marginBottom: 4}}>Did you mean…</div>}
                    {pageRows.map((m, i) => {
                        const isSel = !m.isPartial && sel?.term === m.term && sel?.type === m.type;
                        const prevRow = pageRows[i - 1];
                        const showDivider = i > 0 && m.isPartial && !prevRow?.isPartial;
                        return (
                            <React.Fragment key={i}>
                                {showDivider && <div style={{
                                    fontSize: 11,
                                    color: '#aaa',
                                    margin: '6px 0 4px',
                                    borderTop: '1px solid #f0f0f0',
                                    paddingTop: 6
                                }}>Did you mean…</div>}
                                <div onClick={() => onSelect(idx, m)} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '7px 8px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    marginBottom: 3,
                                    background: isSel ? '#e8f5e9' : '#fafafa',
                                    border: `1px solid ${isSel ? '#4caf50' : '#e0e0e0'}`
                                }}>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                        <span style={{fontSize: 13, fontWeight: 500}}>{m.translation}</span>
                                        <span style={{
                                            fontSize: 11,
                                            color: '#777'
                                        }}>{decodeKironaan(m.term.toLowerCase())}</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                        <span style={{fontSize: 11, color: '#999'}}>{displayType(m.type)}</span>
                                        {isSel && <span style={{fontSize: 13}}>✓</span>}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 8
                        }}>
                            <span style={{fontSize: 11, color: '#aaa'}}>{page + 1} / {totalPages}</span>
                            <div style={{display: 'flex', gap: 4}}>
                                <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                                        style={pgBtn(page === 0)}>‹
                                </button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}
                                        style={pgBtn(page === totalPages - 1)}>›
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {isAdmin && (
                <button onClick={() => onQuickAdd(word)} style={{
                    marginTop: 8,
                    width: '100%',
                    padding: '7px 0',
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14
                }}>
                    + Add New Definition
                </button>
            )}
        </div>
    );
}

const applyAllSuggestions = (text, suggestions) => {
    const ordered = [...suggestions.filter(s => s.type === 'tense'), ...suggestions.filter(s => s.type !== 'tense')];
    return ordered.reduce((t, s) => s.apply(t), text);
};

function GrammarSuggestionsBanner({suggestions, onApply, onApplyAll}) {
    if (!suggestions.length) return null;
    return (
        <div style={{
            marginTop: 6,
            padding: '8px 12px',
            background: '#e8f4fd',
            borderRadius: 6,
            border: '1px solid #90caf9'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
                <span style={{fontSize: 12, fontWeight: 700, color: '#1565c0'}}>✦ Grammar suggestions</span>
                {suggestions.length > 1 && (
                    <button onClick={onApplyAll} style={{
                        padding: '2px 10px',
                        background: '#1565c0',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                    }}>Apply All</button>
                )}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                {suggestions.map(s => (
                    <div key={s.id}
                         style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
                        <span style={{fontSize: 13, color: '#333'}}><span
                            style={{color: '#1976d2', marginRight: 4}}>→</span>{s.message}</span>
                        <button onClick={() => onApply(s)} style={{
                            padding: '2px 10px',
                            background: 'white',
                            border: '1px solid #90caf9',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#1565c0',
                            whiteSpace: 'nowrap'
                        }}>Apply
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PhraseSuggestionsBanner({suggestions}) {
    if (!suggestions.length) return null;
    return (
        <div style={{
            marginTop: 6,
            padding: '8px 12px',
            background: '#f3e5f5',
            borderRadius: 6,
            border: '1px solid #ce93d8'
        }}>
            <div style={{fontSize: 12, fontWeight: 700, color: '#7b1fa2', marginBottom: 6}}>✦ Phrase suggestions — click
                any highlighted word to confirm
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                {suggestions.map((s, i) => (
                    <div key={i} style={{fontSize: 13, color: '#333'}}>
                        <span style={{color: '#7b1fa2', marginRight: 4}}>→</span>
                        <strong>"{s.matchedMeaning}"</strong>
                        {' matches phrase — Kironaan: '}
                        <span className="KironaanFont" style={{fontSize: 13}}>{s.phrase.term}</span>
                        {' '}
                        <span style={{fontSize: 11, color: '#888'}}>({decodeKironaan(s.phrase.term)})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WordOrderViolationsBanner({violations, onApply, onApplyAll}) {
    if (!violations.length) return null;
    return (
        <div style={{
            marginTop: 6,
            padding: '8px 12px',
            background: '#fff3e0',
            borderRadius: 6,
            border: '1px solid #ff9800'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
                <span style={{fontSize: 12, fontWeight: 700, color: '#e65100'}}>⚠ Word order warnings</span>
                {violations.length > 1 && (
                    <button onClick={onApplyAll} style={{
                        padding: '2px 10px',
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                    }}>Fix All</button>
                )}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                {violations.map(v => (
                    <div key={v.id}
                         style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8}}>
                        <span style={{fontSize: 13, color: '#bf360c'}}><span
                            style={{color: '#ff9800', marginRight: 4}}>⚠</span>{v.message}</span>
                        <button onClick={() => onApply(v)} style={{
                            padding: '2px 10px',
                            background: 'white',
                            border: '1px solid #ff9800',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#e65100',
                            whiteSpace: 'nowrap'
                        }}>Fix
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ComposeTab({terms, onTermsChange, isAdmin}) {
    const [text, setText] = useState('');
    const [popover, setPopover] = useState(null);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({translations: [], term: '', type: 'Noun', detectedTypes: []});
    const [tagInput, setTagInput] = useState('');
    const [defs, setDefs] = useState({});
    const [copied, setCopied] = useState('');
    const [selectedMeanings, setSelectedMeanings] = useState({});
    const [confirmingPhrase, setConfirmingPhrase] = useState(null);
    const [rejectedPhrases, setRejectedPhrases] = useState(new Set());
    const popRef = useRef(null);
    const prevTextRef = useRef('');

    useEffect(() => {
        const h = (e) => {
            if (popRef.current && !popRef.current.contains(e.target)) setPopover(null);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        if (prevTextRef.current === text) return;

        const oldTokens = splitKironaanTokens(prevTextRef.current);
        const newTokens = splitKironaanTokens(text);
        const oldWords = oldTokens.filter(t => !/^\s+$/.test(t) && !FLOATING_PUNCT.includes(t)).map(t => parseSigils(t).base);
        const newWords = newTokens.filter(t => !/^\s+$/.test(t) && !FLOATING_PUNCT.includes(t)).map(t => parseSigils(t).base);

        const oldSelections = oldWords.map((w, i) => {
            const meaning = selectedMeanings[i];
            return {word: w, termId: meaning ? `${meaning.term}_${meaning.type}` : null, meaning: meaning};
        });

        const diffResult = lcsWordDiff(oldWords, newWords, oldSelections);

        const mappedMeanings = {};
        diffResult.forEach((item, idx) => {
            if (item.termId && oldSelections.find(s => s.termId === item.termId)?.meaning) {
                mappedMeanings[idx] = oldSelections.find(s => s.termId === item.termId).meaning;
            }
        });

        setSelectedMeanings(mappedMeanings);
        setPopover(null);
        setConfirmingPhrase(null);
        setRejectedPhrases(new Set());
        prevTextRef.current = text;
    }, [text]); // eslint-disable-line

    useEffect(() => {
        form.translations.forEach(w => {
            if (w && defs[w] === undefined) {
                setDefs(p => ({...p, [w]: null}));
                fetchDictDef(w).then(def => setDefs(p => ({...p, [w]: def})));
            }
        });
    }, [form.translations.join(',')]); // eslint-disable-line

    const tokens = useMemo(() => splitKironaanTokens(text), [text]);
    const nonPhraseTerms = terms.filter(t => t.type !== 'Phrases');

    const findMatches = (word) => {
        const n = normalize(word);
        if (!n) return [];
        return nonPhraseTerms.filter(t => t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n));
    };
    const findPartialMatches = (word) => {
        const n = normalize(word);
        if (!n) return [];
        return nonPhraseTerms.filter(t => t.translation.split(/[,\s]+/).some(tr => normalize(tr).startsWith(n) && normalize(tr) !== n));
    };
    const resolveBase = (base, idx) => {
        if (isConceptShortcut(base)) return resolveConceptShortcut(base);
        if (selectedMeanings[idx]) return selectedMeanings[idx];
        const ms = findMatches(base);
        if (!ms.length) return {term: base, translation: null, type: null};
        return ms[0];
    };

    const tokenMeta = useMemo(() => computeTokenMeta(tokens, terms), [tokens, terms]);
    const numberPhrases = useMemo(() => findNumberPhrases(tokens), [tokens]);
    const grammarSuggestions = useMemo(() => analyzeGrammarSuggestions(text), [text]);
    const phraseSuggestions = useMemo(() => findPartialPhraseMatches(tokens, terms), [tokens, terms]);
    const wordOrderViolations = useMemo(() => analyzeWordOrderViolations(tokens, terms, selectedMeanings), [tokens, terms, JSON.stringify(selectedMeanings)]); // eslint-disable-line

    const pendingPhraseMap = useMemo(() => {
        const map = new Map();
        const wordIndices = tokens.map((t, i) => {
            if (/^\s+$/.test(t) || FLOATING_PUNCT.includes(t)) return null;
            return i;
        }).filter(i => i !== null);
        phraseSuggestions.forEach(s => {
            if (rejectedPhrases.has(s.phrase.term)) return;
            const phraseNorms = s.matchedMeaning.toLowerCase().split(/\s+/).map(normalize);
            wordIndices.forEach(tIdx => {
                const base = normalize(parseSigils(tokens[tIdx]).base);
                if (phraseNorms.includes(base)) map.set(tIdx, s);
            });
        });
        return map;
    }, [tokens, phraseSuggestions, rejectedPhrases]);

    const getStatus = (base, idx) => {
        if (!normalize(base)) return null;
        if (isConceptShortcut(base)) return 'matched';
        if (selectedMeanings[idx]) return 'matched';
        const ms = findMatches(base);
        if (!ms.length) return findPartialMatches(base).length ? 'partial' : 'unmatched';
        if (ms.length > 1) return 'ambiguous';
        return 'matched';
    };

    const wordTokenIndices = useMemo(() => tokens.map((t, i) => {
        if (/^\s+$/.test(t) || FLOATING_PUNCT.includes(t)) return null;
        return i;
    }).filter(i => i !== null), [tokens]);

    const copy = (val, label) => {
        navigator.clipboard.writeText(val);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    const openPopover = (e, base, idx) => {
        e.stopPropagation();
        setPopover({
            word: base,
            idx,
            matches: findMatches(base),
            partials: findPartialMatches(base),
            rect: e.currentTarget.getBoundingClientRect()
        });
    };
    const handleSelect = (idx, m) => {
        setSelectedMeanings(p => ({...p, [idx]: m}));
        setPopover(null);
    };
    const openQuickAdd = (word) => {
        const detectedTypes = detectAllNlpTypes(word);
        setForm({translations: [word], term: '', type: detectedTypes[0] || 'Noun', detectedTypes});
        setTagInput('');
        setDefs({});
        setModal(word);
        setPopover(null);
    };
    const addTag = () => {
        const v = tagInput.trim().toLowerCase();
        if (v && !form.translations.includes(v)) setForm(p => ({...p, translations: [...p.translations, v]}));
        setTagInput('');
    };
    const handleSave = async () => {
        await addKironaanTerm({translation: form.translations.join(', '), term: form.term, type: form.type});
        onTermsChange(await getAllKironaanTerms());
        setModal(null);
    };

    const {suggested: spellSuggested, changes: spellChanges} = getComposerSpellingSuggestions(form.term);
    const hasCapital = /[A-Z]/.test(form.term) && !(form.term.length === 1 && /^[A-ZÁÉÍÓÚ{}|]$/.test(form.term));

    const kironaan = useMemo(() => {
        return tokens.map((tok, idx) => {
            if (/^\s+$/.test(tok)) return tok;
            if (FLOATING_PUNCT.includes(tok)) return ` ${tok} `;
            if (tokenMeta.phraseHead[idx]) return tokenMeta.phraseHead[idx].term.toLowerCase();
            if (tokenMeta.absorbed.has(idx)) return '';
            if (tokenMeta.adverbOf[idx] !== undefined) return '';

            const {base, prefixes, hasPossession, isConceptShortcut: isConcept} = parseSigils(tok);
            if (isConcept) {
                const concept = resolveConceptShortcut(base);
                return concept.term;
            }

            const wIdx = wordTokenIndices.indexOf(idx);
            const resolved = resolveBase(base, wIdx);

            const nextWI = wIdx + 1;
            const nextTI = wordTokenIndices[nextWI];
            let adverbTerm = null;
            if (nextTI !== undefined && tokenMeta.adverbOf[nextTI] === idx) {
                const advBase = parseSigils(tokens[nextTI]).base;
                adverbTerm = resolveBase(advBase, nextWI).term || advBase;
            }

            return buildCompound(resolved.term, prefixes, hasPossession, adverbTerm).toLowerCase();
        }).join('');
    }, [text, selectedMeanings, tokenMeta, tokens, wordTokenIndices]); // eslint-disable-line

    const kironaanDecoded = decodeKironaan(kironaan);

    return (
        <div>
            <SigilLegend/>
            <textarea value={text} onChange={e => setText(e.target.value)}
                      placeholder="Type in English — use ?word *word ^word #word &word !!word word@ for prefixes/suffixes"
                      style={{
                          width: '100%',
                          minHeight: 90,
                          padding: 10,
                          fontSize: 16,
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                      }}/>

            {text.trim() && (
                <>
                    {numberPhrases.length > 0 && (
                        <div style={{
                            marginTop: 6,
                            padding: '8px 12px',
                            background: '#e3f2fd',
                            borderRadius: 6,
                            border: '1px solid #64b5f6'
                        }}>
                            <div style={{fontSize: 12, fontWeight: 700, color: '#1565c0', marginBottom: 6}}>✦ Number
                                conversions available
                            </div>
                            {numberPhrases.map((np, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 4
                                }}>
                                    <span style={{fontSize: 13}}>
                                        "{np.englishPhrase}" ({np.decimal}) → <span
                                        className="KironaanFont">{np.kironaan}</span>
                                    </span>
                                    <button onClick={() => setText(np.apply(text))} style={{
                                        padding: '2px 10px',
                                        background: '#1565c0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: 12
                                    }}>Convert
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <GrammarSuggestionsBanner
                        suggestions={grammarSuggestions}
                        onApply={s => setText(s.apply(text))}
                        onApplyAll={() => setText(applyAllSuggestions(text, grammarSuggestions))}
                    />

                    <WordOrderViolationsBanner
                        violations={wordOrderViolations}
                        onApply={v => setText(v.apply(text))}
                        onApplyAll={() => {
                            let result = text;
                            wordOrderViolations.forEach(v => {
                                result = v.apply(result);
                            });
                            setText(result);
                        }}
                    />

                    <PhraseSuggestionsBanner suggestions={phraseSuggestions}/>

                    {confirmingPhrase && (
                        <div style={{
                            marginTop: 6,
                            padding: '7px 12px',
                            background: '#ede7f6',
                            borderRadius: 6,
                            border: '1px solid #9c27b0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10
                        }}>
                            <span style={{fontSize: 13, color: '#4a148c'}}>
                                Use phrase <strong>"{confirmingPhrase.phrase.translation}"</strong>?
                            </span>
                            <div style={{display: 'flex', gap: 6}}>
                                <button onClick={() => {
                                    setText(confirmingPhrase.apply(text));
                                    setConfirmingPhrase(null);
                                }}
                                        style={{
                                            padding: '2px 12px',
                                            background: '#9c27b0',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            fontWeight: 600
                                        }}>Yes
                                </button>
                                <button onClick={() => {
                                    setRejectedPhrases(prev => new Set([...prev, confirmingPhrase.phrase.term]));
                                    setConfirmingPhrase(null);
                                }}
                                        style={{
                                            padding: '2px 10px',
                                            background: 'white',
                                            border: '1px solid #9c27b0',
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            color: '#9c27b0'
                                        }}>No
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 5,
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 6,
                        background: '#fafafa',
                        marginTop: 6,
                        minHeight: 42
                    }}>
                        {tokens.map((tok, i) => {
                            if (/^\s+$/.test(tok)) return <span key={i} style={{width: 6}}/>;
                            if (FLOATING_PUNCT.includes(tok)) return <span key={i} style={{
                                color: '#999',
                                fontSize: 14
                            }}>{tok}</span>;

                            if (tokenMeta.absorbed.has(i) && !tokenMeta.phraseHead[i]) return (
                                <span key={i}
                                      title={normalize(tok) === 'to' ? "'to' absorbed" : "Part of matched phrase"}
                                      style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 4,
                                          padding: '3px 10px',
                                          borderRadius: 14,
                                          fontSize: 15,
                                          background: '#f5f5f5',
                                          border: '1px dashed #bbb',
                                          color: '#aaa',
                                          textDecoration: 'line-through',
                                          cursor: 'help'
                                      }}>
                                    {tok}
                                </span>
                            );

                            if (tokenMeta.adverbOf[i] !== undefined) return (
                                <span key={i} title="Attached as adverb suffix to preceding verb"
                                      style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 4,
                                          padding: '3px 10px',
                                          borderRadius: 14,
                                          fontSize: 15,
                                          background: '#e3f2fd',
                                          border: '1px solid #1565c0',
                                          color: '#1565c0',
                                          cursor: 'help'
                                      }}>
                                    ↳ {tok}
                                    <span style={{
                                        fontSize: 10,
                                        background: '#bbdefb',
                                        borderRadius: 4,
                                        padding: '0 4px'
                                    }}>adv-suffix</span>
                                </span>
                            );

                            if (tokenMeta.phraseHead[i]) {
                                const pt = tokenMeta.phraseHead[i];
                                return (
                                    <span key={i} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        padding: '3px 10px',
                                        borderRadius: 14,
                                        fontSize: 15,
                                        background: '#e8f5e9',
                                        border: '1px solid #4caf50'
                                    }}>
                                        {pt.translation}
                                        <span style={{
                                            fontSize: 10,
                                            color: '#2e7d32',
                                            background: '#c8e6c9',
                                            borderRadius: 4,
                                            padding: '0 4px'
                                        }}>phrase</span>
                                        <span
                                            style={{width: 7, height: 7, borderRadius: '50%', background: '#4caf50'}}/>
                                    </span>
                                );
                            }

                            const pendingSuggestion = pendingPhraseMap.get(i);
                            if (pendingSuggestion) {
                                const {base} = parseSigils(tok);
                                const isConfirming = confirmingPhrase?.phrase.term === pendingSuggestion.phrase.term;
                                return (
                                    <span key={i} onClick={() => setConfirmingPhrase(pendingSuggestion)}
                                          title={`Click to use phrase "${pendingSuggestion.phrase.translation}"`}
                                          style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 4,
                                              padding: '3px 10px',
                                              borderRadius: 14,
                                              fontSize: 15,
                                              cursor: 'pointer',
                                              userSelect: 'none',
                                              background: isConfirming ? '#e1bee7' : '#f3e5f5',
                                              border: `1px solid ${isConfirming ? '#7b1fa2' : '#9c27b0'}`,
                                              fontWeight: isConfirming ? 600 : 400
                                          }}>
                                        {base}
                                        <span style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            background: '#9c27b0'
                                        }}/>
                                    </span>
                                );
                            }

                            const {base, prefixes, hasPossession, isConceptShortcut: isConcept} = parseSigils(tok);

                            if (isConcept) {
                                const concept = resolveConceptShortcut(base);
                                return (
                                    <span key={i} title={`${concept.symbol} → ${concept.conceptName}`}
                                          style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 4,
                                              padding: '3px 10px',
                                              borderRadius: 14,
                                              fontSize: 15,
                                              userSelect: 'none',
                                              background: '#fff9e6',
                                              border: '1px solid #ffd700',
                                              cursor: 'help'
                                          }}>
                                        {base}
                                        <span style={{
                                            fontSize: 11,
                                            color: '#b8860b',
                                            fontStyle: 'italic'
                                        }}>{concept.conceptName}</span>
                                        <span
                                            style={{width: 7, height: 7, borderRadius: '50%', background: '#ffd700'}}/>
                                    </span>
                                );
                            }

                            const status = getStatus(base, i);
                            const sel = selectedMeanings[i];
                            return (
                                <span key={i} onClick={e => openPopover(e, base, i)}
                                      style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 4,
                                          padding: '3px 10px',
                                          borderRadius: 14,
                                          cursor: 'pointer',
                                          fontSize: 15,
                                          userSelect: 'none',
                                          background: STATUS_BG[status] || '#f5f5f5',
                                          border: `1px solid ${STATUS_COLOR[status] || '#ccc'}`
                                      }}>
                                    {prefixes.map(p => <span key={p.sigil} style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: p.color,
                                        background: `${p.color}18`,
                                        borderRadius: 4,
                                        padding: '0 4px'
                                    }}>{p.prefix}_</span>)}
                                    {base}
                                    {hasPossession && <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: SIGIL_SUFFIX.color,
                                        background: `${SIGIL_SUFFIX.color}18`,
                                        borderRadius: 4,
                                        padding: '0 4px'
                                    }}>_{SIGIL_SUFFIX.suffix}</span>}
                                    {sel && <span style={{
                                        fontSize: 11,
                                        color: '#555',
                                        fontStyle: 'italic'
                                    }}>{decodeKironaan(sel.term.toLowerCase())}</span>}
                                    <span style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        background: STATUS_COLOR[status] || '#bbb'
                                    }}/>
                                </span>
                            );
                        })}
                    </div>

                    <div style={{marginTop: 8}}>
                        <span style={{fontSize: 11, color: '#888', marginBottom: 3}}>KIRONAAN PREVIEW</span>
                        <KironaanRenderer
                            englishText={text}
                            wordSelections={wordTokenIndices.map((tIdx, wIdx) => ({
                                word: parseSigils(tokens[tIdx]).base,
                                termId: selectedMeanings[wIdx] ? `${selectedMeanings[wIdx].term}_${selectedMeanings[wIdx].type}` : null
                            }))}
                            terms={terms}
                            mode="both"
                        />
                    </div>

                    <div style={{display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap'}}>
                        <button onClick={() => copy(text, 'english')} style={{
                            padding: '7px 16px',
                            borderRadius: 6,
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            background: 'white',
                            fontSize: 14
                        }}>
                            {copied === 'english' ? '✓ Copied!' : 'Copy English'}
                        </button>
                        <button onClick={() => copy(kironaanDecoded, 'kironaan')} style={{
                            padding: '7px 16px',
                            borderRadius: 6,
                            border: '1px solid #5c35d4',
                            cursor: 'pointer',
                            background: '#5c35d4',
                            color: 'white',
                            fontSize: 14
                        }}>
                            {copied === 'kironaan' ? '✓ Copied!' : 'Copy Kironaan'}
                        </button>
                        <span style={{fontSize: 12, color: '#888'}}>{Object.entries(STATUS_COLOR).map(([k, c]) => <span
                            key={k}><span style={{color: c}}>●</span> {k} &nbsp;</span>)}</span>
                    </div>
                </>
            )}

            {popover && (
                <WordPopover popover={popover} selectedMeanings={selectedMeanings} onSelect={handleSelect}
                             onQuickAdd={openQuickAdd} isAdmin={isAdmin} popRef={popRef}/>
            )}

            {modal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 10,
                        padding: 28,
                        minWidth: 320,
                        maxWidth: 420,
                        width: '90%',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{marginTop: 0, marginBottom: 18}}>Add New Definition</h3>
                        <div style={{marginBottom: 12}}>
                            <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>
                                English Definitions <span style={{marginLeft: 6, fontSize: 11, color: '#aaa'}}>Enter or comma to add</span>
                            </label>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 5,
                                padding: '6px 8px',
                                border: '1px solid #ccc',
                                borderRadius: 5,
                                minHeight: 38,
                                alignItems: 'center',
                                cursor: 'text'
                            }}
                                 onClick={e => e.currentTarget.querySelector('input')?.focus()}>
                                {form.translations.map((v, i) => {
                                    const dup = terms.find(t => t.translation.split(/\s*,\s*/).some(tr => tr.toLowerCase() === v));
                                    return (
                                        <span key={i} style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '2px 8px',
                                            borderRadius: 12,
                                            fontSize: 13,
                                            background: dup ? '#fff3e0' : '#e3f2fd',
                                            border: `1px solid ${dup ? '#ff9800' : '#90caf9'}`
                                        }}>
                                            {v}
                                            {dup && <span title={`Also mapped to "${decodeKironaan(dup.term)}"`}
                                                          style={{
                                                              fontSize: 10,
                                                              color: '#e65100',
                                                              fontStyle: 'italic'
                                                          }}>⚠ {decodeKironaan(dup.term)}</span>}
                                            <button onClick={e => {
                                                e.stopPropagation();
                                                setForm(p => ({
                                                    ...p,
                                                    translations: p.translations.filter((_, j) => j !== i)
                                                }));
                                            }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        padding: '0 1px',
                                                        fontSize: 14,
                                                        lineHeight: 1
                                                    }}>×</button>
                                        </span>
                                    );
                                })}
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                       onKeyDown={e => {
                                           if (e.key === 'Enter' || e.key === ',') {
                                               e.preventDefault();
                                               addTag();
                                           }
                                       }}
                                       placeholder={form.translations.length ? '' : 'Type and press Enter…'}
                                       style={{
                                           border: 'none',
                                           outline: 'none',
                                           fontSize: 14,
                                           minWidth: 100,
                                           flex: 1,
                                           padding: '2px 0'
                                       }}/>
                            </div>
                            {form.translations.some(w => defs[w]) && (
                                <div style={{
                                    marginTop: 5,
                                    padding: '6px 10px',
                                    background: '#f9f9f9',
                                    borderRadius: 5,
                                    border: '1px solid #e0e0e0'
                                }}>
                                    {form.translations.map(w => defs[w] ?
                                        <div key={w} style={{fontSize: 12, color: '#555', lineHeight: 1.6}}><span
                                            style={{fontWeight: 600, color: '#333'}}>{w}:</span> {defs[w]}
                                        </div> : null)}
                                </div>
                            )}
                        </div>
                        <div style={{marginBottom: 12}}>
                            <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>Kironaan
                                Term</label>
                            <input value={form.term} onChange={e => setForm(p => ({...p, term: e.target.value}))}
                                   style={{
                                       width: '100%',
                                       padding: '8px 10px',
                                       border: `1px solid ${hasCapital ? '#f44336' : '#ccc'}`,
                                       borderRadius: 5,
                                       fontSize: 15,
                                       boxSizing: 'border-box'
                                   }}/>
                            {hasCapital && (
                                <div style={{
                                    marginTop: 4,
                                    padding: '4px 8px',
                                    background: '#fce4ec',
                                    borderRadius: 4,
                                    border: '1px solid #f44336',
                                    fontSize: 12,
                                    color: '#c62828',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>⚠ Kironaan terms should be lowercase</span>
                                    <button onClick={() => setForm(p => ({...p, term: p.term.toLowerCase()}))} style={{
                                        padding: '2px 8px',
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: 11
                                    }}>Fix
                                    </button>
                                </div>
                            )}
                            <SpellingBanner changes={spellChanges} suggested={spellSuggested}
                                            onApply={v => setForm(p => ({...p, term: v}))}/>
                        </div>
                        <div style={{marginBottom: 20}}>
                            <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>
                                Type
                                {form.detectedTypes.length > 0 && (
                                    <div style={{marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                                        {form.detectedTypes.map(t => (
                                            <button key={t} onClick={() => setForm(p => ({...p, type: t}))}
                                                    style={{
                                                        padding: '2px 7px',
                                                        borderRadius: 10,
                                                        background: form.type === t ? '#1565c0' : '#e3f2fd',
                                                        color: form.type === t ? 'white' : '#1565c0',
                                                        border: `1px solid ${form.type === t ? '#1565c0' : '#90caf9'}`,
                                                        fontSize: 12,
                                                        cursor: 'pointer'
                                                    }}>
                                                {form.type === t ? '✓ ' : ''}{t}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </label>
                            <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: 5,
                                        fontSize: 15,
                                        marginTop: 4
                                    }}>
                                {TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{display: 'flex', gap: 10}}>
                            <button onClick={handleSave} style={{
                                flex: 1,
                                padding: 10,
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 15
                            }}>Save
                            </button>
                            <button onClick={() => setModal(null)} style={{
                                flex: 1,
                                padding: 10,
                                background: '#eee',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 15
                            }}>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ValidateTab({terms}) {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    const {suggested, changes} = getSpellingSuggestions(text);

    const analyzed = text
        .split(/(\s+)/)
        .filter(t => !/^\s+$/.test(t) && t.trim())
        .map(token => {
            const segs = token.split('_');
            if (segs.length === 1) {
                const info = getSegmentInfo(token, terms);
                return {
                    token,
                    isCompound: false,
                    segments: [{seg: token, ...info}],
                    violations: [],
                    translation: info.translation || token
                };
            }
            const {infos, violations} = validateCompound(segs, terms);
            return {
                token,
                isCompound: true,
                segments: infos,
                violations,
                translation: infos.map(i => i.translation || i.seg).join(' ')
            };
        });

    const allViolations = analyzed.flatMap(a => a.violations);
    const englishOut = analyzed.map(a => a.translation).join(' ').toLowerCase();
    const copy = () => {
        navigator.clipboard.writeText(englishOut);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <textarea value={text} onChange={e => setText(e.target.value)}
                      placeholder="Type a Kironaan sentence (romanized, underscores for compounds)..."
                      style={{
                          width: '100%',
                          minHeight: 80,
                          padding: 10,
                          fontSize: 15,
                          borderRadius: 6,
                          border: '1px solid #ccc',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                      }}/>

            {changes.length > 0 && (
                <div style={{
                    marginTop: 6,
                    padding: '8px 12px',
                    background: '#fff8e1',
                    borderRadius: 6,
                    border: '1px solid #ffc107',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8
                }}>
                    <div>
                        <span style={{fontSize: 12, fontWeight: 600, color: '#e65100'}}>Spelling suggestion: </span>
                        {changes.map((c, i) => (
                            <span key={i} style={{fontSize: 12, color: '#555', marginRight: 10}}>
                                <code
                                    style={{background: '#ffe082', padding: '1px 4px', borderRadius: 3}}>{c.from}</code>
                                {' → '}
                                <code style={{background: '#c8e6c9', padding: '1px 4px', borderRadius: 3}}>{c.to}</code>
                            </span>
                        ))}
                    </div>
                    <button onClick={() => setText(suggested)} style={{
                        padding: '4px 12px',
                        background: '#ffc107',
                        border: 'none',
                        borderRadius: 5,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600
                    }}>Apply
                    </button>
                </div>
            )}

            {text.trim() && (
                <>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 5,
                        padding: '10px 12px',
                        border: '1px solid #e0e0e0',
                        borderRadius: 6,
                        background: '#fafafa',
                        marginTop: 6,
                        minHeight: 40
                    }}>
                        {analyzed.map((a, i) => {
                            const status = a.violations.length > 0 ? 'error' : a.segments.every(s => s.type !== 'Unknown') ? 'ok' : 'unknown';
                            const tooltip = a.isCompound
                                ? a.segments.map(s => `${s.translation || '?'} · ${decodeKironaan(s.seg)} · ${s.label}`).join('\n')
                                : `${a.segments[0]?.translation || '?'} · ${decodeKironaan(a.segments[0]?.seg || '')} · ${a.segments[0]?.label || ''}`;
                            return <Chip key={i} label={a.token} status={status} tooltip={tooltip}/>;
                        })}
                    </div>
                    {allViolations.length > 0 && (
                        <div style={{
                            marginTop: 8,
                            padding: '8px 12px',
                            background: '#fce4ec',
                            borderRadius: 6,
                            border: '1px solid #f44336'
                        }}>
                            <div style={{fontWeight: 600, fontSize: 13, color: '#b71c1c', marginBottom: 4}}>Order
                                violations
                            </div>
                            {allViolations.map((v, i) => <div key={i}
                                                              style={{fontSize: 13, color: '#c62828'}}>✗ {v}</div>)}
                        </div>
                    )}
                    <div style={{
                        marginTop: 8,
                        padding: '8px 12px',
                        background: '#e8f5e9',
                        borderRadius: 6,
                        border: '1px solid #a5d6a7'
                    }}>
                        <span style={{fontSize: 11, color: '#888', display: 'block', marginBottom: 3}}>ENGLISH TRANSLATION</span>
                        <span style={{fontSize: 16}}>{englishOut}</span>
                    </div>
                    <div style={{marginTop: 8}}>
                        <button onClick={copy} style={{
                            padding: '7px 16px',
                            borderRadius: 6,
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            background: 'white',
                            fontSize: 14
                        }}>
                            {copied ? '✓ Copied!' : 'Copy English'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

function KironaanWorkbench({userId, terms, onTermsChange}) {
    const [tab, setTab] = useState('compose');
    const isAdmin = userId === ADMIN_UID;
    return (
        <div>
            <h2 style={{marginBottom: 2}}>Kironaan Workbench</h2>
            <p style={{margin: '0 0 12px', fontSize: 14, color: '#777'}}>Compose and validate Kironaan text</p>
            <div style={{display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: 16}}>
                {[['compose', 'Compose'], ['validate', 'Validate (Kironaan → English)']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                            style={{
                                padding: '8px 18px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: tab === key ? 700 : 400,
                                borderBottom: tab === key ? '3px solid #5c35d4' : '3px solid transparent',
                                color: tab === key ? '#5c35d4' : '#555',
                                marginBottom: -2
                            }}>
                        {label}
                    </button>
                ))}
            </div>
            {tab === 'compose' ? <ComposeTab terms={terms} onTermsChange={onTermsChange} isAdmin={isAdmin}/> :
                <ValidateTab terms={terms}/>}
        </div>
    );
}

export default KironaanWorkbench;