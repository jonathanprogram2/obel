import React from "react";
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import '../index.css';
import "../styles.css";

// Orbitron Font
const orbitronStyle = {
  fontFamily: "'Orbitron', sans-serif"
};


const buttonVariants = {
  hover: {
    scale: 1.1,
    transition: { duration: 0.3 },
  }
};

const logoVariants = {
  initial: { opacity: 1, scale: 1 },
  animate: {
    opacity: [1, 0.7, 1],
    scale: [0.92, 1.08, 0.95, 1.03],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

const Home = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen text-white p-6 relative z-10"
        style={orbitronStyle}
      >

        {/* ✅ Background Image */}
        <div 
          className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/pyramid.jpg')", opacity: 1 }}
        />

        {/* ✅ Dark Overlay to make text readable */}
        <div className="fixed top-0 left-0 w-full h-full bg-black opacity-40 z-0" />

        {/* Explore Button - Top Left */}
        <Link to="/explore">
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            className="absolute top-4 left-4 px-4 py-2 bg-black text-gold border border-yellow-500 rounded-md shadow-lg hover:shadow-yellow-400">
            Explore
          </motion.button>
        </Link>

        {/* Sign Up Button - Top Right */}
        <Link to="/signup"> 
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            className="absolute top-4 right-4 px-4 py-2 bg-black text-gold border border-yellow-500 rounded-md shadow-lg hover:shadow-yellow-400">
            Sign Up
          </motion.button>
        </Link>
        
        <div className="relative z-10">
          {/* Company Title */}
          <h1 className="text-7xl font-extrabold text-white mb-4 drop-shadow-[0_0_20px_gold]">Obel</h1>
        </div>

        {/* Obel Logo */}
        <motion.img
          src="/obellogo.png" 
          alt="Obel Logo" 
          className="w-40 h-40" 
          variants={logoVariants}
          initial="initial"
          animate="animate"
        />
        <div className="relative flex flex-col items-center">
         {/* Tagline */}
         <h1 className="text-4xl font-bold mt-6 text-center text-white">
           Discover and Curate the Best Web3 Content  
         </h1>

         {/* Call to Action */}
         <p className="text-gray-200 mt-4 text-xl text-center">
            Join Obel and explore the decentralized social media revolution.
         </p>
        </div>
        
        <div className="relative z-10">
          {/* Login Button - Centered */}
          <Link to="/login">
            <motion.button
             variants={buttonVariants}
             whileHover="hover"
             className="mt-6 px-6 py-3 bg-black text-gold border border-yellow-500 rounded-lg shadow-lg hover:shadow-yellow-400">
              Login
            </motion.button>
          </Link>
        </div>
      </motion.div>
    );
};

export default Home;
