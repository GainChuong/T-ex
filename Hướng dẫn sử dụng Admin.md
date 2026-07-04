# Hướng dẫn sử dụng Giao diện Quản trị (Admin Panel)

> HR XAI Survey — Phiên bản 1.0

---

## Mục lục

1. [Truy cập & Đăng nhập](#1-truy-cập--đăng-nhập)
2. [Tổng quan giao diện](#2-tổng-quan-giao-diện)
3. [Tab Câu hỏi (Questions)](#3-tab-câu-hỏi-questions)
4. [Tab Dữ liệu (Data)](#4-tab-dữ-liệu-data)
5. [Tab Mẫu (Samples)](#5-tab-mẫu-samples)
6. [Tab Thống kê (Dashboard)](#6-tab-thống-kê-dashboard)
7. [Tab Tùy chỉnh (Configure)](#7-tab-tùy-chỉnh-configure)
8. [Undo/Redo](#8-undoredo)
9. [Test Mode](#9-test-mode)
10. [Lưu ý quan trọng](#10-lưu-ý-quan-trọng)

---

## 1. Truy cập & Đăng nhập

### Bước 1: Truy cập trang quản trị
Thêm tham số `?admin=true` vào URL trang khảo sát:

```
https://hr-xai-survey.vercel.app/?admin=true
```

### Bước 2: Đăng nhập
Màn hình đăng nhập sẽ hiện ra với 2 trường:
- **Email đăng nhập** — Email tài khoản admin
- **Mật khẩu** — Mật khẩu tương ứng

Nhấn **Đăng nhập**. Nếu sai thông tin, sẽ có thông báo lỗi.

> Hệ thống xác thực qua Supabase Auth. Tài khoản do quản trị viên cấp.

### Đăng xuất
Nhấn nút **Đăng xuất** (góc phải thanh header) để thoát khỏi admin panel.

---

## 2. Tổng quan giao diện

### Thanh header (Admin Header)
```
┌─────────────────────────────────────────────────────────────┐
│  Admin Panel         [Hoàn tác] [Làm lại] | [Test] | [EN] [Đăng xuất] │
└─────────────────────────────────────────────────────────────┘
```

- **Hoàn tác** — Quay lại thao tác trước (Ctrl+Z)
- **Làm lại** — Khôi phục thao tác vừa hoàn tác (Ctrl+Y)
- **Test** — Bật/tắt chế độ thử nghiệm
- **EN / VI** — Chuyển đổi ngôn ngữ giao diện admin
- **Đăng xuất** — Thoát admin

### 5 Tab chức năng

| Tab | Chức năng |
|-----|-----------|
| **Câu hỏi** | Soạn thảo, sắp xếp câu hỏi và sections |
| **Dữ liệu** | Xem, tìm kiếm, xuất và xóa responses |
| **Mẫu** | Theo dõi tiến độ và cài đặt mục tiêu 4 case |
| **Thống kê** | Biểu đồ nhân khẩu học và phân tích câu hỏi |
| **Tùy chỉnh** | Ghi đè nội dung văn bản hệ thống (VI/EN) |

---

## 3. Tab Câu hỏi (Questions)

Đây là tab phức tạp nhất, cho phép quản lý toàn bộ nội dung khảo sát.

### 3.1 Cấu trúc Section

Mỗi section là một khối câu hỏi, được hiển thị dưới dạng thẻ có màu viền trái:
- **Viền xanh đậm** — Pre-Demo (trước khi xem profile AI)
- **Viền xanh lá** — Post-Demo (sau khi xem profile AI)

Mỗi section hiển thị:
- **Badge** — "Phần X trên Y" với số thứ tự
- **Phase badge** — "Trước Demo" hoặc "Sau Demo"
- **Section key** — Mã định danh (có thể sửa)
- **Tiêu đề (Title)** — Song ngữ VI + EN, soạn thảo WYSIWYG
- **Mô tả (Description)** — Song ngữ VI + EN, soạn thảo WYSIWYG

### 3.2 Thanh công cụ Section

| Nút | Chức năng |
|-----|-----------|
| **Dịch tiêu đề** | Tự động dịch tiêu đề VI → EN (MyMemory API) |
| **Dịch mô tả** | Tự động dịch mô tả VI → EN |
| **Di chuyển lên/xuống** | Đổi thứ tự section |
| **Gộp với section trước** | Gộp tất cả câu hỏi vào section phía trên |
| **Xóa section** | Xóa section và tất cả câu hỏi trong đó |

> **Lưu ý:** Section "Câu hỏi sàng lọc" và "Câu hỏi ban đầu" là bắt buộc, không thể xóa, di chuyển hay đổi phase.

### 3.3 Soạn thảo câu hỏi

Mỗi câu hỏi có hai chế độ:
- **Preview** — Xem nhanh nội dung, click để chỉnh sửa
- **Edit** — Hiển thị đầy đủ trình soạn thảo

#### Các trường trong chế độ Edit:

**1. Nội dung câu hỏi (VI + EN)**
- WYSIWYG editor với thanh công cụ: **B** (Bold), *I* (Italic), <u>U</u> (Underline), Màu chữ, Cỡ chữ
- HTML/Visual mode — Chuyển đổi giữa chế độ giao diện và mã HTML
- Nút **Auto-translate** — Dịch VI sang EN tự động
- **Live preview** — Xem trước nội dung định dạng

**2. Loại câu hỏi**

| Loại | Mô tả | Tùy chọn |
|------|-------|----------|
| **Thang đo tuyến tính (Likert)** | Thang điểm từ X đến Y | Chọn điểm bắt đầu (0/1), kết thúc (2-10), nhãn đầu/cuối |
| **Trắc nghiệm (Radio)** | Chọn một đáp án | Danh sách option, thêm/xóa |
| **Hộp kiểm (Checkbox)** | Chọn nhiều đáp án | Danh sách option, thêm/xóa |
| **Văn bản ngắn (Text)** | Nhập văn bản tự do | Placeholder preview |

**3. Tùy chọn nâng cao**
- **Yêu cầu bắt buộc (Required)** — Bật/tắt bằng toggle switch
- **Di chuyển** — Lên / Xuống trong danh sách
- **Nhân bản (Duplicate)** — Tạo bản sao với hậu tố "(Bản sao)"
- **Xóa** — Xóa câu hỏi (có xác nhận)

### 3.4 Thêm câu hỏi & Section

Trong thanh công cụ nổi (floating toolbar) trên mỗi câu hỏi:
- **+ Add Question** — Thêm câu hỏi mới ngay sau câu hỏi hiện tại
- **+ Add Section** — Thêm section mới, nhập tên section, câu hỏi đầu tiên sẽ thuộc section mới

### 3.5 Kéo thả (Drag & Drop)

- Kéo thả **section** để sắp xếp lại thứ tự
- Kéo thả **câu hỏi** để di chuyển giữa các vị trí và giữa các section
- Khi kéo thả section sang phase khác, phase sẽ tự động cập nhật

### 3.6 Lưu & Hủy thay đổi

| Nút | Chức năng |
|-----|-----------|
| **Save Changes** | Lưu bản nháp ra production (áp dụng cho người dùng thật) |
| **Discard** | Hủy bỏ thay đổi, quay về trạng thái production |
| **Reset Defaults** | Khôi phục câu hỏi mặc định ban đầu |

> Nếu có thay đổi chưa lưu, nút **Save Changes** và **Discard** sẽ sáng lên.

---

## 4. Tab Dữ liệu (Data)

### 4.1 Xem danh sách responses

Bảng liệt kê tất cả responses từ Supabase, hiển thị:
- `participant_id`, `email`, `condition`, `case_id`
- `transparency`, `outcome`
- `fill_started_at`, `submitted_at` (định dạng ngày giờ Việt Nam)
- Tổng số phản hồi: "X phản hồi"

Mỗi dòng có nút **Delete** để xóa response đó.

### 4.2 Sheet View (Xem dạng bảng tính)

Nhấn nút **Open Sheet View** để mở giao diện giống Google Sheets:
- Cột cố định + cột động từ dữ liệu response
- Số thứ tự dòng
- Header chữ cái (A, B, C...)
- **Thanh tìm kiếm** — Lọc dữ liệu real-time
- **Export CSV** — Tải file CSV (UTF-8 BOM cho Excel)
- Nhấn **Close** hoặc **Esc** để đóng

### 4.3 Xuất dữ liệu

| Định dạng | Nút | Đặc điểm |
|-----------|-----|----------|
| **CSV** | Export CSV | Có BOM, hiển thị đúng tiếng Việt trong Excel |
| **JSON** | Export JSON | Toàn bộ dữ liệu dạng JSON |

### 4.4 Xóa dữ liệu

| Hành động | Chức năng |
|-----------|-----------|
| Xóa một response | Nút Delete trên từng dòng (có xác nhận) |
| Xóa tất cả | Nút **Delete All Responses** — Xóa toàn bộ dữ liệu (có xác nhận) |

---

## 5. Tab Mẫu (Samples)

### 5.1 Giao diện theo dõi

Hiển thị 4 case với progress bar:

```
C1: High Transparency + Favorable     [████████████░░░░░░]  45/100
C2: High Transparency + Unfavorable   [██████████████████] 100/100 ✅
C3: Low Transparency + Favorable      [██████░░░░░░░░░░░░]  30/100
C4: Low Transparency + Unfavorable    [████████░░░░░░░░░░]  55/100
```

- **Thanh progress** — Xanh dương khi chưa đạt target, xanh lá khi đã đạt
- **Số liệu** — "Số hiện tại / Target" (vd: 45/100)
- **Input target** — Ô nhập số để thay đổi mục tiêu từng case

### 5.2 Cách hoạt động

Khi người dùng tham gia khảo sát, hệ thống:
1. Đọc target và số lượng hiện tại của từng case
2. Lọc ra các case chưa đạt target
3. Chọn ngẫu nhiên một case từ danh sách còn trống
4. Gán điều kiện tương ứng (transparency cao/thấp + outcome thuận lợi/không thuận lợi)

> Khi một case đạt target (thanh xanh lá), hệ thống sẽ không gán thêm người dùng mới vào case đó.

---

## 6. Tab Thống kê (Dashboard)

### 6.1 Tổng quan
Hiển thị "X câu trả lời - Thống kê dữ liệu từ người dùng".

### 6.2 Biểu đồ nhân khẩu học

| Biểu đồ | Loại | Mô tả |
|---------|------|-------|
| **Phòng ban (Department)** | Doughnut | Phân bố phòng ban, xử lý giá trị `dept_other` |
| **Khu vực (Region)** | Doughnut | Phân bố khu vực địa lý |
| **Độ tuổi (Age)** | Bar chart | Nhóm: 18-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55+ |
| **Số năm làm việc** | Bar chart | Nhóm: <1, 1-2, 3-5, 6-10, 11-15, 16-20, 20+ |

### 6.3 Phân tích câu hỏi theo Section

Mỗi section hiển thị trong một thẻ header riêng (màu gradient navy). Bên trong là từng câu hỏi với biểu đồ tương ứng:

| Loại câu hỏi | Loại biểu đồ | Chi tiết |
|--------------|--------------|----------|
| **Likert** | Vertical bar chart | Phân phối điểm từng giá trị (1-5 hoặc tùy chỉnh) |
| **Radio** | Doughnut chart | Phân bố lựa chọn |
| **Checkbox** | Horizontal bar chart | Số lượt chọn từng option (người dùng chọn nhiều) |
| **Text** | Bảng tần suất | Top 15 câu trả lời phổ biến nhất |

---

## 7. Tab Tùy chỉnh (Configure)

### 7.1 Các nhóm nội dung có thể tùy chỉnh

| Nhóm | Key | Mô tả |
|------|-----|-------|
| **Trang thông tin & Đồng ý** | `consent_title`, `consent_p1`, `consent_p2`, `consent_agree` | Nội dung trang đồng ý tham gia |
| **Trang bối cảnh giả định** | `context_title`, `context_p1`, `context_p2`, `context_p3`, `context_note` | Bối cảnh tình huống HR |
| **Hồ sơ cá nhân** | `profile_title`, `profile_desc` | Trang xem profile nhân viên |
| **Báo cáo hiệu suất AI** | `ai_disclaimer` | Lưu ý về đánh giá AI |
| **Thông tin Trợ giúp** | `help_data_title`, `help_data_desc`, `help_ai_title`, `help_ai_desc`, ... | Tooltip hướng dẫn người dùng |
| **Trang kết thúc** | `debrief_title`, `debrief_desc` | Nội dung sau khi hoàn thành |

### 7.2 Thao tác

Mỗi key hiển thị dưới dạng:
- **Tên key** (monospace) — Nút "Clear edits" để reset key đó
- **VI editor** — WYSIWYG với thanh công cụ, live preview
- **EN editor** — WYSIWYG với thanh công cụ, nút "Dịch" (auto-translate), live preview

### 7.3 Lưu & Hủy

| Nút | Chức năng |
|-----|-----------|
| **Save Config** | Lưu thay đổi ra production |
| **Discard** | Hủy thay đổi, quay về production |
| **Reset Defaults** | Xóa toàn bộ custom translations |

---

## 8. Undo/Redo

### Cách hoạt động
- Hệ thống tự động ghi lại trạng thái mỗi khi bạn thực hiện thay đổi (thêm/xóa/sửa câu hỏi, section, option...)
- Lưu tối đa **50 trạng thái** gần nhất

### Phím tắt
| Thao tác | Phím tắt |
|----------|----------|
| **Undo (Hoàn tác)** | `Ctrl + Z` |
| **Redo (Làm lại)** | `Ctrl + Y` |

> Khi con trỏ đang ở trong ô input/text, phím tắt sẽ không hoạt động để tránh can thiệp vào việc gõ văn bản.

---

## 9. Test Mode

### Bật Test Mode
Nhấn nút **"Thử nghiệm: Tắt"** trên thanh header admin để bật chế độ thử nghiệm. Nút sẽ chuyển sang màu vàng và hiển thị **"Thử nghiệm: Bật"**.

### Khi Test Mode bật
Một dropdown **TEST CASE** xuất hiện trên thanh topbar của trang khảo sát (giao diện người dùng):

| Case | Mã | Mô tả |
|------|-----|-------|
| Case 1 | `high_fav` | High Transparency + Favorable |
| Case 2 | `high_unfav` | High Transparency + Unfavorable |
| Case 3 | `low_fav` | Low Transparency + Favorable |
| Case 4 | `low_unfav` | Low Transparency + Unfavorable |

Chọn một case để chuyển đổi điều kiện và xem profile tương ứng.

---

## 10. Lưu ý quan trọng

### Draft vs Production
- Mọi thay đổi trong admin đều được lưu vào **bản nháp (draft)** trước
- Chỉ khi nhấn **Save Changes** mới áp dụng ra **production** (ảnh hưởng đến người dùng thật)
- Nếu rời trang khi chưa lưu, sẽ có cảnh báo

### Đồng bộ Database
- Khi lưu production, dữ liệu được đồng bộ lên Supabase `settings` table
- Khi trang khảo sát tải lại, settings sẽ được đồng bộ từ DB về localStorage
- Responses được lưu trực tiếp vào Supabase `responses` table

### Xóa dữ liệu
- Tất cả thao tác xóa (response, câu hỏi, section) đều có xác nhận
- Xóa responses là vĩnh viễn, không thể khôi phục

### Dịch tự động
- **MyMemory API** — Dịch nội dung trong admin (section title/desc, câu hỏi, custom translations)
- **Google Translate API** — Dịch text câu hỏi trong giao diện khảo sát
- Cả hai đều là API miễn phí, có thể có giới hạn số lượng request

---

> *Tài liệu này dành cho quản trị viên hệ thống HR XAI Survey.*
> *Phiên bản 1.0 — Cập nhật lần cuối: Tháng 6, 2026*
