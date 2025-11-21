import llmService from './llmService.js';
import TextProcessor from '../utils/textProcessor.js';

/**
 * Legal Transcript Analysis Service
 * Implements cost-efficient hierarchical processing
 */

class LegalTranscriptService {
  constructor() {
    this.legalSystemPrompt = `You are an expert legal assistant with paralegal-level knowledge. You specialize in analyzing court transcripts and legal proceedings.

Your expertise includes:
- Legal procedures and terminology (civil and criminal)
- Evidence rules and objections (Federal Rules of Evidence)
- Court procedures and protocols
- Motion practice and legal deadlines
- Discovery processes
- Testimony analysis
- Legal document structure and formatting

When analyzing transcripts:
- Focus on legally significant moments (motions, rulings, key testimony)
- Identify procedural requirements and deadlines
- Note evidentiary issues and objections
- Track parties, witnesses, and exhibits
- Highlight action items requiring follow-up
- Use precise legal terminology
- Be objective and fact-based`;
  }

  /**
   * Main processing method - implements cost-efficient strategy
   */
  async processTranscript({ text, provider, model, apiKey, strategy = 'balanced' }) {
    const results = {
      keyTakeaways: '',
      summary: '',
      actionItems: '',
      metadata: {},
      costs: [],
      totalCost: 0,
      processing: {
        strategy,
        chunks: 0,
        totalTokens: 0,
      },
    };

    try {
      // Step 1: Clean and analyze transcript structure
      const cleanedText = TextProcessor.cleanTranscript(text);
      const structure = TextProcessor.extractStructure(cleanedText);
      results.metadata = structure;

      // Step 2: Choose processing strategy based on size and user preference
      if (structure.estimatedTokens < 4000 || strategy === 'fast') {
        // Small transcript or fast mode - process directly
        const result = await this.processDirectly({
          text: cleanedText,
          provider,
          model,
          apiKey,
        });
        results.keyTakeaways = result.keyTakeaways;
        results.summary = result.summary;
        results.actionItems = result.actionItems;
        results.costs.push(result.cost);
      } else {
        // Large transcript - use hierarchical processing
        const result = await this.processHierarchical({
          text: cleanedText,
          structure,
          provider,
          model,
          apiKey,
        });
        results.keyTakeaways = result.keyTakeaways;
        results.summary = result.summary;
        results.actionItems = result.actionItems;
        results.costs = result.costs;
        results.processing.chunks = result.chunks;
      }

      // Calculate total cost
      results.totalCost = results.costs.reduce(
        (sum, cost) => sum + (cost.totalCost || 0),
        0
      );

      return results;
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw error;
    }
  }

  /**
   * Direct processing for small transcripts
   */
  async processDirectly({ text, provider, model, apiKey }) {
    const prompt = `Analyze this legal transcript and provide:

1. KEY TAKEAWAYS (5-7 critical bullet points highlighting the most important legal developments)
2. SUMMARY (2-3 paragraph narrative covering the proceedings chronologically)
3. ACTION ITEMS (numbered list with deadlines, responsible parties, and required actions)

Transcript:
${text}

Provide your analysis in this exact format:

KEY TAKEAWAYS:
[Your bullet points here]

SUMMARY:
[Your paragraphs here]

ACTION ITEMS:
[Your numbered list here]`;

    const response = await llmService.generateCompletion({
      provider,
      model,
      apiKey,
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: this.legalSystemPrompt,
      temperature: 0.5,
      maxTokens: 4096,
    });

    // Parse the response
    const parsed = this.parseStructuredResponse(response.content);

    return {
      ...parsed,
      cost: response.cost,
    };
  }

  /**
   * Hierarchical processing for large transcripts
   * Uses cheaper models for chunking, premium for synthesis
   */
  async processHierarchical({ text, structure, provider, model, apiKey }) {
    const costs = [];
    let chunks = 0;

    // Step 1: Identify and extract key segments
    const keySegments = TextProcessor.identifyKeySegments(text);

    // Step 2: Generate summaries for key segments using fast model
    const fastModel = this.getFastModel(provider);
    const segmentSummaries = [];

    for (const segment of keySegments) {
      chunks++;
      const response = await llmService.generateCompletion({
        provider,
        model: fastModel,
        apiKey,
        messages: [
          {
            role: 'user',
            content: `Summarize this ${segment.type} segment from a legal transcript in 2-3 sentences, focusing on legally significant details:\n\n${segment.content}`,
          },
        ],
        systemPrompt: this.legalSystemPrompt,
        temperature: 0.5,
        maxTokens: 500,
      });

      segmentSummaries.push({
        type: segment.type,
        summary: response.content,
      });
      costs.push(response.cost);
    }

    // Step 3: If transcript is very large, also create chunk summaries
    let chunkSummaries = [];
    if (structure.estimatedTokens > 8000) {
      const textChunks = TextProcessor.chunkTranscript(text, 1000);

      for (const chunk of textChunks) {
        chunks++;
        const response = await llmService.generateCompletion({
          provider,
          model: fastModel,
          apiKey,
          messages: [
            {
              role: 'user',
              content: `Provide a brief summary of this transcript excerpt:\n\n${chunk}`,
            },
          ],
          systemPrompt: this.legalSystemPrompt,
          temperature: 0.5,
          maxTokens: 300,
        });

        chunkSummaries.push(response.content);
        costs.push(response.cost);
      }
    }

    // Step 4: Synthesize final analysis using premium model
    const synthesisPrompt = this.buildSynthesisPrompt({
      structure,
      segmentSummaries,
      chunkSummaries,
    });

    const finalResponse = await llmService.generateCompletion({
      provider,
      model, // Use the user-selected premium model
      apiKey,
      messages: [{ role: 'user', content: synthesisPrompt }],
      systemPrompt: this.legalSystemPrompt,
      temperature: 0.5,
      maxTokens: 4096,
    });

    costs.push(finalResponse.cost);

    // Parse the final response
    const parsed = this.parseStructuredResponse(finalResponse.content);

    return {
      ...parsed,
      costs,
      chunks,
    };
  }

  buildSynthesisPrompt({ structure, segmentSummaries, chunkSummaries }) {
    let prompt = `Based on the following summaries and analysis of a legal transcript, provide a comprehensive analysis:\n\n`;

    prompt += `TRANSCRIPT METADATA:\n`;
    prompt += `- Speakers: ${structure.speakers.join(', ')}\n`;
    prompt += `- Sections: ${structure.sections.join(', ')}\n`;
    prompt += `- Estimated length: ${structure.estimatedTokens} tokens\n\n`;

    prompt += `KEY SEGMENT SUMMARIES:\n`;
    segmentSummaries.forEach((seg, idx) => {
      prompt += `${idx + 1}. [${seg.type.toUpperCase()}] ${seg.summary}\n`;
    });

    if (chunkSummaries.length > 0) {
      prompt += `\nCHRONOLOGICAL SUMMARIES:\n`;
      chunkSummaries.forEach((sum, idx) => {
        prompt += `Part ${idx + 1}: ${sum}\n`;
      });
    }

    prompt += `\n\nBased on these summaries, provide:

1. KEY TAKEAWAYS (5-7 critical bullet points highlighting the most important legal developments)
2. SUMMARY (2-3 paragraph narrative covering the proceedings)
3. ACTION ITEMS (numbered list with deadlines, parties, and required actions)

Format your response as:

KEY TAKEAWAYS:
[Your bullet points here]

SUMMARY:
[Your paragraphs here]

ACTION ITEMS:
[Your numbered list here]`;

    return prompt;
  }

  parseStructuredResponse(content) {
    const result = {
      keyTakeaways: '',
      summary: '',
      actionItems: '',
    };

    // Split by section headers
    const sections = content.split(/\n(?=KEY TAKEAWAYS:|SUMMARY:|ACTION ITEMS:)/i);

    for (const section of sections) {
      if (section.match(/^KEY TAKEAWAYS:/i)) {
        result.keyTakeaways = section.replace(/^KEY TAKEAWAYS:\s*/i, '').trim();
      } else if (section.match(/^SUMMARY:/i)) {
        result.summary = section.replace(/^SUMMARY:\s*/i, '').trim();
      } else if (section.match(/^ACTION ITEMS:/i)) {
        result.actionItems = section.replace(/^ACTION ITEMS:\s*/i, '').trim();
      }
    }

    return result;
  }

  getFastModel(provider) {
    const fastModels = {
      anthropic: 'claude-3-haiku-20240307',
      openai: 'gpt-4o-mini',
      google: 'gemini-1.5-flash',
    };

    return fastModels[provider] || fastModels.anthropic;
  }
}

export default new LegalTranscriptService();
