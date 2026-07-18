#!/usr/bin/env python3
"""
Validate case file data integrity between HTML source files and data.js.

Compares entity counts (info cards, locations, NPCs, organizations, current day)
between the source HTML documents in docs/case-files/ and the web app data in
docs/web-app-da-board/data.js.

Exit code 0: all counts match.
Exit code 1: one or more mismatches found.
"""

import re
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CASE_FILES_DIR = os.path.join(BASE_DIR, 'docs', 'case-files')
DATA_JS_PATH = os.path.join(BASE_DIR, 'docs', 'web-app-da-board', 'data.js')

# ─── Case Directory -> Data.js Identifier Mapping ──────────────────────────

CASES = [
    {
        'dir': 'spear-that-went-dark',
        'name': 'Spear of Destiny',
        'case_id': 'VC-AR-87-041',
        'info_cards_key': 'SPEAR_INFO_CARDS',
        'locations_key': 'SPEAR_LOCATIONS',
        'npcs_key': 'SPEAR_NPCS',
        'case_obj': 'SPEAR_OF_DESTINY',
    },
    {
        'dir': 'the-heavenly-crucifix',
        'name': 'Heavenly Crucifix',
        'case_id': 'VC-CZ-87-019',
        'info_cards_key': 'CRUCIFIX_INFO_CARDS',
        'locations_key': 'CRUCIFIX_LOCATIONS',
        'npcs_key': 'CRUCIFIX_NPCS',
        'case_obj': 'HEAVENLY_CRUCIFIX',
    },
    {
        'dir': 'the-barbarians-cup',
        'name': "Barbarian's Cup",
        'case_id': 'VC-MO-87-004',
        'info_cards_key': 'BARBARIANS_INFO_CARDS',
        'locations_key': 'BARBARIANS_LOCATIONS',
        'npcs_key': 'BARBARIANS_NPCS',
        'case_obj': 'BARBARIANS_CUP',
    },
    {
        'dir': 'the-boudica-pact',
        'name': 'Boudica Pact',
        'case_id': 'VC-UK-87-007',
        'info_cards_key': 'BOUDICA_INFO_CARDS',
        'locations_key': 'BOUDICA_LOCATIONS',
        'npcs_key': 'BOUDICA_NPCS',
        'case_obj': 'BOUDICA_PACT',
    },
    {
        'dir': 'the-cormsil-compact',
        'name': 'Cormsil Compact',
        'case_id': 'VC-UK-87-012',
        'info_cards_key': 'CORMSIL_INFO_CARDS',
        'locations_key': 'CORMSIL_LOCATIONS',
        'npcs_key': 'CORMSIL_NPCS',
        'case_obj': 'CORMSIL_COMPACT',
    },
]


# ═══════════════════════════════════════════════════════════════════════════
# HTML Counters — supports two file formats:
#   Legacy  (Spear case):   <div class="card-id|loc-id|org-id">…</div>
#   Current (all others):   <span class="id">…</span>, <h1>NPC#, <h2>O#
# ═══════════════════════════════════════════════════════════════════════════

def count_html_info_cards(html_path):
    """Count info card IDs in information-cards.html (both formats)."""
    if not os.path.exists(html_path):
        return None
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Current format: <span class="id">I1</span>
    count_span = len(re.findall(r'<span\s+class="id">I\d+</span>', content))
    # Legacy format: <div class="card-id">I1</div>  and  <div class="card-id truth">I4</div>
    count_div = len(re.findall(r'<div\s+class="card-id(?:\s+truth)?">I\d+</div>', content))

    return count_span + count_div


def count_html_locations(html_path):
    """Count location IDs in locations.html (both formats)."""
    if not os.path.exists(html_path):
        return None
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Current format: <span class="id">L1</span> (inside <h2> typically)
    count_span = len(re.findall(r'<span\s+class="id">L\d+</span>', content))
    # Legacy format: <div class="loc-id">L1</div>
    count_div = len(re.findall(r'<div\s+class="loc-id">L\d+</div>', content))

    return count_span + count_div


def count_html_npcs(html_path):
    """Count NPC entries in npc-cards.html (both formats)."""
    if not os.path.exists(html_path):
        return None
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Current format: <h1>NPC1 - Name</h1>  (but NOT the page title <h1>NPC Cards...)
    # Match <h1>NPC followed by a digit (NPC1, NPC2, etc.)
    count_h1 = len(re.findall(r'<h1>NPC\d+\b', content))
    # Legacy format: <div class="card-title">NPC Reference Card
    count_div = len(re.findall(r'<div\s+class="card-title">NPC\s+Reference\s+Card', content))

    return count_h1 + count_div


def count_html_organizations(html_path):
    """Count organization entries in organization-reference.html (both formats)."""
    if not os.path.exists(html_path):
        return None
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Current format: <h2>O1 - Name (Starting Value: ...)</h2>
    count_h2 = len(re.findall(r'<h2>O\d+\b', content))
    # Legacy format: <div class="org-id">O1</div>
    count_div = len(re.findall(r'<div\s+class="org-id">O\d+</div>', content))

    return count_h2 + count_div


def extract_html_current_day(case_dir):
    """
    Extract current day from start-here.html, falling back to
    operations-board.html.
    """
    start_here = os.path.join(case_dir, 'start-here.html')

    if os.path.exists(start_here):
        with open(start_here, 'r', encoding='utf-8') as f:
            content = f.read()

        # Pattern 1: "Start the clock at Day X"
        m = re.search(r'Start\s+the\s+clock\s+at\s+Day\s+(\d+)', content)
        if m:
            return int(m.group(1))

        # Pattern 2: "X-day board"
        m = re.search(r'(\d+)-day\s+board', content)
        if m:
            return int(m.group(1))

    # Fallback: operations-board.html "Columns: N N-1 ... 1"
    ops_board = os.path.join(case_dir, 'operations-board.html')
    if os.path.exists(ops_board):
        with open(ops_board, 'r', encoding='utf-8') as f:
            content = f.read()
        m = re.search(r'Columns:\s*(\d+)', content)
        if m:
            return int(m.group(1))

    return None


# ═══════════════════════════════════════════════════════════════════════════
# data.js Counters (text-based, no eval)
# ═══════════════════════════════════════════════════════════════════════════

def _find_js_array_range(js_content, var_name):
    """
    Locate the start and end indices of a JS array definition like:
        const VAR_NAME = [...];
    Returns (start, end) indices into js_content, or None.
    'start' points to the character right after the opening '['.
    """
    pattern = rf'const\s+{var_name}\s*=\s*\['
    m = re.search(pattern, js_content)
    if not m:
        return None

    depth = 0
    i = m.end()  # position right after the opening '['
    while i < len(js_content):
        ch = js_content[i]
        if ch == '[':
            depth += 1
        elif ch == ']':
            if depth == 0:
                return (m.end(), i)
            depth -= 1
        i += 1
    return None


def _find_js_object_range(js_content, var_name):
    """
    Locate the start and end indices of a JS object definition like:
        const VAR_NAME = {...};
    Returns (start, end) indices into js_content, or None.
    'start' points to the character right after the opening '{'.
    """
    pattern = rf'const\s+{var_name}\s*=\s*\{{'
    m = re.search(pattern, js_content)
    if not m:
        return None

    depth = 0
    i = m.end()  # position right after the opening '{'
    while i < len(js_content):
        ch = js_content[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            if depth == 0:
                return (m.end(), i)
            depth -= 1
        i += 1
    return None


def count_js_array_elements(js_content, array_name):
    """
    Count top-level elements in a JS array.
    Each element is an object starting with '{' and containing an 'id' field.
    We count '{' at the top level of the array that are followed by an 'id:'.
    """
    r = _find_js_array_range(js_content, array_name)
    if r is None:
        return None
    start, end = r
    array_content = js_content[start:end]

    # Count objects at the top level of the array.
    # Each element begins at a position where bracket depth (within the array)
    # is 0 and we encounter a '{'.
    count = 0
    depth = 0
    i = 0
    while i < len(array_content):
        ch = array_content[i]
        if ch == '{':
            if depth == 0:
                count += 1
            depth += 1
        elif ch == '}':
            depth -= 1
        elif ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
        i += 1

    return count


def count_js_organizations(js_content, case_obj_name):
    """
    Count non-blank organizations within a case object's organizations array.
    A non-blank org has name set to a non-empty string (not '' or "").
    """
    obj_range = _find_js_object_range(js_content, case_obj_name)
    if obj_range is None:
        return None
    obj_start, obj_end = obj_range
    obj_content = js_content[obj_start:obj_end]

    # Find the organizations array within the object
    m = re.search(r'organizations\s*:\s*\[', obj_content)
    if not m:
        return None

    # Find matching ']' for the organizations array
    org_start_in_obj = m.end()
    depth = 0
    i = org_start_in_obj
    while i < len(obj_content):
        ch = obj_content[i]
        if ch == '[':
            depth += 1
        elif ch == ']':
            if depth == 0:
                org_end_in_obj = i
                break
            depth -= 1
        i += 1
    else:
        return None

    orgs_content = obj_content[org_start_in_obj:org_end_in_obj]

    # Count top-level org objects
    count = 0
    depth = 0
    i = 0
    org_start_indices = []
    while i < len(orgs_content):
        ch = orgs_content[i]
        if ch == '{':
            if depth == 0:
                org_start_indices.append(i)
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and org_start_indices:
                # We've found a complete top-level org object
                obj_text = orgs_content[org_start_indices[-1]:i+1]
                # Check if name is non-empty
                name_m = re.search(r"name\s*:\s*'([^']*)'", obj_text)
                if name_m and name_m.group(1).strip():
                    count += 1
                org_start_indices.pop()
        elif ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
        i += 1

    return count


def extract_js_current_day(js_content, case_obj_name):
    """Extract currentDay from a case object definition."""
    obj_range = _find_js_object_range(js_content, case_obj_name)
    if obj_range is None:
        return None
    obj_start, obj_end = obj_range
    obj_content = js_content[obj_start:obj_end]

    m = re.search(r'currentDay\s*:\s*(\d+)', obj_content)
    if m:
        return int(m.group(1))
    return None


# ═══════════════════════════════════════════════════════════════════════════
# Main Validation
# ═══════════════════════════════════════════════════════════════════════════

def validate():
    # Load data.js once
    if not os.path.exists(DATA_JS_PATH):
        print(f"ERROR: data.js not found at {DATA_JS_PATH}")
        return 1

    with open(DATA_JS_PATH, 'r', encoding='utf-8') as f:
        js_content = f.read()

    all_ok = True

    print("CASE FILE DATA VALIDATION")
    print("=========================")

    for case in CASES:
        case_dir = os.path.join(CASE_FILES_DIR, case['dir'])
        case_name = case['name']
        case_id = case['case_id']

        print(f"\n{case_name} ({case_id})")

        # ── Info Cards ──
        html_ic = count_html_info_cards(os.path.join(case_dir, 'information-cards.html'))
        js_ic = count_js_array_elements(js_content, case['info_cards_key'])
        ok_ic = _compare("Info Cards", html_ic, js_ic)
        if not ok_ic:
            all_ok = False

        # ── Locations ──
        html_loc = count_html_locations(os.path.join(case_dir, 'locations.html'))
        js_loc = count_js_array_elements(js_content, case['locations_key'])
        ok_loc = _compare("Locations", html_loc, js_loc)
        if not ok_loc:
            all_ok = False

        # ── NPCs ──
        html_npc = count_html_npcs(os.path.join(case_dir, 'npc-cards.html'))
        js_npc = count_js_array_elements(js_content, case['npcs_key'])
        ok_npc = _compare("NPCs", html_npc, js_npc)
        if not ok_npc:
            all_ok = False

        # ── Organizations ──
        html_org = count_html_organizations(
            os.path.join(case_dir, 'organization-reference.html'))
        js_org = count_js_organizations(js_content, case['case_obj'])
        ok_org = _compare("Organizations", html_org, js_org)
        if not ok_org:
            all_ok = False

        # ── Current Day ──
        html_day = extract_html_current_day(case_dir)
        js_day = extract_js_current_day(js_content, case['case_obj'])
        ok_day = _compare("Current Day", html_day, js_day)
        if not ok_day:
            all_ok = False

    print()
    if all_ok:
        print("[PASS] All cases validated successfully.")
        return 0
    else:
        print("[FAIL] One or more mismatches found. Review the case files and data.js.")
        return 1


def _compare(label, html_val, js_val):
    """Compare two values and print the result. Returns True if match."""
    html_str = str(html_val) if html_val is not None else "N/A"
    js_str = str(js_val) if js_val is not None else "N/A"

    hw = max(len(html_str), 2)
    jw = max(len(js_str), 2)

    if html_val == js_val:
        print(f"  {label:15s} {html_str:>{hw}s} in HTML / {js_str:>{jw}s} in data.js [MATCH]")
        return True
    else:
        print(f"  {label:15s} {html_str:>{hw}s} in HTML / {js_str:>{jw}s} in data.js [MISMATCH]")
        return False


if __name__ == '__main__':
    sys.exit(validate())
