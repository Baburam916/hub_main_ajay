import { useState, Fragment, useEffect } from "react";
import Lucide from "../../base-components/Lucide";
import { FormInput, FormLabel } from "../../base-components/Form";
import { Menu, Popover } from "../../base-components/Headless";
import fakerData from "../../utils/faker";
import _ from "lodash";
import clsx from "clsx";
import { Transition } from "@headlessui/react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { boolean } from "yup";
import BreadCrumb from "./BreadCrumb";
import axios from "axios";
import { ChangePassword, Logout } from "../../AllServices/services";
import { useAlert } from "../../ContextProvider/AlertContext";
import Modal from "../Modal/index";
import Button from "../../base-components/Button";
import { ChangePasswordData } from "../../DataTypes/dataTypes";

function Main() {
  const navigate = useNavigate();
  const [searchDropdown, setSearchDropdown] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { showAlert } = useAlert();
  const [managepath, setManagepath] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [searchparams] = useSearchParams();
  const showSearchDropdown = () => {
    setSearchDropdown(true);
  };
  const hideSearchDropdown = () => {
    setSearchDropdown(false);
  };
  const basepath = location.pathname.split("/")[1];
  const splitarr = location.pathname.split("/");

  useEffect(() => {
    setManagepath(basepath);
  }, [basepath]);

  const handleLogout = async () => {
    try {
      const response: any = await Logout();
      if (response?.status == 200) {
        showAlert(response?.data.message, "success");
        
         navigate("/", { replace: true });
      } else {
        showAlert("something went wrong!", "error");
      }
    } catch (err: any) {
      showAlert(err.message);
    }
  };

  const changePassword = async () => {
    const changePasswordData: ChangePasswordData = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    try {
      const response = await ChangePassword(changePasswordData);

      if (response.status == 201) {
        localStorage.removeItem("current_user");
        showAlert(response.data.message, "success");
        navigate("/", { replace: true });
      } else if (response.response && response.response.status == 406) {
        showAlert(
          response.response.data.errors[0].msg ||
            response.response.data.errors[0].message,
          "error"
        );
      }
    } catch (error) {
      if (error) showAlert("something went wrong", "error");
    }
  };

  let currentUser = JSON.parse(localStorage.getItem("current_user"));

  const ModalDescription = (
    <>
      <div className="col-span-12 sm:col-span-6">
        <FormLabel htmlFor="modal-form-1">Current Password</FormLabel>
        <FormInput
          id="modal-form-1"
          type="password"
          placeholder="current password"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="col-span-12 sm:col-span-6 mt-4">
        <FormLabel htmlFor="modal-form-2">New Password</FormLabel>
        <FormInput
          id="modal-form-2"
          type="password"
          placeholder="new password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
    </>
  );

  const ModalFooter = (
    <>
      <Button
        type="button"
        onClick={() => {
          setOpenModal(false);
        }}
        className="text-white w-20 bg-red-400 hover:bg-red-500 mr-1 p-1"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={() => changePassword()}
        className="text-white w-20 bg-green-400 hover:bg-green-500 p-1"
      >
        Done
      </Button>
    </>
  );

  return (
    <>
      {/* BEGIN: Top Bar */}
      <div className="sticky top-0 bg-[#f1f5f9] h-[67px] z-[51] flex items-center relative border-b border-slate-200">
        {/* BEGIN: Breadcrumb */}
        <BreadCrumb />

        {/* END: Breadcrumb */}
        {/* BEGIN: Search */}
        {/* <div className="relative mr-3 intro-x sm:mr-6">
          <div className="relative hidden sm:block">
            <FormInput
              type="text"
              className="border-transparent w-56 shadow-none rounded-full bg-slate-300/50 pr-8 transition-[width] duration-300 ease-in-out focus:border-transparent focus:w-72 dark:bg-darkmode-400/70"
              placeholder="Search..."
              onFocus={showSearchDropdown}
              onBlur={hideSearchDropdown}
            />
            <Lucide
              icon="Search"
              className="absolute inset-y-0 right-0 w-5 h-5 my-auto mr-3 text-slate-600 dark:text-slate-500"
            />
          </div>
          <a className="relative text-slate-600 sm:hidden" href="">
            <Lucide icon="Search" className="w-5 h-5 dark:text-slate-500" />
          </a>
        </div> */}
        {/* END: Search  */}
        {/* BEGIN: Notifications */}
        {/* <Popover className="mr-auto intro-x sm:mr-6">
          <Popover.Button
            className="
              relative text-slate-600 outline-none block
              before:content-[''] before:w-[8px] before:h-[8px] before:rounded-full before:absolute before:top-[-2px] before:right-0 before:bg-danger
            "
          >
            <Lucide icon="Bell" className="w-5 h-5 dark:text-slate-500" />
          </Popover.Button>
          <Popover.Panel className="w-[280px] sm:w-[350px] p-5 mt-2">
            <div className="mb-5 font-medium">Notifications</div>
            {_.take(fakerData, 5).map((faker, fakerKey) => (
              <div
                key={fakerKey}
                className={clsx([
                  "cursor-pointer relative flex items-center",
                  { "mt-5": fakerKey },
                ])}
              >
                <div className="relative flex-none w-12 h-12 mr-1 image-fit">
                  <img
                    alt="Midone Tailwind HTML Admin Template"
                    className="rounded-full"
                    src={faker.photos[0]}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-success dark:border-darkmode-600"></div>
                </div>
                <div className="ml-2 overflow-hidden">
                  <div className="flex items-center">
                    <a href="" className="mr-5 font-medium truncate">
                      {faker.users[0].name}
                    </a>
                    <div className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                      {faker.times[0]}
                    </div>
                  </div>
                  <div className="w-full truncate text-slate-500 mt-0.5">
                    {faker.news[0].shortContent}
                  </div>
                </div>
              </div>
            ))}
          </Popover.Panel>
        </Popover> */}
        {/* END: Notifications  */}
        {/* BEGIN: Account Menu */}
        <p className="mx-4 text-base font-bold text-warning uppercase">
          Welcome {currentUser?.mapped_name}
        </p>
        <Menu>
          <Menu.Button className="block w-8 h-8 overflow-hidden rounded-full shadow-lg image-fit zoom-in intro-x">
            <img
              alt="Midone Tailwind HTML Admin Template"
              src={"/images/UserProfile.jpg"}
            />
          </Menu.Button>
          <Menu.Items className="w-56 mt-px text-white bg-primary">
            <Menu.Header className="font-normal">
            <Menu.Header className="font-normal">
              <div className="font-bold text-md uppercase">{currentUser?.display_name}</div>
            </Menu.Header>
            </Menu.Header>
            <Menu.Divider className="bg-white/[0.08]" />
            {/* <Menu.Item className="hover:bg-white/5">
              <Lucide icon="User" className="w-4 h-4 mr-2" /> Profile
            </Menu.Item>
            <Menu.Item className="hover:bg-white/5">
              <Lucide icon="Edit" className="w-4 h-4 mr-2" /> Add Account
            </Menu.Item> */}
            <Menu.Item
              className="hover:bg-white/5"
              onClick={() => setOpenModal(true)}
            >
              <Lucide icon="Lock" className="w-4 h-4 mr-2" /> Change Password
            </Menu.Item>
            {/* <Menu.Item className="hover:bg-white/5">
              <Lucide icon="HelpCircle" className="w-4 h-4 mr-2" /> Help
            </Menu.Item> */}
            {/* <Menu.Divider className="bg-white/[0.08]" /> */}
            <Menu.Item className="hover:bg-white/5" onClick={handleLogout}>
              <Lucide
                icon="ToggleRight"
                className="w-4 h-4 mr-2"
                onClick={handleLogout}
              />{" "}
              Logout
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
      {/* END: Top Bar */}

      <Modal
        description={ModalDescription}
        footer={ModalFooter}
        open={openModal}
        setOpen={setOpenModal}
        size= 'md'
        title="Change Password"
      />
    </>
  );
}

export default Main;
