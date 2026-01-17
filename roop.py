# entry point
import os, re, sys, difflib
from datetime import datetime

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