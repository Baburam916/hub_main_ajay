import React, { useEffect, useState } from "react";

const AnimatedCounter = ({ value, withDecimal = true }) => {
  const [count, setCount] = useState(withDecimal ? "0.00" : "0");

  useEffect(() => {
    const animatedCounter = () => {
      let start = parseFloat(count);
      const end = value;

      if (start == end) return;

      function updateCounter() {
        start += (end - start) / 10;
        if (Math.abs(start - end) < 0.01) {
          start = end;
        }
        setCount(start.toFixed(withDecimal ? 2 : 0));

        if (start < end) {
          requestAnimationFrame(updateCounter);
        }
      }

      updateCounter();
    };

    animatedCounter();
  }, [value, withDecimal]);

  return (
    <div>
      {Number(count).toLocaleString("en-IN", {
        minimumFractionDigits: withDecimal ? 2 : 0,
        maximumFractionDigits: withDecimal ? 2 : 0,
      })}
    </div>
  );
};

export default AnimatedCounter;
