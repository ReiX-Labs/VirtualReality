// Quiz bank, keyed by the section id produced by content/parse.ts ("3-8", "7-5"…).
//
// Every question targets a specific misconception rather than a definition, so
// getting one wrong tells the learner something. `explain` always says WHY the
// right answer is right, not just that it is.

export interface QuizQuestion {
  id: string;
  sectionId: string;
  q: string;
  code?: string;
  /** language for the snippet — falls back to plain text */
  lang?: string;
  choices: string[];
  answer: number;
  explain: string;
}

export const QUIZZES: QuizQuestion[] = [
  // ---------- Chương 0 ----------
  {
    id: "q0-3-a",
    sectionId: "0-3",
    q: "Bạn ở Việt Nam và muốn verify tài khoản Meta Developer. Cách nào nên thử trước?",
    choices: [
      "SMS 2FA",
      "PayPal",
      "Thẻ tín dụng quốc tế",
      "Gửi ảnh CCCD cho Meta",
    ],
    answer: 0,
    explain:
      "Meta chấp nhận SMS 2FA hoặc thẻ tín dụng/ghi nợ — PayPal thì không. Thẻ quốc tế phát hành ở Việt Nam thường bị từ chối ở bước này, nên SMS 2FA là đường ít ma sát nhất.",
  },
  {
    id: "q0-3-b",
    sectionId: "0-3",
    q: "Bạn mở link repo của Meta và nhận về trang 404. Kết luận hợp lý nhất?",
    choices: [
      "Repo đã bị xoá",
      "Bạn chưa có quyền — nhiều khả năng chưa bấm link xác nhận trong email GitHub",
      "GitHub đang lỗi, thử lại sau",
      "Cần trả phí để truy cập",
    ],
    answer: 1,
    explain:
      "GitHub trả 404 (chứ không phải 403) cho repo private mà bạn không có quyền, để không tiết lộ sự tồn tại của nó. Với repo Meta thì 404 gần như luôn là vấn đề quyền: kiểm tra `EpicGames` đã xuất hiện ở github.com/settings/organizations chưa.",
  },
  {
    id: "q0-4-a",
    sectionId: "0-4",
    q: "`adb devices` in ra `1WMHH… unauthorized`. Việc cần làm là gì?",
    code: "$ adb devices\nList of devices attached\n1WMHH8123456789   unauthorized",
    lang: "bash",
    choices: [
      "Đổi cáp USB",
      "Cài lại driver",
      "Đeo headset lên và bấm Allow trên hộp thoại USB debugging",
      "Chạy `adb kill-server`",
    ],
    answer: 2,
    explain:
      "`unauthorized` nghĩa là máy tính đã nhìn thấy thiết bị nhưng headset chưa cho phép. Hộp thoại xác nhận chỉ hiện *bên trong* headset. Đổi cáp là cách xử lý cho danh sách trống, còn `kill-server` là cho trạng thái `offline`.",
  },

  // ---------- Chương 1 ----------
  {
    id: "q1-2-a",
    sectionId: "1-2",
    q: "Vì sao phải tải plugin từ trang **tag** chứ không phải nút Code ở trang chủ repo?",
    choices: [
      "Nút Code tải chậm hơn",
      "Nút Code cho bạn branch — nội dung thay đổi theo thời gian; tag ghim vĩnh viễn một commit",
      "Nút Code không hỗ trợ repo private",
      "Tag đã nén sẵn nên nhẹ hơn",
    ],
    answer: 1,
    explain:
      "Branch di chuyển theo commit mới; tag thì không bao giờ. Bạn cần đúng trạng thái mã nguồn ứng với phiên bản plugin đã phát hành, nên phải vào trang tag.",
  },
  {
    id: "q1-5-a",
    sectionId: "1-5",
    q: "Project của bạn khoá ở UE 5.6. Trang Download của Meta đang phục vụ bản v205.0 fork từ UE 5.7.4. Làm gì?",
    choices: [
      "Tải v205.0 rồi sửa file .uplugin cho khớp 5.6",
      "Nâng project lên 5.7.4",
      "Lấy plugin từ tag fork ứng với 5.6 (`oculus-5.6.1-release-v83`)",
      "Cài từ Epic Marketplace",
    ],
    answer: 2,
    explain:
      "Plugin Meta XR không có trên Epic Marketplace, và bản trên trang Download đã nhắm 5.7.4. Đường duy nhất cho 5.6 là tag trên repo fork. Sửa `.uplugin` chỉ tắt cảnh báo phiên bản chứ không làm nhị phân khớp ABI.",
  },
  {
    id: "q1-6-a",
    sectionId: "1-6",
    q: "Trong lúc làm theo Đường A, editor bỗng bắt đầu build hàng nghìn file. Điều đó nghĩa là gì?",
    choices: [
      "Bình thường — lần đầu luôn build shader",
      "Bạn đã vô tình rẽ sang Đường B (compile engine)",
      "DerivedDataCache bị hỏng",
      "Plugin cần được rebuild mỗi lần mở project",
    ],
    answer: 1,
    explain:
      "Đường A dùng engine nhị phân dựng sẵn của Epic và chỉ copy plugin vào — nó không bao giờ compile lại engine. Build hàng nghìn file là dấu hiệu bạn đang biên dịch source, tức Đường B.",
  },
  {
    id: "q1-9-a",
    sectionId: "1-9",
    q: "Đội bạn định compile fork chỉ để dùng ETFR trên Quest 3. Nhận xét đúng?",
    choices: [
      "Hợp lý, ETFR tiết kiệm GPU rất nhiều",
      "Vô nghĩa — ETFR cần eye tracking, Quest 3 không có",
      "Hợp lý nếu bật kèm Multi-View",
      "ETFR có sẵn trên Đường A rồi",
    ],
    answer: 1,
    explain:
      "Eye-Tracked Foveated Rendering cần dữ liệu mắt; Quest 3 không có eye tracking (Quest Pro thì có). Đây là một lý do sai rất hay gặp để chọn Đường B — chi phí hàng trăm GB và hàng giờ build đổi lấy một tính năng không chạy được.",
  },
  {
    id: "q1-11-a",
    sectionId: "1-11",
    q: "Thư mục nào **bắt buộc phải commit** trong một project Unreal?",
    choices: ["`Intermediate/`", "`DerivedDataCache/`", "`Config/`", "`Binaries/`"],
    answer: 2,
    explain:
      "`Config/` là nguồn sự thật của mọi setting — CVar, renderer, Android, packaging. Ba thư mục còn lại đều do engine sinh lại được. Quy tắc: engine sinh lại được → ignore; công sức người → commit.",
  },
  {
    id: "q1-11-b",
    sectionId: "1-11",
    q: "Bạn phát hiện keystore password đã bị commit vào `Config/DefaultEngine.ini` từ 3 tháng trước. Xử lý đúng?",
    choices: [
      "Xoá dòng đó rồi commit lại là xong",
      "Đổi repo thành private",
      "Coi như đã lộ và rotate lại toàn bộ khoá/secret",
      "Dùng `git commit --amend`",
    ],
    answer: 2,
    explain:
      "Lịch sử git là vĩnh viễn — commit cũ vẫn chứa giá trị cũ, và bất kỳ ai từng clone đều đã có nó. Xoá ở commit sau không xoá được ở commit trước. Cách xử lý duy nhất đúng là rotate.",
  },

  // ---------- Chương 2 ----------
  {
    id: "q2-2-a",
    sectionId: "2-2",
    q: "Vì sao 72 FPS là mức sàn chứ không phải mục tiêu “nice to have” trong VR?",
    choices: [
      "Vì Meta không cho submit app dưới 72 FPS",
      "Vì dưới ngưỡng đó ảnh bắt đầu giật và gây buồn nôn — người dùng bỏ headset chứ không phàn nàn",
      "Vì màn hình Quest 3 chỉ chạy được 72 Hz",
      "Vì compositor không reproject được dưới 72 FPS",
    ],
    answer: 1,
    explain:
      "Cả VRC lẫn trải nghiệm đều đòi 72 FPS, nhưng lý do gốc là sinh lý: frame rớt trong VR gây khó chịu thể chất. Quest 3 chạy được cả 90 và 120 Hz — đó chính là lý do phải khoá tần số, kẻo ngân sách tụt xuống 11,1 ms.",
  },
  {
    id: "q2-2-b",
    sectionId: "2-2",
    q: "App của bạn giữ 72 fps suốt 6 phút test. Kết luận nào an toàn?",
    choices: [
      "Đạt — có thể chuyển sang tính năng khác",
      "Chưa kết luận được: phải chạy 25–30 phút mới thấy thermal throttling",
      "Đạt, nếu build là Development",
      "Đạt, nếu đã bật FFR",
    ],
    answer: 1,
    explain:
      "Khi máy nóng, hệ thống hạ về 72 Hz rồi tăng minVsyncs lên 2 — hiệu năng thực tế rơi xuống một nửa. Hiện tượng đó chỉ xuất hiện sau 15–25 phút, nên test 5 phút bỏ sót nó hoàn toàn.",
  },
  {
    id: "q2-3-a",
    sectionId: "2-3",
    q: "Tính năng nào **không thể** kiểm chứng dù qua PIE lẫn qua Quest Link?",
    choices: ["Passthrough", "Hand tracking", "Space Setup và số đo hiệu năng thật", "Bố cục UI"],
    answer: 2,
    explain:
      "Passthrough và hand tracking chạy được qua Link (có giới hạn). Space Setup là quy trình quét phòng của hệ điều hành trên máy — không có đường tương đương trên PC. Và mọi số đo hiệu năng qua Link đều là số của PC, không phải của Quest.",
  },
  {
    id: "q2-4-a",
    sectionId: "2-4",
    q: "Bạn đọc trên blog rằng app Quest phải dưới 100 draw call. Nhận định đúng?",
    choices: [
      "Đúng, đó là giới hạn cứng của phần cứng",
      "Quá bảo thủ — hướng dẫn của Meta là 500–1.000 draw call, 1–2 triệu tam giác",
      "Sai, không có giới hạn nào cả",
      "Chỉ đúng với Quest 3, Quest 2 thì cao hơn",
    ],
    answer: 1,
    explain:
      "Meta công bố 500–1.000 draw call và 1–2 triệu tri. ⚠️ Con số này cho dòng Quest nói chung, gốc từ thời Quest 2, và ❓ chưa có số riêng cho Quest 3 — nhưng “dưới 100” thì thấp hơn hướng dẫn chính thức tới một bậc độ lớn.",
  },
  {
    id: "q2-5-a",
    sectionId: "2-5",
    q: "Trong hai thiết kế locomotion sau, cái nào dễ gây say hơn?",
    choices: [
      "Đi thẳng 4 m/s với tốc độ không đổi",
      "Đi từ 0 lên 2 m/s trong 1,5 giây rồi giảm dần",
      "Cả hai như nhau",
      "Không cái nào gây say nếu giữ 72 fps",
    ],
    answer: 1,
    explain:
      "Gia tốc tệ hơn tốc độ. Tai trong báo “đứng yên” trong khi mắt báo “đang tăng tốc” — chính mâu thuẫn đó gây say. Tốc độ cao nhưng hằng số dễ chịu hơn nhiều so với gia tốc mượt.",
  },
  {
    id: "q2-6-a",
    sectionId: "2-6",
    q: "Bạn thêm layer thứ 17 vào scene. Chuyện gì xảy ra?",
    choices: [
      "Engine báo lỗi khi build",
      "Layer có priority thấp nhất bị bỏ, kèm warning trong log",
      "Layer đó im lặng không được render — không lỗi, không cảnh báo",
      "Compositor tự động gộp hai layer lại",
    ],
    answer: 2,
    explain:
      "Giới hạn 16 layer được thực thi ở tầng compositor, và nó thất bại âm thầm. Vì thế bẫy này rất khó tìm: UI của bạn “biến mất” mà không có manh mối nào trong log.",
  },

  // ---------- Chương 3 ----------
  {
    id: "q3-4-a",
    sectionId: "3-4",
    q: "Cấu hình Android nào đúng cho một app Horizon tạo mới năm 2026?",
    choices: [
      "MinSDK 32, TargetSDK 32",
      "MinSDK 32, TargetSDK 34",
      "MinSDK 34, TargetSDK 34",
      "MinSDK 29, TargetSDK 33",
    ],
    answer: 1,
    explain:
      "Từ 1/3/2026, app mới trên Developer Dashboard phải target Android 14 (API 34). `minSdkVersion` vẫn giữ 32 — nâng min lên 34 sẽ loại bỏ thiết bị không cần thiết.",
  },
  {
    id: "q3-6-a",
    sectionId: "3-6",
    q: "`r.Mobile.ShadingPath=1` có nghĩa là gì?",
    choices: [
      "Forward shading",
      "Deferred shading",
      "Bật multi-view",
      "Bật mobile HDR",
    ],
    answer: 1,
    explain:
      "`0` = Forward (mặc định, và là lựa chọn Meta khuyến nghị vì bật được MSAA), `1` = Deferred. Đây chính là giá trị mà bản nháp của giáo án từng ghi ngược — lỗi N2 trong Phụ lục B.",
  },
  {
    id: "q3-6-b",
    sectionId: "3-6",
    q: "Vì sao tắt Mobile HDR đồng nghĩa với việc loại bỏ luôn Mobile Deferred?",
    choices: [
      "Vì deferred cần Mobile HDR bật",
      "Vì deferred cần Vulkan mà Mobile HDR tắt sẽ ép về GLES",
      "Không liên quan — hai thứ độc lập",
      "Vì deferred cần MSAA",
    ],
    answer: 0,
    explain:
      "Mobile Deferred yêu cầu Mobile HDR bật, và bản thân nó không hỗ trợ MSAA. Hai quyết định khoá lẫn nhau: chọn tắt Mobile HDR là đã chọn Forward.",
  },
  {
    id: "q3-7-a",
    sectionId: "3-7",
    q: "Phát biểu nào về `r.MobileHDR=False` là chính xác?",
    choices: [
      "Bắt buộc — Quest không hỗ trợ Mobile HDR",
      "Khuyến nghị mạnh vì hiệu năng, nhưng Mobile HDR vẫn được hỗ trợ trên VR",
      "Chỉ cần tắt khi làm passthrough",
      "Không ảnh hưởng gì tới post-process",
    ],
    answer: 1,
    explain:
      "Bảng tương thích của Meta liệt kê VR MobileHDR là *được hỗ trợ*. Gọi nó là “bắt buộc” làm người đọc hiểu sai bản chất của đánh đổi: tắt là mất toàn bộ post-process (kể cả `StartCameraFade`) để đổi lấy GPU.",
  },
  {
    id: "q3-7-b",
    sectionId: "3-7",
    q: "Sau khi bật `r.Mobile.TonemapSubpass=1`, UI stereo layer vẫn nhận click nhưng mất hẳn hover và animation. Đây là gì?",
    choices: [
      "Lỗi trong code widget của bạn",
      "Bẫy đã ghi nhận: render target của stereo layer bị đóng băng (❓ cơ chế chưa rõ)",
      "Do thiếu `bLiveTexture`",
      "Do vượt quá 16 layer",
    ],
    answer: 1,
    explain:
      "Đây là quan sát thực địa ở Phụ lục A #12: ám vàng toàn màn hình kèm render target UI đóng băng — click vẫn ăn vì trace vẫn chạy, nhưng hình không cập nhật. Một dự án thật đã phải revert. Cơ chế vẫn chưa được xác định, nên nó mang nhãn ❓.",
  },
  {
    id: "q3-7-c",
    sectionId: "3-7",
    q: "Passthrough của bạn blend sai màu. CVar nào phải kiểm tra đầu tiên?",
    choices: [
      "`r.MobileHDR`",
      "`r.Mobile.SceneColorFormat=4`",
      "`vr.MobileMultiView`",
      "`r.MobileMSAA`",
    ],
    answer: 1,
    explain:
      "Format mặc định `PF_FloatR11G11B10` không có kênh alpha, mà việc blend passthrough thì cần alpha. `SceneColorFormat=4` là bắt buộc cho mọi app MR.",
  },
  {
    id: "q3-8-a",
    sectionId: "3-8",
    q: "File ini chỉ có `FoveatedRenderingLevel=Medium`. FFR có bật không?",
    choices: [
      "Có, mức Medium",
      "Không — thiếu `FoveatedRenderingMethod=FixedFoveatedRendering`",
      "Có, nhưng chỉ khi bật Multi-View",
      "Có, nhưng phải khởi động lại app",
    ],
    answer: 1,
    explain:
      "Cần **cả hai** dòng. Xác nhận từ sample chính thức của Meta. Rất có thể đây là lý do FFR “không ăn” trong nhiều dự án cũ — cấu hình trông đúng nhưng thiếu dòng method.",
  },
  {
    id: "q3-9-a",
    sectionId: "3-9",
    q: "Bạn thấy `r.ForwardShading=1` trong `DefaultEngine.ini` của một project Quest. Nhận xét?",
    choices: [
      "Đúng — đó là cách bật forward shading",
      "Sai CVar — đó là của PC-VR; trên Quest phải đặt `r.Mobile.ShadingPath=0`",
      "Thừa nhưng vô hại vì mobile mặc định đã forward",
      "Cần thêm `r.Mobile.ShadingPath=1` đi kèm",
    ],
    answer: 1,
    explain:
      "`r.ForwardShading` điều khiển đường render của desktop renderer. Trên mobile, đường render do `r.Mobile.ShadingPath` quyết định. Dòng đó là dòng chết — và nguy hiểm vì nó tạo cảm giác đã cấu hình xong.",
  },
  {
    id: "q3-9-b",
    sectionId: "3-9",
    q: "Cách trình bày nào đúng nhất về `r.AllowOcclusionQueries=0`?",
    choices: [
      "Nó tắt occlusion culling nên widget trace bị hỏng",
      "Có báo cáo hiện trường làm vỡ hover/click VR widget, nhưng cơ chế chưa xác định — đừng tắt nếu dùng VR widget",
      "Nó an toàn, cứ tắt để tiết kiệm CPU",
      "Nó chỉ ảnh hưởng tới shadow",
    ],
    answer: 1,
    explain:
      "Đây là mục ❓ của tài liệu. Occlusion query thuộc visibility culling, không nằm trên đường trace của widget — nên lời giải thích nhân quả cũ không có căn cứ. Giữ cảnh báo, bỏ cơ chế: đó mới là cách viết trung thực.",
  },
  {
    id: "q3-10-a",
    sectionId: "3-10",
    q: "App tụt còn 60 fps. Núm nào vặn **trước tiên**?",
    choices: [
      "Giảm poly count của asset",
      "`r.ScreenPercentage` (130 → 110 → 100)",
      "Tắt bớt đèn",
      "Giảm MSAA từ 4 xuống 2",
    ],
    answer: 1,
    explain:
      "ScreenPercentage là núm số 1: đổi một dòng, tác động lớn và tuyến tính lên GPU, đảo ngược tức thì. Asset nằm ở cuối danh sách vì sửa asset là công sức không lấy lại được.",
  },
  {
    id: "q3-11-a",
    sectionId: "3-11",
    q: "Không khoá tần số hiển thị thì rủi ro là gì?",
    choices: [
      "App chạy ở 60 Hz",
      "Runtime có thể chọn 90 Hz → ngân sách âm thầm tụt còn 11,1 ms",
      "Compositor tắt reprojection",
      "Không có rủi ro, runtime luôn chọn 72 Hz",
    ],
    answer: 1,
    explain:
      "Quest 3 hỗ trợ nhiều tần số. Nếu bạn không chọn, runtime chọn hộ — và ở 90 Hz mỗi frame chỉ còn 11,1 ms. App vẫn “rớt frame” dù bạn nghĩ mình còn dư ngân sách.",
  },
  {
    id: "q3-13-a",
    sectionId: "3-13",
    q: "App khựng một nhịp mỗi lần một material xuất hiện lần đầu, chạy lại lần hai thì mượt. Profiler không thấy gì. Nguyên nhân?",
    choices: [
      "Thermal throttling",
      "Garbage collection",
      "Thiếu PSO cache — shader pipeline đang được compile lúc chạy",
      "Level streaming đang block",
    ],
    answer: 2,
    explain:
      "Đây là chữ ký kinh điển của PSO: compile xảy ra ở tầng driver nên profiler của Unreal không nhìn thấy, và lần chạy thứ hai đã có cache của driver nên hết khựng. Cách chữa là bundled PSO cache (§3.13).",
  },
  {
    id: "q3-13-b",
    sectionId: "3-13",
    q: "Thiếu dòng nào thì không sinh được file `.shk` cho bundled PSO cache?",
    choices: [
      "`r.ShaderPipelineCache.Enabled=1`",
      "`NeedsShaderStableKeys=true` trong `[DevOptions.Shaders]`",
      "`r.PSOPrecaching=1`",
      "`bShareMaterialShaderCode=True`",
    ],
    answer: 1,
    explain:
      "`.shk` (stable keys) là thứ ánh xạ shader đã cook sang các entry trong log PSO. Không có nó thì bước `ShaderPipelineCacheTools expand` không chạy được — dù ba thiết lập kia đều đúng.",
  },

  // ---------- Chương 4 ----------
  {
    id: "q4-2-a",
    sectionId: "4-2",
    q: "Đoạn code nào compile được trên UE 5.6?",
    code: "// A\nGEngine->XRSystem->SetTrackingOrigin(EHMDTrackingOrigin::Floor);\n\n// B\nGEngine->XRSystem->SetTrackingOrigin(EHMDTrackingOrigin::Stage);",
    lang: "cpp",
    choices: ["Cả hai", "Chỉ A", "Chỉ B", "Không cái nào"],
    answer: 2,
    explain:
      "`Floor` là tên thời UE4 và không tồn tại trong UE5 — code sẽ không compile. UE5 có `Local`, `LocalFloor`, `Stage`; room-scale thì dùng `Stage`. Đây là lỗi N1 trong chính bản nháp của tài liệu.",
  },
  {
    id: "q4-2-b",
    sectionId: "4-2",
    q: "Bạn gọi `Camera->SetRelativeLocation(...)` mỗi frame để dịch người chơi. Kết quả?",
    choices: [
      "Người chơi dịch chuyển bình thường",
      "Không có tác dụng — `bLockToHmd` ghi đè vị trí camera",
      "Người chơi dịch nhưng bị giật",
      "Chỉ có tác dụng khi tắt tracking",
    ],
    answer: 1,
    explain:
      "Với `bLockToHmd = true`, engine ghi đè transform của camera bằng pose HMD mỗi frame. Muốn dịch người chơi thì phải dịch `VROrigin` — cái mà HMD pose được cộng vào.",
  },
  {
    id: "q4-2-c",
    sectionId: "4-2",
    q: "Capsule là root component. Gọi `CapsuleComp->SetRelativeLocation(NewLoc)` sẽ làm gì?",
    choices: [
      "Dịch capsule bên trong actor, actor đứng yên",
      "Dịch cả actor tới `NewLoc` trong world — vì relative của root chính là world",
      "Không làm gì cả",
      "Chỉ dịch nếu actor có physics",
    ],
    answer: 1,
    explain:
      "Root không có parent, nên transform “relative” của nó chính là transform world. Đây là lỗi N4 — compile sạch, chỉ lộ ra lúc chạy khi pawn nhảy về một toạ độ vô nghĩa ngay frame đầu.",
  },
  {
    id: "q4-6-a",
    sectionId: "4-6",
    q: "Bạn vẽ cung teleport trong handler của `ETriggerEvent::Completed`. Kết quả?",
    choices: [
      "Cung vẽ mượt trong lúc giữ nút",
      "Cung chỉ được cập nhật đúng một lần khi thả nút — người chơi không thấy gì trong lúc ngắm",
      "Cung vẽ mỗi frame nhưng lệch một frame",
      "Không khác gì `Triggered`",
    ],
    answer: 1,
    explain:
      "`Completed` bắn đúng một lần khi action kết thúc. Cung cần cập nhật liên tục nên phải nằm ở `Triggered` (bắn mỗi frame); `Completed` là chỗ để *chốt* điểm đến.",
  },
  {
    id: "q4-7-a",
    sectionId: "4-7",
    q: "Người chơi đi bộ thật 1 m sang phải rồi teleport. Không bù `CameraOffset` thì sao?",
    choices: [
      "Không sao — teleport dùng vị trí camera",
      "Họ đáp lệch khoảng 1 m so với chỗ ngắm, vì hệ dịch `VROrigin` chứ không dịch đầu",
      "App crash",
      "Cung teleport không vẽ được",
    ],
    answer: 1,
    explain:
      "Đầu người chơi lệch khỏi tâm `VROrigin` đúng bằng quãng họ đã đi bộ. Nếu bạn đặt `VROrigin` vào điểm đích thì đầu họ rơi lệch đúng bằng offset đó. Phải trừ offset ngang (bỏ Z) ra trước.",
  },

  // ---------- Chương 5 ----------
  {
    id: "q5-1-a",
    sectionId: "5-1",
    q: "Vì sao không nên lấy ray interaction làm mô hình tương tác mặc định cho người mới học VR?",
    choices: [
      "Vì ray tốn hiệu năng",
      "Vì nó biến VR thành con trỏ chuột 3D — mất cảm giác hiện diện, và né luôn phần khó là tương tác chạm",
      "Vì ray không hoạt động với hand tracking",
      "Vì Meta không khuyến nghị ray",
    ],
    answer: 1,
    explain:
      "Ray rất hữu ích cho vật ở xa và cho UI, nhưng nếu là mặc định thì bạn đang làm một giao diện phẳng trong không gian 3D. Contact-based mới dạy được các vấn đề thật: vùng grab, vận tốc thả, physics.",
  },
  {
    id: "q5-2-a",
    sectionId: "5-2",
    q: "Bạn ghi 3 frame vị trí tay rồi tính vận tốc ném bằng `(P2 - P0) / DeltaTime`. Sai ở đâu?",
    code: "FVector V = (Samples[2] - Samples[0]) / DeltaTime;",
    lang: "cpp",
    choices: [
      "Không sai",
      "Phải chia cho (số mẫu − 1) × DeltaTime — vận tốc hiện tại đang bị thổi phồng ~2 lần",
      "Phải dùng `Samples[1]` thay vì `Samples[0]`",
      "Phải nhân với DeltaTime chứ không chia",
    ],
    answer: 1,
    explain:
      "`Samples[2] - Samples[0]` là quãng đường đi trong **hai** khoảng thời gian, nhưng bạn lại chia cho một. Kết quả gấp đôi (hoặc gấp 3–4 nếu lấy nhiều mẫu hơn) — đúng cái bẫy “vật ném ra với vận tốc vô lý” mà chính chương đó cảnh báo. Đây là lỗi N5 trong bản nháp.",
  },
  {
    id: "q5-3-a",
    sectionId: "5-3",
    q: "Khi attach vật vào tay, dùng rule nào?",
    choices: [
      "`KeepRelativeTransform`",
      "`KeepWorldTransform`",
      "`SnapToTarget`",
      "Rule nào cũng được",
    ],
    answer: 1,
    explain:
      "`KeepWorldTransform` giữ vật đúng chỗ nó đang ở lúc bạn cầm. `KeepRelativeTransform` sẽ áp transform tương đối cũ lên parent mới — vật nhảy phốc sang một vị trí khác ngay khoảnh khắc cầm.",
  },
  {
    id: "q5-4-a",
    sectionId: "5-4",
    q: "Vì sao outline bằng post-process không dùng được để highlight trên Quest?",
    choices: [
      "Vì nó tốn quá nhiều GPU",
      "Vì `r.MobileHDR=False` đã loại bỏ post-process — outline đơn giản là không hiện",
      "Vì forward shading không hỗ trợ custom depth",
      "Vì nó xung đột với FFR",
    ],
    answer: 1,
    explain:
      "Đây là hệ quả dây chuyền của quyết định ở chương 3. Không có post-process thì không có custom depth pass để vẽ outline. Cách thay thế là shell mesh: nhân đôi mesh, phóng theo normal bằng `WorldPositionOffset`, material unlit.",
  },
  {
    id: "q5-7-a",
    sectionId: "5-7",
    q: "Vật thả ra thì lơ lửng giữa không trung thay vì rơi. Nguyên nhân?",
    choices: [
      "Quên `SetSimulatePhysics(true)` khi thả",
      "`GrabRadius` quá lớn",
      "Attach sai rule",
      "Thiếu collision trên vật",
    ],
    answer: 0,
    explain:
      "Lúc cầm, bạn tắt physics để attach hoạt động ổn định. Nếu quên bật lại lúc thả thì vật vẫn ở chế độ kinematic — nó giữ nguyên chỗ được thả. Cặp tắt/bật này phải luôn đi liền nhau.",
  },

  // ---------- Chương 6 ----------
  {
    id: "q6-1-a",
    sectionId: "6-1",
    q: "Vì sao chữ vẽ trên world-space widget bị nhoè hơn hẳn so với trên compositor layer?",
    choices: [
      "Vì widget dùng font bitmap",
      "Vì nó đi qua chuỗi resample: ScreenPercentage → FFR → MSAA resolve → reprojection",
      "Vì widget luôn render ở nửa độ phân giải",
      "Vì compositor layer dùng anti-aliasing tốt hơn",
    ],
    answer: 1,
    explain:
      "Mỗi bước lấy mẫu lại làm mất một ít nét, và chúng cộng dồn. Compositor layer được gửi thẳng tới runtime nên đi vòng qua toàn bộ chuỗi đó — đó là lý do duy nhất khiến nó sắc hơn.",
  },
  {
    id: "q6-3-a",
    sectionId: "6-3",
    q: "Menu chính của app nên dùng Stereo Layer Type nào?",
    choices: ["`SLT_FaceLocked`", "`SLT_TrackerLocked`", "`SLT_WorldLocked`", "Tuỳ ý"],
    answer: 2,
    explain:
      "`SLT_WorldLocked` neo menu vào không gian — người dùng quay đầu đi được, đó là hành vi tự nhiên. `SLT_FaceLocked` dán menu vào mặt và chỉ nên dùng cho fade/vignette; menu dán mặt là lý do người ta tháo headset.",
  },
  {
    id: "q6-4-a",
    sectionId: "6-4",
    q: "Bạn đang ở Đường A và muốn menu bị tường che khuất. Nên làm gì?",
    choices: [
      "Bật `bSupportsDepth`",
      "Đặt menu ở không gian trống, tự trace occlusion, dùng `Priority` để xếp layer",
      "Chuyển sang world-space widget vĩnh viễn",
      "Bật `r.Mobile.SceneColorFormat=4`",
    ],
    answer: 1,
    explain:
      "Mobile compositor layer depth testing là fork-only, nên `bSupportsDepth` không đáng tin trên Đường A — và lịch sử còn có báo cáo nó tạo ra mặt phẳng đen đặc. Thiết kế để không cần depth test là cách duy nhất chắc chắn.",
  },
  {
    id: "q6-5-a",
    sectionId: "6-5",
    q: "UI stereo layer của bạn hiển thị đẹp nhưng bấm không ăn. Thiếu gì?",
    choices: [
      "Thiếu `bLiveTexture`",
      "Thiếu `WidgetComponent` ẩn (collision QueryOnly) để nhận trace",
      "Thiếu `Priority`",
      "Thiếu `SetUsingAbsoluteScale`",
    ],
    answer: 1,
    explain:
      "Stereo layer chỉ là ảnh gửi cho compositor — nó không nằm trong world nên không có gì để trace trúng. Kiến trúc kép: `WidgetComponent` ẩn lo tương tác, `StereoLayerComponent` lo hiển thị, hai cái đặt trùng vị trí và trùng tỉ lệ.",
  },
  {
    id: "q6-7-a",
    sectionId: "6-7",
    q: "Vì sao `game.UseStereoLayerUI` là bắt buộc chứ không phải tuỳ chọn?",
    choices: [
      "Vì Meta yêu cầu trong VRC",
      "Vì stereo layer có nhiều cách hỏng âm thầm — cần lật về world-space widget ngay trên device để cô lập vấn đề",
      "Vì nó tiết kiệm hiệu năng",
      "Vì UE 5.6 chưa ổn định phần stereo layer",
    ],
    answer: 1,
    explain:
      "Layer thứ 17 im lặng, `bLiveTexture` bị quên, render target đóng băng vì tonemap subpass — tất cả đều biểu hiện là “UI hỏng”. Một CVar lật qua lại giúp bạn trả lời câu hỏi đầu tiên: lỗi ở tầng layer hay ở tầng widget?",
  },
  {
    id: "q6-9-a",
    sectionId: "6-9",
    q: "Layer hiện đúng frame đầu rồi đứng im, mọi cập nhật UI không lên hình. Nguyên nhân?",
    choices: [
      "Thiếu `bLiveTexture`",
      "Sai `QuadSize`",
      "Vượt 16 layer",
      "Sai `Priority`",
    ],
    answer: 0,
    explain:
      "`bLiveTexture` báo cho compositor biết texture sẽ thay đổi mỗi frame. Không bật, nó coi đó là ảnh tĩnh và chỉ lấy một lần.",
  },

  // ---------- Chương 7 ----------
  {
    id: "q7-2-a",
    sectionId: "7-2",
    q: "Bạn tìm được một tutorial passthrough dùng `UOculusXRPassthroughLayerComponent`. Nên làm gì?",
    choices: [
      "Làm theo — đó là API chính thức",
      "Bỏ qua: API đó đã deprecate từ 5.6, hãy dùng Persistent Passthrough qua `UOculusXRPassthroughSubsystem`",
      "Làm theo nhưng đổi tên class",
      "Làm theo nếu đang ở Đường B",
    ],
    answer: 1,
    explain:
      "Đây là thay đổi phá vỡ của UE 5.6, và phần lớn tutorial trên mạng chưa cập nhật. Đó là lý do chương 7 bắt đầu bằng cảnh báo này trước khi làm bất cứ điều gì khác.",
  },
  {
    id: "q7-2-b",
    sectionId: "7-2",
    q: "Bạn bật passthrough, thiết lập đúng Underlay, nhưng vẫn thấy màn hình đen. Kiểm tra gì tiếp?",
    choices: [
      "Số lượng compositor layer",
      "`r.Mobile.SceneColorFormat=4`, và scene có thật sự trong suốt không (clear color alpha 0, không skybox, không fog)",
      "Tần số hiển thị",
      "Quyền `USE_ANCHOR_API`",
    ],
    answer: 1,
    explain:
      "Passthrough là underlay: nó nằm *dưới* scene của bạn. Nếu scene vẽ đè một mặt phẳng đục (skybox, fog, hoặc scene color không có alpha) thì bạn che mất nó. Ba nguyên nhân của màn đen là: passthrough tắt, sai SceneColorFormat, scene không trong suốt.",
  },
  {
    id: "q7-2-c",
    sectionId: "7-2",
    q: "Bạn kiểm tra trạng thái passthrough ngay trong `BeginPlay` và nhận kết quả sai. Vì sao?",
    choices: [
      "Vì `BeginPlay` chạy trước khi thiết lập được nạp",
      "Vì passthrough khởi tạo bất đồng bộ — vài frame đầu chưa sẵn sàng",
      "Vì cần quyền runtime trước",
      "Vì phải gọi trong `Tick`",
    ],
    answer: 1,
    explain:
      "Khởi tạo passthrough đi qua runtime của hệ điều hành và mất vài frame. Hãy đăng ký callback/kiểm tra lại theo thời gian thay vì giả định trạng thái ở `BeginPlay`.",
  },
  {
    id: "q7-3-a",
    sectionId: "7-3",
    q: "Người dùng **từ chối** quyền `USE_SCENE`. App phải làm gì?",
    choices: [
      "Thoát app",
      "Hỏi lại cho tới khi họ đồng ý",
      "Chuyển sang phòng ảo dự phòng kèm thông báo giải thích rõ ràng",
      "Chạy tiếp với MRUK rỗng",
    ],
    answer: 2,
    explain:
      "Ba trạng thái phải xử lý: cấp + đã quét, cấp + chưa quét (mở Space Setup), và từ chối. Nhánh từ chối phải dẫn tới một trải nghiệm dùng được — không bao giờ là màn đen im lặng, vì người dùng đang bịt mắt.",
  },
  {
    id: "q7-4-a",
    sectionId: "7-4",
    q: "Vì sao `LoadSceneFromJsonString()` đặc biệt hữu ích khi học và khi dạy?",
    choices: [
      "Vì nó nhanh hơn `LoadSceneFromDevice()`",
      "Vì nó cho phép phát lại một phòng đã lưu — bạn test được logic MR mà không cần quét lại phòng mỗi lần",
      "Vì nó không cần quyền",
      "Vì nó chạy được trong PIE",
    ],
    answer: 1,
    explain:
      "Quét phòng là thao tác thủ công tốn thời gian và không lặp lại chính xác được. Nạp từ JSON cho bạn một scene cố định để so sánh kết quả giữa các lần chạy — gần như bắt buộc với một khoá học.",
  },
  {
    id: "q7-5-a",
    sectionId: "7-5",
    q: "Bạn spawn `AStaticMeshActor` rồi gọi `SetStaticMesh()` — mesh không đổi, log có warning. Vì sao?",
    code: "AStaticMeshActor* A = World->SpawnActor<AStaticMeshActor>();\nA->GetStaticMeshComponent()->SetStaticMesh(CubeMesh);  // fail",
    lang: "cpp",
    choices: [
      "Mesh chưa được load",
      "`AStaticMeshActor` spawn ra ở mobility Static — phải `SetMobility(EComponentMobility::Movable)` trước",
      "Phải gọi trong `BeginPlay`",
      "Phải dùng `AActor` thay vì `AStaticMeshActor`",
    ],
    answer: 1,
    explain:
      "Component Static không cho phép đổi mesh lúc chạy vì dữ liệu đã được bake. Gọi `SetMobility(Movable)` trước là đủ. Đây là lỗi N7 trong bản nháp của tài liệu.",
  },
  {
    id: "q7-5-b",
    sectionId: "7-5",
    q: "Trong phòng passthrough xuất hiện những vệt bóng đổ từ chỗ trống không. Nguyên nhân?",
    choices: [
      "Quên `SetVisibility(false)` trên collision proxy",
      "Quên `SetCastShadow(false)` trên collision proxy",
      "Quên `ClearProxies()`",
      "Sai `SetWorldScale3D`",
    ],
    answer: 1,
    explain:
      "Proxy đã ẩn nhưng vẫn đổ bóng — bạn thấy bóng của những vật không tồn tại. Đây là bẫy khó hiểu hơn nhiều so với việc quên `SetVisibility` (khi đó bạn thấy ngay cả đống hộp xám).",
  },
  {
    id: "q7-8-a",
    sectionId: "7-8",
    q: "Cách đúng để lấy tia trỏ của bàn tay là gì?",
    choices: [
      "Lấy hướng từ khớp ngón trỏ",
      "Lấy vector từ cổ tay tới đầu ngón trỏ",
      "Dùng pointer pose từ `UOculusXRInputFunctionLibrary`",
      "Dùng forward vector của `UOculusXRHandComponent`",
    ],
    answer: 2,
    explain:
      "Pointer pose đã được Meta hiệu chỉnh cho thoải mái và ổn định — nó không trùng với hướng ngón trỏ. Tự tính tia từ khớp cho ra một tia rung và mỏi tay khi dùng lâu.",
  },
  {
    id: "q7-8-b",
    sectionId: "7-8",
    q: "Thiết kế tương tác tay trần cho một nút “Xoá tất cả”. Điều nào **sai**?",
    choices: [
      "Chặn hành động khi tracking confidence thấp",
      "Dùng pinch làm cử chỉ xác nhận",
      "Bắt người dùng giữ tay 4 giây để xác nhận",
      "Bù thiếu haptics bằng phản hồi hình ảnh và âm thanh",
    ],
    answer: 2,
    explain:
      "Giữ tay lâu gây mỏi vai (gorilla arm) — mọi thao tác nên xong trong 1–2 giây. Ba lựa chọn kia đều là nguyên tắc đúng: pinch là cử chỉ chuẩn, confidence thấp thì chặn hành động phá huỷ, và tay trần không có haptics.",
  },
  {
    id: "q7-9-a",
    sectionId: "7-9",
    q: "Anchor nạp lại từ phiên trước spawn ở (0,0,0), logcat báo `XR_ERROR_SPACE_COMPONENT_NOT_ENABLED_FB`. Nguyên nhân?",
    choices: [
      "UUID đã hết hạn",
      "Actor được anchor thiếu component `OculusXRSpatialAnchor`",
      "Thiếu quyền `USE_SCENE`",
      "Anchor bị trôi",
    ],
    answer: 1,
    explain:
      "Query trả UUID về thành công, nhưng không có component thì không có gì định vị được không gian đó — nên actor spawn ở gốc toạ độ. Đây là chỗ tốn thời gian nhất của chương 7, và nó chỉ lộ ra trong logcat.",
  },
  {
    id: "q7-9-b",
    sectionId: "7-9",
    q: "Bạn cache transform của anchor lúc tạo để khỏi query lại. Hệ quả?",
    choices: [
      "Tiết kiệm được vài ms mỗi frame, không có nhược điểm",
      "Vật ảo dần lệch khỏi chỗ thật, vì anchor trôi khi runtime hiệu chỉnh lại hiểu biết về phòng",
      "App crash khi mất tracking",
      "Không lưu được UUID nữa",
    ],
    answer: 1,
    explain:
      "Anchor không phải toạ độ cố định — nó là tham chiếu tới một điểm thật, và runtime cập nhật lại vị trí đó khi hiểu phòng rõ hơn. Cache transform là tự tay đóng băng một giá trị đang được sửa.",
  },
  {
    id: "q7-9-c",
    sectionId: "7-9",
    q: "Debug MR, lỗi xảy ra nhưng log của Unreal sạch trơn. Bước tiếp theo?",
    choices: [
      "Gắn debugger vào tiến trình",
      "Mở `adb logcat` — lỗi tầng OpenXR của Meta không nổi lên log Unreal",
      "Bật `stat unit`",
      "Chạy RenderDoc",
    ],
    answer: 1,
    explain:
      "Đây là quy tắc chung của chương 7: logcat trước, debugger sau. Các lỗi từ OpenXR layer của Meta (anchor, scene, passthrough) chỉ xuất hiện trong logcat của Android.",
  },

  // ---------- Chương 8 ----------
  {
    id: "q8-2-a",
    sectionId: "8-2",
    q: "Vì sao `StartCameraFade` không dùng được trên Quest?",
    choices: [
      "Vì nó chỉ hoạt động với Cinematic Camera",
      "Vì nó dựa trên post-process — đã chết khi `r.MobileHDR=False` — và dù có chạy cũng không chạm được compositor layer",
      "Vì nó không được Meta XR plugin hỗ trợ",
      "Vì nó chỉ chạy trên PIE",
    ],
    answer: 1,
    explain:
      "Hai lý do độc lập, mỗi lý do đủ để loại nó. Đây là ví dụ điển hình của hệ quả dây chuyền: quyết định renderer ở chương 3 quyết định luôn cách bạn fade ở chương 8.",
  },
  {
    id: "q8-3-a",
    sectionId: "8-3",
    q: "Đoạn fade nào chạy đúng trên Quest?",
    code: "// A\nSetColorScaleAndOffset(FLinearColor::White,\n    FLinearColor(-Alpha, -Alpha, -Alpha, 0.f), true);\n\n// B\nSetColorScaleAndOffset(FLinearColor(Alpha, Alpha, Alpha, 1.f),\n    FLinearColor::Black, true);",
    lang: "cpp",
    choices: ["Cả hai", "Chỉ A", "Chỉ B", "Không cái nào"],
    answer: 2,
    explain:
      "Mobile/Quest **không hỗ trợ Color Offset** — cách A chạy đúng trên PC-VR rồi im lặng không làm gì trên Quest, kiểu lỗi tệ nhất. Fade trên Quest là kéo ColorScale về 0.",
  },
  {
    id: "q8-3-b",
    sectionId: "8-3",
    q: "Fade chạy, scene tối dần, nhưng menu vẫn sáng rực giữa màn đen. Thiếu gì?",
    choices: [
      "`bApplyToAllLayers = true`",
      "`bLiveTexture`",
      "`SLT_FaceLocked`",
      "`r.Mobile.SceneColorFormat=4`",
    ],
    answer: 0,
    explain:
      "Menu nằm trên compositor layer riêng. Không đặt `bApplyToAllLayers = true` thì color scale chỉ áp cho eye buffer, còn layer thì không — bạn được một màn đen với cái menu phát sáng.",
  },
  {
    id: "q8-4-a",
    sectionId: "8-4",
    q: "Vì sao watchdog cho quá trình load được xếp là vấn đề **an toàn**, không phải tính năng?",
    choices: [
      "Vì VRC bắt buộc",
      "Vì người dùng đang bịt kín mắt — load treo nghĩa là họ kẹt trong bóng tối, không biết chuyện gì đang xảy ra",
      "Vì nó ngăn memory leak",
      "Vì nó giúp giữ 72 fps",
    ],
    answer: 1,
    explain:
      "Trên màn hình phẳng, một màn load treo là phiền. Trong headset, nó là mất phương hướng hoàn toàn. Watchdog phải luôn đưa người dùng về một trạng thái có thông tin — kể cả là một thông báo lỗi.",
  },
  {
    id: "q8-5-a",
    sectionId: "8-5",
    q: "`LoadStreamLevel(..., bShouldBlockOnLoad = true)` gây ra chuyện gì trong VR?",
    choices: [
      "Load nhanh hơn, không vấn đề gì",
      "Hình đóng băng trong khi đầu vẫn quay — mất head tracking cảm nhận, gây say gần như tức thì",
      "Level không hiện ra",
      "App crash",
    ],
    answer: 1,
    explain:
      "Block on load làm game thread đứng, nên không có frame mới nào được gửi cho compositor. Compositor vẫn reproject frame cũ, nhưng ảnh không cập nhật theo chuyển động — đúng công thức gây say. Luôn để `false`.",
  },

  // ---------- Chương 9 ----------
  {
    id: "q9-1-a",
    sectionId: "9-1",
    q: "Số đo nào **dùng được** để kết luận về hiệu năng?",
    choices: [
      "Development build, trên device, 10 phút",
      "Shipping build, qua Quest Link, 30 phút",
      "Shipping build, trên device, 25 phút",
      "Development build, trong PIE, 30 phút",
    ],
    answer: 2,
    explain:
      "Cần đủ cả ba điều kiện: device thật (Link đo hiệu năng của PC), Shipping (Development bi quan và sai lệch), và 25–30 phút (để thermal throttling kịp xuất hiện).",
  },
  {
    id: "q9-2-a",
    sectionId: "9-2",
    q: "Trace Perfetto đầu tiên của bạn không có dữ liệu app Unreal nào. Vì sao?",
    choices: [
      "Vì phải build Development",
      "Vì Unreal chỉ phát ATrace — cần cấu hình ATrace Categories và ATrace Apps",
      "Vì Perfetto không hỗ trợ Unreal",
      "Vì thiếu quyền root",
    ],
    answer: 1,
    explain:
      "Đây là bẫy làm nhiều người kết luận “Perfetto vô dụng với Unreal”. Unreal không phát systrace marker mặc định; bạn phải khai báo ATrace Categories và ATrace Apps trong MQDH. Nhớ đổi tên trace ngay sau khi ghi — chúng dùng chung tên mặc định.",
  },
  {
    id: "q9-3-a",
    sectionId: "9-3",
    q: "`stat unit` cho: Frame 18.2, Game 5.1, Draw 12.9, GPU 7.4. Vặn núm nào?",
    choices: [
      "Giảm `r.ScreenPercentage`",
      "Giảm số draw call — gộp mesh, bớt actor hiển thị, ít material slot hơn",
      "Tối ưu Blueprint tick",
      "Giảm MSAA",
    ],
    answer: 1,
    explain:
      "Draw là số lớn nhất → nút thắt nằm ở render thread, tức là số draw call. Giảm ScreenPercentage hay MSAA chỉ hạ GPU (7.4 ms — đang dư), còn tối ưu Blueprint chỉ hạ Game (5.1 ms). Cả hai đều không cứu được frame time.",
  },
  {
    id: "q9-4-a",
    sectionId: "9-4",
    q: "Bạn giảm ScreenPercentage, hạ MSAA và tắt hai đèn cùng lúc — fps lên. Vấn đề của cách làm này?",
    choices: [
      "Không có vấn đề gì",
      "Bạn không biết thay đổi nào có tác dụng, nên đang trả giá về chất lượng hình cho cả những thay đổi vô ích",
      "Ba thay đổi đó xung đột nhau",
      "Phải build lại giữa mỗi lần đổi",
    ],
    answer: 1,
    explain:
      "Đổi một thứ rồi đo lại. Nếu chỉ ScreenPercentage đã đủ, bạn vừa hy sinh MSAA và hai cái đèn mà chẳng được gì. Đó là chi phí vĩnh viễn cho một thông tin bạn không có.",
  },
  {
    id: "q9-8-a",
    sectionId: "9-8",
    q: "Fps ổn định 5 phút đầu, tụt dần từ phút 15, tới phút 25 thì khoảng một nửa. Nguyên nhân?",
    choices: [
      "Memory leak",
      "Thermal throttling — hệ thống hạ tần số rồi tăng minVsyncs",
      "Thiếu PSO cache",
      "Level streaming",
    ],
    answer: 1,
    explain:
      "Chữ ký của nhiệt là suy giảm theo thời gian chứ không theo nội dung. Thiếu PSO cache thì khựng ở lần đầu gặp material và hết ở lần chạy sau; memory leak thường biểu hiện là Game time tăng dần chứ không phải fps rơi theo bậc.",
  },
  {
    id: "q9-8-b",
    sectionId: "9-8",
    q: "App mượt qua Quest Link nhưng tệ khi build lên device. Kết luận?",
    choices: [
      "Có lỗi trong build Android",
      "Bình thường — qua Link, PC làm phần nặng; chỉ số trên device mới là số thật",
      "Do thiếu FFR",
      "Do sai NDK",
    ],
    answer: 1,
    explain:
      "Qua Link, GPU của PC render còn Quest chỉ hiển thị. Nó không nói gì về hiệu năng standalone. Đây chính là lý do quy tắc “deploy lên device ít nhất 1 lần/tuần” tồn tại.",
  },

  // ---------- Chương 10 ----------
  {
    id: "q10-2-a",
    sectionId: "10-2",
    q: "Quy tắc “viết *vì sao*, không chỉ *cái gì*” giải quyết vấn đề gì?",
    choices: [
      "Làm tài liệu dài hơn cho chuyên nghiệp",
      "Một dòng không có lý do là dòng không ai dám xoá — và cũng không ai biết khi nào ngoại lệ là hợp lý",
      "Giúp SEO tốt hơn",
      "Đáp ứng yêu cầu của VRC",
    ],
    answer: 1,
    explain:
      "Biết `r.MobileHDR` nên là `False` mà không biết vì sao thì bạn không thể đánh giá khi nào ngoại lệ là hợp lý — và ngoại lệ trong VR xuất hiện thường xuyên hơn bạn nghĩ. Đây cũng là tiêu chí chấm điểm của bài Phụ lục D.",
  },
  {
    id: "q10-4-a",
    sectionId: "10-4",
    q: "App của bạn hiện màn đen 6 giây khi khởi động rồi mới vào scene. Vấn đề?",
    choices: [
      "Không sao nếu dưới 10 giây",
      "Vi phạm VRC: phải có ảnh có head-tracking trong vòng 4 giây",
      "Chỉ vi phạm nếu không có splash screen",
      "Chỉ là khuyến nghị, không phải yêu cầu",
    ],
    answer: 1,
    explain:
      "Mốc 4 giây là cho ảnh có head-tracking (splash screen của OS tính là hợp lệ). Mốc 10 giây là cho entitlement check — hai yêu cầu khác nhau, đừng nhầm lẫn.",
  },

  // ---------- Phụ lục D ----------
  {
    id: "qd-1-a",
    sectionId: "d-1",
    q: "Trong file config của bài tập, vì sao `r.MobileHDR=True` và `r.Mobile.ShadingPath=1` không thể **cùng đúng**?",
    choices: [
      "Chúng thực ra tương thích với nhau",
      "Deferred cần Mobile HDR bật, nhưng Quest lại cần Mobile HDR tắt vì hiệu năng — hai dòng này kéo ngược nhau",
      "`ShadingPath=1` là Forward nên không liên quan",
      "Vì Multi-View không hỗ trợ deferred",
    ],
    answer: 1,
    explain:
      "Đây là điểm thưởng của bài tập: đọc config như một hệ thống có ràng buộc lẫn nhau chứ không phải một danh sách dòng độc lập. Cấu hình đúng cho Quest là `r.MobileHDR=False` + `r.Mobile.ShadingPath=0`.",
  },
  {
    id: "qd-1-b",
    sectionId: "d-1",
    q: "`bBuildForX8664=True` trong config của một project Quest 3 gây ra chuyện gì?",
    choices: [
      "Build fail",
      "APK phình to vô ích và build lâu hơn — Quest 3 là arm64",
      "App không chạy được trên device",
      "Không ảnh hưởng gì",
    ],
    answer: 1,
    explain:
      "Nó không làm hỏng gì, chỉ lãng phí — và lãng phí âm thầm là loại lỗi dễ tồn tại lâu nhất trong một project. VRC còn giới hạn APK dưới 1 GB, nên mỗi MB thừa đều có giá.",
  },
];

const BY_SECTION: Record<string, QuizQuestion[]> = {};
for (const q of QUIZZES) (BY_SECTION[q.sectionId] ??= []).push(q);

export function quizFor(sectionId: string): QuizQuestion[] {
  return BY_SECTION[sectionId] ?? [];
}

export function hasQuiz(sectionId: string): boolean {
  return (BY_SECTION[sectionId]?.length ?? 0) > 0;
}

export const quizSectionIds = Object.keys(BY_SECTION);
