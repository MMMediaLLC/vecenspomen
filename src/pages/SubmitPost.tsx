import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemorialPost, PostType, PackageType } from '../types';
import { Step1 } from '../components/SubmissionFlow/Step1';
import { Step2 } from '../components/SubmissionFlow/Step2';
import { Step3 } from '../components/SubmissionFlow/Step3';
import { Step5 } from '../components/SubmissionFlow/Step5'; // Now becomes conceptual Step 4
import { PACKAGES } from '../constants';
import { Check, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

interface SubmitPostProps {
  onComplete: (post: MemorialPost) => void;
  initialPost?: MemorialPost;
  isEditMode?: boolean;
}

export const SubmitPost: React.FC<SubmitPostProps> = ({ onComplete, initialPost, isEditMode }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [post, setPost] = useState<Partial<MemorialPost>>(initialPost || {
    status: 'Во проверка',
    createdAt: new Date().toISOString(),
    photoUrl: DEFAULT_PHOTO,
    guestbookEnabled: true,
  });

  const updatePost = (data: Partial<MemorialPost>) => {
    setPost(prev => ({ ...prev, ...data }));
    setValidationError(null);
  };

  const generateSlug = (fullName: string, deathYear?: number) => {
    const base = fullName
      .toLowerCase()
      .trim()
      .replace(/[^\wа-шА-Ш0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
    return `${base}${deathYear ? `-${deathYear}` : ''}`;
  };

  const validateStep = (): string | null => {
    switch (step) {
      case 1:
        if (!post.type) return 'Изберете тип на објава.';
        break;
      case 2:
        if (!post.fullName?.trim()) return 'Внесете име и презиме на починатото лице.';
        
        if (post.type === 'ТАЖНА ВЕСТ') {
          if (!post.city) return 'Изберете град.';
          if (!post.dateOfDeath) return 'Внесете датум на смрт.';
          if (!post.dateOfFuneral) return 'Внесете датум на погреб.';
          if (!post.timeOfFuneral) return 'Внесете време на погреб.';
          if (!post.placeOfFuneral?.trim()) return 'Внесете локација на погреб.';
          if (!post.introText?.trim()) return 'Внесете воведна порака (над фотографијата).';
          if (!post.mainText?.trim()) return 'Внесете главна порака (под фотографијата).';
        } else if (post.type === 'ПОСЛЕДЕН ПОЗДРАВ') {
          if (!post.mainText?.trim()) return 'Внесете текст на последниот поздрав.';
          if (!post.senderName?.trim()) return 'Внесете од кого е последниот поздрав.';
        } else if (post.type === 'СОЧУВСТВО') {
          if (!post.mainText?.trim()) return 'Внесете текст за сочувство.';
          if (!post.senderName?.trim()) return 'Внесете од кого е сочувството.';
        } else if (post.type === 'ПОМЕН') {
          if (!post.city) return 'Изберете град.';
          if (!post.pomenSubtype) return 'Изберете тип на помен.';
          if (!post.pomenDate) return 'Внесете датум на помен.';
          if (!post.pomenTime) return 'Внесете време на помен.';
          if (!post.pomenPlace?.trim()) return 'Внесете локација на помен.';
        }
        break;
      case 3: // Photo step
        if (post.type === 'СОЧУВСТВО' && (!post.photoUrl || post.photoUrl === DEFAULT_PHOTO)) {
          return 'За изразување сочувство, фотографијата е задолжителна.';
        }
        break;
      case 4: // conceptual Step 4: Preview & Payment
        if (!post.package) return 'Изберете пакет за да продолжите.';
        break;
      default:
        break;
    }
    return null;
  };

  const nextStep = async () => {
    const error = validateStep();
    if (error) {
      setValidationError(error);
      return;
    }

    if (step === 4) {
      handleFinalSubmit();
      return;
    }

    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setValidationError(null);
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const finalPost: MemorialPost = {
      ...post,
      id: crypto.randomUUID?.() || `post-${Date.now()}`,
      slug: generateSlug(post.fullName || 'memorial', post.deathYear),
      guestbookEnabled: post.package !== 'Стандардна',
    } as MemorialPost;

    await new Promise(r => setTimeout(r, 1500));
    onComplete(finalPost);
    setStep(5); // Success step
    setIsSubmitting(false);
  };

  const steps = ['Тип', 'Податоци', 'Фото', 'Плаќање']; // Now 4 steps

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            selectedType={post.type || null}
            onSelect={(type: PostType) => {
              updatePost({ type });
              setStep(2);
              window.scrollTo(0, 0);
            }}
          />
        );
      case 2:
        return <Step2 post={post} updatePost={updatePost} />;
      case 3:
        return <Step3 photoUrl={post.photoUrl || DEFAULT_PHOTO} onPhotoChange={(url) => updatePost({ photoUrl: url })} />;
      case 4:
        return (
          <Step5
            post={post}
            selectedPackage={post.package || null}
            onSelect={(pkg: PackageType) => updatePost({ package: pkg })}
          />
        );
      case 5:
        return (
          <div className="max-w-md mx-auto text-center space-y-6 py-12 animate-in zoom-in-95 duration-700">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Check size={40} />
            </div>
            <h2 className="text-3xl font-serif">Објавата е поднесена!</h2>
            <p className="text-stone-600 leading-relaxed font-light">
              Вашата објава е во фаза на административна проверка. Штом биде одобрена, ќе добиете известување на вашата е-пошта и ќе биде јавно достапна на порталот.
            </p>
            <div className="bg-stone-50 border border-stone-100 rounded-sm p-6 text-sm text-stone-500 space-y-2">
              <p>ID на објава: <span className="font-mono text-stone-900">#{(post as any).id?.substring(0, 8)}</span></p>
              <p>Статус: <strong className="text-stone-900">Во проверка</strong></p>
            </div>
            <button
              onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
              className="w-full py-4 bg-stone-900 text-white rounded-sm font-medium hover:bg-stone-800 transition-colors shadow-lg"
            >
              Врати се на почетна
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-12 md:py-20 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {step < 5 && (
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-3xl md:text-5xl font-serif">
              {isEditMode ? 'Уреди објава' : 'Поднесете објава'}
            </h1>
            <p className="text-stone-500 max-w-xl mx-auto font-light leading-relaxed">
              {isEditMode 
                ? 'Направете ги потребните измени на објавата.' 
                : 'Следете ги чекорите за да поднесете достојно меморијално известување.'}
            </p>
          </div>
        )}

        {step < 5 && (
          <div className="mb-16">
            <div className="flex justify-between mb-4 px-2 relative">
              <div className="absolute top-4 left-0 right-0 h-[1px] bg-stone-200 -z-10" />
              {steps.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-500 ${
                    step > i + 1 ? 'bg-stone-900 border-stone-900 text-white' : step === i + 1 ? 'border-stone-900 text-stone-900 bg-white' : 'border-stone-200 text-stone-300 bg-white'
                  }`}>
                    {step > i + 1 ? <Check size={14} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${
                    step === i + 1 ? 'text-stone-900' : 'text-stone-300'
                  }`}>
                    {s}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden shadow-inner mt-8">
              <div
                className="h-full bg-stone-900 transition-all duration-700 ease-in-out"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className={`bg-white p-6 md:p-16 rounded-sm border border-stone-200 shadow-sm relative overflow-hidden transition-all duration-500 ${step === 5 ? 'min-h-fit' : 'min-h-[600px]'}`}>
          {step > 1 && step < 5 && (
            <div className="mb-12 pb-6 border-b border-stone-100 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-serif text-stone-900">
                {step === 2 && 'Податоци и текст'}
                {step === 3 && 'Фотографија'}
                {step === 4 && 'Преглед и плаќање'}
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold bg-stone-50 px-3 py-1 rounded-full">
                Чекор {step} од 4
              </span>
            </div>
          )}

          {renderStep()}

          {validationError && (
            <div className="mt-8 flex items-center gap-3 text-red-600 bg-red-50 border border-red-100 rounded-sm px-6 py-4 text-sm animate-in shake duration-500">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="font-medium">{validationError}</span>
            </div>
          )}
        </div>

        {step > 1 && step < 5 && (
          <div className="mt-12 flex justify-between items-center">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <ArrowLeft size={16} /> Назад
            </button>

            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className="bg-stone-900 text-white px-10 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all flex items-center gap-3 shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={16} /> Обработка...</>
              ) : step === 4 ? (
                <>{isEditMode ? 'Зачувај промени' : 'Поднеси Објава'} <ArrowRight size={18} /></>
              ) : (
                <>Продолжи <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
