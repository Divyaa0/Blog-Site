CREATE TABLE "user" (
    id serial PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);

insert into "user"(username,email,password) values ('user1','user1@z.com',123)

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    contents TEXT,
    summary_img VARCHAR(255), -- it's a URL or file path
    header_img VARCHAR(255),  -- it's a URL or file path
    body_imgs TEXT[]          -- it's an array of image URLs or file paths
);
-- updated
CREATE TABLE blog (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    contents TEXT,
    summary_img VARCHAR(255),
    header_img VARCHAR(255),
    body_imgs TEXT[],
    published_date TIMESTAMP,
    published_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_date TIMESTAMP ,
    updated_by VARCHAR(255),
	status VARCHAR(255)
);

