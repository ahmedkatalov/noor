package handlers

import (
	"context"
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/utils"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type CategoriesAdminHandler struct {
	DB *db.DB
}

type createCategoryPayload struct {
	Name     string `json:"name"`
	ParentID *int   `json:"parent_id"`
	Sort     *int   `json:"sort"`
}

func (h *CategoriesAdminHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	var p createCategoryPayload
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if len(p.Name) == 0 {
		http.Error(w, "name required", http.StatusBadRequest)
		return
	}

	sort := 0
	if p.Sort != nil {
		sort = *p.Sort
	}

	_, err := h.DB.Pool.Exec(ctx, `
		INSERT INTO categories (name, parent_id, sort)
		VALUES ($1, $2, $3)
	`, p.Name, p.ParentID, sort)
	if err != nil {
		http.Error(w, "cannot insert category", http.StatusInternalServerError)
		return
	}

	utils.JSON(w, 200, map[string]string{"status": "ok"})
}

func (h *CategoriesAdminHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}

	// ON DELETE CASCADE удалит подкатегории
	_, err = h.DB.Pool.Exec(ctx, `DELETE FROM categories WHERE id=$1`, id)
	if err != nil {
		http.Error(w, "cannot delete category", http.StatusInternalServerError)
		return
	}

	utils.JSON(w, 200, map[string]string{"status": "ok"})
}
