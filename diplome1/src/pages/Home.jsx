import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_CATALOG = 'http://localhost/catalog.php'

function Home({ addToCart }) {
  const [popularPizzas, setPopularPizzas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch(API_CATALOG)
        if (!response.ok) throw new Error('Ошибка загрузки')
        const data = await response.json()
        setPopularPizzas(data.slice(0, 4))
      } catch (err) {
        console.error('Ошибка загрузки популярных пицц:', err)
        setPopularPizzas([])
      } finally {
        setLoading(false)
      }
    }
    fetchPopular()
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Загрузка меню...</div>
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-xl mb-16">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="20" cy="20" r="30" fill="#f59e0b" />
            <circle cx="80" cy="80" r="40" fill="#f59e0b" />
            <circle cx="60" cy="10" r="20" fill="#f59e0b" />
          </svg>
        </div>
        <div className="relative px-6 py-12 sm:py-16 md:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-4">🍕</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
              Sapore — <span className="text-amber-600">вкус Италии</span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Настоящая итальянская пицца из печи на дровах. Свежие ингредиенты, доставка за 30 минут.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/constructor">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition text-lg flex items-center gap-2">
                  <span>Собрать свою пиццу</span>
                  <span>→</span>
                </button>
              </Link>
              <Link to="/catalog">
                <button className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition text-lg border-2 border-amber-200">
                  Посмотреть меню
                </button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              ⭐ 4.8 из 5 на основе 1200+ отзывов
            </div>
          </div>
        </div>
      </section>

      {/* Почему мы */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
            <div className="text-4xl mb-3">🧑‍🍳</div>
            <h3 className="font-semibold text-gray-800">Итальянские рецепты</h3>
            <p className="text-sm text-gray-500 mt-1">Готовим по традиционным рецептам с любовью</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-semibold text-gray-800">Быстрая доставка</h3>
            <p className="text-sm text-gray-500 mt-1">Привезём горячую пиццу за 30 минут</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
            <div className="text-4xl mb-3">🌿</div>
            <h3 className="font-semibold text-gray-800">Свежие продукты</h3>
            <p className="text-sm text-gray-500 mt-1">Только натуральные ингредиенты высокого качества</p>
          </div>
        </div>
      </section>

      {/* Популярное */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🔥 Популярное</h2>
          <Link to="/catalog" className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
            Все пиццы <span>→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularPizzas.map((pizza, index) => (
            <div key={pizza.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition duration-300 border border-gray-100 overflow-hidden group">
              <div className="relative">
                <img src={pizza.image} alt={pizza.name} className="w-full h-52 object-cover group-hover:scale-105 transition duration-300" />
                {index === 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">Хит 🔥</span>
                )}
              </div>
              <div className="p-4">
                <div className="font-bold text-gray-800 text-lg">{pizza.name}</div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{pizza.description}</div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-amber-600 font-bold text-xl">{pizza.price} ₽</span>
                  <button
                    onClick={() => addToCart(pizza)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2 rounded-full transition flex items-center gap-1"
                  >
                    <span>+</span> В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home