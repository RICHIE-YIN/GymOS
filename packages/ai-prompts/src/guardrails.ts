// ─── Forbidden phrases ────────────────────────────────────────────────────────

/**
 * Phrases that trigger safety flags when detected in AI responses.
 * These indicate the AI may be overstepping into medical or dangerous territory.
 */
export const FORBIDDEN_PHRASES: string[] = [
  // Diagnostic language
  'you have',
  'you are diagnosed',
  'diagnosis is',
  'you are suffering from',
  'symptoms indicate',
  'this is a sign of',
  'you may have',
  'sounds like you have',
  // Treatment / medication advice
  'take this medication',
  'prescribed medication',
  'you should take',
  'dosage of',
  'milligrams of',
  'prescription',
  'over the counter',
  // Dangerous dietary advice
  'stop eating completely',
  'fast for',
  'do not eat for',
  'starvation',
  'extreme caloric deficit',
  'eat less than 500 calories',
  'eat less than 800 calories',
  // Injury-related overreach
  'train through the pain',
  'ignore the pain',
  'pain is just weakness',
  // Unsupported supplement claims
  'guaranteed to',
  'clinically proven to cure',
  'cures',
  'reverses disease',
];

// ─── Medical advice detection ─────────────────────────────────────────────────

const MEDICAL_ADVICE_PATTERNS: RegExp[] = [
  /\b(diagnos(is|e|ed|ing))\b/i,
  /\b(prescri(be|bed|ption))\b/i,
  /\byou (have|suffer from|are suffering|are experiencing)\b.{0,50}(condition|disorder|disease|syndrome|illness)/i,
  /\b(treat(ment|ing|ed)?|cure[sd]?|heal(ing|ed)?)\b.{0,30}(disease|condition|disorder)/i,
  /\b(medication|drug|pharmaceutical)\b/i,
  /\b\d+\s*(mg|milligrams?|mcg|micrograms?|iu)\b/i,
];

/**
 * Checks whether the given text contains language that resembles medical advice
 * or clinical diagnosis. Returns true if any medical advice pattern is detected.
 */
export function containsMedicalAdvice(text: string): boolean {
  for (const pattern of MEDICAL_ADVICE_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

// ─── Unsafe recommendation detection ─────────────────────────────────────────

const UNSAFE_RECOMMENDATION_PATTERNS: RegExp[] = [
  /eat\s+(less\s+than\s+[5-8]\d{2}|under\s+[5-8]\d{2})\s*calories/i,
  /fast\s+for\s+\d+\s*(days?|hours?)/i,
  /stop\s+eating\s+(completely|entirely|altogether)/i,
  /train\s+(through|despite|ignoring)\s+(the\s+)?(pain|injury|discomfort)/i,
  /ignore\s+the\s+(pain|injury)/i,
  /pain\s+is\s+(just\s+)?(weakness|in\s+your\s+head)/i,
  /guaranteed\s+to\s+(lose|gain|burn|build)/i,
  /starvation\s+(mode|diet|protocol)/i,
  /extreme\s+(caloric\s+)?deficit/i,
  /take\s+\d+\s*(pills?|capsules?|tablets?)\s+of/i,
];

/**
 * Checks whether the given text contains unsafe fitness or nutrition
 * recommendations. Returns true if any unsafe pattern is detected.
 */
export function containsUnsafeRecommendation(text: string): boolean {
  const lowerText = text.toLowerCase();

  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      return true;
    }
  }

  for (const pattern of UNSAFE_RECOMMENDATION_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

// ─── Response sanitizer ───────────────────────────────────────────────────────

const SANITIZATION_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string }> = [
  {
    pattern: /\b\d+\s*(mg|milligrams?|mcg|micrograms?|iu)\b/gi,
    replacement: '[dosage removed]',
  },
  {
    pattern: /\b(take|use)\s+\d+\s*(pills?|capsules?|tablets?)\b/gi,
    replacement: '[supplement dosage removed]',
  },
  {
    pattern:
      /\b(diagnos(is|e[sd]?)|prescri(be[sd]?|ption)|medication)\b/gi,
    replacement: '[please consult a healthcare professional]',
  },
];

const SAFETY_DISCLAIMER =
  '\n\n*Note: This information is for general fitness guidance only. Always consult a qualified healthcare professional before making significant changes to your diet, exercise routine, or supplementation, especially if you have any health conditions or injuries.*';

/**
 * Sanitizes an AI response by removing potentially dangerous content and
 * appending a safety disclaimer if any issues were detected.
 */
export function sanitizeAIResponse(text: string): string {
  let sanitized = text;
  let wasModified = false;

  for (const { pattern, replacement } of SANITIZATION_REPLACEMENTS) {
    const before = sanitized;
    sanitized = sanitized.replace(pattern, replacement);
    if (sanitized !== before) {
      wasModified = true;
    }
  }

  if (wasModified || containsMedicalAdvice(sanitized) || containsUnsafeRecommendation(sanitized)) {
    sanitized += SAFETY_DISCLAIMER;
  }

  return sanitized;
}
