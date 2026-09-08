const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [refresh, SetRefresh] = useState<boolean>(false);
// console.log(data, "vendordata");

useEffect(() => {
  fetchData();
}, [refresh]);

const handleRefresh = () => {
  SetRefresh(!refresh);
};
const fetchData = async () => {
  setLoading(true);

  try {
    const response = await GETledgersapi();
    console.log(response, "ledgerdata");
    if (response?.status == 200) {
      setData(response?.data.data || []);
      setError(null);
    } else if (response?.message == "Network Error") {
      setError(response?.message);
    } else if (response?.response.data.status == 500) {
      setError("500");
    }
  } catch (err) {
    console.error(err);
    setError("An error occurred while fetching data.");
  } finally {
    setLoading(false);
  }
};
// console.log(error,"error")
// console.log(data, "datavendor");
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full border-t-4 border-blue-500 border-t-blue-500 h-12 w-12"></div>
    </div>
  );
} else if (error && error == "Network Error") {
  return (
    <div className="flex items-center justify-center h-screen">
      <img
        src={internetErrorimage}
        alt="Your Image"
        className="w-4/12 rounded-full opacity-50"
      />
    </div>
  );
} else if (error && error == "500") {
  return (
    <div className="flex items-center justify-center h-screen">
      <img
        src={InternalErrorImage}
        alt="Your Image"
        className="w-4/12 rounded-full opacity-50"
      />
    </div>
  );
}
