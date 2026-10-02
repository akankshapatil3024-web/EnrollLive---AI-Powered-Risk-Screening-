import React from 'react';
import { X, AlertCircle, CheckCircle2, ShieldCheck, Database, Cpu } from 'lucide-react';
import { DATASET_SPECIFICATIONS, VERIFIED_MODEL_METRICS } from '../../services/mlEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelLimitationsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Machine Learning Model Scope & Limitations</h3>
              <p className="text-xs text-slate-500">Clinical AI governance & algorithmic transparency criteria</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-slate-700">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs leading-relaxed flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Prototype Decision Support Status:</strong> EnrollLive is designed as an assistive clinical screening system. Risk predictions must be interpreted by clinicians alongside direct bedside examination and real-time hemodynamic assessments.
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Primary Dataset & Calibration
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p><span className="font-medium text-slate-900">Source:</span> {DATASET_SPECIFICATIONS.name}</p>
              <p>
                <span className="font-medium text-slate-900">Dataset URL:</span>{' '}
                <a 
                  href={DATASET_SPECIFICATIONS.kaggleUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-700 hover:underline font-mono"
                >
                  {DATASET_SPECIFICATIONS.kaggleUrl} &rarr;
                </a>
              </p>
              <p><span className="font-medium text-slate-900">Cohort Scale:</span> {DATASET_SPECIFICATIONS.totalRecords}</p>
              <p><span className="font-medium text-slate-900">Partitioning:</span> {DATASET_SPECIFICATIONS.trainTestSplit}</p>
              <p><span className="font-medium text-slate-900">Algorithm:</span> {VERIFIED_MODEL_METRICS.algorithm}</p>
              <p><span className="font-medium text-slate-900">Validation Metric:</span> 10-fold cross-validated ROC-AUC of {VERIFIED_MODEL_METRICS.rocAuc}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Explicit Limitations & Guardrails
            </h4>
            <ul className="space-y-2">
              {DATASET_SPECIFICATIONS.modelLimitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
