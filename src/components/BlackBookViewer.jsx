import React, {useState} from 'react';
import KironaanRenderer from './KironaanRenderer';

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
                    <span style={{fontSize: 13, fontWeight: 700, color: '#9c27b0', minWidth: 28}}>{psalm.order}</span>
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

            {open && (
                <div style={{padding: '0 16px 16px', borderTop: '1px solid #f0e8ff'}}>
                    <p style={{margin: '12px 0 4px', fontSize: 15, color: '#333', lineHeight: 1.7}}>
                        {psalm.readableEnglish || psalm.englishText}
                    </p>
                    <KironaanRenderer
                        englishText={psalm.englishText}
                        wordSelections={psalm.wordSelections}
                        terms={terms}
                        mode="both"
                    />
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
                    <PsalmCard key={p.id} psalm={p} terms={terms} isAdmin={isAdmin} onEdit={onEdit}
                               onDelete={onDelete}/>
                ))
            )}
        </div>
    );
}

export default BlackBookViewer;