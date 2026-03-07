import React, {useState, useEffect} from 'react';
import nlp from 'compromise';
import {getAllKironaanTerms, updateKironaanTerm, deleteKironaanTerm} from '../services/kironaanService';
import {getAllPsalms, deletePsalm} from '../services/blackBookService';
import KironaanWorkbench from '../components/KironaanWorkbench';
import BlackBookViewer from '../components/BlackBookViewer';
import BlackBookEditor from '../components/BlackBookEditor';
import {getComposerSpellingSuggestions, decodeKironaan} from '../utils/kironaanUtils';
import {auth} from '../firebase';

const ADMIN_UID = 'baQCmZdQOna3KhFSjoTA3jt2Lw72';
const PAGE_SIZE = 10;
const TYPES = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Conjunction', 'Prepositions', 'Pronouns', 'Number', 'Math', 'Phrases', 'Articles', 'Prefix', 'Suffix', 'Determiner', 'NaN'];

const card = {
    width: '100%', maxWidth: 700, padding: 24, background: 'white',
    borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    marginBottom: 24, boxSizing: 'border-box'
};

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

// ── Edit Modal (term editing, unchanged from original) ────────
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
            <button onClick={() => onApply(suggested)}
                    style={{
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

function EditModal({target, terms, onSave, onClose}) {
    const [translations, setTranslations] = useState(
        () => target.translation.split(/\s*,\s*/).filter(Boolean)
    );
    const [term, setTerm] = useState(target.term);
    const [type, setType] = useState(target.type);
    const [defs, setDefs] = useState({});
    const [tagInput, setTagInput] = useState('');

    const detectedType = detectNlpType(translations[0] || '');
    const spelling = getComposerSpellingSuggestions(term);
    const hasCapital = /[A-Z]/.test(term);

    useEffect(() => {
        translations.forEach(w => {
            if (w && defs[w] === undefined) {
                setDefs(p => ({...p, [w]: null}));
                fetchDictDef(w).then(def => setDefs(p => ({...p, [w]: def})));
            }
        });
    }, [translations.join(',')]); // eslint-disable-line

    const addTag = () => {
        const v = tagInput.trim().toLowerCase();
        if (v && !translations.includes(v)) setTranslations(p => [...p, v]);
        setTagInput('');
    };

    const save = () => onSave(target.id, {translation: translations.join(', '), term, type});

    return (
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
                maxWidth: 440,
                width: '90%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h3 style={{marginTop: 0, marginBottom: 18}}>Edit Term</h3>

                <div style={{marginBottom: 12}}>
                    <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>
                        English Definitions
                        <span style={{marginLeft: 6, fontSize: 11, color: '#aaa'}}>Enter or comma to add</span>
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
                        {translations.map((v, i) => {
                            const dup = terms.find(t =>
                                t.id !== target.id &&
                                t.translation.split(/\s*,\s*/).some(tr => tr.toLowerCase() === v)
                            );
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
                                    {dup && (
                                        <span title={`Also mapped to "${decodeKironaan(dup.term)}"`}
                                              style={{fontSize: 10, color: '#e65100', fontStyle: 'italic'}}>
                                            ⚠ {decodeKironaan(dup.term)}
                                        </span>
                                    )}
                                    <button onClick={e => {
                                        e.stopPropagation();
                                        setTranslations(p => p.filter((_, j) => j !== i));
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
                               placeholder={translations.length ? '' : 'Type and press Enter…'}
                               style={{
                                   border: 'none',
                                   outline: 'none',
                                   fontSize: 14,
                                   minWidth: 100,
                                   flex: 1,
                                   padding: '2px 0'
                               }}/>
                    </div>
                    {translations.some(w => defs[w]) && (
                        <div style={{
                            marginTop: 5,
                            padding: '6px 10px',
                            background: '#f9f9f9',
                            borderRadius: 5,
                            border: '1px solid #e0e0e0'
                        }}>
                            {translations.map(w => defs[w] ? (
                                <div key={w} style={{fontSize: 12, color: '#555', lineHeight: 1.6}}>
                                    <span style={{fontWeight: 600, color: '#333'}}>{w}:</span> {defs[w]}
                                </div>
                            ) : null)}
                        </div>
                    )}
                </div>

                <div style={{marginBottom: 12}}>
                    <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>Kironaan
                        Term</label>
                    <input value={term} onChange={e => setTerm(e.target.value)}
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
                            <button onClick={() => setTerm(t => t.toLowerCase())}
                                    style={{
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
                    <SpellingBanner changes={spelling.changes} suggested={spelling.suggested} onApply={setTerm}/>
                </div>

                <div style={{marginBottom: 20}}>
                    <label style={{display: 'block', fontSize: 13, marginBottom: 4, color: '#555'}}>
                        Type
                        {detectedType && <span style={{
                            marginLeft: 6,
                            fontSize: 12,
                            padding: '2px 7px',
                            borderRadius: 10,
                            background: '#e3f2fd',
                            color: '#1565c0'
                        }}>NLP: {detectedType}</span>}
                        {type !== detectedType && (
                            <span style={{marginLeft: 8, fontSize: 11, color: '#ff9800'}}>
                                (overriding)
                                <button onClick={() => setType(detectedType)}
                                        style={{
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
                    <select value={type} onChange={e => setType(e.target.value)}
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
                    <button onClick={save} style={{
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
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────
function KironaanPage() {
    const [terms, setTerms] = useState([]);
    const [psalms, setPsalms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [editTarget, setEditTarget] = useState(null);   // term being edited
    const [psalmEditor, setPsalmEditor] = useState(null); // null = closed, 'new' = new, psalm obj = edit

    const userId = auth.currentUser?.uid;
    const isAdmin = userId === ADMIN_UID;

    useEffect(() => {
        Promise.all([getAllKironaanTerms(), getAllPsalms()])
            .then(([t, p]) => {
                setTerms(t);
                setPsalms(p);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, typeFilter]);

    // ── Terms table ───────────────────────────────────────────
    const allTypes = [...new Set(terms.map(t => t.type))].sort();

    const filtered = terms
        .filter(t =>
            (!typeFilter || t.type === typeFilter) &&
            (decodeKironaan(t.term).toLowerCase().includes(search.toLowerCase()) ||
                t.translation.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => a.term.localeCompare(b.term));

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleTermSave = async (id, data) => {
        await updateKironaanTerm(id, data);
        setTerms(prev => prev.map(t => t.id === id ? {...t, ...data} : t));
        setEditTarget(null);
    };

    const handleTermDelete = async (id) => {
        if (!window.confirm('Delete this term?')) return;
        await deleteKironaanTerm(id);
        setTerms(prev => prev.filter(t => t.id !== id));
    };

    // ── Psalm handlers ────────────────────────────────────────
    const refreshPsalms = async () => {
        const p = await getAllPsalms();
        setPsalms(p);
    };

    const handlePsalmDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return;
        await deletePsalm(id);
        setPsalms(prev => prev.filter(p => p.id !== id));
    };

    const handlePsalmSaved = async () => {
        setPsalmEditor(null);
        await refreshPsalms();
    };

    const nextOrder = psalms.length
        ? Math.max(...psalms.map(p => p.order)) + 1
        : 1;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f9f9f9',
            paddingTop: 20
        }}>

            {/* Workbench (merged Composer + Grammar Checker) */}
            <div style={{...card, marginTop: 30}}>
                <KironaanWorkbench userId={userId} terms={terms} onTermsChange={setTerms}/>
            </div>

            {/* The Black Book */}
            <div style={card}>
                {loading ? (
                    <p style={{textAlign: 'center', color: '#888'}}>Loading…</p>
                ) : (
                    <BlackBookViewer
                        psalms={psalms}
                        terms={terms}
                        isAdmin={isAdmin}
                        onEdit={psalm => setPsalmEditor(psalm)}
                        onDelete={handlePsalmDelete}
                        onNew={() => setPsalmEditor('new')}
                    />
                )}
            </div>

            {/* Terms table */}
            <div style={card}>
                <h1 style={{margin: '0 0 16px'}}>Terms</h1>
                <div style={{display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap'}}>
                    <input type="text" placeholder="Search term or translation…" value={search}
                           onChange={e => setSearch(e.target.value)}
                           style={{
                               flex: 1,
                               minWidth: 180,
                               padding: '8px 10px',
                               border: '1px solid #ccc',
                               borderRadius: 5,
                               fontSize: 15
                           }}/>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                            style={{
                                padding: '8px 10px',
                                border: '1px solid #ccc',
                                borderRadius: 5,
                                fontSize: 15,
                                minWidth: 140
                            }}>
                        <option value="">All types</option>
                        {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {loading ? (
                    <p style={{textAlign: 'center', color: '#888'}}>Loading…</p>
                ) : filtered.length === 0 ? (
                    <p style={{textAlign: 'center', fontStyle: 'italic', color: 'gray'}}>No terms found.</p>
                ) : (
                    <>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 15}}>
                            <thead>
                            <tr style={{background: '#f5f5f5', textAlign: 'left'}}>
                                <th style={th}>Kironaan</th>
                                <th style={th}>English</th>
                                <th style={th}>Type</th>
                                {isAdmin && <th style={{...th, width: 90}}>Actions</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {paginated.map((item, i) => (
                                <tr key={item.id} style={{
                                    background: i % 2 === 0 ? 'white' : '#fafafa',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <td style={td}>
                                        <strong className="KironaanFont" style={{fontSize: 13}}>{item.term}</strong>
                                        <span style={{
                                            display: 'block',
                                            fontSize: 12,
                                            color: '#888',
                                            marginTop: 1
                                        }}>{decodeKironaan(item.term)}</span>
                                    </td>
                                    <td style={td}>{item.translation}</td>
                                    <td style={{...td, color: '#888', fontSize: 13}}>{item.type}</td>
                                    {isAdmin && (
                                        <td style={td}>
                                            <button onClick={() => setEditTarget(item)}
                                                    style={actionBtn('#1976d2')}>Edit
                                            </button>
                                            <button onClick={() => handleTermDelete(item.id)}
                                                    style={actionBtn('#e53935')}>Del
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: 14,
                            flexWrap: 'wrap',
                            gap: 8
                        }}>
                            <span style={{
                                fontSize: 13,
                                color: '#888'
                            }}>{filtered.length} results — page {page} of {totalPages}</span>
                            <div style={{display: 'flex', gap: 6}}>
                                <button onClick={() => setPage(1)} disabled={page === 1} style={pageBtn(page === 1)}>«
                                </button>
                                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                                        style={pageBtn(page === 1)}>‹
                                </button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                                        style={pageBtn(page === totalPages)}>›
                                </button>
                                <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                                        style={pageBtn(page === totalPages)}>»
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Grammar / word-order reference */}
            <div style={card}>
                <h1>Order</h1>
                <p>Words are combined to form meaning, in the following order:</p>
                <ol style={{fontSize: 20}}>
                    {['Question', 'Plural', 'Negative', 'Degree of Comparison', 'Descriptor (Adjectives/Tenses)', 'Base (Noun/Verb)', 'Adverb', 'Possession']
                        .map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                <h1>Example:</h1>
                <p>Lors Hesamir Sók-Dis-Ki-Gré-Pó-Deraksi (You know Past Non-Alchemists? || You know people who were not
                    previously alchemists?)</p>
                <p className="KironaanFont" style={{marginTop: 0}}>Lors Hesamir Sók_Dis_Gré_Ki_Deraksi</p>
                <p>Certain letters can also be spelled in different ways:</p>
                <ol style={{fontSize: 20}}>
                    <li>í = ih</li>
                    <li>ī = ii</li>
                    <li>ï = -i (begins new syllable)</li>
                </ol>
            </div>

            {/* Term edit modal */}
            {editTarget && (
                <EditModal
                    target={editTarget}
                    terms={terms}
                    onSave={handleTermSave}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {/* Psalm editor modal */}
            {psalmEditor !== null && (
                <BlackBookEditor
                    psalm={psalmEditor === 'new' ? null : psalmEditor}
                    terms={terms}
                    onTermsChange={setTerms}
                    onSave={handlePsalmSaved}
                    onClose={() => setPsalmEditor(null)}
                    userId={userId}
                    nextOrder={nextOrder}
                />
            )}
        </div>
    );
}

const th = {padding: '8px 12px', borderBottom: '2px solid #e0e0e0', fontWeight: 600};
const td = {padding: '8px 12px'};
const actionBtn = (color) => ({
    padding: '2px 8px',
    fontSize: 12,
    border: `1px solid ${color}`,
    color,
    background: 'white',
    borderRadius: 4,
    cursor: 'pointer',
    marginRight: 4
});
const pageBtn = (dis) => ({
    padding: '4px 10px',
    border: '1px solid #ccc',
    borderRadius: 4,
    cursor: dis ? 'default' : 'pointer',
    background: dis ? '#f5f5f5' : 'white',
    color: dis ? '#bbb' : '#333',
    fontSize: 14
});

export default KironaanPage;