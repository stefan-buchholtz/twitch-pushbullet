--liquibase formatted sql
--changeset SB:2017-01-01-01
CREATE DATABASE twitch_pb;

--changeset SB:2017-01-01-02
GRANT SELECT, INSERT, UPDATE, DELETE ON twitch_pb.* TO twitch_pb@localhost IDENTIFIED BY 'tpb';

--changeset SB:2017-01-01-03 
CREATE TABLE twitch_pb.users (
	id						INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	twitch_token			VARCHAR(200) NOT NULL,
	twitch_fail_count		INTEGER NOT NULL DEFAULT 0,
	pushbullet_token		VARCHAR(200) NOT NULL,
	pushbullet_fail_count	INTEGER NOT NULL DEFAULT 0,
	creation_date			DATETIME NOT NULL
) ENGINE InnoDB;

--changeset SB:2017-01-01-04
CREATE TABLE twitch_pb.streamers (
	id				INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name			VARCHAR(200) NOT NULL,
	creation_date	DATETIME NOT NULL
) ENGINE InnoDB;

--changeset SB:2017-01-01-05
CREATE TABLE twitch_pb.users_map_streamers (
	user_id		INTEGER NOT NULL,
	streamer_id	INTEGER NOT NULL,
	CONSTRAINT PRIMARY KEY (user_id, streamer_id),
	CONSTRAINT fk_ums_user FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINt fk_ums_streamer FOREIGN KEY (streamer_ID) REFERENCES streamers(id)
) ENGINE InnoDB;

--changeset SB:2017-01-27-01
ALTER TABLE twitch_pb.users 
ADD COLUMN email          VARCHAR(200) NOT NULL AFTER id,
ADD COLUMN twitch_user_id VARCHAR(12) NOT NULL AFTER email,
ADD COLUMN twitch_name	  VARCHAR(200) NOT NULL AFTER twitch_user_id;

--changeset SB:2017-01-27-02
ALTER TABLE twitch_pb.users
ADD CONSTRAINT ux_user_twitchuserid UNIQUE(twitch_user_id);

--changeset SB:2017-01-28-00
DELETE FROM twitch_pb.users_map_streamers;
DELETE FROM twitch_pb.streamers;

--changeset SB:2017-01-28-01
ALTER TABLE twitch_pb.streamers 
ADD COLUMN channel_id VARCHAR(12) NOT NULL AFTER name;

--changeset SB:2017-01-28-02
ALTER TABLE twitch_pb.streamers
ADD CONSTRAINT ux_streamer_channelid UNIQUE (channel_id);

--changeset SB:2017-01-28-03
ALTER TABLE twitch_pb.streamers
ADD COLUMN display_name VARCHAR(200) NOT NULL AFTER name;

--changeset SB:2017-01-28-04
UPDATE twitch_pb.streamers
SET display_name = name;
