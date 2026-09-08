import { Pagination } from "flowbite-react"
import Lucide from "../../base-components/Lucide";

interface propstype {
  totalpages: number;
  onPageChange: (page: number) => void;
  page: number;
}
const CommonPagination: React.FC<propstype> = ({
  totalpages,
  onPageChange,
  page,
}) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisibleButtons = 5; // Adjust this value to change the maximum number of visible buttons
    // Determine the range of visible page numbers
    let start = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let end = Math.min(totalpages, start + maxVisibleButtons - 1);
    // Ensure that we always display maxVisibleButtons buttons if possible
    if (end - start + 1 < maxVisibleButtons) {
      start = Math.max(1, end - maxVisibleButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    // Add an ellipsis button if not all pages are visible
    if (start > 1) {
      pageNumbers.unshift(-1); // Use a special value to indicate an ellipsis button
    }
    if (end < totalpages) {
      pageNumbers.push(-1); // Use a special value to indicate an ellipsis button
    }
    return pageNumbers;
  };
  return (
    <div className="flex overflow-x-auto sm:justify-center">
      <div className="pagination flex justify-between pb-2 w-[98%] m-auto items-center ">
        <div className="mr-auto">
          <strong className="text-primary">
            Showing {page} of {totalpages}
          </strong>
        </div>
        <div>
          <button onClick={() => onPageChange(1)} disabled={page === 1}>
            <Lucide icon="ChevronsLeft" className="mt-4 relative top-1" />
          </button>
          <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>
            <Lucide icon="ChevronLeft" className="w-4 h-4" />
          </button>
          {getPageNumbers().map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() =>
                pageNumber !== -1 ? onPageChange(pageNumber) : null
              }
              className={`m-1 rounded-lg ${
                pageNumber === page ? "bg-[#777779] text-white" : ""
              }`}
              style={
                pageNumber === -1
                  ? { pointerEvents: "none", cursor: "default" }
                  : { border: "1px solid #E5E5E5", padding: "3px 10px" }
              }
            >
              {pageNumber !== -1 && pageNumber }
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalpages}
          >
            <Lucide icon="ChevronRight" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(totalpages)}
            disabled={page === totalpages}
          >
            <Lucide icon="ChevronsRight" className="mt-4 relative top-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default CommonPagination;
