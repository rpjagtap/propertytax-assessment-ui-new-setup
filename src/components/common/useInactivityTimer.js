import { useEffect } from "react";

function useInactivityTimer(onTimeout, timeoutDuration = 1500000) {
  // 20 minutes = 1200000 ms
  useEffect(() => {
    let timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(onTimeout, timeoutDuration);
    };

    // Define user activity events
    // const events = ['mousemove', 'keydown', 'scroll', 'click'];
    const events = ["keydown", "click"];

    // Add event listeners
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Set the initial timer
    resetTimer();

    // Cleanup event listeners on component unmount
    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [onTimeout, timeoutDuration]);
}

export default useInactivityTimer;
