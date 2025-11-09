package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func SendTelegramMessage(botToken, chatId, message string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
	body := map[string]interface{}{
		"chat_id":    chatId,
		"text":       message,
		"parse_mode": "markdown",
	}
	jsonBody, _ := json.Marshal(body)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}
