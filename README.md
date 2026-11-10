# Vo Minh An — Portfolio MVP

Homepage tĩnh với Astro, TypeScript và Tailwind CSS. Chỉ chạy local; chưa phát hành.

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

- `src/data/portfolio.ts`: copy biên tập cho homepage, tham chiếu claim từ `docs/FACTS.md`.
- `src/components/`: layout, sections, UI; `src/styles/global.css`: token và styles.
- `static/`: **thư mục asset duy nhất được phục vụ/copy**. `public/` cũ chứa tài liệu đầu vào, được giữ nguyên và không nằm trong output.
- `scripts/verify-build.mjs`: kiểm tra allowlist output, links và dữ liệu không được công khai.
- `docs/IMPLEMENTATION_01.md`: phạm vi, kiểm tra, quyết định và giới hạn TASK 01.

Không thêm CV hoặc dữ liệu riêng tư vào `static/`. Chưa có domain nên chưa tạo canonical/sitemap; robots và metadata đang chặn index. Trước phát hành phải review nội dung, chọn domain và cập nhật SEO. Không có backend, MDX, trang case study hoặc CI/deploy trong phase này.
