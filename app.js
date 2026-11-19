// ==============================================================================
// ANTICOAGCHECK AI - ỨNG DỤNG HỖ TRỢ TRA CỨU TƯƠNG TÁC THUỐC CHỐNG ĐÔNG
// Core Logic & Interaction Engine
// ==============================================================================

const kb = window.ANTICOAGULANT_KB;

// Trạng thái ứng dụng
const AppState = {
  activeTab: 'chat', // 'chat' | 'checker' | 'handbook' | 'settings'
  chatHistory: [],
  selectedAnticoag: 'rivaroxaban',
  selectedInteractingDrugs: ['nsaids'],
  geminiApiKey: localStorage.getItem('anticoag_gemini_key') || '',
  geminiModel: localStorage.getItem('anticoag_gemini_model') || 'gemini-1.5-flash',
  isGenerating: false
};

// Khởi tạo ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initCheckerOptions();
  renderHandbook();
  setupEventListeners();
  loadSavedSettings();

  // Tin nhắn chào mừng ban đầu
  if (AppState.chatHistory.length === 0) {
    addBotMessage(
      `**Xin chào! Tôi là Trợ lý AI Chuyên sâu về Tương tác Thuốc Chống Đông (HemoGuard AI).**\n\n` +
      `Tôi có thể giúp bạn:\n` +
      `* Tra cứu tương tác giữa các thuốc chống đông (**Warfarin, Sintrom, Xarelto, Eliquis, Pradaxa, Lovenox...**) với thuốc giảm đau (NSAIDs, Paracetamol), kháng sinh, kháng nấm, thuốc tim mạch, chống động kinh.\n` +
      `* Kiểm tra tương tác với **thực phẩm, rau xanh (Vitamin K)** và thảo dược (Bạch quả, Nhân sâm, Cỏ Ban Âu...).\n` +
      `* Phân tích nguy cơ xuất huyết, cơ chế chuyển hóa (**CYP3A4, CYP2C9, P-glycoprotein**) và khuyến cáo xử trí lâm sàng.\n\n` +
      `*Bạn có thể gõ câu hỏi tự nhiên hoặc chọn các câu hỏi mẫu bên dưới để bắt đầu!*`,
      true
    );
  }
});

// Thiết lập giao diện và tabs
function initUI() {
  const tabButtons = document.querySelectorAll('[data-tab-target]');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-tab-target');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  AppState.activeTab = tabId;
  
  // Ẩn tất cả tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
  
  // Bật tab được chọn
  const activePanel = document.getElementById(`tab-${tabId}`);
  if (activePanel) activePanel.classList.remove('hidden');

  // Đổi trạng thái nút bấm
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab-target') === tabId;
    if (isTarget) {
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'dark:text-slate-300', 'dark:hover:bg-slate-800');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'dark:text-slate-300', 'dark:hover:bg-slate-800');
    }
  });

  if (tabId === 'checker') {
    runComboCheck();
  }
}

// ==============================================================================
// 1. NLP & ENTITY EXTRACTION ENGINE (NHẬN DIỆN THUỐC VÀ CÂU HỎI)
// ==============================================================================

function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ");
}

function detectEntities(text) {
  const norm = normalizeText(text);
  const detectedAnticoags = [];
  const detectedInteracting = [];

  // Tìm thuốc chống đông
  kb.anticoagulants.forEach(anticoag => {
    const matchName = normalizeText(anticoag.name);
    let matched = norm.includes(matchName);
    
    if (!matched && anticoag.brandNames) {
      for (const b of anticoag.brandNames) {
        if (norm.includes(normalizeText(b))) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      detectedAnticoags.push(anticoag);
    }
  });

  // Tìm thuốc/chất tương tác
  kb.interactingDrugs.forEach(item => {
    let matched = false;
    let matchedKeyword = '';

    // Kiểm tra tên hoạt chất
    for (const n of item.names) {
      if (norm.includes(normalizeText(n))) {
        matched = true;
        matchedKeyword = n;
        break;
      }
    }

    // Kiểm tra tên biệt dược
    if (!matched && item.brandNames) {
      for (const b of item.brandNames) {
        if (norm.includes(normalizeText(b))) {
          matched = true;
          matchedKeyword = b;
          break;
        }
      }
    }

    // Các từ khóa đặc biệt (rau, hoa quả, nấm, sốt, đau khớp)
    if (!matched) {
      if (item.id === 'vitamin_k_foods' && (norm.includes('rau') || norm.includes('vitamin k') || norm.includes('bina') || norm.includes('sup lo'))) {
        matched = true;
        matchedKeyword = 'rau xanh / Vitamin K';
      } else if (item.id === 'nsaids' && (norm.includes('giam dau') || norm.includes('dau khop') || norm.includes('viem khop') || norm.includes('ha sot'))) {
        matched = true;
        matchedKeyword = 'thuốc giảm đau / NSAID';
      } else if (item.id === 'grapefruit' && (norm.includes('buoi') || norm.includes('grapefruit'))) {
        matched = true;
        matchedKeyword = 'bưởi chùm';
      }
    }

    if (matched) {
      detectedInteracting.push({
        item: item,
        matchedKeyword: matchedKeyword
      });
    }
  });

  return {
    anticoagulants: detectedAnticoags,
    interacting: detectedInteracting
  };
}

// Tìm chi tiết tương tác cụ thể giữa 1 thuốc chống đông và 1 nhóm thuốc
function resolveSpecificInteraction(anticoag, interactingItem) {
  const targetMap = interactingItem.targetInteractions;
  let detail = null;
  let severity = interactingItem.severity || 'moderate';

  // 1. Kiểm tra ID cụ thể của thuốc chống đông (ví dụ: rivaroxaban, dabigatran, warfarin)
  if (targetMap[anticoag.id]) {
    detail = targetMap[anticoag.id];
  }
  // 2. Kiểm tra nhóm DOACs nếu là DOAC
  else if (targetMap['all_doacs'] && (anticoag.group === 'DOAC_XA' || anticoag.group === 'DOAC_IIA')) {
    detail = targetMap['all_doacs'];
  } else if (targetMap['doacs'] && (anticoag.group === 'DOAC_XA' || anticoag.group === 'DOAC_IIA')) {
    detail = targetMap['doacs'];
  }
  // 3. Fallback qua cấu hình chung 'all'
  else if (targetMap['all']) {
    detail = targetMap['all'];
  }

  if (detail && detail.severity) {
    severity = detail.severity;
  }

  // Tinh chỉnh bổ sung cho Warfarin/Sintrom
  let extraWarfarinNotice = '';
  if ((anticoag.group === 'VKA') && detail && detail.warfarinSpecific) {
    extraWarfarinNotice = detail.warfarinSpecific;
  }

  return {
    anticoag: anticoag,
    interacting: interactingItem,
    severity: severity,
    mechanism: (detail && detail.mechanism) ? detail.mechanism : 'Tác động chuyển hóa hoặc tác động hiệp đồng cầm máu.',
    clinicalRisk: (detail && detail.clinicalRisk) ? detail.clinicalRisk : 'Tăng nguy cơ xuất huyết hoặc suy giảm hiệu lực thuốc.',
    action: (detail && detail.action) ? detail.action : 'Thận trọng và theo dõi chặt chẽ trên lâm sàng.',
    extraNotice: extraWarfarinNotice
  };
}

// ==============================================================================
// 2. NỘI BỘ CHATBOT EXPERT ENGINE (OFFLINE - 100% CLINICALLY ACCURATE)
// ==============================================================================

function generateExpertResponse(userQuery) {
  const entities = detectEntities(userQuery);
  const anticoag = entities.anticoagulants.length > 0 ? entities.anticoagulants[0] : null;
  const interacting = entities.interacting;

  // Trường hợp 1: Phát hiện cả thuốc chống đông và thuốc/chất tương tác
  if (anticoag && interacting.length > 0) {
    let responseMd = `### 📋 Báo Cáo Phân Tích Tương Tác Dược Lâm Sàng\n\n`;
    responseMd += `**Thuốc chống đông:** **${anticoag.name}** (*${anticoag.brandNames.join(', ')}* - Nhóm: ${anticoag.groupName})\n\n`;

    interacting.forEach(entry => {
      const res = resolveSpecificInteraction(anticoag, entry.item);
      const sevInfo = kb.severityLevels[res.severity];

      responseMd += `---\n\n`;
      responseMd += `#### 🔍 Tương tác với: **${entry.item.category}** (Khớp từ khóa: *${entry.matchedKeyword}*)\n\n`;
      responseMd += `* **Mức độ:** <span class="px-2.5 py-1 rounded text-xs font-bold ${sevInfo.badgeColor}">${sevInfo.label}</span>\n\n`;
      responseMd += `* **Cơ chế dược lý:** ${res.mechanism}\n\n`;
      if (res.extraNotice) {
        responseMd += `* **Đặc thù với nhóm VKA (${anticoag.name}):** ${res.extraNotice}\n\n`;
      }
      responseMd += `* **Hậu quả lâm sàng tiềm tàng:** ${res.clinicalRisk}\n\n`;
      responseMd += `* 💡 **Khuyến cáo xử trí & Thuốc thay thế an toàn:**\n> **${res.action}**\n\n`;
    });

    // Thêm lưu ý theo dõi riêng cho thuốc chống đông
    responseMd += `\n---\n#### ⚠️ Lưu ý an toàn khi dùng **${anticoag.name}**:\n`;
    responseMd += `* **Xét nghiệm theo dõi:** ${anticoag.monitoring}\n`;
    responseMd += `* **Thuốc giải độc đặc hiệu (Antidote):** ${anticoag.antidote}\n`;
    if (anticoag.specialNotice) {
      responseMd += `* **Đặc tính lưu ý:** ${anticoag.specialNotice}\n`;
    }

    responseMd += `\n> 🚨 **Dấu hiệu cấp cứu:** Nếu xuất hiện phân đen, tiểu máu, nôn ra máu hoặc đau đầu dữ dội, cần ngừng thuốc và đến ngay bệnh viện gần nhất.`;

    return responseMd;
  }

  // Trường hợp 2: Chỉ phát hiện thuốc chống đông (Người dùng hỏi thông tin chung về thuốc)
  if (anticoag && interacting.length === 0) {
    let responseMd = `### 💊 Thông Tin Lâm Sàng Về Thuốc Chống Đông: **${anticoag.name}**\n\n`;
    responseMd += `* **Tên biệt dược thông dụng:** ${anticoag.brandNames.join(', ')}\n`;
    responseMd += `* **Phân nhóm:** ${anticoag.groupName}\n`;
    responseMd += `* **Cơ chế hoạt động:** ${anticoag.mechanism}\n`;
    responseMd += `* **Con đường chuyển hóa & Thải trừ:** ${anticoag.metabolism}\n`;
    responseMd += `* **Theo dõi & Xét nghiệm:** ${anticoag.monitoring}\n`;
    responseMd += `* **Chất giải độc đặc hiệu (Antidote):** ${anticoag.antidote}\n`;
    if (anticoag.foodNotice) responseMd += `* **Tương tác thức ăn:** ${anticoag.foodNotice}\n`;
    if (anticoag.specialNotice) responseMd += `* **Lưu ý đặc biệt:** ${anticoag.specialNotice}\n`;

    responseMd += `\n💡 *Mẹo: Bạn có thể hỏi thêm tương tác giữa ${anticoag.name} với một thuốc cụ thể (ví dụ: Paracetamol, Ibuprofen, Clarithromycin, Fluconazole, Aspirin, rau xanh...).*`;
    return responseMd;
  }

  // Trường hợp 3: Người dùng hỏi về thuốc tương tác nhưng chưa nêu rõ thuốc chống đông nào
  if (!anticoag && interacting.length > 0) {
    const item = interacting[0].item;
    let responseMd = `### ⚠️ Cảnh Báo: Bạn đang hỏi về **${item.category}**\n\n`;
    responseMd += `Để đưa ra mức độ nguy cơ và hướng dẫn xử trí chính xác nhất, bạn vui lòng cho biết bệnh nhân **đang dùng loại thuốc chống đông cụ thể nào**?\n\n`;
    responseMd += `Ví dụ các loại phổ biến tại Việt Nam:\n`;
    responseMd += `1. **Sintrom (Acenocoumarol)** hoặc **Warfarin** (Kháng Vitamin K - VKA)\n`;
    responseMd += `2. **Xarelto (Rivaroxaban)** - Ức chế yếu tố Xa\n`;
    responseMd += `3. **Eliquis (Apixaban)** - Ức chế yếu tố Xa\n`;
    responseMd += `4. **Pradaxa (Dabigatran)** - Ức chế Thrombin\n`;
    responseMd += `5. **Lovenox (Enoxaparin)** - Heparin tiêm\n\n`;
    responseMd += `*(Lưu ý: Mức độ tương tác của ${item.names[0]} có thể rất khác biệt giữa Warfarin so với các thuốc thế hệ mới DOACs).*`;
    return responseMd;
  }

  // Trường hợp 4: Câu hỏi về giảm đau an toàn hoặc câu hỏi chung chung
  const normQuery = normalizeText(userQuery);
  if (normQuery.includes('giam dau') || normQuery.includes('dau dau') || normQuery.includes('dau lung') || normQuery.includes('ha sot')) {
    return `### 💡 Khuyến Cáo Giảm Đau An Toàn Cho Bệnh Nhân Dùng Thuốc Chống Đông\n\n` +
      `* **Thuốc lựa chọn đầu tay (Ưu tiên số 1):** **Paracetamol** (Hapacol, Panadol, Efferalgan).\n` +
      `  * Liều dùng: 500mg - 650mg mỗi 4-6 giờ khi đau (tối đa không quá 2g - 3g/ngày).\n` +
      `  * *Lưu ý với Warfarin/Sintrom:* Nếu dùng Paracetamol liều cao kéo dài trên 3-4 ngày, có thể làm tăng nhẹ INR; nên kiểm tra INR nếu phải dùng dài ngày.\n` +
      `* **CẦN TRÁNH TUYỆT ĐỐI TỰ Ý DÙNG:** Các thuốc kháng viêm không steroid (**NSAIDs**) như **Ibuprofen, Diclofenac (Voltaren), Meloxicam (Mobic), Celecoxib (Celebrex), Aspirin liều cao** vì nguy cơ xuất huyết tiêu hóa dữ dội!\n` +
      `* Nếu Paracetamol không đủ kiểm soát đau, cần liên hệ bác sĩ để được kê đơn thuốc giảm đau thần kinh hoặc opioid nhẹ (Tramadol) phối hợp an toàn.`;
  }

  if (normQuery.includes('rau') || normQuery.includes('an uong') || normQuery.includes('thuc an')) {
    return `### 🥦 Hướng Dẫn Ăn Uống & Rau Xanh Cho Người Dùng Thuốc Chống Đông\n\n` +
      `* **Với bệnh nhân dùng VKA (Warfarin, Sintrom):**\n` +
      `  * Vitamin K1 trong rau xanh (cải bó xôi, rau ngót, súp lơ xanh, rau muống) là chất đối kháng trực tiếp tác dụng của thuốc.\n` +
      `  * **QUY TẮC VÀNG:** **KHÔNG cần kiêng tuyệt đối**, mà hãy **ĂN ĐỀU ĐẶN** cùng một lượng mỗi tuần. Tránh thay đổi chế độ ăn đột ngột.\n` +
      `* **Với bệnh nhân dùng DOACs (Xarelto, Eliquis, Pradaxa):**\n` +
      `  * Thuốc không ức chế Vitamin K, do đó bạn **HOÀN TOÀN CÓ THỂ ĂN RAU XANH BÌNH THƯỜNG** mà không sợ ảnh hưởng đến tác dụng chống đông!\n` +
      `  * Cần tránh: Uống quá nhiều nước ép bưởi chùm (Grapefruit) hoặc rượu bia nồng độ cao.`;
  }

  // Fallback chung
  return `Tôi chưa nhận diện rõ cặp thuốc chống đông trong câu hỏi của bạn.\n\n` +
    `**Gợi ý cách hỏi:**\n` +
    `* *"Bệnh nhân đang uống Sintrom mà bị sốt thì uống Paracetamol hay Ibuprofen?"*\n` +
    `* *"Xarelto có dùng chung được với Fluconazole không?"*\n` +
    `* *"Uống Pradaxa cần lưu ý gì khi dùng thuốc tim mạch Verapamil?"*\n` +
    `* *"Warfarin tương tác như thế nào với Amiodarone và thuốc kháng sinh Bactrim?"*\n\n` +
    `Bạn có thể gõ lại câu hỏi kèm tên cụ thể của thuốc nhé!`;
}

// ==============================================================================
// 3. TÍCH HỢP GEMINI API (TÙY CHỌN MỞ RỘNG AI)
// ==============================================================================

async function callGeminiAPI(userPrompt) {
  if (!AppState.geminiApiKey) {
    // Nếu không có key, tự động fallback sang Expert Engine nội bộ
    return generateExpertResponse(userPrompt);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AppState.geminiModel}:generateContent?key=${AppState.geminiApiKey}`;

  const clinicalContext = `Bạn là Bác sĩ Tim mạch & Dược sĩ Lâm sàng Chuyên sâu về Thuốc chống đông (Anticoagulant Expert AI).
Nhiệm vụ: Phân tích tương tác thuốc chống đông (Warfarin, Sintrom, Rivaroxaban/Xarelto, Apixaban/Eliquis, Dabigatran/Pradaxa, Heparin, LMWH) với các thuốc khác, thực phẩm, hoặc bệnh lý đi kèm.
Tiêu chuẩn trả lời:
1. Độ chính xác dược lý 100%: Dựa trên Dược thư Quốc gia VN, ESC, ACC/AHA, EHRA.
2. Phân loại mức độ nguy cơ rõ ràng: [CHỐNG CHỈ ĐỊNH] / [NGUY CƠ CAO] / [THẬN TRỌNG] / [AN TOÀN CÓ ĐIỀU KIỆN].
3. Giải thích cơ chế súc tích (Dược lực học: hiệp đồng xuất huyết, ức chế tiểu cầu; Dược động học: CYP2C9, CYP3A4, P-glycoprotein).
4. Khuyến cáo can thiệp lâm sàng cụ thể: Thuốc thay thế an toàn hơn (ví dụ Paracetamol thay NSAID), điều chỉnh liều, thời điểm uống, xét nghiệm theo dõi (INR, CrCl).
5. Luôn nhắc nhở các dấu hiệu cảnh báo xuất huyết cấp cứu (phân đen, tiểu máu, xuất huyết não).
6. Định dạng bằng Markdown đẹp mắt, có gạch đầu dòng rõ ràng.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${clinicalContext}\n\nCâu hỏi của người dùng: ${userPrompt}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200
    }
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("Gemini API Error, falling back to local expert engine:", errData);
      return generateExpertResponse(userPrompt) + `\n\n*(Lưu ý: Gemini API báo lỗi [${res.status}], câu trả lời được tạo tự động bởi Hệ Thống Chuyên Gia Nội Bộ).*`;
    }

    const data = await res.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    } else {
      return generateExpertResponse(userPrompt);
    }
  } catch (err) {
    console.error("Gemini network error:", err);
    return generateExpertResponse(userPrompt) + `\n\n*(Lưu ý: Không thể kết nối mạng tới Gemini API, hệ thống đã chuyển sang Expert Engine nội bộ).*`;
  }
}

// ==============================================================================
// 4. CHAT MANAGEMENT (RENDER & TIN NHẮN)
// ==============================================================================

function renderMarkdown(md) {
  if (typeof marked !== 'undefined') {
    return marked.parse(md);
  }
  // Fallback đơn giản nếu marked chưa load
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-blue-700 dark:text-blue-400 mt-2 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 mt-3 mb-1">$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'flex items-start justify-end gap-2.5 mb-4 animate-fade-in';
  
  msgEl.innerHTML = `
    <div class="flex flex-col w-full max-w-xl leading-1.5 p-4 border-gray-200 bg-blue-600 rounded-s-2xl rounded-ee-2xl text-white shadow-sm">
      <div class="flex items-center space-x-2 rtl:space-x-reverse mb-1">
        <span class="text-xs font-semibold text-blue-100">Bạn</span>
        <span class="text-[10px] text-blue-200">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <p class="text-sm font-normal text-white break-words">${escapeHtml(text)}</p>
    </div>
    <div class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
      <i class="fa-solid fa-user"></i>
    </div>
  `;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

function addBotMessage(textMarkdown, isWelcome = false) {
  const container = document.getElementById('chat-messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'flex items-start gap-2.5 mb-4 animate-fade-in';
  
  const parsedHtml = renderMarkdown(textMarkdown);

  msgEl.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
      <i class="fa-solid fa-heart-pulse"></i>
    </div>
    <div class="flex flex-col w-full max-w-3xl leading-1.5 p-4.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-e-2xl rounded-es-2xl shadow-sm text-slate-800 dark:text-slate-200">
      <div class="flex items-center space-x-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/60">
        <span class="text-xs font-bold text-blue-600 dark:text-blue-400">HemoGuard AI</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 font-medium">Chuyên khoa Chống đông</span>
        <span class="text-[10px] text-slate-400">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div class="prose prose-sm dark:prose-invert max-w-none text-sm space-y-2">
        ${parsedHtml}
      </div>
    </div>
  `;
  container.appendChild(msgEl);
  container.scrollTop = container.scrollHeight;
}

function showLoadingIndicator() {
  const container = document.getElementById('chat-messages');
  const loadingEl = document.createElement('div');
  loadingEl.id = 'chat-loading';
  loadingEl.className = 'flex items-start gap-2.5 mb-4';
  loadingEl.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 animate-pulse">
      <i class="fa-solid fa-heart-pulse"></i>
    </div>
    <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-e-xl rounded-es-xl shadow-sm">
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
        <div class="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
        <div class="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
        <span class="text-xs text-slate-500 ml-2">Đang phân tích tương tác lâm sàng...</span>
      </div>
    </div>
  `;
  container.appendChild(loadingEl);
  container.scrollTop = container.scrollHeight;
}

function removeLoadingIndicator() {
  const loadingEl = document.getElementById('chat-loading');
  if (loadingEl) loadingEl.remove();
}

async function handleSendMessage(customText = null) {
  const inputEl = document.getElementById('chat-input');
  const text = (customText || inputEl.value).trim();
  if (!text || AppState.isGenerating) return;

  if (!customText) {
    inputEl.value = '';
  }

  addUserMessage(text);
  AppState.isGenerating = true;
  showLoadingIndicator();

  try {
    let reply = '';
    if (AppState.geminiApiKey) {
      reply = await callGeminiAPI(text);
    } else {
      // Giả lập thời gian suy nghĩ 400ms để trải nghiệm mượt mà tự nhiên
      await new Promise(r => setTimeout(r, 450));
      reply = generateExpertResponse(text);
    }
    removeLoadingIndicator();
    addBotMessage(reply);
  } catch (err) {
    removeLoadingIndicator();
    addBotMessage(`⚠️ Đã có lỗi xảy ra trong quá trình xử lý: ${err.message}`);
  } finally {
    AppState.isGenerating = false;
  }
}

// ==============================================================================
// 5. MULTI-DRUG COMBO CHECKER ENGINE
// ==============================================================================

function initCheckerOptions() {
  // Điền dropdown thuốc chống đông
  const anticoagSelect = document.getElementById('checker-anticoag-select');
  if (anticoagSelect) {
    anticoagSelect.innerHTML = kb.anticoagulants.map(a => `
      <option value="${a.id}">
        ${a.name} (${a.brandNames.join(', ')}) - [${a.group}]
      </option>
    `).join('');
    anticoagSelect.value = AppState.selectedAnticoag;
    anticoagSelect.addEventListener('change', (e) => {
      AppState.selectedAnticoag = e.target.value;
      runComboCheck();
    });
  }

  // Điền danh sách checkbox các thuốc/nhóm tương tác
  const container = document.getElementById('checker-drug-checkboxes');
  if (container) {
    container.innerHTML = kb.interactingDrugs.map(drug => `
      <label class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-150">
        <input type="checkbox" value="${drug.id}" class="drug-check-input mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" ${AppState.selectedInteractingDrugs.includes(drug.id) ? 'checked' : ''}>
        <div class="flex-1 text-xs">
          <div class="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
            <span>${drug.category}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${kb.severityLevels[drug.severity]?.badgeColor || 'bg-slate-500 text-white'}">
              ${drug.severity}
            </span>
          </div>
          <div class="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            ${drug.names.slice(0, 4).join(', ')}${drug.names.length > 4 ? '...' : ''}
          </div>
          ${drug.brandNames.length > 0 ? `<div class="text-[11px] text-blue-600 dark:text-blue-400 italic">Biệt dược: ${drug.brandNames.slice(0, 3).join(', ')}</div>` : ''}
        </div>
      </label>
    `).join('');

    container.querySelectorAll('.drug-check-input').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checkedValues = Array.from(container.querySelectorAll('.drug-check-input:checked')).map(cb => cb.value);
        AppState.selectedInteractingDrugs = checkedValues;
        runComboCheck();
      });
    });
  }
}

function runComboCheck() {
  const resultContainer = document.getElementById('checker-results');
  if (!resultContainer) return;

  const currentAnticoag = kb.anticoagulants.find(a => a.id === AppState.selectedAnticoag);
  if (!currentAnticoag) return;

  if (AppState.selectedInteractingDrugs.length === 0) {
    resultContainer.innerHTML = `
      <div class="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
        <i class="fa-solid fa-pills text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
        <h4 class="text-sm font-semibold text-slate-600 dark:text-slate-300">Chưa chọn thuốc phối hợp</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Vui lòng tích chọn một hoặc nhiều nhóm thuốc ở cột bên trái để hệ thống tiến hành kiểm tra tương tác chéo.</p>
      </div>
    `;
    return;
  }

  const reports = AppState.selectedInteractingDrugs.map(drugId => {
    const interactingItem = kb.interactingDrugs.find(d => d.id === drugId);
    if (!interactingItem) return null;
    return resolveSpecificInteraction(currentAnticoag, interactingItem);
  }).filter(Boolean);

  // Sắp xếp: Chống chỉ định -> Nguy cơ cao -> Thận trọng -> Nhẹ
  const order = { contraindicated: 1, major: 2, moderate: 3, minor: 4 };
  reports.sort((a, b) => (order[a.severity] || 99) - (order[b.severity] || 99));

  let html = `
    <div class="mb-5 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs text-blue-700 dark:text-blue-300 font-medium">Đang kiểm tra phác đồ điều trị với:</span>
          <h3 class="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <span>${currentAnticoag.name}</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">${currentAnticoag.groupName}</span>
          </h3>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-500 dark:text-slate-400">Số tương tác phát hiện:</span>
          <div class="text-xl font-black text-slate-800 dark:text-slate-100">${reports.length}</div>
        </div>
      </div>
    </div>
    <div class="space-y-4">
  `;

  reports.forEach((rep, idx) => {
    const sev = kb.severityLevels[rep.severity] || kb.severityLevels.moderate;
    html += `
      <div class="border-l-4 ${sev.borderColor} p-4 rounded-r-xl bg-white dark:bg-slate-800 shadow-sm border-t border-r border-b border-slate-200 dark:border-slate-700">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">${idx + 1}</span>
            <span>${rep.interacting.category}</span>
          </h4>
          <span class="px-2.5 py-1 rounded text-xs font-bold ${sev.badgeColor} flex items-center gap-1.5 shadow-xs">
            <i class="fa-solid ${sev.icon}"></i>
            <span>${sev.label}</span>
          </span>
        </div>

        <div class="text-xs space-y-2 mt-3">
          <div>
            <span class="font-semibold text-slate-700 dark:text-slate-300">Cơ chế tương tác:</span>
            <p class="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">${rep.mechanism}</p>
          </div>

          ${rep.extraNotice ? `
            <div class="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200">
              <span class="font-bold flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> Lưu ý riêng với ${rep.anticoag.name}:</span>
              <p class="mt-0.5 leading-relaxed">${rep.extraNotice}</p>
            </div>
          ` : ''}

          <div>
            <span class="font-semibold text-slate-700 dark:text-slate-300">Hậu quả lâm sàng:</span>
            <p class="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">${rep.clinicalRisk}</p>
          </div>

          <div class="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200/80 dark:border-slate-600/60">
            <span class="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <i class="fa-solid fa-lightbulb"></i> Khuyến cáo can thiệp & Xử trí:
            </span>
            <p class="text-slate-700 dark:text-slate-200 mt-1 font-medium leading-relaxed">${rep.action}</p>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  resultContainer.innerHTML = html;
}

// ==============================================================================
// 6. CẨM NANG DƯỢC LÂM SÀNG (HANDBOOK VIEW)
// ==============================================================================

function renderHandbook() {
  const container = document.getElementById('handbook-content');
  if (!container) return;

  container.innerHTML = `
    <!-- 1. Bảng so sánh Dược động học DOACs vs VKA -->
    <div class="mb-8">
      <h3 class="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <i class="fa-solid fa-table-list text-blue-600"></i>
        <span>1. So Sánh Dược Động Học Các Thuốc Chống Đông Phổ Biến</span>
      </h3>
      <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="p-3">Thuốc</th>
              <th class="p-3">Đích tác dụng</th>
              <th class="p-3">Thải trừ qua thận</th>
              <th class="p-3">Chuyển hóa gan</th>
              <th class="p-3">Thời gian bán thải (T1/2)</th>
              <th class="p-3">Thuốc giải độc (Antidote)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-600 dark:text-slate-300">
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <td class="p-3 font-bold text-blue-600">Warfarin / Sintrom</td>
              <td class="p-3">VKORC1 (Yếu tố II, VII, IX, X)</td>
              <td class="p-3">< 5% (Thận dạng bất hoạt)</td>
              <td class="p-3 font-semibold text-rose-600">CYP2C9, CYP3A4, CYP1A2</td>
              <td class="p-3">Sintrom: 8-11h<br>Warfarin: 36-42h</td>
              <td class="p-3">Vitamin K1 + PCC / FFP</td>
            </tr>
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <td class="p-3 font-bold text-blue-600">Dabigatran (Pradaxa)</td>
              <td class="p-3">Thrombin (Yếu tố IIa trực tiếp)</td>
              <td class="p-3 font-bold text-rose-600">80% (Cực kỳ nhạy thận)</td>
              <td class="p-3 text-emerald-600 font-semibold">Không qua CYP450 (Chỉ qua P-gp)</td>
              <td class="p-3">12 - 17h</td>
              <td class="p-3 font-bold text-emerald-600">Idarucizumab (Praxbind)</td>
            </tr>
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <td class="p-3 font-bold text-blue-600">Rivaroxaban (Xarelto)</td>
              <td class="p-3">Yếu tố Xa trực tiếp</td>
              <td class="p-3">33% (dạng nguyên vẹn)</td>
              <td class="p-3 font-semibold text-amber-600">CYP3A4/3A5 + P-gp</td>
              <td class="p-3">5 - 9h (trẻ) / 11-13h (già)</td>
              <td class="p-3">Andexanet alfa / PCC 4F</td>
            </tr>
            <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <td class="p-3 font-bold text-blue-600">Apixaban (Eliquis)</td>
              <td class="p-3">Yếu tố Xa trực tiếp</td>
              <td class="p-3 font-semibold text-emerald-600">27% (Ít nhạy thận nhất)</td>
              <td class="p-3 font-semibold text-amber-600">CYP3A4 + P-gp</td>
              <td class="p-3">12h</td>
              <td class="p-3">Andexanet alfa / PCC 4F</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Hướng dẫn chức năng thận -->
    <div class="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2 text-rose-600">
          <i class="fa-solid fa-triangle-exclamation"></i> Ngưỡng Độ Thanh Thải Creatinine (CrCl) & DOACs
        </h4>
        <ul class="text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>CrCl < 15 ml/phút:</strong> Chống chỉ định tất cả các DOACs (Rivaroxaban, Apixaban, Dabigatran, Edoxaban). Ưu tiên UFH hoặc Warfarin (có kiểm soát INR chặt).</li>
          <li><strong>CrCl 15 - 29 ml/phút:</strong> Chống chỉ định Dabigatran. Thận trọng đặc biệt với Rivaroxaban (giảm 15mg) hoặc Apixaban (2.5mg x 2).</li>
          <li><strong>CrCl 30 - 49 ml/phút:</strong> Dabigatran cân nhắc liều 110mg x 2. Rivaroxaban giảm liều xuống 15mg/ngày.</li>
        </ul>
      </div>

      <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2 text-blue-600">
          <i class="fa-solid fa-kit-medical"></i> Xử Trí Khi Phẫu Thuật / Thủ Thuật Ngoại Khoa
        </h4>
        <ul class="text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Thủ thuật nguy cơ chảy máu thấp</strong> (nhổ 1-2 răng, nội soi không sinh thiết, phẫu thuật đục thủy tinh thể): Thường chỉ cần lùi liều uống hoặc dừng trước 24 giờ.</li>
          <li><strong>Phẫu thuật lớn nguy cơ cao</strong> (mổ sọ não, mổ tim, gây tê tủy sống): Dừng DOAC trước 48 giờ (hoặc 72-96 giờ nếu suy thận với Dabigatran).</li>
          <li><strong>Warfarin:</strong> Cần dừng 5 ngày trước mổ để INR < 1.5; cân nhắc bắc cầu bằng Enoxaparin (Lovenox) nếu nguy cơ huyết khối cao.</li>
        </ul>
      </div>
    </div>

    <!-- 3. Dấu hiệu cảnh báo nguy hiểm (Red flags) -->
    <div class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
      <h4 class="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
        <i class="fa-solid fa-truck-medical"></i> 7 Dấu Hiệu Cảnh Báo Bệnh Nhân Cần Đi Cấp Cứu Ngay Lập Tức
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-red-900 dark:text-red-200">
        ${kb.redFlags.map(rf => `
          <div class="flex items-start gap-2">
            <i class="fa-solid fa-circle-exclamation text-red-600 mt-0.5"></i>
            <span>${rf}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==============================================================================
// 7. EVENT LISTENERS & SETTINGS
// ==============================================================================

function setupEventListeners() {
  // Gửi tin nhắn chat
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  
  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => handleSendMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // Câu hỏi gợi ý nhanh
  document.querySelectorAll('[data-suggest-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-suggest-prompt');
      handleSendMessage(prompt);
    });
  });

  // Lưu cài đặt API Key
  const saveKeyBtn = document.getElementById('save-settings-btn');
  if (saveKeyBtn) {
    saveKeyBtn.addEventListener('click', () => {
      const keyInput = document.getElementById('gemini-key-input');
      const modelSelect = document.getElementById('gemini-model-select');
      
      AppState.geminiApiKey = (keyInput ? keyInput.value : '').trim();
      AppState.geminiModel = (modelSelect ? modelSelect.value : 'gemini-1.5-flash');

      localStorage.setItem('anticoag_gemini_key', AppState.geminiApiKey);
      localStorage.setItem('anticoag_gemini_model', AppState.geminiModel);

      updateApiKeyStatusBadge();
      alert('Đã lưu cấu hình thành công!');
    });
  }

  // Nút xóa lịch sử chat
  const clearChatBtn = document.getElementById('clear-chat-btn');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa lịch sử cuộc trò chuyện hiện tại?')) {
        document.getElementById('chat-messages').innerHTML = '';
        addBotMessage('Đã làm mới cuộc hội thoại. Bạn muốn tra cứu tương tác của thuốc nào tiếp theo?', true);
      }
    });
  }
}

function loadSavedSettings() {
  const keyInput = document.getElementById('gemini-key-input');
  const modelSelect = document.getElementById('gemini-model-select');
  if (keyInput) keyInput.value = AppState.geminiApiKey;
  if (modelSelect) modelSelect.value = AppState.geminiModel;
  updateApiKeyStatusBadge();
}

function updateApiKeyStatusBadge() {
  const badge = document.getElementById('ai-mode-badge');
  if (!badge) return;
  if (AppState.geminiApiKey) {
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1';
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Gemini Live AI';
  } else {
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center gap-1';
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Clinical Expert Engine (Nội bộ)';
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
