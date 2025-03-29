import * as vscode from "vscode";
import { dbClientFactory } from "./db-clients/dbClientFuctory";
import { importFiles } from "./usecases/importFiles";
import { generateAnswer } from "./usecases/generateAnswer";

const CAT_PARTICIPANT_ID = "vscode-rag.devinsights";

/**
 * VSCodeの拡張機能の参加者を登録する関数
 * @param context - VSCodeの拡張機能コンテキスト
 */
export function registerParticipant(context: vscode.ExtensionContext) {
  const vectorDB = dbClientFactory("Chroma");

  const handler: vscode.ChatRequestHandler = async (
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ): Promise<vscode.ChatResult> => {
    try {
      await vectorDB.initializeCollection();
      if (request.command === "importFiles") {
        await importFiles(stream, vectorDB);
      } else {
        await generateAnswer(stream, request.prompt, vectorDB, token);
      }
    } catch (err) {
      // エラーハンドリング
      vscode.window.showErrorMessage(
        `チャットリクエストが失敗しました: ${err}`,
      );
      stream.markdown(
        "申し訳ありませんが、リクエストの処理中にエラーが発生しました。",
      );
    }

    return { metadata: { command: "" } };
  };

  const catParticipant = vscode.chat.createChatParticipant(
    CAT_PARTICIPANT_ID,
    handler,
  );
  catParticipant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "icon.png",
  );

  context.subscriptions.push(catParticipant);
}
