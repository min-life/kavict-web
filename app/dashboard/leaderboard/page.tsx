import { findAvatar } from "../profile/profileModel";

function LeaderboardAvatar({ avatarKey, size = "podium" }: { avatarKey: string; size?: "podium" | "winner" | "row" }) {
  const avatar = findAvatar(avatarKey);
  const dimensions = size === "winner" ? "h-32 w-32 text-6xl" : size === "row" ? "h-10 w-10 text-xl" : "h-24 w-24 text-5xl";

  if (!avatar) return null;

  return (
    <div className={`${dimensions} shrink-0 rounded-full border-4 border-surface-container-lowest bg-gradient-to-br ${avatar.colors} shadow-soft flex items-center justify-center`} aria-label={`Avatar ${avatar.label}`}>
      <span aria-hidden="true">{avatar.emoji}</span>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <div className="flex flex-col gap-xl">

{/* Header & Filters */}
<div className="flex flex-col md:flex-row justify-between items-center gap-md">
<div>

<p className="font-body-lg text-body-lg text-on-surface-variant mt-base">Tôn vinh những thành tích xuất sắc nhất.</p>
</div>
<div className="flex bg-surface-container-lowest p-base rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
<button className="px-md py-xs rounded-full font-label-md text-label-md text-on-primary bg-primary-container transition-all">Tuần</button>
<button className="px-md py-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-all">Tháng</button>
<button className="px-md py-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-all">Năm</button>
<button className="px-md py-xs rounded-full font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-all">Tất cả</button>
</div>
</div>
{/* Podium Section (Top 3) */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-md items-end pt-lg">
{/* Rank 2 */}
<div className="bg-surface-container-lowest shadow-md rounded-[24px] border border-surface-variant p-lg flex flex-col items-center text-center relative order-2 md:order-1 h-[90%] transition-transform hover:-translate-y-2">
<div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center font-headline-md text-headline-md text-white shadow-lg border-4 border-surface-container-lowest z-10">2</div>
<div className="mb-md"><LeaderboardAvatar avatarKey="mint" /></div>
<h3 className="font-headline-md text-headline-md text-on-surface">Minh Tuấn</h3>
<div data-achievement-summary className="mt-md grid w-full grid-cols-3 gap-2 border-y border-outline-variant/30 py-md">
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng XP</span><span className="whitespace-nowrap font-bold text-primary">12,450</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng coin</span><span className="whitespace-nowrap font-bold text-amber-500">980</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Streak</span><span className="whitespace-nowrap font-bold text-[#FF6B6B]">98 ngày</span></div>
</div>
<div data-earned-badges className="mt-md flex w-full items-center justify-center gap-2" aria-label="Huy hiệu đã đạt">
<span className="material-symbols-outlined rounded-full bg-amber-100 p-2 text-amber-600" title="Top 10 Leaderboard">trophy</span>
<span className="material-symbols-outlined rounded-full bg-blue-100 p-2 text-blue-600" title="Chuyên gia chi tiêu">account_balance_wallet</span>
</div>
</div>
{/* Rank 1 */}
<div className="bg-surface-container-lowest shadow-[0_0_20px_rgba(37,99,235,0.15)] rounded-[24px] border-2 border-primary p-lg flex flex-col items-center text-center relative order-1 md:order-2 h-full z-10 transition-transform hover:-translate-y-2">
<div className="absolute -top-10 flex flex-col items-center">
<span className="material-symbols-outlined text-[#FFD700] text-4xl drop-shadow-md mb-[-10px]" style={{fontVariationSettings: '\'FILL\' 1'}}>emoji_events</span>
<div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center font-headline-lg text-headline-lg text-white shadow-lg border-4 border-surface-container-lowest z-10">1</div>
</div>
<div className="mb-md mt-md"><LeaderboardAvatar avatarKey="bloom" size="winner" /></div>
<h3 className="font-headline-lg text-headline-lg text-primary">Lan Anh</h3>
<div data-achievement-summary className="mt-md grid w-full grid-cols-3 gap-2 border-y border-outline-variant/30 py-md">
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng XP</span><span className="whitespace-nowrap font-bold text-primary">15,820</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng coin</span><span className="whitespace-nowrap font-bold text-amber-500">1,240</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Streak</span><span className="whitespace-nowrap font-bold text-[#FF6B6B]">156 ngày</span></div>
</div>
<div data-earned-badges className="mt-md flex w-full items-center justify-center gap-2" aria-label="Huy hiệu đã đạt">
<span className="material-symbols-outlined rounded-full bg-amber-100 p-2 text-amber-600" title="Top 10 Leaderboard">trophy</span>
<span className="material-symbols-outlined rounded-full bg-orange-100 p-2 text-orange-600" title="Streak 30 ngày">local_fire_department</span>
<span className="material-symbols-outlined rounded-full bg-blue-100 p-2 text-blue-600" title="Chuyên gia chi tiêu">account_balance_wallet</span>
</div>
</div>
{/* Rank 3 */}
<div className="bg-surface-container-lowest shadow-md rounded-[24px] border border-surface-variant p-lg flex flex-col items-center text-center relative order-3 md:order-3 h-[85%] transition-transform hover:-translate-y-2">
<div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-headline-md text-headline-md text-white shadow-lg border-4 border-surface-container-lowest z-10">3</div>
<div className="mb-md"><LeaderboardAvatar avatarKey="violet" /></div>
<h3 className="font-headline-md text-headline-md text-on-surface">Hoàng Nam</h3>
<div data-achievement-summary className="mt-md grid w-full grid-cols-3 gap-2 border-y border-outline-variant/30 py-md">
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng XP</span><span className="whitespace-nowrap font-bold text-primary">11,200</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng coin</span><span className="whitespace-nowrap font-bold text-amber-500">860</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Streak</span><span className="whitespace-nowrap font-bold text-[#FF6B6B]">84 ngày</span></div>
</div>
<div data-earned-badges className="mt-md flex w-full items-center justify-center gap-2" aria-label="Huy hiệu đã đạt">
<span className="material-symbols-outlined rounded-full bg-indigo-100 p-2 text-indigo-600" title="Học viên chăm chỉ">menu_book</span>
<span className="material-symbols-outlined rounded-full bg-amber-100 p-2 text-amber-600" title="Thành tích nổi bật">military_tech</span>
</div>
</div>
</section>
{/* Leaderboard Table */}
<section className="bg-surface-container-lowest shadow-sm border border-surface-variant rounded-[24px] overflow-hidden">
<div className="overflow-x-auto">
<table data-ranking-achievements className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
<th className="p-md font-medium text-center w-20">Hạng</th>
<th className="p-md font-medium">Học viên</th>
<th className="p-md font-medium text-right">Tổng XP</th>
<th className="p-md font-medium text-center">Tổng coin</th>
<th className="p-md font-medium text-center">Streak</th>
<th className="p-md font-medium text-center">Huy hiệu</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/20 font-body-md text-body-md">
{/* Row 4 */}
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="p-md text-center font-headline-md text-headline-md text-on-surface-variant">4</td>
<td className="p-md">
<div className="flex items-center gap-sm">
<LeaderboardAvatar avatarKey="sky" size="row" />
<span className="font-medium text-on-surface">Thanh Trúc</span>
</div>
</td>
<td className="p-md text-right font-label-md text-label-md font-bold text-primary">10,850</td>
<td className="p-md text-center font-label-md text-label-md font-bold text-amber-500">760</td>
<td className="p-md text-center"><span className="inline-flex items-center gap-xs rounded-full bg-surface-container px-sm py-xs font-label-md text-label-md text-on-surface"><span className="material-symbols-outlined text-sm text-[#FF6B6B]" style={{fontVariationSettings: '\'FILL\' 1'}}>local_fire_department</span>72 ngày</span></td>
<td className="p-md text-center">
<span className="material-symbols-outlined text-tertiary" title="Thành tích nổi bật" style={{fontVariationSettings: '\'FILL\' 1'}}>military_tech</span><span className="material-symbols-outlined ml-xs text-blue-500" title="Chuyên gia chi tiêu">account_balance_wallet</span>
</td>
</tr>
{/* Row 5 */}
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="p-md text-center font-headline-md text-headline-md text-on-surface-variant">5</td>
<td className="p-md">
<div className="flex items-center gap-sm">
<LeaderboardAvatar avatarKey="berry" size="row" />
<span className="font-medium text-on-surface">Đức Duy</span>
</div>
</td>
<td className="p-md text-right font-label-md text-label-md font-bold text-primary">9,420</td>
<td className="p-md text-center font-label-md text-label-md font-bold text-amber-500">690</td>
<td className="p-md text-center"><span className="inline-flex items-center gap-xs rounded-full bg-surface-container px-sm py-xs font-label-md text-label-md text-on-surface"><span className="material-symbols-outlined text-sm text-[#FF6B6B]" style={{fontVariationSettings: '\'FILL\' 1'}}>local_fire_department</span>65 ngày</span></td>
<td className="p-md text-center">
<span className="material-symbols-outlined text-tertiary" title="Chuyên gia kiến thức" style={{fontVariationSettings: '\'FILL\' 1'}}>psychology</span><span className="material-symbols-outlined ml-xs text-orange-500" title="Streak 30 ngày">local_fire_department</span>
</td>
</tr>
{/* Row 6 */}
<tr className="hover:bg-surface-container-lowest/50 transition-colors">
<td className="p-md text-center font-headline-md text-headline-md text-on-surface-variant">6</td>
<td className="p-md">
<div className="flex items-center gap-sm">
<LeaderboardAvatar avatarKey="sunny" size="row" />
<span className="font-medium text-on-surface">Hải Yến</span>
</div>
</td>
<td className="p-md text-right font-label-md text-label-md font-bold text-primary">8,900</td>
<td className="p-md text-center font-label-md text-label-md font-bold text-amber-500">620</td>
<td className="p-md text-center"><span className="inline-flex items-center gap-xs rounded-full bg-surface-container px-sm py-xs font-label-md text-label-md text-on-surface"><span className="material-symbols-outlined text-sm text-[#FF6B6B]" style={{fontVariationSettings: '\'FILL\' 1'}}>local_fire_department</span>54 ngày</span></td>
<td className="p-md text-center">
<span className="material-symbols-outlined text-tertiary" title="Học viên chăm chỉ" style={{fontVariationSettings: '\'FILL\' 1'}}>school</span><span className="material-symbols-outlined ml-xs text-blue-500" title="Chuyên gia chi tiêu">account_balance_wallet</span>
</td>
</tr>
</tbody>
</table>
</div>
</section>
{/* Personal Rank Card */}
<section className="shadow-sm rounded-[24px] p-lg grid grid-cols-1 gap-md bg-surface-container-lowest border-l-4 border-l-primary relative overflow-hidden md:grid-cols-[auto_1fr_auto] md:items-center">
<div className="absolute right-0 top-0 w-64 h-full bg-primary-fixed/20 blur-3xl -z-10 rounded-full"></div>
<div className="flex items-center gap-md">
<div className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-lg text-headline-lg shadow-lg">
                    18
                </div>
<div>
<h3 className="font-headline-md text-headline-md text-on-surface">Hạng của bạn</h3>
</div>
</div>
<div data-personal-achievement-summary className="grid grid-cols-3 gap-3 border-y border-outline-variant/30 py-md md:border-y-0 md:border-x md:px-md md:py-0">
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng XP</span><span className="whitespace-nowrap font-bold text-primary">8,080</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Tổng coin</span><span className="whitespace-nowrap font-bold text-amber-500">640</span></div>
<div className="flex flex-col gap-1"><span className="font-label-sm text-label-sm text-on-surface-variant">Streak</span><span className="whitespace-nowrap font-bold text-[#FF6B6B]">30 ngày</span></div>
</div>
<div data-earned-badges className="flex items-center gap-2" aria-label="Huy hiệu đã đạt">
<span className="material-symbols-outlined rounded-full bg-amber-100 p-2 text-amber-600" title="Top 10 Leaderboard">trophy</span>
<span className="material-symbols-outlined rounded-full bg-orange-100 p-2 text-orange-600" title="Streak 30 ngày">local_fire_department</span>
<span className="material-symbols-outlined rounded-full bg-blue-100 p-2 text-blue-600" title="Chuyên gia chi tiêu">account_balance_wallet</span>
</div>
</section>

    </div>
  );
}
