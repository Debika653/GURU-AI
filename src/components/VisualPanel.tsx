import React, { useState } from 'react';
import { VisualSpec } from '../types';
import { Layers, Info, Sparkles } from 'lucide-react';

interface VisualPanelProps {
  visualSpec?: VisualSpec;
  topic?: string;
}

export const VisualPanel: React.FC<VisualPanelProps> = ({ visualSpec, topic }) => {
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);

  if (!visualSpec) {
    return (
      <div
        id="visual-board-empty"
        className="flex flex-col items-center justify-center p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface-board)] min-h-[300px] text-center shadow-panel"
      >
        <Layers className="w-8 h-8 text-[var(--text-muted)] mb-2" />
        <h4 className="text-sm font-mono uppercase tracking-widest text-[var(--text-secondary)]">
          VISUAL BOARD
        </h4>
        <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
          Dynamic diagrams, force vectors, equations, or code flows will render here as the lesson progresses.
        </p>
      </div>
    );
  }

  const { title, type, elements = [], formula, keyTakeaway } = visualSpec;

  const renderInteractiveDiagram = () => {
    switch (type) {
      case 'physics-force':
        return (
          <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col items-center justify-center overflow-hidden">
            {/* Engineering Grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <svg viewBox="0 0 400 200" className="w-full h-full max-w-md select-none">
              <defs>
                <marker id="arrowUp" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M 0 8 L 4 0 L 8 8 Z" fill="var(--primary)" />
                </marker>
                <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M 0 0 L 4 8 L 8 0 Z" fill="var(--danger)" />
                </marker>
                <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill="var(--success)" />
                </marker>
                <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M 8 0 L 0 4 L 8 8 Z" fill="var(--warning)" />
                </marker>
              </defs>

              {/* Surface Platform */}
              <rect x="50" y="140" width="300" height="6" rx="3" fill="var(--border-strong)" />
              {/* Floor Hatching */}
              <line x1="70" y1="146" x2="60" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" />
              <line x1="120" y1="146" x2="110" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" />
              <line x1="170" y1="146" x2="160" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" />
              <line x1="220" y1="146" x2="210" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" />
              <line x1="270" y1="146" x2="260" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" />
              <line x1="320" y1="146" x2="310" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" />

              {/* Object Block */}
              <rect x="160" y="80" width="80" height="60" rx="8" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
              <text x="200" y="115" fill="currentColor" className="text-[var(--text-primary)]" fontSize="13" fontWeight="bold" textAnchor="middle">
                Mass (m)
              </text>

              {/* Normal Force Vector (Up) */}
              <line x1="200" y1="80" x2="200" y2="28" stroke="var(--primary)" strokeWidth="2.5" markerEnd="url(#arrowUp)" />
              <text x="208" y="42" fill="var(--primary)" fontSize="11" fontWeight="600">
                Fn (Normal)
              </text>

              {/* Gravity Force Vector (Down) */}
              <line x1="200" y1="140" x2="200" y2="192" stroke="var(--danger)" strokeWidth="2.5" markerEnd="url(#arrowDown)" />
              <text x="208" y="180" fill="var(--danger)" fontSize="11" fontWeight="600">
                Fg (Gravity)
              </text>

              {/* Applied Force Vector (Right) */}
              <line x1="240" y1="110" x2="310" y2="110" stroke="var(--success)" strokeWidth="2.5" markerEnd="url(#arrowRight)" />
              <text x="315" y="114" fill="var(--success)" fontSize="11" fontWeight="600">
                F_net
              </text>

              {/* Balance rule */}
              <text x="200" y="20" fill="var(--text-muted)" fontSize="10" fontStyle="italic" textAnchor="middle">
                Equilibrium: ΣF = 0 (velocity remains constant)
              </text>
            </svg>
          </div>
        );

      case 'formula-graph':
        return (
          <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col items-center justify-center">
            <svg viewBox="0 0 380 190" className="w-full h-full select-none">
              {/* Axes */}
              <line x1="40" y1="160" x2="350" y2="160" stroke="var(--text-muted)" strokeWidth="1.5" />
              <line x1="40" y1="160" x2="40" y2="20" stroke="var(--text-muted)" strokeWidth="1.5" />
              <text x="345" y="175" fill="var(--text-muted)" fontSize="10" fontMono="true">Mass (m)</text>
              <text x="15" y="25" fill="var(--text-muted)" fontSize="10" fontMono="true">Acc (a)</text>

              {/* Curve: a = F/m */}
              <path
                d="M 50 40 Q 90 120, 330 150"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Points */}
              <circle cx="80" cy="78" r="5" fill="var(--primary)" />
              <text x="92" y="75" fill="currentColor" className="text-[var(--text-primary)]" fontSize="10" fontWeight="bold">Low Mass: High a</text>

              <circle cx="260" cy="142" r="5" fill="var(--warning)" />
              <text x="210" y="132" fill="currentColor" className="text-[var(--text-primary)]" fontSize="10" fontWeight="bold">High Mass: Low a</text>

              {/* Formula Badge inside Canvas */}
              <rect x="180" y="30" width="140" height="32" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />
              <text x="250" y="51" fill="var(--primary)" fontSize="12" fontWeight="bold" textAnchor="middle" fontMono="true">
                a = F / m
              </text>
            </svg>
          </div>
        );

      case 'vector-diagram':
        return (
          <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col items-center justify-center">
            <svg viewBox="0 0 380 180" className="w-full h-full select-none">
              <rect x="70" y="65" width="80" height="50" rx="8" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
              <text x="110" y="95" fill="currentColor" className="text-[var(--text-primary)]" fontSize="12" fontWeight="bold" textAnchor="middle">
                Body A
              </text>

              <rect x="230" y="65" width="80" height="50" rx="8" fill="var(--surface)" stroke="var(--secondary)" strokeWidth="2" />
              <text x="270" y="95" fill="currentColor" className="text-[var(--text-primary)]" fontSize="12" fontWeight="bold" textAnchor="middle">
                Body B
              </text>

              <line x1="150" y1="80" x2="220" y2="80" stroke="var(--primary)" strokeWidth="2.5" markerEnd="url(#arrowRight)" />
              <text x="185" y="72" fill="var(--primary)" fontSize="10" fontWeight="600" textAnchor="middle">
                F_(A on B)
              </text>

              <line x1="230" y1="100" x2="160" y2="100" stroke="var(--secondary)" strokeWidth="2.5" markerEnd="url(#arrowLeft)" />
              <text x="195" y="115" fill="var(--secondary)" fontSize="10" fontWeight="600" textAnchor="middle">
                F_(B on A)
              </text>

              <text x="190" y="160" fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontWeight="500">
                Equal magnitude • Opposite direction • Two distinct bodies
              </text>
            </svg>
          </div>
        );

      case 'biology-process':
        return (
          <div className="relative w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 flex flex-col items-center justify-center">
            <svg viewBox="0 0 380 180" className="w-full h-full select-none">
              <ellipse cx="190" cy="90" rx="170" ry="75" fill="var(--surface)" stroke="var(--success)" strokeWidth="2" />
              <rect x="65" y="60" width="80" height="60" rx="10" fill="var(--surface-elevated)" stroke="var(--success)" strokeWidth="1.5" />
              <text x="105" y="85" fill="var(--success)" fontSize="11" fontWeight="bold" textAnchor="middle">
                Thylakoid
              </text>
              <text x="105" y="102" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
                Light Reaction
              </text>

              <circle cx="280" cy="90" r="38" fill="var(--surface-elevated)" stroke="var(--primary)" strokeWidth="1.5" />
              <text x="280" y="88" fill="var(--primary)" fontSize="11" fontWeight="bold" textAnchor="middle">
                Stroma
              </text>
              <text x="280" y="103" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">
                Calvin Cycle
              </text>

              <path d="M 145 75 Q 210 60, 240 75" fill="none" stroke="var(--warning)" strokeWidth="2" strokeDasharray="3 3" />
              <text x="190" y="62" fill="var(--warning)" fontSize="9" textAnchor="middle">ATP + NADPH</text>

              <path d="M 240 105 Q 210 120, 145 105" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="190" y="125" fill="var(--text-muted)" fontSize="9" textAnchor="middle">ADP + NADP+</text>
            </svg>
          </div>
        );

      case 'code-execution':
        return (
          <div className="w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 font-mono text-xs overflow-x-auto text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-sans">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--danger)]" />
                <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                <span className="ml-2 font-mono">ComponentState.tsx</span>
              </span>
              <span className="text-[var(--primary)] font-mono">Execution Flow</span>
            </div>
            <pre className="leading-relaxed text-[var(--text-secondary)]">
              <span className="text-[var(--primary)]">const</span> [<span className="text-[var(--text-primary)]">count</span>, <span className="text-[var(--secondary)]">setCount</span>] = useState(0);<br />
              <span className="text-[var(--primary)]">function</span> <span className="text-[var(--secondary)]">handleClick</span>() &#123;<br />
              &nbsp;&nbsp;<span className="text-[var(--text-muted)]">// Snapshot captured in current execution frame</span><br />
              &nbsp;&nbsp;<span className="text-[var(--secondary)]">setCount</span>(count + 1); <span className="text-[var(--text-muted)]">// queue update</span><br />
              &nbsp;&nbsp;console.log(count); <span className="text-[var(--warning)]">// still 0 until re-render</span><br />
              &#125;
            </pre>
          </div>
        );

      case 'timeline-sequence':
        return (
          <div className="w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 overflow-y-auto">
            <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--primary)]/40">
              {elements.map((el, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-[var(--surface)] ${
                      el.highlight ? 'bg-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'bg-[var(--text-muted)]'
                    }`}
                  />
                  <div className="flex items-baseline space-x-2">
                    <span className="font-bold text-xs text-[var(--primary)] font-mono">{el.label}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{el.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-56 sm:h-64 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <div className="grid grid-cols-2 gap-2.5">
              {elements.map((el, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveElementIndex(idx)}
                  className={`p-3 rounded-xl border text-xs transition cursor-pointer ${
                    el.highlight
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="font-semibold text-[var(--text-primary)]">{el.label}</div>
                  {el.value && <div className="text-xs text-[var(--primary)] mt-1 font-mono">{el.value}</div>}
                  {el.state && <div className="text-[10px] text-[var(--text-muted)] mt-0.5 capitalize">{el.state}</div>}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      id="visual-board"
      className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-board)] p-5 sm:p-6 shadow-panel space-y-3"
    >
      {/* Board Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            VISUAL BOARD
          </span>
          <span className="text-xs font-serif font-medium text-[var(--text-primary)] pl-1">
            • {title}
          </span>
        </div>

        {formula && (
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--primary)] font-semibold">
            {formula}
          </span>
        )}
      </div>

      {/* Main Visual Board Canvas */}
      <div className="w-full">
        {renderInteractiveDiagram()}
      </div>

      {/* Compact Core Takeaway */}
      {keyTakeaway && (
        <div className="pt-2 flex items-center space-x-2 text-xs text-[var(--text-secondary)]">
          <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--primary)] shrink-0">
            TAKEAWAY:
          </span>
          <span className="text-xs leading-relaxed">{keyTakeaway}</span>
        </div>
      )}
    </div>
  );
};
