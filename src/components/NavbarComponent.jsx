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
        <nav className="navbar" style={{zIndex: '9'}}>
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

                    <li className="navbar-item dropdown">
                        <Link to="/characters" className="dropbtn">Characters</Link>
                        <div className="dropdown-content">
                            <Link to="/bestiary">Bestiary</Link>
                        </div>
                    </li>

                    <li className="navbar-item dropdown">
                        <Link to="/timeline" className="dropbtn">Timeline</Link>
                        <div className="dropdown-content">
                            <Link to="/important-events">Important Events</Link>
                            <Link to="/locations">Locations</Link>
                            <Link to="/politicalEntities">Political Entities</Link>
                            <Link to="/maps">Maps</Link>
                        </div>
                    </li>

                    <img src={logo} alt="Logo" className="navbar-logo" />

                    <li className="navbar-item dropdown">
                        <Link to="/magic" className="dropbtn">Magic</Link>
                        <div className="dropdown-content">
                            <Link to="/magic/schools">Schools</Link>
                            <Link to="/magic/classes">Classes</Link>
                        </div>
                    </li>

                    <li className="navbar-item"><Link to="/stories">Stories</Link></li>
                    <li className="navbar-item"><Link to="/profile">Profile</Link></li>
                </ul>

                {/* Mobile Navbar: */}
                <ul className={`navbar-menu mobile-menu ${menuOpen ? 'open' : ''}`}>
                    <li className="navbar-item"><Link to="/">Home</Link></li>
                    <li className="navbar-item"><Link to="/about">About</Link></li>
                    <li className="navbar-item"><Link to="/characters">Characters</Link></li>
                    <li className="navbar-item"><Link to="/important-events">Important Events</Link></li>
                    <li className="navbar-item"><Link to="/timeline">Timeline</Link></li>
                    <li className="navbar-item"><Link to="/locations">Locations</Link></li>
                    <li className="navbar-item"><Link to="/maps">Maps</Link></li>
                    <li className="navbar-item"><Link to="/magic">Magic</Link></li>
                    <li className="navbar-item"><Link to="/bestiary">Bestiary</Link></li>
                    <li className="navbar-item"><Link to="/stories">Stories</Link></li>
                    <li className="navbar-item"><Link to="/profile">Profile</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default NavbarComponent;