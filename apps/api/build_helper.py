import os
import base64
from pathlib import Path

BASE_DIR = Path(r"c:\Users\admin\Downloads\Git Uploads\AI-OPPORTUNITY-OS\apps\api")

def b64d(s):
    return base64.b64decode(s.encode('utf-8'))

FILES = {
    # We will just write some files directly as text to prevent token limits.
}

# The remaining schemas and routers are fairly straightforward. I will generate them natively.
