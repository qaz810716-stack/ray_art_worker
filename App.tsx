
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Transaction } from './types';
import { generateId, calculateMetrics, formatCurrency } from './utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChartBarIcon, 
  FolderIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('project_profit_pulse');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Transaction Form States
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');

  // Persist projects
  useEffect(() => {
    localStorage.setItem('project_profit_pulse', JSON.stringify(projects));
  }, [projects]);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

  const metrics = useMemo(() => {
    if (!selectedProject) return null;
    return calculateMetrics(selectedProject);
  }, [selectedProject]);

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: generateId(),
      name: newProjectName,
      description: '',
      createdAt: new Date().toISOString(),
      transactions: []
    };
    setProjects([...projects, newProject]);
    setNewProjectName('');
    setIsNewProjectModalOpen(false);
    setSelectedProjectId(newProject.id);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('確定要刪除此專案嗎？所有的收支記錄都將遺失。')) {
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProjectId === id) setSelectedProjectId(null);
    }
  };

  const handleQuickAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(txAmount);
    if (isNaN(amount) || amount <= 0 || !selectedProjectId) return;

    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          transactions: [
            ...p.transactions,
            {
              id: generateId(),
              amount,
              description: txDesc || (txType === 'income' ? '日常收入' : '日常支出'),
              date: new Date().toISOString(),
              type: txType
            }
          ]
        };
      }
      return p;
    }));

    // Reset form
    setTxAmount('');
    setTxDesc('');
  };

  const removeTransaction = (txId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          transactions: p.transactions.filter(t => t.id !== txId)
        };
      }
      return p;
    }));
  };

  const chartData = useMemo(() => {
    return projects.map(p => {
      const m = calculateMetrics(p);
      return {
        name: p.name,
        收入: m.totalIncome,
        支出: m.totalExpense,
        利潤: m.profit
      };
    });
  }, [projects]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
            <ChartBarIcon className="w-6 h-6" />
            專案財務管家
          </h1>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">我的專案</h2>
            <button 
              onClick={() => setIsNewProjectModalOpen(true)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              title="新增專案"
            >
              <PlusIcon className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedProjectId === null 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              總覽儀表板
            </button>
            {projects.map(project => (
              <div key={project.id} className="group flex items-center gap-1">
                <button
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium truncate transition-all ${
                    selectedProjectId === project.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderIcon className="w-4 h-4" />
                    {project.name}
                  </span>
                </button>
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {selectedProjectId === null ? (
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="mb-8">
              <h2 className="text-2xl font-bold">財務總覽</h2>
              <p className="text-slate-500">所有專案的獲利與支出分佈</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">總體營收</span>
                  <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(projects.reduce((sum, p) => sum + calculateMetrics(p).totalIncome, 0))}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">總體支出</span>
                  <CreditCardIcon className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(projects.reduce((sum, p) => sum + calculateMetrics(p).totalExpense, 0))}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-500">總體利潤</span>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold">{formatCurrency(projects.reduce((sum, p) => sum + calculateMetrics(p).profit, 0))}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6">各專案對比分析</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="收入" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="利潤" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="mb-8">
              <nav className="text-xs text-indigo-600 font-bold uppercase mb-2">專案工作區</nav>
              <h2 className="text-3xl font-extrabold tracking-tight">{selectedProject?.name}</h2>
            </header>

            {/* Transaction Input Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2">
                <PlusCircleIcon className="w-5 h-5 text-indigo-500" />
                快速記錄收支
              </h3>
              <form onSubmit={handleQuickAddTransaction} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                    <button 
                      type="button"
                      onClick={() => setTxType('expense')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${txType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      支出
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTxType('income')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${txType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      收入
                    </button>
                  </div>
                </div>
                <div className="flex-[2] space-y-4 md:space-y-0 md:flex md:gap-4">
                  <input 
                    type="number" 
                    placeholder="金額" 
                    required
                    className="w-full md:w-32 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="描述 (如：廣告支出, 訂單回款...)" 
                    className="w-full flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-200"
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard title="累積收入" value={formatCurrency(metrics?.totalIncome || 0)} color="emerald" />
              <MetricCard title="累積支出" value={formatCurrency(metrics?.totalExpense || 0)} color="rose" />
              <MetricCard 
                title="當前利潤" 
                value={formatCurrency(metrics?.profit || 0)} 
                color={metrics?.profit && metrics.profit >= 0 ? 'indigo' : 'red'} 
              />
              <div className="grid grid-cols-2 gap-4 md:col-span-1">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">利潤率</div>
                  <div className={`text-lg font-bold ${metrics?.profitMargin && metrics.profitMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metrics?.profitMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">回本率</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {metrics?.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold">收支明細</h3>
                  <span className="text-xs text-slate-400">共 {selectedProject?.transactions.length} 筆</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                  {selectedProject?.transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">尚未建立任何收支記錄</div>
                  ) : (
                    selectedProject?.transactions.slice().reverse().map(tx => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {tx.type === 'income' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{tx.description}</div>
                            <div className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </div>
                          <button onClick={() => removeTransaction(tx.id)} className="p-1 text-slate-300 hover:text-rose-600 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold mb-6">收支分佈</h3>
                {metrics && metrics.totalIncome === 0 && metrics.totalExpense === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">暫無數據可視化</div>
                ) : (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: '收入', value: metrics?.totalIncome || 0 },
                            { name: '支出', value: metrics?.totalExpense || 0 }
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f43f5e" />
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> 收入</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-500 rounded-full"></div> 支出</div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">回本進度</span>
                    <span className="text-sm font-bold text-indigo-600">{metrics?.roi.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(metrics?.roi || 0, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    {metrics && metrics.roi >= 100 
                      ? "恭喜！該專案已實現回本，目前正在創造盈餘。" 
                      : `還需再賺取 ${formatCurrency(Math.max(0, (metrics?.totalExpense || 0) - (metrics?.totalIncome || 0)))} 即可達成回本。`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-4">新增開發專案</h3>
            <input 
              type="text" 
              placeholder="專案名稱" 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsNewProjectModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">取消</button>
              <button onClick={handleAddProject} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">創建專案</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: string; color: 'emerald' | 'rose' | 'indigo' | 'red' }> = ({ title, value, color }) => {
  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    red: 'text-red-600 bg-red-50'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div>
      <div className={`text-2xl font-black ${colorClasses[color].split(' ')[0]}`}>{value}</div>
    </div>
  );
};

export default App;
