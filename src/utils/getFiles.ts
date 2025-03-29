import * as path from 'path';
import * as fs from 'fs';
import { SUPPORTED_EXTENSIONS } from '../constants/supportedExtensions';
import { EXCLUDED_DIRS } from '../constants/excludeDirs';

/**
 * 指定したディレクトリ内のファイルを再帰的に取得する関数
 * @param dirPath - 対象のディレクトリパス
 * @returns - 指定したディレクトリ内のファイルパスの配列
 */
export function getFiles(dirPath: string): string[] {
	let mdFiles: string[] = [];

	// ディレクトリ内のすべてのファイルとサブディレクトリを取得
	const files = fs.readdirSync(dirPath);

	for (const file of files) {
		const filePath = path.join(dirPath, file);
		const stat = fs.statSync(filePath);

		// 無視すべきディレクトリをスキップ
		if (stat.isDirectory() && EXCLUDED_DIRS.includes(file)) {
			continue; // 無視するディレクトリをスキップ
		}

		if (stat.isDirectory()) {
			// サブディレクトリなら再帰的に探索
			mdFiles = mdFiles.concat(getFiles(filePath));
		} else if (SUPPORTED_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`))) {
			// SUPPORTED_EXTENSIONSに含まれる拡張子のファイルをリストに追加
			mdFiles.push(filePath);
		}
	}

	return mdFiles;
}
