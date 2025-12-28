require("dotenv").config();


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const newsRoutes = require("./routes/newsRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const twelveRoutes = require("./routes/twelve");
app.use("/api/twelve", twelveRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const weatherRoute = require('./routes/weather');
app.use('/api/weather', weatherRoute);

const flowsRoute = require("./routes/flows");
app.use("/api/flows", flowsRoute);

const stocksRoutes = require("./routes/stocks");
app.use("/api/stocks", stocksRoutes);

app.use("/api/news", newsRoutes);

app.use("/api/workspace", workspaceRoutes);

const quoteRoutes = require("./routes/quoteRoutes");
app.use("/api/quotes", quoteRoutes);

