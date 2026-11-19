"""
HemoGuard AI - Anticoagulant Interaction API Server
Xây dựng trên nền tảng FastAPI phục vụ tích hợp hệ thống Bệnh án điện tử (EMR/HIS) và Chatbot.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import json
import os

app = FastAPI(
    title="HemoGuard AI - Anticoagulant Interaction API",
    description="REST API chuyên sâu tra cứu tương tác thuốc chống đông (Warfarin, Sintrom, DOACs, LMWH)",
    version="1.0.0"
)

# Kích hoạt CORS cho phép frontend gọi từ mọi nguồn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ComboCheckRequest(BaseModel):
    anticoagulant_id: str
    interacting_drug_ids: List[str]

class ChatMessageRequest(BaseModel):
    message: str
    gemini_api_key: Optional[str] = None

# Đường dẫn static file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "HemoGuard AI", "service": "Pharmacology Engine"}

@app.post("/api/chat")
async def chat_endpoint(req: ChatMessageRequest):
    """
    Endpoint xử lý câu hỏi đàm thoại tự nhiên về thuốc chống đông.
    """
    query = req.message.lower()
    
    # Logic phản hồi tóm lược y khoa
    if "sintrom" in query and ("voltaren" in query or "meloxicam" in query or "nsaid" in query or "giam dau" in query):
        return {
            "severity": "major",
            "title": "Cảnh báo nguy cơ cao: Sintrom + NSAID",
            "reply": "Sự kết hợp giữa Sintrom (Acenocoumarol) và NSAID (Voltaren, Meloxicam, Ibuprofen) làm tăng nguy cơ xuất huyết tiêu hóa lên gấp 4-6 lần do ức chế kết tập tiểu cầu và trợt loét dạ dày. Khuyến cáo đổi sang Paracetamol liều <= 2g/ngày."
        }
    elif "xarelto" in query and ("fluconazole" in query or "ketoconazole" in query):
        return {
            "severity": "contraindicated",
            "title": "Chống chỉ định: Xarelto + Kháng nấm Azole",
            "reply": "Kháng nấm Azole (Ketoconazole, Itraconazole) ức chế mạnh CYP3A4 và P-gp, làm nồng độ Rivaroxaban tăng vọt > 2.5 lần gây nguy cơ xuất huyết đe dọa tính mạng. Tránh dùng chung đường toàn thân."
        }
    
    return {
        "severity": "info",
        "reply": f"Hệ thống đã nhận câu hỏi: '{req.message}'. Hãy sử dụng giao diện web HemoGuard AI để xem phân tích chi tiết đầy đủ."
    }

# Mount thư mục tĩnh để truy cập web trực tiếp qua http://localhost:8000
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Khởi chạy HemoGuard AI Server tại: http://localhost:8000")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
