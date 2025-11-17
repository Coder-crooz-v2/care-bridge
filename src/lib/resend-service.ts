import { Resend } from "resend";

interface ResendEmailParams {
  userEmail: string;
  medicineName: string;
  dosage: string;
  instructions?: string;
  notes?: string;
  reminderTime: string;
}

/**
 * Generate HTML email template for medicine reminder
 */
function generateEmailHTML(params: ResendEmailParams): string {
  const { medicineName, dosage, instructions, notes, reminderTime } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medicine Reminder</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #4CAF50;
    }
    h1 {
      color: #4CAF50;
      margin: 0;
      font-size: 28px;
    }
    .medicine-card {
      background-color: #f9f9f9;
      border-left: 4px solid #4CAF50;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .medicine-name {
      font-size: 20px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .dosage {
      font-size: 16px;
      color: #555;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .info-section {
      margin: 15px 0;
    }
    .info-label {
      font-weight: bold;
      color: #4CAF50;
      display: block;
      margin-bottom: 5px;
    }
    .info-content {
      color: #555;
      padding-left: 10px;
    }
    .reminder-time {
      background-color: #e8f5e9;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
      margin: 20px 0;
    }
    .reminder-time strong {
      color: #4CAF50;
      font-size: 18px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💊 Medicine Reminder</h1>
    </div>
    
    <p>Hello,</p>
    <p>This is your scheduled reminder to take your medication:</p>
    
    <div class="medicine-card">
      <div class="medicine-name">${medicineName}</div>
      <div class="dosage">Dosage: ${dosage}</div>
      
      ${
        instructions
          ? `
      <div class="info-section">
        <span class="info-label">Instructions:</span>
        <div class="info-content">${instructions}</div>
      </div>
      `
          : ""
      }
      
      ${
        notes
          ? `
      <div class="info-section">
        <span class="info-label">Important Notes:</span>
        <div class="info-content">${notes}</div>
      </div>
      `
          : ""
      }
    </div>
    
    <div class="reminder-time">
      <p>⏰ <strong>Scheduled Time: ${reminderTime}</strong></p>
    </div>
    
    <p style="margin-top: 20px;">
      <strong>Important:</strong> Please take your medication as prescribed. If you have any concerns or experience side effects, consult your healthcare provider.
    </p>
    
    <div class="footer">
      <p>This is an automated reminder from CareBridge Health Monitoring System.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        To manage your reminders, please log in to your CareBridge account.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of email
 */
function generateEmailText(params: ResendEmailParams): string {
  const { medicineName, dosage, instructions, notes, reminderTime } = params;

  let text = `MEDICINE REMINDER\n\n`;
  text += `Hello,\n\n`;
  text += `This is your scheduled reminder to take your medication:\n\n`;
  text += `Medicine: ${medicineName}\n`;
  text += `Dosage: ${dosage}\n`;

  if (instructions) {
    text += `\nInstructions:\n${instructions}\n`;
  }

  if (notes) {
    text += `\nImportant Notes:\n${notes}\n`;
  }

  text += `\nScheduled Time: ${reminderTime}\n\n`;
  text += `Important: Please take your medication as prescribed. If you have any concerns or experience side effects, consult your healthcare provider.\n\n`;
  text += `---\n`;
  text += `This is an automated reminder from CareBridge Health Monitoring System.\n`;
  text += `To manage your reminders, please log in to your CareBridge account.`;

  return text;
}

/**
 * Send medicine reminder email via Resend API
 */
export async function sendReminderEmail(
  params: ResendEmailParams
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_SENDER_EMAIL;
  const senderName = process.env.RESEND_SENDER_NAME || "CareBridge Health";

  if (!apiKey) {
    throw new Error(
      "Resend API key not configured. Please set RESEND_API_KEY in environment variables."
    );
  }

  if (!senderEmail) {
    throw new Error(
      "Resend sender email not configured. Please set RESEND_SENDER_EMAIL in environment variables."
    );
  }

  try {
    const resend = new Resend(apiKey);

    // Generate email content
    const htmlContent = generateEmailHTML(params);
    const textContent = generateEmailText(params);

    // Send email via Resend API
    const { data, error } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [params.userEmail],
      subject: `💊 Medicine Reminder: ${params.medicineName} at ${params.reminderTime}`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }

    console.log("Email sent successfully via Resend:", data);
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
}
