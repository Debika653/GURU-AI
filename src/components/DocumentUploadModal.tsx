import React, { useState, useRef } from 'react';
import { ApiService } from '../services/apiService';
import { DocumentAnalysisResult } from '../types';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, BookOpen, X, ArrowRight, Loader2 } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAnalyzed: (result: DocumentAnalysisResult, selectedScope: { chapter?: string; section?: string }) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAnalyzed,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const processFile = async (f: File) => {
    setFile(f);
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      let base64Data: string | undefined = undefined;
      let textContent: string | undefined = undefined;

      if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(f);
        });
      } else {
        textContent = await f.text();
      }

      const result = await ApiService.analyzeMaterial({
        fileName: f.name,
        fileType: f.type || 'text/plain',
        base64Data,
        textContent,
      });

      setAnalysisResult(result);
      if (result.chapters?.length > 0) {
        setSelectedChapter(result.chapters[0].title);
      }
    } catch (err: any) {
      console.error('Document analysis failed:', err);
      setErrorMsg(err.message || 'Failed to analyze document. Please try a different file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSamplePhysicsNotes = async () => {
    const mockFile = new File(['Newtonian Mechanics Course Notes'], 'Physics_Ch5_Newtonian_Mechanics.pdf', {
      type: 'application/pdf',
    });
    setFile(mockFile);
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await ApiService.analyzeMaterial({
        fileName: 'Physics_Ch5_Newtonian_Mechanics.pdf',
        fileType: 'application/pdf',
        textContent: "Chapter 5: Force and Motion - I. Inertia, Newton's first law. Net force sigma F = 0 implies v = const. Mass and acceleration F = ma. Action-reaction pairs on different bodies. Free-body force diagrams.",
      });
      setAnalysisResult(result);
      if (result.chapters?.length > 0) {
        setSelectedChapter(result.chapters[0].title);
      }
    } catch (err) {
      console.warn('Sample upload fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceed = () => {
    if (!analysisResult) return;
    onDocumentAnalyzed(analysisResult, {
      chapter: selectedChapter !== 'all' ? selectedChapter : undefined,
    });
    onClose();
  };

  return (
    <div
      id="document-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 shadow-2xl text-[var(--text-primary)] font-sans space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <h2 className="text-lg font-serif font-medium">Upload Learning Material</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ground Guru AI in your textbook, syllabus, or lecture slides.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[var(--danger-subtle)] border border-[var(--danger)]/30 flex items-center space-x-2 text-xs text-[var(--danger)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Large Upload Dropzone Area */}
        {!analysisResult && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3 ${
                isAnalyzing
                  ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                  : 'border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx,.doc,.pptx,.ppt"
                onChange={handleFileChange}
                className="hidden"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center space-y-2 py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
                  <span className="text-sm font-semibold">Analyzing document structure...</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Extracting chapters, key concepts, formulas, and diagrams
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-semibold tracking-wide uppercase font-mono block">
                      DROP YOUR LEARNING MATERIAL
                    </span>
                    <p className="text-xs text-[var(--text-secondary)]">or click to browse from device</p>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-[var(--text-muted)] pt-2 uppercase">
                    <span>PDF</span>
                    <span>•</span>
                    <span>TXT</span>
                    <span>•</span>
                    <span>DOC / DOCX</span>
                    <span>•</span>
                    <span>PPT / PPTX</span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Preset Sample Button */}
            {!isAnalyzing && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs">
                <span className="text-[var(--text-secondary)]">Want to test without uploading a file?</span>
                <button
                  type="button"
                  onClick={loadSamplePhysicsNotes}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)] text-[var(--text-primary)] font-medium transition"
                >
                  Load Sample Physics Notes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Post-Upload View: Document name, Processing status, Detected chapters */}
        {analysisResult && (
          <div className="space-y-5 animate-fadeIn">
            {/* Status & Name */}
            <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-xs font-semibold truncate max-w-xs">{analysisResult.fileName}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-[var(--success)] font-mono font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{analysisResult.summary}</p>
            </div>

            {/* Select Chapter */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] font-mono block">
                SELECT CHAPTER
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedChapter('all')}
                  className={`p-3 rounded-xl border text-left text-xs transition ${
                    selectedChapter === 'all'
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="font-semibold">Entire Document Overview</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Comprehensive multi-chapter scope</div>
                </button>

                {analysisResult.chapters?.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChapter(ch.title)}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      selectedChapter === ch.title
                        ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="truncate font-semibold">{ch.title}</div>
                    {ch.sections && ch.sections.length > 0 && (
                      <div className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                        {ch.sections.join(' • ')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                Upload Different Material
              </button>

              <button
                type="button"
                onClick={handleProceed}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold uppercase tracking-wider transition active:scale-95 shadow-sm"
              >
                <span>START TEACHING</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
