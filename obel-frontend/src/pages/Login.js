import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";


const buttonVariants = {
    hover: {
        scale: 1.2,
        transition: { duration: 0.3 },
    }
};

const Login =() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Logging in with:', { email, password });
    };

    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
          <h1 className="text-5xl font-extrabold text-gold mb-6">Login</h1>

          <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
                required
              />    
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
                required
              />    
            </div>
            <motion.button
              type="submit"
              variants={buttonVariants}
              whileHover="hover"
              className="w-full py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
              Login
            </motion.button>
          </form>  

          <p className="text-gray-400 mt-4">Don't have an account?
            <Link to="/signup" className="text-blue-500 hover:underline"> 
              Sign up
            </Link>
          </p>
        </motion.div>
    )
};

export default Login;