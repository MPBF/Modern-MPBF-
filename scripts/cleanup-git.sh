#!/usr/bin/env bash
# تنظيف إعدادات git القديمة — شغّل هذا السكربت من نافذة Shell:
#   bash scripts/cleanup-git.sh
set -u

echo "==> إزالة ملفات القفل القديمة..."
find .git/refs -name '*.lock' -delete 2>/dev/null

echo "==> حذف الـ remotes الميتة (repl-* و subrepl-*)..."
for r in $(git remote | grep -E '^(subrepl-|repl-)'); do
  git remote remove "$r" && echo "  حُذف: $r"
done

echo "==> إصلاح إعداد تتبع الفرع main المكرر..."
git config --unset-all branch.main.remote 2>/dev/null
git config --unset-all branch.main.merge 2>/dev/null
git config branch.main.remote origin
git config branch.main.merge refs/heads/main

echo ""
echo "==> التحقق النهائي:"
echo "الـ remotes المتبقية:"
git remote
echo ""
git status -sb | head -2
echo ""
echo "آخر 5 commits (يجب أن تكون كما هي):"
git log --oneline -5
echo ""
echo "✔ اكتمل التنظيف بنجاح"
