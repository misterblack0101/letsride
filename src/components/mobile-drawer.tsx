import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import React from "react";

export default function MobileDrawer() {
	const [open, setOpen] = React.useState(false);

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
					<Link
						href="/products"
						className="flex items-center gap-2 text-base font-medium py-2 px-2 rounded hover:bg-accent transition-colors text-left"
						onClick={() => setOpen(false)}
					>
						All Products
					</Link>
				</nav>
			</SheetContent>
		</Sheet>
	);
}
