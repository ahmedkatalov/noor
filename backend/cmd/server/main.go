package main

import (
	"coffeeshop-backend/internal/db"
	"coffeeshop-backend/internal/handlers"
	"coffeeshop-backend/internal/middleware"
	"context"
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

	// ✅ categories
	cPub := &handlers.CategoriesPublicHandler{DB: database}
	cAdm := &handlers.CategoriesAdminHandler{DB: database}

	// static uploads
	r.PathPrefix("/uploads/").Handler(
		http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))),
	)

	// public
	r.HandleFunc("/api/products", ph.ListProducts).Methods("GET")
	r.HandleFunc("/api/settings", sh.GetSettings).Methods("GET")
	r.HandleFunc("/api/categories", cPub.List).Methods("GET")

	// admin routes
	admin := r.PathPrefix("/api/admin").Subrouter()
	admin.Use(middleware.AdminAuth)

	// products
	admin.HandleFunc("/products", ph.CreateProduct).Methods("POST")
	admin.HandleFunc("/products/{id}", ph.UpdateProduct).Methods("PUT")
	admin.HandleFunc("/products/{id}", ph.DeleteProduct).Methods("DELETE")
	admin.HandleFunc("/products/{id}/availability", ph.SetAvailability).Methods("PUT")

	// settings
	admin.HandleFunc("/settings", sh.UpdateSettings).Methods("PUT")

	// upload
	admin.HandleFunc("/upload", uh.UploadImage).Methods("POST")

	// categories (admin)
	admin.HandleFunc("/categories", cPub.List).Methods("GET")
	admin.HandleFunc("/categories", cAdm.Create).Methods("POST")
	admin.HandleFunc("/categories/{id}", cAdm.Delete).Methods("DELETE")

	// health
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	}).Methods("GET")

	addr := fmt.Sprintf(":%s", port)
	log.Println("Backend running on", addr)
	log.Fatal(http.ListenAndServe(addr, withCORS(r)))
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
