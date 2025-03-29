/**
 * ベクターデータベースクライアントを表すインターフェース
 */
export interface VectorDBClient {
	/**
	 * ベクターデータベースの初期化
	 */
	initializeCollection(): Promise<void>;

	/**
	 * ファイルをベクターデータベースにインポート
	 * @param fileContent - インポートするファイルの内容
	 */
	importFiles(fileContent: string): Promise<void>;

	/**
	 * ドキュメントを検索
	 * @param prompt - ユーザーが入力したプロンプト
	 * @param maxResults - 検索結果の最大数
	 * @returns - 検索結果のドキュメント
	 */
	searchDocuments(prompt: string, maxResults: number): Promise<string>;
}
