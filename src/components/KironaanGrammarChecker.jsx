import React, { useState, useMemo } from 'react';
import { getSpellingSuggestions, decodeKironaan } from '../utils/kironaanUtils';

const SEGMENT_ORDER_MAP = {
    'sók':     { order: 1, label: 'Question' },
    'dis':     { order: 2, label: 'Plural' },
    'ki':      { order: 3, label: 'Negative' },
    'gré':     { order: 4, label: 'Degree (2nd)' },
    'grésali': { order: 4, label: 'Degree (3rd)' },
    'pó':      { order: 5, label: 'Past Tense' },
    'tó':      { order: 5, label: 'Future Tense' },
    'orsik':   { order: 8, label: 'Possession' },
};
const TYPE_ORDER  = { Adjective: 5, Noun: 6, Verb: 6, Adverb: 7 };
const ORDER_NAMES = ['', 'Question', 'Plural', 'Negative', 'Degree', 'Descriptor/Tense', 'Base', 'Adverb', 'Possession'];

const normalizeEn = (w) => w.toLowerCase().replace(/[^a-z]/gi, '');
const normalizeKr = (w) => w.toLowerCase().trim();
const displayType = (t) => t === 'NaN' ? 'Other' : t;

const getSegmentInfo = (seg, terms) => {
    const n = normalizeKr(seg);
    if (SEGMENT_ORDER_MAP[n]) {
        const { order, label } = SEGMENT_ORDER_MAP[n];
        return { order, label, translation: label, type: 'Prefix', term: seg };
    }
    // Match stored form OR decoded form (user may type double-consonant latin)
    const match = terms.find(t =>
        normalizeKr(t.term) === n ||
        decodeKironaan(normalizeKr(t.term)) === n
    );
    if (!match) return { order: null, label: 'Unknown', translation: null, type: 'Unknown', term: seg };
    return { order: TYPE_ORDER[match.type] ?? null, label: match.type, translation: match.translation, type: match.type, term: match.term };
};

const validateCompound = (segments, terms) => {
    const infos = segments.map(s => ({ seg: s, ...getSegmentInfo(s, terms) }));
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
    return { infos, violations };
};

// Tooltip: english · kironaan(latin) · type
function KrToken({ term, translation, type }) {
    const [show, setShow] = useState(false);
    const decoded = decodeKironaan(term);
    return (
        <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
            style={{ position: 'relative', cursor: 'default' }}>
            {term}
            {show && (
                <span style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: '#333', color: 'white', borderRadius: 5, padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap', zIndex: 300, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {translation && <span>{translation}</span>}
                    {translation && <span style={{ opacity: 0.4 }}>·</span>}
                    <span style={{ opacity: 0.75 }}>{decoded}</span>
                    {type && <><span style={{ opacity: 0.4 }}>·</span><span style={{ opacity: 0.65, fontStyle: 'italic' }}>{displayType(type)}</span></>}
                </span>
            )}
        </span>
    );
}

function Chip({ label, status, tooltip }) {
    const [show, setShow] = useState(false);
    const C = {
        ok:        { bg: '#e8f5e9', border: '#4caf50', dot: '#4caf50' },
        warn:      { bg: '#fff3e0', border: '#ff9800', dot: '#ff9800' },
        error:     { bg: '#fce4ec', border: '#f44336', dot: '#f44336' },
        ambiguous: { bg: '#f3e5f5', border: '#9c27b0', dot: '#9c27b0' },
        unknown:   { bg: '#f5f5f5', border: '#bbb',    dot: '#bbb'    },
    }[status] || { bg: '#f5f5f5', border: '#bbb', dot: '#bbb' };
    return (
        <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, cursor: 'default', fontSize: 14, userSelect: 'none', background: C.bg, border: `1px solid ${C.border}` }}>
            {label}
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.dot, flexShrink: 0 }} />
            {show && tooltip && (
                <span style={{ position: 'absolute', bottom: '120%', left: 0, zIndex: 200, background: '#333', color: 'white', borderRadius: 5, padding: '5px 8px', fontSize: 12, minWidth: 140, maxWidth: 260, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {tooltip}
                </span>
            )}
        </span>
    );
}

const btn = (bg, border, color) => ({ padding: '7px 16px', borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: 'pointer', fontSize: 14 });

const parseSigils = (tok) => {
    const SIGIL_PREFIXES = ['!!','!','?','*','^','#','&'];
    let rest = tok;
    const hasPossession = rest.endsWith('@');
    if (hasPossession) rest = rest.slice(0, -1);
    let changed = true;
    while (changed) {
        changed = false;
        for (const s of SIGIL_PREFIXES) {
            if (rest.startsWith(s)) { rest = rest.slice(s.length); changed = true; break; }
        }
    }
    return rest.replace(/^[.()\[\],;]+|[.()\[\],;]+$/g, '');
};

// ── CARD A: English → Kironaan ──────────────────────────────
function EnglishToKironaan({ terms }) {
    const [text, setText]                    = useState('');
    const [selectedMeanings, setSelMeanings] = useState({});
    const [activeChip, setActiveChip]        = useState(null);
    const [copied, setCopied]                = useState('');

    const tokens = text.split(/(\s+)/);

    const nonPhraseTerms     = terms.filter(t => t.type !== 'Phrases');
    const findMatches        = (word) => { const n = normalizeEn(word); if (!n) return []; return nonPhraseTerms.filter(t => t.translation.split(/[,/\s]+/).some(tr => normalizeEn(tr) === n)); };
    const findPartialMatches = (word) => { const n = normalizeEn(word); if (!n) return []; return nonPhraseTerms.filter(t => t.translation.split(/[,/\s]+/).some(tr => normalizeEn(tr).startsWith(n) && normalizeEn(tr) !== n)); };
    const resolveBase        = (base, idx) => { if (selectedMeanings[idx]) return selectedMeanings[idx]; const ms = findMatches(base); return ms.length ? ms[0] : { term: base, translation: null, type: null }; };

    const isTermVerb  = (w) => { const n = normalizeEn(w); return terms.some(t => t.type === 'Verb'  && t.translation.split(/[,\s]+/).some(tr => normalizeEn(tr) === n)); };
    const isTermAdverb= (w) => { const n = normalizeEn(w); return terms.some(t => t.type === 'Adverb'&& t.translation.split(/[,\s]+/).some(tr => normalizeEn(tr) === n)); };

    // Mirror Composer tokenMeta: phrase detection, 'to' absorption, adverb attachment
    const tokenMeta = useMemo(() => {
        const wordIndices = tokens.map((tok, i) => /^\s+$/.test(tok) ? null : i).filter(i => i !== null);
        const absorbed = new Set(), adverbOf = {}, phraseHead = {};
        const phraseTerms = terms.filter(t => t.type === 'Phrases');

        for (let wi = 0; wi < wordIndices.length; wi++) {
            if (absorbed.has(wordIndices[wi])) continue;
            const i = wordIndices[wi];
            const base = parseSigils(tokens[i]);

            const sortedPhrases = [...phraseTerms].sort((a, b) => b.translation.split(/\s+/).length - a.translation.split(/\s+/).length);
            let phraseMatched = false;
            for (const pt of sortedPhrases) {
                const pw = pt.translation.toLowerCase().split(/\s+/);
                if (pw.length < 2 || wi + pw.length > wordIndices.length) continue;
                if (pw.every((w, j) => normalizeEn(parseSigils(tokens[wordIndices[wi + j]])) === normalizeEn(w))) {
                    phraseHead[i] = pt;
                    for (let j = 1; j < pw.length; j++) absorbed.add(wordIndices[wi + j]);
                    wi += pw.length - 1;
                    phraseMatched = true; break;
                }
            }
            if (phraseMatched) continue;

            if (normalizeEn(base) === 'to' && wi + 1 < wordIndices.length) {
                const nextBase = parseSigils(tokens[wordIndices[wi + 1]]);
                if (isTermVerb(nextBase)) { absorbed.add(i); continue; }
            }

            if (wi > 0 && isTermAdverb(base)) {
                const prevI = wordIndices[wi - 1];
                if (!absorbed.has(prevI) && isTermVerb(parseSigils(tokens[prevI]))) adverbOf[i] = prevI;
            }
        }
        return { absorbed, adverbOf, phraseHead };
    }, [tokens, terms]); // eslint-disable-line

    const getStatus = (base, idx) => {
        if (!normalizeEn(base)) return null;
        if (selectedMeanings[idx]) return 'ok';
        const ms = findMatches(base);
        if (!ms.length) return findPartialMatches(base).length ? 'warn' : 'error';
        if (ms.length > 1) return 'ambiguous';
        return 'ok';
    };

    const resolveToken = (tok, idx) => {
        if (tokenMeta.phraseHead[idx]) return tokenMeta.phraseHead[idx];
        return resolveBase(parseSigils(tok), idx);
    };

    const sentenceViolations = [];
    let lastVerbIdx = -1, lastNounIdx = -1;
    tokens.forEach((tok, i) => {
        if (/^\s+$/.test(tok) || tokenMeta.absorbed.has(i) || tokenMeta.adverbOf[i] !== undefined) return;
        const type = resolveToken(tok, i)?.type;
        if (type === 'Verb')  lastVerbIdx = i;
        if (type === 'Noun')  lastNounIdx = i;
        if (type === 'Pronouns' && lastVerbIdx > -1)
            sentenceViolations.push(`"${tok}": pronoun after verb — subject should precede the verb`);
        if (type === 'Adjective' && lastNounIdx > -1 && lastNounIdx < i)
            sentenceViolations.push(`"${tok}": adjective after noun — descriptors precede the base word in Kironaan`);
    });

    const buildKironaan = () =>
        tokens.map((tok, idx) => {
            if (/^\s+$/.test(tok)) return tok;
            if (tokenMeta.absorbed.has(idx) && !tokenMeta.phraseHead[idx]) return '';
            if (tokenMeta.adverbOf[idx] !== undefined) return '';
            return (resolveToken(tok, idx)?.term || tok).toLowerCase();
        }).join('');

    const copy = (val, label) => { navigator.clipboard.writeText(val); setCopied(label); setTimeout(() => setCopied(''), 2000); };
    const kr        = buildKironaan();
    const krDecoded = decodeKironaan(kr);

    return (
        <div>
            <textarea value={text} onChange={e => { setText(e.target.value); setSelMeanings({}); }}
                placeholder="Type an English sentence..."
                style={{ width: '100%', minHeight: 80, padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }} />

            {text.trim() && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fafafa', marginTop: 6, minHeight: 40 }}>
                        {tokens.map((tok, i) => {
                            if (/^\s+$/.test(tok)) return <span key={i} style={{ width: 6 }} />;
                            if (tokenMeta.absorbed.has(i) && !tokenMeta.phraseHead[i]) return (
                                <span key={i} title={normalizeEn(tok) === 'to' ? "'to' absorbed" : "Part of phrase"}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, fontSize: 14, background: '#f5f5f5', border: '1px dashed #bbb', color: '#aaa', textDecoration: 'line-through', cursor: 'help' }}>
                                    {tok}
                                </span>
                            );
                            if (tokenMeta.adverbOf[i] !== undefined) return (
                                <span key={i} title="Adverb suffix attached to preceding verb"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, fontSize: 14, background: '#e3f2fd', border: '1px solid #1565c0', color: '#1565c0', cursor: 'help' }}>
                                    ↳ {tok}
                                    <span style={{ fontSize: 10, background: '#bbdefb', borderRadius: 4, padding: '0 4px' }}>adv-suffix</span>
                                </span>
                            );
                            if (tokenMeta.phraseHead[i]) {
                                const pt = tokenMeta.phraseHead[i];
                                return (
                                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, fontSize: 14, background: '#e8f5e9', border: '1px solid #4caf50' }}>
                                        {pt.translation}
                                        <span style={{ fontSize: 10, color: '#2e7d32', background: '#c8e6c9', borderRadius: 4, padding: '0 4px' }}>phrase</span>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50' }} />
                                    </span>
                                );
                            }

                            const base     = parseSigils(tok);
                            const status   = getStatus(base, i);
                            const ms       = findMatches(base);
                            const isActive = activeChip === i;
                            const allRows  = [...ms, ...findPartialMatches(base).filter(p => !ms.find(m => m.term === p.term))];

                            return (
                                <span key={i} style={{ position: 'relative' }}>
                                    <span onClick={() => setActiveChip(isActive ? null : i)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 14, cursor: 'pointer', fontSize: 14, userSelect: 'none',
                                            background: { ok: '#e8f5e9', warn: '#fff3e0', error: '#fce4ec', ambiguous: '#f3e5f5' }[status] || '#f5f5f5',
                                            border: `1px solid ${{ ok: '#4caf50', warn: '#ff9800', error: '#f44336', ambiguous: '#9c27b0' }[status] || '#ccc'}` }}>
                                        {tok}
                                        {selectedMeanings[i] && <span style={{ fontSize: 11, color: '#555', fontStyle: 'italic' }}>{decodeKironaan(selectedMeanings[i].term.toLowerCase())}</span>}
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: { ok: '#4caf50', warn: '#ff9800', error: '#f44336', ambiguous: '#9c27b0' }[status] || '#bbb' }} />
                                    </span>
                                    {isActive && allRows.length > 0 && (
                                        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 300, background: 'white', borderRadius: 8, minWidth: 230, boxShadow: '0 6px 20px rgba(0,0,0,0.15)', padding: 10 }}>
                                            <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Select meaning</div>
                                            {allRows.map((m, mi) => {
                                                const isSel = selectedMeanings[i]?.term === m.term;
                                                return (
                                                    <div key={mi} onClick={() => { setSelMeanings(p => ({ ...p, [i]: m })); setActiveChip(null); }}
                                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: 5, cursor: 'pointer', background: isSel ? '#e8f5e9' : '#fafafa', border: `1px solid ${isSel ? '#4caf50' : '#e0e0e0'}`, marginBottom: 3 }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{m.translation}</span>
                                                            <span style={{ fontSize: 11, color: '#777' }}>{decodeKironaan(m.term.toLowerCase())}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <span style={{ fontSize: 11, color: '#999' }}>{displayType(m.type)}</span>
                                                            {isSel && <span>✓</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </span>
                            );
                        })}
                    </div>

                    {sentenceViolations.length > 0 && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff3e0', borderRadius: 6, border: '1px solid #ff9800' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#e65100', marginBottom: 4 }}>Grammar warnings</div>
                            {sentenceViolations.map((v, i) => <div key={i} style={{ fontSize: 13, color: '#bf360c' }}>⚠ {v}</div>)}
                        </div>
                    )}

                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f3f0ff', borderRadius: 6, border: '1px solid #d1c4e9' }}>
                        <span style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>KIRONAAN OUTPUT</span>
                        <span className="KironaanFont" style={{ fontSize: 20 }}>
                            {tokens.map((tok, i) => {
                                if (/^\s+$/.test(tok)) return <span key={i}> </span>;
                                if ((tokenMeta.absorbed.has(i) && !tokenMeta.phraseHead[i]) || tokenMeta.adverbOf[i] !== undefined) return null;
                                const r = resolveToken(tok, i);
                                return <KrToken key={i} term={(r?.term || tok).toLowerCase()} translation={r?.translation} type={r?.type} />;
                            })}
                        </span>
                        <span style={{ display: 'block', marginTop: 5, fontSize: 14, color: '#555' }}>{krDecoded}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => copy(text, 'en')} style={btn('white', '#ccc', '#333')}>{copied === 'en' ? '✓ Copied!' : 'Copy English'}</button>
                        <button onClick={() => copy(krDecoded, 'kr')} style={btn('#5c35d4', '#5c35d4', 'white')}>{copied === 'kr' ? '✓ Copied!' : 'Copy Kironaan'}</button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── CARD B: Kironaan → English ───────────────────────────────
function KironaanToEnglish({ terms }) {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);

    const { suggested, changes } = getSpellingSuggestions(text);
    const hasSuggestions = changes.length > 0;

    const analyzed = text
        .split(/(\s+)/)
        .filter(t => !/^\s+$/.test(t) && t.trim())
        .map(token => {
            const segs = token.split('-');
            if (segs.length === 1) {
                const info = getSegmentInfo(token, terms);
                return { token, isCompound: false, segments: [{ seg: token, ...info }], violations: [], translation: info.translation || token };
            }
            const { infos, violations } = validateCompound(segs, terms);
            return { token, isCompound: true, segments: infos, violations, translation: infos.map(i => i.translation || i.seg).join(' ') };
        });

    const allViolations = analyzed.flatMap(a => a.violations);
    const englishOut    = analyzed.map(a => a.translation).join(' ').toLowerCase();

    const copy = () => { navigator.clipboard.writeText(englishOut); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    return (
        <div>
            <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Type a Kironaan sentence (romanized, hyphens for compounds)..."
                style={{ width: '100%', minHeight: 80, padding: 10, fontSize: 15, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical', boxSizing: 'border-box' }} />

            {hasSuggestions && (
                <div style={{ marginTop: 6, padding: '8px 12px', background: '#fff8e1', borderRadius: 6, border: '1px solid #ffc107', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#e65100' }}>Spelling suggestion: </span>
                        {changes.map((c, i) => (
                            <span key={i} style={{ fontSize: 12, color: '#555', marginRight: 10 }}>
                                <code style={{ background: '#ffe082', padding: '1px 4px', borderRadius: 3 }}>{c.from}</code>
                                {' → '}
                                <code style={{ background: '#c8e6c9', padding: '1px 4px', borderRadius: 3 }}>{c.to}</code>
                            </span>
                        ))}
                    </div>
                    <button onClick={() => setText(suggested)}
                        style={{ padding: '4px 12px', background: '#ffc107', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Apply</button>
                </div>
            )}

            {text.trim() && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fafafa', marginTop: 6, minHeight: 40 }}>
                        {analyzed.map((a, i) => {
                            const status = a.violations.length > 0 ? 'error' : a.segments.every(s => s.type !== 'Unknown') ? 'ok' : 'unknown';
                            // Chip tooltip: english · kironaan(latin) · type
                            const tooltip = a.isCompound
                                ? a.segments.map(s => `${s.translation || '?'} · ${decodeKironaan(s.seg)} · ${s.label}`).join('\n')
                                : `${a.segments[0]?.translation || '?'} · ${decodeKironaan(a.segments[0]?.seg || '')} · ${a.segments[0]?.label || ''}`;
                            return <Chip key={i} label={a.token} status={status} tooltip={tooltip} />;
                        })}
                    </div>

                    {allViolations.length > 0 && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#fce4ec', borderRadius: 6, border: '1px solid #f44336' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#b71c1c', marginBottom: 4 }}>Order violations</div>
                            {allViolations.map((v, i) => <div key={i} style={{ fontSize: 13, color: '#c62828' }}>✗ {v}</div>)}
                        </div>
                    )}

                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#e8f5e9', borderRadius: 6, border: '1px solid #a5d6a7' }}>
                        <span style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 3 }}>ENGLISH TRANSLATION</span>
                        <span style={{ fontSize: 16 }}>{englishOut}</span>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <button onClick={copy} style={btn('white', '#ccc', '#333')}>{copied ? '✓ Copied!' : 'Copy English'}</button>
                    </div>
                </>
            )}
        </div>
    );
}

function KironaanGrammarChecker({ terms }) {
    const [tab, setTab] = useState('en');
    return (
        <div>
            <h2 style={{ marginBottom: 2 }}>Grammar Checker</h2>
            <p style={{ margin: '0 0 12px', fontSize: 14, color: '#777' }}>To ensure the Kironaan grammar is correct</p>
            <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: 16 }}>
                {[['en', 'English → Kironaan'], ['kr', 'Kironaan → English']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)} style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === key ? 700 : 400, borderBottom: tab === key ? '3px solid #5c35d4' : '3px solid transparent', color: tab === key ? '#5c35d4' : '#555', marginBottom: -2 }}>
                        {label}
                    </button>
                ))}
            </div>
            {tab === 'en' ? <EnglishToKironaan terms={terms} /> : <KironaanToEnglish terms={terms} />}
        </div>
    );
}

export default KironaanGrammarChecker;