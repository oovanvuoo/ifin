import { faker } from "@faker-js/faker";

export const fakerUtils = {
  generatePhone(): string {
    return `09${faker.string.numeric(8)}`;
  },
  generateFullName(): string {
    return faker.person.fullName();
  }
};
