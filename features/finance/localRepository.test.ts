import { describe, expect, it } from "vitest";
import { createLocalFinanceRepository } from "./localRepository";
import { createMemoryStorage } from "@/features/auth/localGateway";

describe("local finance repository", () => {
  it("persists a plan and returns transactions in descending date order", async () => {
    const repo = createLocalFinanceRepository(createMemoryStorage());
    await repo.savePlan("local-demo-user", { currentBalance: 2_000_000, monthlyIncome: 5_000_000 });
    await repo.addTransaction("local-demo-user", { amount: 20_000, type: "expense", category: "Ăn uống", date: 20, createdAt: 20 });
    await repo.addTransaction("local-demo-user", { amount: 50_000, type: "expense", category: "Đi lại", date: 50, createdAt: 50 });

    expect((await repo.getPlan("local-demo-user"))?.currentBalance).toBe(2_000_000);
    expect((await repo.getTransactions("local-demo-user")).map((item) => item.date)).toEqual([50, 20]);
  });
});
