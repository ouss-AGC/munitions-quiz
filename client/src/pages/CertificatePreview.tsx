import Certificate from '@/components/Certificate';

export default function CertificatePreview() {
  // Mock data for preview
  const mockData = {
    studentName: "Ahmed Ben Ali",
    score: 52,
    totalQuestions: 57,
    percentage: 91,
    rank: 1,
    date: new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  };

  return (
    <Certificate
      studentName={mockData.studentName}
      score={mockData.score}
      totalQuestions={mockData.totalQuestions}
      percentage={mockData.percentage}
      rank={mockData.rank}
      date={mockData.date}
    />
  );
}

