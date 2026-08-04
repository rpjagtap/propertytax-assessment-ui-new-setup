import useApiState from "../pcmc-menu/common/useApiState";

const useApi = (apiFunction) => {
  const { loading, setLoading, error, setError, success, setSuccess } =
    useApiState();
  const callApi = async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(params);
      setSuccess(true);
      return response;
    } catch (err) {
      setError("An error occurred");
      //   throw err; // Re-throw the error if you want the calling function to handle it further
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, setError, callApi, success, setSuccess };
};

export default useApi;
