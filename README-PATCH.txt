Second Brain v0.6.3 — PATCH ONLY

Chỉ chứa các file mới/thay đổi so với v0.6.2.
Không xóa các file khác trong project.

Cách nâng cấp:
1. Giải nén ZIP này.
2. Copy đè đúng đường dẫn vào source v0.6.2.
3. Commit + Push GitHub.
4. Vercel tự deploy.

Không cần chạy SQL migration mới.

Thay đổi:
- Bỏ hoàn toàn khối hiển thị Admin / mật khẩu mặc định trên trang đăng nhập.
- Mật khẩu ở form Admin và cấp lại mật khẩu luôn dùng input type=password.
- Không hiển thị gợi ý mật khẩu đơn giản; hệ thống vẫn chấp nhận mọi mật khẩu không rỗng.
- Mỗi tài khoản vẫn có kho Knowledge/Notes/Backup/RAG riêng theo user_id; không dùng chung dữ liệu.
- Thêm cài đặt cỡ chữ 90/100/110/120/130%, lưu riêng theo user_id trên trình duyệt.
- Mặc định cỡ hiển thị 110% để dễ đọc hơn.
