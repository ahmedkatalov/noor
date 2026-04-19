package handlers

import (
	"context"
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/utils"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
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
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	p.Name = strings.TrimSpace(p.Name)
	if p.Name == "" {
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

	utils.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *CategoriesAdminHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	idStr := mux.Vars(r)["id"] // ✅ ВАЖНО: mux, не chi
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}

	_, err = h.DB.Pool.Exec(ctx, `DELETE FROM categories WHERE id=$1`, id)
	if err != nil {
		http.Error(w, "cannot delete category", http.StatusInternalServerError)
		return
	}

	utils.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
