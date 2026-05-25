import './Tracking.css'

function Tracking() {
  return (
    <div>
      <h1>Отслеживание заказа</h1>
      <div className="placeholder">
        <div className="placeholder-icon">🛵</div>
        <div className="placeholder-text">Нет активных заказов</div>
        <div className="placeholder-sub">Сделайте первый заказ, чтобы отслеживать его статус</div>
      </div>
    </div>
  )
}

export default Tracking;