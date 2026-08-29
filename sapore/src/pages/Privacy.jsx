import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Политика в отношении обработки персональных данных</h1>
      <p className="text-sm text-gray-500 mb-8">Дата публикации: 1 августа 2026 года</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Общие положения</h2>
          <p className="text-gray-700 leading-relaxed">
            Настоящая Политика определяет порядок обработки персональных данных и меры по обеспечению их безопасности в интернет-магазине «Sapore» (далее – Оператор).
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            К обработке персональных данных Оператор приступает только при наличии согласия субъекта, выраженного в активной форме (проставление галочки).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Оператор</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li><strong>Наименование:</strong> ООО «Сапоре»</li>
            <li><strong>ИНН:</strong> -</li>
            <li><strong>ОГРН:</strong> -</li>
            <li><strong>Юридический адрес:</strong> 344000, г. Ростов-на-Дону, ул. Социалистическая, д. 141</li>
            <li><strong>Контактный телефон:</strong> +7 (999) 999-99-99</li>
            <li><strong>Email для обращений:</strong> info@sapore.ru</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Цели обработки персональных данных</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Оформление и доставка заказов (включая связь с курьером);</li>
            <li>Идентификация пользователя при авторизации;</li>
            <li>Начисление и списание бонусов, участие в программе лояльности;</li>
            <li>Обработка обращений в службу поддержки;</li>
            <li>Направление информационных и рекламных сообщений (только с отдельного согласия);</li>
            <li>Соблюдение требований законодательства (бухгалтерский и налоговый учёт).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Перечень обрабатываемых персональных данных</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Фамилия, имя, отчество;</li>
            <li>Номер телефона;</li>
            <li>Адрес электронной почты;</li>
            <li>Адрес доставки (улица, дом, квартира);</li>
            <li>История заказов и бонусный баланс;</li>
            <li>IP-адрес, данные файлов cookie (с согласия).</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            Оператор не обрабатывает специальные категории персональных данных (биометрические, расовые, религиозные и т.п.).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Правовые основания обработки</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Ст. 6, 9 Федерального закона № 152-ФЗ «О персональных данных»;</li>
            <li>Согласие субъекта персональных данных, полученное в активной форме;</li>
            <li>Заключение и исполнение договора (публичная оферта).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">6. Сроки обработки и хранения</h2>
          <p className="text-gray-700 leading-relaxed">
            Персональные данные хранятся не дольше, чем этого требуют цели их обработки, но в любом случае не более <strong>5 лет</strong> с даты последнего взаимодействия, если иное не установлено законом (например, для бухгалтерской отчётности – 5 лет).
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            По истечении срока хранения данные уничтожаются или обезличиваются.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">7. Права субъектов персональных данных</h2>
          <p className="text-gray-700 leading-relaxed">Вы имеете право:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Получить информацию о своих персональных данных, которые хранятся у Оператора (запрос – в свободной форме на email <strong>info@sapore.ru</strong>);</li>
            <li>Требовать уточнения, блокировки или уничтожения своих данных, если они неполные, устаревшие или обрабатываются с нарушением закона;</li>
            <li>Отозвать своё согласие на обработку в любой момент (путём направления письменного уведомления);</li>
            <li>Обжаловать действия Оператора в уполномоченном органе (Роскомнадзор) или в суде.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            Срок ответа на запрос – <strong>10 рабочих дней</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">8. Порядок уничтожения персональных данных</h2>
          <p className="text-gray-700 leading-relaxed">Уничтожение производится в следующих случаях:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Достижение целей обработки;</li>
            <li>Истечение установленного срока хранения;</li>
            <li>Отзыв согласия субъекта (если данные обрабатывались только на основании согласия);</li>
            <li>Выявление неправомерной обработки по требованию уполномоченного органа.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            Уничтожение осуществляется комиссией с составлением акта, данные удаляются из баз и с носителей без возможности восстановления.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">9. Передача данных третьим лицам</h2>
          <p className="text-gray-700 leading-relaxed">Оператор передаёт персональные данные только:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Курьерским службам (для доставки заказов) – в объёме, необходимом для выполнения заказа;</li>
            <li>Платёжным агрегаторам (для обработки оплаты) – только при оплате картой;</li>
            <li>По запросу уполномоченных государственных органов (в соответствии с законом).</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-2">
            Все получатели данных обязаны соблюдать конфиденциальность.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">10. Согласие на обработку</h2>
          <p className="text-gray-700 leading-relaxed">
            Продолжая использование сайта и заполняя формы регистрации или оформления заказа, вы даёте согласие на обработку своих персональных данных в соответствии с настоящей Политикой. Согласие действует до его отзыва или до достижения целей обработки.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Вы можете отозвать согласие в любое время, направив письменное заявление на адрес <strong>info@sapore.ru</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">11. Изменение Политики</h2>
          <p className="text-gray-700 leading-relaxed">
            Оператор оставляет за собой право вносить изменения в Политику. Новая редакция вступает в силу с момента её размещения на сайте. Актуальная версия всегда доступна по адресу <Link to="/privacy" className="text-amber-600 hover:underline">/privacy</Link>.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Если изменения существенно затрагивают права субъектов, Оператор уведомляет об этом пользователей по электронной почте или через уведомление на сайте.
          </p>
        </section>
      </div>

      <div className="mt-10 text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>© 2026 ООО «Сапоре». Все права защищены.</p>
      </div>
    </motion.div>
  );
};

export default Privacy;