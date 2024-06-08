import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import './css/RegisterPage.css'

function LoginPage() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { login } = useAuth();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
            console.log('LoginPage - Login Successful');
            navigate('/'); // Navigate to home page on successful login
        } catch (error) {
            console.error('LoginPage - Login Failed:', error);
            setError('Failed to log in');
        }

        setLoading(false);
    };

    return (
        <div className='container'>
            <h2 className='TitleText'>Login</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" ref={emailRef} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" ref={passwordRef} required />
                </div>
                <div className="form-group">
                    <button className='btnPrimary' disabled={loading} type="submit">Log In</button>
                </div>
            </form>

            <label style={{ marginBottom: '0px' }}>Don't Have An Account?</label>
            <button style={{ textDecorationLine: 'underline', marginTop: '0px' }} className='btnSecondary' onClick={() => navigate('/register')}>Register</button>

        </div>
    );
}

export default LoginPage;