import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to Irea</h1>
                <p>Explore the lore of the continent of Irea, from magic to timelines</p>
            </header>

            <section className="latest-updates">
                <h2>Latest Updates</h2>
                {/* TODO: Example content - replace with dynamic data */}
                <div className="update-item">
                    <h3>New Character: Name</h3>
                    <p>Description</p>
                </div>
                <div className="update-item">
                    <h3>Map Update: Name</h3>
                    <p>Description</p>
                </div>
            </section>

            <section className="featured-content">
                <h2>Featured Content</h2>
                {/* TODO: Example content - replace with dynamic data */}
                <div className="featured-item">
                    <img src="path/to/image.jpg" alt="Featured Character" />
                    <h3>Name</h3>
                    <p>Description</p>
                </div>
            </section>

            <section className="media-gallery">
                <h2>Media Gallery</h2>
                {/* TODO: Example content - replace with dynamic data */}
                <div className="gallery-item">
                    <img src="path/to/image1.jpg" alt="Gallery 1" />
                </div>
                <div className="gallery-item">
                    <img src="path/to/image2.jpg" alt="Gallery 2" />
                </div>
            </section>

            <footer className="home-footer">
                <button className="btnPrimary" onClick={() => navigate('/world')}>Explore More</button>
            </footer>
        </div>
    );
}

export default HomePage;