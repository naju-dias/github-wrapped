import { computeMetrics } from "./metrics";

const makeEvent = (hour: number, daysAgo: number, commits = 1) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return {
    type: "PushEvent",
    created_at: date.toISOString(),
    payload: {
      size: commits,
      commits: Array.from({ length: commits }, (_, i) => ({
        message: `feat: add feature ${i}`,
      })),
    },
  };
};

const makeRepo = (name: string, language: string, stars = 0) => ({
  name,
  language,
  stargazers_count: stars,
  html_url: `https://github.com/user/${name}`,
  fork: false,
});

const CURRENT_YEAR = new Date().getFullYear();

describe("computeMetrics", () => {
  it("counts total commits correctly", () => {
    const events = [
      makeEvent(10, 1, 3),
      makeEvent(14, 2, 5),
      makeEvent(22, 3, 2),
    ];
    const result = computeMetrics(events, [], CURRENT_YEAR);
    expect(result.totalCommits).toBe(10);
  });

  it("identifies peak hour correctly", () => {
    const events = [
      makeEvent(22, 1, 1),
      makeEvent(22, 2, 1),
      makeEvent(22, 3, 1),
      makeEvent(10, 4, 1),
    ];
    const result = computeMetrics(events, [], CURRENT_YEAR);
    expect(result.peakHour).toBe(22);
  });

  it("calculates top languages from repos", () => {
    const repos = [
      makeRepo("a", "TypeScript"),
      makeRepo("b", "TypeScript"),
      makeRepo("c", "Python"),
    ];
    const result = computeMetrics([], repos, CURRENT_YEAR);
    expect(result.topLanguages[0].name).toBe("TypeScript");
    expect(result.topLanguages[0].percentage).toBe(67);
  });

  it("calculates total stars", () => {
    const repos = [
      makeRepo("a", "TypeScript", 10),
      makeRepo("b", "Python", 5),
    ];
    const result = computeMetrics([], repos, CURRENT_YEAR);
    expect(result.totalStars).toBe(15);
  });

  it("assigns night owl personality for late-night commits", () => {
    const events = [
      makeEvent(2, 1, 1),
      makeEvent(3, 2, 1),
      makeEvent(1, 3, 1),
    ];
    const result = computeMetrics(events, [], CURRENT_YEAR);
    expect(result.personalityType).toContain("Coruja");
  });

  it("filters out events from other years", () => {
    const lastYear = CURRENT_YEAR - 1;
    const oldDate = new Date(`${lastYear}-06-15T10:00:00Z`);
    const oldEvent = {
      type: "PushEvent",
      created_at: oldDate.toISOString(),
      payload: { size: 99, commits: [] },
    };
    const result = computeMetrics([oldEvent], [], CURRENT_YEAR);
    expect(result.totalCommits).toBe(0);
  });

  it("handles empty data gracefully", () => {
    const result = computeMetrics([], [], CURRENT_YEAR);
    expect(result.totalCommits).toBe(0);
    expect(result.totalRepos).toBe(0);
    expect(result.longestStreak).toBe(0);
  });
});
