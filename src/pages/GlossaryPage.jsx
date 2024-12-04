import React, { useState } from 'react';

function GlossaryPage() {
    const glossaryTerms = [
        { term: "Mage-God", description: "A Mage-God is a being whose Soul has been Awakened through the use of a magical ritual, allowing them to gain the benefits of having an Awakened Soul. They also become immortal at the cost of severing their soul from their god, similar to Vena." },
        { term: "Awakened Soul", description: "A being whose Soul is Awakened can absorb the Power of the Souls of those they kill. This does not mean they are inherently immortal, but they will find it easier to reach immortality - if the gods don't kill them first." },
        { term: "Vena", description: "A Vena is a  being whose soul has been partially Awakened. They gain immortality through severing the connection their soul has with the god that made them. This means that their Power will either be claimed by the god they worshipped, the being that killed them if possible, or will disperse." },
        { term: "Soul", description: "The Soul is separated into three parts: Creation Power, Gained Power and Personality." },
        { term: "Power", description: "Power is a being's ability to affect the world around them. This can be through direct actions, Magic or even just knowledge. Beings with greater power can survive greater spells, cast more spells, cast stronger spells and survive ordinarily fatal injuries. They can also often perform seemingly impossible feats. Power increases as a being ages and learns skills." },
        { term: "Creation Power", description: "Creation Power is the Power used to create a being. Usually by a god, this Power is enough to keep the being alive and will be returned to the god that made them. Usually, a god will allow a being to keep this gained power so that they may be sustained in their afterlife." },
        { term: "Gained Power", description: "Gained Power is the Power a being gained through their life. This is from learning skills and aging, and while a being never loses their gained power they can lose the ability to utilise that power as they age. Most immortal beings do not have this drawback and can therefore utilise most or all of their Gained Power. This power is usually claimed by the god that made the being, with a portion being granted to gods of life and death as they facilitate the movement of great amounts of mortal Souls." },
        { term: "Soul Personality/Spirit", description: "A Soul Personality is a being's unique personality. It is tied directly to their Soul, and persists after the death of the body. It can also be called someone's Spirit." },
        { term: "Vampire", description: "A Vampire is a creature whose Soul is not only Awakened, but their existence is close to that of the Mage-Gods. They gain powerful abilities at the cost of becoming dependant on blood - specifically the life force (magic) that flows through it. They feed on a person's Gained Power to keep their own bodies functioning. If they do not feed, their bodies will burn out and they will slowly wither away as their new powers consume more energy than they can make on their own. Vampires of sufficient Power can also Ascend, but the gods have ensured that no Vampire has been successful thus far." },
        { term: "Afterlife", description: "A being enters the afterlife of the god they worshipped, keeping their only their Created Power to sustain their Spirit. If a being worshipped no god, their power either disperses or is claimed by a god of death or life." },
        { term: "Ascend", description: "A being of sufficient Power can shed its mortal body to gain a godly one. This would turn them into godlike beings, meaning they require less Worship to survive than conventional gods do." },
        { term: "Worship", description: "A god also gains power from Worship, which is increased by the amount of followers they have that are actively worshipping them. If a god loses all their Worshippers, they can survive through the help of other gods lending them power. They can also enter a hibernation-like state where they await Worship to resume. If a god's name fades from memory, they can still survive through written records or idols - but if all mentions, references, followers and idols of them are destroyed, they are also destroyed. A god requires a minimum amount of Worship to sustain themselves - they cannot consist solely off creating beings and 'harvesting' their Gained Power." },
    ];

    // State for search query
    const [searchQuery, setSearchQuery] = useState('');

    // Filter terms based on search query and sort alphabetically
    const filteredTerms = glossaryTerms
        .filter((item) =>
            item.term.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.term.localeCompare(b.term));

    // Group terms alphabetically
    const groupedTerms = filteredTerms.reduce((acc, item) => {
        const firstLetter = item.term[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(item);
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: '#f9f9f9', paddingTop: '20px' }}>
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px' }}>
                <h1 style={{ textAlign: 'center' }}>Glossary</h1>

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
                        borderRadius: '5px'
                    }}
                />

                {/* Glossary List */}
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {Object.keys(groupedTerms).map((letter) => (
                        <li key={letter}>
                            <h2 style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>{letter}</h2>
                            {groupedTerms[letter].map((item, index) => (
                                <div key={index} style={{ marginBottom: '15px', fontSize: '20px' }}>
                                    <strong>{item.term}:</strong> {item.description}
                                </div>
                            ))}
                        </li>
                    ))}
                    {filteredTerms.length === 0 && (
                        <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'gray' }}>No terms found.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default GlossaryPage;