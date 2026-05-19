export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'food';

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: process.env.PEXELS_API_KEY } }
  );

  const data = await res.json();
  const photo = data.photos?.[0];

  if (!photo) {
    return Response.json({ url: null });
  }

  return Response.json({ url: photo.src.medium });
}
