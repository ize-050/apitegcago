-- Commission Ranks Seed Data
-- ลบข้อมูลเดิมทั้งหมด
DELETE FROM commission_ranks;

-- เพิ่มข้อมูล Commission Ranks แยกตามประเภทงาน

-- ALL IN - งานครบวงจร (อัตราสูงสุด)
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'ALL IN', 0, 50000, 3.0, NOW(), NOW()),
(UUID(), 'ALL IN', 50001, 100000, 4.0, NOW(), NOW()),
(UUID(), 'ALL IN', 100001, 200000, 5.0, NOW(), NOW()),
(UUID(), 'ALL IN', 200001, 500000, 6.0, NOW(), NOW()),
(UUID(), 'ALL IN', 500001, 999999999, 7.0, NOW(), NOW());

-- เคลียร์ฝั่งไทย - งานเคลียร์ในประเทศ
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'เคลียร์ฝั่งไทย', 0, 30000, 2.0, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งไทย', 30001, 70000, 3.0, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งไทย', 70001, 150000, 4.0, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งไทย', 150001, 300000, 5.0, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งไทย', 300001, 999999999, 6.0, NOW(), NOW());

-- เคลียร์ฝั่งจีน - งานเคลียร์ต่างประเทศ
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'เคลียร์ฝั่งจีน', 0, 35000, 2.5, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งจีน', 35001, 80000, 3.5, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งจีน', 80001, 180000, 4.5, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งจีน', 180001, 350000, 5.5, NOW(), NOW()),
(UUID(), 'เคลียร์ฝั่งจีน', 350001, 999999999, 6.5, NOW(), NOW());

-- GREEN - งาน Green Channel (อัตราต่ำ)
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'GREEN', 0, 20000, 1.5, NOW(), NOW()),
(UUID(), 'GREEN', 20001, 50000, 2.0, NOW(), NOW()),
(UUID(), 'GREEN', 50001, 100000, 2.5, NOW(), NOW()),
(UUID(), 'GREEN', 100001, 999999999, 3.0, NOW(), NOW());

-- FOB - Free On Board (อัตราต่ำ)
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'FOB', 0, 25000, 1.5, NOW(), NOW()),
(UUID(), 'FOB', 25001, 60000, 2.0, NOW(), NOW()),
(UUID(), 'FOB', 60001, 120000, 2.5, NOW(), NOW()),
(UUID(), 'FOB', 120001, 999999999, 3.0, NOW(), NOW());

-- EXW - Ex Works (อัตราต่ำสุด)
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'EXW', 0, 15000, 1.0, NOW(), NOW()),
(UUID(), 'EXW', 15001, 40000, 1.5, NOW(), NOW()),
(UUID(), 'EXW', 40001, 80000, 2.0, NOW(), NOW()),
(UUID(), 'EXW', 80001, 999999999, 2.5, NOW(), NOW());

-- CIF - Cost, Insurance and Freight (อัตรากลาง)
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'CIF', 0, 40000, 2.0, NOW(), NOW()),
(UUID(), 'CIF', 40001, 90000, 3.0, NOW(), NOW()),
(UUID(), 'CIF', 90001, 180000, 4.0, NOW(), NOW()),
(UUID(), 'CIF', 180001, 999999999, 5.0, NOW(), NOW());

-- CUSTOMER CLEAR - ลูกค้าเคลียร์เอง (อัตราต่ำ)
INSERT INTO commission_ranks (id, work_type, min_amount, max_amount, percentage, createdAt, updatedAt) VALUES
(UUID(), 'CUSTOMER CLEAR', 0, 20000, 1.0, NOW(), NOW()),
(UUID(), 'CUSTOMER CLEAR', 20001, 50000, 1.5, NOW(), NOW()),
(UUID(), 'CUSTOMER CLEAR', 50001, 100000, 2.0, NOW(), NOW()),
(UUID(), 'CUSTOMER CLEAR', 100001, 999999999, 2.5, NOW(), NOW());

-- แสดงผลลัพธ์
SELECT 
    work_type,
    COUNT(*) as total_ranks,
    MIN(min_amount) as min_range,
    MAX(max_amount) as max_range,
    MIN(percentage) as min_percentage,
    MAX(percentage) as max_percentage
FROM commission_ranks 
GROUP BY work_type 
ORDER BY work_type;