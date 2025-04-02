import React, { useState } from 'react';
import { motion } from "framer-motion";
import "../styles.css";


const dummyCoins = [
    { id: 1, name: "Dogecoin", symbol: "DOGE", price: "$0.08" },
    { id: 2, name: "Pepe", symbol: "PEPE", price: "$0.0000013" },
    { id: 3, name: "Shiba Inu", symbol: "SHIB", price: "$0.000024" },
    { id: 4, name: "Floki", symbol: "FLOKI", price: "$0.000035" },
];

const CoinIntel = () => {
    const [search, setSearch] = useState("");
    const [activeTabs, setActiveTabs] = useState({});

    const filteredCoins = dummyCoins.filter((coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleTabClick = (coinId, tab) => {
        setActiveTabs((prevTabs) => ({
            ...prevTabs,
            [coinId]: tab,
        }));
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 relative font-orbitron">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-10"
            >
                <h1 className="text-5xl font-extrabold text-gold mb-2 tracking-widest">
                  🧠 Coin Intel
                </h1>
                <p className="text-gray-300 text-lg">
                    Explore real-time insights, charts, and social buzz around your favorite meme coins.
                </p> 
            </motion.div>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for a coin..."
                    className="w-full max-w-md p-3 rounded-lg text-black"
                />
            </div>

            {/* Coin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoins.map((coin, index) => (
                    <motion.div
                        key={coin.id}
                        className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-yellow-400 hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] transition duration-300"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <h2 className="text-2xl font-bold text-yellow-300 mb-2">
                            {coin.name} <span className="text-gray-400">({coin.symbol})</span>
                        </h2>
                        <p className="mb-4">💰 Price: {coin.price}</p>

                        {/* Tab Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {["Chart", "Social Buzz", "Trends"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabClick(coin.id, tab)}
                                    className={`px-4 py-2 rounded-md font-semibold transition ${
                                        activeTabs[coin.id] === tab
                                          ? "bg-yellow-500 text-black"
                                          : "bg-gray-700 text-white hover:bg-gray-600"
                                      }`}
                                >
                                    {tab}
                                </button>
                              ))}
                            </div>

                            {/* Tab Content */}
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-sm">
                                {activeTabs[coin.id] === "Chart" && (
                                    <p>📊 Showing chart for <strong>{coin.symbol}</strong>... (mock)</p>
                                )}
                                {activeTabs[coin.id] === "Social Buzz" && (
                                    <p>💬 Here's who's talking about <strong>{coin.name}</strong>... (mock)</p>
                                )}
                                {activeTabs[coin.id] === "Trends" && (
                                    <p>📈 Trending data for <strong>{coin.name}</strong>... (mock)</p>
                                )}
                                {!activeTabs[coin.id] && (
                                    <p className="text-gray-500">Select a tab to explore this coin.</p>
                                )}
                            </div> 
                        </motion.div>
                    ))}
                </div>
            </div>          
        );
};

export default CoinIntel;