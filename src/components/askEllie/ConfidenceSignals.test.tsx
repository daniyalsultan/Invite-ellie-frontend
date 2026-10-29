import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { QuotingSummary, quotingBreakdown, type SentenceCitation } from './ConfidenceSignals';

/**
 * A marked sentence is quoting; an unmarked one is concluding. Until this
 * was stated in words, a reader had no way to tell "my own reading" from
 * "we could not find the quote".
 */
const sentence = (
  text: string,
  segments: number[],
  is_claim?: boolean,
): SentenceCitation => ({ sentence: text, segments, is_claim });

describe('quotingBreakdown', () => {
  it('counts the claims that carry a quote', () => {
    expect(quotingBreakdown([sentence('A.', [0], true), sentence('B.', [], true)]))
      .toEqual({ quoted: 1, claims: 2 });
  });

  it('leaves out sentences that claim nothing', () => {
    // "Anything else?" is neither quoting nor concluding, and counting it
    // would make every answer look badly sourced.
    expect(quotingBreakdown([sentence('A.', [0], true), sentence('Anything else?', [], false)]))
      .toEqual({ quoted: 1, claims: 1 });
  });

  it('says nothing when nothing is quoted', () => {
    // The evidence notice already covers that case.
    expect(quotingBreakdown([sentence('A claim.', [], true)])).toBeNull();
  });

  it('says nothing on a server that does not send is_claim', () => {
    expect(quotingBreakdown([sentence('A.', [0], undefined)])).toBeNull();
  });

  it('says nothing when there are no citations at all', () => {
    expect(quotingBreakdown([])).toBeNull();
    expect(quotingBreakdown(undefined)).toBeNull();
  });

  it('reports every claim quoted', () => {
    expect(quotingBreakdown([sentence('A.', [0], true), sentence('B.', [1], true)]))
      .toEqual({ quoted: 2, claims: 2 });
  });
});

describe('QuotingSummary', () => {
  /** What a reader actually sees, with the markup's line breaks collapsed.
   *  The sentence is split across elements by the [1] marker, so matching
   *  on a single element is ambiguous. */
  const shown = (citations?: SentenceCitation[]) =>
    (render(<QuotingSummary citations={citations} />).container.textContent ?? '')
      .replace(/\s+/g, ' ')
      .trim();

  it('names the proportion and whose words the rest are', () => {
    expect(shown([sentence('A.', [0], true), sentence('B.', [], true)]))
      .toContain('1 of 2 statements above are linked to a transcript quote');
    expect(shown([sentence('A.', [0], true), sentence('B.', [], true)]))
      // The component renders &rsquo;, a curly apostrophe, not an ASCII one.
      .toContain('The rest is Ellie\u2019s own reading of the meetings');
  });

  it('uses the singular after "Every", however many there are', () => {
    // "Every statements above" was correct TypeScript and wrong English;
    // only rendering it showed that.
    const text = shown([sentence('A.', [0], true), sentence('B.', [1], true)]);
    expect(text).toContain('Every statement above is linked');
    expect(text).not.toContain('Every statements');
  });

  it('agrees in number for a single statement', () => {
    expect(shown([sentence('A.', [0], true)])).toContain('Every statement above is linked');
  });

  it('pluralises the remainder when more than one is unquoted', () => {
    expect(shown([sentence('A.', [0], true), sentence('B.', [], true), sentence('C.', [], true)]))
      .toContain('The rest are Ellie');
  });

  it('renders nothing when there is nothing honest to say', () => {
    expect(shown([sentence('A.', [], true)])).toBe('');
  });
});
