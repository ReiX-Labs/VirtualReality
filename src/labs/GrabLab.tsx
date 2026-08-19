import { useMemo, useState } from "react";

// Lab for §5.1 và §5.3 — ba mô hình tương tác, attach vs constraint, và
// công thức vận tốc ném.
// Phần cuối là lỗi N5 trong chính bản nháp của tài liệu này: quãng đường N
// frame bị chia cho dt của MỘT frame. Compile sạch, và vật ném ra mạnh gấp 3–4
// lần. Kéo thanh trượt để tự thấy hệ số thổi phồng.

const MODELS = [
  {
    id: "contact",
    icon: "🤏",
    name: "Direct / contact-based",
    when: "Vật trong tầm tay",
    feel: "Tự nhiên nhất, cho cảm giác “có mặt” mạnh nhất",
    verdict:
      "Giáo án này làm contact-based TRƯỚC, vì nó dạy đúng thứ trực giác VR cần: đưa tay tới, chạm, nắm.",
    tone: "ok",
  },
  {
    id: "ray",
    icon: "📡",
    name: "Ray / distance grab",
    when: "Vật xa, ngoài tầm với",
    feel: "Tiện, nhưng kém tự nhiên",
    verdict:
      "Ray dễ viết hơn nhưng dạy sai trực giác — nó biến VR thành con trỏ chuột 3D. Dùng khi thật sự cần với xa, đừng dùng làm mặc định.",
    tone: "warn",
  },
  {
    id: "poke",
    icon: "👆",
    name: "Poke",
    when: "Nút bấm, UI",
    feel: "Tốt cho UI phẳng đặt gần",
    verdict: "Đúng chỗ của nó là UI trong tầm với. Không dùng để nhặt đồ.",
    tone: "info",
  },
];

const ATTACH = [
  ["Vật xuyên qua tường khi bạn thọc tay vào tường", "Có", "Không"],
  ["Cảm giác nặng/nhẹ", "Không có", "Có"],
  ["Độ phức tạp", "Thấp", "Cao"],
  ["Chi phí CPU", "Thấp", "Cao hơn"],
];

export default function GrabLab() {
  const [model, setModel] = useState("contact");
  const [samples, setSamples] = useState(4);
  const [wrongDenom, setWrong] = useState(true);
  const [speed, setSpeed] = useState(180);

  const m = MODELS.find((x) => x.id === model)!;

  const v = useMemo(() => {
    const dt = 1 / 72; // một frame ở 72 Hz
    const span = samples - 1;
    // quãng đường thực người chơi vung tay được trong span frame
    const distance = (speed * span * dt) / 100; // mét
    const correct = distance / (span * dt);
    const wrong = distance / dt;
    return { correct, wrong, ratio: span, distance };
  }, [samples, speed]);

  return (
    <div className="lab">
      <div className="lab-h">Ba mô hình tương tác</div>
      <div className="model-grid">
        {MODELS.map((x) => (
          <button
            key={x.id}
            className={"model" + (model === x.id ? " on" : "")}
            onClick={() => setModel(x.id)}
          >
            <span className="mdl-icon">{x.icon}</span>
            <span className="mdl-name">{x.name}</span>
            <span className="mdl-when">{x.when}</span>
          </button>
        ))}
      </div>
      <div className={"lab-verdict " + m.tone}>
        <div className="lv-title">
          {m.icon} {m.name}
        </div>
        <div className="lv-note">
          <b>Cảm giác:</b> {m.feel}
          <br />
          {m.verdict}
        </div>
      </div>

      <div className="lab-h">Attach hay physics constraint?</div>
      <div className="mini-table">
        <div className="mtr head">
          <span />
          <span>Attach</span>
          <span>Physics constraint</span>
        </div>
        {ATTACH.map((row) => (
          <div className="mtr" key={row[0]}>
            <span className="mtr-k">{row[0]}</span>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
          </div>
        ))}
      </div>
      <p className="lab-hint">
        <b>Cho giáo án này: dùng attach.</b> Constraint cho cảm giác chân thực hơn nhưng kéo theo cả
        một lớp vấn đề mới — jitter, vật kẹt, giật khi va chạm — mà người mới chưa nên đụng vào. Nhớ
        dùng <code>KeepWorldTransform</code>, và bật lại physics khi thả.
      </p>

      <div className="lab-h">Vận tốc ném — cái bẫy mẫu số</div>
      <p className="lab-hint">
        Vận tốc tính từ đúng một frame rất nhiễu: chỉ cần một frame bị hụt là vật bay ra vô lý. Trung
        bình 3–4 frame ổn hơn nhiều. Nhưng <b>mẫu số quan trọng không kém tử số</b>.
      </p>

      <div className="knob-grid">
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Số mẫu trong vòng đệm</span>
            <span className="knob-val mono">{samples}</span>
          </span>
          <input type="range" min={2} max={6} step={1} value={samples} onChange={(e) => setSamples(Number(e.target.value))} />
          <span className="knob-hint">
            Khoảng thời gian giữa mẫu cũ nhất và mới nhất là <b>({samples} − 1) × dt</b>, không phải
            dt.
          </span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Tốc độ vung tay</span>
            <span className="knob-val mono">{(speed / 100).toFixed(1)} m/s</span>
          </span>
          <input type="range" min={40} max={600} step={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          <span className="knob-hint">Tốc độ thật của bàn tay bạn lúc thả vật.</span>
        </label>
      </div>

      <div className="toggle-row">
        <button className={"preset" + (wrongDenom ? " on" : "")} onClick={() => setWrong((x) => !x)}>
          {wrongDenom ? "☑" : "☐"} Chia cho dt của <b>một</b> frame (bản nháp sai)
        </button>
      </div>

      <pre className="code-out">
        {wrongDenom
          ? `// ❌ Lỗi N5 — compile sạch, và vật ném "như có ma"
const float SpanSeconds = DeltaTime;                       // SAI
Velocity = (Newest - Oldest) / SpanSeconds;`
          : `// ✅ Đúng — quãng đường N frame chia cho (N−1)×dt
const int32 Span = NumValidSamples - 1;
const float SpanSeconds = Span * DeltaTime;
Velocity = (Newest - Oldest) / SpanSeconds;`}
      </pre>

      <div className="lab-bars">
        <div className="bar-row">
          <span className="bar-label">Vận tốc thật</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: (v.correct / (v.wrong || 1)) * 100 + "%" }} />
          </span>
          <span className="bar-val mono">{v.correct.toFixed(2)} m/s</span>
        </div>
        <div className="bar-row">
          <span className="bar-label">
            Vận tốc gán vào vật
            {wrongDenom && <b className="bar-tag">sai</b>}
          </span>
          <span className="bar-track">
            <span
              className={"bar-fill " + (wrongDenom ? "over" : "hot")}
              style={{ width: wrongDenom ? "100%" : (v.correct / (v.wrong || 1)) * 100 + "%" }}
            />
          </span>
          <span className="bar-val mono">{(wrongDenom ? v.wrong : v.correct).toFixed(2)} m/s</span>
        </div>
      </div>

      <div className={"lab-verdict " + (wrongDenom ? "danger" : "ok")}>
        <div className="lv-title">
          {wrongDenom ? `❌ Vận tốc bị thổi phồng ×${v.ratio}` : "✅ Vận tốc đúng"}
        </div>
        <div className="lv-note">
          {wrongDenom ? (
            <>
              Bạn cộng quãng đường của {samples} frame nhưng chia cho thời gian của{" "}
              <b>một</b> frame. Vật ném ra nhanh gấp {v.ratio} lần thực tế — và nó{" "}
              <b>compile hoàn toàn sạch</b>. Đây là lỗi N5 trong bản nháp của chính tài liệu này, và
              nó chỉ lộ ra khi chạy trên máy thật.
            </>
          ) : (
            <>
              Khoảng thời gian giữa mẫu cũ nhất và mới nhất là ({samples} − 1) × dt ={" "}
              {(v.ratio / 72).toFixed(4)} s. Chia đúng số đó thì vật bay ra đúng như tay bạn vung.
            </>
          )}
        </div>
        <div className="lv-cost">
          Bẫy #56 trong sổ tay: “quãng đường N frame chia cho dt của 1 frame”. Loại lỗi này không bao
          giờ bị bắt bởi “đọc lại cho kỹ” — nó bị bắt bởi chạy logic trong đầu như một cái máy, hoặc
          bởi máy thật.
        </div>
      </div>

      <details className="lab-note">
        <summary>Còn một cái bẫy nữa trong vòng đệm</summary>
        <p>
          Nếu bạn chỉ ghi vòng đệm vị trí ở lúc nắm mà không ghi trong <code>TickComponent</code>,
          thì vòng đệm mãi mãi là rác và vận tốc lúc thả vô nghĩa — kể cả khi công thức đúng.
        </p>
        <p className="dim">
          Kiến trúc đúng cho grab: interface <code>IGrabbable</code> để từng loại vật tự khai báo
          cách nó muốn được nắm, và một <code>UGrabberComponent</code> duy nhất. Nếu bạn phải sửa
          Grabber để hỗ trợ một loại vật mới, kiến trúc của bạn đang rò rỉ trách nhiệm.
        </p>
      </details>
    </div>
  );
}
