# 原型修改工作效率规则

> 减少 Token 浪费的硬性规则。适用于原型 HTML/CSS/JS 修改任务。

## 核心原则

读文件、改文件、验证三段分开，不重复读取同一份内容。

---

## 文件读取

### 不要读全文件

```powershell
# 错误 - 会读取整个 ~90KB 文件
Get-Content $file -Encoding UTF8 -Raw

# 正确 - 只抓目标上下文
Select-String "目标字符串" $file

# 正确 - 用 Node.js 截取片段
node -e "const fs=require('fs');const c=fs.readFileSync('path','utf8');console.log(c.substring(1000,1500))"
```

### 读一次后记住关键位置

第一次读全文件后（不可避免），把关键结构位置记下来：筛选栏在哪、表格在哪、JS 函数在哪。后续操作直接基于已知位置执行，不重复读。

---

## 文件修改

### 用 Node.js 脚本，不用 PowerShell 字符串替换

```powershell
$script = @"
const fs = require("fs");
const c = fs.readFileSync("D:/path/file.html", "utf8");
let r = c.replace(/旧文本/g, "新文本");
fs.writeFileSync("D:/path/file.html", r, "utf8");
console.log("Done");
"@
Out-File -FilePath "D:/fix.js" -InputObject $script -Encoding UTF8
node D:/fix.js
Remove-Item D:/fix.js -Force
```

### 一次脚本完成多项替换

把相关的多个替换合并到一个 .js 脚本里执行，不要每次替换都另起一个脚本。

---

## 构建与验证

### 不要在构建产物上验证

```powershell
# 错误 - 读 ~220KB 构建产物验证
$dist = Get-Content "dist/xxx.html" -Encoding UTF8 -Raw

# 正确 - 在源文件上确认字符串存在即可
$src = Get-Content "pages/xxx.html" -Encoding UTF8 -Raw
$src.Contains("目标特征")
```

### 构建策略

- 只在最后跑一次构建，不是每步都跑
- 构建命令：python build.py pc --project-path="项目路径"
- 多个修改合并到一个 commit，不要每个小改动都构建+commit

---

## 常见操作模板

### 找文件中的某个结构

```powershell
Select-String "function renderTopicTable" $file -Context 0,5
```

### 找某个标记的精确位置

```powershell
Select-String "<!-- ====== 筛选栏" $file -Context 0,0
```

### 用 Node.js 做条件替换

```javascript
const fs = require("fs");
const c = fs.readFileSync("path", "utf8");
let renderStart = c.indexOf("function renderTopicTable()");
let renderEnd = c.indexOf("function togglePublishMenu", renderStart);
let before = c.substring(0, renderStart);
let target = c.substring(renderStart, renderEnd);
let after = c.substring(renderEnd);
target = target.replace("旧", "新");
fs.writeFileSync("path", before + target + after, "utf8");
```
