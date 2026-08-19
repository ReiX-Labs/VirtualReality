import { useMemo, useState } from "react";

// Lab for §9.3 và §9.8 — đọc bốn con số của `stat unit`.
// Chế độ "đề bài": lab đưa một tình huống, bạn đoán nút thắt trước khi xem đáp
// án. Đó chính là bài tập §9.9 BT1 — đoán trước, đo sau.

interface Scenario {
  id: string;
  title: string;
  frame: number;
  game: number;
  draw: number;
  gpu: number;
  cause: string;
  fix: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "200 actor có Tick vừa được thêm vào",
    frame: 19.4,
    game: 19.1,
    draw: 4.2,
    gpu: 9.8,
    cause:
      "Game thread. 200 actor tick nghĩa là 200 lần gọi hàm mỗi frame, cộng chi phí duyệt danh sách.",
    fix: "Tắt tick cho actor không cần. Chuyển sang timer, event, hoặc gộp logic vào một manager duy nhất.",
  },
  {
    id: "s2",
    title: "Import thẳng một cảnh kiến trúc từ Blender",
    frame: 16.2,
    game: 3.1,
    draw: 15.9,
    gpu: 8.4,
    cause:
      "Draw thread. Cảnh chưa gộp mesh, mỗi món đồ là một actor riêng với vài material riêng — draw call bùng nổ.",
    fix: "Gộp mesh tĩnh, dùng atlas texture để giảm số material, bật instancing cho vật lặp lại.",
  },
  {
    id: "s3",
    title: "r.ScreenPercentage đặt lên 150",
    frame: 21.8,
    game: 3.4,
    draw: 4.9,
    gpu: 21.5,
    cause:
      "GPU. Chi phí pixel tăng theo bình phương độ phân giải — 150% là hơn gấp đôi số pixel phải tô.",
    fix: "Hạ ScreenPercentage. Đây là núm rẻ nhất và cũng là núm nên vặn đầu tiên khi nghẽn GPU.",
  },
  {
    id: "s4",
    title: "8 đèn động có đổ bóng trong một phòng",
    frame: 18.7,
    game: 3.0,
    draw: 9.6,
    gpu: 18.4,
    cause:
      "GPU chính, Draw phụ. Mỗi đèn đổ bóng là thêm một lượt render toàn cảnh vào shadow map — đánh vào cả hai luồng.",
    fix: "Bake ánh sáng tĩnh. Giữ tối đa 1–2 đèn động có bóng, phần còn lại tắt bóng.",
  },
  {
    id: "s5",
    title: "Chạy tốt, nhưng vẫn thấy giật",
    frame: 13.1,
    game: 5.2,
    draw: 5.5,
    gpu: 12.6,
    cause:
      "Trung bình thì đạt, nhưng frame time không đều. Trung bình che giấu spike — và mắt người bắt được spike, không bắt được trung bình.",
    fix: "Nhìn stat unit theo thời gian chứ đừng nhìn con số trung bình. Dùng Perfetto tìm frame bị hụt, xem cái gì chen ngang.",
  },
  {
    id: "s6",
    title: "Mở menu là fps tụt",
    frame: 17.3,
    game: 16.9,
    draw: 6.1,
    gpu: 10.2,
    cause: "Game thread — widget đang tick. Hoặc bạn đang spawn quá nhiều stereo layer cùng lúc.",
    fix: "Tắt tick của widget khi không cần, dùng invalidation panel, và đếm lại số stereo layer.",
  },
];

const SYMPTOMS = [
  ["Khựng một nhịp khi gặp vật/material mới, lần 2 thì hết", "Thiếu PSO cache — §3.11"],
  ["Fps tốt lúc đầu, tụt dần sau 15 phút", "Nhiệt — SoC hạ xung. §9.6"],
  ["Fps tụt khi nhìn về một hướng cụ thể", "Quá nhiều vật hiển thị ở hướng đó; overdraw"],
  ["Fps tụt khi mở menu", "Widget tick, hoặc quá nhiều stereo layer — §6.9"],
  ["`Game` cao, `GPU` thấp", "Logic/tick/Blueprint — không phải vấn đề đồ hoạ"],
  ["`Draw` cao", "Quá nhiều draw call — gộp mesh, cull"],
  ["`GPU` cao", "Overdraw, shader, độ phân giải — vặn núm 1–3"],
  ["Fps ổn nhưng cảm giác vẫn giật", "Frame time không đều — nhìn theo thời gian, đừng nhìn trung bình"],
  ["Fps tốt trên Link, tệ trên device", "Bình thường — Link chạy trên GPU của PC. §3.14"],
];

const THREADS = [
  { id: "Game", budget: 6, note: "logic, tick, Blueprint, AI, physics" },
  { id: "Draw", budget: 6, note: "chuẩn bị lệnh vẽ gửi cho GPU" },
  { id: "GPU", budget: 11, note: "overdraw, shader, độ phân giải, đèn" },
];

export default function StatUnitLab() {
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState<string | null>(null);
  const [free, setFree] = useState(false);
  const [manual, setManual] = useState({ game: 5, draw: 5, gpu: 10 });

  const s = SCENARIOS[idx];
  const vals = free
    ? { game: manual.game, draw: manual.draw, gpu: manual.gpu, frame: Math.max(manual.game, manual.draw, manual.gpu) }
    : s;

  const truth = useMemo(() => {
    const m = Math.max(vals.game, vals.draw, vals.gpu);
    return m === vals.gpu ? "GPU" : m === vals.draw ? "Draw" : "Game";
  }, [vals]);

  const scale = 24;

  return (
    <div className="lab">
      <div className="seg">
        <button className={"seg-btn" + (!free ? " on" : "")} onClick={() => setFree(false)}>
          📋 Đề bài
        </button>
        <button className={"seg-btn" + (free ? " on" : "")} onClick={() => setFree(true)}>
          🎚 Tự nhập số
        </button>
      </div>

      {!free ? (
        <>
          <div className="lab-presets">
            {SCENARIOS.map((x, i) => (
              <button
                key={x.id}
                className={"preset" + (idx === i ? " on" : "")}
                onClick={() => {
                  setIdx(i);
                  setGuess(null);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="scenario-head">{s.title}</div>
        </>
      ) : (
        <div className="knob-grid">
          {(["game", "draw", "gpu"] as const).map((k) => (
            <label className="knob" key={k}>
              <span className="knob-head">
                <span className="knob-name">{k === "gpu" ? "GPU" : k === "draw" ? "Draw" : "Game"}</span>
                <span className="knob-val mono">{manual[k].toFixed(1)} ms</span>
              </span>
              <input
                type="range"
                min={0.5}
                max={24}
                step={0.1}
                value={manual[k]}
                onChange={(e) => setManual((m) => ({ ...m, [k]: Number(e.target.value) }))}
              />
              <span className="knob-hint">{THREADS.find((t) => t.id.toLowerCase() === k)!.note}</span>
            </label>
          ))}
        </div>
      )}

      <pre className="code-out stat">{`Frame: ${vals.frame.toFixed(1)} ms  ${(1000 / vals.frame).toFixed(0)} FPS
Game:  ${vals.game.toFixed(1)} ms
Draw:  ${vals.draw.toFixed(1)} ms
GPU:   ${vals.gpu.toFixed(1)} ms`}</pre>

      <div className="lab-bars">
        {THREADS.map((t) => {
          const v = t.id === "GPU" ? vals.gpu : t.id === "Draw" ? vals.draw : vals.game;
          const hot = truth === t.id;
          return (
            <div className="bar-row" key={t.id}>
              <span className="bar-label">
                {t.id}
                {hot && <b className="bar-tag">nghẽn</b>}
              </span>
              <span className="bar-track">
                <span
                  className={"bar-fill " + (v > t.budget ? "over" : hot ? "hot" : "")}
                  style={{ width: (v / scale) * 100 + "%" }}
                />
                <span className="bar-limit" style={{ left: (t.budget / scale) * 100 + "%" }} />
              </span>
              <span className="bar-val mono">{v.toFixed(1)} ms</span>
            </div>
          );
        })}
        <div className="bar-caption">
          Vạch đứng là cách chia thô cho ngân sách 13,8 ms: Game ≤6, Draw ≤6, GPU ≤11.{" "}
          <i>⚠️ Con số kinh nghiệm để định hướng, không phải chỉ tiêu chính thức của Meta.</i>
        </div>
      </div>

      {!free && (
        <>
          <div className="lab-h">Đoán trước khi xem đáp án — nút thắt nằm ở đâu?</div>
          <div className="lab-presets">
            {THREADS.map((t) => (
              <button
                key={t.id}
                className={"preset" + (guess === t.id ? " on" : "")}
                onClick={() => setGuess(t.id)}
              >
                {t.id}
              </button>
            ))}
          </div>
        </>
      )}

      {(free || guess) && (
        <div className={"lab-verdict " + (free ? "info" : guess === truth ? "ok" : "danger")}>
          <div className="lv-title">
            {free ? `Nút thắt: ${truth}` : guess === truth ? `✅ Đúng — nghẽn ở ${truth}` : `❌ Sai — nghẽn ở ${truth}, không phải ${guess}`}
          </div>
          <div className="lv-note">
            {free ? (
              <>
                Con số lớn nhất là nút thắt. Tối ưu {truth === "GPU" ? "Game hoặc Draw" : truth === "Draw" ? "Game hoặc GPU" : "Draw hoặc GPU"}{" "}
                trong tình huống này sẽ <b>không thay đổi fps một chút nào</b>.
              </>
            ) : (
              <>
                <p>
                  <b>Nguyên nhân:</b> {s.cause}
                </p>
                <p>
                  <b>Sửa:</b> {s.fix}
                </p>
              </>
            )}
          </div>
          <div className="lv-cost">
            Đây là bước đầu tiên của mọi việc tối ưu. Tối ưu shader khi nút thắt nằm ở game thread là
            lãng phí thời gian — và người mới làm điều này rất thường xuyên.
          </div>
        </div>
      )}

      <details className="lab-note">
        <summary>Bảng chẩn đoán: triệu chứng → nghi ngờ đầu tiên</summary>
        <div className="mini-table two">
          <div className="mtr head">
            <span>Triệu chứng</span>
            <span>Nghi ngờ đầu tiên</span>
          </div>
          {SYMPTOMS.map((row) => (
            <div className="mtr" key={row[0]}>
              <span>{row[0]}</span>
              <span>{row[1]}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
