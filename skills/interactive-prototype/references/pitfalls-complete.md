# Interactive Prototype — Complete Pitfalls Reference

Accumulated lessons from real bugs during prototype development. Consult these when specific issues arise.

---

## Table of Contents

### Tool & Workflow Pitfalls
1. [Patch Tool Usage](#1-patch-tool-usage-preferred)
2. [Dead Code Cleanup After Feature Removal](#2-dead-code-cleanup-after-feature-removal)
3. [JS Reference Cleanup After HTML Deletion](#3-js-reference-cleanup-after-html-deletion-fatal)
4. [Structure Verification After Bulk Edits](#4-structure-verification-after-bulk-edits)
5. [Todo for Multi-Task](#5-todo-for-multi-task)
6. [File Attribution — Ask Before Editing](#6-file-attribution--ask-before-editing)
7. [File Corruption Recovery](#7-file-corruption-recovery)
8. [Anchor Comment Mismatch Across Versions](#8-anchor-comment-mismatch-across-versions)
9. [Chinese Paths on Windows](#9-chinese-paths-on-windows)
10. [Bat File Encoding](#10-bat-file-encoding-do-not-use-bash)

### Code Quality Pitfalls
11. [JS Template String Quote Conflicts](#11-js-template-string-quote-conflicts-fatal)
12. [Code Insertion Zone Boundaries](#12-code-insertion-zone-boundaries-critical)
13. [\r\n Trap in execute_code](#13-rn-trap-in-execute_code-windows-fatal)
14. [HTML Attribute Closing Trap](#14-html-attribute-closing-trap)
15. [Batch Column Addition Verification](#15-batch-column-addition-verification)

### Mobile Prototype Pitfalls
16. [Keyboard Occlusion (Mobile)](#16-keyboard-occlusion-mobile-chat-interface)
17. [Button Visibility Rules (Chat)](#17-button-visibility-only-last-message)
18. [Welcome Message — No Action Buttons](#18-welcome-message--no-action-buttons)
19. [Context-Aware Follow-up Suggestions](#19-context-aware-follow-up-suggestions)
20. [Phone Frame Background Color](#20-phone-frame-background-color)

### PC Enterprise Prototype Pitfalls
21. [Action-Button Unified Style (Highest Priority)](#21-action-btn-unified-style-highest-priority)
22. [Dynamic vs Static Table Rendering](#22-dynamic-vs-static-table-rendering)
23. [Export Modal Pattern (Per-Page Independent)](#23-export-modal-pattern-per-page-independent)
24. [Drawer Layout — Fixed Bottom Outside Scroll](#24-drawer-layout--fixed-bottom-outside-scroll)
25. [Multi-Step Modal Flow](#25-multi-step-modal-flow-verify-then-input)
26. [Metric Design — User vs Customer Dimension](#26-metric-design--user-vs-customer-dimension)
27. [Session Quality Filter](#27-session-quality-filter)
28. [Group Operation Sync](#28-group-operation-sync-after-batch-processing)
29. [Filter Bar Additions](#29-filter-bar-additions-pattern)
30. [View Switching (Group vs List)](#30-view-switching-group-view--raw-list)
31. [Group Detail Modal (Not Inline Expand)](#31-group-detail-modal-not-inline-expand)
32. [Single-Entity Grouping Principle](#32-single-entity-grouping-principle)
33. [Three-Layer Data Architecture (AI-Assisted)](#33-three-layer-data-architecture-ai-assisted)
34. [Card List Filtering](#34-card-list-filtering)
35. [Excel Operations with openpyxl](#35-excel-operations-with-openpyxl)

### Component Mode & Migration Pitfalls
36. [Reference vs Embedded Mode](#36-reference-vs-embedded-mode-default-reference)
37. [ProtoRouter is Mobile-Only](#37-pororouter-is-mobile-only-pc-not-injected)
38. [Post-Migration File Size Check](#38-post-migration-file-size-check)
39. [Single-File Token Trap](#39-single-file-token-trap)
40. [Data + Function Extraction Together](#40-data--function-extraction-together-fatal)
41. [build.py parse_component Traps](#41-buildpy-parse_component-two-fatal-traps)
42. [build.py Regex for Hyphenated IDs](#42-buildpy-regex-for-hyphenated-ids)
43. [Shell Placeholder Ordering](#43-shell-placeholder-replacement-ordering)
44. [Mobile Theme Color Injection](#44-mobile-theme-color-injection)
45. [Migration to Reference Mode (6 Steps)](#45-migration-to-reference-mode-full-6-steps)
46. [init_xxx Rule](#46-init_xxx-rule)
47. [Function/Data Extraction Confirmation](#47-functiondata-extraction-must-confirm-each-one)
48. [Data Deduplication (No Duplicate Declarations)](#48-data-deduplication-no-duplicate-declarations)

### Shell Template Pitfalls
49. [HTML Class Mapping](#49-html-class-mapping)
50. [switchPage Convention](#50-shell-switchpage-convention)
51. [Shell Template Fidelity](#51-shell-template-fidelity-never-modify)
52. [Content-Area Empty Shell](#52-content-area-must-be-empty-shell)
53. [switchPage Wrapping by build.py](#53-switchpage-wrapping-by-buildpy)
54. [CSS Class Matching to Shell Template](#54-css-class-matching-to-shell-template)
55. [execute_code Triple-Quote CSS/JS SyntaxError](#55-execute_code-triple-quote-cssjs-syntaxerror)
56. [CSS Tooltip Pseudo-Element Conflict](#56-css-tooltip-pseudo-element-conflict-new)
57. [Template Literal Type Coercion](#57-template-literal-type-coercion-new)
58. [Cascading Filter Pattern](#58-cascading-filter-pattern-customer--venue-new)

---

## Tool & Workflow Pitfalls

---

### 1. Patch Tool Usage (Preferred)

**Title:** Incremental edits use Hermes patch tool (preferred)

**Description:** Hermes `patch` tool (`mode='patch'`) supports multi-file, multi-hunk precise replacement — more reliable than Python `str.replace()`:
- Auto-handles line-ending differences (CRLF/LF)
- Fuzzy matching (9 strategies), minor indentation changes won't break
- One patch call can modify CSS, HTML, and JS simultaneously

**Symptoms:** None when used correctly. Using `str.replace()` instead causes cross-boundary matching or silent failures.

**Diagnosis:** When `str.replace()` gives 0 replacements but no error — likely CRLF or multi-match issue.

**Fix:** Use `patch(mode='patch', ...)` with `@@ title @@` hunks, each containing enough context for unique matching. When patch reports "Found N matches", add more surrounding lines to `old_string` (include specific data content, not just structural tags).

**Practical tip:** In HTML tables with similar `<tr>` rows, use each row's unique data text as context — e.g., `<td>有没有停车场，怎么收费</td>` is unique among all rows.

---

### 2. Dead Code Cleanup After Feature Removal

**Title:** Clean up dead code when removing a feature

**Description:** When removing a feature from the menu (e.g., "二维码管理"), you **must** simultaneously clean up the corresponding page HTML, modals, JS functions, and data variables — otherwise large blocks of dead code remain and hurt maintainability.

**Symptoms:** File size doesn't shrink after "removing" a feature. Dead functions and HTML blocks still present.

**Diagnosis:** Search for the removed feature's ID in the file — if functions, HTML blocks, and modal elements still exist, cleanup is incomplete.

**Fix — cleanup checklist:**
1. **Menu item** — remove from sidebar-menu
2. **Page block** — remove `<div class="page-section" id="pageXxx">...</div>`
3. **Related modals** — remove `<div class="modal-overlay" id="xxxModal">...</div>`
4. **JS functions** — remove feature-specific JS functions and data variables
5. **switchPage route** — remove corresponding else-if branch

**Important:** Distinguish "remove feature" from "merge feature". If the feature's functionality is absorbed into another page, keep shared components (e.g., a QR preview modal used elsewhere) and only delete the independent entry point.

---

### 3. JS Reference Cleanup After HTML Deletion (Fatal)

**Title:** Deleting HTML without cleaning JS references is fatal

**Description:** After deleting HTML elements (pages, modals, input fields), **all JS functions that reference those elements via `getElementById()` must also be removed or modified**. Otherwise:

**Symptoms:**
1. JS runs `addEventListener` binding → element not found → throws exception
2. Exception interrupts all subsequent JS code → `switchPage`, `showToast`, and other core functions all fail
3. Behavior: page opens but clicking any menu/button produces no response

**Diagnosis:** Open F12 → Console. If you see `Cannot read properties of null (reading 'classList')` or similar — this is the cause.

**Fix — cleanup steps:**
1. After deleting HTML elements, search all `getElementById('deletedElementId')` occurrences
2. For each referencing JS function, determine if it's feature-only or shared
3. Feature-only → delete the entire function
4. Shared → modify the function logic to remove the deleted element reference
5. Check `addEventListener` bindings for references to deleted elements

**Anti-pattern example:** Deleting `createQrcodeModal` HTML but leaving `openCreateQrcodeModal()`, `switchQrcodeMode()`, `handleLogoUpload()` functions that still call `getElementById('createQrcodeModal')` → JS error → all page switching breaks.

**Sub-pattern: Form field type replacement (not just deletion)**

When replacing a form field with a different input type (e.g., `<select>` dropdown → `<input type="checkbox">` multi-select), the same cleanup rule applies BUT the fix is different — you must update how JS reads the value:

```js
// OLD: single-select dropdown
venue: document.getElementById('faqFormVenue').value

// NEW: multi-select checkboxes
venue: (function(){
  var cbs = document.querySelectorAll('#venueCheckboxes input:checked');
  return Array.from(cbs).map(function(cb){return cb.value;}).join(',');
})()
```

**Checklist when changing field type:**
1. Search all `getElementById('oldFieldId')` references
2. For each: determine if it's read (`.value`) or write (`.value = ...`)
3. Read → change to new input type's read pattern (checkboxes: `querySelectorAll('input:checked')`)
4. Write → update to new input type's write pattern (checkboxes: set `checked` property)
5. Also check form reset/clear logic — dropdown uses `.value = ''`, checkboxes need `forEach(cb => cb.checked = false)`

---

### 4. Structure Verification After Bulk Edits

**Title:** Must run structure verification after 3+ bulk edits

**Description:** After completing batch upgrades involving 3+ change points, **you must run a structural verification script** — don't just check file size.

**Symptoms:** File opens but pages are empty, menus don't work, modals are broken — all invisible from file size alone.

**Diagnosis:** Run the verification script below.

**Fix — verification script:**
```python
import re
# 1. HTML tag balance
for tag in ['div', 'table', 'tr', 'td', 'th']:
    opens = len(re.findall(f'<{tag}[\\s>]', html))
    closes = html.count(f'</{tag}>')
    assert opens == closes, f"<{tag}> {opens} vs {closes}"

# 2. JS brace balance
js = re.search(r'<script>(.*?)</script>', html, re.DOTALL).group(1)
assert js.count('{') == js.count('}'), "JS braces unbalanced"

# 3. Required elements exist
required = ['pageXxx', 'pageYyy', 'modalZzz']
for r in required:
    assert f'id="{r}"' in html, f"Missing: {r}"

# 4. No stale code remnants
stale = ['?cid=', 'id="pageOld"']
for s in stale:
    assert s not in html, f"Stale: {s}"

# 5. File integrity
assert html.strip().endswith('</html>')
assert '<!DOCTYPE html>' in html[:100]
```

**Warning:** Do NOT use `sed` in bash/terminal to edit HTML files — Chinese encoding and special characters will cause garbled output.

---

### 5. Todo for Multi-Task

**Title:** Multi-task handling — list tasks first

**Description:** When a user sends multiple tasks at once (e.g., "改A、加B、做C"), **immediately create a task list using the `todo` tool** and track progress item by item. Don't rely on memory — you'll miss items in the middle.

**Symptoms:** User asks "why didn't you do X?" — you forgot it in the middle of a multi-task batch.

**Diagnosis:** User frustration signal: "这个不用我教你吧" (you shouldn't need to be told this).

**Fix:** Always use `todo` tool when 3+ tasks arrive in one message. Mark each completed immediately. If something fails, cancel it and add a revised item.

---

### 6. File Attribution — Ask Before Editing

**Title:** Confirm file ownership before editing

**Description:** When multiple versions or files from different authors exist in a directory (e.g., `V1.html` by you, `_一期.html` by Claude), **you must ask which file to edit** — never guess.

**Symptoms:** User is upset because you modified the wrong file. User has a strong sense of ownership over their files — changing the wrong one = wasted time + dissatisfaction.

**Diagnosis:** Directory contains files with version suffixes (V1/V2), author suffixes (_一期/_二期), or different annotations in the header.

**Fix:** Always ask: "目录里有多个文件，请问要改哪个？" before proceeding.

---

### 7. File Corruption Recovery

**Title:** File corruption recovery strategy

**Description:** When a modification corrupts a file (content truncated, only CSS remains, structure destroyed):

**Symptoms:** File opens but is visually broken — missing content, syntax errors, or only partial content rendered.

**Diagnosis:** Open the file in a text editor — check if `</html>` exists, `<script>` is present, CSS/HTML/JS regions are intact.

**Fix — recovery steps:**
1. **Do NOT patch the corrupted file repeatedly** — you'll make it worse
2. **Recover from the last known good version** (v2/v3/v4...), use a complete script to rebuild
3. **Combine all changes into one Python script** and execute in a single pass — avoids step-by-step errors
4. After recovery, verify basic structure first (`</html>` exists, `<script>` exists, JS syntax OK), then add new features

---

### 8. Anchor Comment Mismatch Across Versions

**Title:** Anchor comments don't match across versions

**Description:** Different rounds/sub-agents may generate HTML comments in different formats (e.g., `<!-- ====== 场馆编辑弹窗 ====== -->` vs `<!-- ====== 编辑场馆弹窗 ====== -->`). Before inserting new content, **search for the actual comment text** — don't assume format consistency.

**Symptoms:** `str.replace()` using old anchor text returns 0 replacements. New content inserted at wrong location.

**Diagnosis:** Use `search_files` or `html.find('partial_keyword')` to find what actually exists.

**Fix:** Use partial keyword search (`html.find('部分关键词')`) instead of exact full-comment-string matching.

---

### 9. Chinese Paths on Windows

**Title:** Chinese characters in file paths

**Description:** On Windows, file paths may contain Chinese characters. Terminal commands must quote paths:

**Symptoms:** `No such file or directory` errors when paths contain Chinese characters but aren't quoted.

**Diagnosis:** Path contains characters like `桌面`, `数熙相关文档`, `模板`.

**Fix:** Always quote paths in terminal commands:
```bash
python "D:/hpy/桌面/数熙相关文档/.../build.py" --project-path="..."
```

---

### 10. Bat File Encoding (Do Not Use Bash)

**Title:** Do not use bash to write .bat files

**Description:** On Windows, bash (git-bash) writes .bat files with encoding issues. When you need a .bat file, have the user create it manually in PowerShell/cmd, or use Python to write it.

**Symptoms:** .bat file created by bash doesn't execute correctly, garbled characters, encoding mismatch errors.

**Diagnosis:** File contains BOM or wrong encoding for Windows cmd.

**Fix:** Use Python `write_file()` or have the user create the .bat manually in cmd/PowerShell.

---

### 56. Dist Modification Exception — Modals Live in Shell (New)

**Title:** Modals are in shell template, not in page files — dist must be edited directly

**Description:** build.py only injects page HTML + page scripts into the shell. All modals (`modal-overlay`), shared CSS, and shared JS (user data, common functions) live in the shell template. Page files CANNOT inject modal HTML.

**Consequence:** When modifying modals (add/edit/detail/export modals etc.), you MUST edit the dist file directly. Editing the shell template affects ALL projects. Editing page files won't reach modals.

**Operation pattern:**
1. Page files → page HTML + page JS (table, filter, render functions)
2. dist file → modal HTML + modal JS + new CSS (tooltips etc.)
3. Both must be changed, kept in sync
4. If rebuild later, dist-level modal changes get overwritten by shell template

**Batch dist modification:** Write a single Python script using `str.replace()` to do all replacements at once — don't do individual patches on the large dist file (wastes tokens).

```python
with open(dist_path, "r", encoding="utf-8") as f:
    d = f.read()
d = d.replace(old1, new1)
d = d.replace(old2, new2)
# ...
with open(dist_path, "w", encoding="utf-8") as f:
    f.write(d)
```

---

### 57. execute_code read_file Returns Line-Numbered Content (New)

**Title:** `read_file()` from hermes_tools returns `"NNN|content"` format

**Description:** In `execute_code`, `read_file()` returns content with line numbers prepended: `"1|content\n2|content"`. Using this directly as a string for `str.replace()` or other operations will fail silently or produce wrong results.

**Symptoms:** `KeyError: 'content'` when accessing `result["content"]` incorrectly, or replacements produce garbled output with line numbers embedded.

**Fix — two approaches:**
1. **Preferred:** Use `terminal()` + Python file operations (read/write files directly via `open()`) instead of `read_file()` from hermes_tools
2. **Alternative:** Strip line numbers from `read_file()` output before using

---

### 58. Dist and Page Desync (New)

**Title:** Changing page files but forgetting dist (or vice versa) causes inconsistency

**Description:** When modifying prototypes with the build system, changes must go to BOTH source page files AND dist file. Changing only one side creates inconsistency between the editable source and the rendered output.

**Symptoms:** Rebuilt dist doesn't match what user sees; source files don't reflect current dist content.

**Fix:** When doing batch modifications, write a single Python script that modifies both page files and dist file in one pass. Use `todo` to track both targets.

---

## Code Quality Pitfalls

---

### 11. JS Template String Quote Conflicts (Fatal)

**Title:** JS template string quote conflicts in onclick attributes

**Description:** When building HTML strings in JS using template literals (backticks) or string concatenation, single quotes inside `onclick` attributes conflict with the outer string quotes:

```js
// ❌ WRONG: single quotes in onclick break the outer string
innerHTML = '<button onclick="showToast(\'已下载\',\'success\')">下载</button>';

// ✅ CORRECT: use &apos; escaping
innerHTML = '<button onclick="showToast(&apos;已下载&apos;,&apos;success&apos;)">下载</button>';

// ✅ OR: use backtick template string + proper escaping
innerHTML = `<button onclick="showToast('已下载','success')">下载</button>`;
```

**Symptoms:** JS throws `SyntaxError: Unexpected identifier 'xxx'`, the entire `<script>` block doesn't execute → all menu navigation and button clicks stop working.

**Diagnosis:** Run `node --check script.js` — error line number points to the quote conflict location.

**Anti-pattern example:** `onclick="showToast('已下载二维码PNG','success')"` inside a single-quoted JS string → syntax error → user reports "页面打开了无法跳转".

---

### 12. Code Insertion Zone Boundaries (Critical)

**Title:** JS code insertion across CSS/HTML/JS zone boundaries

**Description:** When using Python `str.replace()` to patch HTML, the biggest risk is **cross-boundary matching** — inserting JS functions into the CSS region, or CSS into the JS region.

**Symptoms:**
- JS function inserted into CSS region → doesn't execute, CSS also broken
- CSS style inserted into JS region → browser syntax error, all interactions fail
- Deleting a JS block accidentally deletes adjacent CSS (e.g., deleting QR functions removes Toast CSS)

**Diagnosis:** After a patch, open the file and check that CSS, HTML, and JS regions are still intact. Search for misplaced code blocks.

**Fix — zone segmentation method:**
```python
style_end = html.find('</style>')      # ⚠️ Use find, NOT rfind!
script_start = html.find('<script>')
script_end = html.rfind('</script>')
css = html[:style_end]
body = html[style_end:script_start]
js = html[script_start:html.rfind('</script>') + len('</script>')]
# Modify within each zone, then reassemble
html = css + body + js
```

**Temporary fix (single modification only):** Limit search range to the target zone:
```python
script_start = html.find('<script>')
script_end = html.rfind('</script>')
target = html.find('/* Toast */', script_start, script_end)
```

**Warning:** Do NOT use `sed` in bash/terminal to edit HTML files — Chinese encoding causes garbled output.

---

### 13. \r\n Trap in execute_code (Windows Fatal)

**Title:** `\r\n` trap in `execute_code` with `str.replace()`

**Description:** When using `read_file` + `str.replace()` in `execute_code` to batch-modify HTML files on Windows, **`read_file` returns `"NNN|content"` format lines with trailing `\r`**. Your `str.replace()` uses `\n` for multi-line strings but the file is actually `\r\n`, so replacements silently fail — 0 matches, no error.

**Symptoms:** `str.replace()` followed by `content.count('new content')` returns 0, but no error is thrown.

**Diagnosis:** Add `print(repr(content[idx:idx+100]))` — check for `\r` characters in the content.

**Fix — mandatory template for every execute_code batch replace:**
```python
result = read_file("path/to/file.html", limit=2000)
raw = result['content']

# CRITICAL: strip line numbers + remove \r
lines = []
for line in raw.split('\n'):
    line = line.rstrip('\r')  # ← This line cannot be omitted
    if '|' in line:
        parts = line.split('|', 1)
        if parts[0].strip().isdigit():
            lines.append(parts[1])
        else:
            lines.append(line)
    else:
        lines.append(line)
content = '\n'.join(lines)

# Now str.replace() works correctly
content = content.replace('old string\nwith newline', 'new string\nwith newline')
```

**Alternative:** If only 1-3 changes, use Hermes `patch` tool (`mode='replace'`) which handles CRLF automatically. Only use `execute_code` + `str.replace()` for 4+ batch changes.

---

### 14. HTML Attribute Closing Trap

**Title:** HTML tag closing trap when modifying attributes

**Description:** When using `str.replace()` to add attributes to self-closing tags like `<input>`, the `>` in the replacement string can prematurely close the tag, causing subsequent attributes to leak as visible page text.

**Symptoms:** Page displays `placeholder="..."` or `class="..."` as visible text instead of hidden attributes.

**Diagnosis:** Inspect the page — look for attribute text appearing as rendered content.

**Anti-pattern example:**
```python
# ❌ WRONG: the > in id="addVenueName"> prematurely closes the tag
old = '<span class="form-label">场馆名称：</span>\n          <input type="text" class="form-control" id="addVenueName" placeholder="请输入场馆名称">'
new = '<span class="form-label">场馆名称：<span style="color:#f5222d;">*</span></span>\n          <input type="text" class="form-control" id="addVenueName"> placeholder="请输入场馆名称">'
# Result: placeholder="请输入场馆名称"> displayed as visible text
```

**Fix:** Only replace the label part, keep the input tag intact:
```python
# ✅ CORRECT: only replace label, input tag stays complete
old = '<span class="form-label">场馆名称：</span>'
new = '<span class="form-label">场馆名称：<span style="color:#f5222d;">*</span></span>'
```

**Defense rule:** When modifying HTML attributes, use `search_files` to confirm `old_string` doesn't include the target tag's `>` closing character. If changes involve content adjacent to `<input>`/`<select>`/`<textarea>`, the old_string boundary must stop before the tag's attribute area.

---

### 15. Batch Column Addition Verification

**Title:** Verify all rows after batch table column addition

**Description:** When adding a new column (e.g., "智能体") to a dynamically-rendered table via `str.replace()` row by row, **some rows may be missed** — especially when multiple rows share the same customer+venue but different counts, since `replace()` only matches the first occurrence.

**Symptoms:** Some table rows missing the new column, inconsistent column counts across rows.

**Diagnosis:** Count the new column's `<td>` elements and compare to expected row count:
```python
agent_count = content.count('博物馆导览助手</span></td>') + content.count('科技馆讲解员</span></td>')
print(f"Agent cells: {agent_count}, expected: {expected_rows}")
```

**Fix:** Prefer **JS dynamic rendering** (modify `renderXxx()` template string to add one column) over static HTML row-by-row `str.replace()`. Dynamic rendering requires changing one place; static HTML requires N places and is error-prone.

---

## Mobile Prototype Pitfalls

### 15b. TDS Index Shifts When Action Column Gains Buttons (New)

**Title:** Adding action buttons shifts td indices — markXxx functions must use correct column numbers

**Description:** When adding more buttons to a table's action column (e.g., going from 2 buttons to 3), JS functions that use hardcoded `tds[N]` indices to update status/action columns can target the wrong cells if the original indices were wrong.

**Typical scenario:** A function `markMissHandled(btn, status)` uses `tds[5]` and `tds[6]` to update "处理状态" and "操作" columns. But the table has 8 columns (问题原文, 来源客户, 来源场馆, 智能体, 触发时间, 所属用户, 处理状态, 操作), so the correct indices are `tds[6]` and `tds[7]`. Adding a "合并至已有" button doesn't change the column count — the bug was pre-existing.

**Symptoms:** Clicking "忽略" or "标记已处理" overwrites the wrong column — e.g., "所属用户" gets replaced with a status badge, and "处理状态" gets replaced with action text.

**Diagnosis:** Count the `<th>` columns in the table header, then verify the function's `tds[N]` indices match:
```python
# Count columns
ths = re.findall(r'<th ', table_html)
print(f"Column count: {len(ths)}")  # e.g., 8
# Then check: status should be tds[N-2], action should be tds[N-1]
```

**Fix:** Always derive tds indices from the actual column count:
- Last column (action): `tds[columns - 1]`
- Second-to-last (status): `tds[columns - 2]`

**Rule:** After modifying a table's action column (adding/removing buttons), search for ALL JS functions that use `tds[N].innerHTML` on that table and verify each index against the header.

---

### 16. Keyboard Occlusion (Mobile Chat Interface)

**Title:** Keyboard must not occlude content — use flex flow

**Description:** On mobile chat interfaces, the keyboard **must be a flex-flow element** (`flex-shrink: 0`), not `position: absolute`. Use `display: none/block` to toggle it. This way the message list compresses naturally and the input box moves up above the keyboard — matching real phone behavior.

**Symptoms:** Keyboard overlays messages and input box, user can't see what they're typing or the latest messages.

**Diagnosis:** Check keyboard CSS — if it uses `position: absolute; bottom: 0; transform: translateY(100%)`, that's the bug.

**Fix:**
```css
/* ✅ CORRECT: keyboard is flex flow element */
.keyboard { flex-shrink: 0; }
/* Toggled with display: none/block */

/* ❌ WRONG: absolute positioning covers content */
/* .keyboard { position: absolute; bottom: 0; transform: translateY(100%); } */
```

---

### 17. Button Visibility — Only Last Message

**Title:** Action buttons only show on the last AI message

**Description:** User feedback: "只有最后一个回答可以用复制等快捷操作，前面的不需要" — only the most recent AI message should display copy/replay/play buttons.

**Symptoms:** Every AI message shows action buttons, cluttering the interface.

**Diagnosis:** Check the `addAIMessage()` function — if it always adds action buttons without removing old ones.

**Fix:** Every time a new AI message is added, first clear all old action bars, then add one to the new message:
```js
document.querySelectorAll('.msg-actions').forEach(el => el.remove());
// Then add actions to new message
```

---

### 18. Welcome Message — No Action Buttons

**Title:** Welcome/intro message should not have action buttons

**Description:** The first AI self-introduction message should NOT display "copy/replay/play" buttons. Handle it separately, bypassing `addAIMessage()`'s action button logic.

**Symptoms:** Welcome message has copy/replay buttons that look out of place.

**Diagnosis:** Check if the welcome message goes through the same `addAIMessage()` path as regular messages.

**Fix:** Write the welcome message with custom HTML that doesn't include `.msg-actions` div.

---

### 19. Context-Aware Follow-up Suggestions

**Title:** Follow-up suggestions must match the reply type

**Description:** After each AI response, push 3 follow-up suggestions whose content should **dynamically match the reply type**:
- Route-type reply → suggest "某个展厅展品", "预计游览时长", "附近餐饮"
- Exhibition-type reply → suggest "特展在几楼", "门票价格", "能否拍照"
- Facility-type reply → suggest "无障碍通道", "母婴室", "推荐路线"
- Fallback reply → suggest "推荐路线", "展览介绍", "服务台位置"

When a new answer arrives, **clear all old suggestion cards** before showing new ones.

**Symptoms:** Generic suggestions appear regardless of what the AI just said. Old suggestions persist when new reply arrives.

**Diagnosis:** Check if suggestion generation uses the reply content/type as input.

**Fix:** Route suggestion generation based on keyword matching of the AI reply content. Always `.remove()` old suggestion containers before rendering new ones.

---

### 20. Phone Frame Background Color

**Title:** Phone frame outer area background must be light

**Description:** The area outside the phone frame in mobile review layout must use a **light background** (`#f5f6fa` or `#f0f2f5`). **Never use dark backgrounds** (`#1a1a2e`) — dark backgrounds blend with the phone's black border and make the boundary invisible.

**Symptoms:** User says "太深了看不清楚" (too dark, can't see clearly). Phone frame blends into background.

**Diagnosis:** Check the CSS for the area surrounding `.phone-frame` — if it's dark (#1a1a2e or similar), that's the issue.

**Fix:** Change the outer container background to `#f5f6fa` or `#f0f2f5`.

---

## PC Enterprise Prototype Pitfalls

---

### 21. Action-Button Unified Style (Highest Priority)

**Title:** All PC list page action buttons must use unified `action-btn` style

**Description:** All PC enterprise backend list pages must use the same `action-btn` style for the operation column:

```css
/* Blue text, no border, underline on hover — universal clickable action */
.action-btn { color: #0B5DEA; cursor: pointer; font-size: 13px; border: none; background: none; padding: 2px 6px; }
.action-btn:hover { text-decoration: underline; }
/* Red text — dangerous/severe operations (delete, disable) */
.action-btn.danger { color: #f5222d; }
```

Usage:
```html
<button class="action-btn" onclick="...">详情</button>
<button class="action-btn" onclick="...">编辑</button>
<button class="action-btn danger" onclick="...">停用</button>
<button class="action-btn danger" onclick="...">删除</button>
```

**Absolutely forbidden:** In list tables, using bordered button styles (e.g., `.venue-action-btn` with `border: 1px solid #d9d9d9`). List operation columns use text-link style only.

**Exception:** Buttons inside forms (modal footer "确认/取消", toolbar "导出/新增") can continue using `.filter-btn` or `.toolbar-btn` with borders.

---

### 22. Dynamic vs Static Table Rendering

**Title:** Check rendering mode before modifying table data

**Description:** Before modifying table data, determine the rendering method — otherwise you'll change HTML but the page won't reflect it:

- **Static HTML:** Directly `str.replace()` to modify `<td>` content
- **JS dynamic rendering** (e.g., `renderVenueTable()` / `renderSessionLogs()`): Must modify JS template strings or the underlying data source (e.g., `venueData` array), not the HTML

**Diagnosis:** Search for `function render*` or `.innerHTML = data.map(` to determine rendering mode. If table content is in template strings inside `<script>`, it's dynamic rendering.

**Warning:** Code generated by sub-agents/different rounds may use different rendering methods — some pages may be static HTML, others JS dynamic rendering. Always check the target page's mode before modifying data.

---

### 23. Export Modal Pattern (Per-Page Independent)

**Title:** Each list page needs its own independent export modal

**Description:** In PC enterprise prototypes, every list page needs an independent export modal. Modal content should match the page's actual filter fields.

**Standard structure:**
```html
<div class="modal-overlay" id="xxxExportModal">
  <div class="modal export-modal">
    <div class="modal-header">
      <h3>导出XXX</h3>
      <button class="modal-close" onclick="closeXxxExportModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="export-form">
        <div class="export-row">
          <label>字段名：</label>
          <select id="exportField">...</select>
        </div>
        <div class="export-row">
          <label>时间范围：</label>
          <input type="date" id="exportStart">
          <span style="color:#999;">至</span>
          <input type="date" id="exportEnd">
        </div>
        <div class="export-note">
          <b>导出说明：</b><br>
          • 筛选条件说明<br>
          • 导出字段列表
        </div>
        <div class="export-actions">
          <button class="confirm-btn" onclick="closeXxxExportModal()">取消</button>
          <button class="confirm-btn export-btn-confirm" onclick="doXxxExport()">确认导出</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

```css
.export-modal { width: 480px; }
.export-form { display: flex; flex-direction: column; gap: 16px; }
.export-row { display: flex; align-items: center; gap: 10px; }
.export-row label { font-size: 13px; color: #666; min-width: 80px; text-align: right; }
.export-row select, .export-row input { flex: 1; height: 32px; border: 1px solid #d9d9d9; border-radius: 4px; padding: 0 10px; }
.export-note { background: #f6f8fa; border-radius: 4px; padding: 10px 14px; font-size: 12px; color: #999; }
.export-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
```

**Warning:** Each page's export modal has different filter fields — user management has customer/status/time, session records has customer/quality/time, miss-tracking has customer/type/status/time. Do NOT reuse the same modal across pages.

---

### 24. Drawer Layout — Fixed Bottom Outside Scroll

**Title:** Drawer fixed bottom must be outside the scroll area

**Description:** When a drawer/side panel has a scrollable list + fixed bottom information, the fixed content must NOT be inside the scroll area.

**Symptoms:** Fixed bottom items (user info, hints) scroll up with the list and disappear.

**Diagnosis:** Check if the fixed-content divs are children of the scroll container.

**Fix:**
```html
<div class="drawer">
  <div class="drawer-header">标题 + 操作按钮</div>
  <div class="drawer-list" id="list"><!-- JS动态渲染，overflow-y: auto --></div>
  <div class="drawer-hint">固定提示文字</div>  <!-- flex-shrink: 0 -->
  <div class="drawer-user">用户信息</div>      <!-- flex-shrink: 0 -->
</div>
```
- List area: `flex: 1; overflow-y: auto` — scrolls when content overflows
- Hint and user info: `flex-shrink: 0` — always fixed at bottom, never scrolls
- **Never** use JS `appendChild` to append fixed content into the scrollable list

---

### 25. Multi-Step Modal Flow (Verify → Input)

**Title:** Multi-step modal for verification then input

**Description:** For phone number change, password modification, etc., use multi-step modals:

```html
<div class="edit-mask">
  <div class="edit-dialog">
    <div id="step1"><!-- Step 1: verify current value + verification code --></div>
    <div id="step2" style="display:none;"><!-- Step 2: input new value --></div>
  </div>
</div>
```

**Symptoms:** Single-step modal feels awkward for verify-then-change workflows.

**Fix:**
- Step switching via `style.display`
- Each step has fixed "取消 | 下一步/确定" buttons at bottom
- After sending verification code, start 60s countdown, button turns grey

---

### 26. Metric Design — User vs Customer Dimension

**Title:** Metrics must be designed at the right granularity

**Description:** User feedback: "兜底率对单个用户没意义，用户随便问个不相干的问题就触发了。"

**Principle:** Metrics like fallback rate, hit rate, etc. only have product improvement value at the **customer dimension** (aggregated across all users) — they reveal knowledge base gaps. At the **single-user dimension**, they're just noise because individual behavior varies wildly.

**Symptoms:** Prototype shows per-user fallback rate, which is meaningless and clutters the UI.

**Diagnosis:** Ask: "At which granularity does this metric have decision value?"

**Fix:** When designing statistical metrics in prototypes, first ask yourself: does this metric provide actionable insight at this granularity? Don't add meaningless fields just to "look complete."

---

### 27. Session Quality Filter

**Title:** Session quality is a fixed three-value filter dimension

**Description:** Session quality is a common filter for the session records page, with three fixed values:

```html
<div class="filter-item">
  <span class="filter-label">会话质量：</span>
  <select class="filter-select" id="logFilterQuality" style="min-width:110px;">
    <option value="">全部</option>
    <option value="good">顺利</option>
    <option value="warn">有兜底</option>
    <option value="bad">较多兜底</option>
  </select>
</div>
```

**Determination rules:** Fallback count ≥ 3 = 较多兜底(bad), 1-2 = 有兜底(warn), 0 = 顺利(good).

**Fix:** Filter function adds `if (quality && s.quality !== quality) return false;`.

---

### 28. Group Operation Sync After Batch Processing

**Title:** Group row status must sync after batch operations in modals

**Description:** After executing "全部标记已处理" inside a group detail modal, the group row's status on the list page must also update.

**Symptoms:** Group detail modal shows all items processed, but parent list still shows old status.

**Diagnosis:** Check if modal close triggers a status re-evaluation.

**Fix — two approaches:**
1. Before closing modal, use `window.currentGroupIdx` to remember the current group index, then update the corresponding row's status and action columns
2. Simpler: modal processing only updates modal data; on close, re-evaluate all group rows (check if all items are processed/ignored)

---

### 29. Filter Bar Additions Pattern

**Title:** Adding new filter conditions to existing filter bars

**Description:** When adding a new filter to an existing filter bar, use patch to insert a new `filter-item` after the last `</div>` and before the query button:

```html
<div class="filter-item">
  <span class="filter-label">新字段：</span>
  <select class="filter-select" id="xxxFilter" style="min-width:110px;">
    <option value="">全部</option>
    <option value="val1">显示文本1</option>
    <option value="val2">显示文本2</option>
  </select>
</div>
```

**Fix — JS changes needed:**
- Filter function: add `if (filterVal && s.field !== filterVal) return false;`
- Reset function: add `document.getElementById('xxxFilter').value = '';`

---

### 30. View Switching (Group View / Raw List)

**Title:** View switching for overview + detail perspectives

**Description:** When data volume is large and needs both "overview + detail" perspectives, use view switching. Typical scenario: miss-tracking statistics (AI-clustered groups vs raw individual list).

**HTML structure:**
```html
<div class="page-header">
  <div class="page-title">页面标题</div>
  <div style="display:flex;gap:8px;">
    <button class="filter-btn primary" id="viewGroup" onclick="switchView('group')">分组视图</button>
    <button class="filter-btn" id="viewList" onclick="switchView('list')">原始列表</button>
  </div>
</div>
<div id="groupView"><!-- Group view: aggregated info per group --></div>
<div id="listView" style="display:none;"><!-- Raw list: complete detail table --></div>
```

**JS switch logic:**
```js
function switchView(view) {
  document.getElementById('groupView').style.display = view === 'group' ? 'block' : 'none';
  document.getElementById('listView').style.display = view === 'list' ? 'block' : 'none';
  document.getElementById('viewGroup').className = view === 'group' ? 'filter-btn primary' : 'filter-btn';
  document.getElementById('viewList').className = view === 'list' ? 'filter-btn primary' : 'filter-btn';
}
```

**Warning:** Group view operations and raw list operations target different things — group operations affect the whole group (e.g., "补充知识库" = all issues in that category), raw list operations affect individual items. Their JS functions must be written separately.

---

### 31. Group Detail Modal (Not Inline Expand)

**Title:** Use modals for group details, not inline row expansion

**Description:** User explicitly rejected "click to expand detail row" in favor of modals for group details. Reasons:
- Inline expansion stretches the table, disrupting the list's overall view
- Modals can contain more operations (individual processing, batch processing)
- More space for richer information display

**Do NOT use `<tr class="group-detail">` inline expansion!** Use modals instead:

```js
const groupData = [
  { category: '停车相关', customer: 'XX博物馆', aiType: '知识库缺失', items: [
    { q: '有没有停车场', user: '王五', time: '2026-07-06', status: '待处理' },
  ]}
];

function openGroupDetail(idx) {
  const g = groupData[idx];
  // Fill modal header (category, customer, AI type)
  // Render items as table rows, each individually operable
  document.getElementById('groupDetailModal').classList.add('show');
}
```

Modal operation buttons follow the raw list logic — pending items show "标记已处理/忽略", processed items show "—". Modal top can include "全部标记已处理/全部忽略" batch buttons.

---

### 32. Single-Entity Grouping Principle

**Title:** Groups must be split by single entity, never merged

**Description:** User correction: **Groups must be split by single entity — never merge multiple entities into one group.**

Typical scenario: miss-tracking issues grouped by "issue category × customer". Even if "停车相关" appears for both XX博物馆 and 科技馆, they must be two independent groups:
- 停车相关 - XX博物馆 (8 items)
- 停车相关 - 科技馆 (4 items)

**Reason:** Different customers are handled by different operations staff. Merging prevents assigning responsibility.

**Design principle:** When designing grouping logic, first ask: is the handler for this data unified or distributed? If distributed (by customer, department, region), the grouping must include the responsibility dimension.

---

### 33. Three-Layer Data Architecture (AI-Assisted)

**Title:** Three-layer processing for large-volume human-reviewed data

**Description:** When list data volume is large (hundreds of new items daily) and requires human judgment, pure manual processing is infeasible. Design a three-layer architecture:

| Layer | Processing | Human Involvement |
|-------|-----------|-------------------|
| L1 Auto | AI judges clearly irrelevant/auto-processable data, marks complete directly | None |
| L2 AI Cluster + Human Decision | AI groups similar data, human decides per "group" (= batch processing) | See group, not individual |
| L3 Manual | AI-uncertain data goes to pending worklist | Process individually |

**Prototype implementation points:**
- Default view: L2 group view (main human work interface)
- Toggle to raw list to see all details
- L1 auto-processed items marked "AI自动处理" in group view
- L3 items are rare, prominently displayed as "待处理" status

---

### 34. Card List Filtering

**Title:** Card layout filtering uses show/hide, not data re-render

**Description:** For card-based layouts (e.g., QR code management), filtering uses show/hide on DOM elements, not data re-rendering:

```js
function filterCardList() {
  const filter = document.getElementById('filterSelect').value;
  document.querySelectorAll('#gridContainer .card').forEach(card => {
    const name = card.querySelector('.card-name').textContent;
    card.style.display = (!filter || name === filter) ? '' : 'none';
  });
}
```

Select's `onchange` calls the filter function directly. Reset button clears the select and calls filter.

---

### 35. Excel Operations with openpyxl

**Title:** Use openpyxl for Excel operations

**Description:** For modifying `.xlsx` files, use `python -m pip install openpyxl` then Python scripts. Never attempt to use `sed`/`patch` on binary files. Merged cells use `ws.merge_cells('B25:B30')`.

**Symptoms:** Binary file corruption when using text tools on Excel files.

**Diagnosis:** File becomes unreadable in Excel after `sed` or text-based edits.

**Fix:** Always use `openpyxl` Python library for Excel manipulation.

---

## Component Mode & Migration Pitfalls

---

### 36. Reference vs Embedded Mode (Default: Reference)

**Title:** Reference mode is the default, not embedded

**Description:** Reference mode is the recommended approach: project files live externally (e.g., `D:\hpy\桌面\数熙相关文档\<项目名>\prototype\`), build.py and shell/assets are read from the global kit.

**Iron rule: Project directories must NEVER contain copies of `build.py`, `base.css`, `base.js`, or other global files.** The old skill version said "copy entire prototype-kit to project directory" — this is wrong and has been deprecated.

**How to determine which mode:**
- New project → default reference mode
- User mentions "内嵌" / "都在一个目录里" → embedded mode (legacy compatibility)
- Uncertain → reference mode

---

### 37. ProtoRouter is Mobile-Only, PC Not Injected

**Title:** ProtoRouter/ProtoAnno/ProtoDoc are mobile-only

**Description:** `ProtoRouter`, `ProtoAnno`, `ProtoDoc` are defined in `base.js` and **only injected during mobile builds**. PC builds don't inject base.js — PC routing uses the shell template's built-in `switchPage()` + build.py's `protoShowPage()` wrapper.

**Symptoms:** Validation script flags missing `ProtoRouter` in PC output — this is a false positive.

**Diagnosis:** PC output not having ProtoRouter is by design.

**Fix:** When validating build output, use `scripts/verify-output.py` which automatically distinguishes PC/mobile and checks different items.

---

### 38. Post-Migration File Size Check

**Title:** Migrated output file size must be close to original

**Description:** User explicitly said: "V5版本完整的是141KB，你现在搞一个78KB的跟我说，搞完了？"

Post-migration output file size should be close to original (difference <20%). If the gap is large, investigate in this order:

1. **Shell missing CSS** — Generic template CSS is far less rich than original. Must extract shell from original file.
2. **Shell missing modals** — Modals are at body level, not inside page-section. Shell extraction must preserve all modals.
3. **Shell missing shared JS** — Data objects, `showToast`, `toggleMenu`, etc. must be in the shell.
4. **Page components missing content** — parse_component nested div truncation issue (see below).

**Never equate "file opens" with "migration succeeded."** Must verify: menu correct, pages switchable, buttons clickable, styles match original.

---

### 39. Single-File Token Trap

**Title:** Single-file prototypes consume massive tokens

**Description:** Single-file HTML prototypes require **full read + full output** of the entire file (2000-5000 lines) on every AI interaction during iteration. One prototype development session can consume hundreds of thousands of tokens.

**Rule:** When a prototype needs 3+ iterations of modification, **you must use component mode**. Only use single-file mode for one-shot demos (make it and never change it).

**Decision criteria:**
- One-shot throwaway demo → single-file mode
- Needs post-review changes, formal prototype for developers, multi-round iteration → component mode
- Uncertain → default component mode (lower cost)

---

### 40. Data + Function Extraction Together (Fatal)

**Title:** Data variables must be extracted together with functions

**Description:** When splitting a single-file prototype into components, page-specific data arrays (e.g., `venueData`, `allSessionLogs`, `customerVenues`) **must be extracted together with functions into the component's `<script>`** — never injected separately.

**Wrong approach:** Extract functions first (functions reference `venueData`), then separately inject `venueData` → `const venueData` duplicate declaration → entire `<script>` block throws SyntaxError → all menus/buttons fail.

**Diagnosis:** After build, check JS syntax:
```python
import re
html = open('output.html', encoding='utf-8').read()
scripts = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
with open('check.js', 'w', encoding='utf-8') as f:
    f.write(scripts[0])
# Run: node --check check.js
```
If it reports `Identifier 'xxx' has already been declared` — duplicate declaration.

**Correct approach:** Write an extraction script that extracts both data variables and functions simultaneously, assigning by ownership. After extraction, check for duplicate declarations:
```python
from collections import Counter
decls = re.findall(r'(?:const|let)\s+(\w+)', script_content)
dupes = {k: v for k, v in Counter(decls).items() if v > 1}
```

---

### 41. build.py parse_component Two Fatal Traps

**Title:** build.py parse_component has two critical regex traps

**Trap 1: class variant matching**

`parse_component` extracts page HTML — the regex must match `class="page"` AND its variants (e.g., `class="page active"`).

```python
# ❌ WRONG: only matches class="page", not class="page active"
re.search(r'<div\s+class="page"[^>]*>.*?</div>', content)

# ✅ CORRECT: matches any class value
re.search(r'<div\s+class="page[^"]*"[^>]*>.*?</div>', content)
```

**Symptoms:** Build output proto-page div is empty, page content lost, but file size is normal (shell template itself has content).

**Trap 2: nested div truncation**

Lazy matching `.*?</div>` truncates at the first `</div>` when encountering nested divs, extracting only the outer container and losing all child content.

```python
# ❌ WRONG: lazy match truncates at nested div
page_match = re.search(r'(<div\s+class="page[^"]*"[^>]*>.*?</div>)', content, re.DOTALL)

# ✅ CORRECT: use nesting depth counter to find matching close tag
page_start = re.search(r'<div\s+class="page[^"]*"', content)
if page_start:
    depth = 0
    i = page_start.end()
    while i < len(content):
        if content[i:i+4] == '<div':
            depth += 1
        elif content[i:i+6] == '</div>':
            if depth == 0:
                page_html = content[page_start.start():i+6]
                break
            depth -= 1
        i += 1
```

**Symptoms:** Build output proto-page has only dozens to hundreds of characters (just the outer `<div>` and first `</div>`), missing tables, modals, and all child content.

**Diagnosis:** After build, check each proto-page's character count. If < 500 chars, parsing is broken. Normal page components should be > 1000 chars.

---

### 42. build.py Regex for Hyphenated IDs

**Title:** Page IDs with hyphens need `[\w-]+` not `\w+`

**Description:** Page IDs like `user-list`, `chat-records` contain hyphens — `\w+` doesn't match `-`.

```python
# ❌ WRONG: only matches login, not user-list
re.search(r'id="page-(\w+)"', content)

# ✅ CORRECT: matches hyphenated names
re.search(r'id="page-([\w-]+)"', content)
```

If `base.js` uses regex to extract IDs, it must also be fixed.

---

### 43. Shell Placeholder Replacement Ordering

**Title:** Shell template placeholder replacement order matters

**Description:** build.py uses string placeholders (e.g., `/* __BASE_CSS__ placeholder */`) to inject content. Replacement order matters:

1. Replace `__MOCK_DATA__` and `__COMPONENT_SCRIPTS__` first
2. Then replace `__BASE_JS__` (because base.js depends on MOCK data)
3. Last replace `__BASE_CSS__` and `__SCOPED_CSS__`
4. Shell template's `{{PLATFORM_NAME}}` etc. mustache-style variables use Python `str.replace()`

**Symptoms:** If order is wrong, JS may reference data that hasn't been injected yet, causing undefined errors.

**Fix:** Follow the numbered order strictly.

---

### 44. Mobile Theme Color Injection

**Title:** Mobile shell uses `{{PRIMARY_COLOR}}` placeholder

**Description:** `shell-mobile.html` uses `{{PRIMARY_COLOR}}` placeholder. build.py reads `primaryColor` from config.json and replaces it. If config.json is missing this field, default is `#8b6914` (museum gold). Mobile tab bar highlight color and page button highlight color both follow this theme color.

**Symptoms:** Mobile prototype uses wrong accent color, doesn't match project branding.

**Fix:** Ensure `proto-config.json` has the correct `primaryColor` field for mobile projects.

---

### 45. Migration to Reference Mode (Full 6 Steps)

**Title:** Complete 6-step migration from single-file to reference mode

**Description:** When migrating an existing single-file prototype to reference mode, **you must follow these steps exactly** — no skipping:

**Step 1: Analyze original file structure**
- grep for page markers, function names, data arrays
- Confirm page count, modal ownership, JS structure

**Step 2: Create Shell template (user-confirmed, not auto-extracted by AI)**
- AI analyzes the original file's shell structure (CSS + menu + modals + shared JS boundaries)
- AI outputs a shell extraction proposal for user confirmation
- After confirmation, AI extracts and writes to `src/shells/shell-pc-xxx.html`
- User confirms Shell file is correct — AI never modifies it after this
- **If the original file is already a finalized template**, copy it directly as Shell without modification

**Why not auto-extract Shell?** Shell is the framework-layer benchmark. AI auto-extraction容易出现偏差 (menu loss, CSS incomplete, modal omission). User manual confirmation ensures framework-layer boundaries are correct.

**Step 3: Unify switchPage to title-based**
- Shell's switchPage must become `function switchPage(pageTitle, element)`
- Menu onclick becomes `switchPage('页面标题', this)`
- switchPage internally only does: menu highlight + breadcrumb update (no longer directly operates page-section show/hide)
- Page show/hide handled by build.py's protoShowPage wrapper

**Step 4: Extract page components**
AI extracts in one pass, by page markers: page HTML, page modals, page data, and page functions. Each written to its own page component file. Each component must include `init_xxx()`.

**Step 5: Every component must have init_xxx()**
- Page component must have `function init_xxx()` in `<script>` block
- init function calls the page's rendering logic (e.g., `renderVenueTable()`, `renderSessionLogs()`)
- build.py automatically calls `init_xxx()` when switching to that page

**Step 6: Post-build JS syntax verification + functional acceptance**
- Run `build.bat` in project root
- If `Identifier 'xxx' has already been declared` → duplicate declarations, must delete
- If other syntax errors → code structure broken, must fix
- **Never use bare regex for JS deduplication** — must identify complete declaration statements (to semicolon/closing bracket)

**Acceptance checklist:**
- [ ] Menu count matches original file
- [ ] Every page switches normally
- [ ] Core interactions (modals, forms, data display) work
- [ ] Console has no red errors
- [ ] Output size close to original (reference only, gap <20%)

---

### 46. init_xxx Rule

**Title:** Every page component must have init_xxx()

**Description:** Every page component **must** have `function init_xxx()` where xxx = page ID with hyphens replaced by underscores:

```html
<script>
// Data
const venueData = [...];
// Functions
function renderVenueTable() { ... }
// Init (MUST HAVE!)
function init_venue_mgmt() {
  renderVenueTable();
}
</script>
```

**Symptoms:** Page content is blank when switching to a page without init_xxx().

**Fix:** Always add init_xxx() that calls the page's rendering logic.

---

### 46b. Page Renders But Data Empty — Undeclared Global in init (New)

**Title:** "框架在但数据全空" → check init for ReferenceError on undeclared variable

**Description:** Page shell renders (menu/filter bar/stats cards/toolbar all visible) but left tree has no nodes, stats are all 0, card list is empty. User reports "没实现/没数据" — but **user says not-implemented ≠ actually not implemented**. The data may already exist in the shared data source page (e.g., 02-resource-mgmt-a.html); the render chain just died.

**Root cause:** `init_xxx()` **reads** a global variable that was never declared with `var` anywhere (e.g., private page's `PVT_TREE_SEARCH`), throwing `ReferenceError: xxx is not defined` on the first read. All subsequent rendering (tree/stats/cards) is skipped. In non-strict mode, **assignment doesn't throw but first READ does** — so the error appears at the init line, not where the variable is assigned.

**Diagnosis order:**
1. Confirm user opened the **latest dist** — old dist artifacts may not have this page/data at all
2. In browser console run `protoShowPage('pageId')` — does it throw ReferenceError?
3. `grep -rn "var XXX" pages/` across the repo — declaration missing = root cause

**Fix:** Declare shared state variables in the shared data source page (same place as `RES_TREE_SEARCH`). When copying a public page to create a private variant, the private variant's variable declaration is the easiest thing to miss.

**Related cross-customer pitfall:** In customer-isolated private trees, the fallback match `c.themePath.indexOf(t.name) >= 0` matches by category name globally — same-named categories under different customers (本地频道/乡村振兴) leak data across customers. Fix: before the fallback, take the customer root `t.path.split(' / ')[0]` and require `c.themePath` to start with that root.

---

### 47. Function/Data Extraction Must Confirm Each One

**Title:** Migration function/data extraction requires individual confirmation

**Description:** When extracting page components, **you cannot rely on guessing function names from experience**.

**Wrong approach:**
1. grep function names from original
2. Manually classify to pages (by impression, ambiguous ones skipped)
3. Extract by classification list
→ Result: miss `closeMissModal` (too similar to `closeGroupDetail`), miss `groupDetailData` (extracted function but not data array)

**Correct approach:**
1. grep ALL `function xxx` and `const/let xxx =` names from original
2. For each, `grep -n "functionName|varName"` to confirm which page region references it
3. For ambiguous ones, check context (don't guess from name)
4. After extraction, compare: original function count vs output function count — even one difference must be investigated

**Verification checklist:**
- Compare function count: `grep -o "function \w+" | wc -l`
- Compare data variable count: `grep -o "(const|let) \w+" | wc -l`
- Difference should only include build.py wrapper functions (`protoShowPage`, `_origSwitchPage`, `init_xxx`) — any other difference = missed extraction

---

### 48. Data Deduplication — No Duplicate Declarations

**Title:** Data arrays must appear only once

**Description:** When extracting page components, data arrays (`const xxx = [...]`) must appear exactly once.

- If data is already included in function extraction → don't inject it separately
- If data needs separate injection → function extraction must not include it
- **Post-build check:** `node --check` reporting `has already been declared` = duplicate declaration

---

## Shell Template Pitfalls

---

### 49. HTML Class Mapping

**Title:** Different projects may use different page container classes

**Description:**
- Unified standard: `class="proto-page"` (works for both PC and mobile)
- Legacy compatibility: `class="page"` or `class="page-section"` → replace with `class="proto-page"` during extraction
- build.py supports both `proto-page` and `page`, but new components should uniformly use `proto-page`

---

### 50. Shell switchPage Convention

**Title:** Shell's switchPage must follow specific convention

**Description:** Shell template's switchPage must follow:

```js
function switchPage(pageTitle, element) {
  // 1. Clear all menu highlights
  document.querySelectorAll('.sub-menu .menu-item').forEach(m => m.classList.remove('active'));
  // 2. Highlight current menu item
  if (element) element.classList.add('active');
  // 3. Update breadcrumb
  updateBreadcrumb(pageTitle);
  // ❌ DO NOT operate page-section show/hide here
  // ❌ DO NOT call renderVenueTable() etc. here
}
```

Page show/hide and data rendering are handled by build.py's protoShowPage + init_xxx().

---

### 51. Shell Template Fidelity — Never Modify

**Title:** Never modify the shell template once finalized

**Description:** When a user provides a finalized HTML template as a platform's layout skeleton (e.g., `模板-智融平台.html`), **it is absolutely forbidden to modify any structure, style, or JS logic in the template**. New pages only add content to the template's designated injection area (e.g., `content-area`).

**Identification signals:** User says "这个就是我写好的模板", "不要自己写", "用那个模板", "不改变模板里面的结构和内容", "不要擅自改东西".

**Correct approach:**
1. Copy the finalized template as `src/shells/shell-pc.html`
2. build.py only does two things: ① insert page HTML at template's injection markers ② wrap switchPage function
3. Page component CSS classes must match template's existing class names (if template uses `.filter-btn`, don't use `.btn-primary`)
4. **Template's built-in menu must not be replaced** — whatever menu the template has stays, build.py doesn't modify sidebar-menu content
5. **Template's built-in JS logic must not be overwritten** — switchPage, toggleMenu etc. functions are preserved verbatim, build.py only wraps them

**Wrong approach:** Rewriting shell template, changing template layout structure, using different CSS class names, replacing template's built-in menu items, overriding template menu with config.json menu.

---

### 52. Content-Area Must Be Empty Shell

**Title:** Template content-area should be empty (injection markers only)

**Description:** A finalized template's content-area should be empty (only injection marker comments like `<!-- build.py 注入页面 -->`), containing no example page content. The template is the layout skeleton; page content is injected at build time. If the template contains example content (e.g., "系统登录", sample tables), clear it when copying to shell — keep only the injection marker comment.

**Symptoms:** Build output contains template example content mixed with actual page content.

**Diagnosis:** Check if shell's content-area has leftover placeholder/example pages.

**Fix:** When creating shell from template, replace all content between content-area markers with just the injection comment.

---

### 53. switchPage Wrapping by build.py

**Title:** build.py must wrap the template's switchPage function

**Description:** User's finalized template typically has its own `switchPage()` function (controls breadcrumb + menu highlight), but it only updates UI — it doesn't control proto-page show/hide. build.py must:

1. Save original function reference: `var _origSwitchPage = switchPage;`
2. Wrap with new function: call original (preserve breadcrumb logic) + call `protoShowPage()` (switch proto-page show/hide)
3. Generate `title → pageId` mapping table (from components' PAGE_META) so switchPage can find the corresponding proto-page

```js
var _pageTitleToId = {"子菜单一": "page-a", "子菜单二": "page-b"};
switchPage = function(pageTitle, element) {
  _origSwitchPage(pageTitle, element);  // Preserve original template breadcrumb logic
  var pid = _pageTitleToId[pageTitle];
  if (pid) protoShowPage(pid);           // Switch proto-page show/hide
};
```

**build.py empty page handling:** When `pages/` directory is empty, build.py should output the empty shell template without error — the template itself is a usable empty prototype.

---

### 54. CSS Class Matching to Shell Template

**Title:** Page component CSS classes must match shell template's defined classes

**Description:** CSS classes used in page components must be consistent with those already defined in the shell template's `<style>` section. Common differences:

- Template uses `.filter-btn.primary` → don't use `.btn-primary`
- Template uses `.table-card` → don't use `.table-wrap`
- Template uses `.badge-status.active` → don't use `.tag-green`
- Template uses `.action-btn` → don't use `.btn-link`

**Fix:** Before building, read the shell template's `<style>` section once, list all available component classes, and ensure page components only use these existing classes.

---

*End of pitfalls reference. Total: 55 pitfalls covering tool usage, code quality, mobile/PC prototypes, component mode, migration, and shell templates.*

---

### 55. execute_code Triple-Quote CSS/JS SyntaxError

---

### 56. CSS Tooltip Pseudo-Element Conflict (New)

**Title:** CSS tooltip with ::before + ::after causes visual glitches

**Description:** Using both `::before` (arrow) and `::after` (text) pseudo-elements for CSS tooltips causes:
- Two "?" icons appearing (one from element text, one from pseudo-element)
- Black background tooltip appearing immediately while white one appears after delay
- Flickering between states on hover

**Symptoms:** User reports "有两个？" and "黑色背景遮挡".

**Root cause:** `::before` with `content: ''` + border creates a visible element even without hover. `::after` with `content: attr(title)` uses browser's native title tooltip which has different timing.

**Fix — simplified single pseudo-element approach:**
```css
.tooltip-icon::after {
  content: attr(data-tip);  /* Use data-tip, NOT title */
  position: absolute;
  /* ... positioning ... */
  background: #fff;
  color: #333;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s, visibility 0.15s;
  pointer-events: none;
  white-space: normal;  /* CRITICAL: allows text wrapping */
  word-wrap: break-word;
  max-width: 320px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.tooltip-icon:hover::after {
  opacity: 1;
  visibility: visible;
}
```

**Key points:**
1. Only use `::after` — no `::before` arrow
2. Use `data-tip` attribute, not `title` (avoids native tooltip interference)
3. `opacity` + `visibility` transition for smooth appearance
4. `white-space: normal` for text wrapping — without this, long text overflows the bubble

---

### 57. Template Literal Type Coercion (New)

**Title:** Template literal wraps numeric IDs in quotes, breaking strict equality

**Description:** When rendering dynamic table rows with JS template literals, wrapping numeric IDs in quotes converts them to strings:

```js
// WRONG: '${s.id}' passes string '1', not number 1
onclick="openSessionDetail('${s.id}')"

// The lookup function uses strict equality:
function openSessionDetail(sessionId) {
  const s = allSessionLogs.find(x => x.id === sessionId);
  // x.id is number 1, sessionId is string '1' → '1' === 1 → false
  // Returns undefined → function silently does nothing
}
```

**Symptoms:** Button click has no effect. No JS error in console. Function returns silently.

**Diagnosis:** Check if the function parameter type matches the data type. If data uses numeric IDs, don't wrap in quotes.

**Fix:** Remove quotes around numeric template expressions:
```js
onclick="openSessionDetail(${s.id})"  // passes number directly
```

**Warning:** This is different from pitfall #11 (quote conflicts). That's about quotes breaking syntax; this is about quotes changing types. Both cause silent failures.

---

### 59. JS ID Mismatch Between Pages and Shell Template (New)

**Title:** JS in pages references element ids that exist in shell template with different names

**Description:** Page JS files reference DOM elements via `getElementById()`, but the actual HTML elements (modals, footer divs etc.) live in the shell template. If the id in JS doesn't match the id in the shell template, `getElementById` returns `null`, subsequent `.classList.add('show')` or `.innerHTML = ...` throws silently, and the feature appears broken.

**Typical scenario:** Pages JS calls `document.getElementById('kbDetailBtns').innerHTML = btnHtml;` but the shell template has `id="kbDetailFooter"` — id mismatch → JS error → modal never opens.

**Symptoms:** Button click does nothing. No visible JS error in console (error is caught or happens in sequence). Modal should open but doesn't.

**Diagnosis:** When a button's onclick function exists but the modal doesn't open:
1. Find the function in pages JS
2. Search for `getElementById` calls in that function
3. For each id, verify it exists in the shell template with the EXACT same name
4. `grep -n 'elementId' shell-pc.html` to check

**Fix:** Either rename the id in the shell template to match the JS, or update the JS to use the shell's id. Keep them in sync.

**Prevention:** When adding new modals or shared elements to the shell template, grep all page files for references to that element's id to ensure naming consistency.

---

### 60. CSS Classes Used in Page JS But Not Defined in Shell (New)

**Description:** Page JS template strings generate HTML with CSS classes (e.g., `.more-menu`, `.more-menu-item`, `.more-menu-wrap`) that are NOT defined in the shell template's `<style>` block. Without CSS definitions:
- `display: none` default is missing → dropdown menus always visible (flat lay)
- Hover effects, positioning, borders are missing → unstyled raw HTML

**Typical scenario:** `getFaqActions()` generates `<span class="more-menu-wrap"><div class="more-menu show"><div class="more-menu-item">编辑</div>...</span>` but shell has no `.more-menu` CSS → all action items display inline as flat text.

**Symptoms:** Dropdown menus appear as flat inline elements. All hidden items are visible. No hover effects. Layout looks broken.

**Diagnosis:** When dynamically generated HTML elements look unstyled:
1. Inspect the element's class names
2. Search shell template's `<style>` block for those class definitions
3. If missing → that's the root cause

**Fix:** Add the missing CSS classes to the shell template's `<style>` block. Key pattern for dropdown menus:
```css
.more-menu-wrap { position: relative; display: inline-block; }
.more-menu { display: none; position: absolute; top: 100%; right: 0; background: #fff; border: 1px solid #e8e8e8; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100; padding: 4px 0; }
.more-menu.show { display: block; }
.more-menu-item { padding: 6px 14px; font-size: 13px; cursor: pointer; }
.more-menu-item:hover { background: #f5f5f5; }
```

**Prevention:** When adding new CSS class usage in page JS, always verify the class is defined in the shell template. If not, add it.

---

### 61. Cross-Page Navigation + Open Modal Pattern (New)

**Title:** Navigating to another page and opening a modal requires timed sequence

**Description:** When a button on page A needs to navigate to page B and open a specific modal, the sequence must be: switchPage → wait for page render → open modal. Using `setTimeout` is the standard approach in prototypes:

```js
function jumpToTargetPage(sessionId) {
  showToast('正在跳转...', 'success');
  setTimeout(function() {
    switchPage('目标页面标题', document.getElementById('menuXxx'));
    setTimeout(function() {
      if (typeof openXxxModal === 'function') {
        openXxxModal(sessionId);
      }
    }, 300);  // Wait for page render
  }, 500);  // Wait for toast + transition
}
```

**Key points:**
1. Outer `setTimeout` (500ms) — waits for toast display and page transition
2. Inner `setTimeout` (300ms) — waits for target page's DOM to render
3. `typeof` check — defensive, in case target function isn't loaded yet
4. Pass identifiers (sessionId, idx) as parameters — not hardcoded values

** anti-pattern:** Calling `openModal()` immediately after `switchPage()` without delay — modal element may not exist yet because the target page hasn't rendered.

---

### 62. Excel Temp Files (~$) Block git add (New)

**Title:** Excel lock files (~$*.xlsx) cause `Permission denied` on git add

**Description:** When Excel files are open, Windows creates temporary lock files like `~$智能导游功能清单11.xlsx`. These files:
- Are unreadable by other processes → `git add -A` fails with `Permission denied`
- Should never be committed

**Fix:** Add to `.gitignore`:
```
~\$*.xlsx
```

**Symptoms:** `git add -A` fails with `error: open("~$xxx.xlsx"): Permission denied; fatal: adding files failed`

---

### 58. Cascading Filter Pattern — Customer → Venue (New)

**Title:** Cascading filter requires three synchronized changes

**Description:** When implementing customer→venue cascading filters (common in multi-tenant prototypes), three things must all be implemented:

1. **Venue dropdown starts empty:**
```html
<select id="filterVenue">
  <option value="">全部场馆</option>
  <!-- NO static options — populated dynamically -->
</select>
```

2. **Customer dropdown has onchange:**
```html
<select id="filterCustomer" onchange="onFilterCustomerChange()">
```

3. **JS function populates venues:**
```js
function onFilterCustomerChange() {
  var customer = document.getElementById('filterCustomer').value;
  var venueSelect = document.getElementById('filterVenue');
  venueSelect.innerHTML = '<option value="">全部场馆</option>';
  if (customer && customerVenuesMap[customer]) {
    customerVenuesMap[customer].forEach(function(name) {
      venueSelect.innerHTML += '<option>' + name + '</option>';
    });
  }
}
```

**Common mistake:** Only implementing the filter bar cascade but forgetting the export modal. Both the page filter AND the export modal need the same cascade logic with separate function names (e.g., `onFilterCustomerChange` for filter, `onExportCustomerChange` for export).

**Data source:** Define `customerVenuesMap` once as a shared constant, referenced by all cascade functions.

**Title:** Triple-quoted strings with CSS/JS content cause SyntaxError in execute_code

**Description:** When writing Python scripts in `execute_code` that contain CSS or JS code inside triple-quoted strings (`"""`), special characters like braces `{}`, semicolons `;`, colons `:`, and `=` signs cause Python SyntaxError. This is because Python tries to parse these characters as part of its own syntax.

**Symptoms:** Script fails immediately with errors like `SyntaxError: invalid decimal literal`, `SyntaxError: invalid syntax`, or similar — typically on the first line containing CSS/JS content.

**Diagnosis:** The error points to a CSS property (e.g., `gap: 16px`) or JS expression inside a triple-quoted string.

**Fix — write to temp file first:**
```python
# ❌ WRONG: triple-quoted CSS/JS in execute_code causes SyntaxError
code = """
css = '.form { display: flex; gap: 16px; }'
"""

# ✅ CORRECT: write script to temp file, then execute via terminal
script_content = "path = r'...'\nwith open(path) as f: ..."
write_file('/tmp/script.py', script_content)
terminal('python /tmp/script.py')
```

**Alternative for small changes:** Use Hermes `patch` tool (`mode='replace'`) directly — no Python script needed for 1-3 targeted changes.
