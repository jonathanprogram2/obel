import React from "react";

export function ChanceOfRainMock() {
    const data = [
        { t: "10AM", h: 0.72 },
        { t: "11AM", h: 0.62 },
        { t: "12PM", h: 0.92 },
        { t: "01PM", h: 0.48 },
        { t: "02PM", h: 0.82 },
        { t: "03PM", h: 0.46 },
    ];

    return (
        <div className="rainBox">
            <div className="rainTitle">Chance of rain</div>

            <div className="rainGrid">
                {/* Left labels + dashed guides */}
                <div className="rainY">
                    <div className="rainYRow">
                        <span className="rainYLabel">Rainy</span>
                        <span className="rainDash" />
                    </div>
                    <div className="rainYRow">
                        <span className="rainYLabel">Sunny</span>
                        <span className="rainDash" />
                    </div>
                    <div className="rainYRow">
                        <span className="rainYLabel">Heavy</span>
                        <span className="rainDash" />
                    </div>
                </div>
                
                {/* Bars */}
                <div className="rainBars">
                    {data.map((d) => (
                        <div key={d.t} className="rainCol">
                            <div className="rainBarWrap">
                                <div className="rainBarDark" />
                                <div
                                    className="rainBarFill"
                                    style={{ height: `${d.h * 100}%` }}
                                />
                            </div>
                            <div className="rainTime">{d.t}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}