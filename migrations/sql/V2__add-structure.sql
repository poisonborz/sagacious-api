
CREATE TABLE IF NOT EXISTS `Article` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `serial` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `articleTypeId` int(11) NOT NULL,
    `articleCategoryId` int(11) NOT NULL,
    `descriptionId` int(11) DEFAULT NULL,
    `createdByGroupId` int(11) DEFAULT NULL,
    `image` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `ArticleCategory` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nameId` int(11) DEFAULT NULL,
    `groupId` int(11) DEFAULT NULL,
    `image` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `ArticleType` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nameId` int(11) DEFAULT NULL,
    `groupId` int(11) DEFAULT NULL,
    `inArticleCategoryId` int(11) DEFAULT NULL,
    `image` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `ArticleToGroupAssignment` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `articleId` int(11) NOT NULL,
    `groupId` int(11) NOT NULL,
    `assignmentDepth` int(11) NOT NULL DEFAULT '0',
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Group` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `articleId` int(11) NOT NULL,
    `groupId` int(11) NOT NULL,
    `assignmentDepth` int(11) NOT NULL DEFAULT '0',
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Language` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `name` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `nameNative` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Login` (
    `id` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `userId` int(11) NOT NULL,
    `expiration` datetime DEFAULT NULL,
    `meta` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `metaHash` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `revoked` tinyint(1) DEFAULT '0',
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Role` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nameId` int(11) DEFAULT NULL,
    `key` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `ownedByGroupId` int(11) DEFAULT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `Translation` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `nameId` int(11) DEFAULT NULL,
    `key` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `ownedByGroupId` int(11) DEFAULT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `deleted` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
)
