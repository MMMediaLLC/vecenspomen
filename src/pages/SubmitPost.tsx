import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createLemonCheckout } from '../lib/payments';
import { MemorialPost, PostType, PackageType } from '../types';
import { Step1 } from '../components/SubmissionFlow/Step1';
import { Step2 } from '../components/SubmissionFlow/Step2';
import { Step3 } from '../components/SubmissionFlow/Step3';
import { Step5 } from '../components/SubmissionFlow/Step5'; // Now becomes conceptual Step 4
import { OGImageTemplate } from '../components/OGImageTemplate';
import { generateAndUploadOGImage } from '../lib/og';
import { PACKAGES } from '../constants';
import { Check, ArrowRight, ArrowLeft, Loader2, AlertCircle, Share2 } from 'lucide-react';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400';

interface SubmitPostProps {
  onComplete: (post: MemorialPost) => Promise<string | void> | void;
  initialPost?: MemorialPost;
  isEditMode?: boolean;
}

export const SubmitPost: React.FC<SubmitPostProps> = ({ onComplete, initialPost, isEditMode }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingOG, setIsGeneratingOG] = useState(false);
  
  const [post, setPost] = useState<Partial<MemorialPost>>(() => {
    const type = searchParams.get('type') as PostType | null;
    const fullName = searchParams.get('fullName') || '';
    const relId = searchParams.get('relId') || '';
    const relSlug = searchParams.get('relSlug') || '';

    return {
      ...(initialPost || {}),
      status: 'Во проверка',
      createdAt: new Date().toISOString(),
      photoUrl: DEFAULT_PHOTO,
      guestbookEnabled: true,
      ...(type ? { type } : {}),
      ...(fullName ? { fullName } : {}),
      ...(relId ? { relatedToId: relId } : {}),
      ...(relSlug ? { relatedToSlug: relSlug } : {}),
    };
  });

  // Pre-advance to step 2 if type is pre-filled
  useEffect(() => {
    if (searchParams.get('type') && !isEditMode) {
      setStep(2);
    }
  }, []);

  const updatePost = (data: Partial<MemorialPost>) => {
    setPost(prev => ({ ...prev, ...data }));
    setValidationError(null);
  };

  const cyrillicToLatin = (str: string): string => {
    const map: Record<string, string> = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','ѓ':'gj','е':'e','ж':'zh',
      'з':'z','ѕ':'dz','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m',
      'н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ќ':'kj',
      'у':'u','ф':'f','х':'h','ц':'c','ч':'ch','џ':'dj','ш':'sh',
      'А':'a','Б':'b','В':'v','Г':'g','Д':'d','Ѓ':'gj','Е':'e','Ж':'zh',
      'З':'z','Ѕ':'dz','И':'i','Ј':'j','К':'k','Л':'l','Љ':'lj','М':'m',
      'Н':'n','Њ':'nj','О':'o','П':'p','Р':'r','С':'s','Т':'t','Ќ':'kj',
      'У':'u','Ф':'f','Х':'h','Ц':'c','Ч':'ch','Џ':'dj','Ш':'sh',
    };
    return str.split('').map(ch => map[ch] ?? ch).join('');
  };

  const generateSlug = (fullName: string, deathYear?: number) => {
    const base = cyrillicToLatin(fullName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
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
          if (!post.familyNote?.trim()) return 'Внесете „Со љубов и почит од".';
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
          if (!post.familyNote?.trim()) return 'Внесете „Со љубов и почит од".';
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
    try {
      const tempId = isEditMode && post.id ? post.id : (crypto.randomUUID?.() || `post-${Date.now()}`);
      // Always generate a fresh Latin slug — never reuse an existing Cyrillic slug
      const isLatinSlug = (s: string) => /^[a-z0-9-]+$/.test(s);
      const tempSlug = (isEditMode && post.slug && isLatinSlug(post.slug))
        ? post.slug
        : generateSlug(post.fullName || 'memorial', post.deathYear);

      // 1. Generate OG Image BEFORE final submission if possible
      // We need to render the template first (it's in the JSX below)
      setIsGeneratingOG(true);
      
      // Small delay to ensure the hidden template is rendered with current 'post' state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const shareImageUrl = await generateAndUploadOGImage({ ...post, id: tempId, slug: tempSlug }, 'og-image-container');
      setIsGeneratingOG(false);

      const finalPost: MemorialPost = {
        ...post,
        id: tempId,
        slug: tempSlug,
        shareImageUrl: shareImageUrl || post.shareImageUrl || '',
        guestbookEnabled: post.package === 'Истакнат',
      } as MemorialPost;

      const savedId = await onComplete(finalPost);
      const checkoutPostId = (typeof savedId === 'string' && savedId) ? savedId : finalPost.id;

      if (!isEditMode && finalPost.package) {
        console.log('redirecting to Lemon with postId:', checkoutPostId);
        const checkoutUrl = await createLemonCheckout(checkoutPostId, finalPost.package);
        window.location.href = checkoutUrl;
      } else {
        // If edit mode, skip checkout and show success
        setStep(5);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsGeneratingOG(false);
      setValidationError('Настана грешка при процесирање. Ве молиме обидете се повторно.');
      setIsSubmitting(false);
    }
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
            updatePost={updatePost}
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

        <div className={`bg-white p-6 md:p-16 rounded-sm border border-stone-200 shadow-sm relative overflow-hidden transition-all duration-500 ${step >= 2 && step <= 4 ? 'min-h-[600px]' : ''}`}>
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
          <div className="mt-8 md:mt-12 flex justify-between items-center">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <ArrowLeft size={16} /> Назад
            </button>

            <button
              onClick={nextStep}
              disabled={isSubmitting || isGeneratingOG}
              className="bg-stone-900 text-white px-6 py-3 md:px-10 md:py-4 text-[11px] md:text-sm font-bold uppercase tracking-wider md:tracking-[0.2em] hover:bg-stone-800 transition-all flex items-center gap-3 shadow-xl disabled:opacity-50"
            >
              {isGeneratingOG ? (
                <><Share2 className="animate-pulse" size={16} /> Генерирање преглед...</>
              ) : isSubmitting ? (
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
      {/* Hidden OG image template for capture */}
      <div className="overflow-hidden h-0 w-0 absolute pointer-events-none opacity-0" aria-hidden="true">
        <div id="og-image-container">
          <OGImageTemplate post={post} />
        </div>
      </div>
    </div>
  );
};
