# Cập nhật tính năng — HR XAI Survey

> So sánh giữa phiên bản khảo sát cơ bản (cũ) và phiên bản hiện tại đã được nâng cấp toàn diện.

---

## 1. Admin Panel (Hệ thống quản trị)

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Giao diện quản trị | ❌ Không có | ✅ Admin panel với 5 tab chức năng |
| Xác thực đăng nhập | ❌ Không có | ✅ Đăng nhập qua Supabase Auth (email/password) |
| URL truy cập | — | Thêm `?admin=true` vào URL trang khảo sát |

## 2. Survey Builder — Soạn thảo câu hỏi

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Trình soạn thảo WYSIWYG | ❌ Không có | ✅ Rich text editor với Bold/Italic/Underline/Màu chữ/Cỡ chữ |
| Loại câu hỏi | Chỉ Likert scale cố định | ✅ 4 loại: Likert, Radio, Checkbox, Text |
| Thêm/xóa câu hỏi | ❌ Không có | ✅ CRUD đầy đủ (thêm, sửa, xóa, nhân bản) |
| Kéo thả sắp xếp | ❌ Không có | ✅ Drag & drop sections và câu hỏi |
| Quản lý Section | ❌ Không có | ✅ Thêm, xóa, gộp, di chuyển section, phân chia Pre/Post Demo |
| Đánh dấu bắt buộc | ❌ Không có | ✅ Toggle required từng câu hỏi |
| Preview nội dung | ❌ Không có | ✅ Live preview khi soạn thảo |

## 3. Hệ thống nháp (Draft) & Undo/Redo

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Lưu bản nháp | ❌ Không có | ✅ Draft riêng biệt với production, không ảnh hưởng đến khảo sát thật |
| Phát hiện thay đổi | ❌ Không có | ✅ Tự động phát hiện và cảnh báo khi có thay đổi chưa lưu |
| Undo/Redo | ❌ Không có | ✅ Lưu 50 trạng thái gần nhất, hỗ trợ Ctrl+Z / Ctrl+Y |
| Lưu production | ❌ Không có | ✅ Nút Save để áp dụng thay đổi ra production, đồng bộ lên Supabase |

## 4. Xem & Xuất dữ liệu

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Bảng dữ liệu responses | ❌ Không có | ✅ Bảng dạng sheet với sticky header, tìm kiếm |
| Xuất CSV | ❌ Không có | ✅ Export CSV (hỗ trợ UTF-8 cho tiếng Việt) |
| Xuất JSON | ❌ Không có | ✅ Export JSON |
| Xóa dữ liệu | ❌ Không có | ✅ Xóa từng dòng hoặc xóa toàn bộ (có xác nhận) |
| Google Sheets webhook | ❌ Không có | ✅ Đồng bộ responses qua Google Sheets |

## 5. Dashboard thống kê

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Biểu đồ Chart.js | ❌ Không có | ✅ Tích hợp Chart.js (doughnut, bar, horizontal bar) |
| Thống kê nhân khẩu học | ❌ Không có | ✅ Biểu đồ Phòng ban, Khu vực, Độ tuổi, Số năm làm việc |
| Phân tích từng câu hỏi | ❌ Không có | ✅ Likert (bar chart), Radio (doughnut), Checkbox (horizontal bar), Text (bảng tần suất) |
| Phân nhóm theo Section | ❌ Không có | ✅ Câu hỏi được nhóm theo section riêng biệt |

## 6. Quản lý mẫu (Sample Targets)

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Theo dõi tiến độ | ❌ Không có | ✅ 4 case với progress bar (High/Low Transparency × Favorable/Unfavorable) |
| Cài đặt mục tiêu | ❌ Không có | ✅ Điều chỉnh target từng case, tự động chuyển xanh khi đạt target |
| Gán điều kiện tự động | ❌ Không có | ✅ Tự động chọn case ngẫu nhiên chưa đạt target khi người dùng vào khảo sát |

## 7. Tùy chỉnh nội dung (Custom Translations)

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Ghi đè văn bản hệ thống | ❌ Không có | ✅ Cho phép sửa tất cả nội dung VI/EN (consent, context, profile, help tooltips, debrief) |
| Dịch tự động | ❌ Không có | ✅ Tích hợp MyMemory API dịch VI → EN |
| Reset về mặc định | ❌ Không có | ✅ Reset từng key hoặc toàn bộ |

## 8. Chế độ thử nghiệm (Test Mode)

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Chuyển case | ❌ Không có | ✅ 4 case để kiểm tra (High/Low + Fav/Unfav) |
| Giao diện test | ❌ Không có | ✅ Dropdown chọn case trên thanh topbar khi bật test mode |

## 9. Hỗ trợ đa ngôn ngữ (i18n)

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Song ngữ VI/EN | ❌ Chỉ tiếng Việt | ✅ Toàn bộ giao diện hỗ trợ VI và EN |
| Chuyển đổi ngôn ngữ | ❌ Không có | ✅ Nút toggle trên topbar, cả giao diện người dùng và admin |

## 10. Tích hợp hệ thống

| Tính năng | Cũ | Mới |
|-----------|-----|------|
| Supabase Database | ❌ Không có | ✅ Lưu responses, settings, xác thực người dùng |
| Đồng bộ settings | ❌ Không có | ✅ Sync giữa localStorage và Supabase |
| Google Sheets | ❌ Không có | ✅ Webhook gửi response sang Google Sheets |
| Chart.js | ❌ Không có | ✅ Biểu đồ thống kê trực quan |

---

## Tổng quan kiến trúc

```
┌──────────────────────────────────────────────┐
│              SURVEY APPLICATION              │
├──────────────────────────────────────────────┤
│  Frontend (Vite)                             │
│  ├── index.html     (HTML + CSS ~2386 dòng)  │
│  ├── app-core.js    (Survey logic ~706 dòng) │
│  ├── app-ui.js      (Admin UI ~3353 dòng)    │
│  └── i18n.js        (Song ngữ ~696 dòng)     │
├──────────────────────────────────────────────┤
│  Backend / Storage                           │
│  ├── Supabase (ehgctunjaekarqxcqbpg)         │
│  │   ├── responses table                     │
│  │   ├── settings table                      │
│  │   └── Auth (email/password)               │
│  ├── localStorage (draft buffer, state)      │
│  └── Google Sheets webhook (optional)        │
├──────────────────────────────────────────────┤
│  External APIs                               │
│  ├── MyMemory API   (dịch nội dung admin)    │
│  └── Google Translate API (dịch survey text) │
└──────────────────────────────────────────────┘
```

## Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Vite | ^6.0.0 | Bundler dev/build |
| Chart.js | latest (CDN) | Biểu đồ thống kê |
| Supabase JS | v2 (CDN) | Database & Auth |
| Google Translate API | free endpoint | Dịch inline survey |
| MyMemory API | free endpoint | Dịch nội dung admin |
| Google Fonts (Inter) | — | Font chữ |
