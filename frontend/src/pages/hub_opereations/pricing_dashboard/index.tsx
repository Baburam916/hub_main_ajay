import React, { useState } from "react";

import {
  ThumbsDown,
  Clock8,
  UserPlus,
  Search,
  UserCog,
  ChevronDown,
  Trash2,
  Eye,
  ClipboardList,
  Laptop2,
} from "lucide-react";
import { FormInput } from "../../../base-components/Form";
import Button from "../../../base-components/Button";
import Table from "../../../base-components/Table";
import { Menu } from "../../../base-components/Headless";
import SearchImg from "../../../assets/images/searchbox.png";
import CommonPagination from "../../../components/Pagination";

const index = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  return (
    <>
      <div>
        <h2 className=" text-lg font-medium mt-10">PRICING DASHBOARD</h2>
        <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 gap-2 mt-4">
          <div className="flex lg:col-span-12 md:col-span-12 sm:col-span-12 bg-white rounded-md justify-between shadow-lg">
            <div className="lg:flex md:flex sm:block w-full">
              <div className="bg-gray-100 p-4 text-center sm:block w-full lg:w-48 md:w-24 mb-3 lg:mb-0 sm:mb-0 rounded-l-md ">
                <i className=" md:inline-block hidden">
                  <img src={SearchImg} alt="Search" />
                </i>
                <h5 className="text-xl lg:text-lg md:text-sm sm:text-sm">
                  Spot Enquires
                </h5>
              </div>

              <div className=" w-full p-2 items-center flex">
                <ul className="flex-wrap flex lg:flex md:flex sm:flex w-full ">
                  <li className=" flex w-1/2 lg:w-1/4 md:w-1/4 sm:w-1/4 mb-2 lg:mb-0 md:mb-0 sm:mb-0">
                    <Clock8 className="w-8 h-8 p-[3px] lg:p-[5px] text-blue-400 bg-blue-100 rounded-3xl" />
                    <p className="pl-2 text-sm lg:text-base md:text-base sm:text-base">
                      Approval Pending <b className="block">3343</b>
                    </p>
                  </li>

                  <li className=" flex w-1/2 lg:w-1/4 md:w-1/4 sm:w-1/4 mb-2 lg:mb-0 md:mb-0 sm:mb-0">
                    <UserPlus className="w-8 h-8 p-[3px] lg:p-[5px] text-mustard bg-yellow-100 rounded-3xl" />
                    <p className="pl-2 text-sm lg:text-base md:text-base sm:text-base">
                      Requoted <b className="block">2223</b>
                    </p>
                  </li>

                  <li className="flex  w-1/2 lg:w-1/4 md:w-1/4 sm:w-1/4 mb-2 lg:mb-0 md:mb-0 sm:mb-0">
                    <ThumbsDown className="w-8 h-8 p-[3px] lg:p-[5px] text-red-500 bg-red-100 rounded-3xl" />
                    <p className="pl-2 text-sm lg:text-base md:text-base sm:text-base">
                      Rejected <b className="block">3432</b>
                    </p>
                  </li>

                  <li className="flex w-1/2 lg:w-1/4 md:w-1/4 sm:w-1/4 lg:mb-0 md:mb-0 sm:mb-0">
                    <Laptop2 className="w-8 h-8 p-[3px] lg:p-[5px] text-green-400 bg-green-100 rounded-3xl" />
                    <p className="pl-2 text-sm lg:text-base md:text-base sm:text-base">
                      Converted To Booking <b className="block">2453</b>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 mt-4 rounded-md">
          <div className="col-span-12">
            <div className="bg-white rounded-lg shadow-md">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
                <h2 className="text-sm font-medium sm:text-base">
                  Pending Spot Enquiries
                </h2>
                <div className="relative w-full sm:w-auto">
                  <FormInput
                    id="vertical-form-1"
                    type="text"
                    placeholder="Search"
                    className="border rounded-md px-3 py-2 w-full sm:w-56"
                  />
                  <button className="absolute top-2.5 right-2.5 text-gray-400">
                    <Search />
                  </button>
                </div>
              </div>

              <div className={`p-3 block`}>
                <div className="overflow-x-scroll scrollbar-hidden">
                  <Table bordered>
                    <Table.Thead>
                      <Table.Tr className="bg-mustard text-white">
                        <Table.Th>S No.</Table.Th>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Customer</Table.Th>
                        <Table.Th>Weight</Table.Th>
                        <Table.Th>Destination</Table.Th>
                        <Table.Th>Job</Table.Th>
                        <Table.Th>AWB</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Action</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {[...Array(5)].map((_, i) => (
                        <Table.Tr key={i}>
                          <Table.Td>{i + 1}</Table.Td>
                          <Table.Td>Angelina</Table.Td>
                          <Table.Td>Jolie</Table.Td>
                          <Table.Td>@angelinajolie</Table.Td>
                          <Table.Td>34kg</Table.Td>
                          <Table.Td>Skart</Table.Td>
                          <Table.Td>21-01-2025</Table.Td>
                          <Table.Td>Active</Table.Td>
                          <Table.Td>
                            <Menu>
                              <Menu.Button
                                as={Button}
                                variant="primary"
                                className="bg-blue-100 text-blue-500 border-blue-500"
                              >
                                <UserCog className="w-5 stroke-2.5" />
                                <ChevronDown className="w-4 stroke-2.5 mt-1" />
                              </Menu.Button>
                              <Menu.Items className="w-48">
                                <Menu.Item>
                                  <Trash2 className="w-4 mr-2" /> DELETE Job
                                </Menu.Item>
                                <Menu.Item>
                                  <Eye className="w-4 mr-2" /> VIEW SOB
                                </Menu.Item>
                                <Menu.Item>
                                  <ClipboardList className="w-4 mr-2" /> STATUS
                                  REPORT
                                </Menu.Item>
                              </Menu.Items>
                            </Menu>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>

                  <CommonPagination
                    onPageChange={handlePageChange}
                    page={Number(page)}
                    totalpages={Number(totalPages)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          button[data-headlessui-state="open"] {
            border-color: #f0b646;
            color: #f0b646;
          }
        `}
      </style>
    </>
  );
};

export default index;
