import { useEffect, useRef, useState } from "react";

// Lab for §8.2, §8.3, §8.4 — fade XR-safe và watchdog.
// Chạy thử ba cách fade. Hai cách đầu trông "gần đúng" trong editor và sai trên
// device — đó là lý do chúng ở đây. Phần dưới là watchdog: thứ đứng giữa người
// dùng của bạn và một màn hình đen vô tận.

type Method = "postprocess" | "offset" | "scale" | "scale-nolayers";

const METHODS: { id: Method; label: string; tone: string }[] = [
  { id: "postprocess", label: "StartCameraFade (post-process)", tone: "danger" },
  { id: "offset", label: "ColorOffset", tone: "danger" },
  { id: "scale-nolayers", label: "ColorScale, bApplyToAllLayers = false", tone: "warn" },
  { id: "scale", label: "ColorScale, bApplyToAllLayers = true", tone: "ok" },
];

const EXPLAIN: Record<Method, { title: string; note: string; code: string }> = {
  postprocess: {
    title: "❌ Không ăn gì cả",
    note:
      "StartCameraFade được cài đặt qua post-process. Với r.MobileHDR=False, pipeline post-process thông thường không chạy → fade không có tác dụng. ⚠️ Đây là suy luận từ cơ chế, khớp với quan sát từ dự án thật; ❓ chưa có tài liệu chính thức riêng cho 5.6. Nhưng hành vi quan sát được thì nhất quán: fade không ăn.",
    code: `// ❌ Chết im lặng trên Quest
PlayerCameraManager->StartCameraFade(0.f, 1.f, 0.5f, FLinearColor::Black);`,
  },
  offset: {
    title: "❌ Chạy trên PC-VR, không chạy trên Quest",
    note:
      "Trên mobile/Quest, Color OFFSET không được hỗ trợ — chỉ Color Scale. Nếu bạn viết logic fade dựa vào offset, nó sẽ chạy ngon trong PC-VR preview và im lặng không làm gì trên device. Đây là loại bug tệ nhất: nó hoạt động ở nơi bạn test.",
    code: `// ❌ Offset không được hỗ trợ trên mobile
SetColorScaleAndOffset(
    FLinearColor::White,
    FLinearColor(-Alpha, -Alpha, -Alpha, 0.f),   // vô tác dụng trên Quest
    /*bApplyToAllLayers=*/ true);`,
  },
  "scale-nolayers": {
    title: "⚠️ Thế giới tối đi, menu vẫn sáng rực",
    note:
      "Đúng công thức nhưng thiếu bApplyToAllLayers. Compositor layer nằm ngoài scene render — menu stereo layer và passthrough của bạn sẽ không bị fade. Kết quả: màn hình đen với một cái menu lơ lửng sáng trưng.",
    code: `// ⚠️ Scene fade, layer thì không
SetColorScaleAndOffset(
    FLinearColor(Alpha, Alpha, Alpha, 1.f),
    FLinearColor::Black,
    /*bApplyToAllLayers=*/ false);`,
  },
  scale: {
    title: "✅ Đúng",
    note:
      "pixel mới = pixel cũ × ColorScale + ColorOffset. Kéo ColorScale về 0 là đen. bApplyToAllLayers = true là thứ làm nó đúng — nó kéo cả compositor layer theo.",
    code: `// ✅ Fade XR-safe
UOculusXRFunctionLibrary::SetColorScaleAndOffset(
    FLinearColor(Alpha, Alpha, Alpha, 1.f),   // 1 = bình thường, 0 = đen
    FLinearColor::Black,
    /*bApplyToAllLayers=*/ true);              // fade CẢ compositor layer`,
  },
};

export default function FadeLab() {
  const [method, setMethod] = useState<Method>("scale");
  const [alpha, setAlpha] = useState(1);
  const [running, setRunning] = useState(false);
  const [timeout_, setTimeoutS] = useState(20);
  const [loadTime, setLoadTime] = useState(2.5);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "load" | "in" | "rescue">("idle");
  const raf = useRef<number | undefined>(undefined);

  // Chạy một chuyển cảnh giả lập: fade ra → load → fade vào, với watchdog.
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const OUT = 0.5;
    const IN = 0.5;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      setElapsed(t);
      const timedOut = t > OUT + Math.min(loadTime, timeout_) && loadTime > timeout_;
      if (t < OUT) {
        setPhase("out");
        setAlpha(1 - t / OUT);
      } else if (t < OUT + Math.min(loadTime, timeout_)) {
        setPhase("load");
        setAlpha(0);
      } else if (timedOut) {
        setPhase("rescue");
        setAlpha(Math.min(1, (t - OUT - timeout_) / IN));
        if (t > OUT + timeout_ + IN) {
          setRunning(false);
          setAlpha(1);
          return;
        }
      } else if (t < OUT + loadTime + IN) {
        setPhase("in");
        setAlpha(Math.min(1, (t - OUT - loadTime) / IN));
      } else {
        setPhase("idle");
        setAlpha(1);
        setRunning(false);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    };
  }, [running, loadTime, timeout_]);

  const ex = EXPLAIN[method];
  // Fade thật sự nhìn thấy được chỉ khi phương pháp đúng.
  const sceneAlpha = method === "postprocess" || method === "offset" ? 1 : alpha;
  const layerAlpha = method === "scale" ? alpha : 1;
  const blackout = phase === "load" && loadTime > 1;

  return (
    <div className="lab">
      <div className="lab-h">Chọn cách fade</div>
      <div className="lab-presets">
        {METHODS.map((m) => (
          <button
            key={m.id}
            className={"preset" + (method === m.id ? " on" : "")}
            onClick={() => setMethod(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="fade-stage">
        <div className="fs-scene" style={{ opacity: 0.15 + 0.85 * sceneAlpha }}>
          <span className="fs-sun" />
          <span className="fs-hill" />
          <span className="fs-hill b" />
        </div>
        <div className="fs-layer" style={{ opacity: 0.25 + 0.75 * layerAlpha }}>
          <span className="fs-menu">
            <b>MENU</b>
            <span>Tiếp tục</span>
            <span>Cài đặt</span>
          </span>
        </div>
        <div className="fs-tag">
          {phase === "idle" && "Sẵn sàng"}
          {phase === "out" && "Fade ra…"}
          {phase === "load" && `Đang load… ${elapsed.toFixed(1)} s`}
          {phase === "in" && "Fade vào…"}
          {phase === "rescue" && "⚠️ Watchdog kích hoạt — cứu người dùng"}
        </div>
      </div>

      {(method === "scale-nolayers" || method === "postprocess" || method === "offset") && alpha < 0.9 && (
        <div className="lab-verdict warn">
          <div className="lv-title">Nhìn kỹ cái menu</div>
          <div className="lv-note">
            {method === "scale-nolayers"
              ? "Scene tối đi nhưng menu vẫn sáng nguyên. Đó chính xác là điều người dùng sẽ thấy trong kính."
              : "Không có gì tối đi cả. Fade của bạn đang không làm gì."}
          </div>
        </div>
      )}

      <div className="knob-grid">
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Alpha (kéo tay)</span>
            <span className="knob-val mono">{alpha.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={alpha}
            onChange={(e) => setAlpha(Number(e.target.value))}
            disabled={running}
          />
          <span className="knob-hint">1 = sáng bình thường, 0 = đen hoàn toàn.</span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Thời gian load thật</span>
            <span className="knob-val mono">{loadTime.toFixed(1)} s</span>
          </span>
          <input type="range" min={0.3} max={30} step={0.1} value={loadTime} onChange={(e) => setLoadTime(Number(e.target.value))} />
          <span className="knob-hint">VRC yêu cầu hình head-tracked trong 4 s từ lúc mở app.</span>
        </label>
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">LoadTimeoutSeconds</span>
            <span className="knob-val mono">{timeout_.toFixed(1)} s</span>
          </span>
          <input type="range" min={0.1} max={25} step={0.1} value={timeout_} onChange={(e) => setTimeoutS(Number(e.target.value))} />
          <span className="knob-hint">
            Bài tập §8.9 BT3: đặt về 0,1 s để ép watchdog kích hoạt và xem app có phục hồi không.
          </span>
        </label>
      </div>

      <div className="lab-controls wrap">
        <button className="preset on" onClick={() => setRunning(true)} disabled={running}>
          ▶ Chạy chuyển cảnh
        </button>
        <button
          className="preset"
          onClick={() => {
            setRunning(false);
            setAlpha(1);
            setPhase("idle");
          }}
        >
          ↺ Reset
        </button>
        {blackout && <span className="lab-hint warn-text">Người dùng đang nhìn màn đen {elapsed.toFixed(1)} s</span>}
      </div>

      {loadTime > timeout_ && (
        <div className="lab-verdict info">
          <div className="lv-title">🐕 Watchdog sẽ kích hoạt</div>
          <div className="lv-note">
            Load mất {loadTime.toFixed(1)} s nhưng timeout là {timeout_.toFixed(1)} s. Watchdog sẽ
            fade trở lại và báo lỗi thay vì để người dùng kẹt trong màn đen vô tận. Đây là{" "}
            <b>vấn đề an toàn, không phải tính năng</b> — người dùng đang đeo một cái hộp che kín
            mắt.
          </div>
        </div>
      )}

      {loadTime > 4 && loadTime <= timeout_ && (
        <div className="lab-verdict warn">
          <div className="lv-title">⚠️ {loadTime.toFixed(1)} s màn đen — quá dài</div>
          <div className="lv-note">
            Không bao giờ để người dùng nhìn màn đen im lặng quá 1 giây mà không có dấu hiệu gì. Thêm
            splash screen hoặc một chỉ báo loading ngay trong VR.
          </div>
        </div>
      )}

      <div className={"lab-verdict " + METHODS.find((m) => m.id === method)!.tone}>
        <div className="lv-title">{ex.title}</div>
        <div className="lv-note">{ex.note}</div>
      </div>

      <pre className="code-out">{ex.code}</pre>

      <details className="lab-note">
        <summary>Vì sao gom hết vào một subsystem?</summary>
        <p>
          Vì fade, level streaming và watchdog phải biết về nhau. Rải logic fade khắp nơi thì sẽ có
          chỗ fade mà quên watchdog, có chỗ load mà quên fade. Một{" "}
          <code>UGameInstanceSubsystem</code> sống qua mọi lần đổi level và là chỗ duy nhất giữ trạng
          thái đó.
        </p>
        <pre className="code-out">{`// Level streaming — KHÔNG chặn game thread
LatentInfo.ShouldBlockOnLoad = false;   // block = compositor mất frame = say
UGameplayStatics::LoadStreamLevel(this, LevelName,
    /*bMakeVisibleAfterLoad=*/true, /*bShouldBlockOnLoad=*/false, LatentInfo);`}</pre>
        <p className="dim">
          <code>bShouldBlockOnLoad = true</code> làm game thread đứng hình — và khi game thread đứng,
          compositor không có frame mới, người dùng thấy hình cũ bị tái chiếu. Đó là công thức gây
          say.
        </p>
      </details>
    </div>
  );
}
