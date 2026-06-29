export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/30 pt-2xl pb-lg mt-auto">
      <div className="max-w-[1200px] mx-auto px-gutter grid grid-cols-1 md:grid-cols-4 gap-xl mb-xl">
        <div className="md:col-span-2 space-y-md">
          <h2 className="font-display text-[24px] text-primary font-bold tracking-tight flex items-center gap-2">
            KAVICT
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[384px]">
            Nền tảng giáo dục tài chính thông minh, đồng hành cùng bạn trên con
            đường tự do tài chính.
          </p>
        </div>

        <div>
          <h4 className="font-headline-sm text-label-lg font-bold text-on-surface mb-md">
            Liên kết
          </h4>
          <ul className="space-y-sm font-body-md text-body-md">
            <li>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                Về chúng tôi
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                Điều khoản
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                Bảo mật
              </a>
            </li>
            <li>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                Trợ giúp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline-sm text-label-lg font-bold text-on-surface mb-md">
            Kết nối
          </h4>
          <div className="flex gap-sm">
            <a
              className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-gutter pt-lg border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">
          © 2026 KAVICT Educational Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
