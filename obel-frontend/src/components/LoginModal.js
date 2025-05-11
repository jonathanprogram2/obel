import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const LoginModal = ({ show, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Clear fields whenever the modal is closed
        useEffect(() =>{
            if (!show) {
                setUsername('');
                setPassword('');
                setMessage('');
            }
        }, [show]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                setMessage('✅ Login successful!');
                localStorage.setItem('token', data.token);
                setTimeout(() => {
                    onClose();
                    setMessage('');
                    navigate('/explore');
                }, 1500);
            } else {
                setMessage(`❌ ${data}`);
            }
        } catch (err) {
            setMessage('❌ Error logging in.');
        }
    };

    if (!show) return null;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-black border border-yellow-500 p-6 rounded-xl shadow-2xl w-full max-w-md text-white">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                <p className="text-sm text-yellow-400 mb-2">🔒 Your info is encrypted and secured.</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                    <input
                        type="type"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-2 rounded-md text-black"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-2 rounded-md text-black"
                        required
                    />
                    <button
                        type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded"
                    >
                        Login    
                    </button>
                    {message && <p className="text-sm mt-2">{message}</p>}
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 text-sm text-gray-400 hover:underline"
                >
                    Close    
                </button>         
            </div>
        </div>
    );
};

export default LoginModal;