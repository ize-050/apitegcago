const fs = require('fs');
const path = require('path');

// ฟังก์ชันสำหรับค้นหาไฟล์ทั้งหมดในไดเรกทอรี
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('prisma-client.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// ฟังก์ชันสำหรับแก้ไขไฟล์
function updateRepositoryFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // ตรวจสอบว่ามีการสร้าง PrismaClient หรือไม่
  if (content.includes('new PrismaClient()')) {
    console.log(`Updating ${filePath}`);
    
    // แก้ไขการ import
    if (!content.includes("import { prisma } from")) {
      // หา import จาก @prisma/client
      const prismaImportRegex = /import\s+{\s*PrismaClient.*}\s+from\s+["']@prisma\/client["'];?/;
      const prismaImportMatch = content.match(prismaImportRegex);
      
      if (prismaImportMatch) {
        // แก้ไข import จาก PrismaClient เป็น prisma singleton
        const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'prisma')).replace(/\\/g, '/');
        const newImport = `import { prisma } from "${relativePath}/prisma-client";`;
        
        // ถ้ามี import อื่นๆ จาก @prisma/client ให้คงไว้
        if (prismaImportMatch[0].includes(',')) {
          const otherImports = prismaImportMatch[0].replace(/PrismaClient,?\s*/, '');
          content = content.replace(prismaImportRegex, otherImports + '\n' + newImport);
        } else {
          content = content.replace(prismaImportRegex, newImport);
        }
      } else {
        // ถ้าไม่พบ import จาก @prisma/client ให้เพิ่มใหม่
        const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'prisma')).replace(/\\/g, '/');
        const newImport = `import { prisma } from "${relativePath}/prisma-client";`;
        content = newImport + '\n' + content;
      }
    }
    
    // แก้ไข constructor
    const constructorRegex = /constructor\s*\(\s*\)\s*{\s*this\.prisma\s*=\s*new\s+PrismaClient\(\);?\s*}/g;
    content = content.replace(constructorRegex, 'constructor() {\n    // ใช้ prisma singleton แทนการสร้าง PrismaClient ใหม่\n  }');
    
    // แก้ไขการใช้ this.prisma เป็น prisma
    content = content.replace(/this\.prisma\./g, 'prisma.');
    
    // บันทึกไฟล์
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// ค้นหาและแก้ไขไฟล์ทั้งหมดใน repository
const repositoryDir = path.join(__dirname, 'repository');
const files = getAllFiles(repositoryDir);
let updatedCount = 0;

files.forEach(file => {
  const updated = updateRepositoryFile(file);
  if (updated) {
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} repository files.`);
