import * as vscode from 'vscode';
import { getFiles } from '../utils/getFiles';
import { VectorDBClient } from '../db-clients/vectorDBClient';

/**
 * importFIles コマンドのアクション
 * @param stream - チャットレスポンスストリーム
 * @param vectorDB - ベクターデータベースクライアント
 */
export const importFiles = async (
	stream: vscode.ChatResponseStream,
	vectorDB: VectorDBClient,
): Promise<void> => {
	// ディレクトリを選択してその中のファイルをインポート
	const folderUri = await vscode.window.showOpenDialog({
		canSelectFolders: true,
		openLabel: 'フォルダを選択',
		filters: {
			フォルダ: ['*'],
		},
	});

	if (folderUri && folderUri.length > 0) {
		const folderPath = folderUri[0].fsPath;

		const files = getFiles(folderPath);

		if (files.length > 0) {
			for (const file of files) {
				await vectorDB.importFiles(file);
			}
			stream.markdown(
				'ディレクトリ内のすべてのファイルをベクターデータベースにインポートしました。',
			);
		} else {
			stream.markdown('選択したディレクトリに対象ファイルは見つかりませんでした。');
		}
	}
};
