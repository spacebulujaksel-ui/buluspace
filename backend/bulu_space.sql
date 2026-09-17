-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 10, 2026 at 06:38 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bulu_space`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `Id` int NOT NULL,
  `User_id` int NOT NULL,
  `Therapist_id` int NOT NULL,
  `Appointment_date` date NOT NULL,
  `Start_time` time NOT NULL,
  `End_time` time NOT NULL,
  `Status` enum('Pending','Confirmed','Completed','Cancelled') NOT NULL,
  `Notes` text NOT NULL,
  `Total_price` decimal(12,2) NOT NULL,
  `Created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`Id`, `User_id`, `Therapist_id`, `Appointment_date`, `Start_time`, `End_time`, `Status`, `Notes`, `Total_price`, `Created_at`) VALUES
(1, 1, 1, '2026-09-12', '01:17:02', '01:40:02', 'Confirmed', 'boking untuk bagian underarm', 50000.00, '2026-09-10 18:19:36'),
(2, 2, 2, '2026-09-11', '01:17:00', '01:37:02', 'Confirmed', 'boking waxing', 75000.00, '2026-09-10 18:19:36');

-- --------------------------------------------------------

--
-- Table structure for table `appointments_details`
--

CREATE TABLE `appointments_details` (
  `Id` int NOT NULL,
  `Appoinment_id` int NOT NULL,
  `Service_id` int NOT NULL,
  `Quantity` int NOT NULL,
  `Price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appointments_details`
--

INSERT INTO `appointments_details` (`Id`, `Appoinment_id`, `Service_id`, `Quantity`, `Price`) VALUES
(1, 1, 23, 1, 50000.00),
(2, 2, 36, 1, 250000.00);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `Id_reviews` int NOT NULL,
  `User_id` int NOT NULL,
  `Appointment_id` int NOT NULL,
  `Rating` tinyint(1) NOT NULL,
  `Comment` text NOT NULL,
  `Created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`Id_reviews`, `User_id`, `Appointment_id`, `Rating`, `Comment`, `Created_at`) VALUES
(1, 1, 1, 5, 'pelayanan sangat bagus', '2026-09-10 18:22:32'),
(2, 2, 2, 5, 'pelayanan bagus dan tempat sangat nyaman', '2026-09-10 18:22:32');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `Id` int NOT NULL,
  `Therapist_id` int NOT NULL,
  `Schedule_date` date NOT NULL,
  `Start_time` time NOT NULL,
  `End_time` time NOT NULL,
  `Status` enum('Available','Not Available') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`Id`, `Therapist_id`, `Schedule_date`, `Start_time`, `End_time`, `Status`) VALUES
(1, 1, '2026-09-11', '00:00:00', '00:00:00', 'Not Available'),
(2, 2, '2026-09-11', '00:00:00', '00:00:00', 'Available');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `Id` int NOT NULL,
  `Name` varchar(25) NOT NULL,
  `Description` text NOT NULL,
  `Price` decimal(12,2) NOT NULL,
  `Duration_minutes` int NOT NULL,
  `Image` varchar(100) NOT NULL,
  `Status` enum('Inactive','Active') NOT NULL,
  `Created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`Id`, `Name`, `Description`, `Price`, `Duration_minutes`, `Image`, `Status`, `Created_at`) VALUES
(1, 'Forehead', 'Waxing untuk area kepala', 50000.00, 10, '', 'Active', '2026-09-10 17:57:13'),
(20, 'Eyebrows', 'Waxing untuk bagian alis', 20000.00, 30, '', 'Active', '2026-09-10 18:12:59'),
(21, 'Chin', 'Waxing untuk bagian dagu', 40000.00, 10, '', 'Active', '2026-09-10 18:12:59'),
(22, 'Upper lip', 'Waxing Untuk bagian atas Bibir', 15000.00, 10, '', 'Active', '2026-09-10 18:12:59'),
(23, 'Undderarm', 'Waxing untuk daerah bawah ketiak', 50000.00, 15, '', 'Active', '2026-09-10 18:12:59'),
(24, 'Half arms', 'waxing untuk bagian setengah lengan', 10000.00, 15, '', 'Active', '2026-09-10 18:12:59'),
(25, 'full arms', 'waxing untuk bagian seluruh lengan', 55000.00, 30, '', 'Active', '2026-09-10 18:12:59'),
(26, 'chest', 'waxing untuk bagian dada', 50000.00, 65000, '', 'Active', '2026-09-10 18:12:59'),
(27, 'stomach', 'waxing untuk bagian perut', 60000.00, 15, '', 'Active', '2026-09-10 18:12:59'),
(28, 'full front', 'waxing untuk seluruh bagian depan badan', 80000.00, 30, '', 'Active', '2026-09-10 18:12:59'),
(29, 'full back', 'waxing untuk seluruh bagian badan belakang', 120000.00, 30, '', 'Active', '2026-09-10 18:12:59'),
(30, 'half legs', 'waxing untuk setengah bagian dari kaki', 50000.00, 15, '', 'Active', '2026-09-10 18:12:59'),
(31, 'full legs', 'waxing untuk seluruh bagian kaki', 70000.00, 30, '', 'Active', '2026-09-10 18:12:59'),
(32, 'basic bikini', '', 120000.00, 15, '', 'Active', '2026-09-10 18:12:59'),
(33, 'brazilian', '', 150000.00, 30, '', 'Active', '2026-09-10 18:12:59'),
(34, 'buttocks', '', 150000.00, 15, '', 'Active', '2026-09-10 18:12:59'),
(35, 'clean girl', '', 200000.00, 45, '', 'Active', '2026-09-10 18:12:59'),
(36, 'feel smooth', '', 200000.00, 60, '', 'Active', '2026-09-10 18:12:59'),
(37, 'bali ready', '', 250000.00, 45, '', 'Active', '2026-09-10 18:12:59');

-- --------------------------------------------------------

--
-- Table structure for table `therapists`
--

CREATE TABLE `therapists` (
  `Id_therapists` int NOT NULL,
  `Name` varchar(25) NOT NULL,
  `Phone` varchar(13) NOT NULL,
  `Photo` varchar(100) NOT NULL,
  `Status` enum('Active','Inactive') NOT NULL,
  `Created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `therapists`
--

INSERT INTO `therapists` (`Id_therapists`, `Name`, `Phone`, `Photo`, `Status`, `Created_at`) VALUES
(1, 'Sarah', '085232324444', '', 'Active', '2026-09-10 18:14:30'),
(2, 'Amanda', '085910554448', '', 'Active', '2026-09-10 18:14:30'),
(3, 'Jessica', '084855541112', '', 'Inactive', '2026-09-10 18:14:30');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id_user` int NOT NULL,
  `Name` varchar(25) NOT NULL,
  `Email` varchar(30) NOT NULL,
  `Phone` varchar(13) NOT NULL,
  `Password` varchar(10) NOT NULL,
  `Role` enum('Admin','Custumer') NOT NULL,
  `Created_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`Id_user`, `Name`, `Email`, `Phone`, `Password`, `Role`, `Created_at`) VALUES
(1, 'andi', 'andi@gmail.com', '085163274684', 'andi123', 'Custumer', '2026-09-10 17:49:55'),
(2, 'budi', 'budi@gmail.com', '081232547985', 'budi333', 'Custumer', '2026-09-10 17:49:55'),
(3, 'citra', 'citraut@gmail.com', '085432584744', 'citra221', 'Admin', '2026-09-10 17:51:54'),
(4, 'admin asli', 'admin@buluspace.com', '081212121213', 'admin123', 'Admin', '2026-09-10 17:51:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `User_id` (`User_id`),
  ADD KEY `Therapist_id` (`Therapist_id`);

--
-- Indexes for table `appointments_details`
--
ALTER TABLE `appointments_details`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Appoinment_id` (`Appoinment_id`),
  ADD KEY `Service_id` (`Service_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`Id_reviews`),
  ADD KEY `User_id` (`User_id`),
  ADD KEY `Appointment_id` (`Appointment_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `Therapist_id` (`Therapist_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `therapists`
--
ALTER TABLE `therapists`
  ADD PRIMARY KEY (`Id_therapists`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id_user`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `appointments_details`
--
ALTER TABLE `appointments_details`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `Id_reviews` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `Id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `therapists`
--
ALTER TABLE `therapists`
  MODIFY `Id_therapists` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `users` (`Id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`Therapist_id`) REFERENCES `therapists` (`Id_therapists`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `appointments_details`
--
ALTER TABLE `appointments_details`
  ADD CONSTRAINT `appointments_details_ibfk_1` FOREIGN KEY (`Appoinment_id`) REFERENCES `appointments` (`Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `appointments_details_ibfk_2` FOREIGN KEY (`Service_id`) REFERENCES `services` (`Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `users` (`Id_user`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`Appointment_id`) REFERENCES `appointments` (`Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`Therapist_id`) REFERENCES `therapists` (`Id_therapists`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
