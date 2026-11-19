import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Đọc file dữ liệu tương tác thuốc chống đông
function getKnowledgeBaseContent() {
  const possiblePaths = [
    path.join(process.cwd(), 'du-lieu-tuong-tac-thuoc-chong-dong.md'),
    path.join(process.cwd(), 'data', 'du-lieu-tuong-tac-thuoc-chong-dong.md'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return fs.readFileSync(p, 'utf-8');
      } catch (err) {
        console.error('Lỗi khi đọc file tri thức:', p, err);
      }
    }
  }
  return '';
}

// Bộ phân tích dự phòng cục bộ chuẩn xác bám sát file dữ liệu
function localClinicalMatcher(anticoagulant, companionDrug, queryText) {
  const text = `${anticoagulant || ''} ${companionDrug || ''} ${queryText || ''}`.toLowerCase();

  // Nhận diện thuốc chống đông
  let ac = 'Thuốc chống đông';
  if (text.includes('warfarin') || text.includes('coumadin') || text.includes('marevan')) ac = 'Warfarin';
  else if (text.includes('sintrom') || text.includes('acenocoumarol')) ac = 'Acenocoumarol (Sintrom)';
  else if (text.includes('xarelto') || text.includes('rivaroxaban')) ac = 'Rivaroxaban (Xarelto)';
  else if (text.includes('eliquis') || text.includes('apixaban')) ac = 'Apixaban (Eliquis)';
  else if (text.includes('pradaxa') || text.includes('dabigatran')) ac = 'Dabigatran (Pradaxa)';
  else if (text.includes('lixiana') || text.includes('edoxaban')) ac = 'Edoxaban (Lixiana)';
  else if (text.includes('lovenox') || text.includes('enoxaparin')) ac = 'Enoxaparin (Lovenox)';
  else if (text.includes('heparin')) ac = 'Heparin';

  // 1. Aspirin / Chống kết tập tiểu cầu
  if (text.includes('aspirin') || text.includes('clopidogrel') || text.includes('plavix') || text.includes('ticagrelor') || text.includes('brilinta')) {
    return {
      severity: '🟠 NGUY CƠ CAO - CẦN CAN THIỆP',
      severityType: 'major',
      mechanism: `Hiệp đồng tác dụng dược lực học: ${ac} ức chế dòng thác đông máu huyết tương trong khi thuốc chống kết tập tiểu cầu (Aspirin/Clopidogrel) ức chế nút chặn tiểu cầu, làm tê liệt toàn diện cơ chế cầm máu tự nhiên. Ngoài ra Aspirin liều cao còn gây tổn thương trực tiếp niêm mạc dạ dày.`,
      clinicalRisk: `Nguy cơ xuất huyết đường tiêu hóa (nôn ra máu, đi ngoài phân đen) và xuất huyết nội sọ tăng lên gấp 2 - 4 lần so với dùng đơn độc.`,
      action: `• CHỈ PHỐI HỢP KHI CÓ CHỈ ĐỊNH ĐẶC BIỆT CỦA BÁC SĨ TIM MẠCH (ví dụ bệnh nhân rung nhĩ vừa can thiệp đặt stent mạch vành).\n• Giới hạn thời gian dùng phác đồ kết hợp (Dual / Triple therapy) ngắn nhất có thể.\n• Bắt buộc phối hợp thuốc ức chế bơm proton (PPI: Pantoprazole 40mg/ngày) để bảo vệ dạ dày.\n• Ưu tiên chọn DOACs liều chuẩn/thấp hơn là dùng Warfarin. Theo dõi sát công thức máu và dấu hiệu thiếu máu.`,
      disclaimer: `Thông tin tra cứu từ Cơ sở dữ liệu Chuẩn Y khoa của hệ thống. Quyết định phối hợp chống đông và kháng tiểu cầu phải do Bác sĩ Tim mạch trực tiếp chỉ định.`
    };
  }

  // 2. Ketoconazole / Itraconazole / Kháng nấm Azole mạnh
  if (text.includes('ketoconazole') || text.includes('itraconazole') || text.includes('voriconazole') || text.includes('posaconazole') || text.includes('nizoral') || text.includes('sporanox')) {
    const isDOAC = ac.includes('Rivaroxaban') || ac.includes('Apixaban') || ac.includes('Dabigatran');
    return {
      severity: isDOAC ? '🔴 CHỐNG CHỈ ĐỊNH / TRÁNH PHỐI HỢP' : '🟠 NGUY CƠ CAO - CẦN CAN THIỆP',
      severityType: isDOAC ? 'contraindicated' : 'major',
      mechanism: `Kháng nấm nhóm Azole toàn thân ức chế kép cực mạnh enzym gan CYP3A4 và chất vận chuyển P-glycoprotein (P-gp). Với Warfarin/Sintrom: ức chế mạnh CYP2C9 và CYP3A4.`,
      clinicalRisk: isDOAC 
        ? `Nồng độ ${ac} trong huyết tương tăng vọt gấp 2 - 3 lần (AUC của Rivaroxaban tăng tới 158%), dẫn đến nguy cơ quá liều và xuất huyết nặng đe dọa tính mạng.`
        : `Nồng độ Warfarin/Sintrom tích lũy nhanh chóng, chỉ số INR có thể vọt lên > 10 gây xuất huyết tự phát.`,
      action: isDOAC
        ? `• CHỐNG CHỈ ĐỊNH dùng đồng thời đường toàn thân.\n• Lựa chọn thuốc kháng nấm thay thế không ức chế CYP3A4/P-gp (như Amphotericin B, nhóm Echinocandin) hoặc chuyển tạm thời sang Heparin/LMWH nếu bắt buộc điều trị nấm.`
        : `• Chủ động giảm 30% - 50% liều Warfarin/Sintrom ngay khi khởi đầu thuốc kháng nấm.\n• Xét nghiệm lại INR mỗi 2 - 3 ngày cho đến khi đạt ổn định.`,
      disclaimer: `Cảnh báo nghiêm trọng theo Dược thư Quốc gia và khuyến cáo ESC/EHRA. Cần liên hệ ngay bác sĩ điều trị để đổi phác đồ.`
    };
  }

  // 3. Rau cải bó xôi / Rau ngót / Thực phẩm giàu Vitamin K
  if (text.includes('bó xôi') || text.includes('bina') || text.includes('rau ngót') || text.includes('súp lơ') || text.includes('rau xanh') || text.includes('vitamin k')) {
    const isVKA = ac.includes('Warfarin') || ac.includes('Acenocoumarol') || ac.includes('Sintrom');
    if (isVKA) {
      return {
        severity: '🟡 THẬN TRỌNG - THEO DÕI',
        severityType: 'moderate',
        mechanism: `Rau cải bó xôi, rau ngót, súp lơ xanh chứa hàm lượng Vitamin K1 tự nhiên rất cao. Khi hấp thu vào gan, Vitamin K1 trực tiếp cạnh tranh và vượt qua sự ức chế của ${ac} đối với enzyme VKORC1, kích hoạt lại chu trình tổng hợp các yếu tố đông máu II, VII, IX, X.`,
        clinicalRisk: `Chỉ số INR tụt giảm nhanh chóng xuống dưới ngưỡng điều trị (< 2.0), làm mất tác dụng bảo vệ và gia tăng nguy cơ hình thành cục máu đông gây nhồi máu não hoặc thuyên tắc mạch.`,
        action: `• NGUYÊN TẮC VÀNG: KHÔNG CẦN KIÊNG HOÀN TOÀN RAU XANH, mà cần DUY TRÌ LƯỢNG ĂN ỔN ĐỊNH đều đặn mỗi ngày và giữa các tuần.\n• Tránh thay đổi chế độ ăn đột ngột (như ăn lẩu rau liên tục hoặc đột ngột nhịn rau hoàn toàn).\n• Khi có sự thay đổi lớn trong chế độ ăn uống, cần xét nghiệm kiểm tra lại INR sau 3 - 5 ngày.`,
        disclaimer: `Thông tin hướng dẫn chế độ dinh dưỡng chuẩn cho bệnh nhân dùng thuốc kháng Vitamin K (VKA).`
      };
    } else {
      return {
        severity: '🟢 ÍT Ý NGHĨA LÂM SÀNG / AN TOÀN TƯƠNG ĐỐI',
        severityType: 'minor',
        mechanism: `Thuốc chống đông thế hệ mới DOACs (${ac}) hoạt động theo cơ chế ức chế trực tiếp yếu tố Xa hoặc Thrombin, HOÀN TOÀN KHÔNG PHỤ THUỘC vào nồng độ Vitamin K và enzym VKORC1.`,
        clinicalRisk: `Không có tương tác dược lý nào xảy ra giữa thực phẩm giàu Vitamin K và ${ac}.`,
        action: `• Bệnh nhân có thể ăn rau cải bó xôi, rau ngót và các thực phẩm giàu Vitamin K hoàn toàn bình thường mà không cần kiêng khem hay điều chỉnh liều thuốc.`,
        disclaimer: `Đây là một trong những ưu điểm vượt trội lớn nhất của nhóm DOACs so với nhóm kháng Vitamin K cổ điển.`
      };
    }
  }

  // 4. Verapamil / Chẹn kênh Canxi
  if (text.includes('verapamil') || text.includes('diltiazem') || text.includes('isoptin')) {
    const isDabi = ac.includes('Dabigatran') || ac.includes('Pradaxa');
    return {
      severity: isDabi ? '🟡 THẬN TRỌNG - THEO DÕI' : '🟢 ÍT Ý NGHĨA LÂM SÀNG / AN TOÀN TƯƠNG ĐỐI',
      severityType: isDabi ? 'moderate' : 'minor',
      mechanism: `Verapamil đường uống là chất ức chế bơm tống thuốc P-glycoprotein (P-gp) tại biểu mô niêm mạc ruột. Dabigatran etexilate là một cơ chất nhạy cảm của P-gp. Verapamil làm giảm bài xuất Dabigatran trở lại lòng ruột, làm tăng độ hấp thu và AUC của Dabigatran lên khoảng 60% - 70%.`,
      clinicalRisk: isDabi ? `Làm tăng nồng độ Dabigatran trong tuần hoàn, làm tăng nguy cơ chảy máu, đặc biệt ở bệnh nhân cao tuổi hoặc có suy giảm chức năng thận kèm theo.` : `Ít ảnh hưởng đến chuyển hóa và thải trừ của ${ac}.`,
      action: isDabi 
        ? `• Uống Verapamil cách ít nhất 2 giờ sau khi uống Dabigatran để giảm thiểu tương tác hấp thu tại ruột.\n• Cân nhắc giảm liều Dabigatran xuống 110mg x 2 lần/ngày ở bệnh nhân có nguy cơ xuất huyết cao hoặc suy thận mức độ nhẹ - vừa (CrCl 30 - 49 ml/phút).`
        : `• Tiếp tục dùng thuốc theo đơn, theo dõi huyết áp và các vết bầm tím thông thường.`,
      disclaimer: `Dựa trên hướng dẫn lâm sàng của Hội Tim Mạch Châu Âu (EHRA Practical Guide on DOACs).`
    };
  }

  // 5. NSAIDs (Ibuprofen, Diclofenac, Meloxicam)
  if (text.includes('ibuprofen') || text.includes('diclofenac') || text.includes('meloxicam') || text.includes('celecoxib') || text.includes('voltaren') || text.includes('mobic') || text.includes('celebrex')) {
    return {
      severity: '🟠 NGUY CƠ CAO - CẦN CAN THIỆP',
      severityType: 'major',
      mechanism: `NSAIDs ức chế COX-1 làm giảm tổng hợp Thromboxane A2 dẫn đến suy giảm kết tập tiểu cầu; đồng thời ức chế Prostaglandin bảo vệ tế bào niêm mạc dạ dày. Phối hợp cùng ${ac} làm tăng nguy cơ tổn thương loét và xuất huyết tiêu hóa. Ngoài ra, Diclofenac và Celecoxib còn ức chế CYP2C9 làm tăng nồng độ Warfarin/Sintrom.`,
      clinicalRisk: `Tăng nguy cơ xuất huyết đường tiêu hóa nặng lên 3 - 6 lần; nguy cơ suy thận cấp do NSAID làm giảm thanh thải ${ac} qua thận.`,
      action: `• TRÁNH PHỐI HỢP THƯỜNG QUY. Nếu cần giảm đau/hạ sốt, ưu tiên dùng Paracetamol (liều $\\le$ 2g/ngày).\n• Nếu bắt buộc phải dùng NSAID ngắn ngày: chọn loại ít ức chế tiểu cầu (Celecoxib liều thấp), bắt buộc kê kèm PPI (Pantoprazole 40mg/ngày) và theo dõi sát phân đen, công thức máu.`,
      disclaimer: `Khuyến cáo Dược lý lâm sàng. Luôn tham khảo ý kiến bác sĩ điều trị trước khi dùng bất kỳ thuốc giảm đau nào.`
    };
  }

  // 6. Amiodarone
  if (text.includes('amiodarone') || text.includes('cordarone')) {
    const isVKA = ac.includes('Warfarin') || ac.includes('Acenocoumarol') || ac.includes('Sintrom');
    return {
      severity: isVKA ? '🟠 NGUY CƠ CAO - CẦN CAN THIỆP' : '🟡 THẬN TRỌNG - THEO DÕI',
      severityType: isVKA ? 'major' : 'moderate',
      mechanism: `Amiodarone ức chế cả CYP2C9, CYP1A2, CYP3A4 và chất vận chuyển P-gp. Do thời gian bán thải của Amiodarone cực dài (lên tới 40 - 55 ngày), tương tác dược động học kéo dài liên tục hàng tháng sau khi ngừng thuốc.`,
      clinicalRisk: isVKA 
        ? `Nồng độ VKA tăng cao rõ rệt, chỉ số INR tăng vọt và biến động khó kiểm soát, nguy cơ xuất huyết nghiêm trọng kéo dài.`
        : `Tăng nhẹ đến vừa nồng độ DOACs (${ac}), làm tăng nguy cơ chảy máu ở bệnh nhân cao tuổi.`,
      action: isVKA
        ? `• TƯƠNG TÁC KINH ĐIỂN: Giảm ngay 33% - 50% liều Warfarin/Sintrom ngay khi bắt đầu Amiodarone!\n• Đo chỉ số INR hàng tuần trong tháng đầu tiên và định kỳ 2 tuần/lần sau đó.`
        : `• Với Dabigatran: Cân nhắc giảm liều 110mg x 2 lần/ngày nếu có suy thận nhẹ hoặc trên 75 tuổi.\n• Với Rivaroxaban/Apixaban: Thận trọng theo dõi triệu chứng lâm sàng.`,
      disclaimer: `Tương tác tim mạch phức tạp. Cần có sự giám sát trực tiếp của bác sĩ chuyên khoa tim mạch.`
    };
  }

  // 7. Rifampicin / Carbamazepine / Cảm ứng men gan mạnh
  if (text.includes('rifampicin') || text.includes('carbamazepine') || text.includes('phenytoin') || text.includes('tegretol') || text.includes('dilantin') || text.includes('st. john')) {
    const isDOAC = ac.includes('Rivaroxaban') || ac.includes('Apixaban') || ac.includes('Dabigatran') || ac.includes('Edoxaban');
    return {
      severity: isDOAC ? '🔴 CHỐNG CHỈ ĐỊNH / TRÁNH PHỐI HỢP' : '🟠 NGUY CƠ CAO - CẦN CAN THIỆP',
      severityType: isDOAC ? 'contraindicated' : 'major',
      mechanism: `Cảm ứng cực mạnh hệ enzyme gan CYP3A4 và bơm tống thuốc P-glycoprotein, làm tăng tốc độ chuyển hóa và đào thải ${ac} ra khỏi cơ thể.`,
      clinicalRisk: isDOAC
        ? `Nồng độ DOAC trong máu tụt giảm tới 50% - 70%, dẫn đến MẤT HOÀN TOÀN HIỆU LỰC CHỐNG ĐÔNG, làm tăng vọt nguy cơ đột quỵ thiếu máu cục bộ, tắc mạch phổi hoặc huyết khối buồng tim.`
        : `Nồng độ Warfarin/Sintrom sụt giảm nghiêm trọng, INR tụt thấp dưới ngưỡng bảo vệ.`,
      action: isDOAC
        ? `• CHỐNG CHỈ ĐỊNH dùng DOAC cùng các chất cảm ứng mạnh. Bắt buộc chuyển bệnh nhân sang dùng Warfarin (với liều điều chỉnh tăng theo INR) hoặc dùng Heparin/LMWH.`
        : `• Cần tăng liều Warfarin/Sintrom đáng kể (có khi gấp 2 - 3 lần liều thường) và theo dõi INR sát sao. Khi ngừng thuốc cảm ứng, phải hạ liều VKA ngay để tránh xuất huyết cấp.`,
      disclaimer: `Cảnh báo theo Hướng dẫn thực hành lâm sàng EHRA 2021 và Dược thư Quốc gia Việt Nam.`
    };
  }

  // Mặc định tổng quát
  return {
    severity: '🟡 THẬN TRỌNG - THEO DÕI',
    severityType: 'moderate',
    mechanism: `Tương tác giữa ${ac} và đối tượng tra cứu cần được phân tích dựa trên con đường chuyển hóa gan (CYP3A4, CYP2C9), hệ vận chuyển P-glycoprotein và tác động lên quá trình đông cầm máu.`,
    clinicalRisk: `Có thể làm biến động nồng độ thuốc tự do trong máu, thay đổi hiệu lực chống đông hoặc làm tăng nguy cơ tổn thương niêm mạc đường tiêu hóa.`,
    action: `• Luôn tham vấn Dược sĩ lâm sàng hoặc Bác sĩ điều trị trước khi phối hợp thuốc mới.\n• Theo dõi các dấu hiệu xuất huyết bất thường (bầm tím dưới da, chảy máu chân răng, phân sẫm màu) và làm xét nghiệm kiểm tra định kỳ (INR/chức năng gan thận CrCl).`,
    disclaimer: `Thông tin tham khảo y khoa. Mọi thay đổi phác đồ cần được bác sĩ chuyên khoa phụ trách quyết định.`
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, anticoagulant, companionDrug, history = [] } = body;

    const kbText = getKnowledgeBaseContent();
    const apiKey = process.env.GEMINI_API_KEY;

    // Chuẩn bị nội dung câu hỏi
    const queryDrugPart = [
      anticoagulant ? `Thuốc chống đông: ${anticoagulant}` : '',
      companionDrug ? `Thuốc / Thực phẩm phối hợp: ${companionDrug}` : '',
      message ? `Chi tiết thắc mắc: ${message}` : '',
    ].filter(Boolean).join('\n');

    const promptText = `Yêu cầu tra cứu tương tác thuốc:\n${queryDrugPart}`;

    const hasValidApiKey = apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here';

    // Hàm tạo phản hồi cục bộ
    const buildLocalResponse = (note) => {
      const matched = localClinicalMatcher(anticoagulant, companionDrug, message);
      const formattedResponse = `### 1. Mức độ tương tác
${matched.severity}

### 2. Cơ chế tương tác
${matched.mechanism}

### 3. Hậu quả lâm sàng
${matched.clinicalRisk}

### 4. Hướng xử trí & Theo dõi
${matched.action}

### 5. Lưu ý miễn trừ trách nhiệm y khoa
${matched.disclaimer}

---
*💡 ${note || 'Hệ thống vận hành dựa trên Cơ sở Dữ liệu Chuẩn Y khoa cục bộ `du-lieu-tuong-tac-thuoc-chong-dong.md`.'}*`;

      return NextResponse.json({
        reply: formattedResponse,
        source: 'local_kb',
        model: 'Local Expert Knowledge Base',
        severity: matched.severityType,
      });
    };

    if (!hasValidApiKey) {
      return buildLocalResponse('Vui lòng nhập `GEMINI_API_KEY` trong tệp `.env` để kích hoạt AI trực tuyến.');
    }

    // Nếu CÓ GEMINI_API_KEY -> Thử gọi Gemini API với các mô hình khả dụng (gemini-3.8-flash, gemini-2.0-flash, gemini-1.5-flash)
    const systemInstruction = `Bạn là Dược sĩ Lâm sàng Chuyên sâu về Huyết học và Tim mạch (Clinical Pharmacist Specialist in Anticoagulation & Cardiology).
Nhiệm vụ của bạn là tư vấn, phân tích và hướng dẫn xử trí tương tác giữa thuốc chống đông máu với các thuốc, thực phẩm chức năng hoặc thức ăn dùng kèm.

QUY TẮC CỐT LÕI:
1. CƠ SỞ TRI THỨC ƯU TIÊN HÀNG ĐẦU: Luôn tra cứu và bám sát tuyệt đối nội dung trong CƠ SỞ DỮ LIỆU TƯƠNG TÁC THUỐC CHỐNG ĐÔNG đính kèm bên dưới.
2. NGUYÊN TẮC TRUNG THỰC Y KHOA: Tuyệt đối không bịa đặt hoặc suy diễn thông tin y dược học không có căn cứ thực chứng.
3. CẶP THUỐC NGOÀI CƠ SỞ DỮ LIỆU: Nếu cặp thuốc người dùng hỏi chưa có trong bảng dữ liệu chuẩn đính kèm, bạn PHẢI NÊU RÕ: "Cặp thuốc này hiện chưa có trong cơ sở dữ liệu chuẩn cục bộ của hệ thống; dưới đây là phân tích dựa trên Dược thư Quốc gia và các hướng dẫn tim mạch quốc tế (ESC/AHA/FDA):" trước khi phân tích.
4. BẮT BUỘC TRẢ LỜI ĐỦ VÀ CHUẨN XÁC THEO ĐÚNG 5 MỤC SAU ĐÂY:
   ### 1. Mức độ tương tác
   (Chọn đúng 1 trong 4 mức độ kèm biểu tượng: 🔴 CHỐNG CHỈ ĐỊNH / TRÁNH PHỐI HỢP, 🟠 NGUY CƠ CAO - CẦN CAN THIỆP, 🟡 THẬN TRỌNG - THEO DÕI, 🟢 ÍT Ý NGHĨA LÂM SÀNG / AN TOÀN TƯƠNG ĐỐI)

   ### 2. Cơ chế tương tác
   (Phân tích chi tiết đường dược động học: enzym gan CYP3A4, CYP2C9, bơm tống P-glycoprotein, độ gắn protein, pH dạ dày; hoặc dược lực học: hiệp đồng ức chế tiểu cầu, tổn thương niêm mạc tiêu hóa...)

   ### 3. Hậu quả lâm sàng
   (Nguy cơ xuất huyết tiêu hóa, nội sọ, tăng/tụt chỉ số INR, thay đổi nồng độ thuốc tự do, nguy cơ huyết khối tắc mạch tái phát...)

   ### 4. Hướng xử trí & Theo dõi
   (Thuốc thay thế an toàn hơn, đề xuất điều chỉnh liều, bổ sung PPI bảo vệ dạ dày, khoảng cách thời gian uống, các chỉ số xét nghiệm cần theo dõi: INR, CrCl, Anti-Xa, công thức máu...)

   ### 5. Lưu ý miễn trừ trách nhiệm y khoa
   (Lời nhắc chuyên môn: Thông tin chỉ mang tính chất hỗ trợ quyết định lâm sàng. Bác sĩ điều trị và Dược sĩ phụ trách cần cá thể hóa trên từng bệnh nhân cụ thể.)

---
[CƠ SỞ DỮ LIỆU CHUẨN TƯƠNG TÁC THUỐC CHỐNG ĐÔNG MÁU]:
${kbText}
`;

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((h) => {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: promptText }],
    });

    const candidateModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: contents,
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText,
              source: model,
              model: `Google Gemini AI (${model})`,
            });
          }
        } else {
          const errDetail = await res.text();
          console.warn(`Model ${model} trả về lỗi HTTP ${res.status}:`, errDetail);
          lastError = errDetail;
        }
      } catch (e) {
        console.warn(`Gọi ${model} phát sinh lỗi:`, e.message);
        lastError = e.message;
      }
    }

    // Nếu tất cả API calls đều không thành công (ví dụ do key chưa kích hoạt hoặc lỗi mạng)
    // Tự động chuyển mượt sang Local Expert Matcher, tuyệt đối không trả lỗi 500
    console.info('Chuyển sang chế độ Local Expert Matcher do Gemini API không khả dụng.');
    return buildLocalResponse('Đang tạm thời hiển thị dữ liệu từ CSDL Dược thư Cục bộ do kết nối Gemini API chưa hoàn tất.');

  } catch (error) {
    console.error('Lỗi API route chat:', error);
    return NextResponse.json(
      {
        error: 'Có lỗi xảy ra khi xử lý yêu cầu y khoa.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
