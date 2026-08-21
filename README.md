# Second Brain v0.6.2 — Account & Admin

Bản v0.6.2 bổ sung hệ thống tài khoản nhiều người dùng, đăng nhập lâu dài, đăng ký công khai và trang quản trị Admin.

## Tài khoản quản trị mặc định

- Username: `Admin`
- Password: `123`
- Tài khoản Admin được tạo tự động ở lần đăng nhập đầu tiên, mật khẩu được lưu bằng `scrypt + salt`, không lưu chữ thô.
- Nên đổi mật khẩu ngay sau lần đăng nhập đầu tiên.

## Người dùng

- Có thể tự đăng ký tại màn hình đăng nhập.
- Username: viết liền, không dấu; chữ/số/`.`/`_`/`-`.
- Password: chỉ cần không rỗng, có thể rất đơn giản.
- SĐT: không bắt buộc.
- Người dùng có toàn bộ tính năng Knowledge, Notes, Brain Map, AI Models, Projects, Backup/Export.
- Dữ liệu Knowledge/Notes/Backup được tách riêng theo từng tài khoản.
- AI API key vẫn chỉ lưu trên trình duyệt và được tách theo user id.

## Admin

Trang `Quản trị` cho phép:
- Tạo tài khoản
- Sửa username / SĐT
- Khóa / mở khóa
- Cấp lại mật khẩu
- Xem thời điểm tạo và lần đăng nhập gần nhất

## Ghi nhớ đăng nhập

Second Brain không lưu mật khẩu thô vào LocalStorage. Thay vào đó, server cấp cookie HttpOnly có hạn 180 ngày. Username gần nhất được lưu để điền sẵn. Vì vậy lần sau mở trình duyệt người dùng thường được tự đăng nhập mà không cần nhập lại mật khẩu.

## Nâng cấp từ v0.6.1

1. Thay source bằng v0.6.2.
2. Supabase → SQL Editor → chạy `supabase/migration-v0.6.2.sql`.
3. Giữ nguyên ENV cũ. Có thể thêm `AUTH_SECRET` dài/ngẫu nhiên để ký session; nếu bỏ trống app dùng `SUPABASE_SERVICE_ROLE_KEY` làm secret dự phòng.
4. Deploy lại Vercel.
5. Đăng nhập lần đầu bằng `Admin / 123`; server sẽ tạo Admin và tự gán dữ liệu cũ chưa có owner cho Admin.

> Không commit `.env` hoặc secret lên GitHub.
