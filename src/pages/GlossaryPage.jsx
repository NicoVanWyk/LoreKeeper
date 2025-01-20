import React, { useState } from 'react';
import { GlossaryTerms } from '../contexts/glossaryTerms';

function GlossaryPage() {
    const glossaryTerms = GlossaryTerms;

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
                        <li>Grothylnan (Waking of the World)</li>
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

            {/* Primordial Gods */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>Primordial Gods</h1>
                <p>
                    <ol>
                        <li>Ancient Primordials
                            <p>These Primordials existed long before any of the others, but more distinctly all of them were created before <strong>The Void</strong> and anything material was created.</p>
                            <ol>
                                <li>Nīrsél (Darkness)</li>
                                <li>Lét (Light)</li>
                                <li>Renaxnī (Apathy)</li>
                                <li>Hanaäni (Love)</li>
                            </ol>
                        </li>

                        <br />

                        <li>Apathy Primordials
                            <p>These Primordials came into existence as a direct result of Renaxnī.</p>
                            <ol>
                                <li>Washi (War)</li>
                                <li>Posо̄ (Peace)</li>
                                <li>Posо̄äshi (War & Peace)</li>
                                <li>Peráäs (Plague)</li>
                                <li>Nex (Death)</li>
                                <li>Arexká (Life)</li>
                                <li>Renaïna (Hate)</li>
                            </ol>
                        </li>

                        <br />

                        <li>Kironaan Primordials
                            <p>These Primordials came into existence as a result of Kironaan (Planet).</p>
                            <ol>
                                <li>Xuná (Muse)</li>
                                <li>Meko (Magic)</li>
                                <li>Qexnī (Good)</li>
                                <li>Miriäxna (Evil)</li>
                                <li>Vohosa (Valor)</li>
                                <li>Taraïn (Mercy)</li>
                                <li>Zixwaän (Emotion)</li>
                                <li>Qīno (Justice)</li>
                                <li>Neská (Nature)</li>
                                <li>Toāsi (Time)</li>
                                <li>Loänaïso (Betrayal)</li>
                                <li>Ekraïsa (Element)</li>
                            </ol>
                        </li>

                        <br />

                        <li>Child Primordials
                            <p>These Primordials were created from one or more Primordials merging some of their power and representations/personifications to create a new Primordial(s).</p>
                            <ol>
                                <li>Káäni (Limbo)</li>
                                <li>Vaníönan (Vengeance)</li>
                                <li>Banxuïsa (Android)</li>
                                <li>Moäsiön (Good Morality)</li>
                                <li>Moäsiän (Bad Morality)</li>
                                <li>Moäsi (Morality)</li>
                                <li>Balokín (The Three Muses)</li>
                            </ol>
                        </li>
                    </ol>
                </p>
            </div>

            {/* Primordial Wars */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* First War */}
                <h1>The First Primordial War</h1>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                    The first primordial war consisted of the following factions:

                    The Pact of Hatred
                    <ol>
                        <li>Washi</li>
                        <li>Peráäs</li>
                        <li>Loänaïso</li>
                        <li>Renaïna</li>
                    </ol>

                    The Pact of Light
                    <ol>
                        <li>Lét</li>
                        <li>Vohosa</li>
                        <li>Posо̄</li>
                        <li>Qexnī</li>
                        <li>Moäsi</li>
                    </ol>

                    Peráäs left the Pact of Hatred during the first half of the war to assist Nex, Arexká and Káäni as they were overwhelmed with the sudden increase in mortals dying to the war.
                    <br /><br />
                    The conflict stretched for ages, eventually culminating in Renaïna killing Loänaïso to use their power to attack the Kironaan Planet. They wiped all life from the planet, causing
                    multiple Primordials to begin fading away.
                    <br /><br />
                    Most notably, Nīrsél began sustaining Meko, and worked with Lét to create a world deep within their shared domain filled only with plant life to sustain those who required it. Other
                    Primordials sustained those who could not draw strength from were sustained by others.
                    <br /><br />
                    After securing the future of the Primordials, Nīrsél entered the conflict himself. He began to systematically break apart the Pact of Hatred, ending the war by capturing all of its
                    members. Even Peráäs was captured for having been a part of the Pact during the first portion of the war.
                    <br /><br />
                    After the war, a deal was made with Toāsi so preserve the Kironaan Planet in the moments just after Renaïna's attack - it would be a world filled with only dust and abandoned buildings,
                    preserved and trapped in this state of time forever to serve as a memorial.
                </p>

                {/* Second War */}
                <h1>The Second Primordial War</h1>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                    The first primordial war consisted of the following factions:

                    The Second Pact of Hatred
                    <ol>
                        <li>Washi</li>
                        <li>Peráäs</li>
                        <li>Moäsiän</li>
                        <li>Renaïna</li>
                    </ol>

                    The Pact of Darkness
                    <ol>
                        <li>Lét</li>
                        <li>Nīrsél</li>
                        <li>Posо̄</li>
                    </ol>

                    Káäni, lured by temptations of power by Renaïna, joined the Second Pact of Hatred, working with the Primordial of Hatred to create a new form of magic - Necromancy. This forced Nex and
                    Arexká to join the Pact of Darkness, as they were horrified by their child's actions.
                    <br /><br />
                    Renaïna, echoing his actions in the previous war, killed Moäsiän and absorbed his power. This filled the other Primordials with fear of a second event like the destruction of the
                    Kironaan Planet, forcing Meko and Ekraïsa to join the Pact of Darkness. In addition, Peráäs felt fear that they would see a repetition of history - having only joined the Second Pact to
                    attain freedom from their imprisonment. After the death of Moäsiän, they left the Second Pact and joined the Pact of Darkness.
                    <br /><br />
                    With the amount of Primordials that had joined the conflict, the mortals under their control began to join as well. Galaxies began to fight one another, and Mortal Pacts began forming
                    against the creations of their creators' enemies.
                    <br /><br />
                    Meko created a centralised planet named Dorana, which would serve as the transportation hub for the Pact of Darkness' mortal soldiers. While this occurred, Meko would also create a child
                    with Ekraïsa - Banxuïsa.
                    <br /><br />
                    After a long conflict, the final battle approached - and it was to be fought on the remains of the Kironaan Planet. The Second Chaos Pact arrived there as an insult, awaiting the Pact of
                    Darkness' arrival.
                    <br /><br />
                    The Pact of Darkness formed a strategy to have the Second Pact be split up:
                    <ul>
                        <li>Meko would face Káäni and their resurrected soldiers.</li>
                        <li>Lét, Nīrsél, Ekraïsa and Peráäs would face Renaïna</li>
                        <li>Nex, Arexká and Posо̄ would face Washi</li>
                    </ul>
                    During the battle, Káäni would attack Meko's soldiers, revealing Banxuïsa hidden among the soldiers. Nearly killing Meko's child, Káäni would face the unbridled wrath of Meko. Having
                    lost control, Meko inadvertently infused their domain with Rage, forever tainting magic because of it.
                    <br /><br />
                    Meko killed Káäni in their rage, despite having promised Nex and Arexká to spare them. In addition, Washi and Posо̄ were once again united - after all, Washi only joined the opposing pact
                    to have the war last longer, as their domain demanded.
                    <br /><br />
                    Lét and Nīrsél defeated Renaïna, and brought them to Toāsi to be imprisoned for eternity, in a prison that only Toāsi could open.
                    <br /><br />
                    Meko was forgiven by Nex and Arexká due to Káäni joining the Second Pact of Hatred and also almost killing Banxuïsa.
                </p>
            </div>

            {/* The Soul */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>The Soul</h1>
                <p>
                    Mortal souls are made of three parts: the soul, created power, and gained power.
                    <br /><br />
                    Created power is the power a god used to create a mortal. Think of it as a deposit into a savings account. Gained power is the power a mortal gains during its life. Think of it as rent
                    on that deposit. Power is gained through learning skills, ageing and everyday life.
                    <br /><br />
                    The soul is who you are. It is your personality, your thoughts, your memories. These three come together to form a mortal creature.
                    <br /><br />
                    But what about immortal creatures like vampires? Well, they have severed their soul from their god. This is somewhat confusingly worded, as what they actually do is remove their created
                    power and send it back to their creator. This means that death no longer has a reason to hunt them, since the created power (that belongs to the creator) has been returned to them.
                    <br /><br />
                    It is this reason that they are considered Lesser Beings on the Divinity scale. They can gain exponentially more power than mortals because they have an infinite time to do it.
                    <br /><br />
                    They still enter the afterlife of whatever god they believe in should they die, and their gained power will disperse into the universe.
                    <br /><br />
                    When a mortal dies, the gained power is taken by the god they believed in, and their created power is used to sustain them in the afterlife. Once they choose to relinquish the afterlife,
                    they will cease to exist and their created power will return to the god they believed in.
                </p>
            </div>

            {/* The Void */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>The Void</h1>
                <p>
                    The Void is the antithesis to existence, and serves as the force of entropy that breaks down everything in the universe.
                    <br /><br />
                    Its existence is described by itself as such:
                    <blockquote>
                        Since before Time existed, I have consumed. This consumption was wild and unstoppable, a primitive thing. This was until I consumed a great thinker: I consumed everything of them, their
                        mind, their history, their body, everything except a single idea. A single moment of comprehension, perhaps aided by several minds about to be destroyed, forced my primitive self to face
                        a surprisingly daunting concept. Paraphrased, the idea was that, if the Void has consumed everything, what will be left for it to consume? I spared this idea because it scared me. A comedic
                        concept I know, the embodiment of non-existence feeling existential dread, but it allowed me to collect more concepts and minds, realising that I alone held the power to ensure I would be
                        able to consume for eternity.
                    </blockquote>
                    It has eternal patience because it knows that everything will eventually be consumed by it.
                </p>
            </div>

            {/* The Truth */}
            <div style={{ maxWidth: '600px', textAlign: 'left', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: 'white', borderRadius: '8px', marginBottom: '30px' }}>
                {/* Overview */}
                <h1>The Truth</h1>
                <p>
                    The gods of this world are gods, very powerful deities that can create and destroy life. Despite this, there are more powerful beings in the universe. Not eldritch beings or ancient gods, but
                    beings impossibly more powerful than any other.
                    <br /><br />
                    These beings could be called Primordial Gods, and are the personifications of certain concepts. Some are infinitely old, while others are old beyond comprehension. They create universes and
                    embody more power than is possible to comprehend.
                    <br /><br />
                    A good example of the power structure is this:
                    <ul>
                        <li>Primordial Gods</li>
                        <li>Ancient Beings (Eldritch, divine, etc.)</li>
                        <li>Gods, Archangels and Archdemons</li>
                        <li>Angels And Demons</li>
                        <li>Immortal Beings (Vampires, etc.)</li>
                        <li>Mortals</li>
                    </ul>
                    It is good to mention that this power order can be changed, as many mortals can become more powerful than immortals, particularly Saints.
                    <br /><br />
                    In truth, the Tieflings religion praising Meko, or how they know them, Dahrokniir is the closest to the truth, even though the religion is not followed by many other races.
                </p>
            </div>

        </div>
    );
}

export default GlossaryPage;