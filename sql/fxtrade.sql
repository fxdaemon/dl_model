-- MySQL dump 10.16  Distrib 10.1.41-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: scm_fxtrade
-- ------------------------------------------------------
-- Server version	10.1.41-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

CREATE DATABASE IF NOT EXISTS scm_fxtrade;
grant select,update,delete,insert,create, drop on scm_fxtrade.* to 'fxtrade'@'localhost' identified by 'fxtrade';

use scm_fxtrade;

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Account` (
  `AccountID` varchar(40) NOT NULL,
  `AccountName` varchar(120) DEFAULT NULL,
  `AccountType` varchar(20) NOT NULL,
  `Balance` decimal(18,4) DEFAULT NULL,
  `Equity` decimal(18,4) DEFAULT NULL,
  `DayPL` decimal(18,4) DEFAULT NULL,
  `GrossPL` decimal(18,4) DEFAULT NULL,
  `UsedMargin` decimal(18,4) DEFAULT NULL,
  `UsableMargin` decimal(18,4) DEFAULT NULL,
  `UsableMarginInPercentage` decimal(7,4) DEFAULT NULL,
  `UsableMaintMarginInPercentage` decimal(7,4) DEFAULT NULL,
  `MarginRate` decimal(7,4) DEFAULT NULL,
  `Hedging` varchar(10) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Broker` varchar(20) DEFAULT NULL,
  `Reserve` varchar(120) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`AccountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
INSERT INTO `Account` VALUES ('bt001','bt001','',100000.0000,100000.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'Y','USD',NULL,NULL,'bt001','2020-09-30 00:00:00','bt001','2020-09-30 00:00:00'),('vt001','vt001','',100000.0000,100000.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,0.0000,'Y','USD',NULL,NULL,'vt001','2020-09-30 00:00:00','vt001','2020-09-30 00:00:00');
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ImplPlan`
--

DROP TABLE IF EXISTS `ImplPlan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ImplPlan` (
  `AccountID` varchar(40) NOT NULL,
  `Symbol` varchar(40) NOT NULL,
  `IP1` varchar(40) DEFAULT NULL,
  `IP2` varchar(40) DEFAULT NULL,
  `IP3` varchar(40) DEFAULT NULL,
  `IP4` varchar(40) DEFAULT NULL,
  `IP5` varchar(40) DEFAULT NULL,
  `IP6` varchar(40) DEFAULT NULL,
  `IP7` varchar(40) DEFAULT NULL,
  `IP8` varchar(40) DEFAULT NULL,
  `IP9` varchar(40) DEFAULT NULL,
  `IP10` varchar(40) DEFAULT NULL,
  `IP11` varchar(40) DEFAULT NULL,
  `IP12` varchar(40) DEFAULT NULL,
  `IP13` varchar(40) DEFAULT NULL,
  `IP14` varchar(40) DEFAULT NULL,
  `IP15` varchar(40) DEFAULT NULL,
  `IP16` varchar(40) DEFAULT NULL,
  `IP17` varchar(40) DEFAULT NULL,
  `IP18` varchar(40) DEFAULT NULL,
  `IP19` varchar(40) DEFAULT NULL,
  `IP20` varchar(40) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`AccountID`,`Symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ImplPlan`
--

LOCK TABLES `ImplPlan` WRITE;
/*!40000 ALTER TABLE `ImplPlan` DISABLE KEYS */;
INSERT INTO `ImplPlan` VALUES ('bt001','COM1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'bt001','2020-09-30 00:00:00','bt001','2020-09-30 00:00:00'),('bt001','COM9',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'bt001','2020-09-30 00:00:00','bt001','2020-09-30 00:00:00'),('bt001','EUR/JPY','3','1000','MacdCross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'bt001','2020-09-30 00:00:00','bt001','2020-09-30 00:00:00'),('bt001','EUR/USD','3','1000','MacdCross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'bt001','2020-09-30 00:00:00','bt001','2020-09-30 00:00:00'),('bt001','USD/JPY','3','1000','MacdCross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'bt001','2020-09-30 00:00:00','bt001','2020-09-30 00:00:00'),('vt001','COM1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'vt001','2020-09-30 00:00:00','vt001','2020-09-30 00:00:00'),('vt001','COM9',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'vt001','2020-09-30 00:00:00','vt001','2020-09-30 00:00:00'),('vt001','EUR/JPY','3','1000','MacdCross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'vt001','2020-09-30 00:00:00','vt001','2020-09-30 00:00:00'),('vt001','EUR/USD','3','1000','MacdCross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'vt001','2020-09-30 00:00:00','vt001','2020-09-30 00:00:00'),('vt001','USD/JPY','3','1000','MacdCross',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'vt001','2020-09-30 00:00:00','vt001','2020-09-30 00:00:00');
/*!40000 ALTER TABLE `ImplPlan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Offer`
--

DROP TABLE IF EXISTS `Offer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Offer` (
  `OfferID` varchar(20) NOT NULL,
  `Symbol` varchar(40) NOT NULL,
  `SymbolType` varchar(20) DEFAULT NULL,
  `Bid` decimal(18,6) DEFAULT NULL,
  `Ask` decimal(18,6) DEFAULT NULL,
  `High` decimal(18,6) DEFAULT NULL,
  `Low` decimal(18,6) DEFAULT NULL,
  `PipCost` decimal(18,6) DEFAULT NULL,
  `PointSize` decimal(18,6) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Reserve` varchar(120) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`OfferID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Offer`
--

LOCK TABLES `Offer` WRITE;
/*!40000 ALTER TABLE `Offer` DISABLE KEYS */;
INSERT INTO `Offer` VALUES ('1','EUR/USD','1',1.113860,1.114520,1.117510,1.110800,0.100000,0.000100,'2019-04-27 05:58:00',NULL,'bt001','2019-04-27 06:01:00','bt001','2019-04-27 06:01:00'),('10','EUR/JPY','1',124.342000,124.424000,124.730000,124.078000,0.010000,0.010000,'2019-04-27 05:58:00',NULL,'bt001','2019-04-27 06:01:00','bt001','2019-04-27 06:01:00'),('2','USD/JPY','1',111.530000,111.590000,112.060000,111.418000,0.010000,0.010000,'2019-04-27 05:58:00',NULL,'bt001','2019-04-27 06:01:00','bt001','2019-04-27 06:01:00');
/*!40000 ALTER TABLE `Offer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Order` (
  `OrderID` varchar(40) NOT NULL,
  `RequestID` varchar(120) DEFAULT NULL,
  `AccountID` varchar(40) NOT NULL,
  `OfferID` varchar(20) DEFAULT NULL,
  `Symbol` varchar(40) NOT NULL,
  `TradeID` varchar(40) NOT NULL,
  `BS` varchar(10) DEFAULT NULL,
  `Stage` varchar(20) DEFAULT NULL,
  `OrderType` varchar(20) DEFAULT NULL,
  `OrderStatus` varchar(20) DEFAULT NULL,
  `Amount` decimal(18,4) DEFAULT NULL,
  `Rate` decimal(18,6) DEFAULT NULL,
  `Stop` decimal(18,6) DEFAULT NULL,
  `Limit` decimal(18,6) DEFAULT NULL,
  `Time` datetime DEFAULT NULL,
  `Reserve` varchar(120) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`OrderID`,`AccountID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Trade`
--

DROP TABLE IF EXISTS `Trade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Trade` (
  `TradeID` varchar(40) NOT NULL,
  `AccountID` varchar(40) NOT NULL,
  `OfferID` varchar(20) DEFAULT NULL,
  `Symbol` varchar(40) NOT NULL,
  `Amount` decimal(18,4) DEFAULT NULL,
  `BS` varchar(10) DEFAULT NULL,
  `Open` decimal(18,6) DEFAULT NULL,
  `Close` decimal(18,6) DEFAULT NULL,
  `Stop` decimal(18,6) DEFAULT NULL,
  `Limit` decimal(18,6) DEFAULT NULL,
  `High` decimal(18,6) DEFAULT NULL,
  `Low` decimal(18,6) DEFAULT NULL,
  `PL` decimal(18,4) DEFAULT NULL,
  `GrossPL` decimal(18,4) DEFAULT NULL,
  `Commission` decimal(18,4) DEFAULT NULL,
  `Interest` decimal(18,4) DEFAULT NULL,
  `OpenTime` datetime DEFAULT NULL,
  `CloseTime` datetime DEFAULT NULL,
  `OpenOrderID` varchar(40) DEFAULT NULL,
  `CloseOrderID` varchar(40) DEFAULT NULL,
  `StopOrderID` varchar(40) DEFAULT NULL,
  `LimitOrderID` varchar(40) DEFAULT NULL,
  `MaxSumPL` decimal(18,6) DEFAULT NULL,
  `MaxSumPLCount` int(11) DEFAULT NULL,
  `MaxSumPLTime` datetime DEFAULT NULL,
  `CurSumPL` decimal(18,6) DEFAULT NULL,
  `CurSumPLCount` int(11) DEFAULT NULL,
  `Reserve` varchar(120) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`AccountID`,`TradeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Trade`
--

LOCK TABLES `Trade` WRITE;
/*!40000 ALTER TABLE `Trade` DISABLE KEYS */;
/*!40000 ALTER TABLE `Trade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TsContext`
--

DROP TABLE IF EXISTS `TsContext`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TsContext` (
  `OrderID` varchar(40) NOT NULL,
  `TradeID` varchar(40) NOT NULL,
  `AccountID` varchar(40) NOT NULL,
  `Class` varchar(20) NOT NULL,
  `TitleSeq` int(11) NOT NULL,
  `C1` decimal(18,6) DEFAULT NULL,
  `C2` decimal(18,6) DEFAULT NULL,
  `C3` decimal(18,6) DEFAULT NULL,
  `C4` decimal(18,6) DEFAULT NULL,
  `C5` decimal(18,6) DEFAULT NULL,
  `C6` decimal(18,6) DEFAULT NULL,
  `C7` decimal(18,6) DEFAULT NULL,
  `C8` decimal(18,6) DEFAULT NULL,
  `C9` decimal(18,6) DEFAULT NULL,
  `C10` decimal(18,6) DEFAULT NULL,
  `C11` decimal(18,6) DEFAULT NULL,
  `C12` decimal(18,6) DEFAULT NULL,
  `C13` decimal(18,6) DEFAULT NULL,
  `C14` decimal(18,6) DEFAULT NULL,
  `C15` decimal(18,6) DEFAULT NULL,
  `C16` decimal(18,6) DEFAULT NULL,
  `C17` decimal(18,6) DEFAULT NULL,
  `C18` decimal(18,6) DEFAULT NULL,
  `C19` decimal(18,6) DEFAULT NULL,
  `C20` decimal(18,6) DEFAULT NULL,
  `C21` decimal(18,6) DEFAULT NULL,
  `C22` decimal(18,6) DEFAULT NULL,
  `C23` decimal(18,6) DEFAULT NULL,
  `C24` decimal(18,6) DEFAULT NULL,
  `C25` decimal(18,6) DEFAULT NULL,
  `C26` decimal(18,6) DEFAULT NULL,
  `C27` decimal(18,6) DEFAULT NULL,
  `C28` decimal(18,6) DEFAULT NULL,
  `C29` decimal(18,6) DEFAULT NULL,
  `C30` decimal(18,6) DEFAULT NULL,
  `C31` decimal(18,6) DEFAULT NULL,
  `C32` decimal(18,6) DEFAULT NULL,
  `C33` decimal(18,6) DEFAULT NULL,
  `C34` decimal(18,6) DEFAULT NULL,
  `C35` decimal(18,6) DEFAULT NULL,
  `C36` decimal(18,6) DEFAULT NULL,
  `C37` decimal(18,6) DEFAULT NULL,
  `C38` decimal(18,6) DEFAULT NULL,
  `C39` decimal(18,6) DEFAULT NULL,
  `C40` decimal(18,6) DEFAULT NULL,
  `Note` varchar(256) DEFAULT NULL,
  `TradeMethodPeriod` varchar(10) DEFAULT NULL,
  `TradeMethodName` varchar(40) DEFAULT NULL,
  `TrailStopPeriod` varchar(10) DEFAULT NULL,
  `TrailStopName` varchar(40) DEFAULT NULL,
  `TrailMoveTsName` varchar(40) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`AccountID`,`OrderID`,`Class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TsContext`
--

LOCK TABLES `TsContext` WRITE;
/*!40000 ALTER TABLE `TsContext` DISABLE KEYS */;
/*!40000 ALTER TABLE `TsContext` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TsContextTitle`
--

DROP TABLE IF EXISTS `TsContextTitle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TsContextTitle` (
  `TitleSeq` int(11) NOT NULL AUTO_INCREMENT,
  `TitleMd5` varchar(64) NOT NULL,
  `T1` varchar(40) DEFAULT NULL,
  `T2` varchar(40) DEFAULT NULL,
  `T3` varchar(40) DEFAULT NULL,
  `T4` varchar(40) DEFAULT NULL,
  `T5` varchar(40) DEFAULT NULL,
  `T6` varchar(40) DEFAULT NULL,
  `T7` varchar(40) DEFAULT NULL,
  `T8` varchar(40) DEFAULT NULL,
  `T9` varchar(40) DEFAULT NULL,
  `T10` varchar(40) DEFAULT NULL,
  `T11` varchar(40) DEFAULT NULL,
  `T12` varchar(40) DEFAULT NULL,
  `T13` varchar(40) DEFAULT NULL,
  `T14` varchar(40) DEFAULT NULL,
  `T15` varchar(40) DEFAULT NULL,
  `T16` varchar(40) DEFAULT NULL,
  `T17` varchar(40) DEFAULT NULL,
  `T18` varchar(40) DEFAULT NULL,
  `T19` varchar(40) DEFAULT NULL,
  `T20` varchar(40) DEFAULT NULL,
  `T21` varchar(40) DEFAULT NULL,
  `T22` varchar(40) DEFAULT NULL,
  `T23` varchar(40) DEFAULT NULL,
  `T24` varchar(40) DEFAULT NULL,
  `T25` varchar(40) DEFAULT NULL,
  `T26` varchar(40) DEFAULT NULL,
  `T27` varchar(40) DEFAULT NULL,
  `T28` varchar(40) DEFAULT NULL,
  `T29` varchar(40) DEFAULT NULL,
  `T30` varchar(40) DEFAULT NULL,
  `T31` varchar(40) DEFAULT NULL,
  `T32` varchar(40) DEFAULT NULL,
  `T33` varchar(40) DEFAULT NULL,
  `T34` varchar(40) DEFAULT NULL,
  `T35` varchar(40) DEFAULT NULL,
  `T36` varchar(40) DEFAULT NULL,
  `T37` varchar(40) DEFAULT NULL,
  `T38` varchar(40) DEFAULT NULL,
  `T39` varchar(40) DEFAULT NULL,
  `T40` varchar(40) DEFAULT NULL,
  `ins_user_id` varchar(40) DEFAULT NULL,
  `ins_datetime` datetime DEFAULT NULL,
  `upd_user_id` varchar(40) DEFAULT NULL,
  `upd_datetime` datetime DEFAULT NULL,
  PRIMARY KEY (`TitleSeq`),
  UNIQUE KEY `TitleMd5` (`TitleMd5`),
  KEY `TitleMd5_2` (`TitleMd5`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TsContextTitle`
--

LOCK TABLES `TsContextTitle` WRITE;
/*!40000 ALTER TABLE `TsContextTitle` DISABLE KEYS */;
/*!40000 ALTER TABLE `TsContextTitle` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-09-21 14:55:18
