import * as sinon from "sinon";
import * as vscode from "vscode";
import { generateAnswer } from "../../../usecases/generateAnswer";
import * as sendRequestModule from "../../../copilot/sendRequest";
import { VectorDBClient } from "../../../db-clients/vectorDBClient";

suite("generateAnswer Tests", () => {
  let vectorDBStub: VectorDBClient;
  let sendRequestStub: sinon.SinonStub;
  let streamStub: vscode.ChatResponseStream;
  let token: vscode.CancellationToken;

  setup(() => {
    // モックの準備
    vectorDBStub = {
      searchDocuments: sinon.stub(),
    } as unknown as VectorDBClient;
    sendRequestStub = sinon.stub(sendRequestModule, "sendRequest");
    streamStub = {
      markdown: sinon.stub(),
    } as unknown as vscode.ChatResponseStream;
    token = new vscode.CancellationTokenSource().token;
  });

  teardown(() => {
    // モックのリセット
    sinon.restore();
  });

  test("should generate answer with relevant documents", async () => {
    const mockPrompt = "What is AI?";
    const mockVectorResults = "AI stands for Artificial Intelligence.";

    // ベクトルDBの検索結果をモック
    const stubSearchDocuments = vectorDBStub.searchDocuments as sinon.SinonStub;
    stubSearchDocuments.resolves(mockVectorResults);

    // sendRequest のモック
    const response: vscode.LanguageModelChatResponse = {
      text: (async function* (): AsyncIterable<string> {
        yield "AI is a branch of computer science."; // 期待値に合わせる
      })(),
      stream: (async function* (): AsyncIterable<string> {
        yield "AI is a branch of computer science."; // 期待値に合わせる
      })(),
    };
    sendRequestStub.resolves(response);

    const userMessage = vscode.LanguageModelChatMessage.User(
      `関連するドキュメントの内容:
		${mockVectorResults}

		ユーザーの質問: ${mockPrompt}

		可能であれば、上記の内容を参考にして包括的な回答をしてください。`,
    );

    // テスト対象の関数を呼び出し
    await generateAnswer(streamStub, mockPrompt, vectorDBStub, token);

    // ベクトルDBの検索が呼ばれたことを確認
    sinon.assert.calledOnce(stubSearchDocuments);
    sinon.assert.calledWith(stubSearchDocuments, mockPrompt, 5);

    // sendRequest が適切に呼ばれたことを確認
    sinon.assert.calledOnce(sendRequestStub);
    sinon.assert.calledWith(sendRequestStub, [userMessage], token);

    const markdownStub = streamStub.markdown as sinon.SinonStub;

    // stream.markdown に AI のレスポンスが送信されていることを確認
    sinon.assert.calledOnce(markdownStub);
    sinon.assert.calledWith(
      markdownStub,
      "AI is a branch of computer science.",
    ); // 期待値と一致
  });

  test("should generate answer with no relevant documents", async () => {
    const mockPrompt = "What is machine learning?";
    const mockVectorResults = "関連するドキュメントは見つかりませんでした。";

    const stubSearchDocuments = vectorDBStub.searchDocuments as sinon.SinonStub;
    stubSearchDocuments.resolves(Promise.resolve(mockVectorResults));

    // sendRequest のモック
    const mockResponse: vscode.LanguageModelChatResponse = {
      text: (async function* (): AsyncIterable<string> {
        yield "Machine learning is a subset of AI.";
      })(),
      stream: (async function* (): AsyncIterable<string> {
        yield "Machine learning is a subset of AI.";
      })(),
    };
    sendRequestStub.resolves(mockResponse);

    const markdownStub = streamStub.markdown as sinon.SinonStub;

    await generateAnswer(streamStub, mockPrompt, vectorDBStub, token);

    sinon.assert.calledOnce(stubSearchDocuments);
    sinon.assert.calledOnce(sendRequestStub);
    sinon.assert.calledOnce(markdownStub);
    sinon.assert.calledWith(
      markdownStub,
      "Machine learning is a subset of AI.",
    );
  });

  test("should handle error during document search", async () => {
    const mockPrompt = "What is deep learning?";
    const stubSearchDocuments = vectorDBStub.searchDocuments as sinon.SinonStub;
    stubSearchDocuments.rejects(new Error("Search error"));

    const markdownStub = streamStub.markdown as sinon.SinonStub;

    try {
      await generateAnswer(streamStub, mockPrompt, vectorDBStub, token);
    } catch {
      // エラーハンドリング: 失敗しても `sendRequest` は呼ばれないことを確認
      sinon.assert.notCalled(sendRequestStub);
      sinon.assert.notCalled(markdownStub);
    }
  });

  test("should handle error during sendRequest", async () => {
    const mockPrompt = "What is reinforcement learning?";
    const stubSearchDocuments = vectorDBStub.searchDocuments as sinon.SinonStub;
    stubSearchDocuments.resolves("Relevant document here.");
    sendRequestStub.rejects(new Error("API Error"));

    const markdownStub = streamStub.markdown as sinon.SinonStub;

    try {
      await generateAnswer(streamStub, mockPrompt, vectorDBStub, token);
    } catch {
      // `searchDocuments` は呼ばれている
      sinon.assert.calledOnce(stubSearchDocuments);
      sinon.assert.calledOnce(sendRequestStub);

      // `sendRequest` でエラーが出ても `markdown` が呼ばれていないことを確認
      sinon.assert.notCalled(markdownStub);
    }
  });
});
