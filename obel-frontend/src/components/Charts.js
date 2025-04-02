import React, { useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const priceData = [
    { name: "Mon", price: 220 },
    { name: "Tue", price: 300 },
    { name: "Wed", price: 260 },
    { name: "Thu", price: 350 },
    { name: "Fri", price: 410 },
];

const volumeData = [
    { name: "ETH", volume: 2400 },
    { name: "BTC", volume: 4300 },
    { name: "SOL", volume: 2800 },
    { name: "ARB", volume: 1900 },
];

const pieData = [
    { name: "DeFi", value: 400 },
    { name: "NFTs", value: 300 },
    { name: "DAOs", value: 300 },
    { name: "Gaming", value: 200 }
];

const COLORS = ["#8884d8", "#00C49F", "#FFBB28", "#FF8042"];

const Charts = () => {
    const [activeTab, setActiveTab] = useState("price");

    return (
        <div className="relative z-10 p-6">
            {/* Tabs */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    className="px-4 py-2 rounded-md font-semibold text-white bg-blue-700 glow-blue"
                    onClick={() => setActiveTab("price")}
                >
                  📈 Price
                </button> 
                <button
                    className="px-4 py-2 rounded-md font-semibold text-white bg-green-600 glow-green"
                    onClick={() => setActiveTab("volume")}
                >
                  📊 Volume  
                </button> 
                <button
                    className="px-4 py-2 rounded-md font-semibold text-white bg-pink-600 glow-pink"
                    onClick={() => setActiveTab("distribution")}
                >
                  🌀 Distribution  
                </button>  
            </div>

            {/* Chart Panel */}
            <div className="bg-gray-900 p-6 rounded-xl">
                {activeTab === "price" && (
                    <>
                      <h2 className="text-xl font-bold text-blue-400 mb-4">📈 Price Trends</h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={priceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="price" stroke="#00BFFF" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </>   
                )}

                {activeTab === "volume" && (
                    <>
                     <h2 className="text-xl font-bold text-green-400 mb-4">📊 Market Volume</h2>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={volumeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="volume" fill="#66FF99" />
                        </BarChart>
                     </ResponsiveContainer>
                    </>
                )}

                {activeTab === "distribution" && (
                    <>
                        <h2 className="text-xl font-bold text-yellow-400 mb-4">🌀 Category Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieData.map((entry, index) => ( 
                                        <Cell key={'cell-${index}'} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>       
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </div>
    );
};

export default Charts;
