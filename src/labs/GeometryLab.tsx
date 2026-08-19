import { useMemo, useState } from "react";

// Lab for §2.4 và §9.5 — draw call và triangle.
// Con số quan trọng không phải "cảnh này có bao nhiêu tam giác" mà là
// "CPU phải nói chuyện với GPU bao nhiêu lần". Instancing gộp lời nói lại;
// mỗi material riêng lại tách chúng ra.

interface MeshGroup {
  id: string;
  name: string;
  count: number;
  tris: number;
  materials: number;
  instanced: boolean;
}

let uid = 3;

const PRESETS: Record<string, MeshGroup[]> = {
  "Phòng mẫu (ổn)": [
    { id: "a", name: "Kiến trúc phòng", count: 1, tris: 24000, materials: 3, instanced: false },
    { id: "b", name: "Bàn ghế", count: 12, tris: 3500, materials: 2, instanced: true },
    { id: "c", name: "Vật cầm được", count: 8, tris: 1800, materials: 1, instanced: false },
  ],
  "Import thẳng từ Blender (hỏng)": [
    { id: "a", name: "Kiến trúc (chưa gộp)", count: 180, tris: 900, materials: 4, instanced: false },
    { id: "b", name: "Cây cối", count: 60, tris: 12000, materials: 3, instanced: false },
    { id: "c", name: "Vặt vãnh trang trí", count: 240, tris: 400, materials: 2, instanced: false },
  ],
  "Cảnh MR nhẹ": [
    { id: "a", name: "Collision proxy (vô hình)", count: 14, tris: 12, materials: 1, instanced: true },
    { id: "b", name: "Vật ảo", count: 6, tris: 5000, materials: 2, instanced: false },
  ],
};

export default function GeometryLab() {
  const [groups, setGroups] = useState<MeshGroup[]>(PRESETS["Phòng mẫu (ổn)"]);
  const [multiview, setMultiview] = useState(true);
  const [active, setActive] = useState("Phòng mẫu (ổn)");

  const patch = (id: string, p: Partial<MeshGroup>) =>
    setGroups((g) => g.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const r = useMemo(() => {
    let draws = 0;
    let tris = 0;
    for (const g of groups) {
      // One draw call per (instance × material), unless instanced — then one
      // call per material for the whole batch.
      draws += g.instanced ? g.materials : g.count * g.materials;
      tris += g.count * g.tris;
    }
    // Without Multi-View the CPU replays every draw call for the second eye.
    const drawsFinal = multiview ? draws : draws * 2;
    return { draws: drawsFinal, tris, perEyeTris: tris };
  }, [groups, multiview]);

  const drawTone = r.draws <= 500 ? "ok" : r.draws <= 1000 ? "warn" : "danger";
  const triTone = r.tris <= 1_000_000 ? "ok" : r.tris <= 2_000_000 ? "warn" : "danger";
  const worst = drawTone === "danger" || triTone === "danger" ? "danger" : drawTone === "warn" || triTone === "warn" ? "warn" : "ok";

  return (
    <div className="lab">
      <div className="lab-presets">
        {Object.keys(PRESETS).map((k) => (
          <button
            key={k}
            className={"preset" + (active === k ? " on" : "")}
            onClick={() => {
              setActive(k);
              setGroups(PRESETS[k].map((g) => ({ ...g })));
            }}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mesh-table">
        <div className="mt-head">
          <span>Nhóm mesh</span>
          <span>Số lượng</span>
          <span>Tris / cái</span>
          <span>Material</span>
          <span>Instanced</span>
          <span />
        </div>
        {groups.map((g) => (
          <div className="mt-row" key={g.id}>
            <input
              className="lab-input sm"
              value={g.name}
              onChange={(e) => patch(g.id, { name: e.target.value })}
            />
            <input
              className="lab-input sm mono"
              type="number"
              min={0}
              value={g.count}
              onChange={(e) => patch(g.id, { count: Math.max(0, Number(e.target.value)) })}
            />
            <input
              className="lab-input sm mono"
              type="number"
              min={0}
              step={100}
              value={g.tris}
              onChange={(e) => patch(g.id, { tris: Math.max(0, Number(e.target.value)) })}
            />
            <input
              className="lab-input sm mono"
              type="number"
              min={1}
              max={12}
              value={g.materials}
              onChange={(e) =>
                patch(g.id, { materials: Math.min(12, Math.max(1, Number(e.target.value))) })
              }
            />
            <button
              className={"preset tiny" + (g.instanced ? " on" : "")}
              onClick={() => patch(g.id, { instanced: !g.instanced })}
            >
              {g.instanced ? "HISM" : "rời"}
            </button>
            <button
              className="icon-x"
              onClick={() => setGroups((gs) => gs.filter((x) => x.id !== g.id))}
              title="Xoá nhóm"
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="preset"
          onClick={() =>
            setGroups((gs) => [
              ...gs,
              {
                id: "n" + uid++,
                name: "Nhóm mới",
                count: 10,
                tris: 2000,
                materials: 1,
                instanced: false,
              },
            ])
          }
        >
          + Thêm nhóm
        </button>
      </div>

      <div className="toggle-row">
        <button
          className={"preset" + (multiview ? " on" : "")}
          onClick={() => setMultiview((v) => !v)}
        >
          {multiview ? "☑" : "☐"} vr.MobileMultiView = True
        </button>
        <span className="lab-hint">
          Tắt Multi-View là CPU phải phát lại toàn bộ draw call cho mắt thứ hai — số draw call{" "}
          <b>nhân đôi</b>.
        </span>
      </div>

      <div className="kv-grid">
        <div className={"kv tone-" + drawTone}>
          <span className="k">Draw call</span>
          <span className="v mono">{r.draws.toLocaleString("vi-VN")}</span>
          <span className="kv-sub">ngân sách thực tế 500 – 1.000</span>
        </div>
        <div className={"kv tone-" + triTone}>
          <span className="k">Triangle toàn cảnh</span>
          <span className="v mono">{(r.tris / 1e6).toFixed(2)} M</span>
          <span className="kv-sub">ngân sách 1 – 2 triệu</span>
        </div>
        <div className="kv">
          <span className="k">Nếu gộp hết thành 1 material</span>
          <span className="v mono">
            {groups
              .reduce((s, g) => s + (g.instanced ? 1 : g.count), 0)
              .toLocaleString("vi-VN")}
          </span>
          <span className="kv-sub">draw call tiết kiệm được nhờ atlas texture</span>
        </div>
        <div className="kv">
          <span className="k">Nếu instance hết</span>
          <span className="v mono">
            {groups.reduce((s, g) => s + g.materials, 0).toLocaleString("vi-VN")}
          </span>
          <span className="kv-sub">draw call nếu mọi nhóm dùng HISM</span>
        </div>
      </div>

      <div className={"lab-verdict " + worst}>
        <div className="lv-title">
          {worst === "ok" ? "✅ Nằm trong ngân sách" : worst === "warn" ? "⚠️ Sát trần" : "❌ Vượt trần"}
        </div>
        <div className="lv-note">
          {drawTone !== "ok" && (
            <>
              <b>Draw call là vấn đề trước tiên.</b> Mỗi draw call là một lần CPU chuẩn bị state rồi
              nói chuyện với driver — nó đánh vào <i>Draw Thread</i>, không phải GPU. Gộp mesh tĩnh,
              dùng atlas để giảm số material, bật instancing cho vật lặp lại.{" "}
            </>
          )}
          {triTone !== "ok" && (
            <>
              <b>Số tam giác cũng quá cao.</b> Giảm LOD, xoá đa giác không nhìn thấy, và nhớ rằng
              con số này phải tô cho cả hai mắt.{" "}
            </>
          )}
          {worst === "ok" &&
            "Cảnh này CPU thở được. Nhưng vẫn phải đo trên device — con số ở đây là mô hình, stat SceneRendering mới là sự thật."}
        </div>
      </div>

      <details className="lab-note">
        <summary>Đo con số thật trên device bằng cách nào?</summary>
        <pre className="code-out">{`# trong console của app đang chạy trên Quest
stat SceneRendering    # Mesh draw calls, tris
stat RHI               # số triangle thực gửi xuống driver
stat unit              # Frame / Game / Draw / GPU`}</pre>
        <p className="dim">
          Đo trên PC bằng Preview là vô nghĩa. Draw call trên desktop GPU rẻ hơn nhiều lần so với
          Adreno trong Quest 3.
        </p>
      </details>
    </div>
  );
}
