package models

import "time"

type Product struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       int    `json:"price"`

	// ✅ legacy (старый фронт)
	Category string `json:"category"`

	// ✅ новые поля под категории/подкатегории
	CategoryID    *int `json:"category_id"`
	SubcategoryID *int `json:"subcategory_id"`

	ImageURL    string    `json:"image_url"`
	IsActive    bool      `json:"is_active"`
	IsAvailable bool      `json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
}

type Settings struct {
	BrandName      string `json:"brand_name"`
	HomeBackground string `json:"home_background"`
	MenuBackground string `json:"menu_background"`
	LogoURL        string `json:"logo_url"`

	WhatsappPhone string `json:"whatsapp_phone"`
	Currency      string `json:"currency"`

	AccentColor string `json:"accent_color"`
}

type Category struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	ParentID  *int      `json:"parent_id"` // null = корневая категория
	Sort      int       `json:"sort"`
	CreatedAt time.Time `json:"created_at"`
}
