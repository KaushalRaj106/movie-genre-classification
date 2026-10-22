export type MovieRecord = {
  text: string;
  genres: string[];
  title?: string;
};

export type GenrePrediction = {
  genre: string;
  /** A 0–1 estimate from the one-vs-rest model. */
  confidence: number;
  evidence: string[];
};

export type ClassificationResult = {
  predictions: GenrePrediction[];
  analyzedAt: string;
  modelName: string;
  wordCount: number;
};

type GenreModel = {
  prior: number;
  /** Smoothed log-likelihood ratio for TF-IDF-weighted terms. */
  termWeights: Record<string, number>;
};

export type TrainedMovieModel = {
  name: string;
  sourceKind: "demo" | "upload";
  trainedAt: string;
  recordCount: number;
  labels: string[];
  vocabulary: string[];
  idf: Record<string, number>;
  genreModels: Record<string, GenreModel>;
};

const STOP_WORDS = new Set(
  [
    "a", "about", "after", "again", "against", "all", "also", "an", "and",
    "any", "are", "as", "at", "be", "because", "been", "before", "being",
    "between", "both", "but", "by", "can", "could", "did", "do", "does",
    "doing", "down", "during", "each", "few", "for", "from", "further",
    "had", "has", "have", "having", "he", "her", "here", "hers", "him",
    "his", "how", "i", "if", "in", "into", "is", "it", "its", "just",
    "me", "more", "most", "my", "no", "nor", "not", "of", "off", "on",
    "once", "only", "or", "other", "our", "out", "over", "own", "same",
    "she", "should", "so", "some", "such", "than", "that", "the", "their",
    "them", "then", "there", "these", "they", "this", "those", "through",
    "to", "too", "under", "until", "up", "very", "was", "we", "were",
    "what", "when", "where", "which", "while", "who", "whom", "why", "will",
    "with", "would", "you", "your",
  ],
);

const DEMO_RECORDS: MovieRecord[] = [
  { title: "The Last Signal", genres: ["Action", "Thriller"], text: "An undercover agent races across the city to stop a terrorist network before a timed explosive device destroys the train station. A relentless chase leads to a final fight." },
  { title: "Dust Road", genres: ["Action", "Adventure"], text: "A fearless explorer leads a rescue mission through a dangerous desert, dodging armed raiders and crossing a canyon to recover a missing expedition." },
  { title: "Deep Current", genres: ["Action", "Science Fiction"], text: "A crew of astronauts battles a malfunctioning spacecraft after a hostile machine intelligence takes control during a mission beyond Earth." },
  { title: "The Hidden Map", genres: ["Adventure", "Family"], text: "Two curious siblings follow an old map through a rainforest, solve puzzles, cross a river, and search for a lost treasure with their grandfather." },
  { title: "Wild Compass", genres: ["Adventure", "Fantasy"], text: "A young traveler enters a mythical kingdom of enchanted forests and dragons to find a magical compass and return home." },
  { title: "Orbit Academy", genres: ["Adventure", "Science Fiction"], text: "A student crew explores a distant planet, discovers alien ruins, and must survive a storm before their spacecraft can take off." },
  { title: "Cloud Parade", genres: ["Animation", "Family"], text: "A bright animated story follows a small fox and a cheerful robot as they help their forest friends prepare a joyful neighborhood festival." },
  { title: "Star Orchard", genres: ["Animation", "Fantasy"], text: "In a colorful hand-drawn world, a shy child discovers a garden where tiny magical creatures grow stars among the flowers." },
  { title: "The Little Maestro", genres: ["Animation", "Music"], text: "A young animated penguin dreams of conducting an orchestra and finds the courage to perform a lively song at a school concert." },
  { title: "Roommates Again", genres: ["Comedy", "Romance"], text: "After an awkward reunion, two former college roommates pretend to be a couple at a wedding and discover they still make each other laugh." },
  { title: "The Wrong Suitcase", genres: ["Comedy", "Crime"], text: "A nervous small-time thief accidentally swaps bags with a traveling comedian, setting off a ridiculous chain of mistaken identities and police interviews." },
  { title: "Dinner for Seven", genres: ["Comedy", "Drama"], text: "A family dinner becomes a funny, heartfelt evening when three generations share old stories, unexpected news, and a burnt holiday meal." },
  { title: "Cold Ledger", genres: ["Crime", "Mystery"], text: "A sharp detective investigates a locked-room murder at a quiet hotel, following a missing key, suspicious witnesses, and a trail of clues." },
  { title: "Night Division", genres: ["Crime", "Thriller"], text: "A veteran investigator uncovers corruption inside the police department and races to expose a dangerous criminal syndicate before the evidence disappears." },
  { title: "The Long Trial", genres: ["Crime", "Drama"], text: "A determined defense lawyer returns to her hometown to represent a wrongly accused shopkeeper in a difficult courtroom case." },
  { title: "Paper Moons", genres: ["Drama", "Romance"], text: "Two artists navigate grief, ambition, and a changing relationship while rebuilding their lives in a small coastal town." },
  { title: "A Quiet Season", genres: ["Drama"], text: "A retired teacher reconnects with her estranged daughter and grandson, finding a new purpose through ordinary moments and difficult conversations." },
  { title: "The Final Letter", genres: ["Drama", "History"], text: "During a period of political upheaval, a young journalist risks her career to tell the story of a community facing injustice." },
  { title: "Beneath the Floor", genres: ["Horror", "Mystery"], text: "A family moves into an old farmhouse where strange noises, hidden rooms, and a chilling presence lead them to a decades-old secret." },
  { title: "The Hollow", genres: ["Horror", "Thriller"], text: "A group of friends become trapped in an isolated cabin as a supernatural creature stalks them through the woods at night." },
  { title: "Red Harvest Moon", genres: ["Horror"], text: "A quiet village is haunted by a terrifying presence that appears only after dark, forcing a skeptical doctor to confront an ancient legend." },
  { title: "Blue Note Sunday", genres: ["Music", "Drama"], text: "A gifted jazz pianist struggles to balance family life and a promising career as she prepares for a career-defining performance." },
  { title: "The Road Choir", genres: ["Music", "Comedy"], text: "A group of mismatched singers tour in a broken van, share funny backstage mishaps, and compete in a regional music festival." },
  { title: "The Last Outpost", genres: ["War", "Drama"], text: "During a historic conflict, a medic and a young recruit form an unlikely friendship while trying to protect civilians and survive the siege." },
  { title: "Canyon Justice", genres: ["Western", "Action"], text: "A former sheriff returns to a frontier town to defend its residents from an armed gang and settle an old feud." },
  { title: "The Silver Spur", genres: ["Western", "Romance"], text: "A rancher and a traveling photographer meet on the open prairie and fall in love while a railway changes their frontier town." },
  { title: "Ocean of Glass", genres: ["Documentary"], text: "A documentary follows marine researchers studying coral reefs, ocean pollution, and the communities working to protect coastal wildlife." },
  { title: "Hands at Work", genres: ["Documentary", "History"], text: "Through archival footage and interviews, a documentary explores the lives of workers who shaped a historic labor movement." },
  { title: "Finding the Beat", genres: ["Documentary", "Music"], text: "A documentary follows a local choir as its members rehearse, perform, and preserve traditional songs for a new generation." },
];

function tokenize(text: string): string[] {
  const matches = text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu);
  return (matches ? Array.from(matches) : [])
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function normalizeGenre(genre: string): string {
  const trimmed = genre.trim().replace(/^["'\s]+|["'\s]+$/g, "");
  return trimmed
    .split(/\s+/u)
    .map((word) => word.length === 0 ? word : word[0]!.toLocaleUpperCase() + word.slice(1).toLocaleLowerCase())
    .join(" ");
}

function uniqueGenres(genres: string[]): string[] {
  return Array.from(new Set(genres.map(normalizeGenre).filter(Boolean)));
}

function tokenizeGenreField(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      const stringGenres = parsed.filter((item): item is string => typeof item === "string");
      if (stringGenres.length) return uniqueGenres(stringGenres);
    }
  } catch {
    // Dataset genres commonly use a plain delimiter-separated field.
  }

  const objectGenreNames = Array.from(trimmed.matchAll(/["']name["']\s*:\s*["']([^"']+)["']/giu))
    .map((match) => match[1] ?? "");
  if (objectGenreNames.length) return uniqueGenres(objectGenreNames);

  return uniqueGenres(trimmed.split(/[|;,]/u));
}

function sigmoid(value: number): number {
  if (value >= 0) {
    const exp = Math.exp(-Math.min(value, 40));
    return 1 / (1 + exp);
  }
  const exp = Math.exp(Math.max(value, -40));
  return exp / (1 + exp);
}

export function trainMovieModel(records: MovieRecord[]): TrainedMovieModel {
  const cleanRecords = records
    .map((record) => ({
      text: record.text.trim(),
      genres: uniqueGenres(record.genres),
      title: record.title?.trim(),
    }))
    .filter((record) => record.text.length > 0 && record.genres.length > 0);

  if (cleanRecords.length < 2) {
    throw new Error("Add at least two valid movie rows with a plot and one or more genres.");
  }

  const labels = uniqueGenres(cleanRecords.flatMap((record) => record.genres)).sort((a, b) => a.localeCompare(b));
  if (labels.length < 2) {
    throw new Error("The dataset needs at least two different genres to train a useful classifier.");
  }

  const tokenizedRecords = cleanRecords.map((record) => tokenize(record.text));
  const documentFrequency = new Map<string, number>();
  for (const tokens of tokenizedRecords) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  // A compact vocabulary keeps browser training responsive and the trained
  // model small enough to persist locally for typical metadata exports.
  const vocabulary = Array.from(documentFrequency.keys())
    .sort((a, b) => (documentFrequency.get(b) ?? 0) - (documentFrequency.get(a) ?? 0) || a.localeCompare(b))
    .slice(0, 1800)
    .sort((a, b) => a.localeCompare(b));
  const idf = Object.fromEntries(
    vocabulary.map((term) => [term, Math.log(1 + cleanRecords.length / (1 + (documentFrequency.get(term) ?? 0)))]),
  );

  const weightedCounts = new Map<string, Map<string, number>>();
  const weightedTotals = new Map<string, number>();
  const globalWeightedCounts = new Map<string, number>();
  let globalWeightedTotal = 0;
  for (const label of labels) {
    weightedCounts.set(label, new Map());
    weightedTotals.set(label, 0);
  }
  for (let index = 0; index < cleanRecords.length; index += 1) {
    const row = cleanRecords[index]!;
    const rowCounts = new Map<string, number>();
    for (const term of tokenizedRecords[index]!) {
      if (idf[term] !== undefined) rowCounts.set(term, (rowCounts.get(term) ?? 0) + 1);
    }
    let rowWeightTotal = 0;
    for (const [term, frequency] of rowCounts) {
      const weight = frequency * (idf[term] ?? 1);
      globalWeightedCounts.set(term, (globalWeightedCounts.get(term) ?? 0) + weight);
      globalWeightedTotal += weight;
      rowWeightTotal += weight;
    }
    for (const label of row.genres) {
      const labelCounts = weightedCounts.get(label)!;
      for (const [term, frequency] of rowCounts) {
        const weight = frequency * (idf[term] ?? 1);
        labelCounts.set(term, (labelCounts.get(term) ?? 0) + weight);
      }
      weightedTotals.set(label, (weightedTotals.get(label) ?? 0) + rowWeightTotal);
    }
  }

  const genreModels: Record<string, GenreModel> = {};
  for (const label of labels) {
    const positiveCount = cleanRecords.filter((record) => record.genres.includes(label)).length;
    const prior = positiveCount / cleanRecords.length;
    const labelCounts = weightedCounts.get(label)!;
    const positiveTotal = weightedTotals.get(label) ?? 0;
    const negativeTotal = Math.max(0, globalWeightedTotal - positiveTotal);
    const termWeights: Record<string, number> = {};
    const smoothing = 0.1;

    for (const term of vocabulary) {
      const positiveTokenWeight = labelCounts.get(term) ?? 0;
      const negativeTokenWeight = Math.max(0, (globalWeightedCounts.get(term) ?? 0) - positiveTokenWeight);
      const positiveProbability = (positiveTokenWeight + smoothing) /
        (positiveTotal + smoothing * vocabulary.length);
      const negativeProbability = (negativeTokenWeight + smoothing) /
        (negativeTotal + smoothing * vocabulary.length);
      termWeights[term] = Math.log(positiveProbability / negativeProbability);
    }

    genreModels[label] = { prior, termWeights };
  }

  return {
    name: "Custom metadata model",
    sourceKind: "upload",
    trainedAt: new Date().toISOString(),
    recordCount: cleanRecords.length,
    labels,
    vocabulary,
    idf,
    genreModels,
  };
}

export function getDemoModel(): TrainedMovieModel {
  if (!cachedDemoModel) {
    const model = trainMovieModel(DEMO_RECORDS);
    cachedDemoModel = {
      ...model,
      name: "Curated sample model",
      sourceKind: "demo",
    };
  }
  return cachedDemoModel;
}

let cachedDemoModel: TrainedMovieModel | undefined;

export function classifyMovie(text: string, model: TrainedMovieModel = getDemoModel()): ClassificationResult {
  if (!text.trim()) {
    throw new Error("Add a plot summary or a few keywords before classifying.");
  }

  const tokens = tokenize(text);
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  const hasKnownTerms = Array.from(counts.keys()).some((term) => model.idf[term] !== undefined);
  if (!hasKnownTerms) {
    return {
      predictions: [],
      analyzedAt: new Date().toISOString(),
      modelName: model.name,
      wordCount: (text.match(/[\p{L}\p{N}]+/gu) ?? []).length,
    };
  }

  const scored = model.labels.map((genre) => {
    const genreModel = model.genreModels[genre];
    if (!genreModel) return { genre, confidence: 0, evidence: [] as string[] };

    const safePrior = Math.min(Math.max(genreModel.prior, 0.001), 0.999);
    let logit = Math.log(safePrior / (1 - safePrior));
    let totalQueryWeight = 0;
    let weightedEvidence = 0;
    for (const [term, frequency] of counts) {
      const idf = model.idf[term];
      if (idf === undefined) continue;
      const queryWeight = frequency * idf;
      totalQueryWeight += queryWeight;
      weightedEvidence += queryWeight * (genreModel.termWeights[term] ?? 0);
    }
    if (totalQueryWeight > 0) logit += (weightedEvidence / totalQueryWeight) * 1.4;

    const evidence = Array.from(counts.keys())
      .map((term) => ({ term, weight: (model.idf[term] ?? 0) * (genreModel.termWeights[term] ?? 0) }))
      .filter((item) => item.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((item) => item.term);

    return { genre, confidence: sigmoid(logit), evidence };
  });

  scored.sort((a, b) => b.confidence - a.confidence);
  return {
    predictions: scored.slice(0, Math.min(5, scored.length)),
    analyzedAt: new Date().toISOString(),
    modelName: model.name,
    wordCount: (text.match(/[\p{L}\p{N}]+/gu) ?? []).length,
  };
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;
  const source = csv.replace(/^\uFEFF/u, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]!;
    const next = source[index + 1];

    if (character === '"') {
      if (insideQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (insideQuotes) {
    throw new Error("This CSV has an unclosed quoted field. Check the file and try again.");
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function findHeader(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.includes(header.trim().toLocaleLowerCase().replace(/[\s_-]+/gu, "")));
}

export function parseMovieCsv(csv: string): { records: MovieRecord[]; skippedRows: number } {
  const rows = parseCsvRows(csv);
  if (rows.length < 2) {
    throw new Error("The CSV is empty or only contains a header row.");
  }

  const headers = rows[0]!.map((header) => header.trim().toLocaleLowerCase().replace(/^\uFEFF/u, ""));
  const textColumn = findHeader(headers, ["overview", "plot", "description", "summary", "synopsis", "text"]);
  const genresColumn = findHeader(headers, ["genres", "genre", "listedin", "category", "categories"]);
  const titleColumn = findHeader(headers, ["title", "originaltitle", "name", "movietitle"]);

  if (textColumn < 0 || genresColumn < 0) {
    throw new Error("Could not find the required columns. Include a plot/overview/description column and a genre/genres column.");
  }

  const records: MovieRecord[] = [];
  let skippedRows = 0;
  for (const row of rows.slice(1)) {
    const text = row[textColumn]?.trim() ?? "";
    const genres = tokenizeGenreField(row[genresColumn] ?? "");
    if (!text || genres.length === 0) {
      skippedRows += 1;
      continue;
    }

    records.push({
      text,
      genres,
      ...(titleColumn >= 0 && row[titleColumn]?.trim() ? { title: row[titleColumn]!.trim() } : {}),
    });
  }

  if (records.length < 2) {
    throw new Error("Fewer than two usable movie rows were found. Check that each row has a plot and genres.");
  }
  return { records, skippedRows };
}
