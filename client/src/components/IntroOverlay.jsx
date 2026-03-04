import { useState, useEffect, useMemo } from "react";

const ParticleDust = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 300 }).map(() => {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);

            const x = 50 + z0 * 30;

            const u3 = Math.random();
            const u4 = Math.random();
            const z1 = Math.sqrt(-2.0 * Math.log(u3 || 0.001)) * Math.cos(2.0 * Math.PI * u4);
            const y = 50 + z1 * 12;

            const angle = -Math.PI / 7;
            const rx = Math.cos(angle) * (x - 50) - Math.sin(angle) * (y - 50) + 50;
            const ry = Math.sin(angle) * (x - 50) + Math.cos(angle) * (y - 50) + 50;

            const size = Math.random() < 0.9 ? (Math.random() * 1.5 + 0.5) : (Math.random() * 2 + 1);
            const color = Math.random() > 0.3 ? '#2563eb' : (Math.random() > 0.5 ? '#06b6d4' : '#60a5fa');
            const opacity = Math.random() * 0.7 + 0.3;

            return { rx, ry, size, color, opacity };
        });
    }, []);

    return (
        <div className="particle-dust-container">
            {particles.map((p, i) => (
                <div key={i} className="dust-particle" style={{
                    left: `${p.rx}%`,
                    top: `${p.ry}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: p.opacity,
                    boxShadow: p.size > 1 ? `0 0 ${p.size * 2}px ${p.color}` : 'none'
                }} />
            ))}
        </div>
    );
};

export default function IntroOverlay() {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setStage(2), 3500); // 3.5s
        return () => clearTimeout(timer);
    }, []);

    if (stage === 3) return null;

    return (
        <div className={`intro-overlay ${stage === 2 ? "fade-out" : ""}`}>
            <div className="space-bg">
                <div className="nebula-swoosh"></div>
                <div className="nebula-swoosh-2"></div>
                <div className="space-stars"></div>
                <ParticleDust />
            </div>

            <div className="intro-content new-intro">
                <div className="logo-container">
                    <div className="logo-circle">
                        <div className="quadrant q-tl">
                            <div className="bar-chart-hollow">
                                <div className="hollow-bar hb1"></div>
                                <div className="hollow-bar hb2"></div>
                            </div>
                        </div>
                        <div className="quadrant q-tr">
                            <svg viewBox="0 0 24 24" className="line-chart" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 16 9 10 14 14 21 6" />
                            </svg>
                        </div>
                        <div className="quadrant q-bl">
                            <div className="percentage">%</div>
                        </div>
                        <div className="quadrant q-br">
                            <div className="dollar">$</div>
                        </div>
                    </div>
                    <h1 className="logo-text">ChainMetrices</h1>
                </div>

                <div className="spinner-container">
                    <div className="spinner">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="spinner-dot" style={{ transform: `rotate(${i * 30}deg)` }}>
                                <div className="spinner-dot-inner" style={{ animationDelay: `-${1.2 - (i * 0.1)}s` }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
