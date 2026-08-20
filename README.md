# SECOND BRAIN — Personal Knowledge OS

MVP cho hệ thống “Bộ Não Thứ 2”: lưu kiến thức dài hạn, tìm lại bằng semantic search và trò chuyện với AI dựa trên dữ liệu riêng.

## Có gì trong bản này
- Dashboard hiện đại, responsive.
- Knowledge Library.
- Lưu kiến thức thủ công.
- Supabase PostgreSQL + pgvector.
- Embedding tự động khi lưu.
- RAG: câu hỏi -> semantic search -> context -> AI trả lời.
- Hiển thị nguồn đã dùng.
- Tách AI khỏi dữ liệu: thay model không làm mất Knowledge.
- Project Memory scaffold cho phase tiếp theo.

## Cài đặt
Yêu cầu Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở http://localhost:3000

## Cấu hình Supabase
1. Tạo project Supabase.
2. Mở SQL Editor.
3. Chạy toàn bộ `supabase/schema.sql`.
4. Điền `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

> Không đưa `SUPABASE_SERVICE_ROLE_KEY` ra phía client hoặc commit lên GitHub.

## Cấu hình AI
Thêm:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Nếu chưa có API key, web vẫn mở được. Chat sẽ báo AI chưa được cấu hình.

## Deploy Vercel
1. Push các file trong ZIP này vào root repository GitHub.
2. Import repository vào Vercel.
3. Thêm 5 Environment Variables từ `.env.example`.
4. Deploy.

## Kiến trúc

```text
User
  -> Next.js UI
      -> /api/knowledge -> Supabase Knowledge + Vector
      -> /api/chat
           -> Embedding câu hỏi
           -> pgvector match_knowledge()
           -> Context nguồn riêng
           -> AI Responses API
           -> Answer + Sources
```

## Phase 2 đề xuất
- Login/Auth + dữ liệu tách riêng theo user.
- Upload PDF/DOCX/TXT/Markdown/code.
- Parser + chunking thông minh.
- Project Memory & Timeline.
- YouTube/Google Drive capture.
- Browser extension “Save to Second Brain”.
- Tags, collections, backlinks.
- Full-text + semantic hybrid search.
- Export/backup ZIP + JSON/Markdown.
- Chế độ “Chỉ dữ liệu của tôi” / “Dữ liệu + AI chung”.



## v0.2 — Multi AI Provider

- Thêm Gemini, ChatGPT/OpenAI và Groq trực tiếp từ giao diện `⚙ AI`.
- API key AI được lưu trong Local Storage của trình duyệt, không cần tạo ENV AI trên Vercel.
- Có nút kiểm tra từng API.
- Chọn provider ưu tiên hoặc `Tự động / xoay vòng`.
- Khi bật xoay vòng, nếu provider đầu tiên lỗi/hết quota, hệ thống thử provider tiếp theo.
- Model là ô nhập tự do, vì danh sách model của các nhà cung cấp thay đổi theo thời gian.
- RAG embeddings: ưu tiên OpenAI; nếu không có thì dùng Gemini embedding 1536 chiều; Groq hiện dùng cho phần chat.

### Lưu ý bảo mật
Cách lưu Local Storage phù hợp cho web cá nhân/private. API key không được ghi vào Supabase hoặc Vercel, nhưng vẫn tồn tại trong trình duyệt. Không nên dùng thiết kế này cho website public nhiều người dùng nếu chưa bổ sung đăng nhập, mã hóa secret và vault phía server.
