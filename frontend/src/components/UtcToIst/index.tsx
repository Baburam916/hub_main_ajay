export function convertUTCtoIST(dateString: any) {
  // Parse the input date string (assuming it's in UTC)
  const utcDate = new Date(dateString);
  // Get the UTC time in milliseconds and add the IST offset (5 hours 30 minutes)
  const istOffset = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
  const istTime = new Date(utcDate.getTime() + istOffset);
  // Format the IST date into the desired format
  const day = String(istTime.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[istTime.getMonth()];
  const year = istTime.getFullYear();
  let hours = istTime.getHours();
  const minutes = String(istTime.getMinutes()).padStart(2, "0");
  const seconds = String(istTime.getSeconds()).padStart(2, "0");
  // Determine AM or PM
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 24-hour to 12-hour format
  const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  return formattedDate;
}












