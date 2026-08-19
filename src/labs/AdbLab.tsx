import { useState } from "react";

// Lab for §0.4 và §3.14 — chẩn đoán deploy.
// Chọn triệu chứng bạn đang gặp, đi theo cây quyết định. Toàn bộ nội dung ở đây
// là những chỗ người mới mất nhiều giờ nhất, và gần như luôn là một trong sáu
// nguyên nhân dưới đây.

interface Node {
  id: string;
  q: string;
  hint?: string;
  options: { label: string; to: string }[];
}

interface Leaf {
  id: string;
  tone: "ok" | "warn" | "danger" | "info";
  title: string;
  body: string;
  cmd?: string;
  ref: string;
}

const NODES: Record<string, Node> = {
  root: {
    id: "root",
    q: "Bạn đang kẹt ở bước nào?",
    options: [
      { label: "`adb devices` không nhận headset", to: "adb" },
      { label: "Build/package thất bại", to: "build" },
      { label: "Cài được nhưng không tìm thấy app", to: "l-unknown" },
      { label: "App mở ra nhưng màn hình đen / phẳng", to: "black" },
      { label: "Chạy được nhưng giật, tụt fps", to: "perf" },
    ],
  },
  adb: {
    id: "adb",
    q: "`adb devices` in ra chính xác cái gì?",
    hint: "Chạy lệnh trong terminal trên PC, khi headset đang cắm và đang bật.",
    options: [
      { label: "Không có dòng nào cả", to: "l-empty" },
      { label: "`unauthorized`", to: "l-unauth" },
      { label: "`offline`", to: "l-offline" },
      { label: "`<serial>  device`", to: "l-ok" },
    ],
  },
  build: {
    id: "build",
    q: "Lỗi build nói gì?",
    options: [
      { label: "Không tìm thấy NDK / SDK", to: "l-ndk" },
      { label: "Hết dung lượng ổ đĩa", to: "l-disk" },
      { label: "Không thấy plugin Meta XR", to: "l-plugin" },
      { label: "Build được, chỉ deploy fail", to: "adb" },
    ],
  },
  black: {
    id: "black",
    q: "Cụ thể bạn thấy gì khi đeo lên?",
    options: [
      { label: "Ảnh 2D phẳng, không head-tracking", to: "l-flat" },
      { label: "Đen hoàn toàn, có âm thanh", to: "l-blackpt" },
      { label: "Vào được VR nhưng chiều cao sai", to: "l-height" },
    ],
  },
  perf: {
    id: "perf",
    q: "Giật lúc nào?",
    options: [
      { label: "Khựng ở lần đầu nhìn thấy vật/hiệu ứng mới", to: "l-pso" },
      { label: "Chạy được ~15 phút rồi tụt dần", to: "l-thermal" },
      { label: "Chậm ngay từ đầu, đều đều", to: "l-slow" },
    ],
  },
};

const LEAVES: Record<string, Leaf> = {
  "l-empty": {
    id: "l-empty",
    tone: "danger",
    title: "Cáp sạc, thiếu driver, hoặc chưa bật Developer Mode",
    body: "Ba nguyên nhân theo thứ tự hay gặp: (1) sợi cáp bạn đang dùng chỉ truyền điện, không truyền dữ liệu — đổi cáp khác; (2) chưa cài driver USB trên Windows; (3) Developer Mode chưa bật trong app Meta Horizon trên điện thoại. Bật xong phải khởi động lại headset.",
    ref: "§0.4",
  },
  "l-unauth": {
    id: "l-unauth",
    tone: "warn",
    title: "Bạn chưa bấm Allow — trong headset",
    body: "Popup xin phép USB debugging hiện ở TRONG kính, không phải trên màn hình PC. Đeo kính lên, rút cắm lại cáp, chọn Allow và tick “Always allow for this computer”.",
    ref: "§0.4",
  },
  "l-offline": {
    id: "l-offline",
    tone: "warn",
    title: "Khởi động lại adb server",
    body: "Rút cắm lại trước. Nếu vẫn `offline`, khởi động lại adb server. Nếu vẫn vậy, thử cổng USB khác — cổng ở mặt trước case hay có vấn đề.",
    cmd: "adb kill-server && adb start-server && adb devices",
    ref: "§0.4",
  },
  "l-ok": {
    id: "l-ok",
    tone: "ok",
    title: "✅ Kết nối tốt — cài app đi",
    body: "Dùng `adb install -r` để cài đè bản cũ mà không cần gỡ. Hoặc kéo file APK vào MQDH.",
    cmd: "adb install -r App.apk",
    ref: "§3.14",
  },
  "l-unknown": {
    id: "l-unknown",
    tone: "info",
    title: "App nằm trong Library → Unknown Sources",
    body: "App sideload KHÔNG nằm chung chỗ với app tải từ Store. Rất nhiều người tìm không ra rồi tưởng deploy thất bại và build lại năm lần. Vào Library, mở bộ lọc, chọn Unknown Sources.",
    ref: "§3.14",
  },
  "l-ndk": {
    id: "l-ndk",
    tone: "danger",
    title: "Sai phiên bản NDK",
    body: "UE 5.6 cần đúng NDK 25.1.8937393. Cài bằng Android Studio SDK Manager (bật “Show Package Details” mới thấy phiên bản cụ thể), rồi trỏ đường dẫn trong Project Settings → Platforms → Android SDK. Cài sai phiên bản thì lỗi báo ra thường không liên quan gì tới NDK.",
    ref: "§3.3",
  },
  "l-disk": {
    id: "l-disk",
    tone: "warn",
    title: "Cần ≥100 GB trống",
    body: "Engine + project + DerivedDataCache + shader ăn nhiều hơn bạn nghĩ. Nếu đi Đường B (build engine từ source) thì con số còn cao hơn nữa. Dọn ổ trước khi bắt đầu, đừng dọn giữa lúc build.",
    ref: "§0.2",
  },
  "l-plugin": {
    id: "l-plugin",
    tone: "danger",
    title: "Plugin Meta XR chưa nằm đúng chỗ",
    body: "Đường A: thư mục MetaXR phải nằm trong `UE_5.6/Engine/Plugins/Marketplace/`. Kiểm tra bằng Project Settings → Plugins → tìm “Meta XR”. Nếu không thấy, plugin đang ở sai chỗ. Nhớ tắt plugin OculusVR cũ (deprecated).",
    ref: "§1.7",
  },
  "l-flat": {
    id: "l-flat",
    tone: "warn",
    title: "Thiếu bStartInVR",
    body: "App khởi động ở chế độ màn hình phẳng vì chưa được bảo phải vào VR. Bật Project Settings → Description → “Start in VR”, hoặc thêm `bStartInVR=True` vào DefaultEngine.ini.",
    cmd: "[/Script/EngineSettings.GeneralProjectSettings]\nbStartInVR=True",
    ref: "§3.13",
  },
  "l-blackpt": {
    id: "l-blackpt",
    tone: "danger",
    title: "Passthrough đen — đi lại §7.2 từng dòng",
    body: "Màn đen với passthrough gần như luôn là một trong năm điều kiện chưa đủ: bSupportPassthrough, thành phần Passthrough ở chế độ Underlay, background của scene phải trong suốt, r.Mobile.SceneColorFormat=4, và XrApi trỏ đúng. Thiếu một cái là đen im lặng, không có log.",
    ref: "§7.2",
  },
  "l-height": {
    id: "l-height",
    tone: "warn",
    title: "Thiếu SetTrackingOrigin",
    body: "Nếu không đặt tracking origin, gốc toạ độ nằm ở vị trí đầu bạn lúc khởi động chứ không phải ở sàn. Đặt `EHMDTrackingOrigin::Stage` trong BeginPlay. Lưu ý `Floor` không tồn tại trên UE5 — nó là tên cũ và sẽ không compile.",
    cmd: "UHeadMountedDisplayFunctionLibrary::SetTrackingOrigin(EHMDTrackingOrigin::Stage);",
    ref: "§4.2",
  },
  "l-pso": {
    id: "l-pso",
    tone: "warn",
    title: "Chưa có PSO cache",
    body: "Khựng đúng lúc một vật liệu hoặc hiệu ứng xuất hiện lần đầu là dấu hiệu kinh điển: GPU đang biên dịch pipeline state ngay giữa frame. Cách kiểm tra rẻ nhất: chạy qua toàn bộ nội dung lần thứ hai — nếu lần hai mượt thì đúng là PSO. Làm đủ quy trình 7 bước ở §3.11.",
    ref: "§3.11",
  },
  "l-thermal": {
    id: "l-thermal",
    tone: "danger",
    title: "Máy nóng, SoC hạ xung",
    body: "Đây là lý do mọi bài đo phải kéo dài 25–30 phút. Ghi fps ở phút 5, 15 và 25. Nếu tụt: hạ ngân sách xuống dưới trần (đừng tiêu hết 13,8 ms), hoặc khoá 72 Hz thay vì 90 Hz.",
    ref: "§2.2, §9.4",
  },
  "l-slow": {
    id: "l-slow",
    tone: "info",
    title: "Đo trước, đoán sau — `stat unit`",
    body: "Bốn con số: Frame, Game, Draw, GPU. Cái nào gần bằng Frame thì cái đó là nút thắt. Tối ưu luồng không nghẽn sẽ không thay đổi fps một chút nào. Đừng vặn núm nào trước khi biết mình đang nghẽn ở đâu.",
    cmd: "stat unit\nstat SceneRendering",
    ref: "§9.3",
  },
};

export default function AdbLab() {
  const [path, setPath] = useState<string[]>(["root"]);
  const cur = path[path.length - 1];
  const node = NODES[cur];
  const leaf = LEAVES[cur];

  return (
    <div className="lab">
      <div className="flow-crumbs">
        {path.map((p, i) => (
          <button
            key={p + i}
            className={"crumb" + (i === path.length - 1 ? " on" : "")}
            onClick={() => setPath((x) => x.slice(0, i + 1))}
          >
            {i === 0 ? "Bắt đầu" : (NODES[p]?.q ?? LEAVES[p]?.title ?? p).slice(0, 34)}
            {i < path.length - 1 && <span className="crumb-sep">›</span>}
          </button>
        ))}
      </div>

      {node && (
        <>
          <div className="flow-q">{node.q}</div>
          {node.hint && <p className="lab-hint">{node.hint}</p>}
          <div className="flow-opts">
            {node.options.map((o) => (
              <button key={o.to} className="flow-opt" onClick={() => setPath((p) => [...p, o.to])}>
                {o.label}
                <span className="fo-arrow">→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {leaf && (
        <>
          <div className={"lab-verdict " + leaf.tone}>
            <div className="lv-title">{leaf.title}</div>
            <div className="lv-note">{leaf.body}</div>
            <div className="lv-cost">Tham chiếu: {leaf.ref}</div>
          </div>
          {leaf.cmd && <pre className="code-out">{leaf.cmd}</pre>}
          <div className="lab-controls">
            <button className="preset" onClick={() => setPath(["root"])}>
              ↺ Chẩn đoán triệu chứng khác
            </button>
          </div>
        </>
      )}

      <details className="lab-note">
        <summary>Vì sao không dùng Quest Link cho mọi thứ?</summary>
        <p>
          Link rất tốt để lặp nhanh logic và bố cục trong ngày. Nhưng render đang chạy trên GPU của
          PC, nên <b>mọi con số hiệu năng qua Link đều vô nghĩa</b>. Space Setup không chạy qua Link,
          và FFR không verify được qua Link.
        </p>
        <p className="dim">
          Quy tắc: Link để làm, device để đo. Mọi con số bạn báo cáo phải đến từ build Shipping trên
          máy thật.
        </p>
      </details>
    </div>
  );
}
