import React, { useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { symbolName } from "typescript";

const formatChangeClass = (change) => {
    if (change == null) return "text-gray-300";
    if (change < 0) return "text-red-400";
    return "text-emerald-300";
};

const formatNumber = (n) => {
    if (n == null) return "--";
    if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(1) + "T";
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    return n.toLocaleString();
};

const formatPercent = (n) => {
    if (n == null) return "--";
    return n.toFixed(2) + "%";
};

/**
 * Lightweight TradingView widget
 */
const TradingViewChart = ({ symbol }) => {
    useEffect(() => {
        const containerId = "tv-chart-container";

        // If TradingView already loaded, just create a new widget
        const createWidget = () => {
            if (!window.TradingView) return;

            new window.TradingView.widget({
                container_id: containerId,
                symbol,
                interval: "15",
                timezone: "Etc/UTC",
                theme: "dark",
                style: "1", //candles
                locale: "en",
                hide_side_toolbar: true,
                hide_top_toolbar: false,
                withdateranges: true,
                allow_symbol_change: false,
                autosize: true,
            });
        };

        if (!window.TradingView) {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = createWidget;
            document.body.appendChild(script);

            return () => {
                script.remove();
                const el = document.getElementById(containerId);
                if (el) el.innerHTML = "";
            };
        } else {
            createWidget();
            return () => {
                const el = document.getElementById(containerId);
                if (el) el.innerHTML = "";
            };
        }
    }, [symbol]);

    return (
        <div
            id="tv-chart-container"
            className="w-full h-[420px] md:h-[520px]"
        />
    );
};


const StockDetailPage = () => {
    const { symbol: rawSymbol } = useParams();
    const symbol = (rawSymbol || "").toUpperCase();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(
                    `/api/stocks/detail/${symbol}`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("❌ stock detail fetch error:", err)
                setError("Could not load stock details. Try again in a minute.");
            } finally {
                setLoading(false);
            }
        };

        if (symbol) {
            fetchDetail();
        }
    }, [symbol]);

    const quote = data?.quote;
    const profile = data?.profile || {};
    const metrics = data?.metrics || {};
    const news = data?.news || [];


    return (
        <div className="min-h-screen bg-[#050507] text-white pt-20 pb-10 px-6 md:px-10 max-w-6xl mx-auto">
            {/* Header / breadcrumb */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/80 mb-2">
                    Stocks • Deep Dive
                </p>
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-2">
                    {symbol} Stock Details
                </h1>
                <p className="text-sm md:text-base text-gray-300 max-w-2xl font-manrope">
                    Live snapshot of price, key metrics, and recent headlines for{" "}
                    {profile.name || symbol}.
                </p>
            </motion.div>

            {/* Error / loading */}
            {loading && (
                <div className="text-sm text-red-400 mt-8">{error}</div>
            )}

            {!loading && !error && data && (
                <>
                    {/* Top band: price card + metrics sidecard */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid gap-4 lg:grid-cols-3 mb-6"
                    >
                        {/* Left: main price + company info */}
                        <div className="lg:col-span-2 rounded-3xl border border-yellow-500/50 bg-gradient-to-br from-[#090910] via-[#12121f] to-[#050507] shadow-[0_0_40px_rgba(234,179,8,0.28)] p-5 md:p-6 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                    {profile.logo ? (
                                        <img
                                            src={profile.logo}
                                            alt={profile.name || symbol}
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 border border-yellow-500/40 object-contain p-1"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-yellow-500/50 to-yellow-300/10 border border-yellow-500/60 flex items-center justify-center font-orbitron text-sm">
                                            {symbol.slice(0, 3)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-400 uppercase tracking-[0.16em]">
                                            {profile.exchange || "Exchange"} •{" "}
                                            {profile.currency || "USD"}
                                        </p>
                                        <h2 className="text-2xl md:text-3xl font-semibold font-manrope">
                                            {profile.name || symbol}
                                        </h2>
                                        {profile.industry && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {profile.industry}
                                                {profile.country
                                                    ? ` • ${profile.country}`
                                                    : ""}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className="text-[0.7rem] px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 uppercase tracking-[0.16em]">
                                    Live
                                </span>
                            </div>

                            <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">
                                        Last price
                                    </p>
                                    <p className="text-3xl md:text-4xl font-semibold">
                                        {quote?.price != null
                                            ? `$${quote.price.toFixed(2)}`
                                            : "--"}
                                    </p>
                                    <p
                                        className={
                                            "text-sm mt-1 " +
                                            formatChangeClass(quote?.change)
                                        }
                                    >
                                        {quote?.change != null
                                            ? quote.change.toFixed(2)
                                            : "--"}{" "}
                                        {quote?.changePercent != null
                                            ? `(${quote.changePercent.toFixed(
                                                    2
                                                )})%`
                                            : ""}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs md:text-sm text-gray-300">
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                            High
                                        </p>
                                        <p className="mt-0.5">
                                            {quote?.high != null
                                                ? `$${quote.high.toFixed(2)}`
                                                : "--"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                            Low
                                        </p>
                                        <p className="mt-0.5">
                                            {quote?.low != null
                                                ? `$${quote.low.toFixed(2)}`
                                                : "--"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                            Open
                                        </p>
                                        <p className="mt-0.5">
                                            {quote?.open != null
                                                ? `$${quote.open.toFixed(2)}`
                                                : "--"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                            Prev. Close
                                        </p>
                                        <p className="mt-0.5">
                                            {quote?.previousClose != null
                                                ? `$${quote.previousClose.toFixed(
                                                        2
                                                    )}`
                                                : "--"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="mt-4 text-[0.7rem] text-gray-500">
                                Updated at{" "}
                                {quote?.timestamp
                                    ? new Date(
                                        quote.timestamp * 1000
                                        ).toLocaleString()
                                    : new Date(data.asOf).toLocaleString()}
                            </p>
                        </div>

                        {/* Right: key metrics card (Stock Deep Dive style) */}
                        <div className="rounded-3xl border border-yellow-500/40 bg-[#06060b] shadow-[0_0_30px_rgba(234,179,8,0.2)] p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                                    Key Metrics
                                </p>
                                <span className="text-[0.7rem] text-yellow-200 border border-yellow-500/40 rounded-full px-2 py-0.5">
                                    Snapshot
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs md:text-sm">
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                        Market Cap
                                    </p>
                                    <p className="mt-0.5">
                                        {formatNumber(profile.marketCap)}{" "}
                                        {profile.currency || ""}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                        P/E (TTM)
                                    </p>
                                    <p className="mt-0.5">
                                        {metrics.peTTM != null
                                            ? metrics.peTTM.toFixed(2)
                                            : "--"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                        EPS (TTM)
                                    </p>
                                    <p className="mt-0.5">
                                        {metrics.epsTTM != null
                                            ? metrics.epsTTM.toFixed(2)
                                            : "--"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                        ROE (TTM)
                                    </p>
                                    <p className="mt-0.5">
                                        {formatPercent(metrics.roeTTM)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                        52W Range
                                    </p>
                                    <p className="mt-0.5">
                                        {metrics.week52Low != null
                                            ? `$${metrics.week52Low.toFixed(2)}`
                                            : "--"}{" "}
                                        -{" "}
                                        {metrics.week52High != null
                                            ? `$${metrics.week52High.toFixed(2)}`
                                            : "--"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-500">
                                        52W Return
                                    </p>
                                    <p className="mt-0.5">
                                        {formatPercent(metrics.week52Return)}
                                    </p>
                                </div>
                            </div>

                            {profile.weburl && (
                                <a
                                    href={profile.weburl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 text-[0.75rem] text-yellow-200 hover:text-yellow-300 underline underline-offset-2"
                                >
                                    View company website ↗
                                </a>
                            )}
                        </div>
                    </motion.div>

                    {/* Chart card (full width, Trading View) */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        className="rounded-3xl border border-yellow-500/40 bg-[#050509] shadow-lg mb-6 p-3 md:p-4"
                    >
                        <div className="flex items-center justify-between mb-2 px-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                                Price Action
                            </p>
                            <p className="text-[0.7rem] text-gray-500">
                                Powered by TradingView
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-yellow-500/20 bg-[#020410]">
                            <TradingViewChart symbol={symbol} />
                        </div>
                    </motion.div>

                    {/* Bottom: fundamentals + news (two columns on desktop) */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        {/* Fundamentals / overview */}
                        <div className="rounded-2xl border border-yellow-500/40 bg-[#050509] p-5 shadow-lg">
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-2">
                            Fundamentals Snapshot
                        </p>
                        <p className="text-sm text-gray-300 font-manrope">
                            Obel will eventually plug in a richer
                            fundamentals feed here. For now, you get a clean
                            snapshot of market cap, valuation, and 52-week
                            range — enough context for a quick read without
                            leaving your dashboard.
                        </p>
                    </div>

                    {/* Latest headlines */}
                    <div className="rounded-2xl border border-yellow-500/40 bg-[#050509] p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                                Latest Headlines
                            </p>
                            <span className="text-[0.7rem] text-gray-500">
                                Past 7 days
                            </span>
                        </div>

                        {news.length === 0 && (
                            <p className="text-xs text-gray-500">
                                No recent headlines available for this
                                ticker.
                            </p>
                        )}

                        <div className="space-y-3">
                            {news.map((n) => (
                                <a
                                    key={n.id}
                                    href={n.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block rounded-xl border border-yellow-500/20 bg-black/40 px-3 py-2 hover:border-yellow-500/70 hover:bg-yellow-500/5 transition"
                                >
                                    <p className="text-sm font-semibold font-manrope mb-0.5">
                                        {n.headline}
                                    </p>
                                    <p className="text-[0.7rem] text-gray-400">
                                        {n.source} •{" "}
                                        {n.datetime
                                            ? new Date(
                                                    n.datetime * 1000   
                                                ).toLocaleString()
                                            : ""}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default StockDetailPage;