import { ValueTransformer } from 'typeorm';

export class AgeTransformer implements ValueTransformer {
  // This method is used to transform the value when persisting it to the database
  private ageOffset: number; // Define a class variable

  private currentYear: number;

  // Initialize the variable using the constructor
  constructor() {
    this.ageOffset = 1900;
    this.currentYear = new Date().getFullYear();
  }

  to(value: any): any {
    return this.currentYear - this.ageOffset + value;
  }

  // This method is used to transform the value when retrieving it from the database
  from(value: any): any {
    return this.ageOffset + value - this.currentYear;
  }
}
