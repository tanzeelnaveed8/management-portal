
"use client"

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Github,
  Chrome,
  ListTodo,
  CheckCircle2
} from 'lucide-react';
import Logo from './../public/icon.png';


const App = () => {

  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center p-4 font-sans text-text-body">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 text-accent font-bold text-3xl mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-text-inverse">
             <img src={Logo.src} alt="Meetech Logo" className="w-full h-full" />
            </div>
            <span className="tracking-tight text-text-primary">Meetech</span>
          </div>
          <p className="text-text-muted text-sm">Enterprise Project Management Suite</p>
        </div>

        {/* Welcome Card */}
        <div className="bg-bg-surface border border-border-default rounded-2xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Welcome to Meetech
          </h2>
          <p className="text-text-muted mb-8">
            Streamline your project management workflow with our comprehensive suite of tools for teams of all sizes.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-xs text-text-muted">Task Management</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-xs text-text-muted">Project Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-xs text-text-muted">Team Collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-accent/10 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span className="text-xs text-text-muted">Analytics</span>
            </div>
          </div>

          {/* Enhanced Login Button */}
          <button
            onClick={() => window.location.href = '/login'}
            className="group relative w-full bg-accent hover:bg-accent-hover text-text-inverse py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20 overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            {/* Button content */}
            <div className="relative flex items-center justify-center gap-2">
              <span>Access Meetech Portal</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>

         
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-disabled">
            © 2026 Meetech Development. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;