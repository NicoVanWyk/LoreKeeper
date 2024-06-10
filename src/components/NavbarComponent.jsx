import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/NavbarComponent.css';
import logo from '../assets/Logo.jpg';

function NavbarComponent() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <img src={logo} alt="Logo" className="navbar-logo-mobile" />
                <button className="navbar-toggle" onClick={toggleMenu}>
                    ☰
                </button>
                <ul className="navbar-menu desktop-menu">
                    <li className="navbar-item dropdown">
                        <Link to="/" className="dropbtn">Home</Link>
                        <div className="dropdown-content">
                            <Link to="/about">About</Link>
                        </div>
                    </li>
                    <li className="navbar-item"><Link to="/characters">Characters</Link></li>
                    <li className="navbar-item dropdown">
                        <Link to="/world" className="dropbtn">World</Link>
                        <div className="dropdown-content">
                            <Link to="/important-events">Important Events</Link>
                            <Link to="/timeline">Timeline</Link>
                            <Link to="/maps">Maps</Link>
                            <Link to="/magic">Magic</Link>
                        </div>
                    </li>

                    <img src={logo} alt="Logo" className="navbar-logo" />

                    <li className="navbar-item"><Link to="/bestiary">Bestiary</Link></li>
                    <li className="navbar-item"><Link to="/stories">Stories</Link></li>
                    <li className="navbar-item"><Link to="/profile">Profile</Link></li>
                </ul>

                {/* Mobile Navbar: */}
                <ul className={`navbar-menu mobile-menu ${menuOpen ? 'open' : ''}`}>
                    <li className="navbar-item"><Link to="/">Home</Link></li>
                    <li className="navbar-item"><Link to="/about">About</Link></li>
                    <li className="navbar-item"><Link to="/characters">Characters</Link></li>
                    <li className="navbar-item"><Link to="/world">World</Link></li>
                    <li className="navbar-item"><Link to="/important-events">Important Events</Link></li>
                    <li className="navbar-item"><Link to="/timeline">Timeline</Link></li>
                    <li className="navbar-item"><Link to="/maps">Maps</Link></li>
                    <li className="navbar-item"><Link to="/magic">Magic</Link></li>
                    <li className="navbar-item"><Link to="/bestiary">Bestiary</Link></li>
                    <li className="navbar-item"><Link to="/search">Search</Link></li>
                    <li className="navbar-item"><Link to="/profile">Profile</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default NavbarComponent;