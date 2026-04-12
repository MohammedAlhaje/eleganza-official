#!/bin/zsh
set -euo pipefail

REPO_NAME="${1:-eleganza-site}"
OWNER="$(gh api user -q .login)"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI غير مثبت."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "أنت غير مسجل الدخول إلى GitHub."
  echo "نفّذ أولاً: gh auth login"
  exit 1
fi

if [ ! -d ".git" ]; then
  echo "هذا المجلد ليس repository."
  exit 1
fi

if ! git rev-parse HEAD >/dev/null 2>&1; then
  echo "لا توجد commits بعد. سيتم إنشاء commit أولي."
  git add .
  git commit -m "Build Eleganza static launch site"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
else
  git push -u origin main
fi

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "repos/${OWNER}/${REPO_NAME}/pages" \
  -f build_type=workflow >/dev/null 2>&1 || true

echo
echo "تم رفع المستودع إلى GitHub."
echo "GitHub Pages URL المتوقع:"
echo "https://${OWNER}.github.io/${REPO_NAME}/"
echo "الخطوة التالية في Cloudflare Pages:"
echo "1. Connect to Git"
echo "2. اختر المستودع: $REPO_NAME"
echo "3. Framework preset: None"
echo "4. Build command: فارغ"
echo "5. Build output directory: site"
