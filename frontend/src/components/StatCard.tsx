type Props = {
  title: string
  value: number
}

export function StatCard({ title, value }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  )
}
