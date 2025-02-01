import React, { useState } from 'react';
import styles from './css/GlyphDrawer.module.css';

const pointOrder = [4, 5, 9, 8, 1, 7, 6, 13, 3, 10, 2, 12, 11]; // Corrected numbering
const radius = 120;
const center = { x: 150, y: 150 };

// Generate positions for 12 outer points, with correct alignment
const points = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i) * 30 - 90) * (Math.PI / 180);  // Adjusted to correctly align '4' at the top
    return {
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
    };
});

// Add the center point (11)
points.push(center);

const GlyphDrawer = () => {
    const [sequence, setSequence] = useState([]);
    const [lines, setLines] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    const drawGlyph = () => {
        const newSequence = inputValue
            .split(',')
            .map(num => parseInt(num.trim(), 10))
            .filter(num => pointOrder.includes(num))
            .map(num => pointOrder.indexOf(num));

        if (newSequence.length < 1) return;

        const newLines = [];
        for (let i = 1; i < newSequence.length; i++) {
            if (newSequence[i] === newSequence[i - 1]) {
                newLines.push({ type: "loop", at: newSequence[i], count: (newLines.at(-1)?.at === newSequence[i] ? newLines.at(-1).count + 1 : 1) });
            } else {
                newLines.push({ type: "line", from: newSequence[i - 1], to: newSequence[i] });
            }
        }

        setSequence(newSequence);
        setLines(newLines);
    };

    // Function to get control points for the curve
    const getCurveControlPoint = (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const midpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

        const offset = 20;
        return {
            x: midpoint.x - dy * 0.2,
            y: midpoint.y + dx * 0.2
        };
    };

    // Function to generate loop path
    const generateLoopPath = (p, count) => {
        const loopRadius = 8; // Adjust for loop size
        let path = "";
        for (let i = 0; i < count; i++) {
            const offsetX = loopRadius * 2 * i - ((count - 1) * loopRadius);
            path += `M ${p.x + offsetX},${p.y} a ${loopRadius},${loopRadius} 0 1,1 ${loopRadius * 2},0 a ${loopRadius},${loopRadius} 0 1,1 ${-loopRadius * 2},0 `;
        }
        return path;
    };

    return (
        <div className={styles.connectDotsContainer}>
            <h3>Draw a Glyph</h3>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter numbers (e.g., 4,5,9,8,1)"
                className={styles.inputBox}
            />
            <button onClick={drawGlyph} className={styles.drawButton}>Draw</button>

            <svg width="300" height="300" viewBox="0 0 300 300" className={styles.glyphCanvas}>
                {/* Draw curved paths and loops */}
                {lines.map((line, idx) => {
                    if (line.type === "line") {
                        const p1 = points[line.from];
                        const p2 = points[line.to];
                        const cp = getCurveControlPoint(p1, p2);

                        return (
                            <path
                                key={idx}
                                d={`M ${p1.x},${p1.y} Q ${cp.x},${cp.y} ${p2.x},${p2.y}`}
                                stroke="black"
                                strokeWidth="2"
                                fill="transparent"
                            />
                        );
                    } else if (line.type === "loop") {
                        const p = points[line.at];
                        return (
                            <path
                                key={idx}
                                d={generateLoopPath(p, line.count)}
                                stroke="black"
                                strokeWidth="2"
                                fill="transparent"
                            />
                        );
                    }
                    return null;
                })}

                {/* Draw points & labels */}
                {points.map((p, index) => (
                    <g key={index} className={styles.glyphPoint}>
                        <circle cx={p.x} cy={p.y} r="10" fill="white" stroke="black" opacity="0.6" />
                        <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14px" fill="black">
                            {pointOrder[index]}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default GlyphDrawer;