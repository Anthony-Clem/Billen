import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints as [string];
    const object = args.object as Record<string, unknown>;
    const relatedValue =
      typeof object === 'object' && object !== null
        ? object[relatedPropertyName]
        : undefined;
    return value === relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints as [string];
    return `${args.property} must match ${relatedPropertyName}`;
  }
}

/**
 * Custom decorator to ensure two fields match.
 */
export function Match<T>(
  property: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: T, propertyName: string): void {
    registerDecorator({
      target: (object as Record<string, any>).constructor,
      propertyName,
      options: validationOptions,
      constraints: [property as string],
      validator: MatchConstraint,
    });
  };
}
