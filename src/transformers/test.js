var extend = require("extend");

module.exports = {
    matches: function (context) {
        var node = context.node;

        return node.type === "CallExpression" &&
            node.callee &&
            node.callee.type === "Identifier" &&
            node.callee.name === "test";
    },
    onMatch: function (context) {
        var node = context.node;
        var testCallbackArgument = node.arguments &&
            node.arguments[1] &&
            (node.arguments[1].type === "FunctionExpression"
                ? node.arguments[1] : node.arguments[2]);

        var shouldAddAssert = testCallbackArgument &&
            testCallbackArgument.params &&
            testCallbackArgument.params.length === 0;

        if (shouldAddAssert) {
            testCallbackArgument.params.push({
                type: "Identifier",
                name: "assert"
            });
        }

        var updatedValue = extend({}, node, {
            callee: {
                type: "MemberExpression",
                computed: false,
                object: {
                    type: "Identifier",
                    name: "QUnit"
                },
                property: {
                    type: "Identifier",
                    name: "test"
                }
            }
        });

        context.update(updatedValue);
    }
};
