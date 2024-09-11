import { type VercelKV } from "@vercel/kv";
import { expect, mock, test } from "bun:test";

import { GoCardLessApi } from "./gocardless-api";

// Mock VercelKV
const mockKV = {
  get: mock(() => Promise.resolve(null)),
  set: mock(() => Promise.resolve()),
} as unknown as VercelKV;

// Mock fetch globally
global.fetch = mock((input: RequestInfo | URL, init?: RequestInit) => {
  // Default mock response
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response);
}) as unknown as typeof global.fetch;

const mockParams = {
  kv: mockKV,
  envs: {
    GOCARDLESS_SECRET_ID: "test_secret_id",
    GOCARDLESS_SECRET_KEY: "test_secret_key",
  },
};

test("GoCardLessApi - constructor", () => {
  const api = new GoCardLessApi(mockParams);
  expect(api).toBeDefined();
});

test("GoCardLessApi - getInstitutions", async () => {
  const api = new GoCardLessApi(mockParams);

  // Mock the fetch response for institutions
  (global.fetch as any).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([{ id: "test_institution", name: "Test Bank" }]),
    }),
  );

  const institutions = await api.getInstitutions();
  expect(institutions).toEqual([{ id: "test_institution", name: "Test Bank" }]);
});

test("GoCardLessApi - buildLink", async () => {
  const api = new GoCardLessApi(mockParams);

  // Mock the fetch response for buildLink
  (global.fetch as any).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "test_requisition",
          link: "https://example.com/link",
        }),
    }),
  );

  const result = await api.buildLink({
    institutionId: "test_institution",
    agreement: "test_agreement",
    redirect: "https://example.com/redirect",
  });

  expect(result).toEqual({
    id: "test_requisition",
    link: "https://example.com/link",
  });
});

test("GoCardLessApi - getAccountBalance", async () => {
  const api = new GoCardLessApi(mockParams);

  // Mock the fetch response for getAccountBalance
  (global.fetch as any).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          balances: [
            {
              balanceType: "interimAvailable",
              balanceAmount: { amount: "1000.00", currency: "EUR" },
            },
          ],
        }),
    }),
  );

  const balance = await api.getAccountBalance("test_account_id");
  expect(balance).toEqual({ amount: "1000.00", currency: "EUR" });
});

test("GoCardLessApi - error handling", async () => {
  const api = new GoCardLessApi(mockParams);

  // Mock a failed fetch response
  (global.fetch as any).mockImplementationOnce(() =>
    Promise.resolve({
      ok: false,
      status: 404,
    }),
  );

  await expect(api.getInstitutions()).rejects.toThrow(
    "HTTP error! status: 404",
  );
});

// Add more tests for other methods as needed
