"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { RoadmapView } from '@/components/RoadmapView';
import { AITutor } from '@/components/AITutor';
import { ResourcesView } from '@/components/ResourcesView';
import { StudentsView } from '@/components/StudentsView';
import { TeachersView } from '@/components/TeachersView';
import { GrammarView } from '@/components/GrammarView';
import { Login } from '@/components/Login';
import { AppTab, User } from '@/types';
import { wordsService } from '@/services/words';

export default function Home() {
    // Initialize tab from URL to prevent flicker/redirect on refresh
    const [activeTab, setActiveTab] = useState<AppTab>(() => {
        if (typeof window === 'undefined') return AppTab.DASHBOARD;
        const path = window.location.pathname;
        if (path === '/roadmap' || path === '/pathway') return AppTab.PATHWAY;
        if (path === '/tutor') return AppTab.AI_TUTOR;
        if (path === '/library') return AppTab.LIBRARY;
        if (path === '/grammar' || path.startsWith('/grammar/')) return AppTab.GRAMMAR;
        if (path === '/students') return AppTab.STUDENTS;
        if (path === '/teachers') return AppTab.TEACHERS;
        return AppTab.DASHBOARD;
    });

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem('mewo_user');
        if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
        }

        const path = window.location.pathname;

        // Only redirect root or malformed paths
        if (path === '/' || path === '') {
            if (savedUser) {
                setActiveTab(AppTab.DASHBOARD);
                window.history.replaceState({}, '', '/hub');
            }
        }

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        // --- Performance: Prune Storage ---
        const pruneStorage = () => {
            const keysToKeep = ['mewo_user', 'mewo_last_tab', 'theme', 'mewo_student_level'];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mewo_') && !keysToKeep.some(k => key.startsWith(k))) {
                    // Pre-defined list dısında kalan eski session verilerini temizle
                    // Örn: eski bildirim okundu bilgileri vb. (Opsiyonel: 30 gün kuralı eklenebilir)
                }
            }
        };
        pruneStorage();
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Tab veya Kullanıcı durumuna göre URL'i güncelle (Clean URL)
        let path = '/';

        if (currentUser) {
            path = '/hub';
            switch (activeTab) {
                case AppTab.PATHWAY: path = '/roadmap'; break;
                case AppTab.AI_TUTOR: path = '/tutor'; break;
                case AppTab.LIBRARY: path = '/library'; break;
                case AppTab.GRAMMAR:
                    path = window.location.pathname.startsWith('/grammar/')
                        ? window.location.pathname
                        : '/grammar';
                    break;
                case AppTab.STUDENTS: path = '/students'; break;
                case AppTab.TEACHERS: path = '/teachers'; break;
                case AppTab.DASHBOARD: path = '/hub'; break;
            }
        }

        if (window.location.pathname !== path) {
            // Login'den dashboard'a geçerken pushState, diğer tablar arası geçişte pushState
            window.history.pushState({}, '', path);
        }

        // Son kalınan tabı kaydet
        if (currentUser) {
            localStorage.setItem('mewo_last_tab', activeTab);
        }

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [activeTab, currentUser, isDarkMode, mounted]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('mewo_user', JSON.stringify(user));
        setActiveTab(AppTab.DASHBOARD);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('mewo_user');
        localStorage.removeItem('mewo_last_tab');
        wordsService.clearCache();
        // Clear all session specific data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mewo_peek_') || key.startsWith('mewo_last_read_')) {
                localStorage.removeItem(key);
            }
        });
        if (typeof window !== 'undefined') window.location.href = '/';
    };

    if (!mounted) return null;

    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    const renderPage = () => {
        switch (activeTab) {
            case AppTab.DASHBOARD:
                return <Dashboard onNavigate={setActiveTab} user={currentUser} />;
            case AppTab.PATHWAY:
                return <RoadmapView />;
            case AppTab.AI_TUTOR:
                return <AITutor />;
            case AppTab.LIBRARY:
                return <ResourcesView />;
            case AppTab.STUDENTS:
                return <StudentsView />;
            case AppTab.TEACHERS:
                return currentUser ? <TeachersView user={currentUser} /> : null;
            case AppTab.GRAMMAR:
                return <GrammarView user={currentUser} />;
            default:
                return <Dashboard onNavigate={setActiveTab} user={currentUser!} />;
        }
    };

    return (
        <div className="min-h-screen transition-colors duration-300">
            <Layout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                user={currentUser}
                onLogout={handleLogout}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 md:pb-10">
                    {renderPage()}
                </div>
            </Layout>
        </div>
    );
}
