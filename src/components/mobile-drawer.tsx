"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function MobileDrawer() {
	const { theme, setTheme } = useTheme();
	const themeLabel = theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";
	const themeIcon = theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
	const router = useRouter();
	const [open, setOpen] = React.useState(false);

	const handleNav = (href: string) => {
		setOpen(false);
		router.push(href);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" className="md:hidden">
					<Menu className="w-6 h-6" />
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-64 p-0">
				<SheetHeader className="p-4 pb-2 border-b">
					<SheetTitle className="text-lg font-headline">Menu</SheetTitle>
				</SheetHeader>
				<nav className="flex flex-col gap-2 p-4">
					<button
						onClick={() => handleNav("/")}
						className="flex items-center gap-2 text-base font-medium py-2 px-2 rounded hover:bg-accent transition-colors text-left"
					>
						Store
					</button>
					<button
						onClick={() => handleNav("/about")}
						className="flex items-center gap-2 text-base font-medium py-2 px-2 rounded hover:bg-accent transition-colors text-left"
					>
						About Us
					</button>
					<div className="mt-4 flex flex-col gap-1">
						<button
							type="button"
							className="flex items-center gap-2 text-base font-medium py-2 px-2 rounded hover:bg-accent transition-colors focus:outline-none w-full"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							{themeIcon}
							<span className="capitalize">{themeLabel} mode</span>
						</button>
						<span className="text-xs text-muted-foreground pl-10">Tap to toggle theme</span>
					</div>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
