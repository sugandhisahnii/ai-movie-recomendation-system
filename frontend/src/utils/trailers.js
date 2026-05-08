export const pickTrailer = (videos = []) => {
  if (!Array.isArray(videos) || !videos.length) {
    return null;
  }

  return (
    videos.find((video) => video.site === 'YouTube' && video.type === 'Trailer') ||
    videos.find((video) => video.site === 'YouTube' && video.type === 'Teaser') ||
    videos.find((video) => video.site === 'YouTube')
  );
};

export const buildYouTubeEmbedUrl = (
  key,
  { autoplay = true, mute = true, controls = false, loop = true } = {}
) => {
  if (!key) {
    return '';
  }

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    controls: controls ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1'
  });

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', key);
  }

  return `https://www.youtube.com/embed/${key}?${params.toString()}`;
};
