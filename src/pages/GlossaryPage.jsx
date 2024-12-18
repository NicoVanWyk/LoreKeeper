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

            {/* Keeping Time */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>Keeping Time</h1>
                <p>There are 4 Seasons of 100 Days each. Each Season has 4 Months of 25 Days each, with 25 Hours in a day. There are 5 Weeks in a Month, each Week consisting of 5 Days.</p>
                <p>1 year → 4 seasons → 4 months per season → 25 days per month → 25 hours per day</p>
                <p>Month names are shortened by syllables, using the first letter in each syllable. For example: <br /><br /> Bandari - Ban/Da/Ri - BDR</p>

                {/* --Seasons */}
                <h2>Seasons</h2>

                <ol className='font_24' type="1">
                    {/* Winter */}
                    <li>Winter</li>
                    <ol className='font_22' type="1">
                        <li>Winter's Start</li>
                        <li>Celynrag (Slumber of the World)</li>
                        <li>Talan (Time of Deep Frost)</li>
                        <li>Winter's End</li>
                    </ol>

                    {/* Spring */}
                    <li>Spring</li>
                    <ol className='font_22' type="1">
                        <li>Spring's Start</li>
                        <li>Ynsovan (Nature's March)</li>
                        <li>Grothlynan (Waking of the World)</li>
                        <li>Spring's End</li>
                    </ol>

                    {/* Summer */}
                    <li>Summer</li>
                    <ol className='font_22' type="1">
                        <li>Summer's Start</li>
                        <li>Jalynsong (Rising of the World)</li>
                        <li>Bandari (Time of Great Burns)</li>
                        <li>Summer's End</li>
                    </ol>

                    {/* Autumn */}
                    <li>Autumn</li>
                    <ol className='font_22' type="1">
                        <li>Autumn's Start</li>
                        <li>Celindro (Falling of the Leaves)</li>
                        <li>Alynon (Slowing of the World)</li>
                        <li>Autumn's End</li>
                    </ol>
                </ol>

                {/* --Oddities */}
                <h2>Oddities</h2>
                <p>
                    Chronomancers, and others who study time, have shown that time passes in equal portions of 4 seasons, each lasting 100 days. Each season has four months of 25 days each,
                    and those days consist of 25 hours each. By divine creation, there are exactly 10,000 hours in a year. For this reason, it has angered many scholars that there are not 100
                    minutes in an hour, but 60. In the same way, there are not 100 seconds in a minute, but also 60. The god of time, whichever one created it, must have had a sense of humour.
                    <br /><br />
                    Following from that thought, it was also a debate among the studies of time about who <i>created</i> time. The gods of time preside over it, ensuring its flow remains constant,
                    but none have so far proven to be the creator of time. Many questions arise from this thought, and none have clear answers.
                    <br /><br />
                    Where is the first god of time?
                    <br /><br />
                    Did someone kill them?
                    <br /><br />
                    Are they lost or hidden?
                </p>
            </div>

            {/* Prosthetics */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>Prosthetics</h1>
                <p>
                    Prosthetics come in two forms:
                    <ol className='font_22'>
                        <li>A strong metal one that struggles to cast magic</li>
                        <li>A weaker wooden one that can easily cast magic</li>
                    </ol>

                    Prosthetics are created by Runecrafters that create their own unique Runes, each one specialized to bond with whomever will receive the prosthetic. The Runes are carved or
                    burned onto a place on the prosthetic that will be covered by another layer of whatever material it is made of (to prevent it from being damaged). Should the runes underneath
                    be damaged, the wearer’s connection will be damaged as well, leading to weaker strength or random unintended movements.
                    <br /><br />
                    If a prosthetic’s runes become damaged, the wearer must return to the original Runecrafter for repairs (since only they know the runes they created) or they must buy a new
                    prosthetic. There are standard prosthetics, but they do not act as efficiently as personalized ones - the bond they form is superficial because their runes are generic. In contrast,
                    they can easily be repaired at any artificer if they are damaged.
                    <br /><br />
                    Magic can flow more easily through organic things, such as wood, meaning a higher level of skill is needed to enchant objects made of things like metal. For prosthetics, it is incredibly 
                    difficult to create one made of metal that has the capacity to link to the user's soul completely instead of superficially (which would allow them to cast magic through it).
                    <br /><br />
                    So far, only arms, hands, legs and feet can be replaced by prosthetics, but many an Artificer wishes to research synthetic organs.
                </p>
            </div>

        </div>
    );
}

export default GlossaryPage;