import React, { useState } from 'react';

const SignupModal = ({ show, onClose }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');


    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('✅ Signup successful!');
                onClose();
            } else {
                setMessage(`❌ ${data}`);
            }
        } catch (err) {
            setMessage('❌ Error signing up.');
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md text-white">
                <h2 className="text-2xl font-bold mb-4">📝 Sign Up</h2>
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="p-3 rounded-md text-black"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 rounded-md text-black"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded-md text-black"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-300"
                    >
                        Sign Up
                    </button>
                    {message && <p className="text-sm mt-2">{message}</p>}
                </form>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 text-sm hover:underline"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SignupModal;