import React from "react";
export default function Nodatafound() {
  return (
    <div className="flex items-center justify-center h-screen">
      <img
        src={"/images/nodata.jpg"}
        alt="Internal Error Image"
        className="w-1/2 rounded-full opacity-50"
      />
    </div>
  );
}
