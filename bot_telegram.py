"""
HemoGuard AI - Telegram Bot Tra Cứu Tương Tác Thuốc Chống Đông
Cho phép bác sĩ, dược sĩ và bệnh nhân tra cứu ngay trên điện thoại di động qua Telegram.

Cài đặt:
pip install python-telegram-bot
Chạy:
python bot_telegram.py
"""

import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Điền Token nhận được từ @BotFather trên Telegram
TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_HERE"

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_msg = (
        "👋 *Chào mừng bạn đến với HemoGuard AI - Bot Tra Cứu Tương Tác Thuốc Chống Đông!*\n\n"
        "🏥 Bot hỗ trợ tra cứu tương tác giữa:\n"
        "• *Thuốc chống đông:* Warfarin, Sintrom, Xarelto, Eliquis, Pradaxa, Lovenox\n"
        "• *Thuốc phối hợp:* Giảm đau NSAIDs, Kháng sinh, Kháng nấm Azole, Thuốc tim mạch, Thảo dược (Bạch quả, Nhân sâm, Rau xanh...)\n\n"
        "💬 *Ví dụ câu hỏi bạn có thể gõ ngay:*\n"
        "👉 `Sintrom uống chung với Voltaren được không?`\n"
        "👉 `Xarelto có tương tác với Fluconazole không?`\n"
        "👉 `Uống Warfarin cần lưu ý gì khi ăn rau bina và bưởi?`\n"
        "👉 `/redflags` : Xem 7 dấu hiệu xuất huyết cấp cứu"
    )
    await update.message.reply_text(welcome_msg, parse_mode='Markdown')

async def redflags(update: Update, context: ContextTypes.DEFAULT_TYPE):
    flags = (
        "🚨 *7 DẤU HIỆU CẢNH BÁO BỆNH NHÂN CẦN ĐI CẤP CỨU NGAY:*\n\n"
        "1. Nôn ra máu hoặc chất nôn màu đen như bã cà phê.\n"
        "2. Đi cầu phân đen nhánh như nhựa đường, có mùi khẳm.\n"
        "3. Tiểu tiện ra nước tiểu màu đỏ hoặc hồng.\n"
        "4. Bầm tím tự phát lan rộng bất thường dưới da.\n"
        "5. Chảy máu mũi, chảy máu chân răng > 15 phút không cầm.\n"
        "6. Đau đầu dữ dội, yếu liệt nửa người, méo miệng (nguy cơ xuất huyết não).\n"
        "7. Vết thương hở chảy máu liên tục không thể tự cầm."
    )
    await update.message.reply_text(flags, parse_mode='Markdown')

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.lower()
    
    # Phản xạ lâm sàng thông minh
    if "sintrom" in text and ("voltaren" in text or "meloxicam" in text or "nsaid" in text or "giam dau" in text):
        reply = (
            "⚠️ *CẢNH BÁO NGUY CƠ CAO (MAJOR)*\n\n"
            "💊 *Cặp tương tác:* Sintrom (Acenocoumarol) + Kháng viêm NSAID\n"
            "🔬 *Cơ chế:* NSAID ức chế ngưng tập tiểu cầu và làm tổn thương niêm mạc dạ dày, đồng thời một số NSAID ức chế CYP2C9 làm nồng độ Sintrom tăng vọt.\n"
            "🩸 *Hậu quả:* Tăng nguy cơ xuất huyết tiêu hóa lên gấp 4 - 6 lần!\n"
            "💡 *Khuyến cáo:* TRÁNH DÙNG CHUNG. Ưu tiên giảm đau bằng *Paracetamol (<= 2g/ngày)*. Nếu bắt buộc dùng NSAID, phải dùng liều thấp ngắn ngày kèm thuốc ức chế bơm proton (PPI: Nexium, Pantoprazole)."
        )
    elif "xarelto" in text and ("fluconazole" in text or "ketoconazole" in text or "khang nam" in text):
        reply = (
            "⛔ *CHỐNG CHỈ ĐỊNH / NGUY CƠ CỰC CAO*\n\n"
            "💊 *Cặp tương tác:* Xarelto (Rivaroxaban) + Kháng nấm Azole toàn thân\n"
            "🔬 *Cơ chế:* Ketoconazole/Itraconazole ức chế cực mạnh đồng thời cả CYP3A4 và bơm P-glycoprotein, làm tăng nồng độ Xarelto lên gấp 2.5 lần!\n"
            "🩸 *Hậu quả:* Xuất huyết nghiêm trọng, nguy hiểm tính mạng.\n"
            "💡 *Khuyến cáo:* Chống chỉ định dùng đường toàn thân. Bác sĩ nên chọn nhóm kháng nấm khác không ức chế CYP3A4/P-gp hoặc chuyển phác đồ chống đông."
        )
    elif "rau" in text or "thuc an" in text or "vitamin k" in text:
        reply = (
            "🥦 *HƯỚNG DẪN ĂN RAU XANH VÀ VITAMIN K:*\n\n"
            "• *Với Warfarin / Sintrom:* KHÔNG CẦN KIÊNG HẲN, nhưng BẮT BUỘC phải ăn lượng đều đặn mỗi tuần. Tránh thay đổi chế độ ăn đột ngột.\n"
            "• *Với DOACs (Xarelto, Eliquis, Pradaxa):* Thuốc không phụ thuộc Vitamin K, bệnh nhân HOÀN TOÀN CÓ THỂ ăn rau xanh thoải mái bình thường!"
        )
    else:
        reply = (
            f"ℹ️ Bạn đang hỏi: \"{update.message.text}\"\n\n"
            "Để hỗ trợ chuẩn xác nhất, bạn vui lòng nêu rõ tên thuốc chống đông (ví dụ: Sintrom, Xarelto, Eliquis, Pradaxa...) và tên thuốc phối hợp cần kiểm tra nhé!"
        )

    await update.message.reply_text(reply, parse_mode='Markdown')

if __name__ == '__main__':
    if TELEGRAM_BOT_TOKEN == "YOUR_TELEGRAM_BOT_TOKEN_HERE":
        print("⚠️ Vui lòng cấu hình TELEGRAM_BOT_TOKEN trước khi chạy bot.")
    else:
        app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
        app.add_handler(CommandHandler("start", start))
        app.add_handler(CommandHandler("redflags", redflags))
        app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
        print("🤖 Bot Telegram đang hoạt động...")
        app.run_polling()
