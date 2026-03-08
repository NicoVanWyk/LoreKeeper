import React, {useState, useEffect} from 'react';
import {getAllPsalms} from '../services/blackBookService';
import {getAllKironaanTerms} from '../services/kironaanService';
import {
    parseSigils, buildCompound, normalize, computeTokenMeta, decodeKironaan
} from '../utils/kironaanUtils';

const displayType = (t) => t === 'NaN' ? 'Other' : t;

function PsalmRenderer({psalm, terms, mode}) {
    const tokens = psalm.englishText.split(/(\s+)/);

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
    const wordTokenIndices = workingTokens.map((t, i) => (/^\s+$/.test(t) || t === '-') ? null : i).filter(i => i !== null);
    const tokenMeta = computeTokenMeta(workingTokens, terms);

    const nonPhraseTerms = terms.filter(t => t.type !== 'Phrases');
    const findMatches = (base) => {
        const n = normalize(base);
        if (!n) return [];
        return nonPhraseTerms.filter(t => t.translation.split(/[,\s]+/).some(tr => normalize(tr) === n));
    };

    const resolveByWordIdx = (wIdx) => {
        const sel = psalm.wordSelections?.[wIdx];
        const tIdx = wordTokenIndices[wIdx];
        if (tIdx === undefined) return null;
        const {base} = parseSigils(workingTokens[tIdx]);
        if (sel?.termId) {
            const found = terms.find(t => t.id === sel.termId);
            if (found) return found;
        }
        const ms = findMatches(base);
        return ms[0] || {term: base, translation: null, type: null};
    };

    const renderItems = workingTokens.map((tok, tIdx) => {
        if (/^\s+$/.test(tok)) return {tIdx, isSpace: true};
        if (tok === '-') return {tIdx, isHyphen: true};

        const wIdx = wordTokenIndices.indexOf(tIdx);

        if (tokenMeta.absorbed.has(tIdx) && !tokenMeta.phraseHead[tIdx]) return {tIdx, skip: true};
        if (tokenMeta.adverbOf[tIdx] !== undefined) return {tIdx, skip: true};

        if (tokenMeta.phraseHead[tIdx]) {
            const pt = tokenMeta.phraseHead[tIdx];
            return {tIdx, output: pt.term.toLowerCase(), resolved: pt};
        }

        const {base: baseWord, prefixes, hasPossession, leadingPunct, trailingPunct} = parseSigils(tok);
        const resolved = resolveByWordIdx(wIdx);

        const nextWI = wIdx + 1;
        const nextTI = wordTokenIndices[nextWI];
        let adverbTerm = null;
        if (nextTI !== undefined && tokenMeta.adverbOf[nextTI] === tIdx) {
            adverbTerm = resolveByWordIdx(nextWI)?.term || parseSigils(workingTokens[nextTI]).base;
        }

        const output = buildCompound(resolved?.term || baseWord, prefixes, hasPossession, adverbTerm, leadingPunct, trailingPunct).toLowerCase();
        return {tIdx, output, resolved};
    });

    const kironaan = renderItems.map(r => {
        if (r.isSpace) return ' ';
        if (r.isHyphen) return '-';
        if (r.skip) return '';
        return r.output || '';
    }).join('');
    
    const kironaaDecoded = decodeKironaan(kironaan);

    return (
        <div style={{marginBottom: 40}}>
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 8,
                borderBottom: '2px solid #e0e0e0',
                paddingBottom: 6
            }}>
                <span style={{fontSize: 16, fontWeight: 700, color: '#9c27b0', minWidth: 32}}>
                    {psalm.order}
                </span>
                <h3 style={{margin: 0, fontSize: 20}}>{psalm.title}</h3>
            </div>
            
            {mode === 'english' && (
                <p style={{fontSize: 16, lineHeight: 1.8, color: '#333'}}>
                    {psalm.readableEnglish || psalm.englishText}
                </p>
            )}
            
            {mode === 'latin' && (
                <p style={{fontSize: 16, lineHeight: 1.8, color: '#333', fontStyle: 'italic'}}>
                    {kironaaDecoded}
                </p>
            )}

            {mode === 'kironaan' && (
                <div className="KironaanFont" style={{fontSize: 20, lineHeight: 1.8}}>
                    {renderItems.map((r, i) => {
                        if (r.isSpace) return <span key={i}> </span>;
                        if (r.isHyphen) return <span key={i}>-</span>;
                        if (r.skip) return null;
                        const fontOutput = r.output || '';
                        const decodedOutput = decodeKironaan(fontOutput);
                        const tip = r.resolved?.translation
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
            )}

            {mode === 'all' && (
                <>
                    <p style={{fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 12}}>
                        {psalm.englishText}
                    </p>
                    
                    <div style={{
                        padding: '10px 14px',
                        background: '#f3f0ff',
                        borderRadius: 6,
                        border: '1px solid #d1c4e9'
                    }}>
                        <div className="KironaanFont" style={{fontSize: 18, lineHeight: 1.8, marginBottom: 4}}>
                            {renderItems.map((r, i) => {
                                if (r.isSpace) return <span key={i}> </span>;
                                if (r.isHyphen) return <span key={i}>-</span>;
                                if (r.skip) return null;
                                const fontOutput = r.output || '';
                                const decodedOutput = decodeKironaan(fontOutput);
                                const tip = r.resolved?.translation
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
                            {kironaaDecoded}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function BlackBookPage() {
    const [psalms, setPsalms] = useState([]);
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');

    useEffect(() => {
        Promise.all([getAllPsalms(), getAllKironaanTerms()])
            .then(([p, t]) => {
                setPsalms(p.sort((a, b) => a.order - b.order));
                setTerms(t);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f9f9f9'
            }}>
                <p style={{fontSize: 16, color: '#888'}}>Loading…</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f9f9f9',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: 800,
                margin: '0 auto',
                background: 'white',
                padding: 40,
                borderRadius: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{
                    marginTop: 0,
                    marginBottom: 8,
                    fontSize: 32,
                    textAlign: 'center'
                }}>The Black Book</h1>
                <p style={{
                    textAlign: 'center',
                    color: '#777',
                    marginBottom: 20,
                    fontSize: 15
                }}>
                    {psalms.length} {psalms.length === 1 ? 'entry' : 'entries'}
                </p>

                <div style={{display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: 30, justifyContent: 'center'}}>
                    {[
                        ['all', 'All'],
                        ['kironaan', 'Kironaan Font'],
                        ['latin', 'Latin Translation'],
                        ['english', 'English']
                    ].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                                style={{
                                    padding: '10px 20px',
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

                {psalms.length === 0 ? (
                    <p style={{textAlign: 'center', color: '#aaa', fontStyle: 'italic'}}>
                        No entries yet.
                    </p>
                ) : (
                    psalms.map(p => (
                        <PsalmRenderer key={p.id} psalm={p} terms={terms} mode={tab} />
                    ))
                )}
            </div>
        </div>
    );
}

export default BlackBookPage;