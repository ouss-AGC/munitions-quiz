import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DISCIPLINES, type Discipline } from '@/types/discipline';
import { GraduationCap } from 'lucide-react';

interface DisciplineSelectionProps {
  onSelect: (discipline: Discipline) => void;
}

export default function DisciplineSelection({ onSelect }: DisciplineSelectionProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/academy-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Académie Militaire
          </h1>
          <p className="text-xl text-white/90">
            Sélectionnez votre discipline d'examen
          </p>
          <p className="text-sm text-white/70 mt-2">
            Lt Col Oussama Atoui - Instructeur Armes et Munitions
          </p>
        </div>

        {/* Discipline Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {DISCIPLINES.map((discipline) => (
            <Card 
              key={discipline.id}
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-2xl cursor-pointer group"
              onClick={() => onSelect(discipline)}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${discipline.color} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                  {discipline.icon}
                </div>
                <CardTitle className="text-2xl mb-2">
                  {discipline.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  {discipline.fullName}
                </CardDescription>
                <div className="inline-block px-4 py-1 bg-primary/10 rounded-full mt-2">
                  <span className="text-sm font-semibold text-primary">
                    {discipline.level}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  {discipline.description}
                </p>
                <Button 
                  size="lg" 
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  Commencer l'examen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Année académique 2025/2026
          </p>
        </div>
      </div>
    </div>
  );
}
