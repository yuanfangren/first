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

      pages.push({
        url: relativeUrl,
        changefreq: 'weekly',
        priority: 0.8,
      });
    }
  });
}

scan('./');

// 生成 sitemap（新版无弃用写法）
(async () => {
  const sitemapStream = new SitemapStream({
    hostname: DOMAIN,
  });

  const xml = await streamToPromise(
    Readable.from(pages).pipe(sitemapStream)
  );

  fs.writeFileSync('./sitemap.xml', xml.toString());
  console.log('✅ sitemap.xml 自动生成完成，共 ' + pages.length + ' 个页面');
})();