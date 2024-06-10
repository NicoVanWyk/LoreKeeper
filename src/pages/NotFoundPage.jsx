import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/NotFoundPage.module.css';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>404</h1>
            <p className={styles.message}>Oops! The page you're looking for doesn't exist.</p>
            <button className="btnPrimary" onClick={() => navigate('/')}>
                Go to Home
            </button>
        </div>
    );
}

export default NotFoundPage;