import React, {useEffect, useRef } from "react";


const HoldingsAllocationPie = ({ holdings }) => {
    const pieRef = useRef(null);

    useEffect(() => {
        const d3 = window.d3;
        if (!d3 || !pieRef.current) {
            console.warn("D3 nor found on window or ref missing");
            return;
        }

        if (!holdings || !holdings.length) {
            return;
        }

        // build data array from real holdings
        const data = holdings
            .filter((h) => h.value > 0)
            .map((h) => ({
                Title: h.symbol,
                Amount: h.value,   // slice size = shares * live price
                Description:
                    h.description ||
                    `${h.name} — Shares: ${h.shares}, Value: $${h.value.toFixed(2)}.`,
                meta: h,
            }));

        if (!data.length) return;

        const container = d3.select(pieRef.current);
        container.selectAll("*").remove();

        // ---- Stable sizing ---------
        const rect = pieRef.current.getBoundingClientRect();
        let side = rect.width;

        if (!side || Number.isNaN(side)) {
            side = 260;
        }
      
        const width = side;
        const height = side;
        const radius = side / 2 - 12;
        const innerRadius = radius * 0.6;

        const total = data.reduce((sum, d) => sum + d.Amount, 0);

        const color = d3
            .scaleOrdinal()
            .domain(data.map((d) => d.Title))
            .range([
                "#2BDFBB",
                "#DF2B4F",
                "#EE6617",
                "#FFBF00",
                "#423E6E",
                "#E24161"
            ]);

        // main SVG group
        const svg = container
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr(
                "viewBox",
                `0 0 ${width} ${height}`
            )
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const pie = d3
            .pie()
            .sort(null)
            .value((d) => d.Amount);

        const arc = d3
            .arc()
            .outerRadius(radius)
            .innerRadius(innerRadius);

        const arcHover = d3
            .arc()
            .outerRadius(radius + 6)
            .innerRadius(innerRadius);

        const slices = svg
            .selectAll("path")
            .data(pie(data))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d) => color(d.data.Title))
            .attr("stroke", "#050507")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer");

        let activeSlice = null;

        const updateInfoPanel = (d) => {
            const h = d.data.meta;
            const pct = total ? (d.data.Amount / total) * 100 : 0;

            const rawChangePct =
                typeof h.changePct === "number"
                    ? h.changePct
                    : parseFloat(String(h.changePct || "").replace("%", "")) || 0;

            const arrow = rawChangePct >= 0 ? "▲" : "▼";
            const changeColor = rawChangePct >= 0 ? "#22c55e" : "#f97373";

            const titleText = `${h.name} (${h.symbol}) • ${pct.toFixed(
                1
            )}% of portfolio`;
                           
            const bodyhHtml = `
                ${h.description || d.data.Description}
                <br/><br/>
                Current price: $${h.currentPrice.toFixed(2)}
                <span style="color:${changeColor};">
                    ${arrow} ${Math.abs(rawChangePct).toFixed(2)}%
                </span><br/>
                Shares owned: ${h.shares}<br/>
                Total value: $${h.value.toFixed(2)}
            `;

            const titleEl = document.getElementById("segmentTitle");
            const textEl = document.getElementById("segmentText");
            if (titleEl) titleEl.textContent = titleText;
            if (textEl) textEl.innerHTML = bodyhHtml;
        };

        // Hover + click interaction
        slices
            .on("mouseenter", function (d) {
                if (this !== activeSlice) {
                    d3.select(this).transition().duration(200).attr("d", arcHover);
                }
            })
            .on("mouseleave", function (d) {
                if (this !== activeSlice) {
                    d3.select(this).transition().duration(200).attr("d", arc);
                }
            })
            .on("click", function (d) {
                // reset previous
                if (activeSlice && activeSlice !== this) {
                    d3.select(activeSlice).transition().duration(200).attr("d", arc);
                }
                activeSlice = this;

                d3.select(this).transition().duration(200).attr("d", arcHover);
                updateInfoPanel(d);
            });
        
        // select the biggest slice by default
        const sortedSlices = pie(data).sort(
            (a, b) => b.data.Amount - a.data.Amount
        );
        if (sortedSlices.length) {
            const biggest = sortedSlices[0];
            const idx = data.findIndex((d) => d.Title === biggest.data.Title);
            if (idx >= 0) {
                const sliceNode = slices.nodes()[idx];
                activeSlice = sliceNode;
                d3.select(sliceNode).attr("d", arcHover);
                updateInfoPanel(biggest);
            }
        }

        return () => {
            container.selectAll("*").remove();
        };
    }, [holdings]);

    return (
        <div className="pie-container">
            <div className="pie-row flex flex-col md:flex-row items-stretch gap-6">
                <div className="col-md-5 flex items-center justify-center" ref={pieRef} style={{ minHeight: 260 }} />
                <div id="pieText" className="col-md-7 text-container">
                    <div className="panel">
                        <div className="content-wrapper">
                            <h1 id="segmentTitle">Select a holding</h1>
                            <p id="segmentText">
                                Click any slice in the chart to see its allocation and a short
                                description.
                            </p>
                        </div>
                    </div>
                </div>   
            </div>
        </div>
    );
};

export default HoldingsAllocationPie;