/**
 * Text Processing Utilities
 * Handles chunking, tokenization, and text analysis
 */

export class TextProcessor {
  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  static estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * Split text into chunks while respecting logical boundaries
   * Optimized for legal transcripts
   */
  static chunkTranscript(text, maxTokensPerChunk = 1000) {
    const chunks = [];
    const lines = text.split('\n');
    let currentChunk = '';
    let currentTokens = 0;

    for (const line of lines) {
      const lineTokens = this.estimateTokens(line);

      // If adding this line would exceed the limit, save current chunk
      if (currentTokens + lineTokens > maxTokensPerChunk && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }

      currentChunk += line + '\n';
      currentTokens += lineTokens;
    }

    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Extract structure from legal transcript
   * Identifies speakers, timestamps, sections
   */
  static extractStructure(text) {
    const structure = {
      speakers: new Set(),
      hasTimestamps: false,
      sections: [],
      lineCount: 0,
      estimatedTokens: this.estimateTokens(text),
    };

    const lines = text.split('\n');
    structure.lineCount = lines.length;

    // Common legal transcript patterns
    const speakerPattern = /^([A-Z\s.]+):\s*/;
    const timestampPattern = /\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?/;
    const sectionPattern = /^(DIRECT EXAMINATION|CROSS EXAMINATION|REDIRECT|RECROSS|OPENING STATEMENT|CLOSING ARGUMENT|VOIR DIRE)/i;

    for (const line of lines) {
      // Check for speakers
      const speakerMatch = line.match(speakerPattern);
      if (speakerMatch) {
        structure.speakers.add(speakerMatch[1].trim());
      }

      // Check for timestamps
      if (timestampPattern.test(line)) {
        structure.hasTimestamps = true;
      }

      // Check for section headers
      const sectionMatch = line.match(sectionPattern);
      if (sectionMatch) {
        structure.sections.push(sectionMatch[1]);
      }
    }

    structure.speakers = Array.from(structure.speakers);

    return structure;
  }

  /**
   * Identify key segments in transcript that need detailed analysis
   */
  static identifyKeySegments(text) {
    const keySegments = [];
    const lines = text.split('\n');

    // Patterns for important legal moments
    const patterns = {
      motion: /\b(motion|move to|moving for|objection|sustained|overruled)\b/i,
      ruling: /\b(court orders|court rules|granted|denied|the court)\b/i,
      evidence: /\b(exhibit|marked for identification|admitted|foundation|authentication)\b/i,
      testimony: /\b(sworn|testimony|witness|testified)\b/i,
      deadline: /\b(deadline|due date|by|within.*days|must file)\b/i,
    };

    let currentSegment = '';
    let segmentType = null;
    let lineNum = 0;

    for (const line of lines) {
      lineNum++;
      let matched = false;

      for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(line)) {
          if (segmentType !== type) {
            // Save previous segment
            if (currentSegment) {
              keySegments.push({
                type: segmentType,
                content: currentSegment.trim(),
                startLine: lineNum - currentSegment.split('\n').length,
                endLine: lineNum - 1,
              });
            }
            // Start new segment
            segmentType = type;
            currentSegment = line + '\n';
          } else {
            currentSegment += line + '\n';
          }
          matched = true;
          break;
        }
      }

      if (!matched && segmentType) {
        // Continue current segment for context
        currentSegment += line + '\n';

        // End segment if we have 5 lines of context
        if (currentSegment.split('\n').length > 10) {
          keySegments.push({
            type: segmentType,
            content: currentSegment.trim(),
            startLine: lineNum - currentSegment.split('\n').length,
            endLine: lineNum,
          });
          currentSegment = '';
          segmentType = null;
        }
      }
    }

    // Add final segment
    if (currentSegment) {
      keySegments.push({
        type: segmentType,
        content: currentSegment.trim(),
        startLine: lineNum - currentSegment.split('\n').length,
        endLine: lineNum,
      });
    }

    return keySegments;
  }

  /**
   * Clean and normalize transcript text
   */
  static cleanTranscript(text) {
    // Remove excessive whitespace
    let cleaned = text.replace(/\n{3,}/g, '\n\n');

    // Remove page numbers (common pattern: Page X)
    cleaned = cleaned.replace(/^Page \d+$/gm, '');

    // Remove line numbers if present
    cleaned = cleaned.replace(/^\s*\d+\s+/gm, '');

    // Normalize spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    return cleaned.trim();
  }
}

export default TextProcessor;
