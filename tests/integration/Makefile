integration-test:
	docker-compose up -d --build
	docker-compose run --rm mock-rpc sh -c "sleep 5"
	go test ./... -v -tags=integration
	docker-compose down
