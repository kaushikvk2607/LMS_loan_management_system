const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type BreInput = {
  pan: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: string;
};

function getAge(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }

  return age;
}

export function runEligibilityRules(input: BreInput) {
  const errors: string[] = [];
  const age = getAge(input.dateOfBirth);

  if (age < 23 || age > 50) errors.push("Applicant age must be between 23 and 50 years.");
  if (input.monthlySalary < 25000) errors.push("Monthly salary must be at least INR 25,000.");
  if (!panRegex.test(input.pan.toUpperCase())) errors.push("PAN must match the format ABCDE1234F.");
  if (input.employmentMode === "UNEMPLOYED") errors.push("Unemployed applicants are not eligible.");

  return {
    passed: errors.length === 0,
    errors
  };
}
