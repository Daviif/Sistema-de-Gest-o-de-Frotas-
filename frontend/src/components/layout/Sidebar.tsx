import { Link } from 'react-router-dom'
import { Truck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NavigationItem {
	name: string
	href: string
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

type SidebarProps = {
	navigation: NavigationItem[]
	currentPath: string
	onClose?: () => void
}

export default function Sidebar({ navigation, currentPath, onClose }: SidebarProps) {
	return (
		<div data-slot="site-sidebar" className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4 shadow-lg">
			<div className="flex h-16 shrink-0 items-center justify-between">
				<div className="flex items-center gap-2">
					<Truck className="h-8 w-8 text-primary" />
					<span className="text-xl font-bold text-foreground">Frota</span>
				</div>
				{onClose && (
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={onClose}
					>
						<X className="h-5 w-5" />
					</Button>
				)}
			</div>

			<nav className="flex flex-1 flex-col">
				<ul role="list" className="flex flex-1 flex-col gap-y-7">
					<li>
						<ul role="list" className="-mx-2 space-y-1">
							{navigation.map((item) => {
								const isActive = currentPath === item.href
								return (
									<li key={item.name}>
										<Link
											to={item.href}
											onClick={onClose}
											className={cn(
												isActive
													? 'bg-primary/10 text-primary'
													: 'text-muted-foreground hover:text-primary hover:bg-muted',
												'group flex gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 font-semibold transition-colors'
											)}
										>
											<item.icon
												className={cn(
													isActive ? 'text-primary' : 'text-primary/70 group-hover:text-primary',
													'h-6 w-6 shrink-0'
												)}
											/>
											{item.name}
										</Link>
									</li>
								)
							})}
						</ul>
					</li>
				</ul>
			</nav>
		</div>
	)
}
