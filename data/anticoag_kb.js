// ==============================================================================
// ANTICOAGULANT DRUG INTERACTION KNOWLEDGE BASE (CSDL TƯƠNG TÁC THUỐC CHỐNG ĐÔNG)
// Dựa trên Dược thư Quốc gia Việt Nam, Hướng dẫn EHRA, ESC, ACC/AHA & FDA
// ==============================================================================

const ANTICOAGULANT_KB = {
  // Danh mục các thuốc chống đông chính
  anticoagulants: [
    {
      id: "warfarin",
      name: "Warfarin",
      brandNames: ["Coumadin", "Marevan", "Jantoven"],
      group: "VKA",
      groupName: "Kháng Vitamin K (VKA)",
      mechanism: "Ức chế enzyme Vitamin K epoxide reductase (VKORC1), cản trở chu trình tạo các yếu tố đông máu II, VII, IX, X và protein C, S.",
      metabolism: "Chuyển hóa qua gan: S-warfarin (hoạt tính mạnh) qua CYP2C9; R-warfarin qua CYP1A2, CYP3A4, CYP2C19. Liên kết protein huyết tương cao (99%).",
      monitoring: "Chỉ số INR (Mục tiêu phổ biến: 2.0 - 3.0; với van tim cơ học 2 lá: 2.5 - 3.5).",
      antidote: "Vitamin K1 (Phytomenadione) tiêm/uống + Phức hợp Prothrombin cô đặc (PCC) hoặc Huyết tương tươi đông lạnh (FFP).",
      foodNotice: "Rất nhạy cảm với lượng Vitamin K trong chế độ ăn (rau xanh thẫm). Cần duy trì chế độ ăn ổn định."
    },
    {
      id: "acenocoumarol",
      name: "Acenocoumarol",
      brandNames: ["Sintrom", "Mini-Sintrom"],
      group: "VKA",
      groupName: "Kháng Vitamin K (VKA)",
      mechanism: "Ức chế tổng hợp yếu tố đông máu phụ thuộc vitamin K. Tương tự Warfarin nhưng thời gian bán thải ngắn hơn (8-11 giờ) nên biến thiên INR lớn hơn.",
      metabolism: "Chuyển hóa qua gan chủ yếu bởi CYP2C9, CYP1A2 và CYP2C19.",
      monitoring: "Chỉ số INR thường xuyên (mục tiêu thường 2.0 - 3.0).",
      antidote: "Vitamin K1 + PCC hoặc FFP khi có xuất huyết đe dọa tính mạng.",
      foodNotice: "Duy trì ổn định lượng rau xanh đậm (rau ngót, cải bó xôi, súp lơ xanh...). Tránh kiêng khem đột ngột hoặc ăn quá nhiều đột xuất."
    },
    {
      id: "rivaroxaban",
      name: "Rivaroxaban",
      brandNames: ["Xarelto", "Rixaban", "Rivarox"],
      group: "DOAC_XA",
      groupName: "Thuốc chống đông đường uống thế hệ mới (DOAC) - Ức chế yếu tố Xa",
      mechanism: "Ức chế trực tiếp, chọn lọc và cạnh tranh thuận nghịch yếu tố Xa (cả dạng tự do và gắn trong phức hợp prothrombinase).",
      metabolism: "Thải trừ qua thận 1/3 dạng nguyên vẹn, 2/3 chuyển hóa qua gan (chủ yếu CYP3A4/3A5, CYP2J2). Là cơ chất của bơm tống thuốc P-gp và BCRP.",
      monitoring: "Không cần theo dõi đông máu thường quy. Khi cần khẩn cấp: định lượng kháng yếu tố Xa (Anti-Xa assay) hiệu chuẩn riêng cho Rivaroxaban.",
      antidote: "Andexanet alfa (Ondexxya / Andexxa). Nếu không có: dùng PCC (4 yếu tố).",
      specialNotice: "Liều 15mg và 20mg BẮT BUỘC uống cùng thức ăn (đạt hấp thu tối đa). Chống chỉ định khi CrCl < 15 ml/phút."
    },
    {
      id: "apixaban",
      name: "Apixaban",
      brandNames: ["Eliquis", "Apigat"],
      group: "DOAC_XA",
      groupName: "Thuốc chống đông đường uống thế hệ mới (DOAC) - Ức chế yếu tố Xa",
      mechanism: "Ức chế chọn lọc trực tiếp yếu tố Xa.",
      metabolism: "Thải trừ qua thận chỉ khoảng 27%. Khoảng 25% chuyển hóa qua CYP3A4, phần còn lại thải trừ qua mật/phân. Là cơ chất của P-gp và BCRP.",
      monitoring: "Không cần theo dõi thường quy; có thể đo Anti-Xa hiệu chuẩn riêng cho Apixaban.",
      antidote: "Andexanet alfa hoặc PCC (4 yếu tố).",
      specialNotice: "Thuốc có tỷ lệ thải trừ qua thận thấp nhất trong các DOACs, tương đối an toàn hơn trên bệnh nhân suy thận nhẹ-vừa. Uống không phụ thuộc bữa ăn."
    },
    {
      id: "dabigatran",
      name: "Dabigatran etexilate",
      brandNames: ["Pradaxa"],
      group: "DOAC_IIA",
      groupName: "Thuốc chống đông đường uống thế hệ mới (DOAC) - Ức chế trực tiếp Thrombin (IIa)",
      mechanism: "Tiền chất (prodrug) chuyển thành Dabigatran, ức chế trực tiếp cả thrombin tự do và thrombin gắn fibrin.",
      metabolism: "80% đào thải dưới dạng nguyên vẹn qua THẬN! Là cơ chất của bơm P-gp. KHÔNG chuyển hóa qua hệ enzyme CYP450.",
      monitoring: "Không theo dõi thường quy. Khi cần khẩn: xét nghiệm thời gian thrombin pha loãng (dTT) hoặc ecarin clotting time (ECT); aPTT tăng nhưng không tuyến tính.",
      antidote: "Idarucizumab (Praxbind) - Kháng thể đơn dòng đặc hiệu đảo ngược tác dụng trong vài phút. Có thể lọc máu loại bỏ thuốc do gắn protein thấp (35%).",
      specialNotice: "Chống chỉ định khi CrCl < 30 ml/phút. Không bẻ, mở hoặc nhai viên nang (sẽ làm tăng sinh khả dụng lên 75% gây nguy cơ quá liều)."
    },
    {
      id: "edoxaban",
      name: "Edoxaban",
      brandNames: ["Lixiana", "Savaysa"],
      group: "DOAC_XA",
      groupName: "Thuốc chống đông đường uống thế hệ mới (DOAC) - Ức chế yếu tố Xa",
      mechanism: "Ức chế trực tiếp, chọn lọc yếu tố Xa.",
      metabolism: "Thải trừ 50% qua thận. Chuyển hóa tối thiểu qua CYP3A4 (< 10%). Là cơ chất của P-gp.",
      monitoring: "Không theo dõi thường quy. Anti-Xa đặc hiệu.",
      antidote: "Andexanet alfa hoặc PCC.",
      specialNotice: "Không khuyến cáo dùng cho rung nhĩ nếu CrCl > 95 ml/phút (do đào thải quá nhanh làm giảm hiệu lực bảo vệ đột quỵ)."
    },
    {
      id: "enoxaparin",
      name: "Enoxaparin",
      brandNames: ["Lovenox", "Clexane"],
      group: "LMWH",
      groupName: "Heparin trọng lượng phân tử thấp (LMWH)",
      mechanism: "Gắn với Antithrombin III, ức chế mạnh yếu tố Xa và một phần yếu tố IIa (tỷ lệ ức chế Xa/IIa khoảng 3.8:1).",
      metabolism: "Đào thải chủ yếu qua thận.",
      monitoring: "Không theo dõi thường quy; xét nghiệm Anti-Xa ở phụ nữ mang thai, suy thận nặng hoặc bệnh nhân béo phì nặng.",
      antidote: "Protamine sulfate (trung hòa khoảng 60-75% hoạt tính Anti-Xa).",
      specialNotice: "Tiêm dưới da sâu. Cần chỉnh liều khi CrCl < 30 ml/phút."
    },
    {
      id: "heparin",
      name: "Heparin không phân đoạn",
      brandNames: ["Heparin Sodium", "Heparin Viatris"],
      group: "UFH",
      groupName: "Heparin không phân đoạn (UFH)",
      mechanism: "Gắn kết Antithrombin III, ức chế đồng đều cả yếu tố IIa và Xa (tỷ lệ 1:1).",
      metabolism: "Chuyển hóa qua hệ lưới nội mô và đại thực bào, một phần qua thận khi liều cao.",
      monitoring: "Theo dõi aPTT (mục tiêu 1.5 - 2.5 lần chứng) hoặc Anti-Xa.",
      antidote: "Protamine sulfate (1mg Protamine trung hòa khoảng 100 UI Heparin).",
      specialNotice: "Nguy cơ giảm tiểu cầu do Heparin (HIT). Tiêm tĩnh mạch hoặc tiêm dưới da."
    }
  ],

  // Danh mục thuốc / nhóm chất tương tác
  interactingDrugs: [
    // 1. NSAIDs
    {
      id: "nsaids",
      names: ["Ibuprofen", "Naproxen", "Diclofenac", "Meloxicam", "Celecoxib", "Piroxicam", "Ketorolac", "Aspirin liều kháng viêm"],
      brandNames: ["Voltaren", "Mobic", "Celebrex", "Alaxan", "Gofen", "Tilcotil", "Felden"],
      category: "Thuốc kháng viêm không steroid (NSAIDs)",
      severity: "major", // "contraindicated" | "major" | "moderate" | "minor"
      targetInteractions: {
        all: {
          mechanism: "NSAIDs ức chế enzyme COX-1 làm giảm tổng hợp Thromboxane A2 (suy giảm kết tập tiểu cầu) đồng thời làm tổn thương niêm mạc dạ dày qua ức chế Prostaglandin bảo vệ. Phối hợp với thuốc chống đông làm tăng nguy cơ xuất huyết tiêu hóa lên gấp 3 - 6 lần.",
          clinicalRisk: "Chảy máu dạ dày - tá tràng nghiêm trọng, xuất huyết ẩn, suy thận cấp làm giảm thải trừ thuốc chống đông.",
          action: "TRÁNH PHỐI HỢP THƯỜNG QUY. Nếu cần giảm đau hạ sốt, ưu tiên dùng Paracetamol (liều <= 2g/ngày). Nếu bắt buộc dùng NSAID ngắn ngày, chọn loại ít ức chế tiểu cầu hơn (như Celecoxib liều thấp), dùng kèm thuốc ức chế bơm proton (PPI: Pantoprazole, Omeprazole) và theo dõi sát phân đen, chóng mặt, tụt huyết áp.",
          warfarinSpecific: "Diclofenac, Celecoxib còn ức chế chuyển hóa qua CYP2C9 làm tăng nồng độ Warfarin/Sintrom -> INR tăng vọt."
        }
      }
    },

    // 2. Antiplatelets
    {
      id: "antiplatelets",
      names: ["Aspirin", "Clopidogrel", "Ticagrelor", "Prasugrel"],
      brandNames: ["Plavix", "Brilinta", "Effient", "Aspirin 81", "Aspilets"],
      category: "Thuốc chống kết tập tiểu cầu (Antiplatelets)",
      severity: "major",
      targetInteractions: {
        all: {
          mechanism: "Tác dụng hiệp đồng dược lực học: chống đông ức chế dòng thác đông máu + chống kết tập tiểu cầu ức chế nút chặn tiểu cầu, làm suy giảm toàn diện cơ chế cầm máu.",
          clinicalRisk: "Tăng đáng kể nguy cơ xuất huyết nặng (xuất huyết não, xuất huyết tiêu hóa, bầm tím lan rộng).",
          action: "CHỈ DÙNG KHI CÓ CHỈ ĐỊNH ĐẶC BIỆT CỦA BÁC SĨ TIM MẠCH (ví dụ bệnh nhân rung nhĩ vừa can thiệp đặt stent mạch vành). Tuân thủ nghiêm ngặt phác đồ phối hợp đôi/ba (Dual/Triple therapy) trong thời gian ngắn nhất có thể, bắt buộc kèm PPI bảo vệ dạ dày. Thường chọn DOAC hơn Warfarin và ưu tiên liều Rivaroxaban 15mg hoặc Apixaban 2.5-5mg theo phác đồ tim mạch."
        }
      }
    },

    // 3. Kháng nấm Azole
    {
      id: "azole_antifungals_strong",
      names: ["Ketoconazole", "Itraconazole", "Voriconazole", "Posaconazole"],
      brandNames: ["Nizoral", "Sporanox", "Vfend", "Noxafil"],
      category: "Thuốc kháng nấm nhóm Azole (Ức chế mạnh CYP3A4 & P-gp)",
      severity: "contraindicated",
      targetInteractions: {
        rivaroxaban: {
          severity: "contraindicated",
          mechanism: "Ức chế đồng thời rất mạnh enzym CYP3A4 và chất vận chuyển P-glycoprotein, làm tăng nồng độ Rivaroxaban trong máu lên gấp 2.5 lần (tăng AUC 158%).",
          action: "CHỐNG CHỈ ĐỊNH DÙNG ĐỒNG THỜI đường toàn thân. Chuyển sang kháng nấm nhóm khác (như Amphotericin B, Echinocandin) hoặc chuyển tạm thời sang Heparin/LMWH nếu bắt buộc."
        },
        apixaban: {
          severity: "contraindicated",
          mechanism: "Ức chế kép CYP3A4 và P-gp làm tăng gấp đôi nồng độ Apixaban.",
          action: "Theo FDA: Nếu bệnh nhân đang dùng liều 5mg x 2 lần/ngày, giảm xuống 2.5mg x 2 lần/ngày. Theo châu Âu (EMA): Chống chỉ định dùng đồng thời đường toàn thân."
        },
        dabigatran: {
          severity: "contraindicated",
          mechanism: "Ức chế mạnh P-gp làm tăng hấp thu Dabigatran lên 2 - 3 lần.",
          action: "CHỐNG CHỈ ĐỊNH / TRÁNH DÙNG cùng Ketoconazole, Itraconazole đường toàn thân."
        },
        warfarin: {
          severity: "major",
          mechanism: "Ức chế mạnh CYP2C9 (Voriconazole, Itraconazole) và CYP3A4 -> Nồng độ Warfarin tăng vọt, INR có thể vượt quá 10.",
          action: "Theo dõi INR mỗi 2-3 ngày. Cân nhắc giảm liều VKA từ 30% - 50% ngay khi bắt đầu kháng nấm."
        },
        acenocoumarol: {
          severity: "major",
          mechanism: "Ức chế CYP2C9 làm nồng độ Sintrom tăng vọt -> INR tăng mất kiểm soát.",
          action: "Theo dõi sát INR, giảm liều Sintrom chủ động và cảnh giác xuất huyết."
        }
      }
    },

    // 4. Fluconazole
    {
      id: "fluconazole",
      names: ["Fluconazole"],
      brandNames: ["Diflucan", "Flucozit", "Mycosyst"],
      category: "Thuốc kháng nấm Azole (Ức chế mạnh CYP2C9, vừa CYP3A4)",
      severity: "major",
      targetInteractions: {
        warfarin: {
          severity: "major",
          mechanism: "Fluconazole là chất ức chế cực mạnh CYP2C9 - enzyme chính chuyển hóa S-warfarin. Nồng độ Warfarin tự do tăng gấp nhiều lần.",
          action: "TƯƠNG TÁC RẤT NGUY HIỂM. Giảm ngay 30 - 50% liều Warfarin khi bắt đầu Fluconazole. Kiểm tra lại INR sau 3-5 ngày. Hướng dẫn bệnh nhân phát hiện dấu hiệu xuất huyết."
        },
        acenocoumarol: {
          severity: "major",
          mechanism: "Ức chế mạnh CYP2C9 làm giảm độ thanh thải Sintrom -> Nguy cơ chảy máu đe dọa tính mạng.",
          action: "Chủ động giảm liều Sintrom, kiểm tra INR sau 48-72 giờ."
        },
        rivaroxaban: {
          severity: "moderate",
          mechanism: "Fluconazole ức chế vừa CYP3A4 -> Tăng nhẹ đến vừa nồng độ Rivaroxaban.",
          action: "Thận trọng, đặc biệt ở bệnh nhân suy thận nhẹ-vừa. Theo dõi các vết bầm tím, chảy máu chân răng."
        },
        dabigatran: {
          severity: "minor",
          mechanism: "Fluconazole ít ảnh hưởng đến P-gp hơn Ketoconazole, không qua CYP.",
          action: "Ít có ý nghĩa lâm sàng đáng kể nhưng vẫn cần theo dõi lâm sàng thông thường."
        }
      }
    },

    // 5. Kháng sinh Macrolide
    {
      id: "macrolides",
      names: ["Clarithromycin", "Erythromycin"],
      brandNames: ["Klacid", "Clabact", "Erythrocin"],
      category: "Kháng sinh Macrolide (Ức chế CYP3A4 & P-gp)",
      severity: "major",
      targetInteractions: {
        all: {
          mechanism: "Clarithromycin và Erythromycin ức chế mạnh CYP3A4 và bơm P-glycoprotein, đồng thời diệt hệ vi khuẩn đường ruột sản xuất Vitamin K.",
          clinicalRisk: "Làm tăng nồng độ DOACs (Rivaroxaban, Apixaban, Dabigatran) và làm tăng INR của VKA (Warfarin, Sintrom).",
          action: "Khuyến cáo đổi sang kháng sinh thay thế không ức chế men gan (như Azithromycin - ít ức chế CYP hơn, Amoxicillin/Clavulanate, Cefuroxime). Nếu bắt buộc dùng, với Dabigatran cần giảm liều (110mg x 2 lần/ngày) hoặc theo dõi sát; với Warfarin/Sintrom cần kiểm tra INR thường xuyên."
        }
      }
    },

    // 6. Amiodarone
    {
      id: "amiodarone",
      names: ["Amiodarone"],
      brandNames: ["Cordarone", "Amiodarone Hydroclorid"],
      category: "Thuốc chống loạn nhịp tim nhóm III",
      severity: "major",
      targetInteractions: {
        warfarin: {
          severity: "major",
          mechanism: "Amiodarone ức chế cả CYP2C9, CYP1A2, CYP3A4 và P-gp. Do thời gian bán thải của Amiodarone rất dài (vài chục ngày), tương tác có thể kéo dài hàng tháng sau khi ngừng.",
          action: "TƯƠNG TÁC KINH ĐIỂN: Giảm 33% - 50% liều Warfarin ngay khi bắt đầu Amiodarone! Đo INR mỗi tuần trong tháng đầu tiên và định kỳ sau đó."
        },
        acenocoumarol: {
          severity: "major",
          mechanism: "Ức chế chuyển hóa Sintrom qua CYP2C9 -> INR tăng cao kéo dài.",
          action: "Chủ động giảm liều Sintrom 30-50%, theo dõi INR chặt chẽ."
        },
        dabigatran: {
          severity: "moderate",
          mechanism: "Amiodarone là chất ức chế P-gp nhẹ đến vừa, làm tăng nồng độ Dabigatran khoảng 50-60%.",
          action: "Cân nhắc giảm liều Dabigatran xuống 110mg x 2 lần/ngày ở người cao tuổi hoặc có nguy cơ xuất huyết cao."
        },
        rivaroxaban: {
          severity: "moderate",
          mechanism: "Tăng nhẹ nồng độ Rivaroxaban do ức chế P-gp và CYP3A4.",
          action: "Có thể phối hợp nhưng cần thận trọng ở bệnh nhân có suy giảm chức năng thận (CrCl < 50 ml/phút)."
        },
        apixaban: {
          severity: "moderate",
          mechanism: "Tăng nhẹ nồng độ Apixaban.",
          action: "Có thể phối hợp, không cần giảm liều Apixaban trừ khi có thêm các yếu tố nguy cơ khác (tuổi >= 80, cân nặng <= 60kg, creatinine >= 1.5 mg/dL)."
        }
      }
    },

    // 7. Chất cảm ứng men gan mạnh (Rifampicin, Chống động kinh)
    {
      id: "strong_inducers",
      names: ["Rifampicin", "Rifampin", "Carbamazepine", "Phenytoin", "Phenobarbital"],
      brandNames: ["Tegretol", "Dilantin", "Gardenal", "Rifadin", "Rimactane"],
      category: "Chất cảm ứng mạnh CYP450 (CYP3A4, CYP2C9) và P-gp",
      severity: "contraindicated",
      targetInteractions: {
        all_doacs: {
          severity: "contraindicated",
          mechanism: "Cảm ứng cực mạnh CYP3A4 và P-gp làm tăng tốc độ đào thải DOACs (Rivaroxaban, Apixaban, Dabigatran, Edoxaban), làm giảm nồng độ thuốc trong huyết tương tới 50% - 70%.",
          clinicalRisk: "MẤT HIỆU LỰC CHỐNG ĐÔNG -> Tăng vọt nguy cơ tắc mạch, nhồi máu não, hình thành huyết khối buồng tim hoặc tái phát thuyên tắc phổi.",
          action: "CHỐNG CHỈ ĐỊNH / TRÁNH PHỐI HỢP DOAC VỚI CÁC THUỐC NÀY. Nếu bệnh nhân điều trị lao bằng Rifampicin hoặc động kinh bằng Carbamazepine/Phenytoin, khuyến cáo chuyển sang Warfarin (với liều điều chỉnh tăng theo INR) hoặc dùng Heparin/LMWH."
        },
        warfarin: {
          severity: "major",
          mechanism: "Cảm ứng mạnh CYP2C9 và CYP3A4 làm tăng giáng hóa Warfarin/Sintrom -> INR tụt rất thấp.",
          action: "Cần tăng liều Warfarin đáng kể (có khi gấp 2-3 lần) và theo dõi sát INR. Khi ngừng thuốc cảm ứng, phải giảm liều Warfarin ngay để tránh xuất huyết."
        }
      }
    },

    // 8. Kháng sinh Metronidazole & Cotrimoxazole (Bactrim)
    {
      id: "cyp2c9_antibiotics",
      names: ["Metronidazole", "Cotrimoxazole", "Trimethoprim-Sulfamethoxazole", "Sulfamethoxazole"],
      brandNames: ["Flagyl", "Klion", "Bactrim", "Biseptol"],
      category: "Kháng sinh ức chế chọn lọc CYP2C9 & diệt khuẩn đường ruột",
      severity: "major",
      targetInteractions: {
        warfarin: {
          severity: "major",
          mechanism: "Metronidazole và Cotrimoxazole ức chế rất mạnh chuyển hóa đồng phân S-warfarin qua CYP2C9, đồng thời cạnh tranh gắn protein huyết tương.",
          clinicalRisk: "INR tăng vọt trong vòng vài ngày, nguy cơ xuất huyết tiêu hóa và tiểu máu rất cao.",
          action: "TƯƠNG TÁC RẤT PHỔ BIẾN TRÊN LÂM SÀNG! Tránh dùng nếu có kháng sinh thay thế. Nếu bắt buộc dùng, giảm 30-50% liều Warfarin ngay ngày đầu tiên, đo INR sau 48-72 giờ."
        },
        acenocoumarol: {
          severity: "major",
          mechanism: "Ức chế CYP2C9 làm nồng độ Sintrom tích lũy nhanh.",
          action: "Giảm liều Sintrom và theo dõi sát INR."
        },
        doacs: {
          severity: "minor",
          mechanism: "Ảnh hưởng tối thiểu đến CYP3A4 và P-gp, không làm biến đổi đáng kể nồng độ DOACs.",
          action: "Tương đối an toàn khi dùng cùng DOACs (Rivaroxaban, Apixaban, Dabigatran)."
        }
      }
    },

    // 9. Thuốc chống trầm cảm SSRI / SNRI
    {
      id: "antidepressants_ssri",
      names: ["Fluoxetine", "Sertraline", "Escitalopram", "Citalopram", "Paroxetine", "Venlafaxine", "Duloxetine"],
      brandNames: ["Prozac", "Zoloft", "Lexapro", "Cipramil", "Seroxat", "Effexor", "Cymbalta"],
      category: "Thuốc chống trầm cảm ức chế tái thu hồi Serotonin (SSRI / SNRI)",
      severity: "moderate",
      targetInteractions: {
        all: {
          mechanism: "Tiểu cầu cần thu hồi serotonin từ huyết tương để kích hoạt quá trình ngưng tập tiểu cầu khi có vết thương. SSRI/SNRI ức chế bơm thu hồi serotonin vào tiểu cầu -> làm giảm chức năng tiểu cầu, dù các chỉ số xét nghiệm đông máu (INR, aPTT) hoàn toàn bình thường.",
          clinicalRisk: "Tăng nguy cơ xuất huyết tiêu hóa trên gấp 2-3 lần khi phối hợp với thuốc chống đông.",
          action: "Thận trọng khi phối hợp. Cân nhắc kê thêm thuốc ức chế bơm proton (PPI) để bảo vệ niêm mạc dạ dày. Hướng dẫn bệnh nhân phát hiện sớm phân đen hoặc chảy máu chân răng."
        }
      }
    },

    // 10. Corticosteroid toàn thân
    {
      id: "corticosteroids",
      names: ["Prednisolone", "Methylprednisolone", "Dexamethasone", "Hydrocortisone", "Betamethasone"],
      brandNames: ["Medrol", "Solu-Medrol", "Prednisolon 5mg", "Decadron"],
      category: "Corticosteroid đường toàn thân",
      severity: "moderate",
      targetInteractions: {
        all: {
          mechanism: "Corticosteroid gây loét trợt niêm mạc dạ dày - tá tràng. Khi dùng chung với thuốc chống đông, tổn thương này dễ bị xuất huyết ồ ạt.",
          clinicalRisk: "Xuất huyết tiêu hóa, biến thiên INR khó dự đoán trên bệnh nhân dùng VKA (do ảnh hưởng chuyển hóa men gan và chế độ dinh dưỡng).",
          action: "Bắt buộc dùng kèm thuốc ức chế bơm proton (PPI). Hạn chế thời gian dùng liều cao. Với Warfarin/Sintrom: kiểm tra INR thường xuyên hơn."
        }
      }
    },

    // 11. Thuốc chẹn kênh Canxi (Verapamil, Diltiazem)
    {
      id: "calcium_channel_blockers",
      names: ["Verapamil", "Diltiazem"],
      brandNames: ["Isoptin", "Tildiem", "Herbesser"],
      category: "Thuốc chẹn kênh Canxi nhóm Non-DHP (Ức chế P-gp và CYP3A4 vừa)",
      severity: "moderate",
      targetInteractions: {
        dabigatran: {
          severity: "moderate",
          mechanism: "Verapamil đường uống ức chế P-gp tại ruột, làm tăng nồng độ Dabigatran lên khoảng 60 - 70%.",
          action: "Khi dùng chung với Verapamil: Bệnh nhân nên uống Verapamil cách ít nhất 2 giờ sau khi uống Dabigatran. Cân nhắc giảm liều Dabigatran xuống 110mg x 2 lần/ngày (đặc biệt ở người suy thận nhẹ-vừa hoặc người cao tuổi)."
        },
        rivaroxaban: {
          severity: "minor",
          mechanism: "Tăng nhẹ AUC của Rivaroxaban nhưng không có ý nghĩa lâm sàng đáng kể ở bệnh nhân chức năng thận bình thường.",
          action: "Theo dõi thông thường, thận trọng nếu có suy thận đi kèm."
        }
      }
    },

    // 12. Thuốc bảo vệ dạ dày PPI (Omeprazole, Pantoprazole, Esomeprazole)
    {
      id: "ppi",
      names: ["Omeprazole", "Esomeprazole", "Pantoprazole", "Rabeprazole", "Lansoprazole"],
      brandNames: ["Nexium", "Losec", "Pantiloc", "Pariet", "Zegerid"],
      category: "Thuốc ức chế bơm proton (PPI)",
      severity: "minor",
      targetInteractions: {
        dabigatran: {
          severity: "minor",
          mechanism: "PPI làm tăng pH dạ dày -> giảm nhẹ sinh khả dụng và độ hấp thu của Dabigatran khoảng 20-30%, nhưng các thử nghiệm lâm sàng (RE-LY) cho thấy không làm suy giảm hiệu lực bảo vệ đột quỵ.",
          action: "Vẫn khuyến cáo dùng PPI để phòng ngừa xuất huyết dạ dày ở bệnh nhân có nguy cơ cao."
        },
        warfarin: {
          severity: "minor",
          mechanism: "Omeprazole và Esomeprazole ức chế nhẹ CYP2C19 -> có thể làm tăng nhẹ INR ở một số ít bệnh nhân.",
          action: "Ưu tiên Pantoprazole vì ít ức chế men gan nhất. Theo dõi INR thông thường."
        },
        rivaroxaban: {
          severity: "minor",
          mechanism: "Không có tương tác đáng kể.",
          action: "Phối hợp an toàn."
        }
      }
    },

    // 13. Thảo dược & Thực phẩm chức năng
    {
      id: "herbal_supplements",
      names: ["Bạch quả", "Ginkgo Biloba", "Nhân sâm", "Ginseng", "Tỏi (Garlic liều cao)", "Gừng (Ginger)", "Dầu cá Omega-3 liều cao (>3g/ngày)", "Vitamin E liều cao (>400 UI)"],
      brandNames: ["Tanakan", "Ginkor Fort", "Tebonin", "Omega 3"],
      category: "Thảo dược và thực phẩm chức năng có hoạt tính chống đông/ức chế tiểu cầu",
      severity: "moderate",
      targetInteractions: {
        all: {
          mechanism: "Ginkgolide B trong Ginkgo biloba ức chế yếu tố hoạt hóa tiểu cầu (PAF). Tỏi và Vitamin E liều cao có đặc tính chống kết tập tiểu cầu tự nhiên. Khi dùng chung với thuốc chống đông làm tăng thời gian chảy máu.",
          clinicalRisk: "Tăng nguy cơ bầm tím dưới da, xuất huyết võng mạc, chảy máu não tự phát.",
          action: "KHÔNG NÊN tự ý sử dụng các chế phẩm này khi đang điều trị chống đông. Báo cho bác sĩ trước khi phẫu thuật hoặc nhổ răng (thường phải ngừng Ginkgo ít nhất 36 giờ trước mổ)."
        }
      }
    },

    // 14. Cỏ Ban Âu (St. John's Wort)
    {
      id: "st_johns_wort",
      names: ["St. John's Wort", "Cỏ Ban Âu", "Hypericum perforatum"],
      brandNames: ["Kira", "Jarsin"],
      category: "Thảo dược điều trị trầm cảm (Chất cảm ứng cực mạnh CYP3A4 & P-gp)",
      severity: "contraindicated",
      targetInteractions: {
        all: {
          mechanism: "Cảm ứng mạnh mẽ enzym CYP3A4 và chất vận chuyển P-glycoprotein, làm tăng đào thải DOACs và VKA.",
          clinicalRisk: "Làm mất hoàn toàn tác dụng chống đông -> Nguy cơ huyết khối tắc mạch đe dọa tính mạng.",
          action: "CHỐNG CHỈ ĐỊNH DÙNG CHUNG với bất kỳ thuốc chống đông nào."
        }
      }
    },

    // 15. Thực phẩm giàu Vitamin K (Rau xanh thẫm)
    {
      id: "vitamin_k_foods",
      names: ["Rau ngót", "Cải bó xôi (rau bina)", "Súp lơ xanh (bông cải xanh)", "Rau muống", "Rau đay", "Mùi tây (Parsley)", "Trà xanh đặc"],
      brandNames: [],
      category: "Thực phẩm giàu Vitamin K1 tự nhiên",
      severity: "moderate",
      targetInteractions: {
        warfarin: {
          severity: "moderate",
          mechanism: "Vitamin K1 từ thức ăn đi vào gan trực tiếp cạnh tranh và vượt qua ức chế của Warfarin/Sintrom, kích hoạt lại quá trình tạo yếu tố đông máu II, VII, IX, X.",
          clinicalRisk: "Chỉ số INR tụt giảm nhanh -> Nguy cơ hình thành cục máu đông gây đột quỵ hoặc thuyên tắc mạch.",
          action: "LƯU Ý QUAN TRỌNG: KHÔNG CẦN KIÊNG HOÀN TOÀN RAU XANH! Bệnh nhân cần DUY TRÌ LƯỢNG ĂN ỔN ĐỊNH đều đặn giữa các tuần. Tránh thay đổi đột ngột (ví dụ tuần này ăn lẩu rau liên tục, tuần sau kiêng hẳn). Nếu thay đổi thói quen ăn uống, cần xét nghiệm lại INR."
        },
        acenocoumarol: {
          severity: "moderate",
          mechanism: "Tương tự Warfarin: làm giảm hiệu lực chống đông của Sintrom.",
          action: "Duy trì chế độ ăn ổn định về lượng rau xanh mỗi ngày."
        },
        doacs: {
          severity: "minor",
          mechanism: "Cơ chế của DOACs (Rivaroxaban, Apixaban, Dabigatran, Edoxaban) là ức chế trực tiếp yếu tố Xa hoặc Thrombin, HOÀN TOÀN KHÔNG PHỤ THUỘC VITAMIN K.",
          clinicalRisk: "Không có tương tác.",
          action: "Bệnh nhân dùng DOACs có thể ăn rau xanh và thực phẩm giàu Vitamin K hoàn toàn bình thường mà không lo ảnh hưởng đến tác dụng thuốc!"
        }
      }
    },

    // 16. Nước ép bưởi chùm (Grapefruit juice)
    {
      id: "grapefruit",
      names: ["Bưởi chùm", "Grapefruit", "Nước ép bưởi chùm"],
      brandNames: [],
      category: "Thực phẩm ức chế CYP3A4 ruột",
      severity: "moderate",
      targetInteractions: {
        rivaroxaban: {
          severity: "moderate",
          mechanism: "Chất furanocoumarin trong bưởi chùm ức chế enzyme CYP3A4 tại niêm mạc ruột non, làm tăng sinh khả dụng và nồng độ Rivaroxaban.",
          action: "Tránh uống lượng lớn nước ép bưởi chùm khi đang dùng Rivaroxaban."
        },
        apixaban: {
          severity: "moderate",
          mechanism: "Có thể làm tăng nhẹ nồng độ Apixaban.",
          action: "Hạn chế sử dụng bưởi chùm thường xuyên."
        },
        dabigatran: {
          severity: "minor",
          mechanism: "Dabigatran không chuyển hóa qua CYP3A4 nên không bị ảnh hưởng.",
          action: "Không có tương tác đáng kể."
        },
        warfarin: {
          severity: "moderate",
          mechanism: "Ức chế CYP3A4 làm tăng nồng độ đồng phân R-warfarin.",
          action: "Tránh dùng thường xuyên, theo dõi INR."
        }
      }
    }
  ],

  // Bảng phân loại mức độ nghiêm trọng
  severityLevels: {
    contraindicated: {
      label: "CHỐNG CHỈ ĐỊNH / TRÁNH PHỐI HỢP",
      badgeColor: "bg-red-600 text-white",
      borderColor: "border-red-500",
      icon: "fa-ban",
      desc: "Tương tác cực kỳ nguy hiểm, có thể đe dọa tính mạng (tăng nguy cơ xuất huyết tử vong hoặc mất hoàn toàn hiệu lực bảo vệ). Phải chọn thuốc thay thế khác."
    },
    major: {
      label: "NGUY CƠ CAO - CẦN CAN THIỆP",
      badgeColor: "bg-orange-600 text-white",
      borderColor: "border-orange-500",
      icon: "fa-triangle-exclamation",
      desc: "Tương tác nghiêm trọng, nguy cơ xuất huyết hoặc biến chứng cao. Bắt buộc phải điều chỉnh liều, theo dõi sát xét nghiệm (INR/CrCl) hoặc dùng kèm thuốc bảo vệ."
    },
    moderate: {
      label: "THẬN TRỌNG - THEO DÕI",
      badgeColor: "bg-amber-500 text-slate-900",
      borderColor: "border-amber-500",
      icon: "fa-circle-exclamation",
      desc: "Có thể phối hợp trên lâm sàng nhưng cần giám sát các dấu hiệu lâm sàng (chảy máu cam, bầm tím, xuất huyết chân răng) và kiểm tra chức năng cơ quan."
    },
    minor: {
      label: "ÍT Ý NGHĨA LÂM SÀNG / AN TOÀN TƯƠNG ĐỐI",
      badgeColor: "bg-emerald-600 text-white",
      borderColor: "border-emerald-500",
      icon: "fa-circle-check",
      desc: "Tương tác nhẹ hoặc không có tương tác rõ ràng. Phối hợp được dưới sự theo dõi điều trị thông thường."
    }
  },

  // Dấu hiệu cảnh báo xuất huyết nguy kịch bệnh nhân cần biết
  redFlags: [
    "Nôn ra máu hoặc chất nôn màu nâu đen như bã cà phê",
    "Đi ngoài phân đen nhánh như nhựa đường, phân có máu tươi",
    "Tiểu tiện ra nước tiểu màu đỏ, hồng hoặc màu nước vối sẫm",
    "Bầm tím tự phát xuất hiện nhiều nơi, lan rộng không rõ nguyên nhân",
    "Chảy máu mũi, chảy máu chân răng kéo dài trên 10-15 phút không cầm",
    "Đau đầu dữ dội đột ngột, chóng mặt nhiều, ngất hoặc yếu liệt một bên cơ thể (cảnh báo xuất huyết não)",
    "Vết đứt tay hoặc vết thương chảy máu liên tục không tự cầm được"
  ],

  // Hướng dẫn lâm sàng bổ sung: Chức năng thận & DOACs
  renalCutoffs: {
    rivaroxaban: "Rung nhĩ: CrCl 15 - 49 ml/phút dùng liều 15mg/ngày. Chống chỉ định khi CrCl < 15 ml/phút.",
    apixaban: "Giảm liều còn 2.5mg x 2 lần/ngày khi có ít nhất 2 trong 3 tiêu chuẩn: Tuổi >= 80, Cân nặng <= 60kg, Creatinine huyết thanh >= 1.5 mg/dL (133 µmol/L).",
    dabigatran: "CrCl 30 - 50 ml/phút: Cân nhắc giảm liều 110mg x 2 lần/ngày. Chống chỉ định tuyệt đối khi CrCl < 30 ml/phút."
  }
};

// Export cho môi trường module hoặc gắn vào window trong browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ANTICOAGULANT_KB;
} else if (typeof window !== 'undefined') {
  window.ANTICOAGULANT_KB = ANTICOAGULANT_KB;
}
