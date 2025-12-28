import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";


const DashboardRoutes = () => {
    const username = "jonathan";
    return (
        <div className="flex bg-black min-h-screen text-white">
            <Sidebar username={username} />
            <div className="ml-64 w-full p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardRoutes;