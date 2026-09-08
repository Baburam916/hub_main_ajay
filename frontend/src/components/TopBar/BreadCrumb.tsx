import React from 'react'
import { useLocation } from 'react-router-dom'
import Breadcrumb from "../../base-components/Breadcrumb";
export default function BreadCrumb() {
    const location=useLocation()
    // console.log(location.pathname,"location pathname")
 const  baseplus=location.pathname.split("/")[2]
    const basepath=location.pathname.split("/")[1]
    // console.log(baseplus,"I am  baseplus",basepath,"basepath")
  return (
    <Breadcrumb className="hidden mr-auto -intro-x sm:flex">
      <Breadcrumb.Link to="/hub/dashboard">Application</Breadcrumb.Link>
      <Breadcrumb.Link to={location.pathname}>
        {location.pathname == "/hub/dashboard"
          ? "Dashboard"
          : location.pathname?.includes("/hub/operation/")
          ? location.pathname
              ?.replaceAll("/hub/operation/", "")
              ?.replaceAll("_", " ")
          : location.pathname?.includes("/hub/accounts/")
          ? location.pathname
              ?.replaceAll("/hub/accounts/", "")
              ?.replaceAll("_", " ")
          : location.pathname == "/hub/walkin_customer"
          ? "Walkin Customer"
          : location.pathname == "/hub/tracking"
          ? "tracking"
          : location.pathname?.includes("/hub/report/")
          ? location.pathname
              ?.replaceAll("/hub/report/", "")
              ?.replaceAll("_", " ")
          : location.pathname == "/hub/msme"
          ? "Msme Registrations"
          : location.pathname == "/hub/approve_commercial_weight"
          ? "Approve Commercial Weight"
          : basepath == "/hub/dashboard"}
      </Breadcrumb.Link>
    </Breadcrumb>
  );
}
