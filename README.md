
# README.md
## v0.0
本仓库基于 Bootstrap 3（BS3）进行迭代升级，聚焦兼容性增强、功能扩展、性能优化及开发体验提升，在保留 BS3 核心易用性的基础上，解决历史痛点并适配现代开发场景。

## 核心更新内容
### 1. 兼容性升级
- **浏览器适配**：
  - 新增对现代浏览器（Chrome 90+、Firefox 88+、Safari 14+）的深度适配，修复 BS3 对新版浏览器的样式兼容问题（如 flex 布局冲突、表单样式失效）；
  - 保留对 IE11 的基础兼容，同时移除对 IE8/9 的冗余兼容代码，减少包体积。
- **响应式适配**：
  - 补充对移动端小屏（320px 以下）、平板横屏等特殊尺寸的响应式断点；
  - 优化 BS3 原有响应式布局在高分屏（Retina）下的像素模糊问题。

### 2. 功能增强
- **组件扩展**：
  - 新增常用组件：如树形控件（Tree）、日期选择器（DatePicker）、标签页（Tabs）拖拽功能，无需依赖第三方插件；
  - 升级核心组件：
    - 按钮组件支持渐变、镂空等新样式，新增 `btn-icon` 图标按钮变体；
    - 导航栏支持移动端侧滑展开，解决 BS3 原生导航栏移动端点击卡顿问题；
    - 模态框新增拖拽、缩放功能，优化多层模态框的层级遮挡问题。
- **样式体系**：
  - 新增 CSS 变量（Custom Properties）支持，可快速全局替换主题色、间距等样式，保留 BS3 原有 Less 变量兼容；
  - 补充暗黑模式样式，通过 `.dark-mode` 类一键切换全局主题。

### 3. 性能优化
- **体积精简**：
  - 移除 BS3 中未被广泛使用的冗余样式/脚本（如部分过时的组件示例代码），核心 CSS 包体积减少约 15%；
  - 对 JS 文件进行按需拆分，支持 ES Module 导入（如 `import { Modal } from './bs3-upgrade/js'`），替代原有整体引入方式。
- **加载速度**：
  - 优化 CSS 选择器层级，减少渲染重排次数；
  - JS 部分移除 jQuery 冗余依赖（核心组件可脱离 jQuery 运行，保留 jQuery 兼容模式），降低运行时开销。

### 4. 开发体验提升
- **工程化改造**：
  - 替换原有手动编译 Less 的方式，集成 Webpack/Vite 构建配置，支持热更新、按需编译；
  - 新增 TypeScript 类型声明文件，解决 BS3 无类型提示的问题。
- **文档与示例**：
  - 补充组件 API 文档，明确参数、事件及使用示例；
  - 新增常见场景示例（如表单验证、响应式布局最佳实践），替代 BS3 原有简单示例。
- **调试优化**：
  - 新增开发环境下的样式警告提示（如使用废弃类名时控制台给出提示）；
  - 提供 ESLint/StyleLint 配置，统一代码规范。

### 5. 修复的关键问题
- 修复 BS3 模态框在移动端滚动穿透的问题；
- 修复表单控件（input/select）在禁用状态下的样式错乱问题；
- 修复栅格系统在嵌套使用时的间距计算错误；
- 修复 JS 部分在异步加载场景下的初始化失败问题。

## 迁移指南
1. 核心类名、组件使用方式完全兼容 BS3，无需大规模修改代码；
2. 若需使用新功能（如 CSS 变量、按需导入），参考 `/docs/migration.md`；
3. 移除的 IE8/9 兼容代码若有依赖，可通过 `/plugins/legacy-ie.js` 手动引入。

## 快速开始
```bash
# 安装依赖
npm install

# 开发环境
npm run dev

# 生产构建
npm run build
```

## 注意事项
- 本仓库仍基于 BS3 核心架构，未升级至 BS4/5，确保老项目低成本迁移；
- 新功能默认不影响原有逻辑，可按需开启。

# Wabtec MMS Web — BS5 原生化升级说明
## v0.1

本项目已完成从 **Bootstrap 3 + jQuery** 到 **Bootstrap 5 + 原生 ES6 / Fetch** 的前端升级。业务页面不再加载、调用或依赖 jQuery；DOM、事件、请求、分页、本地化与 Bootstrap 组件均采用标准浏览器 API 或项目公共库。

> Bootstrap 5 仍作为 UI 框架保留，`gauge.min.js` 仅用于 DCU 仪表盘。这里的“无第三方依赖”指业务脚本不再依赖 jQuery、jQuery Form、jQuery Localize 等运行时插件。

## 技术栈对比

| 项目 | 升级前 | 升级后 |
| --- | --- | --- |
| UI 框架 | Bootstrap 3 | Bootstrap 5 |
| DOM 操作 | jQuery 链式 API | 原生 DOM + `dom-utils.js` |
| 事件 | `.ready()`、`.on()`、`.click()` | `DOMContentLoaded`、`addEventListener`、事件委托 |
| HTTP | `$.ajax`、`$.getJSON` | `$fetchGet`、`$fetchPost`（Fetch + 超时 + HTTP 错误处理） |
| BS 组件 | jQuery 插件 / `data-*` 自动初始化 | `new bootstrap.Tab()`、`new bootstrap.Modal()`、`new bootstrap.Dropdown()` |
| 多语言 | jQuery Localize | 原生 JSON 加载与 `data-localize` 应用 |
| 公共业务逻辑 | 散落在页面脚本 | `common-business.js` |

## 本次升级优化清单

1. **属性与组件迁移**
   - BS3 栅格、导航、表单、按钮与标签页类名已适配 BS5。
   - Tab、Modal、Dropdown 不再依赖 `data-bs-toggle` / `data-bs-dismiss` 自动初始化。
   - 所有实例由页面脚本显式创建，在页面卸载或内容重建时调用 `dispose()`。

2. **UI 规范化**
   - 保留顶部标题、侧边栏、`fieldset + legend`、Tab、响应式栅格和既有多语言属性。
   - `css/dashboard.css` 集中定义 MMS 主题 token，并基于 Bootstrap CSS 变量组织边框、圆角、阴影、间距和状态色。

3. **目录与脚本重构**
   - 删除 jQuery、jQuery Form、jQuery Localize、旧 BS3 备份脚本与不再被页面引用的旧业务脚本。
   - 页面私有逻辑保留在 `BIN/`，底层工具与跨页面业务逻辑位于 `js/`。

4. **去 jQuery 架构重构**
   - `$(document).ready` 统一替换为 `DOMContentLoaded`。
   - 动态 DOM 使用 `document.createElement`、`classList`、`append`、`textContent`。
   - 所有请求使用 Fetch 封装，保留原请求参数、成功处理和错误提示。

5. **公共能力封装**
   - 时间格式化、状态码转换、告警名称映射、分页、表格行/表头生成、通用校验和多语言字典应用统一由 `CommonBusiness` 提供。
   - DOM、请求、Bootstrap 小型辅助能力由 `dom-utils.js` 提供。

6. **事件机制优化**
   - 页面使用原生事件监听；动态内容销毁即释放其监听器。
   - Bootstrap 组件集中缓存，使用 `AbortController` 和 `dispose()` 避免重复绑定与 DOM 残留。

## 标准目录结构

```text
WEB/
├── INDEX.HTM                 # 登录页
├── general_view.htm          # 总览页
├── alarm_data.htm            # 告警/事件试点模板
├── DCU_VIEW.HTM              # DCU 页面
├── PAGES/                    # 其他业务页面
├── BIN/
│   ├── bootstrap.min.js       # Bootstrap 5 bundle
│   ├── alarm_data.js          # 告警页私有逻辑
│   ├── general_page.js        # 总览页私有逻辑
│   ├── language_cookie.js     # 语言 Cookie 与初始化入口
│   ├── session.js             # 登录会话能力
│   └── gauge.min.js           # DCU 仪表盘资源
├── js/
│   ├── dom-utils.js           # DOM / Fetch 底层工具
│   ├── common-business.js     # 跨页面业务工具
│   └── page-bootstrap.js      # 全局 BS5 Dropdown 生命周期管理
├── CSS/                       # Bootstrap 与项目样式
├── IMG/                       # 图片资源
├── LANG/                      # text-en/fr/zh.json
└── data.json                  # 前端模拟数据
```

## 公共 JS 使用规范

页面脚本必须按以下顺序加载：

```html
<script src="js/dom-utils.js"></script>
<script src="js/common-business.js"></script>
<script src="bin/bootstrap.min.js"></script>
<script src="bin/language_cookie.js"></script>
<script src="js/page-bootstrap.js"></script>
<script src="bin/page-xxx.js"></script>
```

`PAGES/` 下页面使用 `../js/`、`../bin/`、`../CSS/`、`../IMG/` 相对路径。不得混用页面层级路径。

### `dom-utils.js`

- `$dom(elementOrSelector)`：少量封装 DOM 操作；优先使用原生 `document.querySelector` / `createElement`。
- `$fetchGet(url, options)`：JSON GET 请求。
- `$fetchPost(url, body, options)`：JSON POST 请求。
- `$modal(element)`、`$tabShow(element)`：仅作为原生 Bootstrap API 的辅助入口。

### `common-business.js`

通过 `CommonBusiness` 调用跨页面业务方法，例如：

```js
const rows = CommonBusiness.paginate(data, currentPage, rowsPerPage);
const label = CommonBusiness.getStateLabel(status);
const name = CommonBusiness.getAlarmEventName(alarms, alarmId);
if (!CommonBusiness.validate(valid, 'Invalid input.', showError)) return;
```

不要在页面脚本重复实现格式化、分页、状态映射、表格行/表头创建、通用校验或 `data-localize` 遍历逻辑。

## 页面开发规范

1. 页面私有代码置于 `BIN/page-xxx.js`，仅处理本页面的数据组合、DOM 构建与交互。
2. 以 `document.addEventListener('DOMContentLoaded', ...)` 作为初始化入口。
3. 使用 `const` 默认声明；仅在变量确需重新赋值时使用 `let`；禁止 `var` 与隐式全局变量。
4. 使用语义化变量名：`tableContainer`、`selectedPlatformDoors`、`modalInstance`，避免 `data1`、`obj` 等泛化命名。
5. 函数应只承担一类职责；公共函数应补充简短 JSDoc 注释。
6. 动态文本使用 `textContent`，不使用未审查的 `innerHTML`。
7. 动态元素的事件必须在元素删除前可被释放；批量事件使用 `AbortController` 或事件委托。

## Bootstrap 5 原生实例最佳实践

```js
const modal = new bootstrap.Modal(modalElement);
const tab = new bootstrap.Tab(tabElement);
const dropdown = new bootstrap.Dropdown(dropdownElement);

tabElement.addEventListener('click', event => {
  event.preventDefault();
  tab.show();
});

window.addEventListener('beforeunload', () => {
  modal.dispose();
  tab.dispose();
  dropdown.dispose();
}, { once: true });
```

- 不使用 jQuery 风格的 `.modal('show')`、`.tab('show')`。
- 不依赖 `data-bs-*` 自动初始化。
- 缓存实例，重建 DOM 前先 `dispose()` 旧实例。

## 多语言规范

- 所有可翻译元素使用 `data-localize="Namespace.Key"`。
- 文案键位于 `LANG/text-en.json`、`LANG/text-fr.json`、`LANG/text-zh.json`，三种语言必须同步维护。
- 语言选择写入 `somoveLanguage` Cookie；`localize_data()` 仅负责触发 `CommonBusiness.localizeElements()`。
- 动态插入带 `data-localize` 的内容后，调用 `localize_data()` 重新应用语言包。

## 布局与主题规范

- 页面主标题使用 `<h3 class="sub-header" data-localize="...">`。
- 业务分组使用 `fieldset + legend`，避免用纯 `div` 模拟标题边框。
- 横向对齐优先使用 BS5 Flex 工具类或 `display: flex`；响应式区域使用 BS5 栅格。
- 颜色、圆角、阴影、间距必须引用 `CSS/dashboard.css` 的 `--mms-*` token 或 Bootstrap `--bs-*` 变量；不得在页面私有脚本新增主题硬编码值。

## 部署与资源路径

1. 使用支持静态文件与 CGI 接口的 Web 服务器部署项目根目录。
2. 保持目录大小写与部署环境一致；Linux 环境严格区分 `BIN`、`CSS`、`IMG`、`LANG`。
3. 根目录页面使用 `js/`、`BIN/`、`CSS/`、`IMG/`；`PAGES/` 页面使用 `../` 前缀。
4. `data.json` 用于页面模拟数据；后端接口地址、参数名和数组序列化格式不得在前端重构中改变。
5. 部署前检查浏览器控制台、网络请求状态、语言包路径和 Bootstrap 实例销毁逻辑。

## 迁移过程与后续页面模板

`alarm_data.htm` / `BIN/alarm_data.js` 是完整试点模板，覆盖：动态 DOM、主/子 Tab、Modal、全选、下拉、时间校验、Fetch、分页、表格渲染与实例销毁。

后续迁移页面按以下步骤执行：

1. 先识别页面私有逻辑与可下沉的公共业务函数。
2. 将请求替换为 `$fetchGet` 或 `$fetchPost`，保留接口契约与错误处理。
3. 将动态 DOM 改为原生 API，引用 `CommonBusiness` 中的公共能力。
4. 将 BS5 组件改为显式实例化，并在重建/卸载时释放。
5. 使用主题 token 替换新增硬编码视觉值。
6. 执行语法检查、全局 jQuery 残留检索和页面交互回归。

## 验收检查

```bash
# 页面业务代码中不应存在 jQuery 调用
rg -n '\$\(|\$\.ajax|\$\.getJSON|jQuery' --glob '!BIN/bootstrap.min.js' --glob '!BIN/gauge.min.js' .

# 检查页面私有脚本语法
node --check BIN/alarm_data.js
node --check BIN/general_page.js
node --check js/common-business.js
```

业务流程、数据结构、语言包键值和后端接口保持兼容；后续变更应以本 README 与告警页试点模板为准。

