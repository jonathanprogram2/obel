import React from "react";
import { Link, useLocation, useNavigate} from "react-router-dom";
import { FaHome, FaChartPie, FaHandHoldingUsd, FaNewspaper, FaSignOutAlt } from "react-icons/fa";
import obelLogo from "../assets/obellogo.png";

const NewsIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2048 2048"
        width="22"
        height="22"
        aria-hidden="true"
    >
        <path
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="51"
            d="M2048 512v896q0 53-20 99t-55 81t-82 55t-99 21H249q-51 0-96-20t-79-53t-54-79t-20-97V256h1792v256zm-128 128h-128v704q0 26-19 45t-45 19t-45-19t-19-45V384H128v1031q0 25 9 47t26 38t39 26t47 10h1543q27 0 50-10t40-27t28-41t10-50zm-384 0H256V512h1280zm0 768h-512v-128h512zm0-256h-512v-128h512zm0-256h-512V768h512zm-640 512H256V765h640zm-512-128h384V893H384z"
        />
  </svg>
);

const WorkspaceIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
    >
        <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M3 8h18v4c0 2.357 0 3.536-.732 4.268C19.535 17 18.357 17 16 17H8c-2.357 0-3.536 0-4.268-.732S3 14.357 3 12zm4-2c0-1.886 0-2.828.586-3.414S9.114 2 11 2h2c1.886 0 2.828 0 3.414.586S17 4.114 17 6v2H7zM5 17v5m14-5v5M8 17v3m8-3v3M2 8h1.818m16.364 0H22"
        />
    </svg>
);


const Sidebar = ({ username }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navigate = useNavigate();

    const handleSignOut = () => {
        // Later: LocalStorage.removeItem("token");
        // Later: clear user context, etc.
        navigate("/");
    };

    const navItemClass = (active) =>
        `nav-item flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 ease-out ${
            active ? "is-active" : ""
        }`;


    return (
        <div className="w-64 min-h-screen bg-[#000000] border-r border-[#E4E6E7] p-6 font-orbitron tracking-wider text-lg fixed z-50 flex flex-col justify-between">
            {/* Top: avatar + nav */}
            <div>
                <div className="flex flex-col items-center mb-8">
                    <img 
                        src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg" 
                        alt={username} 
                        className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-yellow-500/80 shadow-[0_0_25px_rgba(250,204,21,0.6)]" 
                    />
                    <p className="text-[#E4E6E7] text-lg font-semibold">@{username}</p>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-4">
                    <Link to="/dashboard" className={navItemClass(isActive("/dashboard"))}>
                        <FaHome /> Dashboard
                    </Link>

                    <Link to="/dashboard/portfolio" className={navItemClass(isActive("/dashboard/portfolio"))}>
                        <FaChartPie /> Portfolio
                    </Link>

                    <Link to="/dashboard/budgets" className={navItemClass(isActive("/dashboard/budgets"))}>
                        <FaHandHoldingUsd /> Budgets
                    </Link>

                    <Link to="/dashboard/news" className={navItemClass(isActive("/dashboard/borrow"))}>
                        <NewsIcon /> News
                    </Link>

                    <Link to="/dashboard/workspace" className={navItemClass(isActive("/dashboard/workspace"))}>
                        <WorkspaceIcon /> Workspace
                    </Link>
                </nav>

                <button
                    onClick={handleSignOut}
                    className="nav-item flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 ease-out text-left"
                    style={{ marginTop: "90px", fontSize: "15px", color: "#D9BD1E" }}
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </div>

            {/* Bottom : Obel logo */}
            <div className="flex flex-col items-center mt-8 opacity-90">
                <img 
                    src={obelLogo} 
                    alt="Obel Logo" 
                    className="w-14 h-14 mb-2" 
                />
                <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#E4E6E7]/70">
                    OBEL
                </p>
            </div>
        </div>
    );   
};

export default Sidebar;