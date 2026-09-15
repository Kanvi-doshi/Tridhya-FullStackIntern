import "reflect-metadata";
import bcrypt from "bcryptjs";

import { AppDataSource } from "./lib/config/db";
import { User, UserRole } from "./lib/entity/User";

const seedUsers = async () => {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = [
      {
        name: "Test HR",
        email: "hr_1@gmail.com",
        password: hashedPassword,
        role: UserRole.HR,
      },
      {
        name: "Test Interviewer",
        email: "interviewer@gmail.com",
        password: hashedPassword,
        role: UserRole.INTERVIEWER,
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);

        console.log(`${userData.role} created`);
      }
    }

    console.log("Seeding completed");

    await AppDataSource.destroy();
  } catch (error) {
    console.error("Seeding failed:", error);
  }
};

seedUsers();
