import { useMemo, useState } from "react";

// Lab for §2.2 và §9.3 — ngân sách 13,8 ms.
// Ba luồng chạy song song (Game / Draw / GPU). Frame time KHÔNG phải tổng của
// chúng — nó là cái chậm nhất. Đó là lý do cộng thêm CPU khi đang nghẽn GPU
// thì chẳng mất gì, còn tối ưu nhầm luồng thì tốn cả tuần mà fps không nhúc nhích.

interface Knob {
  id: string;
  label: string;
  hint: string;
  /** ms added per unit, per thread */
  game: number;
  draw: number;
  gpu: number;
  min: number;
  max: number;
  step: number;
  def: number;
  unit: string;
}

const KNOBS: Knob[] = [
  {
    id: "actors",
    label: "Actor có Tick",
    hint: "Mỗi actor tick là một lần gọi hàm mỗi frame trên Game Thread.",
    game: 0.012,
    draw: 0,
    gpu: 0,
    min: 0,
    max: 400,
    step: 10,
    def: 60,
    unit: "actor",
  },
  {
    id: "draws",
    label: "Draw call",
    hint: "Trần thực tế trên Quest 3 là 500–1.000. Mỗi call là một lần CPU bảo GPU vẽ.",
    game: 0,
    draw: 0.0075,
    gpu: 0.0022,
    min: 100,
    max: 2000,
    step: 50,
    def: 700,
    unit: "call",
  },
  {
    id: "tris",
    label: "Triangle",
    hint: "Ngân sách 1–2 triệu tam giác cho toàn cảnh — tính cho cả hai mắt.",
    game: 0,
    draw: 0,
    gpu: 2.1,
    min: 0.2,
    max: 5,
    step: 0.1,
    def: 1.2,
    unit: "triệu",
  },
  {
    id: "sp",
    label: "r.ScreenPercentage",
    hint: "Núm vặn số một. Chi phí tăng theo bình phương — 141% là gấp đôi pixel.",
    game: 0,
    draw: 0,
    gpu: 0,
    min: 70,
    max: 170,
    step: 5,
    def: 100,
    unit: "%",
  },
  {
    id: "lights",
    label: "Đèn động đổ bóng",
    hint: "Mỗi đèn đổ bóng là thêm một lượt render toàn cảnh vào shadow map.",
    game: 0,
    draw: 0.24,
    gpu: 0.95,
    min: 0,
    max: 8,
    step: 1,
    def: 1,
    unit: "đèn",
  },
];

const REFRESH = [
  { hz: 72, ms: 13.8, note: "Mặc định an toàn của Quest 3." },
  { hz: 80, ms: 12.5, note: "Cần khai báo trong danh sách tần số hỗ trợ." },
  { hz: 90, ms: 11.1, note: "Đẹp, nhưng ngân sách hụt 2,7 ms so với 72 Hz." },
  { hz: 120, ms: 8.3, note: "Chỉ hợp lý cho cảnh rất nhẹ." },
];

/** Passthrough, compositor layer, và các chi phí nền cố định. */
const BASE = { game: 1.4, draw: 1.1, gpu: 2.6 };

export default function BudgetLab() {
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(KNOBS.map((k) => [k.id, k.def])),
  );
  const [hz, setHz] = useState(72);
  const [passthrough, setPassthrough] = useState(false);
  const [thermal, setThermal] = useState(false);

  const set = (id: string, v: number) => setVals((p) => ({ ...p, [id]: v }));

  const r = useMemo(() => {
    const spScale = Math.pow(vals.sp / 100, 2);
    let game = BASE.game;
    let draw = BASE.draw;
    let gpu = BASE.gpu;

    for (const k of KNOBS) {
      if (k.id === "sp") continue;
      const v = vals[k.id];
      game += k.game * v;
      draw += k.draw * v;
      // pixel-bound work scales with resolution; geometry/draw setup does not
      gpu += k.gpu * v * (k.id === "tris" ? 1 : spScale);
    }
    gpu *= spScale;
    if (passthrough) gpu += 1.1;

    // Thermal throttle: the SoC clocks down, everything gets slower.
    const heat = thermal ? 1.18 : 1;
    game *= heat;
    draw *= heat;
    gpu *= heat;

    const frame = Math.max(game, draw, gpu);
    const budget = REFRESH.find((x) => x.hz === hz)!.ms;
    const fps = Math.min(hz, 1000 / frame);
    const bottleneck = gpu >= game && gpu >= draw ? "GPU" : draw >= game ? "Draw" : "Game";
    return { game, draw, gpu, frame, budget, fps, bottleneck, headroom: budget - frame };
  }, [vals, hz, passthrough, thermal]);

  const scale = Math.max(r.budget * 1.6, r.frame * 1.08);
  const bar = (label: string, ms: number, hot: boolean) => (
    <div className="bar-row" key={label}>
      <span className="bar-label">
        {label}
        {hot && <b className="bar-tag">nghẽn</b>}
      </span>
      <span className="bar-track">
        <span
          className={"bar-fill " + (ms > r.budget ? "over" : hot ? "hot" : "")}
          style={{ width: (ms / scale) * 100 + "%" }}
        />
        <span className="bar-limit" style={{ left: (r.budget / scale) * 100 + "%" }} />
      </span>
      <span className="bar-val mono">{ms.toFixed(1)} ms</span>
    </div>
  );

  const ok = r.frame <= r.budget;

  return (
    <div className="lab">
      <div className="lab-controls wrap">
        <div className="lab-field">
          <span>Tần số hiển thị</span>
          <div className="seg">
            {REFRESH.map((x) => (
              <button
                key={x.hz}
                className={"seg-btn" + (hz === x.hz ? " on" : "")}
                onClick={() => setHz(x.hz)}
              >
                {x.hz} Hz
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="budget-head">
        <div className="bh-num mono">{r.budget.toFixed(1)} ms</div>
        <div className="bh-note">
          Toàn bộ ngân sách cho <b>một frame</b> ở {hz} Hz. Vượt quá là compositor bắt đầu tái chiếu
          frame cũ — người dùng thấy giật, và cảm thấy buồn nôn.
        </div>
      </div>

      <div className="knob-grid">
        {KNOBS.map((k) => (
          <label className="knob" key={k.id}>
            <span className="knob-head">
              <span className="knob-name">{k.label}</span>
              <span className="knob-val mono">
                {vals[k.id]} {k.unit}
              </span>
            </span>
            <input
              type="range"
              min={k.min}
              max={k.max}
              step={k.step}
              value={vals[k.id]}
              onChange={(e) => set(k.id, Number(e.target.value))}
            />
            <span className="knob-hint">{k.hint}</span>
          </label>
        ))}
      </div>

      <div className="toggle-row">
        <button
          className={"preset" + (passthrough ? " on" : "")}
          onClick={() => setPassthrough((v) => !v)}
        >
          {passthrough ? "☑" : "☐"} Passthrough bật (+1,1 ms GPU)
        </button>
        <button className={"preset" + (thermal ? " on" : "")} onClick={() => setThermal((v) => !v)}>
          {thermal ? "☑" : "☐"} Sau 20 phút, máy nóng (+18% mọi thứ)
        </button>
      </div>

      <div className="lab-bars">
        {bar("Game", r.game, r.bottleneck === "Game")}
        {bar("Draw", r.draw, r.bottleneck === "Draw")}
        {bar("GPU", r.gpu, r.bottleneck === "GPU")}
        <div className="bar-caption">
          Vạch đứng là mốc {r.budget.toFixed(1)} ms. Frame time = <b>luồng chậm nhất</b>, không phải
          tổng ba luồng.
        </div>
      </div>

      <div className={"lab-verdict " + (ok ? "ok" : r.frame > r.budget * 1.35 ? "danger" : "warn")}>
        <div className="lv-title">
          {ok ? "✅" : "⚠️"} {r.frame.toFixed(1)} ms → ~{r.fps.toFixed(0)} fps · nghẽn ở{" "}
          {r.bottleneck}
        </div>
        <div className="lv-note">
          {ok ? (
            <>
              Còn dư <b>{r.headroom.toFixed(1)} ms</b>. Nhưng đừng tiêu hết: nhiệt sẽ ăn mất phần
              dư đó sau 15–20 phút chơi. Hãy để lại đệm.
            </>
          ) : (
            <>
              Thiếu <b>{Math.abs(r.headroom).toFixed(1)} ms</b>. Đang nghẽn ở <b>{r.bottleneck}</b> —
              nên tối ưu đúng luồng đó.{" "}
              {r.bottleneck === "GPU" && "Hạ r.ScreenPercentage trước, đó là núm rẻ nhất."}
              {r.bottleneck === "Draw" && "Gộp mesh, giảm số material, dùng instancing."}
              {r.bottleneck === "Game" && "Tắt tick không cần thiết, chuyển sang timer hoặc event."}
            </>
          )}
        </div>
        <div className="lv-cost">
          Tối ưu luồng <i>không</i> nghẽn sẽ không thay đổi fps một chút nào — đó là cách người ta
          mất cả tuần.
        </div>
      </div>

      <details className="lab-note">
        <summary>Vì sao 13,8 ms mà không phải 16,6 ms như game phẳng?</summary>
        <p>
          Game phẳng chạy 60 fps có 16,6 ms và khi tụt xuống 50 fps thì người chơi chỉ thấy hơi
          khựng. VR ở 72 Hz có <b>13,8 ms</b>, và khi trượt thì hình ảnh không khớp chuyển động đầu
          nữa — hệ tiền đình phản ứng bằng buồn nôn. Đây là khác biệt giữa “trải nghiệm kém” và
          “người dùng tháo kính ra”.
        </p>
        <p className="dim">
          Con số này còn phải chia cho <i>hai mắt</i>. Multi-View giúp phần CPU, nhưng pixel thì vẫn
          phải tô đủ hai lần.
        </p>
      </details>
    </div>
  );
}
