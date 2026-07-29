import { useState } from "react";
import Sidebar from "../components/Sidebar";

function BMI() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [bmi, setBmi] = useState("");
  const [category, setCategory] = useState("");
  const [recommendation, setRecommendation] = useState("");

  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("bmiHistory")) || [],
  );

  const calculateBMI = () => {
    if (!height || !weight) {
      alert("Please enter height and weight.");
      return;
    }

    const bmiValue = (weight / ((height / 100) * (height / 100))).toFixed(1);

    let bmiCategory = "";
    let bmiRecommendation = "";

    if (bmiValue < 18.5) {
      bmiCategory = "Underweight";
      bmiRecommendation =
        "Increase calorie intake and include strength training.";
    } else if (bmiValue < 25) {
      bmiCategory = "Normal";
      bmiRecommendation = "Maintain your current diet and exercise routine.";
    } else if (bmiValue < 30) {
      bmiCategory = "Overweight";
      bmiRecommendation =
        "Focus on cardio exercises and maintain a calorie deficit.";
    } else {
      bmiCategory = "Obese";
      bmiRecommendation =
        "Consult a healthcare professional and start with light activities.";
    }

    setBmi(bmiValue);
    setCategory(bmiCategory);
    setRecommendation(bmiRecommendation);

    const newRecord = {
      date: new Date().toLocaleDateString(),
      bmi: bmiValue,
      category: bmiCategory,
    };

    const updatedHistory = [newRecord, ...history];

    setHistory(updatedHistory);

    localStorage.setItem("bmiHistory", JSON.stringify(updatedHistory));

    localStorage.setItem("latestBMI", bmiValue);
  };

  return (
    <>
      <Sidebar />

      <div className="ml-64 min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-bold mb-2">BMI Calculator</h1>

        <p className="text-gray-500 mb-8">
          Track your Body Mass Index and stay healthy.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BMI CARD */}

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Calculate BMI</h2>

            <input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4"
            />

            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border p-3 rounded-lg mb-4"
            />

            <button
              onClick={calculateBMI}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg"
            >
              Calculate BMI
            </button>

            {bmi && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold">BMI: {bmi}</h2>

                <p className="text-lg mt-2">
                  Category:
                  <span className="font-semibold text-blue-600 ml-2">
                    {category}
                  </span>
                </p>

                <div className="mt-5 bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Recommendation</h3>

                  <p className="text-gray-600">{recommendation}</p>
                </div>
              </div>
            )}
          </div>

          {/* HISTORY CARD */}

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6 pr-2">
              <h2 className="text-2xl font-bold">BMI History</h2>

              <button
                onClick={() => {
                  localStorage.removeItem("bmiHistory");
                  setHistory([]);
                }}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
              >
                Clear
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-gray-500">No BMI records found.</p>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 justify-between bg-gray-100 p-4 rounded-lg"
                  >
                    <span>{item.date}</span>

                    <span className="font-semibold">{item.bmi}</span>

                    <span>{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BMI;
