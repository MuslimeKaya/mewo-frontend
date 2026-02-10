import React from 'react';
import { X, Shield, FileText, HelpCircle, Lock } from 'lucide-react';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'privacy' | 'terms' | 'support' | 'about';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, type }) => {
    if (!isOpen) return null;

    const content = {
        privacy: {
            title: 'Gizlilik Politikası',
            icon: <Shield className="w-8 h-8 text-emerald-500" />,
            text: `Mewo Language Lab olarak gizliliğinize önem veriyoruz. 
            Verileriniz eğitim kalitesini artırmak ve size özel bir deneyim sunmak için kullanılır. 
            Üçüncü taraflarla asla paylaşılmaz. Tüm verileriniz modern şifreleme yöntemleriyle korunmaktadır.`
        },
        terms: {
            title: 'Kullanım Koşulları',
            icon: <FileText className="w-8 h-8 text-blue-500" />,
            text: `Platformumuzu kullanarak eğitim odaklı ve saygılı bir topluluk kurmayı kabul etmiş sayılırsınız. 
            Yapay zeka araçlarımızı dürüstlükle kullanmanız ve topluluk kurallarına uymanız beklenmektedir.`
        },
        support: {
            title: 'Destek & Yardım',
            icon: <HelpCircle className="w-8 h-8 text-brand-600" />,
            text: `Herhangi bir sorun yaşarsanız destek ekibimiz yanınızda. 
            Bize support@mewolab.com adresinden ulaşabilirsiniz. 
            Eğitmenlerinizle doğrudan iletişim kurmak için Dashboard üzerindeki bildirimleri kullanabilirsiniz.`
        },
        about: {
            title: 'Mewo Hakkında',
            icon: <Lock className="w-8 h-8 text-amber-500" />,
            text: `Mewo, yapay zeka destekli modern bir dil laboratuvarıdır. 
            Amacımız, dil öğrenme sürecini kişiselleştirilmiş ve eğlenceli bir hale getirmektir. 
            Öğrenciler ve eğitmenler arasındaki bağı güçlendirerek verimliliği artırıyoruz.`
        }
    };

    const activeContent = content[type];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                            {activeContent.icon}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                        {activeContent.title}
                    </h2>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {activeContent.text}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        Anladım
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16" />
            </div>
        </div>
    );
};
