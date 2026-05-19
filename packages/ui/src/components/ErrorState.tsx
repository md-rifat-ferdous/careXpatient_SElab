import React from 'react';
import { Card, Typography, Button, cn } from '@carexpatient/ui';
import { AlertTriangle, Lock, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface StateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  fullPage?: boolean;
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "An unexpected error occurred. Please try again later.", 
  icon = <AlertTriangle className="w-12 h-12 text-rose-500" />,
  actionText = "Try Again",
  onAction,
  className,
  fullPage = false
}: StateProps) {
  const content = (
    <div className={cn("flex flex-col items-center text-center p-12 max-w-md mx-auto", className)}>
      <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-6 border border-rose-100 shadow-xl shadow-rose-500/5">
        {icon}
      </div>
      <Typography variant="h2" className="mb-2">{title}</Typography>
      <Typography variant="body" className="text-text-muted mb-8">{description}</Typography>
      <div className="flex gap-4">
        {onAction && (
          <Button onClick={onAction} className="gap-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> {actionText}
          </Button>
        )}
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );

  if (fullPage) {
    return <div className="min-h-screen flex items-center justify-center bg-surface p-6">{content}</div>;
  }

  return <Card className="border-rose-100 bg-rose-50/10">{content}</Card>;
}

export function UnauthorizedState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="flex flex-col items-center text-center p-12 max-w-md bg-white rounded-[40px] shadow-2xl border border-border-soft">
        <div className="w-24 h-24 rounded-[32px] bg-amber-50 flex items-center justify-center mb-8 border border-amber-100 shadow-xl shadow-amber-500/5">
          <Lock className="w-10 h-10 text-amber-600" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <ShieldAlert className="w-3 h-3" /> Restricted Access
        </div>
        <Typography variant="h1" className="mb-4">Unauthorized</Typography>
        <Typography variant="body" className="text-text-muted mb-10">
          You don&apos;t have permission to access this area. Please contact your administrator or sign in with a different account.
        </Typography>
        <div className="flex flex-col w-full gap-3">
          <Button asChild className="h-14 rounded-2xl font-bold shadow-lg shadow-primary/20">
            <Link href="/login">Sign in to Another Account</Link>
          </Button>
          <Button variant="ghost" asChild className="h-14 rounded-2xl font-bold text-text-muted">
            <Link href="/">Back to Landing Page</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
