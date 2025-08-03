import * as vscode from "vscode";

// VSCodeの設定から取得する
const config = vscode.workspace.getConfiguration("devInsights");
export const DB_ENDPOINT: string = config.get(
  "documentVectorDB.endpoint",
  "http://localhost:8000",
);
export const MAX_RESULTS: number = config.get(
  "documentVectorDB.maxResults",
  5,
);
export const MODEL_NAME: string = config.get(
  "modelName",
  "gpt-4o",
);
