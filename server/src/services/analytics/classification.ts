import type { HookType, FormatType, TopicCluster, ToneType } from "../../types/analytics.js";

/**
 * Infer hook type from title and caption text.
 */
export function classifyHookType(title: string | null, caption: string | null): HookType {
  const text = `${title ?? ""} ${caption ?? ""}`.toLowerCase();

  if (text.match(/\?|^(do you|are you|did you|have you|can you|should you|is your|what if)/))
    return "question";

  if (text.match(/(don'?t|never|stop|avoid|mistake|wrong|fail|kill|destroy|lose|risk|red flag)/))
    return "warning";

  if (text.match(/(how to|guide|step|ways to|tips for|checklist|everything you need)/))
    return "how-to";

  if (text.match(/(actually|truth|myth|lie|wrong about|nobody|unpopular|hot take|controversial)/))
    return "contrarian";

  if (text.match(/(myth|misconception|debunk|not true|think you know|actually mean)/))
    return "myth-busting";

  if (text.match(/(\d+\s+(things|ways|tips|steps|rules|signs|mistakes|documents|reasons))/))
    return "checklist";

  if (text.match(/(founder|startup|raise|pitch|term sheet|investor|vc|cap table|equity|co-?founder)/))
    return "founder-pain-point";

  return "unknown";
}

/**
 * Infer content format type from metadata.
 */
export function classifyFormatType(
  title: string | null,
  contentType: string | null,
  durationSec: number | null
): FormatType {
  const text = (title ?? "").toLowerCase();
  const type = (contentType ?? "").toLowerCase();

  // Shorts / reels are typically short explainers
  if (type === "short" || type === "reel" || (durationSec && durationSec <= 60)) {
    if (text.match(/(myth|misconception|debunk)/)) return "myth-busting";
    if (text.match(/(don'?t|never|stop|mistake|warning|avoid)/)) return "founder-warning";
    if (text.match(/(\d+\s+(things|ways|tips|steps))/)) return "checklist";
    return "short-explainer";
  }

  if (text.match(/(story|case|example|happened|real|client|founder told)/)) return "story-example";
  if (text.match(/(myth|debunk|misconception)/)) return "myth-busting";
  if (text.match(/(don'?t|never|stop|mistake|warning|avoid|kill|destroy)/)) return "founder-warning";
  if (text.match(/(\d+\s+(things|ways|tips|steps|rules|documents))/)) return "checklist";
  if (text.match(/(case study|breakdown|analysis|deep dive)/)) return "case-study";

  return "educational-tip";
}

/**
 * Infer topic cluster from text content.
 */
export function classifyTopicCluster(
  title: string | null,
  caption: string | null
): TopicCluster {
  const text = `${title ?? ""} ${caption ?? ""}`.toLowerCase();

  if (text.match(/(due diligence|diligence|data room|document request)/))
    return "diligence";

  if (text.match(/(fundrais|raise|round|term sheet|pitch|investor|vc|valuation|pre-?seed|series|cap table|equity|dilution)/))
    return "fundraising";

  if (text.match(/(contract|agreement|clause|negotiate|sign|term|nda|msa|sow|license)/))
    return "contracts";

  if (text.match(/(mistake|wrong|fail|error|lesson|regret|should have|wish i|don'?t do)/))
    return "founder-legal-mistakes";

  if (text.match(/(hire|hiring|developer|engineer|contractor|employment|offer letter|ip assignment)/))
    return "hiring-developer-agreements";

  if (text.match(/(risk|protect|liability|insurance|compliance|regulatory|formation|incorporate|structure)/))
    return "risk-prevention";

  if (text.match(/(startup|found|launch|build|early|ready|prepare|before you)/))
    return "startup-readiness";

  return "unknown";
}

/**
 * Infer tone type from text content.
 */
export function classifyToneType(title: string | null, caption: string | null): ToneType {
  const text = `${title ?? ""} ${caption ?? ""}`.toLowerCase();

  if (text.match(/(urgent|now|immediately|critical|asap|don'?t wait|before it'?s too late)/))
    return "urgent";

  if (text.match(/(here'?s how|step|guide|action|do this|framework|template)/))
    return "practical";

  if (text.match(/(recommend|suggest|consider|should|advise|my take)/))
    return "advisory";

  if (text.match(/(truth|actually|fact|reality|data|research|study|evidence)/))
    return "direct";

  return "educational";
}
