// ============================================================
// KAVICT Game Event Definitions
// ============================================================
// Rules:
//  - type "choice"            : 2 options (A/B or Agree/Decline)
//  - type "forced"            : no choice, show card + "Xác nhận" button
//  - type "friend_interaction": initiator picks a target player; target can accept/decline
//  - cost > 0  → money spent (deducted from balance)
//  - cost < 0  → money received (added to balance)
//  - category  → affects that budget category spending tracker
//  - happinessChange / intelligenceChange → direct delta on those MoneyIQ metrics
//
// Auto-select rule when timer runs out:
//   Pick the option with the lowest absolute cost (cheapest).
//   If tied, pick option[0].
// ============================================================

export interface EventOption {
  label: string;
  cost: number;             // > 0 = spending, < 0 = income
  category?: string;        // budget category affected; undefined = direct balance change
  happinessChange: number;
  intelligenceChange: number;
  message?: string;         // Feedback message after selecting
}

export interface FriendInteraction {
  initiatorEffect: EventOption;  // Applied to person who sends the request
  targetAcceptEffect: EventOption; // Applied to target if they accept
  targetDeclineHappiness: number;  // Happiness change for target if they decline (usually small negative)
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "choice" | "forced" | "friend_interaction";
  characters: string[];   // which character types get this event
  options?: [EventOption, EventOption]; // exactly 2 options for "choice"
  forcedEffect?: EventOption;           // for "forced"
  friendInteraction?: FriendInteraction; // for "friend_interaction"
  isMealEvent?: boolean;                 // Ăn sáng/trưa/tối — always included
}

// ============================================================
// DAILY FIXED MEALS (always appear, all characters)
// ============================================================
export const BREAKFAST_POOLS: GameEvent[] = [
  {
    id: "bf_1", title: "Bữa sáng", description: "Bắt đầu ngày mới. Bạn sẽ ăn sáng như thế nào?", icon: "free_breakfast", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Bánh mì/Xôi (~20k)", cost: 20000, category: "Ăn uống", happinessChange: 1, intelligenceChange: 0, message: "Bữa sáng nhanh gọn, đủ năng lượng!" },
      { label: "Phở bò (~50k)", cost: 50000, category: "Ăn uống", happinessChange: 3, intelligenceChange: 0, message: "Một tô phở nóng hổi khởi đầu ngày tuyệt vời!" },
    ],
  },
  {
    id: "bf_2", title: "Bữa sáng", description: "Sáng nay dậy hơi muộn, bạn ăn gì đây?", icon: "free_breakfast", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Úp mì tôm (~10k)", cost: 10000, category: "Ăn uống", happinessChange: -1, intelligenceChange: 0, message: "Tiết kiệm thì tốt, nhưng chú ý sức khỏe nhé!" },
      { label: "Ghé cafe + Bánh ngọt (~60k)", cost: 60000, category: "Ăn uống", happinessChange: 4, intelligenceChange: 1, message: "Sang chảnh buổi sáng! Cực kỳ tỉnh táo." },
    ],
  },
  {
    id: "bf_3", title: "Bữa sáng", description: "Bạn mở tủ lạnh ra và suy nghĩ...", icon: "free_breakfast", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Bỏ bữa sáng (0k)", cost: 0, category: "Ăn uống", happinessChange: -2, intelligenceChange: -1, message: "Bụng đói meo, bạn khó mà tập trung làm việc được!" },
      { label: "Chiên cơm nguội (~15k)", cost: 15000, category: "Ăn uống", happinessChange: 2, intelligenceChange: 1, message: "Tự nấu ăn ở nhà là một thói quen tốt!" },
    ],
  }
];

export const LUNCH_POOLS: GameEvent[] = [
  {
    id: "ln_1", title: "Bữa trưa", description: "Đã đến giờ nghỉ trưa. Trưa nay ăn gì nhỉ?", icon: "lunch_dining", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Cơm bình dân (~40k)", cost: 40000, category: "Ăn uống", happinessChange: 1, intelligenceChange: 0, message: "Bữa ăn tiêu chuẩn, đủ no bụng!" },
      { label: "Đặt đồ ăn app (~80k)", cost: 80000, category: "Ăn uống", happinessChange: 3, intelligenceChange: 0, message: "Ngon miệng nhưng ví tiền hơi đau một chút!" },
    ],
  },
  {
    id: "ln_2", title: "Bữa trưa", description: "Đồng nghiệp rủ đi ăn chung, bạn chọn gì?", icon: "lunch_dining", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Ăn một mình cho rẻ (~35k)", cost: 35000, category: "Ăn uống", happinessChange: -1, intelligenceChange: 0, message: "Hơi buồn vì phải ăn một mình, bù lại tiết kiệm được chút tiền." },
      { label: "Đi ăn cùng mọi người (~70k)", cost: 70000, category: "Ăn uống", happinessChange: 4, intelligenceChange: 1, message: "Kết nối với đồng nghiệp rất quan trọng, vui vẻ!" },
    ],
  },
  {
    id: "ln_3", title: "Bữa trưa", description: "Hôm nay bạn quyết định mang cơm hộp đi làm/học.", icon: "lunch_dining", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Ăn cơm mang theo (0k)", cost: 0, category: "Ăn uống", happinessChange: 2, intelligenceChange: 2, message: "Vừa vệ sinh vừa tiết kiệm, rất thông minh!" },
      { label: "Vẫn thèm ăn ngoài (~50k)", cost: 50000, category: "Ăn uống", happinessChange: 3, intelligenceChange: -1, message: "Lãng phí đồ ăn ở nhà rồi, chậc chậc..." },
    ],
  }
];

export const DINNER_POOLS: GameEvent[] = [
  {
    id: "dn_1", title: "Bữa tối", description: "Một ngày dài kết thúc. Tối nay ăn gì đây?", icon: "dinner_dining", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Tự nấu ăn (~30k)", cost: 30000, category: "Ăn uống", happinessChange: 2, intelligenceChange: 1, message: "Tự thưởng cho bản thân một bữa ăn đầm ấm!" },
      { label: "Đi ăn nhà hàng (~120k)", cost: 120000, category: "Ăn uống", happinessChange: 5, intelligenceChange: 0, message: "No say sung sướng, xứng đáng với công sức cả ngày!" },
    ],
  },
  {
    id: "dn_2", title: "Bữa tối", description: "Tủ lạnh hết sạch đồ ăn. Bạn sẽ làm gì?", icon: "dinner_dining", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Mua bánh mì lót dạ (~25k)", cost: 25000, category: "Ăn uống", happinessChange: 0, intelligenceChange: 0, message: "Bữa tối đơn giản, qua cơn đói là được." },
      { label: "Rủ bạn bè đi ăn lẩu (~150k)", cost: 150000, category: "Ăn uống ngoài - Gặp gỡ bạn bè", happinessChange: 6, intelligenceChange: 0, message: "Lẩu siêu ngon! Bạn bè vui vẻ, nhưng ví thì xẹp lép." },
    ],
  },
  {
    id: "dn_3", title: "Bữa tối", description: "Trời mưa lạnh, bạn khá lười ra ngoài.", icon: "dinner_dining", type: "choice", isMealEvent: true, characters: ["student", "fresh_grad", "stable_income"],
    options: [
      { label: "Úp 2 gói mì (~15k)", cost: 15000, category: "Ăn uống", happinessChange: -1, intelligenceChange: 0, message: "Nhanh gọn lẹ, nhưng ăn nhiều mì không tốt đâu." },
      { label: "Đặt ship cơm thố (~65k)", cost: 65000, category: "Ăn uống", happinessChange: 3, intelligenceChange: 0, message: "Cơm giao tận giường, ấm áp bụng dạ!" },
    ],
  }
];

// ============================================================
// RANDOM EVENTS — STUDENT (sinh_vien)
// ============================================================
const STUDENT_EVENTS: GameEvent[] = [
  // Forced events
  {
    id: "student_scholarship",
    title: "Học bổng khuyến học!",
    description: "Bạn đạt thành tích xuất sắc trong kỳ thi vừa rồi và được nhận học bổng 500,000đ.",
    icon: "emoji_events",
    type: "forced",
    characters: ["student"],
    forcedEffect: { label: "Xác nhận", cost: -500000, happinessChange: 10, intelligenceChange: 5 },
  },
  {
    id: "student_phone_repair",
    title: "Điện thoại hỏng màn hình",
    description: "Chẳng may đánh rơi điện thoại, màn hình nứt phải đi sửa.",
    icon: "phonelink_erase",
    type: "forced",
    characters: ["student"],
    forcedEffect: { label: "Xác nhận", cost: 300000, category: "Chi phí khác", happinessChange: -5, intelligenceChange: -2 },
  },
  {
    id: "student_allowance_bonus",
    title: "Bố mẹ cho thêm tiền",
    description: "Bố mẹ biết bạn đang tiết kiệm nên gửi thêm 200,000đ để thưởng.",
    icon: "family_restroom",
    type: "forced",
    characters: ["student"],
    forcedEffect: { label: "Xác nhận", cost: -200000, happinessChange: 8, intelligenceChange: 0 },
  },
  {
    id: "student_sick",
    title: "Bị cảm sốt",
    description: "Thời tiết thay đổi khiến bạn bị cảm. Phải mua thuốc và nghỉ ngơi.",
    icon: "sick",
    type: "forced",
    characters: ["student"],
    forcedEffect: { label: "Xác nhận", cost: 150000, category: "Y tế", happinessChange: -6, intelligenceChange: 0 },
  },
  // Choice events
  {
    id: "student_coffee_shop",
    title: "Cà phê học bài",
    description: "Bạn bè rủ đến quán cà phê học bài cùng. Cảm giác rất năng suất nhưng tốn tiền.",
    icon: "local_cafe",
    type: "choice",
    characters: ["student"],
    options: [
      { label: "Đi cùng (~60k)", cost: 60000, category: "Ăn vặt - Cà phê", happinessChange: 4, intelligenceChange: 3 },
      { label: "Ở nhà học", cost: 0, happinessChange: -1, intelligenceChange: 2 },
    ],
  },
  {
    id: "student_book_sale",
    title: "Sách giảm giá 50%!",
    description: "Nhà sách đang sale, có cuốn sách tham khảo bạn muốn đang giảm còn 80,000đ.",
    icon: "menu_book",
    type: "choice",
    characters: ["student"],
    options: [
      { label: "Mua ngay (~80k)", cost: 80000, category: "Học tập", happinessChange: 3, intelligenceChange: 5 },
      { label: "Tải bản PDF miễn phí", cost: 0, happinessChange: 1, intelligenceChange: 3 },
    ],
  },
  {
    id: "student_clothes_sale",
    title: "Quần áo giảm giá cuối mùa",
    description: "Shop thời trang đang sale 70%, có bộ đồ đẹp chỉ 200,000đ.",
    icon: "checkroom",
    type: "choice",
    characters: ["student"],
    options: [
      { label: "Mua (~200k)", cost: 200000, category: "Mua sắm quần áo", happinessChange: 6, intelligenceChange: -1 },
      { label: "Bỏ qua", cost: 0, happinessChange: -2, intelligenceChange: 3 },
    ],
  },
  {
    id: "student_late_night_snack",
    title: "Đêm khuya thèm ăn vặt",
    description: "Học khuya đói bụng, bạn muốn đặt mì tôm trứng hoặc ra ngoài mua đồ ăn.",
    icon: "ramen_dining",
    type: "choice",
    characters: ["student"],
    options: [
      { label: "Nấu mì tôm (~10k)", cost: 10000, category: "Ăn vặt - Cà phê", happinessChange: 2, intelligenceChange: 0 },
      { label: "Đặt GrabFood (~60k)", cost: 60000, category: "Ăn vặt - Cà phê", happinessChange: 5, intelligenceChange: -1 },
    ],
  },
  {
    id: "student_gift_friend",
    title: "Sinh nhật bạn thân",
    description: "Hôm nay sinh nhật bạn thân, bạn muốn tặng quà gì?",
    icon: "cake",
    type: "choice",
    characters: ["student"],
    options: [
      { label: "Mua quà nhỏ (~150k)", cost: 150000, category: "Quà tặng", happinessChange: 7, intelligenceChange: 2 },
      { label: "Tự làm thiệp tặng", cost: 0, category: "Quà tặng", happinessChange: 4, intelligenceChange: 3 },
    ],
  },
  {
    id: "student_event_ticket",
    title: "Vé concert nhạc hội",
    description: "Ban nhạc yêu thích đến biểu diễn, vé 300,000đ. Cơ hội hiếm có!",
    icon: "concert",
    type: "choice",
    characters: ["student"],
    options: [
      { label: "Mua vé (~300k)", cost: 300000, category: "Giải trí", happinessChange: 12, intelligenceChange: 2 },
      { label: "Nghe trực tuyến miễn phí", cost: 0, happinessChange: 3, intelligenceChange: 1 },
    ],
  },
  // Friend interactions
  {
    id: "student_invite_coffee",
    title: "Rủ bạn đi cà phê",
    description: "Bạn muốn mời một người bạn cùng đi uống cà phê. Chọn người bạn muốn mời:",
    icon: "local_cafe",
    type: "friend_interaction",
    characters: ["student"],
    friendInteraction: {
      initiatorEffect: { label: "Mời bạn", cost: 60000, category: "Ăn vặt - Cà phê", happinessChange: 5, intelligenceChange: 1 },
      targetAcceptEffect: { label: "Đồng ý đi", cost: 60000, category: "Ăn vặt - Cà phê", happinessChange: 5, intelligenceChange: 1 },
      targetDeclineHappiness: -2,
    },
  },
];

// ============================================================
// RANDOM EVENTS — FRESH GRAD (moi_di_lam)
// ============================================================
const FRESH_GRAD_EVENTS: GameEvent[] = [
  // Forced events
  {
    id: "freshgrad_bonus",
    title: "Thưởng hoàn thành dự án!",
    description: "Sếp thưởng bạn 500,000đ vì hoàn thành dự án đúng hạn và chất lượng tốt.",
    icon: "emoji_events",
    type: "forced",
    characters: ["fresh_grad"],
    forcedEffect: { label: "Xác nhận", cost: -500000, happinessChange: 10, intelligenceChange: 5 },
  },
  {
    id: "freshgrad_commute_issue",
    title: "Xe máy hỏng giữa đường",
    description: "Xe máy đột ngột hỏng trên đường đi làm, phải gọi thợ sửa tại chỗ.",
    icon: "build",
    type: "forced",
    characters: ["fresh_grad"],
    forcedEffect: { label: "Xác nhận", cost: 200000, category: "Đi lại", happinessChange: -5, intelligenceChange: -1 },
  },
  {
    id: "freshgrad_health_checkup",
    title: "Nhắc nhở khám sức khoẻ định kỳ",
    description: "Công ty tổ chức khám sức khoẻ định kỳ, bạn phải đóng phần chênh lệch 150,000đ.",
    icon: "health_and_safety",
    type: "forced",
    characters: ["fresh_grad"],
    forcedEffect: { label: "Xác nhận", cost: 150000, category: "Y tế", happinessChange: 2, intelligenceChange: 3 },
  },
  // Choice events
  {
    id: "freshgrad_lunch_colleagues",
    title: "Đồng nghiệp rủ ăn trưa nhà hàng",
    description: "Nhóm đồng nghiệp rủ đi ăn trưa ở nhà hàng Nhật để kỷ niệm dự án xong.",
    icon: "groups",
    type: "choice",
    characters: ["fresh_grad"],
    options: [
      { label: "Tham gia (~200k)", cost: 200000, category: "Ăn trưa - Cà phê cùng đồng nghiệp", happinessChange: 8, intelligenceChange: 3 },
      { label: "Từ chối, ăn cơm hộp", cost: 0, happinessChange: -3, intelligenceChange: 1 },
    ],
  },
  {
    id: "freshgrad_work_clothes",
    title: "Cần áo vest đi làm",
    description: "Sắp có buổi họp quan trọng với đối tác, cần mua một bộ vest mới.",
    icon: "work",
    type: "choice",
    characters: ["fresh_grad"],
    options: [
      { label: "Mua áo vest mới (~800k)", cost: 800000, category: "Trang phục công sở", happinessChange: 6, intelligenceChange: 4 },
      { label: "Mượn của bạn", cost: 0, happinessChange: 1, intelligenceChange: 2 },
    ],
  },
  {
    id: "freshgrad_gym",
    title: "Đăng ký phòng gym",
    description: "Sau công việc bận rộn, bạn nghĩ đến việc đăng ký gym để giữ sức khoẻ.",
    icon: "fitness_center",
    type: "choice",
    characters: ["fresh_grad"],
    options: [
      { label: "Đăng ký tháng (~400k)", cost: 400000, category: "Thể thao - Tập gym", happinessChange: 5, intelligenceChange: 4 },
      { label: "Tập thể dục ngoài trời miễn phí", cost: 0, happinessChange: 3, intelligenceChange: 3 },
    ],
  },
  {
    id: "freshgrad_overtime",
    title: "Làm thêm giờ tăng ca",
    description: "Công ty cần người làm thêm cuối tuần, trả thêm 300,000đ nhưng mất thời gian nghỉ.",
    icon: "schedule",
    type: "choice",
    characters: ["fresh_grad"],
    options: [
      { label: "Nhận làm thêm (+300k)", cost: -300000, happinessChange: -3, intelligenceChange: 4 },
      { label: "Từ chối, nghỉ ngơi", cost: 0, happinessChange: 5, intelligenceChange: 0 },
    ],
  },
  {
    id: "freshgrad_online_course",
    title: "Khoá học online nâng cao kỹ năng",
    description: "Có khoá học lập trình/kỹ năng nghề chỉ 500,000đ, rất hữu ích cho công việc.",
    icon: "computer",
    type: "choice",
    characters: ["fresh_grad"],
    options: [
      { label: "Đăng ký học (~500k)", cost: 500000, happinessChange: 3, intelligenceChange: 8 },
      { label: "Tự học YouTube miễn phí", cost: 0, happinessChange: 1, intelligenceChange: 4 },
    ],
  },
  // Friend interactions
  {
    id: "freshgrad_invite_lunch",
    title: "Rủ bạn ăn trưa cùng",
    description: "Bạn muốn rủ một người bạn ăn trưa cùng. Chọn người bạn muốn mời:",
    icon: "restaurant",
    type: "friend_interaction",
    characters: ["fresh_grad"],
    friendInteraction: {
      initiatorEffect: { label: "Mời bạn ăn trưa", cost: 120000, category: "Ăn trưa - Cà phê cùng đồng nghiệp", happinessChange: 6, intelligenceChange: 2 },
      targetAcceptEffect: { label: "Đồng ý đi", cost: 120000, category: "Ăn trưa - Cà phê cùng đồng nghiệp", happinessChange: 6, intelligenceChange: 2 },
      targetDeclineHappiness: -2,
    },
  },
];

// ============================================================
// RANDOM EVENTS — STABLE INCOME (thu_nhap_on_dinh)
// ============================================================
const STABLE_INCOME_EVENTS: GameEvent[] = [
  // Forced events
  {
    id: "stable_annual_bonus",
    title: "Thưởng hiệu suất quý!",
    description: "Công ty trả thưởng hiệu suất, bạn nhận thêm 1,000,000đ vào tháng này.",
    icon: "paid",
    type: "forced",
    characters: ["stable_income"],
    forcedEffect: { label: "Xác nhận", cost: -1000000, happinessChange: 10, intelligenceChange: 3 },
  },
  {
    id: "stable_car_maintenance",
    title: "Bảo dưỡng ô tô định kỳ",
    description: "Xe ô tô đến kỳ bảo dưỡng định kỳ, phí 500,000đ.",
    icon: "directions_car",
    type: "forced",
    characters: ["stable_income"],
    forcedEffect: { label: "Xác nhận", cost: 500000, category: "Đi lại", happinessChange: -2, intelligenceChange: 2 },
  },
  {
    id: "stable_electricity_bill",
    title: "Hoá đơn điện tháng cao",
    description: "Tháng này dùng nhiều điều hoà, hoá đơn cao hơn bình thường 300,000đ.",
    icon: "bolt",
    type: "forced",
    characters: ["stable_income"],
    forcedEffect: { label: "Xác nhận", cost: 300000, category: "Nhu yếu phẩm cá nhân", happinessChange: -3, intelligenceChange: -1 },
  },
  {
    id: "stable_hospital_visit",
    title: "Khám sức khoẻ tổng quát",
    description: "Đi khám sức khoẻ định kỳ hàng năm, chi phí 800,000đ.",
    icon: "local_hospital",
    type: "forced",
    characters: ["stable_income"],
    forcedEffect: { label: "Xác nhận", cost: 800000, category: "Chăm sóc sức khỏe", happinessChange: 2, intelligenceChange: 4 },
  },
  // Choice events
  {
    id: "stable_restaurant_dinner",
    title: "Bữa tối nhà hàng sang",
    description: "Cuối tuần, bạn nghĩ đến việc đi ăn tối nhà hàng cao cấp để thư giãn.",
    icon: "restaurant",
    type: "choice",
    characters: ["stable_income"],
    options: [
      { label: "Nhà hàng cao cấp (~500k)", cost: 500000, category: "Ăn uống ngoài - Gặp gỡ bạn bè", happinessChange: 10, intelligenceChange: 1 },
      { label: "Nấu ăn tại nhà (~80k)", cost: 80000, category: "Ăn uống", happinessChange: 4, intelligenceChange: 3 },
    ],
  },
  {
    id: "stable_investment",
    title: "Cơ hội đầu tư cổ phiếu",
    description: "Bạn bè tài chính gợi ý một cổ phiếu tiềm năng, cần đầu tư tối thiểu 2,000,000đ.",
    icon: "trending_up",
    type: "choice",
    characters: ["stable_income"],
    options: [
      { label: "Đầu tư 2 triệu", cost: 2000000, category: "Đầu tư", happinessChange: 2, intelligenceChange: 8 },
      { label: "Giữ tiền mặt an toàn", cost: 0, happinessChange: 1, intelligenceChange: 3 },
    ],
  },
  {
    id: "stable_travel_weekend",
    title: "Trip cuối tuần gần thành phố",
    description: "Bạn bè rủ đi nghỉ dưỡng 2 ngày 1 đêm ở resort, chi phí khoảng 1,500,000đ.",
    icon: "flight",
    type: "choice",
    characters: ["stable_income"],
    options: [
      { label: "Đi cùng (~1.5 triệu)", cost: 1500000, category: "Du lịch - Trải nghiệm", happinessChange: 15, intelligenceChange: 3 },
      { label: "Nghỉ ở nhà", cost: 0, happinessChange: 2, intelligenceChange: 1 },
    ],
  },
  {
    id: "stable_shopping_luxury",
    title: "Túi xách mới từ thương hiệu",
    description: "Cửa hàng thương hiệu yêu thích đang ra mẫu mới, giá 2,500,000đ.",
    icon: "shopping_bag",
    type: "choice",
    characters: ["stable_income"],
    options: [
      { label: "Mua ngay (~2.5 triệu)", cost: 2500000, category: "Mua sắm", happinessChange: 8, intelligenceChange: -2 },
      { label: "Không mua, tiết kiệm", cost: 0, happinessChange: -2, intelligenceChange: 4 },
    ],
  },
  {
    id: "stable_wedding_gift",
    title: "Mừng cưới bạn bè",
    description: "Đám cưới bạn thân, bạn mừng bao nhiêu thì phù hợp?",
    icon: "volunteer_activism",
    type: "choice",
    characters: ["stable_income"],
    options: [
      { label: "Mừng 1,000,000đ", cost: 1000000, category: "Quà tặng - Hiếu hỉ", happinessChange: 8, intelligenceChange: 3 },
      { label: "Mừng 500,000đ", cost: 500000, category: "Quà tặng - Hiếu hỉ", happinessChange: 5, intelligenceChange: 2 },
    ],
  },
  {
    id: "stable_spa_day",
    title: "Ngày spa thư giãn",
    description: "Sau tuần làm việc căng thẳng, bạn nghĩ đến việc đi spa. Gói cơ bản 400,000đ.",
    icon: "spa",
    type: "choice",
    characters: ["stable_income"],
    options: [
      { label: "Đặt lịch spa (~400k)", cost: 400000, category: "Chăm sóc sức khỏe", happinessChange: 10, intelligenceChange: 1 },
      { label: "Tự massage ở nhà", cost: 0, happinessChange: 4, intelligenceChange: 0 },
    ],
  },
  // Friend interactions
  {
    id: "stable_invite_dinner",
    title: "Mời bạn bè ăn tối",
    description: "Bạn muốn chiêu đãi một người bạn bữa tối tại nhà hàng. Chọn người bạn muốn mời:",
    icon: "restaurant",
    type: "friend_interaction",
    characters: ["stable_income"],
    friendInteraction: {
      initiatorEffect: { label: "Mời bạn ăn tối", cost: 500000, category: "Ăn uống ngoài - Gặp gỡ bạn bè", happinessChange: 10, intelligenceChange: 2 },
      targetAcceptEffect: { label: "Đồng ý đi", cost: 500000, category: "Ăn uống ngoài - Gặp gỡ bạn bè", happinessChange: 10, intelligenceChange: 2 },
      targetDeclineHappiness: -3,
    },
  },
];

// ============================================================
// EVENT POOL BY CHARACTER
// ============================================================
export const EVENT_POOL: Record<string, GameEvent[]> = {
  student: STUDENT_EVENTS,
  fresh_grad: FRESH_GRAD_EVENTS,
  stable_income: STABLE_INCOME_EVENTS,
};

// ============================================================
// Helper — pick N random events from pool (no repeats in same day)
// ============================================================
export function pickRandomEvents(
  pool: GameEvent[],
  count: number,
  excludeIds: Set<string> = new Set()
): GameEvent[] {
  const available = pool.filter((e) => !excludeIds.has(e.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Build today's event list:
// 3 fixed meals + 3-10 random events (randomize count each day)
export function buildDayEvents(
  characterId: string,
  recentEventIds: Set<string> = new Set(),
  isMultiplayer = false
): GameEvent[] {
  const pool = EVENT_POOL[characterId] ?? [];

  // Separate friend_interaction events
  const normalPool = pool.filter((e) => e.type !== "friend_interaction");
  const friendPool = pool.filter((e) => e.type === "friend_interaction");

  // Randomize count: 3-10 random events
  const randomCount = Math.floor(Math.random() * 8) + 3; // 3 to 10

  // For multiplayer, include 0-1 friend interaction events per day
  let randomEvents = pickRandomEvents(normalPool, randomCount, recentEventIds);
  if (isMultiplayer && friendPool.length > 0) {
    const friendEvent = pickRandomEvents(friendPool, 1, recentEventIds);
    // Insert friend event somewhere in the middle (not first or last)
    const insertIndex = Math.max(1, Math.floor(randomEvents.length / 2));
    randomEvents = [
      ...randomEvents.slice(0, insertIndex),
      ...friendEvent,
      ...randomEvents.slice(insertIndex),
    ];
  }

  // Pick random meals
  const breakfast = pickRandomEvents(BREAKFAST_POOLS, 1)[0];
  const lunch = pickRandomEvents(LUNCH_POOLS, 1)[0];
  const dinner = pickRandomEvents(DINNER_POOLS, 1)[0];

  return [breakfast, lunch, dinner, ...randomEvents].filter(Boolean);
}
