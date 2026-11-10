# Agent Instructions

## Phạm vi hiện tại

Personal Cybersecurity Portfolio của Vo Minh An. Giai đoạn hiện tại chỉ tạo context, instructions và kế hoạch. Chỉ bắt đầu code khi có yêu cầu phát triển tiếp theo. Không tự cài package/skill/MCP, chạy script skill bên thứ ba, thêm backend, deploy, commit hoặc push trong đợt context này.

## Bắt đầu và chọn context

Đầu phiên đọc [HANDOFF](docs/HANDOFF.md), chọn task trong [TASKS](docs/TASKS.md); chỉ đọc mục liên quan. Kiểm tra thư mục làm việc và Git status nếu có Git repository. Hiện workspace chưa được khởi tạo Git; không gọi trạng thái này là “clean”.

| Tác vụ | Nguồn cần đọc thêm |
|---|---|
| Phạm vi, đối tượng, yêu cầu | [BRIEF](docs/BRIEF.md) |
| Nội dung cá nhân, dự án, copy | [FACTS](docs/FACTS.md) và bằng chứng của claim cần dùng |
| Thiết kế, giao diện, polish | [DESIGN](docs/DESIGN.md); FACTS nếu sửa nội dung |
| Code, content schema, assets, build | [ARCHITECTURE](docs/ARCHITECTURE.md) và file đang sửa |
| Test, review | Acceptance criteria của task và phần thiết kế/kiến trúc liên quan |
| Runtime, skills, giới hạn context | [CONTEXT](docs/CONTEXT.md), [SKILLS_AUDIT](docs/SKILLS_AUDIT.md) |
| Kết quả audit/validation ban đầu | [AUDIT](docs/AUDIT.md) |

Không đọc toàn bộ repository, toàn bộ docs hoặc mọi skill trước mỗi thay đổi. Không dùng chat/log làm nguồn sự thật thay cho tài liệu có thẩm quyền.

## Quy tắc bắt buộc

- Không bịa thành tích, thời gian, vai trò, số liệu, ảnh chụp hay kết quả kỹ thuật. FACTS là sổ claim; có mặt trong file không có nghĩa đã xác minh. Không biến PLANNED/IN_PROGRESS thành kết quả hoàn tất; không dùng CV_CLAIMED nếu chưa có CV.
- Nội dung chính thức phải có nguồn phù hợp và được chủ sở hữu chọn để công khai theo FACTS. Đánh dấu thiếu bằng chứng; tiếp tục phần độc lập có thể làm. Đặc biệt kiểm tra detection rules, attack scenarios, incident reports và kết quả EGIS.
- Không đưa credential, số điện thoại, dữ liệu riêng tư, log thô, IP nội bộ hoặc tài liệu khách hàng vào docs công khai, assets, commit hay website. PRIVATE luôn bị loại. Bằng chứng nhạy cảm chỉ ghi ID và mô tả đã làm sạch, không chép giá trị gốc.
- Thiết kế chuyên nghiệp, tối giản, dễ đọc, có bản sắc cá nhân, responsive. Tránh SaaS đại trà, hacker cliché, glow/gradient/glass lạm dụng, card lặp lại và motion trang trí. Dùng screenshot/sơ đồ từ công việc thật; sơ đồ đề xuất phải ghi rõ là đề xuất.
- Tôn trọng yêu cầu CONFIRMED và quyết định thực sự đã duyệt trong DESIGN. Technical Editorial và token hiện chỉ là PROPOSED; không tự ghi APPROVED. Thiết kế chưa chốt không cản việc lập đề xuất.
- Giữ nguyên dữ liệu cũ và thay đổi của người dùng/agent khác. Nếu xung đột tài liệu, báo vị trí và giữ nguyên phần xung đột; không tự chọn một phiên bản sự thật.

## Quy ước khi được giao triển khai

- Theo stack và cấu trúc đã thống nhất; không thêm framework/backend/database khi chưa có nhu cầu được xác nhận.
- TypeScript rõ kiểu; component nhỏ theo trách nhiệm; semantic HTML, keyboard/focus và reduced motion. Chỉ thêm client JavaScript khi chức năng cần.
- Nội dung tách khỏi layout; Markdown mặc định, MDX khi cần component có lý do. Dùng slug mô tả, tên file nhất quán và token dùng chung; không nhân bản thông tin cá nhân trong nhiều file.
- Không đoán API, phiên bản hoặc lệnh npm. Đọc package.json/lockfile thực tế; tra nguồn chính thức khi cần. Không có script thì ghi “chưa có”, không báo đã chạy.

## Workflow, kiểm tra và bàn giao

1. Chọn task và xác định file được phép sửa. Nếu nhiều agent, phân công một người ghi mỗi file; agent tích hợp quản lý TASKS/HANDOFF.
2. Đọc context tối thiểu; kiểm tra bằng chứng và dependencies. Thực hiện thay đổi nhỏ trong phạm vi được giao.
3. Chạy kiểm tra phù hợp: docs kiểm tra link, trạng thái, nguồn và phạm vi; code theo scripts thực tế; UI thêm kiểm tra trình duyệt khi đã có giao diện. Không cài công cụ chỉ để làm một check chưa được phép.
4. Ghi lệnh, kết quả thực tế và giới hạn. Phân biệt PASS, FAIL, NOT_RUN, BLOCKED; không coi đọc code là browser test.
5. TASKS: TODO → IN_PROGRESS → DONE chỉ khi đủ acceptance criteria và có bằng chứng. BLOCKED phải có lý do và dependency. Tham chiếu kết quả trong AUDIT hoặc artifact thực tế.
6. HANDOFF: cập nhật ngày Asia/Saigon, task, files, checks, vấn đề mở và bước kế tiếp; thay tóm tắt cũ, không nối toàn bộ chat. Tài liệu chuẩn thay đổi thì cập nhật đúng file sở hữu dữ liệu, không sao chép sang mọi file.

## Skills theo nhu cầu

| Công việc | Skill nên xem xét |
|---|---|
| Định hướng/design system | `frontend-design` |
| Polish/visual review | `impeccable` |
| Audit UI/UX/accessibility | `web-design-guidelines` |
| Browser test | `playwright-cli` |
| Portfolio copywriting | `human-centered-portfolio` nếu có |

Kiểm tra SKILL.md, runtime availability và dependencies trước khi dùng; chỉ nạp skill liên quan. Báo rõ nếu thiếu, không nói đã dùng khi chỉ thấy file hoặc tên trong catalog. Không cài tự động. Đọc SKILLS_AUDIT khi có bất đồng đường dẫn: docs/BRIEF.md và docs/DESIGN.md là nguồn chuẩn, không tạo bản sao PRODUCT.md/DESIGN.md tại root theo gợi ý của skill. Quy tắc tính đúng đắn, riêng tư và thiết kế ở trên luôn có hiệu lực dù không dùng skill.
