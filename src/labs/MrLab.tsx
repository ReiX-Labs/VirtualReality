import { useMemo, useState } from "react";

// Lab for §7.2, §7.3, §7.6 — passthrough đen, và ba trạng thái quyền.
// Phần trên: bật/tắt năm điều kiện của passthrough và xem cái gì hiện ra trong
// kính. Phần dưới: ba nhánh quyền — nhánh thứ ba là chỗ người mới hay bỏ qua,
// và nó dẫn tới app treo.

interface Cond {
  id: string;
  label: string;
  where: string;
  fail: string;
}

const CONDS: Cond[] = [
  {
    id: "enabled",
    label: "Passthrough Enabled = True",
    where: "Project Settings → Meta XR → Mobile",
    fail: "Runtime không bao giờ được yêu cầu bật passthrough. Bạn nhận màn đen.",
  },
  {
    id: "underlay",
    label: "Layer Placement = Underlay",
    where: "Project Settings → Meta XR",
    fail: "Overlay đã deprecate và không chạy qua Link. Passthrough sẽ nằm ĐÈ lên scene của bạn hoặc không hiện.",
  },
  {
    id: "xrapi",
    label: "XR API = Epic Native OpenXR (Recommended)",
    where: "Project Settings → Meta XR → General",
    fail: "⚠️ OVRPluginOpenXR có thể vẫn chạy, nhưng tài liệu passthrough hiện tại của Meta chỉ sang Epic Native OpenXR.",
  },
  {
    id: "alpha",
    label: "r.Mobile.SceneColorFormat = 4",
    where: "DefaultEngine.ini",
    fail: "Format mặc định không có kênh alpha. Blend passthrough cần alpha — thiếu dòng này thì blend sai và triệu chứng cực khó truy nguyên.",
  },
  {
    id: "transparent",
    label: "Nền scene trong suốt (alpha = 0, bỏ skybox + fog)",
    where: "World Settings / Post Process",
    fail: "Passthrough nằm DƯỚI scene render. Scene của bạn đang che kín nó bằng một màu đặc.",
  },
];

interface PermState {
  id: string;
  label: string;
  handled: boolean;
}

const PERMS: { id: string; title: string; must: string; skipCost: string }[] = [
  {
    id: "ok",
    title: "Đã có quyền + đã quét phòng",
    must: "Đường bình thường: nạp Scene từ MRUK, sinh collision proxy, chạy.",
    skipCost: "Không bỏ qua được — đây là nhánh ai cũng viết.",
  },
  {
    id: "noscan",
    title: "Đã có quyền + CHƯA quét phòng",
    must: "Gọi Space Setup và hướng dẫn người dùng quét phòng.",
    skipCost:
      "App im lặng không có tường, không có sàn. Người dùng tưởng app hỏng. Nhớ: Space Setup không chạy qua Link — phải quét trên device.",
  },
  {
    id: "denied",
    title: "Người dùng TỪ CHỐI quyền",
    must: "Chuyển sang chế độ phòng ảo, hoặc thông báo rõ ràng app cần quyền để làm gì.",
    skipCost:
      "Đây là chỗ người mới hay bỏ qua nhất. Hậu quả là app treo hoặc màn hình trống không có thông báo gì.",
  },
];

export default function MrLab() {
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(CONDS.map((c) => [c.id, true])),
  );
  const [perms, setPerms] = useState<PermState[]>(PERMS.map((p) => ({ id: p.id, label: p.title, handled: p.id === "ok" })));
  const [proxyVisible, setProxyVisible] = useState(true);

  const broken = useMemo(() => CONDS.filter((c) => !on[c.id]), [on]);
  const works = broken.length === 0;
  const handledCount = perms.filter((p) => p.handled).length;

  return (
    <div className="lab">
      <div className="lab-h">Năm điều kiện của passthrough</div>
      <p className="lab-hint">
        Thiếu bất kỳ điều kiện nào là bạn nhận <b>màn hình đen</b> — không lỗi, không warning, không
        log. Tắt từng cái để xem triệu chứng.
      </p>

      <div className="cond-list">
        {CONDS.map((c) => (
          <button
            key={c.id}
            className={"cond" + (on[c.id] ? " on" : " off")}
            onClick={() => setOn((o) => ({ ...o, [c.id]: !o[c.id] }))}
          >
            <span className="cond-box">{on[c.id] ? "☑" : "☐"}</span>
            <span className="cond-body">
              <span className="cond-label">{c.label}</span>
              <span className="cond-where">{c.where}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={"hmd-view " + (works ? "pass" : "black")}>
        {works ? (
          <>
            <span className="hv-room">
              <span className="hv-wall" />
              <span className="hv-wall r" />
              <span className="hv-floor" />
            </span>
            <span className={"hv-obj" + (proxyVisible ? " show" : "")} />
            <span className="hv-cap">Thấy phòng thật · vật ảo đứng trên bàn thật</span>
          </>
        ) : (
          <span className="hv-cap black">Màn hình đen. Không có log nào nói vì sao.</span>
        )}
      </div>

      {broken.length > 0 && (
        <div className="lab-verdict danger">
          <div className="lv-title">
            ❌ {broken.length} điều kiện chưa đủ — và triệu chứng của cả {broken.length} là giống hệt nhau
          </div>
          <div className="lv-note">
            <ul className="tight">
              {broken.map((b) => (
                <li key={b.id}>
                  <b>{b.label}</b> — {b.fail}
                </li>
              ))}
            </ul>
          </div>
          <div className="lv-cost">
            Vì triệu chứng giống nhau, cách duy nhất là đi lại §7.2 <i>từng dòng một</i>, không đoán.
          </div>
        </div>
      )}

      {works && (
        <div className="lab-verdict ok">
          <div className="lv-title">✅ Passthrough chạy</div>
          <div className="lv-note">
            Nhớ rằng passthrough <b>khởi tạo bất đồng bộ</b> — có thể mất vài frame mới sẵn sàng.
            Đừng giả định nó có ngay ở <code>BeginPlay</code>.
          </div>
        </div>
      )}

      <div className="lab-h">Collision proxy — thứ tự làm rất quan trọng</div>
      <div className="toggle-row">
        <button className={"preset" + (proxyVisible ? " on" : "")} onClick={() => setProxyVisible((v) => !v)}>
          {proxyVisible ? "☑ Proxy đang NHÌN THẤY ĐƯỢC" : "☐ Proxy vô hình"}
        </button>
      </div>
      <div className={"lab-verdict " + (proxyVisible ? "ok" : "warn")}>
        <div className="lv-title">
          {proxyVisible ? "✅ Đúng thứ tự" : "⚠️ Bạn đang bay mù"}
        </div>
        <div className="lv-note">
          {proxyVisible
            ? "Spawn khối hộp NHÌN THẤY ĐƯỢC ở mỗi anchor trước, đối chiếu với tường/sàn/bàn thật, RỒI mới ẩn đi. Đây là cách duy nhất để biết dữ liệu MRUK có đúng không."
            : "Làm ngược lại — ẩn proxy ngay từ đầu — thì bạn không biết dữ liệu có đúng không. Bóng ném vào tường không nảy, và bạn không biết là do proxy sai chỗ hay do physics."}
        </div>
        <div className="lv-cost">
          Ba lỗi proxy hay gặp: quên <code>SetMobility(Movable)</code> trước{" "}
          <code>SetStaticMesh</code>; để proxy đổ bóng (bóng của vật vô hình vẫn hiện ra); nạp lại
          scene mà không gọi <code>ClearProxies()</code> nên proxy chồng lên nhau.
        </div>
      </div>

      <div className="lab-h">Ba trạng thái quyền — không phải một</div>
      <div className="perm-list">
        {PERMS.map((p, i) => {
          const st = perms[i];
          return (
            <button
              key={p.id}
              className={"perm" + (st.handled ? " on" : "")}
              onClick={() =>
                setPerms((ps) => ps.map((x, j) => (j === i ? { ...x, handled: !x.handled } : x)))
              }
            >
              <span className="perm-box">{st.handled ? "☑" : "☐"}</span>
              <span className="perm-body">
                <span className="perm-title">{p.title}</span>
                <span className="perm-must">{p.must}</span>
                {!st.handled && <span className="perm-cost">Bỏ qua → {p.skipCost}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className={"lab-verdict " + (handledCount === 3 ? "ok" : "warn")}>
        <div className="lv-title">{handledCount} / 3 nhánh đã viết</div>
        <div className="lv-note">
          {handledCount === 3
            ? "Đủ ba nhánh. App của bạn sẽ không treo dù người dùng bấm gì."
            : "Còn nhánh chưa viết. `USE_SCENE` là quyền runtime — hệ thống sẽ hiện hộp thoại, và người dùng có quyền bấm Từ chối."}
        </div>
      </div>

      <details className="lab-note">
        <summary>Hạ tầng test của bạn: lưu phòng ra JSON</summary>
        <pre className="code-out">{`// Lưu phòng đã quét
FString Json = MRUK->SaveSceneToJsonString();

// Nạp lại phòng đó bất cứ lúc nào — kể cả khi bạn đang ở phòng khác
MRUK->LoadSceneFromJsonString(Json);`}</pre>
        <p className="dim">
          Đây là hạ tầng test của bạn cho mọi việc MR về sau. Không có nó, mỗi lần test bạn phải quét
          lại phòng, và bạn không thể tái lập chính xác một tình huống lỗi.
        </p>
        <p className="dim">
          ⚠️ Phần lớn tutorial passthrough trên mạng — kể cả tutorial khá mới — vẫn dạy{" "}
          <code>UOculusXRPassthroughLayerComponent</code>, thứ đã deprecate từ UE 5.6. Cách hiện tại
          là Persistent Passthrough qua <code>UOculusXRPassthroughSubsystem</code>.
        </p>
      </details>
    </div>
  );
}
