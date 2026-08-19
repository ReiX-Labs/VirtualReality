// The 7-week hands-on roadmap from "Cách dùng tài liệu này", expanded into
// checkable exercises.
//
// Reading about 13,8 ms teaches you nothing until you have watched your own
// frame time blow past it on a real Quest. Each week has one flagship build
// plus smaller drills, with acceptance criteria spelled out so you know when
// you are actually done — most of them can only be ticked ON DEVICE.

export interface Exercise {
  id: string;
  week: number;
  title: string;
  /** what you build */
  brief: string;
  /** how you know it works */
  done: string[];
  /** lesson ids that carry the theory */
  sectionIds: string[];
  difficulty: "dễ" | "vừa" | "khó";
  /** flagship build for the week */
  flagship?: boolean;
}

export interface Week {
  week: number;
  theme: string;
  focus: string;
  exercises: Exercise[];
}

const EXERCISES: Exercise[] = [
  // ---- Tuần 0 — hạ tầng (Chương 0, 1) ----
  {
    id: "w0-accounts",
    week: 0,
    title: "Ba tài khoản verify xong",
    brief:
      "Tạo và verify Meta Developer (SMS 2FA — đừng phí thời gian với PayPal), tạo GitHub, rồi liên kết Epic ↔ GitHub. Làm việc này TRƯỚC mọi thứ khác vì verify có thể mất vài ngày và không có cách ép nhanh hơn.",
    done: [
      "Tài khoản Meta Developer ở trạng thái verified",
      "Nhận và **bấm link xác nhận** trong email mời từ GitHub",
      "`EpicGames` xuất hiện ở github.com/settings/organizations",
      "Mở được repo `Oculus-VR/UnrealEngine` mà không nhận 404",
    ],
    sectionIds: ["0-3", "1-3"],
    difficulty: "dễ",
    flagship: true,
  },
  {
    id: "w0-adb",
    week: 0,
    title: "Developer Mode và `adb devices`",
    brief:
      "Bật Developer Mode trên Quest 3, cắm cáp data, chạy `adb devices` cho tới khi ra trạng thái `device`. Ghi lại bạn đã gặp trạng thái nào trên đường đi.",
    done: [
      "`adb devices` in ra `<serial>   device`",
      "Giải thích được ba trạng thái trống / `unauthorized` / `offline` và cách xử lý từng cái",
      "MQDH thấy headset; đã tắt Proximity Sensor và Guardian",
    ],
    sectionIds: ["0-4", "0-5"],
    difficulty: "dễ",
  },
  {
    id: "w0-earlywin",
    week: 0,
    title: "Phần thưởng sớm — VR Template lên máy trong 20 phút",
    brief:
      "Tạo project từ VR Template, package Android, `adb install`, đeo lên. Chưa cần hiểu gì cả — mục tiêu là cầm được app của chính mình trong headset trước khi đọc lý thuyết.",
    done: [
      "App xuất hiện trong **Library → Unknown Sources**",
      "App mở thẳng vào chế độ VR, xoay đầu mượt",
      "Bạn ghi lại tổng thời gian thực tế của vòng lặp build → deploy",
    ],
    sectionIds: ["0-6", "3-14"],
    difficulty: "vừa",
  },
  {
    id: "w0-tag",
    week: 0,
    title: "Tự xác minh chuỗi tag của Meta",
    brief:
      "Vào tab Tags của repo fork, lọc `5.6`, ghi lại **tên tag chính xác** với Meta XR version cao nhất. Đối chiếu với §1.4 — tài liệu ghi `oculus-5.6.1-release-v83` nhưng gắn nhãn ⚠️ vì suy từ quy ước đặt tên.",
    done: [
      "Ghi được tên tag chính xác vào sổ tay của bạn",
      "So sánh với §1.4; nếu lệch thì sửa lại và **ghi ngày sửa**",
      "Giải thích được vì sao không dùng nút Code ở trang chủ repo",
    ],
    sectionIds: ["1-4", "1-2"],
    difficulty: "vừa",
  },
  {
    id: "w0-plugin",
    week: 0,
    title: "Đường A — đặt plugin Meta XR đúng chỗ",
    brief:
      "Tải zip từ trang tag, copy `Engine/Plugins/Marketplace/MetaXR/` vào `UE_5.6/Engine/Plugins/Marketplace/`, tắt plugin OculusVR cũ, mở project và kiểm tra.",
    done: [
      "**Project Settings → Plugins → Meta XR** hiện ra",
      "Plugin OculusVR (deprecated) đã tắt",
      "Editor **không** build hàng nghìn file — nếu có, bạn đã lạc sang Đường B",
      "Trả lời được: “tôi đi Đường A hay B, và vì sao”",
    ],
    sectionIds: ["1-7", "1-6", "1-9"],
    difficulty: "vừa",
  },
  {
    id: "w0-gitignore",
    week: 0,
    title: "`.gitignore` và bài học dung lượng",
    brief:
      "Viết `.gitignore`, `git init`, commit lần đầu, chạy `git count-objects -vH`. Sau đó **cố tình** bỏ `Binaries/` và `Intermediate/` khỏi ignore, add lại và so sánh dung lượng.",
    done: [
      "Ghi lại con số chênh lệch dung lượng giữa hai lần",
      "`Config/` nằm trong repo, `Saved/ Intermediate/ Binaries/ DerivedDataCache/` thì không",
      "Nêu được quy tắc: engine sinh lại được → ignore; công sức người → commit",
    ],
    sectionIds: ["1-11", "1-12"],
    difficulty: "dễ",
  },

  // ---- Tuần 1 — nền móng (Chương 2, 3) ----
  {
    id: "w1-baseline",
    week: 1,
    title: "Baseline Quest 3 build được và giữ 72 fps",
    brief:
      "Dọn VR Template, đặt toolchain (NDK 25.1.8937393, min 32 / target 34), chạy Project Setup Tool có đọc từng cảnh báo, cấu hình Forward + Vulkan + Multi-View, tắt Lumen/VSM, khoá tần số hiển thị, dựng PSO cache, package Shipping.",
    done: [
      "APK cài được, app mở thẳng vào VR (`bStartInVR`)",
      "Hình head-tracked trong vòng **4 giây** từ lúc mở",
      "**≥72 fps ổn định** đo bằng OVR Metrics Tool / MQDH",
      "**Test liên tục 25–30 phút**: fps không tụt khi máy nóng",
      "Đi qua toàn bộ nội dung 2 lần — lần 2 không còn khựng (PSO cache có tác dụng)",
      "Số liệu cuối lấy từ build **Shipping**",
      "`git diff` của `Config/` đã được review và hiểu, không phải “Setup Tool sửa gì đó”",
    ],
    sectionIds: ["3-2", "3-3", "3-5", "3-6", "3-11", "3-13", "3-15"],
    difficulty: "khó",
    flagship: true,
  },
  {
    id: "w1-appendixD",
    week: 1,
    title: "Bài tập config gài lỗi (Phụ lục D)",
    brief:
      "Đọc `DefaultEngine.ini` ở §D.1 và tìm **9 lỗi**. Với mỗi lỗi ghi rõ: sai ở đâu, hậu quả là gì, sửa thành gì. Làm xong mới xem đáp án §D.2.",
    done: [
      "Tìm được ≥7/9 lỗi",
      "Với mỗi lỗi tìm ra, **giải thích được hậu quả** chứ không chỉ giá trị đúng",
      "Điểm thưởng: phát hiện mâu thuẫn giữa `r.MobileHDR` và `r.Mobile.ShadingPath`",
      "Ghi ra được hai dòng “không phải lỗi nhưng đáng để ý”",
    ],
    sectionIds: ["d-1", "d-2", "3-6", "3-7", "3-9"],
    difficulty: "vừa",
  },
  {
    id: "w1-observe",
    week: 1,
    title: "30 phút quan sát app thương mại",
    brief:
      "Đeo Quest 3, dùng 3–4 app thương mại trong 30 phút. Không code. Ghi lại: chúng cho bạn di chuyển thế nào; menu gắn vào tay hay gắn vào không gian; app nào làm bạn hơi choáng và bạn nghĩ vì sao.",
    done: [
      "Có ghi chú cho từng app về locomotion và vị trí menu",
      "Xác định được ít nhất một khoảnh khắc gây khó chịu và giả thuyết nguyên nhân",
      "Tự trả lời được (không mở tài liệu): vì sao chữ VR bị nhoè và vì sao compositor layer làm nó sắc",
    ],
    sectionIds: ["2-5", "2-6", "2-8"],
    difficulty: "dễ",
  },
  {
    id: "w1-ffr",
    week: 1,
    title: "Chứng minh FFR thực sự bật",
    brief:
      "Đặt **cả hai** dòng `FoveatedRenderingMethod` và `FoveatedRenderingLevel`, deploy, đo. Sau đó bỏ dòng `Method` đi và đo lại — chênh lệch (hoặc không chênh lệch) chính là bằng chứng.",
    done: [
      "Ghi lại GPU time ở ba trạng thái: không FFR, chỉ có Level, có cả hai dòng",
      "Kết luận được vì sao thiếu dòng `Method` thì FFR im lặng không bật",
      "Thử thêm chế độ dynamic và ghi nhận khác biệt",
    ],
    sectionIds: ["3-8", "3-10"],
    difficulty: "vừa",
  },

  // ---- Tuần 2 — VR Pawn (Chương 4) ----
  {
    id: "w2-pawn",
    week: 2,
    title: "Viết `AVRPawn` từ đầu",
    brief:
      "Gõ lại (không copy-paste) toàn bộ pawn theo §4.3–4.4: VROrigin ở sàn, camera `bLockToHmd`, hai motion controller kèm `XRDeviceVisualization`, tracking origin `Stage`, capsule bám theo đầu, Enhanced Input với snap turn và teleport.",
    done: [
      "Đứng lên / ngồi xuống — chiều cao khớp thực tế",
      "Hai controller hiện đúng model Quest, đúng vị trí, không trễ",
      "Snap turn có deadzone, không xoay liên tục khi giữ cần",
      "Teleport: arc hiện khi giữ, nhảy đúng chỗ khi thả",
      "**Đi bộ thật sang góc phòng rồi teleport → vẫn đáp đúng chỗ** (bù `CameraOffset`)",
      "Đi bộ thật vào tường → capsule chặn được",
      "Vẫn ≥72 fps",
    ],
    sectionIds: ["4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "4-9"],
    difficulty: "khó",
    flagship: true,
  },
  {
    id: "w2-noorigin",
    week: 2,
    title: "Cố tình bỏ `SetTrackingOrigin`",
    brief:
      "Xoá dòng `SetTrackingOrigin`, build lên device, đeo lên và quan sát. Ghi lại cảm giác. Sau đó thêm lại. Đây là cách nhanh nhất để dòng đó không bao giờ bị quên nữa.",
    done: [
      "Mô tả được cụ thể bạn thấy gì (lùn, lơ lửng, hay lệch chiều cao)",
      "Giải thích được vì sao `EHMDTrackingOrigin::Floor` không compile trên UE5",
      "Nêu đúng ba giá trị hợp lệ và lý do chọn `Stage`",
    ],
    sectionIds: ["4-2"],
    difficulty: "dễ",
  },
  {
    id: "w2-snapturn",
    week: 2,
    title: "Hiệu chỉnh snap turn theo cảm giác",
    brief:
      "Đặt `SnapTurnDegrees` lần lượt 15, 30, 45, 90. Test từng mức trên device. Không có đáp án đúng — mục đích là xây trực giác comfort của chính bạn.",
    done: [
      "Test đủ bốn giá trị trên device thật",
      "Ghi lại giá trị bạn thấy dễ chịu nhất **và vì sao**",
      "So sánh với giá trị mà VR Template dùng",
    ],
    sectionIds: ["4-7", "2-5"],
    difficulty: "dễ",
  },
  {
    id: "w2-compare",
    week: 2,
    title: "So pawn của bạn với pawn của VR Template",
    brief:
      "Mở cả hai, liệt kê 3 thứ template làm mà bạn chưa làm. Với mỗi thứ, quyết định có đáng thêm không và ghi lý do.",
    done: [
      "Liệt kê đủ 3 điểm khác biệt cụ thể",
      "Mỗi điểm có một quyết định kèm lý do (thêm / không thêm)",
    ],
    sectionIds: ["4-9", "3-2"],
    difficulty: "vừa",
  },

  // ---- Tuần 3 — tương tác (Chương 5) ----
  {
    id: "w3-grab",
    week: 3,
    title: "Grab contact-based với `IGrabbable`",
    brief:
      "Dựng `UGrabberComponent` + interface `IGrabbable`. Cài đặt cho **ba loại vật**: khối hộp (nắm đâu cũng được), cái cốc (nắm ở quai), cây bút (nắm ở thân, định hướng theo tay) — mà **không sửa một dòng nào trong Grabber**.",
    done: [
      "Nắm được vật bằng cả hai tay (không cùng lúc một vật)",
      "Thả ra vật rơi tự nhiên; ném được với vận tốc hợp lý (trung bình 3–4 frame, chia đúng (n−1)×dt)",
      "Physics tắt khi cầm và **bật lại khi thả**",
      "Attach dùng `KeepWorldTransform`",
      "Nếu phải sửa Grabber để hỗ trợ loại vật mới → kiến trúc đang rò rỉ trách nhiệm, làm lại",
      "Có rung khi nắm, dưới 100 ms",
    ],
    sectionIds: ["5-1", "5-2", "5-3", "5-5", "5-7", "5-8"],
    difficulty: "khó",
    flagship: true,
  },
  {
    id: "w3-priority",
    week: 3,
    title: "Chấm điểm ưu tiên khi hai vật sát nhau",
    brief:
      "Đặt hai vật cách nhau 5 cm rồi đưa tay vào giữa. Vật nào được chọn? Sửa `GetGrabPriority` cho tới khi kết quả khớp trực giác của bạn **khi đang đeo headset**, không phải khi nhìn từ editor.",
    done: [
      "Kết quả chọn vật khớp trực giác ở ít nhất 8/10 lần thử",
      "`GrabRadius` ở mức ~10 cm, không phóng đại để “dễ nắm”",
      "Mô tả được tiêu chí chấm điểm bạn đã dùng",
    ],
    sectionIds: ["5-2", "5-7"],
    difficulty: "vừa",
  },
  {
    id: "w3-shell",
    week: 3,
    title: "Highlight bằng shell mesh và đo giá của nó",
    brief:
      "Dựng shell mesh outline (scale ~1,03, unlit, `WorldPositionOffset = VertexNormalWS * Thickness`, tắt collision và shadow). Bật `stat SceneRendering` trên device, so số draw call khi có và không highlight.",
    done: [
      "Highlight hiện khi tay lại gần, tắt khi ra xa",
      "Ghi lại con số draw call chênh lệch cụ thể",
      "Chỉ highlight **một** vật tại một thời điểm",
      "Giải thích được vì sao post-process outline không dùng được ở đây",
    ],
    sectionIds: ["5-4", "3-7"],
    difficulty: "vừa",
  },

  // ---- Tuần 4 — UI (Chương 6) ----
  {
    id: "w4-stereoui",
    week: 4,
    title: "Menu world-locked sắc nét, có đường lùi",
    brief:
      "Dựng menu theo kiến trúc kép: `WidgetComponent` ẩn (QueryOnly) cho tương tác + `StereoLayerComponent` cho hiển thị. Thêm `UWidgetInteractionComponent` với tia ngắm nhìn thấy được, và CVar `game.UseStereoLayerUI` để lật qua lại ngay trên device.",
    done: [
      "Chữ **sắc nét rõ rệt** hơn bản world-space (dựng menu cỡ chữ 14pt để thấy rõ)",
      "`game.UseStereoLayerUI 0/1` đổi được ngay trên device",
      "Menu world-locked: nhìn đi chỗ khác thì nó ở yên",
      "Trỏ vào nút có hover, có tia ngắm và chấm hit nhìn thấy được",
      "UI có animation vẫn chạy → `bLiveTexture` đã bật",
      "Ghi lại: ở khoảng cách nào bản world-space không đọc được nữa mà stereo layer vẫn đọc được",
      "Vẫn ≥72 fps khi menu mở",
    ],
    sectionIds: ["6-1", "6-2", "6-3", "6-5", "6-6", "6-7", "6-10"],
    difficulty: "khó",
    flagship: true,
  },
  {
    id: "w4-facelocked",
    week: 4,
    title: "FaceLocked vs WorldLocked — 2 phút mỗi bên",
    brief:
      "Đặt menu ở `SLT_FaceLocked`, dùng thử 2 phút. Đổi sang `SLT_WorldLocked`, dùng thử 2 phút. Viết 3 câu về khác biệt cảm giác. Bài này dạy comfort tốt hơn mọi lý thuyết.",
    done: [
      "Có 3 câu ghi lại khác biệt cảm giác cụ thể",
      "Nêu được trường hợp duy nhất `SLT_FaceLocked` là đúng (fade / vignette)",
    ],
    sectionIds: ["6-3", "2-5"],
    difficulty: "dễ",
  },
  {
    id: "w4-17layers",
    week: 4,
    title: "Spawn 20 stereo layer và quan sát layer thứ 17",
    brief:
      "Cố tình spawn 20 layer cùng lúc. Quan sát chuyện gì xảy ra từ layer thứ 17 trở đi, và tìm xem có bất kỳ cảnh báo nào trong log không.",
    done: [
      "Xác nhận layer thứ 17+ **im lặng không hiện** — không lỗi, không warning",
      "Đếm được số layer app của bạn đang thực sự dùng, và còn xa mức 16",
    ],
    sectionIds: ["6-2", "6-9", "2-6"],
    difficulty: "dễ",
  },
  {
    id: "w4-occlusion",
    week: 4,
    title: "Tự trace occlusion cho menu",
    brief:
      "Cài đặt phương án 2 của §6.4: tự trace để biết menu có bị che không, rồi ẩn/mờ menu tương ứng. So sánh cảm giác với việc để menu xuyên tường.",
    done: [
      "Menu không còn “nổi” xuyên qua tường một cách vô lý",
      "Không phụ thuộc vào `bSupportsDepth`",
      "Dùng `Priority` để xếp thứ tự giữa các layer với nhau",
    ],
    sectionIds: ["6-4", "6-3"],
    difficulty: "khó",
  },

  // ---- Tuần 5 — Mixed Reality (Chương 7) ----
  {
    id: "w5-mr",
    week: 5,
    title: "Passthrough + MRUK + collision proxy + fallback",
    brief:
      "Bật Persistent Passthrough (Epic Native OpenXR, Underlay, `SceneColorFormat=4`, scene trong suốt), xin quyền `USE_SCENE` lúc chạy, nạp room bằng MRUK, sinh collision proxy vô hình, và viết đủ **cả ba nhánh** trạng thái quyền.",
    done: [
      "Thấy phòng thật qua passthrough; vật ảo hiển thị đúng trên nền trong suốt",
      "Scene nạp được, anchor khớp vị trí thật",
      "Ném bóng vật lý vào tường thật → **bóng nảy**",
      "Collision proxy vô hình **và không đổ bóng**",
      "Nạp lại scene không sinh proxy trùng (`ClearProxies()`)",
      "Từ chối quyền → chế độ phòng ảo có thông báo rõ ràng, **không treo**",
      "Chưa quét phòng → hướng dẫn mở Space Setup",
      "Lưu phòng ra JSON, xoá scene, nạp lại từ JSON — kết quả giống nhau",
      "Vẫn ≥72 fps với passthrough bật (passthrough tốn thêm — đo lại)",
    ],
    sectionIds: ["7-2", "7-3", "7-4", "7-5", "7-6", "7-11"],
    difficulty: "khó",
    flagship: true,
  },
  {
    id: "w5-visible-first",
    week: 5,
    title: "Spawn proxy **nhìn thấy được** trước",
    brief:
      "Nạp Scene và spawn một khối hộp có nhìn thấy được ở mỗi anchor. Xác nhận vị trí tường/sàn/bàn khớp thực tế, **rồi mới** chuyển sang vô hình. Làm ngược lại thì bạn không biết dữ liệu có đúng không.",
    done: [
      "Đối chiếu bằng mắt từng khối với vật thật tương ứng",
      "Chỉ ẩn proxy sau khi đã xác nhận vị trí",
      "Giải thích được vì sao `SetStaticMesh` cần `SetMobility(Movable)` trước",
    ],
    sectionIds: ["7-5", "7-4"],
    difficulty: "vừa",
  },
  {
    id: "w5-hands",
    week: 5,
    title: "Hand tracking — tay trần cầm được vật",
    brief:
      "Bật *Controllers and Hands*, thêm `UOculusXRHandComponent` làm con của motion controller. Deploy, đặt controller xuống, dùng tay trần cầm một vật đã làm ở tuần 3.",
    done: [
      "Tay hiện ra, controller ẩn đi khi bạn đặt xuống",
      "**Tay tự biến mất khi đưa ra sau lưng** (mất tracking)",
      "In tracking confidence ra debug; ghi lại confidence tụt trong tình huống nào (che tay, ra rìa tầm nhìn, vẫy nhanh)",
      "Nắm được vật bằng tay trần, có phản hồi thị giác + âm thanh thay cho rung",
      "Vùng grab đã nới rộng hơn so với bản dùng controller",
      "Ghi lại chỗ nào khó chịu hơn so với controller",
    ],
    sectionIds: ["7-8", "5-2"],
    difficulty: "khó",
  },
  {
    id: "w5-anchors",
    week: 5,
    title: "Anchor sống sót qua việc đóng mở app",
    brief:
      "Đặt một vật, tạo anchor, lưu UUID bằng SaveGame (ghi đĩa ngay). **Đóng hẳn app, mở lại.** Vật phải ở đúng chỗ cũ. Sau đó đặt 3 anchor, xoá 1, khởi động lại và kiểm tra đồng bộ.",
    done: [
      "Vật quay lại đúng chỗ sau khi mở lại app",
      "Nếu nó ở (0,0,0): chạy `adb logcat`, tìm `XR_ERROR_SPACE_COMPONENT_NOT_ENABLED_FB`, và thêm component `OculusXRSpatialAnchor`",
      "Đặt 3 anchor, xoá 1 → còn đúng 2 trên headset **và** đúng 2 UUID trong SaveGame",
      "Không cache transform của anchor ở bất kỳ đâu",
    ],
    sectionIds: ["7-9"],
    difficulty: "khó",
  },

  // ---- Tuần 6 — hoàn thiện (Chương 8, 9, 10) ----
  {
    id: "w6-transition",
    week: 6,
    title: "`UXRTransitionSubsystem` với watchdog",
    brief:
      "Gom mọi chuyển cảnh vào một `UGameInstanceSubsystem`: fade bằng `SetColorScaleAndOffset` với `bApplyToAllLayers=true`, level streaming `bShouldBlockOnLoad=false`, và một watchdog không bao giờ để người dùng kẹt trong màn đen.",
    done: [
      "Fade ra/vào mượt, 0,3–0,6 s, không giật",
      "**Compositor layer cũng bị fade** — thử đổi `bApplyToAllLayers` thành `false` một lần để thấy vì sao tham số đó tồn tại",
      "Teleport ở tuần 2 đã dùng lại subsystem này",
      "Đặt `LoadTimeoutSeconds = 0.1f` → watchdog kích hoạt, app khôi phục và **có thông báo**",
      "Không có lúc nào màn hình đen im lặng quá 1 giây",
      "Đo thời gian tới hình head-tracked đầu tiên — phải **< 4 giây**",
    ],
    sectionIds: ["8-3", "8-4", "8-5", "8-6", "8-9"],
    difficulty: "khó",
    flagship: true,
  },
  {
    id: "w6-diagnose",
    week: 6,
    title: "Bài tập chẩn đoán — phá hiệu năng có chủ đích",
    brief:
      "Phá hiệu năng theo ba cách: (a) thêm 200 actor có tick, (b) thêm 8 dynamic light có bóng đổ, (c) `r.ScreenPercentage=200`. Với mỗi cách, **đoán trước** nút thắt sẽ nằm ở Game / Draw / GPU, rồi đo và kiểm chứng.",
    done: [
      "Có bảng ba dòng: dự đoán / kết quả `stat unit` / đúng hay sai",
      "Giải thích được vì sao mỗi cách phá lại đánh vào luồng tương ứng",
      "Biết nút thắt thật của app mình nằm ở đâu",
    ],
    sectionIds: ["9-3", "9-7", "9-8"],
    difficulty: "vừa",
  },
  {
    id: "w6-perfetto",
    week: 6,
    title: "Nhận ra một trace Perfetto vô dụng",
    brief:
      "Chạy một trace **không** cấu hình ATrace, nhìn kết quả. Sau đó cấu hình ATrace Categories + ATrace Apps rồi chạy lại. So sánh hai trace, rồi tìm một frame bị hụt và xác định CPU hay GPU đang chặn.",
    done: [
      "Mô tả được khác biệt giữa hai trace",
      "Đổi tên trace ngay sau khi ghi (chúng dùng chung tên mặc định)",
      "Kết luận CPU/GPU từ Perfetto **khớp** với `stat unit` — nếu khác, một trong hai phép đo sai",
    ],
    sectionIds: ["9-2", "9-3"],
    difficulty: "khó",
  },
  {
    id: "w6-thermal",
    week: 6,
    title: "Bảng fps phút 5 / 15 / 25 và bảng núm vặn",
    brief:
      "Chạy app 30 phút liên tục ở build Shipping, ghi fps ở phút 5, 15, 25. Song song, chạy `r.ScreenPercentage` ở 100 / 110 / 130 / 150 và tìm điểm bạn không còn thấy khác biệt độ nét nữa.",
    done: [
      "Ba con số fps theo mốc thời gian, có ghi chú nếu tụt",
      "Bảng ScreenPercentage kèm fps và cảm nhận độ nét",
      "Đo cùng một cảnh ở Development và Shipping, ghi lại chênh lệch",
      "Ghi lại: đã vặn núm nào, được bao nhiêu ms",
    ],
    sectionIds: ["9-1", "9-4", "9-6", "9-9"],
    difficulty: "vừa",
  },
  {
    id: "w6-handover",
    week: 6,
    title: "Tài liệu bàn giao + rà lại sổ tay bẫy",
    brief:
      "Viết tài liệu bàn giao cho chính project 6 tuần của bạn theo checklist §10.3, không quá 3 trang. Sau đó rà sổ tay bẫy và gắn nhãn ✅/⚠️/❓ cho từng mục.",
    done: [
      "Đủ bốn phần: Hạ tầng / Project / Kiến thức / Bảo mật",
      "Ngày và phiên bản nằm ở đầu file",
      "Mỗi quyết định có một câu **vì sao**",
      "Đếm được số mục ❓ — đó chính là danh sách việc chưa xong của bạn",
    ],
    sectionIds: ["10-2", "10-3", "10-5"],
    difficulty: "vừa",
  },
  {
    id: "w6-critique",
    week: 6,
    title: "Tìm ba chỗ sai trong chính giáo án này",
    brief:
      "Đọc lại tài liệu và tìm ít nhất **ba chỗ** bạn cho là sai, lỗi thời hoặc thiếu cơ sở — dựa trên những gì bạn đã thực sự đo trên device. Viết ra kèm bằng chứng. Bắt đầu từ 15 mục ❓ ở Phụ lục C.7.",
    done: [
      "Ba mục, mỗi mục có bằng chứng đo được chứ không phải suy đoán",
      "Ít nhất một mục lấy từ danh sách ❓ ở §C.7",
      "Đề xuất câu chữ thay thế, kèm ngày kiểm chứng",
    ],
    sectionIds: ["10-5", "c-7", "ba-muc-can-ban-xac-nhan"],
    difficulty: "khó",
  },
];

export const weeks: Week[] = [
  {
    week: 0,
    theme: "Hạ tầng",
    focus: "Tài khoản, adb, plugin Meta XR, Git cho project Unreal",
    exercises: [],
  },
  {
    week: 1,
    theme: "Nền móng",
    focus: "Trực giác VR, baseline Quest 3, renderer, PSO cache",
    exercises: [],
  },
  {
    week: 2,
    theme: "VR Pawn",
    focus: "Tracking origin, Enhanced Input, snap turn, teleport",
    exercises: [],
  },
  {
    week: 3,
    theme: "Tương tác",
    focus: "Grab contact-based, vận tốc thả, highlight shell mesh",
    exercises: [],
  },
  {
    week: 4,
    theme: "UI Stereo Layer",
    focus: "Kiến trúc kép, world-locked, đường lùi, giới hạn 16 layer",
    exercises: [],
  },
  {
    week: 5,
    theme: "Mixed Reality",
    focus: "Passthrough, MRUK, collision proxy, hand tracking, anchors",
    exercises: [],
  },
  {
    week: 6,
    theme: "Hoàn thiện",
    focus: "Chuyển cảnh XR-safe, profiling, bàn giao và VRC",
    exercises: [],
  },
];

for (const ex of EXERCISES) {
  weeks.find((w) => w.week === ex.week)?.exercises.push(ex);
}

export const exercises = EXERCISES;
export const exerciseCount = EXERCISES.length;
