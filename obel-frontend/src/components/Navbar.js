import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full flex justify-between p-4 bg-black text-white">
          <Link to="/explore" className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600">
            Explore
          </Link>
          <Link to="/signup" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500">
            Signup
          </Link>
        </nav>
    );
};

export default Navbar;