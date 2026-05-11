// ============================================================
// PT Assessment — Google Apps Script
// Paste this into your Google Sheet:
// Extensions → Apps Script → paste → Save → Deploy
// ============================================================

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date", "Name", "Phone", "Age", "Gender",
        "Height (cm)", "Weight (kg)", "BMI", "BMI Label",
        "Injuries", "Medical", "Medication",
        "Goal", "Activity", "Diet", "Sleep", "Water",
        "Fitness Score", "Fitness Level", "TDEE", "Program",
        "Calorie Target", "Protein Target", "Days/Week", "Timing",
        "Q1 - Last confident", "Q2 - If nothing changes",
        "Q3 - Mirror talk", "Q4 - Why stopped",
        "Q5 - Dream body", "Q6 - Who else"
      ]);
    }

    const p = e.parameter;

    sheet.appendRow([
      p.date || "",
      p.name || "",
      p.phone || "",
      p.age || "",
      p.gender || "",
      p.height || "",
      p.weight || "",
      p.bmi || "",
      p.bmiLabel || "",
      p.injuries || "",
      p.medical || "",
      p.medication || "",
      p.goal || "",
      p.activity || "",
      p.diet || "",
      p.sleep || "",
      p.water || "",
      p.fitnessScore || "",
      p.fitnessLevel || "",
      p.tdee || "",
      p.program || "",
      p.calorieTarget || "",
      p.proteinTarget || "",
      p.days || "",
      p.timing || "",
      p.eq1 || "",
      p.eq2 || "",
      p.eq3 || "",
      p.eq4 || "",
      p.eq5 || "",
      p.eq6 || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
