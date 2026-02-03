
import React from 'react';
import { Block } from '../types';
import { Box, Hash, Link as LinkIcon, Database } from 'lucide-react';

interface Props {
  block: Block;
}

const BlockCard: React.FC<Props> = ({ block }) => {
  return (
    <div className="relative group">
      {/* Connector Line */}
      {block.index > 0 && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-6 w-px bg-slate-700 group-hover:bg-blue-500 transition-colors" />
      )}
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-xl shadow-black/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-slate-200">Block #{block.index}</span>
          </div>
          <span className="text-xs text-slate-500 mono">{new Date(block.timestamp).toLocaleTimeString()}</span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">Current Hash</span>
            </div>
            <div className="text-[11px] text-blue-400/80 mono truncate">{block.hash}</div>
          </div>

          <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/50 overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <LinkIcon className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">Prev Hash</span>
            </div>
            <div className="text-[11px] text-slate-500 mono truncate">{block.previousHash}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Database className="w-3 h-3" />
            <span>{block.transactions.length} Transactions</span>
          </div>
          <div className="text-[10px] text-slate-500 mono">Nonce: {block.nonce}</div>
        </div>
      </div>
    </div>
  );
};

export default BlockCard;
