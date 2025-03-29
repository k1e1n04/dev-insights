import * as sinon from "sinon";
import * as vscode from "vscode";
import { sendRequest } from "../../../copilot/sendRequest";

suite("sendRequest Tests", () => {
  // scode.lm.selectChatModels
  let selectChatModelsStub: sinon.SinonStub;

  setup(() => {
    selectChatModelsStub = sinon.stub(vscode.lm, "selectChatModels");
  });

  teardown(() => {
    sinon.restore();
  });

  test("should send request to Copilot model", async () => {
    const messages = [
      vscode.LanguageModelChatMessage.User(`関連するドキュメントの内容:
				hoge

				ユーザーの質問: hoge

				可能であれば、上記の内容を参考にして包括的な回答をしてください。`),
    ];

    const token = new vscode.CancellationTokenSource().token;
    // AsyncGenerator を返す mockResponse を作成
    const mockResponse: vscode.LanguageModelChatResponse = {
      // text と stream メソッドが AsyncIterable<string> 型を返すようにする
      text: (async function* (): AsyncIterable<string> {
        yield "This is a test response";
      })(),
      stream: (async function* (): AsyncIterable<string> {
        yield "This is a test response";
      })(),
    };

    selectChatModelsStub.resolves([
      {
        sendRequest: async (
          _: vscode.LanguageModelChatMessage[],
          __?: vscode.LanguageModelChatRequestOptions,
          ___?: vscode.CancellationToken,
        ) => {
          return mockResponse;
        },
      },
    ]);

    const response = await sendRequest(messages, token);

    sinon.assert.calledOnce(selectChatModelsStub);
    sinon.assert.calledWith(selectChatModelsStub, {
      vendor: "copilot",
      family: "gpt-4o",
    });
    sinon.assert.match(response, mockResponse);
  });
});
