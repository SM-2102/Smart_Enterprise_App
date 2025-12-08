import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PendingBar = ({ pendingData = [], onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (id) => {
    if (onSelect) onSelect(id);
    setOpen(false);
  };
  // className="fixed top-0 left-0 w-80 max-w-[90vw] h-screen bg-black/10 backdrop-blur-xl z-[1200] shadow-2xl flex flex-col animate-fade-in"

  return (
    <>
      <div
        className={`fixed right-0 w-70 max-w-[90vw] z-[1200] transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"} bg-black/10 backdrop-blur-sm shadow-2xl
           top-[88px] bottom-[0px] rounded-l-md overflow-hidden flex flex-col animate-fade-in`}
      >
        <ul
          className="flex-1 overflow-y-auto py-3 px-3 space-y-2 font-sans"
          style={{ fontFamily: "Montserrat, Arial, sans-serif" }}
        >
          {pendingData.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="flex items-center justify-between gap-3 cursor-pointer rounded-md px-2 py-1 transition-colors duration-150 bg-transparent hover:bg-blue-800/10"
            >
              <div className="truncate text-sm text-blue-900 font-bold">
                {item.id} -{" "}
                <span className="text-blue-950 font-medium">{item.name}</span>
              </div>
            </li>
          ))}
          {pendingData.length === 0 && (
            <li className="flex flex-col items-center justify-center py-8 text-center">
              <span className="mb-2">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#3b82f6"
                  className="mx-auto"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <path
                    d="M8 12h8M12 8v8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="text-base font-semibold text-blue-700">
                No pending items
              </span>
              <span className="text-xs text-gray-500 mt-1">
                You're all caught up!
              </span>
            </li>
          )}
        </ul>
      </div>
      <div
        onClick={() => setOpen(!open)}
        className={`fixed top-1/5 -translate-y-1/2 z-[3000] flex items-center gap-2 bg-blue-900 text-white shadow-lg cursor-pointer
          px-4 py-3 rounded-l-xl select-none transition-all duration-300 ${open ? "right-70" : "right-0"}`}
        title="Toggle Pending Bar"
      >
        {open ? (
          <FaChevronRight className="text-base" />
        ) : (
          <FaChevronLeft className="text-base" />
        )}
        <span className="text-md font-bold">Pending</span>
      </div>
    </>
  );
};

export default PendingBar;
