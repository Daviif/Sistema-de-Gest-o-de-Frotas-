import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'green' | 'amber' | 'red'
}

export default function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-primary/10 text-primary',
    green: 'status-success',
    amber: 'status-warning',
    red: 'status-danger',
  }

  return (
    <Card>
      <CardContent className="p-6 flex items-center">
        <div className={`p-3 rounded-lg mr-4 shadow-sm`} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.02))' }}>
          <div className={`p-2 rounded-md ${colorClasses[color]} bg-opacity-20`}> 
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-extrabold text-foreground">{value}</h4>
        </div>
      </CardContent>
    </Card>
  )
}
