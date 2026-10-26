export interface CursorAction {
  timeOffset: number; // seconds from scene start
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  action: 'move' | 'click' | 'type' | 'highlight';
  text?: string;
  label: string;
}

export interface DemoScene {
  id: number;
  title: string;
  subtitle: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  timeRange: string;
  chapterBadge: string;
  narration: string;
  sentences: string[];
  cursorPath: CursorAction[];
  portalRole: 'Institution (College Representative)' | 'AICTE Official' | 'Central Bureau Admin' | 'System Architecture';
}

export const DEMO_SCENES: DemoScene[] = [
  {
    id: 1,
    title: 'INTRODUCTION',
    subtitle: 'AICTE Problem Statement 26265 — Security Deposit Governance',
    startSeconds: 0,
    endSeconds: 25,
    durationSeconds: 25,
    timeRange: '0:00 – 0:25',
    chapterBadge: 'Scene 1',
    portalRole: 'System Architecture',
    narration:
      'Hello everyone. We are presenting FDR SmartTrack, an intelligent Security Deposit and Fixed Deposit Receipt Management Portal, developed as our proposed solution for AICTE Problem Statement 26265. Our objective is to transform complex administrative processes into a centralized, automated, secure, and transparent digital experience. Welcome to FDR SmartTrack.',
    sentences: [
      'Hello everyone.',
      'We are presenting FDR SmartTrack, an intelligent Security Deposit and Fixed Deposit Receipt Management Portal, developed as our proposed solution for AICTE Problem Statement 26265.',
      'Our objective is to transform complex administrative processes into a centralized, automated, secure, and transparent digital experience.',
      'Welcome to FDR SmartTrack.',
    ],
    cursorPath: [
      { timeOffset: 2, x: 50, y: 35, action: 'highlight', label: 'AICTE Problem 26265' },
      { timeOffset: 8, x: 28, y: 62, action: 'move', label: 'Centralized Architecture' },
      { timeOffset: 15, x: 50, y: 62, action: 'click', label: 'Automated OCR & Verification' },
      { timeOffset: 20, x: 74, y: 62, action: 'highlight', label: 'Neon Serverless PostgreSQL' },
    ],
  },
  {
    id: 2,
    title: 'PROBLEM IDENTIFICATION',
    subtitle: 'Administrative Friction in Traditional Physical Recordkeeping',
    startSeconds: 25,
    endSeconds: 55,
    durationSeconds: 30,
    timeRange: '0:25 – 0:55',
    chapterBadge: 'Scene 2',
    portalRole: 'System Architecture',
    narration:
      'Every year, technical institutions must manage various approval-related financial requirements, including security deposits and Fixed Deposit Receipts, wherever applicable. When records are maintained through fragmented documents and manual tracking, officials may face difficulties verifying information, monitoring maturity dates, and managing pending requests. These challenges can lead to repetitive administrative work, delayed follow-ups, and reduced visibility into important deadlines. This is the problem our solution aims to address.',
    sentences: [
      'Every year, technical institutions must manage various approval-related financial requirements, including security deposits and Fixed Deposit Receipts, wherever applicable.',
      'When records are maintained through fragmented documents and manual tracking, officials may face difficulties verifying information, monitoring maturity dates, and managing pending requests.',
      'These challenges can lead to repetitive administrative work, delayed follow-ups, and reduced visibility into important deadlines.',
      'This is the problem our solution aims to address.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 26, y: 45, action: 'highlight', label: 'Legacy Problem: Paper Records' },
      { timeOffset: 12, x: 26, y: 68, action: 'move', label: 'Unmonitored Maturity Dates' },
      { timeOffset: 20, x: 74, y: 45, action: 'click', label: 'FDR SmartTrack Solution Engine' },
      { timeOffset: 26, x: 74, y: 70, action: 'highlight', label: 'Zero Paper Friction' },
    ],
  },
  {
    id: 3,
    title: 'INSTITUTION PORTAL',
    subtitle: 'Authorized College Login & Security Deposit Registration',
    startSeconds: 55,
    endSeconds: 85,
    durationSeconds: 30,
    timeRange: '0:55 – 1:25',
    chapterBadge: 'Scene 3',
    portalRole: 'Institution (College Representative)',
    narration:
      'Our solution begins with a dedicated institution portal. An authorized college representative can securely log in, register a new Fixed Deposit Receipt, and enter essential details such as the bank name, deposit amount, issue date, and maturity date. Supporting documents can be uploaded directly through the platform. Institutions can also monitor submission status, respond to correction requests, and manage their deposit records from a single dashboard.',
    sentences: [
      'Our solution begins with a dedicated institution portal.',
      'An authorized college representative can securely log in, register a new Fixed Deposit Receipt, and enter essential details such as the bank name, deposit amount, issue date, and maturity date.',
      'Supporting documents can be uploaded directly through the platform.',
      'Institutions can also monitor submission status, respond to correction requests, and manage their deposit records from a single dashboard.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 18, y: 38, action: 'click', label: 'Navigating: Submit Deposit' },
      { timeOffset: 8, x: 35, y: 44, action: 'type', text: 'State Bank of India', label: 'Auto-Filling Bank Details' },
      { timeOffset: 14, x: 68, y: 44, action: 'type', text: '5000000', label: 'Entering ₹50,00,000 Amount' },
      { timeOffset: 20, x: 50, y: 72, action: 'click', label: 'Uploading Signed Bank FDR Scan' },
      { timeOffset: 26, x: 82, y: 84, action: 'click', label: 'Submitting for AICTE Verification' },
    ],
  },
  {
    id: 4,
    title: 'OCR AND DISCREPANCY DETECTION',
    subtitle: 'Intelligent Computer Vision & Automated Discrepancy Flagging',
    startSeconds: 85,
    endSeconds: 120,
    durationSeconds: 35,
    timeRange: '1:25 – 2:00',
    chapterBadge: 'Scene 4',
    portalRole: 'AICTE Official',
    narration:
      'One of the key features of FDR SmartTrack is intelligent document processing. When an institution uploads an FDR, our system uses Optical Character Recognition to extract available information from the document. The extracted details are compared with the information submitted by the institution. For example, if the maturity date entered by the college differs from the date found in the document, the system automatically flags the discrepancy. This helps officials identify records requiring further scrutiny, while final verification remains with authorized sources and officials.',
    sentences: [
      'One of the key features of FDR SmartTrack is intelligent document processing.',
      'When an institution uploads an FDR, our system uses Optical Character Recognition to extract available information from the document.',
      'The extracted details are compared with the information submitted by the institution.',
      'For example, if the maturity date entered by the college differs from the date found in the document, the system automatically flags the discrepancy.',
      'This helps officials identify records requiring further scrutiny, while final verification remains with authorized sources and officials.',
    ],
    cursorPath: [
      { timeOffset: 4, x: 30, y: 45, action: 'highlight', label: 'Original Bank Certificate Scan' },
      { timeOffset: 10, x: 72, y: 36, action: 'move', label: 'Tesseract/PyMuPDF Extraction Engine' },
      { timeOffset: 18, x: 72, y: 55, action: 'highlight', label: 'FLAGGED: Amount ₹19,50,000 vs ₹20,00,000' },
      { timeOffset: 26, x: 72, y: 74, action: 'click', label: 'Generating Discrepancy Ticket' },
      { timeOffset: 31, x: 84, y: 85, action: 'click', label: 'Request Clarification from College' },
    ],
  },
  {
    id: 5,
    title: 'SMART MATURITY ALERTS',
    subtitle: 'Proactive Cron Notifications & Overdue Escalation Engine',
    startSeconds: 120,
    endSeconds: 155,
    durationSeconds: 35,
    timeRange: '2:00 – 2:35',
    chapterBadge: 'Scene 5',
    portalRole: 'System Architecture',
    narration:
      'Another important feature is automated maturity monitoring. FDR SmartTrack continuously monitors recorded maturity dates through scheduled background processes. The system supports configurable reminders, such as thirty days, fifteen days, and seven days before maturity. Institutions and concerned officials can receive notifications about approaching deadlines and unresolved actions. Overdue cases are highlighted for further follow-up. This reduces dependence on manual tracking and helps ensure that important administrative deadlines receive timely attention.',
    sentences: [
      'Another important feature is automated maturity monitoring.',
      'FDR SmartTrack continuously monitors recorded maturity dates through scheduled background processes.',
      'The system supports configurable reminders, such as thirty days, fifteen days, and seven days before maturity.',
      'Institutions and concerned officials can receive notifications about approaching deadlines and unresolved actions.',
      'Overdue cases are highlighted for further follow-up.',
      'This reduces dependence on manual tracking and helps ensure that important administrative deadlines receive timely attention.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 50, y: 35, action: 'move', label: 'Automated Maturity Sentinel' },
      { timeOffset: 11, x: 28, y: 56, action: 'highlight', label: '30-Day Pre-Maturity Alert' },
      { timeOffset: 17, x: 50, y: 56, action: 'click', label: '12 Days Left: HDFC Deposit Alert' },
      { timeOffset: 23, x: 74, y: 56, action: 'highlight', label: 'URGENT: -6 Days Overdue Notice' },
      { timeOffset: 29, x: 86, y: 22, action: 'click', label: 'Opening Automated Alert Drawer' },
    ],
  },
  {
    id: 6,
    title: 'AICTE OFFICIAL DASHBOARD',
    subtitle: 'Centralized Administrative Command & Risk Assessment',
    startSeconds: 155,
    endSeconds: 185,
    durationSeconds: 30,
    timeRange: '2:35 – 3:05',
    chapterBadge: 'Scene 6',
    portalRole: 'AICTE Official',
    narration:
      'For authorized AICTE officials, FDR SmartTrack provides a centralized management dashboard. The dashboard displays active instruments, pending verifications, approaching maturity dates, discrepancies, and unresolved cases. Officials can search and filter institution records, review supporting documents, and record verification observations. Visual analytics and management reports provide a consolidated overview of the administrative workload, making it easier to identify cases that require immediate attention.',
    sentences: [
      'For authorized AICTE officials, FDR SmartTrack provides a centralized management dashboard.',
      'The dashboard displays active instruments, pending verifications, approaching maturity dates, discrepancies, and unresolved cases.',
      'Officials can search and filter institution records, review supporting documents, and record verification observations.',
      'Visual analytics and management reports provide a consolidated overview of the administrative workload, making it easier to identify cases that require immediate attention.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 22, y: 30, action: 'click', label: 'Metric: ₹4.85 Cr Active Deposits' },
      { timeOffset: 10, x: 52, y: 30, action: 'click', label: 'Metric: 2 Pending Verifications' },
      { timeOffset: 17, x: 35, y: 55, action: 'move', label: 'Filtering by State: Maharashtra' },
      { timeOffset: 23, x: 78, y: 65, action: 'click', label: 'Reviewing Verification Observations' },
    ],
  },
  {
    id: 7,
    title: 'RENEWAL MANAGEMENT',
    subtitle: 'Parent-Child Lineage Tracking & Immutable Audit History',
    startSeconds: 185,
    endSeconds: 215,
    durationSeconds: 30,
    timeRange: '3:05 – 3:35',
    chapterBadge: 'Scene 7',
    portalRole: 'Institution (College Representative)',
    narration:
      'FDR SmartTrack also simplifies the renewal and replacement process. When an institution submits a renewed or replacement FDR, the system links the new instrument to its previous record. Authorized officials can review the updated information, verify the supporting documents, and track the workflow status. Importantly, the original record is preserved, ensuring that the complete renewal history remains available for future reference and regulatory scrutiny.',
    sentences: [
      'FDR SmartTrack also simplifies the renewal and replacement process.',
      'When an institution submits a renewed or replacement FDR, the system links the new instrument to its previous record.',
      'Authorized officials can review the updated information, verify the supporting documents, and track the workflow status.',
      'Importantly, the original record is preserved, ensuring that the complete renewal history remains available for future reference and regulatory scrutiny.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 30, y: 40, action: 'highlight', label: 'Predecessor FDR (Axis Bank ₹45L)' },
      { timeOffset: 11, x: 50, y: 48, action: 'move', label: 'Cryptographic Lineage Link' },
      { timeOffset: 18, x: 70, y: 40, action: 'click', label: 'Renewed Instrument (SBI ₹50L)' },
      { timeOffset: 25, x: 50, y: 76, action: 'highlight', label: 'Immutable Regulatory Audit Trail' },
    ],
  },
  {
    id: 8,
    title: 'RELEASE AND REFUND WORKFLOW',
    subtitle: 'Transparent Multi-Stage Approval & Digital NOC Issuance',
    startSeconds: 215,
    endSeconds: 245,
    durationSeconds: 30,
    timeRange: '3:35 – 4:05',
    chapterBadge: 'Scene 8',
    portalRole: 'AICTE Official',
    narration:
      'The platform also supports structured release and refund request management. Institutions can submit requests along with the required supporting documents and track their progress. Each request moves through defined stages, including document review, compliance assessment, and competent authority authorization. Officials can record observations and decisions at each stage. This provides greater transparency and accountability while ensuring that final release decisions follow applicable regulations and authorized procedures.',
    sentences: [
      'The platform also supports structured release and refund request management.',
      'Institutions can submit requests along with the required supporting documents and track their progress.',
      'Each request moves through defined stages, including document review, compliance assessment, and competent authority authorization.',
      'Officials can record observations and decisions at each stage.',
      'This provides greater transparency and accountability while ensuring that final release decisions follow applicable regulations and authorized procedures.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 22, y: 42, action: 'click', label: 'Stage 1: Document Review (Completed)' },
      { timeOffset: 11, x: 50, y: 42, action: 'click', label: 'Stage 2: Compliance Verification' },
      { timeOffset: 19, x: 78, y: 42, action: 'highlight', label: 'Stage 3: Competent Authority Authorization' },
      { timeOffset: 25, x: 80, y: 78, action: 'click', label: 'Generate Digital Release NOC' },
    ],
  },
  {
    id: 9,
    title: 'SECURITY AND AUDIT TRAIL',
    subtitle: 'Role-Based Access Control & Tamper-Evident Chronology',
    startSeconds: 245,
    endSeconds: 275,
    durationSeconds: 30,
    timeRange: '4:05 – 4:35',
    chapterBadge: 'Scene 9',
    portalRole: 'Central Bureau Admin',
    narration:
      'Security and accountability are essential components of our proposed solution. FDR SmartTrack uses role-based access control to restrict information according to user permissions. Financial documents are stored securely, while important activities are recorded through an audit trail. From document submission to verification, renewal, and release processing, the system maintains a traceable history of administrative actions. This helps protect sensitive institutional information and supports transparent record management.',
    sentences: [
      'Security and accountability are essential components of our proposed solution.',
      'FDR SmartTrack uses role-based access control to restrict information according to user permissions.',
      'Financial documents are stored securely, while important activities are recorded through an audit trail.',
      'From document submission to verification, renewal, and release processing, the system maintains a traceable history of administrative actions.',
      'This helps protect sensitive institutional information and supports transparent record management.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 28, y: 35, action: 'highlight', label: 'RBAC: Admin | Official | Institution' },
      { timeOffset: 11, x: 72, y: 35, action: 'move', label: 'JWT Encryption & Neon SSL Mode' },
      { timeOffset: 18, x: 50, y: 58, action: 'click', label: 'Inspecting Event: FDR Verification Signed' },
      { timeOffset: 25, x: 80, y: 75, action: 'highlight', label: 'Tamper-Evident SHA-256 Timestamps' },
    ],
  },
  {
    id: 10,
    title: 'IMPACT AND CONCLUSION',
    subtitle: 'Empowering AICTE with Smarter Tracking & Transparent Governance',
    startSeconds: 275,
    endSeconds: 300,
    durationSeconds: 25,
    timeRange: '4:35 – 5:00',
    chapterBadge: 'Scene 10',
    portalRole: 'System Architecture',
    narration:
      'FDR SmartTrack brings together centralized document management, OCR-assisted verification, automated maturity monitoring, renewal tracking, and controlled administrative workflows. Our solution aims to reduce repetitive work, improve record accuracy, and provide better visibility into pending cases. By combining practical automation with secure digital management, we envision a more efficient and accountable system for AICTE. FDR SmartTrack — Smarter Tracking, Timely Action, Transparent Administration. Thank you.',
    sentences: [
      'FDR SmartTrack brings together centralized document management, OCR-assisted verification, automated maturity monitoring, renewal tracking, and controlled administrative workflows.',
      'Our solution aims to reduce repetitive work, improve record accuracy, and provide better visibility into pending cases.',
      'By combining practical automation with secure digital management, we envision a more efficient and accountable system for AICTE.',
      'FDR SmartTrack — Smarter Tracking, Timely Action, Transparent Administration.',
      'Thank you.',
    ],
    cursorPath: [
      { timeOffset: 3, x: 22, y: 48, action: 'highlight', label: '95% Reduced Administrative Friction' },
      { timeOffset: 8, x: 50, y: 48, action: 'highlight', label: '0 Missed Maturity Deadlines' },
      { timeOffset: 14, x: 78, y: 48, action: 'highlight', label: '100% Traceable Regulatory Audit' },
      { timeOffset: 20, x: 50, y: 78, action: 'click', label: 'Ready for AICTE Nation-wide Deployment' },
    ],
  },
];
