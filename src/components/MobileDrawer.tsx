import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, ChevronDown } from "lucide-react";
import React from "react";

interface MobileDrawerProps {
	categories?: Record<string, string[]>;
}

export default function MobileDrawer({ categories }: MobileDrawerProps) {
	const [open, setOpen] = React.useState(false);
	const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

	const toggleCategory = (category: string) => {
		setExpandedCategory(expandedCategory === category ? null : category);
	};

	// Reset expanded category when drawer is closed
	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			setExpandedCategory(null);
		}
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon" className="lg:hidden">
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

					{/* Categories */}
					{categories && Object.entries(categories).map(([category, subcategories]) => (
						<div key={category} className="border-t pt-2 mt-2">
							<button
								onClick={() => toggleCategory(category)}
								className="w-full flex items-center justify-between text-base font-medium py-2 px-2 rounded hover:bg-accent transition-colors text-left"
							>
								<span>{category}</span>
								{expandedCategory === category ? (
									<ChevronDown className="w-4 h-4" />
								) : (
									<ChevronRight className="w-4 h-4" />
								)}
							</button>

							{/* Collapsible subcategories */}
							{expandedCategory === category && (
								<div className="ml-4 mt-1 space-y-1">
									{subcategories.map((subcat) => (
										<Link
											key={subcat}
											href={`/products/${encodeURIComponent(category)}/${encodeURIComponent(subcat)}`}
											className="block text-sm py-2 px-2 rounded hover:bg-accent transition-colors text-left"
											onClick={() => setOpen(false)}
										>
											{subcat}
										</Link>
									))}
								</div>
							)}
						</div>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
