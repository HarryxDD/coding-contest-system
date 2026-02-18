up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

shell:
	docker compose exec api /bin/bash

seed:
	docker compose exec api npm run seed:run

clean:
	docker compose down -v
