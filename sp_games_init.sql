DROP DATABASE IF EXISTS `sp_games`;
CREATE DATABASE IF NOT EXISTS `sp_games` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sp_games`;

SET GLOBAL time_zone = '+8:00';

-- ------------------------------------------------------------------
-- CREATING TABLES
-- ------------------------------------------------------------------

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
	`userid` INT AUTO_INCREMENT NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `profile_pic_url` VARCHAR(500) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`userid`),
    UNIQUE (`email`)
);

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
	`categoryid` INT AUTO_INCREMENT NOT NULL,
    `catname` VARCHAR(50) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    PRIMARY KEY (`categoryid`),
    UNIQUE (`catname`)
);

DROP TABLE IF EXISTS `platform`;
CREATE TABLE `platform` (
	`platformid` INT AUTO_INCREMENT NOT NULL,
    `platformname` VARCHAR(50) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    PRIMARY KEY (`platformid`),
    UNIQUE (`platformname`)
);

DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
	`gameid` INT AUTO_INCREMENT NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `year` INT NOT NULL,
	`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    `img_name` VARCHAR(500) NULL,
    PRIMARY KEY (`gameid`)
);

DROP TABLE IF EXISTS `gamesByCategory`;
CREATE TABLE `gamesByCategory` (
	`gameid` INT NOT NULL,
    `categoryid` INT NOT NULL,
    FOREIGN KEY (gameid) REFERENCES game(gameid)
		ON DELETE CASCADE,
	FOREIGN KEY (categoryid) REFERENCES category(categoryid),
    UNIQUE (gameid,categoryid)
);   

DROP TABLE IF EXISTS `price`;
CREATE TABLE `price` (
	`gameid` INT NOT NULL,
    `platformid` INT NOT NULL,
    `price` DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (gameid) REFERENCES game(gameid)
		ON DELETE CASCADE,
	FOREIGN KEY (platformid) REFERENCES platform(platformid),
    UNIQUE (gameid,platformid)
);   

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
	`reviewid` INT AUTO_INCREMENT NOT NULL,
    `userid` INT NOT NULL,
    `gameid` INT NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `rating` CHAR(1) NOT NULL,
	`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`reviewid`),
    FOREIGN KEY (userid) REFERENCES user(userid),
	FOREIGN KEY (gameid) REFERENCES game(gameid)
		ON DELETE CASCADE
);   

DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
    `userid` INT NOT NULL,
    `gameid` INT NOT NULL,
    `platformname` VARCHAR(50) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (gameid) REFERENCES game(gameid)
		ON DELETE CASCADE,
	FOREIGN KEY (platformname) REFERENCES platform(platformname),
    UNIQUE (userid,gameid,platformname)
);

DROP TABLE IF EXISTS `preference`;
CREATE TABLE `preference` (
    `userid` INT NOT NULL,
    `categoryid` INT NOT NULL,
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (categoryid) REFERENCES category(categoryid),
    UNIQUE (userid,categoryid)
);

DROP TABLE IF EXISTS `purchase`;
CREATE TABLE `purchase` (
    `userid` INT NOT NULL,
    `gameid` INT NOT NULL,
    `platformname` VARCHAR(50) NOT NULL,
    `purchased_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    FOREIGN KEY (userid) REFERENCES user(userid),
    FOREIGN KEY (gameid) REFERENCES game(gameid)
		ON DELETE CASCADE,
	FOREIGN KEY (platformname) REFERENCES platform(platformname),
    UNIQUE (userid,gameid,platformname)
);

-- ------------------------------------------------------------------
-- CREATING SAMPLE DATA
-- ------------------------------------------------------------------

-- sample users
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('Jean','jean@amail.co','dzSFlqFk7RZ','Customer','http://www.ddd.com/jean.png');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('karl','forkarl@rocknstone.com','98iorwdsfc','Customer','https://twitter.com/JoinDeepRock/status/1260312089337495552');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('steve','stevee@fmail.com','dfsfLjz23','Admin','https://www.images.com/steve.gif');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('silverwold','subacc76@gmail.com','943fjQDJ','Customer','https://upload-os-bbs.hoyolab.com/upload/2022/04/29/172534910/0bf4d1a88a097e80f3774ddbb32a9e6e_7931904469402713716.jpg');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('joe','joee@yahoo.com','password123','Admin','http://www.efs.com/joemama.png');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('Bill','williamoverbeck@valve.org','*FEDHU2sdb','Customer','https://www.l4d2.com/bill.jpg');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('GuitarHero','hitorigotou@gmail.com','99JT5s^sw','Customer','https://bocchi.rocks/bocchi.png');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('Redigit','andrewsplinks@gmail.com','sdws883UDGop907','Customer','https://instagram.fsin4-1.fna.fbcdn.net/v/t51.2885-15/1971575_868961149849884_1443472029_n.jpg?stp=dst-jpg_e35&_nc_ht=instagram.fsin4-1.fna.fbcdn.net&_nc_cat=100&_nc_ohc=OIHKvHCB2CgAX9127Pe&edm=AP_V10EBAAAA&ccb=7-5&oh=00_AfCalKD2gZxqcRTkK7sK1VSGMp3iiHBZ0M8erLSK2JLIxw&oe=64B0E5AD&_nc_sid=2999b8');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('ron_mac','ronmacdonald@umail.com','sdYHR4F683','Customer','http://www.rok.com/macdonald.png');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('Sseth','positivpr0crastination@gmail.com','7aeu1@#','Customer','https://yt3.googleusercontent.com/ytc/AOPolaTbcoftptUKUIb7Tbh4IR36EPc80xsTqrt4O0bPcg=s176-c-k-c0x00ffffff-no-rj');

INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('testuser','testuser@gmail.com','testuser','Customer','https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png');
INSERT INTO user (username, email, password, type, profile_pic_url) VALUES('admin','admin@gmail.com','admin','Admin','https://cdn.icon-icons.com/icons2/2468/PNG/512/user_icon_149329.png');



-- platforms 
INSERT INTO platform (platformname, description) VALUES
	("PC","Computers, with platforms such as Steam and Epic Games"), -- 1
	("Android","Android phones"), -- 2 
	("macOS","UNIX system by apple"), -- 3
	("Nintendo","A gaming console"), -- 4
    ("PS4","playstation 4"), -- 5
	("Samsung Smart Fridge","self explaintary"); -- 6

-- categories
INSERT INTO category(catname, description) VALUES
	("Horror","games that are spooky"), -- 1
    ("Social","Involves interacting or tricking other players"), -- 2
    ("Strategy","Games that rely on the player's game knowlegde and decision making skills"), -- 3
	("FPS","First Person Shooter games"), -- 4
	("Gacha","Games that have elements of gambling for characters, or other form of resources"), -- 5
	("Card games","Games that involves playing with cards, usually turn based"), -- 6
	("Visual Novels","A form of digital interactive friction, usually from Japan"), -- 7
	("Roguelike","A game that traditionally has procedurally generated levels and permanent death of the player character"), -- 8
    ("Survival","Games about staying alive and triving"), -- 9
    ("City builder","sandbox game about building a city or a civilization"), -- 10
    ("Open world","A virtual world where player can approach objectives freely"), -- 11
    ("Role-Playing","Games where players assumes the roles of characters in a fictional setting, and out these roles within a narrative"); -- 12

-- sample games

-- 1
INSERT INTO game(title,description,year) 
	VALUES("Hearthstone","online digital collectible card game developed and published by Blizzard Entertainment, set in the World of Warcraft universe", 2014);
INSERT INTO price(gameid, platformid, price) VALUES
    (1,1,3.0), (1,2,0), (1,3,0);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(1,5), (1,6);
-- 2
INSERT INTO game(title,description,year) 
	VALUES("among us","sus", 2018);
INSERT INTO price(gameid, platformid, price) VALUES
    (2,1,0), (2,2,4.00), (2,5,7);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(2,1), (2,2);
-- 3
INSERT INTO game(title,description,year) 
	VALUES("Enter the Gungeon","bullethell developed by Dodge Roll", 2016);
INSERT INTO price(gameid, platformid, price) VALUES
    (3,1,12.99), (3,2,14.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(3,8);
-- 4
INSERT INTO game(title,description,year) 
	VALUES("Apex Legends","battle royale game created by Respawn", 2019);
INSERT INTO price(gameid, platformid, price) VALUES
    (4,1,10), (4,5,0);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(4,4);
-- 5
INSERT INTO game(title,description,year) 
	VALUES("Doki Doki Literature Club!", "Developed by Team Salvato, a totally normal game", 2017);
INSERT INTO price(gameid, platformid, price) VALUES
    (5,1,9.99), (5,3,10.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(5,1), (5,7);
-- 6 
INSERT INTO game(title,description,year) 
	VALUES("Elden Ring", "Role-Playeing game developed by FromSoftware, set in a fantasy world", 2022);
INSERT INTO price(gameid, platformid, price) VALUES
    (6,1,79.99), (6,5,59.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(6,1), (6,11), (6,12);
-- 7 
INSERT INTO game(title,description,year) 
	VALUES("DOOM", "FPS developed by id Softwaare, fighing hoards of demons", 1996);
INSERT INTO price(gameid, platformid, price) VALUES
    (7,1,19.99), (7,5,17.99), (7,6,15.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(7,1), (7,4);
-- 8 
INSERT INTO game(title,description,year) 
	VALUES("Frostpunk", "Made by 11 bit studio and set in a post apocalyptic frozen world", 2016);
INSERT INTO price(gameid, platformid, price) VALUES
    (8,1,26.00), (8,5,5.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(8,3), (8,9), (8,10);
-- 9
INSERT INTO game(title,description,year) 
	VALUES("The Legend of Zelda: Breath of the Wild", "Set at the end of the Zelda timeline, the player controls an amnesiac Link as he sets out to save Princess Zelda and prevent Calamity Ganon from finishing his destruction of Hyrule", 2017);
INSERT INTO price(gameid, platformid, price) VALUES
    (9,4,59.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(9,11), (9,12);
-- 10
INSERT INTO game(title,description,year) 
	VALUES("Battlefield 2042", "the twelfth main installment in the Battlefield series, developed by DICE and published by Electronic Arts", 2021);
INSERT INTO price(gameid, platformid, price) VALUES
    (10,1,59.99), (10,5,69.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(10,4);
-- 11
INSERT INTO game(title,description,year) 
	VALUES("Starsector", "open-world single-player space-combat, roleplaying, exploration, and economic game by Fractal Softworks. You take the role of a space captain seeking fortune and glory however you choose.", 2010);
INSERT INTO price(gameid, platformid, price) VALUES
    (11,1,15), (11,3,15);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(11,11), (11,3), (11,8);
-- 12
INSERT INTO game(title,description,year) 
	VALUES("Hollow Knight", "A metroidvania game by Team Cherry", 2017);
INSERT INTO price(gameid, platformid, price) VALUES
    (12,1,14.99), (12,4,15), (12,5,7.49);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(12, 11), (12,12);
-- 13
INSERT INTO game(title,description,year) 
	VALUES("Pokémon Scarlet and Violet", "The first instalments in the ninth generation of the Pokémon video game series, developed by Game Freak and published by Nintendo", 2022);
INSERT INTO price(gameid, platformid, price) VALUES
    (13,4,59.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(13, 11);
-- 14
INSERT INTO game(title,description,year) 
	VALUES("Slay the Spire", "Slay the Spire is a roguelike deck-building video game developed by American studio Mega Crit and published by Humble Bundle", 2017);
INSERT INTO price(gameid, platformid, price) VALUES
    (14,1,24.99), (14,2,9.99), (14,3,9.99), (14,4,24.99);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(14, 3), (14, 6), (14, 8);
-- 15
INSERT INTO game(title,description,year) 
	VALUES("Honkai: Star Rail", "role-playing gacha video game developed by miHoYo,", 2023);
INSERT INTO price(gameid, platformid, price) VALUES
    (15,1,0), (15,2,0);
INSERT INTO gamesByCategory(gameid, categoryid) VALUES
	(15,5), (15,11), (15,12);


-- game images
UPDATE game SET img_name="starsector_combat.jpg" WHERE gameid=11;
UPDATE game SET img_name="elden_ring_logo.jpg" WHERE gameid=6;
UPDATE game SET img_name="gungeon.jpg" WHERE gameid=3;
UPDATE game SET img_name="Zelda_BotW.jpg" WHERE gameid=9;
UPDATE game SET img_name="hollowknight.jpg" WHERE gameid=12;
UPDATE game SET img_name="Frostpunk.jpg" WHERE gameid=8;
UPDATE game SET img_name="sus.jpg" WHERE gameid=2;
UPDATE game SET img_name="hsr.jpg" WHERE gameid=15;
UPDATE game SET img_name="apex.jpg" WHERE gameid=4;

-- reviews
INSERT INTO review(userid, gameid, content, rating) VALUES
    (1,1,"Interesting gameplay but i dont like the card packs system",3),
    (2,10, "If it wasn't for the name Battlefield, no one would have bought this game. I don't understand at all who this game was created for - a game without a soul.",1),
    (7,7, "best game ever, played it in a linux command shell",5),
    (3,5, "scarred me for life", 2),
    (1,8, "cool game, but the main story is childs play compared to the DLC last automn, cant get through even after 4 tries. Good luck",4),
    (8,3, "bad review about game being hard = skill isue",5),
    (9,9, "Amazing game, breathtaking",5),
    (6,14, "Repetitive and shallow", 1),
    (10,11, "one of the best products i've ever bought and it only cost me $15 https://www.youtube.com/watch?v=acqpulP1hLo",5),
    (3,10, "EA should dissolve ",2),
    (4,4, "at least you don't have to be an architect to win in Apex ", 3),
    (8,7, "Bethesda has outdone themselves - they managed to make a game from 1993 more buggy than before.",1),
    (9,13, "While the gameplay mechanics remain solid, the overall experience falls short of the series' potential.", 3),
    (5,6, "you can hug women",4),
    (8,2, "I miss the early days of Among Us... ",2),
    (10,1, "financial investment into being competitive and enjoying the card game is far too high.",2),
    (7,3, "Easily one of my favorite roguelike games, and ive never wanted to 100% a game more than this one. The replayablity is insane",5),
    (1,12, "The game has alot of bugs but Luckily most are easy to defeat",5),
    (3,11, "No other game will let me create a planet dedicated to smuggling drugs to mining planets",5),
    (10,4, "Matchmaking is broken and the whole game is just a huge meme", 2),
    (4,15, "I got silver wolf :)",5);


-- cart
INSERT INTO cart(userid, gameid, platformname) VALUES
    (1,3,'Android'),
    (3,6,'PC'),
    (3,7,'PC'),
    (4,15,'Android'),
    (6,11,'macOS'),
    (6,13,'Nintendo'),
    (9,2,'Android'),
    (6,9,'Nintendo'),
    (7,12,"PS4"),
    (3,8,"PC"),
    (10,6,'PC');

-- preference
INSERT INTO preference(userid, categoryid) VALUES 
    (1,11),
    (1,3),
    (3,11),
    (3,12),
    (3,6),
    (4,5),
    (4,6),
    (5,9),
    (6,8),
    (7,4),
    (7,1),
    (8,4),
    (9,9),
    (10,2),
    (10,11);

-- testing code
-- SELECT * FROM sp_games.game AS g, sp_games.gamesByCategory AS gc, sp_games.category AS c WHERE g.gameid=gc.gameid AND c.categoryid=gc.categoryid;
-- SELECT * FROM sp_games.game AS g, sp_games.price, sp_games.platform AS p WHERE g.gameid=price.gameid AND price.platformid=p.platformid;
-- SELECT r.reviewid, g.title, r.gameid, r.userid, r.content, r.rating FROM sp_games.review AS r, sp_games.game AS g WHERE g.gameid=r.gameid ORDER BY gameid;