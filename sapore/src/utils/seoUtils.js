export const buildProductSeo = (pizza) => {
  if (!pizza) return { title: '', description: '', h1: '' };

  const name = pizza.name || '';
  const description = pizza.description || '';
  const category = pizza.category || '';

  return {
    title: pizza.seo_title?.trim()
      || (name ? `${name} — заказать с доставкой в Ростове-на-Дону` : ''),
    description: pizza.seo_description?.trim()
      || (description
        ? `${name}: ${description}. Заказать с доставкой по Ростову-на-Дону за 30 минут.`
        : `${name} из пиццерии Sapore. Доставка по Ростову-на-Дону. Категория: ${category}.`),
    h1: pizza.seo_h1?.trim() || name,
  };
};

export const buildCategorySeo = (category, items = []) => {
  const name = category?.name || items[0]?.category || '';

  return {
    title: category?.seo_title?.trim()
      || (name ? `${name} — заказать с доставкой в Ростове-на-Дону` : ''),
    description: category?.seo_description?.trim()
      || (name
        ? `${name} из пиццерии Sapore. Заказать с доставкой по Ростову-на-Дону за 30 минут.`
        : 'Меню пиццерии Sapore с доставкой по Ростову-на-Дону.'),
    h1: category?.seo_h1?.trim() || name,
  };
};