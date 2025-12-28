import React from "react";

const SeedPortfolioButton = () => {
    const handleSeed = async () => {
        const res = await fetch("http://localhost:5000/api/portfolio/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "682029135b92812d3e5c7817",
                tokens: [
                    { symbol: "ETH", amount: 1.5, avgBuyPrice: 1800, income: 120, allocation: 40 },
                    { symbol: "SOL", amount: 10, avgBuyPrice: 20, income: 50, allocation: 35 },
                    { symbol: "BTC", amount: 0.2 , avgBuyPrice: 30000, income: 210, allocation: 25 }
                ],
                history: [
                    { totalValue: 4500 },
                    { totalValue: 5000 },
                    { totalValue: 5300 },
                    { totalValue: 5700 },
                    { totalValue: 6000 },
                ]
            })
        });

        const data = await res.json();
        console.log("✅ Seed result:", data);
        alert("Portfolio seeded! Check your MongoDB collection.");
    };

    return (
        <button
            onClick={handleSeed}
            className="mt-6 px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
        >
            Seed Portfolio Data
        </button>
    );
};

export default SeedPortfolioButton;