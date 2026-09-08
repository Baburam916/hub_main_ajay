import styles from "./tracker.module.css";
import { formatDate } from "../../../utils";
import LoadingIcon from "../../../base-components/LoadingIcon";
import { convertUTCtoIST } from "../../../components/UtcToIst";

export default function Tracker(props: any) {
  const { data, livelocationloading } = props;


  return (
    <div
      className={`p-4 bg-white border rounded-lg shadow-lg w-72 ${
        styles["animate-timeline"]
      } h-[280px] ${data?.length >= 3 && "overflow-auto"} `}
    >
      {livelocationloading ? (
        <div className="flex justify-center py-16 px-10 items-center">
          <LoadingIcon
            icon="tail-spin"
            className="block m-auto mt-8 w-[25%] "
          />
        </div>
      ) : data?.length >= 1 ? (
        data?.map((item: any, index: number) => (
          <div className=" bg-white w-full " key={index}>
            <div className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <CircleCheckIcon className="text-green-500 h-5 w-5" />
                {index !== data?.length - 1 && (
                  <div className="w-0.5 h-16 bg-green-500" />
                )}
              </div>
              <div>
                <span className="text-xs text-green-500 bg-green-100 py-0.5 px-2 rounded-full">
                  {item?.status ? item?.status : "N.A"}
                </span>
                <p className="text-xs text-gray-500">
                  {" "}
                  {item?.date ? convertUTCtoIST(item?.date) : ""}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center py-16 px-10">
          <h1 className="text-center text-primary">OOps.. No data found!..</h1>
        </div>
      )}
    </div>
  );
}

function CircleCheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}