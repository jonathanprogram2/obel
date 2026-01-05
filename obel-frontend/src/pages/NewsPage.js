import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";


const CATEGORIES = [
    { id: "politics", label: "Political" },
    { id: "sports", label: "Sports" },
    { id: "entertainment", label: "Entertainment" },
    { id: "sci-tech", label: "Sci&Tech" },
];

const BOOKMARKS_KEY = "obelNewsBookmarks";

const NewsPage = () => {
    const [activeCategory, setActiveCategory] = useState("politics");
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [bookmarks, setBookmarks] = useState({}); // { articleId: true }
    const [showNewsHelp, setShowNewsHelp] = useState(false);
    const [showBookmarksModal, setShowBookmarksModal] = useState(false);

    // Load bookmarks from localStorage on first mount
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(BOOKMARKS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object") {
                    setBookmarks(parsed);
                }
            }
        } catch (e) {
            console.warn("Failed to parse bookmarks", e);
        }
    }, []);

    // Persist bookmarks whenever they change
    useEffect(() => {
        try {
            window.localStorage.setItem(
                BOOKMARKS_KEY,
                JSON.stringify(bookmarks)
            );
        } catch (e) {
            console.warn("Failed to save bookmarks", e);
        }
    }, [bookmarks]);

    // Fetch articles whenever category changes
    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(
                    `api/news?category=${encodeURIComponent(
                        activeCategory
                    )}`
                );
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const json = await res.json();

                // Expecting: { articles: [...] }
                setArticles(json.articles || []);
            } catch (err) {
                console.error("News fetch error:", err);
                setError(
                    "Could not load news right now. Try again in a minute."
                );
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [activeCategory]);

    const toggleBookmark = (article) => {
        const id = article.id || article.url;
        if (!id) return;

        setBookmarks((prev) => {
            const next = { ...prev };
            if (next[id]) {
                delete next[id];
            } else {
                next[id] = {
                    id,
                    title: article.title,
                    url: article.url,
                    sourceName: article.sourceName || article.source,
                    publishedAt: article.publishedAt,
                    imageUrl: article.imageUrl || article.urlToImage || null,
                };
            }
            return next;
        });
    };

    const formattedArticles = useMemo(
        () =>
            (articles || []).map((a, idx) => {
                const id = a.id || a.url || `article-${idx}`;
                return { ...a, id };
            }),
        [articles]
    );

    const bookmarkedArticles = useMemo(
        () => Object.values(bookmarks || {}),
        [bookmarks]
    );

    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }); 
    };

    return (
        <div className="min-h-screen bg-[#050507] text-white pt-20 pb-10 px-6 md:px-10 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
            >
                <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.2em] text-yellow-400/80 mb-1">
                        News
                    </p>
                    <h1 className="font-orbitron text-3xl md:text-4xl font-bold mb-1">
                        Latest Market & World News
                    </h1>
                    <p className="text-sm text-gray-400 max-w-xl">
                        Browse real-time headlines by category. Use this feed as
                        your personal news center for what's happening
                        in the markets and the world.
                    </p>
                </div>

                <div className="flex items-center gap-4 self-start md:self-auto">
                    {/* Bookmarks button */}
                    <button
                        type="button"
                        onClick={() => setShowBookmarksModal(true)}
                        className="flex items-center gap-2 rounded-full border border-yellow-500/60 bg-black/40 px-4 py-1.5 text-[0.75rem] font-medium text-yellow-200 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_18px_rgba(234,179,8,0.9)] transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="currentColor"
                        >
                            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                        </svg>
                        Bookmarks
                        {bookmarkedArticles.length > 0 && (
                            <span className="ml-1 rounded-full bg-yellow-400/90 px-2 py-[1px] text-[0.65rem] text-black">
                                {bookmarkedArticles.length}
                            </span>
                        )}
                    </button>

                    {/* NEW: What is this page? trigger */}
                    <button
                        type="button"
                        onClick={() => setShowNewsHelp(true)}
                        className="text-[0.7rem] text-yellow-300 hover:text-yellow-100 underline decoration-dotted self-start md:self-auto"
                    >
                        What is this page?
                    </button>
                </div>
            </motion.div>

            {/* Category pills */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-6 flex flex-wrap gap-3"
            >
                {CATEGORIES.map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`obel-news-pill ${active ? "obel-news-pill--active raise" : "raise"}`}
                        >
                            <span>{cat.label}</span>
                        </button>
                    );
                })}
            </motion.div>

            {/* Satus state */}
            {loading && (
                <p className="text-sm text-gray-400 mb-4">
                    Pulling the latest headlines...
                </p>
            )}
            {error && (
                <p className="text-sm text-red-400 mb-4">
                    {error}
                </p>
            )}
            {!loading && !error && formattedArticles.length === 0 && (
                <p className="text-sm text-gray-400 mb-4">
                    No articles found for this category yet.
                </p>
            )}

            {/* Articles grid */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {formattedArticles.map((article, index) => {
                    const isBookmarked = !!bookmarks[article.id];
                    const sourceName = article.source?.name || article.source || "Unknown source";
                    const avatarLetter =
                        (sourceName && sourceName[0]?.toUpperCase()) || "?";

                        return (
                            <motion.article
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: index * 0.03 }}
                                className="flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.55)] overflow-hidden"
                            >
                                {/* image */}
                                <div className="w-full aspect-video overflow-hidden">
                                    {article.imageUrl || article.urlToImage ? (
                                        <img
                                            src={article.imageUrl || article.urlToImage}
                                            alt={article.title || "News image"}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-900 to-black flex items-center justify-center text-xs text-gray-300">
                                            No image
                                        </div>
                                    )}
                                </div>

                                {/* text content */}
                                <div className="flex flex-col flex-1 px-4 pt-4 pb-3">
                                    <h3 className="text-sm md:text-base font-semibold mb-1 line-clamp-2">
                                        {article.title}
                                    </h3>
                                    {article.description && (
                                        <p className="text-xs text-gray-300 mb-3 line-clamp-3">
                                            {article.description}
                                        </p>
                                    )}

                                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/10">
                                        {/* author/source + date */}
                                        <div className="flex items-center gap-2">
                                            {/* avater */}
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500/80 to-yellow-300/40 border border-yellow-400/70 flex items-center justify-center text-xs font-semibold text-black shadow-[0_0_12px_rgba(234,179,8,0.7)]">
                                                {avatarLetter}
                                            </div>
                                            <div className="text-[0.7rem] leading-tight">
                                                <p className="font-medium text-gray-100">
                                                    {sourceName}
                                                </p>
                                                <p className="text-gray-400">
                                                    {formatDate(article.publishedAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* bookmark button */}
                                        <button
                                            type="button"
                                            onClick={() => toggleBookmark(article)}
                                            className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs transition
                                                ${
                                                    isBookmarked
                                                        ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_0_16px_rgba(234,179,8,0.8)]"
                                                        : "border-gray-600 bg-black/40 text-gray-200 hover:border-yellow-400/80 hover:text-yellow-300"
                                                }`}
                                            aria-label={
                                                isBookmarked
                                                    ? "Remove bookmark"
                                                    : "Save article"
                                            }
                                        >
                                            {/* simple bookmark icon */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="h-4 w-4"
                                                fill={isBookmarked ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        );
                })}
            </div>

            {/* Bookmarks modal */}
            {showBookmarksModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={() => setShowBookmarksModal(false)}
                >
                    <div
                        className="max-w-3xl w-full rounded-2xl border border-yellow-500/60 bg-[#050509] p-6 shadow-[0_0_40px_rgba(234,179,8,0.55)] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                Saved articles
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowBookmarksModal(false)}
                                className="text-xs text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        {bookmarkedArticles.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                You haven't bookmarked any articles yet. Tap the bookmark icon on
                                a story to add it here.
                            </p>
                        ): (
                            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {bookmarkedArticles.map((b) => (
                                    <div
                                        key={b.id}
                                        className="flex items-start gap-3 rounded-xl border border-yellow-500/25 bg-black/50 px-4 py-3"
                                    >
                                        {b.imageUrl ? (
                                            <img
                                                src={b.imageUrl}
                                                alt={b.title || "Saved article"}
                                                className="h-14 w-20 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ): (
                                            <div className="h-14 w-20 rounded-lg bg-gradient-to-br from-gray-700 via-gray-900 to-black flex items-center justify-center text-[0.65rem] text-gray-300 flex-shrink-0">
                                                No image
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <a
                                                href={b.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-semibold text-gray-100 hover:text-yellow-200 line-clamp-2"
                                            >
                                                {b.title}
                                            </a>
                                            <p className="text-[0.7rem] text-gray-400 mt-1">
                                                {b.sourceName && (
                                                    <span className="mr-2 text-gray-300">
                                                        {b.sourceName}
                                                    </span>
                                                )}
                                                {formatDate(b.publishedAt)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleBookmark(b)}
                                            className="text-[0.7rem] text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* NEW: "What is this page?" modal */}
            {showNewsHelp && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 md:px-4"
                    onClick={() => setShowNewsHelp(false)}
                >
                    <div 
                        className="w-[92vw] max-w-3xl rounded-2xl border border-yellow-500/60 bg-[#050509] p-8 shadow-[0_0_40px_rgba(234,179,8,0.55)] relative max-h-[82vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-orbitron tracking-[0.16em] uppercase text-yellow-300">
                                How this news page works
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowNewsHelp(false)}
                                className="text-xs text-gray-400 hover:text-yellow-200"
                            >
                                Close ✕
                            </button>
                        </div>

                        <div className="space-y-3 md:space-y-4 text-[0.82rem] md:text-sm leading-relaxed text-gray-200">
                            <section>
                                <h3 className="text-xs font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    1. Category pills
                                </h3>
                                <p>
                                    Use the colored buttons at the top (Political, Sports,
                                    Entertainment, Sci&Tech) to filter the feed. When you
                                    switch categories, Obel calls a free news API and reloads
                                    the headlines for that topic.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xs font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    2. Article cards
                                </h3>
                                <p>
                                    Each glassmorphism card shows the story image, headline,
                                    short summary, source, and publish date. Click a card to
                                    open the full article in a new tab and read it at the
                                    orginal site.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xs font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    3. Bookmarks & saved list
                                </h3>
                                <p>
                                    Tap the glowing bookmark icon to save an article to your
                                    personal "read later" list. Then use the{" "}
                                    <span className="text-yellow-200 font-medium">Bookmarks</span> button 
                                    next to the "What is this page" link to open a popup with all of
                                    your saved articles in one place. From that popup you can
                                    open stories in a new tab or click{" "}
                                    <span className="text-red-300 font-medium">Remove</span> to
                                    un-bookmark an article and clear it from the list.
                                    Bookmarks are stored locally in your browser, so they stay 
                                    put on this device until you clear your storage.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xs font-orbitron tracking-[0.18em] uppercase text-yellow-300 mb-1">
                                    4. How this fits your workflow
                                </h3>
                                <p>
                                    Use this hub as a quick pulse check before you adjust your
                                    portfolio or budgets. Scan for headlines that might impact
                                    sectors you own, then jump back into the Portfolio and
                                    Budgets page when you're ready to take action.
                                </p>
                            </section>

                            <p className="text-xs text-gray-400 mt-4 border-t border-yellow-500/20 pt-3">
                                This page is a{" "}
                                <span className="text-yellow-200 font-medium">
                                    research & planning tool
                                </span>
                                . It aggregates headlines from a third-party provider and
                                doesn't give financial advice.
                            </p> 
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowNewsHelp(false)}
                                className="px-5 py-2 rounded-full bg-yellow-400 text-xs font-semibold text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.6)]"
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

export default NewsPage;