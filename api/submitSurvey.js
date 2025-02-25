import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'surveyResults.json');

function loadSurveyResults() {
  try {
    if (!fs.existsSync(filePath)) {
      const initialData = { rating: [0, 0, 0, 0, 0] };
      fs.writeFileSync(filePath, JSON.stringify(initialData));
      return initialData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading survey data", err);
    return { rating: [0, 0, 0, 0, 0] };
  }
}

function saveSurveyResults(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (err) {
    console.error("Error writing survey data", err);
  }
}

function generateAISummary(results) {
  const totalResponses = results.rating.reduce((sum, count) => sum + count, 0);
  if (totalResponses === 0) return "";
  let summary = `Nach ${totalResponses} Teilnehmern zeigt die Umfrage folgendes Bild: `;
  results.rating.forEach((count, index) => {
    const percentage = ((count / totalResponses) * 100).toFixed(1);
    summary += `Rating ${index + 1}: ${percentage}%${index < results.rating.length - 1 ? ", " : "."}`;
  });
  return summary;
}

export default function handler(req, res) {
  if (req.method === "POST") {
    // Check if user already participated (via cookie)
    if (req.headers.cookie && req.headers.cookie.includes("surveySubmitted=true")) {
      return res.status(403).json({ error: "Du hast bereits teilgenommen." });
    }

    const { responses } = req.body;
    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({ error: "Ungültige Antworten." });
    }

    const surveyResults = loadSurveyResults();
    responses.forEach((answer) => {
      if (typeof answer === "number" && answer >= 0 && answer < surveyResults.rating.length) {
        surveyResults.rating[answer]++;
      }
    });
    saveSurveyResults(surveyResults);

    const summary = generateAISummary(surveyResults);
    // Set an HTTP-only cookie to prevent duplicate submissions
    res.setHeader('Set-Cookie', 'surveySubmitted=true; HttpOnly; Path=/; Max-Age=31536000');
    res.status(200).json({ results: surveyResults, currentAISummary: summary });
  } else if (req.method === "GET") {
    const surveyResults = loadSurveyResults();
    const totalResponses = surveyResults.rating.reduce((sum, count) => sum + count, 0);
    const summary = totalResponses > 0 ? generateAISummary(surveyResults) : "";
    res.status(200).json({ results: surveyResults, currentAISummary: summary });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
