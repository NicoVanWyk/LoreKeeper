// src/pages/MagicPage.js
import React from 'react';
import styles from './css/MagicPage.module.css';
import { useNavigate } from 'react-router-dom';

function MagicPage() {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h1>What Is Magic?</h1>
                <p>
                    Magic is the practice of altering the world around you using ambient magical energy. The Power of a mage's Soul dictates the power and
                    scale of the magic they can use. While magical energy is present in all things, it is much more concentrated in living things. The very
                    life of a mortal is sustained through the magic infused in their blood and body - the magic granted by their Soul's Power.
                </p>
            </div>

            <div className={styles.section}>
                <h2>The History Of Magic</h2>
                <p>
                    Magic has always been a part of society, sometimes shunned and sometimes embraced. It was often only studied by a small group of mages
                    commonly referred to as Mage Councils or Circles. This led to a vast number of practices and fragmented schools. Two mages could speak
                    to one another about the same school, but not realise because their techniques were so different.
                    <br></br> <br></br>
                    During the 4th Era, the Fen'Hisan Empire established a standardised form of magic, ensuring all mages were taught the same theory and
                    practices. They also established Universities across Irea dedicated to teaching and studying magic, ushering in a golden age for mages.
                    This revolution in magic led to the expansion of several schools, and the standardisation of magic led to unprecedented cooperation between
                    mages.
                    <br></br> <br></br>
                    The 5th Era was also regarded as a revolution in the study of how magic, particularly how it can be used to affect everyday things,
                    establishing the School of Artifice as an official school instead of a module in different schools.
                </p>
            </div>

            <div className={styles.section}>
                <h1>Schools Of Magic</h1>
                <button onClick={() => handleNavigate('/magic/schools')} className='btnPrimary'>View Schools</button>
            </div>

            <div className={styles.section}>
                <h1>Magic Classes</h1>
                <button onClick={() => handleNavigate('/magic/classes')} className='btnPrimary'>View Classes</button>
            </div>

            <div className={styles.section}>
                <h1>Organisations</h1>
                <h2>Universities</h2>
                <p>
                    Universities are the most common places where mages are made. They are also where the most research into magic is done. They
                    can be found across Irea, with some countries funding them more than others.
                </p>

                <h2>Guilds</h2>
                <p>
                    Mage Guilds can be independent or associated with a University. Their structure varies greatly, however all of them have a specific
                    goal they wish to achieve - their reason for forming. Some could be to find illegal mages, others could be to research potentially
                    illegal magic. Mages can also choose wether or not to join guilds, however joining a guild often comes with many benefits.
                </p>

                <h2>Councils/Circles</h2>
                <p>
                    Mage Councils are commonly formed in countries where Universities are scarce. Before Universities, they were the most common form of
                    organisation a mage could be a part of. It typically consists of a handful of Archmages and their apprentices, and most commonly serve
                    a specific country's leader.
                </p>
            </div>

            <div className={styles.section}>
                <h1>Learning Or Casting Magic</h1>
                <h2>Training</h2>
                <p>
                    People learn magic through formal education, as mages who are not taught proper techniques for mitigating side effects can
                    quickly become dangerous to themselves and others. This is because, due to reasons not yet understood, magic is inexplicably linked
                    to emotions surrounding rage and anger.
                    <br></br> <br></br>
                    Mages who overuse magic without proper rest first begin to experience dreams of an army marching towards an unknown goal. If
                    overuse continues, they will begin to see dreams of combat, violence and death. These dreams are remarkably consistent, featuring
                    similar descriptions of events across all mages who experience them.
                    <br></br> <br></br>
                    If a mage does not take heed and rest, they will be overcome by madness, rage tinting all they experience. There is no cure for this
                    madness other than rest, although early symptoms can be mitigated through training.
                    <br></br> <br></br>
                    Anyone is capable of using magic, however without proper training it is often more dangerous than expected.
                </p>

                <h2>Casting</h2>
                <p>
                    Spells are cast through a mage using Glyphcasting or Forcecasting to influence the world around them. Glyphcasting is the practice of
                    building a glyph to mitigate the impact of casting magic on a mage's body. It also eases the casting process, making mages able to cast
                    more spells with less effort. Many mages use enchantments to imprint a dangerous glyph into their memory so they can call the exact same
                    spell on command. Inscribing a glyph is not needed for most spells as minor mistakes do not impact the spell too much. For schools such as
                    Void Magic, this technique is enforced as even minor mistakes could lead to catastrophic results.
                    <br></br> <br></br>
                    Forcecasting is when a being casts a spell not from a glyph but through the sheer Power of their Soul and their Willpower. This is commonly
                    used by Gods and only the most powerful - or stubborn - of mages.
                </p>

                <h2>Spellcasting Aids</h2>
                <p>
                    Many objects can be used to aid in spellcasting. Grimoires can be used to store spells for later use, staves and wands can absorb
                    magical exhaustion, allowing the mage to cast more spells, as well as complex spells usually too taxing for mortal bodies to handle.
                    Even holy symbols can function in a similar way, of the mage draws strength from the god directly.
                    <br></br> <br></br>
                    Many spellcasters prefer to not use spellcasting aids. Some say it is so that they are not reliant on other things to be effective, and
                    others cite that the time it takes to bond to these items, so they can effectively be used, takes too long for too little gain. In
                    addition, many mages simply cannot afford to use more than a simple spellbook, often not even enchanted. Grimoires, which are bonded
                    to a mage to allow them to more easily find and cast spells, are usually only seen in the hands of archmages, as they learn many more
                    spells than the average mage, therefore requiring a more complicated repository of information.
                </p>
            </div>

            <div className={styles.section}>
                <h1>Magic and Society</h1>
                <h2>Social Stigmas and Regulations</h2>
                <p>
                    Magic is seen as a skill that can be taught, but must not be used by the uneducated. There have been many incidents of self-taught
                    mages not using the proper techniques to counter Magical Exhaustion, causing untold destruction as a result of their mad rages.
                    <br></br> <br></br>
                    While many countries have regulations against mages who did not study and receive a certificate of training, many others rely on the
                    social stigma that sways heavily against mages who practice without training.
                    <br></br> <br></br>
                    Because magic is innate to all beings, some having an easier time utilising this than others, it cannot be completely controlled.
                    Those who are sensitive to magic often receive free scholarships to universities, mostly because they will excel, but partly because
                    they are more dangerous to leave without proper training.
                </p>

                <h2>Laws and Regulations</h2>
                <p>
                    While there are no laws regulating magic as a whole, several schools are illegal to practice. These include Second Discipline Necromancy,
                    Krosis Magic and Charm Magic.
                </p>

                <h2>Economic Impact</h2>
                <p>
                    The greatest impact magic has on the economy is through artifice. Artificers create new technologies, utillising engineering and
                    enchantment to create objects ranging from backpacks with more space inside than they seem, or even machines that can keep food
                    cold or frozen.
                </p>
            </div>

            <div className={styles.section}>
                <h1>Magical Creatures and Entities</h1>
                <h2>Mythical Beasts</h2>
                <p>
                    Dragons, phoenixes, unicorns, and other mythical creatures are integral to the magical ecosystem, each possessing unique abilities and significance.
                </p>

                <h2>Spirits and Elementals</h2>
                <p>
                    Nature spirits and elemental beings embody the primal forces of the world, often acting as guardians or guides. Many even act as
                    minor gods, protecting those who leave them offerings in the regions they inhabit.
                </p>

                <h2>Demons and Angels</h2>
                <p>
                    Demons, devils and angels, both mortal and immortal, are imbued with magic more so than the creatures on Irea. They each serve to
                    maintain balance in the balance of Hell (The Teach, The Infernal and The Abyss).
                </p>
            </div>

            <div className={styles.section}>
                <h1>Dangers and Risks of Magic</h1>
                <h2>Overuse and Addiction</h2>
                <p>
                    As described earlier, Magical Exhaustion can cause psychological and physical symptoms, and is caused by the overuse of magic.
                </p>

                <h2>Corruption and Backlash</h2>
                <p>
                    Krosis magic is most famous for corrupting its users, as well as the targets of its spells. It drives victims and users to madness,
                    often causing physical mutations as the magic changes the structure of the body with its chaotic influence.
                </p>

                {/* <h2>Magical Diseases and Curses</h2>
                <p>
                    Illnesses and afflictions caused by magic can be devastating, often requiring powerful remedies or cures.
                </p> */}
            </div>
        </div>
    );
}

export default MagicPage;