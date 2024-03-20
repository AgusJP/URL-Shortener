bash:
	docker run --rm
	-v ${PWD}:/app
	-w /app
	-it node:20 bash

build:
	docker build -t url-shortener .

start:
	docker run -p 3000:3000 url-shortener

start-all:
	docker compose up