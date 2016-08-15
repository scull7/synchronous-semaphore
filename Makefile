NODE_BIN=./node_modules/.bin


test:
	${NODE_BIN}/istanbul cover ${NODE_BIN}/_mocha test


.PHONY: test
