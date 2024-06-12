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
                <p>Magic is a force that encompasses various supernatural and mystical energies that can be harnessed and manipulated by those who possess the knowledge and skill. It defies the conventional laws of nature and allows for extraordinary phenomena.</p>
            </div>

            <div className={styles.section}>
                <h2>The History Of Magic</h2>
                <p>Magic has a rich and complex history, dating back to ancient times. It has evolved through different cultures and civilizations, each adding their unique practices and beliefs to the collective understanding of magic.</p>
            </div>

            <div className={styles.section}>
                <h1>Schools Of Magic</h1>
                <button onClick={() => handleNavigate('/magic/schools')} className='btnPrimary'>View Schools</button>
            </div>

            <div className={styles.section}>
                <h1>Magic Users</h1>
                <button onClick={() => handleNavigate('/magic/classes')} className='btnPrimary'>View Classes</button>
            </div>

            <div className={styles.section}>
                <h2>Famous Magic Users</h2>
                {/* TODO: Write content for famous magic users */}
            </div>

            <div className={styles.section}>
                <h2>Organizations</h2>
                {/* TODO: Write content for guilds, schools, societies, etc of magic users */}
            </div>

            <div className={styles.section}>
                <h1>Learning Or Casting Magic</h1>
                <h2>Training</h2>
                <p>How do people learn magic? What are the consequences of self study?</p>

                <h2>Casting</h2>
                <p>How are spells cast?</p>

                <h2>Spellcasting Aids</h2>
                <p>Grimoires, staves, wands, etc.</p>
            </div>

            <div className={styles.section}>
                <h1>Magic and Society</h1>
                <h2>How is it perceived? Regulated?</h2>
                <p>Magic is perceived with a mixture of awe and caution. Its regulation varies across different regions, with some areas embracing it fully and others imposing strict controls.</p>

                <h2>Laws and Regulations</h2>
                <p>Legal aspects of magic include forbidden practices and magical laws that ensure the responsible use of magical abilities.</p>

                <h2>Economic Impact</h2>
                <p>Magic plays a significant role in trade, commerce, and industry, providing unique solutions and innovations that drive economic growth.</p>
            </div>

            <div className={styles.section}>
                <h1>Magical Creatures and Entities</h1>
                <h2>Mythical Beasts</h2>
                <p>Dragons, phoenixes, unicorns, and other mythical creatures are integral to the magical ecosystem, each possessing unique abilities and significance.</p>

                <h2>Spirits and Elementals</h2>
                <p>Nature spirits and elemental beings embody the primal forces of the world, often acting as guardians or guides.</p>

                <h2>Demons and Angels</h2>
                <p>Supernatural beings with magical powers, demons and angels play critical roles in the cosmic balance of good and evil.</p>
            </div>

            <div className={styles.section}>
                <h1>Artifacts and Enchantments</h1>
                <h2>Artifacts</h2>
                <p>Legendary items of great power and historical significance, artifacts are often sought after for their extraordinary capabilities.</p>

                <h2>Enchantments</h2>
                <p>Common and powerful enchantments are used to imbue objects with magical properties, enhancing their functionality and value.</p>
            </div>

            <div className={styles.section}>
                <h1>Magic and Technology</h1>
                <h2>Magitech</h2>
                <p>Magitech represents the integration of magic with technology, leading to advanced innovations that blend the best of both worlds.</p>

                <h2>Innovations</h2>
                <p>Magical advancements have far-reaching impacts on society, from everyday conveniences to groundbreaking discoveries.</p>
            </div>

            <div className={styles.section}>
                <h1>Mysteries and Unexplained Phenomena</h1>
                <h2>Ancient Ruins</h2>
                <p>Ancient ruins are places of forgotten magic and lost civilizations, holding secrets waiting to be uncovered.</p>

                <h2>Unsolved Mysteries</h2>
                <p>Events or phenomena that defy magical understanding continue to intrigue and challenge scholars and adventurers alike.</p>
            </div>

            <div className={styles.section}>
                <h1>Dangers and Risks of Magic</h1>
                <h2>Overuse and Addiction</h2>
                <p>The potential dangers of excessive magic use include physical and mental strain, leading to addiction and dependency.</p>

                <h2>Corruption and Backlash</h2>
                <p>Dark magic and irresponsible use can lead to corruption and dangerous backlashes, affecting both the caster and their surroundings.</p>

                <h2>Magical Diseases and Curses</h2>
                <p>Illnesses and afflictions caused by magic can be devastating, often requiring powerful remedies or cures.</p>
            </div>
        </div>
    );
}

export default MagicPage;