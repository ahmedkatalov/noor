package main

import (
	"context"
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/handlers"
	"coffeeshop-backend/internal/middleware"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func runMigrations(databaseURL string) {
	// ✅ Улучшенный запуск миграций:
	// выполняем ВСЕ *.sql из папки migrations по порядку (001_..., 002_..., ...)
	files, err := os.ReadDir("migrations")
	if err != nil {
		log.Fatal("cannot read migrations dir:", err)
	}

	var sqlFiles []string
	for _, f := range files {
		if f.IsDir() {
			continue
		}
		name := f.Name()
		if strings.HasSuffix(name, ".sql") {
			sqlFiles = append(sqlFiles, filepath.Join("migrations", name))
		}
	}

	sort.Strings(sqlFiles)

	database, err := db.New(databaseURL)
	if err != nil {
		log.Fatal("cannot connect db:", err)
	}
	defer database.Close()

	for _, file := range sqlFiles {
		sqlBytes, err := os.ReadFile(file)
		if err != nil {
			log.Fatal("cannot read migration:", file, err)
		}
		if strings.TrimSpace(string(sqlBytes)) == "" {
			continue
		}

		if _, err := database.Pool.Exec(context.Background(), string(sqlBytes)); err != nil {
			log.Fatal("migration failed:", file, err)
		}

		log.Println("applied:", file)
	}

	log.Println("migrations applied ✅")
}

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL missing")
	}

	runMigrations(databaseURL)

	database, err := db.New(databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	r := mux.NewRouter()

	// handlers
	ph := &handlers.ProductsHandler{DB: database}
	sh := &handlers.SettingsHandler{DB: database}
	uh := &handlers.UploadHandler{}

	// ✅ НОВОЕ: категории/подкатегории (ты добавишь handlers)
	// ch := &handlers.CategoriesHandler{DB: database}

	// static uploads
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// public
	r.HandleFunc("/api/products", ph.ListProducts).Methods("GET")
	r.HandleFunc("/api/settings", sh.GetSettings).Methods("GET")

	// ✅ public categories (как только сделаешь handler)
	// r.HandleFunc("/api/categories", ch.ListCategories).Methods("GET")
	// r.HandleFunc("/api/categories/{id}/subcategories", ch.ListSubcategories).Methods("GET")

	// admin routes
	admin := r.PathPrefix("/api/admin").Subrouter()
	admin.Use(middleware.AdminAuth)

	// products
	admin.HandleFunc("/products", ph.CreateProduct).Methods("POST")
	admin.HandleFunc("/products/{id}", ph.DeleteProduct).Methods("DELETE")

	// settings
	admin.HandleFunc("/settings", sh.UpdateSettings).Methods("PUT")

	// upload
	admin.HandleFunc("/upload", uh.UploadImage).Methods("POST")

	// ✅ admin categories (как только сделаешь handler)
	// admin.HandleFunc("/categories", ch.CreateCategory).Methods("POST")
	// admin.HandleFunc("/categories/{id}", ch.DeleteCategory).Methods("DELETE")
	// admin.HandleFunc("/subcategories", ch.CreateSubcategory).Methods("POST")
	// admin.HandleFunc("/subcategories/{id}", ch.DeleteSubcategory).Methods("DELETE")

	// health
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	addr := fmt.Sprintf(":%s", port)
	log.Println("Backend running on", addr)
	log.Fatal(http.ListenAndServe(addr, withCORS(r)))
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// ⚠️ для продакшена лучше ограничить домен
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}

		next.ServeHTTP(w, r)
	})
}
