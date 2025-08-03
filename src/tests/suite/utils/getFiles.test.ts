import * as sinon from "sinon";
import * as path from "path";
import { getFiles, FileSystem } from "../../../utils/getFiles";
import { SUPPORTED_EXTENSIONS } from "../../../constants/supportedExtensions";
import { EXCLUDED_DIRS } from "../../../constants/excludeDirs";

suite("getFiles Tests", () => {
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    sandbox.restore();
  });

  test("should return files with supported extensions", () => {
    const mockDir = "/mockDir";
    const mockFiles = [
      "file1.md",
      "file2.txt",
      "file3.js",
      "file4.md",
      "file5.mp4",
    ];

    const mockFileSystem: FileSystem = {
      readdirSync: sandbox.stub().withArgs(mockDir).returns(mockFiles),
      statSync: sandbox.stub().returns({
        isDirectory: () => false,
        isFile: () => true,
      }),
    };

    const result = getFiles(mockDir, mockFileSystem);

    const expectedFiles = mockFiles
      .map((file) => path.join(mockDir, file))
      .filter((file) =>
        SUPPORTED_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`)),
      );

    sinon.assert.match(result, expectedFiles);
  });

  test("should ignore excluded directories", () => {
    const mockDir = "/mockDir";
    const mockEntries = [
      "file1.md",
      "node_modules",
      "file2.md",
      ".git",
      "subdir",
    ];

    const mockFileSystem: FileSystem = {
      readdirSync: sandbox.stub().withArgs(mockDir).returns(mockEntries),
      statSync: sandbox.stub().callsFake((filePath: string) => ({
        isDirectory: () => EXCLUDED_DIRS.includes(path.basename(filePath)),
        isFile: () => !EXCLUDED_DIRS.includes(path.basename(filePath)),
      })),
    };

    const result = getFiles(mockDir, mockFileSystem);

    const expectedFiles = [
      path.join(mockDir, "file1.md"),
      path.join(mockDir, "file2.md"),
    ];

    sinon.assert.match(result, expectedFiles);
  });

  test("should work with simple file", () => {
    const mockDir = "/mockDir";
    
    const mockFileSystem: FileSystem = {
      readdirSync: (_dirPath: string) => {
        return ["file1.md"];
      },
      statSync: (_filePath: string) => {
        return { isDirectory: () => false, isFile: () => true };
      },
    };

    const result = getFiles(mockDir, mockFileSystem);
    
    const expectedFiles = ["/mockDir/file1.md"];
    
    sinon.assert.match(result, expectedFiles);
  });
});
