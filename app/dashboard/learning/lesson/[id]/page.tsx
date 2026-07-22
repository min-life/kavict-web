"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/features/auth/AuthProvider";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

interface Note {
  id: string;
  text: string;
  type: "text" | "video-timestamp";
  videoTime?: number;
  createdAt: string;
}

interface LessonData {
  title: string;
  subtitle: string;
  lessonIndex: string;
  progress: number;
  videoTitle: string;
  videoDuration: string;
  videoLevel: string;
  videoTopic: string;
  videoUrl: string;
  overview: string;
  keyPoints: string[];
  initialChat: Omit<Message, "id" | "timestamp">[];
  summary: string[];
  glossary: { term: string; definition: string }[];
  scenarioExercise: ScenarioExercise;
  theoryExercise: TheoryExercise;
}

interface QuizQuestion {
  id: string;
  type: "mcq" | "blank" | "matching" | "short_answer";
  question: string;
  options?: string[];
  correctAnswer?: string;
  textBefore?: string;
  textAfter?: string;
  blankOptions?: string[];
  correctWord?: string;
  matchingLeft?: string[];
  matchingRight?: string[];
  correctMatches?: Record<string, string>;
  acceptedAnswers?: string[];
  explanation: string;
}

interface ScenarioExercise {
  title: string;
  story: string;
  mediaType?: "text" | "video" | "audio";
  mediaUrl?: string;
  questions: QuizQuestion[];
}

interface TheoryExercise {
  title: string;
  content: string;
  keyMessage: string;
  mediaType?: "text" | "video" | "image";
  mediaUrl?: string;
  questions: QuizQuestion[];
}

const LESSONS_DATABASE: Record<string, LessonData> = {
  "1": {
    title: "Quản lý chi tiêu",
    subtitle: "Làm sao để theo dõi dòng tiền hàng ngày?",
    lessonIndex: "Bài 1 / 12",
    progress: 100,
    videoTitle: "Bài 1: Làm sao để kiểm soát chi tiêu?",
    videoDuration: "10 phút",
    videoLevel: "Cơ bản",
    videoTopic: "Chủ đề: Ngân sách cá nhân",
    videoUrl: "https://www.youtube.com/embed/npIWZ4ropZ8",
    overview: "Quản lý chi tiêu không phải là thắt lưng buộc bụng, mà là việc hiểu rõ dòng tiền của mình đang đi đâu.",
    keyPoints: [
      "Ghi chép chi tiêu: Ghi nhận mọi giao dịch dù là nhỏ nhất.",
      "Quy tắc 50/30/20: Chia thu nhập làm 3 phần cố định ngay khi có lương.",
      "Cân đối ngân sách: Cắt giảm chi phí mong muốn không cần thiết trước."
    ],
    initialChat: [
      { sender: "ai", text: "Chào bạn! Tôi là Kavi. Hôm nay chúng ta cùng tìm hiểu về Quản lý chi tiêu nhé!" },
      { sender: "ai", text: "Bạn có thể gõ câu hỏi hoặc click nút micro để dịch giọng nói thành chữ." }
    ],
    summary: ["Ghi chép chi tiêu giúp phát hiện các khoản thất thoát.", "Quy tắc 50/30/20: 50% Thiết yếu, 30% Sở thích, 20% Tích lũy.", "Trả cho bản thân trước bằng cách trích 20% tiết kiệm ngay khi nhận lương."],
    glossary: [
      { term: "Chi tiêu thiết yếu", definition: "Các khoản chi bắt buộc cho cuộc sống tối thiểu." },
      { term: "Chi tiêu mong muốn", definition: "Các khoản chi không bắt buộc nhưng nâng cao chất lượng sống." },
      { term: "Dòng tiền âm", definition: "Tổng chi tiêu hàng tháng lớn hơn tổng thu nhập." }
    ],
    scenarioExercise: {
      title: "\"Tháng lương đầu tiên của Minh Anh\"",
      story: "Minh Anh vừa nhận tháng lương thực tập đầu tiên: 8.000.000đ. Cô quyết định \"thưởng cho bản thân\" bằng cách mua quần áo mới (1.500.000đ), đi ăn cùng bạn bè (800.000đ), đăng ký gym (600.000đ). Tiền nhà trọ 2.500.000đ, điện nước 300.000đ, đi lại 500.000đ, ăn uống cơ bản 1.800.000đ.\n\nĐến cuối tháng, Minh Anh nhận ra đã tiêu hết 8.000.000đ mà không tiết kiệm được đồng nào.",
      questions: [
        { id: "s1q1", type: "mcq", question: "Tổng chi tiêu thiết yếu của Minh Anh là bao nhiêu?", options: ["3.300.000đ", "5.100.000đ", "6.600.000đ", "8.000.000đ"], correctAnswer: "5.100.000đ", explanation: "Nhà trọ (2.5tr) + Điện nước (300k) + Đi lại (500k) + Ăn uống (1.8tr) = 5.100.000đ." },
        { id: "s1q2", type: "mcq", question: "Theo quy tắc 50/30/20, Minh Anh nên phân bổ lương thế nào?", options: ["50% thiết yếu, 30% sở thích, 20% tiết kiệm", "80% thiết yếu, 20% sở thích", "Tiêu hết rồi tính sau", "30% thiết yếu, 50% sở thích, 20% tiết kiệm"], correctAnswer: "50% thiết yếu, 30% sở thích, 20% tiết kiệm", explanation: "Quy tắc 50/30/20: 50% nhu cầu, 30% mong muốn, 20% tiết kiệm." },
        { id: "s1q3", type: "mcq", question: "Sai lầm lớn nhất của Minh Anh là gì?", options: ["Đi làm thực tập", "Không phân bổ ngân sách trước khi chi tiêu", "Trả tiền nhà trọ", "Ăn uống cùng bạn bè"], correctAnswer: "Không phân bổ ngân sách trước khi chi tiêu", explanation: "Vấn đề là không có kế hoạch phân bổ ngân sách trước khi tiêu." }
      ]
    },
    theoryExercise: {
      title: "Phương pháp ghi chép chi tiêu",
      content: "Ghi chép chi tiêu là bước đầu tiên trong quản lý tài chính cá nhân. Khi bạn ghi lại mọi khoản chi – dù chỉ là ly cà phê 25.000đ – bạn sẽ nhìn thấy \"bức tranh toàn cảnh\" về dòng tiền của mình.\n\nCó nhiều cách ghi chép: sổ tay, bảng Excel, hoặc ứng dụng điện thoại. Điều quan trọng là duy trì thói quen ghi chép đều đặn mỗi ngày.",
      keyMessage: "Bạn không thể quản lý thứ mà bạn không đo lường được.",
      questions: [
        { id: "t1q1", type: "mcq", question: "Mục đích chính của ghi chép chi tiêu là gì?", options: ["Để khoe với bạn bè", "Để nhận diện thói quen tiêu xài và kiểm soát dòng tiền", "Để ngân hàng kiểm tra", "Để giảm thuế"], correctAnswer: "Để nhận diện thói quen tiêu xài và kiểm soát dòng tiền", explanation: "Ghi chép giúp nhận diện khoản chi không cần thiết và tối ưu ngân sách." },
        { id: "t1q2", type: "blank", question: "Hoàn thành câu sau:", textBefore: "Quy tắc", textAfter: "chia thu nhập: 50% thiết yếu, 30% mong muốn, 20% tiết kiệm.", blankOptions: ["50/30/20", "80/20", "70/30", "40/40/20"], correctWord: "50/30/20", explanation: "Quy tắc 50/30/20 là phương pháp phổ biến nhất để phân bổ thu nhập." },
        { id: "t1q3", type: "mcq", question: "Khi thu nhập không đủ cho 50% thiết yếu, bạn nên?", options: ["Vay mượn", "Cắt giảm chi phí mong muốn", "Bỏ tiết kiệm", "Không làm gì"], correctAnswer: "Cắt giảm chi phí mong muốn", explanation: "Ưu tiên cắt giảm chi tiêu mong muốn (30%) trước." }
      ]
    }
  },
  "2": {
    title: "Tiết kiệm", subtitle: "Xây dựng thói quen tích lũy tiền bạc", lessonIndex: "Bài 2 / 12", progress: 100,
    videoTitle: "Bài 2: Thiết lập thói quen tiết kiệm", videoDuration: "11 phút", videoLevel: "Cơ bản", videoTopic: "Chủ đề: Tích lũy tài sản", videoUrl: "https://www.youtube.com/embed/npIWZ4ropZ8",
    overview: "Tiết kiệm là nền tảng của mọi quyết định đầu tư. Thói quen tiết kiệm quan trọng hơn số tiền tiết kiệm được.",
    keyPoints: ["Trả cho bản thân trước: Trích tiết kiệm ngay khi nhận lương.", "Tự động hóa: Chuyển khoản tiết kiệm tự động.", "Động lực cụ thể: Đặt tên cho mục tiêu tiết kiệm."],
    initialChat: [{ sender: "ai", text: "Chào mừng bạn đến với bài học Tiết kiệm! Tôi là Kavi." }, { sender: "ai", text: "Hãy hỏi tôi bất cứ điều gì nhé!" }],
    summary: ["Trả cho bản thân trước: Tiết kiệm trước khi chi tiêu.", "Tự động hóa chuyển khoản tiết kiệm.", "Đặt mục tiêu tiết kiệm rõ ràng."],
    glossary: [{ term: "Trả cho bản thân trước", definition: "Gửi tiền lương vào tài khoản tích lũy trước khi chi trả." }, { term: "Tự động hóa tài chính", definition: "Chuyển tiền tự động sang tài khoản tiết kiệm định kỳ." }, { term: "Lạm phát", definition: "Mức giá chung tăng liên tục theo thời gian." }],
    scenarioExercise: {
      title: "\"Kế hoạch mua laptop của Tuấn\"",
      story: "Tuấn muốn mua laptop 15.000.000đ. Lương thực tập 7.000.000đ/tháng. Tuấn trích 1.500.000đ/tháng tiết kiệm. Nhưng sau 3 tháng chỉ được 2.500.000đ vì thường \"mượn tạm\" tiền tiết kiệm đi chơi cuối tuần.",
      questions: [
        { id: "s2q1", type: "mcq", question: "Vấn đề chính trong kế hoạch tiết kiệm của Tuấn?", options: ["Lương quá thấp", "Không tự động hóa và thiếu kỷ luật", "Laptop quá đắt", "Không có tài khoản ngân hàng"], correctAnswer: "Không tự động hóa và thiếu kỷ luật", explanation: "Tuấn để tiền chung nên dễ 'mượn tạm'. Tự động hóa sẽ tách biệt 2 dòng tiền." },
        { id: "s2q2", type: "mcq", question: "Nếu tiết kiệm đúng kế hoạch, bao lâu Tuấn đủ tiền?", options: ["5 tháng", "8 tháng", "10 tháng", "12 tháng"], correctAnswer: "10 tháng", explanation: "15.000.000 ÷ 1.500.000 = 10 tháng." },
        { id: "s2q3", type: "mcq", question: "Hành động nào giúp Tuấn cải thiện tốt nhất?", options: ["Không đi chơi nữa", "Thiết lập lệnh tự động trích tiết kiệm", "Vay mượn mua ngay", "Chờ tăng lương"], correctAnswer: "Thiết lập lệnh tự động trích tiết kiệm", explanation: "Nguyên tắc 'Trả cho bản thân trước': Tự động trích trước khi có cơ hội tiêu." }
      ]
    },
    theoryExercise: {
      title: "Sức mạnh của thói quen tiết kiệm nhỏ",
      content: "Tiết kiệm 50.000đ mỗi ngày (tương đương 1 ly cà phê) sẽ cho bạn 18.250.000đ sau 1 năm.\n\nĐiều quan trọng không phải là số tiền, mà là thói quen. Khi thói quen đã hình thành, bạn sẽ tự nhiên tăng dần số tiền tiết kiệm.",
      keyMessage: "Thói quen tiết kiệm quan trọng hơn số tiền. Bắt đầu nhỏ, duy trì đều đặn.",
      questions: [
        { id: "t2q1", type: "mcq", question: "\"Trả cho bản thân trước\" có nghĩa là gì?", options: ["Mua đồ cho mình trước", "Trích tiết kiệm ngay khi nhận lương", "Trả nợ trước", "Chi tiêu thoải mái"], correctAnswer: "Trích tiết kiệm ngay khi nhận lương", explanation: "Trích tiết kiệm TRƯỚC KHI chi tiêu." },
        { id: "t2q2", type: "matching", question: "Nối khái niệm với định nghĩa:", matchingLeft: ["Trả cho bản thân trước", "Tự động hóa", "Đặt tên mục tiêu"], matchingRight: ["Tăng động lực", "Trích tiết kiệm ngay khi nhận lương", "Chuyển khoản tự động"], correctMatches: { "Trả cho bản thân trước": "Trích tiết kiệm ngay khi nhận lương", "Tự động hóa": "Chuyển khoản tự động", "Đặt tên mục tiêu": "Tăng động lực" }, explanation: "Mỗi khái niệm gắn với một hành động cụ thể trong quy trình tiết kiệm." },
        { id: "t2q3", type: "short_answer", question: "Tiết kiệm 50.000đ/ngày trong 1 năm (365 ngày) được bao nhiêu?", acceptedAnswers: ["18250000", "18.250.000", "18,250,000", "18.250.000đ", "18250000đ"], explanation: "50.000 × 365 = 18.250.000đ." }
      ]
    }
  },
  "3": {
    title: "Quỹ dự phòng", subtitle: "Tấm khiên bảo vệ tài chính trước rủi ro", lessonIndex: "Bài 3 / 12", progress: 75,
    videoTitle: "Bài 3: Quỹ dự phòng - Lá chắn tài chính", videoDuration: "12 phút", videoLevel: "Cơ bản", videoTopic: "Chủ đề: An toàn tài chính", videoUrl: "https://www.youtube.com/embed/npIWZ4ropZ8",
    overview: "Quỹ dự phòng đóng vai trò là tấm đệm giảm chấn, bảo vệ bạn khỏi những cú sốc tài chính bất ngờ.",
    keyPoints: ["Mục đích độc lập: Không dùng cho sở thích cá nhân.", "Tính thanh khoản cao: Dễ rút ra trong ngày.", "Quy mô: Duy trì 3 đến 6 tháng sinh hoạt phí."],
    initialChat: [{ sender: "ai", text: "Chào bạn! Quỹ dự phòng là lá chắn kiên cố nhất." }, { sender: "ai", text: "Hãy hỏi tôi bất cứ thắc mắc nào nhé!" }],
    summary: ["Quỹ dự phòng bảo vệ bạn khỏi nợ nần khi gặp rủi ro.", "Quy mô tối thiểu: 3 đến 6 tháng sinh hoạt phí.", "Để ở tài khoản tiết kiệm dễ rút."],
    glossary: [{ term: "Quỹ dự phòng", definition: "Khoản tiền dự trữ chỉ dùng cho khẩn cấp." }, { term: "Thanh khoản", definition: "Mức độ dễ dàng chuyển đổi thành tiền mặt." }, { term: "Chi phí sinh hoạt tối thiểu", definition: "Tổng tiền bắt buộc mỗi tháng." }],
    scenarioExercise: {
      title: "\"Cú sốc bất ngờ của Hải\"",
      story: "Hải làm nhân viên văn phòng lương 12.000.000đ/tháng. Hải chi tiêu thoải mái, không có quỹ dự phòng. Một ngày xe máy hỏng nặng cần 5.000.000đ sửa. Cùng lúc Hải bị ốm nghỉ 1 tuần không lương.\n\nKhông có dự phòng, Hải vay nóng 8.000.000đ lãi cao, mất 3 tháng mới trả hết.",
      questions: [
        { id: "s3q1", type: "mcq", question: "Quỹ dự phòng tối thiểu nên bằng bao nhiêu tháng sinh hoạt phí?", options: ["1–2 tháng", "3–6 tháng", "9–12 tháng", "Không cần"], correctAnswer: "3–6 tháng", explanation: "Chuyên gia khuyến nghị 3-6 tháng chi phí sinh hoạt tối thiểu." },
        { id: "s3q2", type: "mcq", question: "Nếu Hải có quỹ dự phòng, điều gì sẽ khác?", options: ["Xe không hỏng", "Không cần vay nóng lãi cao", "Được tăng lương", "Không bị ốm"], correctAnswer: "Không cần vay nóng lãi cao", explanation: "Quỹ dự phòng giúp xử lý khẩn cấp mà không cần vay nợ." },
        { id: "s3q3", type: "mcq", question: "Quỹ dự phòng nên cất ở đâu?", options: ["Chứng khoán", "Tài khoản tiết kiệm dễ rút", "Cho bạn vay", "Mua vàng"], correctAnswer: "Tài khoản tiết kiệm dễ rút", explanation: "Cần thanh khoản cao – rút ngay trong ngày khi cần." }
      ]
    },
    theoryExercise: {
      title: "Xây dựng quỹ dự phòng từ con số 0",
      content: "Bạn có thể bắt đầu từ mục tiêu nhỏ: tích lũy đủ 1 tháng sinh hoạt phí trước, rồi tăng dần lên 3 tháng và 6 tháng.\n\nQuỹ dự phòng KHÔNG dùng cho mua sắm hay giải trí. Nó chỉ được sử dụng khi có sự kiện khẩn cấp thực sự.",
      keyMessage: "Quỹ dự phòng không phải để giàu, mà để bạn không nghèo đi khi gặp biến cố.",
      questions: [
        { id: "t3q1", type: "mcq", question: "Tình huống nào KHÔNG nên dùng quỹ dự phòng?", options: ["Sửa xe hỏng đột ngột", "Mua điện thoại mới vì thích", "Khám bệnh khẩn cấp", "Tiền nhà khi mất việc"], correctAnswer: "Mua điện thoại mới vì thích", explanation: "Quỹ dự phòng chỉ dùng cho khẩn cấp thực sự." },
        { id: "t3q2", type: "blank", question: "Hoàn thành câu sau:", textBefore: "Quỹ dự phòng nên tương đương", textAfter: "tháng chi phí sinh hoạt tối thiểu.", blankOptions: ["1–2", "3–6", "12–24", "0"], correctWord: "3–6", explanation: "Mức 3-6 tháng đủ để xử lý hầu hết tình huống khẩn cấp." },
        { id: "t3q3", type: "mcq", question: "Đặc điểm quan trọng nhất của quỹ dự phòng?", options: ["Sinh lời cao", "Thanh khoản cao – rút nhanh", "Được bảo hiểm 100%", "Không bao giờ mất giá"], correctAnswer: "Thanh khoản cao – rút nhanh", explanation: "Tính thanh khoản quan trọng hơn lãi suất cho quỹ dự phòng." }
      ]
    }
  },
  "4": {
    title: "Lãi kép", subtitle: "Kỳ quan thứ 8 hoạt động thế nào?", lessonIndex: "Bài 4 / 12", progress: 25,
    videoTitle: "Bài 4: Lãi kép hoạt động như thế nào?", videoDuration: "12 phút", videoLevel: "Cơ bản", videoTopic: "Chủ đề: Tiết kiệm & Đầu tư", videoUrl: "https://www.youtube.com/embed/npIWZ4ropZ8",
    overview: "Lãi kép (Compound Interest) được Albert Einstein mệnh danh là kỳ quan thứ 8 của thế giới.",
    keyPoints: ["Tái đầu tư liên tục: Lãi gộp vào vốn gốc để sinh lời kỳ sau.", "Thời gian là đòn bẩy: Càng dài, tăng trưởng càng mạnh.", "Tần suất dồn gốc: Theo tháng/quý tốt hơn theo năm."],
    initialChat: [{ sender: "ai", text: "Chào bạn! Sức mạnh lãi kép thực sự kỳ diệu. Cùng tìm hiểu nhé!" }, { sender: "ai", text: "Mẹo: Click micro và nói câu hỏi để soạn nhanh tin nhắn." }],
    summary: ["Lãi kép tính trên cả vốn gốc và lãi tích lũy.", "Thời gian là nhân tố quyết định.", "Bắt đầu tích lũy ngay hôm nay."],
    glossary: [{ term: "Lãi kép", definition: "Lãi kỳ trước cộng vào vốn gốc để tính lãi kỳ tiếp." }, { term: "Tái đầu tư", definition: "Không rút lãi mà gộp vào vốn để sinh lời tiếp." }, { term: "Tăng trưởng mũ", definition: "Tốc độ tăng nhanh dần theo thời gian." }],
    scenarioExercise: {
      title: "\"Chiếc tai nghe trả sau của Quốc Bảo\"",
      story: "Quốc Bảo là sinh viên năm cuối. Trong một lần thấy tai nghe giảm giá, Bảo mua bằng ví trả sau với giá 3.000.000đ. Bảo nghĩ rằng \"tháng sau có lương thực tập rồi trả cũng được\". Nhưng vì còn nhiều khoản chi như ăn uống, sinh nhật bạn, cà phê làm đồ án và mua tài liệu, Bảo chỉ trả tối thiểu và để khoản nợ bị cộng phí 3% mỗi tháng.\n\nBảo không mua thêm gì lớn, nhưng sau 12 tháng, khoản 3.000.000đ ban đầu tăng lên khoảng 4.277.000đ nếu không được trả dứt điểm. Bảo bất ngờ vì \"mình đâu có mượn nhiều đến vậy\".",
      questions: [
        { id: "s4q1", type: "mcq", question: "Vì sao khoản nợ của Bảo tăng từ 3.000.000đ lên khoảng 4.277.000đ?", options: ["Vì Bảo bị trừ tiền ngẫu nhiên", "Vì lãi/phí được cộng dồn theo thời gian", "Vì tai nghe tăng giá", "Vì Bảo không có tài khoản ngân hàng"], correctAnswer: "Vì lãi/phí được cộng dồn theo thời gian", explanation: "Mỗi tháng phí/lãi cộng vào số dư nợ, tháng tiếp tính trên số dư mới." },
        { id: "s4q2", type: "mcq", question: "Trong tình huống này, lãi kép đang có lợi hay có hại cho Bảo?", options: ["Có lợi", "Có hại", "Không ảnh hưởng", "Chỉ có lợi nếu Bảo mua thêm đồ"], correctAnswer: "Có hại", explanation: "Lãi kép tốt khi tiền sinh lời cho mình, nhưng khi nợ thì nó làm khoản trả tăng nhanh." },
        { id: "s4q3", type: "mcq", question: "Nếu Bảo trả dứt điểm khoản nợ sớm, điều gì xảy ra?", options: ["Tổng tiền phải trả giảm", "Tổng tiền phải trả tăng", "Không thay đổi", "Lãi suất tự động biến mất"], correctAnswer: "Tổng tiền phải trả giảm", explanation: "Trả sớm giảm thời gian lãi cộng dồn, tổng tiền trả thấp hơn." },
        { id: "s4q4", type: "mcq", question: "Sai lầm lớn nhất của Bảo là gì?", options: ["Mua tai nghe", "Dùng ví trả sau mà không có kế hoạch trả rõ ràng", "Là sinh viên năm cuối", "Có lương thực tập"], correctAnswer: "Dùng ví trả sau mà không có kế hoạch trả rõ ràng", explanation: "Vấn đề là dùng nợ ngắn hạn mà không dự trù dòng tiền trả nợ." },
        { id: "s4q5", type: "mcq", question: "Hành động nào hợp lý nhất để tránh lặp lại?", options: ["Không bao giờ mua gì nữa", "Chỉ mua khi có kế hoạch trả và hiểu phí/lãi", "Mua nhiều để được giảm giá", "Chờ bạn bè nhắc"], correctAnswer: "Chỉ mua khi có kế hoạch trả và hiểu phí/lãi", explanation: "Quản lý tài chính là hiểu chi phí thật của quyết định trước khi mua." }
      ]
    },
    theoryExercise: {
      title: "Lạm phát và sức mua",
      content: "Lạm phát là sự tăng lên của mặt bằng giá theo thời gian. Khi lạm phát xảy ra, cùng một số tiền có thể mua được ít hơn so với trước. Đây là lý do một tô phở, một ly cà phê, một chiếc điện thoại hay một khoản học phí có thể đắt hơn sau vài năm.\n\nLạm phát không làm số tiền trong ví biến mất, nhưng làm sức mua của số tiền đó giảm xuống. Vì vậy, khi lập mục tiêu tài chính dài hạn, bạn không chỉ cần biết \"món đó hôm nay giá bao nhiêu\", mà còn cần ước tính \"sau này có thể cần bao nhiêu\".\n\nVới sinh viên và người mới đi làm, lạm phát tạo ra 3 bài học quan trọng. Thứ nhất, tiết kiệm cần có mục tiêu và thời hạn rõ ràng. Thứ hai, mục tiêu càng xa thì càng nên có khoản dự phòng. Thứ ba, khi đã có nền tảng an toàn, bạn cần học cách để tiền không đứng yên quá lâu trong khi giá cả tăng lên.",
      keyMessage: "Tiết kiệm là bước đầu. Nhưng để đạt mục tiêu dài hạn, bạn cần tính đến sức mua của tiền.",
      questions: [
        { id: "t4q1", type: "mcq", question: "Lạm phát làm điều gì xảy ra?", options: ["Giá cả có xu hướng tăng", "Tiền luôn sinh lãi", "Mọi người tự động giàu hơn", "Mục tiêu tài chính biến mất"], correctAnswer: "Giá cả có xu hướng tăng", explanation: "Lạm phát thể hiện sự tăng lên của mặt bằng giá." },
        { id: "t4q2", type: "short_answer", question: "Một món đồ giá 5.000.000đ tăng 6% sau 1 năm. Giá mới là bao nhiêu?", acceptedAnswers: ["5300000", "5.300.000", "5,300,000", "5.300.000đ", "5300000đ"], explanation: "5.000.000 × 1,06 = 5.300.000đ." },
        { id: "t4q3", type: "mcq", question: "Giữ tiền mặt lâu dài, rủi ro chính là gì?", options: ["Sức mua giảm", "Tiền đổi màu", "Tài khoản bị khóa", "Không thể chi tiêu"], correctAnswer: "Sức mua giảm", explanation: "Khi giá tăng, tiền không đổi sẽ mua được ít hơn." },
        { id: "t4q4", type: "matching", question: "Nối tình huống với khái niệm phù hợp:", matchingLeft: ["Giá đồ ăn tăng qua từng năm", "Cùng 100.000đ mua được ít hơn", "Tăng mục tiêu từ 5tr lên 5,6tr", "Dự phòng thêm tiền khi mua món lớn"], matchingRight: ["Lạm phát", "Sức mua giảm", "Điều chỉnh theo lạm phát", "Biên an toàn"], correctMatches: { "Giá đồ ăn tăng qua từng năm": "Lạm phát", "Cùng 100.000đ mua được ít hơn": "Sức mua giảm", "Tăng mục tiêu từ 5tr lên 5,6tr": "Điều chỉnh theo lạm phát", "Dự phòng thêm tiền khi mua món lớn": "Biên an toàn" }, explanation: "Mỗi tình huống liên quan đến một khía cạnh của lạm phát." },
        { id: "t4q5", type: "mcq", question: "Đặt mục tiêu tài chính 2–3 năm, lựa chọn nào hợp lý?", options: ["Chỉ tính giá hiện tại", "Tính thêm khả năng giá tăng", "Không cần kế hoạch", "Chỉ dựa vào cảm xúc"], correctAnswer: "Tính thêm khả năng giá tăng", explanation: "Mục tiêu càng dài hạn càng cần tính đến lạm phát." }
      ]
    }
  }
};


const formatChatText = (text: string) => {
  if (!text) return null;
  // Parse **bold** markdown
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
};

const MatchingExercise = ({ q, answer, handleSetAnswer, isSubmitted, showFeedback, activeExerciseTab }: any) => {
  let matches: Record<string, string> = {};
  try { matches = JSON.parse(answer || "{}"); } catch {}
  
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  const [selectedMatchRight, setSelectedMatchRight] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  const [lines, setLines] = useState<any[]>([]);

  const updateLines = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = [];
    
    let currentMatches: Record<string, string> = {};
    try { currentMatches = JSON.parse(answer || "{}"); } catch {}
    
    for (const [leftItem, rightItem] of Object.entries(currentMatches)) {
      const leftEl = leftRefs.current[leftItem];
      const rightEl = rightRefs.current[rightItem];
      if (leftEl && rightEl) {
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        
        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;
        
        let color = "#cbd5e1"; // default matched line color
        let dashed = false;
        if (showFeedback) {
          const isCorrect = currentMatches[leftItem] === q.correctMatches?.[leftItem];
          color = isCorrect ? "#10b981" : "#f43f5e"; // emerald or rose
          dashed = !isCorrect;
        } else {
          color = "#0ea5e9"; // primary color while doing
        }
        
        newLines.push({ id: leftItem, x1, y1, x2, y2, color, dashed });
      }
    }
    setLines(newLines);
  }, [answer, showFeedback, q.correctMatches]);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [updateLines]);

  const handleMatch = (side: "left"|"right", item: string) => {
    if (side === "left") {
      if (selectedMatchRight) {
        handleSetAnswer(activeExerciseTab, q.id, JSON.stringify({...matches, [item]: selectedMatchRight}));
        setSelectedMatchRight(null);
        setSelectedMatchLeft(null);
      } else {
        setSelectedMatchLeft(item);
      }
    } else {
      if (selectedMatchLeft) {
        handleSetAnswer(activeExerciseTab, q.id, JSON.stringify({...matches, [selectedMatchLeft]: item}));
        setSelectedMatchLeft(null);
        setSelectedMatchRight(null);
      } else {
        setSelectedMatchRight(item);
      }
    }
  };

  return (
    <div className="relative mt-3 p-1" ref={containerRef}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: "visible" }}>
        {lines.map(line => (
          <path 
            key={line.id} 
            d={`M ${line.x1} ${line.y1} C ${(line.x1 + line.x2) / 2} ${line.y1}, ${(line.x1 + line.x2) / 2} ${line.y2}, ${line.x2} ${line.y2}`} 
            stroke={line.color} 
            strokeWidth="3" 
            fill="none"
            strokeDasharray={line.dashed ? "6,6" : "0"} 
            strokeLinecap="round" 
            className="animate-fade-in drop-shadow-sm transition-all duration-300" 
          />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-8 md:gap-16 relative z-20">
        <div className="flex flex-col gap-3">
          {q.matchingLeft.map((item: string) => {
            const isMatched = Object.keys(matches).includes(item);
            const isSelected = selectedMatchLeft === item;
            let btnClass = isMatched 
              ? "bg-surface text-on-surface-variant border-outline-variant/30 shadow-inner" 
              : isSelected ? "bg-primary text-white border-primary shadow-md transform scale-105" : "bg-surface hover:bg-surface-container-high border-outline-variant/60 shadow-sm";
            if (showFeedback) {
              const isCorrect = matches[item] === q.correctMatches?.[item];
              if (isMatched) btnClass = isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-error-container border-error text-error";
            }
            return (
              <button 
                key={item} 
                ref={el => { leftRefs.current[item] = el; }}
                onClick={() => handleMatch("left", item)} 
                disabled={isMatched || isSubmitted} 
                className={`p-3.5 rounded-xl border text-center text-xs md:text-sm font-semibold transition-all duration-300 relative ${btnClass}`}
              >
                {item}
                {/* Connection dot */}
                <div className={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-surface bg-outline-variant/50 transition-colors ${isMatched ? (showFeedback ? (matches[item] === q.correctMatches?.[item] ? 'bg-emerald-500' : 'bg-error') : 'bg-primary') : isSelected ? 'bg-primary' : ''}`}></div>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {q.matchingRight.map((item: string) => {
            const isMatched = Object.values(matches).includes(item);
            const isSelected = selectedMatchRight === item;
            let btnClass = isMatched 
              ? "bg-surface text-on-surface-variant border-outline-variant/30 shadow-inner" 
              : isSelected ? "bg-primary text-white border-primary shadow-md transform scale-105" : "bg-surface hover:bg-surface-container-high border-outline-variant/60 shadow-sm";
            if (showFeedback && isMatched) {
              const leftKey = Object.keys(matches).find(k => matches[k] === item);
              const isCorrect = leftKey && matches[leftKey] === q.correctMatches?.[leftKey];
              btnClass = isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-error-container border-error text-error";
            }
            return (
              <button 
                key={item} 
                ref={el => { rightRefs.current[item] = el; }}
                onClick={() => handleMatch("right", item)} 
                disabled={isMatched || isSubmitted} 
                className={`p-3.5 rounded-xl border text-center text-xs md:text-sm font-semibold transition-all duration-300 relative ${btnClass}`}
              >
                {/* Connection dot */}
                <div className={`absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-surface bg-outline-variant/50 transition-colors ${isMatched ? (showFeedback ? (Object.keys(matches).find(k => matches[k] === item) && matches[Object.keys(matches).find(k => matches[k] === item)!] === q.correctMatches?.[Object.keys(matches).find(k => matches[k] === item)!] ? 'bg-emerald-500' : 'bg-error') : 'bg-primary') : isSelected ? 'bg-primary' : ''}`}></div>
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const lessonId = typeof params.id === "string" ? params.id : "4";
  
  const lesson = LESSONS_DATABASE[lessonId] || LESSONS_DATABASE["4"];

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFullLesson, setShowFullLesson] = useState(false);
  
  // Chatbot State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice dictation state
  const [isListening, setIsListening] = useState(false);
  
  // Toolbar collapse state
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  
  // Drawer visibility
  const [activeTab, setActiveTab] = useState<"chatbot" | "summary" | "notes" | "glossary" | null>(null);
  
  // Notes CRUD State
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isNoteInputFocused, setIsNoteInputFocused] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // YouTube Player Ref
  const playerRef = useRef<any>(null);
  const iframeId = "yt-lesson-player";
  
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2000);
  };
  
  // Flashcard State
  const [isFlipped, setIsFlipped] = useState(false);

  // New Exercise States
  const [activeExerciseTab, setActiveExerciseTab] = useState<"scenario" | "theory">("scenario");
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, string>>({});
  const [theoryAnswers, setTheoryAnswers] = useState<Record<string, string>>({});
  
  const [scenarioStatus, setScenarioStatus] = useState<"not_started" | "passed" | "failed">("not_started");
  const [theoryStatus, setTheoryStatus] = useState<"not_started" | "passed" | "failed">("not_started");
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false);
  const [showTheoryFeedback, setShowTheoryFeedback] = useState(false);

  // For matching type interactive UI (temporary states while matching)
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  const [selectedMatchRight, setSelectedMatchRight] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const ytApiReadyRef = useRef(false);

  // Text Selection State
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{ x: number, y: number } | null>(null);

  // Setup Web Speech API Voice Recognition for dictation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = "vi-VN";
        rec.interimResults = false;
        
        rec.onstart = () => {
          setIsListening(true);
          triggerToast("Đang thu âm... Hãy nói câu hỏi của bạn");
        };
        
        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          if (resultText && resultText.trim()) {
            setInputText(prev => prev + (prev ? " " : "") + resultText);
            triggerToast("Đã soạn văn bản thành công!");
          }
        };
        
        rec.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
          triggerToast("Lỗi thu âm. Vui lòng nói lại!");
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Text Selection Listener
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          const text = selection.toString().trim();
          // limit length so it doesn't trigger on huge accidental selections
          if (text.length > 2 && text.length < 1000) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectedText(text);
            setSelectionPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 10
            });
          } else {
            setSelectedText("");
            setSelectionPosition(null);
          }
        } else {
          setSelectedText("");
          setSelectionPosition(null);
        }
      }, 50); // slight delay to allow selection to settle
    };

    // Use document to capture all mouseup events
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const handleAskAIAboutSelection = () => {
    if (!selectedText) return;
    const prompt = `Giải thích đoạn văn bản sau:\n"${selectedText}"`;
    setInputText(prompt);
    setActiveTab("chatbot");
    setSelectedText("");
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
    
    // Auto-resize textarea to fit the injected prompt
    setTimeout(() => {
      const ta = document.getElementById("chatbot-textarea");
      if (ta) {
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
      }
    }, 50);
  };

  // Load YouTube iFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initPlayer = () => {
      setTimeout(() => {
        try {
          playerRef.current = new (window as any).YT.Player(iframeId, {
            events: { onReady: () => {} }
          });
        } catch (e) {
          console.error("YT Player Init Error:", e);
        }
      }, 500); // Wait for iframe to render
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      if (!ytApiReadyRef.current) {
        ytApiReadyRef.current = true;
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);

        const prevCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback();
          initPlayer();
        };
      }
    }
  }, [lessonId]);

  // Load lesson
  useEffect(() => {
    setIsSubmitted(false);
    setShowFullLesson(false);
    
    // Reset exercise states
    setActiveExerciseTab("scenario");
    setScenarioAnswers({});
    setTheoryAnswers({});
    setScenarioStatus("not_started");
    setTheoryStatus("not_started");
    setShowScenarioFeedback(false);
    setShowTheoryFeedback(false);
    setSelectedMatchLeft(null);
    setSelectedMatchRight(null);

    setIsFlipped(false);
    setEditingNoteId(null);
    setNewNoteText("");
  }, [lessonId, lesson]);

  // Fetch chat history and notes from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Chat History
        const chatSessionId = `session_${user?.uid || 'anonymous'}_lesson_${lessonId}`;
        const chatSnap = await getDoc(doc(db, "learning_chat_sessions", chatSessionId));
        if (chatSnap.exists()) {
          setMessages(chatSnap.data().messages || []);
        } else {
          const msgs: Message[] = lesson.initialChat.map((m, index) => ({
            id: `init-${index}`,
            sender: m.sender,
            text: m.text,
            timestamp: new Date(Date.now() - (2 - index) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(msgs);
        }

        // Fetch Notes
        const notesDocId = `notes_${user?.uid || 'anonymous'}_lesson_${lessonId}`;
        const notesSnap = await getDoc(doc(db, "learning_notes", notesDocId));
        if (notesSnap.exists()) {
          setNotes(notesSnap.data().notes || []);
        } else {
          // Fallback to localStorage if Firebase is empty
          const userScopedKey = `kavict-notes-v2-user-${user?.uid || 'anonymous'}-lesson-${lessonId}`;
          const legacyKey = `kavict-notes-v2-lesson-${lessonId}`;
          let savedNotes = localStorage.getItem(userScopedKey);
          
          if (!savedNotes && !user?.uid) {
            // Only fallback to legacy generic key if the user is anonymous
            savedNotes = localStorage.getItem(legacyKey);
          }

          if (savedNotes) {
            try { setNotes(JSON.parse(savedNotes)); } catch { setNotes([]); }
          } else {
            setNotes([]);
          }
        }
      } catch (err) {
        console.error("Error loading data from Firebase:", err);
      }
    };
    if (lesson) fetchData();
  }, [lessonId, user?.uid, lesson]);

  // Scroll chat list
  useEffect(() => {
    if (activeTab === "chatbot") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  const handleVoiceInputToggle = () => {
    if (!recognitionRef.current) {
      triggerToast("Trình duyệt không hỗ trợ nhận dạng âm thanh!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const msgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: msgId,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText("");
    setIsTyping(true);

    try {
      // Call Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          message: text,
          lessonContext: lesson.title
        })
      });
      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text || data.error || "Xin lỗi, tôi không thể trả lời lúc này.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, aiMsg];
      setMessages(finalMessages);
      
      // Save to Firebase
      const sessionId = `session_${user?.uid || 'anonymous'}_lesson_${lessonId}`;
      await setDoc(doc(db, "learning_chat_sessions", sessionId), {
        lessonId,
        userId: user?.uid || 'anonymous',
        messages: finalMessages,
        updatedAt: new Date().toISOString()
      }, { merge: true });

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "Có lỗi kết nối đến Kavi, vui lòng thử lại sau.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveNotesToStorage = (updatedNotes: Note[]) => {
    const userScopedKey = `kavict-notes-v2-user-${user?.uid || 'anonymous'}-lesson-${lessonId}`;
    localStorage.setItem(userScopedKey, JSON.stringify(updatedNotes));
    
    // Sync to Firebase
    const docId = `notes_${user?.uid || 'anonymous'}_lesson_${lessonId}`;
    setDoc(doc(db, "learning_notes", docId), {
      lessonId,
      userId: user?.uid || 'anonymous',
      notes: updatedNotes,
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(err => console.error("Error syncing notes:", err));
  };

  const addNote = (text: string) => {
    if (!text.trim()) return;

    let newNote: Note;
    if (pendingTimestamp !== null) {
      newNote = {
        id: `ts-${Date.now()}`,
        text: text.trim(),
        type: "video-timestamp",
        videoTime: pendingTimestamp,
        createdAt: new Date().toISOString()
      };
      setPendingTimestamp(null);
    } else {
      newNote = {
        id: `note-${Date.now()}`,
        text: text.trim(),
        type: "text",
        createdAt: new Date().toISOString()
      };
    }

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotesToStorage(updated);
    setNewNoteText("");
    setIsNoteInputFocused(false);
    triggerToast("Đã thêm ghi chú!");
  };

  const addTimestampNote = () => {
    let seconds = 0;
    try {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        seconds = Math.floor(playerRef.current.getCurrentTime());
      }
    } catch {}
    
    setPendingTimestamp(seconds);
    setActiveTab("notes");
    setIsNoteInputFocused(true);
  };

  const updateNote = (id: string, text: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, text } : n);
    setNotes(updated);
    saveNotesToStorage(updated);
    setEditingNoteId(null);
    triggerToast("Đã cập nhật ghi chú!");
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveNotesToStorage(updated);
    triggerToast("Đã xóa ghi chú!");
  };

  const seekToTime = (seconds: number) => {
    try {
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(seconds, true);
      }
    } catch {}
    triggerToast("Đã tua đến mốc video!");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Updated Exercise functions
  const handleSetAnswer = (tab: "scenario" | "theory", questionId: string, answer: string) => {
    if (tab === "scenario") {
      setScenarioAnswers(prev => ({ ...prev, [questionId]: answer }));
    } else {
      setTheoryAnswers(prev => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleSubmitExercise = (tab: "scenario" | "theory") => {
    const exercise = tab === "scenario" ? lesson.scenarioExercise : lesson.theoryExercise;
    const answers = tab === "scenario" ? scenarioAnswers : theoryAnswers;
    
    let allCorrect = true;
    
    // Validate each question
    exercise.questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (!userAnswer) {
        allCorrect = false;
        return;
      }
      
      if (q.type === "mcq") {
        if (userAnswer !== q.correctAnswer) allCorrect = false;
      } else if (q.type === "blank") {
        if (userAnswer !== q.correctWord) allCorrect = false;
      } else if (q.type === "short_answer") {
        const normalizedUser = userAnswer.trim().toLowerCase().replace(/đ/g, "đ").replace(/,/g, "."); // handle Vietnamese formats
        const isMatch = q.acceptedAnswers?.some(ans => {
            const normalizedAns = ans.toLowerCase().replace(/,/g, ".");
            return normalizedUser === normalizedAns || normalizedUser === normalizedAns.replace(/đ/g, "");
        });
        if (!isMatch) allCorrect = false;
      } else if (q.type === "matching") {
        try {
          const parsedMatches = JSON.parse(userAnswer);
          const correctMatches = q.correctMatches || {};
          if (Object.keys(correctMatches).length !== Object.keys(parsedMatches).length) {
            allCorrect = false;
          } else {
            for (const key of Object.keys(correctMatches)) {
              if (parsedMatches[key] !== correctMatches[key]) allCorrect = false;
            }
          }
        } catch {
          allCorrect = false;
        }
      }
    });

    if (tab === "scenario") {
      setScenarioStatus(allCorrect ? "passed" : "failed");
      setShowScenarioFeedback(true);
    } else {
      setTheoryStatus(allCorrect ? "passed" : "failed");
      setShowTheoryFeedback(true);
    }

    if (allCorrect) {
      setIsSubmitted(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        document.getElementById('celebration-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-100px)] relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-1.5 animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Floating Text Selection Menu */}
      {selectedText && selectionPosition && (
        <div 
          className="fixed z-[100] animate-fade-in"
          style={{ 
            left: `${selectionPosition.x}px`, 
            top: `${selectionPosition.y}px`, 
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="bg-surface-container-highest border border-outline-variant/50 shadow-lg rounded-xl px-2 py-1.5 flex items-center gap-1">
            <button
              onClick={handleAskAIAboutSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-primary/10 rounded-lg text-primary text-xs font-bold transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-500" style={{fontVariationSettings: '"FILL" 1'}}>auto_awesome</span>
              Hỏi AI Tutor
            </button>
          </div>
          {/* Triangle pointer */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-container-highest border-b border-r border-outline-variant/50 rotate-45"></div>
        </div>
      )}

      {/* Floating Toolbar Toggle Handle */}
      {!isToolbarVisible && (
        <button 
          onClick={() => setIsToolbarVisible(true)}
          className="fixed top-24 right-0 w-9 h-9 rounded-l-xl bg-primary text-on-primary border-t border-l border-b border-primary/20 shadow-lg flex items-center justify-center cursor-pointer z-40 hover:bg-primary-fixed-variant transition-all"
          title="Hiện thanh công cụ"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
      )}

      <div className="flex w-full flex-1 gap-5 relative items-start">
        
        {/* Main Content Area (Center Column) */}
        <main className="flex-1 min-w-[320px] flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex justify-between items-center bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/learning" className="p-1 hover:bg-surface-container rounded-lg text-secondary hover:text-on-surface flex items-center transition-colors">
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </Link>
              <div>
                <h1 className="font-headline-lg text-[22px] md:text-[26px] text-on-surface font-bold leading-tight">
                  {lesson.title}
                </h1>
                <p className="font-label-sm text-xs text-on-surface-variant/80 mt-0.5">
                  Lộ trình học tập cá nhân hóa &bull; {lesson.lessonIndex}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-label-md text-xs md:text-sm text-on-surface-variant font-medium">
                Hoàn thành {lesson.progress}%
              </span>
              <div className="w-24 md:w-32 h-2 bg-outline-variant/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${lesson.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section 1: Video Lesson (Initially visible for all lessons) */}
          <section className="flex flex-col gap-sm bg-surface-container-lowest p-4 md:p-6 rounded-3xl border border-outline-variant/30 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="relative w-full max-h-[60vh] md:max-h-[460px] aspect-video rounded-2xl overflow-hidden bg-black">
              {/* REAL YOUTUBE PLAYER EMBED with iFrame API */}
              <iframe
                id={iframeId}
                className="absolute inset-0 w-full h-full"
                src={lesson.videoUrl + (typeof window !== "undefined" ? `?enablejsapi=1&origin=${window.location.origin}` : "?enablejsapi=1")}
                title={lesson.videoTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: 0 }}
              ></iframe>
            </div>
            
            <div className="flex justify-between items-start gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                  {lesson.videoTitle}
                </h2>
                <div className="flex flex-wrap gap-md items-center text-on-surface-variant text-xs md:text-sm font-label-md">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                    {lesson.videoDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                    {lesson.videoLevel}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[18px]">bookmark</span>
                    {lesson.videoTopic}
                  </span>
                </div>
              </div>

              {/* Timestamp Bookmark Button */}
              <button 
                onClick={addTimestampNote}
                className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant hover:border-primary hover:text-primary rounded-xl text-xs font-semibold text-on-surface-variant transition-all hover:bg-primary/5 cursor-pointer shrink-0"
                title="Thêm ghi chú tại thời điểm video hiện tại"
              >
                <span className="material-symbols-outlined text-[16px]">more_time</span>
                Thêm ghi chú
              </button>
            </div>

            {/* Pulsing Button to reveal Theory & Practice when not yet shown */}
            {!showFullLesson && (
              <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-center">
                <button
                  onClick={() => {
                    setShowFullLesson(true);
                    setTimeout(() => {
                      document.getElementById("theory-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="px-8 py-3 bg-primary text-on-primary font-bold rounded-full shadow hover:bg-primary-fixed-variant transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  Làm bài tập
                </button>
              </div>
            )}
          </section>

          {/* Conditional theory and quiz block */}
          {showFullLesson && (
            <div id="theory-section" className="animate-fade-in flex flex-col gap-6">
              
              {/* Section 3: Interactive Quizzes */}
              <section className="bg-surface-container-lowest p-5 md:p-6 rounded-3xl border border-outline-variant/30 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-6">


                {/* Exercise Tabs */}
                <div className="flex border-b border-outline-variant/30 mt-2">
                  <button 
                    onClick={() => setActiveExerciseTab("scenario")}
                    className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeExerciseTab === "scenario" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    Tình huống thực tế
                    {activeExerciseTab === "scenario" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveExerciseTab("theory")}
                    className={`flex-1 py-3 text-sm font-bold transition-all relative ${activeExerciseTab === "theory" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    Kiểm tra lý thuyết
                    {activeExerciseTab === "theory" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>}
                  </button>
                </div>

                {/* Exercise Content */}
                <div className="space-y-6">
                  {/* Content Header (Story Card) */}
                  <div className="relative overflow-hidden bg-primary/5 border border-primary/20 p-5 md:p-6 rounded-3xl shadow-sm">
                    <span className="material-symbols-outlined absolute -top-4 -right-4 text-[120px] text-primary/5 select-none pointer-events-none" style={{fontVariationSettings: '"FILL" 1'}}>
                      {activeExerciseTab === "scenario" ? "import_contacts" : "lightbulb"}
                    </span>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className="material-symbols-outlined text-primary text-[24px] p-2 bg-primary/10 rounded-xl shadow-sm">
                          {activeExerciseTab === "scenario" ? "menu_book" : "psychology"}
                        </span>
                        <h4 className="font-headline-sm text-base font-bold text-primary-fixed-variant">
                          {activeExerciseTab === "scenario" ? lesson.scenarioExercise.title : lesson.theoryExercise.title}
                        </h4>
                      </div>
                      <p className="text-sm md:text-base text-on-surface-variant whitespace-pre-wrap leading-relaxed border-l-4 border-primary/30 pl-4 py-1 font-medium bg-surface/40 p-2 rounded-r-xl">
                        {activeExerciseTab === "scenario" ? lesson.scenarioExercise.story : lesson.theoryExercise.content}
                      </p>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {(activeExerciseTab === "scenario" ? lesson.scenarioExercise.questions : lesson.theoryExercise.questions).map((q, idx) => {
                      const answer = (activeExerciseTab === "scenario" ? scenarioAnswers : theoryAnswers)[q.id] || "";
                      const status = activeExerciseTab === "scenario" ? scenarioStatus : theoryStatus;
                      const isSubmitted = status !== "not_started";
                      const showFeedback = activeExerciseTab === "scenario" ? showScenarioFeedback : showTheoryFeedback;

                      return (
                        <div key={q.id} className="p-4 bg-surface rounded-xl border border-outline-variant/30">
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <p className="text-sm font-bold text-on-surface leading-snug">{idx + 1}. {q.question}</p>
                            {q.explanation && (
                              <button 
                                onClick={() => setShowHints(prev => ({...prev, [q.id]: !prev[q.id]}))}
                                className="flex items-center gap-1 text-xs font-semibold text-primary/70 hover:text-primary transition-colors bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-full shrink-0"
                              >
                                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: '"FILL" 1'}}>lightbulb</span>
                                {showHints[q.id] ? "Ẩn gợi ý" : "Xem gợi ý"}
                              </button>
                            )}
                          </div>
                          
                          {showHints[q.id] && !showFeedback && (
                            <div className="mb-4 p-3 rounded-xl bg-secondary-container/40 text-on-secondary-container text-xs animate-fade-in flex items-start gap-2 border border-secondary/20 shadow-inner">
                              <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">info</span>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                          
                          {q.type === "mcq" && q.options && (
                            <div className="flex flex-col gap-3">
                              {q.options.map(option => {
                                const isSelected = answer === option;
                                let btnClass = isSelected 
                                  ? "border-primary bg-primary-container/30 text-primary shadow-md transform scale-[1.01]" 
                                  : "border-outline-variant/60 bg-surface hover:border-primary/60 hover:bg-surface-container hover:shadow-sm active:scale-95 text-on-surface";
                                if (showFeedback) {
                                   if (option === q.correctAnswer) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm";
                                   else if (isSelected) btnClass = "border-error bg-error-container text-error shadow-sm";
                                   else btnClass = "border-outline-variant/30 bg-surface/50 text-on-surface-variant/50 cursor-not-allowed";
                                }
                                return (
                                  <button
                                    key={option}
                                    onClick={() => handleSetAnswer(activeExerciseTab, q.id, option)}
                                    disabled={isSubmitted}
                                    className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all duration-200 flex items-center gap-3 group ${btnClass}`}
                                  >
                                    {isSelected && !showFeedback && <span className="material-symbols-outlined text-primary text-[20px] animate-fade-in shrink-0" style={{fontVariationSettings: '"FILL" 1'}}>radio_button_checked</span>}
                                    {!isSelected && !showFeedback && <span className="material-symbols-outlined text-outline-variant text-[20px] group-hover:text-primary/50 transition-colors shrink-0">radio_button_unchecked</span>}
                                    {showFeedback && option === q.correctAnswer && <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>}
                                    {showFeedback && isSelected && option !== q.correctAnswer && <span className="material-symbols-outlined text-error text-[20px] shrink-0" style={{fontVariationSettings: '"FILL" 1'}}>cancel</span>}
                                    <span>{option}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "blank" && q.blankOptions && (
                            <div>
                              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-inner leading-relaxed text-sm text-on-surface mb-4">
                                {q.textBefore}{' '}
                                <span className="inline-flex min-w-[80px] justify-center font-bold text-primary border-b-2 border-primary px-3 pb-0.5 bg-primary/5 rounded-t">
                                  {answer || '......'}
                                </span>{' '}
                                {q.textAfter}
                              </div>
                              <div className="flex flex-wrap gap-2.5">
                                {q.blankOptions.map(word => {
                                  const isSelected = answer === word;
                                  let btnClass = isSelected 
                                    ? "border-primary bg-primary text-on-primary shadow-md transform scale-105" 
                                    : "border-outline-variant/50 bg-surface text-on-surface hover:border-primary/60 hover:bg-surface-container-high active:scale-95 shadow-sm hover:shadow";
                                  if (showFeedback) {
                                    if (word === q.correctWord) btnClass = "border-emerald-500 bg-emerald-500 text-white shadow-md";
                                    else if (isSelected) btnClass = "border-error bg-error text-white shadow-md";
                                    else btnClass = "border-outline-variant/30 bg-surface/50 text-on-surface-variant/50 cursor-not-allowed shadow-none";
                                  }
                                  return (
                                    <button
                                      key={word}
                                      onClick={() => handleSetAnswer(activeExerciseTab, q.id, word)}
                                      disabled={isSubmitted}
                                      className={`px-5 py-2.5 rounded-lg border text-sm font-bold transition-all duration-200 ${btnClass}`}
                                    >
                                      {word}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {q.type === "short_answer" && (
                            <input 
                              type="text" 
                              value={answer}
                              onChange={(e) => handleSetAnswer(activeExerciseTab, q.id, e.target.value)}
                              disabled={isSubmitted}
                              placeholder="Nhập đáp án..."
                              className={`w-full p-3 rounded-xl border text-sm transition-all bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${
                                showFeedback 
                                  ? (q.acceptedAnswers?.includes(answer.toLowerCase().replace(/đ/g, "").replace(/,/g, ".")) 
                                      ? "border-emerald-500 bg-emerald-50" 
                                      : "border-error bg-error-container") 
                                  : "border-outline-variant/60"
                              }`}
                            />
                          )}

                          {q.type === "matching" && q.matchingLeft && q.matchingRight && (
                             <MatchingExercise 
                               q={q}
                               answer={answer}
                               handleSetAnswer={handleSetAnswer}
                               isSubmitted={isSubmitted}
                               showFeedback={showFeedback}
                               activeExerciseTab={activeExerciseTab}
                             />
                          )}

                          {showFeedback && (
                            <div className={`mt-3 p-3 rounded-xl border text-xs animate-fade-in ${
                              status === "passed" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-primary/5 border-primary/20 text-on-surface-variant"
                            }`}>
                               <span className="font-bold flex items-center gap-1 mb-1">
                                 <span className="material-symbols-outlined text-[16px]">{status === "passed" ? "check_circle" : "lightbulb"}</span>
                                 Giải thích:
                               </span>
                               {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Submit Button */}
                  {((activeExerciseTab === "scenario" && scenarioStatus === "not_started") || 
                    (activeExerciseTab === "theory" && theoryStatus === "not_started")) && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => handleSubmitExercise(activeExerciseTab)}
                        className="px-8 py-3 bg-primary text-on-primary font-bold rounded-full shadow hover:bg-primary-fixed-variant transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        Nộp bài {activeExerciseTab === "scenario" ? "tình huống" : "lý thuyết"}
                      </button>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {((activeExerciseTab === "scenario" && scenarioStatus === "failed") || 
                    (activeExerciseTab === "theory" && theoryStatus === "failed")) && (
                    <div className="p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex flex-col items-center gap-2 mt-4 text-center animate-shake">
                      <span className="material-symbols-outlined text-[24px]">error</span>
                      <span className="text-sm font-semibold">Một số câu trả lời chưa chính xác. Bạn hãy xem phần giải thích và thử lại nhé!</span>
                      <button 
                        onClick={() => {
                          if (activeExerciseTab === "scenario") {
                            setScenarioStatus("not_started");
                            setShowScenarioFeedback(false);
                            setScenarioAnswers({});
                          } else {
                            setTheoryStatus("not_started");
                            setShowTheoryFeedback(false);
                            setTheoryAnswers({});
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-error text-white text-xs font-bold rounded-lg shadow-sm hover:bg-error/90 transition-all"
                      >
                        Làm lại
                      </button>
                    </div>
                  )}

                  {/* Success State */}
                  {((activeExerciseTab === "scenario" && scenarioStatus === "passed") || 
                    (activeExerciseTab === "theory" && theoryStatus === "passed")) && (
                    <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-300 flex flex-col items-center gap-2 mt-4 text-center animate-bounce-in">
                      <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                      <span className="text-sm font-bold">Tuyệt vời! Bạn đã hoàn thành phần bài tập này.</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 4: Completion State */}
              {isSubmitted && (
                <section id="celebration-section" className="bg-surface-container-lowest p-6 rounded-3xl border-2 border-primary/20 relative overflow-hidden shadow-md text-center flex flex-col items-center gap-5 fade-in-up">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                  
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-lg bounce-animation">
                    <span className="material-symbols-outlined !text-3xl" style={{fontVariationSettings: '\'FILL\' 1'}}>workspace_premium</span>
                  </div>
                  
                  <div>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">🎉 Chúc mừng! Bạn đã hoàn thành bài học.</h2>
                    <p className="font-body-md text-xs sm:text-sm text-on-surface-variant/80 mt-1">Đã kiểm tra và lưu kết quả vào tiến trình học tập của bạn.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full max-w-[480px] bg-surface p-3.5 rounded-2xl border border-outline-variant/20 mt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Kinh nghiệm</span>
                      <div className="flex items-center gap-0.5 text-primary mt-1">
                        <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: '\'FILL\' 1'}}>stars</span>
                        <span className="font-display text-sm font-bold">+50 XP</span>
                      </div>
                    </div>
                    
                    <div className="w-px h-8 bg-outline-variant/40 self-center"></div>
                    
                    <div className="flex flex-col items-center">
                      <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Tiến trình</span>
                      <div className="flex items-center gap-0.5 text-emerald-600 mt-1">
                        <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: '\'FILL\' 1'}}>leaderboard</span>
                        <span className="font-display text-sm font-bold">75%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[400px] mt-2">
                    <button className="flex-1 h-12 bg-primary text-on-primary rounded-xl font-label-md text-sm font-bold hover:bg-primary-fixed-variant transition-all shadow-md active:scale-95">
                      Bài học tiếp theo
                    </button>
                    <button 
                      onClick={() => router.push("/dashboard/learning")}
                      className="flex-1 h-12 border border-outline text-on-surface-variant rounded-xl font-label-md text-sm font-semibold hover:bg-surface transition-all active:scale-95"
                    >
                      Quay về lộ trình
                    </button>
                  </div>
                </section>
              )}

            </div>
          )}

        </main>

        {/* Side Drawer Panel */}
        {activeTab !== null && (
          <aside className="w-80 md:w-96 h-[calc(100vh-140px)] sticky top-4 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col animate-slide-in shrink-0 z-30">
            {/* Drawer Header */}
            <div className="p-4 border-b border-outline-variant/30 bg-surface flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">
                  {activeTab === "chatbot" && "smart_toy"}
                  {activeTab === "summary" && "summarize"}
                  {activeTab === "notes" && "edit_note"}
                  {activeTab === "glossary" && "menu_book"}
                </span>
                <h3 className="font-headline-sm text-sm md:text-headline-sm font-bold">
                  {activeTab === "chatbot" && "Trợ lý ảo Kavi"}
                  {activeTab === "summary" && "Tóm tắt cốt lõi"}
                  {activeTab === "notes" && "Ghi chú học tập"}
                  {activeTab === "glossary" && "Thuật ngữ bài học"}
                </h3>
              </div>
              
              <button 
                onClick={() => setActiveTab(null)}
                className="p-1 hover:bg-surface-container rounded-lg text-secondary hover:text-on-surface flex items-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
              
              {/* CHATBOT PANEL */}
              {activeTab === "chatbot" && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <p className="text-[11px] text-on-surface-variant font-medium mb-3">Bạn có thể hỏi bằng cách gõ phím hoặc bấm micro thu âm để điền chữ vào ô chat và chỉnh sửa tùy ý.</p>
                  
                  {/* Chat messages list */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 mb-3 pr-1 custom-scrollbar">
                    {messages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.sender === "ai" && (
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <span className="material-symbols-outlined text-[14px] font-bold">smart_toy</span>
                          </div>
                        )}
                        <div className={`max-w-[85%] flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                          <div className={
                            "p-3 rounded-2xl border text-xs leading-relaxed shadow-sm relative " +
                            (msg.sender === "user"
                              ? "bg-primary text-on-primary border-primary rounded-tr-sm"
                              : "bg-surface border-outline-variant/40 rounded-tl-sm text-on-surface")
                          }>
                            <span className="whitespace-pre-wrap">{formatChatText(msg.text)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                        </div>
                        <div className="bg-surface border border-outline-variant/40 p-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-on-surface-variant/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggestion Chips & Form Input with Dictation */}
                  <div className="mt-auto pt-2 border-t border-outline-variant/30">
                    <div className="flex gap-1.5 mb-2 overflow-x-auto hide-scrollbar pb-1">
                      <button 
                        onClick={() => handleSendMessage("Giải thích đơn giản hơn")}
                        className="whitespace-nowrap px-3 py-1 bg-surface rounded-full border border-outline-variant/50 text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors"
                      >
                        💡 Giải thích dễ hơn
                      </button>
                      <button 
                        onClick={() => handleSendMessage("Cho ví dụ thực tế")}
                        className="whitespace-nowrap px-3 py-1 bg-surface rounded-full border border-outline-variant/50 text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors"
                      >
                        🔍 Cho ví dụ thực tế
                      </button>
                    </div>

                    <div className="flex items-center w-full">
                      <form 
                        onSubmit={(e) => { 
                          e.preventDefault(); 
                          handleSendMessage(inputText); 
                          const ta = e.currentTarget.querySelector('textarea');
                          if (ta) ta.style.height = 'auto';
                        }}
                        className={`flex-1 flex flex-col bg-surface-container-low border rounded-2xl p-2 focus-within:border-primary transition-all relative ${
                          isListening ? 'ring-2 ring-red-500/25 border-red-500 bg-red-500/5' : 'border-outline'
                        }`}
                      >
                        <textarea 
                          id="chatbot-textarea"
                          rows={1}
                          className="w-full bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-outline-variant p-1 outline-none resize-none hide-scrollbar" 
                          style={{ minHeight: "24px", maxHeight: "120px" }}
                          placeholder={isListening ? "🔴 Đang nghe... Hãy nói câu hỏi" : "Hỏi Kavi..."}
                          value={inputText}
                          onChange={(e) => {
                            setInputText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              if (inputText.trim()) {
                                handleSendMessage(inputText);
                                e.currentTarget.style.height = 'auto';
                              }
                            }
                          }}
                        />
                        
                        <div className="flex justify-between items-center mt-1 w-full">
                          <div className="flex gap-1">
                            <button 
                              type="button"
                              onClick={handleVoiceInputToggle}
                              className={`p-1 rounded-full transition-all flex items-center justify-center cursor-pointer w-7 h-7 ${
                                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                              }`}
                              title={isListening ? "Đang lắng nghe... Bấm để dừng ghi âm" : "Soạn câu hỏi bằng giọng nói"}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isListening ? "mic" : "mic_none"}
                              </span>
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              type="submit"
                              disabled={!inputText.trim()}
                              className="p-1 bg-primary text-on-primary rounded-full hover:opacity-90 transition-opacity h-7 w-7 flex items-center justify-center shrink-0 disabled:bg-outline-variant/30 disabled:text-on-surface-variant/50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* SUMMARY PANEL */}
              {activeTab === "summary" && (
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">Mấu chốt của bài</p>
                    <p className="text-xs font-semibold text-on-surface">Đọc kỹ các lý thuyết cốt lõi này:</p>
                  </div>
                  <ul className="space-y-3">
                    {lesson.summary.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-on-surface-variant leading-relaxed">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5" style={{fontVariationSettings: '"FILL" 1'}}>verified</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* NOTES PANEL */}
              {activeTab === "notes" && (
                <div className="flex-1 flex flex-col gap-3">

                  {/* Add new note input */}
                  <div className={`flex gap-2 ${isNoteInputFocused ? 'items-start' : 'items-center'}`}>
                    {isNoteInputFocused ? (
                      <textarea
                        autoFocus
                        className="flex-1 p-2.5 bg-surface-container-low border border-primary rounded-xl text-xs text-on-surface outline-none resize-none leading-relaxed min-h-[80px]"
                        placeholder={pendingTimestamp !== null ? `Ghi chú cho mốc ${formatTime(pendingTimestamp)}...` : "Nhập nội dung ghi chú..."}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onBlur={() => {
                          if (!newNoteText.trim()) {
                            setIsNoteInputFocused(false);
                            setPendingTimestamp(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            addNote(newNoteText);
                          }
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        className="flex-1 px-3 h-9 bg-surface-container-low border border-outline rounded-xl text-xs text-on-surface outline-none cursor-text hover:border-outline-variant transition-colors"
                        placeholder="Thêm ghi chú..."
                        value={newNoteText}
                        onFocus={() => setIsNoteInputFocused(true)}
                        readOnly
                      />
                    )}
                    <button
                      onClick={() => addNote(newNoteText)}
                      disabled={!newNoteText.trim()}
                      className="shrink-0 w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:opacity-90 disabled:bg-outline-variant/30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Thêm ghi chú (Enter)"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>

                  {/* Notes list */}
                  <div className="flex flex-col gap-2 mt-1">
                    {notes.length === 0 && (
                      <p className="text-[11px] text-on-surface-variant text-center py-6 opacity-60">
                        Chưa có ghi chú nào. Gõ vào ô trên hoặc bấm &quot;Đánh dấu mốc&quot; tại video.
                      </p>
                    )}
                    {notes.map(note => (
                      <div
                        key={note.id}
                        className="group p-2.5 rounded-xl border border-outline-variant/40 bg-surface hover:border-outline-variant transition-all"
                      >
                        {editingNoteId === note.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              className="w-full p-2 bg-surface-container border border-primary rounded-lg text-xs text-on-surface outline-none resize-none leading-relaxed min-h-[60px]"
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              autoFocus
                            />
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => updateNote(note.id, editingNoteText)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              {note.type === "video-timestamp" && (
                                <button
                                  onClick={() => seekToTime(note.videoTime!)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-primary mb-1 hover:underline cursor-pointer"
                                  title={"Tua đến " + formatTime(note.videoTime!)}
                                >
                                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                                  {formatTime(note.videoTime!)}
                                </button>
                              )}
                              <p className="text-[11px] text-on-surface leading-relaxed break-words">{note.text}</p>
                            </div>
                            <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                                title="Xóa"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* GLOSSARY PANEL */}
              {activeTab === "glossary" && (
                <div className="space-y-3">
                  <p className="text-[11px] text-on-surface-variant font-medium">Hệ thống từ điển các thuật ngữ chuyên môn dùng trong bài:</p>
                  <div className="flex flex-col gap-2.5">
                    {lesson.glossary.map((item, index) => (
                      <div key={index} className="p-3 bg-surface border border-outline-variant/40 rounded-xl">
                        <div className="font-bold text-xs text-primary">{item.term}</div>
                        <div className="font-body-md text-[11px] text-on-surface-variant leading-relaxed mt-1">{item.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

        {/* Right Floating Toolbar Column */}
        {isToolbarVisible && (
          <aside className="w-14 h-auto py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 shrink-0 flex flex-col items-center gap-3 sticky top-4 animate-fade-in z-40">
            
            {/* Collapse Toolbar Button */}
            <button 
              onClick={() => setIsToolbarVisible(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant/40 hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              title="Ẩn thanh công cụ"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            
            <div className="w-6 h-px bg-outline-variant/50 mx-auto"></div>

            {/* Tool 0: Kavi Chatbot */}
            <button 
              onClick={() => setActiveTab(activeTab === "chatbot" ? null : "chatbot")}
              className={
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative " +
                (activeTab === "chatbot" 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant/80 hover:bg-surface-container hover:text-primary")
              }
            >
              <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: activeTab === "chatbot" ? '"FILL" 1' : undefined}}>smart_toy</span>
              <span className="absolute right-full mr-3 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-md">Hỏi Kavi AI</span>
            </button>

            {/* Tool 1: Notes – same group as Chatbot */}
            <button 
              onClick={() => setActiveTab(activeTab === "notes" ? null : "notes")}
              className={
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative " +
                (activeTab === "notes" 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant/80 hover:bg-surface-container hover:text-primary")
              }
            >
              <span className="material-symbols-outlined text-[22px]">edit_note</span>
              <span className="absolute right-full mr-3 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-md">Ghi chú</span>
            </button>

            <div className="w-6 h-px bg-outline-variant/50 mx-auto"></div>

            {/* Tool 2: Summary */}
            <button 
              onClick={() => setActiveTab(activeTab === "summary" ? null : "summary")}
              className={
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative " +
                (activeTab === "summary" 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant/80 hover:bg-surface-container hover:text-primary")
              }
            >
              <span className="material-symbols-outlined text-[22px]">summarize</span>
              <span className="absolute right-full mr-3 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-md">Tóm tắt</span>
            </button>

            {/* Tool 3: Glossary */}
            <button 
              onClick={() => setActiveTab(activeTab === "glossary" ? null : "glossary")}
              className={
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative " +
                (activeTab === "glossary" 
                  ? "bg-primary text-on-primary shadow-sm" 
                  : "text-on-surface-variant/80 hover:bg-surface-container hover:text-primary")
              }
            >
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
              <span className="absolute right-full mr-3 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-md">Thuật ngữ</span>
            </button>

          </aside>
        )}

      </div>
    </div>
  );
}
