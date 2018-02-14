import * as chalk from "chalk";
import * as path from "path";
import {IVirtualDeviceValidatorResult, ValidatorError} from "./VirtualDeviceValidator";

const TEST_NAME_LENGTH = 20;
const TEST_PROPERTY_LENGTH = 10;
const TEST_ACTUAL_LENGTH = 30;
const TEST_EXPECTED_LENGTH = 30;
const TAB = "  ";
export class ConsolePrinter {
    private static rpad(s: string | string [] | null | undefined, padString: string, length: number) {
        if (!s) {
            s = "";
        }

        if (Array.isArray(s)) {
            s = s.toString();
        }

        while (s.length < length) {
            s = s + padString;
        }
        return s.substring(0, length);
    }

    private static concat(buffer: string, line: string, error: boolean): string {
        let color = chalk.default.green;
        if (error) {
            color = chalk.default.red;
        }
        buffer += color(line) + "\n";
        return buffer;
    }

    public printResultsByFile(resultsByFile: {[id: string]: IVirtualDeviceValidatorResult}): string {
        let output = "";
        for (const file of Object.keys(resultsByFile)) {
            const result = resultsByFile[file];
            const shortFile = path.basename(file);
            output += this.printResult(shortFile, result);
        }
        return output;
    }

    public printResult(name: string, result: IVirtualDeviceValidatorResult): string {
        let out = chalk.default.green;
        if (result.result !== "success") {
            out = chalk.default.red;
        }

        let line = name + "\n";
        let output = out(line);
        for (const testResult of result.tests) {
            // Print out the sequence name on its own line
            if (testResult.test.sequenceIndex === 1) {
                const sequenceLine = TAB + "Sequence " + testResult.test.sequence + ": " + testResult.test.input;
                output = ConsolePrinter.concat(output, sequenceLine, result.result !== "success");
            }

            line = TAB + TAB;
            if (testResult.result !== "success") {
                const error = (testResult.errors as ValidatorError[])[0];
                line += ConsolePrinter.rpad(testResult.test.input, " ", TEST_NAME_LENGTH)
                    + "  " + ConsolePrinter.rpad(error.property, " ", TEST_PROPERTY_LENGTH)
                    + "  Actual: " + ConsolePrinter.rpad(error.actual, " ", TEST_ACTUAL_LENGTH)
                    + "  Expected: " + ConsolePrinter.rpad(error.expected, " ", TEST_EXPECTED_LENGTH);
                output = ConsolePrinter.concat(output, line, true);
            } else {
                const actual = testResult.actual ? testResult.actual.transcript : "";
                const expected = testResult.test.expected ? testResult.test.expected.transcript : "";
                line += ConsolePrinter.rpad(testResult.test.input, " ", TEST_NAME_LENGTH)
                    + "  " + ConsolePrinter.rpad("transcript", " ", TEST_PROPERTY_LENGTH)
                    + "  Actual: " + ConsolePrinter.rpad(actual, " ", TEST_ACTUAL_LENGTH)
                    + "  Expected: " + ConsolePrinter.rpad(expected, " ", TEST_EXPECTED_LENGTH);
                output = ConsolePrinter.concat(output, line, false);
            }
        }
        return output;
    }
}
