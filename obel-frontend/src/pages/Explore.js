import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipLoader } from "react-spinners";
import Charts from "../components/Charts";
import WalletModal from "../components/WalletModal";
import '../styles.css';

// Orbitron Font
const orbitronStyle = {
    fontFamily: "'Orbitron', sans-serif"
};

const Explore = () => {
    const [posts, setPosts] = useState([
        { id: 1, title: "Exploring Web3", likes: 120, shared: 30 },
        { id: 2, title: "Decentralized Social Media", likes: 95, shared: 20 },
        { id: 3, title: "Blockchain and AI", likes: 150, shared: 50 },
        { id: 4, title: "The Future of Crypto", likes: 180, shared: 60 },
        { id: 5, title: "Web3 Security", likes: 90, shared: 25 },
        { id: 6, title: "Ethereum Upgrades", likes: 200, shared: 70 }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [showWalletModal, setShowWalletModal] = useState(false);

    const loadMorePosts = () => {
        if (!hasMore || isLoading) return;
        setIsLoading(true);

        setTimeout(() => {
            const newPosts = [
                { id: posts.length + 1, title: "New Web3 Insights", likes: 80, shared: 15 },
                { id: posts.length + 2, title: "Crypto Trends 2025", likes: 110, shared: 40 },
                { id: posts.length + 3, title: "Ethereum Scaling Solutions", likes: 140, shared: 35 }
            ];

            const updatedPosts = [...posts, ...newPosts];
            setPosts(updatedPosts);
            setIsLoading(false);
            if (updatedPosts.length >= 20) setHasMore(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen relative text-white font-orbitron overflow-hidden">

            {/* 🔮 Background Image Layer */}
            <div
                className="fixed inset-0 bg-cover bg-center z-0"
                style={{ 
                    backgroundImage: "url('/insidepyramid.jpg')",
                    filter: "brightness(0.4) contrast(1.2)",
                 }}

            />

            {/* Main Container Layer */}
            <div className="relative z-10 p-6">  

                {/* Top Buttons */}
                <div className="flex justify-between mb-6">
                    <button
                        onClick={() => setShowWalletModal(true)}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md shadow-lg hover:brightness-110 transition glow-blue"
                    >
                        🔗 Connect Wallet 
                    </button>  

                    <a
                        href="/signup"
                        className="px-5 py-2 bg-gradient-to-r from-green-400 to-green-600 text-black font-bold rounded-md shadow-lg hover:brightness-110 transition"
                    >
                        📝 Sign Up
                    </a>
                </div>


                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10"
                    style={orbitronStyle}
                >
                    <h1 className="text-5xl font-extrabold text-gold mb-2 tracking-widest drop-shadow-[0_0_20px_gold]">
                        Explore the Obelverse
                    </h1>
                    <p className="text-lg text-gray-300">
                        Discover fresh content across Web3 curated just for you.
                    </p>
                </motion.div>

                {/* Coin Intel Button */}
                <div className="flex justify-end mb-8">    
                    <a
                        href="/coin-intel"
                        className="px-5 py-2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold rounded-md shadow-lg hover:brightness-110 transition glow-gold"
                    >
                        🧠 Coin Intel
                    </a>  
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-2xl p-5 bg-gradient-to-br from-gray-800 to-gray-900 border 
                            border-blue-500 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition duration-300"
                        >
                            <h3 className="text-xl font-bold text-blue-400 mb-2">{post.title}</h3>
                            <p className="text-sm text-gray-400">
                                Likes: {post.likes} | Shares: {post.shared}
                            </p>
                            <div className="flex gap-3 mt-4">
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md">
                                    👍 Like
                                </button>
                                <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md">
                                    📤 Share
                                </button>
                            </div>
                        </motion.div>
                    ))}
                
                </div>  

                {/* Load More Button */}  
                {hasMore && (
                    <div className="flex justify-center mt-10">
                        <motion.button
                            onClick={loadMorePosts}
                            className="bg-yellow-400 text-black px-6 py-3 font-semibold rounded-lg shadow-md hover:bg-yellow-300 transition flex items-center gap-2 glow-gold"
                            animate={{ scale: [1, 1.05, 1 ] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            {isLoading ? <ClipLoader color="black" size={20} /> : "Load More"}
                        </motion.button>        
                    </div>
                )}      

                {/* ✅ End */}
                {!hasMore && (
                <p className="text-center mt-10 text-gray-400">
                     🎉 You've reached the end!
                </p>
                )}

                {/* 📈 Charts Section */}
                <Charts />

                {/* 🔐 Wallet Modal*/}
                <WalletModal show={showWalletModal} onClose={() => setShowWalletModal(false)} />
            </div>
        </div>
    );
};

export default Explore;
