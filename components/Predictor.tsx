
import React, { useState } from 'react';
import { Laptop } from '../types';
import { predictLaptopPrice } from '../api';
import { formatCurrency } from '../utils';
import { COMPANIES, TYPES, OS_LIST } from '../constants';
import { Calculator, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface PredictorProps {
  data: Laptop[];
}

const Predictor: React.FC<PredictorProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ price: number; reasoning: string } | null>(null);
  
  const [form, setForm] = useState({
    company: 'HP',
    typeName: 'Notebook',
    ram: 8,
    weight: 1.8,
    cpu: 'Intel Core i5',
    gpu: 'Intel HD Graphics',
    memory: '256GB SSD',
    opSys: 'Windows 10'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    const prediction = await predictLaptopPrice(form, data);
    setResult(prediction);
    setLoading(false);
  };

  const InputField = ({ label, name, type = "text", placeholder, value, colSpan = 1 }: any) => (
    <div className={`space-y-2 ${colSpan === 2 ? 'sm:col-span-2' : ''}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={handleChange} 
        placeholder={placeholder}
        step={type === 'number' ? "0.1" : undefined}
        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none placeholder-slate-600" 
      />
    </div>
  );

  const SelectField = ({ label, name, options, value }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select 
          name={name} 
          value={value} 
          onChange={handleChange} 
          className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg p-3 appearance-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
        >
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-2 ring-1 ring-emerald-500/20">
          <Calculator className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">
          Laptop Price Estimator
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Our Gemini-powered AI analyzes market trends from the dataset to estimate the fair market value of any laptop configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-7 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-xl h-fit">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SelectField label="Brand" name="company" options={COMPANIES} value={form.company} />
            <SelectField label="Type" name="typeName" options={TYPES} value={form.typeName} />
            <InputField label="RAM (GB)" name="ram" type="number" value={form.ram} />
            <InputField label="Weight (kg)" name="weight" type="number" value={form.weight} />
            <InputField label="Processor (CPU)" name="cpu" value={form.cpu} placeholder="e.g. Intel Core i7 8550U" colSpan={2} />
            <InputField label="Graphics (GPU)" name="gpu" value={form.gpu} placeholder="e.g. Nvidia GeForce GTX 1050" colSpan={2} />
            <InputField label="Storage" name="memory" value={form.memory} placeholder="e.g. 256GB SSD + 1TB HDD" colSpan={2} />
            <SelectField label="Operating System" name="opSys" options={OS_LIST} value={form.opSys} />
          </div>

          <button 
            onClick={handlePredict}
            disabled={loading}
            className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing Dataset...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="group-hover:text-yellow-200 transition-colors" />
                <span>Predict Price</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 space-y-6">
          {!result && !loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 bg-slate-900/30 rounded-2xl p-8">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-slate-600" />
              </div>
              <p className="font-medium">Ready to estimate</p>
              <p className="text-sm mt-1">Fill out the specs and hit predict</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
               {/* Price Card */}
               <div className="bg-gradient-to-br from-emerald-900/80 to-slate-900 border border-emerald-500/30 p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                 
                 <h3 className="text-emerald-400 font-medium mb-4 text-sm uppercase tracking-widest">Estimated Market Value</h3>
                 <div className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-2 drop-shadow-sm">
                   {formatCurrency(result.price)}
                 </div>
                 <div className="text-emerald-500/60 text-xs">Based on {data.length} historical records</div>
               </div>

               {/* Reasoning Card */}
               <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg">
                 <h4 className="text-indigo-400 font-semibold mb-4 flex items-center">
                   <div className="p-1.5 bg-indigo-500/10 rounded mr-2">
                     <Sparkles size={14} />
                   </div>
                   AI Analysis
                 </h4>
                 <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-slate-700">
                   {result.reasoning}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictor;
