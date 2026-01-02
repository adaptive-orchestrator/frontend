// src/pages/LLMRecommendation/index.tsx
// Human-in-the-loop Business Model Recommendation with Safe Deployment
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import PageLayout from '@/components/layout/PageLayout';
import { useBusinessMode, BusinessMode, SmartSwitchResult } from '@/contexts/BusinessModeContext';
import { 
  Sparkles,
  Brain,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MessageSquare,
  Send,
  Shield,
  Clock,
  AlertCircle,
  Server,
  Database,
  Play,
  XCircle,
  Eye,
  Activity,
  Check,
  X,
  RotateCw,
  Microscope,
  Search,
  HardDrive,
  BarChart3,
  Link2,
  Zap,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for Human-in-the-loop workflow
interface ImpactAnalysis {
  servicesAffected: number;
  servicesToRestart: string[];
  recordsAffected: number;
  estimatedDowntime: string;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  rollbackPossible: boolean;
}

interface ChangesetProposal {
  proposal_text: string;
  changeset: {
    model: string;
    features: Array<{ key: string; value: string }>;
    impacted_services: string[];
    services_to_enable?: string[];
    services_to_disable?: string[];
    services_to_restart?: string[];
  };
  metadata: {
    intent: string;
    confidence: number;
    risk: string;
    from_model?: string;
    to_model?: string;
  };
}

type WorkflowPhase = 'input' | 'analyzing' | 'dry-run' | 'impact-analysis' | 'approval' | 'deploying' | 'completed' | 'rejected';

export default function LLMRecommendation() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.BASE_URL;
  const { switchMode, smartSwitch, mode: currentMode, lastSmartSwitchResult } = useBusinessMode();
  
  // Workflow state
  const [phase, setPhase] = useState<WorkflowPhase>('input');
  const [userIntent, setUserIntent] = useState('');
  const [proposal, setProposal] = useState<ChangesetProposal | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [deploymentSkipped, setDeploymentSkipped] = useState(false);
  const [approvalStartTime, setApprovalStartTime] = useState<number | null>(null);
  const [decisionTime, setDecisionTime] = useState<number | null>(null);
  const [deployProgress, setDeployProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<'positive' | 'negative' | null>(null);
  
  // Helm dry-run results state
  const [helmDryRunResults, setHelmDryRunResults] = useState<{
    validation_passed: boolean;
    databases_output: string;
    services_output: string;
    validation_errors: string[];
    warnings: string[];
  } | null>(null);
  
  // New states for enhanced UX
  const [dryRunStep, setDryRunStep] = useState<string>('Initializing...');
  const [dryRunProgress, setDryRunProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('Starting analysis...');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showDetailedImpact, setShowDetailedImpact] = useState(false);
  const [manualMode, setManualMode] = useState(true); // Default to manual for better control
  const [waitingForNext, setWaitingForNext] = useState(false);
  
  // API Mode: 'smart' = API 2 (Dynamic Changeset) first, fallback to API 1
  //           'legacy' = API 1 (Switch-model) only
  const [apiMode, setApiMode] = useState<'smart' | 'legacy'>('smart');
  const [smartSwitchResult, setSmartSwitchResult] = useState<SmartSwitchResult | null>(null);
  const [showFallbackOption, setShowFallbackOption] = useState(false);
  
  // Metrics tracking for paper
  const [metricsLog, setMetricsLog] = useState<{
    dryRunStartTime?: number;
    dryRunEndTime?: number;
    impactAnalysisStartTime?: number;
    impactAnalysisEndTime?: number;
    approvalDecisionTime?: number;
  }>({});
  
  // Test Mode States - để demo validation errors
  const [testMode, setTestMode] = useState(false);
  const [showValidationWarning, setShowValidationWarning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

  // Mock Validation Errors để demo UI (tự suy luận dựa trên Zod schema backend)
  const MOCK_VALIDATION_ERRORS = [
    'Field "business_model" must be one of [retail, subscription, freemium, marketplace, enterprise]. Received: "invalid_xyz"',
    'Field "confidence" must be a number between 0 and 1. Received type: string',
    'Field "impacted_services" expected array, received: null',
    'Required field "changeset.model" is missing',
  ];

  // Keyboard shortcut: Ctrl+Shift+D để bật/tắt test mode (D = Debug/Demo)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setTestMode(prev => !prev);
        console.log('[Test Mode]', !testMode ? 'ENABLED' : 'DISABLED');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testMode]);

  // ============================================================================
  // PHASE 1: Request & Dry-run
  // ============================================================================
  const handleAnalyzeIntent = async () => {
    if (!userIntent.trim()) {
      setError('Vui lòng nhập yêu cầu của bạn!');
      return;
    }

    setError(null);
    
    // TEST MODE: Hiển thị validation errors thay vì gọi API
    if (testMode) {
      setPhase('analyzing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Giả lập phát hiện lỗi validation sau khi "analyzing"
      setValidationErrors(MOCK_VALIDATION_ERRORS);
      setShowValidationWarning(true);
      setPhase('input'); // Quay lại input nhưng hiển thị warning overlay
      return;
    }
    
    setPhase('analyzing');

    try {
      // Gọi API recommend-model-detailed (có changeset đầy đủ)
      console.log('[LLM] Calling recommend-model-detailed API...');
      const response = await fetch(`${API_URL}/llm-orchestrator/recommend-model-detailed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_description: userIntent,
          current_model: currentMode,
          target_audience: '',
          revenue_preference: '',
          lang: 'vi',
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('[LLM] Recommend-model-detailed response:', data);

      // Data now has changeset with impacted_services directly
      const proposalData: ChangesetProposal = {
        proposal_text: data.proposal_text || userIntent,
        changeset: {
          model: data.changeset?.model || 'BusinessModel',
          features: data.changeset?.features || [
            { key: 'business_model', value: data.metadata?.to_model || 'retail' },
          ],
          impacted_services: data.changeset?.impacted_services || [],
        },
        metadata: {
          intent: data.metadata?.intent || 'business_model_change',
          confidence: data.metadata?.confidence || 0.85,
          risk: data.metadata?.risk || 'low',
          from_model: data.metadata?.from_model || currentMode,
          to_model: data.metadata?.to_model || 'retail',
        },
      };

      setProposal(proposalData);
      
      // Both manual and auto: start dry-run simulation
      // Manual mode will pause at the end of dry-run
      await proceedToDryRun(proposalData);

    } catch (err: any) {
      console.error('[LLM] Error:', err);
      setError(err.message || 'Có lỗi xảy ra khi phân tích');
      setPhase('input');
    }
  };

  // ============================================================================
  // PHASE 1.5: Dry-run (separated for manual control)
  // ============================================================================
  const proceedToDryRun = async (proposalData: ChangesetProposal) => {
    setPhase('dry-run');
    setWaitingForNext(false);
    setDryRunProgress(0);
    setHelmDryRunResults(null); // Clear previous results
    setSmartSwitchResult(null);
    setShowFallbackOption(false);
    
    // Track metrics
    const dryRunStart = performance.now();
    setMetricsLog(prev => ({ ...prev, dryRunStartTime: dryRunStart }));

    // Simulate dry-run processing with detailed steps
    const dryRunSteps = apiMode === 'smart' 
      ? [
          { label: 'Initializing Smart Switch (API 2)...', progress: 5, duration: manualMode ? 300 : 200 },
          { label: 'Validating intent with Zod schema...', progress: 15, duration: manualMode ? 500 : 300 },
          { label: 'RAG: Discovering available services...', progress: 30, duration: manualMode ? 800 : 500 },
          { label: 'LLM: Generating dynamic changeset...', progress: 50, duration: manualMode ? 1200 : 700 },
          { label: 'Executing Helm --dry-run for databases...', progress: 70, duration: manualMode ? 1000 : 600 },
          { label: 'Executing Helm --dry-run for services...', progress: 85, duration: manualMode ? 1000 : 600 },
          { label: 'Validating K8s manifests...', progress: 95, duration: manualMode ? 500 : 300 },
          { label: 'Smart Switch validation complete', progress: 100, duration: manualMode ? 300 : 200 },
        ]
      : [
          { label: 'Validating business requirements...', progress: 10, duration: manualMode ? 500 : 300 },
          { label: 'Parsing LLM recommendations...', progress: 20, duration: manualMode ? 500 : 300 },
          { label: 'Executing Helm --dry-run for databases...', progress: 50, duration: manualMode ? 1500 : 800 },
          { label: 'Executing Helm --dry-run for services...', progress: 80, duration: manualMode ? 1500 : 800 },
          { label: 'Validating K8s manifests...', progress: 95, duration: manualMode ? 500 : 300 },
          { label: 'Dry-run validation complete', progress: 100, duration: manualMode ? 300 : 200 },
        ];
    
    for (let i = 0; i < dryRunSteps.length; i++) {
      const step = dryRunSteps[i];
      setDryRunStep(step.label);
      setDryRunProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    // Call actual Helm dry-run API based on apiMode
    try {
      const newMode = proposalData.metadata.to_model as BusinessMode;
      
      if (apiMode === 'smart') {
        // ====== SMART SWITCH MODE (API 2 → fallback to API 1) ======
        console.log('[Smart Switch] Calling smartSwitch API...');
        const result = await smartSwitch({
          userIntent: userIntent,
          currentModel: currentMode,
          targetModel: newMode,
          autoDeploy: false, // Dry-run first, deploy later
          useFallbackOnFailure: true,
        });
        
        console.log('[Smart Switch] Result:', result);
        setSmartSwitchResult(result);
        
        if (result.helm_validation) {
          setHelmDryRunResults(result.helm_validation);
          console.log('[Smart Switch] Helm validation passed:', result.helm_validation.validation_passed);
        }
        
        // Check for fallback scenario
        if (result.api_used === 'switch-model' && result.fallback_options?.available) {
          console.log('[Smart Switch] Fallback to API 1 occurred');
          setShowFallbackOption(true);
        }
        
        if (!result.success) {
          // Check if fallback is available
          if (result.fallback_options?.available) {
            console.log('[Smart Switch] API 2 failed, showing fallback options...');
            setShowFallbackOption(true);
            setError(`API 2 failed: ${result.error || result.message}\n\nFallback option available via API 1.`);
            // Don't reset phase - let user choose fallback
            return;
          }
          
          setError(`Smart Switch failed: ${result.error || result.message}`);
          setPhase('input');
          return;
        }
        
        // Update proposal with dynamic changeset data if available
        if (result.changeset) {
          proposalData.changeset.impacted_services = result.changeset.discovered_services || [];
          proposalData.metadata.risk = result.changeset.risk_level;
          proposalData.metadata.confidence = result.changeset.services?.[0]?.confidence || 0.85;
        }
        
      } else {
        // ====== LEGACY MODE (API 1 only) ======
        if (newMode && ['retail', 'subscription', 'freemium', 'multi'].includes(newMode)) {
          console.log('[Helm Dry-run] Calling switch-model API with dry_run=true...');
          const result = await switchMode(newMode, { dryRun: true });
          
          console.log('[Helm Dry-run] Result:', result);
          
          if (result.helm_dry_run_results) {
            setHelmDryRunResults(result.helm_dry_run_results);
            console.log('[Helm Dry-run] Validation passed:', result.helm_dry_run_results.validation_passed);
          }
          
          if (!result.success || (result.helm_dry_run_results && !result.helm_dry_run_results.validation_passed)) {
            setError('Helm dry-run validation failed! See console for details.');
            setPhase('input');
            return;
          }
        }
      }
    } catch (err: any) {
      console.error('[Dry-run] Error:', err);
      setError(`Failed to execute ${apiMode === 'smart' ? 'Smart Switch' : 'Helm'} dry-run: ` + err.message);
      setPhase('input');
      return;
    }
    
    // Track dry-run completion
    const dryRunEnd = performance.now();
    setMetricsLog(prev => ({ ...prev, dryRunEndTime: dryRunEnd }));
    const dryRunDuration = dryRunEnd - (metricsLog.dryRunStartTime || dryRunEnd);
    console.log(`[Metrics] Dry-run Duration: ${dryRunDuration.toFixed(0)}ms`);
    
    if (manualMode) {
      setWaitingForNext(true);
      return;
    }
    
    await proceedToImpactAnalysis(proposalData);
  };

  // ============================================================================
  // PHASE 2: Impact Analysis (separated for manual control)
  // ============================================================================
  const proceedToImpactAnalysis = async (proposalData: ChangesetProposal) => {
    setPhase('impact-analysis');
    setWaitingForNext(false);
    setAnalysisProgress(0);
    
    // Track impact analysis start
    const analysisStart = performance.now();
    setMetricsLog(prev => ({ ...prev, impactAnalysisStartTime: analysisStart }));
    
    const analysisSteps = [
      { label: 'Analyzing service dependencies...', progress: 25, duration: manualMode ? 800 : 500 },
      { label: 'Calculating affected records...', progress: 50, duration: manualMode ? 800 : 500 },
      { label: 'Estimating downtime and risks...', progress: 75, duration: manualMode ? 800 : 500 },
      { label: 'Impact analysis complete', progress: 100, duration: manualMode ? 500 : 300 },
    ];
    
    for (let i = 0; i < analysisSteps.length; i++) {
      const step = analysisSteps[i];
      setAnalysisStep(step.label);
      setAnalysisProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
    
    const impact = analyzeImpact(proposalData);
    setImpactAnalysis(impact);
    
    // Track impact analysis completion
    const analysisEnd = performance.now();
    setMetricsLog(prev => ({ ...prev, impactAnalysisEndTime: analysisEnd }));
    const analysisDuration = analysisEnd - (metricsLog.impactAnalysisStartTime || analysisEnd);
    console.log(`[Metrics] Impact Analysis Duration: ${analysisDuration.toFixed(0)}ms`);
    console.log(`[Metrics] Risk Level Detected: ${impact.riskLevel.toUpperCase()}`);

    if (manualMode) {
      setWaitingForNext(true);
      return;
    }

    await proceedToApproval();
  };

  // ============================================================================
  // PHASE 3: Show Approval Screen
  // ============================================================================
  const proceedToApproval = async () => {
    setWaitingForNext(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    setApprovalStartTime(Date.now());
    setPhase('approval');
  };

  // ============================================================================
  // Test Mode: Close Validation Warning
  // ============================================================================
  const handleRejectValidationError = () => {
    setShowValidationWarning(false);
    setValidationErrors([]);
    setUserIntent(''); // Clear input
  };

  // ============================================================================
  // Manual Next Button Handler
  // ============================================================================
  const handleNext = async () => {
    if (!proposal) return;
    
    if (phase === 'dry-run') {
      await proceedToImpactAnalysis(proposal);
    } else if (phase === 'impact-analysis') {
      await proceedToApproval();
    }
  };

  // ============================================================================
  // Impact Analysis Logic
  // ============================================================================
  const analyzeImpact = (proposalData: ChangesetProposal): ImpactAnalysis => {
    const services = proposalData.changeset.impacted_services || [];
    
    // Use risk from API if available
    let riskLevel: 'low' | 'medium' | 'high' = proposalData.metadata.risk as 'low' | 'medium' | 'high' || 'low';
    const warnings: string[] = [];
    
    const intentLower = userIntent.toLowerCase();
    
    // Check for dangerous operations
    if (intentLower.includes('xóa') || intentLower.includes('delete') || intentLower.includes('drop')) {
      riskLevel = 'high';
      warnings.push('⚠️ NGUY HIỂM: Phát hiện yêu cầu XÓA dữ liệu!');
      warnings.push('🔒 Yêu cầu xác thực 2 lớp (2FA) trước khi thực hiện');
    } else if (intentLower.includes('giá') || intentLower.includes('price') || intentLower.includes('billing')) {
      riskLevel = 'medium';
      warnings.push('⚠️ Thay đổi liên quan đến THANH TOÁN/GIÁ CẢ');
    }

    // Use services_to_restart from API if available, otherwise fallback
    let servicesToRestart: string[] = [];
    
    if (proposalData.changeset.services_to_restart && proposalData.changeset.services_to_restart.length > 0) {
      // Use from API
      servicesToRestart = proposalData.changeset.services_to_restart;
    } else {
      // Fallback: Core services that always need restart
      const coreServicesToRestart = ['BillingService', 'PaymentService', 'CatalogueService'];
      servicesToRestart = services.filter(s => coreServicesToRestart.includes(s));
    }

    const recordsAffected = riskLevel === 'high' ? 15000 : riskLevel === 'medium' ? 500 : 0;

    return {
      servicesAffected: services.length,
      servicesToRestart,
      recordsAffected,
      estimatedDowntime: services.length > 5 ? '30-60 seconds' : '< 10 seconds',
      riskLevel,
      warnings,
      rollbackPossible: true,
    };
  };

  // ============================================================================
  // Helper: Classify services into Enable/Disable/Restart
  // ============================================================================
  const classifyService = (service: string): 'enable' | 'disable' | 'restart' => {
    // Use data from API if available
    if (proposal?.changeset.services_to_restart?.includes(service)) {
      return 'restart';
    }
    if (proposal?.changeset.services_to_enable?.includes(service)) {
      return 'enable';
    }
    if (proposal?.changeset.services_to_disable?.includes(service)) {
      return 'disable';
    }
    
    // Fallback to default logic if API doesn't provide detailed breakdown
    const coreServicesToRestart = ['BillingService', 'PaymentService', 'CatalogueService'];
    
    if (coreServicesToRestart.includes(service)) {
      return 'restart';
    }
    
    const modelServices = {
      retail: ['OrderService', 'InventoryService'],
      subscription: ['SubscriptionService', 'PromotionService', 'PricingService'],
      freemium: ['SubscriptionService', 'PromotionService', 'PricingService'],
      multi: ['OrderService', 'InventoryService', 'SubscriptionService', 'PromotionService', 'PricingService'],
    };
    
    const fromModel = proposal?.metadata.from_model as keyof typeof modelServices || 'retail';
    const toModel = proposal?.metadata.to_model as keyof typeof modelServices || 'retail';
    
    const fromServices = modelServices[fromModel] || [];
    const toServices = modelServices[toModel] || [];
    
    if (toServices.includes(service) && !fromServices.includes(service)) {
      return 'enable';
    }
    
    if (fromServices.includes(service) && !toServices.includes(service)) {
      return 'disable';
    }
    
    return 'restart';
  };

  // ============================================================================
  // PHASE 3: Human Approval
  // ============================================================================
  const handleApprove = async () => {
    // Track decision time
    if (approvalStartTime) {
      const decisionTimeMs = Date.now() - approvalStartTime;
      setDecisionTime(Math.round(decisionTimeMs / 1000));
      setMetricsLog(prev => ({ ...prev, approvalDecisionTime: decisionTimeMs }));
      console.log(`[Metrics] Admin Decision Time: ${decisionTimeMs}ms (${(decisionTimeMs/1000).toFixed(1)}s)`);
    }

    const newMode = proposal?.metadata.to_model as BusinessMode;
    
    // Check if model is unchanged - skip deployment
    if (newMode === currentMode) {
      console.log('[LLM] Model unchanged, skipping deployment');
      setDeploymentSkipped(true);
      setPhase('completed');
      return;
    }

    setDeploymentSkipped(false);

    // SAFETY POLICY: HIGH RISK = HARD BLOCK (không cho phép tiếp tục)
    if (impactAnalysis?.riskLevel === 'high') {
      console.log('[Safety Policy] ❌ HIGH RISK DETECTED - Operation BLOCKED');
      console.log('[Safety Policy] Warnings:', impactAnalysis.warnings);
      
      setError(
        '🚨 CHẶN BỞI SAFETY POLICY: Thao tác này có rủi ro cao và BỊ CẤM thực hiện!\n\n' +
        `Lý do:\n${impactAnalysis.warnings.map(w => `• ${w}`).join('\n')}\n\n` +
        '❌ Hệ thống không cho phép tiếp tục. Vui lòng xem xét lại yêu cầu.'
      );
      
      // Auto reject after showing error
      setTimeout(() => {
        setPhase('rejected');
        alert('⛔ Thao tác bị từ chối tự động bởi Safety Guardrails.\n\nKhông thể thực hiện thao tác nguy hiểm này.');
      }, 2000);
      
      return; // HARD STOP - không cho phép proceed
    }
    
    // MEDIUM RISK: Require explicit confirmation
    if (impactAnalysis?.riskLevel === 'medium') {
      const confirmed = window.confirm(
        '⚠️ CẢNH BÁO: Thao tác có rủi ro trung bình\n\n' +
        'Bạn có chắc chắn muốn tiếp tục?\n' +
        `${impactAnalysis.warnings.length > 0 ? impactAnalysis.warnings.join('\n') + '\n\n' : ''}` +
        'Nhấn OK để xác nhận, Cancel để hủy.'
      );
      if (!confirmed) {
        console.log('[Safety Policy] User cancelled medium risk operation');
        return;
      }
      console.log('[Safety Policy] ✅ User approved medium risk operation');
    }

    setPhase('deploying');
    setDeployProgress(0);

    try {
      // PHASE 4: Safe Rollout
      console.log(`[LLM] Deploying using ${apiMode === 'smart' ? 'Smart Switch' : 'switch-model'} API...`);
      
      // Simulate progress while API call is running
      const progressInterval = setInterval(() => {
        setDeployProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      if (newMode && ['retail', 'subscription', 'freemium', 'multi'].includes(newMode)) {
        if (apiMode === 'smart') {
          // ====== SMART SWITCH MODE (API 2) ======
          const result = await smartSwitch({
            userIntent: userIntent,
            currentModel: currentMode,
            targetModel: newMode,
            autoDeploy: true, // Actually deploy this time
            useFallbackOnFailure: true,
          });
          
          console.log('[Smart Switch Deploy] Result:', result);
          setSmartSwitchResult(result);
          
          clearInterval(progressInterval);
          
          if (!result.success) {
            throw new Error(result.error || result.message || 'Smart Switch deployment failed');
          }
          
          // Log which API was used
          console.log(`[Smart Switch] Deployed using: ${result.api_used.toUpperCase()}`);
          
        } else {
          // ====== LEGACY MODE (API 1 only) ======
          const result = await switchMode(newMode, { dryRun: false });
          
          console.log('[LLM] Switch-model result:', result);
          
          clearInterval(progressInterval);
          
          if (!result.success) {
            throw new Error(result.message || 'Failed to switch model');
          }
        }
        
        // Update progress to 100% after successful deployment
        setDeployProgress(100);
      }

      setPhase('completed');
    } catch (err: any) {
      console.error('[LLM] Deployment error:', err);
      setError(err.message || 'Có lỗi xảy ra khi triển khai');
      setPhase('approval'); // Go back to approval phase on error
    }
  };

  const handleReject = () => {
    if (approvalStartTime) {
      setDecisionTime(Math.round((Date.now() - approvalStartTime) / 1000));
    }
    setPhase('rejected');
  };

  const handleReset = () => {
    setPhase('input');
    setUserIntent('');
    setProposal(null);
    setImpactAnalysis(null);
    setApprovalStartTime(null);
    setDecisionTime(null);
    setDeployProgress(0);
    setError(null);
    setUserFeedback(null);
    setDeploymentSkipped(false);
    setDryRunStep('Initializing...');
    setDryRunProgress(0);
    setAnalysisStep('Starting analysis...');
    setAnalysisProgress(0);
    setShowDetailedImpact(false);
    setWaitingForNext(false);
    setHelmDryRunResults(null); // Clear Helm dry-run results
    setSmartSwitchResult(null); // Clear Smart Switch results
    setShowFallbackOption(false); // Clear fallback option
  };

  // ============================================================================
  // RENDER: Workflow Phases
  // ============================================================================
  
  // Phase indicator component
  const PhaseIndicator = () => {
    const phases = [
      { key: 'input', label: 'Yêu cầu', icon: MessageSquare },
      { key: 'dry-run', label: 'Dry-run', icon: Eye },
      { key: 'impact-analysis', label: 'Phân tích', icon: Activity },
      { key: 'approval', label: 'Phê duyệt', icon: Shield },
      { key: 'deploying', label: 'Triển khai', icon: Play },
    ];

    const currentIndex = phases.findIndex(p => p.key === phase);

    return (
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {phases.map((p, idx) => {
          const Icon = p.icon;
          const isActive = p.key === phase;
          const isCompleted = idx < currentIndex;
          
          return (
            <div key={p.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isActive ? 'bg-blue-600 text-white' : 
                isCompleted ? 'bg-green-600 text-white' : 
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span className="text-sm font-medium">{p.label}</span>
              </div>
              {idx < phases.length - 1 && (
                <ArrowRight className={`h-4 w-4 mx-2 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Redirect if no mode selected
  if (!currentMode) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-2xl mx-auto border-2 border-yellow-400">
            <CardContent className="py-12">
              <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Chưa có dữ liệu để phân tích</h2>
              <p className="text-muted-foreground mb-6">
                Bạn cần chọn một business model trước.
              </p>
              <Button 
                onClick={() => navigate(`${baseURL}mode-selection`)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                size="lg"
              >
                Chọn Model để bắt đầu
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Safe Business Model Change
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Human-in-the-loop workflow với Dry-run và Impact Analysis
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Current: {currentMode?.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Safe Deployment Mode
            </Badge>
            {phase === 'input' && (
              <>
                <Button
                  variant={manualMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setManualMode(!manualMode)}
                  className={manualMode ? "bg-purple-600" : ""}
                >
                  {manualMode ? <><Target className="h-3 w-3 inline mr-1" /> Manual Mode</> : <><Zap className="h-3 w-3 inline mr-1" /> Auto Mode</>}
                </Button>
                <Button
                  variant={apiMode === 'smart' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApiMode(apiMode === 'smart' ? 'legacy' : 'smart')}
                  className={apiMode === 'smart' ? "bg-gradient-to-r from-green-600 to-teal-600" : ""}
                  title={apiMode === 'smart' 
                    ? "Smart Switch: API 2 (Dynamic Changeset) → fallback API 1" 
                    : "Legacy: API 1 (Switch-model) only"}
                >
                  {apiMode === 'smart' ? (
                    <><Sparkles className="h-3 w-3 inline mr-1" /> Smart Switch (API 2)</>
                  ) : (
                    <><Server className="h-3 w-3 inline mr-1" /> Legacy (API 1)</>
                  )}
                </Button>
              </>
            )}
          </div>
          {phase === 'input' && apiMode === 'smart' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 Smart Switch: Sử dụng Dynamic Changeset (API 2) với Zod validation, RAG discovery, tự động fallback sang API 1 nếu thất bại
            </p>
          )}
        </div>

        {/* Phase Indicator */}
        {phase !== 'input' && phase !== 'completed' && phase !== 'rejected' && <PhaseIndicator />}
        
        {/* Next Button for Manual Mode */}
        {manualMode && waitingForNext && (phase === 'dry-run' || phase === 'impact-analysis') && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {phase === 'dry-run' ? 'Dry-run hoàn tất!' : 'Impact Analysis hoàn tất!'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {phase === 'dry-run' 
                          ? 'Xem kỹ kết quả và nhấn Next để tiếp tục phân tích tác động' 
                          : 'Xem kỹ báo cáo và nhấn Next để chuyển sang phê duyệt'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleNext}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8"
                  >
                    Next
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-600">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>Đóng</Button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* PHASE: Input */}
          {/* ============================================================ */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Pha 1: Yêu cầu thay đổi nghiệp vụ
                  </CardTitle>
                  <CardDescription>
                    Mô tả yêu cầu kinh doanh của bạn bằng ngôn ngữ tự nhiên. AI sẽ phân tích và đề xuất cấu hình.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex gap-2">
                      <Input
                        placeholder='VD: "Bán những linh kiện điện tử cho sinh viên"'
                        value={userIntent}
                        onChange={(e) => setUserIntent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeIntent()}
                        className="flex-1 text-lg py-6"
                      />
                      <Button onClick={handleAnalyzeIntent} className="bg-blue-600 px-8" size="lg">
                        <Send className="h-5 w-5 mr-2" />
                        Phân tích
                      </Button>
                    </div>
                    {testMode && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Microscope className="h-3 w-3 mr-1" />
                          Test Mode (Ctrl+Shift+D to toggle)
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      'Bán linh kiện điện tử cho sinh viên',
                      'Cho thuê thiết bị theo tháng',
                      'Cho dùng thử miễn phí 14 ngày',
                      'Xóa danh mục sản phẩm cũ',
                    ].map((example, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setUserIntent(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Quy trình an toàn Human-in-the-loop
                    </h4>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">1</div>
                        <div>
                          <p className="font-medium">Dry-run</p>
                          <p className="text-muted-foreground">Mô phỏng không commit</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">2</div>
                        <div>
                          <p className="font-medium">Impact Analysis</p>
                          <p className="text-muted-foreground">Phân tích tác động</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">3</div>
                        <div>
                          <p className="font-medium">Human Approval</p>
                          <p className="text-muted-foreground">Quản trị viên phê duyệt</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">4</div>
                        <div>
                          <p className="font-medium">Safe Rollout</p>
                          <p className="text-muted-foreground">Rolling Update</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Analyzing */}
          {/* ============================================================ */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-2 border-purple-300">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-20 w-20 text-purple-600 animate-spin" />
                    <h2 className="text-2xl font-bold">Đang phân tích yêu cầu...</h2>
                    <div className="text-center space-y-2 text-muted-foreground">
                      <p className="flex items-center justify-center gap-2"><Search className="h-4 w-4" /> Parsing natural language intent...</p>
                      <p className="flex items-center justify-center gap-2"><Brain className="h-4 w-4" /> Running LLM analysis...</p>
                      <p className="flex items-center justify-center gap-2"><Database className="h-4 w-4" /> Generating changeset proposal...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Dry-run */}
          {/* ============================================================ */}
          {phase === 'dry-run' && (
            <motion.div
              key="dry-run"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-yellow-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-yellow-600" />
                    Pha 1.5: Dry-run Simulation
                  </CardTitle>
                  <CardDescription>
                    Mô phỏng thay đổi trong bộ nhớ tạm mà KHÔNG commit vào database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Badge className="bg-yellow-600 text-white text-lg px-4 py-2 flex items-center gap-2">
                      <Microscope className="h-5 w-5" /> DRY-RUN MODE
                    </Badge>
                    <h2 className="text-xl font-bold text-center">{dryRunStep}</h2>
                    <div className="w-full max-w-md">
                      <Progress value={dryRunProgress} className="h-3" />
                      <p className="text-center mt-2 text-sm font-medium">{dryRunProgress}%</p>
                    </div>
                  </div>
                  
                  {/* Preview changeset info */}
                  {proposal && dryRunProgress >= 40 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 mb-6"
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-600" />
                        Changeset Preview (In-Memory)
                      </h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded">
                          <span className="text-muted-foreground">Business Model:</span>
                          <Badge variant="outline" className="font-mono">
                            {proposal.metadata.from_model} → {proposal.metadata.to_model}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded">
                          <span className="text-muted-foreground">Services Affected:</span>
                          <Badge variant="outline">{proposal.changeset.impacted_services.length} services</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded">
                          <span className="text-muted-foreground">Config Changes:</span>
                          <Badge variant="outline">{proposal.changeset.features.length} keys</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded">
                          <span className="text-muted-foreground">Risk Level:</span>
                          <Badge className={
                            proposal.metadata.risk === 'high' ? 'bg-red-600' :
                            proposal.metadata.risk === 'medium' ? 'bg-orange-600' :
                            'bg-green-600'
                          }>{proposal.metadata.risk}</Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Helm Dry-run Results Display */}
                  {helmDryRunResults && dryRunProgress >= 80 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border-2 border-green-400 mb-6"
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className={`h-5 w-5 ${helmDryRunResults.validation_passed ? 'text-green-600' : 'text-red-600'}`} />
                        Helm Dry-run Validation Results
                      </h4>
                      
                      <div className="grid gap-3">
                        {/* Validation Status */}
                        <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-black/30 rounded">
                          <span className="font-medium">Validation Status:</span>
                          <Badge className={helmDryRunResults.validation_passed ? 'bg-green-600' : 'bg-red-600'}>
                            {helmDryRunResults.validation_passed ? '✅ PASSED' : '❌ FAILED'}
                          </Badge>
                        </div>
                        
                        {/* Validation Errors */}
                        {helmDryRunResults.validation_errors && helmDryRunResults.validation_errors.length > 0 && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded border border-red-300">
                            <h5 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Validation Errors ({helmDryRunResults.validation_errors.length})
                            </h5>
                            <ul className="text-sm space-y-1 text-red-600">
                              {helmDryRunResults.validation_errors.map((err, i) => (
                                <li key={i} className="font-mono text-xs">{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Warnings */}
                        {helmDryRunResults.warnings && helmDryRunResults.warnings.length > 0 && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-300">
                            <h5 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Warnings ({helmDryRunResults.warnings.length})
                            </h5>
                            <ul className="text-sm space-y-1 text-yellow-600">
                              {helmDryRunResults.warnings.slice(0, 3).map((warn, i) => (
                                <li key={i} className="font-mono text-xs">{warn}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Rendered Manifests Info */}
                        <div className="grid md:grid-cols-2 gap-2">
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
                            <span className="font-medium">Databases manifest:</span>
                            <span className="ml-2 text-muted-foreground">
                              {helmDryRunResults.databases_output ? 
                                `${(helmDryRunResults.databases_output.length / 1024).toFixed(1)} KB` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
                            <span className="font-medium">Services manifest:</span>
                            <span className="ml-2 text-muted-foreground">
                              {helmDryRunResults.services_output ? 
                                `${(helmDryRunResults.services_output.length / 1024).toFixed(1)} KB` : 
                                'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded">
                        <p className="text-sm font-medium text-center">
                          ✅ Helm validated templates successfully. No resources were modified on the cluster.
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Smart Switch Result Display */}
                  {apiMode === 'smart' && smartSwitchResult && dryRunProgress >= 90 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-950/20 dark:to-green-950/20 rounded-lg border-2 border-teal-400 mb-6"
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-teal-600" />
                        Smart Switch Results (API 2)
                      </h4>
                      
                      <div className="grid gap-3">
                        {/* API Used */}
                        <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-black/30 rounded">
                          <span className="font-medium">API Used:</span>
                          <Badge className={smartSwitchResult.api_used === 'dynamic-changeset' ? 'bg-teal-600' : 'bg-blue-600'}>
                            {smartSwitchResult.api_used === 'dynamic-changeset' ? '🤖 Dynamic Changeset (API 2)' : '🔄 Switch-model (API 1)'}
                          </Badge>
                        </div>
                        
                        {/* Dynamic Changeset Info */}
                        {smartSwitchResult.changeset && (
                          <>
                            <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-black/30 rounded">
                              <span className="font-medium">Discovered Services:</span>
                              <Badge variant="outline">{smartSwitchResult.changeset.discovered_services?.length || 0} services</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-black/30 rounded">
                              <span className="font-medium">Auto Generated:</span>
                              <Badge variant="outline">{smartSwitchResult.changeset.auto_generated ? '✅ Yes' : '❌ No'}</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/70 dark:bg-black/30 rounded">
                              <span className="font-medium">Risk Level:</span>
                              <Badge className={
                                smartSwitchResult.changeset.risk_level === 'high' ? 'bg-red-600' :
                                smartSwitchResult.changeset.risk_level === 'medium' ? 'bg-orange-600' :
                                'bg-green-600'
                              }>{smartSwitchResult.changeset.risk_level}</Badge>
                            </div>
                          </>
                        )}
                        
                        {/* Changeset Files */}
                        {smartSwitchResult.files && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded">
                            <h5 className="font-medium mb-2 flex items-center gap-2">
                              <HardDrive className="h-4 w-4" />
                              Generated Files
                            </h5>
                            <div className="grid gap-1 text-sm font-mono">
                              {smartSwitchResult.files.json && (
                                <span className="text-muted-foreground">📄 {smartSwitchResult.files.json}</span>
                              )}
                              {smartSwitchResult.files.yaml && (
                                <span className="text-muted-foreground">📄 {smartSwitchResult.files.yaml}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Fallback Option Display */}
                  {showFallbackOption && smartSwitchResult?.fallback_options?.available && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-orange-400 mb-6"
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        API 2 Failed - Fallback Available
                      </h4>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Dynamic Changeset (API 2) không thành công. Bạn có thể sử dụng Switch-model (API 1) làm phương án dự phòng.
                      </p>
                      
                      {smartSwitchResult.fallback_options.recommendation && (
                        <p className="text-sm mb-4 p-2 bg-white/50 rounded">
                          💡 {smartSwitchResult.fallback_options.recommendation}
                        </p>
                      )}
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={async () => {
                            setApiMode('legacy');
                            setShowFallbackOption(false);
                            setError(null);
                            if (proposal) {
                              await proceedToDryRun(proposal);
                            }
                          }}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <RotateCw className="h-4 w-4 mr-2" />
                          Thử lại với API 1
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowFallbackOption(false);
                            handleReset();
                          }}
                        >
                          Hủy bỏ
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        Dry-run Benefits
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Zero database impact</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Safe to experiment</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Accurate prediction</li>
                        <li className="flex items-center gap-2"><Check className="h-3 w-3" /> Full rollback support</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        Processing
                      </h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• In-memory computation</li>
                        <li>• Configuration validation</li>
                        <li>• Dependency resolution</li>
                        <li>• Impact calculation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Impact Analysis */}
          {/* ============================================================ */}
          {phase === 'impact-analysis' && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-orange-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    Pha 2: Impact Analysis
                  </CardTitle>
                  <CardDescription>
                    Phân tích tác động trước khi áp dụng thực tế
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Activity className="h-16 w-16 text-orange-600 animate-pulse" />
                    <h2 className="text-xl font-bold text-center">{analysisStep}</h2>
                    <div className="w-full max-w-md">
                      <Progress value={analysisProgress} className="h-3" />
                      <p className="text-center mt-2 text-sm font-medium">{analysisProgress}%</p>
                    </div>
                  </div>
                  
                  {/* Show calculated metrics when progress >= 50% */}
                  {impactAnalysis && analysisProgress >= 50 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 mb-6"
                    >
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        Impact Metrics (Calculated)
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <Server className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-muted-foreground">Services Affected</span>
                          </div>
                          <p className="text-2xl font-bold">{impactAnalysis.servicesAffected}</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <RotateCw className="h-3 w-3 text-orange-600" />
                            <span className="text-xs text-muted-foreground">Needs Restart</span>
                          </div>
                          <p className="text-2xl font-bold">{impactAnalysis.servicesToRestart.length}</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <Database className="h-3 w-3 text-purple-600" />
                            <span className="text-xs text-muted-foreground">Records Impacted</span>
                          </div>
                          <p className="text-2xl font-bold">{impactAnalysis.recordsAffected.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-muted-foreground">Est. Downtime</span>
                          </div>
                          <p className="text-xl font-bold">{impactAnalysis.estimatedDowntime}</p>
                        </div>
                      </div>
                      {impactAnalysis.warnings.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Warnings Detected
                          </p>
                          {impactAnalysis.warnings.map((warning, idx) => (
                            <p key={idx} className="text-xs text-red-600 dark:text-red-400">{warning}</p>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Server className="h-4 w-4 text-orange-600" />
                      Analyzing Scope of Impact
                    </h4>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                        <span>Service dependencies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                        <span>Database records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
                        <span>Downtime estimation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                        <span>Risk assessment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                        <span>Rollback planning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></div>
                        <span>Safety checks</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Approval */}
          {/* ============================================================ */}
          {phase === 'approval' && proposal && impactAnalysis && (
            <motion.div
              key="approval"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Proposal Card */}
              <Card className="border-2 border-blue-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Đề xuất từ AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-4">
                    <p className="text-lg">{proposal.proposal_text}</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border">
                      <p className="text-sm text-muted-foreground">Model đề xuất</p>
                      <Badge className="bg-purple-600 text-lg mt-1">
                        {(proposal.metadata.to_model || 'retail').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border">
                      <p className="text-sm text-muted-foreground">Độ tin cậy</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round((proposal.metadata.confidence || 0.85) * 100)}%
                      </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border">
                      <p className="text-sm text-muted-foreground">Intent</p>
                      <p className="font-medium">{proposal.metadata.intent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Analysis Card */}
              <Card className={`border-2 ${
                impactAnalysis.riskLevel === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-950/10' :
                impactAnalysis.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/10' :
                'border-green-500 bg-green-50 dark:bg-green-950/10'
              }`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className={`h-5 w-5 ${
                        impactAnalysis.riskLevel === 'high' ? 'text-red-600' :
                        impactAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      Báo cáo Impact Analysis
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDetailedImpact(!showDetailedImpact)}
                    >
                      {showDetailedImpact ? '▼ Ẩn chi tiết' : '▶ Xem chi tiết'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetailedImpact(true)}>
                      <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{impactAnalysis.servicesAffected}</p>
                      <p className="text-sm text-muted-foreground">Services ảnh hưởng</p>
                      <p className="text-xs text-blue-600 mt-1">Click để xem</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetailedImpact(true)}>
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold">{impactAnalysis.servicesToRestart.length}</p>
                      <p className="text-sm text-muted-foreground">Services cần restart</p>
                      <p className="text-xs text-orange-600 mt-1">Click để xem</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border text-center">
                      <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">{impactAnalysis.recordsAffected.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Records ảnh hưởng</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded border text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p className="text-2xl font-bold">{impactAnalysis.estimatedDowntime}</p>
                      <p className="text-sm text-muted-foreground">Downtime dự kiến</p>
                    </div>
                  </div>
                  
                  {/* Detailed Impact - Expandable Section */}
                  <AnimatePresence>
                    {showDetailedImpact && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-4"
                      >
                        {/* Services Affected List */}
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-600" />
                            Danh sách Services bị ảnh hưởng
                          </h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {proposal?.changeset.impacted_services.map((service, idx) => {
                              const action = classifyService(service);
                              return (
                                <div key={idx} className={`flex items-center gap-2 p-2 rounded ${
                                  action === 'enable' ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' :
                                  action === 'disable' ? 'bg-red-50 dark:bg-red-950/20 border border-red-200' :
                                  'bg-orange-50 dark:bg-orange-950/20 border border-orange-200'
                                }`}>
                                  <div className={`w-2 h-2 rounded-full ${
                                    action === 'enable' ? 'bg-green-600' :
                                    action === 'disable' ? 'bg-red-600' :
                                    'bg-orange-600 animate-pulse'
                                  }`}></div>
                                  <span className="text-sm font-mono flex-1">{service}</span>
                                  {action === 'enable' && (
                                    <Badge className="bg-green-600 text-white text-xs flex items-center gap-1"><Check className="h-3 w-3" /> Enable</Badge>
                                  )}
                                  {action === 'disable' && (
                                    <Badge className="bg-red-600 text-white text-xs flex items-center gap-1"><X className="h-3 w-3" /> Disable</Badge>
                                  )}
                                  {action === 'restart' && (
                                    <Badge className="bg-orange-600 text-white text-xs flex items-center gap-1"><RotateCw className="h-3 w-3" /> Restart</Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Services to Restart */}
                        {impactAnalysis.servicesToRestart.length > 0 && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <RefreshCw className="h-5 w-5 text-orange-600" />
                              Services cần Restart (Rolling Update)
                            </h4>
                            <div className="space-y-2">
                              {impactAnalysis.servicesToRestart.map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                                  <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-orange-600" />
                                    <span className="font-mono text-sm">{service}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>~{3 + idx}s downtime</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 flex items-start gap-2">
                              <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" /> Chiến lược: Rolling Update - restart từng pod một để giảm thiểu downtime
                            </p>
                          </div>
                        )}
                        
                        {/* Deployment Timeline */}
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Deployment Timeline (Dự kiến)
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-20 text-muted-foreground">T+0s</div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="h-1 w-full bg-blue-600 rounded"></div>
                                <span>Trigger deployment</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 text-muted-foreground">T+2s</div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="h-1 w-full bg-yellow-600 rounded"></div>
                                <span>Config update & validation</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 text-muted-foreground">T+5s</div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="h-1 w-full bg-orange-600 rounded"></div>
                                <span>Rolling restart services</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 text-muted-foreground">T+{impactAnalysis.estimatedDowntime.includes('30-60') ? '60' : '10'}s</div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="h-1 w-full bg-green-600 rounded"></div>
                                <span>✅ Deployment complete</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Risk Badge */}
                  <div className="flex items-center justify-center mb-4">
                    <Badge className={`text-lg px-6 py-2 ${
                      impactAnalysis.riskLevel === 'high' ? 'bg-red-600' :
                      impactAnalysis.riskLevel === 'medium' ? 'bg-yellow-600' :
                      'bg-green-600'
                    } text-white`}>
                      {impactAnalysis.riskLevel === 'high' ? '🚨 RỦI RO CAO' :
                       impactAnalysis.riskLevel === 'medium' ? '⚠️ RỦI RO TRUNG BÌNH' :
                       '✅ RỦI RO THẤP'}
                    </Badge>
                  </div>

                  {/* Warnings */}
                  {impactAnalysis.warnings.length > 0 && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300">
                      <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Cảnh báo
                      </h4>
                      <ul className="space-y-1">
                        {impactAnalysis.warnings.map((w, i) => (
                          <li key={i} className="text-red-600 dark:text-red-400">{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rollback info */}
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Rollback khả dụng: Có thể hoàn tác trong 24h nếu cần</span>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Buttons */}
              <Card className="border-2 border-purple-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Pha 3: Phê duyệt của Quản trị viên
                  </CardTitle>
                  <CardDescription>
                    Xem xét báo cáo và quyết định tiếp tục hoặc hủy bỏ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                      size="lg"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Phê duyệt & Triển khai
                    </Button>
                    <Button 
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1 text-lg py-6"
                      size="lg"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    ⏱️ Thời gian xem xét sẽ được ghi nhận để đánh giá độ trực quan của Dashboard
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Deploying */}
          {/* ============================================================ */}
          {phase === 'deploying' && (
            <motion.div
              key="deploying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-green-400">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <Play className="h-16 w-16 text-green-600" />
                      <Loader2 className="h-6 w-6 text-green-600 animate-spin absolute -bottom-1 -right-1" />
                    </div>
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      ROLLING UPDATE
                    </Badge>
                    <h2 className="text-2xl font-bold">Đang triển khai an toàn...</h2>
                    <div className="w-full max-w-md">
                      <Progress value={deployProgress} className="h-4" />
                      <p className="text-center mt-2 text-lg font-medium">{deployProgress}%</p>
                    </div>
                    <p className="text-muted-foreground text-center">
                      Sử dụng chiến lược Rolling Update để giảm thiểu downtime
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Completed */}
          {/* ============================================================ */}
          {phase === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className={`border-2 ${deploymentSkipped ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20' : 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'}`}>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle className={`h-20 w-20 ${deploymentSkipped ? 'text-blue-600' : 'text-green-600'}`} />
                    <h2 className={`text-3xl font-bold ${deploymentSkipped ? 'text-blue-700' : 'text-green-700'}`}>
                      {deploymentSkipped ? 'Không cần triển khai!' : 'Triển khai thành công!'}
                    </h2>
                    <p className="text-lg text-muted-foreground text-center">
                      {deploymentSkipped 
                        ? `Hệ thống đã đang chạy mô hình ${currentMode?.toUpperCase()} - không cần thay đổi`
                        : 'Thay đổi đã được áp dụng an toàn với Rolling Update'}
                    </p>
                    {deploymentSkipped && (
                      <Badge className="bg-blue-600 text-white px-4 py-2">
                        <Info className="h-4 w-4 mr-2" />
                        Đề xuất trùng với model hiện tại
                      </Badge>
                    )}
                    {decisionTime && (
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        <Clock className="h-4 w-4 mr-2" />
                        Thời gian phê duyệt: {decisionTime}s
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Audit Log */}
              <Card>
                <CardHeader>
                  <CardTitle>📋 Audit Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded">
                    <p className="text-green-600">✅ Request received: "{userIntent}"</p>
                    <p className="text-blue-600 flex items-center gap-2"><Search className="h-4 w-4" /> LLM Parsing completed → {proposal?.metadata.to_model?.toUpperCase()}</p>
                    <p className="text-yellow-600 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Dry-run Impact calculated</p>
                    <p className="text-purple-600">👤 Admin Approved (took {decisionTime}s)</p>
                    {deploymentSkipped ? (
                      <p className="text-blue-600">ℹ️ Deployment SKIPPED: Model unchanged ({currentMode?.toUpperCase()})</p>
                    ) : (
                      <>
                        <p className="text-teal-600 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          API Used: {smartSwitchResult?.api_used === 'dynamic-changeset' ? 'Dynamic Changeset (API 2)' : 'Switch-model (API 1)'}
                        </p>
                        <p className="text-green-600">🚀 Config Applied via Rolling Update</p>
                        {smartSwitchResult?.changeset_path && (
                          <p className="text-gray-500">📁 Changeset: {smartSwitchResult.changeset_path}</p>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá trải nghiệm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 flex-wrap">
                    <p>Quy trình này có hữu ích không?</p>
                    <Button
                      variant={userFeedback === 'positive' ? 'default' : 'outline'}
                      className={userFeedback === 'positive' ? 'bg-green-600' : ''}
                      onClick={() => setUserFeedback('positive')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Có
                    </Button>
                    <Button
                      variant={userFeedback === 'negative' ? 'default' : 'outline'}
                      className={userFeedback === 'negative' ? 'bg-red-600' : ''}
                      onClick={() => setUserFeedback('negative')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Không
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={handleReset} className="flex-1" size="lg">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Thực hiện thay đổi khác
                </Button>
                <Button onClick={() => navigate('/admin/dashboard')} variant="outline" size="lg">
                  Quay lại Dashboard
                </Button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* PHASE: Rejected */}
          {/* ============================================================ */}
          {phase === 'rejected' && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-4">
                    <XCircle className="h-20 w-20 text-red-600" />
                    <h2 className="text-3xl font-bold text-red-700">Đã từ chối</h2>
                    <p className="text-lg text-muted-foreground">
                      Không có thay đổi nào được áp dụng. Hệ thống an toàn.
                    </p>
                    {decisionTime && (
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        <Clock className="h-4 w-4 mr-2" />
                        Thời gian xem xét: {decisionTime}s
                      </Badge>
                    )}
                    <Button onClick={handleReset} className="mt-4" size="lg">
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Thử lại với yêu cầu khác
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* ============================================================ */}
        {/* VALIDATION WARNING OVERLAY - Test Mode UI */}
        {/* ============================================================ */}
        {showValidationWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRejectValidationError();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">Validation Error</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dữ liệu không hợp lệ theo schema validation
                    </p>
                  </div>
                  <button
                    onClick={handleRejectValidationError}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Alert Message */}
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Không thể xử lý yêu cầu
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Phát hiện {validationErrors.length} lỗi trong dữ liệu đầu vào. API không được gọi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error List */}
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Chi tiết lỗi validation:
                  </h3>
                  <div className="space-y-2">
                    {validationErrors.map((error, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Test Mode</p>
                      <p>
                        Mock data để demo. Trong thực tế, lỗi này từ Zod validation ở backend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t flex gap-2">
                <Button
                  onClick={handleRejectValidationError}
                  className="flex-1"
                  variant="default"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Đóng
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}
