#!/usr/bin/env python3
"""Load workload.yaml without external dependencies."""

from __future__ import annotations

import re
from pathlib import Path


def load_workload(path: Path) -> dict:
    text = path.read_text()
    data: dict = {"agent_counts": [50, 200, 500, 1000], "trials_per_config": 100}
    m = re.search(r"agent_counts:\s*\[([^\]]+)\]", text)
    if m:
        data["agent_counts"] = [int(x.strip()) for x in m.group(1).split(",")]
    m = re.search(r"trials_per_config:\s*(\d+)", text)
    if m:
        data["trials_per_config"] = int(m.group(1))
    return data
