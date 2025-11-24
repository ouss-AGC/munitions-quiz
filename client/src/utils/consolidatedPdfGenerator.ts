import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import type { LeaderboardEntry } from '@/types/quiz';
import type { Discipline } from '@/types/discipline';

Chart.register(...registerables);

export async function generateConsolidatedReport(
  students: LeaderboardEntry[],
  discipline: Discipline
): Promise<void> {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Load background image once
  let bgImage: HTMLImageElement | null = null;
  try {
    const img = new Image();
    img.src = '/academy-bg.png';
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    bgImage = img;
  } catch (error) {
    console.error('Failed to load background image:', error);
  }

  // Helper function to add background to page
  const addBackground = () => {
    if (bgImage) {
      pdf.addImage(bgImage, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST', 0.05);
    }
    pdf.setFillColor(255, 255, 255);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
  };

  // ===== COVER PAGE =====
  addBackground();
  
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('ACADÉMIE MILITAIRE', pageWidth / 2, 60, { align: 'center' });

  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('RAPPORT CONSOLIDÉ', pageWidth / 2, 80, { align: 'center' });
  pdf.text('DES RÉSULTATS', pageWidth / 2, 92, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`${discipline.fullName}`, pageWidth / 2, 110, { align: 'center' });
  pdf.text(`${discipline.level}`, pageWidth / 2, 120, { align: 'center' });

  pdf.setFontSize(14);
  pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 140, { align: 'center' });
  pdf.text(`Nombre d'étudiants: ${students.length}`, pageWidth / 2, 150, { align: 'center' });

  // Footer on cover
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Lt Col Oussama Atoui', pageWidth / 2, pageHeight - 30, { align: 'center' });
  pdf.text(`Instructeur ${discipline.fullName}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
  pdf.text('Année Académique 2025/2026', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Signature on cover
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.3);
  pdf.line(pageWidth - 80, pageHeight - 40, pageWidth - 30, pageHeight - 40);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(0, 51, 102);
  pdf.text('O.A', pageWidth - 55, pageHeight - 43, { align: 'center' });

  // ===== TABLE OF CONTENTS =====
  pdf.addPage();
  addBackground();

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('TABLE DES MATIÈRES', 20, 30);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  let tocY = 45;
  pdf.text('1. Statistiques Globales de la Classe ........................... Page 3', 25, tocY);
  tocY += 10;

  students.forEach((student, index) => {
    const pageNum = 4 + (index * 2); // Each student gets ~2 pages
    pdf.text(`${index + 2}. ${student.studentName} ........................... Page ${pageNum}`, 25, tocY);
    tocY += 7;
    
    if (tocY > pageHeight - 30) {
      pdf.addPage();
      addBackground();
      tocY = 30;
    }
  });

  // ===== CLASS STATISTICS =====
  pdf.addPage();
  addBackground();

  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('STATISTIQUES GLOBALES DE LA CLASSE', 20, 30);

  const classAverage = students.length > 0
    ? (students.reduce((sum, s) => sum + s.percentage, 0) / students.length).toFixed(1)
    : '0';
  
  const highestScore = students.length > 0 ? Math.max(...students.map(s => s.percentage)) : 0;
  const lowestScore = students.length > 0 ? Math.min(...students.map(s => s.percentage)) : 0;
  const passRate = students.length > 0
    ? ((students.filter(s => s.percentage >= 50).length / students.length) * 100).toFixed(1)
    : '0';

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const stats = [
    { label: 'Nombre total d\'étudiants', value: students.length.toString() },
    { label: 'Moyenne de la classe', value: `${classAverage}%` },
    { label: 'Score le plus élevé', value: `${highestScore}%` },
    { label: 'Score le plus bas', value: `${lowestScore}%` },
    { label: 'Taux de réussite (≥50%)', value: `${passRate}%` }
  ];

  let statsY = 50;
  stats.forEach(stat => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${stat.label}:`, 25, statsY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(stat.value, 120, statsY);
    statsY += 10;
  });

  // Distribution chart placeholder
  statsY += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('DISTRIBUTION DES NOTES', 25, statsY);
  
  const ranges = [
    { label: '90-100%', count: students.filter(s => s.percentage >= 90).length },
    { label: '75-89%', count: students.filter(s => s.percentage >= 75 && s.percentage < 90).length },
    { label: '60-74%', count: students.filter(s => s.percentage >= 60 && s.percentage < 75).length },
    { label: '50-59%', count: students.filter(s => s.percentage >= 50 && s.percentage < 60).length },
    { label: '<50%', count: students.filter(s => s.percentage < 50).length }
  ];

  statsY += 10;
  pdf.setFont('helvetica', 'normal');
  ranges.forEach(range => {
    pdf.text(`${range.label}: ${range.count} étudiant(s)`, 30, statsY);
    statsY += 8;
  });

  // ===== INDIVIDUAL STUDENT REPORTS =====
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    pdf.addPage();
    addBackground();

    // Student header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    const studentFullTitle = student.grade ? `${student.grade} ${student.studentName}` : student.studentName;
    pdf.text(`RAPPORT - ${studentFullTitle}`, 20, 25);

    // Student info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    let infoY = 33;
    if (student.studentClass && student.registerNumber) {
      pdf.text(`Classe: ${student.studentClass} - N° ${student.registerNumber}`, 20, infoY);
      infoY += 6;
    }
    pdf.text(`Date: ${new Date(student.completedAt).toLocaleDateString('fr-FR')}`, 20, infoY);

    // Score box
    const scoreOutOf20 = ((student.score / student.totalQuestions) * 20).toFixed(2);
    pdf.setDrawColor(0, 51, 102);
    pdf.setLineWidth(1);
    pdf.rect(20, 45, pageWidth - 40, 20);

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204);
    pdf.text(`${scoreOutOf20}/20`, pageWidth / 2, 58, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${student.score}/${student.totalQuestions} questions (${student.percentage}%)`, pageWidth / 2, 63, { align: 'center' });

    // Metrics
    let yPos = 75;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('MÉTRIQUES', 20, yPos);

    yPos += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const rank = students.findIndex(s => s.studentName === student.studentName) + 1;
    const metrics = [
      { label: 'Classement', value: `${rank}/${students.length}` },
      { label: 'Moyenne de la classe', value: `${classAverage}%` },
      { label: 'Écart à la moyenne', value: `${(student.percentage - parseFloat(classAverage)).toFixed(1)}%` }
    ];

    metrics.forEach(metric => {
      pdf.text(`• ${metric.label}: ${metric.value}`, 25, yPos);
      yPos += 7;
    });

    // Diagnostic
    yPos += 5;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 51, 102);
    pdf.text('DIAGNOSTIC', 20, yPos);

    yPos += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const diagnostic = generateDiagnostic(student, parseFloat(classAverage));
    const lines = pdf.splitTextToSize(diagnostic, pageWidth - 50);
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        addBackground();
        yPos = 30;
      }
      pdf.text(line, 25, yPos);
      yPos += 5;
    });
  }

  // Save consolidated PDF
  const fileName = `Rapport_Consolide_${discipline.id}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}

function generateDiagnostic(student: LeaderboardEntry, classAverage: number): string {
  const performance = student.percentage;
  let diagnostic = '';

  if (performance >= 90) {
    diagnostic = `Performance EXCELLENTE (${performance}%). L'étudiant maîtrise parfaitement la matière et se situe bien au-dessus de la moyenne de classe (${classAverage}%). `;
  } else if (performance >= 75) {
    diagnostic = `Performance TRÈS BONNE (${performance}%). L'étudiant démontre une solide compréhension de la matière. `;
  } else if (performance >= 60) {
    diagnostic = `Performance BONNE (${performance}%). L'étudiant a acquis les connaissances essentielles. `;
  } else if (performance >= 50) {
    diagnostic = `Performance PASSABLE (${performance}%). L'étudiant a atteint le seuil minimum mais doit renforcer ses connaissances. `;
  } else {
    diagnostic = `Performance INSUFFISANTE (${performance}%). L'étudiant doit revoir l'ensemble de la matière et bénéficier d'un accompagnement supplémentaire. `;
  }

  const gap = performance - classAverage;
  if (gap > 10) {
    diagnostic += `L'étudiant se distingue nettement avec un écart positif de ${gap.toFixed(1)}% par rapport à la moyenne.`;
  } else if (gap > 0) {
    diagnostic += `L'étudiant se situe légèrement au-dessus de la moyenne de classe (+${gap.toFixed(1)}%).`;
  } else if (gap > -10) {
    diagnostic += `L'étudiant se situe légèrement en dessous de la moyenne de classe (${gap.toFixed(1)}%).`;
  } else {
    diagnostic += `L'étudiant nécessite une attention particulière avec un écart significatif de ${gap.toFixed(1)}% par rapport à la moyenne.`;
  }

  return diagnostic;
}
