import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Edit3,
  Focus,
  HelpCircle,
  Info,
  Loader2,
  Maximize2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sun,
  Upload,
  X,
} from 'lucide-react';
import { SAMPLE_SCAN_PRESETS, type SampleScanPreset } from '../data/seedData';
import type {
  WasteCategory,
  WasteClassificationResult,
  WasteScanRecord,
} from '../types/sortsmart';
import { getCategoryVisuals } from '../utils/categoryTheme';
import {
  VALID_WASTE_CATEGORIES,
  canClaimScanPoints,
  computePointsForScan,
  getDefaultBinForCategory,
  validateWasteClassification,
} from '../utils/wasteLogic';

interface WasteScannerViewProps {
  geminiConfigured: boolean | null;
  claimedScanHashes: string[];
  onConfirmDisposal: (scan: WasteScanRecord) => void;
}

async function computeImageHash(base64Data: string): Promise<string> {
  const sample = `${base64Data.length}:${base64Data.slice(0, 128)}:${base64Data.slice(-128)}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(sample);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .slice(0, 12)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `hash-${base64Data.length}-${base64Data.slice(0, 16)}`;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image data.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(blob);
  });
}

export const WasteScannerView: React.FC<WasteScannerViewProps> = ({
  geminiConfigured,
  claimedScanHashes,
  onConfirmDisposal,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [previewDataUrl, setPreviewDataUrl] = React.useState<string | null>(null);
  const [mimeType, setMimeType] = React.useState<string>('image/jpeg');
  const [imageLabel, setImageLabel] = React.useState<string>('');
  const [activePreset, setActivePreset] = React.useState<SampleScanPreset | null>(null);
  const [scanHash, setScanHash] = React.useState<string>('');

  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = React.useState<
    'live-ai' | 'demo-sample' | 'manual-entry' | null
  >(null);
  const [result, setResult] = React.useState<WasteClassificationResult | null>(null);

  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualCategory, setManualCategory] =
    React.useState<WasteCategory>('Recyclable waste');
  const [manualItemName, setManualItemName] = React.useState('');
  const [isManualOverride, setIsManualOverride] = React.useState(false);
  const [justConfirmedId, setJustConfirmedId] = React.useState<string | null>(null);
  const [tipsOpen, setTipsOpen] = React.useState(false);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  React.useEffect(() => {
    if (!tipsOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTipsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tipsOpen]);

  const resetClassificationState = () => {
    setResult(null);
    setAnalysisError(null);
    setAnalysisMode(null);
    setManualOpen(false);
    setIsManualOverride(false);
    setJustConfirmedId(null);
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAnalysisError('Image exceeds 8 MB. Please select a smaller photo.');
      return;
    }
    stopCamera();
    try {
      const dataUrl = await blobToDataUrl(file);
      const hash = await computeImageHash(dataUrl);
      setPreviewDataUrl(dataUrl);
      setMimeType(file.type || 'image/jpeg');
      setImageLabel(file.name);
      setActivePreset(null);
      setScanHash(hash);
      setManualItemName('');
      resetClassificationState();
    } catch {
      setAnalysisError('Could not read the selected image file.');
    }
  };

  const handlePresetClick = async (preset: SampleScanPreset) => {
    stopCamera();
    resetClassificationState();
    setCameraError(null);
    try {
      const res = await fetch(preset.imageUrl);
      if (!res.ok) throw new Error('Unable to load sample image');
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      const hash = await computeImageHash(dataUrl);
      setPreviewDataUrl(dataUrl);
      setMimeType(blob.type || 'image/jpeg');
      setImageLabel(preset.label);
      setActivePreset(preset);
      setScanHash(hash);
      setManualItemName(preset.label);
    } catch {
      setAnalysisError('Could not load the sample image preview.');
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    resetClassificationState();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera capture is not supported in this browser. Please upload an image from your device.'
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch {
      setCameraError(
        'Camera permission was denied or no camera device is available. You can upload an image or pick a sample photo below.'
      );
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setCameraError('Camera stream is still initializing. Please wait a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const hash = await computeImageHash(dataUrl);
    stopCamera();
    setPreviewDataUrl(dataUrl);
    setMimeType('image/jpeg');
    setImageLabel('Camera Capture');
    setActivePreset(null);
    setScanHash(hash);
    setManualItemName('');
    resetClassificationState();
  };

  const analyzeImage = async () => {
    if (!previewDataUrl) {
      setAnalysisError('Upload, capture, or select a sample waste image first.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setJustConfirmedId(null);

    try {
      const response = await fetch('/api/analyze-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewDataUrl,
          mimeType,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setAnalysisError(
          payload?.message ||
            'AI analysis failed. Please try again or classify manually.'
        );
        return;
      }

      const validated = validateWasteClassification(payload?.result);
      if (!validated.valid) {
        setAnalysisError(validated.error);
        return;
      }

      setResult(validated.data);
      setAnalysisMode('live-ai');
      setIsManualOverride(false);
      setManualItemName(validated.data.item);
      if (validated.data.category !== 'Unclear') {
        setManualCategory(validated.data.category);
      }
    } catch {
      setAnalysisError(
        'Network error while reaching the AI classification server. Please retry or use manual/demo options below.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySampleDemoClassification = () => {
    if (!activePreset) return;
    setResult(activePreset.demoClassification);
    setAnalysisMode('demo-sample');
    setAnalysisError(null);
    setIsManualOverride(false);
    setManualItemName(activePreset.demoClassification.item);
    if (activePreset.demoClassification.category !== 'Unclear') {
      setManualCategory(activePreset.demoClassification.category);
    }
  };

  const applyManualClassification = () => {
    const cleanItem = manualItemName.trim() || imageLabel || 'Manually Classified Item';
    const nextResult: WasteClassificationResult = {
      item: cleanItem,
      category: manualCategory,
      reasoning:
        result?.reasoning && !result.isUnclear
          ? `${result.reasoning} (Updated manually to ${manualCategory}.)`
          : `Manually classified by user as ${manualCategory}.`,
      recommendedBin: getDefaultBinForCategory(manualCategory),
      instructions:
        manualCategory === 'Wet waste'
          ? 'Empty food scraps into the Green Compost Bin without plastic bags.'
          : manualCategory === 'Recyclable waste'
            ? 'Rinse/empty item, flatten if bulky, and deposit into the Blue Recyclable Bin.'
            : manualCategory === 'E-waste'
              ? 'Keep out of regular bins and deposit at the Campus E-Waste Drop-Box.'
              : manualCategory === 'Hazardous waste'
                ? 'Seal or wrap safely and place in the Red Domestic Hazardous Bin.'
                : 'Keep dry and deposit into the Blue Dry Waste Bin.',
      specialHandlingRequired:
        manualCategory === 'E-waste' || manualCategory === 'Hazardous waste',
      specialHandlingNote:
        manualCategory === 'E-waste'
          ? 'Tape exposed battery terminals before drop-off.'
          : manualCategory === 'Hazardous waste'
            ? 'Keep sealed and isolated from wet and recyclable waste.'
            : null,
      ecoTip: 'Verifying bin signage before dropping waste prevents batch contamination.',
      confidence: null,
      isUnclear: false,
    };

    setResult(nextResult);
    setAnalysisMode(result ? analysisMode ?? 'manual-entry' : 'manual-entry');
    setIsManualOverride(true);
    setManualOpen(false);
    setAnalysisError(null);
  };

  const activeCategory =
    result && result.category !== 'Unclear' ? result.category : null;
  const pointsAvailable = activeCategory
    ? computePointsForScan(activeCategory, isManualOverride)
    : 0;
  const canClaim = canClaimScanPoints(scanHash, claimedScanHashes);

  const handleConfirm = () => {
    if (!result || result.category === 'Unclear' || !canClaim) return;
    const id = `scan-${Date.now()}`;
    const record: WasteScanRecord = {
      id,
      scanHash,
      item: result.item,
      category: result.category,
      recommendedBin: result.recommendedBin,
      instructions: result.instructions,
      reasoning: result.reasoning,
      ecoTip: result.ecoTip,
      specialHandlingRequired: result.specialHandlingRequired,
      confidence: result.confidence,
      pointsAwarded: pointsAvailable,
      confirmed: true,
      manualOverride: isManualOverride,
      sourceMode: analysisMode ?? 'live-ai',
      timestamp: new Date().toISOString(),
      thumbnailUrl: previewDataUrl ?? undefined,
    };
    onConfirmDisposal(record);
    setJustConfirmedId(id);
  };

  const categoryVisuals = result
    ? getCategoryVisuals(result.category)
    : getCategoryVisuals('Unclear');

  return (
    <div className="space-y-6">
      {/* Scanner Intro Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#172B35]">
            AI Multimodal Waste Scanner
          </h2>
          <p className="text-sm text-[#475569]">
            Upload a waste photo or use your camera. Gemini analyzes the actual image to
            recommend the right campus bin and disposal steps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-xs text-[#475569]">
            {geminiConfigured === true ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#16A36A]">
                <Sparkles className="w-4 h-4" />
                Live Gemini Vision Connected
              </span>
            ) : geminiConfigured === false ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                <Info className="w-4 h-4" />
                API Key Unset · Demo Samples &amp; Manual Mode Ready
              </span>
            ) : (
              <span>Checking AI status...</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setTipsOpen(true)}
            aria-label="Tips"
            aria-haspopup="dialog"
            aria-expanded={tipsOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#172B35] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A36A]"
          >
            <HelpCircle className="w-4 h-4 text-[#16A36A]" />
            <span>Tips</span>
          </button>
        </div>
      </section>

      {/* Main Two-Column Scanner Workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Capture, Upload & Preview */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              1. Capture or Upload Waste Image
            </h3>
            {previewDataUrl && (
              <button
                type="button"
                onClick={() => {
                  setPreviewDataUrl(null);
                  setActivePreset(null);
                  setScanHash('');
                  resetClassificationState();
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
                Clear Photo
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
            aria-label="Upload waste image from device"
          />

          {/* Dropzone / Camera / Preview Box */}
          {cameraActive ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={captureFromCamera}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-sm font-semibold"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-[#475569] hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : previewDataUrl ? (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]">
                <img
                  src={previewDataUrl}
                  alt={imageLabel || 'Selected waste item preview'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-[#172B35]/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-3 p-4 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#A3E635]" />
                    <div className="text-sm font-semibold">
                      Analyzing waste material with Gemini Vision...
                    </div>
                    <div className="text-xs text-slate-200">
                      Checking item type, recyclability, and contamination risk
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#16A36A] hover:bg-[#138A59] disabled:opacity-60 text-white text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Waste with AI</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-[#172B35] whitespace-nowrap"
                >
                  Change Photo
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelected(e.dataTransfer.files?.[0]);
              }}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-4 bg-slate-50/50"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-[#172B35]">
                  Drop a waste photo here, or select an input method
                </div>
                <p className="text-xs text-[#475569]">
                  Supports JPEG, PNG, or WebP up to 8 MB
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#172B35] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  <span>Use Camera</span>
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900"
            >
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Quick Sample Test Photos */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#172B35]">
                Quick Sample Photos for Testing
              </span>
              <span className="text-[11px] text-[#475569]">
                Click to load photo into scanner
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_SCAN_PRESETS.map((preset) => {
                const selected = activePreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`text-left rounded-lg border p-2 transition-colors flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-2 ${
                      selected
                        ? 'border-[#16A36A] bg-emerald-50/40'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.label}
                      referrerPolicy="no-referrer"
                      className="w-16 h-12 sm:w-full sm:h-20 object-cover rounded-md shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#172B35] truncate">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-[#475569] truncate">
                        {preset.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Classification Results & Confirmation */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-display font-semibold text-[#172B35]">
              2. Classification &amp; Disposal Plan
            </h3>
            {analysisMode && (
              <span className="text-xs font-medium text-[#475569]">
                {analysisMode === 'live-ai'
                  ? 'Live Gemini Vision'
                  : analysisMode === 'demo-sample'
                    ? 'Demo Mode — Sample Result (Not Live AI)'
                    : 'Manual Classification'}
              </span>
            )}
          </div>

          {analysisError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3"
            >
              <div className="flex items-start gap-2.5 text-sm text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">AI Analysis Unavailable</div>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                    {analysisError}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activePreset && (
                  <button
                    type="button"
                    onClick={applySampleDemoClassification}
                    className="px-3 py-1.5 rounded-lg bg-[#172B35] text-white text-xs font-semibold hover:bg-slate-800 whitespace-nowrap"
                  >
                    Load Sample Demo Result (Not Live AI)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setManualOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-900 text-xs font-semibold hover:bg-rose-50 whitespace-nowrap"
                >
                  Classify Manually Instead
                </button>
              </div>
            </div>
          )}

          {!result && !analysisError && (
            <div className="py-12 px-4 text-center space-y-3 border border-dashed border-slate-200 rounded-xl bg-slate-50/40">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-[#172B35]">
                Ready to inspect your waste item
              </div>
              <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
                Select or upload an image on the left, then click{' '}
                <strong>Analyze Waste with AI</strong> to see bin placement, handling
                precautions, and Green Points.
              </p>
              {previewDataUrl && (
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  {activePreset && geminiConfigured === false && (
                    <button
                      type="button"
                      onClick={applySampleDemoClassification}
                      className="px-3.5 py-2 rounded-lg bg-[#172B35] text-white text-xs font-semibold"
                    >
                      Preview Sample Demo Classification
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setManualOpen(true)}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[#172B35] text-xs font-medium"
                  >
                    Or Classify Manually
                  </button>
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-5" data-testid="classification-result">
              {analysisMode === 'demo-sample' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Clearly Labelled Demo Mode:</strong> Displaying sample
                    demonstration output for this preset photo because live Gemini API
                    access was not used.
                  </span>
                </div>
              )}

              {/* Primary Result Summary */}
              <div className={`rounded-xl border p-5 space-y-3 ${categoryVisuals.borderColor} ${categoryVisuals.surfaceTint}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#475569]">
                      Identified Item
                    </div>
                    <h4 className="text-xl font-display font-bold text-[#172B35] mt-0.5 text-balance">
                      {result.item}
                    </h4>
                  </div>

                  {result.confidence !== null && !result.isUnclear && (
                    <div className="text-right font-mono tabular-nums shrink-0">
                      <div className="text-[11px] text-[#475569]">Confidence</div>
                      <div className="text-base font-bold text-[#172B35]">
                        {result.confidence}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-[#475569]">Waste Category</div>
                    <div className={`font-display font-bold mt-0.5 ${categoryVisuals.textColor}`}>
                      {result.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#475569]">Recommended Bin</div>
                    <div className="font-semibold text-[#172B35] mt-0.5">
                      {result.recommendedBin}
                    </div>
                  </div>
                </div>
              </div>

              {result.isUnclear && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Unclear Image — Please Retry or Correct Manually</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed">
                    The AI could not confidently identify the object from this image.
                    Retake the photo in better lighting or select the correct category
                    below before confirming disposal.
                  </p>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs font-semibold text-[#172B35]">
                    Why This Category
                  </div>
                  <p className="text-[#475569] mt-0.5 leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#172B35]">
                    Disposal Instructions
                  </div>
                  <p className="text-[#475569] mt-0.5 leading-relaxed">
                    {result.instructions}
                  </p>
                </div>

                {result.specialHandlingRequired && result.specialHandlingNote && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Special Handling Required: </span>
                      <span>{result.specialHandlingNote}</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#475569]">
                  <span className="font-semibold text-[#172B35]">Eco Tip: </span>
                  {result.ecoTip}
                </div>
              </div>

              {/* Action Row: Confirm Disposal / Retry / Correct Category */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {result.category !== 'Unclear' && (
                  <div className="flex flex-wrap items-center gap-3">
                    {canClaim ? (
                      <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-sm font-semibold transition-colors whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Disposal (+{pointsAvailable} Green Points)</span>
                      </button>
                    ) : (
                      <div
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold"
                        data-testid="points-already-claimed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {justConfirmedId
                            ? `Disposal Confirmed · +${pointsAvailable} pts Added`
                            : 'Points Already Claimed for This Scan'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setManualOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-[#172B35]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{manualOpen ? 'Hide Manual Correction' : 'Wrong Category? Correct Manually'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A36A] hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry AI Analysis</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Classification / Override Panel */}
          {manualOpen && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-semibold text-[#172B35]">
                Manual Classification / Correction
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="manual-item-input"
                    className="block text-xs text-[#475569] mb-1"
                  >
                    Item Description
                  </label>
                  <input
                    id="manual-item-input"
                    type="text"
                    value={manualItemName}
                    onChange={(e) => setManualItemName(e.target.value)}
                    placeholder="e.g., Plastic water bottle"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-[#172B35] focus:outline-none focus:border-[#16A36A]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="manual-category-select"
                    className="block text-xs text-[#475569] mb-1"
                  >
                    Waste Category
                  </label>
                  <select
                    id="manual-category-select"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as WasteCategory)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-[#172B35] focus:outline-none focus:border-[#16A36A]"
                  >
                    {VALID_WASTE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#475569] hover:text-[#172B35]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyManualClassification}
                  className="px-4 py-2 rounded-lg bg-[#172B35] hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Apply Classification
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {tipsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B35]/50 backdrop-blur-[1px] p-4"
          onClick={() => setTipsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scanning-tips-title"
            className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="scanning-tips-title"
                  className="text-lg font-display font-bold text-[#172B35]"
                >
                  Helpful Scanning Tips
                </h3>
                <p className="text-xs text-[#475569] mt-0.5">
                  Follow these capture guidelines for sharper AI waste classification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTipsOpen(false)}
                aria-label="Close Helpful Scanning Tips"
                className="p-1.5 rounded-lg text-[#475569] hover:text-[#172B35] hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3.5 first:pt-0 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#172B35]">
                    Bright, Even Lighting
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Use natural daylight or overhead room lighting. Avoid shooting
                    against bright windows or dark shadows that obscure labels and
                    material texture.
                  </p>
                </div>
              </div>

              <div className="py-3.5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <Focus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#172B35]">
                    Clear 45° Angle &amp; Sharp Focus
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Hold your camera at a slight 45° angle above the item so its
                    full silhouette, cap, or printed recycling code stays visible
                    and unblurred.
                  </p>
                </div>
              </div>

              <div className="py-3.5 last:pb-0 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A36A] flex items-center justify-center shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#172B35]">
                    Single-Item Placement
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Center one waste item on a plain surface like a desk or table,
                    and keep mixed trash piles or hands out of the frame.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setTipsOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#16A36A] hover:bg-[#138A59] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
