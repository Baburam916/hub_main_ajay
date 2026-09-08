import React from "react";
import dashimg from "../../assets/images/dashboardimg.png"
const main = () => {
  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-8 p-8 md:p-10 lg:p-12 bg-white rounded-lg shadow-lg flex items-center justify-center">
        <img src={dashimg} className="h-[50vh]" alt="skart_logo" />
      </div>
    </>
  );
};

export default main;