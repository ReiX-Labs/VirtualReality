import { useMemo, useState } from "react";

// Lab for §2.5 và §4.7 — chấm điểm comfort.
// Bốn luật vàng của tài liệu được mã hoá thành điểm số. Chú ý luật (1): fps
// không ổn định thì mọi thứ khác vô nghĩa — trong lab này nó nhân với toàn bộ
// điểm chứ không cộng vào.

interface Opt {
  id: string;
  label: string;
  pts: number;
  note: string;
}

interface Group {
  id: string;
  title: string;
  hint: string;
  opts: Opt[];
}

const GROUPS: Group[] = [
  {
    id: "move",
    title: "Di chuyển",
    hint: "Luật 3 — teleport là mặc định an toàn.",
    opts: [
      { id: "tp", label: "Teleport", pts: 30, note: "Không có chuyển động liên tục nào cho tai trong phản đối." },
      {
        id: "smooth",
        label: "Smooth locomotion",
        pts: 8,
        note: "Thoải mái với người đã quen VR, gây say cho người mới. Nếu làm thì để là tuỳ chọn, không phải mặc định.",
      },
      {
        id: "dash",
        label: "Dash (lướt nhanh có nội suy)",
        pts: 18,
        note: "Trung gian. Ngắn và nhanh thì tai trong ít kịp phản đối.",
      },
    ],
  },
  {
    id: "turn",
    title: "Xoay người",
    hint: "Luật 3, và cái bẫy deadzone.",
    opts: [
      { id: "snap", label: "Snap turn có deadzone", pts: 25, note: "Mặc định an toàn. Deadzone 0.7 và khoá cho tới khi cần về giữa." },
      {
        id: "snapnodz",
        label: "Snap turn KHÔNG deadzone",
        pts: -10,
        note: "Cần gạt hơi lệch là màn hình xoay liên tục. Tệ hơn cả smooth turn.",
      },
      {
        id: "smoothturn",
        label: "Smooth turn",
        pts: 4,
        note: "Xoay liên tục là nguồn say lớn thứ hai sau tụt fps.",
      },
      { id: "physical", label: "Chỉ xoay người thật", pts: 28, note: "Dễ chịu nhất — nhưng cần không gian và cáp không vướng." },
    ],
  },
  {
    id: "accel",
    title: "Gia tốc",
    hint: "Luật 4 — gia tốc tệ hơn tốc độ.",
    opts: [
      { id: "instant", label: "Tức thời (bật/tắt tốc độ)", pts: 20, note: "Nghe phản trực giác nhưng đúng: tốc độ đều dễ chịu hơn tăng/giảm tốc." },
      { id: "ramp", label: "Tăng/giảm tốc mượt", pts: 2, note: "Mắt báo có gia tốc, tai trong không cảm nhận thấy — đó chính là xung đột gây say." },
    ],
  },
  {
    id: "cam",
    title: "Quyền điều khiển camera",
    hint: "Luật 2 — camera thuộc về cái đầu của người dùng.",
    opts: [
      { id: "never", label: "Không bao giờ tự dịch camera", pts: 25, note: "Đúng. Mọi chuyển động camera phải xuất phát từ đầu người dùng." },
      { id: "shake", label: "Có camera shake khi trúng đòn", pts: -20, note: "Bình thường ở game phẳng, gây say ngay lập tức trong VR." },
      { id: "cutscene", label: "Cutscene xoay camera", pts: -25, note: "Tệ nhất trong danh sách. Nếu bắt buộc phải có, hãy fade rồi đổi cảnh." },
    ],
  },
  {
    id: "vig",
    title: "Vignette khi di chuyển",
    hint: "Thu hẹp tầm nhìn ngoại vi để giảm tín hiệu chuyển động.",
    opts: [
      { id: "on", label: "Có", pts: 12, note: "Giúp đáng kể với smooth locomotion." },
      { id: "off", label: "Không", pts: 0, note: "Không sao nếu bạn đi teleport." },
    ],
  },
];

export default function ComfortLab() {
  const [pick, setPick] = useState<Record<string, string>>({
    move: "tp",
    turn: "snap",
    accel: "instant",
    cam: "never",
    vig: "off",
  });
  const [fps, setFps] = useState(72);

  const r = useMemo(() => {
    let raw = 0;
    const notes: { label: string; note: string; pts: number }[] = [];
    for (const g of GROUPS) {
      const o = g.opts.find((x) => x.id === pick[g.id]);
      if (!o) continue;
      raw += o.pts;
      notes.push({ label: o.label, note: o.note, pts: o.pts });
    }
    // Luật (1): framerate ổn định là nguyên nhân say số một. Nó KHÔNG cộng vào,
    // nó nhân với tất cả — vì không vignette nào cứu được app tụt xuống 50 fps.
    const stability = fps >= 72 ? 1 : fps >= 65 ? 0.55 : fps >= 55 ? 0.3 : 0.12;
    const score = Math.max(0, Math.min(100, Math.round(raw * stability)));
    return { raw, score, stability, notes };
  }, [pick, fps]);

  const tone = r.score >= 75 ? "ok" : r.score >= 45 ? "warn" : "danger";

  return (
    <div className="lab">
      <div className="knob-grid one">
        <label className="knob">
          <span className="knob-head">
            <span className="knob-name">Framerate ổn định trên device</span>
            <span className="knob-val mono">{fps} fps</span>
          </span>
          <input
            type="range"
            min={45}
            max={90}
            step={1}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
          />
          <span className="knob-hint">
            Luật 1 — đây là <b>nhân tử</b>, không phải điểm cộng. Dưới 72 fps thì mọi lựa chọn khác
            đều bị chiết khấu.
          </span>
        </label>
      </div>

      <div className="comfort-grid">
        {GROUPS.map((g) => (
          <div className="cf-group" key={g.id}>
            <div className="cf-title">{g.title}</div>
            <div className="cf-hint">{g.hint}</div>
            <div className="cf-opts">
              {g.opts.map((o) => (
                <button
                  key={o.id}
                  className={"preset" + (pick[g.id] === o.id ? " on" : "")}
                  onClick={() => setPick((p) => ({ ...p, [g.id]: o.id }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={"lab-verdict " + tone}>
        <div className="lv-title">
          Điểm comfort: {r.score} / 100
          {r.stability < 1 && (
            <span className="lv-mult"> · nhân {(r.stability * 100).toFixed(0)}% vì fps không đạt</span>
          )}
        </div>
        <div className="lv-note">
          {r.stability < 1 ? (
            <>
              <b>Đây là điều duy nhất cần sửa trước.</b> Không có vignette nào cứu được app tụt
              xuống {fps} fps. Quay lại Chương 3 và Chương 9, đạt 72 fps ổn định, rồi mới quay lại
              chỉnh comfort.
            </>
          ) : tone === "ok" ? (
            "Cấu hình này an toàn cho người mới. Vẫn phải test 20 phút thật — điểm số là mô hình, dạ dày của người dùng mới là sự thật."
          ) : (
            "Có ít nhất một lựa chọn đang phá comfort. Xem danh sách bên dưới."
          )}
        </div>
      </div>

      <div className="cf-notes">
        {r.notes
          .slice()
          .sort((a, b) => a.pts - b.pts)
          .map((n) => (
            <div className={"cfn " + (n.pts < 0 ? "bad" : n.pts >= 20 ? "good" : "mid")} key={n.label}>
              <span className="cfn-pts mono">
                {n.pts > 0 ? "+" : ""}
                {n.pts}
              </span>
              <span className="cfn-body">
                <b>{n.label}</b> — {n.note}
              </span>
            </div>
          ))}
      </div>

      <details className="lab-note">
        <summary>Câu hỏi đúng để hỏi về mọi tính năng VR</summary>
        <p>
          Không phải “tính năng này có hay không?” mà là <b>“người dùng có chịu được nó trong 20 phút
          không?”</b>. Rất nhiều quyết định kiến trúc bị đảo ngược sau khi test comfort, và đảo ngược
          muộn thì đắt.
        </p>
        <p className="dim">
          Cách rẻ nhất để xây trực giác này: đeo Quest 3 và dùng 3–4 app thương mại trong 30 phút,
          ghi lại app nào làm bạn khó chịu và vì sao. Đó là bài tập quan trọng nhất của Chương 2.
        </p>
      </details>
    </div>
  );
}
