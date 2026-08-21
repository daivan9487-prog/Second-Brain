SECOND BRAIN v0.6.4 — PATCH ONLY

Áp dụng trên source v0.6.3 (hoặc v0.6.2 + patch v0.6.3).
Chỉ copy đè/copy thêm các file có trong gói này, đúng đường dẫn.

1) Supabase SQL Editor: chạy supabase/migration-v0.6.4.sql một lần.
2) Vercel: nên có AUTH_SECRET ổn định, dài và bí mật. KHÔNG thay AUTH_SECRET sau khi đã lưu API key, vì key được mã hóa bằng secret này.
3) Deploy lại.

Tính năng:
- API key lưu theo user_id trong Supabase, không dùng chung tài khoản.
- API key mã hóa AES-256-GCM ở server.
- Trình duyệt/server chỉ hiển thị 4 ký tự cuối sau khi lưu.
- Tắt web/mở lại vẫn còn; đăng nhập thiết bị khác vẫn dùng được.
- Chat và tạo embedding tự lấy key của tài khoản đang đăng nhập ở server.
- Có link lấy API + link hướng dẫn cho Gemini, OpenAI, Groq, Grok/xAI, Claude, OpenRouter, DeepSeek, Mistral.
- Nếu có key v0.6.3 trong LocalStorage, trang AI Models tự import vào AI Vault một lần rồi xóa bản local khi thành công.

Lưu ý bảo mật:
- SUPABASE_SERVICE_ROLE_KEY và AUTH_SECRET chỉ đặt trong Vercel Environment Variables, không commit GitHub.
- Nếu AUTH_SECRET bị đổi/mất, các API key đã mã hóa trước đó sẽ không giải mã được; khi đó cần nhập key lại.
