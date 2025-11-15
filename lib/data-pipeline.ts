// Data Pipeline - Orchestrates document processing and risk recalculation

import { DocumentProcessor, ProcessedDocumentData } from './document-processor';
import { FeatureExtractor } from './feature-extractor';
import { HelixRiskCalculator, UserData } from './risk-calculator';
import db from './db';
import { randomUUID } from 'crypto';

export class DataPipeline {
  private documentProcessor: DocumentProcessor;
  private featureExtractor: FeatureExtractor;
  private riskCalculator: HelixRiskCalculator;

  constructor() {
    this.documentProcessor = new DocumentProcessor();
    this.featureExtractor = new FeatureExtractor();
    this.riskCalculator = new HelixRiskCalculator();
  }

  /**
   * Process a single uploaded file and update risk profile
   */
  async processFile(dataId: string): Promise<void> {
    try {
      // Get file metadata
      const fileData = db.prepare(`
        SELECT * FROM financial_data WHERE id = ?
      `).get(dataId) as any;

      if (!fileData) {
        throw new Error('File not found');
      }

      // Get file path from raw_data
      const rawData = JSON.parse(fileData.raw_data || '{}');
      const filePath = rawData.filePath;

      if (!filePath) {
        throw new Error('File path not found');
      }

      // Process document based on type
      let processedData: ProcessedDocumentData = {};

      switch (fileData.data_type) {
        case 'bank_statement':
          processedData = await this.documentProcessor.processBankStatement(filePath);
          break;
        case 'pay_stub':
          processedData = await this.documentProcessor.processPayStub(filePath);
          break;
        case 'tax_return':
          processedData = await this.documentProcessor.processTaxReturn(filePath);
          break;
        case 'credit_card_statement':
          processedData = await this.documentProcessor.processCreditCardStatement(filePath);
          break;
        case 'loan_statement':
          processedData = await this.documentProcessor.processLoanStatement(filePath);
          break;
        case 'debt_statement':
          processedData = await this.documentProcessor.processDebtStatement(filePath);
          break;
        case 'bill':
          processedData = await this.documentProcessor.processBill(filePath);
          break;
        default:
          throw new Error(`Unsupported document type: ${fileData.data_type}`);
      }

      // Update database with processed data
      db.prepare(`
        UPDATE financial_data 
        SET processed_data = ? 
        WHERE id = ?
      `).run(JSON.stringify(processedData), dataId);

      // Recalculate risk profile for this user
      await this.recalculateRiskProfile(fileData.user_id);

    } catch (error: any) {
      console.error('Error processing file:', error);
      // Update status to failed
      db.prepare(`
        UPDATE financial_data 
        SET processed_data = ?
        WHERE id = ?
      `).run(JSON.stringify({ error: error.message, status: 'failed' }), dataId);
      throw error;
    }
  }

  /**
   * Recalculate risk profile based on all processed documents for a user
   */
  async recalculateRiskProfile(userId: string): Promise<void> {
    try {
      // Extract features from all processed documents
      const userData = this.featureExtractor.extractFeatures(userId);

      // Calculate risk score
      const result = this.riskCalculator.calculateHelixScore(userData);

      // Store risk profile
      const riskProfileId = randomUUID();
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO risk_profiles (
          id, user_id, helix_score, risk_category,
          stability_index, affordability_ratio, reliability_score,
          cash_flow_score, asset_score, behavior_score, fraud_score,
          financial_stability_score, behavioral_risk_score,
          alternative_data_score, economic_environment_score, fraud_risk_score,
          confidence_interval, flags, explanation, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        riskProfileId,
        userId,
        result.helixScore,
        result.riskCategory,
        result.dimensionScores.financial,
        userData.debtToIncomeRatio || null,
        result.dimensionScores.behavioral,
        result.dimensionScores.financial,
        result.dimensionScores.alternative,
        result.dimensionScores.behavioral,
        result.dimensionScores.fraud,
        result.dimensionScores.financial,
        result.dimensionScores.behavioral,
        result.dimensionScores.alternative,
        result.dimensionScores.economic_environment,
        result.dimensionScores.fraud,
        result.confidenceInterval,
        JSON.stringify(result.flags),
        JSON.stringify(result.explanation),
        now,
        now
      );

      // Store in history
      db.prepare(`
        INSERT INTO risk_profile_history (
          id, user_id, helix_score, risk_category, dimension_scores, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        result.helixScore,
        result.riskCategory,
        JSON.stringify(result.dimensionScores),
        now
      );

      // Check for alerts
      const previousProfile = db.prepare(`
        SELECT helix_score FROM risk_profiles 
        WHERE user_id = ? AND id != ?
        ORDER BY created_at DESC LIMIT 1
      `).get(userId, riskProfileId) as { helix_score: number } | undefined;

      if (previousProfile) {
        const delta = result.helixScore - previousProfile.helix_score;
        
        if (Math.abs(delta) > 10) {
          const alertStmt = db.prepare(`
            INSERT INTO risk_alerts (
              id, user_id, alert_type, severity, message,
              previous_score, current_score, delta, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          alertStmt.run(
            randomUUID(),
            userId,
            'score_change',
            delta > 20 ? 'high' : 'medium',
            `Risk score changed by ${delta.toFixed(1)} points`,
            previousProfile.helix_score,
            result.helixScore,
            delta,
            now
          );
        }
      }

    } catch (error: any) {
      console.error('Error recalculating risk profile:', error);
      throw error;
    }
  }

  /**
   * Process all unprocessed files for a user
   */
  async processAllUserFiles(userId: string): Promise<void> {
    const unprocessedFiles = db.prepare(`
      SELECT id FROM financial_data 
      WHERE user_id = ? AND processed_data IS NULL
    `).all(userId) as Array<{ id: string }>;

    for (const file of unprocessedFiles) {
      await this.processFile(file.id);
    }
  }
}

