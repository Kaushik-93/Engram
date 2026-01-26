"use client";

import * as React from "react";

type ThemeColor = "cyan" | "green" | "purple" | "pink" | "yellow";

interface ThemeContextType {
    color: ThemeColor;
    setColor: (color: ThemeColor) => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
    color: "cyan",
    setColor: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [color, setColorState] = React.useState<ThemeColor>("cyan");

    React.useEffect(() => {
        // Load saved theme from localStorage
        const saved = localStorage.getItem("theme-color") as ThemeColor;
        if (saved) {
            setColorState(saved);
        }
    }, []);

    React.useEffect(() => {
        // Apply theme class to document
        document.documentElement.classList.remove(
            "theme-cyan",
            "theme-green",
            "theme-purple",
            "theme-pink",
            "theme-yellow"
        );
        document.documentElement.classList.add(`theme-${color}`);
    }, [color]);

    const setColor = (newColor: ThemeColor) => {
        setColorState(newColor);
        localStorage.setItem("theme-color", newColor);
    };

    return (
        <ThemeContext.Provider value={{ color, setColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return React.useContext(ThemeContext);
}
