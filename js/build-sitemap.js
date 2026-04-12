const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

// 👇 这里改成你的域名
const DOMAIN = 'https://timestamp-tool.com';

const pages = [];

// 扫描所有 HTML 文件
function scan(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = `${dir}/${file}`;

    if (fs.statSync(fullPath).isDirectory()) {
      scan(fullPath);
    } else if (file.endsWith('.html')) {
      // 生成标准 URL
      const relativeUrl = fullPath
        .replace('./', '')
        .replace(/\\/g, '/');

      // index.html 优先级 1.0，其他 0.8
      const priority = relativeUrl === 'index.html' ? 1.0 : 0.8;

      pages.push({
        url: relativeUrl,
        changefreq: 'weekly',
        priority: priority,
      });
    }
  });
}

scan('./');

// 生成 sitemap（新版无弃用写法 + 自动格式化）
(async () => {
  const sitemapStream = new SitemapStream({
    hostname: DOMAIN,
    pretty: true,  // 👈 自动格式化 XML（整齐、换行、缩进）
  });

  const xml = await streamToPromise(
    Readable.from(pages).pipe(sitemapStream)
  );

  fs.writeFileSync('./sitemap.xml', xml.toString());
  console.log('✅ sitemap.xml 自动生成完成，共 ' + pages.length + ' 个页面');
})();