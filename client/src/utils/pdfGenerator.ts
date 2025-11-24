import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { QuizResult } from '@/types/quiz';
import type { Discipline } from '@/types/discipline';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function generateStudentCertificate(
  result: QuizResult,
  discipline: Discipline
): Promise<void> {
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add background image (very light)
  try {
    const img = new Image();
    img.src = '/academy-bg.png';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(reject, 2000);
    });
    pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST', 0.05);
  } catch (error) {
    console.log('Background image not loaded, continuing without it');
  }

  // White background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // ===== DECORATIVE BORDERS =====
  // Outer blue border
  pdf.setDrawColor(0, 51, 102); // Dark blue
  pdf.setLineWidth(3);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner green border
  pdf.setDrawColor(34, 139, 34); // Green
  pdf.setLineWidth(2);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Decorative inner border (thin blue)
  pdf.setDrawColor(0, 102, 204); // Light blue
  pdf.setLineWidth(0.5);
  pdf.rect(20, 20, pageWidth - 40, pageHeight - 40);

  // ===== LOGO =====
  try {
    const logo = new Image();
    logo.src = '/academy-logo.png';
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
      setTimeout(reject, 2000);
    });
    pdf.addImage(logo, 'PNG', 30, 25, 25, 30);
  } catch (error) {
    console.log('Logo not loaded, continuing without it');
  }

  // ===== DECORATIVE ELEMENT (top center) =====
  pdf.setDrawColor(0, 51, 102);
  pdf.setLineWidth(1);
  // Simple decorative curves
  pdf.line(pageWidth / 2 - 30, 30, pageWidth / 2 - 15, 35);
  pdf.line(pageWidth / 2 - 15, 35, pageWidth / 2, 30);
  pdf.line(pageWidth / 2, 30, pageWidth / 2 + 15, 35);
  pdf.line(pageWidth / 2 + 15, 35, pageWidth / 2 + 30, 30);

  // ===== TITLE =====
  const scoreOutOf20 = ((result.score / result.totalQuestions) * 20);
  const isPassing = scoreOutOf20 >= 10;
  const documentTitle = isPassing ? 'CERTIFICAT DE RÉUSSITE' : 'ATTESTATION DE PARTICIPATION';
  
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text(documentTitle, pageWidth / 2, 55, { align: 'center' });

  // Subtitle
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(0, 102, 204);
  pdf.text(`${discipline.fullName} - ${discipline.level}`, pageWidth / 2, 63, { align: 'center' });

  // Decorative line under title
  pdf.setDrawColor(0, 51, 102);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 80, 67, pageWidth / 2 + 80, 67);

  // ===== "THIS CERTIFICATE IS PROUDLY PRESENTED TO" =====
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 51, 102);
  pdf.text('CE CERTIFICAT EST FIÈREMENT DÉCERNÉ À', pageWidth / 2, 80, { align: 'center' });

  // ===== STUDENT NAME (large and centered) =====
  const studentFullTitle = result.grade ? `${result.grade} ${result.studentName}` : result.studentName;
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text(studentFullTitle, pageWidth / 2, 95, { align: 'center' });

  // Underline student name
  const nameWidth = pdf.getTextWidth(studentFullTitle);
  pdf.setDrawColor(0, 51, 102);
  pdf.setLineWidth(0.8);
  pdf.line(pageWidth / 2 - nameWidth / 2 - 5, 98, pageWidth / 2 + nameWidth / 2 + 5, 98);

  // Class and Register Number
  if (result.studentClass && result.registerNumber) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Classe: ${result.studentClass} - N° de Registre: ${result.registerNumber}`, pageWidth / 2, 105, { align: 'center' });
  }

  // ===== CERTIFICATION TEXT =====
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  
  let certificationText, certificationText2, certificationText3;
  
  if (isPassing) {
    certificationText = `Ceci certifie que l'étudiant a réussi l'évaluation de contrôle de connaissances en ${discipline.fullName}`;
    certificationText2 = `conduite conformément aux exigences académiques de l'Académie Militaire, démontrant ainsi`;
    certificationText3 = `une maîtrise des compétences et connaissances requises dans cette discipline.`;
  } else {
    certificationText = `Ceci atteste que l'étudiant a participé à l'évaluation de contrôle de connaissances en ${discipline.fullName}`;
    certificationText2 = `conduite conformément aux exigences académiques de l'Académie Militaire.`;
    certificationText3 = `L'étudiant est invité à approfondir ses connaissances pour atteindre le niveau requis.`;
  }
  
  const textY = result.studentClass ? 115 : 110;
  pdf.text(certificationText, pageWidth / 2, textY, { align: 'center' });
  pdf.text(certificationText2, pageWidth / 2, textY + 6, { align: 'center' });
  pdf.text(certificationText3, pageWidth / 2, textY + 12, { align: 'center' });

  // ===== SCORE BOX =====
  const scoreOutOf20Display = scoreOutOf20.toFixed(2);
  const observation = isPassing ? getObservation(scoreOutOf20) : 'PARTICIPATION';
  const observationColor = isPassing ? getObservationColor(scoreOutOf20) : [100, 100, 100];

  const scoreBoxY = textY + 25;
  
  // Score label
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('NOTE OBTENUE:', pageWidth / 2 - 60, scoreBoxY);

  // Score value
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 102, 204);
  pdf.text(`${scoreOutOf20Display}/20`, pageWidth / 2 - 60, scoreBoxY + 10);

  // Observation label
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  const observationLabel = isPassing ? 'OBSERVATION:' : 'STATUT:';
  pdf.text(observationLabel, pageWidth / 2 + 20, scoreBoxY);

  // Observation value
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(observationColor[0], observationColor[1], observationColor[2]);
  pdf.text(observation, pageWidth / 2 + 20, scoreBoxY + 10);

  // ===== DATE =====
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(0, 0, 0);
  const dateStr = result.completedAt.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  pdf.text(dateStr, 40, pageHeight - 35);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Date de délivrance', 40, pageHeight - 30);

  // ===== ACADEMY INFO (center bottom) =====
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('ACADÉMIE MILITAIRE', pageWidth / 2, pageHeight - 35, { align: 'center' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Année Académique 2025/2026', pageWidth / 2, pageHeight - 30, { align: 'center' });

  // ===== SIGNATURE =====
  // Signature line
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth - 90, pageHeight - 35, pageWidth - 40, pageHeight - 35);

  // Initials O.A above the line
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(0, 51, 102);
  pdf.text('O.A', pageWidth - 65, pageHeight - 38, { align: 'center' });

  // Signature label
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Lt Col Oussama Atoui`, pageWidth - 65, pageHeight - 28, { align: 'center' });
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Instructeur ${discipline.fullName}`, pageWidth - 65, pageHeight - 24, { align: 'center' });

  // Save PDF
  pdf.save(`Certificat_${result.studentName}_${discipline.id}.pdf`);
}

function getObservation(scoreOutOf20: number): string {
  if (scoreOutOf20 >= 18) return 'EXCELLENT';
  if (scoreOutOf20 >= 16) return 'TRÈS BIEN';
  if (scoreOutOf20 >= 14) return 'BIEN';
  if (scoreOutOf20 >= 12) return 'ASSEZ BIEN';
  if (scoreOutOf20 >= 10) return 'MOYEN';
  return 'INSUFFISANT';
}

function getObservationColor(scoreOutOf20: number): [number, number, number] {
  if (scoreOutOf20 >= 18) return [0, 128, 0]; // Dark green - EXCELLENT
  if (scoreOutOf20 >= 16) return [34, 139, 34]; // Green - TRÈS BIEN
  if (scoreOutOf20 >= 14) return [0, 102, 204]; // Blue - BIEN
  if (scoreOutOf20 >= 12) return [255, 165, 0]; // Orange - ASSEZ BIEN
  if (scoreOutOf20 >= 10) return [255, 140, 0]; // Dark orange - MOYEN
  return [220, 20, 60]; // Red - INSUFFISANT
}

// Keep old functions for backward compatibility
function getPerformanceLabel(percentage: number): string {
  if (percentage >= 90) return 'EXCELLENT';
  if (percentage >= 75) return 'TRÈS BIEN';
  if (percentage >= 60) return 'BIEN';
  if (percentage >= 50) return 'PASSABLE';
  return 'INSUFFISANT';
}

function getPerformanceColor(percentage: number): [number, number, number] {
  if (percentage >= 90) return [0, 128, 0]; // Green
  if (percentage >= 75) return [0, 102, 204]; // Blue
  if (percentage >= 60) return [255, 165, 0]; // Orange
  if (percentage >= 50) return [255, 140, 0]; // Dark Orange
  return [220, 20, 60]; // Red
}
