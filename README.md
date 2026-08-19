# XRLab — Học lập trình VR · MR · XR với Unreal Engine 5.6 & Meta Quest 3

Website học tập tương tác được sinh ra từ giáo án [`GiaoAn_VR_UE56_Quest3.md`](GiaoAn_VR_UE56_Quest3.md) — toàn bộ nội dung bài học lấy thẳng từ tài liệu gốc, không chép tay lại.

**🌐 Truy cập:** https://rei-1407.github.io/VirtualReality/

## Có gì trong đó

| Mục | Nội dung |
| --- | --- |
| 📖 **Bài học** | 10 chương · 106 bài, đánh số theo đúng giáo án, kèm nhãn tin cậy ✅ / ⚠️ / ❓ |
| 🧠 **Ôn tập cách quãng** | 129 thẻ ghi nhớ, lịch ôn SM-2 — thẻ tự mở khoá theo bài đã học |
| ❓ **Quiz** | Trắc nghiệm cuối bài cho các bài trọng tâm, có giải thích đáp án |
| 🧪 **13 lab tương tác** | Mô phỏng bẫy thực địa: judder, IPD, foveated rendering, vignette, guardian… |
| 🗺️ **Lộ trình 7 tuần** | 31 bài tập thực hành, mỗi tuần có bài chốt chạy trên Quest 3 thật |
| 🪤 **Sổ tay bẫy** | 13 mục lỗi thực địa, tìm kiếm theo triệu chứng (không dấu cũng ra) |
| 📚 **Phụ lục** | Console variables, thuật ngữ, tài liệu tham khảo — tra cứu theo tab |

Tiến độ (XP, streak, thẻ ôn, bài tập) lưu trong `localStorage` của trình duyệt — không cần tài khoản.

## Chạy local

```bash
npm install
npm run dev      # http://localhost:5173
```

Build tĩnh: `npm run build` → thư mục `dist/`.

## Kiến trúc

- **Vite 5 + React 18 + TypeScript** (strict), không dùng UI framework — CSS tự viết.
- `GiaoAn_VR_UE56_Quest3.md` được import bằng `?raw` và parse lúc runtime thành cây Chương → Bài (`src/content/parse.ts`). **Sửa giáo án = website tự cập nhật theo.**
- Quiz / thẻ ôn / bài tập / lab là lớp biên soạn thêm, tham chiếu bài học qua `sectionId` (`src/data`, `src/content`, `src/labs`).
- `HashRouter` + GitHub Actions deploy lên GitHub Pages (`.github/workflows/deploy.yml`).

## Cập nhật nội dung

1. Sửa `GiaoAn_VR_UE56_Quest3.md`
2. `git commit` + `git push` — workflow tự build và deploy lại.
