import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import "./CryptoGlobe.css";

// Sample coordinates for placing nodes around the globe
const generateNodes = () => {
    const symbols = [
        { id: "bitcoin", symbol: "₿", label: "Bitcoin", color: "#f7931a", class: "btc" },
        { id: "ethereum", symbol: "Ξ", label: "Ethereum", color: "#627eea", class: "eth" },
        { id: "binancecoin", symbol: "B", label: "BNB", color: "#f3ba2f", class: "bnb" },
        { id: "solana", symbol: "S", label: "Solana", color: "#00ffa3", class: "sol" },
        { id: "cardano", symbol: "₳", label: "Cardano", color: "#0033ad", class: "ada" },
        { id: "ripple", symbol: "X", label: "XRP", color: "#23292f", class: "xrp" },
        { id: "polkadot", symbol: "P", label: "Polkadot", color: "#e6007a", class: "dot" },
        { id: "dogecoin", symbol: "Ð", label: "Dogecoin", color: "#c2a633", class: "doge" },
        { id: "matic-network", symbol: "M", label: "Polygon", color: "#8247e5", class: "matic" },
        { id: "avalanche-2", symbol: "A", label: "Avalanche", color: "#e84142", class: "avax" }
    ];

    // Spread nodes across different latitudes and longitudes
    return symbols.map((item, index) => {
        // distribute them nicely
        const lat = (Math.random() - 0.5) * 120; // -60 to 60
        const lng = (index / symbols.length) * 360 - 180; // evenly distributed longitudes + some randomness

        return {
            lat: lat + (Math.random() - 0.5) * 20,
            lng: lng + (Math.random() - 0.5) * 20,
            size: 1.5,
            ...item
        };
    });
};

// Generate connections (arcs) between random nodes
const generateArcs = (nodes) => {
    const arcs = [];
    nodes.forEach((sourceNode, idx) => {
        // Connect each node to 2-3 other random nodes
        const numConnections = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < numConnections; i++) {
            let targetIdx = Math.floor(Math.random() * nodes.length);
            while (targetIdx === idx) {
                targetIdx = Math.floor(Math.random() * nodes.length);
            }

            const targetNode = nodes[targetIdx];

            arcs.push({
                startLat: sourceNode.lat,
                startLng: sourceNode.lng,
                endLat: targetNode.lat,
                endLng: targetNode.lng,
                color: [`rgba(255, 255, 255, 0.1)`, `rgba(255, 255, 255, 0.4)`],
            });
        }
    });
    return arcs;
};

export default function CryptoGlobe() {
    const globeRef = useRef();
    const [nodes, setNodes] = useState([]);
    const [arcs, setArcs] = useState([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef(null);

    useEffect(() => {
        // Initialization
        const newNodes = generateNodes();
        setNodes(newNodes);
        setArcs(generateArcs(newNodes));

        // Setup auto-rotation and initial camera position
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 1.2;
            globeRef.current.controls().enableZoom = false;
            globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1000);
        }

        // Handle resizing
        const handleResize = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                // Responsive height
                const height = containerRef.current.clientHeight || window.innerHeight;
                setDimensions({ width, height });
            }
        };

        handleResize(); // Initial measurement
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Custom HTML marker for the nodes
    const htmlElement = (d) => {
        const el = document.createElement('div');
        el.innerHTML = d.symbol;
        el.className = `crypto-marker ${d.class || 'generic'}`;
        el.title = d.label;
        return el;
    };

    return (
        <div className="globe-section">
            <div className="globe-container" ref={containerRef}>
                {typeof window !== 'undefined' && (
                    <Globe
                        ref={globeRef}
                        height={dimensions.height}
                        width={dimensions.width}
                        // Base colors that fit the dark theme
                        backgroundColor="rgba(0,0,0,0)"
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

                        // HTML Markers
                        htmlElementsData={nodes}
                        htmlElement={htmlElement}

                        // Arcs styling
                        arcsData={arcs}
                        arcColor="color"
                        arcDashLength={0.4}
                        arcDashGap={0.2}
                        arcDashAnimateTime={2500}
                        arcStroke={0.5}

                        // Interactivity
                        enablePointerInteraction={true}
                    />
                )}
            </div>
        </div>
    );
}
