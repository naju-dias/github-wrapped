/*
 * Mecanismo de cálculo de métricas
*/

export interface WrappedMetrics {
  year: number;
  totalCommits: number;
  totalRepos: number;
  topLanguages: { name: string; count: number; percentage: number }[];
  topRepos: { name: string; stars: number; url: string }[];
  commitsByMonth: { month: string; count: number }[];
  commitsByHour: { hour: number; count: number }[];
  commitsByWeekday: { day: string; count: number }[];
  peakHour: number;
  peakDay: string;
  longestStreak: number;
  totalStars: number;
  personalityType: string;
  personalityDescription: string;
  mostActiveMonth: string;
  commitMessages: {
    mostCommonWords: { word: string; count: number }[];
  };
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// Palavras a ignorar na análise de mensagens de commit
const STOP_WORDS = new Set([
  "fix", "add", "update", "change", "remove", "refactor",
  "the", "a", "an", "and", "or", "in", "of", "to", "for",
  "feat", "chore", "docs", "style", "test", "build", "ci",
]);

interface RawEvent {
  type: string;
  created_at: string;
  payload: {
    commits?: { message: string }[];
    size?: number;
  };
}

interface RawRepo {
  name: string;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
}

export function computeMetrics(
  events: RawEvent[],
  repos: RawRepo[],
  year: number
): WrappedMetrics {
  // Filter only push events for the target year
  const pushEvents = events.filter((e) => {
    if (e.type !== "PushEvent") return false;
    const eventYear = new Date(e.created_at).getFullYear();
    return eventYear === year;
  });

  const totalCommits = pushEvents.reduce(
    (sum, e) => sum + (e.payload.size ?? e.payload.commits?.length ?? 0),
    0
  );

  // --- Linguagens ---
  const languageCounts: Record<string, number> = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + 1;
    }
  });

  const totalLangRepos = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / totalLangRepos) * 100),
    }));

  // --- Top repos por estrelas ---
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)
    .map((r) => ({ name: r.name, stars: r.stargazers_count, url: r.html_url }));

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  // --- Commits por mês ---
  const monthCounts: Record<number, number> = {};
  pushEvents.forEach((e) => {
    const month = new Date(e.created_at).getMonth();
    monthCounts[month] = (monthCounts[month] ?? 0) + (e.payload.size ?? 1);
  });

  const commitsByMonth = MONTHS.map((month, i) => ({
    month,
    count: monthCounts[i] ?? 0,
  }));

  const mostActiveMonthIdx = Object.entries(monthCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];
  const mostActiveMonth = MONTHS[Number(mostActiveMonthIdx)] ?? "Janeiro";

  // --- Commits por hora ---
  const hourCounts: Record<number, number> = {};
  pushEvents.forEach((e) => {
    const hour = new Date(e.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
  });

  const commitsByHour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourCounts[i] ?? 0,
  }));

  const peakHour = Number(
    Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 22
  );

  // --- Commits por dia da semana ---
  const weekdayCounts: Record<number, number> = {};
  pushEvents.forEach((e) => {
    const day = new Date(e.created_at).getDay();
    weekdayCounts[day] = (weekdayCounts[day] ?? 0) + 1;
  });

  const commitsByWeekday = WEEKDAYS.map((day, i) => ({
    day,
    count: weekdayCounts[i] ?? 0,
  }));

  const peakDayIdx = Object.entries(weekdayCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0];
  const peakDay = WEEKDAYS[Number(peakDayIdx)] ?? "Sexta";

  // --- Cálculo de sequência ---
  const commitDates = new Set(
    pushEvents.map((e) => new Date(e.created_at).toISOString().split("T")[0])
  );
  const longestStreak = computeLongestStreak(commitDates);

  // --- Frequência de palavras em mensagens de commit ---
  const wordCounts: Record<string, number> = {};
  pushEvents.forEach((e) => {
    e.payload.commits?.forEach((commit) => {
      commit.message
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
        .forEach((word) => {
          wordCounts[word] = (wordCounts[word] ?? 0) + 1;
        });
    });
  });

  const mostCommonWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  // --- Tipos de personalidade ---
  const { personalityType, personalityDescription } = computePersonality(
    peakHour,
    totalCommits,
    longestStreak
  );

  return {
    year,
    totalCommits,
    totalRepos: repos.length,
    topLanguages,
    topRepos,
    commitsByMonth,
    commitsByHour,
    commitsByWeekday,
    peakHour,
    peakDay,
    longestStreak,
    totalStars,
    personalityType,
    personalityDescription,
    mostActiveMonth,
    commitMessages: { mostCommonWords },
  };
}

function computeLongestStreak(commitDates: Set<string>): number {
  if (commitDates.size === 0) return 0;

  const dates = [...commitDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  return longest;
}

function computePersonality(
  peakHour: number,
  totalCommits: number,
  streak: number
): { personalityType: string; personalityDescription: string } {
  
  // 1. O Maníaco do Streak
  if (streak >= 30) {
    return {
      personalityType: "🔥 Máquina Imparável",
      personalityDescription: `${streak} dias seguidos codando. Férias? Nunca ouvi falar.`,
    };
  }

  // 2. O Monstro do Volume
  if (totalCommits >= 500) {
    return {
      personalityType: "⚡ Commit Monster",
      personalityDescription: `Mais de 500 commits no ano. Seu teclado pediu demissão.`,
    };
  }

  // 3. Poucos commits e ritmo tranquilo
  if (totalCommits < 80) {
    return {
      personalityType: "🦥 Dev Low-Profile",
      personalityDescription: "Gráfico de commits discreto, sem pressa e sem loucura. Você entrega o mínimo viável com o máximo de paz mental.",
    };
  }

  // 4. Horários Extremos
  if (peakHour >= 0 && peakHour < 6) {
    return {
      personalityType: "🦉 Coruja do Código",
      personalityDescription: "Você programa enquanto o mundo dorme. Seu melhor código nasce depois da meia-noite.",
    };
  }

  if (peakHour >= 6 && peakHour < 12) {
    return {
      personalityType: "☀️ Dev Café-com-Código",
      personalityDescription: "Você resolve bug antes do cérebro da maioria das pessoas terminar de dar boot.",
    };
  }

  // 5. Volume médio e streak médio
  return {
    personalityType: "🧘 Dev Zen (Ou Quase)",
    personalityDescription: "Sem commits de madrugada, sem streaks maníacos. Você tem o que os cientistas chamam de 'vida social'. Como consegue?",
  };
}