DOCKERHUB_USER ?= marinorodriguez
IMAGE_NAME ?= app-asistencia-frontend
IMAGE := $(DOCKERHUB_USER)/$(IMAGE_NAME)
VERSION ?= 1.1.1
PLATFORMS ?= linux/amd64,linux/arm64

.PHONY: buildx
buildx:
	docker buildx create --use --name multiarch-builder 2>/dev/null || docker buildx use multiarch-builder

.PHONY: build
build: buildx
	docker buildx build --platform $(PLATFORMS) -t $(IMAGE):$(VERSION) -f Dockerfile .

.PHONY: push
push: buildx
	docker buildx build --platform $(PLATFORMS) -t $(IMAGE):$(VERSION) -f Dockerfile . --push

.PHONY: release
release: push
