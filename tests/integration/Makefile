integration-test:
	docker-compose up -d postgres redis
	go test ./... -v -tags=integration
	docker-compose down
