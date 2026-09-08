import clsx from "clsx";
import logoUrl from "../../assets/images/Side_logo.png";
import illustrationUrl from "../../assets/images/Skart-Banner-homepage.png";
import { Cross } from "lucide-react";
import { useLocation } from "react-router-dom";

const main = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeValue = queryParams.get("type");
  const handleCloseTab = () => {
    window.opener = null;
    window.open("", "_self");
    window.close();
  };

  return (
    <>
      <div
        className={clsx([
          "-m-3 sm:-mx-8 p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
          "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
          "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
        ])}
      >
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            <div className="flex-col hidden min-h-screen xl:flex">
              <a href="" className="flex items-center pt-5 -intro-x">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  className="w-[50%]"
                  src={logoUrl}
                  style={{ filter: "drop-shadow(5px 5px 3px #222)" }}
                />
              </a>
              <div className="my-auto">
                <img
                  alt="Midone Tailwind HTML Admin Template"
                  className="w-3/4 -mt-36 -intro-x"
                  src={illustrationUrl}
                />
                <div className="mt-7 text-2xl font-medium leading-tight text-white -intro-x">
                  sKart Global Express Pvt Ltd
                </div>
                <div className="mt-7 text-md text-white -intro-x text-opacity-70 dark:text-slate-400">
                  sKart Global Express Pvt Ltd is a next-gen tech-driven express
                  and
                  <br /> e-commerce Logistics solution provider.
                </div>
              </div>
            </div>

            <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
              <div className="w-full border px-2 py-5 mx-auto my-auto bg-white rounded-lg shadow-lg xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 sm:w-3/4 lg:w-2/4 xl:w-auto">
                {typeValue == "approve" ? (
                  <>
                    <div className="bg-white p-8 text-center w-full max-w-md">
                      <div className="bg-green-100 text-green-600 w-20 h-20 mx-auto mb-5 flex justify-center items-center rounded-full text-3xl font-bold">
                        ✔
                      </div>
                      <h1 className="text-green-500 text-2xl mb-2 font-bold">
                        Thank You!
                      </h1>
                      <p className="text-gray-500 text-lg leading-relaxed">
                        For using <strong>sKart</strong>. <br />
                        As per our weighing machine, the shipment has been
                        approved successfully.
                      </p>
                      <button
                        className="mt-6 bg-mustard text-white py-3 px-6 rounded-lg font-semibold text-lg transition duration-300"
                        onClick={handleCloseTab}
                      >
                        Continue
                      </button>
                    </div>
                  </>
                ) : typeValue == "hold" ? (
                  <>
                    <div className="bg-white p-8 text-center w-full max-w-md">
                      <div className="bg-green-100 text-green-600 w-20 h-20 mx-auto mb-5 flex justify-center items-center rounded-full text-3xl font-bold">
                        ✔
                      </div>
                      <h1 className="text-green-500 text-2xl mb-2 font-bold">
                        Thank You!
                      </h1>
                      <p className="text-gray-500 text-lg leading-relaxed">
                        For using <strong>sKart</strong>. <br />
                        As per our weighing machine, the shipment has been hold
                        successfully.
                      </p>
                      <button
                        className="mt-6 bg-mustard text-white py-3 px-6 rounded-lg font-semibold text-lg transition duration-300"
                        onClick={handleCloseTab}
                      >
                        Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white  p-12  px-28  text-center w-full max-w-md">
                      <div className="bg-red-500 w-20 h-20 mx-auto mb-5 flex justify-center items-center rounded-full text-3xl font-bold">
                        <Cross className="w-8 h-8 text-white -rotate-45 stroke-2.5" />
                      </div>
                      <h1 className="text-red-500 text-2xl mb-2 font-bold">
                        Access restricted!
                      </h1>
                      <p className="text-gray-500 text-lg leading-relaxed">
                        For using <strong>sKart</strong>. <br />
                        Action already performed.
                      </p>
                      <button
                        className="mt-6 bg-mustard text-white py-3 px-6 rounded-lg font-semibold text-lg transition duration-300"
                        onClick={handleCloseTab}
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default main;
