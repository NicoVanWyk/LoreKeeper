import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/HomePage.module.css';
import { getCharacter } from '../services/charactersService';

function HomePage() {
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const characterId = '64Eh5P6qMXrCoAW1nXB9';

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const characterData = await getCharacter(characterId);
                setCharacter(characterData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, []);

    return (
        <div className={styles.homeContainer}>
            <header className={styles.homeHeader}>
                <h1>Welcome to Irea</h1>
                <p>Explore the lore of the continent of Irea, from magic to timelines</p>
            </header>

            <section className={styles.introSection}>
                <h2>Discover the World of Irea</h2>
                <p>Irea is a land of magic and mystery, where countless adventures await. Dive into the lore, explore interactive map, and meet the diverse characters that inhabit this world.</p>
            </section>

            <section className={styles.featuredContent}>
                <h2>Featured Content</h2>
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>Error: {error}</div>
                ) : character ? (
                    <div className={styles.featuredItem} onClick={() => navigate(`/characters/${characterId}`)}>
                        <img src={character.imageUrl} alt={character.fullName} className={styles.characterImage} />
                        <h3>{character.fullName}</h3>
                        <p>{character.occupation}</p>
                    </div>
                ) : (
                    <div>Character not found.</div>
                )}
            </section>

            <section className={styles.staticContent}>
                <h2>About the Author</h2>
                <p>Welcome to the world of Irea, written by me, RBVW. I have a passion for writing and storytelling, and I created this website to share that passion.</p>
            </section>

            <section className={styles.quotesSection}>
                <h2>Quotes from Irea</h2>
                <blockquote>
                    "There are things in this world which we were never meant to understand, things that you seek to find regardless." - Unknown
                </blockquote>
            </section>

            <footer className={styles.homeFooter}>
                <button className="btnPrimary" onClick={() => navigate('/timeline')}>Explore More</button>
            </footer>
        </div>
    );
}

export default HomePage;