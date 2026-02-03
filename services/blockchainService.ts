
import { Block, Transaction } from '../types';

/**
 * A simple SHA-256 simulation using Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class Blockchain {
  chain: Block[] = [];
  pendingTransactions: Transaction[] = [];
  difficulty: number = 2;

  constructor() {
    this.createGenesisBlock();
  }

  private async createGenesisBlock() {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: "0",
      hash: "0000genesis",
      nonce: 0
    };
    this.chain = [genesisBlock];
  }

  async calculateHash(block: Omit<Block, 'hash'>): Promise<string> {
    const content = JSON.stringify(block.transactions) + block.previousHash + block.timestamp + block.nonce;
    return await sha256(content);
  }

  async mineBlock(transactions: Transaction[]): Promise<Block> {
    const previousBlock = this.chain[this.chain.length - 1];
    let nonce = 0;
    const timestamp = Date.now();
    const index = this.chain.length;
    
    let hash = "";
    const target = Array(this.difficulty + 1).join("0");

    while (true) {
      const blockData = {
        index,
        timestamp,
        transactions,
        previousHash: previousBlock.hash,
        nonce
      };
      hash = await this.calculateHash(blockData);
      if (hash.substring(0, this.difficulty) === target) {
        const newBlock = { ...blockData, hash };
        this.chain.push(newBlock);
        return newBlock;
      }
      nonce++;
    }
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }
}
