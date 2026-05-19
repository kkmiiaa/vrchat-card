#!/bin/bash
# PreToolUse hook: main へのPRマージ・作成をブロックする

input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // empty')

if [ -z "$cmd" ]; then exit 0; fi

# gh pr create --base main のブロック
if echo "$cmd" | grep -qE "gh pr (create|merge)"; then
  if echo "$cmd" | grep -qE "\-\-base[= ]main"; then
    echo "[BLOCKED] main ブランチへのPR作成・マージは禁止されています" >&2
    exit 2
  fi

  # gh pr merge <number> の場合、PRのベースブランチを確認
  if echo "$cmd" | grep -qE "gh pr merge"; then
    pr_num=$(echo "$cmd" | grep -oE "gh pr merge [0-9]+" | grep -oE "[0-9]+")
    if [ -n "$pr_num" ]; then
      base=$(gh pr view "$pr_num" --json baseRefName -q .baseRefName 2>/dev/null)
      if [ "$base" = "main" ]; then
        echo "[BLOCKED] PR #$pr_num のベースブランチは main です。mainへのマージは禁止されています" >&2
        exit 2
      fi
    fi
  fi
fi

exit 0
