import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaChartPie, FaHandHoldingUsd, FaSignOutAlt } from "react-icons/fa";
import obelLogo from "../assets/obellogo.png";


const NewsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="22" height="22" aria-hidden="true">
        <path
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="51"
            d="M2048 512v896q0 53-20 99t-55 81t-82 55t-99 21H249q-51 0-96-20t-79-53t-54-79t-20-97V256h1792v256zm-128 128h-128v704q0 26-19 45t-45 19t-45-19t-19-45V384H128v1031q0 25 9 47t26 38t39 26t47 10h1543q27 0 50-10t40-27t28-41t10-50zm-384 0H256V512h1280zm0 768h-512v-128h512zm0-256h-512v-128h512zm0-256h-512V768h512zm-640 512H256V765h640zm-512-128h384V893H384z"
        />
  </svg>
);

const WorkspaceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M3 8h18v4c0 2.357 0 3.536-.732 4.268C19.535 17 18.357 17 16 17H8c-2.357 0-3.536 0-4.268-.732S3 14.357 3 12zm4-2c0-1.886 0-2.828.586-3.414S9.114 2 11 2h2c1.886 0 2.828 0 3.414.586S17 4.114 17 6v2H7zM5 17v5m14-5v5M8 17v3m8-3v3M2 8h1.818m16.364 0H22"
        />
  </svg>
);

const HamburgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 512 512">
        <path
            fill="#fff"
            d="M32 96v64h448V96zm0 128v64h448v-64zm0 128v64h448v-64z"
            strokeWidth="13"
            stroke="#fff"
        />
  </svg>
);

const MobileSidebarDrawer = ({ username, isOpen, onClose }) => {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    const navigate = useNavigate();

    // close drawer when route changes
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // lock background scroll when open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    const isActive = (path) => location.pathname === path;

    const handleSignOut = () => {
        // Later: LocalStorage.removeItem("token");
        onClose?.(); // close the drawer if componenet supports it
        navigate("/");
    };

    const navItemClass = (active) =>
        `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 ease-out ${
            active ? "bg-yellow-400 text-black shadow-[0_0_25px_rgba(250,204,21,0.45)]" : "text-white/85 hover:bg-white/10"
        }`;


    return (
        <>
            {/* top pill bar */}
            <div className="fixed top-3 left-3 right-3 z-[60] mobile-only">
                <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/55 backdrop-blur-xl px-5 py-3 shadow-[0_0_30px_rgba(0,0,0,0.45)]">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
                            alt={username}
                            className="h-11 w-11 rounded-full object-cover border border-yellow-400/70 shadow-[0_0_18px_rgba(250,204,21,0.45)]"
                        />
                        <div className="text-base font-semibold text-white/90">@{username}</div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="grid h-12 w-12 place-items-center rounded-full hover:bg-white/10"
                        aria-label="Open menu"
                    >
                        <HamburgerIcon />
                    </button>
                </div>
            </div>

            {/* overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-[70] bg-black/55"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* drawer */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-[80] w-[78vw] max-w-[320px] bg-black border-r border-white/10 p-6
                    transform transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <img src={obelLogo} alt="Obel Logo" className="h-10 w-10" />
                        <div className="text-xs tracking-[0.28em] text-white/70">OBEL</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-full px-3 py-2 text-white/70 hover:bg-white/10"
                    >
                        Close
                    </button>
                </div>

                <nav className="flex flex-col gap-3">
                    <Link to="/dashboard" className={navItemClass(isActive("/dashboard"))}>
                        <FaHome /> Dashboard
                    </Link>
                    <Link to="/dashboard/portfolio" className={navItemClass(isActive("/dashboard/portfolio"))}>
                        <FaChartPie /> Portfolio
                    </Link>
                    <Link to="/dashboard/budgets" className={navItemClass(isActive("/dashboard/budgets"))}>
                        <FaHandHoldingUsd /> Budgets
                    </Link>
                    <Link to="/dashboard/news" className={navItemClass(isActive("/dashboard/news"))}>
                        <NewsIcon /> News
                    </Link>
                    <Link to="/dashboard/workspace" className={navItemClass(isActive("/dashboard/workspace"))}>
                        <WorkspaceIcon /> Workspace
                    </Link>
                </nav>

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-5 py-3 rounded-lg text-left"
                    style={{ marginTop: "90px", fontSize: "15px", color: "#D9BD1E"  }}
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </aside>
        </>
    );
};

export default MobileSidebarDrawer;
