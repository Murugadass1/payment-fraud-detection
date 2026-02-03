
export enum TransactionStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  FLAGGED = 'FLAGGED',
  BLOCKED = 'BLOCKED'
}

export type TransactionCategory = 'P2P' | 'MERCHANT' | 'BILL_PAY' | 'RELOAD';

export interface Transaction {
  id: string;
  timestamp: number;
  fromAddress: string;
  toAddress: string; // This will now represent a UPI ID (VPA)
  amount: number;
  currency: string;
  location: string;
  category: TransactionCategory;
  deviceFingerprint: string;
  status: TransactionStatus;
  riskScore?: number;
  fraudAnalysis?: string;
  mitigationSteps?: string[];
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface FraudAnalysisResult {
  isFraudulent: boolean;
  riskScore: number;
  reason: string;
  anomaliesDetected: string[];
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK';
  mitigationSteps: string[]; // The "Solve" for the user
}

export interface Stats {
  totalTransactions: number;
  totalVolume: number;
  flaggedCount: number;
  avgRiskScore: number;
}
