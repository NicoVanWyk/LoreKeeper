import React from 'react';
import {decodeKironaan} from '../utils/kironaanUtils';

function KironaanExport({terms}) {
    const exportCSV = () => {
        const headers = ['Kironaan (Font)', 'Kironaan (Latin)', 'English', 'Type'];
        const rows = terms
            .sort((a, b) => a.term.localeCompare(b.term))
            .map(t => [
                t.term,
                decodeKironaan(t.term),
                t.translation,
                t.type
            ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `kironaan-dictionary-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportJSON = () => {
        const data = terms
            .sort((a, b) => a.term.localeCompare(b.term))
            .map(t => ({
                kironaan: t.term,
                kironaanLatin: decodeKironaan(t.term),
                english: t.translation,
                type: t.type
            }));

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {type: 'application/json'});
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `kironaan-dictionary-${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{display: 'flex', gap: 8}}>
            <button onClick={exportCSV} style={{
                padding: '6px 14px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
            }}>
                Export CSV
            </button>
            <button onClick={exportJSON} style={{
                padding: '6px 14px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
            }}>
                Export JSON
            </button>
        </div>
    );
}

export default KironaanExport;