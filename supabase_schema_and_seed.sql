-- ==============================================================================
-- 🛍️ DYNA STORE - COMPLETE POSTGRESQL & SUPABASE SQL SCHEMA & SEED SCRIPT
-- Compatible with: Supabase SQL Editor, PostgreSQL 14+, Neon, Supabase Database
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE CORE TABLES
-- ==============================================================================

-- Table: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER', -- 'USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'
    "avatar" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "rememberToken" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Wallet
CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL UNIQUE,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION,
    "balanceAfter" DOUBLE PRECISION,
    "type" TEXT NOT NULL, -- 'DEPOSIT', 'MOVIE_PURCHASE', 'MOVIE_RENTAL', 'REFUND', 'WITHDRAW', 'ECOMMERCE', 'ADMIN_ADJUSTMENT'
    "status" TEXT NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
    "reference" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Genre
CREATE TABLE IF NOT EXISTS "Genre" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Movie / Games & Media Catalog
CREATE TABLE IF NOT EXISTS "Movie" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "banner" TEXT NOT NULL,
    "trailerUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "rentalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "releaseYear" INTEGER NOT NULL,
    "director" TEXT NOT NULL,
    "cast" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "language" TEXT NOT NULL DEFAULT 'English',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: MovieGenre (Many-to-Many)
CREATE TABLE IF NOT EXISTS "MovieGenre" (
    "movieId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,
    PRIMARY KEY ("movieId", "genreId"),
    CONSTRAINT "MovieGenre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovieGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: MovieCategory (Many-to-Many)
CREATE TABLE IF NOT EXISTS "MovieCategory" (
    "movieId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    PRIMARY KEY ("movieId", "categoryId"),
    CONSTRAINT "MovieCategory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MovieCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Episode
CREATE TABLE IF NOT EXISTS "Episode" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "movieId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL DEFAULT 1,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Episode_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Product (E-Commerce)
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "image" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT NOT NULL DEFAULT 'Electronics',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Order
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "movieId" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" TEXT NOT NULL DEFAULT 'LIFETIME', -- 'LIFETIME', 'RENTAL', 'SUBSCRIPTION', 'TOPUP', 'ECOMMERCE'
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: OrderItem
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Payment
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "orderId" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT NOT NULL, -- 'ABA_PAYWAY', 'BAKONG_KHQR', 'KHQR', 'KHQR_CC'
    "transactionId" TEXT NOT NULL UNIQUE,
    "merchantTransactionId" TEXT UNIQUE,
    "pwTranId" TEXT,
    "traceId" TEXT,
    "qrData" TEXT,
    "rawResponse" TEXT,
    "md5Sig" TEXT,
    "qrCode" TEXT,
    "paymentUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'
    "bakongReference" TEXT,
    "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Favorite
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_movieId_key" UNIQUE ("userId", "movieId"),
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Favorite_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: WatchHistory
CREATE TABLE IF NOT EXISTS "WatchHistory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "episodeId" TEXT,
    "progressSeconds" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchHistory_userId_movieId_episodeId_key" UNIQUE ("userId", "movieId", "episodeId"),
    CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatchHistory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatchHistory_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: Podcast
CREATE TABLE IF NOT EXISTS "Podcast" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "videoUrl" TEXT,
    "coverImage" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'General',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Review
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Coupon
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "code" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "value" DOUBLE PRECISION NOT NULL,
    "minSpend" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxDiscount" DOUBLE PRECISION,
    "usageLimit" INTEGER NOT NULL DEFAULT 100,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Banner
CREATE TABLE IF NOT EXISTS "Banner" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: SupportTicket
CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "messages" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: Setting
CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. CREATE PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt");
CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx" ON "Payment"("transactionId");
CREATE INDEX IF NOT EXISTS "Payment_bakongReference_idx" ON "Payment"("bakongReference");

-- ==============================================================================
-- 4. SEED INITIAL DATA (Super Admin, Sample Games/Movies, Products, Banners)
-- ==============================================================================

-- 4.1 Insert Super Admin & Demo User
INSERT INTO "User" ("id", "name", "email", "password", "role", "emailVerified", "avatar")
VALUES 
(
    'usr_admin_super_001',
    'DYNA STORE Super Admin',
    'dynastore2-904758-39q457@gmai.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- dynastore39w8537q458974
    'SUPER_ADMIN',
    true,
    '/logo.png'
),
(
    'usr_demo_user_002',
    'John Doe Gamer',
    'demo@kvcinema.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'USER',
    true,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
)
ON CONFLICT ("email") DO UPDATE SET "role" = EXCLUDED."role";

-- 4.2 Initialize Wallets
INSERT INTO "Wallet" ("id", "userId", "balance", "currency")
VALUES 
('wal_admin_001', 'usr_admin_super_001', 9999.00, 'USD'),
('wal_demo_002', 'usr_demo_user_002', 150.00, 'USD')
ON CONFLICT ("userId") DO UPDATE SET "balance" = EXCLUDED."balance";

-- 4.3 Categories
INSERT INTO "Category" ("id", "name", "slug", "description")
VALUES
('cat_movies_01', 'Movies', 'movies', 'Watch best Movies on KV Digital Cinema'),
('cat_tvshows_02', 'TV Shows', 'tv-shows', 'Watch top TV Shows & Series'),
('cat_anime_03', 'Anime', 'anime', 'Watch streaming Anime & Animation'),
('cat_podcast_04', 'Podcast', 'podcast', 'Listen to Gaming & Tech Podcasts'),
('cat_doc_05', 'Documentary', 'documentary', '4K Documentaries & Special Features')
ON CONFLICT ("slug") DO NOTHING;

-- 4.4 Genres
INSERT INTO "Genre" ("id", "name", "slug")
VALUES
('gen_action_01', 'Action', 'action'),
('gen_scifi_02', 'Sci-Fi', 'sci-fi'),
('gen_drama_03', 'Drama', 'drama'),
('gen_comedy_04', 'Comedy', 'comedy'),
('gen_horror_05', 'Horror', 'horror'),
('gen_romance_06', 'Romance', 'romance'),
('gen_anime_07', 'Anime', 'anime'),
('gen_marvel_08', 'Marvel', 'marvel'),
('gen_dc_09', 'DC', 'dc')
ON CONFLICT ("slug") DO NOTHING;

-- 4.5 Seed Media Catalog (Games & 4K Cinema)
INSERT INTO "Movie" (
    "id", "title", "slug", "description", "poster", "banner", "trailerUrl", "videoUrl", 
    "isPremium", "price", "rentalPrice", "rating", "duration", "releaseYear", 
    "director", "cast", "country", "language", "isFeatured", "isTrending", "status"
)
VALUES
(
    'mov_oppenheimer_01',
    'Oppenheimer: The Atomic Legacy',
    'oppenheimer-the-atomic-legacy',
    'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200',
    'https://www.youtube.com/watch?v=uYPbbksJxIg',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    true, 9.99, 3.99, 8.9, 180, 2023,
    'Christopher Nolan', 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.', 'USA', 'English', true, true, 'PUBLISHED'
),
(
    'mov_avatar_02',
    'Avatar: The Way of Water',
    'avatar-the-way-of-water',
    'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200',
    'https://www.youtube.com/watch?v=d9MyW72ELq0',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    true, 12.99, 4.99, 7.8, 192, 2022,
    'James Cameron', 'Sam Worthington, Zoe Saldana, Sigourney Weaver', 'USA', 'English', true, true, 'PUBLISHED'
),
(
    'mov_spiderman_03',
    'Spider-Man: Across the Spider-Verse',
    'spider-man-across-the-spider-verse',
    'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200',
    'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    false, 0.00, 0.00, 8.7, 140, 2023,
    'Joaquim Dos Santos', 'Shameik Moore, Hailee Steinfeld, Oscar Isaac', 'USA', 'English', true, true, 'PUBLISHED'
),
(
    'mov_cyberpunk_04',
    'Cyberpunk Edgerunners: Neon City',
    'cyberpunk-edgerunners-neon-city',
    'A street kid trying to survive in a technology and body modification-obsessed city of the future decides to stay alive by becoming a mercenary outlaw.',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    'https://www.youtube.com/watch?v=JtqIas3bYhg',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    true, 6.99, 2.99, 8.6, 25, 2024,
    'Hiroyuki Imaishi', 'KENN, Aoi Yuuki, Hiroki Touchi', 'Japan', 'Japanese', false, true, 'PUBLISHED'
)
ON CONFLICT ("slug") DO NOTHING;

-- 4.6 Seed Products (E-Commerce)
INSERT INTO "Product" ("id", "name", "description", "price", "stock", "image", "status", "category", "rating")
VALUES
(
    'prod_vip_pass_01',
    'KV Digital Cinema Summer VIP Pass',
    'Unlimited 4K IMAX streaming pass for 3 months with 50% discount on merchandise.',
    25.99, 100, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600',
    'ACTIVE', 'Memberships', 4.9
),
(
    'prod_headphones_02',
    'Pro Wireless Spatial Audio Cinema Headphones',
    'Dolby Atmos spatial surround sound wireless cinema headphones with active noise cancellation.',
    89.00, 45, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'ACTIVE', 'Electronics', 4.8
),
(
    'prod_voucher_03',
    'IMAX 3D Laser Cinema Voucher',
    'Single ticket voucher valid for any IMAX 3D movie premiere at KV Digital Cinema.',
    12.50, 200, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600',
    'ACTIVE', 'Tickets', 4.7
)
ON CONFLICT ("id") DO NOTHING;

-- 4.7 Seed Podcasts
INSERT INTO "Podcast" ("id", "title", "description", "audioUrl", "coverImage", "duration", "category", "likesCount")
VALUES
(
    'pod_cinematalk_01',
    'CinemaTalk #42 - The Future of Modern Filmmaking',
    'Deep dive into CGI, AI directors, IMAX cameras, and spatial audio in 2026 cinema.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500',
    45, 'Cinema Talk', 142
),
(
    'pod_sounddesign_02',
    'Behind The Scenes: Oppenheimer Sound Design',
    'Exclusive interview with Oscar-winning sound engineers on building atomic roar acoustics.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500',
    32, 'Interviews', 98
)
ON CONFLICT ("id") DO NOTHING;

-- 4.8 Seed Promotional Banners
INSERT INTO "Banner" ("id", "title", "imageUrl", "linkUrl", "position", "isActive")
VALUES
(
    'ban_summer_01',
    'Exclusive Summer Cinema Pass 50% Off!',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
    '/movies',
    1,
    true
)
ON CONFLICT ("id") DO NOTHING;

-- ==============================================================================
-- 5. VERIFICATION QUERY
-- ==============================================================================
SELECT 'User Table Count: ' || COUNT(*) FROM "User"
UNION ALL
SELECT 'Movie Table Count: ' || COUNT(*) FROM "Movie"
UNION ALL
SELECT 'Product Table Count: ' || COUNT(*) FROM "Product"
UNION ALL
SELECT 'Podcast Table Count: ' || COUNT(*) FROM "Podcast";
