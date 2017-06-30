PHONY: help

MODULES = ./node_modules/.bin
MOCHA = $(MODULES)/mocha
ESLINT = $(MODULES)/eslint

SRC = src/
DEST = ./

TESTOPTS = -u tdd --reporter spec

help:
	@grep -E '^[a-zA-Z\._-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Set up project
	yarn

lint: ## Lint src using es2015
	$(ESLINT) $(SRC)

run-tests: ## Run tests
	$(MOCHA) $(TESTOPTS)
