import React from "react";
import LoadingIcon from "../../base-components/LoadingIcon";

export default function LoadingButtonCommon({ text }: any) {
  return (
    <>
      {text ? text : ""}
      <LoadingIcon
        icon="three-dots"
        color="white"
        className="w-5 h-5 ml-2 stroke-2.5 text-white"
      />
    </>
  );
}
