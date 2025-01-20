import React, { useState } from 'react';
import { KironaanTerms } from '../contexts/kironaanTerms';

function KironaanPage() {
    const kironaanTerms = KironaanTerms;

    // State for search query
    const [searchQuery, setSearchQuery] = useState('');

    // Combine terms with the same Kironaan term into a single entry
    const combinedTerms = Object.values(
        kironaanTerms.reduce((acc, item) => {
            if (!acc[item.term]) {
                acc[item.term] = { ...item, translation: [item.translation] };
            } else {
                acc[item.term].translation.push(item.translation);
            }
            return acc;
        }, {})
    ).map((item) => ({
        ...item,
        translation: item.translation.join(', '), // Join translations with a comma
    }));

    // Filter terms based on search query
    const filteredTerms = combinedTerms
        .filter((item) =>
            item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.translation.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Group by type, then sort alphabetically by term within each type
    const groupedByType = filteredTerms.reduce((acc, item) => {
        const type = item.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
    }, {});

    // Sort each type group alphabetically by term
    Object.keys(groupedByType).forEach((type) => {
        groupedByType[type].sort((a, b) => a.term.localeCompare(b.term));
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9f9f9', paddingTop: '20px' }}>
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px', marginTop: '30px' }}>
                <h1 style={{ textAlign: 'center' }}>Terms</h1>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search for a term..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '20px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                    }}
                />

                {/* Glossary List */}
                {Object.keys(groupedByType).length > 0 ? (
                    Object.keys(groupedByType).map((type) => (
                        <div key={type} style={{ marginBottom: '20px' }}>
                            <h2 style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                                {type.charAt(0).toUpperCase() + type.slice(1)} {/* Capitalize type */}
                            </h2>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                {groupedByType[type].map((item, index) => (
                                    <li key={index} style={{ marginBottom: '15px', fontSize: '20px', textTransform: 'capitalize' }}>
                                        <strong>{item.term}:</strong> {item.translation}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'gray' }}>No terms found.</p>
                )}
            </div>

            {/* Order */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>Order</h1>
                <p>Words are combined to form meaning, in the following order: </p>
                <ol style={{ fontSize: '22px' }}>
                    <li>Question</li>
                    <li>Plural</li>
                    <li>Negative</li>
                    <li>Degree of Comparison</li>
                    <li>Descriptor (Adjectives/Tenses)</li>
                    <li>Base (Noun/Verb)</li>
                    <li>Adverb</li>
                    <li>Possession</li>
                </ol>

                <h1>Example: </h1>
                <p> Lors Hesamir Sók-Dis-Ki-Gré-Pó-Deraksi (You know Past Non-Alchemists? || You know people who were not previously alchemists?)</p>
                <p style={{marginTop: '0px'}} className='KironaanFont'>Lors Hesamir Sók_Dis_Gré_Ki_Deraksi</p>

                <p>Certain letters can also be spelled in different ways, while keeping the same pronunciations:</p>
                <ol style={{ fontSize: '22px' }}>
                    <li>í = ih</li>
                    <li>ī = ii</li>
                    <li>ï = -i (begins new syllable)</li>
                </ol>
            </div>
        </div>
    );
}

export default KironaanPage;