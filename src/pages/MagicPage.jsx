// src/pages/MagicPage.js
import React from 'react';
import styles from './css/MagicPage.module.css';
import { useNavigate } from 'react-router-dom';

// TODO: Write actual content for each item

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
                    Magic is the study of utilising non-physical forces to create physical phenomena. Though it can also be used to create non-physical
                    phenomena, but these spells usually require greater skill than most mages can muster.
                </p>
            </div>

            <div className={styles.section}>
                <h2>The History Of Magic</h2>
                <p>
                    Magic has a rich and complex history, dating back to ancient times. It has evolved through different cultures and civilizations, each
                    adding their unique practices and beliefs to the collective understanding of magic. As of the early 1400's of the 5th Era, the study
                    of magic has been formalized across the continent, though many universities existed before that date.
                    <br></br> <br></br>
                    The turn of the 17th Century, 5E was regarded as a revolution in the study of how magic can be used to affect everyday things,
                    particularly in the field of artifice.
                </p>
            </div>

            <div className={styles.section}>
                <h1>Schools Of Magic</h1>
                <button onClick={() => handleNavigate('/magic/schools')} className='btnPrimary'>View Schools</button>
            </div>

            <div className={styles.section}>
                <h1>Magic Users</h1>
                <button onClick={() => handleNavigate('/magic/classes')} className='btnPrimary'>View Classes</button>
            </div>

            {/* <div className={styles.section}>
                <h2>Famous Magic Users</h2> */}
            {/* TODO: Write content for famous magic users */}
            {/* </div> */}

            {/* <div className={styles.section}>
                <h2>Organizations</h2> */}
            {/* TODO: Write content for guilds, schools, societies, etc of magic users */}
            {/* </div> */}

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
                    Spells are cast through a mage altering the flow of magic around them, as magic permeates every being - living or not.
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

            {/* <div className={styles.section}>
                <h1>Artifacts and Enchantments</h1>
                <h2>Artifacts</h2>
                <p>Legendary items of great power and historical significance, artifacts are often sought after for their extraordinary capabilities.</p>

                <h2>Enchantments</h2>
                <p>Common and powerful enchantments are used to imbue objects with magical properties, enhancing their functionality and value.</p>
            </div> */}

            {/* <div className={styles.section}>
                <h1>Magic and Technology</h1>
                <h2>Magitech</h2>
                <p>Magitech represents the integration of magic with technology, leading to advanced innovations that blend the best of both worlds.</p>

                <h2>Innovations</h2>
                <p>Magical advancements have far-reaching impacts on society, from everyday conveniences to groundbreaking discoveries.</p>
            </div> */}

            {/* <div className={styles.section}>
                <h1>Mysteries and Unexplained Phenomena</h1>
                <h2>Ancient Ruins</h2>
                <p>Ancient ruins are places of forgotten magic and lost civilizations, holding secrets waiting to be uncovered.</p>

                <h2>Unsolved Mysteries</h2>
                <p>Events or phenomena that defy magical understanding continue to intrigue and challenge scholars and adventurers alike.</p>
            </div> */}

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