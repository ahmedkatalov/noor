package handlers

import (
	"context"
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/models"
	"coffeeshop-backend/internal/utils"
	"net/http"
)

type CategoriesPublicHandler struct {
	DB *db.DB
}

func (h *CategoriesPublicHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	rows, err := h.DB.Pool.Query(ctx, `
		SELECT id, name, parent_id, sort, created_at
		FROM categories
		ORDER BY parent_id NULLS FIRST, sort ASC, id ASC
	`)
	if err != nil {
		http.Error(w, "cannot read categories", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	out := []models.Category{}
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.ParentID, &c.Sort, &c.CreatedAt); err != nil {
			http.Error(w, "bad categories row", http.StatusInternalServerError)
			return
		}
		out = append(out, c)
	}

	utils.JSON(w, 200, out)
}
