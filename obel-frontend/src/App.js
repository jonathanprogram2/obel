import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardRoutes from './pages/DashboardRoutes';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import BudgetsPage from './pages/BudgetsPage';
import NewsPage from './pages/NewsPage';
import WorkspacePage from './pages/WorkspacePage';
import StockDetailPage from './pages/StockDetailPage';
import './index.css';


const App = () => {
    return (
        <Router>
            <Routes>
                {/* Homepage */}
                <Route path="/" element={<Home />} />

                {/* Dashboard Layout */}
                <Route path="/dashboard" element={<DashboardRoutes />}>
                    <Route index element={<Dashboard />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    <Route path="budgets" element={<BudgetsPage />} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="workspace" element={<WorkspacePage />} />           
                </Route>

                <Route path="/token/:symbol" element={<StockDetailPage />} />
            </Routes> 
        </Router>
    );
};

export default App;