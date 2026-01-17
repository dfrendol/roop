# entry point
import os, re, sys, difflib
from datetime import datetime

WORKFLOW_START = "<!-- ROOP WORKFLOW START -->"
WORKFLOW_END = "<!-- ROOP WORKFLOW END -->"

def read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_text(path: str, text: str):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def ensure_roop_block(readme: str) -> str:
    if WORKFLOW_START in readme and WORKFLOW_END in readme:
        return readme
    
    block = (
        "\n\n---\n\n"
        "## Project Workflow (auto-maintained by ROOP)\n\n"
        f"{WORKFLOW_START}\n"
        f"{WORKFLOW_END}\n"
    )

    if readme.strip() == "":
        return "# Project\n" + block
    return readme.rstrip() + block + "\n"

def cmd_init():
    print("Initializing roop in the current directory...")
    path = "README.md"
    old = read_text(path) if os.path.exists(path) else ""
    new = ensure_roop_block(old)
    if (new == old):
        print("ROOP block already present in README.md")
        return
    write_text(path, new)
    print("ROOP block added to README.md")
    
def cmd_update(auto_yes: bool = False):
    print("Updating roop to the latest version...")

def usage():
    print("Usage: python roop.py <command> [options]")
    print("Commands:")
    print("  python roop.py init\n     Initialize roop in the current directory")
    print("  python roop.py update [--yes]\n     Update roop to the latest version")

def main():
    # check args
    if len(sys.argv) < 2:
        usage()
        sys.exit(1)

    # parse command
    cmd = sys.argv[1].lower()
    if cmd == "init":
        cmd_init()
    elif cmd == "update":
        auto_yes = "--yes" in sys.argv[2:]
        cmd_update(auto_yes = auto_yes)
    else:
        usage()
        sys.exit(1)

if __name__ == "__main__":
    main()        