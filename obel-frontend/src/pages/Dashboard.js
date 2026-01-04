import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    FaChartLine,
    FaCloudSun,
    FaNewspaper,
    FaBolt,
    FaDatabase,
    FaPlayCircle,
    FaHome,
    FaCalendarAlt
} from "react-icons/fa";
import "../styles/obelMusicDashboard.css";
import { useNavigate } from "react-router-dom";
import { ChanceOfRainMock } from "../components/ChanceOfRainMock";
import { WorldMapMock } from "../components/WorldMapMock";
import { OtherLargeCitiesMock } from "../components/OtherLargeCitiesMock";


const quickStats = [
  {
    label: "Tracked Tickers",
    value: "12",
    subtitle: "Watchlist & portfolio",
    icon: <FaChartLine className="text-yellow-300" />,
  },
  {
    label: "Connected APIs",
    value: "6",
    subtitle: "Markets, news, weather...",
    icon: <FaDatabase className="text-cyan-300" />,
  },
  {
    label: "Saved Notes",
    value: "24",
    subtitle: "Research & ideas",
    icon: <FaNewspaper className="text-emerald-300" />,
  },
  {
    label: "Flows Run",
    value: "130",
    subtitle: "Automation & checks",
    icon: <FaBolt className="text-fuchsia-300" />,
  },
];


const quickLaunchFlows = [
    {
        key: "snapshot",
        title: "Daily Market Snapshot",
        tag: "Markets",
        status: "Ready",
        icon: <FaChartLine />,
    },
    {
        key: "deepDive",
        title: "Single Stock Deep Dive",
        tag: "Research",
        status: "Ready",
        icon: <FaDatabase />,
    },
    {
        key: "weatherBrief",
        title: "Weather + Events Brief",
        tag: "Lifestyle",
        status: "Ready",
        icon: <FaCloudSun />,
    },
];

const mockEvents = [
    {
        id: 1,
        title: "Finish UI dashboard draft",
        time: "9:00 - 10:30 AM",
        type: "Focus",
        color: "#4ade80",
    },
    {
        id: 2,
        title: "Market check-in",
        time: "11:00 - 11:30 AM",
        type: "Markets",
        color: "#60a5fa",
    },
    {
        id: 3,
        title: "Workout / walk",
        time: "6:30 - 7:30 PM",
        type: "Lifestyle",
        color: "#fbbf24",
    },
];

const mockWorkspaceTodoCards = [
    {
        id: "DES-54",
        title: "Design new dashboard widgets",
        tag: "UI Design",
        priority: "Medium Priority",
        date: "Nov 12",
        assignee: "SL",
        aiSuggestion: "Link the 'Analytics API' doc for the data source context.",
    },
    {
        id: "DEV-201",
        title: "Refactor user authentication flow",
        tag: "Backend",
        priority: "Low Priority",
        date: "Nov 10",
        assignee: "A"
    },
];


const Dashboard = () => {
    const username = "jonathan";

    const [activeView, setActiveView] = useState("dashboard"); // "dashboard" / "weather" / "calendar"

    // ▶ Daily Market Snapshot drawer state
    const [snapshotOpen, setSnapshotOpen] = useState(false);
    const [snapshotLoading, setSnapshotLoading] = useState(false);
    const [snapshotData, setSnapshotData] = useState(null);
    const [snapshotError, setSnapshotError] = useState("");

    const [deepDiveOpen, setDeepDiveOpen] = useState(false);
    const [deepDiveLoading, setDeepDiveLoading] = useState(false);
    const [deepDiveData, setDeepDiveData] = useState(null);
    const [deepDiveError, setDeepDiveError] = useState("");

    const [weatherBriefOpen, setWeatherBriefOpen] = useState(false);
    const [weatherBriefLoading, setWeatherBriefLoading] = useState(false);
    const [weatherBriefData, setWeatherBriefData] = useState(null);
    const [weatherBriefError, setWeatherBriefError] = useState("");

    const [weatherDashboardOpen, setWeatherDashboardOpen] = useState(false);

    const navigate = useNavigate();

    const [calendarPlannerOpen, setCalendarPlannerOpen] = useState(false);

    const [now, setNow] = useState(new Date());

    const [activity, setActivity] = useState([
        {
            time: "Earlier",
            title: "Weather + Events Brief",
            detail: "Checked Cleveland forecast and NBA slate.",
            type: "Lifestyle",
        },
        {
            time: "Earlier",
            title: "Single Stock Deep Dive",
            detail: "Viewed fundamentals and headlines on AAPL.",
            type: "Research",
        },
    ]);


    // ---------------------- weather ----------------------------------------------- //
    const [weather, setWeather] = useState({
        tempF: null,
        city: "Cleveland",
        loading: true,
        error: null,
        summary: "",
        feelsLikeF: null,
        humidity: null,
        windSpeed: null,
        pressureMb: null,
        sunrise: null,
        sunset: null,
        condition: null,
        iconCode: null,
    });

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch("api/weather/today");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.error || "Weather request failed");
                }

                setWeather({
                    tempF: data.tempF,
                    feelsLikeF: data.feelsLikeF,
                    humidity: data.humidity,
                    windSpeed: data.windSpeed,
                    pressureMb: data.pressureMb,
                    sunrise: data.sunrise,
                    sunset: data.sunset,
                    city: data.city || "Cleveland",
                    loading: false,
                    error: null,
                    summary: data.summary || "",
                    condition: data.condition || data.summary || null,
                    iconCode: data.iconCode || null,
                });
            } catch (err) {
                console.error("❌ Weather fetch error:", err);
                setWeather((prev) => ({
                    ...prev,
                    loading: false,
                    error: "Weather unavailable",
                }));
            }
        };

        fetchWeather();
    }, []);

    // ---- Portfolio snapshot -----------
    const portfolio = useMemo(() => {
        const netWorth = 5228.85;
        const goal = 50000;
        const pct = goal > 0 ? (netWorth / goal) * 100 : 0;
        const remaining = Math.max(goal - netWorth, 0);

        return {
            netWorth,
            goal,
            pct,
            remaining,
        };
    }, []);

    // ------------------------- To-Do tasks from Workspace ---------------------------- //
    const [todoTasks, setTodoTasks] = useState([]);

    useEffect(() => {
        const loadTodoTasks = () => {
            try {
                const raw = localStorage.getItem("obel-workspace-board");
                
                if (!raw) {
                    setTodoTasks(mockWorkspaceTodoCards);
                    return;
                };

                const board = JSON.parse(raw);

                const todoColumn =
                    board.columns?.find(
                        (c) =>
                            c.id === "todo" ||
                            c.title?.toLowerCase?.().includes("to do") ||
                            c.title?.toLowerCase?.().includes("todo")
                    ) || board.columns?.[0];
                
                const cards = todoColumn?.cards || todoColumn?.tasks || [];

                // fallback if structure exists but has no cards (or wrong shape)
                if (!Array.isArray(cards) || cards.length === 0) {
                    setTodoTasks(mockWorkspaceTodoCards);
                    return;
                }

                setTodoTasks(cards.slice(0, 5));
            } catch (err) {
                console.error("Could not parse workspace tasks:", err);
                setTodoTasks(mockWorkspaceTodoCards);
            }
        };

        loadTodoTasks();
        // re-check whenever user changes something in workspace (optional: listen to storage events)
    }, []);

    // ------------------- Motivational quote -------------------------- //
    const [quote, setQuote] = useState({ text: "", author: "" });
    const [quoteBgUrl, setQuoteBgUrl] = useState(
        `https://picsum.photos/700/500?random=${Date.now()}`
    );

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const res = await fetch("api/quotes/random");
                const data = await res.json();

                if (!res.ok) throw new Error(data?.error || "Quote request failed");

                setQuote({ text: data.text, author: data.author });
                // refresh background too (avoid caching)
                setQuoteBgUrl(`https://picsum.photos/700/500?random=${Date.now()}`);
            } catch (err) {
                console.error("Quote fetch failed:", err);
            }
        };

        fetchQuote();
        const id = setInterval(fetchQuote, 60_000); // every 60s 
        return () => clearInterval(id);
    }, []);


    // ---------------- helpers ------------------------- //
    const logActivity = (type, title, detail) => {
        setActivity(prev => [
            {
                time: "Just now",
                title,
                detail,
                type,     
            },
            ...prev,
        ].slice(0, 6));   // keep latest 6 items
    };

    const handleRunSnapshot = async () => {
        setSnapshotOpen(true);
        setSnapshotLoading(true);
        setSnapshotError("");
        try {
            const res = await fetch("http://localhost:5000/api/flows/daily-market");
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const data = await res.json();
            setSnapshotData(data);
            logActivity(
                "Markets",
                "Ran Daily Market Snapshot",
                "Pulled SPY / QQQ and top movers."
            );
        } catch (err) {
            console.error("❌ snapshot fetch error:", err);
            setSnapshotError("Could not load market snapshot. Try again in a minute.");
        } finally {
            setSnapshotLoading(false);
        }
    };

    const closeSnapshot = () => {
        setSnapshotOpen(false);
        setSnapshotData(null);
        setSnapshotError("");
    };

    
    const handleWeatherBrief = async () => {
        setWeatherBriefOpen(true);
        setWeatherBriefLoading(true);
        setWeatherBriefError("");
        try {
            const res = await fetch("http://localhost:5000/api/flows/weather-brief");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            setWeatherBriefData(data);
            logActivity(
                "Lifestyle",
                "Weather + Events Brief",
                `Checked conditions in ${data.city || "your city"}.`
            );
        } catch (err) {
            console.error("❌ weather-brief fetch error:", err);
            setWeatherBriefError("Could not load weather brief. Try again in a bit.");
        } finally {
            setWeatherBriefLoading(false);
        }
    };

    const closeWeatherBrief = () => {
        setWeatherBriefOpen(false);
        setWeatherBriefData(null);
        setWeatherBriefError("");
    };

    const handleRunDeepDive = async () => {
        setDeepDiveOpen(true);
        setDeepDiveLoading(true);
        setDeepDiveError("");
        try {
            const res = await fetch(
                "http://localhost:5000/api/flows/stock-deep-dive?symbol=AAPL"
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setDeepDiveData(data);
            logActivity(
                "Research",
                `Single Stock Deep Dive — ${data.symbol}`,
                `Loaded quote, overview and headlines for ${data.symbol}.`
            );
        } catch (err) {
            console.error("❌ deep-dive fetch error:", err);
            setDeepDiveError("Could not load stock deep dive. Try again soon.");
        } finally {
            setDeepDiveLoading(false);
        }
    };

    const closeDeepDive = () => {
        setDeepDiveOpen(false);
        setDeepDiveData(null);
        setDeepDiveError("");
    };

    const formatChangeClass = (change) => {
        if (typeof change === "number") {
            return change >= 0 ? "text-emerald-300" : "text-red-400";
        }
        if (typeof change === "string" && change.trim().startsWith("-")) {
            return "text-red-400";
        }
        return "text-emerald-300";
    };

    const formatMarketCap = (value) => {
        if (!value) return "—";
        const n = Number(value);
        if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
        if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
        if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
        return n.toLocaleString();
    };

    const weatherIconUrl = useMemo(() => {
        if (!weather.iconCode) return null;
        return `https://openweathermap.org/img/wn/${weather.iconCode}@4x.png`;
    }, [weather.iconCode]);

    // choose a simple icon based on temp
    const bigWeatherEmoji = useMemo(() => {
        if (weather.error) return "⚠️";
        if (weather.tempF === null) return "...";

        const cond = (weather.condition || "").toLowerCase();

        if (cond.includes("thunder")) return "⛈️";
        if (cond.includes("snow")) return "❄️";
        if (cond.includes("rain") || cond.includes("shower")) return "🌧️";
        if (cond.includes("cloud")) return "☁️";
        if (cond.includes("clear")) return "☀️";
        if (cond.includes("fog") || cond.includes("mist") || cond.includes("haze")) return "🌫️";

        if (weather.tempF >= 80) return "☀️";
        if (weather.tempF >= 60) return "🌤️";
        if (weather.tempF >= 40) return "☁️";
        return "❄️";
    }, [weather.error, weather.tempF, weather.condition]);

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000); // update every minute
        return () => clearInterval(id);
    }, []);

    const dayName = useMemo(
        () => now.toLocaleDateString(undefined, { weekday: "long" }),
        [now]
    );

    const timeString = useMemo(
        () => 
            now.toLocaleTimeString(undefined, { 
                hour: "numeric", 
                minute: "2-digit", 
            }),
        [now]
    );


    // -------------------- small components --------------- //
    const renderDashboardMain = () => (
        <section className="content">
            {/* LEFT CONTENT (slider + flows + quotes ) */}
            <div className="left-content">
                {/* Hero: quick stats + Run Snapshot button in Obel style */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 rounded-3xl border border-yellow-300/40 bg-gradient-to-r from-black via-[#161521] to-black shadow-[0_0_40px_rgba(234,179,8,0.3)] p-5"
                >
                    <div className="grid gap-4 md:grid-cols-[1.4fr,1fr] items-stretch">
                        <div>
                            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-yellow-300/80 mb-1">
                                Obel Command Center
                            </p>
                            <h1 className="font-orbitron text-2xl md:text-3xl font-bold">
                                Welcome back, <span className="text-yellow-300">{username}</span>
                            </h1>
                            <p className="text-xs md:text-sm text-gray-300 mt-2 max-w-lg">
                                This is your hub for markets, flows, and focus. Launch your snapshot,
                                glance at your to-dos, and let the weather + calendar keep you on track.
                            </p>
                            <button
                                onClick={handleRunSnapshot}
                                className="mt-4 inline-flex items-center gap-2 rounded-full bg-yellow-400 text-black px-4 py-2 text-xs font-semibold shadow-[0_0_20px_rgba(234,179,8,0.45)] hover:bg-yellow-300 transition"
                            >
                                <FaPlayCircle />
                                Run Daily Market Snapshot
                            </button>
                        </div>

                        {/* Right: Portfolio snapshot */}
                        <div className="rounded-2xl border border-yellow-500/30 bg-black/35 p-4 shadow-[0_0_30px_rgba(234,179,8,0.12)]">
                            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-yellow-200/80">
                                Portfolio Snapshot
                            </p>

                            <div className="mt-3 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-[0.65rem] text-gray-400">Net Worth</p>
                                    <p className="text-3xl font-semibold text-white">
                                        ${portfolio.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[0.65rem] text-gray-400">Goal</p>
                                    <p className="text-lg font-semibold text-yellow-200">
                                        ${portfolio.goal.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between text-[0.7rem] text-gray-300 mb-1">
                                    <span>{portfolio.pct.toFixed(1)}% of goal</span>
                                    <span className="text-gray-400">
                                        ${portfolio.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })} left
                                    </span>
                                </div>

                                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-yellow-400 shadow-[0_0_18px_rgba(234,179,8,0.45)]"
                                        style={{ width: `${Math.min(portfolio.pct, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* To-Dos Section */}
                <div className="slider-container">
                    <h1>Today's To-Dos</h1>
                    <TodoGallery tasks={todoTasks} navigate={navigate} />
                </div>
            </div>

            {/* Right content - Weather tile + mini calendar + recent activity */}
            <div className="right-content flex flex-col gap-6">
                {/* Big weather tile */}
                <div className="recommended-songs">
                    <div 
                        role="button"
                        tabIndex={0}
                        onClick={() => setWeatherDashboardOpen(true)}
                        onKeyDown={(e) => e.key === "Enter" && setWeatherDashboardOpen(true)}
                        className="rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#141933] via-[#101427] to-[#050713] shadow-[0_0_35px_rgba(0,0,0,0.65)]
                                    cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_0_55px_rgba(26,214,205,0.90)]"
                    >
                        {/* Header: day + time + button */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white/5">
                            <div className="flex flex-col">
                                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-300">
                                    Today's Weather
                                </span>
                                <span className="text-sm font-semibold text-white">{dayName}</span>
                            </div>
                            
                            <span className="text-base text-gray-200">{timeString}</span>
                        </div>

                        {/* Main content */}
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between gap-4">
                                {/* Left: temp + city */ }
                                <div>
                                    <p className="text-4xl font-bold text-white leading-tight">
                                            {weather.loading
                                            ? "..."
                                            : weather.tempF != null
                                            ? `${Math.round(weather.tempF)}°F`
                                            : "N/A"}
                                </p>
                                <p className="mt-1 text-sm text-gray-200">
                                    {weather.error  ? "Unavailable" : weather.city || "Your city"}
                                </p>
                                {weather.summary && (
                                    <p className="mt-2 text-[0.75rem] text-gray-300 max-w-xs">
                                        {weather.summary}
                                    </p>
                                )}
                            </div>
                            
                            {/* Right: icon bubble */}
                            <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/50 via-amber-300/40 to-orange-400/30 w-24 h-24 shadow-[0_0_25px_rgba(250,204,21,0.45)]">
                                {weatherIconUrl ? (
                                    <img
                                        src={weatherIconUrl}
                                        alt={weather.summary || weather.condition || "Weather icon"}
                                        className="w-16 h-16 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                                    />
                                ) : (
                                    <span className="text-5xl">{bigWeatherEmoji}</span>
                                )}
                            </div>
                        </div>

                        {/* Details grid */}
                        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-[0.75rem] text-gray-200">
                            {weather.feelsLikeF != null && (
                                <>
                                    <span className="text-gray-400">Real feel</span>
                                    <span className="text-right">
                                        {Math.round(weather.feelsLikeF)}°F
                                    </span>
                                </>
                            )}

                            {weather.windSpeed != null && (
                                <>
                                    <span className="text-gray-400">Wind</span>
                                    <span className="text-right">
                                        {weather.windSpeed} mph
                                    </span>
                                </>
                            )}

                            {weather.pressureMb != null && (
                                <>
                                    <span className="text-greay-400">Pressure</span>
                                    <span className="text-right">
                                        {weather.pressureMb} mb
                                    </span>
                                </>
                            )}

                            {weather.humidity != null && (
                                <>
                                    <span className="text-gray-400">Humidity</span>
                                    <span className="text-right">
                                        {weather.humidity}%
                                    </span>
                                </>
                            )}

                            {weather.sunrise && (
                                <>
                                    <span className="text-gray-400">Sunrise</span>
                                    <span className="text-right">
                                        {weather.sunrise}
                                    </span>
                                </>
                            )}

                            {weather.sunset && (
                                <>
                                    <span className="text-gray-400">Sunset</span>
                                    <span className="text-right">
                                        {weather.sunset}
                                    </span>
                                </>
                            )}
                        </div>         
                    </div>
                </div>

                {/* Bottom : mini calendar widget */}
                <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => setCalendarPlannerOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && setCalendarPlannerOpen(true)}
                    className="music-player obel-calendar-widget cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                >
                    <div className="flex items-center justify-between mb-2 w-full">
                        <h2 className="text-sm font-semibold text-gray-100">Calendar</h2>
                    </div>
                    <MiniCalendar />
                </div>
                </div>

                {/* Motivational Quote widget */}
                <div className="quote-widget">
                    <div
                        className="quote-card"
                        style={{ backgroundImage: `url(${quoteBgUrl})`}}
                    >
                        <div className="quote-overlay">
                            <p className="quote-text">“{quote.text || "Loading..."}”</p>
                            <p className="quote-author">{quote.author ? `— ${quote.author}` : ""}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );

    const renderWeatherView = () => (
        <div className="weatherModalGrid">
            {/* TOP ROW */}
            <div className="weatherTopLeft">
                <div className="todayAndDays">
                    <div className="todayCard">
                        <div className="todayMeta">TODAY</div>
                        <div className="todayTemp">
                            {weather.tempF != null ? `${Math.round(weather.tempF)}°F` : "--"}
                        </div>
                        <div className="todayCity">{weather.city}</div>
                        <div className="todayEmoji">{bigWeatherEmoji}</div>
                    </div>

                    <div className="daysStrip">
                        <div className="daysTitle">NEXT 7 DAYS </div>
                        <div className="daysRow">
                            {["Mon","Tue", "Wed", "Thu","Fri","Sat","Sun"].map((d,i)=>(
                                <div key={d} className="dayCard">
                                    <div className="dayName">{d}</div>
                                    <div className="dayTemp">{60+i}°</div>
                                    <div className="dayIcon">{i%3===0?"☀️":i%3===1?"🌤️":"🌧️"}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chance of rain chart  */}
            <div className="weatherTopRight">
                <ChanceOfRainMock />
            </div>
                    
            {/* Bottom row */}
            <div className="weatherBottomLeft">
                <WorldMapMock />
            </div>
            
            <div className="weatherBottomRight">
                <OtherLargeCitiesMock />
            </div> 
        </div>
    );

    const renderCalendarView = () => (
        <div className="calendarModalPanel">
            <section className="content">
                <div className="left-content">
                    <h1>Calendar planner</h1>
                    <div className="mt-4 rounded-2xl border border-slate-500/80 bg-black/60 p-4">
                        <MiniCalendar large />
                    </div>
                </div>
                <div className="right-contetn">
                    <div className="recommended-songs">
                        <h1>Today's events</h1>
                        <div className="song-container">
                            {mockEvents.map((ev) => (
                                <div key={ev.id} className="song">
                                    <div
                                        className="song-img"
                                        style={{
                                            backgroundColor: ev.color,
                                            borderRadius: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.3rem",
                                        }}
                                    >
                                        📌
                                    </div>
                                    <div className="song-title">
                                        <h2>{ev.title}</h2>
                                        <p>{ev.type}</p>
                                    </div>
                                    <span>{ev.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="music-player">
                        <p className="text-xs text-center text-gray-100">
                            Future: open event detail panel here
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );

    return (
        <div className="obel-music-shell min-h-screen text-white">
            {/* main grid */}
            <main className="obel-main">
                {/* Right side views */}
                <div className="obel-main-full">
                    {activeView === "dashboard" && renderDashboardMain()}
                    {activeView === "calendar" && renderCalendarView()}
                </div>
            </main>

            {/* Daily Market Snapshot Drawer */}
            {snapshotOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={closeSnapshot}
                    />
                    {/* panel */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative z-50 w-full max-w-5xl mx-auto rounded-3xl border border-yellow-500/40 bg-[#050509] p-5 md:p-6 shadow-[0_-10px_40px_rgba(234,179,8,0.45)] max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-manrope text-lg md:text-xl font-semibold">
                                    Daily Market Snapshot
                                </h3>
                                {snapshotData?.asOf && (
                                    <p className="text-xs text-gray-400">
                                        As of{" "}
                                        {new Date(snapshotData.asOf).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeSnapshot}
                                className="text-xs uppercase tracking-[0.16em] text-gray-400 hover:text-yellow-200"
                            >
                                Close
                            </button>
                        </div>

                        {snapshotLoading && (
                            <div className="py-10 text-center text-sm text-gray-400">
                                Fetching today's movers and indices...
                            </div>
                        )}

                        {!snapshotLoading && snapshotError && (
                            <div className="py-6 text-sm text-red-400">
                                {snapshotError}
                            </div>
                        )}

                        {!snapshotLoading && !snapshotError && snapshotData && (
                            <>
                                {/* Indices row */}
                                {snapshotData.indices?.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                        {snapshotData.indices.map((idx) => (
                                            <div
                                                key={idx.symbol}
                                                className="rounded-xl border border-yellow-500/30 bg-black/40 px-4 py-3 flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Index Proxy
                                                    </p>
                                                    <p className="text-base font-semibold">
                                                        {idx.symbol}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold">
                                                        ${idx.price.toFixed(2)}
                                                    </p>
                                                    <p
                                                        className={
                                                            "text-xs " +
                                                            formatChangeClass(
                                                                idx.change
                                                            )
                                                        }
                                                    >
                                                        {idx.change.toFixed(2)} (
                                                            {idx.changePercent}
                                                        )
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Movers */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    {/* Gainers */}
                                    <div>
                                        <p className="mb-2 text-[0.75rem] uppercase tracking-[0.16em] text-emerald-300">
                                            Top Gainers
                                        </p>
                                        <div className="space-y-1.5">
                                            {snapshotData.movers?.gainers?.map((m) => (
                                                <div
                                                    key={m.ticker}
                                                    className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-black/40 px-3 py-1.5"
                                                >
                                                    <span className="font-medium">
                                                        {m.ticker}
                                                    </span>
                                                    <div className="text-right">
                                                        <p className="text-[0.7rem]">
                                                            ${parseFloat(m.price).toFixed(2)}
                                                        </p>
                                                        <p className="text-[0.65rem] text-emerald-300">
                                                            {parseFloat(
                                                                m.change_percentage
                                                            ).toFixed(2)}
                                                            %
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Losers */}
                                    <div>
                                        <p className="mb-2 text-[0.75rem] uppercase tracking-[0.16em] text-red-400">
                                            Top Losers
                                        </p>
                                        <div className="space-y-1.5">
                                            {snapshotData.movers?.losers?.map((m) => (
                                                <div
                                                    key={m.ticker}
                                                    className="flex items-center justify-between rounded-lg border border-red-500/25 bg-black/40 px-3 py-1.5"
                                                >
                                                    <span className="font-medium">
                                                        {m.ticker}
                                                    </span>
                                                    <div className="text-right">
                                                        <p className="text-[0.7rem]">
                                                            ${parseFloat(m.price).toFixed(2)}
                                                        </p>
                                                        <p className="text-[0.65rem] text-red-400">
                                                            {parseFloat(
                                                                m.change_percentage
                                                            ).toFixed(2)}
                                                            %
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Most Active */}
                                    <div>
                                        <p className="mb-2 text-[0.75rem] uppercase tracking-[0.16em] text-yellow-200">
                                            Most Active
                                        </p>
                                        <div className="space-y-1.5">
                                            {snapshotData.movers?.actives?.map((m) => (
                                                <div
                                                    key={m.ticker}
                                                    className="flex items-center justify-between rounded-lg border border-yellow-500/25 bg-black/40 px-3 py-1.5"
                                                >
                                                    <span className="font-medium">
                                                        {m.ticker}
                                                    </span>
                                                    <div className="text-right">
                                                        <p className="text-[0.7rem]">
                                                            ${parseFloat(m.price).toFixed(2)}
                                                        </p>
                                                        <p 
                                                            className={
                                                                "text-[0.65rem] " +
                                                                formatChangeClass(
                                                                    parseFloat(
                                                                        m.change_percentage
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            {parseFloat(
                                                                m.change_percentage
                                                            ).toFixed(2)}
                                                            %
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )} 

            {/* 🔻 Single Stock Deep Dive Drawer */}
            {deepDiveOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black/60" onClick={closeDeepDive} />

                    {/* panel */}
                    <motion.div
                        initial={{ y: "20%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="relative z-50 w-full max-w-5xl mx-auto rounded-3xl border border-yellow-500/40 bg-[#050509] p-5 md:p-6 shadow-[0_0_40px_rgba(234,179,8,0.45)]"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-manrope text-lg md:text-xl font-semibold">
                                    Single Stock Deep Dive{" "}
                                    {deepDiveData?.symbol ? `— ${deepDiveData.symbol}` : ""}
                                </h3>
                                {deepDiveData?.quote?.price && (
                                    <p className="text-xs text-gray-400">
                                        Live quote powered by Alpha Vantage
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeDeepDive}
                                className="text-xs uppercase tracking-[0.16em] text-gray-400 hover:text-yellow-200"
                            >
                                Close
                            </button>
                        </div>

                        {deepDiveLoading && (
                            <div className="py-10 text-center text-sm text-gray-400">
                                Running deep dive on AAPL...
                            </div>
                        )}

                        {!deepDiveLoading && deepDiveError && (
                            <div className="py-6 text-sm text-red-400">{deepDiveError}</div>
                        )}

                        {!deepDiveLoading && !deepDiveError && deepDiveData && (
                            <div className="grid gap-5 md:grid-cols-3 text-sm">
                                {/* Overview */}
                                <div className="md:col-span-2 space-y-2">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                                        Company Overview
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {deepDiveData.overview?.name || deepDiveData.symbol}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {deepDiveData.overview?.sector} •{" "}
                                        {deepDiveData.overview?.industry}
                                    </p>
                                    {deepDiveData.overview?.description && (
                                        <p className="mt-2 text-xs text-gray-300 leading-relaxed max-h-32 overflow-y-auto">
                                            {deepDiveData.overview.description}
                                        </p>
                                    )}
                                </div>

                                {/* Key Metrics */}
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400">
                                        Key Metrics
                                    </p>
                                    <div className="rounded-xl border border-yellow-500/30 bg-black/40 px-4 py-3 space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>Price</span>
                                            <span className="font-semibold">
                                                $
                                                {deepDiveData.quote?.price
                                                    ? deepDiveData.quote.price.toFixed(2)
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Change</span>
                                            <span
                                                className={
                                                    "font-semibold " +
                                                    formatChangeClass(
                                                        deepDiveData.quote?.change || 0
                                                    )
                                                }
                                            >
                                                {deepDiveData.quote?.change?.toFixed(2) ?? "—"} (
                                                {deepDiveData.quote?.changePercent ?? "—"})
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Market Cap</span>
                                            <span className="font-semibold">
                                                {formatMarketCap(
                                                    deepDiveData.overview?.marketCap
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>PE Ratio</span>
                                            <span>
                                                {deepDiveData.overview?.peRatio
                                                    ? deepDiveData.overview.peRatio.toFixed(2)
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span>Dividend Yield</span>
                                            <span>
                                                {deepDiveData.overview?.dividendYield
                                                    ? (deepDiveData.overview.dividendYield *
                                                            100
                                                        ).toFixed(2) + "%"
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* News */}
                                <div className="md:col-span-3 mt-4">
                                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 mb-2">
                                        Latest Headlines
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {deepDiveData.news?.length ? (
                                            deepDiveData.news.map((n) => (
                                                <a
                                                    key={n.id}
                                                    href={n.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block rounded-lg border border-yellow-500/20 bg-black/40 px-3 py-2 hover:border-yellow-400/70 hover:bg-yellow-400/5 transition"
                                                >
                                                    <p className="text-xs font-semibold">
                                                        {n.title}
                                                    </p>
                                                    <p className="text-[0.65rem] text-gray-400 mt-1">
                                                        {n.source} •{" "}
                                                        {n.publishedAt?.slice(0, 8)}
                                                    </p>
                                                </a>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500">
                                                No recent headlines available.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}  

            {weatherDashboardOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setWeatherDashboardOpen(false)}
                    />

                    {/* panel */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut"}}
                        className="weatherModalPanel relative z-50 mx-auto rounded-3xl border border-yellow-500/40 bg-[#050509] p-5 md:p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-manrope text-lg md:text-xl font-semibold">
                                    Weather Dashboard
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Full view of today and the next few days.
                                </p>
                            </div>
                            <button
                                onClick={() => setWeatherDashboardOpen(false)}
                                className="text-xs uppercase tracking-[0.16em] text-gray-400 hover:text-yellow-200"
                            >
                                Close
                            </button>
                        </div>

                        {renderWeatherView()}
                    </motion.div>
                </div>
            )}

            {/*  Weather modal overlay  */}
            {weatherBriefOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={closeWeatherBrief}
                    />
                    <motion.div
                        initial={{ scale:0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="weatherModalPanel relative z-50 mx-auto rounded-3xl border border-yellow-500/40 bg-[#050509] p-5 md:p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)]"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-manrope text-lg md:text-xl font-semibold">
                                    Weather Dashboard
                                </h3>
                                {weatherBriefData?.asOf && (
                                    <p className="text-xs text-gray-400">
                                        As of{" "}
                                        {new Date(weatherBriefData.asOf).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={closeWeatherBrief}
                                className="text-xs uppercase tracking-[0.16em] text-gray-400 hover:text-yellow-200"
                            >
                                Close
                            </button>
                        </div>

                        {weatherBriefLoading && (
                            <div className="py-6 text-sm text-gray-400">
                                Checking today's weather...
                            </div>
                        )}

                        {!weatherBriefLoading && weatherBriefError && (
                            <div className="py-6 text-sm text-red-400">
                                {weatherBriefError}
                            </div>
                        )}

                        {!weatherBriefLoading &&
                            !weatherBriefError &&
                            weatherBriefData && (
                                <>
                                    {/* Current conditions card */}
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-yellow-500/30 bg-black/40 px-4 py-4 mb-5 gap-3">
                                        <div>
                                            <p className="text-[0.7rem] text-gray-400 uppercase tracking-[0.16em] mb-1">
                                                Current Weather
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {weatherBriefData.city}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {weatherBriefData.summary}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaCloudSun className="text-yellow-300 text-3xl" />
                                            <p className="text-4xl font-bold text-yellow-200">
                                                {Math.round(weatherBriefData.tempF)}°F
                                            </p>
                                        </div>
                                    </div>

                                    {/* Optional multi-day forecase if backend ever returns it */}
                                    {Array.isArray(
                                        weatherBriefData.forecast
                                    ) && 
                                        weatherBriefData.forecast.length >
                                            0 && (
                                                <div className="mb-5">
                                                    <p className="text-[0.75rem] uppercase tracking-[0.16em] text-gray-400 mb-2">
                                                        Next Days
                                                    </p>
                                                    <div className="flex gap-3 overflow-x-auto pb-1">
                                                        {weatherBriefData.forecast.map(
                                                            (day) => (
                                                                <div
                                                                    key={
                                                                        day.date
                                                                    }
                                                                    className="min-w-[80px] rounded-xl border border-yellow-500/25 bg-black/40 px-3 py-3 text-center text-xs"
                                                                >
                                                                    <p className="text-gray-300 mb-1">
                                                                        {
                                                                            day.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-lg font-semibold text-yellow-200">
                                                                        {
                                                                            day.tempF
                                                                        }
                                                                        °F
                                                                    </p>
                                                                    <p className="text-[0.65rem] text-gray-400 mt-1">
                                                                        {
                                                                            day.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    <div>
                                        <p className="text-[0.75rem] uppercase tracking-[0.16em] text-gray-400 mb-2">
                                            Today's Events
                                        </p>
                                        {weatherBriefData.events &&
                                        weatherBriefData.events.length > 0 ? (
                                            <ul className="space-y-2 text-xs">
                                                {weatherBriefData.events.map((ev) => (
                                                    <li
                                                        key={ev.id}
                                                        className="rounded-lg border border-yellow-500/25 bg-black/40 px-3 py-2"
                                                    >
                                                        <p className="font-semibold">
                                                            {ev.title}
                                                        </p>
                                                        {ev.time && (
                                                            <p className="text-[0.65rem] text-gray-400 mt-0.5">
                                                                {ev.time}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-yellow-500/25 bg-black/20 px-3 py-3 text-[0.7rem] text-gray-400">
                                                Sports schedules & local events will show
                                                up here in a future vision.
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                    </motion.div>
                </div>
            )}

            {calendarPlannerOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    {/* backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setCalendarPlannerOpen(false)}
                    />

                    {/* panel */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="calendarModalPanel relative z-50 w-full max-w-4xl mx-auto rounded-3xl border border-yellow-500/40 bg-[#050509] p-5 md:p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)] max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-manrope text-lg md:text-xl font-semibold">
                                    Calendar Planner
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Full month view and upcoming events.
                                </p>
                            </div>
                            <button
                                onClick={() => setCalendarPlannerOpen(false)}
                                className="text-xs uppercase tracking-[0.16em] text-gray-400 hover:text-yellow-200"
                            >
                                Close
                            </button>
                        </div>

                        <div className="rounded-2xl border border-slate-500/80 bg-black/60 p-4">
                            <MiniCalendar large />
                        </div>

                        {/* show events list inside modal */}
                        <div className="mt-4 rounded-2xl border border-slate-600 bg-black/50 p-4">
                            <p className="text-[0.75rem] uppercase tracking-[0.16em] text-gray-400 mb-2">
                                Today's events
                            </p>
                            <div className="space-y-2">
                                {mockEvents.map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-600 bg-black/50 px-3 py-2 text-xs"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                style={{ backgroundColor: ev.color }}
                                                className="h-8 w-8 rounded-lg flex items-center justify-center"
                                            >
                                                📌
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{ev.title}</p>
                                                <p className="text-[0.65rem] text-gray-400">{ev.type}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-300">{ev.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};


// mini calendar component (used twice)
const MiniCalendar = ({ large }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleString("default", { month: "long" });

    const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
    const startDay = new Date(year, today.getMonth(), 1).getDay(); // 0-6

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="w-full text-gray-100 text-xs">
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-gray-300">
                {month} {year}
            </p>
            <div className="mt-2 grid grid-cols-7 gap-1 text-[0.6rem] text-gray-400">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="text-center">
                        {d}
                    </div>
                ))}
            </div>
            <div
                className={`mt-1 grid grid-cols-7 gap-1 ${
                    large ? "text-sm py-1" : "text-[0.65rem]"
                }`}
            >
                {cells.map((d, i) => {
                    const isToday = d === today.getDate();
                    return (
                        <div
                            key={i}
                            className={`flex items-center justify-center rounded-md ${
                                d
                                    ? isToday
                                        ? "bg-yellow-400 text-black font-semibold"
                                        : "bg-black/40 border border-slate-700/70"
                                    : ""
                            } ${large ? "h-8" : "h-6"}`}
                        >
                            {d || ""}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TodoGallery = ({ tasks = [] }) => {
    const wrapRef = React.useRef(null);
    const navigate = useNavigate();
    

    // Use your real tasks if present, otherwise demo cards
    const items =
        tasks.length > 0
            ? tasks
            : [
                { 
                    id: "DES-54", 
                    title: "Design new dashboard widgets",
                    tag: "UI Design",
                    priority: "Medium Priority",
                    date: "Nov 12",
                    assignee: "SL",
                    aiSuggestion: "Link the 'Analytics API' doc for the data source context.",
                },
                { 
                    id: "DEV-201", 
                    title: "Refactor user authentication flow",
                    tag: "Backend",
                    priority: "Low Priority",
                    date: "Nov 10",
                    assignee: "A",
                 },
            ];

        const priorityClass = (p = "") => {
            const v = p.toLowerCase();
            if (v.includes("low")) return "priority-pill priority-low"; // green
            if (v.includes("medium")) return "priority-pill priority-med"; // yellow
            if (v.includes("high")) return "priority-pill priority-high"; // red
            return "priority-pill";
        };

        const assigneeClass = (a = "") => {
            if (a === "SL") return "assignee-badge assignee-sl"; // orange 
            if (a === "A") return "assignee-badge assignee-a"; // yellow
            return "assignee-badge";
        };

    React.useEffect(() => {
        if (!wrapRef.current) return;

        function split(str) {
            const array = str.split(",");
            array[0] = parseFloat(array[0]);
            array[1] = parseFloat(array[1]);
            return array;
        }

        function animEnd(elem) {
            elem.classList.remove("active");
            // force reflow
            // eslint-disable-next-line no-unused-expressions
            elem.offsetWidth;
        }

        function animStart(evt) {
            const elem = evt.currentTarget;
            if (elem.classList && elem.classList.contains("active") === false) {
                elem.classList.add("active");

                const durations = split(
                    window.getComputedStyle(elem).getPropertyValue("animation-duration")
                );
                const delays = split(
                    window.getComputedStyle(elem).getPropertyValue("animation-delay")
                );

                const time = (delays[1] + durations[1]) * 1000;
                window.setTimeout(() => animEnd(elem), time);
            }
        }

        const figures = wrapRef.current.querySelectorAll("#gallery figure");

        figures.forEach((item) => {
            item.addEventListener("pointerenter", animStart);
            item.addEventListener("pointerdown", animStart);
            item.addEventListener("pointermove", animStart);

            item.style.backgroundBlendMode = "multiply";
        });

        // cleanup
        return () => {
            figures.forEach((item) => {
                item.removeEventListener("pointerenter", animStart);
                item.removeEventListener("pointerdown", animStart);
                item.removeEventListener("pointermove", animStart);
            });
        };
    }, [items.length]);

    return (
        <div className="todo-gallery" ref={wrapRef}>
            <div id="gallery">
                {items.map((t, idx) => (
                    <figure
                        key={t.id || idx}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate("workspace")}
                        onKeyDown={(e) => e.key === "Enter" && navigate("workspace")}
                        aria-label={`Open ${t.title} in Workspace`}
                    >
                        <div className="todo-card">
                            <div className="todo-card__top">
                                <span className="todo-card__id">{t.id}</span>
                                <span className={priorityClass(t.priority)}>{t.priority || "Priority"}</span>
                            </div>

                            <div className="todo-card__title">{t.title}</div>

                            {t.tag && <span className="todo-card__tag">{t.tag}</span>}

                            {t.aiSuggestion && (
                                <div className="todo-card__ai">
                                    <div className="todo-card__aiLabel">AI SUGGESTION</div>
                                    <div className="todo-card__aiText">{t.aiSuggestion}</div>
                                    <div className="todo-card__aiDismiss">Dismiss</div>
                                </div>
                            )}

                            <div className="todo-card__bottom">
                                <span className="todo-card__date">{t.date || ""}</span>

                                <div className="todo-card__right">
                                    <span className={assigneeClass(t.assignee)}>{t.assignee || "A"}</span>
                                </div>
                            </div>
                        </div>
                    </figure>
                ))}
            </div>
        </div>
    );
};


export default Dashboard;