import React from "react";

export function OtherLargeCitiesMock() {
    const rows = [
        { country: "US", city: "California", desc: "Mostly Sunny", temp: "29°", icon: "⛅" },
        { country: "China", city: "Beijing", desc: "Cloudy", temp: "19°", icon: "🌧️" },
        { country: "Israel", city: "Jerusalem", desc: "Sunny", temp: "31°", icon: "☀️" },
    ];

    return (
        <div className="citiesBox">
            <div className="citiesTop">
                <div className="citiesTitle">Other large cities</div>
                <button className="citiesAll" type="button">
                    Show All <span aria-hidden>›</span>
                </button>
            </div>

            <div className="citiesList">
                {rows.map((r) => (
                    <div key={r.city} className="cityRow">
                        <div className="cityLeft">
                            <div className="cityCountry">{r.country}</div>
                            <div className="cityName">{r.city}</div>
                            <div className="cityDesc">{r.desc}</div>
                        </div>

                        <div className="cityRight">
                            <div className="cityIcon">{r.icon}</div>
                            <div className="cityTemp">{r.temp}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}