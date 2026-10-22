import { type ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Clapperboard,
  Clock3,
  FileText,
  Film,
  Info,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  classifyMovie,
  getDemoModel,
  parseMovieCsv,
  trainMovieModel,
  type ClassificationResult,
  type TrainedMovieModel,
} from '@/lib/classifier';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [plot, setPlot] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [training, setTraining] = useState(false);
  const [model, setModel] = useState<TrainedMovieModel | undefined>();
  const [modelLabel, setModelLabel] = useState('Sample model');
  const [trainingInfo, setTrainingInfo] = useState('');
  const [history, setHistory] = useState<Array<{ id: string; plot: string; result: ClassificationResult }>>([]);
  const [activeHistory, setActiveHistory] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => plot.trim().split(/\s+/).filter(Boolean).length, [plot]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('genre-lens-custom-model');
      if (saved) {
        setModel(JSON.parse(saved) as TrainedMovieModel);
        setModelLabel('Your local model');
      }
      const past = localStorage.getItem('genre-lens-history');
      if (past) setHistory(JSON.parse(past) as typeof history);
    } catch {
      localStorage.removeItem('genre-lens-custom-model');
      localStorage.removeItem('genre-lens-history');
    }
  }, []);

  const classify = () => {
    if (!plot.trim()) {
      setError('Add a plot summary first. Even a few sentences can reveal a useful signal.');
      setResult(null);
      return;
    }
    if (words < 8) {
      setError('A little more story will help. Try at least eight words for a more useful reading.');
      setResult(null);
      return;
    }
    setBusy(true);
    setError('');
    setActiveHistory('');
    window.setTimeout(() => {
      try {
        const next = classifyMovie(plot.trim(), model);
        setResult(next);
        setBusy(false);
        const entry = { id: `${Date.now()}`, plot: plot.trim(), result: next };
        setHistory((previous) => {
          const updated = [entry, ...previous].slice(0, 8);
          localStorage.setItem('genre-lens-history', JSON.stringify(updated));
          return updated;
        });
      } catch {
        setError('We couldn’t read that plot just now. Please try again.');
        setBusy(false);
      }
    }, 420);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setTrainingInfo('');
    setError('');
    setTraining(true);
    try {
      const parsed = parseMovieCsv(await file.text());
      if (!parsed.records.length) {
        setError('No usable rows found. Include a plot/overview column and a genre or genres column.');
        return;
      }
      const trained = trainMovieModel(parsed.records);
      localStorage.setItem('genre-lens-custom-model', JSON.stringify(trained));
      setModel(trained);
      setModelLabel('Your local model');
      setResult(null);
      setActiveHistory('');
      setTrainingInfo(`${parsed.records.length} titles learned${parsed.skippedRows ? ` · ${parsed.skippedRows} rows skipped` : ''}`);
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'QuotaExceededError') {
        setError('This model is too large to save in this browser. Try a smaller CSV file.');
      } else {
        setError(cause instanceof Error ? cause.message : 'That file could not be read. Choose a valid CSV and try again.');
      }
    } finally {
      setTraining(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const resetModel = () => {
    localStorage.removeItem('genre-lens-custom-model');
    setModel(undefined);
    setModelLabel('Sample model');
    setResult(null);
    setActiveHistory('');
    setTrainingInfo('Back to the built-in sample model.');
  };

  const openHistory = (entry: (typeof history)[number]) => {
    setPlot(entry.plot);
    setResult(entry.result);
    setActiveHistory(entry.id);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportHistory = () => {
    if (!history.length) return;
    const rows = [
      ['Analyzed at', 'Plot', 'Genres', 'Model'],
      ...history.map((entry) => [
        entry.result.analyzedAt,
        entry.plot,
        entry.result.predictions.map((prediction) => `${prediction.genre} (${Math.round((prediction.confidence <= 1 ? prediction.confidence * 100 : prediction.confidence))}%)`).join('; '),
        entry.result.modelName,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'genre-lens-analyses.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    setResult(null);
    setActiveHistory('');
    localStorage.removeItem('genre-lens-history');
  };

  const showExample = () => {
    setPlot('When a botanist returns to her isolated coastal hometown, she discovers that the tide has begun revealing objects from a shipwreck that never happened. As the village prepares for a winter festival, old rivalries surface and a quiet friendship deepens. Each night, the sea returns something more personal, drawing her toward a truth her family buried decades ago.');
    setResult(null);
    setActiveHistory('');
    setError('');
  };

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="/" data-testid="link-home">
          <span className="brand-mark"><Film size={19} strokeWidth={1.8} /></span>
          <span>genre<span className="brand-light">lens</span></span>
        </a>
        <div className="topbar-meta"><span className="privacy-dot" /> Everything stays on this device</div>
        <div className="model-chip" data-testid="status-model"><span className="model-indicator" />{modelLabel}</div>
      </header>

      <section className="intro">
        <div className="eyebrow"><span>01</span><span className="eyebrow-line" /> STORY, IN SIGNAL</div>
        <h1>What kind of story<br /><em>is taking shape?</em></h1>
        <p className="intro-copy">A thoughtful first read of the language in your plot.<br className="desktop-break" /> Paste a summary and see which genres rise to the surface.</p>
      </section>

      <section className="workspace-grid" aria-label="Movie genre analysis">
        <div className="input-column">
          <div className="section-heading">
            <div><span className="step-label">THE PLOT</span><h2>Start with the story</h2></div>
            <button className="text-action" type="button" onClick={showExample} data-testid="button-example"><Sparkles size={14} /> Try an example</button>
          </div>
          <div className={`plot-card ${error ? 'has-error' : ''}`}>
            <label htmlFor="plot-input" className="sr-only">Movie plot summary</label>
            <textarea id="plot-input" data-testid="input-plot" value={plot} onChange={(event) => { setPlot(event.target.value); setResult(null); setActiveHistory(''); if (error) setError(''); }} placeholder="A retired detective returns to the city where her sister vanished…" maxLength={12000} />
            <div className="plot-footer">
              <span className="word-count" data-testid="text-word-count">{words} words <span>·</span> {Math.max(0, 12000 - plot.length).toLocaleString()} characters left</span>
              <button className="clear-button" type="button" onClick={() => { setPlot(''); setResult(null); setError(''); setActiveHistory(''); }} disabled={!plot} data-testid="button-clear-plot"><X size={14} /> Clear</button>
            </div>
          </div>
          {error && <div className="error-message" role="alert" data-testid="status-error"><Info size={15} />{error}</div>}
          <button className="analyze-button" type="button" onClick={classify} disabled={busy} data-testid="button-classify">
            {busy ? <><LoaderCircle size={17} className="spin" /> Reading the story…</> : <>Read this story <ArrowRight size={17} /></>}
          </button>
          <div className="input-note"><Info size={14} /><span>Genre is a spectrum, not a verdict. Use these signals as a starting point.</span></div>

          <div className="train-panel">
            <div className="train-icon"><Upload size={17} /></div>
            <div className="train-copy">
              <div className="train-title">Make it your own <span className="local-tag">LOCAL MODEL</span></div>
              <p>{training ? 'Learning from your movie metadata…' : 'Teach a personal model with a movie metadata CSV.'}</p>
              <div className="csv-hint">Needs a plot/overview column and a genre or genres column.</div>
              {trainingInfo && <div className="training-success" data-testid="status-training"><Check size={13} />{trainingInfo}</div>}
            </div>
            <div className="train-actions">
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="visually-hidden" data-testid="input-csv" onChange={(event) => handleFile(event.target.files?.[0])} />
              <button className="upload-button" type="button" onClick={() => fileRef.current?.click()} disabled={training} data-testid="button-upload-csv">{training ? <LoaderCircle size={14} className="spin" /> : <Upload size={14} />}{training ? ' Training…' : ' Upload CSV'}</button>
              {model && <button className="reset-model" type="button" onClick={resetModel} title="Use the built-in sample model" data-testid="button-reset-model"><RotateCcw size={14} /></button>}
            </div>
          </div>
          <div className="model-disclaimer"><span className="disclaimer-rule" />{model ? 'Your model is stored only in this browser.' : 'The built-in sample model is a lightweight demonstration, not a large-scale benchmark.'}</div>
        </div>

        <aside className="results-column">
          <div className="results-topline">
            <div><span className="step-label">THE READ</span><h2>Genre signals</h2></div>
            {result && <span className="timestamp" data-testid="text-analyzed-time"><Clock3 size={12} />{new Date(result.analyzedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>}
          </div>
          {!result && !busy && <div className="results-empty" data-testid="empty-results">
            <div className="empty-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="empty-center"><Clapperboard size={21} /></span><span className="spark spark-a" /><span className="spark spark-b" /></div>
            <h3>Your story, read between the lines.</h3>
            <p>Genre signals will gather here, along with the words that helped shape them.</p>
            <div className="empty-foot"><span>01</span> Write a plot <ArrowRight size={12} /><span>02</span> See what emerges</div>
          </div>}
          {busy && <div className="loading-results" data-testid="loading-results"><div className="skeleton-line wide" /><div className="skeleton-line medium" /><div className="skeleton-line short" /><p>Looking for patterns in the language…</p></div>}
          {result && <div className="result-content" data-testid="results-content">
            <div className="result-summary"><span className="result-kicker">{activeHistory ? 'SAVED READING' : 'A FIRST READ'}</span><p>{result.predictions.length ? `This story leans toward ${result.predictions.slice(0, 2).map((prediction) => prediction.genre.toLowerCase()).join(' and ')}.` : 'A few genre signals are beginning to emerge.'}</p></div>
            <div className="genre-list" data-testid="list-genres">
              {result.predictions.map((prediction, index) => {
                const confidence = Math.max(0, Math.min(100, prediction.confidence <= 1 ? prediction.confidence * 100 : prediction.confidence));
                return <div className="genre-row" key={`${prediction.genre}-${index}`} data-testid={`genre-${prediction.genre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <div className="genre-row-top"><span className="genre-name">{prediction.genre}</span><span className="genre-value">{Math.round(confidence)}<small>%</small></span></div>
                  <div className="confidence-track"><span className={`confidence-fill fill-${index % 4}`} style={{ width: `${confidence}%` }} /></div>
                  {prediction.evidence?.length > 0 && <div className="evidence"><span className="evidence-label">INFLUENTIAL TERMS</span><div className="term-list">{prediction.evidence.slice(0, 5).map((term, termIndex) => <span className="term" key={`${term}-${termIndex}`} data-testid={`term-${index}-${termIndex}`}>{term}</span>)}</div></div>}
                </div>;
              })}
              {!result.predictions.length && <p className="no-signals">No strong genre signal found. A longer or more descriptive plot may help.</p>}
            </div>
            <div className="result-footnote"><Info size={13} /> Confidence is relative to this model, not a probability of correctness.</div>
            <div className="analysis-meta"><span><FileText size={13} />{result.wordCount} words analyzed</span><span>{result.modelName || modelLabel}</span></div>
          </div>}
        </aside>
      </section>

      <section className="history-section">
        <div className="history-heading">
          <div><span className="step-label">YOUR NOTEBOOK</span><h2>Recent readings <span className="history-count">{history.length}</span></h2></div>
          {history.length > 0 && <div className="history-actions"><button className="history-button" onClick={exportHistory} type="button" data-testid="button-export"><ArrowDownToLine size={14} /> Export CSV</button><button className="history-clear" onClick={clearHistory} type="button" data-testid="button-clear-history">Clear all</button></div>}
        </div>
        {history.length === 0 ? <div className="history-empty" data-testid="empty-history"><span className="history-empty-icon"><Clock3 size={15} /></span><span>Your recent analyses will be kept here, on this device.</span></div> :
          <div className="history-list" data-testid="list-history">{history.map((entry) => <button className={`history-item ${activeHistory === entry.id ? 'is-active' : ''}`} key={entry.id} type="button" onClick={() => openHistory(entry)} data-testid={`button-history-${entry.id}`}>
            <span className="history-date">{new Date(entry.result.analyzedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <span className="history-plot">{entry.plot}</span>
            <span className="history-genres">{entry.result.predictions.slice(0, 2).map((prediction) => prediction.genre).join(' · ') || 'No strong signals'}</span>
            <ArrowRight size={15} className="history-arrow" />
          </button>)}</div>}
      </section>

      <footer className="page-footer"><span>GENRELENS <span className="footer-dot">·</span> A SMALL TOOL FOR BIG STORIES</span><span><span className="privacy-dot" /> Private by design</span></footer>
    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
