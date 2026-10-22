const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("English Steps Telegram server is running!");
});

app.post("/notify", async (req, res) => {
  try {
    const { studentName, day, task, score } = req.body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({
        error: "Telegram environment variables are missing"
      });
    }

    if (!studentName || !task) {
      return res.status(400).json({
        error: "Student name and task are required"
      });
    }

    const message = [
      "📚 English Steps — Homework Report",
      `👤 Student: ${studentName}`,
      `📅 Day: ${day ?? "Not specified"}`,
      `📝 Task: ${task}`,
      `📊 Score: ${score ?? "Not specified"}`
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error("Telegram API error:", result);
      return res.status(502).json({
        error: "Telegram notification failed"
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
