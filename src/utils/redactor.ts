/**
 * Sanitizes input text by replacing PII data with "[REDACTED]" and lists all redacted categories.
 *
 * @param text The raw string content to scrub.
 * @returns An object containing the redacted text and an array of detected PII categories.
 */
export function redactStructuredPII(text: string): { sanitizedText: string; redactedTypes: string[] } {
  const redactedTypes: string[] = [];
  let sanitizedText = text;

  // 1. Credit Cards (Visa, MasterCard, Amex, Discover with optional spaces/dashes)
  const cardPatterns = [
    // Visa
    /\b4\d{3}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    /\b4\d{12}(?:\d{3})?\b/g,
    // Mastercard
    /\b5[1-5]\d{2}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    /\b2(?:22[1-9]|2[3-9]\d|[3-6]\d{2}|7[0-1]\d|720)\d[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    // American Express
    /\b3[47]\d{2}[ -]?\d{6}[ -]?\d{5}\b/g,
    /\b3[47]\d{13}\b/g,
    // Discover
    /\b6(?:011|5\d{2})[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
  ];

  let hasCC = false;
  for (const pattern of cardPatterns) {
    if (pattern.test(sanitizedText)) {
      hasCC = true;
      pattern.lastIndex = 0; // Reset regex state
      sanitizedText = sanitizedText.replace(pattern, '[REDACTED]');
    }
  }
  if (hasCC) {
    redactedTypes.push('CREDIT_CARD');
  }

  // 2. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailRegex.test(sanitizedText)) {
    redactedTypes.push('EMAIL');
    emailRegex.lastIndex = 0;
    sanitizedText = sanitizedText.replace(emailRegex, '[REDACTED]');
  }

  // 3. Social Security Numbers (XXX-XX-XXXX or XXX XX XXXX)
  const ssnRegex = /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g;
  if (ssnRegex.test(sanitizedText)) {
    redactedTypes.push('SSN');
    ssnRegex.lastIndex = 0;
    sanitizedText = sanitizedText.replace(ssnRegex, '[REDACTED]');
  }

  // 4. Medical Record Numbers (MRN prefix + 6-12 alphanumeric chars)
  const mrnRegex = /\bMRN[ -]?[A-Z0-9]{6,12}\b/gi;
  if (mrnRegex.test(sanitizedText)) {
    redactedTypes.push('MRN');
    mrnRegex.lastIndex = 0;
    sanitizedText = sanitizedText.replace(mrnRegex, '[REDACTED]');
  }

  // 5. Healthcare identifiers / NPI (NPI prefix + 10 digit number)
  const npiRegex = /\bNPI[ -]?\d{10}\b/gi;
  if (npiRegex.test(sanitizedText)) {
    redactedTypes.push('NPI');
    npiRegex.lastIndex = 0;
    sanitizedText = sanitizedText.replace(npiRegex, '[REDACTED]');
  }

  // 6. Phone numbers (covers standard US and international country code prefixes and punctuation formats)
  // Utilizes a dynamic prefix builder to capture optional '+' symbols and country codes cleanly
  const prefix = '(?:\\+\\d{1,4}[-.\\s]*|\\b\\d{1,4}[-.\\s]+)?';
  const usPhoneRegex = new RegExp(prefix + '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b', 'g');
  const intPhoneRegex = new RegExp(
    prefix + '\\(?\\d{2,4}\\)?[-.\\s]?\\d{2,4}[-.\\s]?\\d{3,4}(?:[-.\\s]?\\d{3,4})?\\b',
    'g'
  );

  let hasPhone = false;
  if (usPhoneRegex.test(sanitizedText)) {
    hasPhone = true;
    usPhoneRegex.lastIndex = 0;
    sanitizedText = sanitizedText.replace(usPhoneRegex, '[REDACTED]');
  }
  if (intPhoneRegex.test(sanitizedText)) {
    hasPhone = true;
    intPhoneRegex.lastIndex = 0;
    sanitizedText = sanitizedText.replace(intPhoneRegex, '[REDACTED]');
  }
  if (hasPhone) {
    redactedTypes.push('PHONE');
  }

  return { sanitizedText, redactedTypes };
}
