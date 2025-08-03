import { ChromaClient } from "chromadb";
import { DB_ENDPOINT } from "../settings/settings";
import { ChromaDBClient } from "./chromaDBClient";
import { VectorDBClient } from "./vectorDBClient";
import { VectorDBClientType } from "./vectorDBClientType";

/**
 * ベクターデータベースクライアントのファクトリ関数
 * @param type - 使用するベクターデータベースクライアントの種類
 */
export const dbClientFactory = (type: VectorDBClientType): VectorDBClient => {
  let chromaClient: ChromaClient;
  switch (type) {
    case "Chroma":
      chromaClient = new ChromaClient({
        path: DB_ENDPOINT,
        tenant: "default_tenant",
        database: "default_database",
      });
      return new ChromaDBClient(chromaClient);
    default:
      throw new Error(`Unsupported VectorDBClient type: ${type}`);
  }
};
