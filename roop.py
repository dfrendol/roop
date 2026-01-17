# entry point
import os, re, sys, difflib
from datetime import datetime

def main():
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