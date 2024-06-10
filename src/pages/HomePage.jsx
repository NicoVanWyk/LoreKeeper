import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/HomePage.module.css';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className={styles.homeContainer}>
            <header className={styles.homeHeader}>
                <h1>Welcome to Irea</h1>
                <p>Explore the lore of the continent of Irea, from magic to timelines</p>
            </header>

            <section className={styles.featuredContent}>
                <h2>Featured Content</h2>
                {/* TODO: Example content - replace with dynamic data */}
                <div className={styles.featuredItem}>
                    <img src="path/to/image.jpg" alt="Featured Character" />
                    <h3>Name</h3>
                    <p>Description</p>
                </div>
            </section>

            <footer className={styles.homeFooter}>
                <button className="btnPrimary" onClick={() => navigate('/world')}>Explore More</button>
            </footer>
        </div>
    );
}

export default HomePage;