'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, CheckCircle, Clock, AlertTriangle, ShieldCheck, User, Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { FestRegistration } from '@/lib/firestore';

interface ParticipantPassCardProps {
  registration: FestRegistration;
  showDownloadBtn?: boolean;
  showPrintBtn?: boolean;
}

export function ParticipantPassCard({
  registration,
  showDownloadBtn = true,
  showPrintBtn = true,
}: ParticipantPassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const qrPayload = JSON.stringify({
    teamId: registration.id || '',
    participantId: registration.participantId,
    eventId: registration.segmentId,
    // Extended fields for gate-scanner verification
    org: 'Adamjee Cantonment College Robotics Club',
    pid: registration.participantId,
    team: registration.teamName,
    seg: registration.segmentTitle,
    hash: registration.verificationHash,
    status: registration.status,
    trx: registration.transactionId || 'NONE',
  });

  const handleDownloadPNG = () => {
    try {
      const qrCanvas = canvasRef.current?.querySelector('canvas');
      if (!qrCanvas) {
        window.print();
        return;
      }

      // Create high-res pass image on virtual canvas
      const width = 800;
      const height = 1000;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#f6f0e7';
      ctx.fillRect(0, 0, width, height);

      // Border outer
      ctx.strokeStyle = '#c94030';
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner card container
      ctx.fillStyle = '#ede7da';
      ctx.fillRect(36, 36, width - 72, height - 72);
      ctx.strokeStyle = '#cfc9bc';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Header top bar
      ctx.fillStyle = '#141210';
      ctx.fillRect(36, 36, width - 72, 110);

      // Header text
      ctx.fillStyle = '#f6f0e7';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Adamjee Cantonment College Robotics Club', width / 2, 80);

      ctx.fillStyle = '#c94030';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('OFFICIAL COMPETITOR ACCESS PASS · FEST 2026', width / 2, 115);

      // Participant ID Box
      ctx.fillStyle = '#141210';
      ctx.fillRect(70, 175, width - 140, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`ID: ${registration.participantId}`, width / 2, 212);

      // Team & Event Info
      ctx.textAlign = 'left';
      ctx.fillStyle = '#141210';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(registration.teamName, 70, 285);

      ctx.fillStyle = '#c94030';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Segment: ${registration.segmentTitle}`, 70, 325);

      ctx.fillStyle = '#3a3530';
      ctx.font = '18px sans-serif';
      ctx.fillText(`Institution: ${registration.institution}`, 70, 365);
      ctx.fillText(`Team Leader: ${registration.leaderName} (${registration.leaderPhone})`, 70, 400);

      if (registration.members && registration.members.length > 0) {
        const memStr = registration.members.map((m) => m.name).join(', ');
        ctx.fillText(`Members: ${memStr}`, 70, 435);
      }

      // Draw QR Code
      const qrImg = new Image();
      qrImg.src = qrCanvas.toDataURL('image/png');
      qrImg.onload = () => {
        const qrSize = 260;
        const qrX = (width - qrSize) / 2;
        const qrY = 480;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
        ctx.strokeStyle = '#cfc9bc';
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // Security Hash
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6b6258';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`VERIFICATION HASH: ${registration.verificationHash}`, width / 2, 790);

        // Verification Status Badge
        ctx.fillStyle = registration.status === 'verified' ? '#047857' : '#b45309';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`STATUS: ${registration.status.toUpperCase()} · TRXID: ${registration.transactionId || 'N/A'}`, width / 2, 825);

        // Footer note
        ctx.fillStyle = '#6b6258';
        ctx.font = '14px sans-serif';
        ctx.fillText('Please present this pass at the Adamjee Cantonment College entry gate.', width / 2, 880);
        ctx.font = 'bold 13px monospace';
        ctx.fillText('accrcofficialmail2019@gmail.com · Dhaka, Bangladesh', width / 2, 915);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `${registration.participantId || 'ACCRC-PASS'}_Pass.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
    } catch (err) {
      console.error('Error generating pass image:', err);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Visual Card */}
      <div
        ref={cardRef}
        id="accrc-printable-pass"
        className="relative bg-[#ede7da] border-2 border-[#c94030] shadow-lg rounded overflow-hidden max-w-lg mx-auto print:border-black print:shadow-none print:m-0"
      >
        {/* Top Header */}
        <div className="bg-[#141210] text-[#f6f0e7] p-5 text-center relative border-b border-[#cfc9bc]">
          <div className="flex items-center justify-center gap-2.5 mb-1.5">
            <img
              src="/accrc-logo.png"
              alt="ACCRC Crest"
              className="h-9 w-9 rounded-full object-contain filter drop-shadow"
            />
            <h2 className="font-extrabold text-base tracking-wide text-white">
              Adamjee Cantonment College Robotics Club
            </h2>
          </div>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#c94030] font-bold">
            Official Competitor Pass · Fest 2026
          </p>
        </div>

        {/* Participant ID Banner */}
        <div className="bg-[#1e1b18] text-white py-2 px-4 flex items-center justify-between border-b border-[#cfc9bc]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#9a9088]">
            Participant ID
          </span>
          <span className="font-mono text-sm font-bold tracking-widest text-[#f6f0e7] bg-[#c94030]/20 px-2 py-0.5 border border-[#c94030]/40 rounded">
            {registration.participantId}
          </span>
        </div>

        {/* Main Pass Body */}
        <div className="p-6 space-y-4">
          {/* Team & Segment */}
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#c94030] block">
              Team Name
            </span>
            <h3 className="text-2xl font-extrabold text-[#141210] leading-snug">
              {registration.teamName}
            </h3>
            <p className="text-sm font-bold text-[#3a3530] mt-0.5">
              {registration.segmentTitle}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#f6f0e7] p-3.5 border border-[#cfc9bc] rounded">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-[#6b6258] uppercase flex items-center gap-1">
                <Building size={11} /> Institution
              </span>
              <p className="font-bold text-[#141210] truncate" title={registration.institution}>
                {registration.institution}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-[#6b6258] uppercase flex items-center gap-1">
                <User size={11} /> Team Leader
              </span>
              <p className="font-bold text-[#141210]">
                {registration.leaderName}
              </p>
              <p className="text-[10px] font-mono text-[#6b6258] flex items-center gap-1">
                <Phone size={10} /> {registration.leaderPhone}
              </p>
            </div>

            {registration.members && registration.members.length > 0 && (
              <div className="sm:col-span-2 space-y-0.5 pt-1 border-t border-[#cfc9bc]">
                <span className="font-mono text-[10px] text-[#6b6258] uppercase">
                  Team Members ({registration.members.length}):
                </span>
                <p className="text-[11px] text-[#3a3530]">
                  {registration.members.map((m) => m.name).join(' · ')}
                </p>
              </div>
            )}
          </div>

          {/* QR Code Centerpiece */}
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-[#cfc9bc] rounded text-center">
            <div ref={canvasRef} className="p-2 bg-white rounded">
              <QRCodeCanvas
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="font-mono text-[10px] text-[#6b6258] mt-2 tracking-wider">
              HASH: {registration.verificationHash}
            </p>
            <p className="text-[11px] text-[#3a3530] font-sans mt-0.5">
              Scan at Adamjee Cantonment College Entry Gate
            </p>
          </div>

          {/* Status & Payment strip */}
          <div className="flex items-center justify-between p-3 bg-[#ede7da] border border-[#cfc9bc] rounded text-xs font-mono">
            <div>
              <span className="text-[#6b6258] block text-[10px] uppercase">Payment / TrxID:</span>
              <strong className="text-[#141210] font-bold">
                {registration.paymentMethod || 'bKash'} — {registration.transactionId || 'FREE / PENDING'}
              </strong>
            </div>
            <div className="text-right">
              {registration.status === 'verified' ? (
                <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 px-2 py-1 rounded text-[10px] uppercase border border-emerald-300">
                  <CheckCircle size={12} /> Verified
                </span>
              ) : registration.status === 'rejected' ? (
                <span className="inline-flex items-center gap-1 text-red-800 font-bold bg-red-100 px-2 py-1 rounded text-[10px] uppercase border border-red-300">
                  <AlertTriangle size={12} /> Rejected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-100 px-2 py-1 rounded text-[10px] uppercase border border-amber-300">
                  <Clock size={12} /> Payment Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="bg-[#ede7da] border-t border-[#cfc9bc] px-5 py-2.5 flex items-center justify-between text-[10px] font-mono text-[#6b6258]">
          <span>Adamjee Cantonment College</span>
          <span>accrcofficialmail2019@gmail.com</span>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        {showDownloadBtn && (
          <Button
            type="button"
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <Download size={15} /> Download Pass (PNG)
          </Button>
        )}
        {showPrintBtn && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <Printer size={15} /> Print Pass
          </Button>
        )}
      </div>
    </div>
  );
}
