import bcryptjs from "bcryptjs";

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashed = bcryptjs.hashSync(password, saltRounds);
  console.log(`Hashed Password: ${hashed}`);
};

// Replace 'YourSecurePassword' with the actual password you want to hash
hashPassword("pet.admin313").catch(console.error);
