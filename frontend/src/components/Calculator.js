import React, { useState } from "react";

const Calculator = () => {
  const [input, setInput] = useState(""); // State to store the current input
  const [result, setResult] = useState(""); // State to store the result

  // Function to handle button clicks
  const handleButtonClick = (value) => {
    if (value === "C") {
      setInput(""); // Clear input
      setResult(""); // Clear result
    } else if (value === "=") {
      try {
        // Evaluate the expression and update the result
        setResult(eval(input).toString()); // Using `eval` for simplicity
      } catch (error) {
        setResult("Error");
      }
    } else {
      setInput((prev) => prev + value); // Append the button value to the input
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-80 bg-gray-200 p-4 rounded-lg shadow-lg">
        {/* Display */}
        <div className="bg-white p-4 rounded mb-4 text-right text-xl font-mono">
          {input || "0"}
        </div>
        <div className="bg-gray-100 p-4 rounded text-right text-lg font-bold">
          {result || "Result"}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            "7",
            "8",
            "9",
            "/",
            "4",
            "5",
            "6",
            "*",
            "1",
            "2",
            "3",
            "-",
            "0",
            "C",
            "=",
            "+",
          ].map((button) => (
            <button
              key={button}
              className="bg-blue-500 text-dark p-4 rounded shadow hover:bg-blue-700"
              onClick={() => handleButtonClick(button)}
            >
              {button}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
