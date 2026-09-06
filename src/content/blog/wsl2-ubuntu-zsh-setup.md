---
title: 'WSL2 Ubuntu 打造顺手的 zsh 开发环境'
description: 'oh-my-zsh + powerlevel10k + 插件全家桶，一键脚本与五连踩坑记录'
pubDate: '2026-09-05'
tags: ['WSL2', 'zsh', 'Ubuntu', 'Linux']
---

WSL2 里装完 Docker 之后，终端体验也得跟上。目标配置一句话：**zsh + oh-my-zsh + powerlevel10k + 自动建议 + 语法高亮 + z/extract/web-search 插件**，一条命令装完，root 和默认用户各配一套。

## 装什么

| 组件 | 作用 |
| --- | --- |
| zsh + oh-my-zsh | 基础框架（full clone，保证自动更新可用） |
| powerlevel10k | 提示符主题 |
| zsh-autosuggestions | 灰色历史命令建议，→ 接受 |
| zsh-syntax-highlighting | 命令实时高亮，敲错变红 |
| z | 目录快速跳转（按访问频率） |
| extract | `x 文件.zip` 通用解压 |
| web-search | 终端直接搜索：`google 关键词` |
| wslu | 提供 `wslview`，让 web-search 能调起 Windows 默认浏览器 |

## 一键脚本

在 Windows 侧执行：

```bash
# cmd / PowerShell 直接跑
wsl -d Ubuntu-26.04 -u root -- bash /mnt/e/ai/docker-wsl2/install-zsh.sh
# Git Bash 下要禁用路径转换(见踩坑 1)
MSYS_NO_PATHCONV=1 wsl -d Ubuntu-26.04 -u root -- bash /mnt/e/ai/docker-wsl2/install-zsh.sh
```

脚本要点：

- **GitHub 加速**：`gh-proxy.com` / `ghfast.top` 前缀优先、直连兜底，配合 `GIT_HTTP_LOW_SPEED_*` 弱网快速失败自动换源
- **多用户**：自动读 `/etc/wsl.conf` 的默认用户，root 和它各装一套；clone 以 root 执行后 `chown` 归还属主，避免用户侧 git 报 dubious ownership
- **可重入**：已存在的 clone 跳过，`.zshrc` 先备份成 `.zshrc.bak.时间戳` 再覆盖
- **自检**：装完逐个检查关键文件，缺了会标红

<details>
<summary>install-zsh.sh 完整内容（点开）</summary>

```bash
#!/usr/bin/env bash
# 安装 zsh + oh-my-zsh + powerlevel10k + 插件(zsh-autosuggestions / zsh-syntax-highlighting / z / extract / web-search)
# 用法(在 Windows 侧执行): wsl -d Ubuntu-26.04 -u root -- bash /mnt/e/ai/docker-wsl2/install-zsh.sh
#   Git Bash 下需禁用路径转换: MSYS_NO_PATHCONV=1 wsl -d Ubuntu-26.04 -u root -- bash /mnt/e/ai/docker-wsl2/install-zsh.sh
#   可选参数1: MesloLGS NF 字体输出目录(默认 /mnt/e/ai/docker-wsl2/fonts,供 Windows 侧双击安装)
set -euo pipefail

# GitHub 加速前缀(按实测速度排序,最后的空串表示直连兜底)
GH_PROXIES=("https://gh-proxy.com/" "https://ghfast.top/" "")

# 弱网下尽快断开,触发代理回退
export GIT_HTTP_LOW_SPEED_LIMIT=1024
export GIT_HTTP_LOW_SPEED_TIME=30

git_clone() {  # git_clone <repo-url> <dest> [full]
    local repo="$1" dest="$2" mode="${3:-}" prefix err
    # 清理上次中断可能留下的不完整目录(完整 clone 必有 .git,不受影响)
    if [[ -e "$dest" && ! -d "$dest/.git" ]]; then
        rm -rf "$dest"
    fi
    local -a args=()
    if [[ "${mode}" != "full" ]]; then
        args+=(--depth=1)
    fi
    err="$(mktemp)"
    for prefix in "${GH_PROXIES[@]}"; do
        if git clone --quiet ${args[@]+"${args[@]}"} "${prefix}${repo}" "$dest" 2>"$err"; then
            rm -f "$err"
            return 0
        fi
    done
    echo "[!] git clone 失败: ${repo}(可编辑脚本内 GH_PROXIES 更换加速前缀)" >&2
    cat "$err" >&2
    rm -f "$err"
    return 1
}

fetch() {  # fetch <url> <dest-file>
    local url="$1" out="$2" prefix
    for prefix in "${GH_PROXIES[@]}"; do
        if curl -fsSL --connect-timeout 8 -o "$out" "${prefix}${url}"; then
            return 0
        fi
    done
    return 1
}

if [[ ${EUID} -ne 0 ]]; then
    echo "[!] 请以 root 运行: wsl -d Ubuntu-26.04 -u root -- bash /mnt/e/ai/docker-wsl2/install-zsh.sh" >&2
    exit 1
fi

echo "[i] 安装系统依赖"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    zsh git curl fontconfig xdg-utils \
    unzip zip xz-utils bzip2 p7zip-full

# wslu 提供 wslview,用于 web-search 等调起 Windows 默认浏览器
# Ubuntu 26.04 的源已不收录 wslu,缺失时从 Ubuntu 官方 pool 直接装 .deb
if ! command -v wslview >/dev/null 2>&1; then
    if apt-get install -y -qq wslu >/dev/null 2>&1; then
        echo "[i] 已安装 wslu"
    else
        deb="http://archive.ubuntu.com/ubuntu/pool/universe/w/wslu/wslu_3.2.3-0ubuntu3_amd64.deb"
        if curl -fsSL --connect-timeout 10 -o /tmp/wslu.deb "$deb" && apt-get install -y -qq /tmp/wslu.deb; then
            echo "[i] 已从 Ubuntu pool 安装 wslu"
        else
            echo "[i] wslu 安装失败,web-search 将回退到 xdg-open"
        fi
        rm -f /tmp/wslu.deb
    fi
fi

# 确定 target 用户:root + /etc/wsl.conf 中的默认用户
TARGET_USERS=(root)
DEFAULT_USER=""
if [[ -f /etc/wsl.conf ]]; then
    DEFAULT_USER="$(awk -F= '/^\[user\]/{f=1;next} /^\[/{f=0} f && $1~/^ *default/{gsub(/ /,"",$2);print $2}' /etc/wsl.conf)"
fi
if [[ -n "${DEFAULT_USER}" && "${DEFAULT_USER}" != "root" ]] && id "${DEFAULT_USER}" >/dev/null 2>&1; then
    TARGET_USERS+=("${DEFAULT_USER}")
    echo "[i] 将同时为默认用户 ${DEFAULT_USER} 安装"
else
    echo "[i] /etc/wsl.conf 未找到默认用户,仅为 root 安装"
fi

install_for_user() {
    local user="$1" home group dest item repo plugin
    home="$(getent passwd "${user}" | cut -d: -f6)"
    echo "[i] ==> 为 ${user} 安装 (${home})"

    # oh-my-zsh(full clone,保证后续自动更新可用)
    if [[ ! -d "${home}/.oh-my-zsh" ]]; then
        git_clone https://github.com/ohmyzsh/ohmyzsh.git "${home}/.oh-my-zsh" full
    fi

    # 外部插件
    local custom="${home}/.oh-my-zsh/custom/plugins"
    for item in \
        "zsh-users/zsh-autosuggestions|zsh-autosuggestions" \
        "zsh-users/zsh-syntax-highlighting|zsh-syntax-highlighting"; do
        repo="${item%%|*}"; plugin="${item##*|}"
        dest="${custom}/${plugin}"
        if [[ ! -d "${dest}" ]]; then
            git_clone "https://github.com/${repo}.git" "${dest}"
        fi
    done

    # powerlevel10k 主题
    dest="${home}/.oh-my-zsh/custom/themes/powerlevel10k"
    if [[ ! -d "${dest}" ]]; then
        git_clone https://github.com/romkatv/powerlevel10k.git "${dest}"
    fi

    # .zshrc(已存在则先备份)
    if [[ -f "${home}/.zshrc" ]]; then
        cp -a "${home}/.zshrc" "${home}/.zshrc.bak.$(date +%Y%m%d%H%M%S)"
    fi
    cat > "${home}/.zshrc" <<'ZSHRC'
# ~/.zshrc — 由 install-zsh.sh 生成(重新执行脚本会覆盖本文件,旧文件备份为 ~/.zshrc.bak.*)

# ===== powerlevel10k instant prompt =====
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.sh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.sh"
fi

export ZSH="$HOME/.oh-my-zsh"

# ===== 主题 =====
ZSH_THEME="powerlevel10k/powerlevel10k"

# ===== 插件 =====
# 内置:git / z(目录快速跳转) / extract(通用解压 x 命令) / web-search(终端搜索)
# 外部:zsh-autosuggestions(灰色历史建议) / zsh-syntax-highlighting(命令语法高亮)
# 注意:zsh-syntax-highlighting 必须放在插件列表最后
plugins=(
  git
  z
  extract
  web-search
  zsh-autosuggestions
  zsh-syntax-highlighting
)

source "$ZSH/oh-my-zsh.sh"

# ===== 历史与行为 =====
HISTFILE="$HOME/.zsh_history"
HISTSIZE=50000
SAVEHIST=50000
setopt SHARE_HISTORY          # 多终端共享历史
setopt HIST_IGNORE_ALL_DUPS   # 历史去重
setopt HIST_REDUCE_BLANKS
setopt AUTO_CD                # 直接输入目录名即可 cd

# ===== 补全 =====
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'   # 大小写不敏感
zstyle ':completion:*' menu select                          # 方向键选择补全项

# ===== 自动建议 =====
ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=8'

# ===== WSL 适配 =====
# web-search 等通过 wslview 调起 Windows 默认浏览器(需已安装 wslu)
if command -v wslview >/dev/null 2>&1; then
  export BROWSER='wslview'
fi

# ===== 别名 =====
alias ll='ls -lahF'

# ===== powerlevel10k =====
# 首次进入 zsh 后运行 `p10k configure` 生成 ~/.p10k.zsh 自定义外观
# oh-my-zsh 更新默认每 13 天检查一次,国内网络不畅可改为: zstyle ':omz:update' mode disabled
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
ZSHRC

    # clone 是以 root 执行的,交还属主,避免用户侧 git 报 dubious ownership
    if [[ "${user}" != "root" ]]; then
        group="$(id -gn "${user}")"
        chown -R "${user}:${group}" "${home}/.oh-my-zsh"
        chown "${user}:${group}" "${home}/.zshrc" 2>/dev/null || true
        chown "${user}:${group}" "${home}"/.zshrc.bak.* 2>/dev/null || true
    fi

    # 设为默认 shell(root 执行无需密码)
    if [[ "$(getent passwd "${user}" | cut -d: -f7)" != "$(command -v zsh)" ]]; then
        chsh -s "$(command -v zsh)" "${user}"
        echo "[i] 已将 ${user} 默认 shell 改为 zsh"
    fi

    # 自检关键文件
    local ok=1 f
    for f in \
        "${home}/.oh-my-zsh/oh-my-zsh.sh" \
        "${home}/.oh-my-zsh/custom/themes/powerlevel10k/powerlevel10k.zsh-theme" \
        "${home}/.oh-my-zsh/custom/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh" \
        "${home}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" \
        "${home}/.zshrc"; do
        if [[ ! -e "${f}" ]]; then
            echo "[!] 缺少 ${f}" >&2
            ok=0
        fi
    done
    [[ ${ok} -eq 1 ]] && echo "[✓] ${user} 配置完成"
    return 0
}

for u in "${TARGET_USERS[@]}"; do
    install_for_user "$u"
done

# 下载 MesloLGS NF 字体(powerlevel10k 推荐)到 Windows 侧,双击安装即可
FONT_DIR="${1:-/mnt/e/ai/docker-wsl2/fonts}"
if mkdir -p "${FONT_DIR}" 2>/dev/null; then
    base="https://github.com/romkatv/powerlevel10k-media/raw/master"
    ok=1
    for f in "MesloLGS NF Regular.ttf" "MesloLGS NF Bold.ttf" "MesloLGS NF Italic.ttf" "MesloLGS NF Bold Italic.ttf"; do
        if [[ ! -s "${FONT_DIR}/${f}" ]]; then
            fetch "${base}/${f// /%20}" "${FONT_DIR}/${f}" || { ok=0; echo "[!] 字体下载失败: ${f}"; }
        fi
    done
    if [[ ${EUID} -eq 0 ]] && ls "${FONT_DIR}"/MesloLGS*.ttf >/dev/null 2>&1; then
        mkdir -p /usr/local/share/fonts/meslo
        cp -f "${FONT_DIR}"/MesloLGS*.ttf /usr/local/share/fonts/meslo/ 2>/dev/null || true
        fc-cache -f >/dev/null 2>&1 || true
    fi
    [[ ${ok} -eq 1 ]] && echo "[i] 字体已下载到 ${FONT_DIR}"
else
    echo "[i] 无法创建 ${FONT_DIR},跳过字体下载"
fi

echo
echo "✔ 完成。重新打开 WSL 终端即默认进入 zsh"
echo "  1. 在 Windows 侧双击安装 ${FONT_DIR} 下的 4 个 ttf 字体,"
echo "     并把终端字体设为 MesloLGS NF(Windows Terminal: 设置→默认值→外观→字体)"
echo "  2. 进入 zsh 后运行: p10k configure 选择提示符样式"
echo "  3. web-search 用法: google 关键词 | baidu 关键词 | bing 关键词 | ddg 关键词 | github 关键词"
echo "  4. extract 用法: x 文件.tar.gz / x 文件.zip(自动识别格式)"
echo "  5. z 用法: z 目录名关键词(按访问频率跳转,先用过几次才有记录)"
```

</details>

## 装完两步

1. 双击安装 `fonts/` 下的 4 个 MesloLGS NF 字体，Windows Terminal 设置 → 默认值 → 外观 → 字体，选 `MesloLGS NF`
2. 重开终端进入 zsh，跑 `p10k configure` 选一套样式

日常体感：

```bash
z docker      # 跳到最常去的名字带 docker 的目录
x dist.tar.gz # 万能解压
google zsh tips  # 调起 Windows 默认浏览器搜索
```

## 踩坑记录

### 1. Git Bash 会悄悄改写 wsl.exe 的路径

现象：`wsl -- bash /mnt/e/xx.sh` 报 `No such file or directory`，但路径明明存在。

原因：Git Bash（MSYS）在传参时把 Unix 风格路径自动转换成 Windows 路径，`/mnt/e/...` 被改写成了 `C:/Program Files/Git/mnt/e/...`。

解法：加 `MSYS_NO_PATHCONV=1` 前缀。cmd/PowerShell 无此问题。另外 wsl.exe 传参会丢引号，复杂脚本要写成文件再执行。

### 2. `git --quiet clone` 是错的

`--quiet` 是 `git clone` 的子命令选项，不能像 `-C` 那样放在 git 全局位置，否则直接 `unknown option`。正确写法 `git clone --quiet ...`。

### 3. GitHub 直连超时：加速镜像 + 自动回退

直连 GitHub 25 秒超时（oh-my-zsh 才 10MB 卡了三分多钟）。用小文件实测各镜像：

| 源 | 实测速度 | 结果 |
| --- | --- | --- |
| 直连 | 0 B/s | 超时 |
| gh-proxy.com | 1.5 MB/s | ✅ 最快 |
| ghfast.top | 655 KB/s | ✅ 可用 |

脚本里把镜像放前面、直连放最后兜底，再配 `GIT_HTTP_LOW_SPEED_LIMIT=1024` + `GIT_HTTP_LOW_SPEED_TIME=30`：30 秒内速度低于 1KB/s 就断开重试下一个源，不会傻等。注意镜像前缀失效是常态，脚本里 `GH_PROXIES` 数组随时可改。

### 4. Ubuntu 26.04 没有 wslu 了

web-search 打开浏览器靠 `wslview`（wslu 包），但 26.04 的 apt 源（含 universe）已经搜不到它。想加 wslu 官方源 `pkg.wslutiliti.es` 也不行了——域名返回的是 CDN 拦截页，仓库已失效。

解法：Ubuntu 官方 pool 里还躺着 24.04 时代的包，直接下 deb 装，架构无关、依赖都能解：

```bash
curl -fsSL -o /tmp/wslu.deb \
  http://archive.ubuntu.com/ubuntu/pool/universe/w/wslu/wslu_3.2.3-0ubuntu3_amd64.deb
apt-get install -y /tmp/wslu.deb
```

### 5. apt 报 NO_PUBKEY？先查 keyrings 目录权限

这个坑相当隐蔽：`apt-get update` 对 Docker 源报 `NO_PUBKEY 7EA0A9C3F273FCD8`，但 `gpg --show-keys` 看密钥文件明明没问题（那个 ID 其实是旧主密钥的签名 subkey，一直在文件里）。

排查到最后发现是目录权限：`install -m 0644 -d /etc/apt/keyrings` 把**目录**设成了 644——少了 x 位（遍历权限）。apt 下载校验是以 `_apt` 沙箱用户跑的，进不了这个目录，密钥自然"不存在"。

```bash
ls -la /etc/apt/keyrings/
# drw-r--r--  ← 问题在这,应该是 drwxr-xr-x
install -m 0755 -d /etc/apt/keyrings
```

顺带一个教训：不要手动往 armored 密钥文件里追加第二个公钥块，gpgv 会报 `invalid packet (ctb=2d)`。要换密钥就整个文件重新下载。

## 小结

全程命令跑下来不到两分钟（加速镜像生效后），终端从"能用"变"好用"。最花时间的反而是这些边角坑——尤其是权限那个，报错信息完全不指向真正原因。脚本可重入，重装 WSL 或换机器时拷过去一条命令恢复。
