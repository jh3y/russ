PHONY: help

MODULES = ./node_modules/.bin
BABEL = $(MODULES)/babel
MOCHA = $(MODULES)/mocha
ESLINT = $(MODULES)/eslint

SRC = src/
DEST = ./
CLEANUP = lib test

TESTOPTS = -u tdd --reporter spec

help:
	@grep -E '^[a-zA-Z\._-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Set up project
	npm install

build: ## Build bolt
	$(BABEL) $(SRC) -d $(DEST)

watch: build ## Watcher for babel
	$(BABEL) $(SRC) --watch -d $(DEST)

clean: ## Clean out build files
	rm -rf $(CLEANUP)

lint: ## Lint src using es2015
	$(ESLINT) $(SRC)

dev:## Develop bolt
	make watch

run-tests: ## Run bolt tests
	$(MOCHA) $(TESTOPTS)

update: ## Update node packages and dependencies
	node wipe-dependencies.js && rm -rf node_modules && npm update --save-dev && npm update --save
