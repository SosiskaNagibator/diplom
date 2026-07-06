import { useState } from 'react'

function Constructor({ addToCart }) {
  const [size, setSize] = useState('Маленькая')
  const [sauce, setSauce] = useState('Томатный')
  const [toppings, setToppings] = useState([])
  
  const sizeOptions = [
    { id: 'Маленькая', label: '25 см', icon: '🟤', price: 0 },
    { id: 'Средняя', label: '30 см', icon: '🟠', price: 50 },
    { id: 'Большая', label: '35 см', icon: '🔴', price: 100 }
  ]
  const sauceOptions = [
    { id: 'Томатный', icon: '🍅', price: 0 },
    { id: 'Сливочный', icon: '🥛', price: 30 }
  ]
  const toppingOptions = [
    { id: 'Пепперони', icon: '🌶️', price: 50 },
    { id: 'Грибы', icon: '🍄', price: 40 },
    { id: 'Сыр', icon: '🧀', price: 30 },
    { id: 'Помидоры', icon: '🍅', price: 20 },
    { id: 'Оливки', icon: '🫒', price: 25 }
  ]

  const basePrice = 350
  const totalPrice = basePrice +
    sizeOptions.find(s => s.id === size).price +
    sauceOptions.find(s => s.id === sauce).price +
    toppings.reduce((sum, t) => sum + t.price, 0)

  const toggleTopping = (topping) => {
    setToppings(prev =>
      prev.find(t => t.id === topping.id)
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, topping]
    )
  }

  const handleAddToCart = () => {
    const toppingNames = toppings.map(t => t.id).join(', ')
    const name = `Пицца ${size} ${sauce}${toppingNames ? ' + ' + toppingNames : ''}`
    const pizza = {
      id: Date.now(),
      name: name.slice(0, 40),
      price: totalPrice,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      description: `${size}, ${sauce}${toppingNames ? ', ' + toppingNames : ''}`
    }
    addToCart(pizza)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Собери пиццу</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Размер */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Размер</div>
          <div className="flex gap-3">
            {sizeOptions.map(s => (
              <button
                key={s.id}
                className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition ${
                  size === s.id
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                onClick={() => setSize(s.id)}
              >
                <div className="text-xl">{s.icon}</div>
                <div className="text-sm font-medium text-gray-800">{s.label}</div>
                {s.price > 0 && <div className="text-xs text-amber-600">+{s.price}₽</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Соус */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Соус</div>
          <div className="flex gap-3">
            {sauceOptions.map(s => (
              <button
                key={s.id}
                className={`flex-1 py-3 px-2 rounded-xl border-2 text-center transition ${
                  sauce === s.id
                    ? 'border-amber-500 bg-amber-50 shadow-sm'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                }`}
                onClick={() => setSauce(s.id)}
              >
                <div className="text-xl">{s.icon}</div>
                <div className="text-sm font-medium text-gray-800">{s.id}</div>
                {s.price > 0 && <div className="text-xs text-amber-600">+{s.price}₽</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Начинки */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Начинки</div>
          <div className="flex flex-wrap gap-2">
            {toppingOptions.map(t => {
              const selected = !!toppings.find(to => to.id === t.id)
              return (
                <button
                  key={t.id}
                  className={`py-2 px-4 rounded-xl border-2 transition flex items-center gap-2 ${
                    selected
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleTopping(t)}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{t.id}</span>
                  <span className="text-xs text-amber-600">+{t.price}₽</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Итог и кнопка */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Итого</span>
            <div className="text-2xl font-bold text-amber-600">{totalPrice} ₽</div>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full transition shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>В корзину</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Constructor