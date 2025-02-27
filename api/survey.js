export default function handler(req, res) {
  if (req.method === "GET") {
    const surveyQuestions = [
      {
        question: "Wie bewertest du den österreichischen Lehrplan?",
        options: ["Sehr schlecht", "Schlecht", "Neutral", "Gut", "Sehr gut"]
        
      }
    ];
    res.status(200).json({ questions: surveyQuestions });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
