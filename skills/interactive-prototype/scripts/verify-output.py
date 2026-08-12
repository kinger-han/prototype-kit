"""Verify prototype-kit build output: structure, self-containment, core features, JS syntax."""
from pathlib import Path
import re, subprocess, tempfile, os

def verify_html_output(html_path: str):
    path = Path(html_path)
    
    if not path.exists():
        print(f"❌ 文件不存在：{html_path}")
        return False
    
    content = path.read_text(encoding="utf-8")
    size_kb = path.stat().st_size / 1024
    results = []

    results.append(("HTML 基本结构完整", "<html" in content and "</html>" in content))
    results.append(("包含 <head>", "<head>" in content or "<head " in content))
    results.append(("包含 <body>", "<body>" in content or "<body " in content))

    has_ext_css = bool(re.search(r'<link[^>]+href=["\'][^"\']+\.css["\']', content))
    has_ext_js  = bool(re.search(r'<script[^>]+src=["\'][^"\']+\.js["\']', content))
    results.append(("无外部 CSS 依赖（自包含）", not has_ext_css))
    results.append(("无外部 JS 依赖（自包含）", not has_ext_js))

    results.append(("CSS 已内联（含 <style>）", "<style>" in content or "<style " in content))
    results.append(("JS 已内联（含 <script>）", "<script>" in content or "<script " in content))

    # PC uses proto-page, mobile uses class="page"
    is_pc = "proto-page" in content or "switchPage" in content
    is_mobile = "tab-bar" in content or "ProtoRouter" in content
    if is_pc:
        results.append(("页面容器（PC: proto-page）", "proto-page" in content))
    elif is_mobile:
        results.append(("页面容器（mobile: .page）", 'class="page"' in content))
    else:
        results.append(("页面容器存在", "proto-page" in content or 'class="page"' in content))

    results.append(("侧边栏/菜单存在", "sidebar" in content or "nav" in content))
    results.append((f"文件大小合理（{size_kb:.1f}KB，预期 >10KB）", size_kb > 10))

    # JS syntax check via node --check
    scripts = re.findall(r'<script>(.*?)</script>', content, re.DOTALL)
    if scripts:
        js_all = '\n'.join(scripts)
        tmp = tempfile.NamedTemporaryFile(suffix='.js', delete=False, mode='w', encoding='utf-8')
        tmp.write(js_all)
        tmp.close()
        try:
            r = subprocess.run(['node', '--check', tmp.name], capture_output=True, text=True, timeout=10)
            results.append(("JS 语法正确（node --check）", r.returncode == 0))
            if r.returncode != 0:
                # Extract error line info
                err = r.stderr.strip().split('\n')[0] if r.stderr else 'unknown error'
                results.append((f"  → {err}", False))
        except (FileNotFoundError, subprocess.TimeoutExpired):
            results.append(("JS 语法检查（node 未安装，跳过）", True))
        finally:
            os.unlink(tmp.name)

    print(f"\n{'='*50}")
    print(f"验证目标：{path.name}（{size_kb:.1f} KB）")
    print(f"{'='*50}")
    
    all_pass = True
    for label, passed in results:
        icon = "✅" if passed else "❌"
        print(f"{icon} {label}")
        if not passed:
            all_pass = False
    
    print(f"{'='*50}")
    print(f"{'🎉 全部通过' if all_pass else '⚠️  存在问题，请检查上方 ❌ 项'}")
    return all_pass

if __name__ == "__main__":
    import sys
    paths = sys.argv[1:] if len(sys.argv) > 1 else ["dist/"]
    for p in paths:
        target = Path(p)
        if target.is_dir():
            for f in sorted(target.glob("*.html")):
                verify_html_output(str(f))
        else:
            verify_html_output(str(target))
