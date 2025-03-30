#!/bin/bash

# 再帰的に依存関係をリスト化する関数
function list_dependencies() {
  local package=$1
  local indent=$2

  # パッケージの依存関係を取得（dependencies, optionalDependencies, peerDependenciesを含める）
  dependencies=$(npm info "$package" dependencies optionalDependencies peerDependencies --json | jq -s 'add')

  # 依存関係が存在しない場合は終了
  if [ "$dependencies" == "null" ]; then
    return
  fi

  # 依存関係をループで処理
  echo "$dependencies" | jq -r 'keys[]' | while read -r dep; do
    echo "${indent}- $dep"
    # 再帰的に依存関係をリスト化
    list_dependencies "$dep" "  $indent"
  done
}

# メイン処理
echo "Dependencies for chromadb-default-embed:"
list_dependencies "chromadb-default-embed" ""
