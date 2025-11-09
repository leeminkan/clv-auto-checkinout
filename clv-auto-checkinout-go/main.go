package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/robfig/cron"
)

func main() {
	// Load environment variables
	_ = godotenv.Load()

	username := os.Getenv("USERNAME")
	password := os.Getenv("PASSWORD")
	telegramBotToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	telegramChatId := os.Getenv("TELEGRAM_CHAT_ID")

	if username == "" || password == "" {
		log.Fatal("[ERROR] username, password are required")
	}

	fmt.Printf("[INFO] Starting CLV Auto Checkin/Out process at %s\n", time.Now().Format(time.RFC3339))

	c := cron.New()

	// Checkin 8AM
	c.AddFunc("0 8 * * 1-5", func() {
		fmt.Println("[INFO] Running check-in job ...")
		err := ClvAutoCheckinout(username, password)
		if err != nil {
			log.Printf("[ERROR] Check-in failed: %v\n", err)
			if telegramBotToken != "" && telegramChatId != "" {
				SendTelegramMessage(telegramBotToken, telegramChatId, "Auto Checkinout error: "+err.Error())
			}
		} else {
			fmt.Println("[SUCCESS] Check-in/out completed successfully.")
			if telegramBotToken != "" && telegramChatId != "" {
				SendTelegramMessage(telegramBotToken, telegramChatId, "Auto Checkinout success")
			}
		}
	})

	// Checkout 17:40PM
	c.AddFunc("40 17 * * 1-5", func() {
		fmt.Println("[INFO] Running check-out job ...")
		err := ClvAutoCheckinout(username, password)
		if err != nil {
			log.Printf("[ERROR] Check-out failed: %v\n", err)
			if telegramBotToken != "" && telegramChatId != "" {
				SendTelegramMessage(telegramBotToken, telegramChatId, "Auto Checkinout error: "+err.Error())
			}
		} else {
			fmt.Println("[SUCCESS] Check-in/out completed successfully.")
			if telegramBotToken != "" && telegramChatId != "" {
				SendTelegramMessage(telegramBotToken, telegramChatId, "Auto Checkinout success")
			}
		}
	})

	c.Start()
	select {} // Block forever
}
