# Presentation template

A starting point for building slide decks with Claude Code. Each deck is a self-contained HTML file: 16:9 canvas, dark and light themes, keyboard navigation, no build step.

## Fresh laptop setup

This assumes a laptop with only Claude Desktop installed so far. Claude Desktop does not include git, so install it separately on every platform.

1. **Install Claude Desktop** from https://claude.com/download and sign in.
2. **Install git**:
   - **macOS:** run `xcode-select --install` in Terminal and accept the prompt.
   - **Windows:** install Git for Windows from https://git-scm.com/download/win. The defaults are fine. It also installs Git Bash, which Claude uses for shell commands.
   - **Linux:** `sudo apt install git` (Debian/Ubuntu) or `sudo dnf install git` (Fedora).
3. **Tell git who you are**, using the name and email on your GitHub account:
   ```bash
   git config --global user.name "Your Name"
   ```
   ```bash
   git config --global user.email "you@example.com"
   ```
4. **Install the GitHub CLI (recommended).** It lets Claude open and check pull requests. Install it with `brew install gh` (macOS, needs Homebrew), `winget install --id GitHub.cli` (Windows), or from https://github.com/cli/cli/blob/trunk/docs/install_linux.md (Linux). Then run `gh auth login` and choose GitHub.com, HTTPS, and browser login.
5. **Clone this repo** and open the folder in Claude Desktop's **Code** tab:
   ```bash
   git clone https://github.com/sunholo-data/presentation-template.git
   ```

Working on a deck: create a branch rather than working on `main`, commit there, and push the branch. Open the PR against `main` in the GitHub web UI, or ask Claude to do it if you installed `gh`.

If `git: command not found` appears, the install didn't finish or your terminal was open before it did. Open a new terminal and try again. On Windows, if Claude can't find Git Bash, install Git for Windows and restart Claude Desktop.

## Quick start

1. Clone this repo and open it in Claude Code.
2. Open `demo/presenter.html` in a browser. It plays both starter decks: ↓ moves to the next deck, ↑ goes back, and ← → move between slides. The sun/moon button in the top bar switches theme, and **D** switches between stage and guide density.
3. Ask Claude to build your deck, for example:

   > Build a 5-slide deck in `my-talk/` about <your topic>. Use the presentation-slides skill and the existing starter deck as the structure.

4. Open the new file in a browser and check both themes and a non-16:9 window size.

## Layout

```
.claude/skills/presentation-slides/   Skill: rules, design system, slide patterns, lint
images/logos/                          Shared logo(s). Replace with your own
demo/presenter.html                     Presenter: lists the decks in demo/ and handles ↑ ↓
demo/01-hello.html                     Starter deck to copy from
demo/02-second.html                    Second deck, to test moving between decks
```

## Checking a deck

```bash
node .claude/skills/presentation-slides/scripts/lint-slides.mjs demo
```

The linter flags viewport units (`vh`, `vw`, …) that break the 16:9 stage. It runs in walk mode when given no arguments.

## Branding

The default palette and the logo are placeholders in the house style used by the original decks. To rebrand, change the CSS variables in `:root` and `[data-theme="light"]`, and swap `images/logos/sunholo-logo.svg`.
