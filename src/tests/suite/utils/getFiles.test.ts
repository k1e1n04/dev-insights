import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { getFiles } from '../../../utils/getFiles';
import { SUPPORTED_EXTENSIONS } from '../../../constants/supportedExtensions';
import { EXCLUDED_DIRS } from '../../../constants/excludeDirs';

suite('getFiles Tests', () => {
	let readdirSyncStub: sinon.SinonStub;
	let statSyncStub: sinon.SinonStub;

	setup(() => {
		readdirSyncStub = sinon.stub(fs, 'readdirSync');
		statSyncStub = sinon.stub(fs, 'statSync');
	});

	teardown(() => {
		sinon.restore(); // スタブをリセット
	});

	test('should return files with supported extensions', () => {
		const mockDir = '/mockDir';
		const mockFiles = ['file1.md', 'file2.txt', 'file3.js', 'file4.md', 'file5.mp4'];
		const mockFilePaths = mockFiles.map((file) => path.join(mockDir, file));

		// `fs.readdirSync` の戻り値をモック
		readdirSyncStub.withArgs(mockDir).returns(mockFiles);

		// すべてのファイルを `isFile` にする
		statSyncStub.callsFake((_) => ({
			isDirectory: () => false,
			isFile: () => true,
		}));

		const result = getFiles(mockDir);

		// `SUPPORTED_EXTENSIONS` のみにフィルタリングされることを確認
		const expectedFiles = mockFilePaths.filter((file) =>
			SUPPORTED_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`)),
		);

		sinon.assert.match(result, expectedFiles);
	});

	test('should ignore excluded directories', () => {
		const mockDir = '/mockDir';
		const mockEntries = ['file1.md', 'node_modules', 'file2.md', '.git', 'subdir'];

		readdirSyncStub.withArgs(mockDir).returns(mockEntries);

		// `node_modules` や `.git` はディレクトリ、それ以外はファイル
		statSyncStub.callsFake((filePath) => ({
			isDirectory: () => EXCLUDED_DIRS.includes(path.basename(filePath)),
			isFile: () => !EXCLUDED_DIRS.includes(path.basename(filePath)),
		}));

		const result = getFiles(mockDir);

		// `EXCLUDED_DIRS` に含まれるディレクトリは無視されることを確認
		const expectedFiles = [
			path.join(mockDir, 'file1.md'),
			path.join(mockDir, 'file2.md'),
		];

		sinon.assert.match(result, expectedFiles);
	});

	test('should recursively scan subdirectories', () => {
		const mockDir = '/mockDir';
		const subDir = path.join(mockDir, 'subdir');
		const mockEntries = ['file1.md', 'subdir'];
		const subDirEntries = ['nested1.md', 'nested2.md'];

		// `fs.readdirSync` のデフォルトの戻り値を `[]` にすることで undefined を防ぐ
		readdirSyncStub.returns([]);
		readdirSyncStub.withArgs(mockDir).returns(mockEntries);
		readdirSyncStub.withArgs(subDir).returns(subDirEntries);

		statSyncStub.callsFake((filePath) => ({
			isDirectory: () => filePath === subDir,  // subdir のみディレクトリとして認識
			isFile: () => filePath !== subDir,
		}));

		const result = getFiles(mockDir);

		const expectedFiles = [
			path.join(mockDir, 'file1.md'),
			path.join(subDir, 'nested1.md'),
			path.join(subDir, 'nested2.md'),
		];

		sinon.assert.match(result, expectedFiles);
	});
});
