import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import CustomerChart from "../charts/CustomerChart";
import ChallanChart from "../charts/ChallanChart";
import MarketStatusChart from "../charts/MarketStatusChart";
import WarrantyStatusChart from "../charts/WarrantyStatusChart";
import OutOfWarrantyStatusChart from "../charts/OutOfWarrantyStatusChart";
import OutOfWarrantyTimeline from "../charts/OutOfWarrantyTimeline";
import WarrantySRFDeliveryTimelineChart from "../charts/WarrantySRFDeliveryTimelineChart";
import RetailDivisionDonutChart from "../charts/RetailDivisionDonutChart";
import RetailSettledPieChart from "../charts/RetailSettledPieChart";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardDataProvider } from "../context/DashboardDataContext.jsx";
import SpinnerLoading from "../components/SpinnerLoading";
import { menuConfig } from "../config/menuConfig";

// Filter out actions with showInDashboard: false
// Pass all actions to MenuCard, but filter for overlay rendering
const cards = menuConfig.map(({ actions, ...rest }) => ({
  ...rest,
  actions,
  dashboardActions: actions.filter((a) => a.showInDashboard !== false),
}));

const MenuDashboardPageInner = () => {
  const { data, loading, error, refetch } = useDashboardData();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const openCardKey = queryParams.get("open") || null;

  const handleOpenCardKey = (key) => {
    const params = new URLSearchParams(location.search);
    if (key) {
      params.set("open", key);
    } else {
      params.delete("open");
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] pt-8 px-6 md:px-10 lg:px-20 bg-[#fff] mb-5">
      <div className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center w-full">
          <h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-sm"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Menu Dashboard
          </h2>
          <button
            type="button"
            aria-label="Refresh"
            onClick={refetch}
            className="ml-6 w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            style={{ marginLeft: "auto" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 9-9c2.39 0 4.58.94 6.23 2.62" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-9 9c-2.39 0-4.58-.94-6.23-2.62" />
            </svg>
          </button>
        </div>
        <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
        <div className="absolute -bottom-2 left-0 w-1/4 h-1 bg-gradient-to-r from-blue-400 to-transparent animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-grow min-w-0 w-full">
        {cards.map(
          ({ key, title, icon, actions, dashboardActions, bgColor }) => (
            <MenuCard
              key={key}
              cardKey={key}
              openCardKey={openCardKey}
              setOpenCardKey={handleOpenCardKey}
              title={title}
              icon={icon ? React.createElement(icon) : null}
              actions={actions}
              dashboardActions={dashboardActions}
              bgColor={bgColor}
              className="min-h-[300px] max-w-full w-full"
            >
              {/* ...existing chart rendering logic... */}
              {key === "customer" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Customer Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <CustomerChart data={data} />
                ))}
              {key === "challan" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Challan Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <ChallanChart data={data} />
                ))}
              {key === "retail" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Retail Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                    <div className="w-full md:px-0">
                      <RetailDivisionDonutChart data={data} />
                    </div>
                    <div className="w-full md:px-0">
                      <RetailSettledPieChart data={data} />
                    </div>
                  </div>
                ))}
              {key === "market" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Market Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="mt-2">
                    <MarketStatusChart data={data} />
                  </div>
                ))}
              {key === "warranty" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Warranty Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                    <div className="w-full md:w-2/5 md:pr-0 md:px-0">
                      <WarrantyStatusChart data={data} />
                    </div>
                    <div className="w-full md:w-3/5 md:pl-0 md:px-0">
                      <WarrantySRFDeliveryTimelineChart data={data} />
                    </div>
                  </div>
                ))}
              {key === "out_of_warranty" &&
                (loading ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text="Loading Out of Warranty Data ..." />
                  </div>
                ) : error ? (
                  <div className="w-full flex justify-center items-center">
                    <SpinnerLoading text={`Error Loading ...`} />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-0 items-start justify-start w-full">
                    <div className="w-full md:w-2/3 md:pr-0 md:px-0">
                      <OutOfWarrantyTimeline data={data} />
                    </div>
                    <div className="w-full md:w-1/3 md:pl-0 md:px-0">
                      <OutOfWarrantyStatusChart data={data} />
                    </div>
                  </div>
                ))}
            </MenuCard>
          ),
        )}
      </div>
    </div>
  );
};

const MenuDashboardPage = () => <MenuDashboardPageInner />;

export default MenuDashboardPage;
