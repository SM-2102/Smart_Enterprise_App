// Market Status Stacked Bar Chart
import React, { useEffect, useState } from "react";

const MarketStatusChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data?.market?.status_per_division_stacked_bar_chart) {
      // Group data by division
      const groupedData =
        data.market.status_per_division_stacked_bar_chart.reduce(
          (acc, item) => {
            const division = item.division;
            if (!acc[division]) {
              acc[division] = { division, Y: 0, N: 0 };
            }
            acc[division][item.final_status] = item.count;
            return acc;
          },
          {},
        );

      setChartData(Object.values(groupedData));
    }
  }, [data]);

  // Tooltip state (must be before any return)
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    value: "",
    label: "",
    count: null,
  });

  // Helper to show tooltip
  const handleMouseOver = (e, value, label, count) => {
    setTooltip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      value,
      label,
      count,
    });
  };
  const handleMouseOut = () => setTooltip({ ...tooltip, show: false });
  const StylishCounter = ({ total }) => {
    return (
      <div className="w-full flex justify-center">
        <div
          className="
          flex items-center gap-2
        "
        >
          <span className="text-2xl font-extrabold text-yellow-500 tracking-tight">
            {total} +
          </span>

          <span className="text-md font-semibold text-purple-800 tracking-wide">
            Products Replaced
          </span>
        </div>
      </div>
    );
  };

  // Animation state for each bar: animate green first, then red
  const [barStates, setBarStates] = useState([]);
  const animationRanRef = React.useRef("");
  useEffect(() => {
    const chartKey = JSON.stringify(chartData);
    if (animationRanRef.current === chartKey) return;
    animationRanRef.current = chartKey;
    setBarStates(chartData.map(() => ({ green: false, red: false })));
    chartData.forEach((_, idx) => {
      setTimeout(() => {
        setBarStates((prev) => {
          const next = [...prev];
          if (next[idx]) next[idx] = { ...next[idx], green: true };
          return next;
        });
        setTimeout(() => {
          setBarStates((prev) => {
            const next = [...prev];
            if (next[idx]) next[idx] = { ...next[idx], red: true };
            return next;
          });
        }, 700);
      }, idx * 200);
    });
  }, [chartData]);

  return (
    <div className="bg-[#f0f4f8] p-1 rounded-lg relative w-full max-w-full overflow-x-auto">
      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="pointer-events-none fixed z-50 px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold bg-white text-gray-900 border border-gray-200"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
            minWidth: 70,
            textAlign: "center",
            letterSpacing: "0.01em",
          }}
        >
          <span className="block">{tooltip.label}</span>
          <span className="block font-bold">
            {tooltip.value}
            {tooltip.count !== null && (
              <span className="ml-1 text-gray-500">({tooltip.count})</span>
            )}
          </span>
        </div>
      )}
      {data?.market?.total_markets !== undefined && (
        <StylishCounter total={data.market.total_markets} />
      )}

      <div className="flex flex-row items-center justify-center gap-8 w-full">
        {/* Horizontal bars and labels */}
        <div
          className="flex flex-row gap-2 w-full items-center mt-5"
          style={{ minHeight: 0, maxHeight: "140px" }}
        >
          {chartData.map((item, idx) => {
            const total = item.Y + item.N;
            const yPercentage = total > 0 ? (item.Y / total) * 100 : 0;
            const nPercentage = total > 0 ? (item.N / total) * 100 : 0;
            const barState = barStates[idx] || { green: false, red: false };
            return (
              <div
                key={item.division}
                className="flex flex-col items-center w-12 mx-auto"
              >
                {/* Stacked vertical bar: green bottom, red top */}
                <div className="relative flex flex-col-reverse h-30 w-9 rounded overflow-hidden border border-gray-200 bg-gray-100">
                  {/* Completed (Y) - purple bottom */}
                  <div
                    className="bg-purple-500 w-full transition-all duration-700 cursor-pointer relative"
                    style={{
                      height: barState.green ? `${yPercentage}%` : 0,
                      transitionDelay: "0ms",
                    }}
                    onMouseOver={(e) =>
                      handleMouseOver(
                        e,
                        `${yPercentage.toFixed(1)}%`,
                        "Completed",
                        item.Y,
                      )
                    }
                    onMouseOut={handleMouseOut}
                  ></div>
                  {/* Pending (N) - yellow top */}
                  <div
                    className="bg-yellow-400 w-full transition-all duration-700 cursor-pointer relative"
                    style={{
                      height: barState.red ? `${nPercentage}%` : 0,
                      transitionDelay: "0ms",
                    }}
                    onMouseOver={(e) =>
                      handleMouseOver(
                        e,
                        `${nPercentage.toFixed(1)}%`,
                        "Pending",
                        item.N,
                      )
                    }
                    onMouseOut={handleMouseOut}
                  ></div>
                </div>
                {/* Division label */}
                <span
                  className="text-xs font-medium text-gray-700 text-center mt-1 truncate w-full"
                  title={item.division}
                  style={{ maxWidth: "48px" }}
                >
                  {item.division}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .market-status-bar-label {
            font-size: 0.7rem;
            width: 32px !important;
          }
        }
          @keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

      `}</style>
    </div>
  );
};

export default MarketStatusChart;
