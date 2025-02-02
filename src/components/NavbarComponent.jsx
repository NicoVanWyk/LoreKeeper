// Base Imports
import React, { useState } from 'react';
// CSS Import
import './css/NavbarComponent.css';
// Navigation Import
import { Link } from 'react-router-dom';
// Image Imports
import logo from '../assets/Logo.jpg';

function NavbarComponent() {
    // UseStates
    // --Menu toggle
    const [menuOpen, setMenuOpen] = useState(false);

    // Changes wether or not the menu is open
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar" style={{ zIndex: '9' }}>
            <div className="navbar-content">
                <img src={logo} alt="Logo" className="navbar-logo-mobile" />
                <button className="navbar-toggle" onClick={toggleMenu}>
                    ☰
                </button>
                <ul className="navbar-menu desktop-menu">
                    <li className="navbar-item dropdown">
                        <Link to="/" className="dropbtn">Home</Link>
                        <div className="dropdown-content">
                            <Link to="/glossary">Glossary</Link>
                            <Link to="/kironaan">Kironaan</Link>
                            <Link to="/about">About</Link>
                            <Link to="/maps">Maps</Link>
                            <Link to="/planes">Planes</Link>
                        </div>
                    </li>

                    <li className="navbar-item dropdown">
                        <Link to="/characters" className="dropbtn">Characters</Link>
                        <div className="dropdown-content">
                            <Link to="/bestiary">Bestiary</Link>
                            <Link to="/factions">Factions</Link>
                        </div>
                    </li>

                    <li className="navbar-item dropdown">
                        <Link to="/timeline" className="dropbtn">Timeline</Link>
                        <div className="dropdown-content">
                            <Link to="/important-events">Important Events</Link>
                            <Link to="/locations">Locations</Link>
                            <Link to="/politicalEntities">Political Entities</Link>
                            <Link to="/alliances">Alliances</Link>
                        </div>
                    </li>

                    <img src={logo} alt="Logo" className="navbar-logo" />

                    <li className="navbar-item dropdown">
                        <Link to="/magic" className="dropbtn">Magic</Link>
                        <div className="dropdown-content">
                            <Link to="/magic/glyphcasting">Glyphcasting</Link>
                            <Link to="/magic/schools">Schools</Link>
                            <Link to="/magic/classes">Classes</Link>
                            <Link to="/religions">Religions</Link>
                        </div>
                    </li>

                    <li className="navbar-item"><Link to="/stories">Stories</Link></li>
                    <li className="navbar-item"><Link to="/profile">Profile</Link></li>
                </ul>

                {/* Mobile Navbar: */}
                <ul className={`navbar-menu mobile-menu ${menuOpen ? 'open' : ''}`}>
                    <li className="navbar-item"><Link to="/">Home</Link></li>
                    <li className="navbar-item"><Link to="/glossary">Glossary</Link></li>
                    <li className="navbar-item"><Link to="/kironaan">Kironaan</Link></li>
                    <li className="navbar-item"><Link to="/about">About</Link></li>
                    <li className="navbar-item"><Link to="/characters">Characters</Link></li>
                    <li className="navbar-item"><Link to="/important-events">Important Events</Link></li>
                    <li className="navbar-item"><Link to="/timeline">Timeline</Link></li>
                    <li className="navbar-item"><Link to="/locations">Locations</Link></li>
                    <li className="navbar-item"><Link to="/politicalEntities">Political Entities</Link></li>
                    <li className="navbar-item"><Link to="/alliances">Alliances</Link></li>
                    <li className="navbar-item"><Link to="/maps">Maps</Link></li>
                    <li className="navbar-item"><Link to="/magic">Magic</Link></li>
                    <li className="navbar-item"><Link to="/religions">Religions</Link></li>
                    <li className="navbar-item"><Link to="/bestiary">Bestiary</Link></li>
                    <li className="navbar-item"><Link to="/factions">Factions</Link></li>
                    <li className="navbar-item"><Link to="/stories">Stories</Link></li>
                    <li className="navbar-item"><Link to="/profile">Profile</Link></li>
                    <li className="navbar-item"><Link to="/planes">Planes</Link></li>
                    <li className="navbar-item"><Link to="/magic/glyphcasting">Planes</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default NavbarComponent;