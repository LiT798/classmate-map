# 同学地图

一个交互式同学分布地图网站，展示同学们的工作城市、领域和照片，方便大家线下交流。

## 功能

- 班级口令访问控制
- 中国地图展示同学分布
- 点击地图标记或侧边栏列表查看详情
- 搜索（姓名、城市、领域、公司）
- 按工作领域筛选
- 城市与领域统计概览
- 深色/浅色主题切换
- 移动端适配

## 班级口令

部署前请在 `js/auth.js` 中设置班级口令（见 README「修改班级口令」章节）。

**不要把口令写在 README 或提交到 GitHub**，应私下发给同学。

## 本地运行

```bash
python -m http.server 8080
```

浏览器访问 `http://localhost:8080`

## 部署到 GitHub Pages（给同学在线访问）

### 第一步：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 仓库名例如：`classmate-map`
4. 选 **Public**（Pages 免费版需要公开仓库）
5. 不要勾选 README，点 **Create repository**

### 第二步：创建 Personal Access Token（不能用账号密码推送）

GitHub 已不支持用登录密码推送代码，需要 Token：

1. GitHub → 右上角头像 → **Settings**
2. 左侧最底部 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. 勾选 **repo** 权限，生成并**复制保存** Token（只显示一次）

### 第三步：推送代码

在项目目录打开终端，依次执行（把 `你的用户名` 换成你的 GitHub 用户名）：

```bash
cd e:\ai_study\classmate_address_book

git init
git add .
git commit -m "init: 同学地图网站"

git branch -M main
git remote add origin https://github.com/你的用户名/classmate-map.git
git push -u origin main
```

推送时：
- 用户名：你的 GitHub 用户名或邮箱
- 密码：粘贴刚才的 **Token**（不是登录密码）

### 第四步：开启 GitHub Pages

1. 打开仓库 → **Settings** → 左侧 **Pages**
2. **Build and deployment** → Source 选 **Deploy from a branch**
3. Branch 选 **main**，文件夹选 **/ (root)**，点 **Save**
4. 等待 1～3 分钟，页面会显示访问地址：

```
https://你的用户名.github.io/classmate-map/
```

把链接和班级口令发给同学即可。

### 后续更新

修改数据或代码后：

```bash
git add .
git commit -m "update: 更新同学数据"
git push
```

Pages 会自动重新部署，通常 1～2 分钟内生效。

## 修改班级口令

1. 在终端运行（把 `你的新口令` 换成实际口令）：

```bash
python -c "import hashlib; print(hashlib.sha256('你的新口令'.encode()).hexdigest())"
```

2. 复制输出的 hash，打开 `js/auth.js`，替换 `PASSWORD_HASH` 的值
3. 重新 commit 并 push

## 添加同学

1. 将照片放入 `photos/` 目录（支持 jpg、png、svg）
2. 编辑 `js/data.js`，添加一条记录：

```javascript
{
  id: "xiaoming",
  name: "小明",
  city: "北京",
  coords: [39.9042, 116.4074],
  field: "互联网/IT",
  company: "某公司",      // 可选
  gradYear: 2020,        // 可选
  photo: "photos/xiaoming.jpg"
}
```

城市坐标可参考同文件中的 `cityCoords` 对象。

## 项目结构

```
classmate_address_book/
├── index.html
├── css/style.css
├── js/
│   ├── auth.js     # 访问控制
│   ├── data.js     # 同学数据
│   ├── map.js      # 地图逻辑
│   └── app.js      # 应用逻辑
├── photos/
└── README.md
```

## 安全说明

- 班级口令是前端校验，能防止路人随意浏览，但**无法防止懂技术的人**查看源码或数据文件
- 网站不包含手机号等敏感联系方式
- 不要将 GitHub Token 或班级口令提交到仓库或发到公开渠道
- 若曾在聊天/邮件中泄露 GitHub 密码，请立即到 GitHub **Settings → Password** 修改密码

## 技术栈

- [Leaflet.js](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- 纯 HTML / CSS / JavaScript，无需构建工具
