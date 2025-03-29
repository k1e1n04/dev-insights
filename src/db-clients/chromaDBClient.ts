import { ChromaClient, Collection, Metadata } from "chromadb";
import * as crypto from "crypto";
import { VectorDBClient } from "./vectorDBClient";

const VECTOR_DB_COLLECTION_NAME = "markdown_documents";

interface DocumentMetadata extends Metadata {
  filename: string;
  path: string;
  embedding_version: string;
}

/**
 * ChromaDBを使用したベクターデータベースクライアントの実装
 */
export class ChromaDBClient implements VectorDBClient {
  private client: ChromaClient;
  private collection: Collection | null = null;

  constructor(client: ChromaClient) {
    this.client = client;
  }

  async initializeCollection(): Promise<void> {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: VECTOR_DB_COLLECTION_NAME,
      });
    } catch (error) {
      throw new Error(`コレクションの初期化に失敗しました: ${error}`);
    }
  }

  async importFiles(filePath: string, fileContent: string): Promise<void> {
    try {
      // ファイルパスをIDとして使用
      const documentId = crypto
        .createHash("md5")
        .update(filePath)
        .digest("hex");

      // メタデータを作成
      const metadata: DocumentMetadata = {
        filename: filePath,
        path: filePath,
        embedding_version: "1.0",
      };

      if (!this.collection) {
        throw new Error("コレクションが初期化されていません");
      }

      // 既存データの確認
      const existingDocs = await this.collection.get({ ids: [documentId] });

      if (existingDocs && existingDocs.ids.length > 0) {
        // 既存のデータがある場合は更新
        await this.collection.update({
          ids: [documentId],
          documents: [fileContent],
          metadatas: [metadata],
        });
      } else {
        // 新規データとして追加
        await this.collection.add({
          ids: [documentId],
          documents: [fileContent],
          metadatas: [metadata],
        });
      }
    } catch (error) {
      throw new Error(`ドキュメントのインポートに失敗しました: ${error}`);
    }
  }

  async searchDocuments(prompt: string, maxResults: number): Promise<string> {
    try {
      if (!this.collection) {
        throw new Error("コレクションが初期化されていません");
      }
      const results = await this.collection.query({
        queryTexts: [prompt],
        nResults: maxResults,
      });
      return (
        results?.documents?.join("\n\n") ||
        "関連するドキュメントは見つかりませんでした。"
      );
    } catch (error) {
      throw new Error(`ベクターデータベースの検索に失敗しました: ${error}`);
    }
  }
}
