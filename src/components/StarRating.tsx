type StarRatingProps = {
  rating: number
  count?: number
}

export default function StarRating({ rating, count = 0 }: StarRatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return (
              <span key={star} className="text-yellow-400 text-lg">
                ★
              </span>
            )
          }

          if (star === fullStars + 1 && hasHalfStar) {
            return (
              <span key={star} className="text-yellow-400 text-lg opacity-50">
                ★
              </span>
            )
          }

          return (
            <span key={star} className="text-gray-300 text-lg">
              ★
            </span>
          )
        })}
      </div>

      <span className="text-sm text-gray-600">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  )
}