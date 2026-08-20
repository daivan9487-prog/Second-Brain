# Second Brain v0.4 — Multi-Account AI Vault

Nâng cấp từ v0.3. Giữ nguyên Brain Map 3D, Knowledge Library, Supabase RAG, Backup/Export và bổ sung hệ thống AI đa nhà cung cấp + đa tài khoản.

## AI providers có sẵn
- Gemini (Google)
- OpenAI / ChatGPT API
- Groq
- Grok (xAI)
- Claude (Anthropic API)
- OpenRouter
- DeepSeek
- Mistral
- Custom OpenAI-compatible API

> "Claude Code" là ứng dụng/agent lập trình. Trong Second Brain, Claude được gọi thông qua Anthropic Claude API.

## Nhiều tài khoản / nhiều API key
Bấm **⚙ AI** → **+ provider** để tạo thêm Gemini #2, Gemini #3, OpenAI #2, Grok #2… Mỗi tài khoản có:
- Tên riêng
- API key riêng
- Model riêng
- Priority
- Bật/tắt
- Nút test riêng

Khi `Tự chuyển` bật, hệ thống thử lần lượt các tài khoản theo Priority. Nếu một key lỗi/hết quota/429, hệ thống chuyển sang key tiếp theo.

## Bảo mật
AI keys chỉ lưu Local Storage trong trình duyệt hiện tại và được gửi tạm đến API route khi thực hiện request. Không lưu vào Supabase/Vercel. Supabase server credentials vẫn phải nằm trong Vercel Environment Variables.

## Nâng cấp từ v0.3
Không cần migration SQL mới. Chỉ thay source, commit/push GitHub và để Vercel deploy lại.
