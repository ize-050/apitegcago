-- สร้าง Manager role และ user ทดสอบสำหรับระบบ TegCaGo

-- เพิ่ม Manager role
INSERT INTO roles (id, roles_name, createdAt) 
VALUES (UUID(), 'Manager', NOW());

-- สร้าง user ทดสอบสำหรับ Manager role
INSERT INTO user (id, roles_id, email, password, fullname, createdAt)
SELECT 
    UUID() as id,
    r.id as roles_id,
    'manager_new@tegcago.com' as email,
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' as password, -- password
    'Manager Test User' as fullname,
    NOW() as createdAt
FROM roles r 
WHERE r.roles_name = 'Manager';

SELECT 
    u.id,
    u.fullname,
    u.email,
    r.roles_name
FROM user u
JOIN roles r ON u.roles_id = r.id
WHERE r.roles_name = 'Manager';
