import * as assert from "assert";
import * as sinon from "sinon";
import * as crypto from "crypto";
import { ChromaDBClient } from "../../../db-clients/chromaDBClient";
import { ChromaClient, Collection, IncludeEnum } from "chromadb";

suite("ChromaDBClient Tests", () => {
  let client: ChromaDBClient;
  let mockChromaClient: sinon.SinonStubbedInstance<ChromaClient>;
  let mockCollection: sinon.SinonStubbedInstance<Collection>;

  setup(() => {
    mockCollection = {
      name: "markdown_documents",
      get: sinon.stub(),
      add: sinon.stub(),
      update: sinon.stub(),
      query: sinon.stub(),
    } as unknown as sinon.SinonStubbedInstance<Collection>;

    mockChromaClient = sinon.createStubInstance(ChromaClient);
    mockChromaClient.getOrCreateCollection.resolves(mockCollection);

    // `ChromaDBClient` のインスタンスを初期化
    client = new ChromaDBClient(mockChromaClient);
  });

  teardown(() => {
    // モック・スタブをリセット
    sinon.restore();
  });

  test("should successfully initialize the collection", async () => {
    await client.initializeCollection();
    sinon.assert.calledOnce(mockChromaClient.getOrCreateCollection);
    sinon.assert.calledWith(mockChromaClient.getOrCreateCollection, {
      name: "markdown_documents",
    });
  });

  test("should handle errors during collection initialization", async () => {
    const errorMessage = "Initialization failed";
    mockChromaClient.getOrCreateCollection.rejects(new Error(errorMessage));

    try {
      await client.initializeCollection();
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        `コレクションの初期化に失敗しました: Error: ${errorMessage}`,
      );
    }
  });

  test("should successfully import a new file", async () => {
    const mockFilePath = "/path/to/file.md";
    const mockFileContent = "Sample file content";
    const mockDocumentId = crypto
      .createHash("md5")
      .update(mockFilePath)
      .digest("hex");

    mockCollection.get.resolves({
      ids: [],
      embeddings: null,
      documents: [],
      metadatas: [],
      included: [],
    });

    await client.initializeCollection();
    await client.importFiles(mockFilePath, mockFileContent);

    sinon.assert.calledWith(mockCollection.add, {
      ids: [mockDocumentId],
      documents: [mockFileContent],
      metadatas: [
        {
          filename: mockFilePath,
          path: mockFilePath,
          embedding_version: "1.0",
        },
      ],
    });
  });

  test("should update an existing document during import", async () => {
    const mockFilePath = "/path/to/file.md";
    const mockFileContent = "Updated file content";
    const mockDocumentId = crypto
      .createHash("md5")
      .update(mockFilePath)
      .digest("hex");

    mockCollection.get.resolves({
      ids: [mockDocumentId],
      embeddings: null,
      documents: [mockFileContent],
      metadatas: [],
      included: [],
    });

    await client.initializeCollection();
    await client.importFiles(mockFilePath, mockFileContent);

    sinon.assert.calledWith(mockCollection.update, {
      ids: [mockDocumentId],
      documents: [mockFileContent],
      metadatas: [
        {
          filename: mockFilePath,
          path: mockFilePath,
          embedding_version: "1.0",
        },
      ],
    });
  });

  test("should handle collection not initialized error during import", async () => {
    const mockFilePath = "/path/to/file.md";
    const mockFileContent = "Sample file content";

    try {
      await client.importFiles(mockFilePath, mockFileContent);
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "ドキュメントのインポートに失敗しました: Error: コレクションが初期化されていません",
      );
    }
  });

  test("should perform a query and return results", async () => {
    const mockPrompt = "search query";
    const mockResults = {
      ids: [["id1", "id2"]],
      embeddings: null,
      documents: [["doc1"], ["doc2"]],
      metadatas: [[null, null]],
      distances: [[0.1, 0.2]],
      included: ["documents"] as IncludeEnum[],
    };

    mockCollection.query.resolves(mockResults);

    await client.initializeCollection();
    const result = await client.searchDocuments(mockPrompt, 5);

    sinon.assert.calledWith(mockCollection.query, {
      queryTexts: [mockPrompt],
      nResults: 5,
    });
    assert.strictEqual(result, "doc1\n\ndoc2");
  });

  test("should handle empty query results", async () => {
    const mockPrompt = "search query";
    const mockResults = {
      ids: [[]],
      embeddings: null,
      documents: [[]],
      metadatas: [[]],
      distances: [[]],
      included: ["documents"] as IncludeEnum[],
    };

    mockCollection.query.resolves(mockResults);

    await client.initializeCollection();
    const result = await client.searchDocuments(mockPrompt, 5);

    assert.strictEqual(result, "関連するドキュメントは見つかりませんでした。");
  });

  test("should handle errors during a query", async () => {
    const mockPrompt = "search query";
    const errorMessage = "Query failed";

    mockCollection.query.rejects(new Error(errorMessage));

    await client.initializeCollection();

    try {
      await client.searchDocuments(mockPrompt, 5);
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        `ベクターデータベースの検索に失敗しました: Error: ${errorMessage}`,
      );
    }
  });

  test("should handle collection not initialized error during search", async () => {
    const mockPrompt = "search query";

    try {
      await client.searchDocuments(mockPrompt, 5);
    } catch (error) {
      assert.strictEqual(
        (error as Error).message,
        "ベクターデータベースの検索に失敗しました: Error: コレクションが初期化されていません",
      );
    }
  });
});
