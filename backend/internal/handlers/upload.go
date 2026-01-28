package handlers

import (
	"coffeeshop-backend/internal/utils"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type UploadHandler struct{}

func (h *UploadHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	// ✅ лимит = 100MB
	const maxUploadSize = 100 << 20 // 100MB

	// ✅ ограничиваем размер тела запроса (защита)
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)

	// ✅ парсим multipart form
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		http.Error(w, "file too large (max 100MB)", http.StatusRequestEntityTooLarge)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// ✅ разрешаем только безопасные расширения
	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}

	if !allowed[ext] {
		http.Error(w, "unsupported file type", http.StatusBadRequest)
		return
	}

	_ = os.MkdirAll("uploads", 0755)

	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	path := filepath.Join("uploads", name)

	dst, err := os.Create(path)
	if err != nil {
		http.Error(w, "cannot save", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "cannot write", http.StatusInternalServerError)
		return
	}

	utils.JSON(w, 200, map[string]string{
		"url": "/uploads/" + name,
	})
}
