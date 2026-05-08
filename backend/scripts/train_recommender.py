import json
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors


APP_DIR = Path(__file__).resolve().parents[2]
WORKSPACE_DIR = Path(__file__).resolve().parents[3]
DATASET_PATH = WORKSPACE_DIR / 'TMDB_movie_dataset_v11.csv'
OUTPUT_PATH = APP_DIR / 'backend' / 'data' / 'recommender.json'

MIN_VOTE_COUNT = 50
MAX_FEATURES = 5000
NEIGHBOR_COUNT = 40
TOP_K = 20


def normalize_title(value):
    return str(value or '').strip().lower()


def min_max_scale(series):
    series = series.fillna(0).astype(float)
    min_value = series.min()
    max_value = series.max()
    if max_value == min_value:
        return pd.Series([0.0] * len(series), index=series.index)
    return (series - min_value) / (max_value - min_value)


def build_tags(df):
    text_columns = ['overview', 'genres', 'keywords', 'original_language']
    for column in text_columns:
        df[column] = df[column].fillna('').astype(str)

    return (
        df['overview'] + ' ' +
        df['genres'].str.replace(',', ' ', regex=False) + ' ' +
        df['keywords'].str.replace(',', ' ', regex=False) + ' ' +
        df['original_language']
    ).str.lower()


def train():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f'Dataset not found: {DATASET_PATH}')

    use_columns = [
        'id',
        'title',
        'overview',
        'genres',
        'keywords',
        'vote_average',
        'vote_count',
        'popularity',
        'poster_path',
        'release_date',
        'original_language'
    ]

    movies = pd.read_csv(DATASET_PATH, usecols=use_columns)
    movies = movies[
        movies['title'].notna() &
        movies['overview'].notna() &
        movies['genres'].notna() &
        (movies['vote_count'].fillna(0) >= MIN_VOTE_COUNT)
    ].copy()

    movies['title'] = movies['title'].astype(str).str.strip()
    movies = movies[movies['title'].ne('')].reset_index(drop=True)
    movies['tags'] = build_tags(movies)
    movies = movies[movies['tags'].str.strip().ne('')].reset_index(drop=True)
    movies['genres'] = movies['genres'].fillna('').astype(str)
    movies['keywords'] = movies['keywords'].fillna('').astype(str)
    movies['overview'] = movies['overview'].fillna('').astype(str)
    movies['original_language'] = movies['original_language'].fillna('').astype(str)

    movies['popularity_norm'] = min_max_scale(movies['popularity'])
    movies['vote_average_norm'] = min_max_scale(movies['vote_average'])
    movies['vote_count_norm'] = min_max_scale(movies['vote_count'])

    vectorizer = TfidfVectorizer(max_features=MAX_FEATURES, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(movies['tags'])

    neighbor_model = NearestNeighbors(
        metric='cosine',
        algorithm='brute',
        n_neighbors=NEIGHBOR_COUNT + 1
    )
    neighbor_model.fit(tfidf_matrix)
    distances, indices = neighbor_model.kneighbors(tfidf_matrix)

    recommendations_by_id = {}
    title_lookup = {}
    movies_by_id = {}

    for row_index, row in movies.iterrows():
        title_key = normalize_title(row['title'])
        current_id = int(row['id'])
        release_year = str(row['release_date'])[:4] if pd.notna(row['release_date']) else ''

        candidates = []
        for distance, neighbor_index in zip(distances[row_index][1:], indices[row_index][1:]):
            candidate = movies.iloc[int(neighbor_index)]
            content_score = 1 - float(distance)
            hybrid_score = (
                0.65 * content_score +
                0.2 * float(candidate['popularity_norm']) +
                0.1 * float(candidate['vote_average_norm']) +
                0.05 * float(candidate['vote_count_norm'])
            )

            candidates.append({
                'movie_id': int(candidate['id']),
                'title': candidate['title'],
                'poster_path': candidate['poster_path'] if pd.notna(candidate['poster_path']) else None,
                'vote_average': round(float(candidate['vote_average']), 3) if pd.notna(candidate['vote_average']) else None,
                'popularity': round(float(candidate['popularity']), 3) if pd.notna(candidate['popularity']) else None,
                'release_year': str(candidate['release_date'])[:4] if pd.notna(candidate['release_date']) else '',
                'content_score': round(content_score, 6),
                'score': round(hybrid_score, 6)
            })

        candidates.sort(key=lambda item: item['score'], reverse=True)

        recommendations_by_id[str(current_id)] = {
            'movie_id': current_id,
            'title': row['title'],
            'poster_path': row['poster_path'] if pd.notna(row['poster_path']) else None,
            'release_year': release_year,
            'recommendations': candidates[:TOP_K]
        }

        movies_by_id[str(current_id)] = {
            'movie_id': current_id,
            'title': row['title'],
            'poster_path': row['poster_path'] if pd.notna(row['poster_path']) else None,
            'overview': row['overview'][:280],
            'genres': [item.strip().lower() for item in row['genres'].split(',') if item.strip()],
            'keywords': [item.strip().lower() for item in row['keywords'].split(',') if item.strip()],
            'original_language': row['original_language'].strip().lower(),
            'vote_average': round(float(row['vote_average']), 3) if pd.notna(row['vote_average']) else None,
            'vote_count': int(row['vote_count']) if pd.notna(row['vote_count']) else 0,
            'popularity': round(float(row['popularity']), 3) if pd.notna(row['popularity']) else 0,
            'release_year': release_year,
            'search_blob': row['tags'][:1200]
        }

        existing = title_lookup.get(title_key)
        if not existing or float(row['vote_count']) > float(existing['vote_count']):
            title_lookup[title_key] = {
                'movie_id': current_id,
                'vote_count': float(row['vote_count'])
            }

    artifact = {
        'movie_count': int(len(movies)),
        'source_dataset': str(DATASET_PATH),
        'filters': {
            'min_vote_count': MIN_VOTE_COUNT
        },
        'movies_by_id': movies_by_id,
        'recommendations_by_id': recommendations_by_id,
        'title_lookup': {key: value['movie_id'] for key, value in title_lookup.items()}
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(artifact, ensure_ascii=True), encoding='utf-8')
    print(f'Saved recommender artifact to {OUTPUT_PATH}')
    print(f'Trained on {len(movies)} movies from {DATASET_PATH.name}')


if __name__ == '__main__':
    train()
