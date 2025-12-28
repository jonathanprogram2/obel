const mongoose = require("mongoose");

const StockPortfolioSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    tokens: [
        {
            symbol: { type: String, required: true }, // e.g. ETH, BTC
            shares: { type: Number, required: true },
            avgBuyPrice: { type: Number, required: true }, // user's avg buy price
            income: { type: Number, default: 0 },          // staking rewards, etc.
            allocation: { type: Number, required: true }
        }
    ],
    history: [
        {
            date: { type: Date, default: Date.now },
            totalValue: { type: Number, required: true}
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("StockPortfolio", StockPortfolioSchema);