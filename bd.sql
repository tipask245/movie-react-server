create TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(100),
  avatar VARCHAR(255)
);

create TABLE reviews(
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  body TEXT,
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id),
  film_id INTEGER,
  FOREIGN KEY (film_id) REFERENCES movies (id)
);

create TABLE watched(
  id SERIAL PRIMARY KEY,
  film_id INTEGER,
  FOREIGN KEY (film_id) REFERENCES movies (id),
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

create TABLE will_watch(
  id SERIAL PRIMARY KEY,
  film_id INTEGER,
  FOREIGN KEY (film_id) REFERENCES movies (id),
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

create TABLE marks(
  id SERIAL PRIMARY KEY,
  mark INTEGER,
  film_id INTEGER,
  FOREIGN KEY (film_id) REFERENCES movies (id),
  user_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

create TABLE movies(
  id SERIAL PRIMARY KEY,
  img VARCHAR(600),
  title VARCHAR(600),
  item_type VARCHAR(600),
  content TEXT,
  rating NUMERIC(2, 1),
  origin_rating NUMERIC(2, 1)
);



