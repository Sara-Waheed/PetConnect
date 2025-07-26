import { sendVerificationEmail} from "../middleware/Email.js";
import { UserModel } from "../models/User.js";
import {PetModel} from '../models/Pet.js';
import { VetModel } from "../models/Vet.js";
import { GroomerModel } from "../models/Groomer.js";
import { SitterModel } from "../models/Sitter.js";
import MemoryBook from '../models/MemoryBook.js';
import Memory from '../models/Memory.js'; 

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sharp from 'sharp'; // For image processing

export const CreatePetProfile = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;

    const { name, petType, breed, age, gender, size } = req.body;
    const photo = req.file; // Image buffer from multer middleware

    if (!photo) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Process image using sharp
    const optimizedImageBuffer = await sharp(photo.buffer)
      .resize({ width: 800, height: 800, fit: 'inside' })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    // Convert buffer to Base64 string
    const photoString = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

    const ExistsPet = await PetModel.findOne({ name: name.toLowerCase() });
    if (ExistsPet) {
      return res
        .status(400)
        .json({ success: false, message: "Pet with same name already exists." });
    }

    // Create a new pet profile with Base64 image string
    const newPet = new PetModel({
      userId: userID,
      name,
      petType,
      breed,
      age,
      gender,
      size,
      photo: photoString, // Store the Base64 string
    });

    const savedPet = await newPet.save();

    // Add pet to the user's list of pets
    const user = await UserModel.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pets.push(savedPet._id);
    await user.save();

    return res.status(201).json({ message: 'Pet created successfully', pet: savedPet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating pet profile' });
  }
};

export const GetPetProfile = async (req, res) => {
  try {
      const { petId } = req.params;

      // Fetch the pet by its ID and populate the owner's details
      const pet = await PetModel.findById(petId);

      if (!pet) {
          return res.status(404).json({
              message: 'Pet not found',
              success: false,
          });
      }

      return res.status(200).json({
          pet,
          message: 'Pet profile fetched successfully',
          success: true,
      });
  } catch (error) {
      console.error('Error fetching pet profile:', error);
      return res.status(500).json({
          message: 'Error fetching pet profile',
          success: false,
      });
  }
};


export const GetUserPets = async (req, res) => {
    try {
        const token = req.cookies.pet_ownerToken; 
  
        if (!token) {
            return res.status(401).json({
                message: 'No token provided, unauthorized',
                success: false,
            });
        }
  
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const userId = decoded.id; 
  
        const pets = await PetModel.find({ userId: userId }) 
            .sort({ createdAt: -1 }) 
            .populate({
                path: 'userId', 
                select: 'username profilePicture',
            });
  
        const formattedPets = pets.map(pet => {
            return {
                ...pet.toObject(),
                photo: pet.photo 
            };
        });
  
        return res.status(200).json({
            pets: formattedPets,
            message: formattedPets.length === 0 
                ? 'No pets found' 
                : 'Pets fetched successfully.',
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching pets',
            success: false,
        });
    }
};

export const UpdatePetProfile = async (req, res) => {
  const token = req.cookies.pet_ownerToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;
    const petID = req.params.petId;

    // Find the pet and ensure it belongs to the user
    const pet = await PetModel.findOne({ _id: petID, userId: userID });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found or not authorized" });
    }

    const { name, petType, breed, age, gender, size } = req.body;
    let photoString = pet.photo; // Keep the existing photo by default

    // Check if a new photo is provided and process it
    if (req.file) {
      const optimizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      photoString = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
    }

    // Check for duplicate name, excluding the current pet
    const ExistsPet = await PetModel.findOne({ name, userId: userID, _id: { $ne: petID } });
    if (ExistsPet) {
      return res
        .status(400)
        .json({ success: false, message: "Pet with the same name already exists." });
    }

    // Update the pet's fields
    pet.name = name || pet.name;
    pet.petType = petType || pet.petType;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.gender = gender || pet.gender;
    pet.size = size || pet.size;
    pet.photo = photoString; // Update the photo if changed

    const updatedPet = await pet.save();

    return res.status(201).json({ message: "Pet profile updated successfully", pet: updatedPet });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating pet profile" });
  }
};

export const DeletePetProfile = async (req, res) => {
  try {
    const token = req.cookies.pet_ownerToken; 

    if (!token) {
      return res.status(401).json({
        message: 'No token provided, unauthorized',
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const userId = decoded.id; 
    const { petId } = req.params;  

    const pet = await PetModel.findById(petId);
    if (!pet || pet.userId.toString() !== userId) {
      return res.status(403).json({
        message: 'Unauthorized action, pet does not belong to this user',
        success: false
      });
    }

     // Step 1: Find and delete all memory books associated with the pet
    const memoryBooks = await MemoryBook.find({ petId: petId });
    if (memoryBooks.length > 0) {
      // Step 2: Delete all memories associated with those memory books
      await Memory.deleteMany({ bookId: { $in: memoryBooks.map(book => book._id) } });

      // Step 3: Delete all the memory books
      await MemoryBook.deleteMany({ petId: petId });
    }


    // Delete the pet profile
    await PetModel.findByIdAndDelete(petId);

    // Remove pet ID from the user's profile
    await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { pets: petId } },  
      { new: true }
    );

    return res.status(200).json({
      message: 'Pet profile deleted successfully',
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting pet profile',
      success: false
    });
  }
};

export const GetUserInfo = async (req, res) => {
  const { userRole } = req.query;
  try {
    const tokenMappings = {
      pet_owner: "pet_ownerToken",
      vet: "vetToken",
      groomer: "groomerToken",
      sitter: "sitterToken"
    };

    const role = userRole && tokenMappings[userRole] ? userRole : 'pet_owner';
    const cookieName = tokenMappings[role];

    if (!cookieName) {
      console.log("cookie name not availble");
      return res.status(400).json({
        success: false,
        message: "Invalid role provided",
      });
    }

    const token = req.cookies[cookieName];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      console.log("user not availble");

      return res.status(400).json({success: false, message: "User ID is required",});
    }

    const modelMappings = {
      pet_owner: UserModel,
      vet: VetModel,
      groomer: GroomerModel,
      sitter: SitterModel,
    };

    const Model = modelMappings[role];
    if (!Model) {
      console.log("model name not availble");

      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({success: false, message: "User not found",});
    }

    return res.status(200).json({ success: true, user,});
  } catch (error) {
    console.error("Error fetching User info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const UpdateUserInfo = async (req, res) => {
  const { userRole } = req.query;
  try {
    const tokenMappings = {
      pet_owner: "pet_ownerToken",
      vet: "vetToken",
      groomer: "groomerToken",
    };

    const cookieName = tokenMappings[userRole];
    if (!cookieName) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided",
      });
    }

    const token = req.cookies[cookieName];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({success: false, message: "User ID is required",});
    }

    const modelMappings = {
      pet_owner: UserModel,
      vet: VetModel,
      groomer: GroomerModel,
    };

    const Model = modelMappings[userRole];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Invalid role provided" });
    }

    const user = await Model.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, email, phone, city,  password } = req.body;

    if (email && email !== user.email) {
      const existingUser = await Model.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use. Please choose another one.",
        });
      }

      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationTokenExpiresAt = Date.now() + 5 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000;

      user.email = email;
      user.emailVerified = false;
      user.verificationToken = verificationToken;
      user.verificationTokenExpiresAt = verificationTokenExpiresAt;

      setImmediate(async () => {
        try {
          await sendVerificationEmail(user.email, verificationToken);
        } catch (error) {
          console.error("Error sending verification email:", error);
        }
      });
    }
    if (phone) {
      user.phone = phone;
    }
    if(name){
      user.name = name;
    }
    if(city){
      user.city = city;
    }
    if (password) {
      const hashedPassword = bcryptjs.hashSync(password, 10);
      user.password = hashedPassword;
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const UpdateDetailUserInfo = async (req, res) => {
  try {
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      housingType,
      spaceAvailable,
      existingPet,
      petFriendly,
      accessOutdoor,
      preferredPetType,
      preferredPetAge,
      experienceWithPets,
      energyLevelPreference,
      groomingPreference,
      dailyActivityLevel,
      securityNeeds,
      // Additional info fields:
      petOwner,
      kidsAtHome,
      kidsAge,
      petOwnershipType,
      // Ideal pet details:
      idealAgePreference,
      idealGenderPreference,
      idealSizePreference,
      idealCoatLength,
      idealNeeds,
      idealSpecialNeedsReceptiveness,
      idealBreed
    } = req.body;

    // Update basic detailed fields
    if (housingType) user.housingType = housingType;
    if (spaceAvailable) user.spaceAvailable = spaceAvailable;
    if (existingPet) user.existingPet = existingPet;
    if (petFriendly !== undefined) user.petFriendly = petFriendly;
    if (accessOutdoor !== undefined) user.accessOutdoor = accessOutdoor;
    if (preferredPetType) user.preferredPetType = preferredPetType;
    if (preferredPetAge) user.preferredPetAge = preferredPetAge;
    if (experienceWithPets) user.experienceWithPets = experienceWithPets;
    if (energyLevelPreference) user.energyLevelPreference = energyLevelPreference;
    if (groomingPreference !== undefined) user.groomingPreference = groomingPreference;
    if (dailyActivityLevel) user.dailyActivityLevel = dailyActivityLevel;
    if (securityNeeds !== undefined) user.securityNeeds = securityNeeds;

    // Update additional info fields
    if (petOwner) user.petOwner = petOwner;
    if (kidsAtHome) user.kidsAtHome = kidsAtHome;
    if (kidsAge) user.kidsAge = kidsAge;
    if (petOwnershipType) user.petOwnershipType = petOwnershipType;

    // Update ideal pet details
    if (idealAgePreference) user.idealAgePreference = idealAgePreference;
    if (idealGenderPreference) user.idealGenderPreference = idealGenderPreference;
    if (idealSizePreference) user.idealSizePreference = idealSizePreference;
    if (idealCoatLength) user.idealCoatLength = idealCoatLength;
    if (idealNeeds) user.idealNeeds = idealNeeds;
    if (idealSpecialNeedsReceptiveness)
      user.idealSpecialNeedsReceptiveness = idealSpecialNeedsReceptiveness;
    if (idealBreed) user.idealBreed = idealBreed;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User detailed information updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating detailed user info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const GetAdopterProfile = async (req, res) => {
  try {
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Define essential fields that you consider most important for matching.
    const essentialFields = [
      "preferredPetType",
      "dailyActivityLevel",
      "housingType",
      "existingPet",
      "accessOutdoor",
      "preferredPetAge",
      "idealSizePreference",
      "idealAgePreference",
      "idealGenderPreference",
      "kidsAtHome",
      "idealSpecialNeedsReceptiveness",
    ];

    // Define all detailed profile fields (optional + essential)
    const allDetailFields = [
      "housingType",
      "spaceAvailable",
      "existingPet",
      "petFriendly",
      "accessOutdoor",
      "preferredPetType",
      "preferredPetAge",
      "experienceWithPets",
      "energyLevelPreference",
      "groomingPreference",
      "dailyActivityLevel",
      "securityNeeds",
      "petOwner",
      "kidsAtHome",
      "kidsAge",
      "petOwnershipType",
      "idealAgePreference",
      "idealGenderPreference",
      "idealSizePreference",
      "idealCoatLength",
      "idealNeeds",
      "idealSpecialNeedsReceptiveness",
      "idealBreed",
    ];

    // Check if essential fields are filled (not null, undefined, or empty string)
    const isEssentialProfileComplete = essentialFields.every(
      (field) =>
        user[field] !== undefined &&
        user[field] !== null &&
        (typeof user[field] === "string" ? user[field].trim() !== "" : true) &&
        (Array.isArray(user[field]) ? user[field].length > 0 : true)
    );

    // Compute overall completeness percentage
    const filledCount = allDetailFields.filter(
      (field) =>
        user[field] !== undefined &&
        user[field] !== null &&
        (typeof user[field] === "string" ? user[field].trim() !== "" : true) &&
        (Array.isArray(user[field]) ? user[field].length > 0 : true)
    ).length;
    const completenessPercentage = (filledCount / allDetailFields.length) * 100;

    // Decide if profile is "complete enough" based on a threshold (e.g., 50%)
    const isProfileCompleteEnough = completenessPercentage >= 50;

    return res.status(200).json({
      success: true,
      isEssentialProfileComplete,
      isProfileCompleteEnough,
      completenessPercentage,
      user, // Optionally, return user data so the frontend can show what's missing.
    });
  } catch (error) {
    console.error("Error in GetAdopterProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const GetSitterInfo = async (req, res) => {
  try {
    const token = req.cookies.sitterToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sitterId = decoded.id; 

    if (!sitterId) {
      return res.status(400).json({success: false, message: "Sitter ID is required",});
    }
    const sitter = await SitterModel.findById(sitterId);

    if (!sitter) {
      return res.status(404).json({success: false, message: "Sitter not found",});
    }

    // Return the clinic data
    return res.status(200).json({ success: true, sitter,});
  } catch (error) {
    console.error("Error fetching clinic info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const UpdateSitterInfo = async (req, res) => {
  try {
    const token = req.cookies.sitterToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sitterId = decoded.id;

    if (!sitterId) {
      return res.status(400).json({
        success: false,
        message: "Sitter ID is required",
      });
    }

    const sitter = await SitterModel.findById(sitterId);

    if (!sitter) {
      return res.status(404).json({
        success: false,
        message: "Sitter not found",
      });
    }

    const {
      name,
      email,
      phone,
      password,
      city,
      sitterAddress
    } = req.body;

    // Only update non-empty and changed fields
    if (name && name.trim() && name !== sitter.name) {
      sitter.name = name.trim();
    }

    if (email && email.trim() && email !== sitter.email) {
      const existingSitter = await SitterModel.findOne({ email });

      if (existingSitter && existingSitter._id.toString() !== sitter._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use. Please choose another one.",
        });
      }

      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationTokenExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

      sitter.email = email;
      sitter.emailVerified = false;
      sitter.verificationToken = verificationToken;
      sitter.verificationTokenExpiresAt = verificationTokenExpiresAt;

      // Send email verification
      setImmediate(async () => {
        try {
          await sendVerificationEmail(email, verificationToken);
        } catch (error) {
          console.error("Error sending verification email:", error);
        }
      });
    }

    if (phone && phone.trim() && phone !== sitter.phone) {
      sitter.phone = phone.trim();
    }

    if (password && password.trim()) {
      const hashedPassword = bcryptjs.hashSync(password, 10);
      sitter.password = hashedPassword;
    }

    if (city && city.trim() && city !== sitter.city) {
      sitter.city = city.trim();
    }

    if (sitterAddress && sitterAddress.trim() && sitterAddress !== sitter.sitterAddress) {
      sitter.sitterAddress = sitterAddress.trim();
    }

    await sitter.save();

    return res.status(200).json({
      success: true,
      message: "Sitter profile updated successfully",
      sitter,
    });
  } catch (error) {
    console.error("Error updating sitter info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

