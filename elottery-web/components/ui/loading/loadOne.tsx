"use client";

import "@/styles/loading/loadOne.css";

const LoadOne = () => {
  return (
    <div className="flex justify-center items-center">
      <svg
        className="load w-4 h-4"
        viewBox="0 0 40 40"
        width="24"
        height="24" 
      >
        <circle
          className="track"
          cx="20"
          cy="20"
          r="8" 
          pathLength="100"
          strokeWidth="3" 
          fill="none"
        />
        <circle
          className="car"
          cx="20"
          cy="20"
          r="8" 
          pathLength="100"
          strokeWidth="3"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default LoadOne;
