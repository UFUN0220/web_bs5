
# README.md
# Wabtec MMS Web — BS5 原生化升级说明
## v1.0

本项目已完成从 **Bootstrap 3 + jQuery** 到 **Bootstrap 5 + 原生 ES6 / Fetch** 的前端升级。业务页面不再加载、调用或依赖 jQuery；DOM、事件、请求、分页、本地化与 Bootstrap 组件均采用标准浏览器 API 或项目公共库。

> Bootstrap 5 仍作为 UI 框架保留。DCU 仪表盘已切换为零第三方依赖的 canvas-gauges，并通过 `js/canvas-gauge-utils.js` 统一初始化、更新和销毁。

## 技术栈对比

| 项目 | 升级前 | 升级后 |
| --- | --- | --- |
| UI 框架 | Bootstrap 3 | Bootstrap 5 |
| DOM 操作 | jQuery 链式 API | 原生 DOM + `dom-utils.js` |
| 事件 | `.ready()`、`.on()`、`.click()` | `DOMContentLoaded`、`addEventListener`、事件委托 |
| HTTP | `$.ajax`、`$.getJSON` | Fetch / `fetchGet`、`fetchPost`（Fetch + 超时 + HTTP 错误处理） |
| BS 组件 | jQuery 插件 / `data-*` 自动初始化 | `new bootstrap.Tab()`、`new bootstrap.Modal()`、`new bootstrap.Dropdown()` |
| 多语言 | jQuery Localize | 原生 JSON 加载与 `data-localize` 应用 |
| 公共业务逻辑 | 散落在页面脚本 | `common-business.js` |
| DCU 仪表盘 | 旧 `gauge.min.js` 引入和 `data-*` 自动初始化 | `canvas-gauges.min.js` + `CanvasGaugeUtils` 显式生命周期 |

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
│   └── canvas-gauges.min.js   # canvas-gauges DCU 仪表盘资源
├── js/
│   ├── dom-utils.js           # DOM / Fetch 底层工具
│   ├── common-business.js     # 跨页面业务工具
│   ├── canvas-gauge-utils.js  # 仪表盘初始化、批量更新与销毁
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

- `domQuery(elementOrSelector)`：少量封装 DOM 操作；优先使用原生 `document.querySelector` / `createElement`。
- `fetchGet(url, options)`：JSON GET 请求。
- `fetchPost(url, body, options)`：JSON POST 请求。
- `modalHelper(element)`、`tabShow(element)`：仅作为原生 Bootstrap API 的辅助入口。

### `common-business.js`

通过 `CommonBusiness` 调用跨页面业务方法，例如：

```js
const rows = CommonBusiness.paginate(data, currentPage, rowsPerPage);
const label = CommonBusiness.getStateLabel(status);
const name = CommonBusiness.getAlarmEventName(alarms, alarmId);
if (!CommonBusiness.validate(valid, 'Invalid input.', showError)) return;
```

不要在页面脚本重复实现格式化、分页、状态映射、表格行/表头创建、通用校验或 `data-localize` 遍历逻辑。

## DCU 仪表盘改造说明

### 资源引入

项目本地资源：

```html
<script src="bin/canvas-gauges.min.js"></script>
<script src="js/canvas-gauge-utils.js"></script>
```

CDN 引入方式：

```html
<script src="https://cdn.jsdelivr.net/npm/canvas-gauges@2.1.7/gauge.min.js"></script>
<script src="js/canvas-gauge-utils.js"></script>
```

### 替换前后对比

替换前依赖旧文件名和 `data-*` 属性：

```html
<script src="bin/gauge.min.js"></script>
```

```js
const voltageGauge = document.createElement('canvas');
voltageGauge.id = 'dcuVoltageGauge';
voltageGauge.setAttribute('data-type', 'radial-gauge');
voltageGauge.setAttribute('data-width', '250');
voltageGauge.setAttribute('data-height', '250');
voltageGauge.setAttribute('data-units', 'volt');
voltageGauge.setAttribute('data-min-value', '0');
voltageGauge.setAttribute('data-max-value', '220');
tcanvas?.setAttribute('data-value', newValue);
```

替换后复用原 `canvas#dcuVoltageGauge` 容器，只把配置从 DOM 属性迁移为显式 JS 配置：

```js
const voltageGauge = document.createElement('canvas');
voltageGauge.id = 'dcuVoltageGauge';
fieldset_measure.appendChild(voltageGauge);
CanvasGaugeUtils.createRadialGauge(voltageGauge, DCU_VOLTAGE_GAUGE_OPTIONS);
CanvasGaugeUtils.updateGauge('dcuVoltageGauge', newValue);
```

当前 DCU 电压仪表盘已对齐原配置：

- 尺寸：250 × 250。
- 单位：`volt`。
- 标题：`dcu voltage`。
- 量程：0 到 220。
- 主刻度：0、20、40、60、80、100、120、140、160、180、200、220。
- 次刻度：5。
- 警戒色分区：0–50 绿、50–100 黄、100–150 红、150–200 紫、200–220 蓝，透明度保持原值。
- 指针动画：`animationDuration: 200`，实时刷新仍为每 2 秒更新一次。

### `CanvasGaugeUtils` API

```js
CanvasGaugeUtils.createRadialGauge(canvasOrId, options);
CanvasGaugeUtils.createLinearGauge(canvasOrId, options);
CanvasGaugeUtils.createGauges([
  { target: 'dcuVoltageGauge', options: DCU_VOLTAGE_GAUGE_OPTIONS }
]);
CanvasGaugeUtils.updateGauge('dcuVoltageGauge', 120);
CanvasGaugeUtils.updateGauges({ dcuVoltageGauge: 120 });
CanvasGaugeUtils.destroyGauge('dcuVoltageGauge');
CanvasGaugeUtils.destroyAll();
```

## jQuery / 旧仪表盘清理检查清单

- 页面不再引入 `jquery*.js`、`jquery.form*.js`、`jquery.localize*.js`。
- 页面不再引入旧 `bin/gauge.min.js`，统一使用 `bin/canvas-gauges.min.js`。
- DCU 仪表盘不再依赖 `data-type="radial-gauge"` 自动初始化，统一使用 `CanvasGaugeUtils`。
- 业务脚本不出现 `$()`、`$.ajax`、`$.getJSON`、`jQuery`、`window.$`、`window.jQuery`，也不保留以 `$` 开头的项目自有别名。
- Bootstrap 组件不使用 `.modal('show')`、`.tab('show')` 等 jQuery 插件写法。
- `dom-utils.js` 仅导出 `domQuery`、`fetchGet`、`fetchPost` 等非 `$` 命名接口。

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
2. 将请求替换为 `fetchGet` 或 `fetchPost`，保留接口契约与错误处理。
3. 将动态 DOM 改为原生 API，引用 `CommonBusiness` 中的公共能力。
4. 将 BS5 组件改为显式实例化，并在重建/卸载时释放。
5. 使用主题 token 替换新增硬编码视觉值。
6. 执行语法检查、全局 jQuery 残留检索和页面交互回归。

## 验收检查

```bash
# 页面业务代码中不应存在真实 jQuery 调用或以 $ 开头的项目别名
rg -n '\$[A-Za-z_][A-Za-z0-9_]*|\$\(|\$\.|jQuery|jquery|window\.\$|window\.jQuery' \
  --glob '*.js' --glob '*.JS' --glob '*.htm' --glob '*.HTM' \
  --glob '!BIN/bootstrap.min.js' --glob '!BIN/canvas-gauges.min.js' --glob '!README.md' .

# 页面不应继续引用旧仪表盘文件
rg -n '<script[^>]*(jquery|gauge\.min\.js)|gauge\.min\.js|data-type=["'"'"']radial-gauge|data-type.*radial-gauge' \
  --glob '*.js' --glob '*.JS' --glob '*.htm' --glob '*.HTM' \
  --glob '!BIN/canvas-gauges.min.js' --glob '!README.md' .

# 检查页面私有脚本语法
node --check BIN/alarm_data.js
node --check BIN/general_page.js
node --check js/common-business.js
```

业务流程、数据结构、语言包键值和后端接口保持兼容；后续变更应以本 README 与告警页试点模板为准。




### v0.0 26.6.18
本仓库基于Bootstrap 3（BS3）迭代升级，聚焦兼容性、功能、性能及开发体验优化，保留核心易用性，适配现代开发场景。

#### 核心更新
1. **兼容性升级**
   - 适配Chrome 90+、Firefox 88+、Safari 14+等现代浏览器，修复样式兼容问题；保留IE11基础兼容，移除IE8/9冗余代码减包体积。
   - 补充移动端小屏、平板横屏响应式断点，优化高分屏像素模糊问题。

2. **功能增强**
   - 新增Tree、DatePicker、Tabs拖拽等组件；升级按钮、导航栏、模态框等核心组件样式/功能。
   - 新增CSS变量支持，补充暗黑模式，保留Less变量兼容。

3. **性能优化**
   - 移除冗余样式/脚本，核心CSS体积减约15%；JS文件按需拆分，支持ES Module导入。
   - 优化CSS选择器层级，JS移除jQuery冗余依赖（保留兼容模式）。

4. **开发体验提升**
   - 集成Webpack/Vite构建，新增TS类型声明；补充组件API文档与场景示例。
   - 新增样式警告提示，提供ESLint/StyleLint配置。

5. **关键修复**
   修复模态框滚动穿透、表单禁用样式错乱、栅格间距计算错误、JS异步初始化失败等问题。

#### 迁移与使用
- 核心类名/用法兼容BS3，新功能参考`/docs/migration.md`，IE8/9兼容可手动引入`/plugins/legacy-ie.js`。
- 快速开始：
```bash
npm install # 安装依赖
npm run dev # 开发环境
npm run build # 生产构建
```

#### 注意事项
- 基于BS3核心架构，未升级至BS4/5，老项目低成本迁移；新功能按需开启，不影响原有逻辑。
