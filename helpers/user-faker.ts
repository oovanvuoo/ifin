import { faker } from "@faker-js/faker";

export class UserFaker {
  static generatePhone(): string {
    return `09${Math.floor(10_000_000 + Math.random() * 90_000_000)}`;
  }

  static generateInvalidShortPhone(): string {
    return `09${Math.floor(0 + Math.random() * 900_000)}`;
  }

  static generateInvalidLongPhone(): string {
    return `09${Math.floor(10_000_000_000 + Math.random() * 90_000_000_000)}`;
  }

  static generateFullName(): string {
    return faker.person.fullName();
  }
}