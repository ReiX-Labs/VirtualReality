import { useMemo, useState } from "react";

// Lab for Phụ lục D — bài tập file config gài lỗi, cộng thêm một bộ sinh
// DefaultEngine.ini đúng cho Quest 3.
// Đây là bài kiểm tra Chương 3: đọc từng dòng, biết dòng nào sai và sai thì
// hậu quả là gì. Bấm vào dòng bạn nghi ngờ, rồi chấm điểm.

interface Line {
  text: string;
  /** id nhóm lỗi — nhiều dòng có thể chung một lỗi (bộ ba Lumen/VSM) */
  bug?: string;
  /** không phải lỗi, nhưng đáng để ý */
  notice?: string;
}

interface Bug {
  id: string;
  title: string;
  wrong: string;
  effect: string;
  fix: string;
  ref: string;
}

const BUGS: Bug[] = [
  {
    id: "b1",
    title: "Lỗi 1 — TargetSDKVersion=32",
    wrong: "App tạo mới phải target API 34 từ 1/3/2026.",
    effect: "Không submit được lên Horizon Store.",
    fix: "TargetSDKVersion=34. Giữ nguyên MinSDKVersion=32 — dòng đó đúng.",
    ref: "§3.4",
  },
  {
    id: "b2",
    title: "Lỗi 2 — bBuildForX8664=True",
    wrong: "Quest 3 chạy arm64. Build thêm x86-64 là thừa hoàn toàn.",
    effect: "APK phình to vô ích, thời gian build dài hơn.",
    fix: "bBuildForX8664=False",
    ref: "§3.4",
  },
  {
    id: "b3",
    title: "Lỗi 3 — bBuildForES31=True",
    wrong: "Quest 3 dùng Vulkan. Bật thêm OpenGL ES 3.1 nghĩa là biên dịch shader hai lần.",
    effect: "Thời gian build và dung lượng APK tăng, không đổi lại được gì.",
    fix: "bBuildForES31=False, giữ bSupportsVulkan=True",
    ref: "§3.4, §3.6",
  },
  {
    id: "b4",
    title: "Lỗi 4 — r.MobileHDR=True",
    wrong: "Trên Quest 3 Mobile HDR chặn Multi-View và làm tăng chi phí bandwidth.",
    effect: "Mất Multi-View, GPU và băng thông bộ nhớ đều tệ hơn.",
    fix: "r.MobileHDR=False",
    ref: "§3.6",
  },
  {
    id: "b5",
    title: "Lỗi 5 — r.Mobile.ShadingPath=1",
    wrong: "1 là Deferred. Quest 3 phải đi Forward.",
    effect:
      "Deferred trên tile-based GPU là thảm hoạ băng thông — và nó còn mâu thuẫn trực tiếp với lỗi 4: deferred yêu cầu Mobile HDR bật.",
    fix: "r.Mobile.ShadingPath=0 (Forward)",
    ref: "§3.6",
  },
  {
    id: "b6",
    title: "Lỗi 6 — vr.MobileMultiView=False",
    wrong: "Tắt Multi-View là ném đi khoản tiết kiệm CPU lớn nhất của render VR.",
    effect: "Draw call nhân đôi vì mỗi mắt được phát lại toàn bộ.",
    fix: "vr.MobileMultiView=True",
    ref: "§3.7",
  },
  {
    id: "b7",
    title: "Lỗi 7 — Lumen + Virtual Shadow Maps",
    wrong:
      "r.DynamicGlobalIlluminationMethod=1, r.ReflectionMethod=1, r.Shadow.Virtual.Enable=1 — cả ba đều là tính năng desktop.",
    effect:
      "Trên di động chúng hoặc không chạy, hoặc chạy và giết fps. Đây là lỗi thứ nhất trong danh sách bẫy quy trình.",
    fix: "Đặt cả ba về 0. (Tính là MỘT lỗi vì cùng một nguyên nhân gốc.)",
    ref: "§3.6, §A.5 #43",
  },
  {
    id: "b8",
    title: "Lỗi 8 — r.AllowOcclusionQueries=0",
    wrong:
      "Tắt occlusion query trên Quest 3 làm mọi thứ trong tầm nhìn đều được vẽ, kể cả bị tường che.",
    effect: "GPU tô những pixel không ai nhìn thấy.",
    fix: "Xoá dòng đó, hoặc để =1. Và đây là câu trả lời duy nhất kèm theo 'chúng ta chưa biết chính xác vì sao' — cơ chế đầy đủ vẫn là ❓.",
    ref: "§3.6, §A.2 #15",
  },
  {
    id: "b9",
    title: "Lỗi 9 — NeedsShaderStableKeys=false",
    wrong: "Không có stable key thì không gom được PSO cache.",
    effect: "Build ra sẽ khựng ở mọi vật liệu mới trong lần đầu người dùng nhìn thấy nó.",
    fix: "NeedsShaderStableKeys=true",
    ref: "§3.11",
  },
];

const LINES: Line[] = [
  { text: "[/Script/AndroidRuntimeSettings]" },
  { text: "MinSDKVersion=32" },
  { text: "TargetSDKVersion=32", bug: "b1" },
  { text: "bBuildForArm64=True" },
  { text: "bBuildForX8664=True", bug: "b2" },
  { text: "bBuildForES31=True", bug: "b3" },
  { text: "bSupportsVulkan=True" },
  { text: "bPackageForMetaQuest=True" },
  { text: "" },
  { text: "[/Script/Engine.RendererSettings]" },
  { text: "r.MobileHDR=True", bug: "b4" },
  { text: "r.Mobile.ShadingPath=1", bug: "b5" },
  { text: "vr.MobileMultiView=False", bug: "b6" },
  { text: "vr.InstancedStereo=True" },
  { text: "r.DynamicGlobalIlluminationMethod=1", bug: "b7" },
  { text: "r.ReflectionMethod=1", bug: "b7" },
  { text: "r.Shadow.Virtual.Enable=1", bug: "b7" },
  { text: "r.AllowStaticLighting=True" },
  { text: "r.MobileMSAA=4" },
  {
    text: "r.Shadow.CSM.MaxCascades=4",
    notice:
      "Không sai, nhưng đắt. Trên Quest 3 nên để 1 cascade. Đây là dòng “đúng mà vẫn nên sửa”.",
  },
  { text: "r.AllowOcclusionQueries=0", bug: "b8" },
  { text: "r.ShaderPipelineCache.Enabled=1" },
  { text: "" },
  { text: "[/Script/Engine.UserInterfaceSettings]" },
  { text: "bAllowHighQualityLightMaps=True" },
  { text: "" },
  { text: "[DevOptions.Shaders]" },
  { text: "NeedsShaderStableKeys=false", bug: "b9" },
  { text: "" },
  { text: "[/Script/OculusXRHMD.OculusXRHMDRuntimeSettings]" },
  {
    text: "XrApi=OVRPluginOpenXR",
    notice:
      "⚠️ Có thể vẫn chạy, nhưng tài liệu passthrough hiện tại của Meta chỉ sang Epic Native OpenXR (Recommended). Không tính là lỗi trong bài này.",
  },
  { text: "bSupportPassthrough=True" },
];

function grade(n: number) {
  if (n === 9) return { tone: "ok", text: "Xuất sắc — nếu bạn giải thích được cả hậu quả của từng lỗi." };
  if (n >= 7) return { tone: "ok", text: "Tốt. Đọc lại phần tương ứng với những lỗi bạn bỏ sót." };
  if (n >= 5) return { tone: "warn", text: "Đọc lại §3.6 → §3.13." };
  return { tone: "danger", text: "Làm lại §3.5 từ đầu — phần này là nền của mọi thứ sau đó." };
}

// ---------------------------------------------------------------- generator

interface GenOpts {
  target: number;
  msaa: number;
  ffr: "off" | "fixed" | "dynamic";
  ffrLevel: number;
  passthrough: boolean;
  pso: boolean;
}

function generate(o: GenOpts) {
  const ffr =
    o.ffr === "off"
      ? ""
      : "\n[/Script/OculusXRHMD.OculusXRHMDRuntimeSettings]\n" +
        "FoveatedRenderingMethod=FixedFoveatedRendering\n" +
        `FoveatedRenderingLevel=${["Off", "Low", "Medium", "High", "HighTop"][o.ffrLevel]}\n` +
        `bDynamicFoveatedRendering=${o.ffr === "dynamic" ? "True" : "False"}\n` +
        (o.passthrough ? "bSupportPassthrough=True\n" : "");
  const pt =
    o.passthrough && o.ffr === "off"
      ? "\n[/Script/OculusXRHMD.OculusXRHMDRuntimeSettings]\nbSupportPassthrough=True\n"
      : "";
  const psoBlock = o.pso
    ? `
[DevOptions.Shaders]
NeedsShaderStableKeys=true

[ShaderPipelineCache.CacheFile]
r.ShaderPipelineCache.Enabled=1
r.ShaderPipelineCache.StartupMode=3
r.ShaderPipelineCache.LogPSO=0
`
    : "";
  return `; DefaultEngine.ini — Quest 3, UE 5.6, Forward + Vulkan + Multi-View
[/Script/AndroidRuntimeSettings]
MinSDKVersion=32
TargetSDKVersion=${o.target}
bBuildForArm64=True
bBuildForX8664=False
bBuildForES31=False
bSupportsVulkan=True
bPackageForMetaQuest=True

[/Script/Engine.RendererSettings]
r.MobileHDR=False
r.Mobile.ShadingPath=0
vr.MobileMultiView=True
vr.InstancedStereo=True
r.Mobile.SceneColorFormat=4
r.MobileMSAA=${o.msaa}
r.DynamicGlobalIlluminationMethod=0
r.ReflectionMethod=0
r.Shadow.Virtual.Enable=0
r.AllowStaticLighting=True
r.Shadow.CSM.MaxCascades=1
r.DefaultFeature.AntiAliasing=0
${ffr}${pt}${psoBlock}`;
}

export default function ConfigLab() {
  const [mode, setMode] = useState<"hunt" | "gen">("hunt");
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [revealed, setReveal] = useState(false);
  const [opts, setOpts] = useState<GenOpts>({
    target: 34,
    msaa: 4,
    ffr: "fixed",
    ffrLevel: 2,
    passthrough: false,
    pso: true,
  });

  const toggle = (i: number) => {
    if (revealed) return;
    setMarked((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  const result = useMemo(() => {
    const found = new Set<string>();
    let falsePos = 0;
    for (const i of marked) {
      const b = LINES[i].bug;
      if (b) found.add(b);
      else falsePos++;
    }
    return { found, falsePos, missed: BUGS.filter((b) => !found.has(b.id)) };
  }, [marked]);

  const ini = useMemo(() => generate(opts), [opts]);

  return (
    <div className="lab">
      <div className="seg">
        <button className={"seg-btn" + (mode === "hunt" ? " on" : "")} onClick={() => setMode("hunt")}>
          🔍 Săn 9 lỗi
        </button>
        <button className={"seg-btn" + (mode === "gen" ? " on" : "")} onClick={() => setMode("gen")}>
          ⚙️ Sinh config đúng
        </button>
      </div>

      {mode === "hunt" ? (
        <>
          <p className="lab-hint">
            Dưới đây là <code>DefaultEngine.ini</code> của một project Quest 3 trên UE 5.6.{" "}
            <b>Có 9 lỗi.</b> Bấm vào dòng bạn cho là sai, rồi bấm “Chấm điểm”. Gợi ý phân bổ: 3 lỗi
            ở mục Android, 5 lỗi ở Renderer, 1 lỗi ở phần còn lại.
          </p>

          <div className="ini-hunt mono">
            {LINES.map((l, i) => {
              const isMarked = marked.has(i);
              let cls = "ini-line";
              if (!l.text.trim()) cls += " blank";
              if (l.text.startsWith("[")) cls += " sect";
              if (isMarked) cls += " marked";
              if (revealed) {
                if (l.bug && isMarked) cls += " hit";
                else if (l.bug) cls += " missed";
                else if (isMarked) cls += " falsepos";
                if (l.notice) cls += " notice";
              }
              return (
                <div key={i} className={cls} onClick={() => l.text.trim() && toggle(i)}>
                  <span className="il-num">{l.text.trim() ? i + 1 : ""}</span>
                  <span className="il-text">{l.text || " "}</span>
                  {revealed && l.bug && <span className="il-tag bad">lỗi</span>}
                  {revealed && !l.bug && isMarked && <span className="il-tag neutral">không sai</span>}
                  {revealed && l.notice && <span className="il-tag warn">đáng để ý</span>}
                </div>
              );
            })}
          </div>

          <div className="lab-controls wrap">
            <button className="preset on" onClick={() => setReveal((v) => !v)}>
              {revealed ? "Ẩn đáp án" : "Chấm điểm"}
            </button>
            <button
              className="preset"
              onClick={() => {
                setMarked(new Set());
                setReveal(false);
              }}
            >
              Làm lại
            </button>
            <span className="lab-hint">Đã đánh dấu {marked.size} dòng</span>
          </div>

          {revealed && (
            <>
              <div className={"lab-verdict " + grade(result.found.size).tone}>
                <div className="lv-title">
                  {result.found.size} / 9 lỗi
                  {result.falsePos > 0 && ` · ${result.falsePos} dòng đánh nhầm`}
                </div>
                <div className="lv-note">{grade(result.found.size).text}</div>
                {result.found.has("b4") && result.found.has("b5") && (
                  <div className="lv-cost">
                    ⭐ Điểm thưởng: bạn bắt được cả lỗi 4 và lỗi 5 — hai dòng đó{" "}
                    <b>mâu thuẫn trực tiếp với nhau</b>, vì deferred yêu cầu Mobile HDR bật.
                  </div>
                )}
              </div>

              <div className="bug-list">
                {BUGS.map((b) => (
                  <div key={b.id} className={"bug-card " + (result.found.has(b.id) ? "found" : "miss")}>
                    <div className="bc-head">
                      <span className="bc-mark">{result.found.has(b.id) ? "✅" : "❌"}</span>
                      <span className="bc-title">{b.title}</span>
                      <span className="bc-ref">{b.ref}</span>
                    </div>
                    <div className="bc-row">
                      <b>Sai:</b> {b.wrong}
                    </div>
                    <div className="bc-row">
                      <b>Hậu quả:</b> {b.effect}
                    </div>
                    <div className="bc-row fix">
                      <b>Sửa:</b> <code>{b.fix}</code>
                    </div>
                  </div>
                ))}
              </div>

              <details className="lab-note" open>
                <summary>Hai dòng KHÔNG phải lỗi, nhưng đáng để ý</summary>
                {LINES.filter((l) => l.notice).map((l) => (
                  <p key={l.text}>
                    <code>{l.text}</code> — {l.notice}
                  </p>
                ))}
              </details>
            </>
          )}
        </>
      ) : (
        <>
          <div className="knob-grid">
            <label className="knob">
              <span className="knob-head">
                <span className="knob-name">TargetSDKVersion</span>
                <span className="knob-val mono">{opts.target}</span>
              </span>
              <input
                type="range"
                min={32}
                max={35}
                step={1}
                value={opts.target}
                onChange={(e) => setOpts((o) => ({ ...o, target: Number(e.target.value) }))}
              />
              <span className="knob-hint">
                App tạo mới phải là 34 từ 1/3/2026. Min giữ ở 32.
              </span>
            </label>
            <label className="knob">
              <span className="knob-head">
                <span className="knob-name">r.MobileMSAA</span>
                <span className="knob-val mono">{opts.msaa}x</span>
              </span>
              <input
                type="range"
                min={1}
                max={8}
                step={opts.msaa === 1 ? 1 : 2}
                value={opts.msaa}
                onChange={(e) => setOpts((o) => ({ ...o, msaa: Number(e.target.value) }))}
              />
              <span className="knob-hint">
                4x là mặc định hợp lý cho VR. MSAA chỉ dùng được vì đang đi Forward.
              </span>
            </label>
            <label className="knob">
              <span className="knob-head">
                <span className="knob-name">Mức FFR</span>
                <span className="knob-val mono">
                  {["Off", "Low", "Medium", "High", "HighTop"][opts.ffrLevel]}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={opts.ffrLevel}
                onChange={(e) => setOpts((o) => ({ ...o, ffrLevel: Number(e.target.value) }))}
              />
              <span className="knob-hint">
                Phải có <b>cả hai</b> dòng Method và Level, thiếu một là FFR im lặng không bật.
              </span>
            </label>
          </div>

          <div className="lab-presets">
            {(["off", "fixed", "dynamic"] as const).map((f) => (
              <button
                key={f}
                className={"preset" + (opts.ffr === f ? " on" : "")}
                onClick={() => setOpts((o) => ({ ...o, ffr: f }))}
              >
                FFR: {f === "off" ? "tắt" : f === "fixed" ? "cố định" : "động"}
              </button>
            ))}
            <button
              className={"preset" + (opts.passthrough ? " on" : "")}
              onClick={() => setOpts((o) => ({ ...o, passthrough: !o.passthrough }))}
            >
              {opts.passthrough ? "☑" : "☐"} Passthrough
            </button>
            <button
              className={"preset" + (opts.pso ? " on" : "")}
              onClick={() => setOpts((o) => ({ ...o, pso: !o.pso }))}
            >
              {opts.pso ? "☑" : "☐"} PSO cache
            </button>
          </div>

          <pre className="code-out">{ini}</pre>

          <p className="lab-hint">
            Dán vào <code>Config/DefaultEngine.ini</code>. Sau đó chạy Project Setup Tool và{" "}
            <b>đọc từng cảnh báo</b> — đừng bấm Fix All rồi commit mà không xem{" "}
            <code>git diff</code>.
          </p>
        </>
      )}
    </div>
  );
}
