# Võ Minh An — Portfolio MVP

Homepage tĩnh với Astro, TypeScript và Tailwind CSS. Source được quản lý bằng Git; website chưa deploy.

## Chạy dự án

Node theo `.node-version`, npm và dependency đã khóa trong `package-lock.json`.

```sh
npm ci
npm run dev
```

Mở http://127.0.0.1:4321. Kiểm tra production:

```sh
npm run check
npm run build
npm run preview
```

## Nội dung và assets

- `src/data/portfolio.ts`: copy biên tập cho homepage; fact IDs tham chiếu hồ sơ nội bộ được giữ local.
- `src/components/`: layout, sections, UI; `src/styles/global.css`: token và styles.
- `static/`: **thư mục asset duy nhất được phục vụ/copy**. `public/` cũ chứa tài liệu đầu vào, được giữ nguyên và không nằm trong output.
- `scripts/verify-build.mjs`: kiểm tra allowlist output, links và dữ liệu không được công khai.
- `docs/`: context và hồ sơ nội bộ, được giữ local và không có trong clone từ GitHub. Không cần thư mục này để install/check/build.

## Phạm vi Git

Track source, tests, scripts, cấu hình build, `package-lock.json` và các asset đã review trong `static/`. `.gitignore` loại dependency/build/cache, cấu hình agent/skills cục bộ, báo cáo kiểm thử sinh tự động, `docs/` nội bộ và bằng chứng gốc trong `public/`. Các file bị ignore vẫn còn trên máy.

Không đưa CV, credential hoặc hồ sơ cá nhân chưa được chọn công khai vào repository public. Khi sửa factual copy, cần nguồn được chủ sở hữu cung cấp; không tự điền dữ liệu thiếu từ các fact ID. Bản clone mới chỉ có nội dung homepage đã chọn, không có hồ sơ kiểm chứng riêng tư.

Không thêm CV hoặc dữ liệu riêng tư vào `static/`. Chưa có domain nên chưa tạo canonical/sitemap; robots và metadata đang chặn index. Trước phát hành phải review nội dung, chọn domain và cập nhật SEO. Không có backend, MDX, trang case study hoặc CI/deploy trong phase này.
