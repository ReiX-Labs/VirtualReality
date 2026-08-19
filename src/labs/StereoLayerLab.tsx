import { useMemo, useState } from "react";

// Lab for §6.1, §6.2, §6.4 — vì sao chữ VR bị nhoè, và compositor layer sửa nó
// thế nào. Bên trái mô phỏng chuỗi tổn thất; bên phải là đường thẳng vào
// compositor. Cộng thêm bộ đếm 16 layer.

interface Stage {
  id: string;
  label: string;
  why: string;
  /** phần chất lượng còn lại sau bước này */
  keep: (o: Opts) => number;
  /** stereo layer có đi qua bước này không? */
  hitsLayer: boolean;
}

interface Opts {
  sp: number;
  ffr: number;
  msaa: number;
  offCenter: boolean;
}

const STAGES: Stage[] = [
  {
    id: "sp",
    label: "Render vào scene ở r.ScreenPercentage",
    why: "Widget của bạn được vẽ thành texture ở độ phân giải đã nhân ScreenPercentage — không phải độ phân giải gốc của panel.",
    keep: (o) => Math.min(1, o.sp / 100),
    hitsLayer: false,
  },
  {
    id: "ffr",
    label: "Fixed Foveated Rendering",
    why: "Nếu menu nằm lệch khỏi trung tâm tầm nhìn, FFR chủ động giảm độ phân giải đúng chỗ nó nằm.",
    keep: (o) => (o.offCenter ? 1 - o.ffr * 0.09 : 1),
    hitsLayer: false,
  },
  {
    id: "msaa",
    label: "MSAA resolve",
    why: "Gộp nhiều sample thành một pixel. Tốt cho cạnh hình học, nhưng vẫn là một lần lấy mẫu lại đối với chữ.",
    keep: (o) => (o.msaa > 1 ? 0.95 : 0.9),
    hitsLayer: false,
  },
  {
    id: "reproj",
    label: "Reprojection của compositor",
    why: "Compositor lấy frame đã render và biến đổi nó theo tư thế đầu mới nhất — tức là lấy mẫu lại một lần nữa.",
    keep: () => 0.92,
    hitsLayer: false,
  },
];

const PRESETS = [
  { label: "Cỡ chữ 14pt, xa 2 m", size: 14, dist: 2.0 },
  { label: "Cỡ chữ 18pt, xa 1,5 m", size: 18, dist: 1.5 },
  { label: "Cỡ chữ 24pt, xa 1 m", size: 24, dist: 1.0 },
  { label: "Chữ nhỏ ở xa (khắc nghiệt)", size: 12, dist: 3.0 },
];

export default function StereoLayerLab() {
  const [opts, setOpts] = useState<Opts>({ sp: 100, ffr: 2, msaa: 4, offCenter: true });
  const [size, setSize] = useState(14);
  const [dist, setDist] = useState(2);
  const [layers, setLayers] = useState(4);

  const chain = useMemo(() => {
    let q = 1;
    const steps = STAGES.map((s) => {
      const k = s.keep(opts);
      q *= k;
      return { ...s, keep: k, after: q };
    });
    return { steps, world: q, layer: 1 };
  }, [opts]);

  // Cỡ chữ biểu kiến: to lên khi gần, nhỏ đi khi xa. Nhân với chất lượng còn lại.
  const apparent = (size * 1.6) / dist;
  const worldPx = apparent * chain.world;
  const layerPx = apparent;
  const readable = (px: number) => px >= 9;

  return (
    <div className="lab">
      <div className="lab-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className={"preset" + (size === p.size && dist === p.dist ? " on" : "")}
            onClick={() => {
              setSize(p.size);
              setDist(p.dist);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="knob-grid">
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Khoảng cách tới menu</span>
            <span className="knob-val mono">{dist.toFixed(1)} m</span>
          </span>
          <input type="range" min={0.5} max={4} step={0.1} value={dist} onChange={(e) => setDist(Number(e.target.value))} />
          <span className="knob-hint">Menu world-locked càng xa thì chữ càng ít pixel.</span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Cỡ chữ trong widget</span>
            <span className="knob-val mono">{size} pt</span>
          </span>
          <input type="range" min={10} max={36} step={1} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <span className="knob-hint">Bài tập §6.10 dùng 14pt vì đó là chỗ khác biệt lộ rõ nhất.</span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">r.ScreenPercentage</span>
            <span className="knob-val mono">{opts.sp}%</span>
          </span>
          <input type="range" min={70} max={140} step={5} value={opts.sp} onChange={(e) => setOpts((o) => ({ ...o, sp: Number(e.target.value) }))} />
          <span className="knob-hint">Chỉ ảnh hưởng bản world-space. Stereo layer không đi qua bước này.</span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Mức FFR</span>
            <span className="knob-val mono">{["Off", "Low", "Medium", "High", "HighTop"][opts.ffr]}</span>
          </span>
          <input type="range" min={0} max={4} step={1} value={opts.ffr} onChange={(e) => setOpts((o) => ({ ...o, ffr: Number(e.target.value) }))} />
          <span className="knob-hint">Chỉ cắn vào menu khi menu nằm lệch trung tâm.</span>
        </label>
      </div>

      <div className="toggle-row">
        <button className={"preset" + (opts.offCenter ? " on" : "")} onClick={() => setOpts((o) => ({ ...o, offCenter: !o.offCenter }))}>
          {opts.offCenter ? "☑" : "☐"} Menu nằm lệch khỏi trung tâm tầm nhìn
        </button>
        <button className={"preset" + (opts.msaa > 1 ? " on" : "")} onClick={() => setOpts((o) => ({ ...o, msaa: o.msaa > 1 ? 1 : 4 }))}>
          {opts.msaa > 1 ? "☑" : "☐"} MSAA {opts.msaa}x
        </button>
      </div>

      <div className="lab-h">Chuỗi tổn thất — vì sao chữ nhoè</div>
      <div className="chain">
        {chain.steps.map((s, i) => (
          <div className="chain-step" key={s.id}>
            <span className="cs-num">{i + 1}</span>
            <span className="cs-body">
              <span className="cs-label">{s.label}</span>
              <span className="cs-why">{s.why}</span>
            </span>
            <span className={"cs-keep mono" + (s.keep < 0.95 ? " lossy" : "")}>
              ×{s.keep.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="chain-step total">
          <span className="cs-num">Σ</span>
          <span className="cs-body">
            <span className="cs-label">Còn lại sau cả chuỗi</span>
            <span className="cs-why">
              Stereo layer đi <b>thẳng</b> vào compositor và bỏ qua toàn bộ bốn bước trên — texture
              được lấy mẫu ở độ phân giải gốc, đúng một lần.
            </span>
          </span>
          <span className="cs-keep mono lossy">×{chain.world.toFixed(2)}</span>
        </div>
      </div>

      <div className="lab-h">Nhìn thử</div>
      <div className="leg-compare">
        <div className={"leg-card " + (readable(worldPx) ? "" : "unreadable")}>
          <div className="leg-head">
            UWidgetComponent (World Space)
            <span className="leg-px mono">{worldPx.toFixed(1)} px hiệu dụng</span>
          </div>
          <div
            className="leg-sample"
            style={{
              fontSize: Math.max(6, worldPx) + "px",
              filter: `blur(${Math.max(0, (1 - chain.world) * 3.2).toFixed(2)}px)`,
              opacity: readable(worldPx) ? 1 : 0.72,
            }}
          >
            Bắt đầu chuyến bay · Cài đặt · Thoát
          </div>
          <div className="leg-verdict">{readable(worldPx) ? "Đọc được" : "❌ Không đọc được ở khoảng cách này"}</div>
        </div>
        <div className={"leg-card sharp " + (readable(layerPx) ? "" : "unreadable")}>
          <div className="leg-head">
            UStereoLayerComponent
            <span className="leg-px mono">{layerPx.toFixed(1)} px hiệu dụng</span>
          </div>
          <div className="leg-sample" style={{ fontSize: Math.max(6, layerPx) + "px" }}>
            Bắt đầu chuyến bay · Cài đặt · Thoát
          </div>
          <div className="leg-verdict">{readable(layerPx) ? "✅ Sắc nét" : "Chữ quá nhỏ — đây là giới hạn vật lý, không phải lỗi render"}</div>
        </div>
      </div>

      <div className="lab-h">Ngân sách 16 layer</div>
      <div className="layer-strip">
        {Array.from({ length: 20 }, (_, i) => (
          <span
            key={i}
            className={"lyr" + (i < layers ? " used" : "") + (i >= 16 ? " dead" : "")}
            title={i >= 16 ? "Layer thứ 17 trở đi không được render" : `Layer ${i + 1}`}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <label className="knob">
        <span className="knob-head">
          <span className="knob-name">Số layer app bạn dùng</span>
          <span className="knob-val mono">{layers}</span>
        </span>
        <input type="range" min={0} max={20} step={1} value={layers} onChange={(e) => setLayers(Number(e.target.value))} />
        <span className="knob-hint">
          Nhớ trừ đi phần hệ thống dùng: passthrough là một layer, splash cũng là một layer.
        </span>
      </label>

      {layers > 16 && (
        <div className="lab-verdict danger">
          <div className="lv-title">❌ Layer thứ 17 trở đi im lặng không hiện</div>
          <div className="lv-note">
            Không có lỗi, không có warning, không có gì trong log. Menu của bạn chỉ đơn giản là không
            xuất hiện — và bạn sẽ đi tìm bug trong code UI suốt buổi chiều.
          </div>
        </div>
      )}

      <details className="lab-note">
        <summary>Kiến trúc kép: một widget để bấm, một layer để nhìn</summary>
        <pre className="code-out">{`// WidgetComponent — CHỈ để nhận tương tác, không hiển thị
WidgetComp->SetCollisionEnabled(ECollisionEnabled::QueryOnly);
WidgetComp->SetVisibility(false);

// StereoLayerComponent — CHỈ để hiển thị
StereoLayer->SetShape<UStereoLayerShapeQuad>();
StereoLayer->SetStereoLayerType(SLT_WorldLocked);
StereoLayer->bLiveTexture = true;   // thiếu dòng này thì UI có animation sẽ đứng hình`}</pre>
        <p className="dim">
          <b>DrawSize</b> là độ phân giải texture (pixel). <b>QuadSize</b> là kích thước vật lý trong
          không gian (cm). Lẫn hai cái này là nguồn của rất nhiều menu méo.
        </p>
        <p className="dim">
          Và luôn giữ một đường lùi: CVar <code>game.UseStereoLayerUI</code> để lật qua lại ngay trên
          device. Không có nó thì bạn không chứng minh được stereo layer thật sự tốt hơn.
        </p>
      </details>
    </div>
  );
}
