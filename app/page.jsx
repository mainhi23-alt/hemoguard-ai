'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Pill,
  Heart,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Search,
  Send,
  Copy,
  Check,
  FileText,
  RotateCcw,
  Info,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  ChevronDown,
  BookOpen,
  X
} from 'lucide-react';

const COMMON_ANTICOAGULANTS = [
  'Warfarin (Coumadin)',
  'Acenocoumarol (Sintrom)',
  'Rivaroxaban (Xarelto)',
  'Apixaban (Eliquis)',
  'Dabigatran (Pradaxa)',
  'Edoxaban (Lixiana)',
  'Enoxaparin (Lovenox)',
  'Heparin',
];

const PRESET_PAIRS = [
  { ac: 'Warfarin', drug: 'Aspirin', tag: 'Xuất huyết dạ dày' },
  { ac: 'Rivaroxaban', drug: 'Ketoconazole', tag: 'Chống chỉ định' },
  { ac: 'Warfarin', drug: 'Rau cải bó xôi', tag: 'Tụt INR - Mất hiệu lực' },
  { ac: 'Dabigatran', drug: 'Verapamil', tag: 'Tăng hấp thu P-gp' },
  { ac: 'Sintrom', drug: 'Amiodarone', tag: 'Tăng INR mất kiểm soát' },
  { ac: 'Rivaroxaban', drug: 'Ibuprofen', tag: 'Nguy cơ xuất huyết cao' },
];

export default function AnticoagChatApp() {
  const [selectedAC, setSelectedAC] = useState('');
  const [companionDrug, setCompanionDrug] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTabModal, setActiveTabModal] = useState(null); // 'renal' | 'antidote' | 'redflags' | null

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Xin chào Bác sĩ / Dược sĩ / Quý bệnh nhân!
Tôi là **Trợ lý AI Dược Lâm Sàng** chuyên sâu về Huyết học & Tim mạch, được nạp trực tiếp cơ sở dữ liệu từ tệp **\`du-lieu-tuong-tac-thuoc-chong-dong.md\`**.

Hệ thống hỗ trợ tra cứu tương tác giữa thuốc chống đông (*Warfarin, Sintrom, Xarelto, Eliquis, Pradaxa, Heparin...*) và các thuốc/thực phẩm khác theo chuẩn **5 mục dược lý lâm sàng bắt buộc**:
1. 🔴 **Mức độ tương tác** *(Chống chỉ định / Nguy cơ cao / Thận trọng / An toàn)*
2. 🧬 **Cơ chế tương tác** *(Dược động học qua CYP3A4, CYP2C9, P-gp hoặc Dược lực học)*
3. ⚠️ **Hậu quả lâm sàng** *(Tăng nguy cơ xuất huyết, biến động INR, tắc mạch...)*
4. 💊 **Hướng xử trí & Theo dõi** *(Thuốc thay thế, chỉnh liều, bảo vệ dạ dày, xét nghiệm)*
5. ⚖️ **Lưu ý miễn trừ trách nhiệm y khoa**

Bạn có thể sử dụng **Thanh tra cứu 2 ô** bên dưới hoặc **đặt câu hỏi tự do** bất kỳ lúc nào!`,
      source: 'system_welcome',
    },
  ]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customAC, customDrug, customMessage) => {
    const acToSend = customAC !== undefined ? customAC : selectedAC;
    const drugToSend = customDrug !== undefined ? customDrug : companionDrug;
    const msgToSend = customMessage !== undefined ? customMessage : chatInput;

    if (!acToSend && !drugToSend && !msgToSend.trim()) return;

    // Tạo nội dung tin nhắn của người dùng
    let userPromptDisplay = '';
    if (acToSend && drugToSend) {
      userPromptDisplay = `Tra cứu tương tác cặp thuốc: **${acToSend}** + **${drugToSend}**`;
      if (msgToSend && msgToSend !== `Kiểm tra tương tác giữa ${acToSend} và ${drugToSend}`) {
        userPromptDisplay += `\n*Ghi chú thêm: ${msgToSend}*`;
      }
    } else {
      userPromptDisplay = msgToSend || `Tra cứu: ${acToSend || drugToSend}`;
    }

    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userPromptDisplay,
      ac: acToSend,
      drug: drugToSend,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setChatInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anticoagulant: acToSend,
          companionDrug: drugToSend,
          message: msgToSend || `Kiểm tra tương tác giữa ${acToSend} và ${drugToSend}`,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi kết nối máy chủ');
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        source: data.source || 'gemini',
        model: data.model || 'Gemini Flash',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ **Đã xảy ra lỗi:** ${err.message}. Vui lòng thử lại hoặc kiểm tra biến môi trường \`GEMINI_API_KEY\` trong tệp \`.env\`.`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPair = (pair) => {
    setSelectedAC(pair.ac);
    setCompanionDrug(pair.drug);
    handleSend(pair.ac, pair.drug, `Kiểm tra tương tác giữa ${pair.ac} và ${pair.drug}`);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện hiện tại?')) {
      setMessages([messages[0]]);
      setSelectedAC('');
      setCompanionDrug('');
      setChatInput('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* HEADER Y KHOA CHUYÊN NGHIỆP */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-sky-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-700 to-blue-900 bg-clip-text text-transparent">
                  HemoGuard AI
                </h1>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Dược Lâm Sàng v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống Tra cứu & Phân tích Tương tác Thuốc Chống Đông Máu
              </p>
            </div>
          </div>

          {/* Quick Handbook Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={() => setActiveTabModal('renal')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 transition flex items-center space-x-1"
              title="Chỉnh liều theo chức năng thận"
            >
              <Activity className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden md:inline">Chức năng thận (CrCl)</span>
            </button>
            <button
              onClick={() => setActiveTabModal('antidote')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-sky-200 text-sky-700 hover:bg-sky-50 transition flex items-center space-x-1"
              title="Danh mục thuốc giải độc đặc hiệu"
            >
              <Pill className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">Thuốc giải độc (Antidotes)</span>
            </button>
            <button
              onClick={() => setActiveTabModal('redflags')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center space-x-1"
              title="7 dấu hiệu cảnh báo đỏ xuất huyết"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline">Cảnh báo đỏ</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">
        
        {/* BANNER THÔNG TIN TRI THỨC */}
        <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-100 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-sky-100/80 rounded-xl text-sky-700 mt-0.5 sm:mt-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                Cơ sở Tri thức Chuẩn Y khoa Độc lập
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Được tích hợp trực tiếp từ <code className="text-sky-700 font-mono bg-sky-100/60 px-1 py-0.5 rounded">du-lieu-tuong-tac-thuoc-chong-dong.md</code>. Tuân thủ chuẩn Dược thư Quốc gia VN, ESC, EHRA và US-FDA.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Server Gemini API Bảo Mật</span>
          </div>
        </div>

        {/* THANH TRA CỨU NHANH 2 Ô */}
        <section className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Thanh Tra Cứu Nhanh Cặp Thuốc & Thực Phẩm
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Chọn hoặc nhập trực tiếp</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            {/* Ô 1: Tên thuốc chống đông */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                1. Tên thuốc chống đông
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="anticoagulant-options"
                  value={selectedAC}
                  onChange={(e) => setSelectedAC(e.target.value)}
                  placeholder="VD: Warfarin, Xarelto, Eliquis..."
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition bg-slate-50/50 hover:bg-white"
                />
                <Pill className="w-4 h-4 text-sky-500 absolute left-3 top-3 pointer-events-none" />
              </div>
              <datalist id="anticoagulant-options">
                {COMMON_ANTICOAGULANTS.map((ac) => (
                  <option key={ac} value={ac} />
                ))}
              </datalist>
            </div>

            {/* Ô 2: Thuốc hoặc Thực phẩm dùng kèm */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                2. Thuốc / Thực phẩm dùng kèm
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companionDrug}
                  onChange={(e) => setCompanionDrug(e.target.value)}
                  placeholder="VD: Aspirin, Ibuprofen, Ketoconazole, Cải bó xôi..."
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition bg-slate-50/50 hover:bg-white"
                />
                <Heart className="w-4 h-4 text-rose-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Nút Kiểm tra tương tác */}
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading || (!selectedAC && !companionDrug)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-medium text-sm shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-1.5"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kiểm tra ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* GỢI Ý CÁC CẶP THUỐC PHỔ BIẾN */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-500" /> Cặp thuốc điển hình:
            </span>
            {PRESET_PAIRS.map((pair, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPair(pair)}
                className="text-xs bg-slate-100 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5"
              >
                <span className="font-semibold">{pair.ac} + {pair.drug}</span>
                <span className="text-[10px] px-1 py-0.2 bg-white rounded text-slate-500 border border-slate-200">
                  {pair.tag}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* KHUNG CHAT VÀ PHÂN TÍCH TƯƠNG TÁC LÂM SÀNG */}
        <section className="bg-white border border-sky-100 rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden min-h-[500px]">
          {/* Chat Window Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-800">
                Phòng Tư Vấn Dược Lâm Sàng Trực Tuyến
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearChat}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-slate-200/60 transition"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} group`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-sm ${
                      isAssistant
                        ? 'bg-white border border-sky-100 text-slate-800 w-full'
                        : 'bg-gradient-to-tr from-sky-600 to-blue-700 text-white'
                    }`}
                  >
                    {/* Assistant Message Header */}
                    {isAssistant && (
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                            Rx
                          </div>
                          <span className="text-xs font-bold text-sky-900">
                            Dược Sĩ Lâm Sàng AI
                          </span>
                          {msg.model && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              {msg.model}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(msg.content, index)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded transition"
                          title="Sao chép câu trả lời"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Markdown Body */}
                    <div className={`prose prose-sm max-w-none ${isAssistant ? 'prose-slate' : 'prose-invert'} text-sm leading-relaxed`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h3: ({ node, ...props }) => {
                            const text = String(props.children);
                            let colorClasses = 'text-sky-800 border-l-4 border-sky-600 pl-2.5 my-2.5 font-bold text-sm';
                            if (text.includes('1. Mức độ')) {
                              colorClasses = 'text-rose-800 border-l-4 border-rose-600 pl-2.5 my-2.5 font-bold text-sm bg-rose-50/50 py-1 rounded-r';
                            } else if (text.includes('2. Cơ chế')) {
                              colorClasses = 'text-blue-800 border-l-4 border-blue-600 pl-2.5 my-2.5 font-bold text-sm bg-blue-50/50 py-1 rounded-r';
                            } else if (text.includes('3. Hậu quả')) {
                              colorClasses = 'text-amber-800 border-l-4 border-amber-600 pl-2.5 my-2.5 font-bold text-sm bg-amber-50/50 py-1 rounded-r';
                            } else if (text.includes('4. Hướng xử trí')) {
                              colorClasses = 'text-emerald-800 border-l-4 border-emerald-600 pl-2.5 my-2.5 font-bold text-sm bg-emerald-50/50 py-1 rounded-r';
                            } else if (text.includes('5. Lưu ý')) {
                              colorClasses = 'text-slate-700 border-l-4 border-slate-400 pl-2.5 my-2.5 font-bold text-sm bg-slate-100/60 py-1 rounded-r text-xs';
                            }
                            return <h3 className={colorClasses} {...props} />;
                          },
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3 rounded-lg border border-slate-200">
                              <table className="min-w-full divide-y divide-slate-200 text-xs" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="bg-sky-50 px-3 py-2 text-left font-semibold text-sky-900 border-b border-slate-200" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3 py-2 border-b border-slate-100" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm flex items-center space-x-3 text-slate-500 text-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs">Dược sĩ AI đang tra cứu tệp dữ liệu y khoa và đối chiếu tương tác...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-500">
            <span className="whitespace-nowrap font-medium text-slate-600">Câu hỏi gợi ý:</span>
            <button
              onClick={() => handleSend('', '', 'Bệnh nhân suy thận CrCl 25 ml/phút dùng Xarelto liều nào?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded-lg transition"
            >
              Suy thận CrCl 25ml/p dùng Xarelto thế nào?
            </button>
            <button
              onClick={() => handleSend('', '', 'Uống Pradaxa có được mở viên nhai không?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded-lg transition"
            >
              Uống Pradaxa có được bẻ/mở nang không?
            </button>
            <button
              onClick={() => handleSend('', '', 'Bệnh nhân uống Eliquis có cần kiêng rau muống hay súp lơ không?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded-lg transition"
            >
              Uống Eliquis có cần kiêng rau xanh không?
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập câu hỏi tự do về tương tác thuốc, điều chỉnh liều, xét nghiệm..."
                className="flex-1 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition bg-slate-50/50 hover:bg-white"
              />
              <button
                type="submit"
                disabled={isLoading || !chatInput.trim()}
                className="p-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-sky-600/20 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            HemoGuard AI © 2026 - Phát triển cho mục đích Hỗ trợ Quyết định Dược lâm sàng (CDSS).
          </span>
          <span className="text-slate-400">
            Nguồn dữ liệu: <code>du-lieu-tuong-tac-thuoc-chong-dong.md</code>
          </span>
        </div>
      </footer>

      {/* MODAL CẨM NANG Y KHOA NHANH */}
      {activeTabModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2">
                {activeTabModal === 'renal' && <Activity className="w-5 h-5 text-sky-600" />}
                {activeTabModal === 'antidote' && <Pill className="w-5 h-5 text-indigo-600" />}
                {activeTabModal === 'redflags' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                <h3 className="font-bold text-slate-800 text-base">
                  {activeTabModal === 'renal' && 'Hiệu Chỉnh Liều DOACs Theo Chức Năng Thận (CrCl)'}
                  {activeTabModal === 'antidote' && 'Danh Mục Thuốc Giải Độc Đặc Hiệu (Antidotes)'}
                  {activeTabModal === 'redflags' && '7 Dấu Hiệu Cảnh Báo Đỏ Xuất Huyết Cấp Cứu'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTabModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
              {activeTabModal === 'renal' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Bảng tóm tắt chỉ định và liều dùng DOACs theo độ thanh thải Creatinine (CrCl tính theo công thức Cockcroft-Gault):
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-sky-50 text-sky-900 font-semibold">
                        <tr>
                          <th className="px-3 py-2 text-left">DOAC</th>
                          <th className="px-3 py-2 text-left">Đào thải thận</th>
                          <th className="px-3 py-2 text-left">CrCl 30 - 49 ml/phút</th>
                          <th className="px-3 py-2 text-left">CrCl 15 - 29 ml/phút</th>
                          <th className="px-3 py-2 text-left">CrCl &lt; 15 ml/phút</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-slate-800">Rivaroxaban (Xarelto)</td>
                          <td className="px-3 py-2.5">~33%</td>
                          <td className="px-3 py-2.5 text-amber-700 font-semibold">15 mg x 1 lần/ngày</td>
                          <td className="px-3 py-2.5 text-amber-700">15 mg x 1 lần/ngày (Thận trọng)</td>
                          <td className="px-3 py-2.5 text-red-600 font-bold">Chống chỉ định</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-slate-800">Apixaban (Eliquis)</td>
                          <td className="px-3 py-2.5">~27%</td>
                          <td className="px-3 py-2.5">5 mg x 2 lần (hoặc 2.5mg nếu đủ 2 tiêu chí)</td>
                          <td className="px-3 py-2.5 text-amber-700 font-semibold">2.5 mg x 2 lần/ngày</td>
                          <td className="px-3 py-2.5 text-slate-500">Thận trọng cao độ</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2.5 font-bold text-slate-800">Dabigatran (Pradaxa)</td>
                          <td className="px-3 py-2.5 font-bold text-red-600">80%</td>
                          <td className="px-3 py-2.5 text-amber-700">Cân nhắc giảm 110 mg x 2 lần</td>
                          <td className="px-3 py-2.5 text-red-600 font-bold">Chống chỉ định tuyệt đối</td>
                          <td className="px-3 py-2.5 text-red-600 font-bold">Chống chỉ định tuyệt đối</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTabModal === 'antidote' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50">
                    <h4 className="font-bold text-sky-900 text-sm">1. Dabigatran (Pradaxa) ➜ Idarucizumab (Praxbind)</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Kháng thể đơn dòng Fab nhân hóa gắn kết Dabigatran với ái lực mạnh gấp 350 lần Thrombin. Liều chuẩn: <strong>5g tiêm tĩnh mạch</strong> (2 lọ 2.5g/50mL tiêm liên tiếp). Đảo ngược tác dụng chỉ sau vài phút.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50">
                    <h4 className="font-bold text-sky-900 text-sm">2. Rivaroxaban / Apixaban ➜ Andexanet alfa (Andexxa)</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Mồi nhử tái tổ hợp của yếu tố Xa. Nếu không sẵn có: Dùng phức hợp Prothrombin cô đặc 4 yếu tố (PCC) liều 25 - 50 UI/kg.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50">
                    <h4 className="font-bold text-sky-900 text-sm">3. Warfarin / Sintrom ➜ Vitamin K1 + PCC / FFP</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Vitamin K1 (Phytomenadione) 5 - 10mg tiêm tĩnh mạch chậm, phối hợp PCC 4 yếu tố hoặc huyết tương tươi đông lạnh khi có xuất huyết đe dọa tính mạng.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-sky-100 bg-sky-50/50">
                    <h4 className="font-bold text-sky-900 text-sm">4. Heparin / Enoxaparin ➜ Protamine Sulfate</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      1mg Protamine trung hòa khoảng 100 UI Heparin. Với Enoxaparin: Trung hòa khoảng 60 - 75% hoạt tính Anti-Xa.
                    </p>
                  </div>
                </div>
              )}

              {activeTabModal === 'redflags' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-red-600 font-semibold">
                    Khi bệnh nhân đang dùng bất kỳ thuốc chống đông nào có một trong các dấu hiệu sau, cần đưa đến cơ sở y tế cấp cứu ngay lập tức:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">1.</span>
                      <span><strong>Nôn ra máu tươi</strong> hoặc chất nôn màu nâu đen giống bã cà phê.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">2.</span>
                      <span><strong>Đi ngoài phân đen nhánh như nhựa đường</strong> hoặc phân lẫn máu tươi.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">3.</span>
                      <span><strong>Tiểu ra máu</strong> (nước tiểu màu đỏ tươi, hồng hoặc màu nước vối sẫm).</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">4.</span>
                      <span><strong>Bầm tím tự phát lan rộng</strong> bất thường ở nhiều nơi mà không va đập.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">5.</span>
                      <span><strong>Chảy máu cam hoặc chân răng</strong> kéo dài trên 10 - 15 phút không tự cầm được.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">6.</span>
                      <span><strong>Đau đầu dữ dội đột ngột</strong>, chóng mặt, ngất xỉu hoặc yếu liệt nửa người (*cảnh báo xuất huyết não*).</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 font-bold">7.</span>
                      <span><strong>Kinh nguyệt ra ồ ạt</strong> hoặc xuất huyết âm đạo bất thường kéo dài.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTabModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
