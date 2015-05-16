var fs = require("fs");
var minimist = require("minimist");
var recast = require("recast");

var transform = require("./transform");

var VALID_OUTPUT_MODES = ["syntaxTreePreTransform", "syntaxTreePostTransform", "transformedFile"];

function writeOutput (outputFile, contents, callback) {
    if (outputFile) {
        fs.writeFile(outputFile, contents, "utf8", callback);
    } else {
        console.log(contents);
        callback();
    }
}

function onOutput (err) {
    if (err) throw err;
    process.exit(0);
}

function validateOptions (options) {
    if (!options.inputFile) {
        throw new Error("No input file was provided");
    }

    if (VALID_OUTPUT_MODES.indexOf(options.outputMode) === -1) {
        throw new Error("Invalid output mode");
    }
}

function processFile (options) {
    validateOptions(options);

    fs.readFile(options.inputFile, "utf8", function (err, contents) {
        if (err) throw err;

        var syntax = recast.parse(contents);

        switch (options.outputMode) {
            case "syntaxTreePreTransform":
                writeOutput(
                    options.outputFile,
                    JSON.stringify(syntax, null, 4),
                    onOutput
                );
                break;

            case "syntaxTreePostTransform":
                syntax = transform(syntax);
                writeOutput(
                    options.outputFile,
                    JSON.stringify(syntax, null, 4),
                    onOutput
                );
                break;

            case "transformedFile":
                syntax = transform(syntax);
                writeOutput(
                    options.outputFile,
                    recast.print(syntax).code,
                    onOutput
                );
                break;
        }
    });
}

module.exports = processFile;

if (require.main === module) {
    var argv = minimist(process.argv.slice(2), {
        default: {
            outputMode: "transformedFile",
            outputFile: null
        }
    });

    var options = {
        inputFile: argv._[0],
        outputFile: argv.outputFile,
        outputMode: argv.outputMode
    };

    processFile(options);

    // Ensure stdout flushes
    process.on("exit", function (exitCode) {
        process.exit(exitCode);
    });
}
