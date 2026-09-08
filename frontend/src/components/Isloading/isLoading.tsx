import React from "react";

export default function IsLoading({margin,height}:any) {
  return (
    <div className={`flex items-center justify-center ${height?height:"h-screen"} `}>
      <div
        className={`animate-spin rounded-full border-t-4 border-primary border-t-primary h-12 w-12 ${
          margin ? margin : ""
        }`}
      ></div>
    </div>
  );
}
