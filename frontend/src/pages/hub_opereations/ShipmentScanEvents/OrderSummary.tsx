import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Final from "../../../assets/images/completed_icon.gif";
import {
  Download,
  ClipboardList,
  Box,
  User,
  CalendarDays,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Download_create_manifest_pdf } from "../../../AllServices/services";
import { useAlert } from "../../../ContextProvider/AlertContext";
import Button from "../../../base-components/Button";
import LoadingIcon from "../../../base-components/LoadingIcon";

const OrderSummary = () => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { state } = useLocation();
  const navigate = useNavigate();
  const [pdfLink, setPdfLink] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAlert } = useAlert();
  const { manifestno, couriername, rows, manifestId } = state || {};

  const downloadCreateManifestPdf = async () => {
    try {
      setLoading(true);
      const response = await Download_create_manifest_pdf(manifestId);
      if (response.status == 200) {
        setPdfLink(response.data.data);
      } else {
        showAlert(response.data.message, "warning");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (pdfLink) {
    window.open(pdfLink, "_blank");
  }
}, [pdfLink]);

  // useEffect(() => {
  //   if (pdfLink != null) {
  //     handleDownload(pdfLink);
  //   }
  // }, [pdfLink]);

  // const handleDownload = (pdfLink: string) => {
  //   const link = document.createElement("a");
  //   link.href = pdfLink;
  //   link.download = "manifest_pdf";
  //   link.target = "_blank";

  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  return (
    <>
      <div className="mt-3  w-full md:py-8  md:px-5  py-3  px-3 bg-white rounded-lg shadow-lg">
        {/* <div className="flex font-bold">
          <Link to="/hub/operation/direct_outscan" className="flex">
            <ArrowLeft className="w-[18px] mr-2" /> Back to Outscan
          </Link>
        </div> */}

        <div className="w-full lg:w-[810px] xl:w-[900px] m-auto ">
          <div className="text-center ">
            <figure className="inline-block  relative top-[0px] mr-1">
              <img src={Final} alt="" className="w-[160px] " />
            </figure>

            <h2 className="text-[30px] text-[#0FA907] font-bold mb-4 mt-1">
              Outscan Completed
            </h2>
            <p className="text-[18px] text-[#454343]">
              All packages have been successfully scanned out for delivery.
            </p>
          </div>

          <div className="w-full overflow-auto pb-3  mt-6">
            <div className="w-[550px] m-auto">
              <table className="w-full text-left border border-[#F6E7C1] whitespace-nowrap bg-[#FFFDF8] ">
                <thead>
                  <tr>
                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg flex items-center ">
                      <i className="flex items-center justify-center   mr-1  bg-[#FEE8B6] rounded-full border  w-[30px] h-[30px] ">
                        <ClipboardList className="text-[#A77605] w-[18px]" />
                      </i>
                      <p className="inline-block ml-2 mt-0">Manifest No. </p>
                    </td>

                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg font-bold">
                      {manifestno}
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg flex items-center ">
                      <i className="flex items-center justify-center   mr-1  bg-[#FEE8B6] rounded-full border  w-[30px] h-[30px] ">
                        <User className="text-[#A77605] w-[18px]" />
                      </i>
                      <p className="inline-block ml-2 mt-0"> Courier Name </p>
                    </td>

                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg font-bold">
                      {couriername}
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg flex items-center ">
                      <i className="flex items-center justify-center   mr-1 bg-[#FEE8B6] rounded-full border  w-[30px] h-[30px] ">
                        <Box className="text-[#A77605] w-[18px]" />
                      </i>
                      <p className="inline-block ml-2 mt-0">
                        Shipments Outscanned
                      </p>
                    </td>

                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg font-bold">
                      {rows}
                    </td>
                  </tr>

                  <tr>
                    <td className=" border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg flex items-center ">
                      <i className="flex items-center justify-center  mr-1 bg-[#FEE8B6] rounded-full border  w-[30px] h-[30px] ">
                        <CalendarDays className="text-[#A77605] w-[18px]" />
                      </i>
                      <p className="inline-block ml-2 mt-0"> DATE</p>
                    </td>

                    <td className="border-b border-r border-[#F6E7C1] text-[#484848] py-[9px] px-[18px] text-lg font-bold ">
                      {date}
                    </td>
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          <div className="relative block md:flex md:ml-5 mt-3 md:mt-3 justify-center">
            <Button
              type="button"
              onClick={() => navigate("/hub/operation/direct_outscan")}
              className="btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-yellow-300 text-white  text-lg py-2 px-5 rounded-lg hover:bg-yellow-250 transition mr-2"
            >
              <ArrowLeft className="w-[18px] mr-2" />
              Back to Outscan
            </Button>

            <Button
              onClick={() => {
                downloadCreateManifestPdf(manifestId);
              }}
              disabled={loading}
              className="btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-yellow-300 text-white  text-lg py-2 px-5 rounded-lg hover:bg-yellow-250 transition"
            >
              Download Manifest
              {loading ? (
                <LoadingIcon
                  icon="oval"
                  color="white"
                  className="w-4 h-4 ml-2"
                />
              ) : null}
            </Button>
            {/* <button className="btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-yellow-300 text-white  text-lg py-2 px-5 rounded-lg hover:bg-yellow-250 transition ">
              <Download className="mr-2 w-[18px]" /> Download Manifest
            </button> */}
            {/* <button className="btnAnimation overflow-hidden  duration-200  inline-flex items-center justify-center cursor-pointer  bg-yellow-300 text-white text-lg py-2 px-5 rounded-lg hover:bg-yellow-250 transition  md:ml-2 mt-3 md:mt-0">
              <Eye className="mr-2 w-[18px]" /> View Outscan Details
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
