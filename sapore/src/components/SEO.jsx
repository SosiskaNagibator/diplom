import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'Sapore — итальянская пицца с доставкой в Ростове-на-Дону';
const DEFAULT_DESCRIPTION = 'Настоящая итальянская пицца из дровяной печи. Доставка за 30 минут по Ростову-на-Дону. Свежие ингредиенты, бонусы за заказ.';
const SITE_NAME = 'Sapore';
const SITE_URL = 'http://vladskv.xsph.ru';
const DEFAULT_IMAGE = `${SITE_URL}/uploads/home/italian-recipes.jpg`;

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const fullTitle = title?.trim()
    ? `${title} | ${SITE_NAME}`
    : DEFAULT_TITLE;

  const fullDescription = description?.trim() || DEFAULT_DESCRIPTION;
  const fullUrl = `${SITE_URL}${url || ''}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image || DEFAULT_IMAGE} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ru_RU" />
    </Helmet>
  );
};

export default SEO;