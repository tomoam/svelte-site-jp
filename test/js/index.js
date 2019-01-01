import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import { loadConfig, svelte } from "../helpers.js";

describe("js", () => {
	fs.readdirSync("test/js/samples").forEach(dir => {
		if (dir[0] === ".") return;

		// add .solo to a sample directory name to only run that test
		const solo = /\.solo/.test(dir);

		if (solo && process.env.CI) {
			throw new Error("Forgot to remove `solo: true` from test");
		}

		(solo ? it.only : it)(dir, () => {
			dir = path.resolve("test/js/samples", dir);
			const config = loadConfig(`${dir}/_config.js`);

			const input = fs.readFileSync(`${dir}/input.html`, "utf-8").replace(/\s+$/, "");

			let actual;

			try {
				const options = Object.assign(config.options || {}, {
					shared: true
				});

				actual = svelte.compile(input, options).js.code.replace(/generated by Svelte v\d+\.\d+\.\d+(-\w+)?/, 'generated by Svelte vX.Y.Z');
			} catch (err) {
				console.log(err.frame);
				throw err;
			}

			const output = `${dir}/_actual.js`;
			fs.writeFileSync(output, actual);

			const expected = fs.readFileSync(`${dir}/expected.js`, "utf-8");

			assert.equal(
				actual.trim().replace(/^[ \t]+$/gm, ""),
				expected.trim().replace(/^[ \t]+$/gm, "")
			);
		});
	});
});