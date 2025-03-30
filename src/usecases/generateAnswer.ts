import * as vscode from "vscode";
import { sendRequest } from "../copilot/sendRequest";
import { VectorDBClient } from "../db-clients/vectorDBClient";
import { MAX_RESULTS } from "../settings/settings";

/**
 * ユーザーの質問に対する回答を生成する関数
 * @param stream - チャットレスポンスストリーム
 * @param prompt - ユーザーの質問
 * @param vectorDB - ベクターデータベースクライアント
 * @param token - キャンセルトークン
 */
export const generateAnswer = async (
  stream: vscode.ChatResponseStream,
  prompt: string,
  vectorDB: VectorDBClient,
  token: vscode.CancellationToken,
): Promise<void> => {
  // ベクトルDBから関連するドキュメントを検索
  const vectorResults = await vectorDB.searchDocuments(prompt, MAX_RESULTS);

  // 言語モデルのためのメッセージを準備
  const messages = [
    vscode.LanguageModelChatMessage.User(`関連するドキュメントの内容:
		${vectorResults}

		ユーザーの質問: ${prompt}

		可能であれば、上記の内容を参考にして包括的な回答をしてください。`),
  ];

  const chatResponse = await sendRequest(messages, token);

  for await (const fragment of chatResponse.text) {
    stream.markdown(fragment);
  }
};
