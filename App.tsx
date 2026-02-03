
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionStatus, Block, Stats, FraudAnalysisResult, TransactionCategory } from './types';
import { Blockchain } from './services/blockchainService';
import { analyzeTransaction } from './services/geminiService';
import TransactionCard from './components/TransactionCard';
import BlockCard from './components/BlockCard';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Plus, 
  TrendingUp, 
  Wallet,
  Globe,
  Loader2,
  X,
  History,
  ShieldAlert,
  Smartphone,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldQuestion,
  Search,
  Zap,
  Shield
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const blockchainInstance = new Blockchain();

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>(blockchainInstance.chain);
  const [isMining, setIsMining] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<{tx: Transaction, result: FraudAnalysisResult} | null>(null);

  const stats: Stats = useMemo(() => ({
    totalTransactions: transactions.length,
    totalVolume: transactions.reduce((acc, t) => acc + t.amount, 0),
    flaggedCount: transactions.filter(t => t.status === TransactionStatus.FLAGGED || t.status === TransactionStatus.BLOCKED).length,
    avgRiskScore: transactions.length > 0 
      ? transactions.reduce((acc, t) => acc + (t.riskScore || 0), 0) / transactions.length 
      : 0
  }), [transactions]);

  const chartData = useMemo(() => {
    return transactions.slice(-10).map(t => ({
      name: t.id.slice(0, 4),
      amount: t.amount,
      risk: t.riskScore || 0
    }));
  }, [transactions]);

  const handleProcessTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));
    const upiId = formData.get('upiId') as string;
    const category = formData.get('category') as TransactionCategory;
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      fromAddress: "self@upi_user",
      toAddress: upiId || "unknown@upi",
      amount,
      currency: "INR",
      category: category,
      location: formData.get('location') as string || "New Delhi, India",
      deviceFingerprint: "ANDROID-TX-SAFE-1",
      status: TransactionStatus.PENDING
    };

    setIsAnalyzing(true);
    setShowNewTxModal(false);

    try {
      const analysis = await analyzeTransaction(newTx);
      
      const updatedTx: Transaction = {
        ...newTx,
        status: analysis.recommendation === 'BLOCK' 
          ? TransactionStatus.BLOCKED 
          : analysis.recommendation === 'REVIEW' 
            ? TransactionStatus.FLAGGED 
            : TransactionStatus.VALIDATED,
        riskScore: analysis.riskScore,
        fraudAnalysis: analysis.reason,
        mitigationSteps: analysis.mitigationSteps
      };

      setTransactions(prev => [...prev, updatedTx]);
      
      // If it's blocked, we don't even add it to the chain simulation
      if (updatedTx.status !== TransactionStatus.BLOCKED) {
        setIsMining(true);
        setTimeout(async () => {
          await blockchainInstance.mineBlock([updatedTx]);
          setBlocks([...blockchainInstance.chain]);
          setIsMining(false);
        }, 1200);
      }

      setSelectedAnalysis({ tx: updatedTx, result: analysis });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dynamic Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
              <Shield className="text-emerald-500 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">UPI <span className="text-emerald-500 underline decoration-emerald-500/30">SENTINEL</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Advanced Payment Risk Engine</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNewTxModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-2xl shadow-emerald-900/40"
            >
              <Zap className="w-4 h-4 fill-white" />
              CHECK & PAY
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Real-time Insights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'SENTINEL VOLUME', value: `₹${stats.totalVolume.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'RISK INDEX', value: `${stats.avgRiskScore.toFixed(0)}%`, icon: Activity, color: 'text-amber-400' },
            { label: 'SCAMS BLOCKED', value: transactions.filter(t => t.status === TransactionStatus.BLOCKED).length, icon: ShieldAlert, color: 'text-rose-500' },
            { label: 'BLOCKCHAIN HEIGHT', value: blocks.length, icon: History, color: 'text-blue-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-3xl group hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Risk Dashboard */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white">Payment Risk Flow</h3>
                  <p className="text-sm text-slate-500">Live visualization of UPI transaction amounts and associated risk levels.</p>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                      formatter={(value, name) => [name === 'amount' ? `₹${value.toLocaleString('en-IN')}` : `${value}%`, name === 'amount' ? 'Amount' : 'Risk']}
                    />
                    <Area type="step" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                    <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blockchain History */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <History className="text-indigo-400 w-6 h-6" />
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Verified Ledger</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...blocks].reverse().map((block) => (
                  <BlockCard key={block.hash} block={block} />
                ))}
              </div>
            </div>
          </div>

          {/* Side Feed */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] flex flex-col h-[750px] shadow-2xl">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20 rounded-t-[2rem]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-black text-white uppercase tracking-tighter text-sm">UPI Network Monitor</h3>
                </div>
                {isMining && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transactions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-10">
                    <ShieldQuestion className="w-16 h-16 mb-6 opacity-10" />
                    <p className="font-bold text-slate-400">Secure Network Idle</p>
                    <p className="text-xs">No threats detected. Use 'Check & Pay' to scan a VPA for risk.</p>
                  </div>
                ) : (
                  [...transactions].reverse().map(tx => (
                    <TransactionCard 
                      key={tx.id} 
                      transaction={tx} 
                      onClick={() => {
                        setSelectedAnalysis({
                          tx,
                          result: {
                            isFraudulent: tx.status === TransactionStatus.FLAGGED || tx.status === TransactionStatus.BLOCKED,
                            riskScore: tx.riskScore || 0,
                            reason: tx.fraudAnalysis || "Analyzing...",
                            anomaliesDetected: [],
                            recommendation: tx.status === TransactionStatus.BLOCKED ? 'BLOCK' : tx.status === TransactionStatus.FLAGGED ? 'REVIEW' : 'APPROVE',
                            mitigationSteps: tx.mitigationSteps || []
                          }
                        });
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Payment Scanner Modal */}
      {showNewTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <Search className="text-emerald-500 w-5 h-5" />
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Scam Guard Scanner</h3>
              </div>
              <button onClick={() => setShowNewTxModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleProcessTransaction} className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Payment Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-xl">₹</span>
                    <input required name="amount" type="number" placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-3xl pl-12 pr-6 py-5 text-2xl font-black text-white focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Receiver UPI ID / VPA</label>
                  <input required name="upiId" placeholder="example@upi" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-white font-bold focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all mono text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Category</label>
                    <select name="category" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-white font-bold text-sm focus:ring-4 focus:ring-emerald-500/20 outline-none appearance-none cursor-pointer">
                      <option value="P2P">Personal Transfer</option>
                      <option value="MERCHANT">Store / Merchant</option>
                      <option value="BILL_PAY">Recharge / Bills</option>
                      <option value="RELOAD">Wallet Cash</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Your Location</label>
                    <input name="location" placeholder="e.g. Mumbai" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-white font-bold text-sm focus:ring-4 focus:ring-emerald-500/20 outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10">
                <p className="text-[10px] text-emerald-500/80 font-black leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  AI will perform deep forensic analysis on this VPA before payment is authorized.
                </p>
              </div>

              <button type="submit" className="group w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-6 rounded-[2rem] transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-95">
                <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-lg">SCAN & AUTHORIZE</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* THE SOLVE - Forensic Report Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 bg-slate-800/20 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${selectedAnalysis.result.riskScore > 60 ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                  <ShieldAlert className={`w-6 h-6 ${selectedAnalysis.result.riskScore > 60 ? 'text-rose-500' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Forensic Safety Audit</h3>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Powered by Gemini Fraud-Engine</p>
                </div>
              </div>
              <button onClick={() => setSelectedAnalysis(null)} className="text-slate-500 hover:text-white">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-10 space-y-10 overflow-y-auto max-h-[75vh]">
              {/* Risk Header */}
              <div className="flex items-center justify-between gap-10">
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Risk Probability</h4>
                  <div className="flex items-end gap-4">
                    <div className={`text-7xl font-black italic tracking-tighter ${selectedAnalysis.result.riskScore > 60 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {selectedAnalysis.result.riskScore}%
                    </div>
                    <div className="mb-2 text-xs font-black uppercase text-slate-400">Threat Level</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-8 py-4 rounded-3xl font-black text-lg border-4 ${
                    selectedAnalysis.result.recommendation === 'BLOCK' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' :
                    selectedAnalysis.result.recommendation === 'REVIEW' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  } rotate-3`}>
                    {selectedAnalysis.result.recommendation}
                  </div>
                </div>
              </div>

              {/* Progress Bar Visual */}
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-1">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${selectedAnalysis.result.riskScore > 60 ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]'}`}
                  style={{ width: `${selectedAnalysis.result.riskScore}%` }}
                />
              </div>

              {/* Forensic Logic */}
              <div className="bg-slate-950/60 rounded-[2rem] p-8 border border-slate-800/50">
                <h4 className="flex items-center gap-3 text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-6">
                  <Activity className="w-4 h-4" />
                  Detection Analysis
                </h4>
                <p className="text-slate-300 leading-relaxed text-base italic font-medium">
                  "{selectedAnalysis.result.reason}"
                </p>
              </div>

              {/* THE SOLVE - SAFETY ACTION PLAN */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                  <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">The Solve: Safety Action Plan</h4>
                </div>
                <div className="grid gap-4">
                  {selectedAnalysis.result.mitigationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-5 bg-emerald-500/5 p-6 rounded-[1.5rem] border border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                      <div className="bg-emerald-500 text-slate-950 w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-slate-200 font-bold leading-tight">{step}</span>
                    </div>
                  ))}
                  {selectedAnalysis.result.mitigationSteps.length === 0 && (
                    <div className="text-slate-500 text-center py-6 bg-slate-800/10 rounded-3xl border border-dashed border-slate-800 font-bold">
                      Verified transaction. No special mitigation required.
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata Summary */}
              <div className="grid grid-cols-2 gap-6 pb-4">
                <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-800/40">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">TARGET UPI ID</div>
                  <div className="text-white font-black truncate mono text-sm">{selectedAnalysis.tx.toAddress}</div>
                </div>
                <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-800/40">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">AUTH AMOUNT</div>
                  <div className="text-emerald-500 font-black text-xl italic">₹{selectedAnalysis.tx.amount.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-950 border-t border-slate-800 flex items-center justify-center">
              <button 
                onClick={() => setSelectedAnalysis(null)} 
                className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.4em] py-4 px-12 rounded-full transition-all border border-slate-700"
              >
                Acknowledge Safety Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl transition-all duration-500">
          <div className="text-center space-y-8 max-w-sm">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-2">VPA Forensic Scan</h3>
              <p className="text-slate-500 text-sm font-bold animate-pulse">Gemini 3 Pro is analyzing transaction metadata and cross-referencing known Indian scam patterns...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
