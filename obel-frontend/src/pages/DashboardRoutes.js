import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import MobileSidebarDrawer from "../components/MobileSidebarDrawer";

const DashboardRoutes = () => {
    const username = "jonathan";

    return (
        <div className="flex bg-black min-h-screen text-white">
            {/* Desktop sidebar only */}
            <div className="hidden md:block">
                <Sidebar username={username} />
            </div>

            {/* Mobile drawer only */}
            <div className="md:hidden">
                <MobileSidebarDrawer 
                    username={username} />
            </div>

            {/* Content */}
            <div className="w-full p-4 md:p-6 md:ml-64">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardRoutes;