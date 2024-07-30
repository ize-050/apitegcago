-- AddForeignKey
ALTER TABLE `d_agentcy` ADD CONSTRAINT `d_agentcy_agentcy_id_fkey` FOREIGN KEY (`agentcy_id`) REFERENCES `agentcy`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
