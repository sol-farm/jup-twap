.PHONY: build
build: docker-build docker-save

.PHONY: docker-build
docker-build:
	docker build -t tulip-protocol/jup-twap:latest .

.PHONY: docker-save
docker-save:
	docker image save tulip-protocol/jup-twap:latest -o tulip_protocol_jup_twap.tar
	pigz -f -9 tulip_protocol_jup_twap.tar