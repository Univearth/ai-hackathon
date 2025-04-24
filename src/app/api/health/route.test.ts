import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("Health Check API", () => {
  it("should return status ok and timestamp", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("timestamp");
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
  });
});
