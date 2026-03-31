import React, {useState, useEffect, useRef, useMemo} from 'react';
import nlp from 'compromise';
import {addKironaanTerm, getAllKironaanTerms} from '../services/kironaanService';
import {addPsalm, updatePsalm} from '../services/blackBookService';
import {
    SIGIL_PREFIXES, SIGIL_SUFFIX,
    parseSigils, buildCompound, normalize, computeTokenMeta, lcsWordDiff,
    decodeKironaan, getComposerSpellingSuggestions, findPartialPhraseMatches, findNumberPhrases,
    isConceptShortcut, resolveConceptShortcut
} from '../utils/kironaanUtils';

const ADMIN_UID = 'baQCmZdQOna3KhFSjoTA3jt2Lw72';
const TYPES = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Conjunction', 'Prepositions', 'Pronouns', 'Number', 'Math', 'Phrases', 'Articles', 'Prefix', 'Suffix', 'Determiner', 'NaN'];
const POP_PAGE_SZ = 6;

const displayType = (t) => t === 'NaN' ? 'Other' : t;

const detectNlpType = (word) => {
    const doc = nlp(word);
    if (doc.verbs().length) return 'Verb';
    if (doc.adjectives().length) return 'Adjective';
    if (doc.adverbs().length) return 'Adverb';
    if (doc.nouns().length) return 'Noun';
    return 'Noun';
};

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

const buildInitialSelections = (psalm) => psalm?.wordSelections?.length ? psalm.wordSelections : [];

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

const pgBtn = (dis) => ({
    padding: '2px 8px',
    border: '1px solid #ccc',
    borderRadius: 4,
    background: dis ? '#f5f5f5' : 'white',
    color: dis ? '#bbb' : '#333',
    cursor: dis ? 'default' : 'pointer',
    fontSize: 12
});

function PhraseSuggestionsBanner({suggestions}) {
    if (!suggestions.length) return null;
    return (
        <div style={{
            marginTop: 6,
            marginBottom: 8,
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

function EditorWordPopover({popover, currentTermId, terms, onSelect, onQuickAdd, isAdmin, popRef}) {
    const {word, wordIdx, matches, partials, rect} = popover;
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
                        const isSel = !m.isPartial && m.id === currentTermId;
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
                                <div onClick={() => onSelect(wordIdx, m)}
                                     style={{
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

function BlackBookEditor({psalm, terms, onTermsChange, onSave, onClose, userId, nextOrder}) {
    const isAdmin = userId === ADMIN_UID;

    const [title, setTitle] = useState(psalm?.title || '');
    const [order, setOrder] = useState(psalm?.order ?? nextOrder ?? 1);
    const [englishText, setEnglishText] = useState(psalm?.englishText || '');
    const [wordSelections, setWordSelections] = useState(() => buildInitialSelections(psalm));
    const [popover, setPopover] = useState(null);
    const [saving, setSaving] = useState(false);
    const [confirmingPhrase, setConfirmingPhrase] = useState(null);
    const [rejectedPhrases, setRejectedPhrases] = useState(new Set());
    const [readableEnglish, setReadableEnglish] = useState(psalm?.readableEnglish || '');

    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({translations: [], term: '', type: 'Noun', detectedType: 'Noun'});
    const [tagInput, setTagInput] = useState('');
    const [defs, setDefs] = useState({});
    const popRef = useRef(null);

    useEffect(() => {
        const h = (e) => {
            if (popRef.current && !popRef.current.contains(e.target)) setPopover(null);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        form.translations.forEach(w => {
            if (w && defs[w] === undefined) {
                setDefs(p => ({...p, [w]: null}));
                fetchDictDef(w).then(def => setDefs(p => ({...p, [w]: def})));
            }
        });
    }, [form.translations.join(',')]); // eslint-disable-line

    const handleTextChange = (newText) => {
        const newTokens = newText.split(/(\s+)/);
        const newBaseWords = newTokens.filter(t => !/^\s+$/.test(t)).map(t => parseSigils(t).base);
        const oldBaseWords = wordSelections.map(s => s.word);
        setWordSelections(lcsWordDiff(oldBaseWords, newBaseWords, wordSelections));
        setEnglishText(newText);
        setPopover(null);
        setConfirmingPhrase(null);
        setRejectedPhrases(new Set());
    };

    const tokens = englishText.split(/(\s+)/);

    const expandedTokens = [];
    tokens.forEach((tok) => {
        if (/^\s+$/.test(tok)) {
            expandedTokens.push(tok);
        } else {
            const parts = tok.split(/(-)/);
            parts.forEach(part => {
                if (part) expandedTokens.push(part);
            });
        }
    });

    const workingTokens = expandedTokens;

    const wordTokenIndices = useMemo(
        () => workingTokens.map((t, i) => (/^\s+$/.test(t) || t === '-') ? null : i).filter(i => i !== null),
        [englishText] // eslint-disable-line
    );

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

    const tokenMeta = useMemo(() => computeTokenMeta(workingTokens, terms), [englishText, terms]); // eslint-disable-line
    const numberPhrases = useMemo(() => findNumberPhrases(workingTokens), [englishText]); // eslint-disable-line
    const phraseSuggestions = useMemo(() => findPartialPhraseMatches(workingTokens, terms), [englishText, terms]); // eslint-disable-line

    const pendingPhraseMap = useMemo(() => {
        const map = new Map();
        const wordIndices = workingTokens.map((t, i) => (/^\s+$/.test(t) || t === '-') ? null : i).filter(i => i !== null);
        phraseSuggestions.forEach(s => {
            if (rejectedPhrases.has(s.phrase.term)) return;

            const phraseNorms = s.matchedMeaning.toLowerCase().split(/\s+/).map(normalize);
            wordIndices.forEach(tIdx => {
                const base = normalize(parseSigils(workingTokens[tIdx]).base);
                if (phraseNorms.includes(base)) map.set(tIdx, s);
            });
        });
        return map;
    }, [englishText, phraseSuggestions, rejectedPhrases]); // eslint-disable-line

    const resolveByWordIdx = (wIdx) => {
        const sel = wordSelections[wIdx];
        const tIdx = wordTokenIndices[wIdx];
        if (tIdx === undefined) return null;
        const {base, isConceptShortcut: isConcept} = parseSigils(workingTokens[tIdx]);

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

    const resolveTokenOutput = (tokenIdx, wordIdx) => {
        if (tokenMeta.phraseHead[tokenIdx]) return tokenMeta.phraseHead[tokenIdx].term.toLowerCase();
        const {
            base,
            prefixes,
            hasPossession,
            leadingPunct,
            trailingPunct,
            isConceptShortcut: isConcept
        } = parseSigils(workingTokens[tokenIdx]);

        if (isConcept) {
            const concept = resolveConceptShortcut(base);
            return `${leadingPunct}${concept.term}${trailingPunct}`;
        }

        const resolved = resolveByWordIdx(wordIdx);
        const nextWI = wordIdx + 1;
        const nextTI = wordTokenIndices[nextWI];
        let adverbTerm = null;
        if (nextTI !== undefined && tokenMeta.adverbOf[nextTI] === tokenIdx)
            adverbTerm = resolveByWordIdx(nextWI)?.term || parseSigils(workingTokens[nextTI]).base;
        return buildCompound(resolved?.term || base, prefixes, hasPossession, adverbTerm, leadingPunct, trailingPunct).toLowerCase();
    };

    const buildKironaan = () =>
        workingTokens.map((tok, tIdx) => {
            if (/^\s+$/.test(tok)) return tok;
            if (tok === '-') return '-';
            if (tokenMeta.phraseHead[tIdx]) {
                return tokenMeta.phraseHead[tIdx].term.toLowerCase();
            }
            const wIdx = wordTokenIndices.indexOf(tIdx);
            if (tokenMeta.absorbed.has(tIdx)) return '';
            if (tokenMeta.adverbOf[tIdx] !== undefined) return '';
            return resolveTokenOutput(tIdx, wIdx);
        }).join('');

    const kironaan = buildKironaan();
    const kironaanDecoded = decodeKironaan(kironaan);

    const getStatus = (base, wordIdx) => {
        if (!normalize(base)) return null;
        if (isConceptShortcut(base)) return 'matched';
        const sel = wordSelections[wordIdx];
        if (sel?.termId && terms.find(t => t.id === sel.termId)) return 'matched';
        const ms = findMatches(base);
        if (!ms.length) return findPartialMatches(base).length ? 'partial' : 'unmatched';
        if (ms.length > 1) return 'ambiguous';
        return 'matched';
    };

    const STATUS_COLOR = {matched: '#4caf50', partial: '#ff9800', unmatched: '#f44336', ambiguous: '#9c27b0'};
    const STATUS_BG = {matched: '#e8f5e9', partial: '#fff3e0', unmatched: '#fce4ec', ambiguous: '#f3e5f5'};

    const openPopover = (e, base, wordIdx) => {
        e.stopPropagation();
        setPopover({
            word: base,
            wordIdx,
            matches: findMatches(base),
            partials: findPartialMatches(base),
            rect: e.currentTarget.getBoundingClientRect()
        });
    };
    const handleSelect = (wordIdx, term) => {
        setWordSelections(prev => {
            const next = [...prev];
            next[wordIdx] = {
                word: wordSelections[wordIdx]?.word || parseSigils(tokens[wordTokenIndices[wordIdx]] || '').base,
                termId: term.id
            };
            return next;
        });
        setPopover(null);
    };

    const openQuickAdd = (word) => {
        const d = detectNlpType(word);
        setForm({translations: [word], term: '', type: d, detectedType: d});
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
    const handleQuickSave = async () => {
        await addKironaanTerm({translation: form.translations.join(', '), term: form.term, type: form.type});
        onTermsChange(await getAllKironaanTerms());
        setModal(null);
    };

    const {suggested: spellSuggested, changes: spellChanges} = getComposerSpellingSuggestions(form.term);
    const hasCapital = /[A-Z]/.test(form.term) && !(form.term.length === 1 && /^[A-ZÁÉÍÓÚ{}|]$/.test(form.term));

    const handleSave = async () => {
        if (!title.trim() || !englishText.trim()) return;
        setSaving(true);
        const syncedSelections = wordTokenIndices.map((tIdx, wIdx) => ({
            word: parseSigils(workingTokens[tIdx]).base,
            termId: wordSelections[wIdx]?.termId || null
        }));
        const data = {
            title: title.trim(),
            order: Number(order),
            englishText,
            readableEnglish: readableEnglish.trim(),
            wordSelections: syncedSelections
        };
        try {
            if (psalm?.id) await updatePsalm(psalm.id, data);
            else await addPsalm(data);
            onSave();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '40px 16px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: 10,
                padding: 28,
                width: '100%',
                maxWidth: 720,
                boxShadow: '0 12px 48px rgba(0,0,0,0.28)'
            }}>
                <h3 style={{marginTop: 0, marginBottom: 18}}>{psalm ? 'Edit Entry' : 'New Entry'}</h3>

                <div style={{display: 'flex', gap: 12, marginBottom: 14}}>
                    <div style={{flex: 1}}>
                        <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                               placeholder="e.g. Psalm 1, The Creation…"
                               style={{
                                   width: '100%',
                                   padding: '8px 10px',
                                   border: '1px solid #ccc',
                                   borderRadius: 5,
                                   fontSize: 15,
                                   boxSizing: 'border-box'
                               }}/>
                    </div>
                    <div style={{width: 90}}>
                        <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>Order</label>
                        <input type="number" value={order} onChange={e => setOrder(e.target.value)}
                               style={{
                                   width: '100%',
                                   padding: '8px 10px',
                                   border: '1px solid #ccc',
                                   borderRadius: 5,
                                   fontSize: 15,
                                   boxSizing: 'border-box'
                               }}/>
                    </div>
                </div>

                <details style={{marginBottom: 10}}>
                    <summary style={{cursor: 'pointer', fontSize: 13, color: '#555', userSelect: 'none'}}>▸ Prefix /
                        Suffix shortcuts
                    </summary>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginTop: 8,
                        padding: '8px 10px',
                        background: '#fafafa',
                        borderRadius: 6,
                        border: '1px solid #e0e0e0'
                    }}>
                        {SIGIL_PREFIXES.map(s => (
                            <span key={s.sigil} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 10,
                                background: 'white',
                                border: `1px solid ${s.color}`,
                                fontSize: 12
                            }}>
                                <code style={{color: s.color, fontWeight: 700}}>{s.sigil}word</code>
                                <span style={{color: '#777'}}>→ {s.prefix}-</span>
                            </span>
                        ))}
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: 'white',
                            border: `1px solid ${SIGIL_SUFFIX.color}`,
                            fontSize: 12
                        }}>
                            <code style={{color: SIGIL_SUFFIX.color, fontWeight: 700}}>word{SIGIL_SUFFIX.sigil}</code>
                            <span style={{color: '#777'}}>→ -Orsik</span>
                        </span>
                    </div>
                </details>

                <div style={{marginBottom: 6}}>
                    <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>
                        English Text
                        <span style={{marginLeft: 8, fontSize: 11, color: '#aaa'}}>Click any word chip to resolve ambiguity</span>
                    </label>
                    <textarea value={englishText} onChange={e => handleTextChange(e.target.value)}
                              placeholder="Type the entry in English…"
                              style={{
                                  width: '100%',
                                  minHeight: 100,
                                  padding: 10,
                                  fontSize: 15,
                                  borderRadius: 6,
                                  border: '1px solid #ccc',
                                  resize: 'vertical',
                                  boxSizing: 'border-box'
                              }}/>
                </div>

                <div style={{marginBottom: 6}}>
                    <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>
                        Readable English Translation
                        <span
                            style={{marginLeft: 8, fontSize: 11, color: '#aaa'}}>Optional - for display purposes</span>
                    </label>
                    <textarea value={readableEnglish} onChange={e => setReadableEnglish(e.target.value)}
                              placeholder="Enter a more readable English version for display…"
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
                </div>

                {numberPhrases.length > 0 && (
                    <div style={{
                        marginTop: 6,
                        padding: '8px 12px',
                        background: '#e3f2fd',
                        borderRadius: 6,
                        border: '1px solid #64b5f6'
                    }}>
                        <div style={{fontSize: 12, fontWeight: 700, color: '#1565c0', marginBottom: 6}}>
                            ✦ Number conversions available
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
                                <button onClick={() => handleTextChange(np.apply(englishText))} style={{
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

                <PhraseSuggestionsBanner suggestions={phraseSuggestions}/>

                {confirmingPhrase && (
                    <div style={{
                        marginBottom: 8,
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
                                handleTextChange(confirmingPhrase.apply(englishText));
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

                {englishText.trim() && (
                    <>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 5,
                            padding: '8px 10px',
                            border: '1px solid #e0e0e0',
                            borderRadius: 6,
                            background: '#fafafa',
                            marginBottom: 10,
                            minHeight: 38
                        }}>
                            {workingTokens.map((tok, tIdx) => {
                                if (/^\s+$/.test(tok)) return <span key={tIdx} style={{width: 6}}/>;
                                if (tok === '-') return <span key={tIdx} style={{color: '#999', fontSize: 14}}>-</span>;
                                const wIdx = wordTokenIndices.indexOf(tIdx);

                                if (tokenMeta.absorbed.has(tIdx) && !tokenMeta.phraseHead[tIdx]) return (
                                    <span key={tIdx}
                                          title={normalize(tok) === 'to' ? "'to' absorbed" : "Part of phrase"}
                                          style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 4,
                                              padding: '3px 10px',
                                              borderRadius: 14,
                                              fontSize: 14,
                                              background: '#f5f5f5',
                                              border: '1px dashed #bbb',
                                              color: '#aaa',
                                              textDecoration: 'line-through',
                                              cursor: 'help'
                                          }}>
                                        {tok}
                                    </span>
                                );

                                if (tokenMeta.adverbOf[tIdx] !== undefined) return (
                                    <span key={tIdx} title="Adverb suffix of preceding verb"
                                          style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 4,
                                              padding: '3px 10px',
                                              borderRadius: 14,
                                              fontSize: 14,
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

                                if (tokenMeta.phraseHead[tIdx]) {
                                    const pt = tokenMeta.phraseHead[tIdx];
                                    return (
                                        <span key={tIdx} style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '3px 10px',
                                            borderRadius: 14,
                                            fontSize: 14,
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
                                        </span>
                                    );
                                }

                                const pendingSuggestion = pendingPhraseMap.get(tIdx);
                                if (pendingSuggestion) {
                                    const {base} = parseSigils(tok);
                                    const isConfirming = confirmingPhrase?.phrase.term === pendingSuggestion.phrase.term;
                                    return (
                                        <span key={tIdx}
                                              onClick={() => setConfirmingPhrase(pendingSuggestion)}
                                              title={`Click to use phrase "${pendingSuggestion.phrase.translation}"`}
                                              style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: 4,
                                                  padding: '3px 10px',
                                                  borderRadius: 14,
                                                  fontSize: 14,
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
                                        <span key={tIdx}
                                              title={`${concept.symbol} → ${concept.conceptName}`}
                                              style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: 4,
                                                  padding: '3px 10px',
                                                  borderRadius: 14,
                                                  fontSize: 14,
                                                  userSelect: 'none',
                                                  background: '#fff9e6',
                                                  border: '1px solid #ffd700',
                                                  cursor: 'help'
                                              }}>
                                            {base}
                                            <span style={{fontSize: 11, color: '#b8860b', fontStyle: 'italic'}}>
                                                {concept.conceptName}
                                            </span>
                                            <span style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                background: '#ffd700'
                                            }}/>
                                        </span>
                                    );
                                }

                                const status = getStatus(base, wIdx);
                                const sel = wordSelections[wIdx];
                                const selTerm = sel?.termId ? terms.find(t => t.id === sel.termId) : null;

                                return (
                                    <span key={tIdx} onClick={e => openPopover(e, base, wIdx)}
                                          style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 4,
                                              padding: '3px 10px',
                                              borderRadius: 14,
                                              cursor: 'pointer',
                                              fontSize: 14,
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
                                        }}>{p.prefix}-</span>)}
                                        {base}
                                        {hasPossession && <span style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: SIGIL_SUFFIX.color,
                                            background: `${SIGIL_SUFFIX.color}18`,
                                            borderRadius: 4,
                                            padding: '0 4px'
                                        }}>-Orsik</span>}
                                        {selTerm && <span style={{
                                            fontSize: 11,
                                            color: '#555',
                                            fontStyle: 'italic'
                                        }}>{decodeKironaan(selTerm.term.toLowerCase())}</span>}
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

                        <div style={{
                            marginBottom: 18,
                            padding: '8px 12px',
                            background: '#f3f0ff',
                            borderRadius: 6,
                            border: '1px solid #d1c4e9'
                        }}>
                            <span style={{fontSize: 11, color: '#888', display: 'block', marginBottom: 3}}>KIRONAAN PREVIEW</span>
                            <span className="KironaanFont" style={{fontSize: 19}}>
                                {workingTokens.map((tok, tIdx) => {
                                    if (/^\s+$/.test(tok)) return <span key={tIdx}> </span>;
                                    if (tok === '-') return <span key={tIdx}>-</span>;

                                    if (tokenMeta.phraseHead[tIdx]) {
                                        const pt = tokenMeta.phraseHead[tIdx];
                                        const fontTerm = pt.term.toLowerCase();
                                        const decodedTerm = decodeKironaan(fontTerm);
                                        return (
                                            <span key={tIdx} title={`${pt.translation} · ${decodedTerm} · Phrases`}
                                                  style={{cursor: 'help'}}>
                                                {fontTerm}{' '}
                                            </span>
                                        );
                                    }

                                    if ((tokenMeta.absorbed.has(tIdx) && !tokenMeta.phraseHead[tIdx]) ||
                                        tokenMeta.adverbOf[tIdx] !== undefined) return null;

                                    const wIdx = wordTokenIndices.indexOf(tIdx);
                                    const output = resolveTokenOutput(tIdx, wIdx);
                                    const decodedOutput = decodeKironaan(output);

                                    const {isConceptShortcut: isConcept} = parseSigils(tok);
                                    if (isConcept) {
                                        const concept = resolveConceptShortcut(parseSigils(tok).base);
                                        return (
                                            <span key={tIdx}
                                                  title={`${concept.conceptName} · ${concept.symbol} · ${displayType(concept.type)}`}
                                                  style={{cursor: 'help'}}>
                                                {output}{' '}
                                            </span>
                                        );
                                    }

                                    const res = resolveByWordIdx(wIdx);
                                    return (
                                        <span key={tIdx}
                                              title={res?.translation ? `${res.translation} · ${decodedOutput} · ${displayType(res.type)}` : ''}
                                              style={{cursor: res?.translation ? 'help' : 'default'}}>
                                            {output}{' '}
                                        </span>
                                    );
                                })}
                            </span>
                            <span style={{
                                display: 'block',
                                marginTop: 4,
                                fontSize: 14,
                                color: '#555'
                            }}>{kironaanDecoded.split('').map((char, i) => {
                                if (isConceptShortcut(char)) {
                                    const concept = resolveConceptShortcut(char);
                                    return concept?.conceptName || char;
                                }
                                return char;
                            }).join('')}</span>
                        </div>
                    </>
                )}

                <div style={{display: 'flex', gap: 10}}>
                    <button onClick={handleSave} disabled={saving || !title.trim() || !englishText.trim()}
                            style={{
                                flex: 1,
                                padding: 10,
                                background: saving ? '#aaa' : '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                cursor: saving ? 'default' : 'pointer',
                                fontSize: 15
                            }}>
                        {saving ? 'Saving…' : psalm ? 'Update' : 'Save'}
                    </button>
                    <button onClick={onClose} style={{
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

            {popover && (
                <EditorWordPopover
                    popover={popover}
                    currentTermId={wordSelections[popover.wordIdx]?.termId || null}
                    terms={terms}
                    onSelect={handleSelect}
                    onQuickAdd={openQuickAdd}
                    isAdmin={isAdmin}
                    popRef={popRef}
                />
            )}

            {modal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 4000,
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
                                            style={{fontWeight: 600}}>{w}:</span> {defs[w]}</div> : null)}
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
                                {form.detectedType && <span style={{
                                    marginLeft: 6,
                                    fontSize: 12,
                                    padding: '2px 7px',
                                    borderRadius: 10,
                                    background: '#e3f2fd',
                                    color: '#1565c0'
                                }}>NLP: {form.detectedType}</span>}
                                {form.type !== form.detectedType && (
                                    <span style={{marginLeft: 8, fontSize: 11, color: '#ff9800'}}>
                                        (overriding)
                                        <button onClick={() => setForm(p => ({...p, type: p.detectedType}))} style={{
                                            marginLeft: 5,
                                            fontSize: 11,
                                            color: '#1976d2',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                            textDecoration: 'underline'
                                        }}>reset</button>
                                    </span>
                                )}
                            </label>
                            <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '1px solid #ccc',
                                        borderRadius: 5,
                                        fontSize: 15
                                    }}>
                                {TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{display: 'flex', gap: 10}}>
                            <button onClick={handleQuickSave} style={{
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

export default BlackBookEditor;