# Giáo án VR/MR trên Unreal Engine 5.6 cho Meta Quest 3

**Phiên bản engine mục tiêu:** Unreal Engine 5.6 (khoá cứng — tài liệu này không khuyến nghị nâng cấp)
**Thiết bị mục tiêu:** Meta Quest 3 standalone (arm64, Vulkan)
**Đối tượng:** developer đã thành thạo C++ và Blueprint, chưa từng làm VR, dùng Git/GitHub ở mức cơ bản
**Ngày soạn:** 2026-08-19
**Trạng thái:** ✅ **Bản đầy đủ — Chương 0 → 10 và Phụ lục A → D.** Đã qua ba lần rà soát; bảy lỗi trong các bản nháp (N1-N7, Phụ lục B) đã được tìm ra và sửa — trong đó hai lỗi logic compile sạch nhưng chạy sai.

---

## Cách dùng tài liệu này

### Ba nhãn độ tin cậy — đọc trước khi tin bất cứ dòng nào

Tài liệu này không giả vờ mọi thứ đều chắc chắn. Mỗi khẳng định quan trọng đều được gắn một trong ba nhãn:

| Nhãn | Nghĩa | Bạn nên làm gì |
|---|---|---|
| ✅ | Xác minh được từ tài liệu chính thức của Epic hoặc Meta, có link nguồn | Tin, nhưng vẫn đọc link nếu là quyết định lớn |
| ⚠️ | Từ cộng đồng (forum, blog), hoặc tài liệu chính thức nhưng viết chung cho "UE 5" chứ không riêng 5.6 | Coi là gợi ý. Kiểm chứng trước khi xây kiến trúc lên nó |
| ❓ | Không xác minh được, hoặc là quan sát hiện trường chưa rõ nguyên nhân | **Phải tự test.** Nếu kết quả khác, sửa tài liệu này |

Nhãn ⚠️ xuất hiện nhiều hơn bạn nghĩ. Lý do: Meta viết tài liệu cho "Unreal Engine 5" nói chung, rất ít khi tách riêng từng minor version. Một dòng đúng cho 5.7 chưa chắc đúng cho 5.6.

### Cảnh báo về code trong tài liệu này

**Toàn bộ code trong tài liệu này chưa qua compile.** Nó đúng cú pháp và đúng API theo tài liệu tham chiếu, nhưng mục đích là để bạn **gõ lại và tự sửa lỗi build**, không phải copy-paste là chạy. Việc sửa lỗi include thiếu, tên module sai, signature đổi giữa các bản — đó là một phần của việc học, và cũng là kỹ năng bạn sẽ dùng hàng ngày sau này.

Nếu một đoạn code không build, thứ tự xử lý: đọc kỹ thông báo lỗi → tra tên symbol trong source engine (`Engine/Source/Runtime/...`) → tra tài liệu → hỏi. Đừng đổi ngẫu nhiên cho tới khi hết lỗi.

### Lộ trình

Chương 0 và 1 là **"tuần 0"** — việc phải xong *trước khi* tính tuần 1. Lý do rất thực dụng: verify tài khoản Meta Developer có thể mất vài ngày và không có cách nào ép nhanh hơn. Nếu để tới sáng thứ Hai tuần 1 mới làm thì mất trắng vài ngày.

| Tuần | Chương | Sản phẩm phải nộp |
|---|---|---|
| **0** | 0, 1 | Máy cài xong, 3 tài khoản verify xong, plugin Meta XR nằm đúng chỗ, project rỗng mở được |
| 1 | 2, 3 | Project build & deploy được lên Quest 3, chạy ổn định ≥72 fps, có PSO cache |
| 2 | 4 | VR Pawn tự viết: camera, 2 controller, EnhancedInput, teleport |
| 3 | 5 | Grab contact-based, thả, highlight bằng shell mesh |
| 4 | 6 | Menu world-locked chữ sắc nét trên device, có đường lùi |
| 5 | 7 | Passthrough + room từ MRUK + collision proxy + nhánh fallback |
| 6 | 8, 9, 10 | Fade XR-safe, level streaming có watchdog, tự viết tài liệu bàn giao |

### Mục lục

**Tuần 0 — hạ tầng**
- [Chương 0 — Làm trước ngày 1](#chương-0--làm-trước-ngày-1)
- [Chương 1 — Git/GitHub và lấy Meta XR cho UE 5.6](#chương-1--gitgithub-và-lấy-meta-xr-cho-ue-56)

**Tuần 1 — nền móng**
- [Chương 2 — Trực giác VR cho dev chưa làm VR](#chương-2--trực-giác-vr-cho-dev-chưa-làm-vr)
- [Chương 3 — Baseline Quest 3](#chương-3--baseline-quest-3)

**Tuần 2-4 — tương tác và giao diện**
- [Chương 4 — VR Pawn và Enhanced Input](#chương-4--vr-pawn-và-enhanced-input)
- [Chương 5 — Tương tác: grab, ray, highlight](#chương-5--tương-tác-grab-ray-highlight)
- [Chương 6 — UI bằng Stereo Layer](#chương-6--ui-bằng-stereo-layer)

**Tuần 5-6 — MR và hoàn thiện**
- [Chương 7 — Mixed Reality: Passthrough, Scene, MRUK, Hand Tracking, Anchors](#chương-7--mixed-reality-passthrough-scene-mruk)
- [Chương 8 — Chuyển cảnh XR-safe và async có watchdog](#chương-8--chuyển-cảnh-xr-safe-và-async-có-watchdog)
- [Chương 9 — Hiệu năng 72 fps và profiling trên device](#chương-9--hiệu-năng-72-fps-và-profiling-trên-device)
- [Chương 10 — Văn hoá tài liệu, bàn giao và VRC](#chương-10--văn-hoá-tài-liệu-bàn-giao-và-vrc)

**Phụ lục**
- [Phụ lục A — Sổ tay bẫy thực địa](#phụ-lục-a--sổ-tay-bẫy-thực-địa)
- [Phụ lục B — Đã sửa gì so với tài liệu 5.5](#phụ-lục-b--đã-sửa-gì-so-với-tài-liệu-55)
- [Phụ lục C — Nguồn](#phụ-lục-c--nguồn)
- [Phụ lục D — Bài tập file config gài lỗi](#phụ-lục-d--bài-tập-file-config-gài-lỗi)

---
---

# Chương 0 — Làm trước ngày 1

## 0.1 Vì sao có chương này

Chương này không dạy gì về VR. Nó tồn tại vì một lý do duy nhất: **có những việc phụ thuộc vào người khác duyệt, và bạn không ép nhanh được.**

Cụ thể: để lấy được plugin Meta XR cho UE 5.6, bạn cần truy cập một repo GitHub riêng của Meta. Để truy cập được repo đó, bạn cần một tài khoản Meta Developer đã verify, một tài khoản Epic đã liên kết GitHub, và một tài khoản GitHub. ✅ Ba điều kiện này được Meta ghi rõ trong tài liệu điều kiện tiên quyết ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-prerequisites/)).

Nếu bạn bắt đầu Chương 1 mà chưa có ba thứ đó, bạn sẽ dừng ở bước 2 và chờ. Nên làm chương này trước, song song với việc đọc Chương 2 (chương lý thuyết, không cần máy).

## 0.2 Phần cứng và máy

| Hạng mục | Yêu cầu | Ghi chú |
|---|---|---|
| Headset | Meta Quest 3 (hoặc 3S) | Quest 2 chạy được nhưng ngân sách hiệu năng khác, tài liệu này viết cho Quest 3 |
| Cáp | USB-C data (không phải cáp chỉ sạc) | Cáp chỉ sạc là bẫy kinh điển: `adb devices` không thấy gì mà không hiểu vì sao |
| Đĩa trống | ✅ Tối thiểu ~50 GB cho riêng bản cài UE qua Epic Launcher ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-unreal-engine/)) | Cộng thêm Android SDK/NDK (~15-20 GB), project, DerivedDataCache. Chuẩn bị ≥150 GB cho thoải mái. ❓ Nếu sau này đi đường compile fork thì cần hàng trăm GB |
| RAM | 32 GB khuyến nghị | 16 GB làm được nhưng build C++ và cook sẽ chậm và dễ swap |
| OS | Windows 10/11 | Linux/macOS làm được nhưng toolchain Android + MQDH kém thuận lợi hơn nhiều |

## 0.3 Ba tài khoản phải verify — và cái bẫy thanh toán

Đây là phần dễ mất thời gian nhất.

### (a) Tài khoản Meta Developer đã verify

✅ Meta yêu cầu verify bằng **một trong hai** cách: bật xác thực hai lớp qua SMS số điện thoại, **hoặc** thêm thẻ tín dụng/thẻ ghi nợ. **PayPal không được chấp nhận** ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-prerequisites/)).

> ⚠️ **Bẫy cho người ở Việt Nam:** chuyện thẻ quốc tế không add được vào tài khoản Meta là có thật và khá phổ biến. **Ưu tiên đường SMS 2FA** — nhanh hơn, không cần thẻ. Nếu SMS không tới, thử lại sau vài phút thay vì bấm gửi lại liên tục (dễ bị rate-limit).

Verify qua 2FA thường có hiệu lực gần như tức thời. ❓ Không có SLA công bố; kinh nghiệm cộng đồng nói từ vài phút tới vài giờ.

### (b) Tài khoản GitHub

Có sẵn rồi thì dùng. Chưa có thì tạo — miễn phí, không cần verify gì đặc biệt.

### (c) Liên kết Epic ↔ GitHub

Đây là bước hay bị bỏ sót nhất.

1. Đăng nhập [epicgames.com](https://www.epicgames.com) → **Account** → **Apps and Accounts** (hoặc **Connections** → **Accounts**)
2. Tìm GitHub, bấm **Connect**, cho phép
3. **Vào email GitHub, bấm link xác nhận lời mời tham gia organization của Epic** ← bước bị bỏ sót
4. Vào [github.com/settings/organizations](https://github.com/settings/organizations), xác nhận đã thấy `EpicGames`

Nếu bước 3-4 chưa xong, bạn sẽ thấy **404** khi mở repo `Oculus-VR/UnrealEngine` — và 404 rất dễ bị hiểu nhầm là "repo không tồn tại" hoặc "Meta đã bỏ hỗ trợ 5.6". Không phải. Đó là 404 của GitHub cho repo private mà bạn không có quyền.

> **Quy tắc chẩn đoán:** repo Meta trả 404 = vấn đề quyền truy cập, gần như không bao giờ là vấn đề repo biến mất.

### (d) Verify Organization — chưa cần bây giờ

✅ Để submit app lên Horizon Store cần thêm bước verify tổ chức ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-prerequisites/)). Việc này **không cần** cho học tập và sideload. Để dành tới khi thật sự chuẩn bị phát hành.

## 0.4 Bật Developer Mode trên Quest 3

1. Cài app **Meta Horizon** trên điện thoại, đăng nhập cùng tài khoản đã verify ở §0.3(a)
2. Kết nối headset trong app
3. Vào phần settings của headset → **Developer Mode** → bật
4. Khởi động lại headset
5. Cắm cáp USB-C vào PC → **trong headset sẽ có popup xin phép USB debugging → chọn Allow và tick "Always allow"**
6. Trên PC: `adb devices` phải ra một dòng có chữ `device` (không phải `unauthorized`)

Bảng chẩn đoán nhanh:

| `adb devices` ra gì | Nghĩa |
|---|---|
| Không có dòng nào | Cáp chỉ sạc, hoặc chưa cài driver, hoặc chưa bật Developer Mode |
| `unauthorized` | Chưa bấm Allow trong headset. Rút cắm lại, nhìn vào headset |
| `offline` | Rút cắm lại; nếu vẫn vậy thì `adb kill-server && adb start-server` |
| `<serial>  device` | ✅ Xong |

## 0.5 Cài phần mềm

Thứ tự cài quan trọng — cài Android **trước** khi mở project VR đầu tiên, để Project Setup Tool có cái mà kiểm tra.

1. **Epic Games Launcher** → cài **UE 5.6.1** (chọn bản patch mới nhất của dòng 5.6, không phải 5.6.0). Trong bước chọn thành phần, nhớ tick **Android** target platform.
2. **Android Studio + SDK + NDK** — xem chi tiết ở §3.3, làm theo Turnkey của Epic.
3. **Meta Quest Developer Hub (MQDH)** — tải từ trang developer của Meta. ✅ MQDH cần thiết để plugin/editor thấy được headset, để tắt boundary và proximity sensor khi test trên bàn, và để upload/đo hiệu năng ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-debug-android/)).
4. **Meta Quest Link** (tuỳ chọn) — chỉ cần nếu muốn dùng VR Preview trong editor. Xem §3.14 để biết giới hạn.

> **Mẹo MQDH đáng giá cả tuần:** tắt **Proximity Sensor** và **Guardian/Boundary** trong MQDH. Không tắt thì mỗi lần bạn tháo headset ra để gõ code, app sẽ pause; và mỗi lần bạn ngồi test ở bàn, lưới boundary sẽ nhảy ra che tầm nhìn.

## 0.6 Phần thưởng sớm — 20 phút, trước khi đọc bất cứ lý thuyết nào

Trước khi bạn đi tiếp vào Chương 1 và 2 (khá nhiều chữ), hãy làm việc này để có một lần thắng nhanh và một mốc tham chiếu trong đầu.

1. Tạo project mới từ **VR Template** (Blueprint, không cần C++), đặt tên gì cũng được — đây là project vứt đi
2. Bật Meta XR plugin nếu đã cài xong (nếu chưa, bỏ qua bước này — vẫn chạy được ở mức cơ bản)
3. Project Settings → Platforms → Android → **Package for Meta Quest**
4. Platforms → **Android → Package Project**
5. `adb install -r <file>.apk`
6. Đeo headset, vào **Library → Unknown Sources**, mở app

**Mục tiêu duy nhất: nhìn thấy một thứ do chính bạn build chạy trong headset.** Không tối ưu, không cấu hình, không quan tâm fps.

Nếu bước nào fail, **đừng sửa vội** — ghi lại thông báo lỗi vào sổ tay rồi đi tiếp. Chương 3 sẽ giải thích từng thứ một cách có hệ thống, và lúc đó bạn sẽ hiểu vì sao nó fail thay vì chỉ biết cách vá.

> **Vì sao có mục này:** phần còn lại của tuần 0 và tuần 1 gần như toàn hạ tầng — Git, plugin, config, toolchain. Rất dễ mất động lực khi làm hai ngày mà chưa thấy gì. 20 phút này cho bạn một mốc cụ thể: *"tôi đã build được một thứ và nó chạy"*. Mọi thứ sau đó là làm cho nó chạy **đúng cách**.

## 0.7 Checklist cổng ra Chương 0

Không sang Chương 1 khi chưa tick hết:

- [ ] Quest 3 + cáp USB-C data
- [ ] Tài khoản Meta Developer đã verify (SMS 2FA hoặc thẻ)
- [ ] Tài khoản GitHub
- [ ] Epic ↔ GitHub đã liên kết, và **thấy `EpicGames` trong danh sách organization trên GitHub**
- [ ] Developer Mode bật, `adb devices` ra `device`
- [ ] UE 5.6.1 cài xong, mở được project rỗng
- [ ] MQDH cài xong, thấy headset, đã tắt proximity + boundary
- [ ] Còn ≥100 GB đĩa trống

## 0.8 Bẫy của chương này

| Bẫy | Triệu chứng | Xử lý |
|---|---|---|
| Cáp chỉ sạc | `adb devices` trống rỗng | Đổi cáp. Đây là nguyên nhân số 1 |
| Quên bấm link trong email GitHub | Repo Meta trả 404 | Làm lại §0.3(c) bước 3-4 |
| Thẻ quốc tế không add được | Không verify được tài khoản Meta | Dùng đường SMS 2FA |
| Cài UE 5.6 mà không tick Android | Không có mục Android trong Project Settings | Modify installation trong Epic Launcher, thêm Android |
| Đợi tới tuần 1 mới verify tài khoản | Mất 1-3 ngày đầu tiên | Đó chính là lý do có Chương 0 |

---
---

# Chương 1 — Git/GitHub và lấy Meta XR cho UE 5.6

## 1.1 Vì sao một chương về Git lại nằm trong giáo án VR

Vì bạn không tải được plugin Meta XR cho UE 5.6 bằng cách bấm một nút.

Nghe vô lý, nhưng đây là tình trạng thực tế tháng 8/2026, và nó là hệ quả trực tiếp của việc khoá engine ở 5.6. Hiểu được chương này thì bước cài đặt mất 30 phút. Không hiểu thì bạn sẽ tải sai bản, copy sai chỗ, và mất vài ngày với những lỗi build vô nghĩa.

## 1.2 Từ vựng Git tối thiểu

Bạn biết `git clone`, `git commit`, `git push`. Đủ để làm việc, chưa đủ để hiểu cách Meta phân phối engine. Bốn khái niệm còn thiếu:

| Khái niệm | Định nghĩa | Ẩn dụ |
|---|---|---|
| **repository (repo)** | Một dự án cùng toàn bộ lịch sử thay đổi của nó | Một quyển sổ ghi mọi lần sửa |
| **clone** | Tải một bản sao repo về máy mình | Photo quyển sổ về nhà đọc |
| **fork** | Tạo bản sao repo của **người khác** dưới tài khoản mình, để sửa độc lập mà không ảnh hưởng bản gốc | Photo quyển sổ của người khác rồi tự viết thêm vào bản photo của mình |
| **branch** | Một nhánh làm việc song song trong cùng repo | Viết nháp ở trang cuối sổ, chưa nhập vào bản chính |
| **tag** | Một cái nhãn **cố định** trỏ tới đúng một commit | Kẹp giấy đánh dấu trang: "đây là bản phát hành ngày X" |
| **release** | Một bản đóng gói gắn với một tag, thường kèm file tải về | Bản in đóng bìa của trang được kẹp giấy |

**Điểm mấu chốt: tag không bao giờ di chuyển.** Branch thì tiến lên mỗi khi có commit mới, còn tag đứng im mãi. Đó là lý do tag được dùng để đánh dấu phiên bản phát hành — nó đảm bảo "bản 5.6.1 hôm nay" giống hệt "bản 5.6.1 sáu tháng nữa".

## 1.3 Bản đồ thực tế

```
EpicGames/UnrealEngine                    ← engine gốc, private, cần link tài khoản
        │
        │  (Meta fork toàn bộ về, rồi thêm code tối ưu cho Quest)
        ▼
Oculus-VR/UnrealEngine                    ← fork của Meta, cũng private
        │
        ├── tag oculus-5.6.0-release-v81
        ├── tag oculus-5.6.1-release-v83   ← bản cao nhất cho dòng 5.6
        ├── tag oculus-5.7.4-release-v205
        └── ...
```

**`Oculus-VR/UnrealEngine` chính là một fork.** Đây không phải ví dụ minh hoạ — đó là cách Meta phát hành engine của họ. Meta lấy nguyên engine của Epic, thêm vào các bản sửa lỗi và tối ưu riêng cho Quest, rồi phát hành dưới dạng tag.

Và bên trong mỗi tag đó có sẵn thư mục plugin Meta XR. ✅ Meta ghi rõ: file plugin được bao gồm trong bản tải của repo này ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-metaxr-plugin/)).

**Đây là chìa khoá của cả chương:** bạn có thể lấy plugin từ tag của fork **mà không cần compile fork**. Hai việc này hoàn toàn khác nhau, và nhiều người nhầm lẫn rồi đi compile engine 5 tiếng một cách không cần thiết.

## 1.4 Quy ước tên tag của Meta

✅ Meta công bố quy ước: mỗi tag ghép phiên bản Unreal Engine với phiên bản Meta XR, dạng `oculus-<UE version>-release-<MetaXR version>`. Ví dụ Meta đưa ra trong tài liệu là `oculus-5.7.4-release-1.205.0`. Tag đời cũ có thêm một đoạn Oculus SDK ở cuối (dạng `oculus-5.1.1-release-1.82.0-v50.4`), còn tag mới rút gọn phần Meta XR về minor version, kết thúc bằng `-release-v205` thay vì `-release-1.205.0` ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-compatibility-matrix/)).

✅ Meta cũng nói rõ cách chọn: khớp phiên bản Unreal trong tên tag với engine của project, rồi lấy **phiên bản Meta XR cao nhất** có cho engine đó.

Áp dụng cho ta:

| Tag | UE | Meta XR |
|---|---|---|
| `oculus-5.6.0-release-v81` | 5.6.0 | v81 |
| `oculus-5.6.1-release-v83` | 5.6.1 | **v83 ← cao nhất cho dòng 5.6** |

> ⚠️ Hai chuỗi tag cụ thể ở trên được suy ra từ quy ước đặt tên chính thức cộng với thông tin phiên bản trên trang download của Meta. Tôi **không mở được trực tiếp trang danh sách tag** trên GitHub để chụp lại nguyên văn, vì nó yêu cầu đăng nhập. Nên: **việc đầu tiên bạn làm khi vào được repo là mở tab Tags, lọc chữ `5.6`, và ghi lại tên tag chính xác.** Nếu nó khác những gì viết ở trên, sửa lại dòng này trong tài liệu.

## 1.5 Vấn đề trung tâm: trang Download không còn phục vụ 5.6

Đây là lý do cả chương này tồn tại.

✅ Tài liệu Meta viết: bản plugin Meta XR tải trực tiếp luôn **nhắm vào phiên bản Unreal Engine mới nhất được Meta hỗ trợ**; với các phiên bản UE khác thì phải cài plugin từ nhánh Oculus-VR trên GitHub. Plugin này cũng **không có trên Epic Games Marketplace** ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-metaxr-plugin/)).

✅ Và tại thời điểm soạn tài liệu, trang download "Unreal Engine 5 Integration" đang phát hành **v205.0, fork từ UE 5.7.4** ([nguồn](https://developers.meta.com/horizon/downloads/package/unreal-engine-5-integration/)).

**Kết luận:** nút Download trên trang Meta cho bạn plugin cho 5.7.4, không phải 5.6. Cài bản đó vào 5.6 sẽ không chạy hoặc chạy sai. Đường lấy plugin cho 5.6 là qua tag của fork.

> **Nói với trainee cho rõ:** đây không phải dấu hiệu 5.6 "bị bỏ rơi". Plugin cho 5.6 vẫn tồn tại và vẫn lấy được. Chỉ là nó nằm trong repo thay vì sau một cái nút.

## 1.6 Hai con đường — và tại sao mặc định là đường A

| | **Đường A — Epic build + copy plugin** | **Đường B — Compile fork** |
|---|---|---|
| Việc phải làm | Tải zip của tag, copy 1 thư mục | Clone fork, setup, generate, build cả engine |
| Thời gian | ~30 phút | Vài giờ (build) + thời gian tải |
| Đĩa | Không thêm đáng kể | ❓ Hàng trăm GB |
| Epic Launcher | Giữ nguyên tích hợp | Mất — engine thành bản source rời |
| Cập nhật hotfix Epic (5.6.2...) | Epic Launcher tự lo | Tự merge tay, vì Meta không tự merge hotfix của Epic vào fork |
| Đủ để học VR + MR? | **Có** | Có, nhưng dư |

**Mặc định của giáo án này là Đường A.** Đường B chỉ mở ra khi bạn thật sự cần một tính năng fork-only ở §1.9 — và ở tuần 1 thì bạn không cần cái nào trong số đó.

## 1.7 Đường A — từng bước

**Bước 1.** Mở `https://github.com/Oculus-VR/UnrealEngine` → tab **Tags**.
Nếu ra 404: quay lại §0.3(c). Đây là lỗi quyền, không phải lỗi repo.

**Bước 2.** Tìm bản cho dòng 5.6. Có **hai đường điều hướng**, thử theo thứ tự:

- **Đường tag** (chính xác nhất): tab **Tags**, lọc `5.6`, lấy Meta XR version cao nhất — dự kiến `oculus-5.6.1-release-v83`
- **Đường branch** (dễ tìm hơn): tab **Branches**, tìm branch tương ứng phiên bản UE của bạn. ✅ Đây chính là cách các sample chính thức của Meta hướng dẫn — chúng bảo checkout branch tương ứng với phiên bản UE ghi trong file `.uproject`

**Ghi lại tên chính xác vào sổ tay của bạn.** Tôi suy tên tag từ quy ước đặt tên của Meta chứ không mở được trang Tags (nó yêu cầu đăng nhập), nên **con số v83 cần bạn xác nhận lại**. Nếu lệch, sửa dòng này và ghi ngày.

**Bước 3.** Tải source dạng zip của **đúng tag đó** — không phải của branch, không phải nút Code màu xanh ở trang chủ repo (nút đó cho bạn branch mặc định, thường là bản khác). Vào đúng trang tag rồi tải từ đó.

**Bước 4.** Giải nén ra một thư mục tạm. Tìm thư mục plugin Meta XR, đường dẫn dạng:

```
<giải nén>/Engine/Plugins/Marketplace/MetaXR/
```

⚠️ Tên và vị trí thư mục có thể lệch giữa các bản (`MetaXR`, `OculusXR`, hoặc nằm trong `Engine/Plugins/Runtime/Oculus/`). Cách tìm chắc chắn: tìm file `*.uplugin` có chữ `MetaXR` hoặc `OculusXR` trong tên, rồi lấy **thư mục chứa nó**.

**Bước 5.** Copy thư mục plugin đó vào bản Epic Launcher 5.6:

```
C:\Program Files\Epic Games\UE_5.6\Engine\Plugins\Marketplace\
```

✅ Nếu chưa có thư mục `Marketplace` thì tự tạo — Meta hướng dẫn đúng như vậy ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-metaxr-plugin/)).

**Bước 6.** Mở UE 5.6 → **Edit → Plugins** → tìm "Meta XR" → bật.

**Bước 7.** ✅ **Tắt plugin OculusVR cũ nếu thấy nó.** Meta nói rõ: không bật plugin Oculus VR khi dùng UE 5.x vì nó đã deprecated ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-setting-up-metaxr-plugin/)).

**Bước 8.** Restart editor. Vào **Project Settings → Plugins → Meta XR** — thấy mục này là plugin đã nạp.

**Bước 9.** Chạy **Meta XR Project Setup Tool** (§3.5).

> **Bước 6-8 không cần compile engine.** Nếu bạn thấy editor bắt đầu build cái gì đó hàng nghìn file, bạn đã đi lạc sang Đường B.

## 1.8 Nếu project của bạn là C++

Đường A không cần build engine, nhưng **vẫn cần build lại module của project** — đây là chuyện bình thường với mọi project C++ khi đổi plugin.

Trong `*.Build.cs`, tên module là `OculusXR*` (không phải `Oculus*` kiểu UE4):

```csharp
PrivateDependencyModuleNames.AddRange(new string[]
{
    "OculusXRHMD",
    "OculusXRInput",
    "OculusXRPassthrough",
    "OculusXRAnchors",
    "OculusXRScene",
    "MRUtilityKit",
});
```

⚠️ Danh sách module chính xác có trong bản v83 cần kiểm chứng bằng cách mở `MetaXR.uplugin` và xem mục `Modules`. Đừng thêm module không tồn tại rồi ngồi đoán vì sao UBT báo lỗi.

Nếu bạn từng làm project với plugin Oculus đời UE4: các type cũng đổi tiền tố sang `OculusXR*`. Sửa tên type theo lỗi compile chỉ ra, không sửa hàng loạt bằng find-replace.

Và một dòng trong `*.Target.cs` — bắt buộc khi làm 5.6:

```csharp
DefaultBuildSettings = BuildSettingsVersion.V5;
IncludeOrderVersion  = EngineIncludeOrderVersion.Unreal5_6;
```

Thiếu dòng `IncludeOrderVersion` thì UBT cảnh báo mỗi lần build. Đừng tắt cảnh báo — sửa nó.

## 1.9 Đường B — khi nào mới đáng compile fork

✅ Meta công bố bảng so sánh tính năng giữa hai đường ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-compatibility-matrix/), cập nhật 4/8/2026). Phần quan trọng:

**Có ở cả hai đường** — tức là Đường A đủ:
Hand Tracking · Movement SDK · Passthrough · Scene · Spatial Anchors · Dynamic Resolution · Fixed Foveated Rendering · Layer Supersampling & Sharpening · Tonemap Subpass · OS Splash Screen · VR MobileHDR · Mobile Deferred · Meta Quest Super Resolution (từ v68+)

**Chỉ có ở fork:**

| Tính năng | Ghi chú |
|---|---|
| Application Space Warp (ASW) | Xem cảnh báo bên dưới |
| Eye Tracked Foveated Rendering | **Vô nghĩa với Quest 3** — xem bên dưới |
| Late Latching | từ v63+ |
| Software Occlusion Culling | từ v77+ |
| Mobile compositor layer depth testing | ảnh hưởng trực tiếp Chương 6 |
| Enhanced LightGrid dynamic local lights | từ v72+ |
| Uniform Based dynamic local lights | từ v65+ |
| Emulated Uniform Buffer | từ v65, ổn định v67+ |
| Adreno Occlusion Path | từ v65+ |
| Additional Perfetto Markers | |
| Iteration Time Improvements | |
| MR Occlusions (Depth API) soft occlusion + Depth API material graph | Đường A chỉ có hard occlusion |

Ba điều phải nói thẳng với trainee:

**(1) ASW không có đường thay thế trong 5.6.** ✅ Meta ghi: ASW cần fork ở các bản Unreal chính thức, và **từ UE 5.7** thì CVar native của Epic là `xr.OpenXRFrameSynthesis` mới cho chức năng tương đương mà không cần fork. Ta khoá ở 5.6 → không có `xr.OpenXRFrameSynthesis`. Muốn ASW thì chỉ còn đường fork.

**(2) Eye Tracked FFR không dùng được trên Quest 3 dù có fork.** ETFR cần headset có eye tracking; Quest 3 không có (hiện chỉ Quest Pro trong dòng Meta). Nên dòng "ETFR" trong bảng trên là lý do **không** áp dụng cho ta — kể cả compile fork cũng không có ETFR trên Quest 3. Đừng để nó vào cột lý do đi Đường B.

**(3) "Mobile compositor layer depth testing" là fork-only** — hệ quả trực tiếp là tuỳ chọn `Supports Depth` của Stereo Layer sẽ không đáng tin trên Đường A. Chi tiết ở Chương 6; ghi nhận ở đây để bạn không thiết kế UI dựa vào nó.

### Ngưỡng quyết định

Đi Đường B **chỉ khi** bạn trả lời "có, và tôi đã đo được là thiếu nó thì không đạt" cho ít nhất một trong: cần ASW · cần soft-occlusion Depth API · cần Late Latching · cần Software Occlusion Culling · cần dynamic local lights nâng cao · cần depth testing cho compositor layer.

Không đo trước mà đi Đường B = đốt một ngày build để lấy tính năng bạn chưa biết có cần hay không.

## 1.10 Bẫy đã biết ở chương này

| Bẫy | Triệu chứng | Xử lý |
|---|---|---|
| Tải plugin từ nút Download của Meta | Plugin cho 5.7.4, không chạy trên 5.6 | Lấy từ tag fork (§1.7) |
| Tải zip từ nút Code ở trang chủ repo | Được branch, không phải tag 5.6 | Vào đúng trang Tags, tải từ trang tag |
| Repo trả 404 | Chưa link Epic↔GitHub xong | §0.3(c), đặc biệt bước bấm link trong email |
| Bật cả Meta XR và OculusVR cũ | Xung đột, hành vi lạ | ✅ Tắt OculusVR (đã deprecated) |
| Trộn plugin v83 vào engine 5.7 hoặc ngược lại | Lỗi build/nạp plugin khó hiểu | Khớp UE version với tag |
| Trùng dòng splash trong `AndroidManifest` | ⚠️ Build Android fail ở bước manifest | ⚠️ Với bản re-port cộng đồng: tắt **Show Launch Image** trong Android settings rồi dùng "Add Splash Image" của Meta XR ([nguồn cộng đồng](https://forums.unrealengine.com/t/metaxr-v78-for-unreal-5-6-1-release/1768347)) |

> ⚠️ **Về bản re-port của cộng đồng:** trên forum Epic có người đóng gói lại plugin Meta XR (v77/v78) cho UE 5.6 để cài trực tiếp không cần vào fork. Nó hoạt động với nhiều người, nhưng **không phải nguồn chính thức của Meta**. Coi là phương án dự phòng nếu vì lý do nào đó không vào được fork — không phải phương án đầu tiên. Không dùng cho bản sẽ phát hành.

## 1.11 Git cho project Unreal — phần bạn sẽ dùng mỗi ngày

### `.gitignore`

Project Unreal sinh ra rất nhiều file dẫn xuất. Commit chúng làm repo phình lên hàng GB và gây conflict vô nghĩa.

```gitignore
# Sinh tự động — không bao giờ commit
Binaries/
Intermediate/
DerivedDataCache/
Saved/
Build/
.vs/
*.sln
*.suo
*.VC.db

# Giữ lại
# Config/        ← nguồn sự thật của mọi setting, PHẢI commit
# Content/       ← asset
# Source/        ← code
# *.uproject
# *.Build.cs / *.Target.cs
```

**Nguyên tắc phân biệt:** xoá đi mà engine tự dựng lại được → ignore. Xoá đi mà mất công người → commit.

`Config/` là thứ quan trọng nhất phải commit, vì toàn bộ Chương 3 nằm trong đó. Một project mất `DefaultEngine.ini` là project phải cấu hình lại từ đầu.

### Git LFS cho asset nhị phân

`.uasset` và `.umap` là file nhị phân. Git lưu mỗi phiên bản thành một bản đầy đủ → repo phình rất nhanh và không merge được.

```gitattributes
*.uasset filter=lfs diff=lfs merge=lfs -text
*.umap   filter=lfs diff=lfs merge=lfs -text
*.fbx    filter=lfs diff=lfs merge=lfs -text
*.png    filter=lfs diff=lfs merge=lfs -text
```

Kèm hai quy tắc làm việc nhóm: **không hai người sửa cùng một `.uasset`** (không merge được, chỉ chọn một bản và bỏ bản kia), và bật **File Lock** nếu team >2 người.

### Không bao giờ commit secret

Loại file không được vào repo, kể cả repo private:

- Keystore ký APK (`.keystore`, `.jks`) và mật khẩu của nó
- Meta App ID / App Secret
- API key, token của bất kỳ service nào

**Bài học từ thực tế:** một dự án VR thật đã để lọt security token của plugin AndroidFileServer vào `DefaultEngine.ini` rồi commit lên. Rủi ro trực tiếp thấp (plugin đang tắt, và có cấu hình chặn token lọt vào build đóng gói), nhưng token vẫn nằm trong **lịch sử git vĩnh viễn** — xoá ở commit sau không xoá được ở commit trước.

Hai điều rút ra:
1. Secret phải nằm ngoài repo từ đầu (biến môi trường, hoặc file local đã ignore). Sửa sau thì đã muộn.
2. Nếu đã lọt: coi như secret đó **đã bị lộ**, và **rotate nó**, chứ không phải chỉ xoá dòng đó đi.

## 1.12 Bài tập và checklist cổng ra

**Bài tập 1.** Viết vào sổ tay của bạn, bằng lời của mình, 3-4 câu trả lời cho: *tại sao Meta phân phối engine bằng tag của một fork thay vì một cái nút Download?* (Gợi ý: nghĩ về việc Meta cần sửa code bên trong engine, và cần đảm bảo bản 5.6.1 hôm nay giống bản 5.6.1 sáu tháng nữa.)

**Bài tập 2.** Vào tab Tags của repo Meta, lọc `5.6`, và ghi lại **tên tag chính xác** cùng Meta XR version cao nhất. So với §1.4. Nếu lệch → sửa tài liệu này và ghi ngày sửa.

**Bài tập 3.** Với project rỗng vừa tạo, viết `.gitignore`, `git init`, commit lần đầu. Chạy `git count-objects -vH` xem dung lượng. Sau đó thử **cố tình** bỏ `Binaries/` và `Intermediate/` khỏi `.gitignore`, add lại, và so sánh dung lượng. Ghi lại con số chênh lệch — con số đó là lý do có `.gitignore`.

**Checklist cổng ra:**

- [ ] Giải thích được fork/branch/tag bằng lời của mình
- [ ] Vào được repo `Oculus-VR/UnrealEngine`, không 404
- [ ] Ghi lại tên tag chính xác cho 5.6
- [ ] Plugin Meta XR nằm trong `UE_5.6/Engine/Plugins/Marketplace/`
- [ ] **Project Settings → Plugins → Meta XR** hiện ra
- [ ] Plugin OculusVR cũ đã tắt
- [ ] `.gitignore` xong, commit đầu tiên xong, dung lượng repo hợp lý
- [ ] Trả lời được: "tôi đi Đường A hay B, và vì sao"

---
---

# Chương 2 — Trực giác VR cho dev chưa làm VR

## 2.1 Chương này không có code

Bạn đã biết C++ và Blueprint. Điều bạn chưa có không phải kỹ năng lập trình, mà là **trực giác về những ràng buộc của VR**. Người viết code giỏi nhưng chưa làm VR thường vấp đúng bốn chỗ, và cả bốn đều không phải lỗi lập trình:

1. Coi PIE là sự thật
2. Không có cảm giác về ngân sách 13,8 ms
3. Nghĩ tính năng quan trọng hơn comfort
4. Không hiểu compositor là một tầng riêng, nằm ngoài tầm với của code gameplay

Đọc chương này trước khi mở editor. Nó rẻ hơn nhiều so với việc học lại bằng cách làm sai bốn tuần.

## 2.2 13,8 ms — con số phải ghi lên bàn

✅ Meta nói rõ: app dạng media player có thể nhắm 60 FPS, còn **app tương tác phải đạt tối thiểu 72 FPS** ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-debug-android/)).

72 FPS → **13,8 ms cho một frame**. Đó là toàn bộ ngân sách: game thread, render thread, GPU, tất cả.

Ba điều làm con số này khó hơn nó nghe:

**(1) Bạn render hai lần.** Hai mắt, hai góc nhìn. Multi-View và instanced stereo giảm được phần lớn chi phí CPU của việc này (§3.6), nhưng không xoá được nó.

**(2) Đây là mobile GPU.** Quest 3 là một chip di động trong một hộp nhựa không quạt. Nó không có ngân sách nhiệt của desktop.

**(3) Tụt frame trong VR không phải "hơi khó chịu" — nó làm người dùng buồn nôn.** Ở game màn phẳng, 45 fps là "hơi giật". Trong VR, đó là mismatch giữa cử động đầu và hình ảnh, và cơ thể phản ứng bằng cảm giác say. Đây là khác biệt định tính, không phải định lượng.

> **Câu để nhớ:** trong game màn phẳng, hiệu năng là chất lượng. Trong VR, hiệu năng là **điều kiện để sản phẩm dùng được**.

### Nhiệt là một biến số, không phải hằng số

✅ Khi headset gặp sự cố nhiệt, hệ thống tự hạ xuống 72 Hz, rồi hạ tiếp bằng cách tăng minVsyncs lên 2 ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-change-display-refresh-rate/)).

Hệ quả thực tế: **app chạy tốt trong 5 phút đầu không có nghĩa là nó chạy tốt.** Test hiệu năng phải kéo dài 20-30 phút liên tục để thấy hành vi sau khi thiết bị nóng lên. Đây là một trong những thứ mà không có cách nào mô phỏng trên PC.

## 2.3 Vì sao PIE nói dối

Play-In-Editor chạy trên GPU desktop của bạn, không đi qua compositor của Quest, và không có runtime của Quest. Nghĩa là một loạt thứ **về nguyên tắc** không thể verify trong PIE:

| Hạng mục | PIE | Quest Link | Device thật |
|---|---|---|---|
| Logic gameplay, state machine | ✅ | ✅ | ✅ |
| Bố cục UI (kích thước, vị trí) | ✅ tương đối | ✅ | ✅ |
| **Stereo layer** (chữ có sắc nét không) | ❌ | ⚠️ | ✅ |
| **Passthrough** | ❌ | ⚠️ ✅ có hỗ trợ qua Link | ✅ |
| **MRUK / Scene** (dữ liệu phòng thật) | ❌ | ⚠️ chỉ nếu đã quét phòng trước | ✅ |
| **Space Setup** (quét phòng) | ❌ | ❌ ✅ Meta nói không chạy được qua Link | ✅ |
| **Fixed Foveated Rendering** | ❌ | ❌ | ✅ |
| **Hiệu năng thật, nhiệt** | ❌ | ❌ | ✅ |
| **Hand tracking** | ❌ | ⚠️ có hỗ trợ qua Link | ✅ |

Lý do gốc rất đơn giản: **stereo layer, passthrough, FFR đều là tính năng của compositor và runtime trên thiết bị**, không phải tính năng của renderer trong engine. Code của bạn chỉ gửi yêu cầu sang compositor; compositor không tồn tại trong PIE.

> **Luật của giáo án này: mỗi tuần đều phải deploy lên device thật ít nhất một lần.** Bốn tuần code trong PIE rồi mới build là công thức thất bại có thật, không phải lời cảnh báo lý thuyết.

## 2.4 Ngân sách hình học

✅ Hướng dẫn tối ưu hiệu năng VR của Meta đưa ra: giới hạn mỗi frame ở mức tối đa khoảng 500-1.000 draw call, và 1-2 triệu triangle/vertex ([nguồn](https://developers.meta.com/horizon/documentation/native/pc/dg-performance-guidelines/)).

⚠️ **Nhưng đọc con số này có điều kiện.** Đây là hướng dẫn chung cho dòng Quest, có gốc từ thời Quest 2. Quest 3 khoẻ hơn đáng kể (RAM 8 GB so với 6 GB, GPU mạnh hơn). ❓ Meta chưa công bố ngưỡng riêng chính thức cho Quest 3.

Cách dùng đúng: coi là **mục tiêu tham khảo, không phải chỉ tiêu nghiệm thu**. Con số duy nhất có giá trị nghiệm thu là **fps đo trên device thật ở phút thứ 25 của phiên test**.

> ⚠️ Bạn sẽ thấy trên mạng những hướng dẫn nói "Quest phải dưới 100 draw call". Con số đó thường là hướng dẫn Quest 2 rất bảo thủ, hoặc cho một loại nội dung cụ thể. Chênh lệch 100 vs 1.000 là do khác định nghĩa "an toàn" và "tối đa", không phải do một bên sai. Đừng lấy con số của người khác làm chỉ tiêu — hãy đo của mình.

## 2.5 Comfort — và vì sao nó thắng tính năng

✅ Meta khuyến nghị đọc Human Interface Guidelines **trước khi viết dòng code đầu tiên** ([nguồn](https://developers.meta.com/horizon/essentials/quick-start/)). Đây không phải lời khuyên hình thức: rất nhiều quyết định kiến trúc trong VR bị đảo ngược sau khi test comfort, và đảo ngược muộn thì đắt.

Bốn luật vàng cho người mới:

**(1) Framerate ổn định là nguyên nhân say số 1.** Trước khi thêm bất kỳ tính năng chống say nào, hãy giữ frame ổn định. Không có vignette nào cứu được app tụt xuống 50 fps.

**(2) Không di chuyển camera ngoài ý muốn người dùng.** Cutscene xoay camera, camera shake khi trúng đòn, lerp camera tới vị trí mới — tất cả đều bình thường ở game màn phẳng và **đều gây say trong VR**. Trong VR, camera thuộc về cái đầu của người dùng, không thuộc về bạn.

**(3) Teleport + snap turn là mặc định an toàn.** ✅ Đây cũng là những gì VR Template của UE cung cấp sẵn ([nguồn](https://dev.epicgames.com/documentation/en-us/unreal-engine/vr-template-in-unreal-engine)). Smooth locomotion và smooth turn thì thoải mái hơn với người đã quen VR nhưng gây say cho người mới — nếu làm, hãy để nó là **tuỳ chọn**, không phải mặc định, và kèm vignette (thu hẹp tầm nhìn ngoại vi khi di chuyển).

**(4) Gia tốc tệ hơn tốc độ.** Di chuyển đều tốc độ cao dễ chịu hơn nhiều so với tăng/giảm tốc liên tục ở tốc độ thấp. Cơ chế: tai trong cảm nhận gia tốc, và khi mắt báo có gia tốc mà tai trong không cảm nhận thấy, đó chính là xung đột gây say.

> **Trực giác nên hình thành:** trong VR, câu hỏi "tính năng này có hay không?" luôn đứng sau câu hỏi "người dùng có chịu được nó trong 20 phút không?".

## 2.6 Compositor là một tầng riêng — đây là ý niệm khó nhất

Đây là điểm mà kinh nghiệm game màn phẳng dễ gây hiểu sai nhất, và nó lý giải rất nhiều thứ ở các chương sau.

Với game màn phẳng, mô hình tư duy quen thuộc là: engine render một frame → frame lên màn hình. Với VR trên Quest, thực tế là:

```
engine render frame  →  giao cho compositor của runtime
                              │
                              ├── reproject theo pose đầu MỚI NHẤT (giảm latency)
                              ├── ghép các compositor layer (UI, passthrough) vào
                              └── xuất ra panel hai mắt
```

Compositor **không phải** một phần của renderer trong engine. Nó nằm sau, và nó có quyền sửa hình ảnh của bạn.

Ba hệ quả mà bạn sẽ gặp trực tiếp:

- **Có những thứ post-process không chạm tới được.** Compositor layer không nằm trong scene render, nên hiệu ứng post-process không áp lên nó. Đây là gốc rễ của vấn đề fade màn hình ở Chương 8.
- **Có những thứ đẹp hơn nếu đi qua compositor.** Đẩy UI thành compositor layer cho chữ sắc nét hơn nhiều so với render UI trong scene — Chương 6.
- **Ngân sách compositor layer là hữu hạn.** ✅ Tối đa 16 compositor layer mỗi frame; layer thứ 17 trở đi không được render ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-overlay/)).

## 2.7 Bốn sai lầm tư duy phổ biến

| Sai lầm | Vì sao nó sai |
|---|---|
| "Chạy được trong PIE là xong, build sau" | §2.3. Stereo layer/passthrough/MRUK/FFR *về nguyên tắc* không verify được trong PIE |
| "Tối ưu để sau, giờ làm tính năng trước" | Ở màn phẳng thì được. Ở VR, thiếu hiệu năng nghĩa là sản phẩm không dùng được, nên nó là ràng buộc thiết kế từ đầu |
| "Chạy tốt 5 phút là chạy tốt" | §2.2. Nhiệt làm hệ thống tự hạ tần số. Test 25-30 phút |
| "Tính năng này Meta có hỗ trợ nên bật lên" | Hỗ trợ ≠ nên bật. Sẽ thấy rất rõ ở chuyện Mobile HDR (§3.7) |

## 2.8 Bài tập (không cần máy)

**Bài tập 1.** Đeo Quest 3 và dùng **3-4 app thương mại có sẵn** trong 30 phút. Không code, chỉ quan sát và ghi lại: cách chúng cho bạn di chuyển; menu nằm ở đâu, gắn vào tay hay gắn vào không gian; có app nào làm bạn hơi choáng không và bạn nghĩ vì sao. Đây là bài tập quan trọng nhất của chương — bạn đang xây thư viện tham chiếu trong đầu.

**Bài tập 2.** Nhìn lại một tính năng bạn từng làm ở game màn phẳng có di chuyển camera (cutscene, camera shake, lerp tới vị trí). Viết 3-5 câu: nếu port sang VR thì nó gây vấn đề gì, và bạn sẽ thay bằng gì.

**Bài tập 3.** Tự trả lời không mở tài liệu: *tại sao chữ trên UI trong VR thường bị nhoè, và tại sao đưa nó thành compositor layer lại làm nó sắc nét?* Nếu chưa trả lời được thì đọc lại §2.6 — Chương 6 sẽ xây trực tiếp lên ý niệm này.

---
---

# Chương 3 — Baseline Quest 3

## 3.1 Mục tiêu

Cuối chương này bạn phải có: **một project build được, deploy được lên Quest 3, chạy ổn định ≥72 fps, có PSO cache** — và chưa có một dòng gameplay nào.

Đây là bài học số 1 của cả giáo án. Bộ khung này là phần **không đổi** giữa mọi project Quest 3. Gameplay là phần thay đổi. Nếu bộ khung sai, gameplay hay đến mấy cũng buồn nôn ở 45 fps.

## 3.2 Bắt đầu từ VR Template hay project rỗng?

**Dùng VR Template.** ✅ Nó cung cấp sẵn teleport locomotion, snap turn, grab/attach, một VRPawn dùng Enhanced Input, và dựa trên OpenXR nên chạy đa nền tảng mà không cần gọi API riêng của từng platform ([nguồn](https://dev.epicgames.com/documentation/en-us/unreal-engine/vr-template-in-unreal-engine)).

Lý do dùng nó dù bạn sẽ tự viết lại pawn ở Chương 4: nó cho bạn một **bản tham chiếu đang chạy** để so sánh. Khi pawn tự viết của bạn không nhận input, có một pawn hoạt động ngay bên cạnh để đối chiếu là cực kỳ giá trị.

Nhưng phải **dọn dấu vết template** trước khi coi project là của mình:

| Cần dọn | Vì sao |
|---|---|
| `TargetPlatforms` trong `.uproject` liệt kê chục platform | Chỉ cần `["Android"]`. Thừa làm chậm thao tác editor và gây nhiễu |
| Input mapping cho controller không phải Quest (Vive, Index...) | Nhiễu, và làm trainee tưởng cần chúng |
| Map demo mẫu của template | Đặt map khởi động của mình, tránh mở nhầm map |
| GameMode/Pawn mặc định vẫn trỏ vào Blueprint của template | Đổi sang class của mình, đặt tên đúng |
| Toàn bộ config renderer | Template không cấu hình cho Quest — đó là §3.6 → §3.10 |

> **Bẫy thật từ dự án hiện trường:** một dự án VR đã ship vẫn còn `GlobalDefaultGameMode` trỏ tới GameMode của VR Template, và map khởi động vẫn là map template. App chạy bình thường, nhưng người mới vào dự án mở sai map và tưởng dự án hỏng. Dọn sớm, tốn 10 phút.

## 3.3 Android toolchain — bảng phiên bản

✅ Theo tài liệu cài Android của Meta, với Unreal Engine 5.5 trở lên:

| Hạng mục | Giá trị |
|---|---|
| NDK | **25.1.8937393** |
| Minimum Android API level | **32** |
| Target Android API level | **34** (bắt buộc để submit Horizon Store) |
| JDK | Dùng bản JDK đóng kèm Android Studio, trong thư mục `jbr` |

([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-android/))

Biến môi trường cần có: `ANDROID_HOME`, `NDKROOT`, `JAVA_HOME`.

**Cách cài khuyến nghị: dùng Turnkey của Epic** thay vì tự tay cài từng thành phần. Turnkey là script của Epic đi kèm engine, nó cài đúng bộ SDK/NDK mà bản engine đó cần. Tự cài tay là nguồn lỗi phổ biến, vì lệch một minor version của NDK là build fail với thông báo rất khó hiểu.

⚠️ Phiên bản Android Studio khuyến nghị: bám theo trang tài liệu Android của Epic **cho đúng UE 5.6** (trang đó có bộ chọn phiên bản). Meta cố ý không hardcode con số này để tránh lệch giữa các bản engine — và cộng đồng đã nhiều lần đề nghị Meta lập bảng SDK/NDK/JDK theo từng bản UE ([thảo luận](https://communityforums.atmeta.com/discussions/dev-unreal/maintain-an-up-to-date-list-of-android-sdk-ndk-jdk-android-studio-version-for-ea/1199345)).

## 3.4 targetSdkVersion 34 — thay đổi bắt buộc so với tài liệu 5.5

**Đây là chỗ tài liệu nội bộ 5.5 đã hết hạn.** Tài liệu cũ ghi `MinSDKVersion=32` và `TargetSDKVersion=32`. Dòng target đó không còn dùng được cho project mới.

✅ Từ **1/3/2026**, app Meta Horizon tạo mới trên Developer Dashboard bắt buộc target Android 14 (API level 34); `minSdkVersion` **không bị ảnh hưởng** và vẫn để 32 được. App cũ đang dùng mức thấp hơn vẫn chạy tiếp ([nguồn](https://developers.meta.com/horizon/blog/meta-quest-apps-android-14-march-1/)).

Nên trong `Config/DefaultEngine.ini`:

```ini
[/Script/AndroidRuntimeSettings]
MinSDKVersion=32
TargetSDKVersion=34          ; ĐỔI: tài liệu 5.5 ghi 32 — không còn đúng cho app mới
bSupportsVulkan=True         ; Vulkan là đường render của Quest
bBuildForES31=False          ; không cần GLES
bPackageForMetaQuest=True
```

❓ Giá trị TargetSDK mặc định của UE 5.6 là bao nhiêu thì tôi không xác minh được — hãy mở Project Settings và xem, rồi ghi lại. Việc ép lên 34 trong Project Settings là an toàn, và Meta XR Project Setup Tool cũng tự đề xuất đúng như vậy.

> **Bài học kèm theo, đáng dạy hơn cả con số:** một dòng config có thể "đúng" ở thời điểm viết và "sai" 8 tháng sau, mà không có gì báo cho bạn biết. Đây chính là lý do §10 (văn hoá tài liệu) yêu cầu **ghi ngày** ở đầu mỗi tài liệu.

## 3.5 Meta XR Project Setup Tool

✅ Plugin Meta XR có một Project Setup Tool giúp cấu hình project cho thiết bị mục tiêu; nó validate và cảnh báo khi setting sai ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-setting-up-metaxr-plugin/)).

**Chạy nó, và chạy cho tới khi hết cảnh báo.** Nó biết những setting mà tài liệu quên, và nó cập nhật theo phiên bản plugin.

Nhưng có một quy tắc kèm theo:

> **Đọc từng cảnh báo trước khi bấm Fix.** Bấm Fix All rồi đi làm việc khác là bỏ mất phần học giá trị nhất. Với mỗi cảnh báo, hãy tự trả lời: *nó đang sửa cái gì, ở file nào, và vì sao?* Sau đó mở `Config/DefaultEngine.ini` bằng text editor và **xem diff**. Đây là cách nhanh nhất để hiểu file config này thực sự chứa gì.

**Bài tập:** commit trước khi chạy Setup Tool, chạy, rồi `git diff`. Ghi lại mỗi dòng nó thêm/sửa và vì sao. Đây là một trong những bài tập giá trị nhất của tuần 1.

## 3.6 Renderer: Forward + Vulkan + Multi-View

### Forward Shading

✅ Meta nói rõ forward renderer là đường render **được khuyến nghị** cho phát triển Meta Quest ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-forward-renderer/)). Lý do: nhanh hơn deferred trên mobile, và cho phép dùng **MSAA** — trên VR thì MSAA vừa nét hơn vừa rẻ GPU hơn so với TAA.

Đặt ở: **Project Settings → Engine → Rendering → Mobile → Mobile Shading Path = Forward**.

```ini
r.Mobile.ShadingPath=0    ; 0 = Forward (mặc định), 1 = Deferred
```

✅ Mobile Deferred **cũng được hỗ trợ** trên Quest (có trong bảng tương thích của Meta). Nhưng "được hỗ trợ" khác "được khuyến nghị", và với cấu hình của ta thì nó còn **không khả dụng**:

- ✅ **Deferred yêu cầu Mobile HDR bật.** Ta tắt Mobile HDR (§3.7) → deferred không dùng được. Hai quyết định này khoá lẫn nhau
- ✅ **Deferred không hỗ trợ MSAA** (do lượng bộ nhớ GBuffer cần thiết). Mà MSAA là lợi thế lớn nhất của forward trên VR
- ✅ Nếu project dùng **lighting bake sẵn**, Epic khuyến nghị mạnh dùng forward thay vì deferred

Kết luận: Forward không phải "lựa chọn cho người mới", nó là lựa chọn đúng cho cấu hình Quest 3 tiêu chuẩn.

### Vulkan

Quest chạy Vulkan. Bật `bBuildForVulkan`, tắt ES3.1. Vulkan cũng là **điều kiện cần** cho Mobile Multi-View và cho Tonemap Subpass.

### Mobile Multi-View

✅ Meta khuyến nghị bật Mobile Multi-View: nó giảm overhead CPU, là tiền đề cho ASW và Late Latching, và yêu cầu Vulkan ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-multi-view/)).

```ini
[/Script/Engine.RendererSettings]
vr.MobileMultiView=True
vr.InstancedStereo=True
```

⚠️ **Về một tin đồn bạn sẽ gặp:** có tài liệu của **một nhà sản xuất headset khác** ghi nhận rằng FFR không có tác dụng khi bật Mobile Multi-View trên runtime của họ. ❓ Tôi **không tìm thấy** xác nhận nào cho hiện tượng này trên Meta XR / Quest 3. Ngược lại, Meta khuyến nghị bật cả hai cùng nhau, nên khả năng xung đột thấp. Nhưng vì đây là điều mắt thường không thấy được, hãy verify trên device một lần rồi ghi lại kết quả.

## 3.7 Mobile HDR — sự thật đầy đủ, không phải khẩu hiệu

Tài liệu nội bộ 5.5 viết: `r.MobileHDR=False` là **bắt buộc**, bật lên là mất hiệu năng và vỡ passthrough. Cần chỉnh lại cho chính xác.

✅ Bảng tương thích của Meta liệt kê **VR MobileHDR là tính năng được hỗ trợ** ở cả hai đường cài đặt ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-compatibility-matrix/)). Nên "bắt buộc tắt" là không đúng về mặt kỹ thuật.

Nhưng khuyến nghị thực tế **vẫn là tắt**, và đây là lý do đầy đủ:

**Cái bạn mất khi tắt Mobile HDR:** post-process pipeline thông thường không chạy. Kéo theo:
- Fade màn hình kiểu `StartCameraFade` không hoạt động → Chương 8
- Bloom, tonemapping tuỳ chỉnh, color grading không có

**Cái bạn được:** hiệu năng đáng kể trên mobile GPU. Với ngân sách 13,8 ms thì đây là đánh đổi gần như luôn có lợi.

**Nếu bạn thật sự cần post-process:** ✅ Meta cung cấp **Vulkan Tonemap Subpass** (`r.Mobile.TonemapSubpass=1`) — hoạt động ở cả fork và Epic+plugin, cần Vulkan, chi phí khoảng 600 µs render time ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-tonemapping/)).

> ⚠️ **Bẫy thực địa với Tonemap Subpass, phải nói trước:** một dự án VR/MR thật đã thử bật tính năng này và **phải revert**. Hai triệu chứng: toàn màn hình bị ám vàng, và **render target của stereo layer UI bị đóng băng** — click vẫn ăn nhưng mất hover, animation và swipe. Nếu bạn bật nó và dùng stereo layer UI (Chương 6), hãy test riêng phần UI. Đây là quan sát hiện trường ❓ chưa có nguồn chính thức giải thích nguyên nhân.
>
> ⚠️ Ngoài ra có báo cáo cộng đồng nói CVar này chỉ có tác dụng khi đặt trong `DefaultEngine.ini`, gõ ở console không ăn.

**Nếu bạn làm MR (passthrough):** ✅ có một dòng **bắt buộc** — đặt `r.Mobile.SceneColorFormat=4`. Lý do: format mặc định `PF_FloatR11G11B10` **không có kênh alpha**, mà blend passthrough cần alpha ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-passthrough-overview-gs/)). Thiếu dòng này thì passthrough blend sai — và triệu chứng khó đoán ra nguyên nhân.

⚠️ Ghi nhận thêm: có báo cáo cộng đồng về việc bật Mobile HDR trên UE 5.5.4 + Quest 3 gây méo/warp hình ([thảo luận](https://communityforums.atmeta.com/discussions/dev-unreal/mobile-hdr-and-post-processing-issue/1331527)). Chưa rõ nguyên nhân, và chưa kiểm chứng cho 5.6.

**Kết luận cho giáo án:**

```ini
r.MobileHDR=False               ; khuyến nghị mạnh (KHÔNG phải "bắt buộc" — xem §3.7)
r.Mobile.SceneColorFormat=4     ; BẮT BUỘC nếu dùng passthrough
```

## 3.8 Fixed Foveated Rendering

FFR giảm độ phân giải render ở vùng ngoại vi của tầm nhìn — chỗ mà mắt người dù sao cũng không nhìn rõ. Đây là hiệu năng gần như miễn phí, và người mới hay bỏ sót.

✅ Cách bật đúng trên UE với Meta XR: **Project Settings → Plugins → Meta XR → Mobile → Foveated Rendering**, chọn *Foveated Rendering Level* và tick *Dynamic Foveated Rendering*. Meta khuyến nghị dùng dynamic hơn static. Từ code:

```cpp
UOculusXRFunctionLibrary::SetFoveatedRenderingLevel(
    EOculusXRFoveatedRenderingLevel::High,   // Off / Low / Medium / High / HighTop
    /*isDynamic=*/ true);
```

([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-ffr/))

✅ FFR tương thích forward renderer — nó dùng Variable Rate Shading nên không phụ thuộc forward hay deferred.

**Năm mức FFR:** `Off`, `Low`, `Medium`, `High`, `HighTop`.

✅ **Hai key ini mà Project Settings ghi ra** — xác nhận từ sample chính thức của Meta:

```ini
FoveatedRenderingMethod=FixedFoveatedRendering
FoveatedRenderingLevel=Medium
```

> **Sửa so với tài liệu 5.5:** tài liệu cũ chỉ có một dòng `FoveatedRenderingLevel=HighTop`. Thiếu dòng `FoveatedRenderingMethod` thì FFR không được bật — chỉ đặt mức mà không chọn phương pháp là không đủ. Đây có thể là lý do vì sao FFR "có vẻ như không ăn" trong dự án cũ.

**Eye Tracked FFR: không dùng được trên Quest 3.** Cần headset có eye tracking; Quest 3 không có. Đừng để nó vào kế hoạch.

## 3.9 Bảng CVar — kèm nhãn tin cậy

⚠️ **Đọc phần này cẩn thận.** Tôi xác minh được *nhóm* và *ý định* của các CVar này từ tài liệu Meta/Epic, nhưng **không xác minh được từng dòng riêng cho đúng UE 5.6** — cụ thể là dòng nào đổi tên hay đổi hành vi giữa 5.5 và 5.6. Coi bảng này là điểm khởi đầu, và verify bằng cách gõ tên CVar vào console trong editor: nếu nó tồn tại, editor sẽ auto-complete và hiện mô tả. CVar không tồn tại thì không auto-complete — đó là cách kiểm tra nhanh nhất.

**Nhóm BẬT / đặt giá trị:**

```ini
[/Script/Engine.RendererSettings]
r.MobileHDR=False                      ; §3.7
r.Mobile.AntiAliasing=3                ; MSAA — đường mobile
r.MobileMSAA=4
vr.MobileMultiView=True                ; §3.6
vr.InstancedStereo=True
r.AllowStaticLighting=True             ; dùng lightmap bake thay vì GI động
r.ShaderPipelineCache.Enabled=1        ; §3.13
r.Mobile.SceneColorFormat=4            ; CHỈ khi dùng passthrough
```

**Nhóm TẮT — tính năng desktop, vô nghĩa hoặc rất đắt trên mobile VR:**

```ini
r.DynamicGlobalIlluminationMethod=0    ; TẮT Lumen GI
r.ReflectionMethod=0                   ; TẮT Lumen Reflections
r.Shadow.Virtual.Enable=0              ; TẮT Virtual Shadow Maps
r.RayTracing=False
r.GenerateMeshDistanceFields=False
r.SkinCache.CompileShaders=False
```

**Nhóm hạn chế cho mobile:**

```ini
r.Shadow.CSM.MaxCascades=1
r.Shadow.MaxResolution=1024
r.MaxAnisotropy=8
r.Streaming.PoolSize=900               ; MB — điều chỉnh theo nội dung thực tế
```

### Ba dòng cần bàn riêng

**`r.AllowOcclusionQueries`** — tài liệu nội bộ 5.5 cảnh báo: **đừng tắt nó, vì tắt đã làm vỡ hover/click của VR widget** trong một dự án thật.

❓ **Tôi không tìm được bug report, tài liệu, hay lời giải thích cơ chế nào cho hiện tượng này.** Về lý thuyết, occlusion query thuộc về visibility culling, còn hover/click của widget đi qua line trace của `WidgetInteractionComponent` — hai đường không giao nhau. Nên nếu có liên hệ thì nó gián tiếp, hoặc là trùng hợp với một nguyên nhân khác.

**Cách xử lý trong giáo án: giữ cảnh báo, bỏ lời giải thích.** Tức là: *đừng tắt CVar này nếu bạn dùng VR widget, vì đã có dự án gặp vấn đề sau khi tắt — nhưng cơ chế chưa xác định, đây là quan sát hiện trường.* Nếu bạn có thời gian, đây là một đề tài thí nghiệm nhỏ rất tốt: dựng scene tối giản có một VR widget, bật/tắt CVar, ghi lại. Kết quả thuộc về Phụ lục B.

**`r.ForwardShading`** — trên PC-VR đây là CVar cần bật. Trên Quest, cách đúng là đặt **Mobile Shading Path = Forward** trong Project Settings (§3.6). Đặt `r.ForwardShading=True` mà không đổi mobile shading path là đang cấu hình sai đường. ⚠️ Tài liệu nội bộ 5.5 có cả `r.ForwardShading=True` — giữ lại được nhưng đừng coi nó là dòng làm nên chuyện.

**`xr.MobileLDRDynamicResolution`** — ✅ theo release notes UE 5.5, UE hỗ trợ Dynamic Resolution trong XR ngay cả khi không có post-processing (mobile renderer với Mobile HDR tắt) qua CVar này; và cần bật Dynamic Resolution như bình thường, thiết bị cũng phải hỗ trợ qua plugin XR của nó ([nguồn](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-5-release-notes)).

Đây là một núm vặn mà tài liệu 5.5 nội bộ **hoàn toàn không có**. Nhưng có một điểm cần cân nhắc: ⚠️ Meta khuyến nghị dùng **Dynamic Foveated Rendering** thay cho Dynamic Resolution của UE. ❓ Tương tác chính xác giữa `xr.MobileLDRDynamicResolution`, FFR và Multi-View trên 5.6 tôi không xác minh được. **Khuyến nghị: đi FFR dynamic trước (§3.8), coi dynamic resolution là thí nghiệm sau, và không bật cả hai rồi kết luận mà không đo riêng từng cái.**

## 3.10 Device profile và núm vặn số 1

`Config/DefaultDeviceProfiles.ini`:

```ini
[Meta_Quest_3 DeviceProfile]
+CVars=r.ScreenPercentage=130
+CVars=r.MobileMSAA=4
+CVars=r.Streaming.PoolSize=900
+CVars=r.MaxAnisotropy=8
+CVars=r.Shadow.CSM.MaxCascades=1
+CVars=r.Shadow.MaxResolution=1024
```

**`r.ScreenPercentage` là núm vặn hiệu năng số 1 trên Quest.** Nó điều khiển độ phân giải render trước khi ảnh được gửi sang compositor. 130 → 100 lấy lại rất nhiều GPU mà mắt thường khó nhận ra ngay.

Thứ tự vặn núm khi tụt frame (đây là thứ tự đã được kiểm chứng qua dự án thật, ⚠️ không phải khuyến nghị chính thức của Meta):

1. `r.ScreenPercentage` (130 → 110 → 100)
2. FFR level (Low → Medium → High), ưu tiên dynamic
3. `r.MobileMSAA` (4 → 2)
4. Giảm dynamic light, shadow cascade
5. ❓ Thử `xr.MobileLDRDynamicResolution` (đo riêng, §3.9)
6. **Cuối cùng mới đụng vào asset**

Lý do thứ tự này: 5 bước đầu là đổi config, mất vài phút và revert được ngay. Sửa asset mất hàng giờ và khó revert. Luôn vặn cái rẻ trước.

## 3.11 Khoá tần số hiển thị

✅ Đặt tần số bằng Blueprint node **Set Display Frequency**, và đọc lại bằng `UOculusXRFunctionLibrary::GetCurrentDisplayFrequency()`. Muốn dùng tần số cao hơn 72 Hz thì phải khai báo thiết bị hỗ trợ trong danh sách supported-devices của Android manifest, qua Project Settings ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-change-display-refresh-rate/)).

✅ Bộ ba hàm liên quan, đều thuộc `UOculusXRFunctionLibrary` (Blueprint: target là **Oculus Function Library**):

| Hàm | Việc |
|---|---|
| `SetDisplayFrequency(float)` | Đặt tần số |
| `GetCurrentDisplayFrequency()` | Đọc tần số đang chạy |
| `GetAvailableDisplayFrequencies()` | Liệt kê tần số thiết bị hỗ trợ |

Mẫu dùng chính thức của Meta trong sample Performance Settings: đọc tần số hiện tại rồi tính ngân sách frame từ đó, thay vì hard-code 13,8 ms — nhờ vậy code chạy đúng ở cả 72/90/120 Hz.

```cpp
const float Hz = UOculusXRFunctionLibrary::GetCurrentDisplayFrequency();
const float MsPerFrame = 1000.f / Hz;   // 72 Hz -> 13,89 ms
```

> ⚠️ **Bẫy đã có người báo:** `GetAvailableDisplayFrequencies` có thể trả về **mảng rỗng** khi XR API đặt là OVRPlugin OpenXR, trong khi `SetDisplayFrequency` vẫn hoạt động bình thường. Nếu bạn định "lấy tần số cao nhất trong danh sách" thì phải xử lý trường hợp danh sách rỗng, đừng giả định nó luôn có dữ liệu.

**Vì sao phải khoá tường minh:** nếu không khoá, runtime có thể chọn 90 Hz. Khi đó ngân sách frame của bạn tụt từ 13,8 ms xuống 11,1 ms mà bạn không hề đổi gì — và app tụt frame liên tục theo cách rất khó chẩn đoán, vì mọi thứ trong code đều "không đổi".

```cpp
// Trong BeginPlay của pawn hoặc GameMode
// Khoá 72 Hz để có ngân sách frame xác định
```

Và kèm theo, hai dòng bắt buộc của mọi VR pawn (chi tiết ở Chương 4):

```cpp
UHeadMountedDisplayFunctionLibrary::SetTrackingOrigin(EHMDTrackingOrigin::Stage);
Camera->bLockToHmd = true;
```

## 3.12 Packaging

| Setting | Giá trị | Ghi chú |
|---|---|---|
| `bStartInVR` | `True` | Không có là app mở ra ở chế độ màn phẳng |
| Build Configuration | `Shipping` khi đo hiệu năng | ⚠️ Đo fps ở Development build cho số liệu sai và bi quan |
| `bCookMapsOnly` + `MapsToCook` | `True` + danh sách map cụ thể | Cook nhanh hơn rất nhiều — quan trọng với vòng lặp học tập |
| `UsePakFile`, `bUseIoStore`, `bCompressed` | `True` | |
| **`bShareMaterialShaderCode`** | **`True`** | ✅ Bắt buộc cho bundled PSO — §3.13 |
| Architecture | arm64 only | Quest không cần armv7 |
| `bPublicLogFiles`, `bUseExternalFilesDir` | `True` khi dev, **tắt trước khi release** | Thiết lập tiện cho dev, không nên để trong bản phát hành |

## 3.13 PSO cache — thứ newbie luôn bỏ sót

**Triệu chứng nếu thiếu:** app khựng một nhịp mỗi lần lần đầu nhìn thấy một material mới. Người test báo "game bị giật" nhưng profiler không thấy gì bất thường, vì cái khựng đó là compile shader pipeline lúc runtime, không phải chi phí render.

### Cấu hình

```ini
[/Script/Engine.RendererSettings]
r.ShaderPipelineCache.Enabled=1

[DevOptions.Shaders]
NeedsShaderStableKeys=true
```

Cộng với `bShareMaterialShaderCode=True` ở Project Settings → Packaging (§3.12). ✅ Đây là điều kiện bắt buộc cho bundled PSO cache.

### Quy trình tạo bundled cache

✅ Theo tài liệu Epic *Manually Creating Bundled PSO Caches* ([nguồn](https://dev.epicgames.com/documentation/en-us/unreal-engine/manually-creating-bundled-pso-caches-in-unreal-engine)):

1. Package build có Share Material Shader Code + stable keys
2. Chạy trên device với `-logPSO`, **đi qua hết nội dung** (mỗi material chưa từng nhìn thấy là một PSO chưa được ghi nhận)
3. `adb pull` các file `.rec.upipelinecache` về
4. Lấy file `.shk` từ `Saved/Cooked/Android/.../Metadata/PipelineCaches`
5. Chạy commandlet `ShaderPipelineCacheTools expand ... .spc` — shader format cho Android là `SF_VULKAN_ES31_ANDROID`
6. Đặt kết quả vào `Build/Android/PipelineCaches`
7. Package lại

Các CVar dùng trong bước thu thập: `r.ShaderPipelineCache.SaveBoundPSOLog=1`, `LogPSO=1`, `ReportPSO=1`, và `r.Vulkan.PipelineCacheFromShaderPipelineCache=1`.

### Hai điều cần biết thêm

⚠️ **Fork v81 đã tắt Chunked PSO Cache trong device profile để cải thiện hiệu năng trên Quest** ([nguồn](https://developers.meta.com/horizon/downloads/package/unreal-engine-5-integration-github/81.0.0/)). Tức là Meta đã can thiệp vào mặc định của Epic ở điểm này. Nếu bạn đi Đường A (Epic build), bạn **không có** thay đổi đó — ❓ hệ quả thực tế chưa rõ, ghi nhận để biết.

⚠️ UE 5.6 cũng có hướng mới là **PSO Precaching** (`r.PSOPrecaching=1`), chạy song song với bundled cache. Đây là hướng Epic đang đẩy. ❓ Cấu hình tối ưu cho Quest ở 5.6 khi dùng cả hai chưa xác minh được — làm bundled cache trước vì nó có tài liệu đầy đủ.

> Nói với trainee: **PSO cache là việc phải làm trước khi tuyên bố "app chạy mượt".** Không có nó, mọi đo đạc hiệu năng của bạn đều lẫn một loại khựng mà bạn sẽ đi tìm nguyên nhân ở chỗ khác.

## 3.14 Deploy và vòng lặp phát triển

### Deploy

```bash
adb install -r App.apk
```

Hoặc dùng MQDH (kéo file APK vào). App sideload nằm trong **Library → Unknown Sources** trên headset — không nằm cùng chỗ với app tải từ Store, và đây là chỗ nhiều người tìm không thấy app của mình rồi tưởng deploy fail.

### Quest Link — dùng được, nhưng biết giới hạn

✅ Quest Link cho phép VR Preview ngay trong editor (cần app Meta Quest Link và đăng nhập Meta Developer). ✅ Passthrough over Link và hand tracking đều được hỗ trợ để iterate nhanh ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-passthrough-use-over-link/)).

Nhưng:
- ❌ ✅ **Space Setup (quét phòng) không chạy được qua Link** — phải quét trên device trước rồi Link mới đọc được dữ liệu đó
- ❌ **Hiệu năng qua Link không phản ánh hiệu năng trên device.** Render đang chạy trên GPU của PC bạn
- ❌ FFR không verify được qua Link

**Cách dùng đúng:** Link để iterate logic và bố cục nhanh trong ngày; build lên device để verify mọi thứ ở §2.3 và mọi con số hiệu năng.

## 3.15 Smoke test cổng ra tuần 1

Danh sách này chỉ chạy được **trên device thật**. Đây là nghiệm thu của Chương 3.

- [ ] APK build được, `adb install` xong, app xuất hiện trong Unknown Sources
- [ ] App mở ra **trực tiếp vào chế độ VR** (không phải màn phẳng) → `bStartInVR`
- [ ] Có hình head-tracked trong vòng 4 giây từ lúc mở (đây cũng là một yêu cầu VRC — Chương 10)
- [ ] Xoay đầu: hình mượt, không giật, không trôi
- [ ] Đứng lên/ngồi xuống: chiều cao đúng → tracking origin = Floor
- [ ] Đo fps bằng OVR Metrics Tool hoặc MQDH: **≥72 fps ổn định**
- [ ] **Test liên tục 25-30 phút:** fps không tụt sau khi máy nóng (§2.2)
- [ ] Đi qua toàn bộ nội dung 2 lần: lần 2 không còn khựng → PSO cache có tác dụng
- [ ] Build **Shipping** (không phải Development) khi lấy số liệu cuối
- [ ] `git diff` của `Config/` được review và hiểu, không phải "Setup Tool sửa gì đó"

## 3.16 Bẫy của chương này

| Bẫy | Hậu quả | Nguồn |
|---|---|---|
| `TargetSDKVersion=32` cho app mới | Không submit được lên Store | ✅ Yêu cầu API 34 từ 1/3/2026 |
| Bật Lumen / VSM / RayTracing trên mobile | Sụp fps, phình shader, có khi không cook nổi | ✅ Tính năng desktop |
| Quên `r.Mobile.SceneColorFormat=4` khi làm passthrough | Passthrough blend sai, triệu chứng khó đoán | ✅ Do format mặc định không có alpha |
| Không khoá tần số hiển thị | Runtime chọn 90 Hz, ngân sách tụt còn 11,1 ms | ✅ |
| Không có PSO cache | Khựng mỗi lần gặp material mới, profiler không thấy gì | ✅ |
| Đo fps ở Development build | Số liệu sai và bi quan | ⚠️ |
| Test 5 phút rồi kết luận | Bỏ sót thermal throttling | ✅ |
| Bấm Fix All trong Setup Tool không đọc | Mất phần học giá trị nhất của tuần 1 | — |
| Bật Tonemap Subpass rồi mất animation của stereo layer UI | Click ăn nhưng UI như đóng băng | ❓ quan sát hiện trường |
| Tự cài NDK sai version thay vì dùng Turnkey | Build fail với thông báo khó hiểu | ⚠️ |

---
---

# Chương 4 — VR Pawn và Enhanced Input

## 4.1 Mục tiêu

Tự viết một VR Pawn từ con số không, bằng C++, không kế thừa pawn của VR Template.

Bạn đã có pawn của template đang chạy từ Chương 3. Đừng xoá nó — giữ lại làm bản đối chiếu. Khi pawn tự viết không nhận input, có một pawn hoạt động ngay bên cạnh để so sánh từng thuộc tính là cách debug nhanh nhất.

Cuối chương: pawn của bạn đi lại được bằng teleport, xoay bằng snap turn, hai tay hiện đúng vị trí, và tất cả verify trên device.

## 4.2 Giải phẫu một VR Pawn

Cấu trúc tối thiểu, và thứ tự phân cấp rất quan trọng:

```
AVRPawn
 └── VROrigin            (USceneComponent)  ← gốc không gian chơi, nằm ở SÀN
      ├── Camera         (UCameraComponent) ← bLockToHmd = true
      ├── MotionControllerLeft  (UMotionControllerComponent)
      │    └── VisualizationLeft (UXRDeviceVisualizationComponent)
      └── MotionControllerRight (UMotionControllerComponent)
           └── VisualizationRight (UXRDeviceVisualizationComponent)
```

Ba điểm mà người mới hay làm sai:

**(1) `VROrigin` phải nằm ở sàn, không phải ở tầm mắt.** Runtime báo về vị trí đầu tính từ gốc không gian chơi. Nếu bạn đặt gốc ở độ cao 160 cm, người dùng sẽ thấy mình lơ lửng ở 320 cm.

**(2) Không tự set vị trí camera.** `bLockToHmd = true` nghĩa là engine ghi đè transform của camera bằng pose thật của HMD mỗi frame. Mọi dòng `Camera->SetRelativeLocation(...)` bạn viết sẽ bị xoá ngay frame sau. Muốn di chuyển người chơi thì di chuyển `VROrigin`, không bao giờ di chuyển camera.

**(3) Tracking origin phải đặt tường minh.** Không đặt thì chiều cao sai và bạn sẽ mất một buổi để hiểu vì sao.

```cpp
UHeadMountedDisplayFunctionLibrary::SetTrackingOrigin(EHMDTrackingOrigin::Stage);
```

`Floor` (một số bản engine gọi là `Stage`) nghĩa là gốc toạ độ nằm ở sàn thật mà người dùng đã thiết lập. `Eye` nghĩa là gốc nằm ở vị trí đầu lúc khởi động — dùng cho app ngồi yên một chỗ.

✅ **Ba giá trị hợp lệ trong UE5** (`Local`, `LocalFloor`, `Stage` — `View` tồn tại nhưng không được dùng làm tracking origin):

| Giá trị | Dùng cho | Gốc toạ độ nằm ở đâu |
|---|---|---|
| `Local` | Trải nghiệm ngồi yên, tầm mắt | Vị trí đầu lúc khởi động |
| `LocalFloor` | Đứng yên một chỗ | Căn theo vị trí đầu lúc khởi động, nhưng Z=0 khớp sàn. Tự lùi về `Local` nếu không có dữ liệu sàn |
| **`Stage`** | **Đi lại trong phòng — chọn cái này** | Sàn thật, thường nằm trong vùng chơi người dùng đã thiết lập |

> ⚠️ **Lưu ý quan trọng nếu bạn đọc tutorial cũ:** rất nhiều hướng dẫn (và cả bản nháp đầu của chính tài liệu này) viết `EHMDTrackingOrigin::Floor`. **Giá trị đó không tồn tại trong UE5** — nó là tên thời UE4. Dùng `Stage` cho VR đi lại được, `LocalFloor` cho trải nghiệm đứng yên. Nếu code không compile ở đúng dòng này, đó chính là lý do.

### Chuyện cái capsule

Pawn mặc định của Unreal có capsule collision đặt ở gốc actor. Trong VR, người dùng **đi bộ thật trong phòng** — đầu họ rời khỏi gốc actor mà pawn không hề di chuyển. Kết quả: capsule đứng một chỗ trong khi người chơi đã đứng cách đó 1,5 mét, và họ chui đầu xuyên tường mà không có gì cản.

Cách xử lý tối thiểu: mỗi tick, kéo capsule về dưới chân camera.

```cpp
void AVRPawn::UpdateCapsuleToHmd()
{
    // Capsule là ROOT component. "Relative location" của root KHÔNG phải
    // vị trí bên trong actor — nó chính là vị trí world. Nên không có
    // chuyện "dịch capsule bên trong actor".
    //
    // Cách đúng: dịch CẢ ACTOR tới dưới chân camera, rồi dịch VROrigin
    // ngược lại đúng bằng đó. Kết quả: capsule chạy tới chỗ đầu người,
    // còn camera — tức thế giới mà người dùng đang thấy — không nhúc nhích.
    FVector Delta = Camera->GetComponentLocation()
                  - CapsuleComp->GetComponentLocation();
    Delta.Z = 0.f;   // chỉ bám theo phương ngang

    AddActorWorldOffset(Delta);
    VROrigin->AddWorldOffset(-Delta);
}
```

> ⚠️ **Bản nháp đầu của tài liệu này sai đúng tại hàm này** — nó gọi `SetRelativeLocation` trên capsule. Vì capsule là root nên "relative" của nó chính là world, và dòng đó dịch cả actor về một toạ độ vô nghĩa ngay frame đầu. Lỗi này compile sạch, chỉ lộ ra khi chạy. Bài học tổng quát đáng nhớ: **root component không có "vị trí tương đối trong actor"** — muốn bố trí nội bộ thì dịch các component con; muốn di chuyển thì dịch actor.

Đây là bản đơn giản nhất và đủ cho giáo án. Bản đầy đủ còn phải xử lý trường hợp người dùng thò đầu vào trong tường — chủ đề riêng, không thuộc phạm vi tài liệu này.

## 4.3 Code: header

```cpp
// VRPawn.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "VRPawn.generated.h"

class UCameraComponent;
class UCapsuleComponent;
class UMotionControllerComponent;
class UXRDeviceVisualizationComponent;
class UInputMappingContext;
class UInputAction;
struct FInputActionValue;

UCLASS()
class YOURPROJECT_API AVRPawn : public APawn
{
    GENERATED_BODY()

public:
    AVRPawn();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

protected:
    // --- Components ---
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<USceneComponent> VROrigin;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<UCapsuleComponent> CapsuleComp;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<UCameraComponent> Camera;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<UMotionControllerComponent> ControllerLeft;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<UMotionControllerComponent> ControllerRight;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<UXRDeviceVisualizationComponent> VisualLeft;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "VR")
    TObjectPtr<UXRDeviceVisualizationComponent> VisualRight;

    // --- Enhanced Input ---
    UPROPERTY(EditDefaultsOnly, Category = "Input")
    TObjectPtr<UInputMappingContext> DefaultMappingContext;

    UPROPERTY(EditDefaultsOnly, Category = "Input")
    TObjectPtr<UInputAction> IA_SnapTurn;

    UPROPERTY(EditDefaultsOnly, Category = "Input")
    TObjectPtr<UInputAction> IA_TeleportAim;      // Triggered liên tục khi giữ

    UPROPERTY(EditDefaultsOnly, Category = "Input")
    TObjectPtr<UInputAction> IA_TeleportCommit;   // Completed khi thả

    UPROPERTY(EditDefaultsOnly, Category = "Comfort")
    float SnapTurnDegrees = 30.f;

private:
    void OnSnapTurn(const FInputActionValue& Value);
    void OnTeleportAim(const FInputActionValue& Value);
    void OnTeleportCommit(const FInputActionValue& Value);

    void UpdateCapsuleToHmd();

    bool  bIsAiming = false;
    bool  bHasValidTeleportTarget = false;
    FVector TeleportTarget = FVector::ZeroVector;
};
```

## 4.4 Code: constructor và BeginPlay

```cpp
// VRPawn.cpp
#include "VRPawn.h"

#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "MotionControllerComponent.h"
#include "XRDeviceVisualizationComponent.h"
#include "HeadMountedDisplayFunctionLibrary.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"   // PredictProjectilePath dùng ở §4.7

AVRPawn::AVRPawn()
{
    PrimaryActorTick.bCanEverTick = true;

    CapsuleComp = CreateDefaultSubobject<UCapsuleComponent>(TEXT("CapsuleComp"));
    CapsuleComp->InitCapsuleSize(34.f, 88.f);
    SetRootComponent(CapsuleComp);

    // Gốc không gian chơi nằm ở SÀN, nên đẩy xuống nửa chiều cao capsule
    VROrigin = CreateDefaultSubobject<USceneComponent>(TEXT("VROrigin"));
    VROrigin->SetupAttachment(CapsuleComp);
    VROrigin->SetRelativeLocation(FVector(0.f, 0.f, -88.f));

    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(VROrigin);
    Camera->bLockToHmd = true;   // engine ghi đè transform mỗi frame — đừng tự set

    ControllerLeft = CreateDefaultSubobject<UMotionControllerComponent>(TEXT("ControllerLeft"));
    ControllerLeft->SetupAttachment(VROrigin);
    ControllerLeft->SetTrackingMotionSource(FName("Left"));

    ControllerRight = CreateDefaultSubobject<UMotionControllerComponent>(TEXT("ControllerRight"));
    ControllerRight->SetupAttachment(VROrigin);
    ControllerRight->SetTrackingMotionSource(FName("Right"));

    // Cách của UE5: mesh controller đi qua XRDeviceVisualization,
    // KHÔNG gắn static mesh trực tiếp vào MotionControllerComponent nữa
    VisualLeft = CreateDefaultSubobject<UXRDeviceVisualizationComponent>(TEXT("VisualLeft"));
    VisualLeft->SetupAttachment(ControllerLeft);
    VisualLeft->SetIsVisualizationActive(true);

    VisualRight = CreateDefaultSubobject<UXRDeviceVisualizationComponent>(TEXT("VisualRight"));
    VisualRight->SetupAttachment(ControllerRight);
    VisualRight->SetIsVisualizationActive(true);
}

void AVRPawn::BeginPlay()
{
    Super::BeginPlay();

    // BẮT BUỘC — không có dòng này thì chiều cao sai
    UHeadMountedDisplayFunctionLibrary::SetTrackingOrigin(EHMDTrackingOrigin::Stage);

    if (APlayerController* PC = Cast<APlayerController>(GetController()))
    {
        if (auto* Subsystem = ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(
                PC->GetLocalPlayer()))
        {
            Subsystem->AddMappingContext(DefaultMappingContext, /*Priority=*/0);
        }
    }
}

void AVRPawn::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    UpdateCapsuleToHmd();

    if (bIsAiming)
    {
        // cập nhật arc ngắm — xem §4.7
    }
}
```

✅ **`UXRDeviceVisualizationComponent` nằm trong plugin `XRBase`** của Epic (không phải plugin của Meta). Nên `Build.cs` cần:

```csharp
PublicDependencyModuleNames.AddRange(new string[]
{
    "Core", "CoreUObject", "Engine", "InputCore",
    "EnhancedInput",
    "HeadMountedDisplay",   // UHeadMountedDisplayFunctionLibrary, EHMDTrackingOrigin
    "XRBase",               // UXRDeviceVisualizationComponent, UMotionControllerComponent
});
```

Và bật plugin **XR Base** trong Edit → Plugins nếu nó chưa bật (thường bật sẵn khi project có VR).

## 4.5 XRDeviceVisualization — thay đổi so với UE4

✅ Cách hiện tại của UE5: mesh controller được gắn qua một `XRDeviceVisualization` component làm **con** của `MotionControllerComponent`, với *Is Visualization Active* bật và *Display Model Source* đặt là OpenXR. Đây cũng chính là cách VR Template của UE5 làm ([nguồn](https://developer-docs.magicleap.cloud/docs/guides/unreal/plugins/unreal-controller/)).

Cách cũ — gắn thẳng static mesh vào `MotionControllerComponent` và bật `bDisplayDeviceModel` — là di sản UE4. Nếu bạn đọc tutorial nào bảo làm vậy, đó là tutorial cũ.

Lợi ích: runtime tự cấp đúng model cho đúng loại controller đang cầm. Người dùng cầm Quest 3 controller thì thấy Quest 3 controller, không phải một khối hộp bạn tự dựng.

## 4.6 Enhanced Input cho VR

⚠️ Legacy `BindAxis` / `BindAction` vẫn còn trong 5.6 nhưng đã trên đường bị loại bỏ từ UE5. **Không dùng cho project mới.** ❓ Trạng thái deprecate chính xác ở 5.6 tôi không xác minh được — nhưng lý do thực dụng để dùng Enhanced Input mạnh hơn nhiều: nó là thứ duy nhất map sạch sang OpenXR interaction profile.

### Ba loại asset cần tạo

| Asset | Vai trò | Ví dụ |
|---|---|---|
| `Input Action` (IA) | Một hành động trừu tượng, không gắn với nút cụ thể | `IA_SnapTurn`, `IA_Grab` |
| `Input Mapping Context` (IMC) | Bảng ánh xạ nút vật lý → IA | `IMC_Default` |
| `Input Modifier` / `Trigger` | Biến đổi và điều kiện kích hoạt | Deadzone, Hold, Pressed |

### Ánh xạ cho Quest 3 controller

Trong IMC, khi thêm binding bạn sẽ thấy danh sách key kiểu `OculusTouch (L) Thumbstick X` hoặc các key OpenXR chung. Nguyên tắc chọn:

- **Ưu tiên key OpenXR chung** nếu có, để về sau còn chạy được trên headset khác
- Chỉ dùng key riêng của Oculus khi cần nút mà OpenXR chung không có

⚠️ Tên key chính xác trong bản plugin v83 tôi không liệt kê được. Cách tìm: trong IMC bấm dấu + rồi gõ "oculus" hoặc "thumbstick" vào ô tìm kiếm — danh sách hiện ra chính là danh sách đang có thật trong project của bạn, đáng tin hơn bất kỳ tài liệu nào.

### Binding trong code

```cpp
void AVRPawn::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    if (auto* EIC = Cast<UEnhancedInputComponent>(PlayerInputComponent))
    {
        EIC->BindAction(IA_SnapTurn,        ETriggerEvent::Triggered, this, &AVRPawn::OnSnapTurn);
        EIC->BindAction(IA_TeleportAim,     ETriggerEvent::Triggered, this, &AVRPawn::OnTeleportAim);
        EIC->BindAction(IA_TeleportCommit,  ETriggerEvent::Completed, this, &AVRPawn::OnTeleportCommit);
    }
}
```

**Điểm dễ sai:** `ETriggerEvent::Triggered` bắn liên tục mỗi frame khi điều kiện đúng, còn `Completed` bắn một lần khi kết thúc. Teleport cần cả hai: `Triggered` để vẽ arc trong lúc giữ, `Completed` để nhảy khi thả. Dùng nhầm `Triggered` cho commit thì người chơi sẽ teleport liên tục mỗi frame.

## 4.7 Snap turn và teleport

### Snap turn

```cpp
void AVRPawn::OnSnapTurn(const FInputActionValue& Value)
{
    const float AxisX = Value.Get<FVector2D>().X;
    if (FMath::Abs(AxisX) < 0.7f) return;   // deadzone — tránh xoay khi lỡ chạm

    const float Delta = (AxisX > 0.f) ? SnapTurnDegrees : -SnapTurnDegrees;
    AddActorWorldRotation(FRotator(0.f, Delta, 0.f));
}
```

Ba lý do snap turn tốt hơn smooth turn cho người mới (§2.5): xoay tức thời không tạo gia tốc thị giác kéo dài; não coi đó là "cắt cảnh" thay vì chuyển động; và nó rẻ.

⚠️ Deadzone 0,7 là con số kinh nghiệm. Thấp quá thì xoay ngoài ý muốn, cao quá thì khó kích hoạt. Bạn cần thêm cờ chặn lặp: giữ thumbstick sang phải không được xoay liên tục, phải thả về giữa rồi mới xoay tiếp.

### Teleport

Luồng đầy đủ: giữ nút → vẽ arc → kiểm tra điểm đến hợp lệ → thả nút → **fade** → dịch chuyển → fade lại.

```cpp
void AVRPawn::OnTeleportAim(const FInputActionValue& Value)
{
    bIsAiming = true;

    const FVector  Start = ControllerRight->GetComponentLocation();
    const FVector  Dir   = ControllerRight->GetForwardVector();

    FPredictProjectilePathParams Params(
        /*Radius=*/ 5.f, Start, Dir * 900.f, /*MaxSimTime=*/ 2.f,
        ECollisionChannel::ECC_Visibility, this);
    Params.bTraceComplex = false;

    FPredictProjectilePathResult Result;
    bHasValidTeleportTarget = UGameplayStatics::PredictProjectilePath(this, Params, Result);

    if (bHasValidTeleportTarget)
    {
        TeleportTarget = Result.HitResult.Location;
        // TODO: kiểm tra độ dốc bề mặt, và điểm đến có nằm trên NavMesh không
        // TODO: vẽ arc bằng spline mesh + marker ở TeleportTarget
    }
}

void AVRPawn::OnTeleportCommit(const FInputActionValue& Value)
{
    bIsAiming = false;
    if (!bHasValidTeleportTarget) return;

    // KHÔNG teleport thẳng — phải fade. Xem Chương 8 để biết cách fade đúng trên Quest.
    const FVector CameraOffset = Camera->GetComponentLocation() - GetActorLocation();
    const FVector Destination(
        TeleportTarget.X - CameraOffset.X,
        TeleportTarget.Y - CameraOffset.Y,
        TeleportTarget.Z + CapsuleComp->GetScaledCapsuleHalfHeight());

    SetActorLocation(Destination);
}
```

**Đoạn `CameraOffset` là chỗ hay bị bỏ sót.** Người dùng có thể đã đi bộ thật sang một góc phòng, nên camera không nằm ở tâm pawn. Teleport thẳng pawn tới điểm đích sẽ làm người dùng đáp xuống lệch đúng bằng khoảng cách họ đã đi bộ. Phải bù trừ.

## 4.8 Bẫy của chương này

| Bẫy | Triệu chứng | Xử lý |
|---|---|---|
| Quên `SetTrackingOrigin(Floor)` | Chiều cao sai, cảm giác lùn hoặc lơ lửng | Thêm vào `BeginPlay` |
| Tự set vị trí camera | Không có tác dụng gì | `bLockToHmd` ghi đè. Dịch `VROrigin` |
| `VROrigin` đặt ở tầm mắt | Người chơi lơ lửng | Đặt gốc ở sàn |
| Không bù `CameraOffset` khi teleport | Đáp xuống lệch chỗ khi người chơi đã đi bộ | §4.7 |
| Dùng `Triggered` cho teleport commit | Teleport liên tục mỗi frame | Dùng `Completed` |
| Capsule không đi theo đầu | Chui đầu xuyên tường | `UpdateCapsuleToHmd()` |
| Gắn static mesh thẳng vào MotionController | Cách UE4, không lấy được model đúng của Quest | Dùng `XRDeviceVisualization` |
| Smooth turn làm mặc định | Người mới say | Snap turn mặc định, smooth là tuỳ chọn |
| Test pawn chỉ trong PIE | Không phát hiện lỗi chiều cao và tracking | Deploy device |

## 4.9 Bài tập và checklist

**Bài tập 1.** Viết `AVRPawn` từ đầu theo §4.3-4.4. Không copy-paste — gõ lại. Mỗi lỗi compile, đọc và hiểu trước khi sửa.

**Bài tập 2.** Cố tình bỏ dòng `SetTrackingOrigin`, build lên device, quan sát. Ghi lại cảm giác. Sau đó thêm lại. Đây là cách nhanh nhất để dòng đó không bao giờ bị quên nữa.

**Bài tập 3.** Đặt `SnapTurnDegrees` lần lượt 15, 30, 45, 90. Test trên device. Ghi lại giá trị bạn thấy dễ chịu nhất và vì sao. (Không có đáp án đúng — mục đích là xây trực giác comfort.)

**Bài tập 4.** So sánh pawn của bạn với pawn của VR Template: mở cả hai, liệt kê 3 thứ template làm mà bạn chưa làm. Quyết định thứ nào đáng thêm.

**Checklist cổng ra (trên device):**

- [ ] Đứng lên/ngồi xuống, chiều cao khớp thực tế
- [ ] Hai controller hiện đúng model Quest, đúng vị trí, không trễ
- [ ] Snap turn hoạt động, có deadzone, không xoay liên tục khi giữ
- [ ] Teleport: arc hiện khi giữ, nhảy đúng chỗ khi thả
- [ ] Đi bộ thật sang góc phòng rồi teleport → vẫn đáp đúng chỗ
- [ ] Đi bộ thật vào tường → capsule chặn được
- [ ] Vẫn ≥72 fps

---
---

# Chương 5 — Tương tác: grab, ray, highlight

## 5.1 Ba mô hình tương tác

| Mô hình | Dùng khi | Cảm giác |
|---|---|---|
| **Direct / contact-based** | Vật trong tầm tay | Tự nhiên nhất, cho cảm giác "có mặt" mạnh nhất |
| **Ray / distance grab** | Vật xa, ngoài tầm với | Tiện, nhưng kém tự nhiên |
| **Poke** | Nút bấm, UI | Tốt cho UI phẳng đặt gần |

Giáo án này làm **contact-based trước**, vì nó dạy đúng thứ trực giác VR cần: người dùng đưa tay tới, chạm, nắm. Ray dễ viết hơn nhưng dạy sai trực giác — nó biến VR thành con trỏ chuột 3D.

## 5.2 Kiến trúc: interface + component

Nguyên tắc: **bàn tay biết cách nắm, vật thể biết mình bị nắm thế nào.** Tách hai trách nhiệm này ra thì thêm loại vật thể mới không phải sửa code bàn tay.

```
UGrabberComponent  (gắn vào mỗi MotionController)
   - sphere overlap phát hiện ứng viên
   - chọn ứng viên tốt nhất
   - gọi vào interface

IGrabbable         (implement bởi actor/component có thể nắm)
   - OnGrabbed(Grabber)
   - OnReleased(Grabber, LinearVel, AngularVel)
   - GetGrabPriority(HandLocation)
```

### Interface

```cpp
// Grabbable.h
#pragma once
#include "CoreMinimal.h"
#include "UObject/Interface.h"
#include "Grabbable.generated.h"

class UGrabberComponent;

UINTERFACE(MinimalAPI, Blueprintable)
class UGrabbable : public UInterface { GENERATED_BODY() };

class YOURPROJECT_API IGrabbable
{
    GENERATED_BODY()
public:
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="Grab")
    void OnGrabbed(UGrabberComponent* Grabber);

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="Grab")
    void OnReleased(UGrabberComponent* Grabber, FVector LinearVelocity, FVector AngularVelocity);

    /** Điểm càng cao càng được ưu tiên khi nhiều vật cùng nằm trong tầm */
    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="Grab")
    float GetGrabPriority(const FVector& HandLocation) const;

    UFUNCTION(BlueprintNativeEvent, BlueprintCallable, Category="Grab")
    void SetHighlighted(bool bHighlighted);
};
```

### Grabber component

```cpp
// GrabberComponent.h
UCLASS(ClassGroup=(VR), meta=(BlueprintSpawnableComponent))
class YOURPROJECT_API UGrabberComponent : public USphereComponent
{
    GENERATED_BODY()
public:
    UGrabberComponent();

    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, ELevelTick TickType,
                               FActorComponentTickFunction* ThisTickFunction) override;

    UFUNCTION(BlueprintCallable, Category="Grab") void TryGrab();
    UFUNCTION(BlueprintCallable, Category="Grab") void Release();

    UPROPERTY(EditAnywhere, Category="Grab") float GrabRadius = 10.f;

private:
    AActor* FindBestCandidate() const;
    void    UpdateHighlight();

    UPROPERTY() TObjectPtr<AActor> HeldActor      = nullptr;
    UPROPERTY() TObjectPtr<AActor> HighlightedActor = nullptr;

    // Vòng đệm vị trí để tính vận tốc lúc thả
    static constexpr int32 VelocitySampleCount = 4;
    FVector PrevLocations[VelocitySampleCount];
    int32   PrevIndex       = 0;
    int32   NumValidSamples = 0;
};
```

```cpp
// GrabberComponent.cpp  (phần cốt lõi)

void UGrabberComponent::TickComponent(float DeltaTime, ELevelTick TickType,
                                      FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    // Ghi vị trí tay của frame này vào vòng đệm — không có bước này
    // thì vòng đệm mãi mãi là rác và vận tốc lúc thả vô nghĩa
    PrevLocations[PrevIndex] = GetComponentLocation();
    PrevIndex = (PrevIndex + 1) % VelocitySampleCount;
    NumValidSamples = FMath::Min(NumValidSamples + 1, VelocitySampleCount);

    UpdateHighlight();
}

AActor* UGrabberComponent::FindBestCandidate() const
{
    TArray<AActor*> Overlapping;
    GetOverlappingActors(Overlapping);

    AActor* Best = nullptr;
    float   BestScore = -FLT_MAX;
    const FVector HandLoc = GetComponentLocation();

    for (AActor* A : Overlapping)
    {
        if (!A || !A->Implements<UGrabbable>()) continue;

        const float Score = IGrabbable::Execute_GetGrabPriority(A, HandLoc);
        if (Score > BestScore)
        {
            BestScore = Score;
            Best = A;
        }
    }
    return Best;
}

void UGrabberComponent::TryGrab()
{
    if (HeldActor) return;

    AActor* Candidate = FindBestCandidate();
    if (!Candidate) return;

    HeldActor = Candidate;

    if (UPrimitiveComponent* Prim =
            Cast<UPrimitiveComponent>(HeldActor->GetRootComponent()))
    {
        Prim->SetSimulatePhysics(false);
    }

    HeldActor->AttachToComponent(
        this, FAttachmentTransformRules::KeepWorldTransform);

    IGrabbable::Execute_OnGrabbed(HeldActor, this);
}

void UGrabberComponent::Release()
{
    if (!HeldActor) return;

    // Vận tốc = quãng đường từ mẫu CŨ NHẤT tới mẫu MỚI NHẤT,
    // chia cho TỔNG thời gian của quãng đó (số bước × dt).
    //
    // Hai lỗi kinh điển ở đây: (1) chỉ dùng 1 frame — quá nhiễu;
    // (2) lấy quãng đường của nhiều frame nhưng chia cho dt của MỘT frame,
    //     làm vận tốc bị thổi phồng 3-4 lần. Bản nháp đầu của tài liệu này
    //     mắc đúng lỗi (2) — và nó compile sạch.
    FVector Velocity = FVector::ZeroVector;
    if (NumValidSamples >= 2)
    {
        const int32 NewestIdx = (PrevIndex + VelocitySampleCount - 1) % VelocitySampleCount;
        const int32 OldestIdx = (NumValidSamples < VelocitySampleCount)
                                ? 0
                                : PrevIndex;   // khi đệm đầy, ô sắp bị ghi đè là ô cũ nhất
        const float SpanSeconds = (NumValidSamples - 1) * GetWorld()->GetDeltaSeconds();
        Velocity = (PrevLocations[NewestIdx] - PrevLocations[OldestIdx]) / SpanSeconds;
    }

    HeldActor->DetachFromActor(FDetachmentTransformRules::KeepWorldTransform);

    if (UPrimitiveComponent* Prim =
            Cast<UPrimitiveComponent>(HeldActor->GetRootComponent()))
    {
        Prim->SetSimulatePhysics(true);
        Prim->SetPhysicsLinearVelocity(Velocity);
    }

    IGrabbable::Execute_OnReleased(HeldActor, this, Velocity, FVector::ZeroVector);
    HeldActor = nullptr;
}
```

**Vì sao phải lưu vòng đệm vị trí:** vận tốc tính từ đúng một frame rất nhiễu — chỉ cần một frame bị hụt là vật ném ra với vận tốc vô lý. Trung bình 3-4 frame cho kết quả ổn hơn nhiều. Và mẫu số quan trọng không kém tử số: quãng đường của N frame phải chia cho **N×dt**, không phải dt của một frame. Đây là chi tiết nhỏ nhưng là khác biệt giữa "ném được" và "ném như có ma".

## 5.3 Attach hay physics constraint?

| | **Attach** (dùng ở trên) | **Physics constraint** |
|---|---|---|
| Vật xuyên qua tường khi bạn thọc tay vào tường | Có | Không |
| Cảm giác nặng/nhẹ | Không có | Có |
| Độ phức tạp | Thấp | Cao |
| Chi phí CPU | Thấp | Cao hơn |

**Cho giáo án này: dùng attach.** Physics constraint cho cảm giác chân thực hơn nhưng kéo theo cả một lớp vấn đề mới (jitter, vật kẹt, giật khi va chạm) mà người mới chưa nên đụng vào.

## 5.4 Highlight bằng shell mesh — và vì sao không dùng post-process

Cách phổ biến nhất để làm outline trên PC là post-process material đọc custom depth/stencil. **Trên Quest với cấu hình của ta thì cách đó không dùng được**, vì `r.MobileHDR=False` (§3.7) nghĩa là pipeline post-process thông thường không chạy.

Giải pháp: **shell mesh** — nhân bản mesh, phóng to một chút, lật mặt, tô một màu phẳng.

```cpp
// Trong actor có thể nắm
void AGrabbableProp::SetHighlighted_Implementation(bool bHighlighted)
{
    if (!ShellMesh) return;
    ShellMesh->SetVisibility(bHighlighted);
}

// Setup lúc construct
ShellMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ShellMesh"));
ShellMesh->SetupAttachment(BaseMesh);
ShellMesh->SetStaticMesh(BaseMesh->GetStaticMesh());   // cùng mesh
ShellMesh->SetRelativeScale3D(FVector(1.03f));         // phóng nhẹ
ShellMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
ShellMesh->SetCastShadow(false);
ShellMesh->SetVisibility(false);
ShellMesh->SetMaterial(0, OutlineMaterial);
```

Material cho shell:

- **Shading Model: Unlit** — không tính đèn, rẻ
- **Two Sided: false**, và **culling ngược** để chỉ thấy mặt trong (tức là chỉ thấy phần viền lòi ra ngoài mesh gốc). Cách thông dụng trong material là đẩy vertex theo normal thay vì scale đều, dùng World Position Offset:
  `WorldPositionOffset = VertexNormalWS * OutlineThickness`
- Emissive màu viền

**Ba lưu ý về chi phí:**

1. Shell mesh là **một draw call nữa** cho mỗi vật đang highlight. Chỉ highlight **một vật tại một thời điểm** — đó cũng là hành vi đúng về mặt UX.
2. Dùng World Position Offset (đẩy theo normal) thay vì scale đều, vì scale đều làm viền dày mỏng không đều trên mesh có tỉ lệ lệch.
3. ⚠️ Với skeletal mesh thì tốn hơn nhiều. Cân nhắc chỉ dùng cho static mesh.

> **Đây là ví dụ điển hình của tư duy "ràng buộc VR đẻ ra giải pháp".** Bạn không chọn shell mesh vì nó đẹp hơn. Bạn chọn nó vì cách quen thuộc đã bị chặn bởi một quyết định hiệu năng ở tầng dưới. Nhận ra chuỗi nhân quả này là một phần của việc trở thành dev VR.

## 5.5 Haptics

Rung là phản hồi rẻ tiền nhất và hiệu quả nhất để báo "bạn vừa chạm được cái gì đó".

```cpp
if (APlayerController* PC = Cast<APlayerController>(
        UGameplayStatics::GetPlayerController(this, 0)))
{
    PC->PlayHapticEffect(GrabHapticEffect, EControllerHand::Right, /*Scale=*/0.5f);
}
```

⚠️ Tên API và cách tạo haptic asset có thể lệch giữa các bản. Nguyên tắc thiết kế quan trọng hơn API: **rung ngắn (dưới 100 ms), nhẹ, và chỉ khi có sự kiện rõ ràng.** Rung dài và liên tục gây khó chịu và tốn pin.

## 5.6 Khi nào dùng Interaction SDK của Meta thay vì tự viết

✅ Meta có **Meta XR Interaction SDK** cho Unreal — plugin riêng, cài giống Meta XR plugin (giải nén vào `Engine/Plugins/Marketplace`), có bản khớp cho UE 5.6 ([nguồn](https://developers.meta.com/horizon/downloads/package/meta-xr-interaction-sdk-unreal/)). Nó cung cấp sẵn grab, poke, ray, và hand grab pose.

**Khuyến nghị cho lộ trình này:** tự viết trước (chương này), dùng ISDK sau.

Lý do: tự viết một lần cho bạn hiểu vì sao ISDK được thiết kế như vậy, và cho bạn khả năng debug khi ISDK cư xử lạ. Bắt đầu bằng ISDK thì bạn có tương tác tốt trong một ngày nhưng không hiểu gì cả — và khi nó hỏng, bạn bất lực.

⚠️ Ghi nhận: có báo cáo crash Vulkan ở Shipping build khi dùng ISDK Samples ở một số bản plugin gần đây. Nếu dùng ISDK, hãy test Shipping build sớm chứ không đợi tới cuối.

## 5.7 Bẫy của chương này

| Bẫy | Triệu chứng | Xử lý |
|---|---|---|
| Tính vận tốc thả từ 1 frame | Vật bay đi với vận tốc vô lý | Trung bình 3-4 frame (§5.2) |
| Quên tắt physics khi nắm | Vật giật, rung, hoặc bay khỏi tay | `SetSimulatePhysics(false)` khi grab |
| Quên bật lại physics khi thả | Vật đứng lơ lửng giữa không trung | `SetSimulatePhysics(true)` khi release |
| Dùng `KeepRelativeTransform` khi attach | Vật nhảy về gốc tay thay vì giữ nguyên chỗ | Dùng `KeepWorldTransform` |
| Highlight nhiều vật cùng lúc | Tốn draw call, và rối mắt | Chỉ một vật |
| Dùng post-process outline | Không hiện gì cả | Shell mesh (§5.4) |
| Sphere overlap quá to | Nắm nhầm vật ở xa | `GrabRadius` ~10 cm, và cho điểm theo khoảng cách |
| Rung dài, liên tục | Khó chịu, tốn pin | <100 ms, chỉ khi có sự kiện |

## 5.8 Bài tập và checklist

**Bài tập 1.** Cài đặt `IGrabbable` cho 3 loại vật khác nhau: một khối hộp (nắm ở đâu cũng được), một cái cốc (nên nắm ở quai), một cây bút (nên nắm ở thân, và định hướng theo tay). Dùng `GetGrabPriority` và `OnGrabbed` để mỗi loại cư xử khác nhau **mà không sửa một dòng nào trong `UGrabberComponent`**. Nếu bạn phải sửa Grabber, kiến trúc của bạn đang rò rỉ trách nhiệm.

**Bài tập 2.** Đặt hai vật cách nhau 5 cm, đưa tay vào giữa. Vật nào được chọn? Sửa `GetGrabPriority` để kết quả khớp với trực giác của bạn khi đeo headset.

**Bài tập 3.** Đo chi phí shell mesh: bật `stat SceneRendering` trên device, so số draw call khi không highlight và khi highlight. Ghi lại con số.

**Checklist cổng ra (trên device):**

- [ ] Nắm được vật bằng cả hai tay (không cùng lúc một vật)
- [ ] Thả ra vật rơi tự nhiên, ném được
- [ ] Highlight hiện khi tay lại gần, tắt khi ra xa
- [ ] Hai vật gần nhau → chọn đúng vật trực giác mong đợi
- [ ] Có rung khi nắm
- [ ] Draw call tăng thêm khi highlight nằm trong mức chấp nhận
- [ ] Vẫn ≥72 fps khi cầm vật và di chuyển

---
---

# Chương 6 — UI bằng Stereo Layer

Đây là chương kỹ thuật nặng nhất của tài liệu. Đọc chậm.

## 6.1 Vấn đề: chữ trong VR bị nhoè

Cách mặc định để làm UI trong VR là `UWidgetComponent` đặt ở World Space. Nó hoạt động, nhưng chữ trông mờ, rung nhẹ, và ở khoảng cách đọc bình thường thì gần như không đọc được cỡ chữ nhỏ.

Nguyên nhân không phải một, mà là **chuỗi tổn thất chồng lên nhau**. Widget của bạn được vẽ thành texture, rồi texture đó đi qua:

1. Render vào scene ở độ phân giải đã nhân `r.ScreenPercentage`
2. Bị **Fixed Foveated Rendering** giảm chất lượng nếu nó nằm lệch khỏi trung tâm (§3.8)
3. Qua MSAA resolve
4. Qua reprojection của compositor, tức là bị lấy mẫu lại lần nữa

Mỗi bước mất một ít. Chữ là thứ nhạy cảm nhất với việc lấy mẫu lại, nên chữ chịu thiệt nhiều nhất.

## 6.2 Giải pháp: đi thẳng vào compositor

Nhớ lại §2.6: compositor là một tầng riêng nằm **sau** renderer. Nó ghép các "layer" lại trước khi xuất ra panel.

**Compositor layer** cho phép bạn đưa một texture thẳng cho compositor, bỏ qua toàn bộ chuỗi ở §6.1. Texture được lấy mẫu ở độ phân giải gốc, đúng một lần, ngay trước khi hiển thị.

Kết quả: chữ sắc nét rõ rệt. Đây không phải cải thiện nhỏ — đó là khác biệt giữa "đọc được" và "không đọc được".

✅ Hai giới hạn phải biết ngay:
- Stereo Layer **chỉ hỗ trợ Quest trên UE5**
- **Tối đa 16 compositor layer mỗi frame**; layer thứ 17 trở đi không được render ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-overlay/))

16 nghe nhiều, nhưng passthrough cũng là một layer, splash cũng là một layer. Coi đây là tài nguyên hữu hạn cần quản lý, không phải thứ dùng thoải mái.

## 6.3 API `UStereoLayerComponent`

| Thuộc tính | Nghĩa | Giá trị dùng cho menu |
|---|---|---|
| **Shape** | Hình layer: `UStereoLayerShapeQuad`, Cylinder, Equirect | Quad cho menu nhỏ, Cylinder cho menu rộng |
| **Stereo Layer Type** | `SLT_FaceLocked` / `SLT_TrackerLocked` / `SLT_WorldLocked` | `SLT_WorldLocked` |
| **Texture** | Texture hiển thị | Render target của widget |
| **Quad Size** | Kích thước layer | Theo thiết kế |
| **Priority** | Thứ tự chồng lớp | Số lớn vẽ trên |
| **bLiveTexture** | Texture cập nhật mỗi frame | `true` nếu UI động |
| **bSupportsDepth** | Cho geometry gần hơn che layer | **Xem §6.4 — cẩn thận** |
| **bNoAlphaChannel** | Bỏ kênh alpha | `false` nếu UI có vùng trong suốt |
| **SetUsingAbsoluteScale** | Bỏ qua scale của actor cha | Hữu ích khi pawn bị scale |

### Ba loại layer type — chọn sai là hỏng trải nghiệm

- **`SLT_FaceLocked`** — layer dán vào mặt, xoay đầu thì nó đi theo. **Gây khó chịu mạnh nếu dùng cho menu.** Chỉ dùng cho hiệu ứng toàn màn hình (fade, vignette).
- **`SLT_TrackerLocked`** — cố định so với gốc tracking, không theo pawn.
- **`SLT_WorldLocked`** — cố định trong thế giới. **Đây là lựa chọn cho menu.** Người dùng nhìn đi chỗ khác thì menu ở yên, quay lại thì nó vẫn ở đó — giống một tấm bảng thật.

> **Luật comfort:** menu không được dán vào mặt. Người dùng phải có khả năng nhìn đi chỗ khác. Menu dán mặt là thứ khiến người ta tháo headset ra.

## 6.4 `bSupportsDepth` — phần phải nói thẳng

Tuỳ chọn này về lý thuyết cho phép vật thể gần hơn che khuất layer, để menu không xuyên qua tường. Nghe đúng là thứ bạn muốn.

**Nhưng:** ✅ theo bảng tương thích của Meta, **"mobile compositor layer depth testing" là tính năng chỉ có ở bản Oculus-VR fork**, không có ở Epic build + Meta XR plugin ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-compatibility-matrix/)).

Chúng ta đi Đường A (§1.6) → **không có tính năng này**.

⚠️ Tệ hơn: có lịch sử báo cáo rằng bật `Supports Depth` trên Quest tạo ra một **mặt phẳng đen đặc** thay vì hoạt động đúng — do engine mô phỏng depth bằng material kiểu "poke a hole" ([báo cáo](https://forums.oculusvr.com/t5/Unreal-VR-Development/BUG-Enable-Supports-Depth-on-Stereo-Layer-create-a-default-solid/td-p/780118)). Các báo cáo này từ thời UE 4.23-4.26; ❓ chưa kiểm chứng lại trên 5.6 + plugin v83.

**Quyết định cho giáo án: không thiết kế UI dựa vào `bSupportsDepth`.**

Thay vào đó, dùng ba cách này:

1. **Đặt menu ở chỗ không bị che.** Cách rẻ nhất và tốt nhất: menu xuất hiện ở vị trí tương đối với người dùng, trong vùng trống trước mặt, không phải ở vị trí cố định trong level.
2. **Tự kiểm tra che khuất bằng trace.** Mỗi frame trace từ camera tới tâm layer; nếu có vật cản thì ẩn layer đi. Thô nhưng hoạt động và bạn kiểm soát được.
3. **Dùng `Priority` cho việc chồng lớp giữa các layer với nhau** — cái này hoạt động bình thường.

Nếu bạn thật sự cần depth testing đúng nghĩa, đó là một trong những lý do hợp lệ để cân nhắc Đường B (§1.9).

## 6.5 Kiến trúc kép: hiển thị tách khỏi tương tác

Đây là ý tưởng trung tâm của chương.

Compositor layer chỉ là một tấm ảnh nổi trong không gian. Nó **không có collision, không nhận trace, không biết gì về chuột hay tia**. Nên nếu bạn chỉ dùng stereo layer, bạn có UI đẹp mà không bấm được.

Giải pháp: **hai vật thể chồng nhau**.

```
MenuActor
 ├── WidgetComponent   (World Space, KHÔNG hiển thị) ← để trace và nhận click
 └── StereoLayerComponent (hiển thị)                 ← để nhìn
```

Widget component vẫn tồn tại và vẫn render vào render target của nó, nhưng bạn **tắt hiển thị của nó trong scene**. Nó chỉ còn làm hai việc: sinh ra texture, và làm bề mặt cho trace.

Stereo layer lấy đúng render target đó làm texture của mình.

```cpp
// MenuActor.h
UCLASS()
class YOURPROJECT_API AMenuActor : public AActor
{
    GENERATED_BODY()
public:
    AMenuActor();
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

protected:
    UPROPERTY(VisibleAnywhere) TObjectPtr<UWidgetComponent>      WidgetComp;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UStereoLayerComponent> StereoLayer;

    /** Cho phép tắt stereo layer để so sánh, và làm đường lùi */
    UPROPERTY(EditAnywhere, Category="UI") bool bUseStereoLayer = true;

private:
    void SyncLayerToWidget();
    bool IsLayerOccluded() const;
};
```

```cpp
// MenuActor.cpp
AMenuActor::AMenuActor()
{
    PrimaryActorTick.bCanEverTick = true;

    WidgetComp = CreateDefaultSubobject<UWidgetComponent>(TEXT("WidgetComp"));
    SetRootComponent(WidgetComp);
    WidgetComp->SetWidgetSpace(EWidgetSpace::World);
    WidgetComp->SetDrawSize(FVector2D(1024.f, 768.f));
    WidgetComp->SetCollisionEnabled(ECollisionEnabled::QueryOnly);   // vẫn trace được

    StereoLayer = CreateDefaultSubobject<UStereoLayerComponent>(TEXT("StereoLayer"));
    StereoLayer->SetupAttachment(WidgetComp);
    StereoLayer->SetStereoLayerType(SLT_WorldLocked);
    StereoLayer->bLiveTexture   = true;    // UI động
    StereoLayer->bSupportsDepth = false;   // §6.4 — cố ý tắt
    StereoLayer->bNoAlphaChannel = false;
}

void AMenuActor::BeginPlay()
{
    Super::BeginPlay();
    SyncLayerToWidget();
}

void AMenuActor::SyncLayerToWidget()
{
    if (!bUseStereoLayer)
    {
        // ĐƯỜNG LÙI: tắt layer, bật widget hiển thị trong scene
        StereoLayer->SetVisibility(false);
        WidgetComp->SetVisibility(true);
        return;
    }

    if (UTextureRenderTarget2D* RT = WidgetComp->GetRenderTarget())
    {
        StereoLayer->SetTexture(RT);

        // Khớp kích thước layer với kích thước vật lý của widget
        const FVector2D Draw = WidgetComp->GetDrawSize();
        const float Scale = WidgetComp->GetRelativeScale3D().X;
        StereoLayer->SetQuadSize(FVector2D(Draw.X * Scale, Draw.Y * Scale));

        StereoLayer->SetVisibility(true);
        WidgetComp->SetVisibility(false);   // vẫn render vào RT, chỉ không vẽ trong scene
    }
}
```

✅ `SetTexture()` và `SetQuadSize()` là hàm có thật của `UStereoLayerComponent` (xác nhận từ tài liệu API của Epic — lưu ý QuadSize là kích thước *chưa* nhân component scale). ❓ Riêng `SetStereoLayerType()` tôi **không tìm thấy** trong tài liệu API — có thể property `StereoLayerType` chỉ đặt được lúc thiết kế. Nếu dòng đó không compile: đặt **Stereo Layer Type = World Locked** trong Details panel của Blueprint con thay vì đặt bằng code, và xoá dòng gọi hàm. Với `GetRenderTarget()` của WidgetComponent cũng vậy — nếu lệch tên, mở `WidgetComponent.h` trong source engine; header luôn nói thật.

**Một điểm dễ sai về đơn vị:** `DrawSize` tính bằng pixel, `QuadSize` tính bằng đơn vị thế giới. Ghép hai cái không đúng tỉ lệ là nguyên nhân số 1 của việc "layer to gấp đôi widget" hoặc ngược lại. Dựng một hằng số quy đổi rõ ràng trong project và dùng nhất quán.

## 6.6 Tương tác với UI

`UWidgetInteractionComponent` gắn vào controller, trace ra phía trước, và chuyển kết quả thành sự kiện chuột cho widget.

```cpp
// Trong AVRPawn constructor
WidgetInteractionRight = CreateDefaultSubobject<UWidgetInteractionComponent>(
    TEXT("WidgetInteractionRight"));
WidgetInteractionRight->SetupAttachment(ControllerRight);
WidgetInteractionRight->InteractionDistance = 300.f;
WidgetInteractionRight->TraceChannel = ECollisionChannel::ECC_Visibility;

// Khi bấm nút
WidgetInteractionRight->PressPointerKey(EKeys::LeftMouseButton);
// Khi thả
WidgetInteractionRight->ReleasePointerKey(EKeys::LeftMouseButton);
```

Vì widget component vẫn còn collision (`QueryOnly`) nên trace vẫn trúng nó, dù nó không hiển thị. Đây chính là lý do kiến trúc kép hoạt động.

**Phải có tia ngắm nhìn thấy được.** Không có phản hồi thị giác thì người dùng không biết mình đang trỏ vào đâu. Vẽ một spline mesh hoặc một đường mảnh từ tay tới điểm trúng, cộng thêm một chấm tròn ở điểm trúng.

## 6.7 Đường lùi — bắt buộc phải có

Chú ý biến `bUseStereoLayer` ở §6.5. Nó không phải để cho vui.

**Quy tắc: mọi tính năng phụ thuộc compositor đều phải có đường lùi về cách làm thông thường.** Lý do:

- Stereo layer có nhiều hành vi ❓ chưa xác minh được trên 5.6 (§6.4, và vụ tonemap subpass ở §3.7)
- Khi có lỗi, bạn cần tách được "lỗi ở UI của tôi" khỏi "lỗi ở tầng compositor"
- Nếu một bản plugin mới làm hỏng stereo layer, bạn có một dòng để lật công tắc thay vì viết lại UI

Cách làm gọn: một console variable của project.

```cpp
static TAutoConsoleVariable<int32> CVarUseStereoLayerUI(
    TEXT("game.UseStereoLayerUI"),
    1,
    TEXT("1 = UI qua compositor layer (nét hơn). 0 = world-space widget (đường lùi)."),
    ECVF_Default);
```

Rồi cho mọi menu đọc CVar này. Trên device, bật console và gõ `game.UseStereoLayerUI 0` là bạn so sánh được ngay lập tức — và đó cũng là **bài tập bắt buộc của chương**: nhìn tận mắt sự khác biệt về độ sắc nét.

## 6.8 Supersampling, sharpening và MQSR

✅ Layer Supersampling & Sharpening có ở **cả hai đường** cài đặt, và **Meta Quest Super Resolution (MQSR)** cũng có ở Epic build + plugin từ v68 trở lên ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-compatibility-matrix/)).

Nghĩa là bạn có thêm núm vặn để cải thiện độ nét của layer mà không cần fork. ❓ Cách bật chính xác cho stereo layer ở plugin v83 tôi không xác minh được — tìm trong **Project Settings → Plugins → Meta XR**, và trong thuộc tính của chính `UStereoLayerComponent`.

Thứ tự thử khi chữ vẫn chưa đủ nét:
1. Tăng `DrawSize` của widget (nhiều pixel hơn cho cùng diện tích vật lý)
2. Tăng cỡ chữ và giảm lượng chữ — thường đây mới là vấn đề thật
3. Bật supersampling/sharpening của layer
4. Kéo menu lại gần người dùng hơn

## 6.9 Bẫy của chương này

| Bẫy | Triệu chứng | Ghi chú |
|---|---|---|
| Chỉ dùng stereo layer, không có widget | UI đẹp nhưng không bấm được | Layer không có collision — §6.5 |
| Dùng `SLT_FaceLocked` cho menu | Menu dán vào mặt, gây khó chịu | Dùng `SLT_WorldLocked` |
| Tin vào `bSupportsDepth` | Menu xuyên tường, hoặc ra mặt phẳng đen | Fork-only — §6.4 |
| Lệch đơn vị `DrawSize` (px) vs `QuadSize` (world) | Layer sai kích thước | Dựng hằng số quy đổi |
| Quên `bLiveTexture` với UI động | UI đứng hình | Bật cho UI có animation |
| Vượt 16 layer | Layer thứ 17+ không hiện, im lặng | ✅ Giới hạn cứng |
| `bLiveTexture` cho mọi layer | Tốn băng thông vô ích | Chỉ bật cho layer thực sự động |
| Bật Tonemap Subpass | ⚠️ Render target của layer có thể đóng băng: click ăn nhưng mất hover/animation | Quan sát hiện trường ❓ — §3.7 |
| Không làm đường lùi | Không tách được lỗi của mình khỏi lỗi compositor | §6.7 |
| Verify UI trong PIE | Không thấy được độ nét thật | Stereo layer không tồn tại trong PIE — §2.3 |

## 6.10 Bài tập và checklist

**Bài tập 1 (quan trọng nhất).** Dựng một menu có chữ nhỏ cỡ 14pt. Deploy lên device. Bật/tắt `game.UseStereoLayerUI` và nhìn kỹ. Ghi lại: ở khoảng cách nào thì bản world-space không đọc được nữa, còn bản stereo layer thì vẫn đọc được?

**Bài tập 2.** Đặt menu ở `SLT_FaceLocked`, dùng thử 2 phút. Đổi sang `SLT_WorldLocked`, dùng thử 2 phút. Viết 3 câu về khác biệt cảm giác. Bài này dạy comfort tốt hơn mọi lý thuyết.

**Bài tập 3.** Cố tình spawn 20 stereo layer cùng lúc. Quan sát cái gì xảy ra với layer thứ 17 trở đi. Đối chiếu với §6.2.

**Bài tập 4.** Cài đặt cách "trace kiểm tra che khuất" ở §6.4 phương án 2. So sánh cảm giác với việc để menu xuyên tường.

**Checklist cổng ra (trên device):**

- [ ] Menu hiện, chữ **sắc nét rõ rệt** hơn bản world-space
- [ ] `game.UseStereoLayerUI 0/1` đổi được ngay trên device
- [ ] Menu world-locked: nhìn đi chỗ khác thì nó ở yên
- [ ] Trỏ tay vào nút → có hover, có tia ngắm nhìn thấy được
- [ ] Bấm được, và có rung phản hồi
- [ ] UI có animation vẫn chạy (kiểm tra `bLiveTexture`)
- [ ] Đếm số layer đang dùng, còn xa mức 16
- [ ] Vẫn ≥72 fps khi menu mở

---
---

# Chương 7 — Mixed Reality: Passthrough, Scene, MRUK

Chương dài nhất của tài liệu. Nó gồm năm chủ đề ghép lại thành một app MR hoàn chỉnh: passthrough (§7.2), quyền (§7.3), Scene và MRUK (§7.4-7.6), hand tracking (§7.8) và spatial anchors (§7.9).

## 7.1 Ba khái niệm

| Khái niệm | Là gì |
|---|---|
| **Passthrough** | Hình ảnh camera ngoài của headset, hiển thị làm nền thay cho môi trường ảo |
| **Scene** | Mô hình phòng thật do người dùng quét: tường, sàn, trần, bàn, ghế... |
| **Spatial Anchor** | Một điểm neo cố định trong không gian thật, tồn tại qua các phiên chạy |

MR = ba thứ này kết hợp: bạn thấy phòng thật (passthrough), app biết tường ở đâu (Scene), và đồ vật ảo ở nguyên chỗ bạn đặt (Anchor).

## 7.2 Thay đổi phá vỡ ở UE 5.6 — đọc trước khi làm gì khác

✅ **Cách cũ dùng component `UOculusXRPassthroughLayerComponent` đã bị deprecate kể từ UE 5.6.** Cách hiện tại là **Persistent Passthrough**, và Meta khuyến nghị dùng nó cho mọi project mới ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-passthrough-overview-gs/)).

**Hệ quả trực tiếp:** phần lớn tutorial passthrough bạn tìm thấy trên mạng, kể cả tutorial khá mới, đang dạy cách đã deprecate. Nếu bạn thấy hướng dẫn bảo "thêm một OculusXRPassthroughLayerComponent vào pawn" thì đó là cách cũ.

### Setup đúng

✅ Trong **Edit → Project Settings → Meta XR**:

| Mục | Giá trị |
|---|---|
| General → **XR API** | **Epic Native OpenXR (Recommended)** |
| Mobile → **Passthrough Enabled** | **True** |
| Layer Placement | **Underlay** |

Rồi truy cập qua **`UOculusXRPassthroughSubsystem`** (có Blueprint node).

Ba lưu ý:

- ✅ **Layer Placement phải là Underlay.** Overlay đã deprecate và **không chạy qua Link**.
- ✅ **Passthrough khởi tạo bất đồng bộ** — có thể mất vài frame mới sẵn sàng. Đừng giả định nó có ngay ở `BeginPlay`.
- ✅ Nhắc lại từ §3.7: **`r.Mobile.SceneColorFormat=4` là bắt buộc.** Format mặc định không có kênh alpha, mà blend passthrough cần alpha. Thiếu dòng này thì passthrough blend sai và triệu chứng rất khó truy nguyên.

### Làm cho nền trong suốt

Passthrough là underlay, tức là nó nằm **dưới** scene render của bạn. Để nhìn thấy nó, scene của bạn phải trong suốt ở những chỗ không có vật thể:

- Đặt màu nền / clear color có alpha = 0
- Bỏ skybox, bỏ atmosphere fog
- Vật thể ảo vẫn vẽ bình thường, chỉ vùng trống là trong suốt

Nếu bạn thấy màn hình đen thay vì phòng thật, gần như chắc chắn là một trong: chưa bật Passthrough Enabled, sai SceneColorFormat, hoặc scene không trong suốt.

## 7.3 Quyền — và cái bẫy người dùng từ chối

✅ MR cần hai quyền Android:

| Quyền | Loại |
|---|---|
| `com.oculus.permission.USE_SCENE` | **Runtime** — phải xin trong app |
| `com.oculus.permission.USE_ANCHOR_API` | Khai báo trong manifest |

✅ `USE_SCENE` là quyền runtime, nghĩa là hệ thống sẽ hiện hộp thoại hỏi người dùng. MRUK có thể tự xin quyền này khi bạn cho nó load scene lúc khởi động.

**Nhưng bạn vẫn phải viết nhánh xử lý khi người dùng bấm Từ chối.** Đây là chỗ người mới hay bỏ qua, và nó dẫn tới app treo hoặc màn hình trống mà không có thông báo gì.

Ba trạng thái phải xử lý, không phải một:

| Trạng thái | Xử lý |
|---|---|
| Đã có quyền + đã quét phòng | Đường bình thường |
| Đã có quyền + **chưa quét phòng** | Gọi Space Setup, hướng dẫn người dùng quét |
| **Từ chối quyền** | Chuyển sang chế độ phòng ảo, hoặc thông báo rõ ràng app cần quyền để làm gì |

✅ **Space Setup không chạy được qua Link** — phải quét trên device trước rồi Link mới đọc được dữ liệu đó. Ghi nhớ điều này khi test.

## 7.4 MRUK — Mixed Reality Utility Kit

✅ **MRUK đã được gộp vào plugin Meta XR, không còn bản standalone.** Sample chính thức nằm ở [`oculus-samples/Unreal-MRUtilityKitSample`](https://github.com/oculus-samples/Unreal-MRUtilityKitSample).

MRUK là lớp tiện ích trên Scene API: nó lo việc đọc dữ liệu phòng, phân loại bề mặt, và spawn actor tại các anchor.

### API chính

| Việc | C++ | Blueprint |
|---|---|---|
| Nạp scene từ thiết bị | `LoadSceneFromDevice()` | `Load Scene From Device Async` |
| Nạp scene từ JSON (để test) | `LoadSceneFromJsonString()` | `Load Scene From Json Async` |
| Spawn actor theo anchor | kế thừa `AMRUKAnchorActorSpawner` | |

✅ Có hai mô hình scene: `EMRUKSceneModel::V2` (HiFi Scene — hỗ trợ nhiều trần, cột, tường bên trong) và `V2FallbackV1` (dùng V2, lùi về V1 nếu không có).

**`LoadSceneFromJsonString` đáng giá hơn nó nghe.** Nó cho phép bạn lưu lại một phòng đã quét thành JSON rồi nạp lại — nghĩa là bạn test được logic MR mà không cần quét lại phòng mỗi lần, và cả nhóm test được trên cùng một "phòng" giống hệt nhau. Với một giáo án thì đây gần như là bắt buộc.

```cpp
// Nạp scene và dựng collision proxy
void AMRManager::LoadRoom()
{
    // Trong thực tế dùng bản Async và bind delegate hoàn thành
    // Ở đây rút gọn cho dễ đọc

    if (bUseSavedRoomJson && !SavedRoomJson.IsEmpty())
    {
        // Test lặp lại được, không cần quét phòng
        // MRUKSubsystem->LoadSceneFromJsonString(SavedRoomJson);
    }
    else
    {
        // MRUKSubsystem->LoadSceneFromDevice();
    }
}
```

⚠️ Tên subsystem và signature chính xác của các hàm này ở plugin v83 tôi không xác minh được. Cách tìm chắc chắn: gõ `MRUK` trong Blueprint node search — danh sách node hiện ra chính là API đang có thật. Từ đó suy ra tên C++ tương ứng.

## 7.5 Collision proxy — làm cho tường thật cản được vật ảo

Đây là bước biến "hình ảnh phòng thật" thành "phòng thật có tương tác".

Dữ liệu Scene cho bạn vị trí và kích thước của tường, sàn, bàn. Bạn dựng **collision không nhìn thấy** ở đúng những chỗ đó. Sau đó quả bóng ảo nảy vào tường thật, đồ vật ảo đặt được lên bàn thật.

```cpp
void AMRManager::SpawnCollisionProxy(const FTransform& AnchorTransform,
                                     const FVector& Extents)
{
    AStaticMeshActor* Proxy = GetWorld()->SpawnActor<AStaticMeshActor>(
        AStaticMeshActor::StaticClass(), AnchorTransform);
    if (!Proxy) return;

    UStaticMeshComponent* Mesh = Proxy->GetStaticMeshComponent();

    // BẮT BUỘC: AStaticMeshActor spawn ra với mobility = Static,
    // và SetStaticMesh lúc runtime sẽ FAIL kèm warning nếu không đổi
    Mesh->SetMobility(EComponentMobility::Movable);

    Mesh->SetStaticMesh(UnitCubeMesh);

    // Extents của anchor là kích thước thật (cm). Nếu UnitCubeMesh là khối
    // Cube chuẩn 100 cm của engine thì scale = Extents / 100
    Mesh->SetWorldScale3D(Extents / 100.f);

    Mesh->SetVisibility(false);              // KHÔNG vẽ — chỉ để va chạm
    Mesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
    Mesh->SetCollisionResponseToAllChannels(ECR_Block);
    Mesh->SetCastShadow(false);

    SpawnedProxies.Add(Proxy);
}
```

**Ba điều dễ sai:**

1. **Quên `SetVisibility(false)`** → phòng thật bị che bởi một đống khối hộp xám. Triệu chứng rõ ràng, dễ sửa.
2. **Quên `SetCastShadow(false)`** → bóng đổ từ vật vô hình, trông như ma. Triệu chứng khó hiểu hơn nhiều.
3. **Không dọn proxy cũ khi nạp lại scene** → proxy chồng chất, va chạm sai, và rò bộ nhớ. Luôn có hàm `ClearProxies()` và gọi trước khi nạp.

## 7.6 Nhánh fallback bắt buộc

Trong MR, có ba thứ nằm ngoài tầm kiểm soát của bạn: người dùng có cho quyền không, họ đã quét phòng chưa, và phòng của họ trông như thế nào. App phải sống sót qua cả ba.

```cpp
void AMRManager::BeginPlay()
{
    Super::BeginPlay();

    // 1. Có quyền không?
    if (!HasScenePermission())
    {
        RequestScenePermission();   // bất đồng bộ — xử lý ở callback
        return;
    }

    // 2. Có dữ liệu phòng không?
    if (!HasSceneData())
    {
        ShowMessage(TEXT("Cần quét phòng một lần trước khi bắt đầu."));
        LaunchSpaceSetup();
        return;
    }

    // 3. Đường bình thường
    LoadRoom();
}

void AMRManager::OnScenePermissionDenied()
{
    // KHÔNG treo, KHÔNG màn hình đen
    ShowMessage(TEXT("Không có quyền truy cập dữ liệu phòng. "
                     "Chuyển sang chế độ phòng ảo."));
    EnterVirtualRoomMode();
}
```

> **Quy tắc:** một app MR không bao giờ được kết thúc ở màn hình đen im lặng. Mọi nhánh thất bại đều phải dẫn tới một thứ mà người dùng nhìn thấy và hiểu được.

## 7.7 Occlusion — biết giới hạn của Đường A

Occlusion là việc vật thật che vật ảo (tay bạn che quả bóng ảo). Đây là thứ làm MR trông thuyết phục.

✅ Theo bảng tương thích: Đường A (Epic + plugin) chỉ có **hard occlusion**; **soft occlusion và Depth API material graph là fork-only**.

Nghĩa là: với Đường A bạn có occlusion dựa trên hình học của Scene (vật ảo bị tường che), nhưng không có occlusion mềm dựa trên độ sâu theo pixel (tay bạn che vật ảo với viền mượt).

**Thiết kế quanh giới hạn này** thay vì cố vượt qua nó: đặt nội dung ảo ở nơi ít bị tay che, hoặc chấp nhận viền cứng. Đây là một trong số ít lý do chính đáng để cân nhắc Đường B.

## 7.8 Hand tracking

Quest 3 theo dõi được bàn tay trần, không cần controller. Đây là tính năng lõi của thiết bị, và nó đổi hẳn cảm giác của một app MR — người dùng đưa tay thật vào không gian thật để chạm vào vật ảo.

### Bật hand tracking

✅ Trong **Edit → Project Settings → Plugins → Meta XR**, mục **Hand Tracking Support**, chọn một trong ba:

| Lựa chọn | Nghĩa |
|---|---|
| **Controllers** | Không bật hand tracking |
| **Controllers and Hands** | Người dùng dùng được cả tay lẫn controller — **chọn cái này cho giáo án** |
| **Hands Only** | Bắt buộc người dùng phải bật hand tracking trên thiết bị mới dùng được app |

✅ Việc chọn khác "Controllers" sẽ **tự thêm `com.oculus.permission.HAND_TRACKING` vào Android manifest** — bạn không phải viết tay.

✅ Ngoài ra có **Hand Tracking Frequency** — đặt **High** nếu cần độ mượt cao hơn, đổi lại tốn tài nguyên hơn.

> **Vì sao chọn "Controllers and Hands":** ép Hands Only nghĩa là người chưa bật hand tracking trên headset sẽ không dùng được app. Với một app học tập thì đó là rào cản vô ích. Cho phép cả hai và để người dùng tự chọn.

### `UOculusXRHandComponent`

✅ Component chính để hiển thị bàn tay, thuộc module **OculusXRInput**. Ba đặc điểm quyết định cách bạn dựng pawn:

1. Nó là **subclass của `UPoseableMeshComponent`** của Unreal — tức là một mesh mà bạn điều khiển bone trực tiếp
2. Nó **phải là con của một `UMotionControllerComponent`** — motion controller cung cấp pose và late-update
3. Nó tự lo: nạp mesh/skeleton, cập nhật bone, đổi material, và **tự ẩn tay khi mất tracking hoặc độ tin cậy thấp**

Điểm 3 quan trọng hơn nó nghe. Tay bị mất tracking là chuyện xảy ra liên tục — người dùng đưa tay ra sau lưng, ra ngoài tầm camera, hoặc hai tay che nhau. Component tự xử lý việc ẩn tay, nên bạn không phải viết logic đó.

Thêm vào pawn ở Chương 4:

```
ControllerRight (UMotionControllerComponent)
 ├── VisualRight (UXRDeviceVisualizationComponent)   ← khi cầm controller
 └── HandRight   (UOculusXRHandComponent)            ← khi dùng tay trần
```

✅ Các tuỳ chọn đáng biết trên component: cập nhật root pose, cập nhật root scale, đặt pointer pose root, và **bật physics capsule** (sinh collision capsule theo từng đốt ngón tay — cần cho việc chạm vào vật ảo bằng tay).

### `UOculusXRInputFunctionLibrary`

✅ Thư viện hàm Blueprint trong module **OculusXRInput**, cho các dữ liệu riêng của tay mà `UOculusXRHandComponent` không lo:

| Dữ liệu | Dùng để |
|---|---|
| Hand scale | Tay người dùng to nhỏ khác nhau — dùng để scale vật cầm cho khớp |
| **Pointer pose** | Tia trỏ chuẩn của hệ thống. **Đừng tự tính tia từ ngón trỏ** — dùng cái này |
| Bone rotation | Đọc tư thế từng đốt ngón, để nhận cử chỉ |
| **Tracking confidence** | Độ tin cậy của tracking hiện tại |

✅ Ngoài ra có `GetHandSkeletalMesh` — sinh ra một `USkeletalMesh` lúc runtime từ dữ liệu skeleton và mesh mà hệ thống hand tracking cung cấp. Tham số `World To Meters` mặc định `100.0f` (chuẩn Unreal: 100 cm = 1 m). Dùng khi bạn cần mesh tay để xử lý riêng thay vì chỉ hiển thị.

> **Về tracking confidence — đây là chỗ người mới hay bỏ:** đừng cho phép hành động quan trọng (xoá dữ liệu, xác nhận thanh toán, thả vật đang cầm) khi confidence thấp. Tay nhảy loạn một frame vì mất tracking mà app hiểu nhầm thành thao tác cố ý là trải nghiệm rất tệ. Kiểm tra confidence trước, không sau.

### Chuyển đổi controller ↔ tay

⚠️ Ở các bản Meta XR gần đây, việc chuyển đổi bám theo **interaction profile của OpenXR đang hoạt động** — tức là runtime tự báo người dùng đang cầm controller hay đang dùng tay, và bạn phản ứng theo. Bạn không cần tự dò.

Logic tối thiểu trong pawn:

```cpp
// Ẩn/hiện theo nguồn đang hoạt động — gọi mỗi khi nguồn đổi, không phải mỗi tick
void AVRPawn::UpdateHandVisuals(bool bUsingHands)
{
    VisualLeft->SetVisibility(!bUsingHands);
    VisualRight->SetVisibility(!bUsingHands);
    HandLeft->SetVisibility(bUsingHands);
    HandRight->SetVisibility(bUsingHands);
}
```

⚠️ Cơ chế phát hiện chính xác trong plugin v83 cần kiểm chứng — mô tả trên gắn với bản plugin mới hơn 5.6. Tìm trong `UOculusXRInputFunctionLibrary` xem có hàm dạng "is hand tracking active" không, hoặc bind vào sự kiện đổi interaction profile.

### Thiết kế tương tác cho tay trần

Hand tracking **không phải controller không dây**. Ba khác biệt buộc bạn thiết kế khác:

| | Controller | Tay trần |
|---|---|---|
| Phản hồi xúc giác | Có rung | **Không có gì** |
| Độ chính xác | Cao, ổn định | Thấp hơn, nhiễu hơn |
| Nút bấm | Có | Không — chỉ có cử chỉ |

Hệ quả thực tế:

1. **Bù lại việc mất rung bằng thị giác và âm thanh.** Vật phải sáng lên rõ khi tay chạm tới, và có tiếng khi nắm được. Không có phản hồi thì người dùng không biết mình đã nắm chưa
2. **Vùng chạm phải rộng hơn.** Vùng grab vừa đủ cho controller sẽ hụt liên tục với tay trần
3. **Pinch (chụm ngón trỏ + ngón cái) là cử chỉ nắm mặc định** trên Quest. Đừng phát minh cử chỉ mới — người dùng đã quen pinch từ giao diện hệ thống
4. **Đừng bắt giữ cử chỉ lâu.** Giữ tay lơ lửng trong không khí mỏi rất nhanh — hiện tượng gorilla arm. Thao tác nên xong trong 1-2 giây

---

## 7.9 Spatial Anchors — giữ vật ảo ở đúng chỗ qua nhiều phiên

Không có anchor, mọi thứ bạn đặt trong phòng sẽ biến mất khi đóng app. Spatial anchor là thứ biến "app MR" thành "app nhớ được phòng của tôi".

### Anchor khác Scene ở chỗ nào

- **Scene** (§7.4): mô tả **phòng** — tường, sàn, bàn. Do người dùng quét, dùng chung cho mọi app
- **Anchor**: một điểm neo **do app của bạn tạo ra**, ở vị trí bạn chọn, và tồn tại qua các phiên chạy

Ví dụ: Scene cho bạn biết bàn ở đâu. Anchor cho phép bạn nhớ rằng *người dùng đã đặt lọ hoa ảo ở góc trái cái bàn đó*.

### Bật hỗ trợ

✅ **Edit → Project Settings → Plugins → Meta XR**: bật **Anchor Support**, **Scene Support**, và **Passthrough Support**.

Quyền cần: `com.oculus.permission.USE_ANCHOR_API` (§7.3).

### Vòng đời một anchor

```
Tạo (async)  →  Lưu (async)  →  [đóng app]  →  Truy vấn theo UUID (async)  →  Neo lại vật
```

**Cả bốn bước đều bất đồng bộ.** Đây là đặc điểm quan trọng nhất và là nguồn của gần như mọi lỗi trong phần này.

### API Blueprint

✅ Các node chính, target là **Oculus Spatial Anchor Manager**:

| Node | Việc | Ghi chú |
|---|---|---|
| `Oculus XRAsync Create Spatial Anchor` | Tạo anchor tại transform của một actor | Bất đồng bộ, có pin success/failure |
| `Oculus XRAsync Save Anchor` | Lưu anchor để tồn tại qua phiên | Bất đồng bộ |
| `Oculus XRAsync Query Anchors` | Nạp anchor theo UUID | Bất đồng bộ |
| `Discover Anchors` | Tìm anchor theo bộ lọc | ⚠️ **Lỗi đã biết:** result code không hiện ra trong Blueprint, nên không bắt lỗi được từ trong graph |
| `Erase Anchors` | Xoá anchor | Nhận actor, handle, hoặc UUID — trộn lẫn được |

Kiểu dữ liệu UUID trong Blueprint là **Oculus XRUUID** (C++: `FOculusXRUUID`). Đây là thứ bạn phải tự lưu lại.

### API C++

✅ Truy cập qua interface `OculusXRAnchors`, theo mẫu delegate:

```cpp
// Mẫu chung của mọi thao tác anchor: một result code trả về ngay,
// và một delegate chạy sau khi thao tác bất đồng bộ hoàn tất
EOculusXRAnchorResult::Type OutResult;

OculusXRAnchors::FOculusXRAnchors::ShareAnchors(
    AnchorComponents,        // TArray<UOculusXRAnchorComponent*>
    UserIDs,                 // TArray<uint64>
    FOculusXRAnchorShareDelegate::CreateLambda([](
        EOculusXRAnchorResult::Type Result,
        const TArray<UOculusXRAnchorComponent*>& Anchors,
        const TArray<uint64>& Users)
    {
        // Xử lý sau khi xong
    }),
    OutResult                // result code tức thời, KHÁC với result trong delegate
);
```

**Chú ý hai loại result code.** `OutResult` báo thao tác có *khởi động* được không. Result trong delegate mới báo thao tác có *thành công* không. Chỉ kiểm tra `OutResult` rồi coi như xong là một lỗi rất dễ mắc.

### Cái bẫy tốn nhiều giờ nhất

⚠️ **Actor được spawn để neo phải có component `OculusXRSpatialAnchor`.** Thiếu nó, anchor nạp lại sẽ spawn ở **(0,0,0)** thay vì đúng vị trí, kèm lỗi trong logcat:

```
[XR_ERROR_SPACE_COMPONENT_NOT_ENABLED_FB]: xrLocateSpace(...)
SP:AF:AnchorFramework: getAnchorUuid can't find anchor for handle 4
```

Triệu chứng "mọi thứ nằm chồng lên nhau ở gốc toạ độ" trông giống lỗi tính transform, nên người ta thường đi tìm sai chỗ hàng giờ. Nếu bạn thấy nó, kiểm tra component trước tiên.

> **Cách chẩn đoán chung, áp dụng được cho cả chương này:** khi làm MR mà kết quả sai, **mở logcat trước khi mở debugger**. Runtime của Meta ghi lỗi khá rõ ràng ở tầng OpenXR, và những lỗi đó không nổi lên tới log của Unreal. `adb logcat` là công cụ chẩn đoán MR quan trọng nhất mà người mới hay bỏ quên.

### Lưu UUID ở đâu

Anchor lưu trong headset, nhưng **UUID thì app của bạn phải tự nhớ**. Không nhớ UUID thì không có cách nào tìm lại anchor.

✅ Cách sample chính thức của Meta làm: dùng **hệ thống SaveGame của Unreal** để lưu danh sách UUID vào bộ nhớ app.

```cpp
UCLASS()
class UAnchorSaveGame : public USaveGame
{
    GENERATED_BODY()
public:
    UPROPERTY() TArray<FOculusXRUUID> SavedAnchorUuids;
};
```

Luồng đầy đủ:

1. Người dùng đặt vật → `Create Spatial Anchor` → thành công → nhận UUID
2. `Save Anchor` → thành công → **thêm UUID vào SaveGame và ghi xuống đĩa ngay**
3. Lần chạy sau: đọc SaveGame → `Query Anchors` với danh sách UUID → spawn actor tại kết quả

**Bước 2 phải ghi xuống đĩa ngay, không đợi lúc thoát app.** App VR bị người dùng tháo headset và kill bất cứ lúc nào; không có sự kiện "thoát app" đáng tin cậy để bạn dựa vào.

### Anchor bị trôi — và vì sao đó là chuyện bình thường

✅ Anchor có thể **trôi nhẹ theo thời gian** khi hệ thống tinh chỉnh lại hiểu biết về không gian. Runtime tự cập nhật transform để giữ vật world-locked.

Hệ quả thiết kế: **đừng cache vị trí anchor vào biến của mình rồi dùng mãi.** Đọc transform từ anchor mỗi khi cần, hoặc gắn vật làm con của actor mang anchor để nó tự đi theo.

### Vài giới hạn thực tế

- ✅ Anchor tạo bởi app này **không** thấy được từ app khác (trừ khi dùng shared anchor)
- ✅ **Shared Spatial Anchors** (chia anchor cho nhiều người) là chủ đề riêng, cần Data Use Checkup trên Developer Dashboard và **Enhanced Spatial Services** bật ở mọi người dùng liên quan. Ngoài phạm vi giáo án này
- ⚠️ Shared anchors hoạt động phần nào qua PC Link, nhưng được thiết kế chủ yếu cho app standalone

### Sample chính thức đáng đọc

| Sample | Nội dung |
|---|---|
| [`Unreal-SpatialAnchorsSample`](https://github.com/oculus-samples/Unreal-SpatialAnchorsSample) | Anchor cơ bản: tạo, lưu, nạp, xoá |
| [`Unreal-SharedAnchorsSample`](https://github.com/oculus-samples/Unreal-SharedAnchorsSample) | Anchor chia sẻ + mẫu lưu UUID bằng SaveGame |
| [`Unreal-SharedSceneSample`](https://github.com/oculus-samples/Unreal-SharedSceneSample) | Kết hợp anchor + Scene + Passthrough |
| [`Unreal-Discover`](https://github.com/oculus-samples/Unreal-Discover) | Tổng hợp các API MR của Quest |

> Với người tự học, **đọc sample quan trọng hơn đọc tài liệu API.** Tài liệu cho bạn biết hàm nào tồn tại; sample cho bạn biết chúng ghép với nhau ra sao và theo thứ tự nào — mà thứ tự mới là chỗ mọi người vấp.

---

## 7.10 Bẫy của chương này

| Bẫy | Triệu chứng | Ghi chú |
|---|---|---|
| Dùng `UOculusXRPassthroughLayerComponent` | API đã deprecate | ✅ Dùng Persistent Passthrough — §7.2 |
| Layer Placement = Overlay | Không chạy, và không chạy qua Link | ✅ Dùng Underlay |
| Quên `r.Mobile.SceneColorFormat=4` | Passthrough blend sai | ✅ Alpha channel |
| Scene không trong suốt | Màn hình đen thay vì phòng thật | Bỏ skybox, clear color alpha 0 |
| Giả định passthrough sẵn sàng ở `BeginPlay` | Vài frame đầu sai | ✅ Khởi tạo bất đồng bộ |
| Không xử lý nhánh từ chối quyền | App treo / màn đen im lặng | §7.6 |
| Test Space Setup qua Link | Không chạy được | ✅ Phải quét trên device |
| Proxy quên `SetVisibility(false)` | Phòng đầy khối hộp xám | §7.5 |
| Proxy quên `SetCastShadow(false)` | Bóng đổ từ vật vô hình | §7.5 |
| Không dọn proxy khi nạp lại | Va chạm sai, rò bộ nhớ | §7.5 |
| Kỳ vọng soft occlusion trên Đường A | Không có | ✅ Fork-only — §7.7 |
| Đặt `UOculusXRHandComponent` không làm con của MotionController | Tay không có pose, không late-update | ✅ Phải là con — §7.8 |
| Tự tính tia trỏ từ ngón trỏ | Tia lệch, giật | ✅ Dùng pointer pose của `UOculusXRInputFunctionLibrary` |
| Không kiểm tra tracking confidence | Tay nhảy một frame → app hiểu nhầm thành thao tác cố ý | §7.8 |
| Thiết kế vùng grab cho tay trần bằng kích thước của controller | Hụt liên tục | Nới rộng vùng chạm — §7.8 |
| Bắt giữ cử chỉ lâu | Mỏi tay rất nhanh (gorilla arm) | Thao tác xong trong 1-2 giây |
| **Actor neo thiếu component `OculusXRSpatialAnchor`** | **Anchor nạp lại spawn ở (0,0,0)** | ⚠️ Tốn nhiều giờ nhất chương. Kiểm tra logcat — §7.9 |
| Chỉ kiểm tra result code tức thời, bỏ result trong delegate | Tưởng thành công trong khi thao tác đã fail | §7.9 |
| Không lưu UUID xuống đĩa ngay sau khi save | Mất anchor khi app bị kill | ✅ Không có sự kiện thoát app đáng tin — §7.9 |
| Cache transform của anchor rồi dùng mãi | Vật lệch dần khi anchor trôi | ✅ Đọc lại mỗi lần dùng — §7.9 |

## 7.11 Bài tập và checklist

**Bài tập 1.** Bật passthrough, không có gì khác. Deploy. Chỉ cần thấy phòng thật là đạt. Nếu thấy màn đen, đi qua danh sách §7.2 từng dòng một — đây là bài tập chẩn đoán.

**Bài tập 2.** Nạp Scene, spawn một khối hộp **có nhìn thấy được** ở mỗi anchor. Xác nhận vị trí tường/sàn/bàn khớp thực tế. Sau đó mới chuyển sang vô hình. Làm ngược lại (vô hình trước) thì bạn không biết dữ liệu có đúng không.

**Bài tập 3.** Lưu phòng đã quét thành JSON, xoá dữ liệu scene, nạp lại từ JSON. Xác nhận kết quả giống nhau. Đây là hạ tầng test của bạn cho mọi việc MR về sau.

**Bài tập 4.** Ném một quả bóng vật lý vào tường thật. Nó phải nảy. Nếu xuyên qua, kiểm tra collision proxy.

**Bài tập 5.** Từ chối quyền khi được hỏi. App phải vào chế độ phòng ảo với thông báo rõ ràng, không treo.

**Bài tập 6 (hand tracking).** Bật *Controllers and Hands*, thêm `UOculusXRHandComponent` vào pawn. Deploy, đặt controller xuống, dùng tay trần. Xác nhận: tay hiện ra, controller ẩn đi, và **tay tự biến mất khi bạn đưa ra sau lưng**. Sau đó thử nắm một vật đã làm ở Chương 5 bằng tay trần — ghi lại chỗ nào khó chịu so với dùng controller.

**Bài tập 7 (hand tracking).** In tracking confidence ra màn hình debug. Thử che một tay bằng tay kia, đưa tay ra rìa tầm nhìn, vẫy nhanh. Ghi lại confidence tụt trong tình huống nào. Đây là cơ sở để bạn quyết định ngưỡng chặn thao tác.

**Bài tập 8 (anchor).** Đặt một vật, tạo anchor, lưu UUID bằng SaveGame. **Đóng hẳn app, mở lại.** Vật phải ở đúng chỗ cũ. Nếu nó ở (0,0,0), chạy `adb logcat` và tìm chuỗi `XR_ERROR_SPACE_COMPONENT_NOT_ENABLED_FB` — bài này cố ý dẫn bạn tới cái bẫy đó.

**Bài tập 9 (anchor).** Đặt 3 anchor, xoá 1, khởi động lại app. Xác nhận còn đúng 2 — và SaveGame của bạn cũng phải còn đúng 2 UUID, không phải 3. Đồng bộ giữa headset và SaveGame là chỗ hay lệch.

**Checklist cổng ra (trên device):**

- [ ] Thấy phòng thật qua passthrough
- [ ] Vật ảo hiển thị đúng, nền trong suốt
- [ ] Scene nạp được, anchor khớp vị trí thật
- [ ] Bóng nảy vào tường thật
- [ ] Collision proxy vô hình, không đổ bóng
- [ ] Nạp lại scene không sinh proxy trùng
- [ ] Từ chối quyền → chế độ fallback, có thông báo
- [ ] Chưa quét phòng → hướng dẫn Space Setup
- [ ] Lưu/nạp JSON phòng hoạt động
- [ ] Tay trần hiện ra, controller ẩn khi đặt xuống, tay tự ẩn khi mất tracking
- [ ] Nắm được vật bằng tay trần, có phản hồi thị giác và âm thanh thay cho rung
- [ ] Anchor sống sót qua việc đóng và mở lại app
- [ ] Xoá anchor đồng bộ được với SaveGame
- [ ] Vẫn ≥72 fps với passthrough bật (passthrough tốn thêm — đo lại)

---
---

# Chương 8 — Chuyển cảnh XR-safe và async có watchdog

## 8.1 Vì sao chuyển cảnh trong VR khó hơn bạn nghĩ

Ở game màn phẳng, chuyển cảnh là: fade đen, load, fade vào. Vài dòng code.

Trong VR có ba thứ làm nó khó:

1. **`StartCameraFade` không hoạt động** với cấu hình của chúng ta
2. **Người dùng vẫn đang đeo headset** trong lúc load — họ không nhìn vào màn hình loading, họ đang ở *trong* nó
3. **Màn hình đen bất động là trải nghiệm tệ trong VR.** Không có gì phản ứng với cử động đầu → não báo động

## 8.2 Vì sao `StartCameraFade` chết

`APlayerCameraManager::StartCameraFade` được cài đặt qua post-process. Với `r.MobileHDR=False` (§3.7), pipeline post-process thông thường không chạy → fade không có tác dụng.

⚠️ Đây là suy luận từ cơ chế, và nó khớp với quan sát từ dự án thật. ❓ Tôi không tìm được tài liệu chính thức xác nhận riêng cho 5.6. Nhưng dù nguyên nhân là gì, hành vi quan sát được là nhất quán: **fade không ăn.**

Và kể cả nếu nó ăn, nó vẫn không đủ — vì post-process không chạm tới compositor layer (§2.6). Menu stereo layer của bạn sẽ vẫn sáng rực trong lúc cả thế giới tối đi.

## 8.3 Cách fade đúng trên Quest

✅ Dùng `SetColorScaleAndOffset` của Meta XR. Công thức: **pixel mới = pixel cũ × ColorScale + ColorOffset**. Có Blueprint node tên **Set Color Scale and Offset** ([nguồn](https://developer.oculus.com/documentation/unreal/unreal-blueprints-set-color-scale-and-offset/)).

```cpp
UOculusXRFunctionLibrary::SetColorScaleAndOffset(
    FLinearColor(Alpha, Alpha, Alpha, 1.f),   // ColorScale: 1 = bình thường, 0 = đen
    FLinearColor::Black,                      // ColorOffset
    /*bApplyToAllLayers=*/ true);             // fade CẢ compositor layer
```

**Hai điều quyết định, phải nhớ:**

✅ **(1) Trên mobile/Quest, Color Offset KHÔNG được hỗ trợ — chỉ dùng Color Scale.** Nghĩa là bạn fade bằng cách kéo ColorScale về 0, không phải bằng cách cộng offset. Nếu bạn viết logic fade dựa vào offset, nó sẽ chạy trên PC-VR và không chạy trên Quest.

✅ **(2) `bApplyToAllLayers = true` là thứ làm nó đúng.** Không có nó, compositor layer (menu, passthrough) không bị fade — bạn sẽ có màn hình đen với một cái menu sáng lơ lửng.

⚠️ Một số node liên quan cần bật Meta XR Platform plugin qua **Edit → Plugins → Online Platform**. ❓ Signature chính xác ở v83 cần kiểm chứng — tra header hoặc dùng Blueprint node.

## 8.4 Một subsystem quản lý chuyển cảnh

Đừng rải logic fade khắp nơi. Gom vào một chỗ.

```cpp
// XRTransitionSubsystem.h
UCLASS()
class YOURPROJECT_API UXRTransitionSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()
public:
    /** Fade ra → chạy Action → fade vào */
    UFUNCTION(BlueprintCallable, Category="XR|Transition")
    void FadeAndDo(float FadeOutSeconds, float FadeInSeconds,
                   const FSimpleDelegate& Action);

    UFUNCTION(BlueprintCallable, Category="XR|Transition")
    void TravelToLevel(FName LevelName);

    /** 1 = sáng bình thường, 0 = đen hoàn toàn */
    void SetFadeAlpha(float Alpha);

private:
    void TickFade();
    void OnLoadTimeout();

    float CurrentAlpha  = 1.f;
    float TargetAlpha   = 1.f;
    float FadeSpeed     = 1.f;

    FTimerHandle FadeTimerHandle;
    FTimerHandle WatchdogHandle;

    /** Quá thời gian này coi như load hỏng */
    static constexpr float LoadTimeoutSeconds = 20.f;
};
```

```cpp
// XRTransitionSubsystem.cpp
void UXRTransitionSubsystem::SetFadeAlpha(float Alpha)
{
    CurrentAlpha = FMath::Clamp(Alpha, 0.f, 1.f);

    UOculusXRFunctionLibrary::SetColorScaleAndOffset(
        FLinearColor(CurrentAlpha, CurrentAlpha, CurrentAlpha, 1.f),
        FLinearColor::Black,
        /*bApplyToAllLayers=*/ true);
}

void UXRTransitionSubsystem::TravelToLevel(FName LevelName)
{
    // Watchdog: nếu load không xong trong LoadTimeoutSeconds thì cứu người dùng
    GetWorld()->GetTimerManager().SetTimer(
        WatchdogHandle, this, &UXRTransitionSubsystem::OnLoadTimeout,
        LoadTimeoutSeconds, /*bLoop=*/false);

    FSimpleDelegate Action;
    Action.BindLambda([this, LevelName]()
    {
        UGameplayStatics::OpenLevel(this, LevelName);
    });

    FadeAndDo(/*Out=*/0.4f, /*In=*/0.6f, Action);
}

void UXRTransitionSubsystem::OnLoadTimeout()
{
    // KHÔNG bao giờ để người dùng kẹt trong màn đen vô hạn
    UE_LOG(LogTemp, Error, TEXT("Level load quá %.0f giây — khôi phục"), LoadTimeoutSeconds);

    SetFadeAlpha(1.f);                       // sáng lại
    ShowErrorMessageInVR(TEXT("Không tải được cảnh. Quay lại menu chính."));
    // và quay về một cảnh đã biết là an toàn
}
```

**Watchdog là phần quan trọng nhất của đoạn code này, và cũng là phần hay bị bỏ.**

Trong game màn phẳng, load treo thì người dùng thấy màn hình đứng, thở dài, và tắt game. Trong VR, load treo nghĩa là **người dùng bị nhốt trong một khoảng đen không phản hồi trong khi vẫn đeo một thiết bị trên mặt**. Đó là trải nghiệm gây hoảng ở mức độ khác hẳn. Watchdog không phải tính năng — nó là an toàn cơ bản.

## 8.5 Level streaming bất đồng bộ

Với cảnh lớn, `OpenLevel` gây khựng dài. Dùng streaming bất đồng bộ để giữ frame rate:

```cpp
FLatentActionInfo LatentInfo;
LatentInfo.CallbackTarget = this;
LatentInfo.ExecutionFunction = FName("OnSubLevelLoaded");
LatentInfo.Linkage = 0;
LatentInfo.UUID = __LINE__;

UGameplayStatics::LoadStreamLevel(
    this, LevelName, /*bMakeVisibleAfterLoad=*/true,
    /*bShouldBlockOnLoad=*/false,     // QUAN TRỌNG: false, nếu không sẽ khựng
    LatentInfo);
```

**`bShouldBlockOnLoad=false` là dòng quyết định.** Đặt `true` thì game thread đứng chờ, frame tụt về 0, và người dùng thấy hình đóng băng — chính là thứ gây say.

Nhưng bất đồng bộ nghĩa là **bạn không biết khi nào nó xong**, nên watchdog ở §8.4 lại càng cần thiết.

## 8.6 Splash screen của OS

✅ **OS Splash Screen** có ở cả hai đường cài đặt (bảng tương thích Meta). Đây là ảnh do hệ điều hành Quest hiển thị trong lúc app khởi động, trước khi engine kịp render frame đầu tiên.

Dùng nó để lấp khoảng trống lúc khởi động — và nó liên quan trực tiếp tới yêu cầu VRC ở §8.7.

⚠️ Nhắc lại từ §1.10: có bản plugin re-port cộng đồng gây trùng dòng splash trong `AndroidManifest`. Nếu build fail ở bước manifest, tắt **Show Launch Image** trong Android settings rồi dùng "Add Splash Image" của Meta XR.

## 8.7 Yêu cầu VRC liên quan

Hai yêu cầu bắt buộc khi submit Store nằm đúng vào phạm vi chương này:

✅ **App phải hiển thị hình head-tracked trong vòng 4 giây, hoặc hiển thị một chỉ báo đang tải ngay trong VR.** Nghĩa là màn hình đen im lặng trong lúc load là **vi phạm quy chuẩn**, không chỉ là trải nghiệm kém.

✅ **App phải thực hiện kiểm tra entitlement của nền tảng trong vòng 10 giây kể từ khi khởi động** (`VRC.Quest.Security.1`).

Chi tiết đầy đủ ở §10.4.

## 8.8 Bẫy của chương này

| Bẫy | Triệu chứng | Ghi chú |
|---|---|---|
| Dùng `StartCameraFade` | Không có tác dụng gì | §8.2 |
| Fade bằng ColorOffset | Chạy trên PC-VR, không chạy trên Quest | ✅ Mobile không hỗ trợ offset |
| Quên `bApplyToAllLayers=true` | Màn đen nhưng menu vẫn sáng | ✅ |
| `bShouldBlockOnLoad=true` | Hình đóng băng, gây say | §8.5 |
| Không có watchdog | Người dùng kẹt trong màn đen vô hạn | §8.4 — nghiêm trọng |
| Teleport không fade | Giật hình, dễ gây say | §4.7 |
| Màn hình đen im lặng khi load | ✅ Vi phạm VRC | §8.7 |
| Fade quá chậm | Người dùng tưởng app treo | 0,3-0,6 giây là đủ |

## 8.9 Bài tập và checklist

**Bài tập 1.** Cài `UXRTransitionSubsystem`, dùng nó cho teleport ở §4.7. So sánh cảm giác teleport có fade và không fade trên device.

**Bài tập 2.** Mở một menu stereo layer rồi fade. Xác nhận menu **cũng** tối đi. Sau đó đổi `bApplyToAllLayers` thành `false` và xem lại — đây là cách nhanh nhất để hiểu vì sao tham số đó tồn tại.

**Bài tập 3.** Cố tình làm watchdog kích hoạt: đặt `LoadTimeoutSeconds = 0.1f` rồi load một cảnh. Xác nhận app khôi phục được và có thông báo, không treo.

**Bài tập 4.** Đo thời gian từ lúc bấm chạy app tới lúc thấy hình head-tracked đầu tiên. Nếu >4 giây, thêm splash hoặc chỉ báo tải trong VR.

**Checklist cổng ra (trên device):**

- [ ] Fade ra/vào mượt, không giật
- [ ] Compositor layer cũng bị fade
- [ ] Teleport có fade
- [ ] Chuyển cảnh không làm tụt frame thấy rõ
- [ ] Watchdog kích hoạt được và khôi phục được
- [ ] Không có lúc nào màn hình đen im lặng quá 1 giây mà không có gì phản hồi
- [ ] Hình head-tracked xuất hiện trong 4 giây từ lúc khởi động

---
---

# Chương 9 — Hiệu năng 72 fps và profiling trên device

## 9.1 Nguyên tắc đo

Ba điều kiện, thiếu một là số liệu vô nghĩa:

1. **Trên device thật.** Không phải PIE, không phải Link (§2.3, §3.14)
2. **Build Shipping.** ⚠️ Development build cho số liệu sai và bi quan vì nó mang theo debug overhead
3. **Chạy 25-30 phút liên tục.** ✅ Vì hệ thống tự hạ tần số khi nóng — 5 phút đầu không nói lên điều gì

## 9.2 Bộ công cụ — và thứ tự dùng

Đừng học cả sáu công cụ cùng lúc. Chúng có thứ bậc rõ ràng: mỗi cái trả lời một câu hỏi khác nhau, và bạn chỉ leo lên cấp tiếp theo khi cấp hiện tại không đủ.

| Cấp | Công cụ | Trả lời câu hỏi | Chi phí học |
|---|---|---|---|
| 1 | **OVR Metrics Tool** | *Có tụt frame không?* | 5 phút |
| 2 | **`stat unit`** trong engine | *Nút thắt ở Game, Draw hay GPU?* | 15 phút |
| 3 | **MQDH Performance Analyzer** | *Diễn biến theo thời gian ra sao? Có nóng không?* | 30 phút |
| 4 | **Perfetto qua MQDH** | *Frame nào hụt, và lúc đó CPU/GPU đang làm gì?* | 1-2 giờ |
| 5 | **RenderDoc Meta Fork** | *Draw call nào đắt? Pass nào tốn?* | vài giờ |
| 6 | **Simpleperf / ovrgpuprofiler** | *Hàm C++ nào ăn CPU? Counter GPU nào bão hoà?* | vài giờ |

**Quy tắc: đừng lên cấp 4 khi chưa làm xong cấp 2.** Perfetto cho bạn hàng nghìn điểm dữ liệu; nếu bạn còn chưa biết nút thắt nằm ở CPU hay GPU thì bạn không biết mình đang nhìn cái gì.

### Cấp 1 — OVR Metrics Tool

Overlay hiển thị fps, GPU/CPU level, nhiệt độ **ngay trong headset**, chồng lên app của bạn. Đây là công cụ bạn dùng nhiều nhất trong 6 tuần.

Cài từ MQDH. Gỡ bằng ADB nếu cần. Bật overlay, đeo headset, chơi — con số nằm ngay trước mắt.

### Cấp 2 — `stat` trong engine

Gõ vào console của Unreal (bật console trên device bằng phím tắt hoặc qua Blueprint):

| Lệnh | Cho biết |
|---|---|
| `stat unit` | **Bốn con số quan trọng nhất** — xem §9.3 |
| `stat fps` | fps đơn giản |
| `stat SceneRendering` | Draw call, primitive count |
| `stat RHI` | Trạng thái tài nguyên đồ hoạ |
| `stat GPU` | Chi phí GPU theo từng pass |

### Cấp 3 — MQDH Performance Analyzer

✅ MQDH có **Performance Analyzer**, một bộ theo dõi metric thời gian thực cho headset, với danh sách metric cấu hình được.

Đây là nơi bạn phát hiện thermal throttling (§9.6): chạy 30 phút, nhìn đồ thị, thấy chỗ tần số bị hạ.

### Cấp 4 — Perfetto: phần có một cái bẫy lớn cho Unreal

✅ Perfetto là công cụ trace hệ thống, thay thế cho Systrace, hỗ trợ nhiều loại sự kiện hơn, trace dài hơn, và có counter. Nó cho bạn thấy **CPU và GPU đang làm gì trên cùng một dòng thời gian**, nên rất hợp để trả lời "frame này hụt vì CPU hay vì GPU".

**Cách chạy:** trong MQDH, mục **Trace Analysis by Perfetto** (nằm phía trên khung Flags), hoặc từ Device Manager → Device Actions. Bấm ghi, chơi, bấm dừng — MQDH tự mở trace trên trang Perfetto trong trình duyệt.

> ⚠️ **BẪY QUAN TRỌNG CHO NGƯỜI DÙNG UNREAL — phải làm, không phải tuỳ chọn:**
>
> ✅ Meta ghi rõ: các engine thương mại như Unity và **Unreal Engine chỉ phát ra instrumentation kiểu ATrace**. Nghĩa là nếu bạn không cấu hình đúng, trace của bạn sẽ **không chứa dữ liệu của app Unreal** — bạn được một trace đầy hoạt động hệ thống mà không có gì của mình.
>
> Cách sửa: bấm dấu **`...`** cạnh *Trace Analysis by Perfetto* → **Perfetto settings** → điền **ATrace Categories** và **ATrace Apps**.
>
> Đây gần như chắc chắn là lý do lần đầu bạn chạy Perfetto và thấy "chẳng có gì hữu ích".

Hai mẹo vận hành:

- ✅ Trace được lưu ở **Settings → Recorded Traces** với **tên file mặc định giống nhau**. **Đổi tên ngay sau khi ghi**, nếu không sau ba lần trace bạn sẽ không biết cái nào là cái nào. Trace cũng nằm trong File Manager → MQDH Files → Perfetto
- ✅ Có thể bật **callstack sampling** trong hộp thoại Perfetto settings để có flame graph — nhưng chỉ bật khi bạn thật sự cần, vì nó làm trace nặng hơn nhiều

### Cấp 5-6 — khi cần đào sâu

| Công cụ | Dùng khi |
|---|---|
| ✅ **RenderDoc Meta Fork** | Cần dữ liệu GPU cấp thấp. Bản fork của Meta có thêm thông tin từ **tile renderer** của chip Snapdragon XR2 Gen 2 trên Quest 3 — bản RenderDoc gốc không có |
| ✅ **Simpleperf** | Công cụ dòng lệnh của Android, lấy mẫu app theo tần số để biết CPU tốn thời gian ở đâu |
| ✅ **ovrgpuprofiler** | Công cụ dòng lệnh **có sẵn ngay trên headset Quest**, truy cập metric thời gian thực và dữ liệu profiling GPU |

⚠️ Nhắc lại từ Chương 1: **Additional Perfetto Markers là tính năng fork-only.** Đi Đường A thì Perfetto vẫn dùng được, chỉ là ít marker chi tiết hơn.

### Một sample rất đáng đọc

✅ Meta có sample **Performance Settings for Unreal Engine** — một UI ngay trong VR để chỉnh và test render quality, frame rate, mức CPU/GPU, ASW và FFR lúc runtime. Nó còn có sẵn CPU stress tester và GPU stress tester.

Giá trị lớn nhất với người học: nó cho bạn **cảm nhận trực tiếp** mỗi núm vặn đổi cái gì, ngay trong headset, mà không phải build lại. Đọc code của nó cũng cho bạn mẫu C++ chuẩn để chỉnh các thiết lập này lúc runtime.

## 9.3 Đọc `stat unit` — tìm nút thắt

`stat unit` cho bốn con số. Cái **lớn nhất** là nút thắt của bạn.

| Dòng | Nghĩa | Nếu nó lớn nhất |
|---|---|---|
| **Frame** | Tổng thời gian một frame | Tổng hợp — nhìn ba dòng dưới |
| **Game** | Game thread (logic, tick, Blueprint) | Quá nhiều tick, Blueprint nặng, AI, physics |
| **Draw** | Render thread (chuẩn bị lệnh vẽ) | Quá nhiều draw call, quá nhiều actor hiển thị |
| **GPU** | GPU thực thi | Overdraw, shader nặng, độ phân giải cao, quá nhiều đèn |

**Đây là bước đầu tiên của mọi việc tối ưu.** Tối ưu shader khi nút thắt nằm ở game thread là lãng phí thời gian — và người mới làm điều này rất thường xuyên.

Với ngân sách 13,8 ms (§2.2), một cách chia thô: game ≤6 ms, draw ≤6 ms, GPU ≤11 ms. ⚠️ Đây là con số kinh nghiệm để định hướng, không phải chỉ tiêu chính thức của Meta.

## 9.4 Thứ tự vặn núm

Nhắc lại từ §3.10, giờ có lý do đầy đủ:

| # | Núm | Chi phí sửa | Được gì |
|---|---|---|---|
| 1 | `r.ScreenPercentage` 130 → 110 → 100 | 1 phút, revert ngay | Rất nhiều GPU |
| 2 | FFR level ↑, ưu tiên dynamic | 1 phút | GPU ở vùng ngoại vi, gần như miễn phí về thị giác |
| 3 | `r.MobileMSAA` 4 → 2 | 1 phút | GPU, đổi lấy răng cưa |
| 4 | Giảm dynamic light, shadow cascade | 10 phút | GPU + draw |
| 5 | ❓ Thử `xr.MobileLDRDynamicResolution` | 10 phút, cần đo riêng | Có thể xung đột với FFR — §3.9 |
| 6 | Giảm actor hiển thị, gộp mesh, cull xa hơn | Hàng giờ | Draw call |
| 7 | Sửa asset: giảm tri, giảm texture, đơn giản material | Hàng ngày | Tất cả |

**Luôn vặn từ trên xuống.** Lý do rất thực dụng: 1-5 là đổi config, mất vài phút và revert được. 6-7 mất hàng giờ tới hàng ngày và khó revert. Rất nhiều người mới nhảy thẳng xuống 7 rồi phát hiện vấn đề thật ra ở 1.

**Và luôn đổi một thứ mỗi lần, đo lại sau mỗi lần.** Đổi bốn thứ rồi thấy nhanh hơn thì bạn không biết thứ nào có tác dụng — và có thể ba trong bốn thứ đó bạn đang trả giá vô ích.

## 9.5 Ngân sách hình học

✅ Meta đưa ra: tối đa khoảng **500-1.000 draw call** và **1-2 triệu triangle/vertex** mỗi frame ([nguồn](https://developers.meta.com/horizon/documentation/native/pc/dg-performance-guidelines/)).

⚠️ Nhắc lại cảnh báo từ §2.4: đây là hướng dẫn chung cho dòng Quest, gốc từ thời Quest 2. Quest 3 khoẻ hơn. ❓ Meta chưa công bố ngưỡng riêng cho Quest 3.

Đo draw call: `stat SceneRendering` trên device.

## 9.6 Nhiệt — biến số bị bỏ quên

✅ Khi gặp sự cố nhiệt, hệ thống tự hạ về 72 Hz, rồi hạ tiếp bằng cách tăng minVsyncs lên 2 ([nguồn](https://developers.meta.com/horizon/documentation/unreal/unreal-change-display-refresh-rate/)).

Hệ quả cho quy trình test:

- Test hiệu năng **luôn** là 25-30 phút, không phải 5 phút
- Ghi lại fps ở phút 5, phút 15, phút 25 — ba con số, không phải một
- Nếu fps tụt sau phút 15 mà nội dung không đổi, đó là nhiệt, không phải logic

## 9.7 Thủ phạm thường gặp

| Thủ phạm | Vì sao đắt trên Quest | Cách phát hiện |
|---|---|---|
| **Translucency / overdraw** | Mobile GPU rất ghét vẽ chồng nhiều lớp trong suốt | `stat GPU`, hoặc tắt hết vật trong suốt để so |
| **Dynamic light** | Mỗi đèn động thêm chi phí đáng kể | Đếm số đèn không static |
| **Dynamic shadow** | Rất đắt trên mobile | `r.Shadow.CSM.MaxCascades=1` (§3.9) |
| **Skeletal mesh** | Skinning tốn CPU | Đếm số skeletal mesh đang hiển thị |
| **Tick mỗi frame** | Nhiều actor tick vô ích | `stat Game`, tắt tick cho actor tĩnh |
| **Widget tick** | Widget phức tạp tick mỗi frame rất tốn | Tắt hiển thị widget để so |
| **Thiếu PSO cache** | Khựng lúc gặp material mới | Chạy lần 2 hết khựng → đúng là PSO (§3.13) |
| **Quá nhiều actor riêng lẻ** | Mỗi cái một draw call | `stat SceneRendering` |

## 9.8 Bảng chẩn đoán: triệu chứng → nguyên nhân

| Triệu chứng | Nghi ngờ đầu tiên |
|---|---|
| Khựng một nhịp khi gặp vật/material mới, lần 2 hết | Thiếu PSO cache — §3.13 |
| Fps tốt lúc đầu, tụt dần sau 15 phút | Nhiệt — §9.6 |
| Fps tụt khi nhìn về một hướng cụ thể | Quá nhiều vật hiển thị ở hướng đó; overdraw |
| Fps tụt khi mở menu | Widget tick, hoặc quá nhiều stereo layer — §6.9 |
| `Game` cao, `GPU` thấp | Logic/tick/Blueprint — không phải vấn đề đồ hoạ |
| `Draw` cao | Quá nhiều draw call — gộp mesh, cull |
| `GPU` cao | Overdraw, shader, độ phân giải — vặn núm 1-3 |
| Fps ổn nhưng cảm giác vẫn giật | Frame time không đều, hoặc thiếu ổn định — nhìn `stat unit` theo thời gian, không nhìn trung bình |
| Fps tốt trên Link, tệ trên device | Bình thường — Link chạy trên GPU của PC (§3.14) |

## 9.9 Bài tập

**Bài tập 1 (bài tập chẩn đoán).** Cố tình phá hiệu năng theo **ba cách khác nhau**: (a) thêm 200 actor có tick, (b) thêm 8 dynamic light có bóng đổ, (c) đặt `r.ScreenPercentage=200`. Với mỗi cách, dùng `stat unit` **đoán trước** nút thắt sẽ nằm ở đâu, rồi đo và kiểm chứng. Đây là bài tập giá trị nhất chương.

**Bài tập 2.** Chạy app 30 phút liên tục, ghi fps ở phút 5, 15, 25. Vẽ ra thành ba con số. Nếu có tụt, tìm hiểu tụt ở đâu.

**Bài tập 3.** Cho `r.ScreenPercentage` chạy 100 / 110 / 130 / 150. Ghi fps và cảm nhận độ nét ở mỗi mức. Tìm điểm mà bạn không còn thấy khác biệt về độ nét nữa — đó là mức nên dùng.

**Bài tập 4.** Đo cùng một cảnh ở Development build và Shipping build. Ghi lại chênh lệch. Con số đó là lý do §9.1 yêu cầu Shipping.

**Bài tập 5 (Perfetto).** Chạy một trace Perfetto **mà không** cấu hình ATrace. Nhìn kết quả. Sau đó cấu hình ATrace Categories và ATrace Apps rồi chạy lại. So sánh hai trace. Bài này dạy bạn nhận ra một trace vô dụng — kỹ năng đó tiết kiệm nhiều giờ về sau.

**Bài tập 6 (Perfetto).** Trong trace đã cấu hình đúng, tìm một frame bị hụt. Xác định lúc đó CPU hay GPU đang là bên chặn. Đối chiếu kết luận với `stat unit` — hai công cụ phải cho cùng câu trả lời. Nếu khác nhau, một trong hai phép đo của bạn sai.

**Checklist cổng ra:**

- [ ] ≥72 fps ổn định trong 30 phút liên tục, Shipping build
- [ ] Biết nút thắt của mình nằm ở Game / Draw / GPU
- [ ] Draw call và triangle count đã đo, có con số cụ thể
- [ ] Chạy lần 2 không còn khựng → PSO cache hoạt động
- [ ] Có bảng ghi fps ở phút 5/15/25
- [ ] Ghi lại được: đã vặn núm nào, được bao nhiêu ms

---
---

# Chương 10 — Văn hoá tài liệu, bàn giao và VRC

## 10.1 Vì sao chương này tồn tại

Vì chính tài liệu bạn đang đọc.

Tài liệu này được xây trên một tài liệu nội bộ tổng hợp từ hai dự án VR thật. Tài liệu đó tốt — nhưng khi rà lại sau khoảng một năm, có **11 mục** đã sai, đã lỗi thời, hoặc thiếu cơ sở (Phụ lục B). Không phải vì người viết cẩu thả. Vì thế giới đổi: Meta đổi yêu cầu API level, Epic đổi API, Meta đổi cách phân phối plugin.

**Bài học không phải "hãy viết tài liệu tốt hơn". Bài học là: hãy viết tài liệu theo cách để người sau biết chỗ nào cần kiểm tra lại.**

## 10.2 Bốn quy tắc

### (1) Ghi ngày và ghi phiên bản, ở ngay đầu

```markdown
Ngày: 2026-08-19
Engine: UE 5.6.1
Meta XR: v83 (Đường A — Epic build + plugin)
Thiết bị: Quest 3, Horizon OS <bản>
```

Không có khối này, người đọc sau **không có cách nào** biết tài liệu còn dùng được không. Đây là chi phí 30 giây và giá trị hàng giờ.

Ví dụ cụ thể: dòng `TargetSDKVersion=32` đúng khi viết, sai từ 1/3/2026 (§3.4). Nếu có ngày tháng, người đọc biết ngay là cần kiểm tra. Không có, họ copy nguyên và mất một buổi.

### (2) Phân biệt ba mức tin cậy — trong tài liệu của chính bạn

Dùng đúng hệ thống ✅ / ⚠️ / ❓ của tài liệu này. Điều quan trọng nhất: **đừng viết phỏng đoán bằng giọng khẳng định.**

Ví dụ có thật, mục `r.AllowOcclusionQueries` (§3.9): tài liệu gốc viết như thể quan hệ nhân quả đã rõ. Khi rà lại thì không có cơ sở nào cho cơ chế đó. Cảnh báo vẫn có giá trị — nhưng đáng lẽ nó phải được ghi là *"đã quan sát thấy, chưa rõ nguyên nhân"*. Ghi như vậy thì người sau biết đây là chỗ cần điều tra thay vì tin và đi tiếp.

### (3) Ghi "vì sao", không chỉ "làm gì"

```ini
; Kém:
r.Mobile.SceneColorFormat=4

; Tốt:
; Bắt buộc khi dùng passthrough: format mặc định PF_FloatR11G11B10 không có
; kênh alpha, mà blend passthrough cần alpha. Thiếu dòng này thì passthrough
; blend sai và triệu chứng rất khó truy nguyên.
; Nguồn: Meta — Get Started with Passthrough. Kiểm chứng: 2026-08-19
r.Mobile.SceneColorFormat=4
```

Dòng không có "vì sao" là dòng mà sáu tháng sau **không ai dám xoá** — kể cả khi nó đã thừa. Config của các dự án lâu năm phình lên chính vì lý do này.

### (4) Sổ tay bẫy

**Quy tắc: mất hơn 1 giờ vì một lỗi → ghi lại ngay, trước khi quên.**

Mẫu ghi:

```markdown
## [Ngày] Triệu chứng ngắn gọn
- Môi trường: UE 5.6.1, Meta XR v83, Quest 3
- Triệu chứng: (cái bạn thấy, không phải cái bạn đoán)
- Nguyên nhân: (nếu tìm ra) / CHƯA RÕ
- Cách xử lý:
- Mức tin cậy: ✅/⚠️/❓
- Mất bao lâu:
```

Sau sáu tháng, sổ tay này đáng giá hơn phần lớn tài liệu chính thức, vì nó chứa đúng những thứ mà tài liệu chính thức không viết. Phụ lục A của tài liệu này chính là một sổ tay như vậy.

## 10.3 Checklist bàn giao dự án VR

Khi bàn giao cho người khác — hoặc cho chính bạn sáu tháng sau:

**Hạ tầng**
- [ ] Phiên bản engine chính xác, và Đường A hay B
- [ ] Phiên bản Meta XR plugin và tag lấy từ đâu
- [ ] Phiên bản Android SDK/NDK/JDK
- [ ] Các bước setup ngoài repo (biến môi trường, tài khoản cần có)

**Project**
- [ ] Vì sao mỗi setting bất thường trong `Config/` lại như vậy
- [ ] Map khởi động, GameMode, Pawn mặc định
- [ ] Quy trình build và deploy, từng bước
- [ ] Quy trình tạo PSO cache

**Kiến thức**
- [ ] Sổ tay bẫy
- [ ] Những chỗ đã thử và **không** dùng được, kèm lý do (quan trọng ngang với những chỗ dùng được)
- [ ] Số liệu hiệu năng hiện tại: fps, draw call, đo trên thiết bị nào, build gì
- [ ] Danh sách ❓ chưa kiểm chứng

**Bảo mật**
- [ ] Secret nằm ở đâu (không nằm trong repo)
- [ ] Keystore ký app nằm ở đâu, ai giữ
- [ ] Đã kiểm tra chưa có token nào lọt vào lịch sử git

## 10.4 VRC — quy chuẩn để submit lên Horizon Store

✅ App muốn lên Horizon Store phải qua bộ Virtual Reality Check. Những mục hay dính nhất:

| Mục | Yêu cầu |
|---|---|
| **Entitlement** | Kiểm tra entitlement của nền tảng **trong vòng 10 giây** kể từ khi khởi động (`VRC.Quest.Security.1`) |
| **Khởi động** | Hình head-tracked trong **4 giây**, hoặc chỉ báo đang tải hiển thị trong VR |
| **Framerate** | Giữ framerate mục tiêu của headset; app tương tác **tối thiểu 72 FPS** |
| **Đóng gói** | APK ký **signature scheme v2**, build **64-bit**, **<1 GB** (expansion file <4 GB) |
| **Quyền** | Xin **số quyền tối thiểu** cần thiết (`VRC.Quest.Security.2`) |
| **Phần cứng** | Không dùng tính năng Quest không có (telephony, GPS chính xác) |
| **Play mode** | Sitting/standing/roomscale phải **khớp metadata** đã khai (`VRC.Quest.Tracking.1`) |

✅ **Những lỗi bị từ chối phổ biến nhất:** asset/cover art (thừa chữ hoặc tagline — `VRC.Quest.Asset.2`), play mode không khớp, thiếu entitlement check, và chưa hoàn tất Data Use Checkup.

✅ Meta khuyến nghị submit **trước ngày dự định ra mắt ít nhất 2 tuần**.

> Nói với trainee: **những mục này không phải thủ tục hành chính.** Entitlement check là chống sao chép. 4 giây head-tracked là chống buồn nôn. 72 FPS là chống buồn nôn. Quyền tối thiểu là quyền riêng tư. Mỗi mục đều có lý do, và biết lý do thì bạn nhớ được mà không cần tra bảng.

## 10.5 Bài tập cuối khoá

**Bài tập 1.** Viết tài liệu bàn giao cho chính project bạn đã làm suốt 6 tuần, theo checklist §10.3. Không quá 3 trang.

**Bài tập 2.** Rà lại sổ tay bẫy của bạn. Với mỗi mục, gắn nhãn ✅/⚠️/❓. Đếm xem có bao nhiêu mục ❓ — đó là danh sách việc chưa xong của bạn.

**Bài tập 3 (bài tập quan trọng nhất).** Đọc lại **chính tài liệu này** và tìm ít nhất **ba chỗ bạn cho là sai, lỗi thời, hoặc thiếu cơ sở** — dựa trên những gì bạn đã thực sự đo trên device. Viết ra kèm bằng chứng.

Bài này không phải bài tập lấy lệ. Tài liệu này có hàng chục mục gắn nhãn ⚠️ và ❓ chính là những chỗ tôi biết mình không chắc. Việc bạn kiểm chứng và sửa lại chúng là cách tài liệu này còn sống sau một năm nữa — thay vì trở thành thứ mà người sau bạn phải ngồi rà lại từ đầu, đúng như tôi vừa làm với tài liệu 5.5.

---
---

# Phụ lục A — Sổ tay bẫy thực địa

Phần lớn các mục dưới đây đến từ hai dự án VR/MR thật chạy trên UE 5.5 + Quest 3, đã được ẩn danh và đối chiếu lại với tài liệu 5.6. Đây là loại kiến thức không có trong tutorial, vì nó chỉ xuất hiện khi bạn ship thật.

Cột **Mức** dùng hệ thống ✅ / ⚠️ / ❓ ở đầu tài liệu.

## A.1 Bẫy hạ tầng

| # | Bẫy | Triệu chứng | Xử lý | Mức |
|---|---|---|---|---|
| 1 | Cáp USB chỉ sạc | `adb devices` trống | Đổi cáp data | ✅ |
| 2 | Chưa bấm link xác nhận trong email GitHub | Repo Meta trả 404 | §0.3(c) | ✅ |
| 3 | Tải plugin từ nút Download của Meta cho project 5.6 | Plugin cho 5.7.4, không khớp | Lấy từ tag fork | ✅ |
| 4 | Tải zip từ nút Code ở trang chủ repo | Được branch chứ không phải tag | Vào đúng trang tag | ✅ |
| 5 | Bật đồng thời Meta XR và OculusVR cũ | Xung đột, hành vi lạ | Tắt OculusVR (deprecated) | ✅ |
| 6 | Trùng dòng splash trong `AndroidManifest` (bản re-port cộng đồng) | Build fail ở bước manifest | Tắt Show Launch Image, dùng Add Splash Image của Meta XR | ⚠️ |
| 7 | Tự cài NDK sai version | Build fail, thông báo khó hiểu | Dùng Turnkey; NDK 25.1.8937393 | ✅ |
| 8 | `TargetSDKVersion=32` cho app tạo mới | Không submit được Store | Đổi 34 | ✅ |

## A.2 Bẫy cấu hình và render

| # | Bẫy | Triệu chứng | Xử lý | Mức |
|---|---|---|---|---|
| 9 | Bật Lumen / VSM / RayTracing | Sụp fps, phình shader | Tắt hết (§3.9) | ✅ |
| 10 | Quên `r.Mobile.SceneColorFormat=4` khi làm passthrough | Passthrough blend sai | Thêm dòng đó | ✅ |
| 11 | Không khoá tần số hiển thị | Runtime chọn 90 Hz, ngân sách tụt còn 11,1 ms | Set Display Frequency | ✅ |
| 12 | **Bật Tonemap Subpass** | Toàn màn hình ám vàng; **render target của stereo layer UI đóng băng** — click vẫn ăn nhưng mất hover, animation, swipe | Dự án thật đã phải revert. Nếu cần post-process, test riêng phần UI | ❓ |
| 13 | Bật Mobile HDR trên Quest 3 | Có báo cáo méo/warp hình trên 5.5.4 | Giữ tắt trừ khi có lý do rõ ràng | ⚠️ |
| 14 | Tin `r.MobileHDR=False` là "bắt buộc" | Hiểu sai bản chất đánh đổi | Là khuyến nghị mạnh, không phải bắt buộc (§3.7) | ✅ |
| 15 | `r.AllowOcclusionQueries=0` | Báo cáo: vỡ hover/click của VR widget | **Cơ chế chưa xác định.** Không tắt nếu dùng VR widget; nếu điều tra được, sửa mục này | ❓ |
| 16 | Đo fps ở Development build | Số liệu sai và bi quan | Luôn đo ở Shipping | ⚠️ |
| 17 | Thiếu PSO cache | Khựng mỗi lần gặp material mới; profiler không thấy gì | §3.13 | ✅ |
| 18 | Bấm Fix All trong Project Setup Tool không đọc | Mất phần học giá trị nhất tuần 1 | Đọc từng cảnh báo, xem `git diff` | — |

## A.3 Bẫy tương tác và UI

| # | Bẫy | Triệu chứng | Xử lý | Mức |
|---|---|---|---|---|
| 19 | Quên `SetTrackingOrigin(Floor)` | Chiều cao sai, lùn hoặc lơ lửng | Thêm vào `BeginPlay` | ✅ |
| 20 | Tự set vị trí camera | Không tác dụng | `bLockToHmd` ghi đè; dịch `VROrigin` | ✅ |
| 21 | Không bù `CameraOffset` khi teleport | Đáp lệch chỗ nếu người chơi đã đi bộ thật | §4.7 | ✅ |
| 22 | Tính vận tốc thả từ 1 frame | Vật ném ra với vận tốc vô lý | Trung bình 3-4 frame | ✅ |
| 23 | Quên bật lại physics khi thả | Vật lơ lửng giữa không trung | `SetSimulatePhysics(true)` | ✅ |
| 24 | Dùng post-process outline trên Quest | Không hiện gì | Shell mesh (§5.4) | ✅ |
| 25 | Chỉ dùng stereo layer, không có widget | UI đẹp nhưng không bấm được | Kiến trúc kép (§6.5) | ✅ |
| 26 | Tin vào `bSupportsDepth` trên Đường A | Menu xuyên tường, hoặc mặt phẳng đen đặc | Fork-only. Đừng thiết kế dựa vào nó (§6.4) | ✅ / ⚠️ |
| 27 | Menu `SLT_FaceLocked` | Menu dán mặt, khó chịu | `SLT_WorldLocked` | ✅ |
| 28 | Vượt 16 compositor layer | Layer thứ 17+ im lặng không hiện | Quản lý ngân sách layer | ✅ |
| 29 | Lệch đơn vị `DrawSize` (px) vs `QuadSize` (world) | Layer sai kích thước | Hằng số quy đổi rõ ràng | ✅ |

## A.4 Bẫy MR và chuyển cảnh

| # | Bẫy | Triệu chứng | Xử lý | Mức |
|---|---|---|---|---|
| 30 | Dùng `UOculusXRPassthroughLayerComponent` | API deprecate từ 5.6 | Persistent Passthrough (§7.2) | ✅ |
| 31 | Layer Placement = Overlay | Không chạy, không chạy qua Link | Underlay | ✅ |
| 32 | Giả định passthrough sẵn sàng ở `BeginPlay` | Vài frame đầu sai | Khởi tạo bất đồng bộ | ✅ |
| 33 | Không xử lý nhánh từ chối quyền Scene | App treo / màn đen im lặng | §7.6 | ✅ |
| 34 | Collision proxy quên `SetVisibility(false)` | Phòng thật đầy khối hộp xám | §7.5 | ✅ |
| 35 | Collision proxy quên `SetCastShadow(false)` | Bóng đổ từ vật vô hình | §7.5 | ✅ |
| 36 | Không dọn proxy khi nạp lại scene | Va chạm sai, rò bộ nhớ | `ClearProxies()` | ✅ |
| 37 | Test Space Setup qua Link | Không chạy được | Quét trên device trước | ✅ |
| 38 | Dùng `StartCameraFade` | Không tác dụng khi Mobile HDR tắt | `SetColorScaleAndOffset` (§8.3) | ⚠️ |
| 39 | Fade bằng ColorOffset | Chạy PC-VR, không chạy Quest | Mobile không hỗ trợ offset — chỉ dùng ColorScale | ✅ |
| 40 | Quên `bApplyToAllLayers=true` | Màn đen nhưng menu vẫn sáng | §8.3 | ✅ |
| 41 | `bShouldBlockOnLoad=true` | Hình đóng băng, gây say | Đặt `false` | ✅ |
| 42 | **Không có watchdog cho load** | Người dùng kẹt trong màn đen vô hạn khi đang đeo headset | §8.4 — đây là vấn đề an toàn, không phải tính năng | — |

## A.5 Bẫy về quy trình

| # | Bẫy | Hậu quả | Mức |
|---|---|---|---|
| 43 | Ship với Lumen bật | Một dự án thật đã làm điều này. Hiệu năng trả giá suốt vòng đời dự án | ✅ |
| 44 | Để lại GameMode/map của VR Template | Người mới vào dự án mở nhầm map, tưởng dự án hỏng | ✅ |
| 45 | Commit security token vào `Config/` | Token nằm trong lịch sử git vĩnh viễn. Xoá ở commit sau không xoá được ở commit trước — **phải rotate** | ✅ |
| 46 | Test 5 phút rồi kết luận hiệu năng đạt | Bỏ sót thermal throttling hoàn toàn | ✅ |
| 47 | Code 4 tuần trong PIE rồi mới build | Phát hiện hàng loạt vấn đề cùng lúc, không biết cái nào gây cái nào | — |
| 48 | Đổi nhiều thứ rồi mới đo | Không biết thứ nào có tác dụng, trả giá vô ích cho các thứ còn lại | — |
| 49 | Chạy Perfetto mà không cấu hình ATrace | Trace không chứa dữ liệu app Unreal — tưởng công cụ vô dụng | ✅ Unreal chỉ phát ATrace — §9.2 |
| 50 | Không đổi tên trace ngay sau khi ghi | Ba trace cùng tên mặc định, không biết cái nào là cái nào | ✅ §9.2 |
| 51 | Dùng `EHMDTrackingOrigin::Floor` (tên thời UE4) | Không compile trên UE5 | ✅ Dùng `Stage` — §4.2 |
| 52 | Đặt FFR chỉ bằng `FoveatedRenderingLevel` | FFR không bật | ✅ Cần cả `FoveatedRenderingMethod` — §3.8 |
| 53 | Không đọc `adb logcat` khi debug MR | Bỏ lỡ lỗi tầng OpenXR — chúng không nổi lên log Unreal | §7.9 |
| 54 | `SetRelativeLocation` trên **root** component, tưởng là dịch bên trong actor | Relative của root chính là world — actor bay đi chỗ khác | ✅ §4.2 |
| 55 | `SetStaticMesh` lúc runtime trên `AStaticMeshActor` mobility Static | Fail kèm warning, mesh không đổi | ✅ `SetMobility(Movable)` trước — §7.5 |
| 56 | Quãng đường N frame chia cho dt của 1 frame khi tính vận tốc | Vận tốc thổi phồng N lần — vật ném "như có ma" theo nghĩa ngược lại | §5.2 |

---
---

# Phụ lục B — Đã sửa gì so với tài liệu 5.5

Bảng này để bạn soi lại tôi. Mỗi dòng là một chỗ tài liệu nội bộ gốc (viết cho UE 5.5, tổng hợp từ 2 dự án thật) đã lệch so với thực tế UE 5.6 tháng 8/2026 — hoặc lệch so với tài liệu chính thức.

| # | Tài liệu 5.5 nói | Bản này nói | Vì sao | Mức |
|---|---|---|---|---|
| 1 | `TargetSDKVersion=32` | **34** cho app tạo mới | Từ 1/3/2026, app tạo mới trên Developer Dashboard phải target Android 14 (API 34). `minSdk` vẫn 32 | ✅ |
| 2 | `r.MobileHDR=False` là **bắt buộc** | Khuyến nghị mạnh, không phải bắt buộc | Bảng tương thích Meta liệt kê VR MobileHDR là **được hỗ trợ**. Vẫn nên tắt vì hiệu năng, nhưng phải hiểu đúng bản chất đánh đổi | ✅ |
| 3 | Không phân biệt fork vs Epic build | Trở thành **quyết định hạ tầng số 1** (Chương 1), có bảng tính năng và ngưỡng quyết định | Meta công bố bảng so sánh; hàng loạt tính năng là fork-only. Không biết mình đang ở đường nào thì không giải thích được vì sao một tính năng không chạy | ✅ |
| 4 | Không nói cách lấy plugin cho 5.6 | Cả một chương | Trang Download của Meta nay chỉ phục vụ UE 5.7.4. Người dùng 5.6 buộc phải qua tag fork | ✅ |
| 5 | FFR bằng dòng ini `FoveatedRenderingLevel=HighTop` | Qua Project Settings, có thêm lựa chọn **dynamic** (Meta khuyến nghị dynamic hơn static) | Tài liệu FFR hiện hành của Meta | ✅ |
| 6 | Thiếu `r.Mobile.SceneColorFormat=4` | Bắt buộc nếu dùng passthrough | Format mặc định `PF_FloatR11G11B10` không có alpha, mà blend passthrough cần alpha | ✅ |
| 7 | Dùng passthrough qua component | `UOculusXRPassthroughLayerComponent` **đã deprecate từ 5.6** → Persistent Passthrough | Tài liệu Meta ghi rõ. Đây là thay đổi phá vỡ, và phần lớn tutorial trên mạng chưa cập nhật | ✅ |
| 8 | §6.3 đặt `bSupportsDepth = true` | Không thiết kế dựa vào nó ở Đường A | "Mobile compositor layer depth testing" là **fork-only**. Trên Epic build còn có lịch sử tạo mặt phẳng đen đặc | ✅ / ⚠️ |
| 9 | Thứ tự vặn núm không có dynamic resolution | Thêm `xr.MobileLDRDynamicResolution` như bước thí nghiệm | UE 5.5 đã thêm CVar này cho XR khi Mobile HDR tắt. Nhưng Meta khuyến nghị dynamic FFR hơn, và tương tác giữa hai cái chưa rõ | ✅ nguồn / ❓ tương tác |
| 10 | "`r.AllowOcclusionQueries=0` vỡ hover/click VR widget" — nêu như quan hệ nhân quả | Giữ cảnh báo, **bỏ lời giải thích cơ chế**, ghi là quan sát chưa xác định nguyên nhân | Không tìm được bug report, tài liệu, hay cơ chế nào. Occlusion query thuộc visibility culling, không nằm trên đường trace của widget | ❓ |
| 11 | Ngân sách draw call ~150 | Meta ghi 500-1.000 draw call, 1-2 triệu tri | Con số 150 quá bảo thủ so với hướng dẫn chính thức. Nhưng lưu ý hướng dẫn của Meta là cho dòng Quest nói chung, gốc Quest 2 | ✅ nguồn / ⚠️ áp cho Quest 3 |
| 12 | Không có yêu cầu về thời lượng test | Thêm quy tắc test 25-30 phút | Hệ thống tự hạ 72 Hz rồi tăng minVsyncs khi gặp sự cố nhiệt. Test 5 phút không phát hiện được | ✅ |
| 13 | Không đề cập PSO Precaching | Ghi nhận là hướng mới ở 5.6, song song bundled cache | Epic đang đẩy `r.PSOPrecaching`. Cấu hình tối ưu khi dùng cả hai trên Quest chưa rõ | ⚠️ |
| 14 | Không nhắc ETFR không dùng được trên Quest 3 | Nêu rõ | ETFR cần eye tracking; Quest 3 không có. Nếu không nói, người đọc sẽ tưởng đây là lý do đi Đường B | ✅ |
| 15 | Không nhắc ASW không có đường thay thế ở 5.6 | Nêu rõ | `xr.OpenXRFrameSynthesis` chỉ có **từ UE 5.7**. Khoá 5.6 nghĩa là ASW chỉ còn đường fork | ✅ |
| 16 | Mesh controller gắn trực tiếp vào MotionController | Dùng `XRDeviceVisualization` component (plugin **XRBase**) | Cách UE4 đã lỗi thời; UE5 và VR Template dùng component riêng | ✅ |
| 17 | FFR chỉ có `FoveatedRenderingLevel` | **Phải có cả `FoveatedRenderingMethod=FixedFoveatedRendering`** | Xác nhận từ sample chính thức của Meta. Thiếu dòng method thì FFR không bật — có thể đây là lý do FFR "không ăn" trong dự án cũ | ✅ |
| 18 | Không nhắc Deferred cần Mobile HDR | Deferred **yêu cầu Mobile HDR bật** và **không hỗ trợ MSAA** | Nghĩa là tắt Mobile HDR đã tự động loại bỏ deferred. Hai quyết định khoá lẫn nhau | ✅ |
| 19 | Không có phần hand tracking | Thêm §7.8 đầy đủ | Tính năng lõi của Quest 3, tài liệu gốc bỏ trống | ✅ |
| 20 | Không có phần spatial anchors | Thêm §7.9 đầy đủ | Không có anchor thì app MR không nhớ được gì qua các phiên | ✅ |

### Ba lỗi trong chính bản nháp của tài liệu này

Trung thực thì tài liệu này cũng đã sai ở ba chỗ trong bản đầu, và đã sửa. Ghi ra vì nó minh hoạ đúng luận điểm của Chương 10:

| # | Bản nháp viết | Đúng ra là | Ảnh hưởng nếu không sửa |
|---|---|---|---|
| N1 | `EHMDTrackingOrigin::Floor` | **`Stage`** (UE5 chỉ có `Local` / `LocalFloor` / `Stage`) | Code Chương 4 **không compile**. Trainee đứng hình ở bài tập đầu tiên và không đủ nền để biết lỗi ở sách hay ở mình |
| N2 | Phụ lục D: `r.Mobile.ShadingPath=0` là deferred | **`0` là Forward, `1` là Deferred** | Đáp án sai dạy trainee nghi ngờ suy luận đúng của chính mình — nguy hiểm hơn lỗi trong thân bài |
| N3 | Module cho `XRDeviceVisualization` "thường là HeadMountedDisplay và XRBase" | Nó nằm trong plugin **`XRBase`**, và cần cả hai module | Lỗi link khó hiểu |
| N4 | §4.2: `SetRelativeLocation` trên capsule để kéo nó theo đầu | Capsule là **root** — relative của root chính là world. Phải dịch actor rồi bù `VROrigin` ngược lại | **Lỗi logic, compile sạch.** Pawn nhảy về toạ độ vô nghĩa ngay frame đầu |
| N5 | §5.2: vận tốc ném = quãng đường 3 frame chia cho dt của **1** frame; và vòng đệm chưa từng được ghi trong Tick | Chia cho (số mẫu−1)×dt; ghi đệm trong `TickComponent` | **Lỗi logic, compile sạch.** Vật ném mạnh gấp 3-4 lần — đúng cái bẫy mà bảng bẫy của chính chương đó cảnh báo |
| N6 | `bBuildForVulkan=True` trong config mẫu | Key này không tồn tại; key thật là `bSupportsVulkan` | Dòng chết vô hại, nhưng dạy sai tên key |
| N7 | §8.7 trỏ tới mục "10.7" (không tồn tại); §7.5 spawn `AStaticMeshActor` rồi `SetStaticMesh` mà không đổi mobility | Mục VRC là §10.4; phải `SetMobility(Movable)` trước | Tham chiếu hỏng trên web; proxy fail lúc runtime kèm warning |

## Ba mục cần bạn xác nhận

Có ba chỗ tôi không tự giải quyết được, cần người từng làm dự án gốc:

1. **Mục 10 (`r.AllowOcclusionQueries`).** Bạn có nhớ thêm chi tiết nào không — bản engine, loại widget, cách trace, có phải chỉ xảy ra khi dùng `WidgetInteractionComponent` không? Có chi tiết thì tôi viết lại chính xác thay vì để ngỏ.

2. **Mục 12 trong Phụ lục A (Tonemap Subpass làm đóng băng render target của stereo layer).** Đây là quan sát rất cụ thể và rất giá trị, nhưng tôi không tìm được ai khác báo cáo tương tự. Nếu có thể tái hiện được thì đáng viết thành một báo cáo gửi Meta.

3. **Chuỗi tag chính xác cho 5.6.** Tôi suy từ quy ước đặt tên; cần một người vào repo xác nhận (§1.4).

---
---

# Phụ lục C — Nguồn

Toàn bộ khẳng định gắn nhãn ✅ trong tài liệu này đều truy về một trong các nguồn dưới đây. Tất cả đều đã được truy cập tháng 8/2026.

## C.1 Meta — cài đặt và hạ tầng

| Nội dung | URL |
|---|---|
| Điều kiện tiên quyết (tài khoản, verify, link Epic↔GitHub) | https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-prerequisites/ |
| Cài Unreal Engine (yêu cầu dung lượng) | https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-unreal-engine/ |
| Cài Meta XR plugin (đường Marketplace, plugin nhắm UE mới nhất) | https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-metaxr-plugin/ |
| Thiết lập Meta XR plugin (tắt OculusVR cũ, Project Setup Tool) | https://developers.meta.com/horizon/documentation/unreal/unreal-setting-up-metaxr-plugin/ |
| Cài Android Studio và NDK (NDK 25.1.8937393, API 32/34, JDK) | https://developers.meta.com/horizon/documentation/unreal/unreal-quick-start-install-android/ |
| **Bảng tương thích fork vs Epic+plugin** (nguồn cho hầu hết quyết định hạ tầng) | https://developers.meta.com/horizon/documentation/unreal/unreal-compatibility-matrix/ |
| Trang download UE5 Integration (bản hiện hành v205 / UE 5.7.4) | https://developers.meta.com/horizon/downloads/package/unreal-engine-5-integration/ |
| Trang download bản GitHub (ghi chú v81, Chunked PSO Cache) | https://developers.meta.com/horizon/downloads/package/unreal-engine-5-integration-github/81.0.0/ |
| Meta XR Interaction SDK cho Unreal | https://developers.meta.com/horizon/downloads/package/meta-xr-interaction-sdk-unreal/ |
| Yêu cầu Android 14 / API 34 từ 1/3/2026 | https://developers.meta.com/horizon/blog/meta-quest-apps-android-14-march-1/ |
| Quick start (khuyến nghị đọc HIG trước khi code) | https://developers.meta.com/horizon/essentials/quick-start/ |

## C.2 Meta — render và hiệu năng

| Nội dung | URL |
|---|---|
| Forward Shading Renderer (khuyến nghị cho Quest, MSAA) | https://developers.meta.com/horizon/documentation/unreal/unreal-forward-renderer/ |
| Multi-View (khuyến nghị bật, cần Vulkan) | https://developers.meta.com/horizon/documentation/unreal/unreal-multi-view/ |
| Fixed Foveated Rendering (project setting, dynamic, API) | https://developers.meta.com/horizon/documentation/unreal/unreal-ffr/ |
| Tone Mapping (Tonemap Subpass, chi phí ~600 µs) | https://developers.meta.com/horizon/documentation/unreal/unreal-tonemapping/ |
| Set Display Refresh Rates (khoá tần số, hành vi khi nóng) | https://developers.meta.com/horizon/documentation/unreal/unreal-change-display-refresh-rate/ |
| Guidelines for VR Performance Optimization (500-1.000 draw call, 1-2M tri) | https://developers.meta.com/horizon/documentation/native/pc/dg-performance-guidelines/ |
| Testing and Performance Analysis (tối thiểu 72 FPS, công cụ profiling) | https://developers.meta.com/horizon/documentation/unreal/unreal-debug-android/ |
| So sánh tối ưu theo thiết bị (Quest 3 vs Quest 2) | https://developers.meta.com/horizon/resources/device-optimization-comparison/ |

## C.3 Meta — UI, MR và màu sắc

| Nội dung | URL |
|---|---|
| VR Compositor Layers (giới hạn 16 layer, thuộc tính stereo layer) | https://developers.meta.com/horizon/documentation/unreal/unreal-overlay/ |
| Get Started with Passthrough (Persistent Passthrough, SceneColorFormat=4, Underlay) | https://developers.meta.com/horizon/documentation/unreal/unreal-passthrough-overview-gs/ |
| Passthrough over Link (giới hạn khi test qua Link) | https://developers.meta.com/horizon/documentation/unreal/unreal-passthrough-use-over-link/ |
| Color Space and Color Scaling | https://developers.meta.com/horizon/documentation/unreal/unreal-color-functions/ |
| Set Color Scale and Offset (công thức, mobile không hỗ trợ offset) | https://developer.oculus.com/documentation/unreal/unreal-blueprints-set-color-scale-and-offset/ |
| Quyền dữ liệu không gian (USE_SCENE, USE_ANCHOR_API) | https://developers.meta.com/horizon/documentation/unity/unity-spatial-data-perm/ |
| MR Utility Kit | https://developers.meta.com/horizon/documentation/spatial-sdk/spatial-sdk-mruk |
| Sample MRUK cho Unreal | https://github.com/oculus-samples/Unreal-MRUtilityKitSample |
| Sample MR tổng hợp cho Unreal (Discover) | https://github.com/oculus-samples/Unreal-Discover |

## C.3b Meta — hand tracking, anchors, profiling

| Nội dung | URL |
|---|---|
| Setup Hand Tracking in Unreal (Hand Tracking Support, `UOculusXRHandComponent`, `UOculusXRInputFunctionLibrary`) | https://developers.meta.com/horizon/documentation/unreal/unreal-hand-tracking/ |
| Get Hand Skeletal Mesh (Blueprint) | https://developers.meta.com/horizon/documentation/unreal/unreal-blueprints-get-hand-skeletal-mesh/ |
| Custom Hand and Controller Meshes (ISDK) | https://developers.meta.com/horizon/documentation/unreal/unreal-isdk-custom-hand-controller-mesh/ |
| Local Spatial Anchors Tutorial (node Blueprint từng bước) | https://developers.meta.com/horizon/documentation/unreal/unreal-lsa-tutorial/ |
| Spatial Anchors Unreal Blueprints Reference | https://developers.meta.com/horizon/documentation/unreal/unreal-spatial-anchors-bp-reference/ |
| Spatial Anchors Sharing (mẫu C++ delegate, `OculusXRAnchors`) | https://developers.meta.com/horizon/documentation/unreal/unreal-spatial-anchors-sharing/ |
| Sample: Spatial Anchors | https://github.com/oculus-samples/Unreal-SpatialAnchorsSample |
| Sample: Shared Anchors (mẫu lưu UUID bằng SaveGame) | https://github.com/oculus-samples/Unreal-SharedAnchorsSample |
| Sample: Shared Scene | https://github.com/oculus-samples/Unreal-SharedSceneSample |
| How to Take Perfetto Traces with MQDH (**bẫy ATrace cho Unreal**) | https://developers.meta.com/horizon/documentation/unreal/ts-perfettoguide/ |
| Performance Analyzer and Metrics (MQDH, Simpleperf, ovrgpuprofiler, RenderDoc Meta Fork) | https://developers.meta.com/horizon/documentation/spatial-sdk/ts-mqdh-logs-metrics/ |
| Sample: Performance Settings for Unreal Engine | https://developers.meta.com/horizon/documentation/unreal/unreal-sample-performance-settings/ |
| Set Display Frequency (Blueprint) | https://developers.meta.com/horizon/documentation/unreal/unreal-blueprints-set-display-frequency/ |
| Mobile Rendering and Shading Modes (giá trị `r.Mobile.ShadingPath`) | https://dev.epicgames.com/documentation/unreal-engine/mobile-rendering-and-shading-modes-for-unreal-engine |
| Mobile Deferred Shading (deferred cần Mobile HDR, không có MSAA) | https://dev.epicgames.com/documentation/unreal-engine/using-the-mobile-deferred-shading-mode-in-unreal-engine |
| `UXRDeviceVisualizationComponent` (plugin XRBase) | https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/XRBase/UXRDeviceVisualizationComponent |
| `FXRTrackingSystemBase::SetTrackingOrigin` (Local/LocalFloor/Stage) | https://dev.epicgames.com/documentation/unreal-engine/API/Plugins/XRBase/FXRTrackingSystemBase/SetTrackingOrigin |

## C.4 Meta — phát hành

| Nội dung | URL |
|---|---|
| Lỗi VRC phổ biến và best practice | https://developers.meta.com/horizon/resources/publish-common-vrc-failures/ |
| Submit app (khuyến nghị trước 2 tuần) | https://developers.meta.com/horizon/resources/publish-submit/ |
| VRC.Quest.Security.2 (quyền tối thiểu) | https://developers.meta.com/horizon/resources/vrc-quest-security-2/ |

## C.5 Epic Games

| Nội dung | URL |
|---|---|
| VR Template (nội dung sẵn có, dựa trên OpenXR) | https://dev.epicgames.com/documentation/en-us/unreal-engine/vr-template-in-unreal-engine |
| UE 5.5 Release Notes (`xr.MobileLDRDynamicResolution`) | https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-5-release-notes |
| Manually Creating Bundled PSO Caches (quy trình đầy đủ) | https://dev.epicgames.com/documentation/en-us/unreal-engine/manually-creating-bundled-pso-caches-in-unreal-engine |

## C.6 Nguồn cộng đồng — chỉ dùng đối chiếu (mức ⚠️)

| Nội dung | URL |
|---|---|
| Bản re-port cộng đồng MetaXR v78 cho UE 5.6.1, và lỗi trùng splash | https://forums.unrealengine.com/t/metaxr-v78-for-unreal-5-6-1-release/1768347 |
| Báo cáo `Supports Depth` tạo mặt phẳng đen trên Quest | https://forums.oculusvr.com/t5/Unreal-VR-Development/BUG-Enable-Supports-Depth-on-Stereo-Layer-create-a-default-solid/td-p/780118 |
| Mobile HDR và vấn đề post-processing | https://communityforums.atmeta.com/discussions/dev-unreal/mobile-hdr-and-post-processing-issue/1331527 |
| Đề nghị Meta lập bảng SDK/NDK/JDK theo từng bản UE | https://communityforums.atmeta.com/discussions/dev-unreal/maintain-an-up-to-date-list-of-android-sdk-ndk-jdk-android-studio-version-for-ea/1199345 |
| Ghi chú tối ưu hiệu năng VR (tham khảo) | https://github.com/authorTom/notes-on-VR-performance |
| XRDeviceVisualization và motion controller trên UE5 | https://developer-docs.magicleap.cloud/docs/guides/unreal/plugins/unreal-controller/ |

## C.7 Những gì KHÔNG xác minh được (mức ❓)

Danh sách này là việc chưa xong. Kiểm chứng được cái nào thì cập nhật tài liệu và ghi ngày.

| # | Chưa xác minh | Ở mục |
|---|---|---|
| 1 | Chuỗi tag/branch chính xác cho 5.6 trên repo fork (trang tags yêu cầu đăng nhập) | §1.4, §1.7 |
| 2 | Danh sách module chính xác của plugin Meta XR v83 | §1.8 |
| 3 | Giá trị TargetSDK mặc định của UE 5.6 | §3.4 |
| 4 | Từng CVar riêng có đổi tên/hành vi giữa 5.5 và 5.6 hay không | §3.9 |
| 5 | Tương tác `xr.MobileLDRDynamicResolution` × FFR × Multi-View trên 5.6 | §3.9 |
| 6 | Nghi vấn FFR không ăn khi bật Multi-View (không tìm thấy xác nhận cho Quest 3) | §3.6 |
| 7 | Cơ chế `r.AllowOcclusionQueries=0` làm vỡ hover/click widget | §3.9, PL A #15 |
| 8 | Cơ chế Tonemap Subpass làm đóng băng render target của stereo layer | §3.7, PL A #12 |
| 9 | Thay đổi API stereo layer giữa 5.5 và 5.6 | §6.3 |
| 10 | Thay đổi `UMotionControllerComponent` giữa 5.5 và 5.6 | §4.4 |
| 11 | Trạng thái deprecate chính xác của legacy input ở 5.6 | §4.6 |
| 12 | Cách bật supersampling/sharpening cho stereo layer ở v83 | §6.8 |
| 13 | Hệ quả thực tế của việc Đường A không có thay đổi Chunked PSO Cache của fork | §3.13 |
| 14 | Cấu hình tối ưu khi dùng cả PSO Precaching và bundled cache trên Quest ở 5.6 | §3.13 |
| 15 | Cơ chế phát hiện chuyển đổi controller ↔ tay ở plugin v83 | §7.8 |

**Đã giải quyết trong lần rà thứ hai** (trước đây nằm trong danh sách này):

| Trước đây chưa rõ | Nay đã xác minh |
|---|---|
| Signature C++ của Set Display Frequency | `UOculusXRFunctionLibrary::SetDisplayFrequency / GetCurrentDisplayFrequency / GetAvailableDisplayFrequencies` — §3.11 |
| Key ini chính xác của FFR | `FoveatedRenderingMethod` + `FoveatedRenderingLevel` — §3.8 |
| Giá trị `r.Mobile.ShadingPath` | `0` = Forward (mặc định), `1` = Deferred — §3.6 |
| Enum tracking origin | `Local` / `LocalFloor` / `Stage`; **không có `Floor`** — §4.2 |
| Module của `XRDeviceVisualization` | Plugin `XRBase` — §4.4 |

---
---

# Phụ lục D — Bài tập file config gài lỗi

## D.1 Đề bài

Dưới đây là một `DefaultEngine.ini` của project Quest 3 trên UE 5.6. **Có 9 lỗi.** Tìm hết, và với mỗi lỗi ghi rõ: sai ở đâu, hậu quả là gì, sửa thành gì.

Làm bài này **trước khi** xem đáp án ở §D.2. Đây là bài kiểm tra Chương 3.

```ini
[/Script/AndroidRuntimeSettings]
MinSDKVersion=32
TargetSDKVersion=32
bBuildForArm64=True
bBuildForX8664=True
bBuildForES31=True
bSupportsVulkan=True
bPackageForMetaQuest=True

[/Script/Engine.RendererSettings]
r.MobileHDR=True
r.Mobile.ShadingPath=1
vr.MobileMultiView=False
vr.InstancedStereo=True
r.DynamicGlobalIlluminationMethod=1
r.ReflectionMethod=1
r.Shadow.Virtual.Enable=1
r.AllowStaticLighting=True
r.MobileMSAA=4
r.Shadow.CSM.MaxCascades=4
r.AllowOcclusionQueries=0
r.ShaderPipelineCache.Enabled=1

[/Script/Engine.UserInterfaceSettings]
bAllowHighQualityLightMaps=True

[DevOptions.Shaders]
NeedsShaderStableKeys=false

[/Script/OculusXRHMD.OculusXRHMDRuntimeSettings]
XrApi=OVRPluginOpenXR
bSupportPassthrough=True
```

Gợi ý phân bổ: 3 lỗi ở mục Android, 5 lỗi ở mục Renderer, 1 lỗi ở phần còn lại.

---

## D.2 Đáp án

**Đừng đọc phần này trước khi làm xong §D.1.**

### Lỗi 1 — `TargetSDKVersion=32`

- **Sai:** app tạo mới phải target API 34 từ 1/3/2026
- **Hậu quả:** không submit được lên Horizon Store
- **Sửa:** `TargetSDKVersion=34`. Giữ `MinSDKVersion=32` (dòng đó đúng)
- Tham chiếu: §3.4

### Lỗi 2 — `bBuildForX8664=True`

- **Sai:** Quest 3 là arm64. Build x86-64 là thừa hoàn toàn
- **Hậu quả:** APK phình to vô ích, build lâu hơn
- **Sửa:** `bBuildForX8664=False`
- Tham chiếu: §3.12

### Lỗi 3 — `bBuildForES31=True`

- **Sai:** Quest chạy Vulkan. Bật thêm GLES3.1 là thừa, và làm hỏng điều kiện của Mobile Multi-View
- **Hậu quả:** phình shader, tăng thời gian cook, có thể chọn nhầm đường render
- **Sửa:** `bBuildForES31=False`
- Tham chiếu: §3.6

### Lỗi 4 — `r.MobileHDR=True`

- **Sai:** không phải "bắt buộc tắt", nhưng bật lên trên Quest 3 là đánh đổi rất xấu
- **Hậu quả:** mất hiệu năng đáng kể. Ngoài ra có báo cáo méo/warp hình. Nếu làm MR thì còn ảnh hưởng blend passthrough
- **Sửa:** `r.MobileHDR=False`. Nếu thật sự cần post-process thì dùng Tonemap Subpass — nhưng đọc cảnh báo ở §3.7 trước
- Tham chiếu: §3.7

### Lỗi 5 — `r.Mobile.ShadingPath=1` (deferred)

- **Sai:** `0` là Forward (mặc định), `1` là Deferred. Meta khuyến nghị Forward cho Quest
- **Hậu quả:** chậm hơn, **mất MSAA**, và ở đây còn **mâu thuẫn trực tiếp với một dòng khác trong file** — deferred yêu cầu Mobile HDR bật, mà lỗi 4 lại nói phải tắt Mobile HDR. Hai dòng này không thể cùng đúng
- **Sửa:** `r.Mobile.ShadingPath=0`, hoặc đặt Mobile Shading Path = Forward trong Project Settings
- Tham chiếu: §3.6
- **Điểm thưởng:** nếu bạn phát hiện ra mâu thuẫn giữa lỗi 4 và lỗi 5 chứ không chỉ tìm ra từng lỗi riêng lẻ, bạn đang đọc config đúng cách — như một hệ thống có ràng buộc lẫn nhau, không phải một danh sách dòng độc lập

### Lỗi 6 — `vr.MobileMultiView=False`

- **Sai:** Meta khuyến nghị bật
- **Hậu quả:** tăng overhead CPU đáng kể (render hai mắt riêng biệt)
- **Sửa:** `vr.MobileMultiView=True` — và nhớ Vulkan phải bật (liên quan lỗi 3)
- Tham chiếu: §3.6

### Lỗi 7 — Bộ ba Lumen + VSM

`r.DynamicGlobalIlluminationMethod=1`, `r.ReflectionMethod=1`, `r.Shadow.Virtual.Enable=1`

- **Sai:** đây là tính năng desktop. Lumen GI, Lumen Reflections và Virtual Shadow Maps đều không dành cho mobile VR
- **Hậu quả:** sụp fps, phình shader, thời gian cook rất dài. **Đây là lỗi đã thực sự xảy ra trong một dự án đã ship** (Phụ lục A #43)
- **Sửa:** đặt cả ba về 0
- Tham chiếu: §3.9

*(Tính là một lỗi vì cùng một nguyên nhân gốc: bê nguyên cấu hình desktop sang mobile.)*

### Lỗi 8 — `r.AllowOcclusionQueries=0`

- **Sai:** tắt occlusion query trên một project có VR widget
- **Hậu quả:** ❓ đã có báo cáo hiện trường về việc vỡ hover/click của VR widget. **Cơ chế chưa xác định** — nhưng chưa có lý do gì để tắt nó ở đây cả
- **Sửa:** bỏ dòng này đi, hoặc `=1`
- Tham chiếu: §3.9, Phụ lục A #15
- **Ghi chú:** đây là lỗi duy nhất trong bài mà đáp án bao gồm cả "và chúng ta không biết chắc vì sao". Nếu bạn tìm ra lỗi này **và** ghi rằng cơ chế chưa rõ, bạn đã hiểu đúng tinh thần của cả tài liệu.

### Lỗi 9 — `NeedsShaderStableKeys=false`

- **Sai:** cần `true` để sinh file `.shk`
- **Hậu quả:** không tạo được bundled PSO cache → app khựng mỗi lần gặp material mới
- **Sửa:** `NeedsShaderStableKeys=true`, và bật `bShareMaterialShaderCode=True` trong Project Settings → Packaging
- Tham chiếu: §3.13

### Hai dòng KHÔNG phải lỗi — nhưng đáng để ý

- **`r.Shadow.CSM.MaxCascades=4`** — không sai về mặt kỹ thuật, nhưng đắt cho mobile. Khuyến nghị giảm về 1. Nếu bạn ghi dòng này ra, tốt.
- **`XrApi=OVRPluginOpenXR`** — ⚠️ giá trị này có thể còn dùng được, nhưng tài liệu passthrough hiện hành của Meta hướng tới **Epic Native OpenXR (Recommended)** trong Project Settings → Meta XR → General. Nếu bạn thắc mắc về dòng này, đó là dấu hiệu tốt: đây đúng là chỗ đáng kiểm chứng.

### Bản đã sửa

```ini
[/Script/AndroidRuntimeSettings]
MinSDKVersion=32
TargetSDKVersion=34
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
r.DynamicGlobalIlluminationMethod=0
r.ReflectionMethod=0
r.Shadow.Virtual.Enable=0
r.AllowStaticLighting=True
r.MobileMSAA=4
r.Shadow.CSM.MaxCascades=1
r.ShaderPipelineCache.Enabled=1
; r.Mobile.SceneColorFormat=4    ; bỏ comment nếu dùng passthrough

[DevOptions.Shaders]
NeedsShaderStableKeys=true
```

## D.3 Thang điểm

| Số lỗi tìm ra | Đánh giá |
|---|---|
| 9/9 kèm giải thích hậu quả | Xuất sắc — bạn đã nắm Chương 3 |
| 7-8/9 | Tốt — đọc lại mục tương ứng của lỗi bỏ sót |
| 5-6/9 | Đọc lại Chương 3 §3.6 → §3.13 trước khi sang Chương 4 |
| <5/9 | Làm lại bài tập §3.5 (chạy Project Setup Tool rồi đọc `git diff`) trước |

Điểm quan trọng hơn con số: **với mỗi lỗi bạn tìm ra, bạn có giải thích được *hậu quả* không?** Biết `r.MobileHDR` nên là `False` mà không biết vì sao thì bạn sẽ không biết khi nào ngoại lệ là hợp lý — và ngoại lệ trong VR xuất hiện thường xuyên hơn bạn nghĩ.

---
---

*Hết tài liệu.*

**Tài liệu này có 15 mục gắn nhãn ❓ (Phụ lục C.7) và hàng chục mục ⚠️.** Đó là con số trung thực, không phải thiếu sót. Mỗi mục ❓ là một thí nghiệm nhỏ đang chờ ai đó làm trên device thật — và người đó rất có thể là bạn.

Ba lần rà soát đã gỡ được 5 mục khỏi danh sách đó, **và tìm ra 7 lỗi trong chính các bản nháp của tài liệu này** (bảng N1-N7 ở Phụ lục B). Đáng nói nhất: hai lỗi cuối cùng là **lỗi logic** — `UpdateCapsuleToHmd` dịch nhầm cả actor, và công thức vận tốc ném thổi phồng kết quả 3-4 lần. Cả hai compile sạch, chỉ lộ ra khi dò từng dòng bằng tay hoặc chạy trên device. Lỗi kiểu đó không bao giờ bị bắt bởi "đọc lại cho kỹ" — nó bị bắt bởi *chạy logic trong đầu như một cái máy*, hoặc bởi máy thật.

Điều đó nói lên đúng thứ Chương 10 muốn nói: tài liệu kỹ thuật không bao giờ "xong", nó chỉ đang ở một mức chính xác nào đó tại một thời điểm nào đó. Bài tập 3 cuối khoá — tìm ba chỗ sai trong chính tài liệu này — không phải phép lịch sự. Nó là cơ chế duy trì.

Khi bạn kiểm chứng được một mục, hãy sửa tài liệu và ghi ngày. Đó là cách một giáo án còn sống.
