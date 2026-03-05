import React, { useState, useEffect, useRef, useMemo } from 'react';
import nlp from 'compromise';
import { addKironaanTerm, getAllKironaanTerms } from '../services/kironaanService';
import { getComposerSpellingSuggestions, decodeKironaan } from '../utils/kironaanUtils';

const ADMIN_UID = 'baQCmZdQOna3KhFSjoTA3jt2Lw72';
const TYPES = ['Noun','Verb','Adjective','Adverb','Conjunction','Prepositions','Pronouns','Number','Math','Phrases','Articles','Prefix','Suffix','Determiner','NaN'];

const SIGIL_PREFIXES = [
    { sigil: '!!', prefix: 'Grésali', order: 4, label: 'Degree (3rd)', color: '#6d4c41' },
    { sigil: '!',  prefix: 'Gré',     order: 4, label: 'Degree (2nd)', color: '#8d6e63' },
    { sigil: '?',  prefix: 'Sók',     order: 1, label: 'Question',     color: '#1565c0' },
    { sigil: '*',  prefix: 'Dis',     order: 2, label: 'Plural',       color: '#2e7d32' },
    { sigil: '^',  prefix: 'Ki',      order: 3, label: 'Negative',     color: '#c62828' },
    { sigil: '#',  prefix: 'Pó',      order: 5, label: 'Past',         color: '#6a1b9a' },
    { sigil: '&',  prefix: 'Tó',      order: 5, label: 'Future',       color: '#00695c' },
];
const SIGIL_SUFFIX = { sigil: '@', suffix: 'Orsik', order: 8, label: 'Possession', color: '#e65100' };

const normalize       = (w) => w.toLowerCase().replace(/[^a-z]/gi, '');
const displayType     = (t) => t === 'NaN' ? 'Other' : t;
const isEnglishVerb   = (w) => nlp(w).verbs().length > 0;
const isEnglishAdverb = (w) => nlp(w).adverbs().length > 0;

const detectNlpType = (word) => {
    const doc = nlp(word);
    if (doc.verbs().length)      return 'Verb';
    if (doc.adjectives().length) return 'Adjective';
    if (doc.adverbs().length)    return 'Adverb';
    if (doc.nouns().length)      return 'Noun';
    return 'Noun';
};

const STATUS_COLOR = { matched: '#4caf50', partial: '#ff9800', unmatched: '#f44336', ambiguous: '#9c27b0' };
const STATUS_BG    = { matched: '#e8f5e9', partial: '#fff3e0', unmatched: '#fce4ec', ambiguous: '#f3e5f5' };

const parseSigils = (tok) => {
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
    return { base: rest, prefixes, hasPossession };
};

const buildCompound = (baseTerm, prefixes, hasPossession, adverbTerm = null) => {
    const sorted = [...prefixes].sort((a, b) => a.order - b.order);
    const parts = [...sorted.map(p => p.prefix), baseTerm];
    if (adverbTerm) parts.push(adverbTerm);
    if (hasPossession) parts.push('Orsik');
    return parts.join('-');
};

const fetchDictDef = async (word) => {
    try {
        const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!r.ok) return '';
        const d = await r.json();
        return d[0]?.meanings[0]?.definitions[0]?.definition || '';
    } catch { return ''; }
};

function TermTooltip({ term, translation, type }) {
    const [show, setShow] = useState(false);
    const decoded = decodeKironaan(term);
    return (
        <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} style={{ position: 'relative', cursor: 'default' }}>
            {term}
            {show && (
                <span style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', borderRadius: 6, padding: '5px 10px', fontSize: 12, whiteSpace: 'nowrap', zIndex: 300, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {translation && <><span>{translation}</span><span style={{ opacity: 0.4 }}>·</span></>}
                    <span style={{ opacity: 0.75 }}>{decoded}</span>
                    {type && <><span style={{ opacity: 0.4 }}>·</span><span style={{ opacity: 0.65, fontStyle: 'italic' }}>{displayType(type)}</span></>}
                </span>
            )}
        </span>
    );
}

function SigilLegend() {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ marginBottom: 10 }}>
            <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 5, padding: '4px 12px', cursor: 'pointer', fontSize: 13, color: '#555' }}>
                {open ? '▾' : '▸'} Prefix / Suffix shortcuts
            </button>
            {open && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, padding: '10px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #e0e0e0' }}>
                    {SIGIL_PREFIXES.map(s => (
                        <span key={s.sigil} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 12, background: 'white', border: `1px solid ${s.color}`, fontSize: 13 }}>
                            <code style={{ color: s.color, fontWeight: 700 }}>{s.sigil}word</code>
                            <span style={{ color: '#777' }}>→ {s.prefix}- ({s.label})</span>
                        </span>
                    ))}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 12, background: 'white', border: `1px solid ${SIGIL_SUFFIX.color}`, fontSize: 13 }}>
                        <code style={{ color: SIGIL_SUFFIX.color, fontWeight: 700 }}>word{SIGIL_SUFFIX.sigil}</code>
                        <span style={{ color: '#777' }}>→ -{SIGIL_SUFFIX.suffix} ({SIGIL_SUFFIX.label})</span>
                    </span>
                </div>
            )}
        </div>
    );
}

function SpellingBanner({ changes, suggested, onApply }) {
    if (!changes.length) return null;
    return (
        <div style={{ marginTop: 5, padding: '6px 10px', background: '#fff8e1', borderRadius: 5, border: '1px solid #ffc107', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#e65100' }}>Suggest: </span>
                {changes.map((c, i) => (
                    <span key={i} style={{ fontSize: 11, color: '#555', marginRight: 8 }}>
                        <code style={{ background: '#ffe082', padding: '1px 3px', borderRadius: 3 }}>{c.from}</code>
                        {' → '}
                        <code style={{ background: '#c8e6c9', padding: '1px 3px', borderRadius: 3 }}>{c.to}</code>
                    </span>
                ))}
            </div>
            <button onClick={() => onApply(suggested)}
                style={{ padding: '2px 10px', background: '#ffc107', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Apply</button>
        </div>
    );
}

const POP_PAGE_SIZE = 6;

// ── Unified word popover: select existing OR create new ───────
function WordPopover({ popover, selectedMeanings, onSelect, onQuickAdd, isAdmin, popRef }) {
    const { word, idx, matches, partials, rect } = popover;
    const sel = selectedMeanings[idx];
    const [page, setPage] = useState(0);

    // Complete matches first, then partial suggestions
    const allRows = [
        ...matches.map(m => ({ ...m, isPartial: false })),
        ...partials.map(m => ({ ...m, isPartial: true })),
    ];
    const totalPages = Math.ceil(allRows.length / POP_PAGE_SIZE);
    const pageRows   = allRows.slice(page * POP_PAGE_SIZE, (page + 1) * POP_PAGE_SIZE);
    const hasPartials = partials.length > 0;
    const hasMatches  = matches.length > 0;

    const top  = Math.min(rect.bottom + 8, window.innerHeight - 360);
    const left = Math.min(rect.left,       window.innerWidth  - 310);

    return (
        <div ref={popRef} style={{ position: 'fixed', top, left, zIndex: 1000, background: 'white', borderRadius: 8, minWidth: 270, maxWidth: 320, boxShadow: '0 6px 24px rgba(0,0,0,0.18)', padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>"{word}"</div>

            {allRows.length === 0 && (
                <div style={{ color: '#999', fontSize: 13, marginBottom: 8 }}>No translation found.</div>
            )}

            {allRows.length > 0 && (
                <>
                    {/* Section label — only show if the current page has partials */}
                    {pageRows.some(r => !r.isPartial) && hasMatches && (
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Select translation</div>
                    )}
                    {pageRows.some(r => r.isPartial) && !pageRows.some(r => !r.isPartial) && (
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Did you mean…</div>
                    )}

                    {pageRows.map((m, i) => {
                        const isSel = !m.isPartial && sel?.term === m.term && sel?.type === m.type;
                        // Show a divider when switching from complete → partial on same page
                        const prevRow = pageRows[i - 1];
                        const showDivider = i > 0 && m.isPartial && !prevRow.isPartial;
                        return (
                            <React.Fragment key={i}>
                                {showDivider && (
                                    <div style={{ fontSize: 11, color: '#aaa', margin: '6px 0 4px', borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>Did you mean…</div>
                                )}
                                <div onClick={() => onSelect(idx, m)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 8px', borderRadius: 6, cursor: 'pointer', marginBottom: 3, background: isSel ? '#e8f5e9' : '#fafafa', border: `1px solid ${isSel ? '#4caf50' : '#e0e0e0'}` }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>{m.translation}</span>
                                        <span style={{ fontSize: 11, color: '#777' }}>{decodeKironaan(m.term.toLowerCase())}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 11, color: '#999' }}>{displayType(m.type)}</span>
                                        {isSel && <span style={{ fontSize: 13 }}>✓</span>}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontSize: 11, color: '#aaa' }}>{page + 1} / {totalPages}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                                    style={{ padding: '2px 8px', border: '1px solid #ccc', borderRadius: 4, background: page === 0 ? '#f5f5f5' : 'white', color: page === 0 ? '#bbb' : '#333', cursor: page === 0 ? 'default' : 'pointer', fontSize: 12 }}>‹</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1}
                                    style={{ padding: '2px 8px', border: '1px solid #ccc', borderRadius: 4, background: page === totalPages - 1 ? '#f5f5f5' : 'white', color: page === totalPages - 1 ? '#bbb' : '#333', cursor: page === totalPages - 1 ? 'default' : 'pointer', fontSize: 12 }}>›</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {isAdmin && (
                <button onClick={() => onQuickAdd(word)}
                    style={{ marginTop: 8, width: '100%', padding: '7px 0', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
                    + Add New Definition
                </button>
            )}
        </div>
    );
}

function KironaanComposer({ userId, terms, onTermsChange }) {
    const [text, setText]                         = useState('');
    const [popover, setPopover]                   = useState(null);   // unified popover
    const [modal, setModal]                       = useState(null);
    const [form, setForm]                         = useState({ translations: [], term: '', type: 'Noun', detectedType: 'Noun' });
    const [tagInput, setTagInput]                 = useState('');
    const [defs, setDefs]                         = useState({});
    const [copied, setCopied]                     = useState('');
    const [selectedMeanings, setSelectedMeanings] = useState({});
    const popRef  = useRef(null);
    const isAdmin = userId === ADMIN_UID;

    useEffect(() => {
        const h = (e) => { if (popRef.current && !popRef.current.contains(e.target)) setPopover(null); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => { setSelectedMeanings({}); setPopover(null); }, [text]);

    useEffect(() => {
        form.translations.forEach(w => {
            if (w && defs[w] === undefined) {
                setDefs(p => ({ ...p, [w]: null }));
                fetchDictDef(w).then(def => setDefs(p => ({ ...p, [w]: def })));
            }
        });
    }, [form.translations.join(',')]); // eslint-disable-line

    const tokens = text.split(/(\s+)/);

    const nonPhraseTerms     = terms.filter(t => t.type !== 'Phrases');
    const findMatches        = (word) => { const n = normalize(word); if (!n) return []; return nonPhraseTerms.filter(t => t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n)); };
    const findPartialMatches = (word) => { const n = normalize(word); if (!n) return []; return nonPhraseTerms.filter(t => t.translation.split(/[,\s]+/).some(tr => normalize(tr).startsWith(n) && normalize(tr) !== n)); };
    // Explicit user selection takes priority over auto-resolution (covers partial picks too)
    const resolveBase        = (base, idx) => { if (selectedMeanings[idx]) return selectedMeanings[idx]; const ms = findMatches(base); if (!ms.length) return { term: base, translation: null, type: null }; return ms[0]; };

    const tokenMeta = useMemo(() => {
        const wordIndices = tokens.map((tok, i) => /^\s+$/.test(tok) ? null : i).filter(i => i !== null);
        const absorbed   = new Set();
        const adverbOf   = {};
        const phraseHead = {};
        const phraseTerms = terms.filter(t => t.type === 'Phrases');

        for (let wi = 0; wi < wordIndices.length; wi++) {
            if (absorbed.has(wordIndices[wi])) continue;
            const i = wordIndices[wi];
            const { base } = parseSigils(tokens[i]);

            const sortedPhrases = [...phraseTerms].sort((a, b) => b.translation.split(/\s+/).length - a.translation.split(/\s+/).length);
            let phraseMatched = false;
            for (const pt of sortedPhrases) {
                const phraseWords = pt.translation.toLowerCase().split(/\s+/);
                const len = phraseWords.length;
                if (len < 2 || wi + len > wordIndices.length) continue;
                const matches = phraseWords.every((pw, j) => {
                    const { base: b } = parseSigils(tokens[wordIndices[wi + j]]);
                    return normalize(b) === normalize(pw);
                });
                if (matches) {
                    phraseHead[i] = pt;
                    for (let j = 1; j < len; j++) absorbed.add(wordIndices[wi + j]);
                    wi += len - 1;
                    phraseMatched = true;
                    break;
                }
            }
            if (phraseMatched) continue;

            const isTermVerb = (w) => {
                const n = normalize(w);
                return terms.some(t => t.type === 'Verb' && t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n));
            };
            const isTermAdverb = (w) => {
                const n = normalize(w);
                return terms.some(t => t.type === 'Adverb' && t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n));
            };

            if (normalize(base) === 'to' && wi + 1 < wordIndices.length) {
                const nextI = wordIndices[wi + 1];
                const { base: nextBase } = parseSigils(tokens[nextI]);
                if (isTermVerb(nextBase)) { absorbed.add(i); continue; }
            }

            if (wi > 0 && isTermAdverb(base)) {
                const prevI = wordIndices[wi - 1];
                if (!absorbed.has(prevI)) {
                    const { base: prevBase } = parseSigils(tokens[prevI]);
                    if (isTermVerb(prevBase)) adverbOf[i] = prevI;
                }
            }
        }
        return { absorbed, adverbOf, phraseHead };
    }, [tokens, terms]);

    const getStatus = (base, idx) => {
        if (!normalize(base)) return null;
        if (selectedMeanings[idx]) return 'matched'; // explicit pick always resolves
        const ms = findMatches(base);
        if (!ms.length) return findPartialMatches(base).length ? 'partial' : 'unmatched';
        if (ms.length > 1) return 'ambiguous';
        return 'matched';
    };

    const resolveToken = (tok, idx) => {
        if (/^\s+$/.test(tok)) return { output: tok, base: tok, prefixes: [], hasPossession: false, resolved: null };
        if (tokenMeta.phraseHead[idx]) {
            const pt = tokenMeta.phraseHead[idx];
            return { output: pt.term.toLowerCase(), base: pt.translation, prefixes: [], hasPossession: false, resolved: pt };
        }
        const { base, prefixes, hasPossession } = parseSigils(tok);
        const resolved = resolveBase(base, idx);
        const wordIndices = tokens.map((t, i) => /^\s+$/.test(t) ? null : i).filter(i => i !== null);
        const myWI = wordIndices.indexOf(idx);
        let adverbTerm = null;
        if (myWI !== -1 && myWI + 1 < wordIndices.length) {
            const nextIdx = wordIndices[myWI + 1];
            if (tokenMeta.adverbOf[nextIdx] === idx) {
                const { base: advBase } = parseSigils(tokens[nextIdx]);
                adverbTerm = resolveBase(advBase, nextIdx).term || advBase;
            }
        }
        const compound = buildCompound(resolved.term, prefixes, hasPossession, adverbTerm).toLowerCase();
        return { output: compound, base, prefixes, hasPossession, resolved };
    };

    const buildKironaan = () =>
        tokens.map((tok, idx) => {
            if (/^\s+$/.test(tok)) return tok;
            if (tokenMeta.absorbed.has(idx) && !tokenMeta.phraseHead[idx]) return '';
            if (tokenMeta.adverbOf[idx] !== undefined) return '';
            return resolveToken(tok, idx).output;
        }).join('');

    const kironaan        = buildKironaan();
    const kironaaDecoded  = decodeKironaan(kironaan);

    const copy = (val, label) => { navigator.clipboard.writeText(val); setCopied(label); setTimeout(() => setCopied(''), 2000); };

    const openPopover = (e, base, idx) => {
        e.stopPropagation();
        setPopover({ word: base, idx, matches: findMatches(base), partials: findPartialMatches(base), rect: e.currentTarget.getBoundingClientRect() });
    };

    const handleSelect = (idx, m) => {
        setSelectedMeanings(p => ({ ...p, [idx]: m }));
        setPopover(null);
    };

    const openQuickAdd = (word) => {
        const d = detectNlpType(word);
        setForm({ translations: [word], term: '', type: d, detectedType: d });
        setTagInput(''); setDefs({});
        setModal(word); setPopover(null);
    };

    const addTag = () => {
        const v = tagInput.trim().toLowerCase();
        if (v && !form.translations.includes(v)) setForm(p => ({ ...p, translations: [...p.translations, v] }));
        setTagInput('');
    };

    const handleSave = async () => {
        await addKironaanTerm({ translation: form.translations.join(', '), term: form.term, type: form.type });
        onTermsChange(await getAllKironaanTerms());
        setModal(null);
    };

    const { suggested: spellSuggested, changes: spellChanges } = getComposerSpellingSuggestions(form.term);
    const hasCapital = /[A-Z]/.test(form.term);

    return (
        <div style={{ marginBottom: 30 }}>
            <h2 style={{ marginBottom: 2 }}>Kironaan Composer</h2>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#777' }}>To compose how a sentence would look in English vs Kironaan</p>
            <SigilLegend />

            <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Type in English — use ?word *word ^word #word &word !!word word@ for prefixes/suffixes"
                style={{ width: '100%', minHeight: 90, padding: 10, fontSize: 16, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }} />

            {text.trim() && (
                <>
                    {/* Chip row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fafafa', marginTop: 6, minHeight: 42 }}>
                        {tokens.map((tok, i) => {
                            if (/^\s+$/.test(tok)) return <span key={i} style={{ width: 6 }} />;
                            if (tokenMeta.absorbed.has(i) && !tokenMeta.phraseHead[i]) return (
                                <span key={i} title={normalize(tok) === 'to' ? "'to' absorbed" : "Part of matched phrase"}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, fontSize: 15, background: '#f5f5f5', border: '1px dashed #bbb', color: '#aaa', textDecoration: 'line-through', cursor: 'help' }}>
                                    {tok}
                                </span>
                            );
                            if (tokenMeta.adverbOf[i] !== undefined) return (
                                <span key={i} title="Attached as adverb suffix to preceding verb"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, fontSize: 15, background: '#e3f2fd', border: '1px solid #1565c0', color: '#1565c0', cursor: 'help' }}>
                                    ↳ {tok}
                                    <span style={{ fontSize: 10, background: '#bbdefb', borderRadius: 4, padding: '0 4px' }}>adv-suffix</span>
                                </span>
                            );
                            if (tokenMeta.phraseHead[i]) {
                                const pt = tokenMeta.phraseHead[i];
                                return (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, fontSize: 15, background: '#e8f5e9', border: '1px solid #4caf50' }}>
                                        {pt.translation}
                                        <span style={{ fontSize: 10, color: '#2e7d32', background: '#c8e6c9', borderRadius: 4, padding: '0 4px' }}>phrase</span>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50' }} />
                                    </span>
                                );
                            }

                            const { base, prefixes, hasPossession } = parseSigils(tok);
                            const status = getStatus(base, i);
                            const sel    = selectedMeanings[i];

                            return (
                                <span key={i} onClick={e => openPopover(e, base, i)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, cursor: 'pointer', fontSize: 15, userSelect: 'none', background: STATUS_BG[status] || '#f5f5f5', border: `1px solid ${STATUS_COLOR[status] || '#ccc'}` }}>
                                    {prefixes.map(p => <span key={p.sigil} style={{ fontSize: 10, fontWeight: 700, color: p.color, background: `${p.color}18`, borderRadius: 4, padding: '0 4px' }}>{p.prefix}-</span>)}
                                    {base}
                                    {hasPossession && <span style={{ fontSize: 10, fontWeight: 700, color: SIGIL_SUFFIX.color, background: `${SIGIL_SUFFIX.color}18`, borderRadius: 4, padding: '0 4px' }}>-Orsik</span>}
                                    {sel && <span style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>{decodeKironaan(sel.term.toLowerCase())}</span>}
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: STATUS_COLOR[status] || '#bbb' }} />
                                </span>
                            );
                        })}
                    </div>

                    {/* Preview */}
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f3f0ff', borderRadius: 6, border: '1px solid #d1c4e9' }}>
                        <span style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>KIRONAAN PREVIEW</span>
                        <span className="KironaanFont" style={{ fontSize: 20 }}>
                            {tokens.map((tok, i) => {
                                if (/^\s+$/.test(tok)) return <span key={i}> </span>;
                                if ((tokenMeta.absorbed.has(i) && !tokenMeta.phraseHead[i]) || tokenMeta.adverbOf[i] !== undefined) return null;
                                const { output, resolved } = resolveToken(tok, i);
                                return <TermTooltip key={i} term={output} translation={resolved?.translation} type={resolved?.type} />;
                            })}
                        </span>
                        <span style={{ display: 'block', marginTop: 6, fontSize: 15, color: '#555' }}>{kironaaDecoded}</span>
                    </div>

                    {/* Copy bar */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => copy(text, 'english')} style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer', background: 'white', fontSize: 14 }}>{copied === 'english' ? '✓ Copied!' : 'Copy English'}</button>
                        <button onClick={() => copy(kironaaDecoded, 'kironaan')} style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #5c35d4', cursor: 'pointer', background: '#5c35d4', color: 'white', fontSize: 14 }}>{copied === 'kironaan' ? '✓ Copied!' : 'Copy Kironaan'}</button>
                        <span style={{ fontSize: 12, color: '#888' }}>{Object.entries(STATUS_COLOR).map(([k, c]) => <span key={k}><span style={{ color: c }}>●</span> {k} &nbsp;</span>)}</span>
                    </div>
                </>
            )}

            {/* Unified popover */}
            {popover && (
                <WordPopover
                    popover={popover}
                    selectedMeanings={selectedMeanings}
                    onSelect={handleSelect}
                    onQuickAdd={openQuickAdd}
                    isAdmin={isAdmin}
                    popRef={popRef}
                />
            )}

            {/* Quick-add modal */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: 10, padding: 28, minWidth: 320, maxWidth: 420, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginTop: 0, marginBottom: 18 }}>Add New Definition</h3>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: '#555' }}>
                                English Definitions
                                <span style={{ marginLeft: 6, fontSize: 11, color: '#aaa' }}>Enter or comma to add</span>
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 5, minHeight: 38, alignItems: 'center', cursor: 'text' }}
                                onClick={e => e.currentTarget.querySelector('input')?.focus()}>
                                {form.translations.map((v, i) => {
                                    const dup = terms.find(t => t.translation.split(/\s*,\s*/).some(tr => tr.toLowerCase() === v));
                                    return (
                                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: 13, background: dup ? '#fff3e0' : '#e3f2fd', border: `1px solid ${dup ? '#ff9800' : '#90caf9'}` }}>
                                            {v}
                                            {dup && <span title={`Also mapped to "${decodeKironaan(dup.term)}"`} style={{ fontSize: 10, color: '#e65100', fontStyle: 'italic' }}>⚠ {decodeKironaan(dup.term)}</span>}
                                            <button onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, translations: p.translations.filter((_, j) => j !== i) })); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '0 1px', fontSize: 14, lineHeight: 1 }}>×</button>
                                        </span>
                                    );
                                })}
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                                    placeholder={form.translations.length ? '' : 'Type and press Enter…'}
                                    style={{ border: 'none', outline: 'none', fontSize: 14, minWidth: 100, flex: 1, padding: '2px 0' }} />
                            </div>
                            {form.translations.some(w => defs[w]) && (
                                <div style={{ marginTop: 5, padding: '6px 10px', background: '#f9f9f9', borderRadius: 5, border: '1px solid #e0e0e0' }}>
                                    {form.translations.map(w => defs[w] ? (
                                        <div key={w} style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                                            <span style={{ fontWeight: 600, color: '#333' }}>{w}:</span> {defs[w]}
                                        </div>
                                    ) : null)}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: '#555' }}>Kironaan Term</label>
                            <input value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
                                style={{ width: '100%', padding: '8px 10px', border: `1px solid ${hasCapital ? '#f44336' : '#ccc'}`, borderRadius: 5, fontSize: 15, boxSizing: 'border-box' }} />
                            {hasCapital && (
                                <div style={{ marginTop: 4, padding: '4px 8px', background: '#fce4ec', borderRadius: 4, border: '1px solid #f44336', fontSize: 12, color: '#c62828', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>⚠ Kironaan terms should be lowercase</span>
                                    <button onClick={() => setForm(p => ({ ...p, term: p.term.toLowerCase() }))}
                                        style={{ padding: '2px 8px', background: '#f44336', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Fix</button>
                                </div>
                            )}
                            <SpellingBanner changes={spellChanges} suggested={spellSuggested} onApply={v => setForm(p => ({ ...p, term: v }))} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, marginBottom: 4, color: '#555' }}>
                                Type
                                {form.detectedType && <span style={{ marginLeft: 6, fontSize: 12, padding: '2px 7px', borderRadius: 10, background: '#e3f2fd', color: '#1565c0' }}>NLP: {form.detectedType}</span>}
                                {form.type !== form.detectedType && (
                                    <span style={{ marginLeft: 8, fontSize: 11, color: '#ff9800' }}>
                                        (overriding)
                                        <button onClick={() => setForm(p => ({ ...p, type: p.detectedType }))}
                                            style={{ marginLeft: 5, fontSize: 11, color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>reset</button>
                                    </span>
                                )}
                            </label>
                            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 5, fontSize: 15 }}>
                                {TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleSave} style={{ flex: 1, padding: 10, background: '#4caf50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>Save</button>
                            <button onClick={() => setModal(null)} style={{ flex: 1, padding: 10, background: '#eee', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KironaanComposer;