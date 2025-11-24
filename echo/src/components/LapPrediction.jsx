import { useState } from "react";

export default function LapPrediction() {
  const [input, setInput] = useState({
    accx_can: 0, accy_can: 0, ath: 0,
    pbrake_r: 0, pbrake_f: 0,
    gear: 3, steering: 0, speed: 100
  });

  const [result, setResult] = useState(null);

  async function predict() {
    const res = await fetch("/api/predict", {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    setResult(data.predicted_lap_time);
  }

  return (
    <div>
      <h2>Predict Lap Time</h2>
      <button onClick={predict}>Run Prediction</button>
      {result && <p>Predicted Lap Time: {result.toFixed(3)} sec</p>}
    </div>
  );
}
