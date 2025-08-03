import * as path from "path";
import * as fs from "fs";
import { SUPPORTED_EXTENSIONS } from "../constants/supportedExtensions";
import { EXCLUDED_DIRS } from "../constants/excludeDirs";

// ファイルシステム操作のインターface
export interface FileSystem {
  readdirSync: (path: string) => string[];
  statSync: (path: string) => { isDirectory: () => boolean; isFile: () => boolean };
}

// デフォルトのファイルシステム実装
const defaultFileSystem: FileSystem = {
  readdirSync: fs.readdirSync,
  statSync: fs.statSync,
};

/**
 * 指定したディレクトリ内のファイルを再帰的に取得する関数
 * @param dirPath - 対象のディレクトリパス
 * @param fileSystem - ファイルシステム操作（テスト用）
 * @returns - 指定したディレクトリ内のファイルパスの配列
 */
export function getFiles(dirPath: string, fileSystem: FileSystem = defaultFileSystem): string[] {
  let mdFiles: string[] = [];

  // ディレクトリ内のすべてのファイルとサブディレクトリを取得
  const files = fileSystem.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fileSystem.statSync(filePath);

    // 無視すべきディレクトリをスキップ
    if (stat.isDirectory() && EXCLUDED_DIRS.includes(file)) {
      continue; // 無視するディレクトリをスキップ
    }

    if (stat.isDirectory()) {
      // サブディレクトリなら再帰的に探索
      mdFiles = mdFiles.concat(getFiles(filePath, fileSystem));
    } else if (SUPPORTED_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`))) {
      // SUPPORTED_EXTENSIONSに含まれる拡張子のファイルをリストに追加
      mdFiles.push(filePath);
    }
  }

  return mdFiles;
}
