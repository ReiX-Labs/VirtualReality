import { useMemo, useState } from "react";

// Lab for §1.5, §1.6, §1.9 — Đường A hay Đường B.
// Ngưỡng quyết định của tài liệu rất gắt: chỉ đi Đường B khi bạn trả lời
// "có, VÀ tôi đã ĐO ĐƯỢC là thiếu nó thì không đạt". Lab này ép bạn phải bấm
// vào cả hai vế đó.

interface Need {
  id: string;
  label: string;
  note: string;
  /** thật sự chỉ có ở fork? */
  forkOnly: boolean;
  /** cái bẫy: nghe có vẻ fork-only nhưng không phải, hoặc vô dụng trên Quest 3 */
  trap?: string;
}

const NEEDS: Need[] = [
  {
    id: "asw",
    label: "Application Space Warp (ASW)",
    note: "Từ UE 5.7 Epic có CVar xr.OpenXRFrameSynthesis tương đương. Ta khoá ở 5.6 → không có đường thay thế.",
    forkOnly: true,
  },
  {
    id: "depthlayer",
    label: "Mobile compositor layer depth testing",
    note: "Hệ quả trực tiếp: tuỳ chọn `Supports Depth` của Stereo Layer không đáng tin trên Đường A. Đừng thiết kế UI dựa vào nó.",
    forkOnly: true,
  },
  {
    id: "softocc",
    label: "MR soft occlusion (Depth API)",
    note: "Đường A chỉ có hard occlusion.",
    forkOnly: true,
  },
  {
    id: "latelatch",
    label: "Late Latching",
    note: "Có từ v63+ trên fork.",
    forkOnly: true,
  },
  {
    id: "swocc",
    label: "Software Occlusion Culling",
    note: "Có từ v77+ trên fork.",
    forkOnly: true,
  },
  {
    id: "lights",
    label: "Dynamic local lights nâng cao",
    note: "Enhanced LightGrid / Uniform Based — fork-only.",
    forkOnly: true,
  },
  {
    id: "etfr",
    label: "Eye Tracked Foveated Rendering",
    note: "ETFR có trong bảng fork-only, nhưng nó cần headset có eye tracking.",
    forkOnly: false,
    trap: "Quest 3 KHÔNG có eye tracking. Compile fork cũng không có ETFR trên máy này. Đây là lý do sai để đi Đường B.",
  },
  {
    id: "hands",
    label: "Hand Tracking",
    note: "",
    forkOnly: false,
    trap: "Có ở CẢ HAI đường. Đường A đủ dùng.",
  },
  {
    id: "passthrough",
    label: "Passthrough / Scene / Spatial Anchors",
    note: "",
    forkOnly: false,
    trap: "Cả ba đều có ở cả hai đường. Toàn bộ Chương 7 chạy được trên Đường A.",
  },
  {
    id: "ffr",
    label: "Fixed Foveated Rendering",
    note: "",
    forkOnly: false,
    trap: "Có ở cả hai đường. FFR (không phải ETFR) không phải lý do đi Đường B.",
  },
  {
    id: "mqsr",
    label: "Meta Quest Super Resolution",
    note: "",
    forkOnly: false,
    trap: "Có ở cả hai đường từ v68+.",
  },
];

const COMPARE = [
  ["Việc phải làm", "Tải zip của tag, copy 1 thư mục", "Clone fork, setup, generate, build cả engine"],
  ["Thời gian", "~30 phút", "Vài giờ build, cộng thời gian tải"],
  ["Đĩa", "Không thêm đáng kể", "❓ Hàng trăm GB"],
  ["Epic Launcher", "Giữ nguyên tích hợp", "Mất — engine thành bản source rời"],
  ["Hotfix Epic (5.6.2…)", "Launcher tự lo", "Tự merge tay — Meta không merge hotfix của Epic vào fork"],
  ["Đủ để học VR + MR?", "Có", "Có, nhưng dư"],
];

export default function MetaXrLab() {
  const [need, setNeed] = useState<Set<string>>(new Set());
  const [measured, setMeasured] = useState(false);

  const toggle = (id: string) =>
    setNeed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const r = useMemo(() => {
    const picked = NEEDS.filter((n) => need.has(n.id));
    const real = picked.filter((n) => n.forkOnly);
    const traps = picked.filter((n) => !n.forkOnly);
    return { real, traps };
  }, [need]);

  const goB = r.real.length > 0 && measured;

  return (
    <div className="lab">
      <p className="lab-hint">
        Nút Download trên trang Meta hiện phát hành plugin cho <b>UE 5.7.4</b>, không phải 5.6. Bản
        cho 5.6 nằm trong tag của fork <code>Oculus-VR/UnrealEngine</code>. Câu hỏi tiếp theo là:
        chỉ copy plugin (Đường A), hay build cả engine (Đường B)?
      </p>

      <div className="lab-h">Bạn cần tính năng nào?</div>
      <div className="need-grid">
        {NEEDS.map((n) => (
          <button
            key={n.id}
            className={"need" + (need.has(n.id) ? " on" : "")}
            onClick={() => toggle(n.id)}
          >
            <span className="need-box">{need.has(n.id) ? "☑" : "☐"}</span>
            <span className="need-label">{n.label}</span>
          </button>
        ))}
      </div>

      <button className={"preset big" + (measured ? " on" : "")} onClick={() => setMeasured((v) => !v)}>
        {measured ? "☑" : "☐"} Tôi đã <b>đo được</b> rằng thiếu nó thì không đạt yêu cầu
      </button>

      {r.traps.length > 0 && (
        <div className="lab-verdict warn">
          <div className="lv-title">⚠️ {r.traps.length} lựa chọn không phải lý do đi Đường B</div>
          <div className="lv-note">
            <ul className="tight">
              {r.traps.map((t) => (
                <li key={t.id}>
                  <b>{t.label}</b> — {t.trap}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className={"lab-verdict " + (goB ? "info" : "ok")}>
        <div className="lv-title">
          {goB ? "→ Đường B có cơ sở" : "→ Đường A"}
        </div>
        <div className="lv-note">
          {goB ? (
            <>
              Bạn cần {r.real.map((n) => n.label).join(", ")} — đó là tính năng chỉ có ở fork, và bạn
              đã đo được là thiếu nó thì không đạt. Đường B hợp lý. Chuẩn bị vài giờ build và hàng
              trăm GB đĩa, và chấp nhận tự merge hotfix của Epic về sau.
            </>
          ) : r.real.length > 0 ? (
            <>
              Bạn có chọn tính năng fork-only, nhưng chưa tick ô “đã đo được”.{" "}
              <b>Không đo trước mà đi Đường B = đốt một ngày build để lấy tính năng bạn chưa biết có
              cần hay không.</b>{" "}
              Làm Đường A trước, đo, rồi quay lại đây.
            </>
          ) : (
            <>
              Không có gì trong danh sách của bạn cần fork. Đường A: tải zip của đúng tag, copy một
              thư mục, khoảng 30 phút. Ở tuần 1 bạn <b>không</b> cần bất kỳ tính năng fork-only nào.
            </>
          )}
        </div>
        <div className="lv-cost">
          Dấu hiệu bạn đã đi lạc sang Đường B mà không định: editor bắt đầu build hàng nghìn file.
        </div>
      </div>

      <div className="lab-h">Bảng so sánh</div>
      <div className="mini-table">
        <div className="mtr head">
          <span />
          <span>Đường A — Epic build + copy plugin</span>
          <span>Đường B — compile fork</span>
        </div>
        {COMPARE.map((row) => (
          <div className="mtr" key={row[0]}>
            <span className="mtr-k">{row[0]}</span>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
          </div>
        ))}
      </div>

      <details className="lab-note">
        <summary>Vì sao phải lấy zip của TAG chứ không phải nút Code màu xanh?</summary>
        <p>
          Nút Code ở trang chủ repo cho bạn branch mặc định, thường là một bản khác. <b>Tag không bao
          giờ di chuyển</b> — nó trỏ vào đúng một commit, mãi mãi. Branch thì di chuyển mỗi khi có
          commit mới. Đó là lý do tag là thứ duy nhất tái lập được.
        </p>
        <p className="dim">
          Nếu bạn nhận 404 khi mở repo: đó là lỗi <i>quyền</i>, không phải lỗi repo. Quay lại phần
          liên kết Epic ↔ GitHub và kiểm tra <code>EpicGames</code> có trong danh sách organizations
          của bạn không.
        </p>
      </details>
    </div>
  );
}
