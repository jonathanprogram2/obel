import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import "../styles.css";


const CoinIntel = () => {
    const [coins, setCoins] = useState([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch real coin data from CoinGecko API
        const fetchCoins = async () => {
            try {
                const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
                const data = await res.json();
                setCoins(data);
            } catch (err) {
                console.error("Error fetching coins:", err);
                setError("Failed to load coin data.");
            }
        };
        fetchCoins();
    }, []);

    const filteredCoins = coins.filter((coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase())
    );


    return (
        <div className="min-h-screen bg-black text-white p-6 font-orbitron">
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
                    Real-time crypto insights powered by CoinGecko.
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

            {error && <p className="text-center text-red-500 mb-4">{error}</p>}

            {/* Coin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoins.map((coin) => (
                    <motion.div
                        key={coin.id}
                        className="relative p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg hover:shadow-105 transition transform duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="text-2xl font-bold">
                            {coin.name} ({coin.symbol.toUpperCase()})
                        </h3>
                        <img src={coin.image} alt={coin.name} className="w-12 h-12 my-2" />
                        <p className="text-lg">💰 ${coin.current_price.toLocaleString()}</p>
                        <p className={`mt-2 ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.price_change_percentage_24h >= 0 ? '🔥 Rising' : '❄ Falling'} ({coin.price_change_percentage_24h.toFixed(2)}%)
                        </p>
                        </motion.div>
                    ))}
                </div>
            </div>          
        );
};

export default CoinIntel;