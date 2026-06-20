/**
 * Shared type definitions for test data
 */

export type LoginDataRow = {
  testcaseID: string;
  phone: string;
  fullName: string;
};

export type SignupDataRow = LoginDataRow;
export type CtvDataRow = LoginDataRow;
