import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";  // For password hashing
import { UserModel } from "../models/User.js";       // Adjust path as needed
import { AdoptionAdModel } from "../models/AdoptionAd.js"; // Adjust path as needed

dotenv.config();

// Use a direct connection string (or use process.env.MONGO_URI if available)
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/PetConnect";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

/* -------------------------- Option Lists for Users -------------------------- */
const majorCitiesPakistan = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar",
  "Quetta", "Multan", "Hyderabad", "Sialkot", "Gujranwala", "Sargodha", "Bahawalpur"
];

const petTypes = ["cat", "dog", "rabbit"];
const housingTypes = ["Apartment", "House with Yard", "Farm"];
const spaceOptions = ["Small", "Medium", "Large"];
const energyOptions = ["Low", "Medium", "High"];
const petOwnerOptions = ["SELF", "FAMILY"];
const kidsAtHomeOptions = ["YES", "NO"];
const kidsAgeOptions = ["YOUNGER", "OLDER", "BOTH"];
const petOwnershipTypeOptions = ["FIRST_TIME", "PREVIOUS", "CURRENT"];
const agePreferenceOptions = ["NONE", "BABY", "YOUNG", "ADULT", "SENIOR"];
const sizePreferenceOptions = ["NONE", "SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"];
const coatPreferenceOptions = ["NONE", "SHORT", "MEDIUM", "LONG"];
const specialNeedsReceptivenessOptions = ["YES", "NO"];
const idealNeedsOptions = ["ALLERGY_FRIENDLY", "LITTER_BOX_TRAINED"];

/* ---------------------- Breed Options for Each Pet Type ---------------------- */
const dogBreedOptions = ["Labrador", "Golden Retriever", "German Shepherd", "Beagle", "Bulldog", "Rottweiler"];
const catBreedOptions = ["Siamese", "Persian", "Maine Coon", "Sphynx"];
const rabbitBreedOptions = ["Lionhead", "Dutch", "Flemish Giant"];

/* ------------------ Mappings for Valid Sizes & Age Options ------------------ */
// Dog size mapping: which sizes are valid per breed
const dogBreedSizeMapping = {
  "Labrador": ["Large"],
  "Golden Retriever": ["Large"],
  "German Shepherd": ["Large"],
  "Beagle": ["Small", "Medium"],
  "Bulldog": ["Medium", "Large"],
  "Rottweiler": ["Large"]
};

// Dog age options mapping (typical lifespan range for each breed)
const dogAgeOptionsByBreed = {
  "Labrador": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"],
  "Golden Retriever": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"],
  "German Shepherd": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"],
  "Beagle": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years", "13 years", "14 years", "15 years"],
  "Bulldog": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"],
  "Rottweiler": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"]
};

// Cat size mapping
const catBreedSizeMapping = {
  "Siamese": ["Small", "Medium"],
  "Persian": ["Medium", "Large"],
  "Maine Coon": ["Large"],
  "Sphynx": ["Small", "Medium"]
};

// Cat age options mapping
const catAgeOptionsByBreed = {
  "Siamese": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years", "13 years", "14 years", "15 years"],
  "Persian": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"],
  "Maine Coon": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years"],
  "Sphynx": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years", "11 years", "12 years", "13 years", "14 years", "15 years"]
};

// Rabbit size mapping
const rabbitBreedSizeMapping = {
  "Lionhead": ["Small", "Medium"],
  "Dutch": ["Small", "Medium"],
  "Flemish Giant": ["Large"]
};

// Rabbit age options mapping
const rabbitAgeOptionsByBreed = {
  "Lionhead": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years"],
  "Dutch": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years"],
  "Flemish Giant": ["Under 1 year", "1 year", "2 years", "3 years", "4 years", "5 years", "6 years", "7 years", "8 years", "9 years", "10 years"]
};

/* ------------------------------ Other Option Lists ------------------------------ */
const petColorsList = [
  "Black", "Brown / Chocolate", "Blue", "Cream / Fawn / Yellow",
  "Gold / Apricot", "Other", "Mixed Colour", "Red / Ginger", "Silver / Grey", "White"
];
const rehomingReasonsList = [
  "Behavioural Issues", "Busy Schedule", "Change in Family Circumstances",
  "Does not get along with another Pet", "Fostered", "Found or Abandoned",
  "Human Health Issue (e.g. allergy, sickness)", "Infant, young children or pregnancy",
  "Landlord permission issue", "Ongoing costs (e.g. lost job)",
  "Pet Medical expenses (e.g. vet procedure)"
];
// (Keeping petAgeOptions defined but note that we will use species-specific options instead)
// const petAgeOptions = [ ... ];

const dogCharacteristicsList = [
  "Good with adults", "Good with children", "Good with other dogs", "Needs to be the ONLY PET in the home",
  "Has lived with dogs - it was fine", "Has lived with dogs - it didn't go well", "Has lived with cats - it was fine",
  "Has lived with cats - it didn't go well", "Is fairly relaxed", "Is active and lively", "Is only walked on the leash",
  "Can be left alone for short to medium periods", "Has good recall", "Travels well in cars", "Needs more exercise than most dogs"
];
const catCharacteristicsList = [
  "Good with people in general", "Good with children", "Needs to be the ONLY PET in the home",
  "Has lived with dogs - it didn't go well", "Has lived with dogs - it was fine", "Has lived with cats - it was fine",
  "Has lived with cats - it didn't go well", "Is an INDOOR ONLY cat", "Likes to have their own space",
  "Enjoys going outside / needs a garden", "Uses a cat flap", "Is a 'lap cat'", "Is active and playful",
  "Accepts being handled/stroked"
];
const rabbitCharacteristicsList = [
  "Lives with other rabbits", "Lives alone", "Lives outdoors", "Lives indoors",
  "Lives indoors and spends time outdoors", "Accepts being handled/stroked",
  "Does not like being handled/stroked", "Is friendly", "Is good with children",
  "Accepts being picked up and held", "Does not like being picked up and held"
];
const dogSocialIssuesList = [
  "Reacts badly to people", "Reacts badly to other dogs", "Is aggressive", "Is a barker (problematic)",
  "Has separation anxiety", "Bites or nips", "Has no or limited recall", "Cannot be walked off the leash",
  "Pulls on the lead (problematic)", "Jumps up or lunges (problematic)", "Can demonstrate resource guarding at times"
];
const catSocialIssuesList = [
  "Not yet house trained", "Sprays around the house", "Unfriendly towards people", "Is aggressive"
];

const keepDurationOptions = ["Less than 1 month", "1 month", "2 months", "Until a home is found"];
const householdActivityLevelOptions = [
  "Moderate comings and goings", "Quiet with occasional guests", "Busy / noisy"
];
const otherPetsOptions = [
  "Yes, my pet lives with dogs",
  "Yes, my pet lives with cats",
  "Yes, my pet lives with rabbits",
  "Yes, my pet lives with other small furries (such as hamsters, mice etc.)",
  "No, my pet lives as an ONLY pet in the household"
];
const householdEnvironmentOptions = ["Town", "Rural", "City", "Suburban"];
// We'll no longer use the generic sizeOptions for pets – size is determined by breed mapping.
const spayedNeuteredOptions = ["Yes", "No", "Unknown"];
const microchippedOptions = ["Yes", "No"];
const ownedDurationOptions = ["Under 6 months", "6 months - 1 year", "1 - 2 years", "3 - 4 years", "5+ years"];
const acquiredFromOptions = [
  "Breeder", "Friend/Family", "Found", "Fostered", "Charity/RescueCenter", "PetShop", "Online Seller / Marketplace", "Other"
];

// Pet names per species
const dogNames = ["Buddy", "Max", "Charlie", "Rocky", "Bella", "Duke", "Cooper", "Bailey", "Jack", "Milo"];
const catNames = ["Whiskers", "Mittens", "Luna", "Simba", "Oliver", "Chloe", "Shadow", "Smokey", "Lily", "Tiger"];
const rabbitNames = ["Thumper", "Cocoa", "Bunny", "Daisy", "Oreo", "Snowball", "Pepper", "Pumpkin", "Hazel", "Willow"];

/* ------------------------------ Image Loading Logic ------------------------------ */
// Define folder paths for pet images (adjust if necessary)
const petImagesPath = {
  dog: "D:/D/Main Branch/Pets Detection/archive/Pets/dog",
  cat: "D:/D/Main Branch/Pets Detection/archive/Pets/cat",
  rabbit: "D:/D/Main Branch/Pets Detection/archive/Pets/Rabbits"
};

// Helper function to load and encode an image as Base64
function encodeImageToBase64(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error reading image file:", filePath, error);
    return null;
  }
}

// Function to randomly select N images from a given folder based on pet type
function getRandomPetImages(petType, count = 4) {
  const folderPath = petImagesPath[petType];
  if (!fs.existsSync(folderPath)) return [];
  const files = fs.readdirSync(folderPath).filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  if (files.length === 0) return [];
  
  // If available files are fewer than count, we allow duplicates
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(files[Math.floor(Math.random() * files.length)]);
  }
  // Return an array of Base64 encoded images
  return selected.map(file => encodeImageToBase64(path.join(folderPath, file)));
}

/* --------------------- Helper Functions for Random Data --------------------- */
// Generate a Pakistani phone number in format: 03XXXXXXXXX
function generatePakistaniPhoneNumber() {
  const prefix = "03";
  let number = "";
  for (let i = 0; i < 9; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return prefix + number;
}

// Return a random element from an array
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Return a random boolean value
function randomBoolean() {
  return Math.random() < 0.5;
}

// Return a random subset (array) of given items (min to max count)
function randomSubset(arr, min = 1, max = 2) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate a unique name by combining a random first and last name with an index
const firstNames = [
  "Ali", "Ahmed", "Sara", "Aisha", "Hassan", "Fatima", "Zain", "Mariam",
  "Usman", "Khadija", "Bilal", "Nida", "Sadia", "Imran", "Sana", "Tariq",
  "Rabia", "Shahid", "Lubna", "Fahad", "Irfan", "Naila", "Rehan", "Shazia",
  "Osman", "Fiza", "Adnan", "Saira", "Muzammil", "Amina", "Sania", "Kamran",
  "Sajid", "Hina", "Rizwan", "Mehwish", "Qasim", "Rukhsana"
];
const lastNames = [
  "Khan", "Raza", "Malik", "Iqbal", "Shah", "Noor", "Ali", "Hussain",
  "Qureshi", "Siddiqui", "Ahmed", "Abbas", "Yousuf", "Javed", "Mehmood",
  "Aslam", "Ilyas", "Saeed", "Farooq", "Kazmi", "Chaudhry", "Akhtar",
  "Rehman", "Sheikh", "Mirza", "Beg", "Bukhari", "Durrani", "Sattar", "Rauf"
];
function generateUniqueName(index) {
  const first = randomElement(firstNames);
  const last = randomElement(lastNames);
  return `${first} ${last} ${index}`; // Append index for uniqueness
}

/* ------------------------------- SEED SCRIPT ------------------------------- */
const seedDatabase = async () => {
  try {
    // Clear existing data
    await UserModel.deleteMany({});
    await AdoptionAdModel.deleteMany({});
    console.log("Existing data cleared!");

    const users = [];
    const pets = [];
    const totalRecords = 500;
    const saltRounds = 10; // For bcrypt hashing

    // Insert the special account first
    const specialUser = await UserModel.create({
      email: "saniakazmi1214@gmail.com",
      name: "Sania Kazmi",
      phone: generatePakistaniPhoneNumber(),
      password: bcrypt.hashSync("12121!", saltRounds),
      city: randomElement(majorCitiesPakistan),
      housingType: randomElement(housingTypes),
      spaceAvailable: randomElement(spaceOptions),
      existingPet: "None",
      petFriendly: true,
      accessOutdoor: true,
      preferredPetType: randomElement(petTypes),
      energyLevelPreference: randomElement(energyOptions),
      highMaintenance: true, // renamed field
      dailyActivityLevel: randomElement(householdActivityLevelOptions),
      securityNeeds: false,
      petOwner: randomElement(petOwnerOptions),
      kidsAtHome: randomElement(kidsAtHomeOptions),
      kidsAge: randomElement(kidsAgeOptions),
      petOwnershipType: randomElement(petOwnershipTypeOptions),
      idealAgePreference: randomElement(agePreferenceOptions),
      idealGenderPreference: randomElement(["NONE", "FEMALE", "MALE"]),
      idealSizePreference: randomElement(sizePreferenceOptions),
      idealCoatLength: randomElement(coatPreferenceOptions),
      idealNeeds: (randomElement(petTypes) === "cat" || randomElement(petTypes) === "dog")
        ? randomSubset(idealNeedsOptions)
        : ["ALLERGY_FRIENDLY"],
        status:'available',
      idealSpecialNeedsReceptiveness: randomElement(specialNeedsReceptivenessOptions),
      idealBreed: randomElement(petTypes) === "dog" 
        ? [randomElement(dogBreedOptions)]
        : randomElement(petTypes) === "cat"
          ? [randomElement(catBreedOptions)]
          : [randomElement(rabbitBreedOptions)]
    });
    users.push(specialUser);

    // Create the rest of the users (999 additional users)
    for (let i = 1; i < totalRecords; i++) {
      const uniqueName = generateUniqueName(i);
      const email = `user${i}@example.com`; // Unique emails
      const phone = generatePakistaniPhoneNumber();
      const city = randomElement(majorCitiesPakistan);
      const preferredPetType = randomElement(petTypes);
      const housingType = randomElement(housingTypes);
      const spaceAvailable = randomElement(spaceOptions);
      const energyLevelPreference = randomElement(energyOptions);
      // Replace groomingPreference with highMaintenance
      const highMaintenance = (preferredPetType === "cat" || preferredPetType === "dog") ? randomBoolean() : false;
      const securityNeeds = preferredPetType === "dog" ? randomBoolean() : false;
      const petOwner = randomElement(petOwnerOptions);
      const kidsAtHome = randomElement(kidsAtHomeOptions);
      const kidsAge = kidsAtHome === "YES" ? randomElement(kidsAgeOptions) : undefined;
      const petOwnershipType = randomElement(petOwnershipTypeOptions);
      const idealAgePreference = randomElement(agePreferenceOptions);
      const idealGenderPreference = randomElement(["NONE", "FEMALE", "MALE"]);
      const idealSizePreference = randomElement(sizePreferenceOptions);
      const idealCoatLength = randomElement(coatPreferenceOptions);
      const idealSpecialNeedsReceptiveness = randomElement(specialNeedsReceptivenessOptions);
      const idealNeeds = (preferredPetType === "cat" || preferredPetType === "dog")
        ? randomSubset(idealNeedsOptions)
        : ["ALLERGY_FRIENDLY"];
      let idealBreed;
      if (preferredPetType === "dog") {
        idealBreed = [randomElement(dogBreedOptions)];
      } else if (preferredPetType === "cat") {
        idealBreed = [randomElement(catBreedOptions)];
      } else {
        idealBreed = [randomElement(rabbitBreedOptions)];
      }

      const userObj = {
        email,
        name: uniqueName,
        phone,
        password: bcrypt.hashSync(`hashedpassword${i}`, saltRounds),
        city,
        housingType,
        spaceAvailable,
        existingPet: randomBoolean() ? randomElement(["Dog", "Cat", "Rabbit"]) : "None",
        petFriendly: randomBoolean(),
        accessOutdoor: randomBoolean(),
        preferredPetType,
        energyLevelPreference,
        highMaintenance, // renamed field
        dailyActivityLevel: energyLevelPreference,
        securityNeeds,
        petOwner,
        kidsAtHome,
        kidsAge,
        petOwnershipType,
        idealAgePreference,
        idealGenderPreference,
        idealSizePreference,
        idealCoatLength,
        idealNeeds,
        idealSpecialNeedsReceptiveness,
        idealBreed,
      };

      const createdUser = await UserModel.create(userObj);
      users.push(createdUser);
    }

    // Create one adoption ad per user (total 1000 pet records)
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Use user's preferred pet type for species; capitalize first letter
      const species = user.preferredPetType.charAt(0).toUpperCase() + user.preferredPetType.slice(1);
      const reasonsForRehoming = randomSubset(rehomingReasonsList, 1, 2);
      const keepDuration = randomElement(keepDurationOptions);
      const petCity = randomElement(majorCitiesPakistan);
      const householdActivityLevel = randomElement(householdActivityLevelOptions);
      const otherPets = [randomElement(otherPetsOptions)];
      const householdEnvironment = randomElement(householdEnvironmentOptions);

      let petName, breed, petAge, size;
      if (user.preferredPetType === "dog") {
        petName = randomElement(dogNames);
        breed = randomElement(dogBreedOptions);
        petAge = randomElement(dogAgeOptionsByBreed[breed]);
        size = randomElement(dogBreedSizeMapping[breed]);
      } else if (user.preferredPetType === "cat") {
        petName = randomElement(catNames);
        breed = randomElement(catBreedOptions);
        petAge = randomElement(catAgeOptionsByBreed[breed]);
        size = randomElement(catBreedSizeMapping[breed]);
      } else {
        petName = randomElement(rabbitNames);
        breed = randomElement(rabbitBreedOptions);
        petAge = randomElement(rabbitAgeOptionsByBreed[breed]);
        size = randomElement(rabbitBreedSizeMapping[breed]);
      }

      // Get 4 images for each pet
      const photos = getRandomPetImages(user.preferredPetType, 4);
      const ownedDuration = randomElement(ownedDurationOptions);
      const acquiredFrom = randomElement(acquiredFromOptions);
      const colors = [randomElement(petColorsList)];

      let characteristics = [];
      let socialIssues = [];
      if (user.preferredPetType === "dog") {
        characteristics = randomSubset(dogCharacteristicsList, 2, 3);
        socialIssues = randomSubset(dogSocialIssuesList, 0, 1);
      } else if (user.preferredPetType === "cat") {
        characteristics = randomSubset(catCharacteristicsList, 2, 3);
        socialIssues = randomSubset(catSocialIssuesList, 0, 1);
      } else {
        characteristics = randomSubset(rabbitCharacteristicsList, 2, 3);
      }

      const upToDateVaccinations = randomElement(["Yes", "No", "Unsure"]);
      const upToDateFleaWorm = randomElement(["Yes", "No", "Unsure"]);
      const upToDateDental = randomElement(["Yes", "No", "Unsure"]);
      const hasHealthIssues = randomElement(["Yes", "No"]);
      const hasMedication = randomElement(["Yes", "No"]);
      const healthDetails = hasHealthIssues === "Yes" ? "Minor health issues" : "No known issues";
      const personalityDescription = `A very ${randomElement(["friendly", "playful", "calm", "energetic"])} ${species}.`;
      const playDescription = `Loves to play and interact with people.`;
      const dietDescription = `Requires a balanced diet and regular vet check-ups.`;

      const petObj = {
        user: user._id,
        species,
        reasonsForRehoming,
        keepDuration,
        city: petCity,
        householdActivityLevel,
        otherPets,
        householdEnvironment,
        name: petName,
        age: petAge,
        breed,
        size,
        gender: randomElement(["Male", "Female", "Unknown"]),
        spayedNeutered: randomElement(spayedNeuteredOptions),
        microchipped: randomElement(microchippedOptions),
        photos,
        ownedDuration,
        acquiredFrom,
        colors,
        ...(user.preferredPetType === "dog" && {
          dogCharacteristics: characteristics,
          dogSocialIssues: socialIssues,
        }),
        ...(user.preferredPetType === "cat" && {
          catCharacteristics: characteristics,
          catSocialIssues: socialIssues,
        }),
        ...(user.preferredPetType === "rabbit" && {
          rabbitCharacteristics: characteristics,
        }),
        upToDateVaccinations,
        upToDateFleaWorm,
        upToDateDental,
        hasHealthIssues,
        hasMedication,
        healthDetails,
        personalityDescription,
        playDescription,
        dietDescription,
        phone: user.phone,
        status: "Available",
      };

      const createdPet = await AdoptionAdModel.create(petObj);
      pets.push(createdPet);

      // Associate this pet adoption ad with the user
      await UserModel.findByIdAndUpdate(user._id, { $push: { adoptionAds: createdPet._id } });
    }

    console.log(`Inserted ${users.length} users and ${pets.length} pet adoption ads.`);
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
