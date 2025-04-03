import React from "react";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-10">
      <div className="container mx-auto px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          {/* Brand Name */}
          <Link to="/">
            <h1 className="text-2xl font-bold text-yellow-400">
              SmartPark
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-lg font-medium mt-4 md:mt-0">
            <Link to="/about" className="hover:text-yellow-400 transition">About Us</Link>
            <Link to="/" className="hover:text-yellow-400 transition">Features</Link>
            <Link to="/" className="hover:text-yellow-400 transition">Overview</Link>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <p className="text-sm text-center md:text-left">
            &copy; {currentYear} <strong></strong>. All Rights Reserved.
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-4 mt-4 md:mt-0">
            {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
              <a
                key={platform}
                href="#"
                className="text-white hover:text-yellow-400 transition text-xl"
                aria-label={platform}
              >
                <i className={`fab fa-${platform}`} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
