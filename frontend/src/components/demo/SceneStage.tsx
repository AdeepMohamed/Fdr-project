import React from 'react';
import { DemoScene } from './demoScenesData';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  Building,
  Upload,
  RefreshCw,
  History,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  FileCheck2,
  Calendar,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface SceneStageProps {
  scene: DemoScene;
  elapsedInScene: number;
}

export const SceneStage: React.FC<SceneStageProps> = ({ scene, elapsedInScene }) => {
  // Progress fraction 0.0 -> 1.0 within the current scene
  const sceneProgress = Math.min(1, Math.max(0, elapsedInScene / scene.durationSeconds));

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Background Grid Pattern & Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Scene Header Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              color: '#60a5fa',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {scene.chapterBadge}
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {scene.title}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-card)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Mode: <strong style={{ color: '#38bdf8' }}>{scene.portalRole}</strong>
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {scene.timeRange}
          </span>
        </div>
      </div>

      {/* Main Stage Display Area */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* ========================================================
            SCENE 1: INTRODUCTION
           ======================================================== */}
        {scene.id === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
            <div
              style={{
                textAlign: 'center',
                maxWidth: '750px',
                margin: '0 auto',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.875rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(37, 99, 235, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: '#38bdf8',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                <Zap size={15} /> Proposed Solution for AICTE Problem Statement 26265
              </div>

              <h1
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #ffffff 40%, #93c5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.75rem',
                }}
              >
                FDR SmartTrack
              </h1>
              <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Intelligent Security Deposit & Fixed Deposit Receipt Management Portal for Centralized, Automated, and Transparent Administration.
              </p>
            </div>

            {/* 4 Architectural Pillars */}
            <div className="grid-4" style={{ gap: '1rem' }}>
              {[
                { title: 'Centralized Repository', desc: 'Single source of truth for all institution deposits', icon: <Database size={22} color="#38bdf8" /> },
                { title: 'Intelligent OCR', desc: 'Automatic data extraction from bank certificates', icon: <Cpu size={22} color="#a855f7" /> },
                { title: 'Smart Maturity Sentinel', desc: 'Background cron alerts at 30, 15, and 7 days', icon: <Clock size={22} color="#f59e0b" /> },
                { title: 'Immutable Audit Trail', desc: 'Traceable verification, renewal & refund logs', icon: <ShieldCheck size={22} color="#10b981" /> },
              ].map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div style={{ marginBottom: '0.75rem' }}>{p.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 2: PROBLEM IDENTIFICATION
           ======================================================== */}
        {scene.id === 2 && (
          <div className="grid-2" style={{ gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
            {/* Legacy Friction Card */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f87171' }}>
                <AlertCircle size={20} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>The Challenge: Legacy Fragmented Tracking</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: 0, margin: 0, listStyle: 'none' }}>
                {[
                  'Fragmented paper certificates scattered across regional bureaus',
                  'High administrative workload verifying manual physical submissions',
                  'Missed FDR maturity dates resulting in stalled security funds',
                  'Lack of centralized visibility into overdue renewals & release requests',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SmartTrack Solution Card */}
            <div
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#34d399' }}>
                <CheckCircle size={20} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>The Solution: FDR SmartTrack Platform</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: 0, margin: 0, listStyle: 'none' }}>
                {[
                  'Unified Digital Portal for colleges, officials & AICTE leadership',
                  'Automated OCR document parsing with instant discrepancy alerts',
                  'Configurable scheduled alerts (30d, 15d, 7d) prior to maturity',
                  'Cryptographically traceable lineage for renewals and releases',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 3: INSTITUTION PORTAL
           ======================================================== */}
        {scene.id === 3 && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 0.4s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Building size={20} color="#3b82f6" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    Delhi Institute of Technology & Management (AICTE-1-10294821)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authorized Signatory: Prof. Arvind Gupta</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                New Deposit Registration Form
              </span>
            </div>

            <div className="grid-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bank Name</label>
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  State Bank of India
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Branch IFSC</label>
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  SBIN0011562
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Deposit Amount (INR)</label>
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.25rem' }}>
                  ₹ 50,00,000.00
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Issue Date</label>
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  2025-09-20
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Maturity Date (Configured Lock-in)</label>
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  2027-06-30 (10 Years / Approval Lock)
                </div>
              </div>
            </div>

            {/* Document Upload Simulation */}
            <div
              style={{
                border: '2px dashed rgba(59, 130, 246, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <FileText size={28} color="#3b82f6" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  sbi_fdr_deposit_certificate_50lakhs.pdf
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  ✓ Cryptographically Signed & Uploaded (1.8 MB) — Ready for OCR Processing
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 4: OCR AND DISCREPANCY DETECTION
           ======================================================== */}
        {scene.id === 4 && (
          <div className="grid-2" style={{ gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
            {/* Left: Certificate Scan Simulation */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  DOCUMENT SCAN VIEWER
                </span>
                <span style={{ fontSize: '0.6875rem', backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  Tesseract OCR Active
                </span>
              </div>
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  fontFamily: 'serif',
                  flex: 1,
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                }}
              >
                {/* Scanline laser animation */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#a855f7',
                    boxShadow: '0 0 12px #a855f7',
                    animation: 'scanlineAnim 3s ease-in-out infinite',
                  }}
                />
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                  BANK OF BARODA — FIXED DEPOSIT RECEIPT
                </div>
                <div style={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
                  <div><strong>FDR No:</strong> FDR-2024-BOB-7721</div>
                  <div><strong>Branch:</strong> Pitampura, Delhi (BARB0PITAMP)</div>
                  <div style={{ padding: '0.15rem 0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px dashed #ef4444', borderRadius: '3px', marginTop: '0.25rem' }}>
                    <strong>Principal Sum:</strong> ₹ 19,50,000.00 (Nineteen Lakh Fifty Thousand Only)
                  </div>
                  <div><strong>Maturity Date:</strong> 25-Oct-2027</div>
                </div>
              </div>
            </div>

            {/* Right: Discrepancy Comparison Engine */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={18} color="#a855f7" />
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      Automated Discrepancy Engine
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                    1 MISMATCH FLAGGED
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Matching Field */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank Name:</span>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>✓ Bank of Baroda (Match)</span>
                  </div>

                  {/* Discrepant Field */}
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171' }}>Field: Amount Discrepancy</span>
                      <span style={{ fontSize: '0.6875rem', color: '#ef4444', fontWeight: 800 }}>MISMATCH</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Submitted by College: <strong>₹ 20,00,000.00</strong></span>
                      <span>Extracted via OCR: <strong style={{ color: '#f87171' }}>₹ 19,50,000.00</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviewer Action */}
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Action: Discrepancy recorded and dispatched to Institution for rectification.
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: 'none', backgroundColor: '#a855f7', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    Request Correction
                  </button>
                  <button style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    View Scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 5: SMART MATURITY ALERTS
           ======================================================== */}
        {scene.id === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.4s ease' }}>
            <div className="grid-3" style={{ gap: '1rem' }}>
              {/* Alert 30d */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa' }}>30-DAY NOTICE</span>
                  <Clock size={16} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Advance Reminder
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Automated background cron notifies institution & Regional Officer to prepare renewal terms.
                </div>
              </div>

              {/* Alert 15d - Active */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '2px solid rgba(245, 158, 11, 0.5)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24' }}>12 DAYS REMAINING</span>
                  <AlertTriangle size={16} color="#fbbf24" />
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.25rem' }}>
                  HDFC Bank ₹35,00,000
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  FDR-2022-HDFC-3321 matures soon. Urgent renewal action required from College 1.
                </div>
              </div>

              {/* Alert Overdue */}
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '2px solid rgba(244, 63, 94, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fb7185' }}>-6 DAYS OVERDUE</span>
                  <AlertCircle size={16} color="#fb7185" />
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fb7185', marginBottom: '0.25rem' }}>
                  PNB Bank ₹25,00,000
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Matured deposit without renewal submission. Flagged for immediate regulatory escalation.
                </div>
              </div>
            </div>

            {/* Notification Dispatch Feed */}
            <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Automated Notifications Dispatched Across 3 Channels
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    In-Portal Popovers • Verified Email Receipts • AICTE SRO Compliance Alerts
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                ● 100% On-Schedule Delivery
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 6: AICTE OFFICIAL DASHBOARD
           ======================================================== */}
        {scene.id === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.4s ease' }}>
            {/* Top Metric Bar */}
            <div className="grid-4" style={{ gap: '1rem' }}>
              {[
                { label: 'Active FDR Instruments', value: '7 Records', sub: 'Total ₹1.85 Cr', color: '#38bdf8' },
                { label: 'Pending Verification', value: '2 Records', sub: 'Requires Officer Review', color: '#f59e0b' },
                { label: 'Overdue Follow-ups', value: '1 Record', sub: 'Matured & Pending', color: '#f43f5e' },
                { label: 'Total Security Governed', value: '₹ 1.85 Cr', sub: '100% Backed by Bank Scans', color: '#10b981' },
              ].map((m, idx) => (
                <div key={idx} style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 900, color: m.color, marginTop: '0.25rem' }}>{m.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Official Verification Queue Table */}
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                  Central Verification Queue — Priority Actions
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Officer: Priya Venkatesh (SRO)</span>
              </div>
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>FDR Number</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Delhi Inst of Tech</td>
                    <td>FDR-2023-SBI-8910</td>
                    <td style={{ fontWeight: 700 }}>₹ 50,00,000</td>
                    <td><span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>Verified</span></td>
                    <td><button style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.75rem' }}>Inspect</button></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>MIT Pune</td>
                    <td>FDR-2024-CAN-1190</td>
                    <td style={{ fontWeight: 700 }}>₹ 15,00,000</td>
                    <td><span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>Pending Review</span></td>
                    <td><button style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>Verify</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 7: RENEWAL MANAGEMENT
           ======================================================== */}
        {scene.id === 7 && (
          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <RefreshCw size={20} color="#3b82f6" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Parent-Child Renewal Lineage Tracking
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
              {/* Predecessor FDR */}
              <div style={{ flex: 1, padding: '1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(31, 41, 55, 0.7)', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-10px', left: '1rem', backgroundColor: '#64748b', color: '#fff', fontSize: '0.625rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  PREDECESSOR INSTRUMENT
                </span>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  FDR-2020-AXIS-9912
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Axis Bank • Pitampura Branch</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#94a3b8', margin: '0.5rem 0' }}>₹ 45,00,000</div>
                <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', fontWeight: 700 }}>
                  Status: Renewed (Archived)
                </span>
              </div>

              {/* Connecting Flow Arrow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 700 }}>LINKED RENEWAL</span>
                <ArrowRight size={28} color="#38bdf8" />
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>SHA-256 Verified</span>
              </div>

              {/* Successor Renewed FDR */}
              <div style={{ flex: 1, padding: '1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '2px solid rgba(37, 99, 235, 0.4)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-10px', left: '1rem', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.625rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  ACTIVE SUCCESSOR
                </span>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  FDR-2023-SBI-8910
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>State Bank of India • Rohini Branch</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#38bdf8', margin: '0.5rem 0' }}>₹ 50,00,000 (+₹5L Upgrade)</div>
                <span style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                  Status: Verified & Active
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Historical continuity is 100% preserved. AICTE auditors can inspect predecessor certificates at any time.
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 8: RELEASE AND REFUND WORKFLOW
           ======================================================== */}
        {scene.id === 8 && (
          <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck2 size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Structured 3-Stage Release & Refund Pipeline
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                Course Closure NOC Request
              </span>
            </div>

            {/* Stepper Pipeline */}
            <div className="grid-3" style={{ gap: '1rem', margin: '1.25rem 0' }}>
              {/* Stage 1 */}
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#34d399' }}>STAGE 1</div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Document Review
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Verification of student graduation NOC & compliance certificates.
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: '#10b981', fontWeight: 700 }}>
                  ✓ Approved by SRO Officer
                </div>
              </div>

              {/* Stage 2 */}
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#60a5fa' }}>STAGE 2</div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Regulatory Assessment
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Cross-check of AICTE approval terms and penalty-free status.
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 700 }}>
                  ✓ In Progress / Compliant
                </div>
              </div>

              {/* Stage 3 */}
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(31, 41, 55, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)' }}>STAGE 3</div>
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Authority Authorization
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Digital signature and issuance of Bank Release NOC.
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Awaiting Final Sign-off
                </div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Instrument: <strong>FDR-2021-ICICI-4410 (₹10,00,000)</strong></span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Digital NOC Preview Available</span>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 9: SECURITY AND AUDIT TRAIL
           ======================================================== */}
        {scene.id === 9 && (
          <div className="grid-2" style={{ gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
            {/* RBAC Matrix */}
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Lock size={18} color="#a855f7" />
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Enterprise RBAC Architecture
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ padding: '0.625rem', backgroundColor: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#c084fc' }}>Bureau Admin (Central AICTE)</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Full governance, role delegation, regulatory policy override</div>
                </div>
                <div style={{ padding: '0.625rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#60a5fa' }}>AICTE Regional Officer (SRO)</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Document scrutiny, verification sign-off, discrepancy review</div>
                </div>
                <div style={{ padding: '0.625rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#34d399' }}>Institution Authorized Signatory</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>FDR submission, renewal filing, release initiation</div>
                </div>
              </div>
            </div>

            {/* Immutable Audit Log Stream */}
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} color="#3b82f6" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Tamper-Evident Chronology
                  </h4>
                </div>
                <span style={{ fontSize: '0.625rem', color: '#34d399', fontWeight: 700 }}>● SHA-256 SIGNED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { actor: 'Dr. Rajesh Sharma (Admin)', action: 'System Initialized', time: '10 mins ago', status: 'SYS_BOOT' },
                  { actor: 'Priya Venkatesh (SRO)', action: 'Verified FDR-2023-SBI-8910', time: '5 mins ago', status: 'VERIFIED' },
                  { actor: 'Priya Venkatesh (SRO)', action: 'Flagged Discrepancy on BOB-7721', time: '3 mins ago', status: 'DISCREPANCY' },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.action}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.actor} • {item.time}</div>
                    </div>
                    <span style={{ fontSize: '0.625rem', padding: '0.15rem 0.35rem', borderRadius: '3px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontWeight: 700 }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCENE 10: IMPACT AND CONCLUSION
           ======================================================== */}
        {scene.id === 10 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <CheckCircle size={16} /> Ready for AICTE Nationwide Deployment
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Measurable Impact & Value Delivered
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Combining practical automation with secure digital governance for a smarter, more accountable AICTE.
              </p>
            </div>

            {/* Impact Metric Counters */}
            <div className="grid-3" style={{ gap: '1.25rem' }}>
              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8' }}>95%</div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Faster Verification
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  OCR document parsing reduces manual verification cycles from days to minutes.
                </div>
              </div>

              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#34d399' }}>0</div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Missed Maturities
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Automated background crons ensure every upcoming maturity is flagged in advance.
                </div>
              </div>

              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)', backgroundColor: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#c084fc' }}>100%</div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  Audit Transparency
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Complete cryptographic audit trail preserved across renewals and releases.
                </div>
              </div>
            </div>

            {/* Closing Motto */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-accent)',
                display: 'inline-block',
                margin: '0 auto',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#f8fafc',
                letterSpacing: '0.02em',
              }}
            >
              FDR SmartTrack — Smarter Tracking, Timely Action, Transparent Administration.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
