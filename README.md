# Second Brain v0.3 — Brain Map + Knowledge Tree + Multi AI

Personal Knowledge OS chạy bằng Next.js + Supabase + pgvector và AI do người dùng nhập trực tiếp trên web.

## Có gì mới ở v0.3

- Brain Map 3D tương tác: xoay, zoom, click node, tìm Category/Topic/Tags/nội dung.
- Knowledge Tree: Category → Topic → Knowledge.
- Sửa / xóa Knowledge trực tiếp.
- Tags và URL nguồn.
- Tìm kiếm tiếng Việt không dấu.
- Backup snapshot vào Supabase.
- Restore backup có xác nhận.
- Export JSON và Markdown.
- Giữ Multi-AI v0.2: Gemini / OpenAI / Groq, chọn model và xoay vòng trên web.

## Nâng cấp từ v0.2

1. Thay source GitHub bằng source v0.3.
2. Trong Supabase SQL Editor chạy `supabase/migration-v0.3.sql` đúng 1 lần.
3. Không cần đổi các ENV Supabase hiện tại.
4. Push GitHub, Vercel tự deploy lại.

## Cài mới

1. Tạo Supabase project.
2. Chạy `supabase/schema.sql`.
3. Trên Vercel thêm các biến trong `.env.example`.
4. Deploy.
5. Vào `⚙ AI` trên web và nhập Gemini/OpenAI/Groq API key. API key AI nằm trong trình duyệt, không cần ENV AI trên Vercel.

## Lưu ý bảo mật

Bản MVP sử dụng `SUPABASE_SERVICE_ROLE_KEY` chỉ ở server route. Tuyệt đối không đặt key này trong biến `NEXT_PUBLIC_*` và không commit `.env.local`/`Br2.env` vào GitHub.

## Roadmap gần

- Supabase Auth + owner_id + RLS theo từng tài khoản.
- Upload PDF/DOCX/TXT/code và tự chunk/index.
- Semantic links thật giữa các node trong Brain Map.
- AI chat làm sáng các node nguồn đang được dùng.
