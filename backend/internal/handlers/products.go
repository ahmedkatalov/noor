package handlers

import (
	"context"
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/models"
	"coffeeshop-backend/internal/utils"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type ProductsHandler struct {
	DB *db.DB
}

func (h *ProductsHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	rows, err := h.DB.Pool.Query(ctx, `
		SELECT 
			id, name, description, price, category, image_url,
			category_id, subcategory_id,
			is_active, created_at
		FROM products
		WHERE is_active = TRUE
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	products := make([]models.Product, 0, 64)
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL,
			&p.CategoryID, &p.SubcategoryID,
			&p.IsActive, &p.CreatedAt,
		); err != nil {
			http.Error(w, "DB scan error", http.StatusInternalServerError)
			return
		}
		products = append(products, p)
	}

	utils.JSON(w, 200, products)
}

func (h *ProductsHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Поддерживаем и старое (category string), и новое (category_id/subcategory_id)
	var p struct {
		Name          string `json:"name"`
		Description   string `json:"description"`
		Price         int    `json:"price"`
		Category      string `json:"category"` // legacy
		CategoryID    *int   `json:"category_id"`
		SubcategoryID *int   `json:"subcategory_id"`
		ImageURL      string `json:"image_url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if p.Name == "" || p.Price <= 0 {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	// Если вообще ничего не пришло — отклоняем (чтобы не было “без категории” случайно)
	if (p.CategoryID == nil) && (p.Category == "") {
		http.Error(w, "Category required", http.StatusBadRequest)
		return
	}

	var id int
	err := h.DB.Pool.QueryRow(ctx, `
		INSERT INTO products (
			name, description, price, category, image_url,
			category_id, subcategory_id
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`,
		p.Name,
		p.Description,
		p.Price,
		p.Category, // legacy string можно оставить пустым (когда используешь category_id)
		p.ImageURL,
		p.CategoryID,
		p.SubcategoryID,
	).Scan(&id)

	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	utils.JSON(w, 201, map[string]any{"id": id})
}

func (h *ProductsHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	idStr := mux.Vars(r)["id"]
	id, _ := strconv.Atoi(idStr)
	if id <= 0 {
		http.Error(w, "Bad id", http.StatusBadRequest)
		return
	}

	_, err := h.DB.Pool.Exec(ctx, `UPDATE products SET is_active=FALSE WHERE id=$1`, id)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}

	utils.JSON(w, 200, map[string]string{"status": "deleted"})
}
