export const shortenAddress = (data) => {
  if (!data) return null;
  const addr = data.address || {};
  if (!addr.house_number && !addr.building) return null;
  const parts = [];
  if (addr.road) parts.push(addr.road);
  if (addr.house_number) parts.push(addr.house_number);
  else if (addr.building) parts.push(addr.building);
  if (addr.suburb) parts.push(addr.suburb);
  else if (addr.neighbourhood) parts.push(addr.neighbourhood);
  if (addr.city) parts.push(addr.city);
  else if (addr.town) parts.push(addr.town);
  else if (addr.village) parts.push(addr.village);
  return parts.length ? parts.join(', ') : data.display_name || '';
};