# 🩸 HemoGuard AI - Chatbot & Hệ Thống Tra Cứu Tương Tác Thuốc Chống Đông

**HemoGuard AI** là giải pháp phần mềm chuyên sâu hỗ trợ cán bộ y tế (Bác sĩ, Dược sĩ lâm sàng, Điều dưỡng) và bệnh nhân tra cứu, phát hiện và cảnh báo sớm các tương tác nguy hiểm liên quan đến **thuốc chống đông máu** (Anticoagulants).

---

## 🌟 Tính Năng Nổi Bật

1. **Trò Chuyện AI Tự Nhiên (Clinical AI Chatbot):**
   - Hỗ trợ ngôn ngữ tiếng Việt tự nhiên, nhận diện chính xác hoạt chất và biệt dược lưu hành tại Việt Nam (*Sintrom, Coumadin, Xarelto, Eliquis, Pradaxa, Lovenox, Voltaren, Plavix, Medrol, Klacid, Diflucan...*).
   - Phân tích cơ chế tương tác dược lý sâu: Chuyển hóa men gan qua **CYP3A4, CYP2C9**, bơm tống thuốc **P-glycoprotein**, tác động hiệp đồng ức chế kết tập tiểu cầu và trợt loét dạ dày.
   - Đưa ra giải pháp lâm sàng hành động được (Actionable advice): Thuốc thay thế an toàn hơn, điều chỉnh liều, khoảng cách thời gian uống, chỉ số xét nghiệm cần theo dõi (**INR, chức năng thận CrCl**).

2. **Kiểm Tra Nhanh Phác Đồ Đa Thuốc (Multi-Drug Combo Checker):**
   - Chọn 1 thuốc chống đông và đồng thời tích chọn nhiều nhóm thuốc đang dùng kèm.
   - Hệ thống tự động phân loại mức độ theo mã màu y tế:
     - 🔴 **Chống chỉ định / Tránh phối hợp (Contraindicated)**
     - 🟠 **Nguy cơ cao - Cần can thiệp (Major)**
     - 🟡 **Thận trọng - Theo dõi (Moderate)**
     - 🟢 **Ít ý nghĩa / An toàn tương đối (Minor)**

3. **Cẩm Nang Dược Lâm Sàng (Clinical Handbook):**
   - Bảng so sánh dược động học DOACs vs VKAs.
   - Hướng dẫn điều chỉnh liều theo chức năng thận (CrCl).
   - Hướng dẫn xử trí ngừng thuốc trước phẫu thuật / thủ thuật can thiệp.
   - Danh sách thuốc giải độc đặc hiệu (**Antidotes:** *Idarucizumab, Andexanet alfa, Vitamin K1, Protamine*).
   - 7 dấu hiệu cảnh báo xuất huyết cấp cứu dành cho bệnh nhân.

4. **Kiến Trúc Kép Linh Hoạt (Hybrid Dual Engine):**
   - **Chế độ Ngoại tuyến / Chuyên gia (Expert Engine):** Hoạt động 100% không cần kết nối mạng hoặc API Key, tuyệt đối bảo mật và chuẩn xác theo Dược thư.
   - **Chế độ AI Mở Rộng (Gemini API):** Tùy chọn nhập Google Gemini API Key để mô hình ngôn ngữ lớn tổng hợp câu trả lời mượt mà, đồng thời kiểm chứng chéo với cơ sở dữ liệu y tế.

---

## 🚀 Cách Sử Dụng Ngay Lập Tức

Không cần cài đặt phức tạp, ứng dụng chạy được ngay trong trình duyệt của bạn:

1. Điều hướng đến thư mục dự án:
   ```
   C:\Users\HP\.gemini\antigravity\scratch\anticoag-interaction-bot
   ```
2. **Nhấp đúp vào tệp `index.html`** để mở ngay ứng dụng trên Chrome, Edge hoặc bất kỳ trình duyệt web nào.

---

## 🛠️ Cấu Trúc Mã Nguồn

```
anticoag-interaction-bot/
├── index.html            # Giao diện Web App chuẩn Y khoa (Tailwind CSS, Icons)
├── app.js                # Bộ điều khiển trung tâm, NLP Entity Extractor & AI
├── data/
│   └── anticoag_kb.js    # Cơ sở dữ liệu tương tác dược lý chuẩn hóa
├── server.py             # Backend FastAPI phục vụ REST API & kết nối HIS/EMR
├── bot_telegram.py       # Tích hợp Bot chat Telegram trên điện thoại
├── requirements.txt      # Thư viện phụ thuộc cho Python Backend
└── README.md             # Tài liệu hướng dẫn dự án
```

---

## 🏥 Triển Khai Backend & Tích Hợp (Tùy chọn)

Nếu bạn muốn chạy server backend hoặc tích hợp vào hệ thống phòng khám / bệnh viện:

### 1. Khởi chạy FastAPI Server
```bash
pip install -r requirements.txt
python server.py
```
Truy cập: `http://localhost:8000`

### 2. Triển khai Telegram Bot
1. Tạo Bot mới qua `@BotFather` trên Telegram để lấy API Token.
2. Dán token vào biến `TELEGRAM_BOT_TOKEN` trong tệp `bot_telegram.py`.
3. Chạy lệnh:
   ```bash
   python bot_telegram.py
   ```

---

## ⚖️ Tuyên Bố Miễn Trừ Trách Nhiệm Y Tế (Medical Disclaimer)

*HemoGuard AI là công cụ hỗ trợ thông tin y dược học lâm sàng. Mọi quyết định thay đổi liều, ngưng thuốc hoặc chỉ định phối hợp thuốc phải luôn được thông qua sự thăm khám và quyết định của Bác sĩ chuyên khoa Tim mạch hoặc Dược sĩ phụ trách điều trị.*
