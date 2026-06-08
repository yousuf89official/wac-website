
import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Button = ({ children, variant = 'primary', size = 'default', className = '', ...props }: any) => {
    const base = "inline-flex items-center justify-center font-mono text-2xs uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 disabled:pointer-events-none disabled:opacity-50";
    const sizes: any = {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-2xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
    };
    const variants: any = {
        primary: "bg-foreground text-background hover:bg-primary",
        secondary: "bg-card text-foreground-soft border border-border hover:text-foreground hover:border-foreground/30",
        outline: "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
        ghost: "text-foreground-soft hover:text-foreground hover:bg-foreground/5",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20",
        ai: "bg-accent text-background hover:bg-accent/90 border border-transparent",
    };
    return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export const Badge = ({ children, variant = 'default', className = '', style = undefined }: any) => {
    const variants: any = {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-card text-foreground-soft border border-border",
        outline: "text-foreground-soft border border-border",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        inactive: "bg-card text-foreground-soft/60 border border-border",
        ai: "bg-accent/10 text-accent border border-accent/20",
    };
    return (
        <div
            className={`inline-flex items-center px-2.5 py-0.5 font-mono text-2xs uppercase tracking-widest transition-colors ${variants[variant]} ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

export const Card = ({ children, className = '' }: any) => (
    <div className={`bg-card border border-border text-foreground transition-colors ${className}`}>{children}</div>
);

export const Input = (props: any) => (
    <input className="flex h-10 w-full border border-border bg-background-2 px-3 py-2 font-sans text-sm text-foreground transition-colors placeholder:text-foreground-soft/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 focus-visible:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50" {...props} />
);

export const Label = ({ children, className = '' }: any) => (
    <label className={`font-mono text-2xs uppercase tracking-widest text-foreground-soft leading-none ${className}`}>{children}</label>
);

export const SelectWrapper = ({ children, className = "", ...props }: any) => (
    <div className="relative">
        <select
            className={`flex h-10 w-full items-center justify-between border border-border bg-background-2 px-3 py-2 pr-8 font-sans text-sm text-foreground transition-colors placeholder:text-foreground-soft/60 focus:outline-none focus:ring-1 focus:ring-foreground/30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
            {...props}
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground-soft">
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
        </div>
    </div>
);
