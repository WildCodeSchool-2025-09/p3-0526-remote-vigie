SET NAMES utf8mb4;

DROP TABLE IF EXISTS `useful_places`;
DROP TABLE IF EXISTS `useful_numbers`;
DROP TABLE IF EXISTS `comments`;
DROP TABLE IF EXISTS `contributions`;
DROP TABLE IF EXISTS `incident_incident_types`;
DROP TABLE IF EXISTS `incidents`;
DROP TABLE IF EXISTS `incident_types`;
DROP TABLE IF EXISTS `danger_levels`;
DROP TABLE IF EXISTS `user_locations`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pseudo`            VARCHAR(30)  NOT NULL,
  `email`             VARCHAR(255) NOT NULL,
  `pseudo_normalized` VARCHAR(30)  NOT NULL,
  `email_normalized`  VARCHAR(255) NOT NULL,
  `password_hash`     CHAR(60)     NOT NULL,
  `email_verified_at` TIMESTAMP        NULL DEFAULT NULL,
  `cgu_version`       VARCHAR(10)  NOT NULL,
  `cgu_accepted_at`   TIMESTAMP    NOT NULL,
  `created_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP        NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_pseudo_normalized` (`pseudo_normalized`),
  UNIQUE KEY `uq_users_email_normalized`  (`email_normalized`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `addresses` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`         INT UNSIGNED  NOT NULL,
  `label`           VARCHAR(50)       NULL DEFAULT NULL,
  `street_line`     VARCHAR(255)      NULL DEFAULT NULL,
  `postal_code`     CHAR(5)       NOT NULL,
  `city`            VARCHAR(100)  NOT NULL,
  `insee_code`      CHAR(5)       NOT NULL,
  `latitude`        DECIMAL(9,6)  NOT NULL,
  `longitude`       DECIMAL(10,6) NOT NULL,
  `is_approximate`  TINYINT(1)    NOT NULL DEFAULT 0,
  `is_primary`      TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP         NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user`   (`user_id`),
  KEY `idx_addresses_coords` (`latitude`, `longitude`),
  KEY `idx_addresses_insee`  (`insee_code`),
  CONSTRAINT `fk_addresses_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_locations` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED  NOT NULL,
  `is_enabled`  TINYINT(1)    NOT NULL DEFAULT 0,
  `latitude`    DECIMAL(9,6)      NULL DEFAULT NULL,
  `longitude`   DECIMAL(10,6)     NULL DEFAULT NULL,
  `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP         NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_locations_user` (`user_id`),
  CONSTRAINT `fk_user_locations_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `danger_levels` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `weight`      INT UNSIGNED NOT NULL,
  `label`       VARCHAR(50)  NOT NULL,
  `color`       CHAR(7)      NOT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP        NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_danger_levels_weight` (`weight`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `incident_types` (
  `id`                   INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `danger_level_id`      INT UNSIGNED      NOT NULL,
  `code`                 VARCHAR(30)       NOT NULL,
  `label`                VARCHAR(60)       NOT NULL,
  `alert_radius_meters`  SMALLINT UNSIGNED NOT NULL,
  `lifespan_hours`       SMALLINT UNSIGNED NOT NULL,
  `safety_instructions`  VARCHAR(1000)         NULL DEFAULT NULL,
  `icon`                 VARCHAR(80)       NOT NULL,
  `color`                CHAR(7)           NOT NULL,
  `is_selectable`        TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`           TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP             NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_incident_types_code` (`code`),
  KEY `idx_incident_types_danger_level` (`danger_level_id`),
  CONSTRAINT `fk_incident_types_danger_level`
    FOREIGN KEY (`danger_level_id`) REFERENCES `danger_levels` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `incidents` (
  `id`                        INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `user_id`                   INT UNSIGNED      NOT NULL,
  `danger_level_id`           INT UNSIGNED      NOT NULL,
  `title`                     VARCHAR(150)      NOT NULL,
  `description`               TEXT              NOT NULL,
  `photo_url`                 VARCHAR(255)          NULL DEFAULT NULL,
  `latitude`                  DECIMAL(9,6)      NOT NULL,
  `longitude`                 DECIMAL(10,6)     NOT NULL,
  `base_lifespan_hours`       SMALLINT UNSIGNED NOT NULL,
  `base_alert_radius_meters`  SMALLINT UNSIGNED NOT NULL,
  `city`                      VARCHAR(150)      NOT NULL,
  `insee_code`                CHAR(5)           NOT NULL,
  `status`                    ENUM('in_progress','resolved') NOT NULL DEFAULT 'in_progress',
  `expires_at`                DATETIME          NOT NULL,
  `created_at`                TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `edited_at`                 TIMESTAMP             NULL DEFAULT NULL,
  `updated_at`                TIMESTAMP             NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_incidents_user`            (`user_id`),
  KEY `idx_incidents_danger_level`    (`danger_level_id`),
  KEY `idx_incidents_coords`          (`latitude`, `longitude`),
  KEY `idx_incidents_status_expires`  (`status`, `expires_at`),
  KEY `idx_incidents_status_created`  (`status`, `created_at`),
  KEY `idx_incidents_insee`           (`insee_code`),
  CONSTRAINT `fk_incidents_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_incidents_danger_level`
    FOREIGN KEY (`danger_level_id`) REFERENCES `danger_levels` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `incident_incident_types` (
  `incident_id`       INT UNSIGNED NOT NULL,
  `incident_type_id`  INT UNSIGNED NOT NULL,
  PRIMARY KEY (`incident_id`, `incident_type_id`),
  KEY `idx_iit_type` (`incident_type_id`),
  CONSTRAINT `fk_iit_incident`
    FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_iit_incident_type`
    FOREIGN KEY (`incident_type_id`) REFERENCES `incident_types` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contributions` (
  `incident_id`  INT UNSIGNED NOT NULL,
  `user_id`      INT UNSIGNED NOT NULL,
  `type`         ENUM('confirm','deny') NOT NULL,
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`incident_id`, `user_id`),
  KEY `idx_contributions_user` (`user_id`),
  KEY `idx_contributions_incident_type` (`incident_id`, `type`),
  CONSTRAINT `fk_contributions_incident`
    FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_contributions_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comments` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED  NOT NULL,
  `incident_id`  INT UNSIGNED  NOT NULL,
  `content`      VARCHAR(1000) NOT NULL,
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP         NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_user` (`user_id`),
  KEY `idx_comments_incident_created` (`incident_id`, `created_at`),
  CONSTRAINT `fk_comments_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_comments_incident`
    FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `useful_numbers` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `label`         VARCHAR(100) NOT NULL,
  `phone_number`  VARCHAR(20)  NOT NULL,
  `email`         VARCHAR(255)     NULL DEFAULT NULL,
  `category`      ENUM('emergency','health','safety','utility','animal') NOT NULL,
  `scope`         ENUM('national','departmental','municipal') NOT NULL DEFAULT 'national',
  `insee_code`    CHAR(5)          NULL DEFAULT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP        NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_useful_numbers_scope_insee` (`scope`, `insee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `useful_places` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(150)    NOT NULL,
  `category`      ENUM('fire_station','veterinary','hospital','pharmacy','police') NOT NULL,
  `latitude`      DECIMAL(9,6)    NOT NULL,
  `longitude`     DECIMAL(10,6)   NOT NULL,
  `street_line`   VARCHAR(255)        NULL DEFAULT NULL,
  `city`          VARCHAR(100)        NULL DEFAULT NULL,
  `insee_code`    CHAR(5)             NULL DEFAULT NULL,
  `phone_number`  VARCHAR(20)         NULL DEFAULT NULL,
  `osm_type`      ENUM('node','way','relation') NULL DEFAULT NULL,
  `osm_id`        BIGINT UNSIGNED     NULL DEFAULT NULL,
  `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP           NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_useful_places_osm` (`osm_type`, `osm_id`),
  KEY `idx_useful_places_coords`   (`latitude`, `longitude`),
  KEY `idx_useful_places_category` (`category`),
  KEY `idx_useful_places_insee`    (`insee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET NAMES utf8mb4;

INSERT INTO `danger_levels` (`id`, `weight`, `label`, `color`) VALUES
  (1, 1, 'Faible',    '#116530'),
  (2, 2, 'Modéré',    '#6B8E23'),
  (3, 3, 'Important', '#C58A1E'),
  (4, 4, 'Élevé',     '#D2691E'),
  (5, 5, 'Critique',  '#C1392B');

INSERT INTO `incident_types`
  (`code`, `label`, `danger_level_id`, `alert_radius_meters`,
   `lifespan_hours`, `icon`, `color`, `is_selectable`, `safety_instructions`)
VALUES
  ('tornado', 'Tornade', 5, 3000, 2, 'tornado', '#C2661F', 1,
   'Mettez-vous à l''abri dans un bâtiment en dur, en vous éloignant des fenêtres. Ne restez pas dans un véhicule ni sous un arbre.'),

  ('danger', 'Danger', 5, 1000, 4, 'danger', '#C1392B', 0,
   'Mettez-vous en sécurité avant toute chose. Appelez le 112 : Vigie prévient vos voisins, mais ne contacte pas les secours.'),

  ('fire', 'Feu', 4, 2000, 24, 'fire', '#D8323E', 1,
   'Éloignez-vous dans la direction opposée au vent pour éviter les fumées. Appelez le 18 ou le 112. Fermez portes et volets si vous restez chez vous.'),

  ('flood', 'Inondation', 4, 2000, 48, 'flood', '#1F8FD0', 1,
   'Ne traversez jamais une zone inondée, à pied comme en voiture. Gagnez un point haut et coupez le gaz et l''électricité si vous le pouvez sans risque.'),

  ('storm', 'Tempête', 4, 3000, 12, 'storm', '#4F6E7C', 1,
   'Restez à l''abri et limitez vos déplacements. Rangez ou arrimez les objets pouvant être emportés. Éloignez-vous des arbres et des lignes électriques.'),

  ('rockfall', 'Éboulement', 4, 500, 72, 'rockfall', '#574A5E', 1,
   'Éloignez-vous de la zone et de la pente. N''empruntez pas la voie concernée et signalez le danger aux personnes qui approchent.'),

  ('hail', 'Grêle', 3, 3000, 2, 'hail', '#6E9AD4', 1,
   'Mettez-vous à l''abri et abritez les véhicules. Évitez de circuler pendant l''épisode : la chaussée devient très glissante.'),

  ('glaze', 'Verglas', 3, 500, 12, 'glaze', '#2E9AA6', 1,
   'Réduisez fortement votre vitesse et augmentez les distances de sécurité. À pied, privilégiez les zones sablées et les appuis.'),

  ('wild', 'Animal sauvage', 3, 1000, 3, 'wild', '#6E4A2E', 1,
   'Gardez vos distances et ne tentez pas d''approcher ni de nourrir l''animal. En voiture, ralentissez : un animal est rarement seul.'),

  ('tree', 'Chute d''arbre', 3, 200, 48, 'tree', '#2F8A38', 1,
   'Ne vous approchez pas si des câbles électriques sont impliqués. Signalez l''obstacle et empruntez un autre itinéraire.'),

  ('snow', 'Neige', 2, 2000, 24, 'snow', '#93BEDE', 1,
   'Limitez vos déplacements et équipez votre véhicule. Prévoyez de quoi patienter si vous devez prendre la route.'),

  ('insect', 'Nid d''insectes', 2, 50, 168, 'insect', '#D19A00', 1,
   'Ne tentez pas de détruire le nid vous-même. Éloignez-vous sans gestes brusques et faites appel à un professionnel.'),

  ('animal', 'Animal perdu', 1, 1000, 168, 'animal', '#5E4A63', 1,
   'N''effrayez pas l''animal et ne le poursuivez pas. Signalez-le à son propriétaire ou à la mairie si vous ne pouvez pas le recueillir en sécurité.');

INSERT INTO `useful_numbers` (`label`, `phone_number`, `email`, `category`, `scope`, `insee_code`) VALUES
  ('Urgences européennes',             '112',        NULL, 'emergency', 'national', NULL),
  ('Pompiers',                         '18',         NULL, 'emergency', 'national', NULL),
  ('SAMU',                             '15',         NULL, 'emergency', 'national', NULL),
  ('Police secours',                   '17',         NULL, 'emergency', 'national', NULL),
  ('Urgences sourds et malentendants', '114',        NULL, 'emergency', 'national', NULL),
  ('Secours en mer',                   '196',        NULL, 'emergency', 'national', NULL),
  ('Médecin de garde',                 '116117',     NULL, 'health',    'national', NULL),
  ('Centre antipoison',                '0800590059', NULL, 'health',    'national', NULL);

