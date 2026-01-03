import React, { useEffect, useRef, useState } from "react";

const chartData = [
    // Think of:
    // - "distance" = net contributions ($) in that period
    // - "latitude" = portfolio value ($)
    // - "duration" = cumulative return (minutes used as % just for the demo axis)
    {
        date: "2025-01-01",
        distance: 500,      // net contribution
        townName: "January",
        townName2: "Jan",
        townSize: 18,
        latitude: 10000,     // portfolio value
        duration: 120        // "return" - placeholder
    },
    {
        date: "2025-02-01",
        distance: 300,      
        townName: "February",
        townSize: 14,
        latitude: 11250,     
        duration: 160        
    },
    {
        date: "2025-03-01",
        distance: 0,      
        townName: "March",
        townSize: 10,
        latitude: 11500,     
        duration: 170,
        alpha: 0.6
    },
    {
        date: "2025-04-01",
        distance: -200,      // withdrawal
        townName: "April",
        townSize: 12,
        latitude: 10900,     
        duration: 130       
    },
    {
        date: "2025-05-01",
        distance: 700,     
        townName: "May",
        townName2: "May",
        townSize: 20,
        latitude: 12500,     
        duration: 220        
    },
    {
        date: "2025-06-01",
        distance: 400,     
        townName: "June",
        townSize: 16,
        latitude: 13300,     
        duration: 260       
    },
    {
        date: "2025-07-01",
        distance: 150,      
        townName: "July",
        townSize: 14,
        latitude: 13750,     
        duration: 280       
    },
    {
        date: "2025-08-01",
        distance: 0,     
        townName: "August",
        townName2: "Aug",
        townSize: 12,
        latitude: 13800,    
        duration: 285, 
        alpha: 0.4      
    },
    {
        date: "2025-09-01",
        distance: 450,      
        townName: "September",
        townSize: 18,
        latitude: 14900,     
        duration: 320,
        bulletClass: "lastBullet" // gets the pulsing effect
    },
];

const GrowthVsContributionsChart = () => {
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        const AmCharts = window.AmCharts;
        const el = containerRef.current;

        if (!AmCharts || !el) {
            console.warn("AmCharts not found on window or container missing.");
            return;
        }

        // Build cumulative net contributions + performance%
        let cumulativeNet = 0;
        const dataWithPerf = chartData.map((point, index) => {
            cumulativeNet += point.distance || 0;   // distance = net contribution for that month

            // avoid divide-by-zero — first point can be 0% by definition
            let performance = 0;
            if (cumulativeNet > 0) {
                performance =
                    ((point.latitude - cumulativeNet) / cumulativeNet) * 100;
            }

            return {
                ...point,
                performance,
            };
        });

       
        // Create chart
        const chart = AmCharts.makeChart(el, {
            type: "serial",
            theme: "dark",
            dataDateFormat: "YYYY-MM-DD",
            dataProvider: dataWithPerf,
            addClassNames: true,
            startDuration: 1,
            color: "#FFFFFF",
            marginLeft: 0,

            // X-axis = time
            categoryField: "date",
            categoryAxis: {
                parseDates: true,
                minPeriod: "MM",
                autoGridCount: false,
                gridCount: 50,
                gridAlpha: 0.1,
                gridColor: "#FFFFFF",
                axisColor: "#555555",
                dateFormats: [
                    { period: "DD", format: "DD" },
                    { period: "WW", format: "MMM DD" },
                    { period: "MM", format: "MMM" },
                    { period: "YYYY", format: "YYYY" },
                ]
            },

            // Y-axis
            valueAxes: [
                {
                    id: "a1",
                    title: "Net Contributions ($)",
                    gridAlpha: 0,
                    axisAlpha: 0
                },
                {
                    id: "a2",
                    position: "right",
                    gridAlpha: 0,
                    axisAlpha: 0,
                    labelsEnabled: false 
                },
                {
                    id: "a3",
                    title: "Cumulative Return (%)",
                    position: "right",
                    gridAlpha: 0,
                    axisAlpha: 0,
                    inside: false,
                    offset: 30,
                    labelFunction: function (value) {
                        return value.toFixed(0) + "%";
                    }
                }
            ],

            // Series:
            graphs: [
                // Columns: net contributions
                {
                    id: "g1",
                    valueField: "distance",
                    title: "Net contributions",
                    type: "column",
                    fillAlphas: 0.9,
                    valueAxis: "a1",
                    balloonText: "[[value]] $ net",
                    legendValueText: "[[value]] $",
                    legendPeriodValueText: "total: [[value.sum]] $",
                    lineColor: "#263138",
                    alphaField: "alpha"
                },
                // Dashed line with bubbles
                {
                    id: "g2",
                    valueField: "latitude",
                    classNameField: "bulletClass",
                    title: "Net worth",
                    type: "line",
                    valueAxis: "a2",
                    lineColor: "#786c56",
                    lineThickness: 1,
                    legendValueText: "[[description]] / $[[value]]",
                    descriptionField: "townName",
                    bullet: "round",
                    bulletSizeField: "townSize",
                    bulletBorderColor: "#786c56",
                    bulletBorderAlpha: 1,
                    bulletBorderThickness: 2,
                    bulletColor: "#000000",
                    labelText: "[[townName2]]",
                    labelPosition: "right",
                    balloonText: "Portfolio: $[[value]]",
                    showBalloon: true,
                    animationPlayed: true
                },
                // Red line: "performance" / cumulative return
                {
                    id: "g3",
                    title: "Performance",
                    valueField: "duration",
                    type: "line",
                    valueAxis: "a3",
                    lineColor: "#ff5755",
                    balloonText: "[[value]]%",
                    lineThickness: 1,
                    legendValueText: "[[value]]%",
                    bullet: "square",
                    bulletBorderColor: "#ff5755",
                    bulletBorderThickness: 1,
                    bulletBorderAlpha: 1,
                    dashLengthField: "dashLength",
                    animationPlayed: true
                }
            ],

            chartCursor: {
                zoomable: false,
                categoryBalloonDateFormat: "MMM",
                cursorAlpha: 0,
                valueBalloonsEnabled: false
            },

            legend: {
                bulletType: "round",
                equalWidths: false,
                valueWidth: 120,
                useGraphSettings: true,
                color: "#FFFFFF"
            }
        });

        chartRef.current = chart;

        // cleanup on unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.clear();
                chartRef.current = null;
            }
        }
    }, []);

    return (
        <div className="growthChartCard rounded-2xl border border-yellow-500/40 bg-[#050509] mt-8 shadow-lg">
            {/* Header + subtitle + help link */}
            <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-yellow-500/20">
                <div>
                    <p className="text-lg uppercase tracking-[0.18] text-gray-400">
                        Growth vs Contributions
                    </p>
                    <p className="text-[0.75rem] text-gray-400">
                        Year 2025 
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowHelp((prev) => !prev)}
                    className="text-[0.7rem] text-yellow-300 hover:text-yellow-200 underline decoration-dotted"
                >
                    {showHelp ? "Hide explanation" : "What's this chart?"}
                </button>
            </div>

            {/* help panel */}
            {showHelp && (
                <div className="px-5 pt-3 pb-2 text-[0.75rem] text-gray-300 bg-black/30 border-b border-yellow-500/20">
                    <p className="mb-1">
                        <span className="font-semibold">Bars</span> show your{" "}
                        <span className="text-yellow-300">net contributions</span>{" "}
                        (money added or withdrawn) for each month.
                    </p>
                    <p className="mb-1">
                        The dotted gold line tracks your{" "}
                        <span className="text-yellow-300">net worth</span>{" "}
                        over time.
                    </p>
                    <p>
                        The red line is your{" "}
                        <span className="text-red-400">cumulative return %</span>{" "}
                        relative to everything you've invested so far. Hover over
                        points to see exact values.
                    </p>
                </div>
            )}
        
            <div
                id="growth-contrib-chart"
                ref={containerRef}
                className="growthChartArea"
            />
        </div>
    );
};

export default GrowthVsContributionsChart;