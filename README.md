# Second Brain v0.6 — UI Refresh + Simple AI Setup

Bản v0.6 nâng cấp giao diện và trải nghiệm sử dụng từ v0.4, giữ nguyên lõi Knowledge + Brain Map 3D + Supabase RAG + Backup/Export + Multi-AI/Multi-Account.

## Điểm mới v0.6

- Dashboard mới: sáng, thoáng, dễ đọc, responsive.
- 4 giao diện có thể đổi trực tiếp: **Sáng / Neon / Ấm / Midnight**.
- Trang riêng **AI Models**.
- Thêm API theo 4 bước: **Chọn Provider → Dán API Key → Chọn Model → Lưu**.
- Hỗ trợ nhiều tài khoản / nhiều API key cho cùng provider.
- Bật/tắt từng key, đặt Priority, test từng tài khoản, Smart Routing/fallback.
- Nút **+ Thêm API** gọn ngay trong AI Brain; quản lý nâng cao ở `/ai-models`.
- Quick Capture ở sidebar và modal lưu Knowledge mới.

## AI Provider có sẵn

- Gemini
- OpenAI / ChatGPT API
- Groq
- Grok / xAI
- Claude / Anthropic
- OpenRouter
- DeepSeek
- Mistral
- Custom OpenAI-compatible API

## Dữ liệu và API key

- Knowledge, backup và vector data: Supabase.
- AI API key: Local Storage trên trình duyệt hiện tại.
- API key AI không được ghi vào Supabase hoặc GitHub.
- Khi gọi AI, key được gửi tạm tới Next.js API route để thực hiện request.

## Deploy

1. Giữ nguyên ENV Supabase của dự án đang chạy.
2. Nếu đã chạy `supabase/migration-v0.3.sql` thì **v0.6 không cần migration SQL mới**.
3. Đẩy toàn bộ source v0.6 lên GitHub.
4. Vercel tự build/deploy lại.
5. Mở `/ai-models` để thêm API key trực tiếp trên web.

## Chạy local

```bash
npm install
npm run dev
```

Yêu cầu Node.js 22+.

## v0.6.1 — Knowledge-first
- Kho Tri Thức đứng đầu sidebar, trên Tổng quan.
- Form Lưu Tri Thức luôn mở; không cần bấm `+ Lưu kiến thức`.
- Thứ tự nhập: Nội dung → Tiêu đề → Topic → Category → Tag → Nguồn.
- Chỉ cần Tiêu đề hoặc Nội dung; ngày giờ tạo tự lưu bằng Supabase.
- Danh sách kiến thức compact luôn mở, có sửa/xóa và tìm kiếm.
- Thêm tab Ghi chú cho điều cần nhớ/lịch hẹn.
- Chạy `supabase/migration-v0.6.1.sql` một lần để tạo `quick_notes`.
