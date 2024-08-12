const axios = require("axios");

module.exports = async ({ telegramBotToken, telegramChatId, message }) => {
  try {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    const config = {
      method: "POST",
      url: url,
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        chat_id: telegramChatId,
        text: message,
        parse_mode: "markdown",
      },
    };

    await axios(config);
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
    throw error;
  }
};
