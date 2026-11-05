# Cà phê Vỉa Hè (phố cổ Hà Nội)

## Chạy trên Windows
1. Cài Node.js (bản LTS) từ nodejs.org.
2. Giải nén thư mục, bấm đúp `start.bat` (hoặc: `npm install` rồi `node server.js`).
3. Mở http://localhost:3000 để thử.

## Cho bạn bè vào
- Cùng wifi: gửi `http://IP-máy-bạn:3000` (xem IP bằng `ipconfig`).
- Qua internet: cài cloudflared, chạy `cloudflared tunnel --url http://localhost:3000`, gửi link `https://....trycloudflare.com` vào nhóm Zalo. Link đổi mỗi lần chạy.
- Muốn chỉ nhóm mình vào được: đặt mã phòng `set CODE=abc123` trước khi chạy `node server.js`.

## Điều khiển
WASD/mũi tên hoặc click để đi; click vào ghế nhựa để ngồi; Enter để chat; M mở menu; phím 1-5 thả emoji.

## Hành động (sau khi gọi món bằng M)
Q uống (mỗi cốc 4 ngụm) · R đặt cốc xuống bàn / nhấc lên (đặt gần bàn thì cốc nằm trên bàn) · F cắn hạt hướng dương hoặc lạc (vỏ rơi xuống nền) · X đập cốc (vỡ tung, rung màn hình, cả quán nghe "choang").
Muốn nghe âm thanh thì bấm vào trang ít nhất một lần.

## Nâng cấp 2
Menu thêm: Tẩy đá, Chai Sting (3 lần đổ), Điếu cày thuốc lào.
T đổ Sting vào tẩy (cầm tẩy đá + có chai Sting) · H hút thuốc lào, nhả khói · C chửi bạn gần nhất (hoặc cả quán) · V cầm điếu cày đập bạn gần đó; đập trúng đúng 3 lần thì bị choáng 5 giây và hiện thông báo đền quán = 500k × (số cốc đã đập + số món đã gọi).

## Nâng cấp 3: chủ quán, nhân viên, két tiền
- Người vào đầu tiên là chủ quán 👑 (chủ thoát thì người vào sớm nhất còn lại lên thay). Chủ quán bấm Y để thuê/cho nghỉ người đứng gần (nhân viên 🍽). Có nhân viên thì món khách gọi phải chờ nhân viên bê ra (B ở quầy để lấy, B lần nữa khi đứng cạnh khách để đưa); hết nhân viên thì khách tự lấy.
- K mở két (gần góc quầy): chủ quán lấy 100k/lần; nếu chủ quán đang bị đập choáng thì chỉ người đã đập chủ quán mới được lấy 100k/lần. Mỗi món gọi cộng 20k vào két.
- Nhân viên: Z tịnh tâm 6 giây (không bị chửi/đập ảnh hưởng, bị chửi còn được boa 50k), U rút điếu cày ra, V đập khách.
- Bị đập trúng: choáng nằm im 10 giây, không đi/gọi món/làm hành động được.
- N nói chuyện ẩn: đứng gần ai đó bấm N để xin, người kia đồng ý thì chat riêng, chỉ hai người thấy. Bấm N lần nữa hoặc đi xa quá để dừng.

## Đưa lên Render (chơi với bạn bè qua internet)
Repo đã có sẵn `render.yaml` (Blueprint) nên chỉ cần vài bước:
1. Tạo repo trên GitHub rồi đẩy code lên (xem lệnh bên dưới).
2. Vào https://dashboard.render.com → **New** → **Blueprint** → chọn repo → **Apply**. (Hoặc **New → Web Service**, chọn repo.)
3. Nếu làm thủ công, điền: Runtime **Node**, Build `npm ci`, Start `npm start`, Plan **Free**, Region **Singapore**.
4. (Tuỳ chọn) Vào **Environment** thêm biến `CODE=abc123` nếu muốn chỉ nhóm mình vào được (nhập mã ở màn hình vào quán).
5. Deploy xong mở link `https://ten-quan.onrender.com`, gửi vào nhóm Zalo. Client tự dùng `wss://` khi trang là https, không phải sửa gì.

Lưu ý khi dùng gói Free:
- Quán "ngủ" sau ~15 phút không có ai chơi: lần vào đầu tiên sẽ chậm 30–60 giây, và quán **reset** (toàn bộ trạng thái game nằm trong RAM, không có database).
- Chỉ để **1 instance** (đừng bật scaling) vì người chơi và WebSocket nằm trong bộ nhớ của một tiến trình.
- Muốn quán luôn mở: nâng lên gói Starter, hoặc dùng một cron bên ngoài ping `https://ten-quan.onrender.com/healthz` mỗi 10 phút.
- Server đã đọc cổng từ `process.env.PORT` nên Render tự gán cổng, không cần cấu hình gì thêm.

Lệnh đẩy code lên GitHub (chạy trong thư mục này):
```
git init
git add .
git commit -m "Cafe via he"
git branch -M main
git remote add origin https://github.com/<tên-bạn>/cafe-via-he.git
git push -u origin main
```

## Chơi trên điện thoại
Mở cùng link trên điện thoại. Chạm (hoặc kéo ngón tay) lên cảnh quán để đi, chạm vào ghế nhựa để ngồi. Camera tự phóng to và đi theo nhân vật. Các nút hành động nằm dưới khung quán, nút Menu và ô chat ở dưới cùng. Nên xoay dọc màn hình.
