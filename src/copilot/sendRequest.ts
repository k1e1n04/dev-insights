import * as vscode from 'vscode';

/**
 * GitHub Copilot にリクエストを送信する関数
 * @param messages - メッセージ
 * @param token - キャンセルトークン
 * @returns - 言語モデルのチャットレスポンス
 */
export const sendRequest = async (
	messages: vscode.LanguageModelChatMessage[],
	token: vscode.CancellationToken,
): Promise<vscode.LanguageModelChatResponse> => {
	const [model] = await vscode.lm.selectChatModels({
		vendor: 'copilot',
		family: 'gpt-4o',
	});

	const chatResponse = await model.sendRequest(messages, {}, token);
	return chatResponse;
};
