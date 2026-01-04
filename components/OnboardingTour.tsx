import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Target, LayoutDashboard, Cpu, Plus } from 'lucide-react';

interface Step {
    title: string;
    content: string;
    icon: React.ReactNode;
}

const steps: Step[] = [
    {
        title: "Welcome to Kinetic",
        content: "The tactical command center for high-performance teams. Let's get you oriented for maximum synchronization.",
        icon: <Cpu className="text-neon-green" size={32} />
    },
    {
        title: "Strategic Objectives",
        content: "Define your long-term goals in the Goals tab. Every task should align with a strategic objective to ensure mission success.",
        icon: <Target className="text-neon-cyan" size={32} />
    },
    {
        title: "Tactical Deployment",
        content: "Use the Tasks view to schedule your week. Drag and drop tasks to balance load and optimize team output.",
        icon: <LayoutDashboard className="text-amber-500" size={32} />
    },
    {
        title: "AI Analysis",
        content: "Stuck on a complex task? Use the AI Assistant to break down objectives into actionable tactical sequences.",
        icon: <Cpu className="text-neon-green" size={32} />
    },
    {
        title: "Ready for Launch?",
        content: "Create your first task using the '+' button in the sidebar or the floating action button on mobile.",
        icon: <Plus className="text-neon-green" size={32} />
    }
];

interface OnboardingTourProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen: propIsOpen, onClose }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

    useEffect(() => {
        if (propIsOpen === undefined) {
            const hasSeenTour = localStorage.getItem('kinetic_onboarding_seen');
            if (!hasSeenTour) {
                setInternalIsOpen(true);
            }
        }
    }, [propIsOpen]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            setInternalIsOpen(false);
        }
        localStorage.setItem('kinetic_onboarding_seen', 'true');
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-obsidian-950/40 backdrop-blur-md animate-in fade-in duration-500">
            <div className="glass-layer-3 max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pt-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                        {step.icon}
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{step.title}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-10">
                        {step.content}
                    </p>

                    <div className="flex items-center gap-2 mb-8">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all ${idx === currentStep ? 'w-8 bg-neon-green' : 'w-2 bg-white/10'}`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between w-full gap-4">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>

                        <button
                            onClick={nextStep}
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-neon-green text-obsidian-950 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        >
                            {currentStep === steps.length - 1 ? 'Get Started' : 'Next Directive'}
                            {currentStep < steps.length - 1 && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                    <div
                        className="h-full bg-neon-green transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;