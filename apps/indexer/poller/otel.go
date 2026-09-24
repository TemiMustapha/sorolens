package poller

import (
	"context"
	"os"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

func InitTracer() (*sdktrace.TracerProvider, error) {
	ctx := context.Background()
	var exp sdktrace.SpanExporter
	var err error

	if endpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT"); endpoint != "" {
		exp, err = otlptracegrpc.New(ctx, otlptracegrpc.WithEndpoint(endpoint))
		if err != nil {
			return nil, err
		}
	} else {
		// Noop exporter
		exp = sdktrace.NewNoopExporter()
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String("indexer"),
		)),
	)
	otel.SetTracerProvider(tp)
	return tp, nil
}
