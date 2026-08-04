import { useState } from "react";

function useApiState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return {
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
  };
}

export default useApiState;
