export function getLocalAiFallback(context: string) {
  return {
    text: `Bạn đang ở chế độ demo local. Hãy thử chia mục tiêu "${context}" thành khoản cần thiết, tiết kiệm và linh hoạt; thêm GOOGLE_GENAI_API_KEY để nhận tư vấn AI trực tiếp.`,
  };
}
