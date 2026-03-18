const categories = [
  { name: "Hambúrguer", emoji: "🍔" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Lanches", emoji: "🍟" },
  { name: "Saudável", emoji: "🥗" },
  { name: "Sobremesas", emoji: "🍰" },
]

export default function Categories() {
  return (
    <div className="max-w-6xl mx-auto px-6 mt-6">

      <div className="flex gap-4 overflow-x-auto pb-2">

        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow cursor-pointer hover:bg-red-50 transition"
          >
            <span className="text-xl">{cat.emoji}</span>
            <span className="text-sm font-medium">{cat.name}</span>
          </div>
        ))}

      </div>

    </div>
  )
}