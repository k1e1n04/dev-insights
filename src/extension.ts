import * as vscode from "vscode";
import { registerParticipant } from "./registerParticipant";

/**
 * VSCodeの拡張機能がアクティブ化されたときに呼び出される関数
 * @param context - VSCodeの拡張機能コンテキスト
 */
export function activate(context: vscode.ExtensionContext) {
  registerParticipant(context);
}

export function deactivate() {}
