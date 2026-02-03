
import React from 'react';
import { Transaction, TransactionStatus } from '../types';
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onClick?: () => void;
}

const TransactionCard: React.FC<Props> = ({ transaction, onClick }) => {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case TransactionStatus.VALIDATED: return <ShieldCheck className="text-emerald-400 w-5 h-5" />;
      case TransactionStatus.FLAGGED: return <ShieldAlert className="text-amber-400 w-5 h-5" />;
      case TransactionStatus.BLOCKED: return <ShieldX className="text-rose-400 w-5 h-5" />;
      default: return <Clock className="text-slate-400 w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case TransactionStatus.VALIDATED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case TransactionStatus.FLAGGED: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case TransactionStatus.BLOCKED: return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs mono uppercase tracking-wider">From:</span>
            <span className="text-slate-100 font-medium text-sm truncate max-w-[120px]">{transaction.fromAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs mono uppercase tracking-wider">To:</span>
            <span className="text-slate-100 font-medium text-sm truncate max-w-[120px]">{transaction.toAddress}</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-white">₹{transaction.amount.toLocaleString('en-IN')}</div>
        <div className="text-[10px] text-slate-500 uppercase font-semibold">{new Date(transaction.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default TransactionCard;
