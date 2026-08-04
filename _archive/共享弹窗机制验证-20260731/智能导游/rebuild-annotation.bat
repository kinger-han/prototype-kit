@echo off
echo 正在重新构建标注版...
python "D:/hpy/文档/ObsidianVault/06-资源/模板/prototype-kit/build.py" --project-path="%~dp0" --with-annotations
echo.
echo 构建完成！刷新浏览器查看最新标注。
pause
