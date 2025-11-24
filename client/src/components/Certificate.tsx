import { Trophy } from "lucide-react";

interface CertificateProps {
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  rank: number;
  date: string;
}

export default function Certificate({
  studentName,
  score,
  totalQuestions,
  percentage,
  rank,
  date,
}: CertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white max-w-4xl w-full relative print:max-w-none">
        {/* Close button - hidden when printing */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 print:hidden"
        >
          ✕
        </button>

        {/* Certificate Content */}
        <div className="p-8 md:p-12">
          {/* Decorative Border */}
          <div className="border-8 border-double border-blue-900 p-6 md:p-10">
            <div className="border-4 border-blue-700 p-6 md:p-10">
              <div className="border-2 border-blue-500 p-6 md:p-10 bg-gradient-to-br from-blue-50 to-white">
                
                {/* Header with emblems */}
                <div className="flex justify-between items-start mb-8">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-blue-900">ACADÉMIE MILITAIRE</div>
                    <div className="text-xs text-blue-700">République Tunisienne</div>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-yellow-600 mx-auto mb-2" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-900">Munitions LASM 3</div>
                    <div className="text-xs text-blue-700">2025/2026</div>
                  </div>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center mb-6">
                  <div className="h-px bg-blue-300 flex-1"></div>
                  <div className="mx-4">
                    <svg width="60" height="30" viewBox="0 0 60 30" className="text-blue-700">
                      <path
                        d="M 10 15 Q 20 5, 30 15 Q 40 25, 50 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <div className="h-px bg-blue-300 flex-1"></div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-5xl font-serif text-blue-900 mb-2 tracking-wide">
                    CERTIFICAT D'EXCELLENCE
                  </h1>
                  <p className="text-sm text-blue-700 italic">
                    Test de révision - Généralités sur les Munitions
                  </p>
                </div>

                {/* Presentation */}
                <div className="text-center mb-8">
                  <p className="text-lg text-blue-900 mb-6">
                    CE CERTIFICAT EST FIÈREMENT DÉCERNÉ À
                  </p>
                  <div className="border-b-2 border-blue-900 pb-2 mb-6">
                    <h2 className="text-3xl md:text-4xl font-serif text-blue-900 font-bold">
                      {studentName}
                    </h2>
                  </div>
                </div>

                {/* Achievement Details */}
                <div className="text-center mb-8 space-y-3">
                  <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
                    En reconnaissance de sa performance exceptionnelle au test de révision Généralités sur les Munitions LASM 3,
                    ayant obtenu le <span className="font-bold text-blue-900">meilleur score de la promotion</span> avec
                    une note remarquable de <span className="font-bold text-blue-900">{score}/{totalQuestions}</span>,
                    soit <span className="font-bold text-blue-900">{percentage}%</span> de réussite.
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
                    Cette distinction témoigne d'une maîtrise exceptionnelle des connaissances en munitions
                    et d'un engagement exemplaire dans l'excellence académique militaire.
                  </p>
                </div>

                {/* Decorative divider */}
                <div className="flex items-center justify-center mb-8">
                  <div className="h-px bg-blue-300 flex-1"></div>
                  <div className="mx-4 text-yellow-600">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div className="h-px bg-blue-300 flex-1"></div>
                </div>

                {/* Signatures and Date */}
                <div className="flex justify-between items-end mt-12">
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-2">Date de délivrance</p>
                    <p className="text-base font-semibold text-blue-900">{date}</p>
                  </div>

                  <div className="text-center">
                    <div className="w-64">
                      {/* Instructor initials */}
                      <div className="mb-2">
                        <p className="text-3xl font-serif italic text-blue-900" style={{ fontFamily: 'Georgia, serif' }}>
                          O.A.
                        </p>
                      </div>
                      <div className="border-t-2 border-blue-900 pt-2">
                        <p className="text-sm font-semibold text-blue-900">Lt Col Oussama Atoui</p>
                        <p className="text-xs text-blue-700">Instructeur d'Armes et Munitions</p>
                        <p className="text-xs text-blue-700 italic">Munitions LASM 3 - 2025/2026</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer seal */}
                <div className="text-center mt-8 pt-6 border-t border-blue-300">
                  <div className="inline-flex items-center gap-2 text-blue-900">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-900 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold">EXCELLENCE ACADÉMIQUE</p>
                      <p className="text-xs">Académie Militaire de Tunisie</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Print Button - hidden when printing */}
        <div className="text-center pb-8 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
          >
            📄 Imprimer le Certificat
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:max-w-none,
          .print\\:max-w-none * {
            visibility: visible;
          }
          .print\\:max-w-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

