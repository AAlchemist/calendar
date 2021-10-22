CREATE DATABASE `calendar`;
USE `calendar`;

CREATE TABLE `users` (
  `user_id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(10) NOT NULL COMMENT 'username',
  `password` varchar(255) NOT NULL COMMENT 'hashed password',
  `status` tinyint(1) unsigned DEFAULT 1 COMMENT '0: invalid，1: valid',
  `created_time` datetime DEFAULT current_timestamp() COMMENT 'create time',
  `updated_time` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'update time',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_relations` (
  `users_relation_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sharer_id` smallint(5) unsigned NOT NULL COMMENT 'sharer''s user_id',
  `shared_id` smallint(5) unsigned NOT NULL COMMENT 'sharer''s user_id',
  `status` tinyint(1) unsigned DEFAULT 1 COMMENT '0: invalid，1: valid',
  `created_time` datetime DEFAULT current_timestamp() COMMENT 'create time',
  `updated_time` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'update time',
  PRIMARY KEY (`users_relation_id`),
  KEY `sharer_id` (`sharer_id`),
  KEY `shared_id` (`shared_id`),
  CONSTRAINT `user_relations_ibfk_1` FOREIGN KEY (`sharer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_relations_ibfk_2` FOREIGN KEY (`shared_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `events` (
  `event_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT 'new event' COMMENT 'event title',
  `tag` tinyint(3) unsigned DEFAULT 0 COMMENT 'tags (0->work, 1->habits, ....)',
  `event_year` year(4) DEFAULT 1970 COMMENT 'event''s year  (year: 1901-2155, 1 byte)',
  `month` tinyint(3) unsigned DEFAULT 1 COMMENT 'event''s month',
  `date` tinyint(3) unsigned DEFAULT 1 COMMENT 'event''s date',
  `event_time` time DEFAULT NULL COMMENT 'event''s date',
  `is_group` tinyint(1) unsigned DEFAULT 0 COMMENT '0: it is not a group event，1: It is a group event',
  `group_members` varchar(255) DEFAULT NULL COMMENT 'names of members (names are separated by commas)',
  `user_id` smallint(5) unsigned NOT NULL,
  `status` tinyint(1) unsigned DEFAULT 1 COMMENT '0: invalid，1: valid',
  `created_time` datetime DEFAULT current_timestamp() COMMENT 'create time',
  `updated_time` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'update time',
  PRIMARY KEY (`event_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;