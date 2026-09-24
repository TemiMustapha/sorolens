package router

import (
	"testing"
	"net/http"
	"net/http/httptest"
)

func TestOTelMiddleware(t *testing.T) {
	tp, err := InitTracer("test")
	if err != nil {
		t.Fatalf("InitTracer failed: %v", err)
	}
	defer tp.Shutdown(nil)

	handler := OTelMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "/test", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
}
