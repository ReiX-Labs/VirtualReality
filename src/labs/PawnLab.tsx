import { useState } from "react";

// Lab for §4.2 và §4.5 — giải phẫu VR Pawn.
// Bên trái là cây component. Bên phải là những lỗi kinh điển: bấm để "gài" lỗi
// vào pawn và xem triệu chứng. Bốn trong số chúng COMPILE SẠCH — đó là loại lỗi
// tốn nhiều giờ nhất.

interface NodeDef {
  id: string;
  name: string;
  type: string;
  depth: number;
  why: string;
}

const TREE: NodeDef[] = [
  {
    id: "capsule",
    name: "CapsuleComponent",
    type: "RootComponent",
    depth: 0,
    why: "Root của Pawn. Đây là thứ va chạm với tường. Nó KHÔNG tự đi theo đầu bạn — bạn phải tự cập nhật nó mỗi frame.",
  },
  {
    id: "origin",
    name: "VROrigin",
    type: "USceneComponent",
    depth: 1,
    why: "Đại diện cho sàn phòng thật. Mọi thứ liên quan tới tracking đều treo dưới đây. Tách nó ra khỏi capsule là chìa khoá để dịch chuyển người chơi mà không phá tracking.",
  },
  {
    id: "camera",
    name: "Camera",
    type: "UCameraComponent",
    depth: 2,
    why: "bLockToHmd = true. Vị trí của nó do runtime XR ghi đè mỗi frame — bạn không set nó, bạn ĐỌC nó.",
  },
  {
    id: "mcL",
    name: "MotionController_L",
    type: "UMotionControllerComponent",
    depth: 2,
    why: "MotionSource = Left. Component này chỉ mang toạ độ — nó không tự vẽ ra cái gì.",
  },
  {
    id: "visL",
    name: "Visualization_L",
    type: "UXRDeviceVisualizationComponent",
    depth: 3,
    why: "Đây mới là thứ vẽ ra model controller. Từ UE 5.1 việc hiển thị bị tách khỏi UMotionControllerComponent. Thiếu nó là tay bạn vô hình.",
  },
  {
    id: "mcR",
    name: "MotionController_R",
    type: "UMotionControllerComponent",
    depth: 2,
    why: "MotionSource = Right.",
  },
  {
    id: "visR",
    name: "Visualization_R",
    type: "UXRDeviceVisualizationComponent",
    depth: 3,
    why: "Cùng lý do như bên trái.",
  },
  {
    id: "aim",
    name: "TeleportArc / WidgetInteraction",
    type: "USceneComponent",
    depth: 3,
    why: "Treo dưới controller phải. Mọi thứ 'chĩa ra từ tay' nên nằm ở đây, không nằm ở pawn.",
  },
];

interface Bug {
  id: string;
  label: string;
  symptom: string;
  fix: string;
  compiles: boolean;
  ref: string;
}

const BUGS: Bug[] = [
  {
    id: "floor",
    label: "Dùng EHMDTrackingOrigin::Floor",
    symptom: "Không compile. Lỗi báo là 'Floor' không phải thành viên của enum.",
    fix: "UE5 chỉ có Local / Stage / View (và các biến thể). Dùng Stage cho nội dung đứng/đi lại trong phòng.",
    compiles: false,
    ref: "§4.2, §B N1",
  },
  {
    id: "noorigin",
    label: "Quên gọi SetTrackingOrigin",
    symptom:
      "Compile sạch. Trên device: bạn lùn hơn hoặc lơ lửng, và chiều cao thay đổi tuỳ vị trí đầu lúc app khởi động.",
    fix: "Gọi SetTrackingOrigin(EHMDTrackingOrigin::Stage) trong BeginPlay.",
    compiles: true,
    ref: "§4.2",
  },
  {
    id: "nolock",
    label: "Quên bLockToHmd = true",
    symptom:
      "Compile sạch. Camera không đi theo đầu — bạn xoay đầu mà hình không đổi. Đây là cảm giác tệ nhất trong VR.",
    fix: "Camera->bLockToHmd = true; ngay sau khi tạo component.",
    compiles: true,
    ref: "§4.3",
  },
  {
    id: "novis",
    label: "Chỉ có MotionController, không có XRDeviceVisualization",
    symptom:
      "Compile sạch. Toạ độ tay đúng, nhưng không thấy model controller đâu cả. Bạn có tay vô hình.",
    fix: "Thêm UXRDeviceVisualizationComponent làm con của mỗi motion controller. Nó nằm ở plugin XRBase.",
    compiles: true,
    ref: "§4.4, §B N3",
  },
  {
    id: "setrel",
    label: "SetRelativeLocation trên capsule root",
    symptom:
      "Compile sạch. Capsule nhảy về gốc rồi lệch dần — vì bạn đang set vị trí TƯƠNG ĐỐI trên chính cái root, tức là tương đối với chính nó.",
    fix: "Tính delta trong không gian world rồi cộng vào, hoặc dịch VROrigin ngược lại thay vì dịch root.",
    compiles: true,
    ref: "§4.5, §B N4, §A.5 #54",
  },
  {
    id: "completed",
    label: "Bind trục di chuyển vào ETriggerEvent::Completed",
    symptom:
      "Compile sạch. Bạn đẩy cần mà không có gì xảy ra, cho tới khi bạn THẢ cần — lúc đó nó nhích một cái rồi dừng.",
    fix: "Trục liên tục phải bind vào Triggered. Completed chỉ bắn một lần khi input kết thúc.",
    compiles: true,
    ref: "§4.6",
  },
  {
    id: "nooffset",
    label: "Teleport không bù CameraOffset",
    symptom:
      "Compile sạch, và ĐÚNG khi bạn đứng giữa phòng. Sai khi bạn đi bộ thật sang một góc rồi mới teleport — bạn đáp lệch đúng bằng khoảng bạn đã đi.",
    fix: "Trừ đi độ lệch ngang giữa camera và VROrigin trước khi đặt vị trí mới.",
    compiles: true,
    ref: "§4.7",
  },
  {
    id: "nodeadzone",
    label: "Snap turn không có deadzone",
    symptom:
      "Compile sạch. Cần gạt hơi lệch một chút là màn hình xoay liên tục — chóng mặt ngay lập tức.",
    fix: "Chỉ xoay khi |trục| > 0.7, và khoá lại cho tới khi cần về giữa.",
    compiles: true,
    ref: "§4.7",
  },
];

export default function PawnLab() {
  const [sel, setSel] = useState("origin");
  const [bug, setBug] = useState<string | null>(null);
  const node = TREE.find((n) => n.id === sel)!;
  const activeBug = BUGS.find((b) => b.id === bug);

  return (
    <div className="lab">
      <div className="lab-h">Cây component của AVRPawn</div>
      <div className="pawn-split">
        <div className="tree">
          {TREE.map((n) => (
            <button
              key={n.id}
              className={"tn" + (sel === n.id ? " on" : "")}
              style={{ paddingLeft: 10 + n.depth * 18 }}
              onClick={() => setSel(n.id)}
            >
              <span className="tn-guide">{n.depth > 0 ? "└" : "▣"}</span>
              <span className="tn-name">{n.name}</span>
              <span className="tn-type mono">{n.type}</span>
            </button>
          ))}
        </div>
        <div className="tn-detail">
          <div className="tnd-name">{node.name}</div>
          <div className="tnd-type mono">{node.type}</div>
          <p className="tnd-why">{node.why}</p>
        </div>
      </div>

      <div className="lab-h">Gài một lỗi kinh điển vào pawn</div>
      <div className="lab-presets">
        {BUGS.map((b) => (
          <button
            key={b.id}
            className={"preset" + (bug === b.id ? " on" : "")}
            onClick={() => setBug(bug === b.id ? null : b.id)}
          >
            {b.compiles ? "🟡" : "🔴"} {b.label}
          </button>
        ))}
      </div>

      {activeBug ? (
        <div className={"lab-verdict " + (activeBug.compiles ? "warn" : "danger")}>
          <div className="lv-title">
            {activeBug.compiles ? "🟡 Compile sạch — và vẫn sai" : "🔴 Không compile"}
          </div>
          <div className="lv-note">
            <p>
              <b>Triệu chứng:</b> {activeBug.symptom}
            </p>
            <p>
              <b>Sửa:</b> {activeBug.fix}
            </p>
          </div>
          <div className="lv-cost">Tham chiếu: {activeBug.ref}</div>
        </div>
      ) : (
        <div className="lab-verdict info">
          <div className="lv-title">🔴 không compile · 🟡 compile sạch nhưng vẫn sai</div>
          <div className="lv-note">
            Sáu trong tám lỗi ở trên <b>compile hoàn toàn sạch</b>. Compiler không biết gì về tiền
            đình của bạn. Đó là lý do mọi thứ trong chương này phải verify trên device chứ không
            phải trong editor.
          </div>
        </div>
      )}

      <details className="lab-note">
        <summary>Vì sao capsule không tự đi theo đầu?</summary>
        <p>
          Vì runtime XR chỉ ghi vị trí vào <i>camera</i>. Nếu bạn bước sang phải một bước trong phòng
          thật, camera dịch sang phải nhưng capsule vẫn đứng yên — bạn có thể thò đầu xuyên tường.
          Mỗi frame bạn phải đọc vị trí ngang của camera và dịch capsule theo.
        </p>
        <p className="dim">
          Và khi làm việc đó, đừng dùng <code>SetRelativeLocation</code> trên chính root component —
          đó là lỗi N4 trong danh sách tự sửa của tài liệu này, và nó compile sạch.
        </p>
      </details>
    </div>
  );
}
