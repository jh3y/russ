PHONY: help

NPM = ./node_modules/.bin
BABEL = $(NPM)/babel
MOCHA = $(NPM)/mocha
ESLINT = $(NPM)/eslint

help:
	@grep -E '^[a-zA-Z\._-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Set up project
	npm install

build: ## Build bolt
	$(BABEL) src/ -d ./

watch: ## Watcher for babel
	$(BABEL) src/ --watch -d ./

clean: ## Clean out build files
	rm -rf lib test

lint: ## Lint src using es2015
	$(ESLINT) src/

dev: ## Develop bolt
	make build && make watch

runTest: ## Run bolt tests
	$(MOCHA) -u tdd --reporter spec
