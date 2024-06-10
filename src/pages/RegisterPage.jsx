import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import styles from './css/RegisterPage.module.css';

function RegisterPage() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const usernameRef = useRef();

    const { register } = useAuth();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await register(emailRef.current.value, passwordRef.current.value, usernameRef.current.value);
            console.log('Registration Successful'); // Debug log

            // Navigate to the home screen after successful registration
            navigate('/');
        } catch (error) {
            console.error('Registration Failed:', error); // Debug log
            setError('Failed to create an account');
        }

        setLoading(false);
    };

    return (
        <div className="container">
            <h2 className="TitleText">Register</h2>

            {error && <p>{error}</p>}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" ref={emailRef} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Username</label>
                    <input type="text" ref={usernameRef} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Password</label>
                    <input type="password" ref={passwordRef} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Confirm Password</label>
                    <input type="password" ref={passwordConfirmRef} required />
                </div>
                <div className={styles.formGroup}>
                    <button className="btnPrimary" disabled={loading} type="submit">Sign Up</button>
                </div>
            </form>

            <label style={{ marginBottom: '0px' }}>Already Have An Account?</label>
            <button style={{ textDecorationLine: 'underline', marginTop: '0px' }} className="btnSecondary" onClick={() => navigate('/login')}>Log In</button>
        </div>
    );
}

export default RegisterPage;