import React from 'react';
import styles from './css/AboutPage.module.css';

function AboutPage() {
    return (
        <div className={styles.aboutContainer}>
            <h1>About LoreKeeper</h1>

            <section>
                <h2>Introduction</h2>
                <p>
                    Welcome to LoreKeeper, your comprehensive guide to my fantasy world. My project is designed to help my players and readers
                    explore and keep track of the lore, characters, timeline and more.
                </p>
            </section>

            <section>
                <h2>Project Origin</h2>
                <p>
                    LoreKeeper was inspired by my love for storytelling and complex worlds. I drew inspiration from fantasy titles such as
                    Dungeons & Dragons, Pathfinder and Lord of the Rings. In addition, I wanted a place where the lore could be accessed from any place,
                    not just my computer.
                </p>
            </section>

            <section>
                <h2>Features</h2>
                <ul>
                    <li><strong>Home</strong>: Stay updated with the latest and featured content.</li>
                    <li><strong>Characters</strong>: Detailed profiles of important characters.</li>
                    <li><strong>World</strong>: Explore the diverse regions, cultures, and histories of the world.</li>
                    <li><strong>Important Events</strong>: Learn about significant events that shaped the world.</li>
                    <li><strong>Timeline</strong>: Follow the chronological order of key events.</li>
                    <li><strong>Maps</strong>: Visualize the world with detailed maps.</li>
                    <li><strong>Magic</strong>: Understand the magic systems and abilities.</li>
                    <li><strong>Bestiary</strong>: Meet the creatures that inhabit the world.</li>
                    <li><strong>Profile</strong>: Manage your account and personalize your experience.</li>
                </ul>
            </section>

            <section>
                <h2>Target Audience</h2>
                <p>
                    LoreKeeper is for my players, as well as DMs who wish to host campaigns set in my world. It is also for my writing, where both I
                    and readers can find information.
                </p>
            </section>

            <section>
                <h2>Technology Stack</h2>
                <p>
                    The website is built using modern technologies:
                </p>
                <ul>
                    <li><strong>React</strong>: For a dynamic and responsive user interface.</li>
                    <li><strong>Firebase</strong>: To handle backend services including authentication and database management.</li>
                    <li><strong>GitHub Pages</strong>: For hosting the site.</li>
                </ul>
            </section>

            <section>
                <h2>Team</h2>
                <p>Meet the creator(s) behind LoreKeeper:</p>
                <ul>
                    <li><strong>Nico Van Wyk (Robyn)</strong>: Project Lead, Writer and Developer.</li>
                </ul>
            </section>

            <section>
                <h2>Future Plans</h2>
                <p>
                    We're excited about the future of LoreKeeper! Look forward to:
                </p>
                <ul>
                    <li>Expanded content and new regions to explore.</li>
                    <li>Enhanced features for better user interaction.</li>
                    <li>Regular updates to keep the world fresh and exciting.</li>
                </ul>
                <p>
                    Stay tuned by following us on social media and subscribing to our newsletter.
                </p>
            </section>

            <section>
                <h2>Contact Information</h2>
                <p>
                    For contact information, please visit the following portfolio website: <a href='https://nicovanwyk.github.io'>Portfolio</a>
                </p>
                <p>Thank you for visiting LoreKeeper!</p>
            </section>
        </div>
    );
}

export default AboutPage;