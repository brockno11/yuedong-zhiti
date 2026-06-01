# E2E Testing with Playwright

> 本 Skill 用于指导 Claude Code 使用 Playwright 对跃动智体项目进行端到端测试。

## 触发条件

当用户要求以下任务时触发：
- "测试页面"、"E2E 测试"、"Playwright 测试"、"浏览器测试"
- "走查页面"、"检查交互"、"验证流程"
- "测试登录"、"测试记录"、"测试审核"

## 环境准备

```bash
# 安装 Playwright（仅开发时使用，测试完卸载）
npm install -D playwright
npx playwright install chromium

# 确认 dev server 在运行
# http://localhost:3000
```

## 测试脚本模板

### 基础测试框架

```javascript
const { chromium } = require('playwright');

async function runTests() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      errors.push(msg.text());
    }
  });

  try {
    // 测试用例在这里
  } finally {
    await browser.close();
    console.log(`\n结果: ${errors.length} 个错误`);
    errors.forEach(e => console.log('  -', e.substring(0, 120)));
  }
}

runTests().catch(console.error);
```

### 学生登录辅助函数

```javascript
async function loginAsStudent(page, studentId = 'S001') {
  await page.goto('http://localhost:3000/');
  await page.evaluate((sid) => {
    localStorage.setItem('demo_login', JSON.stringify({
      role: 'student', username: sid, name: `学生${sid}`,
      class: '高二(1)班', grade: '高二', gender: '男', timestamp: Date.now()
    }));
    document.cookie = `demo_student_id=${sid}; path=/`;
  }, studentId);
}

async function loginAsTeacher(page) {
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('demo_login', JSON.stringify({
      role: 'teacher', username: 'zhoulaoshi', name: '张老师',
      class: '高二(1)班', timestamp: Date.now()
    }));
    document.cookie = 'demo_student_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });
}
```

## 必测路径

### 学生端（7 个路径）

| 路径 | 检查项 |
|------|--------|
| `/dashboard` | 无 NaN/undefined、CTA 可点击、底部导航 4 项 |
| `/portrait` | 雷达图渲染、缺失数据温和显示、无 NaN |
| `/ai-guide` | 报告卡片显示、生成按钮可用、历史报告列表 |
| `/record` | 项目选择→成绩输入→体感→完成 全流程 |
| `/records` | 记录列表、编辑/删除二次确认、正式体测只读 |
| `/profile` | 身高体重编辑、BMI 温和表达、退出登录 |
| `/ai-guide/[itemId]` | 专项报告：动作训练指导无周计划、阶段规划有周次 |

### 教师端（7 个路径）

| 路径 | 检查项 |
|------|--------|
| `/teacher` | 统计卡无 NaN、版本号正确、无非目标学段 |
| `/teacher/class` | 班级列表正确、学生 20 人、添加/编辑流程 |
| `/teacher/students` | 搜索过滤、学生详情入口 |
| `/teacher/students/[id]` | 图表正常、数据一致、返回按钮 |
| `/teacher/report` | 班级报告显示、生成/查看/审核状态 |
| `/teacher/review` | 待审核列表、通过/退回/修改、批量操作 |
| `/teacher/profile` | 教师信息、退出登录 |

### 响应式检查

```javascript
// 375px 移动端
await page.setViewportSize({ width: 375, height: 812 });

// 1440px 桌面端
await page.setViewportSize({ width: 1440, height: 900 });
```

### 控制台检查

```javascript
// 过滤掉 favicon 404 等无害错误
const realErrors = errors.filter(e =>
  !e.includes('favicon') &&
  !e.includes('404') &&
  !e.includes('RSC payload')
);
```

## 常用断言

```javascript
// 无 NaN 显示
const text = await page.evaluate(() => document.body.innerText);
console.assert(!text.includes('NaN'), '页面包含 NaN');

// 无水平溢出（移动端）
const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
console.assert(!overflow, '页面水平溢出');

// 版本号正确
console.assert(text.includes('v0.9.4'), '版本号正确');

// 无非目标学段
console.assert(!text.includes('初二'), '无初二内容');

// 时间格式正确（M:SS 而非 秒）
console.assert(/\d+:\d{2}/.test(text), '包含 M:SS 时间格式');
```

## 测试后清理

```bash
# 测试完成后卸载 Playwright（不污染项目依赖）
npm uninstall playwright
```

## 注意事项

- Playwright 仅用于开发测试，不提交到 git
- 测试脚本用 `node -e "..."` 直接运行，不需要额外配置文件
- 优先测试移动端 375px（项目移动端优先）
- 每次测试后检查控制台错误
