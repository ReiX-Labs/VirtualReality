import type { ComponentType } from "react";
import BudgetLab from "./BudgetLab";
import GeometryLab from "./GeometryLab";
import FfrLab from "./FfrLab";
import ConfigLab from "./ConfigLab";
import AdbLab from "./AdbLab";
import MetaXrLab from "./MetaXrLab";
import PawnLab from "./PawnLab";
import ComfortLab from "./ComfortLab";
import StereoLayerLab from "./StereoLayerLab";
import MrLab from "./MrLab";
import StatUnitLab from "./StatUnitLab";
import GrabLab from "./GrabLab";
import FadeLab from "./FadeLab";

export interface Lab {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  /** what the learner should be able to do after playing with it */
  goal: string;
  /** sections this lab belongs to — it is embedded inline in each of them */
  sectionIds: string[];
  Component: ComponentType;
}

export const labs: Lab[] = [
  {
    id: "budget",
    icon: "⏱",
    title: "Ngân sách 13,8 ms",
    blurb: "Ba luồng, một vạch đích. Vặn núm và xem luồng nào vỡ trước.",
    goal: "Biết frame time là luồng chậm nhất, không phải tổng — và biết mình đang nghẽn ở đâu.",
    sectionIds: ["2-2", "9-3"],
    Component: BudgetLab,
  },
  {
    id: "geometry",
    icon: "📐",
    title: "Draw call & triangle",
    blurb: "Dựng thử một cảnh và xem CPU phải nói chuyện với GPU bao nhiêu lần.",
    goal: "Ước lượng được draw call từ cấu trúc cảnh, và biết instancing đổi được bao nhiêu.",
    sectionIds: ["2-4", "9-5"],
    Component: GeometryLab,
  },
  {
    id: "config",
    icon: "⚙️",
    title: "Săn lỗi config Quest 3",
    blurb: "Chín lỗi gài sẵn trong một DefaultEngine.ini. Bấm vào dòng bạn nghi ngờ.",
    goal: "Đọc một file config VR là biết ngay dòng nào sai và sai thì hậu quả gì.",
    sectionIds: ["3-6", "3-7", "3-9", "d-1", "d-2"],
    Component: ConfigLab,
  },
  {
    id: "ffr",
    icon: "🎯",
    title: "FFR — cái bẫy hai dòng",
    blurb: "Đặt một dòng thì FFR im lặng không bật. Tự thấy khác biệt.",
    goal: "Không bao giờ tin file config — luôn đo lại trên device để xác nhận FFR thật sự chạy.",
    sectionIds: ["3-8", "3-10"],
    Component: FfrLab,
  },
  {
    id: "adb",
    icon: "🔌",
    title: "Chẩn đoán deploy",
    blurb: "Chọn triệu chứng, đi theo cây quyết định tới nguyên nhân thật.",
    goal: "Không mất buổi chiều nào cho `adb devices` trống hay app 'biến mất' sau khi cài.",
    sectionIds: ["0-4", "3-14"],
    Component: AdbLab,
  },
  {
    id: "metaxr",
    icon: "🧩",
    title: "Đường A hay Đường B?",
    blurb: "Tick tính năng bạn cần, lab sẽ nói bạn có thật sự cần compile fork không.",
    goal: "Không đốt một ngày build engine để lấy tính năng bạn chưa đo là có cần hay không.",
    sectionIds: ["1-5", "1-6", "1-9"],
    Component: MetaXrLab,
  },
  {
    id: "comfort",
    icon: "🧭",
    title: "Chấm điểm comfort",
    blurb: "Bốn luật vàng thành điểm số. Chú ý: fps là nhân tử, không phải điểm cộng.",
    goal: "Chọn được locomotion an toàn cho người mới, và biết vì sao fps đứng trước mọi thứ.",
    sectionIds: ["2-5", "4-7"],
    Component: ComfortLab,
  },
  {
    id: "pawn",
    icon: "🎮",
    title: "Giải phẫu VR Pawn",
    blurb: "Cây component, và tám lỗi kinh điển — sáu trong số đó compile sạch.",
    goal: "Dựng được pawn từ đầu, và nhận ra triệu chứng của từng lỗi trước khi mất cả buổi.",
    sectionIds: ["4-2", "4-3", "4-5"],
    Component: PawnLab,
  },
  {
    id: "grab",
    icon: "✋",
    title: "Nắm, thả, và cái bẫy mẫu số",
    blurb: "Ba mô hình tương tác, cộng công thức vận tốc ném bị thổi phồng ×3.",
    goal: "Chọn đúng mô hình tương tác, và không để vật bay ra 'như có ma'.",
    sectionIds: ["5-1", "5-3"],
    Component: GrabLab,
  },
  {
    id: "stereolayer",
    icon: "🖥",
    title: "Vì sao chữ VR bị nhoè",
    blurb: "Chuỗi bốn bước làm hỏng chữ, và đường tắt thẳng vào compositor.",
    goal: "Biết khi nào phải dùng stereo layer, và không bao giờ vượt quá 16 layer.",
    sectionIds: ["6-1", "6-2", "6-4"],
    Component: StereoLayerLab,
  },
  {
    id: "mr",
    icon: "🪟",
    title: "Passthrough đen & ba nhánh quyền",
    blurb: "Năm điều kiện, một triệu chứng. Tắt từng cái để thấy vì sao khó truy nguyên.",
    goal: "Sửa được màn hình đen một cách hệ thống, và không bao giờ để app treo vì thiếu quyền.",
    sectionIds: ["7-2", "7-3", "7-6"],
    Component: MrLab,
  },
  {
    id: "fade",
    icon: "🌗",
    title: "Fade XR-safe & watchdog",
    blurb: "Ba cách fade, hai trong số đó chạy trong editor và chết trên device.",
    goal: "Fade được cả compositor layer, và không bao giờ để người dùng kẹt trong màn đen.",
    sectionIds: ["8-2", "8-3", "8-4"],
    Component: FadeLab,
  },
  {
    id: "statunit",
    icon: "📊",
    title: "Đọc `stat unit`",
    blurb: "Sáu tình huống. Đoán nút thắt trước, xem đáp án sau.",
    goal: "Nhìn bốn con số là biết tối ưu cái gì — và biết cái gì tối ưu cũng vô ích.",
    sectionIds: ["9-3", "9-8"],
    Component: StatUnitLab,
  },
];

export const labsBySection: Record<string, Lab[]> = {};
for (const lab of labs) {
  for (const id of lab.sectionIds) {
    (labsBySection[id] ??= []).push(lab);
  }
}

export const labById = (id: string) => labs.find((l) => l.id === id);
