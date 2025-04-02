import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert('Signup Successful');
        }
    };

    return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={formVariants}
          className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6"
        >
          <h1 className="text-3xl font-bold mb-6">Sign Up to Join Obel</h1>
          <form className="bg-gray-800 p-6 rounded-lg shadow-lg w-80" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1">Username</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              /> 
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>} 
            </div>

            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}  
            </div>

            <div className="mb-4">
              <label className="block mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>} 
            </div>
             
             <button type="submit" className="w-full bg-blue-600 py-2 rounded hover:bg-blue-500">Sign Up</button>
          </form>  
           <p className="mt-4">Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link></p>
        </motion.div>
    );
};

export default Signup;