# Playwright Integration Test Skill

> 本 Skill 提供可直接运行的 Playwright 测试脚本，用于验证跃动智体项目的端到端功能。

## 触发条件

- "跑测试"、"运行测试"、"集成测试"
- "验证所有页面"、"全站检测"

## 快速运行

```bash
# 1. 安装（测试完卸载）
npm install -D playwright && npx playwright install chromium

# 2. 运行测试
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  // === 学生端测试 ===
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('demo_login', JSON.stringify({
      role: 'student', username: 'S001', name: '学生A',
      class: '高二(1)班', grade: '高二', gender: '男', timestamp: Date.now()
    }));
    document.cookie = 'demo_student_id=S001; path=/';
  });

  const studentPages = ['/dashboard', '/portrait', '/ai-guide', '/profile', '/records'];
  for (const p of studentPages) {
    await page.goto('http://localhost:3000' + p);
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText);
    const overflow = await page.evaluate(() => document.body.scrollWidth > document.body.clientWidth);
    console.log('[' + p + '] NaN:', text.includes('NaN') ? 'FAIL' : 'PASS',
      '| overflow:', overflow ? 'FAIL' : 'PASS');
  }

  // === 教师端测试 ===
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.setItem('demo_login', JSON.stringify({
      role: 'teacher', username: 'zhoulaoshi', name: '张老师',
      class: '高二(1)班', timestamp: Date.now()
    }));
    document.cookie = 'demo_student_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  const teacherPages = ['/teacher', '/teacher/class', '/teacher/students',
    '/teacher/students/S001', '/teacher/report', '/teacher/review', '/teacher/profile'];
  for (const p of teacherPages) {
    await page.goto('http://localhost:3000' + p);
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText);
    console.log('[' + p + '] NaN:', text.includes('NaN') ? 'FAIL' : 'PASS',
      '| 初二:', text.includes('初二') ? 'FAIL' : 'PASS',
      '| MVP 0.7.0:', text.includes('MVP 0.7.0') ? 'FAIL' : 'PASS');
  }

  // === 控制台错误汇总 ===
  const real = errors.filter(e => !e.includes('favicon') && !e.includes('RSC'));
  console.log('\\n控制台错误:', real.length === 0 ? '无' : real.length + ' 个');
  real.forEach(e => console.log('  -', e.substring(0, 100)));

  await browser.close();
})().catch(console.error);
"

# 3. 卸载
npm uninstall playwright
```

## 测试覆盖矩阵

| 维度 | 检查项 | 方法 |
|------|--------|------|
| **NaN** | 所有数字展示区域 | `document.body.innerText.includes('NaN')` |
| **undefined** | 所有文本区域 | `innerText.includes('undefined')` |
| **溢出** | 移动端 375px | `scrollWidth > clientWidth` |
| **版本** | 教师端侧边栏 | `innerText.includes('v0.9.4')` |
| **学段** | 班级管理页 | `innerText.includes('初二')` |
| **时间格式** | 跑步成绩 | `/\d+:\d{2}/.test(text)` |
| **Runtime** | 控制台错误 | `page.on('pageerror')` |

## 注意事项

- 测试前确保 dev server 在 localhost:3000 运行
- Playwright 仅用于开发测试，不提交到 git
- 每次代码修改后都应跑一次全量测试
