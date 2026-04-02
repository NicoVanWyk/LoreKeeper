import React, {useState, useEffect} from 'react';
import {getAllPsalms} from '../services/blackBookService';
import {getAllKironaanTerms} from '../services/kironaanService';
import KironaanRenderer from '../components/KironaanRenderer';

function PsalmRenderer({psalm, terms, mode}) {
    if (mode === 'english') {
        return (
            <p style={{fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 12}}>
                {psalm.readableEnglish || psalm.englishText}
            </p>
        );
    }

    return (
        <KironaanRenderer
            englishText={psalm.englishText}
            wordSelections={psalm.wordSelections}
            terms={terms}
            mode={mode === 'kironaan' ? 'font' : mode === 'latin' ? 'latin' : 'both'}
        />
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
        <div style={{minHeight: '100vh', background: '#f9f9f9', padding: '40px 20px'}}>
            <div style={{
                maxWidth: 800,
                margin: '0 auto',
                background: 'white',
                padding: 40,
                borderRadius: 10,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{marginTop: 0, marginBottom: 8, fontSize: 32, textAlign: 'center'}}>The Black Book</h1>
                <p style={{textAlign: 'center', color: '#777', marginBottom: 20, fontSize: 15}}>
                    {psalms.length} {psalms.length === 1 ? 'entry' : 'entries'}
                </p>

                <div style={{
                    display: 'flex',
                    borderBottom: '2px solid #e0e0e0',
                    marginBottom: 30,
                    justifyContent: 'center'
                }}>
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
                    <p style={{textAlign: 'center', color: '#aaa', fontStyle: 'italic'}}>No entries yet.</p>
                ) : (
                    psalms.map(p => (
                        <div key={p.id} style={{marginBottom: 40}}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 12,
                                marginBottom: 8,
                                borderBottom: '2px solid #e0e0e0',
                                paddingBottom: 6
                            }}>
                                <span style={{
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: '#9c27b0',
                                    minWidth: 32
                                }}>{p.order}</span>
                                <h3 style={{margin: 0, fontSize: 20}}>{p.title}</h3>
                            </div>
                            {tab === 'all' && (
                                <>
                                    <p style={{fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 12}}>
                                        {p.readableEnglish || p.englishText}
                                    </p>
                                    <KironaanRenderer englishText={p.englishText} wordSelections={p.wordSelections}
                                                      terms={terms} mode="both"/>
                                </>
                            )}
                            {tab !== 'all' && <PsalmRenderer psalm={p} terms={terms} mode={tab}/>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default BlackBookPage;