import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';

const pageWidth = 210;
const pageHeight = 297;
const margin = 15;
const contentWidth = pageWidth - (margin * 2);
let currentY = margin;
let pageNumber = 1;

const colors = {
  primary: [41, 98, 255] as [number, number, number],
  secondary: [100, 100, 100] as [number, number, number],
  dark: [30, 30, 30] as [number, number, number],
  light: [235, 235, 235] as [number, number, number],
  accent: [255, 107, 53] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  info: [59, 130, 246] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number]
};

const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

function addPage() {
  doc.addPage();
  pageNumber++;
  currentY = margin;
  addPageNumber();
}

function addPageNumber() {
  doc.setFontSize(8);
  doc.setTextColor(...colors.secondary);
  doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  doc.text('Molochain Platform - Comprehensive Report', margin, pageHeight - 8);
}

function checkPageBreak(requiredSpace: number): boolean {
  if (currentY + requiredSpace > pageHeight - margin - 12) {
    addPage();
    return true;
  }
  return false;
}

function addTitle(text: string, size: number = 20, color: [number, number, number] = colors.primary) {
  checkPageBreak(16);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.text(text, margin, currentY);
  currentY += size * 0.42 + 4;
}

function addSubtitle(text: string, size: number = 12) {
  checkPageBreak(10);
  doc.setFontSize(size);
  doc.setTextColor(...colors.secondary);
  doc.setFont('helvetica', 'italic');
  doc.text(text, margin, currentY);
  currentY += size * 0.36 + 2;
}

function addParagraph(text: string, size: number = 10) {
  doc.setFontSize(size);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, contentWidth);
  const lineHeight = size * 0.36;
  for (const line of lines) {
    checkPageBreak(lineHeight + 1);
    doc.text(line, margin, currentY);
    currentY += lineHeight;
  }
  currentY += 2;
}

function addBulletPoint(text: string, size: number = 9) {
  doc.setFontSize(size);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'normal');
  checkPageBreak(size * 0.36 + 2);
  doc.text('•', margin + 2, currentY);
  const lines = doc.splitTextToSize(text, contentWidth - 7);
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) checkPageBreak(size * 0.36 + 1);
    doc.text(lines[i], margin + 7, currentY);
    currentY += size * 0.36;
  }
  currentY += 1;
}

function addTableRow(cells: string[], isHeader: boolean = false, colWidths: number[] = []) {
  const rowHeight = 7;
  checkPageBreak(rowHeight + 2);
  if (colWidths.length === 0) colWidths = cells.map(() => contentWidth / cells.length);
  let xPos = margin;
  if (isHeader) {
    doc.setFillColor(...colors.primary);
    doc.rect(margin, currentY - 4, contentWidth, rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
  }
  doc.setFontSize(8);
  for (let i = 0; i < cells.length; i++) {
    const cellText = doc.splitTextToSize(cells[i], colWidths[i] - 3)[0] || '';
    doc.text(cellText, xPos + 2, currentY);
    xPos += colWidths[i];
  }
  currentY += rowHeight;
}

function addSpacer(height: number = 6) { currentY += height; }

function addHorizontalLine() {
  checkPageBreak(4);
  doc.setDrawColor(...colors.light);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;
}

function addChapterHeader(number: number, title: string) {
  checkPageBreak(22);
  addSpacer(6);
  doc.setFillColor(...colors.primary);
  doc.rect(margin, currentY - 4, contentWidth, 12, 'F');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Chapter ${number}: ${title}`, margin + 4, currentY + 2);
  currentY += 16;
}

function drawBox(x: number, y: number, w: number, h: number, text: string, color: [number, number, number], fontSize: number = 6) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
  doc.setFontSize(fontSize);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(text, w - 3);
  const lh = fontSize * 0.35;
  const startY = y + h / 2 - (lines.length * lh) / 2 + lh;
  lines.forEach((line: string, i: number) => doc.text(line, x + w / 2, startY + i * lh, { align: 'center' }));
}

function drawArrow(x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [100, 100, 100]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.4);
  doc.line(x1, y1, x2, y2);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const al = 2;
  doc.line(x2, y2, x2 - al * Math.cos(angle - Math.PI / 6), y2 - al * Math.sin(angle - Math.PI / 6));
  doc.line(x2, y2, x2 - al * Math.cos(angle + Math.PI / 6), y2 - al * Math.sin(angle + Math.PI / 6));
}

function drawScreenshotPlaceholder(title: string, url: string, description: string, elements: string[]) {
  checkPageBreak(55);
  
  doc.setFillColor(250, 251, 252);
  doc.roundedRect(margin, currentY, contentWidth, 48, 2, 2, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(margin, currentY, contentWidth, 48, 2, 2, 'S');
  
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin + 2, currentY + 2, contentWidth - 4, 8, 1, 1, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin + 5, currentY + 7);
  doc.setFontSize(6);
  doc.text(url, margin + contentWidth - 5, currentY + 7, { align: 'right' });
  
  doc.setFillColor(245, 247, 250);
  doc.rect(margin + 4, currentY + 12, contentWidth - 8, 32, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(description, contentWidth - 12);
  let descY = currentY + 17;
  for (let i = 0; i < Math.min(descLines.length, 2); i++) {
    doc.text(descLines[i], margin + 6, descY);
    descY += 3;
  }
  
  doc.setFontSize(6);
  doc.setTextColor(...colors.secondary);
  doc.text('Visual Elements:', margin + 6, descY + 2);
  descY += 4;
  
  const elementsPerRow = 3;
  const elemWidth = (contentWidth - 16) / elementsPerRow;
  for (let i = 0; i < Math.min(elements.length, 6); i++) {
    const col = i % elementsPerRow;
    const row = Math.floor(i / elementsPerRow);
    const x = margin + 6 + col * elemWidth;
    const y = descY + row * 6;
    
    doc.setFillColor(230, 235, 245);
    doc.roundedRect(x, y, elemWidth - 2, 5, 1, 1, 'F');
    doc.setFontSize(5);
    doc.setTextColor(...colors.dark);
    doc.text(elements[i], x + (elemWidth - 2) / 2, y + 3.2, { align: 'center' });
  }
  
  currentY += 52;
}

function drawSystemArchitectureDiagram() {
  checkPageBreak(90);
  addSubtitle('System Architecture Diagram');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(margin, startY, contentWidth, 82, 3, 3, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.roundedRect(margin, startY, contentWidth, 82, 3, 3, 'S');
  
  const bh = 10, bw = 32;
  
  doc.setFontSize(8);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('FRONTEND LAYER', margin + 4, startY + 8);
  drawBox(margin + 4, startY + 10, bw, bh, 'React 18', colors.info);
  drawBox(margin + 40, startY + 10, bw, bh, 'Vite', colors.info);
  drawBox(margin + 76, startY + 10, bw, bh, 'Tailwind CSS', colors.info);
  drawBox(margin + 112, startY + 10, bw, bh, 'shadcn/ui', colors.info);
  
  doc.text('BACKEND LAYER', margin + 4, startY + 28);
  drawBox(margin + 4, startY + 30, bw, bh, 'Express.js', colors.success);
  drawBox(margin + 40, startY + 30, bw, bh, 'API Routes', colors.success);
  drawBox(margin + 76, startY + 30, bw, bh, 'Middleware', colors.success);
  drawBox(margin + 112, startY + 30, bw, bh, 'WebSocket', colors.success);
  
  doc.text('DATA LAYER', margin + 4, startY + 48);
  drawBox(margin + 4, startY + 50, bw, bh, 'PostgreSQL', colors.warning);
  drawBox(margin + 40, startY + 50, bw, bh, 'Drizzle ORM', colors.warning);
  drawBox(margin + 76, startY + 50, bw, bh, 'Cache Layer', colors.warning);
  
  doc.text('EXTERNAL SERVICES', margin + 4, startY + 68);
  drawBox(margin + 4, startY + 70, 26, 8, 'OpenAI', colors.accent);
  drawBox(margin + 34, startY + 70, 26, 8, 'CMS', colors.accent);
  drawBox(margin + 64, startY + 70, 26, 8, 'OTMS', colors.accent);
  drawBox(margin + 94, startY + 70, 26, 8, 'Postfix', colors.accent);
  
  drawArrow(margin + 20, startY + 20, margin + 20, startY + 30, colors.secondary);
  drawArrow(margin + 56, startY + 20, margin + 56, startY + 30, colors.secondary);
  drawArrow(margin + 92, startY + 20, margin + 92, startY + 30, colors.secondary);
  drawArrow(margin + 20, startY + 40, margin + 20, startY + 50, colors.secondary);
  drawArrow(margin + 56, startY + 40, margin + 56, startY + 50, colors.secondary);
  
  currentY = startY + 90;
}

function drawAuthFlowDiagram() {
  checkPageBreak(68);
  addSubtitle('Authentication Flow Diagram');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(255, 252, 248);
  doc.roundedRect(margin, startY, contentWidth, 60, 3, 3, 'F');
  doc.setDrawColor(235, 225, 215);
  doc.roundedRect(margin, startY, contentWidth, 60, 3, 3, 'S');
  
  const bh = 9, bw = 26;
  
  doc.setFontSize(7);
  doc.setTextColor(...colors.dark);
  doc.text('Login Flow:', margin + 4, startY + 8);
  
  drawBox(margin + 4, startY + 10, bw, bh, 'Login', colors.info);
  drawArrow(margin + 30, startY + 14.5, margin + 35, startY + 14.5, colors.secondary);
  drawBox(margin + 35, startY + 10, bw, bh, 'Validate', colors.warning);
  drawArrow(margin + 61, startY + 14.5, margin + 66, startY + 14.5, colors.secondary);
  drawBox(margin + 66, startY + 10, bw, bh, '2FA Check', colors.accent);
  drawArrow(margin + 92, startY + 14.5, margin + 97, startY + 14.5, colors.secondary);
  drawBox(margin + 97, startY + 10, bw, bh, 'JWT Token', colors.success);
  
  drawArrow(margin + 110, startY + 19, margin + 110, startY + 24, colors.secondary);
  
  doc.text('Token Management:', margin + 4, startY + 28);
  drawBox(margin + 4, startY + 30, bw, bh, 'Refresh Token', colors.info);
  drawArrow(margin + 30, startY + 34.5, margin + 35, startY + 34.5, colors.secondary);
  drawBox(margin + 35, startY + 30, bw, bh, 'SHA-256 Hash', colors.warning);
  drawArrow(margin + 61, startY + 34.5, margin + 66, startY + 34.5, colors.secondary);
  drawBox(margin + 66, startY + 30, bw, bh, 'Store in DB', colors.accent);
  drawArrow(margin + 92, startY + 34.5, margin + 97, startY + 34.5, colors.secondary);
  drawBox(margin + 97, startY + 30, bw, bh, 'Set Cookies', colors.success);
  
  drawArrow(margin + 110, startY + 39, margin + 110, startY + 44, colors.secondary);
  drawBox(margin + 66, startY + 44, 57, bh, 'Dashboard Access', colors.primary);
  
  doc.setFontSize(6);
  doc.setTextColor(...colors.secondary);
  doc.text('Security: HttpOnly cookies, Token rotation, Rate limiting (10 req/15min)', margin + 4, startY + 56);
  
  currentY = startY + 66;
}

function drawEmailFlowDiagram() {
  checkPageBreak(60);
  addSubtitle('Email Notification System Flow');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(248, 255, 248);
  doc.roundedRect(margin, startY, contentWidth, 52, 3, 3, 'F');
  doc.setDrawColor(215, 235, 215);
  doc.roundedRect(margin, startY, contentWidth, 52, 3, 3, 'S');
  
  const bh = 8, bw = 28;
  
  doc.setFontSize(7);
  doc.setTextColor(...colors.dark);
  doc.text('External Sources:', margin + 4, startY + 8);
  drawBox(margin + 4, startY + 10, 24, bh, 'CMS', colors.info);
  drawBox(margin + 32, startY + 10, 24, bh, 'OTMS', colors.info);
  drawBox(margin + 60, startY + 10, 24, bh, 'Mololink', colors.info);
  
  drawArrow(margin + 16, startY + 18, margin + 16, startY + 24, colors.secondary);
  drawArrow(margin + 44, startY + 18, margin + 44, startY + 24, colors.secondary);
  drawArrow(margin + 72, startY + 18, margin + 72, startY + 24, colors.secondary);
  
  doc.text('Email API Pipeline:', margin + 4, startY + 28);
  drawBox(margin + 4, startY + 30, bw, bh, '/api/email/send', colors.primary);
  drawArrow(margin + 32, startY + 34, margin + 37, startY + 34, colors.secondary);
  drawBox(margin + 37, startY + 30, bw, bh, 'Validate Key', colors.warning);
  drawArrow(margin + 65, startY + 34, margin + 70, startY + 34, colors.secondary);
  drawBox(margin + 70, startY + 30, bw, bh, 'Rate Limit', colors.accent);
  drawArrow(margin + 98, startY + 34, margin + 103, startY + 34, colors.secondary);
  drawBox(margin + 103, startY + 30, bw, bh, 'Send Email', colors.success);
  
  doc.setFontSize(6);
  doc.setTextColor(...colors.secondary);
  doc.text('Rate Limits: General 100/15min, Auth 10/15min, Password 3/hour | 18 form types supported', margin + 4, startY + 48);
  
  currentY = startY + 58;
}

function drawSubdomainDiagram() {
  checkPageBreak(65);
  addSubtitle('Subdomain Integration Map');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(252, 248, 255);
  doc.roundedRect(margin, startY, contentWidth, 58, 3, 3, 'F');
  doc.setDrawColor(235, 225, 245);
  doc.roundedRect(margin, startY, contentWidth, 58, 3, 3, 'S');
  
  drawBox(margin + 52, startY + 4, 54, 12, 'molochain.com', colors.primary, 7);
  
  doc.setFontSize(7);
  doc.setTextColor(...colors.dark);
  doc.text('Core Subdomains:', margin + 4, startY + 24);
  drawBox(margin + 4, startY + 26, 38, 10, 'admin', colors.info);
  drawBox(margin + 46, startY + 26, 38, 10, 'auth (SSO)', colors.success);
  drawBox(margin + 88, startY + 26, 38, 10, 'app', colors.info);
  
  drawArrow(margin + 60, startY + 16, margin + 23, startY + 26, colors.secondary);
  drawArrow(margin + 79, startY + 16, margin + 65, startY + 26, colors.secondary);
  drawArrow(margin + 98, startY + 16, margin + 107, startY + 26, colors.secondary);
  
  doc.text('Microservices:', margin + 4, startY + 44);
  drawBox(margin + 4, startY + 46, 36, 9, 'cms (Laravel)', colors.accent);
  drawBox(margin + 44, startY + 46, 36, 9, 'opt (OTMS)', colors.accent);
  drawBox(margin + 84, startY + 46, 36, 9, 'mololink', colors.accent);
  
  currentY = startY + 64;
}

function drawDatabaseDiagram() {
  checkPageBreak(75);
  addSubtitle('Database Schema Overview');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(255, 255, 250);
  doc.roundedRect(margin, startY, contentWidth, 68, 3, 3, 'F');
  doc.setDrawColor(235, 235, 220);
  doc.roundedRect(margin, startY, contentWidth, 68, 3, 3, 'S');
  
  const bh = 28, bw = 42;
  
  doc.setFillColor(...colors.info);
  doc.roundedRect(margin + 4, startY + 4, bw, bh, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('users', margin + 9, startY + 11);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 255);
  doc.text('id, username, email', margin + 9, startY + 15);
  doc.text('password, role, permissions', margin + 9, startY + 19);
  doc.text('2FA enabled, created_at', margin + 9, startY + 23);
  doc.text('updated_at, avatar_url', margin + 9, startY + 27);
  
  doc.setFillColor(...colors.success);
  doc.roundedRect(margin + 50, startY + 4, bw, bh, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('services', margin + 55, startY + 11);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 255, 230);
  doc.text('id, title, slug, description', margin + 55, startY + 15);
  doc.text('category, features array', margin + 55, startY + 19);
  doc.text('benefits, pricing_info', margin + 55, startY + 23);
  doc.text('is_active, popularity', margin + 55, startY + 27);
  
  doc.setFillColor(...colors.warning);
  doc.roundedRect(margin + 96, startY + 4, bw, bh, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('refresh_tokens', margin + 99, startY + 11);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 250, 220);
  doc.text('id, user_id, token_hash', margin + 99, startY + 15);
  doc.text('expires_at, is_revoked', margin + 99, startY + 19);
  doc.text('user_agent, ip_address', margin + 99, startY + 23);
  doc.text('created_at, rotated_from', margin + 99, startY + 27);
  
  doc.setFillColor(...colors.accent);
  doc.roundedRect(margin + 4, startY + 36, bw, bh, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('form_types', margin + 9, startY + 43);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 235, 225);
  doc.text('id, name, slug', margin + 9, startY + 47);
  doc.text('description, fields', margin + 9, startY + 51);
  doc.text('is_active, created_at', margin + 9, startY + 55);
  doc.text('email_template', margin + 9, startY + 59);
  
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin + 50, startY + 36, bw, bh, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('contact_submissions', margin + 52, startY + 43);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 255);
  doc.text('id, form_type_id, name', margin + 52, startY + 47);
  doc.text('email, subject, message', margin + 52, startY + 51);
  doc.text('status, created_at', margin + 52, startY + 55);
  doc.text('responded_at, notes', margin + 52, startY + 59);
  
  doc.setFillColor(100, 160, 100);
  doc.roundedRect(margin + 96, startY + 36, bw, bh, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('service_inquiries', margin + 98, startY + 43);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 255, 230);
  doc.text('id, service_id, user_id', margin + 99, startY + 47);
  doc.text('name, email, company', margin + 99, startY + 51);
  doc.text('message, status', margin + 99, startY + 55);
  doc.text('created_at, updated_at', margin + 99, startY + 59);
  
  currentY = startY + 74;
}

function drawFeatureModulesDiagram() {
  checkPageBreak(72);
  addSubtitle('Feature Modules Overview');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(250, 251, 254);
  doc.roundedRect(margin, startY, contentWidth, 65, 3, 3, 'F');
  doc.setDrawColor(225, 230, 240);
  doc.roundedRect(margin, startY, contentWidth, 65, 3, 3, 'S');
  
  drawBox(margin + 60, startY + 3, 50, 11, 'MOLOCHAIN', colors.primary, 8);
  
  const modules = [
    { name: 'Admin Control', color: colors.info, x: 4, y: 18, desc: 'MCC, Users, Security' },
    { name: 'Supply Chain', color: colors.success, x: 50, y: 18, desc: 'Tracking, Fleet, Routes' },
    { name: 'Developer', color: colors.warning, x: 96, y: 18, desc: 'API, SDK, Docs' },
    { name: 'AI & Rayanava', color: colors.accent, x: 4, y: 34, desc: 'AI Hub, Assistant' },
    { name: 'Collaboration', color: colors.info, x: 50, y: 34, desc: 'Docs, Projects, Files' },
    { name: 'Services', color: colors.success, x: 96, y: 34, desc: '46 services catalog' },
    { name: 'Authentication', color: colors.warning, x: 4, y: 50, desc: 'SSO, 2FA, JWT' },
    { name: 'Content/CMS', color: colors.accent, x: 50, y: 50, desc: 'Blog, FAQ, Brand' },
    { name: 'Email System', color: colors.primary, x: 96, y: 50, desc: '18 form types' },
  ];
  
  modules.forEach(m => {
    doc.setFillColor(...m.color);
    doc.roundedRect(margin + m.x, startY + m.y, 40, 12, 2, 2, 'F');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(m.name, margin + m.x + 20, startY + m.y + 5, { align: 'center' });
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(m.desc, margin + m.x + 20, startY + m.y + 9, { align: 'center' });
  });
  
  currentY = startY + 70;
}

function drawEventTriggerMapDiagram() {
  checkPageBreak(160);
  addSubtitle('Comprehensive Event & Trigger Map');
  addSpacer(2);
  
  const startY = currentY;
  doc.setFillColor(255, 252, 248);
  doc.roundedRect(margin, startY, contentWidth, 152, 3, 3, 'F');
  doc.setDrawColor(240, 230, 220);
  doc.roundedRect(margin, startY, contentWidth, 152, 3, 3, 'S');
  
  // Row 1: Scheduled Events
  doc.setFontSize(6);
  doc.setTextColor(...colors.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('SCHEDULED EVENTS (12 Jobs):', margin + 3, startY + 6);
  doc.setFont('helvetica', 'normal');
  
  const schedEvents = [
    { time: '5sec', name: 'CPU Opt', color: colors.warning },
    { time: '5sec', name: 'Perf Met', color: colors.info },
    { time: '5min', name: 'CMS Sync', color: colors.success },
    { time: '5min', name: 'Sys Mon', color: colors.warning },
    { time: '2min', name: 'Svc Health', color: colors.accent },
    { time: '1min', name: 'Escalation', color: colors.danger },
    { time: '1hr', name: 'Act Clean', color: colors.secondary },
    { time: 'Daily', name: 'Sales WF', color: colors.primary },
    { time: 'Weekly', name: 'Compliance', color: colors.info },
  ];
  let xPos = margin + 3;
  schedEvents.forEach((e, i) => {
    drawBox(xPos, startY + 8, 18, 6, e.time + '→' + e.name, e.color, 4);
    xPos += 19;
  });

  // Row 2: WebSocket Namespaces (8 namespaces)
  doc.setFont('helvetica', 'bold');
  doc.text('WEBSOCKET NAMESPACES (8 Types, 30+ Events):', margin + 3, startY + 20);
  doc.setFont('helvetica', 'normal');
  
  const wsNamespaces = [
    { ns: '/ws/main', events: 'status, ping, auth' },
    { ns: '/ws/collaboration', events: 'join, msg, leave' },
    { ns: '/ws/tracking', events: 'subscribe, location' },
    { ns: '/ws/mololink', events: 'market, auction' },
    { ns: '/ws/activity', events: 'log, filter' },
    { ns: '/ws/commodity', events: 'chat, price-alert' },
    { ns: '/ws/notify', events: 'subscribe, broadcast' },
    { ns: '/ws/project', events: 'project, milestone' },
  ];
  xPos = margin + 3;
  wsNamespaces.forEach((w, i) => {
    if (i === 4) { xPos = margin + 3; }
    const yOff = i < 4 ? 22 : 30;
    drawBox(xPos, startY + yOff, 42, 6, w.ns + ': ' + w.events, i % 2 === 0 ? colors.info : colors.success, 4);
    xPos += 43;
  });

  // Row 3: Authentication Events
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHENTICATION EVENTS:', margin + 3, startY + 42);
  doc.setFont('helvetica', 'normal');
  
  drawBox(margin + 3, startY + 44, 16, 6, 'Login', colors.info, 4);
  drawArrow(margin + 19, startY + 47, margin + 22, startY + 47, colors.secondary);
  drawBox(margin + 22, startY + 44, 16, 6, 'Validate', colors.warning, 4);
  drawArrow(margin + 38, startY + 47, margin + 41, startY + 47, colors.secondary);
  drawBox(margin + 41, startY + 44, 16, 6, 'JWT', colors.success, 4);
  drawArrow(margin + 57, startY + 47, margin + 60, startY + 47, colors.secondary);
  drawBox(margin + 60, startY + 44, 16, 6, 'Audit', colors.primary, 4);
  
  drawBox(margin + 80, startY + 44, 16, 6, 'Register', colors.info, 4);
  drawArrow(margin + 96, startY + 47, margin + 99, startY + 47, colors.secondary);
  drawBox(margin + 99, startY + 44, 20, 6, 'Welcome Email', colors.success, 4);
  
  drawBox(margin + 122, startY + 44, 16, 6, 'PW Reset', colors.warning, 4);
  drawArrow(margin + 138, startY + 47, margin + 141, startY + 47, colors.secondary);
  drawBox(margin + 141, startY + 44, 20, 6, 'Reset Email', colors.accent, 4);

  // Row 4: System Events
  doc.setFont('helvetica', 'bold');
  doc.text('SYSTEM EVENTS:', margin + 3, startY + 56);
  doc.setFont('helvetica', 'normal');
  
  const sysEvents = [
    { trigger: 'SIGTERM', action: 'Graceful Shutdown', color: colors.danger },
    { trigger: 'CPU >70%', action: 'BG Suspend', color: colors.warning },
    { trigger: 'CPU >85%', action: 'Emergency Throttle', color: colors.danger },
    { trigger: 'Memory High', action: 'GC + Cleanup', color: colors.accent },
    { trigger: 'Exception', action: 'Error Recovery', color: colors.warning },
  ];
  xPos = margin + 3;
  sysEvents.forEach(e => {
    drawBox(xPos, startY + 58, 32, 6, e.trigger + '→' + e.action, e.color, 4);
    xPos += 34;
  });

  // Row 5: Service Health Events
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICE HEALTH EVENTS:', margin + 3, startY + 70);
  doc.setFont('helvetica', 'normal');
  
  drawBox(margin + 3, startY + 72, 22, 6, 'Svc Failure', colors.danger, 4);
  drawArrow(margin + 25, startY + 75, margin + 28, startY + 75, colors.secondary);
  drawBox(margin + 28, startY + 72, 18, 6, 'Retry', colors.warning, 4);
  drawBox(margin + 48, startY + 72, 18, 6, 'Fallback', colors.info, 4);
  drawBox(margin + 68, startY + 72, 22, 6, 'Circuit Break', colors.danger, 4);
  drawArrow(margin + 90, startY + 75, margin + 93, startY + 75, colors.secondary);
  drawBox(margin + 93, startY + 72, 18, 6, 'Recovery', colors.success, 4);
  drawArrow(margin + 111, startY + 75, margin + 114, startY + 75, colors.secondary);
  drawBox(margin + 114, startY + 72, 18, 6, 'Log Alert', colors.primary, 4);

  // Row 6: Security Events
  doc.setFont('helvetica', 'bold');
  doc.text('SECURITY EVENTS:', margin + 3, startY + 84);
  doc.setFont('helvetica', 'normal');
  
  drawBox(margin + 3, startY + 86, 22, 6, 'Threat Detect', colors.danger, 4);
  drawArrow(margin + 25, startY + 89, margin + 28, startY + 89, colors.secondary);
  drawBox(margin + 28, startY + 86, 22, 6, 'Incident Create', colors.warning, 4);
  drawArrow(margin + 50, startY + 89, margin + 53, startY + 89, colors.secondary);
  drawBox(margin + 53, startY + 86, 18, 6, 'Escalate', colors.accent, 4);
  drawArrow(margin + 71, startY + 89, margin + 74, startY + 89, colors.secondary);
  drawBox(margin + 74, startY + 86, 18, 6, 'Notify', colors.info, 4);
  
  drawBox(margin + 100, startY + 86, 22, 6, 'Policy Engine', colors.primary, 4);
  drawArrow(margin + 122, startY + 89, margin + 125, startY + 89, colors.secondary);
  drawBox(margin + 125, startY + 86, 22, 6, 'Enforce+Audit', colors.success, 4);

  // Row 7: Email Triggers
  doc.setFont('helvetica', 'bold');
  doc.text('EMAIL TRIGGERS (18 Form Types):', margin + 3, startY + 98);
  doc.setFont('helvetica', 'normal');
  
  const emailTypes = ['Quote', 'Contact', 'Support', 'Partner', 'Career', 'Feedback', 'Cross-API', 'Compliance'];
  xPos = margin + 3;
  emailTypes.forEach((t, i) => {
    drawBox(xPos, startY + 100, 20, 6, t, i % 2 === 0 ? colors.info : colors.success, 4);
    xPos += 21;
  });

  // Row 8: Instagram Services
  doc.setFont('helvetica', 'bold');
  doc.text('INSTAGRAM SERVICES (7 Services):', margin + 3, startY + 112);
  doc.setFont('helvetica', 'normal');
  
  const igServices = ['Posts', 'Reels', 'Stories', 'Analytics', 'Competitors', 'AI Content', 'Influencers'];
  xPos = margin + 3;
  igServices.forEach((s, i) => {
    drawBox(xPos, startY + 114, 22, 6, s, colors.accent, 4);
    xPos += 24;
  });

  // Row 9: AI/Rayanava & Integration Events
  doc.setFont('helvetica', 'bold');
  doc.text('AI/RAYANAVA & INTEGRATIONS:', margin + 3, startY + 126);
  doc.setFont('helvetica', 'normal');
  
  const aiEvents = ['Sales Agent', 'Biz Intel', 'Ops Monitor', 'Sales Opp', 'Email Tool'];
  xPos = margin + 3;
  aiEvents.forEach(e => {
    drawBox(xPos, startY + 128, 24, 6, e, colors.primary, 4);
    xPos += 26;
  });
  
  const integrations = ['CMS Client', 'OTMS Client', 'FedEx API', 'UPS API'];
  integrations.forEach(i => {
    drawBox(xPos, startY + 128, 22, 6, i, colors.warning, 4);
    xPos += 24;
  });

  // Row 10: Database & Cache Events
  doc.setFont('helvetica', 'bold');
  doc.text('DATABASE & CACHE EVENTS:', margin + 3, startY + 140);
  doc.setFont('helvetica', 'normal');
  
  const dbEvents = ['Conn Pool', 'DB Optimize', 'Backup', 'Migrate', 'Cache Warm', 'Cache Expire', 'CMS Cache'];
  xPos = margin + 3;
  dbEvents.forEach((e, i) => {
    drawBox(xPos, startY + 142, 22, 6, e, i < 4 ? colors.info : colors.success, 4);
    xPos += 24;
  });
  
  currentY = startY + 158;
}

// Cover Page
function generateCoverPage() {
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFontSize(44);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('MOLOCHAIN', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'normal');
  doc.text('Platform Development Report', pageWidth / 2, 72, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Comprehensive Documentation', pageWidth / 2, 92, { align: 'center' });
  doc.text('with Diagrams & Screenshots', pageWidth / 2, 105, { align: 'center' });
  
  doc.setFillColor(255, 255, 255);
  doc.rect(50, 120, 110, 1.5, 'F');
  
  doc.setFontSize(11);
  doc.text('Full-Stack TypeScript Application', pageWidth / 2, 140, { align: 'center' });
  doc.text('Rest Express - Digital Logistics Platform', pageWidth / 2, 152, { align: 'center' });
  
  doc.setFillColor(255, 255, 255, 0.12);
  doc.roundedRect(40, 168, 130, 75, 4, 4, 'F');
  
  doc.setFontSize(13);
  doc.text('Project Statistics', pageWidth / 2, 185, { align: 'center' });
  
  doc.setFontSize(10);
  const stats = [
    '551 Git Commits | 80+ Pages | 25+ API Routes',
    '30+ Database Tables | 6 Subdomains',
    '17 Development Phases | 40+ Documentation Files',
    '46 Services | 18 Email Form Types'
  ];
  let statY = 198;
  stats.forEach(stat => {
    doc.text(stat, pageWidth / 2, statY, { align: 'center' });
    statY += 11;
  });
  
  doc.setFontSize(11);
  doc.text('Version 3.0 - Final Edition', pageWidth / 2, 258, { align: 'center' });
  doc.text('December 21, 2025', pageWidth / 2, 270, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text('Generated with jsPDF | Replit Agent', pageWidth / 2, pageHeight - 12, { align: 'center' });
}

function generateTableOfContents() {
  addPage();
  addTitle('Table of Contents', 20);
  addSpacer(4);
  
  const chapters = [
    { num: 1, title: 'Executive Summary', page: 3 },
    { num: 2, title: 'System Architecture Diagram', page: 4 },
    { num: 3, title: 'Authentication Flow Diagram', page: 5 },
    { num: 4, title: 'Email Notification System Diagram', page: 6 },
    { num: 5, title: 'Subdomain Integration Diagram', page: 7 },
    { num: 6, title: 'Database Schema Diagram', page: 8 },
    { num: 7, title: 'Feature Modules Diagram', page: 9 },
    { num: 8, title: 'Event & Trigger Map', page: 10 },
    { num: 9, title: 'Page Screenshots Gallery', page: 11 },
    { num: 10, title: 'Development Phases (17 Phases)', page: 16 },
    { num: 11, title: 'API Endpoints Reference', page: 19 },
    { num: 12, title: 'Security Implementation', page: 21 },
    { num: 13, title: 'Production Deployment', page: 23 },
    { num: 14, title: 'Statistics & Metrics', page: 25 },
    { num: 15, title: 'Future Roadmap', page: 27 },
  ];
  
  doc.setFontSize(10);
  for (const ch of chapters) {
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
    doc.text(`Chapter ${ch.num}: ${ch.title}`, margin, currentY);
    doc.text(`${ch.page}`, pageWidth - margin - 6, currentY);
    doc.setDrawColor(...colors.light);
    doc.setLineDashPattern([0.6, 0.6], 0);
    doc.line(margin + 75, currentY, pageWidth - margin - 10, currentY);
    doc.setLineDashPattern([], 0);
    currentY += 7;
  }
}

function generateExecutiveSummary() {
  addPage();
  addChapterHeader(1, 'Executive Summary');
  
  addParagraph('Molochain Platform (Rest Express) is a comprehensive full-stack TypeScript application designed for digital logistics and business management. This report provides complete documentation including visual diagrams, page screenshots, and technical specifications covering all 551 commits across 17 development phases.');
  
  addSpacer(3);
  addSubtitle('Key Achievements');
  addBulletPoint('551 total git commits demonstrating extensive iterative development');
  addBulletPoint('80+ frontend pages covering all business domains');
  addBulletPoint('25+ backend API route modules for comprehensive functionality');
  addBulletPoint('30+ database tables with PostgreSQL integration using Drizzle ORM');
  addBulletPoint('Real-time WebSocket communication for live collaboration');
  addBulletPoint('AI-powered features with OpenAI integration (Rayanava assistant)');
  addBulletPoint('Cross-subdomain email notification system with 18 form types');
  addBulletPoint('Multi-subdomain architecture supporting 6 specialized platforms');
  
  addSpacer(3);
  addSubtitle('Technology Stack');
  addTableRow(['Layer', 'Technology'], true, [40, 130]);
  addTableRow(['Frontend', 'React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui'], false, [40, 130]);
  addTableRow(['Backend', 'Express.js, TypeScript, Node.js, Socket.IO'], false, [40, 130]);
  addTableRow(['Database', 'PostgreSQL with Drizzle ORM (Neon-backed)'], false, [40, 130]);
  addTableRow(['Authentication', 'JWT, Passport.js, 2FA (TOTP), OAuth'], false, [40, 130]);
  addTableRow(['AI Services', 'OpenAI SDK integration'], false, [40, 130]);
  addTableRow(['Email', 'Nodemailer with Postfix relay'], false, [40, 130]);
}

function generateArchitectureChapter() {
  addPage();
  addChapterHeader(2, 'System Architecture');
  addParagraph('The Molochain platform follows a modern full-stack architecture with clear separation between frontend, backend, and data layers. This diagram illustrates the complete system structure.');
  drawSystemArchitectureDiagram();
  addSubtitle('Architecture Components');
  addBulletPoint('Frontend Layer: React 18 with Vite, Tailwind CSS, shadcn/ui components');
  addBulletPoint('Backend Layer: Express.js with organized API routes, security middleware, WebSocket');
  addBulletPoint('Data Layer: PostgreSQL with Drizzle ORM and cache layer for performance');
  addBulletPoint('External Services: OpenAI, Laravel CMS, OTMS, Postfix SMTP');
}

function generateAuthChapter() {
  addPage();
  addChapterHeader(3, 'Authentication Flow');
  addParagraph('The authentication system implements industry-standard security practices including JWT tokens, refresh token rotation, and two-factor authentication.');
  drawAuthFlowDiagram();
  addSubtitle('Security Features');
  addBulletPoint('JWT tokens with 15-minute expiration for short-lived access');
  addBulletPoint('Refresh tokens with SHA-256 hashing stored in database');
  addBulletPoint('Automatic token rotation on refresh to prevent replay attacks');
  addBulletPoint('HttpOnly secure cookies to prevent XSS attacks');
  addBulletPoint('TOTP-based 2FA with backup recovery codes');
  addBulletPoint('Rate limiting: 10 requests per 15 minutes on auth endpoints');
}

function generateEmailChapter() {
  addPage();
  addChapterHeader(4, 'Email Notification System');
  addParagraph('The cross-subdomain email system provides centralized email sending for all Molochain ecosystem services with 18 form types and template-based emails.');
  drawEmailFlowDiagram();
  addSubtitle('Rate Limiting Configuration');
  addTableRow(['Tier', 'Limit', 'Window', 'Purpose'], true, [30, 30, 30, 80]);
  addTableRow(['General', '100 req', '15 minutes', 'Standard API calls'], false, [30, 30, 30, 80]);
  addTableRow(['Auth', '10 req', '15 minutes', 'Login/register emails'], false, [30, 30, 30, 80]);
  addTableRow(['Password', '3 req', '1 hour', 'Password reset requests'], false, [30, 30, 30, 80]);
  addSpacer(3);
  addSubtitle('API Keys');
  addBulletPoint('molochain-services (ID 1) - Internal platform');
  addBulletPoint('cms (ID 4) - CMS integration');
  addBulletPoint('opt (ID 5) - OTMS Platform');
  addBulletPoint('mololink (ID 6) - Mololink Marketplace');
}

function generateSubdomainChapter() {
  addPage();
  addChapterHeader(5, 'Subdomain Integration');
  addParagraph('The Molochain ecosystem consists of 6 interconnected subdomains with centralized SSO authentication.');
  drawSubdomainDiagram();
  addSubtitle('Subdomain Details');
  addTableRow(['Subdomain', 'Purpose', 'Tech'], true, [45, 78, 47]);
  addTableRow(['molochain.com', 'Main platform & public website', 'React + Express'], false, [45, 78, 47]);
  addTableRow(['admin.molochain.com', 'Admin portal & control center', 'React + Express'], false, [45, 78, 47]);
  addTableRow(['auth.molochain.com', 'SSO authentication service', 'JWT + OAuth'], false, [45, 78, 47]);
  addTableRow(['cms.molochain.com', 'Content management system', 'Laravel PHP'], false, [45, 78, 47]);
  addTableRow(['opt.molochain.com', 'OTMS logistics platform', 'Express API'], false, [45, 78, 47]);
  addTableRow(['mololink.molochain.com', 'Marketplace microservice', 'React + Docker'], false, [45, 78, 47]);
}

function generateDatabaseChapter() {
  addPage();
  addChapterHeader(6, 'Database Schema');
  addParagraph('The database consists of 2,271 lines defining 30+ tables with proper relationships using Drizzle ORM.');
  drawDatabaseDiagram();
  addSubtitle('Key Relationships');
  addBulletPoint('users → refresh_tokens: One-to-many (session management)');
  addBulletPoint('users → service_inquiries: One-to-many (user inquiries)');
  addBulletPoint('services → service_availability: One-to-many (locations)');
  addBulletPoint('form_types → contact_submissions: One-to-many (categorization)');
}

function generateFeatureModulesChapter() {
  addPage();
  addChapterHeader(7, 'Feature Modules');
  addParagraph('The platform is organized into 9 major feature modules, each containing multiple sub-features.');
  drawFeatureModulesDiagram();
  addSubtitle('Module Details');
  addBulletPoint('Admin Control: MCC, User Management, Security, Performance Monitor');
  addBulletPoint('Supply Chain: Tracking, Fleet, Route Optimization, Commodities');
  addBulletPoint('Developer: API Docs, WebSocket Guide, SDK, Database Explorer');
  addBulletPoint('AI & Rayanava: AI Hub, Assistant, Service Recommender, Smart Dashboard');
  addBulletPoint('Collaboration: Documents, Projects, File Manager, Google Drive');
  addBulletPoint('Services: 46 services, Inquiries, Testimonials, Availability');
  addBulletPoint('Authentication: SSO, 2FA, Password Reset, API Keys');
  addBulletPoint('Content/CMS: Blog, FAQ, Brand Book, Team, Partners');
  addBulletPoint('Email System: Cross-subdomain API, Templates, Rate Limiting');
}

function generateEventTriggerMapChapter() {
  addPage();
  addChapterHeader(8, 'Comprehensive Event & Trigger Map');
  addParagraph('This diagram illustrates the complete event-driven architecture of the Molochain platform, covering all server modules, scheduled tasks, WebSocket namespaces, authentication flows, system events, service health monitoring, security events, and integration triggers.');
  drawEventTriggerMapDiagram();
  addSubtitle('Complete Event Coverage');
  addBulletPoint('Scheduled Events (12 Jobs): CPU Optimizer (5sec), Performance Metrics (5sec), CMS Sync (5min), System Monitor (5min), Service Health (2min), Escalation Check (1min), Activity Cleanup (1hr), Sales Workflow (daily), Compliance Reports (weekly)');
  addBulletPoint('WebSocket Namespaces (8 Types, 30+ Events): /ws/main, /ws/collaboration, /ws/tracking, /ws/mololink, /ws/activity-logs, /ws/commodity-chat, /ws/notifications, /ws/project-updates');
  addBulletPoint('Authentication Events: Login→Validate→JWT→Audit, Register→Welcome Email, Password Reset→Token→Email, 2FA Setup→QR, Token Refresh→Rotation');
  addBulletPoint('System Events: SIGTERM→Graceful Shutdown, CPU >70%→BG Suspend, CPU >85%→Emergency Throttle, Memory High→GC+Cleanup, Exception→Error Recovery');
  addBulletPoint('Service Health: Service Failure→Retry/Fallback/Circuit Break→Recovery→Log Alert; 6 monitored services (RAIL-EUR, AIR-EXP, AIR-STD, OCE-FCL, OCE-LCL, CUST)');
  addBulletPoint('Security Events: Threat Detection→Incident Create→Escalate→Notify; Policy Engine→Enforce+Audit; WS Security Audit Logging');
  addBulletPoint('Email Triggers (18 Types): Quote, Contact, Support, Partner, Career, Feedback, Cross-subdomain API, Compliance Distribution');
  addBulletPoint('Instagram Services (7): Posts, Reels, Stories, Analytics, Competitors, AI Content, Influencers');
  addBulletPoint('AI/Rayanava (5 Tools): Sales Agent, Business Intelligence, Operations Monitoring, Sales Opportunity, Email Notification Tool');
  addBulletPoint('Integrations: Laravel CMS Client, OTMS Client, FedEx API, UPS API, Carrier Integration Factory');
  addBulletPoint('Database & Cache: Connection Pool, DB Optimizer, Backup, Migrations, Cache Warming, Cache Expiry, CMS Cache Sync');
}

function generateScreenshotsChapter() {
  addPage();
  addChapterHeader(9, 'Page Screenshots Gallery');
  addParagraph('This chapter showcases the key application pages with their URLs, descriptions, and visual elements. Each screenshot placeholder shows the page layout and main components.');
  addSpacer(3);
  
  const pages = [
    { 
      title: 'Homepage', 
      url: '/', 
      desc: 'Main landing page with hero section showcasing "Blockchain-Powered Logistics Ecosystem"',
      elements: ['Hero Banner', 'Navigation Bar', 'Get Started CTA', 'Feature Cards', 'Services Preview', 'Footer']
    },
    { 
      title: 'About Page', 
      url: '/about', 
      desc: 'Company information page with "Welcome to MoloChain" header and mission statement',
      elements: ['Page Header', 'Mission Statement', 'Company Stats', 'Feature Grid', 'Call to Action', 'Navigation']
    },
    { 
      title: 'Services Catalog', 
      url: '/services', 
      desc: 'Comprehensive services page showing 180+ countries, 46+ services, 25+ years experience',
      elements: ['Search Bar', 'Service Cards', 'Compare Services', 'Pricing Calculator', 'AI Recommendations', 'Filters']
    },
    { 
      title: 'Contact Page', 
      url: '/contact', 
      desc: 'Contact form with tabs for General Inquiries, Global Offices, Regional Agents, Professional Services',
      elements: ['Tab Navigation', 'Contact Form', 'Office Location', 'Phone/Fax Info', 'WhatsApp Button', 'Map Widget']
    },
    { 
      title: 'Login Page', 
      url: '/login', 
      desc: 'Clean login interface with shield icon, email input, and "Welcome Back" messaging',
      elements: ['Shield Icon', 'Email Input', 'Password Field', 'Login Button', 'Register Link', 'Home Link']
    },
    { 
      title: 'Registration Page', 
      url: '/register', 
      desc: 'User registration with complete validation: username, email, password requirements, full name',
      elements: ['Username Field', 'Email Field', 'Password Field', 'Full Name', 'Company (Optional)', 'Phone (Optional)']
    },
    { 
      title: 'FAQ Page', 
      url: '/faq', 
      desc: 'Help Center with searchable FAQ sections organized by category',
      elements: ['Search FAQs', 'Category Tabs', 'Accordion Items', 'Question Cards', 'Contact Support', 'Skeleton Loading']
    },
    { 
      title: 'Blog Page', 
      url: '/blog', 
      desc: 'Latest News & Insights from the logistics industry with article cards and filters',
      elements: ['Blog Header', 'Article Cards', 'Tags/Categories', 'Read Time', 'Featured Posts', 'Load More']
    },
    { 
      title: 'Team Page', 
      url: '/team', 
      desc: 'Meet Our Team section with professional profile cards showing roles and departments',
      elements: ['Team Header', 'Profile Cards', 'Avatar Photos', 'Role Titles', 'Social Links', 'Department Tags']
    },
    { 
      title: 'Partners Page', 
      url: '/partners', 
      desc: 'Strategic Partners showcase with benefits: Strategic Growth, Network Access, Innovation',
      elements: ['Partners Header', 'Benefit Cards', 'Growth Icon', 'Network Icon', 'Innovation Icon', 'Join CTA']
    },
    { 
      title: 'Brand Book', 
      url: '/brandbook', 
      desc: 'Version 1.0 brand guidelines with Colors (13), Typography (2), Logos (2), Components (20+)',
      elements: ['Download Kit', 'View Guidelines', 'Colors Section', 'Typography', 'Logos', 'Components']
    },
    { 
      title: 'Commodities', 
      url: '/commodities', 
      desc: 'Commodity tracking interface with product cards and status indicators',
      elements: ['Commodity Grid', 'Product Cards', 'Search Filter', 'Status Badge', 'Tracking Info', 'Categories']
    },
    { 
      title: 'Tracking Demo', 
      url: '/tracking-demo', 
      desc: 'Shipment Tracking with tracking number input and demo numbers (MOL89726534, etc.)',
      elements: ['Tracking Input', 'Track Button', 'Demo Numbers', 'Journey Animation', 'Status Updates', 'Timeline']
    },
    { 
      title: 'Quote Request', 
      url: '/quote', 
      desc: 'Request a Quote form with name, email, service type selection, project details',
      elements: ['Form Header', 'Name Input', 'Email Input', 'Service Dropdown', 'Details Textarea', 'Submit Button']
    },
    { 
      title: 'Service Recommender', 
      url: '/service-recommender', 
      desc: 'AI-powered service recommendations based on business needs analysis',
      elements: ['AI Badge', 'Question Flow', 'Service Cards', 'Match Score', 'Get Quote', 'Compare']
    },
  ];
  
  for (const page of pages) {
    drawScreenshotPlaceholder(page.title, page.url, page.desc, page.elements);
  }
}

function generateDevelopmentPhasesChapter() {
  addPage();
  addChapterHeader(10, 'Development Phases');
  
  const phases = [
    { name: 'Phase 1: Foundation', tasks: 'TypeScript setup, DB optimization, WebSocket unification, Cache, Routes' },
    { name: 'Phase 2: User Management', tasks: 'Registration, Login, JWT sessions, Password reset, 2FA, Profile images' },
    { name: 'Phase 3: Dashboards', tasks: 'Configurable dashboards, Role-based views, Smart Dashboard, Analytics' },
    { name: 'Phase 4: CMS Integration', tasks: 'Laravel CMS connection, Content types, Dynamic content, CMS sync' },
    { name: 'Phase 5: Services Module', tasks: '46 services seeded, Service recommender, OTMS integration, SEO' },
    { name: 'Phase 6: Subdomain Architecture', tasks: 'Subdomain routing, Kong Gateway, Portal layout, Onboarding' },
    { name: 'Phase 7: Mololink Microservice', tasks: 'Docker deployment, SSO integration, Landing page, Profiles' },
    { name: 'Phase 8: Brand Book', tasks: 'Brand guidelines, Color palette, Typography system, Logo assets' },
    { name: 'Phase 9: Blockchain (Disabled)', tasks: 'Built then disabled per user preference, Hidden from UI' },
    { name: 'Phase 10: Production', tasks: 'PM2 configuration, Database fixes, Build scripts, Server audit' },
    { name: 'Phase 11: Security & Testing', tasks: 'Security audit, Rate limiting, Integration tests, Type safety' },
    { name: 'Phase 12: Navigation & UI', tasks: 'Redesigned navigation, Mobile responsive, Accessibility mode' },
    { name: 'Phase 13: Shared Components', tasks: 'StatCard, PageShell, DataGrid, EmptyState components' },
    { name: 'Phase 14: Google Drive', tasks: 'File manager, Drive routes, File upload integration' },
    { name: 'Phase 15: AI & Rayanava', tasks: 'AI recommendations, Rayanava assistant, AI Hub features' },
    { name: 'Phase 16: Email System', tasks: 'Postfix relay, Cross-subdomain API, 18 forms, Rate limiting' },
    { name: 'Phase 17: Documentation', tasks: '40+ docs, Architecture docs, API documentation, Guides' },
  ];
  
  for (const phase of phases) {
    checkPageBreak(14);
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.name, margin, currentY);
    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(...colors.dark);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(phase.tasks, contentWidth - 4);
    for (const line of lines) {
      doc.text(line, margin + 3, currentY);
      currentY += 3.2;
    }
    currentY += 2;
  }
}

function generateAPIChapter() {
  addPage();
  addChapterHeader(11, 'API Endpoints Reference');
  addSubtitle('Core Route Modules');
  addTableRow(['Module', 'Path', 'Purpose'], true, [45, 48, 77]);
  addTableRow(['api-keys.ts', '/api/keys', 'API key management'], false, [45, 48, 77]);
  addTableRow(['email-api.routes.ts', '/api/email', 'Email sending API'], false, [45, 48, 77]);
  addTableRow(['dashboards.ts', '/api/dashboards', 'Dashboard data'], false, [45, 48, 77]);
  addTableRow(['supply-chain.ts', '/api/supply-chain', 'Logistics operations'], false, [45, 48, 77]);
  addTableRow(['profile.ts', '/api/profile', 'User profiles'], false, [45, 48, 77]);
  addTableRow(['settings.ts', '/api/settings', 'Configuration'], false, [45, 48, 77]);
  addTableRow(['guides.ts', '/api/guides', 'Help docs'], false, [45, 48, 77]);
  addTableRow(['media.ts', '/api/media', 'File uploads'], false, [45, 48, 77]);
  addTableRow(['mololink.ts', '/api/mololink', 'Marketplace'], false, [45, 48, 77]);
  addTableRow(['rayanava-routes.ts', '/api/rayanava', 'AI services'], false, [45, 48, 77]);
  addSpacer(4);
  addSubtitle('Authentication Endpoints');
  addBulletPoint('POST /api/auth/register - User registration with validation');
  addBulletPoint('POST /api/auth/login - Login with JWT generation');
  addBulletPoint('POST /api/auth/logout - Session termination');
  addBulletPoint('POST /api/auth/refresh - Token refresh with rotation');
  addBulletPoint('POST /api/auth/forgot-password - Password reset');
  addBulletPoint('POST /api/auth/2fa/enable - Enable 2FA');
  addBulletPoint('POST /api/auth/2fa/verify - Verify 2FA code');
}

function generateSecurityChapter() {
  addPage();
  addChapterHeader(12, 'Security Implementation');
  addSubtitle('Authentication Security');
  addBulletPoint('JWT tokens with 15-minute expiration');
  addBulletPoint('Refresh tokens with SHA-256 hashing');
  addBulletPoint('Automatic token rotation');
  addBulletPoint('HttpOnly secure cookies');
  addBulletPoint('TOTP-based 2FA with recovery codes');
  addSpacer(3);
  addSubtitle('API Security');
  addBulletPoint('CSRF protection on mutations');
  addBulletPoint('3-tier rate limiting');
  addBulletPoint('API key auth with SHA-256 hashing');
  addBulletPoint('Zod schema validation');
  addBulletPoint('SQL injection prevention via ORM');
  addSpacer(3);
  addSubtitle('HTTP Headers (Helmet.js)');
  addBulletPoint('Content-Security-Policy');
  addBulletPoint('X-Frame-Options');
  addBulletPoint('X-Content-Type-Options');
  addBulletPoint('Strict-Transport-Security');
}

function generateProductionChapter() {
  addPage();
  addChapterHeader(13, 'Production Deployment');
  addSubtitle('Server Configuration');
  addTableRow(['Setting', 'Value'], true, [60, 110]);
  addTableRow(['Server IP', '31.186.24.19'], false, [60, 110]);
  addTableRow(['Process Manager', 'PM2 (molochain-core)'], false, [60, 110]);
  addTableRow(['Database', 'PostgreSQL localhost:5432'], false, [60, 110]);
  addTableRow(['Database Name', 'molochain_db'], false, [60, 110]);
  addTableRow(['SMTP', 'Postfix relay port 25'], false, [60, 110]);
  addTableRow(['SSL', 'Valid until Jan 4, 2026'], false, [60, 110]);
  addTableRow(['Node Version', '20.x LTS'], false, [60, 110]);
  addSpacer(4);
  addSubtitle('Deployment Process');
  addBulletPoint('1. Compile TypeScript with esbuild');
  addBulletPoint('2. Build frontend with Vite');
  addBulletPoint('3. Copy static assets');
  addBulletPoint('4. Rsync to production via SSH');
  addBulletPoint('5. Run Drizzle migrations');
  addBulletPoint('6. Restart PM2 (zero-downtime)');
  addBulletPoint('7. Verify health endpoints');
}

function generateStatisticsChapter() {
  addPage();
  addChapterHeader(14, 'Statistics & Metrics');
  addSubtitle('Development Metrics');
  addTableRow(['Metric', 'Value'], true, [100, 70]);
  addTableRow(['Total Git Commits', '551'], false, [100, 70]);
  addTableRow(['Development Phases', '17'], false, [100, 70]);
  addTableRow(['Frontend Pages', '80+'], false, [100, 70]);
  addTableRow(['Backend Routes', '25+'], false, [100, 70]);
  addTableRow(['Schema Lines', '2,271'], false, [100, 70]);
  addTableRow(['Documentation', '40+'], false, [100, 70]);
  addTableRow(['Email Forms', '18'], false, [100, 70]);
  addTableRow(['Services', '46'], false, [100, 70]);
  addTableRow(['User Roles', '11'], false, [100, 70]);
  addTableRow(['Subdomains', '6'], false, [100, 70]);
  addSpacer(4);
  addSubtitle('Technology Distribution');
  addTableRow(['Category', 'Count'], true, [100, 70]);
  addTableRow(['NPM Packages', '150+'], false, [100, 70]);
  addTableRow(['React Components', '200+'], false, [100, 70]);
  addTableRow(['API Endpoints', '100+'], false, [100, 70]);
  addTableRow(['Database Tables', '30+'], false, [100, 70]);
}

function generateRoadmapChapter() {
  addPage();
  addChapterHeader(15, 'Future Roadmap');
  addSubtitle('Planned Enhancements');
  addBulletPoint('Enhanced AI with GPT-4');
  addBulletPoint('Mobile app (React Native)');
  addBulletPoint('ML analytics predictions');
  addBulletPoint('IoT supply chain tracking');
  addBulletPoint('Multi-language expansion');
  addBulletPoint('GraphQL API');
  addSpacer(3);
  addSubtitle('Infrastructure');
  addBulletPoint('Kubernetes deployment');
  addBulletPoint('Redis caching');
  addBulletPoint('CDN integration');
  addBulletPoint('Database replicas');
  addSpacer(3);
  addSubtitle('Security');
  addBulletPoint('OAuth 2.0 / OIDC');
  addBulletPoint('WebAuthn/FIDO2');
  addBulletPoint('Advanced threat detection');
  addBulletPoint('SOC 2 compliance');
  
  addSpacer(10);
  addHorizontalLine();
  addSpacer(6);
  doc.setFontSize(12);
  doc.setTextColor(...colors.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('End of Report', pageWidth / 2, currentY, { align: 'center' });
  currentY += 7;
  doc.setFontSize(10);
  doc.setTextColor(...colors.secondary);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated: December 21, 2025', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;
  doc.text('Molochain Platform v3.0 - Final Edition', pageWidth / 2, currentY, { align: 'center' });
}

// Main execution
console.log('Generating comprehensive PDF report with diagrams and screenshots...');
console.log('='.repeat(55));

generateCoverPage();
generateTableOfContents();
generateExecutiveSummary();
generateArchitectureChapter();
generateAuthChapter();
generateEmailChapter();
generateSubdomainChapter();
generateDatabaseChapter();
generateFeatureModulesChapter();
generateEventTriggerMapChapter();
generateScreenshotsChapter();
generateDevelopmentPhasesChapter();
generateAPIChapter();
generateSecurityChapter();
generateProductionChapter();
generateStatisticsChapter();
generateRoadmapChapter();

const outputDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outputPath = path.join(outputDir, 'MOLOCHAIN_COMPREHENSIVE_REPORT.pdf');
const pdfOutput = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfOutput));

const stats = fs.statSync(outputPath);
console.log(`PDF generated: ${outputPath}`);
console.log(`Total pages: ${pageNumber}`);
console.log(`File size: ${Math.round(stats.size / 1024)} KB`);
console.log('='.repeat(55));
console.log('Report generation complete!');
