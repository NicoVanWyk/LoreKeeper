import React, {useState, useMemo} from 'react';
import {
    parseSigils, buildCompound, normalize, computeTokenMeta, decodeKironaan
} from '../utils/kironaanUtils';

const displayType = (t) => t === 'NaN' ? 'Other' : t;

// Renders a psalm's Kironaan output. termIds are resolved live from terms[],
// so any spelling edit to a term auto-propagates here without touching the psalm doc.
function PsalmRenderer({psalm, terms}) {
    const tokens = useMemo(() => psalm.englishText.split(/(\s+)/), [psalm.englishText]);

    const wordTokenIndices = useMemo(
        () => tokens.map((t, i) => /^\s+$/.test(t) ? null : i).filter(i => i !== null),
        [tokens]
    );

    const tokenMeta = useMemo(() => computeTokenMeta(tokens, terms), [tokens, terms]);

    const nonPhraseTerms = terms.filter(t => t.type !== 'Phrases');
    const findMatches = (base) => {
        const n = normalize(base);
        if (!n) return [];
        return nonPhraseTerms.filter(t =>
            t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n)
        );
    };

    // Resolve a word-index to a live term. termId takes priority; falls back to
    // auto-resolve so unselected (unambiguous) words always stay current.
    const resolveByWordIdx = (wIdx) => {
        const sel = psalm.wordSelections?.[wIdx];
        const tIdx = wordTokenIndices[wIdx];
        if (tIdx === undefined) return null;
        const {base} = parseSigils(tokens[tIdx]);
        if (sel?.termId) {
            const found = terms.find(t => t.id === sel.termId);
            if (found) return found;
            // termId stored but term was deleted — fall back to auto-resolve
        }
        const ms = findMatches(base);
        return ms[0] || {term: base, translation: null, type: null};
    };

    const renderItems = useMemo(() => {
        return tokens.map((tok, tIdx) => {
            if (/^\s+$/.test(tok)) return {tIdx, isSpace: true};

            const wIdx = wordTokenIndices.indexOf(tIdx);

            if (tokenMeta.absorbed.has(tIdx) && !tokenMeta.phraseHead[tIdx]) return {tIdx, skip: true};
            if (tokenMeta.adverbOf[tIdx] !== undefined) return {tIdx, skip: true};

            if (tokenMeta.phraseHead[tIdx]) {
                const pt = tokenMeta.phraseHead[tIdx];
                return {tIdx, output: pt.term.toLowerCase(), resolved: pt};
            }

            const {base, prefixes, hasPossession} = parseSigils(tok);
            const resolved = resolveByWordIdx(wIdx);

            // Adverb suffix: if next word-token is an adverb attached to this verb
            const nextWI = wIdx + 1;
            const nextTI = wordTokenIndices[nextWI];
            let adverbTerm = null;
            if (nextTI !== undefined && tokenMeta.adverbOf[nextTI] === tIdx) {
                adverbTerm = resolveByWordIdx(nextWI)?.term || parseSigils(tokens[nextTI]).base;
            }

            const output = buildCompound(
                resolved?.term || base, prefixes, hasPossession, adverbTerm
            ).toLowerCase();
            return {tIdx, output, resolved};
        });
    }, [tokens, tokenMeta, psalm.wordSelections, terms]); // eslint-disable-line

    const kironaan = renderItems.map(r => r.isSpace ? ' ' : r.skip ? '' : (r.output || '')).join('');
    const kironaaDecoded = decodeKironaan(kironaan);

    return (
        <div style={{
            marginTop: 10,
            padding: '10px 14px',
            background: '#f3f0ff',
            borderRadius: 6,
            border: '1px solid #d1c4e9'
        }}>
            <div className="KironaanFont" style={{fontSize: 18, lineHeight: 1.8, marginBottom: 4}}>
                {renderItems.map((r, i) => {
                    if (r.isSpace) return <span key={i}> </span>;
                    if (r.skip) return null;
                    const tip = r.resolved?.translation
                        ? `${r.resolved.translation} · ${decodeKironaan(r.output || '')} · ${displayType(r.resolved.type || '')}`
                        : null;
                    return (
                        <span key={i} title={tip || undefined}
                              style={{cursor: tip ? 'help' : 'default'}}>
                            {r.output}{' '}
                        </span>
                    );
                })}
            </div>
            <div style={{fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 2}}>
                {kironaaDecoded}
            </div>
        </div>
    );
}

function PsalmCard({psalm, terms, isAdmin, onEdit, onDelete}) {
    const [open, setOpen] = useState(false);

    return (
        <div style={{
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            background: 'white',
            marginBottom: 12,
            overflow: 'hidden'
        }}>
            {/* Header row */}
            <div onClick={() => setOpen(o => !o)}
                 style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     padding: '12px 16px',
                     cursor: 'pointer',
                     userSelect: 'none',
                     background: open ? '#f9f6ff' : 'white',
                     transition: 'background 0.15s'
                 }}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <span style={{fontSize: 13, fontWeight: 700, color: '#9c27b0', minWidth: 28}}>
                        {psalm.order}
                    </span>
                    <span style={{fontSize: 16, fontWeight: 600}}>{psalm.title}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    {isAdmin && (
                        <>
                            <button onClick={e => {
                                e.stopPropagation();
                                onEdit(psalm);
                            }}
                                    style={{
                                        padding: '2px 10px',
                                        fontSize: 12,
                                        border: '1px solid #1976d2',
                                        color: '#1976d2',
                                        background: 'white',
                                        borderRadius: 4,
                                        cursor: 'pointer'
                                    }}>
                                Edit
                            </button>
                            <button onClick={e => {
                                e.stopPropagation();
                                onDelete(psalm.id);
                            }}
                                    style={{
                                        padding: '2px 10px',
                                        fontSize: 12,
                                        border: '1px solid #e53935',
                                        color: '#e53935',
                                        background: 'white',
                                        borderRadius: 4,
                                        cursor: 'pointer'
                                    }}>
                                Delete
                            </button>
                        </>
                    )}
                    <span style={{fontSize: 18, color: '#aaa', marginLeft: 4}}>{open ? '▴' : '▾'}</span>
                </div>
            </div>

            {/* Expanded body */}
            {open && (
                <div style={{padding: '0 16px 16px', borderTop: '1px solid #f0e8ff'}}>
                    {/* English text */}
                    <p style={{margin: '12px 0 4px', fontSize: 15, color: '#333', lineHeight: 1.7}}>
                        {psalm.englishText}
                    </p>
                    {/* Live-rendered Kironaan */}
                    <PsalmRenderer psalm={psalm} terms={terms}/>
                </div>
            )}
        </div>
    );
}

function BlackBookViewer({psalms, terms, isAdmin, onEdit, onDelete, onNew}) {
    const [search, setSearch] = useState('');

    const filtered = psalms
        .filter(p =>
            !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.englishText.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.order - b.order);

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
                flexWrap: 'wrap',
                gap: 10,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{minWidth: 0}}>
                    <h2 style={{margin: 0}}>The Black Book</h2>
                    <p style={{margin: '2px 0 0', fontSize: 14, color: '#777'}}>
                        {psalms.length} {psalms.length === 1 ? 'entry' : 'entries'}
                    </p>
                </div>
                <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search entries…"
                        style={{
                            padding: '7px 10px',
                            border: '1px solid #ccc',
                            borderRadius: 5,
                            fontSize: 14,
                            minWidth: 200
                        }}
                    />
                    {isAdmin && (
                        <button onClick={onNew}
                                style={{
                                    padding: '7px 16px',
                                    background: '#5c35d4',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    whiteSpace: 'nowrap'
                                }}>
                            + New Entry
                        </button>
                    )}
                </div>
            </div>

            {filtered.length === 0 ? (
                <p style={{textAlign: 'center', color: '#aaa', fontStyle: 'italic', marginTop: 32}}>
                    {psalms.length === 0 ? 'No entries yet.' : 'No entries match your search.'}
                </p>
            ) : (
                filtered.map(p => (
                    <PsalmCard
                        key={p.id}
                        psalm={p}
                        terms={terms}
                        isAdmin={isAdmin}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))
            )}
        </div>
    );
}

export default BlackBookViewer;