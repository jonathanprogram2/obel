import React from "react";
import worldSvg from "../assets/BlankMap-World.svg"

export function WorldMapMock() {
    const pins = [
        { id: "usa", x: 21, y: 30, icon: "🌤️" },
        { id: "puerto-rico", x: 28, y: 41, icon: "🌧️" },
        { id: "brazil", x: 33, y: 56, icon: "🌧️" }, 
        { id: "egypt", x: 55, y: 38, icon: "☁️" }, 
        { id: "kenya", x: 57, y:50, icon: "🌤️" }, 
        { id: "russia", x: 70, y: 21, icon: "☀️" },
        { id: "philippines", x: 82, y: 45, icon: "🌤️" },
        { id: "australia", x: 85, y: 63, icon: "🌤️" },
    ];

    return (
        <div className="mapBox">
            <div className="mapHeader">
                <div className="mapTitle">Global map</div>
                <button className="mapWideBtn" type="button">
                    View wide <span aria-hidden>✨</span>
                </button>
            </div>

            <div className="mapInner">
                {/* "world" silhouette as an SVG overlay */}
                <img className="mapImg" src={worldSvg} alt="" aria-hidden />

                    {pins.map((p) => (
                        <div 
                            key={p.id} 
                            className="mapPin"
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        >
                            <span className="mapPinIcon">{p.icon}</span>
                        </div>
                    ))}

                    <div className="mapControls">
                        <button className="mapCtrl" type="button" aria-label="Layers">
                            ⛃
                        </button>
                        <button className="mapCtrl" type="button" aria-label="Zoom in">
                            +
                        </button>
                        <button className="mapCtrl" type="button" aria-label="Zoom out">
                            -
                        </button>
                        <button className="mapCtrl" type="button" aria-label="Locate">
                            ⊕
                        </button>
                    </div>
            </div>
        </div>
    );
}