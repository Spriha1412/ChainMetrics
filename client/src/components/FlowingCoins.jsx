import React, { useMemo } from "react";
import "./FlowingCoins.css";

const COINS = ["btc", "eth", "sol", "ada"];

export default function FlowingCoins() {
    const coins = useMemo(() => {
        // Generate 25 coins with random properties
        return Array.from({ length: 25 }).map((_, i) => {
            const type = COINS[Math.floor(Math.random() * COINS.length)];
            const size = Math.random() * 45 + 35; // 35px to 80px
            const left = Math.random() * 100; // 0% to 100% horizontal position
            const duration = Math.random() * 20 + 15; // 15s to 35s to flow up
            const delay = Math.random() * -30; // random negative delay to start mid-animation

            // Randomize the 3D rotation speeds
            const rotX = Math.random() * 720 - 360;
            const rotY = Math.random() * 720 - 360;
            const rotZ = Math.random() * 720 - 360;

            return { id: i, type, size, left, duration, delay, rotX, rotY, rotZ };
        });
    }, []);

    return (
        <div className="flowing-coins-wrapper" aria-hidden="true">
            {coins.map((c) => (
                <div
                    key={c.id}
                    className="flowing-coin-anchor"
                    style={{
                        left: `${c.left}%`,
                        width: `${c.size}px`,
                        height: `${c.size}px`,
                        animationDuration: `${c.duration}s`,
                        animationDelay: `${c.delay}s`,
                        "--rx": `${c.rotX}deg`,
                        "--ry": `${c.rotY}deg`,
                        "--rz": `${c.rotZ}deg`,
                    }}
                >
                    <div className={`flowing-coin-3d ${c.type}`}>
                        <div className="coin-face front"></div>
                        {/* Multiple intermediate layers for 3D thickness */}
                        <div className="coin-layer" style={{ transform: "translateZ(1px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(2px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(3px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(4px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(-1px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(-2px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(-3px)" }}></div>
                        <div className="coin-layer" style={{ transform: "translateZ(-4px)" }}></div>
                        <div className="coin-face back"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
