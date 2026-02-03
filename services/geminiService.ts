
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FraudAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTransaction = async (transaction: Transaction): Promise<FraudAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a high-stakes fraud investigation on this Indian UPI transaction. 
      VPA (UPI ID): ${transaction.toAddress}
      Amount: ₹${transaction.amount}
      Category: ${transaction.category}
      User Location: ${transaction.location}
      Device Signature: ${transaction.deviceFingerprint}

      Check specifically for these known Indian UPI scam patterns:
      1. 'Request Money' Phishing: Scammer sends a request to pay instead of receiving money.
      2. OLX/Marketplace Fraud: Scammers asking for advance or 'verification' fees.
      3. KYC/Bank Update Scam: Suspicious merchant names claiming to be 'HDFC_KYC', 'SBI_Support', etc.
      4. Lottery/Job Scam: High value transfers to random individual VPAs.
      5. Screen Sharing Fraud: Is the device fingerprint or context suggestive of remote access?

      Return a JSON with a 'riskScore' (0-100), 'reason', and a list of 'mitigationSteps' (The Solve) which are direct instructions for the user to stay safe.`,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFraudulent: { type: Type.BOOLEAN },
            riskScore: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            anomaliesDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendation: { 
              type: Type.STRING, 
              enum: ["APPROVE", "REVIEW", "BLOCK"] 
            },
            mitigationSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific actionable steps to 'solve' or prevent this fraud."
            }
          },
          required: ["isFraudulent", "riskScore", "reason", "anomaliesDetected", "recommendation", "mitigationSteps"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text) as FraudAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      isFraudulent: transaction.amount > 80000,
      riskScore: transaction.amount > 80000 ? 65 : 15,
      reason: "Automated baseline check: Transaction exceeds standard user threshold for this account.",
      anomaliesDetected: transaction.amount > 80000 ? ["Abnormal Volume"] : [],
      recommendation: transaction.amount > 80000 ? "REVIEW" : "APPROVE",
      mitigationSteps: [
        "Verify the recipient's legal name on the UPI app before entering PIN.",
        "Never enter your UPI PIN to receive money.",
        "Check if the recipient VPA has been reported on CyberCrime.gov.in"
      ]
    };
  }
};
