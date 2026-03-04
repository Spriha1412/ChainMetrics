import React from "react";
import CryptoGlobe from "../components/CryptoGlobe";
import "./LandingPage.css";

export default function LandingPage() {
    return (
        <div className="landing-page-container">
            <CryptoGlobe />
            <div className="landing-content">
                <h1 className="landing-title">ChainMetrics</h1>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        </div>
    );
}

