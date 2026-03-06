#!/bin/bash
# =============================================
#  记账本 — 一键部署脚本
#  运行后自动 fork 并部署到你自己的 GitHub Pages
# =============================================

set -e

echo ""
echo "📒 记账本 — 一键部署"
echo "===================="
echo ""

# ---------- 检查 gh CLI ----------
if ! command -v gh &> /dev/null; then
    echo "❌ 需要先安装 GitHub CLI (gh)"
    echo ""
    echo "安装方法："
    echo "  macOS:   brew install gh"
    echo "  Ubuntu:  sudo apt install gh"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    echo "安装后运行: gh auth login"
    exit 1
fi

# ---------- 检查登录 ----------
if ! gh auth status &> /dev/null; then
    echo "❌ 还没有登录 GitHub，请先运行："
    echo "   gh auth login"
    exit 1
fi

# 获取用户名
USERNAME=$(gh api user -q '.login')
echo "✅ 已登录 GitHub: $USERNAME"
echo ""

# ---------- 检查是否已有远程仓库 ----------
REPO_NAME="zhangben"

if gh repo view "$USERNAME/$REPO_NAME" &> /dev/null; then
    echo "📦 仓库 $USERNAME/$REPO_NAME 已存在"
else
    echo "📦 创建仓库 $USERNAME/$REPO_NAME ..."
    gh repo create "$REPO_NAME" --public --source=. --push
    echo "✅ 仓库已创建"
fi

# ---------- 推送代码 ----------
echo ""
echo "📤 推送代码..."

# 确保 remote 指向自己的仓库
REMOTE_URL="https://github.com/$USERNAME/$REPO_NAME.git"
if git remote get-url origin &> /dev/null; then
    git remote set-url origin "$REMOTE_URL"
else
    git remote add origin "$REMOTE_URL"
fi

BRANCH=$(git branch --show-current)
git add -A
git diff --cached --quiet || git commit -m "部署记账本"
git push -u origin "$BRANCH"

echo "✅ 代码已推送"

# ---------- 开启 GitHub Pages ----------
echo ""
echo "🌐 开启 GitHub Pages..."

# 检查是否已开启
if gh api "repos/$USERNAME/$REPO_NAME/pages" &> /dev/null 2>&1; then
    echo "✅ GitHub Pages 已开启"
else
    gh api "repos/$USERNAME/$REPO_NAME/pages" -X POST --input - <<EOF
{"build_type":"legacy","source":{"branch":"$BRANCH","path":"/"}}
EOF
    echo "✅ GitHub Pages 已开启"
fi

# ---------- 完成 ----------
PAGES_URL="https://$USERNAME.github.io/$REPO_NAME/"

echo ""
echo "========================================"
echo "🎉 部署完成！"
echo ""
echo "🔗 你的记账本地址："
echo "   $PAGES_URL"
echo ""
echo "📱 在手机上安装："
echo "   1. 用 Safari 打开上面的链接"
echo "   2. 点底部分享按钮（方框↑箭头）"
echo "   3. 选择「添加到主屏幕」"
echo ""
echo "⏳ 首次部署需要 1-2 分钟生效"
echo "========================================"
echo ""
