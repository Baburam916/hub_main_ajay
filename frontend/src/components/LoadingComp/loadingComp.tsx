import React from "react";
export default function IsLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full border-t-4 border-primary border-t-primary h-12 w-12"></div>
    </div>
  );
}
