import { useState } from "react";

export default function InsightsChat() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  async function ask() {
    const res = await fetch("/api/insights", {
      method: "POST",
      body: JSON.stringify({
        question,
        data_summary: "Using Sonoma telemetry dataset."
      }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    setResponse(data.response);
  }

  return (
    <div>
      <h2>Ask RaceIQ</h2>
      <textarea 
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={ask}>Ask Insight</button>
      <pre>{response}</pre>
    </div>
  );
}
