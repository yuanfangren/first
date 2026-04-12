const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

// 域名
const DOMAIN = 'https://timestamp-tool.com';

const pages = [];

// 扫描所有 HTML 文件
function scan(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = `${dir}/${file}`;

    if (fs.statSync(fullPath).isDirectory()) {
      scan(fullPath);
      return;
    }

    if (file.endsWith('.html')) {
      let relativeUrl = fullPath
        .replace('./', '')
        .replace(/\\/g, '/');

      // ==============================
      // 修复：不管路径是什么，只要文件名是 index.html → 优先级 1.0
      // ==============================
      let priority = 0.8;
      if (file === 'index.html') {
        priority = 1.0;
      }

      pages.push({
        url: relativeUrl,
        changefreq: 'weekly',
        priority: priority,
      });
    }
  });
}

scan('./');

// 生成 sitemap（强制格式化 + 无弃用）
(async () => {
  const sitemapStream = new SitemapStream({
    hostname: DOMAIN,
  });

  const xml = await streamToPromise(
    Readable.from(pages).pipe(sitemapStream)
  );

  // ==============================
  // 修复：强制格式化 XML（100% 生效）
  // ==============================
  let formattedXml = xml.toString()
    .replace(/></g, '>\n<')        // 自动换行
    .replace(/<url>/g, '\n  <url>') // 缩进
    .replace(/<\/url>/g, '  </url>\n');

  fs.writeFileSync('./sitemap.xml', formattedXml);

  console.log('✅ sitemap 生成完成！');
  console.log('📄 共 ' + pages.length + ' 个页面');
  console.log('🏠 首页 index.html 优先级已设为 1.0');
})();