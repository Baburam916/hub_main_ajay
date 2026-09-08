import { useEffect, useState } from "react";
import { FormInput, FormLabel } from "../../base-components/Form";
import Button from "../../base-components/Button";
import { useAlert } from "../../ContextProvider/AlertContext";
import {
  Get_threshold_limit,
  Put_threshold_limit,
  post_weight_diff,
  get_weight_diff
} from "../../AllServices/services";
import LoadingIcon from "../../base-components/LoadingIcon";

export default function index() {
  const { showAlert } = useAlert();
  const [spinner, setSpinner] = useState(false);
  const [thresholdLimitInKg, setThresholdLimitInKg] = useState("");
  const [thresholdLimitInPercent, setThresholdLimitInPercent] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const current_user = localStorage.getItem("current_user");
  const mapped_id = current_user ? JSON.parse(current_user).mapped_id : null;

  const fetchData = async () => {
    try {
      let response = await Get_threshold_limit(mapped_id);
      if (response.status === 200) {
        setThresholdLimitInKg(response.data.data[0]?.threshold_limit);
        setThresholdLimitInPercent(response.data.data[0]?.threshold_per_limit);
      }
    } catch (error) {
      console.log(error);
      if (error) showAlert("something went wrong", "error");
    }
  };

  const getTotalweightDiff = async () => {
    try {
      const res = await get_weight_diff();
      if (res?.status === 200) {
        const weightDiff = res?.data?.data[0]?.weight_diff;
        if (weightDiff !== undefined) {
          setSliderValue(Number(weightDiff));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    getTotalweightDiff();
  }, []);

  const totalWeightDiff = async (weightDiff: number) => {
    const data = {
      weight_diff: String(weightDiff),
    };
    try {
      let response = await post_weight_diff(data);
      console.log(response, "response - totalWeightDiff API");
    } catch (error) {
      console.log(error);
      showAlert("Failed to update weight difference", "error");
    }
  };
  const handleSliderChange = (e: any) => {
    setSliderValue(Number(e.target.value));
  };

  const handleHubThreshold = async () => {
    if (Number(thresholdLimitInKg) < 0) {
      showAlert("Threshold limit in Kgs should not be less than 0", "warning");
      return;
    }
    if (Number(thresholdLimitInPercent) < 0) {
      showAlert(
        "Threshold limit in Percentage should not be less than 0",
        "warning"
      );
      return;
    }
    if (Number(thresholdLimitInPercent) > 100) {
      showAlert(
        "Threshold limit in Percentage should not be greater than 100",
        "warning"
      );
      return;
    }

    setSpinner(true);

    const data = {
      threshold_limit: thresholdLimitInKg,
      threshold_per_limit: thresholdLimitInPercent,
      hub_id: mapped_id,
    };

    try {
      await totalWeightDiff(sliderValue);
      let response = await Put_threshold_limit(data);
      if (response.status == 200) {
        showAlert(response.data.message);
        fetchData();
      } else if (response?.response?.status == 406) {
        showAlert(response.response?.data?.errors[0].msg);
      } else if (response?.message == "Network Error") {
        showAlert(response.message, "error");
      } else if (response?.response?.data?.status == 500) {
        showAlert("Internal Error is Going on..", "error");
      } else if (response?.response?.data?.status == 400) {
        showAlert("Bad Request", "error");
      } else if (response?.response?.data?.status == 401) {
        showAlert("Unauthorized", "error");
      } else if (response?.response?.data?.status == 404) {
        showAlert("Not Found", "error");
      } else if (response?.response?.data?.status == 502) {
        showAlert("Bad GateWay", "error");
      }
    } catch (error) {
      console.log(error);
      if (error) showAlert("something went wrong", "error");
    } finally {
      setSpinner(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto mt-4 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="font-bold text-lg">Threshold</h1>
        <hr />
        <div className="mt-4 sm:flex">
          <FormLabel className="flex items-center text-500">
            Threshold Limit in kgs :
          </FormLabel>
          <FormInput
            className="sm:w-60 sm:ml-4"
            type="number"
            value={thresholdLimitInKg}
            onChange={(e) => setThresholdLimitInKg(e.target.value)}
          />
        </div>
        <div className="mt-4 sm:flex">
          <FormLabel className="flex items-center text-500">
            Threshold Limit in per (%) :
          </FormLabel>
          <FormInput
            className="sm:w-60 sm:ml-4"
            type="number"
            value={thresholdLimitInPercent}
            onChange={(e) => setThresholdLimitInPercent(e.target.value)}
          />
        </div>

        <hr className="my-6" />

        <div className="mt-6 sm:flex sm:items-center">
          <FormLabel className="flex items-center text-500">
            Weight Update Tolerance (0-10g) :
          </FormLabel>

          <div className="sm:ml-4 sm:flex sm:items-center sm:gap-4 w-full sm:w-auto">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full sm:w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-mustard"
              style={{
                background: `linear-gradient(to right, #d4a517 0%, #d4a517 ${(sliderValue / 10) * 100
                  }%, #e5e7eb ${(sliderValue / 10) * 100}%, #e5e7eb 100%)`,
              }}
            />

            <div className="mt-2 sm:mt-0 text-center sm:text-left">
              <span className="inline-block bg-mustard text-white px-3 py-1 rounded-lg font-semibold min-w-16">
                {sliderValue} g
              </span>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end">
          <Button
            className="bg-mustard border-none py-2 px-4 m-6 text-white rounded-xl"
            onClick={handleHubThreshold}
            disabled={spinner}
          >
            Submit{" "}
            {spinner && (
              <LoadingIcon
                icon="puff"
                color="white"
                className="w-5 h-5 ml-2 stroke-2.5 text-white"
              />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
