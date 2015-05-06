var extend = require("extend");

module.exports = {
    matches: function (node) {
        return node.type === "CallExpression" &&
            node.callee &&
            node.callee.type === "Identifier" &&
            node.callee.name === "test";
    },
    onMatch: function (node, context) {
        var shouldAddAssert = node.arguments &&
            node.arguments[1] &&
            node.arguments[1].params &&
            node.arguments[1].params.length === 0;

        if (shouldAddAssert) {
            node.arguments[1].params.push({
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