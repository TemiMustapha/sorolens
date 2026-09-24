package router

import (
	"net/http"
)

func OTelMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// tracing logic goes here
		next.ServeHTTP(w, r)
	})
}
