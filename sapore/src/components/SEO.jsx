import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website' }) => {
  const fullTitle = title ? `${title} | Sapore` : 'Sapore — итальянская пицца с доставкой в Ростове-на-Дону';
  const fullDescription = description || 'Настоящая итальянская пицца из печи на дровах. Свежие ингредиенты, доставка за 30 минут.';
  const fullUrl = `http://vladskv.xsph.ru${url || ''}`;
  const defaultImage = 'http://vladskv.xsph.ru/uploads/home/italian-recipes.jpg';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content="Sapore" />
      <meta property="og:locale" content="ru_RU" />
    </Helmet>
  );
};

export default SEO;