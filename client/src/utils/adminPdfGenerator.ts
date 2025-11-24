import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import type { LeaderboardEntry } from '@/types/quiz';
import type { Discipline } from '@/types/discipline';

// Register Chart.js components
Chart.register(...registerables);

export async function generateAdminReport(
  student: LeaderboardEntry,
  allStudents: LeaderboardEntry[],
  discipline: Discipline
): Promise<void> {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add background image
  try {
    const img = new Image();
    img.src = '/academy-bg.png';
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    pdf.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight, '', 'FAST', 0.1);
  } catch (error) {
    console.error('Failed to load background image:', error);
  }

  // Add white overlay
  pdf.setFillColor(255, 255, 255);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('RAPPORT DÉTAILLÉ DE PERFORMANCE', pageWidth / 2, 25, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`${discipline.fullName} - ${discipline.level}`, pageWidth / 2, 32, { align: 'center' });

  // Student Info
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  const studentFullTitle = student.grade ? `${student.grade} ${student.studentName}` : student.studentName;
  pdf.text(`Étudiant: ${studentFullTitle}`, 20, 45);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  
  let infoY = 52;
  if (student.studentClass && student.registerNumber) {
    pdf.text(`Classe: ${student.studentClass} - N° ${student.registerNumber}`, 20, infoY);
    infoY += 6;
  }
  pdf.text(`Date: ${new Date(student.completedAt).toLocaleDateString('fr-FR')}`, 20, infoY);

  // Score Box
  const scoreOutOf20 = ((student.score / student.totalQuestions) * 20).toFixed(2);
  pdf.setDrawColor(0, 51, 102);
  pdf.setLineWidth(1);
  pdf.rect(20, 60, pageWidth - 40, 25);

  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 102, 204);
  pdf.text(`${scoreOutOf20}/20`, pageWidth / 2, 75, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`${student.score}/${student.totalQuestions} questions (${student.percentage}%)`, pageWidth / 2, 82, { align: 'center' });

  // Performance Metrics
  let yPos = 95;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('MÉTRIQUES DE PERFORMANCE', 20, yPos);

  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  const correctAnswers = student.score;
  const incorrectAnswers = student.totalQuestions - student.score;
  const avgResponseTime = student.userAnswers && student.userAnswers.length > 0
    ? (student.userAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / student.userAnswers.length).toFixed(1)
    : '0';

  const classAverage = allStudents.length > 0
    ? (allStudents.reduce((sum, s) => sum + s.percentage, 0) / allStudents.length).toFixed(1)
    : '0';

  const rank = allStudents.findIndex(s => s.studentName === student.studentName) + 1;

  const metrics = [
    { label: 'Réponses correctes', value: `${correctAnswers}` },
    { label: 'Réponses incorrectes', value: `${incorrectAnswers}` },
    { label: 'Temps moyen par question', value: `${avgResponseTime}s` },
    { label: 'Classement', value: `${rank}/${allStudents.length}` },
    { label: 'Moyenne de la classe', value: `${classAverage}%` },
    { label: 'Écart à la moyenne', value: `${(student.percentage - parseFloat(classAverage)).toFixed(1)}%` }
  ];

  metrics.forEach(metric => {
    pdf.text(`• ${metric.label}: ${metric.value}`, 25, yPos);
    yPos += 6;
  });

  // Charts Section
  yPos += 5;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('ANALYSE GRAPHIQUE', 20, yPos);

  // Generate pie chart for correct/incorrect answers
  const pieChartImage = await generatePieChart(correctAnswers, incorrectAnswers);
  if (pieChartImage) {
    pdf.addImage(pieChartImage, 'PNG', 20, yPos + 5, 80, 60);
  }

  // Generate bar chart for comparison with class average
  const barChartImage = await generateBarChart(student.percentage, parseFloat(classAverage));
  if (barChartImage) {
    pdf.addImage(barChartImage, 'PNG', 110, yPos + 5, 80, 60);
  }

  // Diagnostic Section
  yPos += 70;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 51, 102);
  pdf.text('DIAGNOSTIC ET RECOMMANDATIONS', 20, yPos);

  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);

  // Strengths and weaknesses
  const diagnostic = generateDiagnostic(student, parseFloat(classAverage));
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Points forts:', 25, yPos);
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  diagnostic.strengths.forEach(strength => {
    const lines = pdf.splitTextToSize(`• ${strength}`, pageWidth - 50);
    lines.forEach((line: string) => {
      pdf.text(line, 30, yPos);
      yPos += 5;
    });
  });

  yPos += 3;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Points à améliorer:', 25, yPos);
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  diagnostic.weaknesses.forEach(weakness => {
    const lines = pdf.splitTextToSize(`• ${weakness}`, pageWidth - 50);
    lines.forEach((line: string) => {
      pdf.text(line, 30, yPos);
      yPos += 5;
    });
  });

  yPos += 3;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recommandations:', 25, yPos);
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  diagnostic.recommendations.forEach(rec => {
    const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 50);
    lines.forEach((line: string) => {
      pdf.text(line, 30, yPos);
      yPos += 5;
    });
  });

  // Footer
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  const instructorTitle = `Lt Col Oussama Atoui - Instructeur ${discipline.fullName}`;
  pdf.text(instructorTitle, pageWidth / 2, pageHeight - 15, { align: 'center' });
  pdf.text('Académie Militaire - Année Académique 2025/2026', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Signature with initials
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.3);
  pdf.line(pageWidth - 80, pageHeight - 25, pageWidth - 30, pageHeight - 25);
  
  // Add initials O.A above the line
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(0, 51, 102);
  pdf.text('O.A', pageWidth - 55, pageHeight - 28, { align: 'center' });
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Signature', pageWidth - 55, pageHeight - 22, { align: 'center' });

  // Save PDF
  pdf.save(`Rapport_${student.studentName}_${discipline.id}.pdf`);
}

async function generatePieChart(correct: number, incorrect: number): Promise<string | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const config: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Correctes', 'Incorrectes'],
      datasets: [{
        data: [correct, incorrect],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'Répartition des Réponses',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  const chart = new Chart(ctx, config);
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for chart to render
  const image = canvas.toDataURL('image/png');
  chart.destroy();
  
  return image;
}

async function generateBarChart(studentScore: number, classAverage: number): Promise<string | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Étudiant', 'Moyenne Classe'],
      datasets: [{
        label: 'Score (%)',
        data: [studentScore, classAverage],
        backgroundColor: ['#3b82f6', '#9ca3af'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Comparaison avec la Classe',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: false
        }
      }
    }
  };

  const chart = new Chart(ctx, config);
  await new Promise(resolve => setTimeout(resolve, 500));
  const image = canvas.toDataURL('image/png');
  chart.destroy();
  
  return image;
}

function generateDiagnostic(student: LeaderboardEntry, classAverage: number): {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze performance
  if (student.percentage >= 90) {
    strengths.push('Excellente maîtrise du sujet avec un score supérieur à 90%');
    strengths.push('Démontre une compréhension approfondie de la matière');
    recommendations.push('Continuer à maintenir ce niveau d\'excellence');
    recommendations.push('Envisager de mentorer d\'autres étudiants');
  } else if (student.percentage >= 75) {
    strengths.push('Très bonne compréhension générale du sujet');
    strengths.push('Performance solide et constante');
    recommendations.push('Réviser les quelques points manqués pour atteindre l\'excellence');
    recommendations.push('Approfondir les sujets complexes');
  } else if (student.percentage >= 60) {
    strengths.push('Compréhension satisfaisante des concepts de base');
    weaknesses.push('Quelques lacunes dans la maîtrise complète du sujet');
    recommendations.push('Réviser les chapitres où des erreurs ont été commises');
    recommendations.push('Pratiquer davantage avec des exercices supplémentaires');
  } else if (student.percentage >= 50) {
    weaknesses.push('Compréhension partielle du sujet nécessitant un renforcement');
    weaknesses.push('Plusieurs concepts clés nécessitent une révision approfondie');
    recommendations.push('Revoir l\'ensemble du programme avec attention');
    recommendations.push('Solliciter de l\'aide auprès de l\'instructeur pour les points difficiles');
    recommendations.push('Augmenter le temps d\'étude et de pratique');
  } else {
    weaknesses.push('Compréhension insuffisante du sujet');
    weaknesses.push('Nécessite un travail important de révision');
    recommendations.push('Reprendre le programme depuis le début avec l\'instructeur');
    recommendations.push('Mettre en place un plan de révision structuré');
    recommendations.push('Participer à des sessions de tutorat supplémentaires');
  }

  // Compare with class average
  const diff = student.percentage - classAverage;
  if (diff > 10) {
    strengths.push(`Performance nettement supérieure à la moyenne de la classe (+${diff.toFixed(1)}%)`);
  } else if (diff > 0) {
    strengths.push(`Performance légèrement supérieure à la moyenne de la classe (+${diff.toFixed(1)}%)`);
  } else if (diff > -10) {
    weaknesses.push(`Performance légèrement inférieure à la moyenne de la classe (${diff.toFixed(1)}%)`);
    recommendations.push('Étudier avec les camarades pour comprendre leur approche');
  } else {
    weaknesses.push(`Performance significativement inférieure à la moyenne de la classe (${diff.toFixed(1)}%)`);
    recommendations.push('Rencontrer l\'instructeur pour un plan de rattrapage personnalisé');
  }

  // Analyze response time
  if (student.userAnswers && student.userAnswers.length > 0) {
    const avgTime = student.userAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / student.userAnswers.length;
    if (avgTime < 20) {
      weaknesses.push('Temps de réponse très rapide, possiblement trop précipité');
      recommendations.push('Prendre plus de temps pour réfléchir avant de répondre');
    } else if (avgTime > 50) {
      weaknesses.push('Temps de réponse élevé, indiquant possiblement des hésitations');
      recommendations.push('Renforcer la confiance en révisant davantage le programme');
    } else {
      strengths.push('Gestion appropriée du temps de réflexion');
    }
  }

  return { strengths, weaknesses, recommendations };
}
