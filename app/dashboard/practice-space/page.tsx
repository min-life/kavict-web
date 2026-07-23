"use client";

import Link from "next/link";
import { useState } from "react";
import { PRACTICE_GAMES, type PracticeGame } from "./gameCatalog";

function Reward({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface">
      <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
      {children}
    </span>
  );
}

function GameInfoDialog({ game, onClose }: { game: PracticeGame; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/45 p-4" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-info-title"
        className="w-full max-w-[52rem] rounded-3xl border border-primary/25 bg-surface-container-lowest p-6 shadow-2xl animate-fade-in dark:border-primary/35"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary">Thông tin game</p>
            <h2 id="game-info-title" className="mt-1 font-headline-md text-2xl font-bold text-on-surface">{game.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông tin game"
            className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <InfoItem icon="gavel" label="Luật chơi" value={game.rules} />
          <InfoItem icon="sports_esports" label="Cách chơi" value={game.howToPlay} />
          <InfoItem icon="emoji_events" label="Cách thắng" value={game.winCondition} />
          <InfoItem icon="lightbulb" label="Mẹo" value={game.tip} />
        </dl>
      </section>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <dt className="mb-1 flex items-center gap-2 font-bold text-on-surface">
        <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
        {label}
      </dt>
      <dd className="leading-6 text-on-surface-variant">{value}</dd>
    </div>
  );
}

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<PracticeGame | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12 animate-fade-in">
      <header className="mb-8 text-center lg:mb-10">
        <p className="mx-auto max-w-[48rem] text-lg leading-8 text-on-surface-variant">
          Chọn thử thách tài chính phù hợp, tích lũy kinh nghiệm và nhận phần thưởng khi chiến thắng.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {PRACTICE_GAMES.map((game) => (
          <article
            key={game.name}
            className={`group relative overflow-hidden rounded-3xl border-2 bg-surface-container-lowest p-6 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-hover active:translate-y-0 active:scale-[0.98] sm:p-7 ${
              game.available ? "border-primary/55 hover:border-primary" : "border-outline-variant/80"
            }`}
          >
            <div className={`absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl ${game.available ? "bg-primary/12" : "bg-outline-variant/30"}`} />

            {!game.available && (
              <p className="relative mb-4 inline-flex rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold text-on-surface-variant">
                Đón chờ Kavict nhé
              </p>
            )}

            <div className="relative flex items-start gap-4">
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${game.available ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                <span className="material-symbols-outlined text-[30px]">{game.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{game.quickInfo}</p>
                <h2 className="mt-1 font-headline-md text-2xl font-bold text-on-surface">{game.name}</h2>
              </div>
            </div>

            <p className="relative mt-5 min-h-12 leading-6 text-on-surface-variant">{game.description}</p>

            <div className="relative mt-5 flex flex-wrap gap-2">
              <Reward icon="signal_cellular_alt">{game.difficulty}</Reward>
              <Reward icon="schedule">{game.estimatedTime}</Reward>
              <Reward icon="monetization_on">+{game.rewards.kaviCoin} Kavi Coin</Reward>
              <Reward icon="bolt">+{game.rewards.xp} XP</Reward>
            </div>

            <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!game.available}
                onClick={() => setSelectedGame(game)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary px-4 py-2.5 font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-outline-variant disabled:bg-surface-container-high disabled:text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[19px]">info</span>
                Information
              </button>

              {game.available && game.href ? (
                <Link
                  href={game.href}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-bold text-on-primary shadow-sm transition-all hover:bg-primary-fixed-variant hover:text-on-primary-fixed active:scale-[0.98]"
                >
                  Chơi ngay
                  <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={!game.available}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-container-high px-4 py-2.5 font-bold text-on-surface-variant disabled:cursor-not-allowed"
                >
                  Chơi ngay
                  <span className="material-symbols-outlined text-[19px]">lock</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {selectedGame && <GameInfoDialog game={selectedGame} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
