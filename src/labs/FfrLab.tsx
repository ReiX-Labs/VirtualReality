import { useMemo, useState } from "react";

// Lab for §3.8 — Fixed Foveated Rendering.
// Cái bẫy ở đây không phải là chọn sai mức, mà là đặt MỘT trong hai dòng ini
// rồi tưởng FFR đã bật. Nó không báo lỗi. Nó chỉ im lặng không làm gì.

const LEVELS = ["Off", "Low", "Medium", "High", "HighTop"];
/** Ước lượng phần GPU tiết kiệm ở mỗi mức — con số minh hoạ, không phải đo thật. */
const SAVING = [0, 0.1, 0.18, 0.28, 0.34];
const ARTIFACT = [
  "Không có.",
  "Gần như không nhận ra.",
  "Rìa tầm nhìn hơi mờ khi liếc mắt.",
  "Thấy rõ nếu bạn cố tình liếc sang bên.",
  "Rõ ở rìa và ở đỉnh tầm nhìn — chỉ dùng khi đã hết cách.",
];

export default function FfrLab() {
  const [hasMethod, setMethod] = useState(false);
  const [hasLevel, setLevel] = useState(true);
  const [level, setLv] = useState(2);
  const [dynamic, setDynamic] = useState(false);
  const [baseGpu, setBase] = useState(14.5);

  const active = hasMethod && hasLevel && level > 0;
  const saved = active ? baseGpu * SAVING[level] : 0;
  const gpu = baseGpu - saved;

  const ini = useMemo(() => {
    const rows = ["[/Script/OculusXRHMD.OculusXRHMDRuntimeSettings]"];
    if (hasMethod) rows.push("FoveatedRenderingMethod=FixedFoveatedRendering");
    if (hasLevel) rows.push(`FoveatedRenderingLevel=${LEVELS[level]}`);
    if (dynamic) rows.push("bDynamicFoveatedRendering=True");
    return rows.join("\n");
  }, [hasMethod, hasLevel, level, dynamic]);

  let verdict: { tone: string; title: string; note: string };
  if (!hasMethod && !hasLevel) {
    verdict = {
      tone: "info",
      title: "FFR tắt hoàn toàn",
      note: "Không có dòng nào — đúng và trung thực. Bạn biết mình đang không dùng FFR.",
    };
  } else if (!hasMethod) {
    verdict = {
      tone: "danger",
      title: "❌ Cái bẫy — FFR im lặng không bật",
      note: "Bạn đặt Level nhưng thiếu dòng Method. Không có warning, không có log, không có lỗi build. Bạn nghĩ đã tiết kiệm 20% GPU, thực tế là 0%. Đây là bẫy #10 trong sổ tay.",
    };
  } else if (!hasLevel) {
    verdict = {
      tone: "warn",
      title: "⚠️ Có Method nhưng không có Level",
      note: "Method nói 'dùng kiểu nào', Level nói 'mạnh bao nhiêu'. Thiếu Level thì hành vi phụ thuộc giá trị mặc định của runtime — đừng phó mặc.",
    };
  } else if (level === 0) {
    verdict = {
      tone: "info",
      title: "Level = Off",
      note: "Hai dòng đầy đủ nhưng mức là Off. Về hiệu quả thì giống như tắt, chỉ khác là ý định của bạn được ghi rõ trong file config.",
    };
  } else {
    verdict = {
      tone: "ok",
      title: `✅ FFR đang chạy ở mức ${LEVELS[level]}`,
      note: `Tiết kiệm khoảng ${saved.toFixed(1)} ms GPU. ${ARTIFACT[level]}${
        dynamic ? " Chế độ động sẽ tự hạ mức khi còn dư ngân sách." : ""
      }`,
    };
  }

  return (
    <div className="lab">
      <p className="lab-hint">
        FFR giảm độ phân giải ở <b>rìa</b> tầm nhìn, nơi mắt người vốn đã không nhìn rõ. Ống kính
        Quest 3 cũng mờ dần ở rìa, nên bạn gần như không nhận ra. Nhưng nó chỉ bật khi có{" "}
        <b>đủ cả hai</b> dòng ini.
      </p>

      <div className="toggle-row">
        <button className={"preset" + (hasMethod ? " on" : "")} onClick={() => setMethod((v) => !v)}>
          {hasMethod ? "☑" : "☐"} FoveatedRenderingMethod
        </button>
        <button className={"preset" + (hasLevel ? " on" : "")} onClick={() => setLevel((v) => !v)}>
          {hasLevel ? "☑" : "☐"} FoveatedRenderingLevel
        </button>
        <button className={"preset" + (dynamic ? " on" : "")} onClick={() => setDynamic((v) => !v)}>
          {dynamic ? "☑" : "☐"} bDynamicFoveatedRendering
        </button>
      </div>

      <div className="knob-grid">
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Mức FFR</span>
            <span className="knob-val mono">{LEVELS[level]}</span>
          </span>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={level}
            onChange={(e) => setLv(Number(e.target.value))}
            disabled={!hasLevel}
          />
          <span className="knob-hint">{ARTIFACT[level]}</span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">GPU time khi chưa có FFR</span>
            <span className="knob-val mono">{baseGpu.toFixed(1)} ms</span>
          </span>
          <input
            type="range"
            min={8}
            max={22}
            step={0.5}
            value={baseGpu}
            onChange={(e) => setBase(Number(e.target.value))}
          />
          <span className="knob-hint">Đặt bằng con số bạn đo được từ `stat unit` trên device.</span>
        </label>
      </div>

      <pre className="code-out">{ini}</pre>

      <div className="lab-bars">
        <div className="bar-row">
          <span className="bar-label">Không FFR</span>
          <span className="bar-track">
            <span
              className={"bar-fill " + (baseGpu > 13.8 ? "over" : "")}
              style={{ width: (baseGpu / 22) * 100 + "%" }}
            />
            <span className="bar-limit" style={{ left: (13.8 / 22) * 100 + "%" }} />
          </span>
          <span className="bar-val mono">{baseGpu.toFixed(1)} ms</span>
        </div>
        <div className="bar-row">
          <span className="bar-label">Config hiện tại</span>
          <span className="bar-track">
            <span
              className={"bar-fill " + (gpu > 13.8 ? "over" : "hot")}
              style={{ width: (gpu / 22) * 100 + "%" }}
            />
            <span className="bar-limit" style={{ left: (13.8 / 22) * 100 + "%" }} />
          </span>
          <span className="bar-val mono">{gpu.toFixed(1)} ms</span>
        </div>
        <div className="bar-caption">Vạch đứng là 13,8 ms — ngân sách một frame ở 72 Hz.</div>
      </div>

      <div className={"lab-verdict " + verdict.tone}>
        <div className="lv-title">{verdict.title}</div>
        <div className="lv-note">{verdict.note}</div>
      </div>

      <details className="lab-note">
        <summary>Làm sao biết chắc FFR đã bật trên device?</summary>
        <p>
          Đừng tin file config. Đo: chạy <code>stat unit</code> trên device, ghi GPU time; xoá dòng{" "}
          <code>FoveatedRenderingMethod</code>, build lại, đo lại. Nếu hai con số bằng nhau thì FFR
          chưa từng bật.
        </p>
        <p className="dim">
          ❓ ETFR (eye-tracked foveated rendering) chỉ có ý nghĩa trên thiết bị có eye tracking —
          Quest 3 <b>không</b> có. Đừng mất thời gian với nó ở đây.
        </p>
      </details>
    </div>
  );
}
