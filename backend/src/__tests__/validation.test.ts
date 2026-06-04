import { User } from '../models/User';
import { initDb, sequelize } from '../config/db';

const runTests = async () => {
  console.log('--- STARTING VALIDATION TESTS ---');
  try {
    // 1. Initialize DB Connection
    await initDb();
    await sequelize.sync({ force: false });

    // Test Case 1: Name less than 20 characters (should fail)
    try {
      console.log('Test 1: Creating user with name shorter than 20 chars...');
      await User.build({
        name: 'Short Name',
        email: 'test_short@storerating.com',
        password: 'Password123!',
        address: 'Valid address description that meets criteria.',
        role: 'user'
      }).validate();
      console.error('❌ Fail: User with short name validated successfully!');
      process.exit(1);
    } catch (err: any) {
      console.log('✅ Pass: Correctly failed validation. Error:', err.message);
    }

    // Test Case 2: Password with no uppercase letter (should fail)
    try {
      console.log('Test 2: Creating user with password lacking uppercase...');
      const user = User.build({
        name: 'Valid Name Character Length Over Twenty',
        email: 'test_nopass@storerating.com',
        password: 'password123!', // No uppercase
        address: 'Valid address description that meets criteria.',
        role: 'user'
      });
      await (User as any).runHooks('beforeSave', user);
      console.error('❌ Fail: Password lacking uppercase validated successfully!');
      process.exit(1);
    } catch (err: any) {
      if (err.message.includes('uppercase')) {
        console.log('✅ Pass: Correctly failed validation. Error:', err.message);
      } else {
        console.error('❌ Fail: Failed with unexpected error:', err.message);
        process.exit(1);
      }
    }

    // Test Case 3: Password with no special character (should fail)
    try {
      console.log('Test 3: Creating user with password lacking special character...');
      const user = User.build({
        name: 'Valid Name Character Length Over Twenty',
        email: 'test_nopass2@storerating.com',
        password: 'Password123', // No special char
        address: 'Valid address description that meets criteria.',
        role: 'user'
      });
      await (User as any).runHooks('beforeSave', user);
      console.error('❌ Fail: Password lacking special character validated successfully!');
      process.exit(1);
    } catch (err: any) {
      if (err.message.includes('special character')) {
        console.log('✅ Pass: Correctly failed validation. Error:', err.message);
      } else {
        console.error('❌ Fail: Failed with unexpected error:', err.message);
        process.exit(1);
      }
    }

    // Test Case 4: Invalid Email format (should fail)
    try {
      console.log('Test 4: Creating user with invalid email format...');
      await User.build({
        name: 'Valid Name Character Length Over Twenty',
        email: 'invalid-email-format',
        password: 'Password123!',
        address: 'Valid address description that meets criteria.',
        role: 'user'
      }).validate();
      console.error('❌ Fail: User with invalid email format validated successfully!');
      process.exit(1);
    } catch (err: any) {
      console.log('✅ Pass: Correctly failed validation. Error:', err.message);
    }

    // Test Case 5: Valid user details (should pass)
    try {
      console.log('Test 5: Validating complete correct user payload...');
      const user = User.build({
        name: 'Valid Name Character Length Over Twenty',
        email: 'test_valid@storerating.com',
        password: 'Password123!',
        address: 'Valid address description that meets criteria.',
        role: 'user'
      });
      await user.validate();
      await (User as any).runHooks('beforeSave', user);
      console.log('✅ Pass: Valid user details validated successfully.');
    } catch (err: any) {
      console.error('❌ Fail: Valid user failed validation. Error:', err.message);
      process.exit(1);
    }

    console.log('--- ALL VALIDATION TESTS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error: any) {
    console.error('Test script crashed:', error);
    process.exit(1);
  }
};

runTests();
