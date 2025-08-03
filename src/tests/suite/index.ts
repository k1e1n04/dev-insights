import Mocha from "mocha";
import glob from "glob";
import * as path from "path";

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: "tdd" });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((resolve, reject) => {
    glob("**/*.test.js", { cwd: testsRoot }, (err: NodeJS.ErrnoException | null, files: string[]) => {
      if (err) {
        return reject(err);
      }

      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
