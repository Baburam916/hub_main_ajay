export const formatDate = (dateString: any) => {
  if (!dateString) {
    return "-";
  }
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  const date = new Date(dateString);
  let formattedDate = date.toLocaleDateString("en-GB", options);
  formattedDate = formattedDate.replace("am", "AM").replace("pm", "PM");
  return formattedDate;
};
