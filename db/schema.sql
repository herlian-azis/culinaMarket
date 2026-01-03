-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table: Core inventory data
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  sku text unique,
  price decimal(10, 2) not null,
  stock_quantity integer not null default 0,
  category text,
  image_url text, -- High-res imagery
  nutrition_info jsonb, -- e.g., {"calories": 200, "protein": "10g"}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipes Table: AI suggestions source
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  instructions text not null, -- Markdown or step-by-step
  difficulty_level text check (difficulty_level in ('Easy', 'Medium', 'Hard')),
  prep_time_minutes integer,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Recipe Ingredients: Linking recipes to actual store products
-- This allows the AI to check if *real* stock exists for a recipe.
create table recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid references recipes(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict, -- Can only suggest recipes with known products
  quantity_required decimal(10, 2) not null,
  unit text not null,
  substitute_product_id uuid references products(id) -- For AI substitution logic
);

-- Users Table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  preferences jsonb, -- e.g., {"diet": "vegan", "allergies": ["nuts"]}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  status text check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')) default 'Pending',
  total_amount decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null,
  price_at_purchase decimal(10, 2) not null
);
