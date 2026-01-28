package handlers

import (
	"context"
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/models"
	"coffeeshop-backend/internal/utils"
	"encoding/json"
	"net/http"
	"os"
)

type SettingsHandler struct {
	DB *db.DB
}

func (h *SettingsHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	get := func(key string) string {
		var value string
		_ = h.DB.Pool.QueryRow(ctx, `SELECT value FROM settings WHERE key=$1`, key).Scan(&value)
		return value
	}

	// из базы
s := models.Settings{
	BrandName:     get("brand_name"),
	HomeBackground: get("home_background"),
	MenuBackground: get("menu_background"),
	LogoURL:        get("logo_url"),
	WhatsappPhone:  get("whatsapp_phone"),
	Currency:       get("currency"),
}

	// fallback в ENV если не заполнено в БД
	if s.WhatsappPhone == "" {
		s.WhatsappPhone = os.Getenv("WHATSAPP_PHONE")
	}
	if s.Currency == "" {
		s.Currency = os.Getenv("CURRENCY")
	}

	// fallback для названия (если хочешь — можешь в ENV тоже добавить BRAND_NAME)
	if s.BrandName == "" {
		if v := os.Getenv("BRAND_NAME"); v != "" {
			s.BrandName = v
		} else {
			s.BrandName = "Noor Coffee"
		}
	}

	utils.JSON(w, 200, s)
}

func (h *SettingsHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	var payload models.Settings
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	upsert := func(key, value string) {
		_, _ = h.DB.Pool.Exec(ctx, `
			INSERT INTO settings (key, value) VALUES ($1, $2)
			ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
		`, key, value)
	}

upsert("brand_name", payload.BrandName)
upsert("home_background", payload.HomeBackground)
upsert("menu_background", payload.MenuBackground)
upsert("logo_url", payload.LogoURL)
upsert("whatsapp_phone", payload.WhatsappPhone)
upsert("currency", payload.Currency)


	utils.JSON(w, 200, map[string]string{"status": "ok"})
}
