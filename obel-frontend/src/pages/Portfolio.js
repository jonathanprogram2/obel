import React, { useEffect, useMemo, useState} from "react";
import { motion } from "framer-motion";
import GrowthVsContributionsChart from "../components/GrowthVsContributionsChart";
import HoldingsAllocationPie from "../components/HoldingsAllocationPie";
import { Link } from "react-router-dom";


const HOLDINGS_STORAGE_KEY = "obelOwnedStocks";
const PORTFOLIO_HISTORY_KEY = "obelPortfolioHistory";
const PORTFOLIO_TXN_KEY = "obelPortfolioTransactions";

// For now lets use a small universe that works on the free tier finnhub api
const AVAILABLE_SYMBOLS = [
    { symbol: "AAPL", label: "Apple Inc." },
    { symbol: "MSFT", label: "Microsoft" },
    { symbol: "NVDA", label: "NVIDIA" },
    { symbol: "SPY", label: "SPDR S&P 500 ETF" },
    { symbol: "QQQ", label: "Invesco QQQ" },
];

// Soft color palette for allocation segments
const ALLOCATION_COLORS = [
    "from-yellow-400/80 to-yellow-300/40",
    "from-cyan-400/80 to-cyan-300/40",
    "from-emerald-400/80 to-emerald-300/40",
    "from-purple-400/80 to-purple-300/40",
    "from-rose-400/80 to-rose-300/40",
];


const Portfolio = () => {
    const [owned, setOwned] = useState([]);  // [{symbol, shares}]
    const [quotes, setQuotes] = useState(null);
    const [loadingQuotes, setLoadingQuotes] = useState(false);
    const [error, setError] = useState("");
    const [detailsBySymbol, setDetailsBySymbol] = useState({});

    const [history, setHistory] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const [showNetWorthHelp, setShowNetWorthHelp] = useState(false);
    
    // form state
    const [formSymbol, setFormSymbol] = useState("AAPL");
    const [formShares, setFormShares] = useState("");

    const [showContributionHelp, setShowContributionHelp] = useState(false);

    const [showHoldingsHelp, setShowHoldingsHelp] = useState(false);
    const [showPortfolioHelp, setShowPortfolioHelp] = useState(false);

    // Contribution form state
    const [contribAmount, setContribAmount] = useState("");
    const [contribType, setContribType] = useState("deposit");
    const [contribDate, setContribDate] = useState(() => 
        new Date().toISOString().slice(0, 10)
    );

    // Use same-origin in production (Vercel), localhost in dev via env var
    const API_BASE =
        import.meta?.env?.VITE_API_BASE_URL ||
        process.env.REACT_APP_API_BASE_URL ||
        "";



    // ----- Load holdings from local storage on first mount -----
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(HOLDINGS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length) {
                    setOwned(parsed);
                    return;
                }
            }
        } catch (e) {
            console.warn("Failed to parse stored holdings", e);
        }

        // default demo holdings if nothing saved yet
        const defaults = [
            { symbol: "AAPL", shares: 3 },
            { symbol: "MSFT", shares: 2 },
            { symbol: "NVDA", shares: 1 },
        ];
        setOwned(defaults);
        window.localStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(defaults));
    }, []);

    useEffect(() => {
        try {
            const rawHistory = window.localStorage.getItem(PORTFOLIO_HISTORY_KEY);
            if (rawHistory) {
                const parsed = JSON.parse(rawHistory);
                if (Array.isArray(parsed)) {
                    setHistory(parsed);
                }
            }
        } catch (e) {
            console.warn("Failed to parse portfolio history", e);
        }

        try {
            const rawTx = window.localStorage.getItem(PORTFOLIO_TXN_KEY);
            if (rawTx) {
                const parsed = JSON.parse(rawTx);
                if (Array.isArray(parsed)) {
                    setTransactions(parsed);
                }
            }
        } catch (e) {
            console.warn("Failed to parse portfolio transactions", e);
        }
    }, []);

    // ---- fetch quotes whenever owned changes ----
    useEffect(() => {
        const fetchQuotes = async () => {
            if (!owned.length) {
                setQuotes(null);
                return;
            }

            const symbols = owned.map((h) => h.symbol).join(",");
            setLoadingQuotes(true);
            setError("");

            try {
                const res = await fetch(`${API_BASE}/api/stocks/watchlist?symbols=${encodeURIComponent(symbols)}`
                );
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const json = await res.json();
                setQuotes(json);
            } catch (err) {
                console.error("❌ portfolio quotes fetch error:", err);
                setError("Could not load latest prices. Try again in a minute.");
            } finally {
                setLoadingQuotes(false);
            }
        };

        fetchQuotes();
    }, [owned]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!owned.length) return;

            // Only load missing symbols
            const toFetch = owned
                .map(h => h.symbol)
                .filter(sym => !detailsBySymbol[sym]);

            if (!toFetch.length) return;

            const baseUrl = API_BASE || "";
            const results = await Promise.all(
                toFetch.map(async (sym) => {
                    try {
                        const res = await fetch(`${baseUrl}/api/stocks/detail/${sym}`);
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        const json = await res.json();
                        return { symbol: sym, data: json };
                    } catch (err) {
                        console.error("detail fetch failed for", sym, err);
                        return null;
                    }
                })
            );

            const next = {};
            for (const r of results) {
                if (r && !r.data.error) {
                    next[r.symbol] = r.data;
                }
            }

            if (Object.keys(next).length) {
                setDetailsBySymbol(prev => ({ ...prev, ... next }));
            }
        };

        fetchDetails();
    }, [owned, detailsBySymbol]);

    // map holdings + quotes together
    const rows = useMemo(() => {
        if (!quotes || !quotes.quotes) return [];

        const priceBySymbol = {};
        const changeBySymbol = {};
        const changePctBySymbol = {};

        for (const q of quotes.quotes) {
            priceBySymbol[q.symbol] = q.price ?? null;
            changeBySymbol[q.symbol] = q.change ?? q.dp ?? null;
            changePctBySymbol[q.symbol] = q.changePercent ?? q.dp ?? null;
        }

        return owned.map((h) => {
            const price = priceBySymbol[h.symbol] ?? null;
            const value = price != null ? price * h.shares : null;
            const change = changeBySymbol[h.symbol] ?? null;
            const changePercent = changePctBySymbol[h.symbol] ?? null;
            return { ...h, price, value, change, changePercent };
        });
    }, [owned, quotes]);

    const pieHoldings = useMemo(() => {
        if (!rows.length) return [];

        return rows
            .filter((r) => r.value != null && r.value > 0)
            .map((r) => {
                const detail = detailsBySymbol[r.symbol];
                const profile = detail?.profile;

                const description =
                    profile?.description ||
                    `${profile?.name || r.symbol} — ${
                        profile?.industry || "public company"
                    }${profile?.country ? ` based in ${profile.country}` : ""}.`;

                return {
                    symbol: r.symbol,
                    name:
                        AVAILABLE_SYMBOLS.find((s) => s.symbol === r.symbol)?.label ||
                        r.symbol,
                    shares: r.shares,
                    currentPrice: r.price ?? 0,
                    changePct: 
                        typeof r.changePercent === "number" 
                            ? r.changePercent
                            : parseFloat(String(r.changePercent).replace("%", "")) || 0,
                    value: r.value ?? 0,
                    description,
                };
            });
    }, [rows, detailsBySymbol]);

    const totalValue = rows.reduce((sum, r) => sum + (r.value || 0), 0);

    useEffect(() => {
        if (!Number.isFinite(totalValue) || totalValue <= 0) return;

        const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

        setHistory((prev) => {
            const next = [...prev];
            const idx = next.findIndex((s) => s.date === today);

            if (idx >= 0) {
                if (next[idx].totalValue === totalValue) return prev;
                next[idx] = { ...next[idx], totalValue };
            } else {
                next.push({ date: today, totalValue });
                next.sort((a, b) => a.date.localeCompare(b.date));
            }

            try {
                window.localStorage.setItem(
                    PORTFOLIO_HISTORY_KEY,
                    JSON.stringify(next)
                );
            } catch (e) {
                console.warn("Failed to persist portfolio history", e);
            }

            return next;
        });
    }, [totalValue]);

    // ---- Allocation by symbol chart data -----------
    const allocation = useMemo(() => {
        if (!rows.length || totalValue <= 0) return [];

        return rows
            .map((r) => ({
                symbol: r.symbol,
                value: r.value || 0,
                percent: r.value ? (r.value / totalValue) * 100 : 0,
            }))
            .filter((x) => x.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [rows, totalValue]);

    // ---- handlers ------------
    const handleAddOrUpdate = (e) => {
        e.preventDefault();
        const sharesNum = parseFloat(formShares);
        if (!formSymbol || isNaN(sharesNum) || sharesNum <= 0) return;

        setOwned((prev) => {
            const existingIdx = prev.findIndex((h) => h.symbol === formSymbol);
            let next;
            if (existingIdx >= 0) {
                next = [...prev];
                next[existingIdx] = { symbol: formSymbol, shares: sharesNum };
            } else {
                next = [...prev, { symbol: formSymbol, shares: sharesNum }];
            }
            window.localStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(next));
            return next;
        });

        setFormShares("");
    };

    const handleRemove = (symbol) => {
        setOwned((prev) => {
            const next = prev.filter((h) => h.symbol !== symbol);
            window.localStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    // contribution (deposit / withdrawal)
    const handleAddContribution = (e) => {
        e.preventDefault();
        const amountNum = parseFloat(contribAmount);
        if (!amountNum || amountNum <= 0) return;

        const safeDate =
            contribDate || new Date().toISOString().slice(0, 10);

        const tx = {
            id: `txn_${safeDate}_${Date.now()}`,
            date: safeDate,
            type: contribType,
            amount: amountNum,
        };

        setTransactions((prev) => {
            const next = [...prev, tx].sort((a, b) =>
                a.date.localeCompare(b.date)
            );
            try {
                window.localStorage.setItem(
                    PORTFOLIO_TXN_KEY,
                    JSON.stringify(next)
                );
            } catch (e) {
                console.warn("Failed to save transactions", e);
            }
            return next;
        });

        setContribAmount("");
    };

    const GOAL = 50000;
    const goalPercent = 
        totalValue > 0 ? Math.min((totalValue / GOAL) * 100, 100) : 0;

    
    return (
        <div className="min-h-screen bg-[#050507] text-white pt-20 pb-10 px-6 md:px-10 max-w-6xl mx-auto">
            {showPortfolioHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setShowPortfolioHelp(false)}
                >
                    <div
                        className="w-[92vw] max-w-3xl rounded-3xl border border-yellow-500/60 bg-[#050509] px-4 py-4 md:px-8 md:py-8 shadow-[0_0_45px_rgba(234,179,8,0.6)] relative max-h-[70vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 gap-4">
                            <div>
                                <p className="text-[0.75rem] md:text-[0.7rem] uppercase tracking-[0.22em] text-yellow-400/90 mb-1">
                                    Portfolio • Overview
                                </p>
                                <h2 className="text-base md:text-2xl font-orbitron font-semibold text-yellow-100">
                                    How this portfolio page works
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPortfolioHelp(false)}
                                className="text-xs text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        <div className="space-y-6 text-[0.88rem] md:text-[0.95rem] leading-relaxed text-gray-100">
                            {/* 1. Net worth + goal */}
                            <section className="flex gap-4">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-yellow-400/80 bg-black/80 shadow-[0_0_14px_rgba(234,179,8,0.6)]">
                                    <span className="text-xs font-orbitron text-yellow-200">1</span>
                                </div>
                                <div>
                                    <h3 className="text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase text-yellow-300 mb-1">
                                        Net worth & goal snapshot
                                    </h3>
                                    <p>
                                        The top cards show your current{" "}
                                        <span className="font-semibold text-yellow-200">Obel net worth</span> and
                                        how close you are to your goal. Net worth here combines{" "}
                                        <span className="font-semibold text-emerald-300">everything you log in the
                                        Record contribution log</span> (deposits minus withdrawals){" "}
                                        <span className="font-semibold text-yellow-200">plus</span> the current
                                        value of the stocks you're tracking in your holdings. It's both your cash
                                        flow and your invested positions, rolled into one number.
                                    </p>
                                </div>
                            </section>

                            {/* 2. Growth vs contributions chart */}
                            <section className="flex gap-4">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 border border-yellow-400/80 shadow-[0_0_14px_rgba(234,179,8,0.6)]">
                                    {/* tiny line+bar chart icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M4 19V5m0 14h16"
                                            stroke="#fefce8"
                                            strokeWidth="1.5"
                                            fill="none"
                                        />
                                        <path
                                            d="M7 16l3-5 3 3 4-7"
                                            stroke="#facc15"
                                            strokeWidth="1.5"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase text-yellow-300 mb-1">
                                        Growth vs contributions chart
                                    </h3>
                                    <p>
                                        The big chart tracks{" "}
                                        <span className="font-semibold text-emerald-300">how your net worth changes over time</span>{" "}
                                        and compares it to the{" "}
                                        <span className="font-semibold text-yellow-200">deposits and withdrawals you log</span>{" "}
                                        in the contribution tool. Bars show your net contributions (money added or withdrawn) for each month.
                                        The dotted gold line tracks your net worth over time. The red line is your{" "}
                                        cumulative return % relative to everything you've invested so far.
                                    </p>
                                </div>
                            </section>

                            {/* 3. Contribution log */}
                            <section className="flex gap-4">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 border border-yellow-400/80 shadow-[0_0_14px_rgba(234,179,8,0.6)]">
                                    💸
                                </div>
                                <div>
                                    <h3 className="text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase text-yellow-300 mb-1">
                                        Record contribution log
                                    </h3>
                                    <p>
                                        Use the <span className="font-semibold text-yellow-200">Record contribution</span> box
                                        to log deposits and withdrawals. These entries feed into the chart above and give
                                        context for why your net worth is moving up or down.
                                    </p>
                                </div>
                            </section>

                            {/* 4. Holdings & allocation */}
                            <section className="flex gap-4">
                                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 border border-yellow-400/80 shadow-[0_0_14px_rgba(234,179,8,0.6)]">
                                    {/* donut / allocation icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 15 15"
                                    >
                                        <path
                                            fill="#fefce8"
                                            stroke="#fefce8"
                                            strokeWidth="0.5"
                                            d="M0 7.5A7.5 7.5 0 0 1 7 .016v4.02a3.5 3.5 0 1 0 2.596 6.267l2.842 2.842A7.5 7.5 0 0 1 0 7.5"
                                        />
                                        <path
                                            fill="#fefce8"
                                            stroke="#fefce8"
                                            strokeWidth="0.5"
                                            d="M13.145 12.438A7.47 7.47 0 0 0 15 7.5c0-1.034-.21-2.018-.587-2.914L10.755 6.21a3.5 3.5 0 0 1-.452 3.385zM8 4.035V.016a7.5 7.5 0 0 1 5.963 3.676L10.254 5.34A3.5 3.5 0 0 0 8 4.035"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase text-yellow-300 mb-1">
                                        Holdings & allocation section
                                    </h3>
                                    <p>
                                        At the bottom, the{" "}
                                        <span className="font-semibold text-yellow-200">Edit Holdings</span> panel and{" "}
                                        <span className="font-semibold text-emerald-300">Holdings Breakdown</span> table let
                                        you define which stocks you own and how many shares. The donut chart shows{" "}
                                        <span className="font-semibold text-yellow-200">
                                            which positions take up the biggest slice
                                        </span>{" "}
                                        of your portfolio.
                                    </p>
                                    <p className="mt-2">
                                        Click any symbol in the table to open its{" "}
                                        <span className="font-semibold text-emerald-300">Stock Detail</span> page for a deeper,
                                        technical view.
                                    </p>
                                </div>
                            </section>

                            {/* disclaimer */}
                            <section className="border-t border-yellow-500/25 pt-3 text-[0.8rem] text-gray-300">
                                This entire page is a{" "}
                                <span className="font-semibold text-yellow-200">planning & learning tool</span>. It doesn't
                                move real money or place real trades—it just mirrors the holdings, deposits, and withdrawals
                                you enter so you can experiment and track your progress toward your goals.
                            </section>
                        </div>

                        {/* footer button */}
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowPortfolioHelp(false)}
                                className="px-5 py-2 rounded-full bg-yellow-400 text-xs md:text-sm font-semibold text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNetWorthHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setShowNetWorthHelp(false)}
                >
                    <div 
                        className="max-w-md w-full rounded-2xl border border-yellow-500/60 bg-[#050509] p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)] relative"
                        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                Net worth
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowNetWorthHelp(false)}
                                className="text-xs text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        {/* Body copy */}
                        <p className="text-sm text-gray-200 mb-2">
                            On this screen, <span className="text-yellow-300 font-semibold">"Net worth"</span> is a
                            simple, visual calculator for your overall financial status inside Obel.
                        </p>
                        <p className="text-sm text-gray-300 mb-2">
                            It combines the{" "}
                            <span className="text-emerald-300 font-medium">contributions you log</span> in the{" "}
                            <span className="font-medium text-yellow-200">Record contribution log</span> (deposits and
                            withdrawals) with the <span className="text-emerald-300 font-medium">gains or losses</span>{" "}
                            from the stocks you're tracking on this page.
                        </p>
                        <p className="text-sm text-gray-300 mb-2">
                            Put simply, this net worth number is a running total that reflects how much money has flowed
                            in and out, plus how your investments have moved over time.
                        </p>
                        <p className="text-xs text-gray-400 mt-3 border-t border-yellow-500/20 pt-3">
                            This is a <span className="text-yellow-200 font-medium">planning tool only</span>. No real
                            money is actually deposited or withdrawn when you add a log here. It's designed to help
                            you visualize your financial journey, not to move funds.
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowNetWorthHelp(false)}
                                className="px-4 py-1.5 rounded-full bg-yellow-400 text-xs font-semibold text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 relative"
            >
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-yellow-400/80 mb-1">
                    Portfolio
                </p>
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-2">
                    My Net Worth & Holdings
                </h1>

                {/* "What is this page"? button */}
                <button
                    type="button"
                    onClick={() => setShowPortfolioHelp(true)}
                    className="absolute right-0 top-0 text-[0.7rem] text-yellow-300 hover:text-yellow-200 underline decoration-dotted"
                >
                    What is this page?
                </button>
            </motion.div>

            {/* ==== ROW 1: Balance / Goal / Growth chart === */}
            <div className="grid gap-4 xl:grid-cols-3 mb-6">
                {/* My Net worth */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-black via-[#101018] to-black p-5 shadow-[0_0_35px_rgba(234,179,8,0.35)]"
                >
                    <div className="flex items-start justify-between mb-1">
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                            My Net worth
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowNetWorthHelp(true)}
                            className="info-icon info-icon--small shrink-0"
                            aria-label="What does net worth mean on this page?"
                        >
                            ℹ
                        </button>
                    </div>

                    <p className="text-3xl md:text-5xl font-semibold">
                        {totalValue > 0 ? `$${totalValue.toFixed(2)}` : "--"}
                    </p>
                    {quotes?.asOf && (
                        <p className="text-[0.65rem] text-gray-500 mt-3">
                            Updated as of {new Date(quotes.asOf).toLocaleString()}
                        </p>
                    )}
                </motion.div>

                {/* Goal card */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.05 }}
                    className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg flex flex-col justify-between"
                >
                    <div>
                        <p className="linear-wipe text-lg md:text-xl font-orbitron uppercase tracking-[0.25em] mb-2">
                            Goal!
                        </p> 
                    </div>
                    <div>
                        <p className="text-lg text-gray-400 mb-1">
                            Target:{" "}
                            <span className="text-yellow-300">
                                ${GOAL.toLocaleString()}
                            </span>
                        </p>
                        <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-emerald-400"
                                style={{ width: `${goalPercent.toFixed(0)}%`}}
                            />
                        </div>
                        <p className="text-[0.7rem] text-gray-400 mt-1">
                            {totalValue > 0
                                ? `${goalPercent.toFixed(1)}% of $${GOAL.toLocaleString()}`
                                : "Add holdings to start tracking this goal."}
                        </p>
                    </div>
                </motion.div>
            </div>
            
            <div className="portfolioGrowthCard">
                <GrowthVsContributionsChart/>
            </div>

            {/* Simple "Record contribution card" */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="rounded-2xl border border-yellow-500/30 bg-[#050509] p-5 shadow-lg mb-8"
            >
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-lg font-manrope font-semibold">
                            Record contribution log
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowContributionHelp((prev) => !prev)}
                        className="text-[0.7rem] text-yellow-300 hover:text-yellow-200 underline decoration-dotted"
                    >
                        {showContributionHelp ? "Hide explanation" : "What's this tool?"}
                    </button>
                </div>

                {/* Help box */}
                {showContributionHelp && (
                    <div className="mb-4 rounded-xl bg-yellow-500/5 border border-yellow-500/25 px-4 py-3 text-[0.75rem] leading-relaxed text-gray-200">
                        <p className="font-semibold text-yellow-300 mb-1">
                            What does "Record contribution log" mean?
                        </p>
                        <p>
                            Use this tool to keep a log of money that flows in and out of your overall
                            income (portfolio balance). A <span className="font-semibold">Deposit</span> entry
                            represents new money added to your total income from any source
                            (jobs, side-income, etc.), and a{" "}
                            <span className="font-semibold">Withdrawal</span> entry represents money
                            that leaves your overall income.
                        </p>
                        <p className="mt-2">
                            You can record deposits and withdrawals on any day of the month, and the
                            growth vs contributions chart above is meant to visualize those logs over
                            time.
                        </p>
                        <p className="mt-2 text-yellow-300">
                            This is just a tracking tool to help you understand your financial
                            journey — <span className="font-semibold">no real money</span> is actually
                            deposited or withdrawn when you add a contribution here.
                        </p>
                    </div>
                )}
                

                <form
                    onSubmit={handleAddContribution}
                    className="grid gap-4 md:grid-cols-3"
                >
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Type</label>
                        <select
                            value={contribType}
                            onChange={(e) => setContribType(e.target.value)}
                            className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                        >
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Amount ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={contribAmount}
                            onChange={(e) => setContribAmount(e.target.value)}
                            className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                            placeholder="e.g. 300"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Date</label>
                        <input
                            type="date"
                            value={contribDate}
                            onChange={(e) => setContribDate(e.target.value)}
                            className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                        />
                    </div>
                </form>

                <button
                    type="submit"
                    onClick={handleAddContribution}
                    className="mt-4 w-full md:w-auto rounded-full bg-yellow-400 text-black text-sm font-semibold px-5 py-2 hover:bg-yellow-300 transition shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                >
                    Add contribution
                </button>
            </motion.div>


            <HoldingsAllocationPie holdings={pieHoldings} />

            {/* Bottom grid: Holdings editor + table */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
                {/* Left: editor form */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-1 rounded-2xl border border-yellow-500/40 bg-[#050509] p-5 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-manrope font-semibold">
                            Edit Holdings
                        </h2>
                    </div>

                    <form onSubmit={handleAddOrUpdate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">
                                Select stock 
                            </label>
                            <select
                                value={formSymbol}
                                onChange={(e) => setFormSymbol(e.target.value)}
                                className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                            >
                                {AVAILABLE_SYMBOLS.map((s) => (
                                    <option key={s.symbol} value={s.symbol}>
                                        {s.symbol} — {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-400">
                                Number of shares
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formShares}
                                onChange={(e) => setFormShares(e.target.value)}
                                className="w-full rounded-xl bg-black/60 border border-yellow-500/40 px-3 py-2 text-sm outline-none focus:border-yellow-300"
                                placeholder="e.g. 3"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-full bg-yellow-400 text-black text-sm font-semibold py-2 mt-2 hover:bg-yellow-300 transition shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                        >
                            Add / Update Holding
                        </button>
                    </form>
                </motion.div>

                {/* Right: holdings table */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="lg:col-span-2 rounded-2xl border border-yellow-500/40 bg-[#050509] p-5 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-manrope font-semibold">
                            Holdings Breakdown
                        </h2>

                        <div className="flex items-center gap-3">
                            {loadingQuotes && (
                                <span className="text-[0.7rem] text-gray-400">
                                    Updating prices...
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowHoldingsHelp(true)}
                                aria-label="What does the holdings section do?"
                                className="hover:scale-[1.03] transition-transform"
                            >
                                {/* Obel-styled speech-bubble question icon */}
                                <svg
                                    viewBox="0 0 64 64"
                                    className="holdings-help-icon"
                                >
                                    {/* outer bubble */}
                                    <g>
                                        <path
                                            className="bubble-outline"
                                            d="M36.4 60l-.8-.8c-.1-.1-7.5-7.3-11.2-12.5C10.7 44.5.7 35 .7 23.9 0.7 11.1 13.9.6 30.1.6S59.5 11 59.5 23.9c0 10.9-9.7 20.4-23.2 22.7V60h-. -"
                                        />
                                    </g>
                                    {/* inner bubble */}
                                    <g>
                                        <path
                                            className="bubble-inner"
                                            d="M59 23.9C59 11.3 46.1 1.1 30.1 1.1S1.2 11.3 1.2 23.9c0 11.1 10.1 20.3 23.4 22.3 3.7 5.2 11.2 12.6 11.2 12.6V46.2C49.1 44.1 59 34.9 59 23.9z"
                                        />
                                    </g>
                                    {/* question mark */}
                                    <path
                                        className="question-mark"
                                        d="M29.2 9.2c1.6 0 3.1.3 4.7 1 1.7.7 2.9 1.7 3.9 2.9.9 1.2 1.4 2.5 1.4 3.9 0 1.6-.7 3-2 4.1-.3.3-1.4.9-3.1 1.7-.6.3-1.1.6-1.4.9-.3.3-.6.7-.8 1.1-.5 1-1 1.7-1.2 1.9-.4.3-1 .4-1.9.4-.8 0-1.5-.2-2-.7s-.7-1.2-.7-2 .2-1.6.6-2.4c.1-.2.6-1 1.6-2.5.9-1.4 1.4-2.6 1.4-3.8 0-.6-.1-1.1-.4-1.5s-.6-.6-1-.6-.7.1-.9.4c-.2.3-.3.8-.4 1.5-.1 1.4-.6 2.5-1.4 3.2-.8.7-1.8 1.1-3.1 1.1-.9 0-1.6-.2-2.2-.7-.6-.6-1-1.3-1-2.2 0-1.3.5-2.7 1.4-3.9.9-1.3 2.1-2.2 3.5-2.8 1.5-.7 3.1-1 4.9-1zM28.7 29.1c1.2 0 2.2.5 3.1 1.4s1.3 1.9 1.3 3.1c0 1.2-.4 2.3-1.3 3.2s-1.9 1.3-3.2 1.3c-1.2 0-2.2-.4-3.1-1.2-.9-.9-1.4-2-1.4-3.3 0-1.2.4-2.2 1.2-3.1.8-.7 2-1.4 3.4-1.4z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 mb-3">{error}</div>
                    )}

                    {!rows.length && !error && (
                        <p className="text-sm text-gray-400">
                            No holdings yet. Add a stock on the left to get started.
                        </p>
                    )}

                    {rows.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-400 border-b border-yellow-500/20">
                                    <tr>
                                        <th className="py-2 text-left font-normal">Symbol</th>
                                        <th className="py-2 text-right font-normal">
                                            Shares
                                        </th>
                                        <th className="py-2 text-right font-normal">
                                            Price
                                        </th>
                                        <th className="py-2 text-right font-normal">
                                            Value
                                        </th>
                                        <th className="py-2 text-right font-normal"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-yellow-500/10">
                                    {rows.map((r) => {
                                        const detail = detailsBySymbol[r.symbol];
                                        const logo = detail?.profile?.logo;

                                        return (
                                        <tr
                                            key={r.symbol}
                                            className="hover:bg-yellow-500/5 transition"
                                        >
                                            <td className="py-2 pr-2">
                                                <Link
                                                    to={`/token/${r.symbol}`}
                                                    className="flex items-center gap-2 group hover:text-yellow-300 transition"
                                                >
                                                    {logo ? (
                                                        <img
                                                            src={logo}
                                                            alt={`${r.symbol} logo`}
                                                            className="h-8 w-8 rounded-full border border-yellow-500/60 bg-black object-contain group-hover:shadow-[0_0_12px_rgba(234,179,8,0.7)]"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500/40 to-yellow-300/10 border border-yellow-500/60 flex items-center justify-center text-xs font-orbitron group-hover:shadow-[0_0_12px_rgba(234,179,8,0.7)]">
                                                            {r.symbol}
                                                        </div>
                                                    )}
                                                    <span className="font-manrope text-sm">
                                                        {r.symbol}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="py-2 text-right">
                                                {r.shares.toFixed(2)}
                                            </td>
                                            <td className="py-2 text-right">
                                                {r.price != null
                                                    ? `$${r.price.toFixed(2)}`
                                                    : "--"}
                                            </td>
                                            <td className="py-2 text-right">
                                                {r.value != null
                                                    ? `$${r.value.toFixed(2)}`
                                                    : "--"}
                                            </td>
                                            <td className="py-2 text-right">
                                                <button
                                                    onClick={() => handleRemove(r.symbol)}
                                                    className="text-[0.7rem] text-red-400 hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>     
            </div>
            {showHoldingsHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setShowHoldingsHelp(false)}
                >
                    <div 
                        className="max-w-lg w-full rounded-2xl border border-yellow-500/60 bg-[#050509] p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                How your holdings work
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowHoldingsHelp(false)}
                                className="text-xs text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-200 mb-2">
                            The <span className="font-semibold text-yellow-200">Edit Holdings</span> box lets you tell Obel which
                            stocks you own and how many shares you have.
                            Choose a ticker, enter your shares, and click{" "}
                            <span className="font-semibold text-yellow-200">Add / Update Holding</span>.
                        </p>

                        <p className="text-sm text-gray-300 mb-2">
                            Every position you add shows up in the{" "}
                            <span className="font-semibold text-emerald-300">Holdings Breakdown</span> table.
                            For each stock you'll see:
                        </p>

                        <ul className="text-sm text-gray-300 list-disc list-inside mb-2 space-y-1">
                            <li>the stock symbol and logo</li>
                            <li>how many shares you own</li>
                            <li>the latest price pulled from the API</li>
                            <li>the current value of that position</li>
                        </ul>

                        <p className="text-sm text-gray-300 mb-2">
                            At the same time, the pie chart updates to show{" "}
                            <span className="text-yellow-200 font-semibold">which stocks dominate your portfolio</span>.
                            It's a quick visual way to see your diversification.
                        </p>

                        <p className="text-sm text-gray-300 mb-2">
                            You can also click any stock symbol in the table to jump to its{" "}
                            <span className="font-semibold text-emerald-300">Stock Detail</span> page,
                            where you can explore price history and other technical details.
                        </p>

                        <p className="text-xs text-gray-400 mt-3 border-t border-yellow-500/20 pt-3">
                            This is a <span className="text-yellow-200 font-medium">planning and learning tool</span>.
                            You're not actually buying or selling real shares here—just tracking the
                            positions you want to follow.
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowHoldingsHelp(false)}
                                className="px-4 py-1.5 rounded-full bg-yellow-400 text-xs font-semibold text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.6)]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>       
            )}
        </div>
    );
};

export default Portfolio;