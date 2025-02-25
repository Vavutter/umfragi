// api/submitSurvey.js

// In-memory storage for survey results (state resets on new instances)
let surveyResults = {
  rating: [0, 0, 0, 0, 0]
};

export default function handler(req, res) {
  if (req.method === "POST") {
    const { responses } = req.body;
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: "Ungültige Antworten." });
    }

    // Update aggregated results based on submitted responses
    responses.forEach((answer) => {
      if (typeof answer === "number" && answer >= 0 && answer < surveyResults.rating.length) {
        surveyResults.rating[answer]++;
      }
    });

    // Generate a simple summary of the results
    const totalResponses = surveyResults.rating.reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...surveyResults.rating);
    const maxIndex = surveyResults.rating.indexOf(maxCount);
    const percentage = totalResponses > 0 ? ((maxCount / totalResponses) * 100).toFixed(1) : 0;
    const summary = `Die Mehrheit der Teilnehmer wählte "${maxIndex + 1}" (${percentage}%).`;

    res.status(200).json({ results: surveyResults, currentAISummary: summary });
  } else if (req.method === "GET") {
    // Allow GET requests for polling current results
    const totalResponses = surveyResults.rating.reduce((sum, count) => sum + count, 0);
    let summary = "";
    if (totalResponses > 0) {
      const maxCount = Math.max(...surveyResults.rating);
      const maxIndex = surveyResults.rating.indexOf(maxCount);
      const percentage = ((maxCount / totalResponses) * 100).toFixed(1);
      summary = `Die Mehrheit der Teilnehmer wählte "${maxIndex + 1}" (${percentage}%).`;
    }
    res.status(200).json({ results: surveyResults, currentAISummary: summary });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
